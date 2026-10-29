const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { act, create } = require('react-test-renderer');
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

test('pedidos: refresca al volver, evita solicitudes simultáneas y descarta respuestas tras salir', async () => {
  let tick,
    listener,
    resolve,
    calls = 0,
    removed = false,
    cleared = false;
  const received = [];
  const state = {
    currentState: 'active',
    addEventListener: (_event, fn) => {
      listener = fn;
      return {
        remove: () => {
          removed = true;
        },
      };
    },
  };
  const exports = {};
  const code = ts.transpileModule(
    readFileSync('src/shared/hooks/usePedidosActualizados.ts', 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } }
  ).outputText;
  vm.runInNewContext(code, {
    exports,
    setInterval: (fn, delay) => {
      assert.equal(delay, 5000);
      tick = fn;
      return 1;
    },
    clearInterval: () => {
      cleared = true;
    },
    require: (name) =>
      name === 'react'
        ? React
        : name === 'expo-router'
          ? { useFocusEffect: React.useEffect }
          : { AppState: state },
  });
  const query = () => {
    calls++;
    return new Promise((r) => {
      resolve = r;
    });
  };
  const receive = (rows) => received.push(rows);
  function Probe() {
    exports.usePedidosActualizados(query, receive);
    return null;
  }
  let tree;
  await act(async () => {
    tree = create(React.createElement(Probe));
  });
  assert.equal(calls, 1);
  tick();
  assert.equal(calls, 1);
  await act(async () => {
    resolve(['pedido-1']);
  });
  assert.deepEqual(received, [['pedido-1']]);
  state.currentState = 'background';
  tick();
  assert.equal(calls, 1);
  state.currentState = 'active';
  listener('active');
  assert.equal(calls, 2);
  await act(async () => {
    tree.unmount();
    resolve(['pedido-tardío']);
  });
  assert.deepEqual(received, [['pedido-1']]);
  assert.equal(removed && cleared, true);
});
