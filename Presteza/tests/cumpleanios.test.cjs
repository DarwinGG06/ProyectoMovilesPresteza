const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function cargar(file, mocks = {}, reloj = Date) {
  const source = readFileSync(path.join(__dirname, '..', file), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    Date: reloj,
    console,
    require: (name) => {
      if (name in mocks) return mocks[name];
      throw new Error(`Falta mock: ${name}`);
    },
  });
  return exports;
}

const fechas = cargar('src/shared/notificaciones/fechasCumpleanios.ts');
const perfil = { id: 'cliente', birthDate: '2000-11-21', birthdayEligible: true };

test('programa a las 9 de Bogotá tres días antes y termina tras el tercer día', () => {
  const plan = fechas.planCumpleanios(perfil, new Date('2026-11-01T12:00:00Z'));
  assert.equal(plan.fechaAviso.toISOString(), '2026-11-18T14:00:00.000Z');
  assert.equal(new Date(plan.fin).toISOString(), '2026-11-25T05:00:00.000Z');
});

test('29 de febrero real y observación del 1 de marzo en años no bisiestos', () => {
  const p = { ...perfil, birthDate: '2000-02-29' };
  assert.equal(fechas.planCumpleanios(p, new Date('2028-02-01T12:00:00Z')).periodo, '2028-02-29');
  assert.equal(fechas.planCumpleanios(p, new Date('2027-02-01T12:00:00Z')).periodo, '2027-03-01');
});

test('la ventana cruza un diciembre bisiesto sin sumar 365 fijo', () => {
  const p = { ...perfil, birthDate: '2000-01-02' };
  const plan = fechas.planCumpleanios(p, new Date('2024-12-01T12:00:00Z'));
  assert.equal(plan.fechaAviso.toISOString(), '2024-12-30T14:00:00.000Z');
  assert.equal(new Date(plan.fin).toISOString(), '2025-01-06T05:00:00.000Z');
});

test('rechaza fechas inválidas y respeta el estado del servidor dentro de la ventana', () => {
  assert.equal(fechas.planCumpleanios({ ...perfil, birthDate: '2001-02-29' }), null);
  const plan = fechas.planCumpleanios(
    { ...perfil, birthdayEligible: false },
    new Date('2026-11-20T15:00:00Z')
  );
  assert.equal(plan.periodo, '2027-11-21');
});

function entorno(expoGo = false) {
  let ahora = new Date('2026-11-20T15:00:00Z').getTime();
  class Reloj extends Date {
    constructor(...args) {
      super(...(args.length ? args : [ahora]));
    }
    static now() {
      return ahora;
    }
  }
  const guardado = new Map();
  const pendientes = new Map();
  const visibles = new Map();
  let permiso = true;
  let programados = 0;
  const native = {
    AndroidImportance: { HIGH: 4 },
    SchedulableTriggerInputTypes: { DATE: 'date' },
    setNotificationChannelAsync: async () => {
      if (expoGo) throw new Error('NotificationsChannelsProvider no disponible en Expo Go');
    },
    getPermissionsAsync: async () => ({ granted: permiso }),
    getAllScheduledNotificationsAsync: async () => [...pendientes.values()],
    getPresentedNotificationsAsync: async () => [...visibles.values()],
    cancelScheduledNotificationAsync: async (id) => pendientes.delete(id),
    dismissNotificationAsync: async (id) => visibles.delete(id),
    scheduleNotificationAsync: async (aviso) => {
      programados++;
      pendientes.set(aviso.identifier, aviso);
      return aviso.identifier;
    },
  };
  const servicio = cargar(
    'src/shared/notificaciones/cumpleanios.ts',
    {
      expo: { isRunningInExpoGo: () => expoGo },
      'expo-notifications': native,
      'expo-secure-store': {
        getItemAsync: async (key) => guardado.get(key) ?? null,
        setItemAsync: async (key, value) => guardado.set(key, value),
      },
      'react-native': { Platform: { OS: 'android' } },
      './fechasCumpleanios': cargar('src/shared/notificaciones/fechasCumpleanios.ts', {}, Reloj),
    },
    Reloj
  );
  return {
    servicio,
    pendientes,
    visibles,
    get programados() {
      return programados;
    },
    permiso: (valor) => {
      permiso = valor;
    },
    avanzar: (ms) => {
      ahora += ms;
    },
  };
}

