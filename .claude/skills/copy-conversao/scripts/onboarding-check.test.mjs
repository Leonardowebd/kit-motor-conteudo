import { test } from 'node:test';
import assert from 'node:assert/strict';
import { faltando } from './onboarding-check.mjs';
test('onboarding bloqueia campos obrigatórios vazios e termo sem fonte', () => {
  assert.ok(faltando('marca', { marca: 'X' }).includes('marca.quem_fala.nome'));
  assert.ok(faltando('nicho', { nicho: 'a', publico: 'b', consciencia: 'problema', dores: [{ texto: 'd' }], glossario: [{ termo: 'obra' }] }).includes('nicho.glossario: termo sem fonte'));
  assert.deepEqual(faltando('marca', { marca: 'X', quem_fala: { nome: 'A', cargo: 'B' }, tom: { descricao: 'direto' }, plataformas: ['meta'] }), []);
  assert.deepEqual(faltando('cliente', null), ['cliente: arquivo não existe']);
});
