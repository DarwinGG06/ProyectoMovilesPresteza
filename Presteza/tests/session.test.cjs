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

function storage(platform, initial = null, protectedUser = null, beforeWrite = async () => {}) {
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
          await beforeWrite(key, token);
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
      setOnUnauthorized: () => {},
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
    // El 401 de login no cierra sesión: no había token en esa petición.
    assert.equal(errors[0][2].mensaje, scenario.logMessage ?? scenario.message);
    if (scenario.logMessage) {
      assert.equal(JSON.stringify(errors).includes(scenario.message), false);
      assert.equal(errors[0][2].cuerpo.formato, 'html');
    }
  });
}

test('un 401 con token cierra la sesión en el cliente HTTP', async () => {
  let cerrado = false;
  const { request, setToken, setOnUnauthorized } = load(
    'src/api/client.ts',
    {
      './config': { API_URL: 'https://api.example.invalid' },
      './logger': {
        ...logger,
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
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      }),
    },
  );
  setToken('token-viejo');
  setOnUnauthorized(() => {
    cerrado = true;
  });
  await assert.rejects(request('/orders'), { message: 'Unauthorized' });
  assert.equal(cerrado, true);
});

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

test('el acceso biométrico del login exige una cuenta guardada y activación previa', async () => {
  for (const initial of [null, jwt()]) {
    let prompts = 0;
    const app = await mount(storage('android', initial), auth, {
      authenticate: async () => {
        prompts++;
      },
    });
    await act(async () => {
      await assert.rejects(app.session.signInWithBiometrics(), /activa el acceso biométrico/);
    });
    assert.equal(prompts, 0);
    await app.unmount();
  }
});

test('el acceso público del login rechaza cancelación y permite una nueva verificación tras logout', async () => {
  let cancelled = false;
  const token = jwt();
  const app = await mount(storage('android', token), auth, {
    authenticate: async () => {
      if (cancelled) throw new Error('Cancelado');
    },
  });
  await act(async () => {
    await app.session.setBiometricEnabled(true);
  });
  const login = app.session.signInWithBiometrics;
  await app.background('background');
  await app.background('active');
  cancelled = true;
  await act(async () => {
    await assert.rejects(login(), /Cancelado/);
  });
  assert.equal(app.apiToken, null);
  assert.equal(app.contentMounted, false);
  cancelled = false;
  await act(async () => {
    await login();
  });
  assert.equal(app.session.isAuthenticated, true);
  assert.equal(app.apiToken, token);
  await act(async () => {
    app.session.logout();
  });
  assert.equal(app.apiToken, null);
  await act(async () => {
    await login();
  });
  assert.equal(app.session.isAuthenticated, true);
  await app.unmount();
});

for (const platform of ['android', 'ios']) {
  test(`${platform}: activar, cerrar sesión, reiniciar e ingresar con biometría conserva el acceso`, async () => {
    const token = jwt();
    const store = storage(platform, token);
    const first = await mount(store, auth, { platform });
    await act(async () => {
      await first.session.setBiometricEnabled(true);
    });
    assert.equal(await store.readBiometricToken(), token);
    await act(async () => {
      first.session.logout();
    });
    assert.equal(first.session.isAuthenticated, false);
    assert.equal(first.session.biometricEnabled, true);
    assert.equal(first.apiToken, null);
    assert.equal(await store.readSessionToken(), null);
    assert.equal(await store.readBiometricUser(), 'test-user');
    await first.unmount();

    let resolvePrompt;
    const reopened = await mount(store, auth, {
      platform,
      authenticate: () =>
        new Promise((resolve) => {
          resolvePrompt = resolve;
        }),
    });
    assert.equal(reopened.session.isAuthenticated, false);
    assert.equal(reopened.session.biometricEnabled, true);
    assert.equal(reopened.lock, undefined);
    let signingIn;
    await act(async () => {
      signingIn = reopened.session.signInWithBiometrics();
    });
    assert.equal(reopened.apiToken, null);
    assert.equal(await store.readSessionToken(), null);
    await act(async () => {
      resolvePrompt();
      await signingIn;
    });
    assert.equal(reopened.session.isAuthenticated, true);
    assert.equal(reopened.apiToken, token);
    assert.equal(await store.readSessionToken(), token);
    await reopened.unmount();
  });
}

