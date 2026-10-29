const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { act, create } = require('react-test-renderer');
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
function load(file, mocks = {}) {
  const code = ts.transpileModule(readFileSync(path.join(__dirname, '..', file), 'utf8'), {
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
for (const fails of [false, true])
  test(`pedido ${fails ? 'fallido conserva bandeja y no confirma' : 'creado vacía bandeja, navega y confirma'}`, async () => {
    const events = [];
    const { usePago } = load('src/features/pago/hooks/usePago.ts', {
      'expo-router': { router: { replace: (route) => events.push(['ruta', route]) } },
      '@/api/helpers': load('src/api/helpers.ts'),
      '@/api/loyalty': {
        cotizarPuntos: async () => ({ maxRedeemable: 0 }),
        crearPedidoConPuntos: async () => {
          if (fails) throw new Error('Servidor no disponible');
          return { order: { id: 'pedido-123' } };
        },
      },
      '@/api/perfil': { obtenerUsuario: async () => ({ addresses: [] }) },
      '@/api/reservas': { listarMesas: async () => [] },
      '@/features/reservas/data': { MESAS_SALON: [{ id: '1' }] },
      '@/services/cart/CartContext': {
        useCart: () => ({
          items: [{ id: 'plato-1', quantity: 1 }],
          totalPrice: 10000,
          clearCart: () => events.push(['vaciar']),
        }),
      },
      '@/session/context': {
        useSession: () => ({ user: { id: 'cliente' }, token: 'test-token', isAuthenticated: true }),
      },
      '@/session/roles': { esAdmin: () => false },
      '@/shared/components/aviso': {
        useAviso: () => ({ ok: (title, message) => events.push(['aviso', title, message]) }),
      },
    });
    let current;
    function Probe() {
      current = usePago();
      return null;
    }
    let tree;
    await act(async () => {
      tree = create(React.createElement(Probe));
    });
    await act(async () => {
      current.setMesa('1');
    });
    await act(async () => {
      await current.confirmar();
    });
    if (fails) {
      assert.deepEqual(events, []);
      assert.equal(current.error, 'Servidor no disponible');
    } else {
      assert.deepEqual(events.slice(0, 2), [['vaciar'], ['ruta', '/seguimiento?id=pedido-123']]);
      assert.equal(events[2][1], 'Pedido creado');
    }
    assert.equal(current.enviando, false);
    await act(async () => {
      tree.unmount();
    });
  });
