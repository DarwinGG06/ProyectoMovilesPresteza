const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function biometrics(platform, overrides = {}) {
  const native = {
    AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2 },
    SecurityLevel: { BIOMETRIC_STRONG: 3 },
    hasHardwareAsync: async () => true,
    isEnrolledAsync: async () => true,
    supportedAuthenticationTypesAsync: async () => [1],
    getEnrolledLevelAsync: async () => 3,
    authenticateAsync: async () => ({ success: true }),
    ...overrides,
  };
  const filename = path.join(path.dirname(module.filename), '../src/session/biometrics.ts');
  const code = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require: (name) => (name === 'react-native' ? { Platform: { OS: platform } } : native),
  });
  return exports;
}

for (const platform of ['web', 'ios'])
  test(`${platform} no consulta ni invoca sensores nativos`, async () => {
    const api = biometrics(platform, {
      hasHardwareAsync: async () => {
        throw new Error('No debe invocarse');
      },
      authenticateAsync: async () => {
        throw new Error('No debe invocarse');
      },
    });
    assert.equal((await api.getBiometricSupport()).available, false);
    await assert.rejects(api.authenticateDevice(), /Android/);
  });

test('exige sensor, enrolamiento y biometría fuerte en Android', async () => {
  for (const override of [
    { hasHardwareAsync: async () => false },
    { isEnrolledAsync: async () => false },
    { getEnrolledLevelAsync: async () => 2 },
  ]) {
    const support = await biometrics('android', override).getBiometricSupport();
    assert.equal(support.available, false);
    assert.ok(support.reason);
  }
  assert.equal((await biometrics('android').getBiometricSupport()).label, 'Huella digital');
});

test('invoca el diálogo real con biometría fuerte y alternativa de bloqueo del teléfono', async () => {
  let received;
  const api = biometrics('android', {
    authenticateAsync: async (options) => {
      received = options;
      return { success: true };
    },
  });
  await api.authenticateDevice();
  assert.equal(received.promptMessage, 'Desbloquear Presteza');
  assert.equal(received.biometricsSecurityLevel, 'strong');
  assert.equal(received.disableDeviceFallback, false);
});

test('Android sin sensor de huella no ofrece activación', async () => {
  const android = await biometrics('android', {
    supportedAuthenticationTypesAsync: async () => [2],
  }).getBiometricSupport();
  assert.equal(android.label, 'Huella digital');
  assert.equal(android.available, false);
});

test('cancelación, bloqueo del sensor y fallo nunca se aceptan como autenticación', async () => {
  for (const error of [
    'user_cancel',
    'lockout',
    'not_enrolled',
    'system_cancel',
    'authentication_failed',
    'unknown',
  ]) {
    const api = biometrics('android', {
      authenticateAsync: async () => ({ success: false, error }),
    });
    await assert.rejects(api.authenticateDevice());
  }
});
