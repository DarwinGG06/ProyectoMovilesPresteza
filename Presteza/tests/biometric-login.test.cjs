const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { act, create } = require('react-test-renderer');

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function load(file, mocks) {
  const filename = path.join(path.dirname(module.filename), '..', file);
  const code = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    Error,
    require: (name) => (Object.hasOwn(mocks, name) ? mocks[name] : require(name)),
  });
  return exports;
}

for (const [file, hook] of [
  ['src/features/iniciar-sesion/hooks/useIniciarSesion.ts', 'useIniciarSesion'],
  ['src/shared/hooks/useLoginModal.ts', 'useLoginModal'],
]) {
  test(`${hook}: biometría funciona sin rellenar contraseña y solo navega tras éxito`, async () => {
    const routes = [];
    let reject = true;
    let calls = 0;
    let closed = 0;
    const module = load(file, {
      'expo-router': { router: { replace: (route) => routes.push(route) } },
      '@/session/context': {
        useSession: () => ({
          signIn: async () => {
            throw new Error('No debe enviar contraseña');
          },
          signInWithBiometrics: async () => {
            calls++;
            if (reject) throw new Error('Verificación cancelada');
          },
          biometricBusy: false,
          biometricEnabled: true,
          biometricSupport: { label: 'Huella digital', available: true },
        }),
      },
    });
    let current;
    function Probe() {
      current = module[hook](() => {
        closed++;
      });
      return null;
    }
    let tree;
    await act(async () => {
      tree = create(React.createElement(Probe));
    });
    await act(async () => {
      await current.entrarConBiometria();
    });
    assert.equal(calls, 1);
    assert.match(current.error, /cancelada/);
    assert.deepEqual(routes, []);
    assert.equal(closed, 0);
    reject = false;
    await act(async () => {
      await current.entrarConBiometria();
    });
    assert.equal(calls, 2);
    assert.deepEqual(routes, ['/perfil']);
    assert.equal(closed, hook === 'useLoginModal' ? 1 : 0);
    assert.equal(current.error, undefined);
    await act(async () => {
      tree.unmount();
    });
  });
}

test('el botón distingue Android, Face ID y Touch ID, y no ofrece biometría nativa en web', async () => {
  for (const [platform, label, expected] of [
    ['android', 'Huella digital', 'INGRESAR CON HUELLA'],
    ['android', 'Face ID', 'INGRESAR CON HUELLA'],
    ['ios', 'Face ID', 'INGRESAR CON FACE ID'],
    ['ios', 'Huella digital', 'INGRESAR CON HUELLA'],
    ['web', 'Huella digital', null],
  ]) {
    const { BiometricLoginButton } = load('src/session/BiometricLoginButton.tsx', {
      'react-native': { Platform: { OS: platform }, View: 'View', Text: 'Text' },
      '@/components/Button': { default: 'Button', __esModule: true },
    });
    let tree;
    await act(async () => {
      tree = create(React.createElement(BiometricLoginButton, { label, onPress() {} }));
    });
    const button = tree.root.findAllByType('Button')[0];
    assert.equal(button?.props.text ?? null, expected);
    await act(async () => {
      tree.unmount();
    });
  }
});

test('la sesión guardada muestra contraseña y acceso biométrico a la vez', async () => {
  let prompts = 0;
  const { SessionLockScreen } = load('src/session/SessionLockScreen.tsx', {
    '@expo/vector-icons': { Ionicons: 'Icon' },
    'react-native': {
      Platform: { OS: 'android' },
      ActivityIndicator: 'Spinner',
      KeyboardAvoidingView: 'Keyboard',
      Pressable: 'Pressable',
      ScrollView: 'Scroll',
      Text: 'Text',
      TextInput: 'TextInput',
      View: 'View',
    },
    'react-native-safe-area-context': { SafeAreaView: 'SafeArea' },
    '@/components/Button': { default: 'Button', __esModule: true },
    '@/shared/components/materiales/Pergamino': { Pergamino: 'Paper' },
    './BiometricLoginButton': { BiometricLoginButton: 'BiometricButton' },
  });
  let tree;
  await act(async () => {
    tree = create(
      React.createElement(SessionLockScreen, {
        email: 'test@example.com',
        label: 'Huella digital',
        busy: false,
        error: null,
        onUnlock: async () => {
          prompts++;
        },
        onPassword: async () => {},
        onSignOut() {},
      })
    );
  });
  assert.equal(tree.root.findAllByType('TextInput').length, 1);
  await act(async () => {
    tree.root.findByType('BiometricButton').props.onPress();
  });
  assert.equal(prompts, 1);
  await act(async () => {
    tree.unmount();
  });
});
