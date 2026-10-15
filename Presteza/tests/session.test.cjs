const assert = require('node:assert/strict');
const { Buffer } = require('node:buffer');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { act, create } = require('react-test-renderer');

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const logger = { logInfo() {}, logError() {}, logWarn() {} };

// Compila los módulos reales y sustituye solo los servicios de plataforma/red.
function load(file, mocks = {}, globals = {}) {
  const filename = path.join(path.dirname(module.filename), '..', file);
  const code = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(
    code,
    {
      exports,
      require: (name) => (Object.hasOwn(mocks, name) ? mocks[name] : require(name)),
      atob,
      ...globals,
    },
    { filename }
  );
  return exports;
}

function jwt(extra = {}) {
  return `header.${Buffer.from(
    JSON.stringify({
      userId: 'test-user',
      email: 'test@example.com',
      name: 'Prueba',
      role: 'client',
      exp: Math.floor(Date.now() / 1000) + 3600,
      ...extra,
    })
  ).toString('base64url')}.test-signature`;
}

const auth = load('src/api/auth.ts', {
  './client': {},
  './helpers': {},
  './logger': logger,
});

function storage(platform, initial = null) {
  let value = initial;
  const store = load(
    'src/session/storage.ts',
    {
      'react-native': { Platform: { OS: platform } },
      'expo-secure-store': {
        getItemAsync: async () => value,
        setItemAsync: async (_key, token) => {
          value = token;
        },
        deleteItemAsync: async () => {
          value = null;
        },
      },
    },
    {
      window: {
        localStorage: {
          getItem: () => value,
          setItem: (_key, token) => {
            value = token;
          },
          removeItem: () => {
            value = null;
          },
        },
      },
    }
  );
  return store;
}

async function mount(store, authApi = auth) {
  let current;
  let apiToken = null;
  const { SessionProvider, useSession } = load('src/session/context.tsx', {
    '../api/auth': {
      ...authApi,
      login: async () => ({ token: jwt(), user: authApi.decodificarToken(jwt()) }),
    },
    '../api/client': {
      setToken: (token) => {
        apiToken = token;
      },
    },
    '../api/logger': logger,
    './storage': store,
    'react-native': { View: 'View', Text: 'Text', ActivityIndicator: 'ActivityIndicator' },
  });
  function Screen() {
    current = useSession();
    return null;
  }
  let tree;
  await act(async () => {
    tree = create(React.createElement(SessionProvider, null, React.createElement(Screen)));
  });
  return {
    get session() {
      return current;
    },
    get apiToken() {
      return apiToken;
    },
    unmount: () =>
      act(async () => {
        tree.unmount();
      }),
  };
}

for (const platform of ['web', 'android']) {
  test(`${platform}: login sobrevive al desmontaje y logout no reaparece al reiniciar`, async () => {
    const store = storage(platform);
    const first = await mount(store);
    assert.equal(first.session.isAuthenticated, false);
    await act(async () => {
      await first.session.signIn('test@example.com', 'test-only');
    });
    assert.equal(first.session.isAuthenticated, true);
    assert.ok(await store.readSessionToken());
    await first.unmount();

    const second = await mount(store);
    assert.equal(second.session.user.id, 'test-user');
    assert.equal(second.session.isAuthenticated, true);
    assert.equal(second.apiToken, await store.readSessionToken());
    await act(async () => {
      second.session.logout();
    });
    assert.equal(await store.readSessionToken(), null);
    await second.unmount();

    const third = await mount(store);
    assert.equal(third.session.isAuthenticated, false);
    await third.unmount();
  });

  test(`${platform}: una escritura pendiente no restaura el token después del logout`, async () => {
    const store = storage(platform);
    await Promise.all([store.writeSessionToken(jwt()), store.writeSessionToken(null)]);
    assert.equal(await store.readSessionToken(), null);
  });
}

for (const platform of ['web', 'android']) {
  for (const token of ['corrupto', jwt({ exp: 1 })]) {
    test(`${platform}: descarta sesión ${token === 'corrupto' ? 'corrupta' : 'expirada'} sin reportar un fallo de la app`, async () => {
      const errors = [];
      const decoder = load('src/api/auth.ts', {
        './client': {},
        './helpers': {},
        './logger': { ...logger, logError: (...args) => errors.push(args) },
      });
      const store = storage(platform, token);
      const app = await mount(store, decoder);
      assert.equal(app.session.isAuthenticated, false);
      assert.equal(await store.readSessionToken(), null);
      assert.deepEqual(errors, []);
      await app.unmount();
    });
  }
}