test('cancelar el login después de logout no pierde la activación ni restaura una sesión', async () => {
  const store = storage('android');
  await store.writeBiometricAccess('test-user', jwt());
  const app = await mount(store, auth, {
    authenticate: async () => {
      throw new Error('Cancelado');
    },
  });
  await act(async () => {
    await assert.rejects(app.session.signInWithBiometrics(), /Cancelado/);
  });
  assert.equal(app.session.biometricEnabled, true);
  assert.equal(app.session.isAuthenticated, false);
  assert.equal(app.apiToken, null);
  assert.equal(await store.readSessionToken(), null);
  assert.ok(await store.readBiometricToken());
  await app.unmount();
});

test('token biométrico vencido conserva la preferencia y el login por contraseña lo actualiza', async () => {
  const store = storage('android');
  await store.writeBiometricAccess('test-user', jwt({ exp: 1 }));
  let prompts = 0;
  const fresh = jwt();
  const app = await mount(store, auth, {
    authenticate: async () => {
      prompts++;
    },
    login: async () => ({ token: fresh, user: auth.decodificarToken(fresh) }),
  });
  await act(async () => {
    await assert.rejects(app.session.signInWithBiometrics(), /sesión ha expirado/);
  });
  assert.equal(prompts, 0);
  assert.equal(app.session.biometricEnabled, true);
  assert.equal(app.apiToken, null);
  await act(async () => {
    await app.session.signIn('test@example.com', 'correcta');
  });
  assert.equal(await store.readBiometricToken(), fresh);
  await act(async () => {
    app.session.logout();
  });
  await act(async () => {
    await app.session.signInWithBiometrics();
  });
  assert.equal(prompts, 1);
  assert.equal(app.session.isAuthenticated, true);
  await app.unmount();
});

test('una credencial biométrica de otra cuenta no abre el sensor ni publica el token', async () => {
  const store = storage('android');
  await store.writeBiometricAccess('otro-usuario', jwt());
  let prompts = 0;
  const app = await mount(store, auth, {
    authenticate: async () => {
      prompts++;
    },
  });
  await act(async () => {
    await assert.rejects(app.session.signInWithBiometrics(), /no coincide/);
  });
  assert.equal(prompts, 0);
  assert.equal(app.apiToken, null);
  await app.unmount();
});

test('desactivar elimina el acceso recordado incluso después de reiniciar', async () => {
  const store = storage('android', jwt());
  const app = await mount(store);
  await act(async () => {
    await app.session.setBiometricEnabled(true);
  });
  await act(async () => {
    await app.session.setBiometricEnabled(false);
  });
  await act(async () => {
    app.session.logout();
  });
  assert.equal(await store.readBiometricToken(), null);
  assert.equal(await store.readBiometricUser(), null);
  await app.unmount();
  const reopened = await mount(store);
  assert.equal(reopened.session.biometricEnabled, false);
  await act(async () => {
    await assert.rejects(reopened.session.signInWithBiometrics(), /activa el acceso biométrico/);
  });
  await reopened.unmount();
});

test('un id numérico sigue siendo la misma cuenta al cerrar sesión y volver a entrar', async () => {
  const token = jwt({ userId: 42 });
  const store = storage('android');
  const app = await mount(store, auth, {
    login: async () => ({ token, user: auth.decodificarToken(token) }),
  });
  await act(async () => {
    await app.session.signIn('test@example.com', 'correcta');
  });
  await act(async () => {
    await app.session.setBiometricEnabled(true);
  });
  assert.equal(await store.readBiometricUser(), '42');
  await act(async () => {
    app.session.logout();
  });
  assert.equal(app.session.isAuthenticated, false);
  assert.equal(app.session.biometricEnabled, true);
  assert.equal(await store.readSessionToken(), null);
  assert.equal(await store.readBiometricToken(), token);
  await act(async () => {
    await app.session.signIn('test@example.com', 'correcta');
  });
  assert.equal(app.session.biometricEnabled, true);
  assert.equal(await store.readBiometricUser(), '42');
  assert.equal(await store.readBiometricToken(), token);
  await app.unmount();
});

