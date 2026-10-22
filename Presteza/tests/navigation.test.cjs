const assert = require('node:assert/strict');
const { readdirSync, readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');

const root = path.resolve(path.dirname(module.filename), '..');

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory()
      ? sourceFiles(filename)
      : /\.tsx?$/.test(entry.name)
        ? [filename]
        : [];
  });
}

test('los destinos estáticos de navegación corresponden a pantallas de Expo Router', () => {
  const app = path.join(root, 'app');
  const routes = new Set();
  for (const filename of sourceFiles(app)) {
    if (/^[_+]/.test(path.basename(filename))) continue;
    const route =
      '/' +
      path
        .relative(app, filename)
        .replaceAll(path.sep, '/')
        .replace(/\.tsx?$/, '');
    routes.add(route);
    if (route.endsWith('/index')) routes.add(route.slice(0, -6) || '/');
  }

  let checked = 0;
  for (const filename of [...sourceFiles(app), ...sourceFiles(path.join(root, 'src'))]) {
    const source = ts.createSourceFile(
      filename,
      readFileSync(filename, 'utf8'),
      ts.ScriptTarget.Latest,
      true
    );
    function check(node) {
      if (!node) return;
      if (ts.isAsExpression(node) || ts.isParenthesizedExpression(node))
        return check(node.expression);
      if (ts.isObjectLiteralExpression(node)) {
        const pathname = node.properties.find(
          (property) =>
            ts.isPropertyAssignment(property) && property.name.getText(source) === 'pathname'
        );
        if (pathname) check(pathname.initializer);
        return;
      }
      if (ts.isConditionalExpression(node)) {
        check(node.whenTrue);
        check(node.whenFalse);
      } else if (ts.isStringLiteral(node) && node.text.startsWith('/')) {
        checked++;
        assert.ok(
          routes.has(node.text.split(/[?#]/, 1)[0]),
          `${path.relative(root, filename)} navega a una ruta inexistente: ${node.text}`
        );
      }
    }
    function visit(node) {
      if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.expression.getText(source) === 'router' &&
        ['push', 'replace', 'navigate'].includes(node.expression.name.text)
      )
        check(node.arguments[0]);
      if (ts.isPropertyAssignment(node) && node.name.getText(source) === 'ruta')
        check(node.initializer);
      if (ts.isJsxAttribute(node) && node.name.getText(source) === 'href') {
        check(
          node.initializer && ts.isJsxExpression(node.initializer)
            ? node.initializer.expression
            : node.initializer
        );
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  assert.ok(checked > 0, 'Debe comprobar al menos un destino de navegación');
});
