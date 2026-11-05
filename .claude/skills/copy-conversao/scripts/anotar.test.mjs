import { test } from 'node:test';
import assert from 'node:assert/strict';
import { injetar } from './anotar.mjs';

test('@spec:AC-107 camada de anotação é injetada uma vez só (idempotente) antes do </body>', () => {
  const a = injetar('<html><body><div class="b">x</div></body></html>');
  const b = injetar(a);
  assert.equal(a, b);
  assert.equal(b.split('<!--anotar-->').length - 1, 1);
  assert.ok(b.indexOf('<!--/anotar-->') < b.indexOf('</body>'));
});