test('Expo Go programa sin crear ni seleccionar un canal personalizado', async () => {
  const e = entorno(true);
  e.servicio.establecerCuentaCumpleanios(perfil.id);
  await e.servicio.sincronizarAvisoCumpleanios(perfil);
  assert.equal(e.programados, 1);
  const aviso = [...e.pendientes.values()][0];
  assert.equal(Object.hasOwn(aviso.trigger, 'channelId'), false);
});

test('la compilacion propia conserva el canal presteza', async () => {
  const e = entorno();
  e.servicio.establecerCuentaCumpleanios(perfil.id);
  await e.servicio.sincronizarAvisoCumpleanios(perfil);
  assert.equal([...e.pendientes.values()][0].trigger.channelId, 'presteza');
});

test('no duplica pendientes ni repite un aviso entregado al reabrir', async () => {
  const e = entorno();
  e.servicio.establecerCuentaCumpleanios(perfil.id);
  await e.servicio.sincronizarAvisoCumpleanios(perfil);
  await e.servicio.sincronizarAvisoCumpleanios(perfil);
  assert.equal(e.programados, 1);
  e.avanzar(11_000);
  e.pendientes.clear();
  await e.servicio.sincronizarAvisoCumpleanios(perfil);
  assert.equal(e.programados, 1);
});

test('usar el beneficio retira el aviso actual y conserva los avisos de pedidos', async () => {
  const e = entorno();
  e.servicio.establecerCuentaCumpleanios(perfil.id);
  await e.servicio.sincronizarAvisoCumpleanios(perfil);
  const [id, aviso] = [...e.pendientes][0];
  e.visibles.set(id, { request: aviso });
  e.pendientes.set('pedido', { identifier: 'pedido', content: { data: { tipo: 'pedido' } } });
  await e.servicio.sincronizarAvisoCumpleanios({
    ...perfil,
    birthdayEligible: false,
    birthdayBenefitYear: 2026,
  });
  assert.equal(e.pendientes.has(id), false);
  assert.equal(e.visibles.has(id), false);
  assert.equal(e.pendientes.has('pedido'), true);
});

test('logout cancela pendientes y un login nuevo permite reprogramar uno no entregado', async () => {
  const e = entorno();
  e.servicio.establecerCuentaCumpleanios(perfil.id);
  await e.servicio.sincronizarAvisoCumpleanios(perfil);
  e.servicio.establecerCuentaCumpleanios(null);
  await e.servicio.sincronizarAvisoCumpleanios(perfil);
  assert.equal(e.pendientes.size, 0);
  e.servicio.establecerCuentaCumpleanios(perfil.id);
  await e.servicio.sincronizarAvisoCumpleanios(perfil);
  assert.equal(e.pendientes.size, 1);
});

test('una respuesta de otra cuenta no programa avisos y negar permiso no rompe el flujo', async () => {
  const e = entorno();
  e.servicio.establecerCuentaCumpleanios('otra');
  await e.servicio.sincronizarAvisoCumpleanios(perfil);
  assert.equal(e.pendientes.size, 0);
  e.servicio.establecerCuentaCumpleanios(perfil.id);
  e.permiso(false);
  await e.servicio.sincronizarAvisoCumpleanios(perfil);
  assert.equal(e.pendientes.size, 0);
  e.permiso(true);
  await e.servicio.sincronizarAvisoCumpleanios(perfil);
  assert.equal(e.pendientes.size, 1);
});
