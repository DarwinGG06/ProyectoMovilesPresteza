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
      Error,
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

function storage(platform, initial = null, protectedUser = null) {
  const values = new Map([
    ['presteza.session.token', initial],
    ['presteza.session.biometric-user', protectedUser],
  ]);
  const store = load(
    'src/session/storage.ts',
    {
      'react-native': { Platform: { OS: platform } },
      'expo-secure-store': {
        getItemAsync: async (key) => values.get(key) ?? null,
        setItemAsync: async (key, token) => {
          values.set(key, token);
        },
        deleteItemAsync: async (key) => {
          values.delete(key);
        },
      },
    },
    {
      window: {
        localStorage: {
          getItem: (key) => values.get(key) ?? null,
          setItem: (key, token) => {
            values.set(key, token);
          },
          removeItem: (key) => {
            values.delete(key);
          },
        },
      },
    }
  );
  return store;
}

async function mount(store, authApi = auth, options = {}) {
  let current;
  let apiToken = null;
  const listeners = new Set();
  const appState = {
    currentState: 'active',
    addEventListener: (_event, listener) => {
      listeners.add(listener);
      return { remove: () => listeners.delete(listener) };
    },
  };
  const { SessionProvider, useSession } = load('src/session/context.tsx', {
    '../api/auth': {
      ...authApi,
      login:
        options.login ?? (async () => ({ token: jwt(), user: authApi.decodificarToken(jwt()) })),
    },
    '../api/client': {
      setToken: (token) => {
        apiToken = token;
      },
    },
    '../api/logger': logger,
    './storage': store,
    './biometrics': {
      getBiometricSupport:
        options.getSupport ??
        (async () => ({ available: true, label: 'Huella digital', reason: '' })),
      authenticateDevice: options.authenticate ?? (async () => {}),
    },
    './SessionLockScreen': { SessionLockScreen: (props) => React.createElement('Lock', props) },
    'react-native': {
      View: 'View',
      Text: 'Text',
      ActivityIndicator: 'ActivityIndicator',
      Platform: { OS: options.platform ?? 'android' },
      AppState: appState,
    },
  });
  function Screen() {
    current = useSession();
    React.useEffect(
      () => () => {
        current = undefined;
      },
      []
    );
    return React.createElement('Content');
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
    get lock() {
      return tree.root.findAllByType('Lock')[0]?.props;
    },
    get contentMounted() {
      return tree.root.findAllByType('Content').length > 0;
    },
    background: (state) =>
      act(async () => {
        appState.currentState = state;
        listeners.forEach((listener) => listener(state));
      }),
    unmount: () =>
      act(async () => {
        tree.unmount();
      }),
  };
}