test('un token vencido mantiene el motivo de rechazo', () => {
  assert.throws(() => auth.decodificarToken(jwt({ exp: 1 })), /La sesión ha expirado/);
});

for (const scenario of [
  {
    name: 'fallo de conexión dentro del backend',
    status: 400,
    message: 'TypeError: fetch failed',
    expected:
      'El servidor no pudo conectarse con uno de sus servicios. Inténtalo de nuevo más tarde.',
  },
  {
    name: 'credenciales incorrectas',
    status: 401,
    message: 'Correo o contraseña incorrectos',
    expected: 'Correo o contraseña incorrectos',
  },
  {
    name: 'HTML de Supabase reenviado como un error JSON',
    status: 400,
    message:
      '<!DOCTYPE html><html><head><title>supabase.co | 521: Web server is down</title></head><body>Detalle del proveedor</body></html>',
    expected:
      'El servidor no pudo conectarse con uno de sus servicios. Inténtalo de nuevo más tarde.',
    logMessage: 'supabase.co | 521: Web server is down',
  },
  {
    name: 'HTML sin título',
    status: 400,
    message: '<html><body>Servicio no disponible</body></html>',
    expected:
      'El servidor no pudo conectarse con uno de sus servicios. Inténtalo de nuevo más tarde.',
    logMessage: 'Respuesta HTML de error',
  },
  {
    name: 'Bad Gateway reenviado por el backend',
    status: 400,
    message: 'Bad Gateway',
    expected:
      'El servidor no pudo conectarse con uno de sus servicios. Inténtalo de nuevo más tarde.',
  },
]) {
  test(`HTTP: ${scenario.name}`, async () => {
    const errors = [];
    const { request } = load(
      'src/api/client.ts',
      {
        './config': { API_URL: 'https://api.example.invalid' },
        './logger': {
          ...logger,
          logError: (...args) => errors.push(args),
          redactarCuerpo: (value) => value,
          redactarRespuesta: (value) => value,
        },
      },
      {
        AbortController,
        setTimeout,
        clearTimeout,
        fetch: async () => ({
          ok: false,
          status: scenario.status,
          json: async () => ({ message: scenario.message }),
        }),
      }
    );
    await assert.rejects(request('/auth/login', { method: 'POST' }), {
      message: scenario.expected,
    });
    assert.equal(errors[0][2].mensaje, scenario.logMessage ?? scenario.message);
    if (scenario.logMessage) {
      assert.equal(JSON.stringify(errors).includes(scenario.message), false);
      assert.equal(errors[0][2].cuerpo.formato, 'html');
    }
  });
}

test('espera la restauración antes de montar pantallas que usan autenticación', async () => {
  let resolveRead;
  const pending = new Promise((resolve) => {
    resolveRead = resolve;
  });
  const app = await mount({ readSessionToken: () => pending });
  assert.equal(app.session, undefined);
  await act(async () => {
    resolveRead(jwt());
  });
  assert.equal(app.session.isAuthenticated, true);
  await app.unmount();
});

test('un fallo de lectura no borra la sesión almacenada', async () => {
  let deletes = 0;
  const app = await mount({
    readSessionToken: async () => {
      throw new Error('storage unavailable');
    },
    writeSessionToken: async () => {
      deletes++;
    },
  });
  assert.equal(app.session.isAuthenticated, false);
  assert.equal(deletes, 0);
  await app.unmount();
});

for (const platform of ['web', 'android']) {
  test(`${platform}: respeta el backend remoto incluso con Metro en LAN`, () => {
    const config = load(
      'src/api/config.ts',
      {
        'expo-constants': { expoConfig: { hostUri: '192.168.1.20:8081' } },
        'react-native': { Platform: { OS: platform }, NativeModules: {} },
        './logger': logger,
      },
      { process: { env: { EXPO_PUBLIC_API_URL: 'https://presteza-backend.vercel.app/' } } }
    );
    assert.equal(config.API_URL, 'https://presteza-backend.vercel.app');
  });
}