test('cerrar sesión con el JWT vencido no sustituye ni borra la credencial biométrica', async () => {
  let expired = false;
  const token = jwt();
  const store = storage('android', token);
  const decoder = {
    ...auth,
    decodificarToken: (value) => {
      if (expired) throw new Error('La sesión ha expirado');
      return auth.decodificarToken(value);
    },
  };
  const app = await mount(store, decoder);
  await act(async () => {
    await app.session.setBiometricEnabled(true);
  });
  expired = true;
  await act(async () => {
    app.session.logout();
  });
  assert.equal(await store.readSessionToken(), null);
  assert.equal(await store.readBiometricToken(), token);
  assert.equal(await store.readBiometricUser(), 'test-user');
  assert.equal(app.session.biometricEnabled, true);
  await app.unmount();
});

test('actualizar la credencial biométrica no borra la anterior si el guardado falla', async () => {
  let update = false;
  const store = storage('android', null, null, async (key) => {
    if (update && key === 'presteza.session.biometric-user') throw new Error('No se pudo guardar');
  });
  const original = jwt();
  await store.writeBiometricAccess('test-user', original);
  update = true;
  await assert.rejects(store.writeBiometricAccess('test-user', jwt()), /No se pudo guardar/);
  assert.equal(await store.readBiometricToken(), original);
  assert.equal(await store.readBiometricUser(), 'test-user');
});

test('un fallo al guardar la activación se informa y no se marca como activada', async () => {
  const store = storage('android', jwt(), null, async (key) => {
    if (key === 'presteza.session.biometric-user') throw new Error('No se pudo guardar');
  });
  const app = await mount(store);
  await act(async () => {
    await assert.rejects(app.session.setBiometricEnabled(true), /No se pudo guardar/);
  });
  assert.equal(app.session.biometricEnabled, false);
  assert.equal(await store.readBiometricUser(), null);
  assert.equal(await store.readBiometricToken(), null);
  await app.unmount();
});

test('logout durante la escritura del login biométrico deja la sesión activa borrada', async () => {
  let resolveWrite;
  const store = storage('android', null, null, async (key) => {
    if (key === 'presteza.session.token') {
      await new Promise((resolve) => {
        resolveWrite = resolve;
      });
    }
  });
  await store.writeBiometricAccess('test-user', jwt());
  const app = await mount(store);
  let signingIn;
  await act(async () => {
    signingIn = app.session.signInWithBiometrics().then(
      () => null,
      (error) => error
    );
  });
  assert.equal(typeof resolveWrite, 'function');
  await act(async () => {
    app.session.logout();
  });
  let result;
  await act(async () => {
    resolveWrite();
    result = await signingIn;
  });
  assert.match(result.message, /sesión cambió/);
  assert.equal(app.apiToken, null);
  assert.equal(app.session.isAuthenticated, false);
  assert.equal(await store.readSessionToken(), null);
  assert.ok(await store.readBiometricToken());
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
  assert.equal(await store.readBiometricUser(), 'test-user');
  assert.ok(await store.readBiometricToken());
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
  assert.equal(await store.readBiometricToken(), null);
  await app.background('background');
  await app.background('active');
  assert.equal(app.session.isAuthenticated, true);
  assert.equal(app.lock, undefined);
  await app.unmount();
});

test('una cuenta diferente no hereda la activación biométrica de la anterior', async () => {
  const store = storage('android', null, 'otro-usuario');
  await store.writeBiometricAccess('otro-usuario', jwt({ userId: 'otro-usuario' }));
  const app = await mount(store);
  await act(async () => {
    await app.session.signIn('test@example.com', 'correcta');
  });
  assert.equal(app.session.biometricEnabled, false);
  assert.equal(await store.readBiometricUser(), null);
  assert.equal(await store.readBiometricToken(), null);
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