for (const platform of ['web', 'android']) {
  test(`${platform}: login sobrevive al desmontaje y logout no reaparece al reiniciar`, async () => {
    const store = storage(platform);
    const first = await mount(store, auth, { platform });
    assert.equal(first.session.isAuthenticated, false);
    await act(async () => {
      await first.session.signIn('test@example.com', 'test-only');
    });
    assert.equal(first.session.isAuthenticated, true);
    assert.ok(await store.readSessionToken());
    await first.unmount();

    const second = await mount(store, auth, { platform });
    assert.equal(second.session.user.id, 'test-user');
    assert.equal(second.session.isAuthenticated, true);
    assert.equal(second.apiToken, await store.readSessionToken());
    await act(async () => {
      second.session.logout();
    });
    assert.equal(await store.readSessionToken(), null);
    await second.unmount();

    const third = await mount(store, auth, { platform });
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
  const app = await mount({ readSessionToken: () => pending, readBiometricUser: async () => null });
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

test('sesión protegida: no monta pantallas ni publica el JWT hasta verificar la huella', async () => {
  const token = jwt();
  const app = await mount(storage('android', token, 'test-user'));
  assert.equal(app.contentMounted, false);
  assert.equal(app.apiToken, null);
  assert.ok(app.lock);
  await act(async () => {
    await app.lock.onUnlock();
  });
  assert.equal(app.session.isAuthenticated, true);
  assert.equal(app.apiToken, token);
  assert.equal(app.lock, undefined);
  await app.unmount();
});

test('cancelar el diálogo conserva la sesión guardada pero nunca la desbloquea', async () => {
  const token = jwt();
  const store = storage('android', token, 'test-user');
  const app = await mount(store, auth, {
    authenticate: async () => {
      throw new Error('Verificación cancelada');
    },
  });
  await act(async () => {
    await app.lock.onUnlock();
  });
  assert.equal(app.contentMounted, false);
  assert.equal(app.apiToken, null);
  assert.match(app.lock.error, /cancelada/);
  assert.equal(await store.readSessionToken(), token);
  await app.unmount();
});

test('segundo plano bloquea, regresar no desbloquea y el diálogo no crea un bucle', async () => {
  const app = await mount(storage('android', jwt(), 'test-user'));
  await act(async () => {
    await app.lock.onUnlock();
  });
  await app.background('inactive');
  assert.equal(app.contentMounted, false);
  assert.equal(app.apiToken, null);
  await app.background('background');
  await app.background('active');
  assert.ok(app.lock);
  await act(async () => {
    await app.lock.onUnlock();
  });
  assert.equal(app.session.isAuthenticated, true);
  await app.unmount();
});

test('la inactividad producida por el diálogo nativo no vuelve a bloquear un desbloqueo válido', async () => {
  let resolvePrompt;
  const app = await mount(storage('android', jwt(), 'test-user'), auth, {
    authenticate: () =>
      new Promise((resolve) => {
        resolvePrompt = resolve;
      }),
  });
  let unlocking;
  await act(async () => {
    unlocking = app.lock.onUnlock();
  });
  await app.background('inactive');
  await app.background('active');
  await act(async () => {
    resolvePrompt();
    await unlocking;
  });
  assert.equal(app.session.isAuthenticated, true);
  assert.equal(app.lock, undefined);
  await app.unmount();
});

test('cerrar sesión mientras hay un diálogo pendiente impide restaurar el acceso después', async () => {
  let resolvePrompt;
  const store = storage('android', jwt(), 'test-user');
  const app = await mount(store, auth, {
    authenticate: () =>
      new Promise((resolve) => {
        resolvePrompt = resolve;
      }),
  });
  let unlocking;
  await act(async () => {
    unlocking = app.lock.onUnlock();
  });
  await act(async () => {
    app.lock.onSignOut();
  });
  await act(async () => {
    resolvePrompt();
    await unlocking;
  });
  assert.equal(app.session.isAuthenticated, false);
  assert.equal(app.apiToken, null);
  assert.equal(await store.readSessionToken(), null);
  assert.equal(await store.readBiometricUser(), null);
  await app.unmount();
});

test('la contraseña alternativa se valida en login; una incorrecta no permite entrar', async () => {
  let received;
  const fresh = jwt();
  const app = await mount(storage('android', jwt(), 'test-user'), auth, {
    login: async (email, password) => {
      received = { email, password };
      if (password !== 'correcta') throw new Error('Contraseña incorrecta');
      return { token: fresh, user: auth.decodificarToken(fresh) };
    },
  });
  await act(async () => {
    await assert.rejects(app.lock.onPassword('incorrecta'), /incorrecta/);
  });
  assert.equal(app.apiToken, null);
  assert.ok(app.lock);
  await act(async () => {
    await app.lock.onPassword('correcta');
  });
  assert.deepEqual(received, { email: 'test@example.com', password: 'correcta' });
  assert.equal(app.session.isAuthenticated, true);
  assert.equal(app.session.biometricEnabled, true);
  await app.unmount();
});

test('activar requiere verificación y persiste la preferencia solo para esa cuenta', async () => {
  let accept = false;
  const store = storage('android', jwt());
  const app = await mount(store, auth, {
    authenticate: async () => {
      if (!accept) throw new Error('Cancelado');
    },
  });
  await act(async () => {
    await assert.rejects(app.session.setBiometricEnabled(true), /Cancelado/);
  });
  assert.equal(app.session.biometricEnabled, false);
  assert.equal(await store.readBiometricUser(), null);
  accept = true;
  await act(async () => {
    await app.session.setBiometricEnabled(true);
  });
  assert.equal(app.session.biometricEnabled, true);
  assert.equal(await store.readBiometricUser(), 'test-user');
  await app.unmount();
  const reopened = await mount(store);
  assert.ok(reopened.lock);
  await reopened.unmount();
});

test('no permite activar sin biometría y no modifica el token', async () => {
  const token = jwt();
  const store = storage('android', token);
  let prompts = 0;
  const app = await mount(store, auth, {
    getSupport: async () => ({ available: false, label: 'Huella', reason: 'Registra una huella' }),
    authenticate: async () => {
      prompts++;
    },
  });
  await act(async () => {
    await assert.rejects(app.session.setBiometricEnabled(true), /Registra/);
  });
  assert.equal(prompts, 0);
  assert.equal(await store.readBiometricUser(), null);
  assert.equal(await store.readSessionToken(), token);
  await app.unmount();
});

test('desactivar exige verificación y deja de bloquear al regresar', async () => {
  const store = storage('android', jwt(), 'test-user');
  const app = await mount(store);
  await act(async () => {
    await app.lock.onUnlock();
  });
  await act(async () => {
    await app.session.setBiometricEnabled(false);
  });
  assert.equal(await store.readBiometricUser(), null);
  await app.background('background');
  await app.background('active');
  assert.equal(app.session.isAuthenticated, true);
  assert.equal(app.lock, undefined);
  await app.unmount();
});

test('una cuenta diferente no hereda la activación biométrica de la anterior', async () => {
  const store = storage('android', null, 'otro-usuario');
  const app = await mount(store);
  await act(async () => {
    await app.session.signIn('test@example.com', 'correcta');
  });
  assert.equal(app.session.biometricEnabled, false);
  assert.equal(await store.readBiometricUser(), null);
  await app.unmount();
});

test('si el token vence mientras se verifica la huella, permanece bloqueado', async () => {
  let expired = false;
  const decoder = {
    ...auth,
    decodificarToken: (token) => {
      if (expired) throw new Error('La sesión ha expirado');
      return auth.decodificarToken(token);
    },
  };
  const app = await mount(storage('android', jwt(), 'test-user'), decoder, {
    authenticate: async () => {
      expired = true;
    },
  });
  await act(async () => {
    await app.lock.onUnlock();
  });
  assert.equal(app.apiToken, null);
  assert.equal(app.contentMounted, false);
  assert.match(app.lock.error, /expirado/);
  await app.unmount();
});

test('un fallo al leer la preferencia no restaura una sesión sin verificarla', async () => {
  const store = storage('android', jwt(), 'test-user');
  store.readBiometricUser = async () => {
    throw new Error('storage unavailable');
  };
  const app = await mount(store);
  assert.equal(app.apiToken, null);
  assert.equal(app.session.isAuthenticated, false);
  assert.ok(await store.readSessionToken());
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
