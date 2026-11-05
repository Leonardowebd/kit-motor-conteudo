import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectarCortes, planos, frases, falaPorPlano, pausasDaFala, resumo } from './desconstruir.mjs';

const serie = (vals, fps = 10) => vals.map((s, i) => ({ t: i / fps, s }));

test('corte forte e pico relativo em layout dividido entram; ruído e transição dupla não', () => {
  const v = Array(60).fill(0.01);
  v[10] = 0.6;              // corte de tela cheia
  v[11] = 0.4;              // 2º quadro da mesma transição (< 0,25 s): fundido
  v[30] = 0.12;             // troca só do card de cima: pico 12× a mediana
  v[45] = 0.05;             // ruído abaixo do limiar fraco
  assert.deepEqual(detectarCortes(serie(v)), [1, 3]);
});

test('planos cobrem do 0 à duração', () => {
  assert.deepEqual(planos([1, 3], 5), [
    { n: 1, ini: 0, fim: 1, dur: 1 }, { n: 2, ini: 1, fim: 3, dur: 2 }, { n: 3, ini: 3, fim: 5, dur: 2 },
  ]);
});

const W = [
  { texto: 'Isso', ini: 0.2, fim: 0.4 }, { texto: 'mudou', ini: 0.45, fim: 0.8 }, { texto: 'tudo.', ini: 0.85, fim: 1.2 },
  { texto: 'Em', ini: 2.5, fim: 2.6 }, { texto: '1886', ini: 2.65, fim: 3.4 },
];

test('frases quebram na pontuação e na pausa', () => {
  assert.deepEqual(frases(W).map((f) => f.texto), ['Isso mudou tudo.', 'Em 1886']);
});

test('fala vai para o plano onde está o meio da palavra', () => {
  const ps = falaPorPlano(planos([1, 3], 5), W);
  assert.deepEqual(ps.map((p) => p.fala), ['Isso mudou', 'tudo. Em', '1886']);
});

test('fundo sonoro: pausa da fala sem silêncio no áudio conta como fundo', () => {
  assert.deepEqual(pausasDaFala(W, 5).map(([a, b]) => [a, +b.toFixed(2)]), [[1.2, 2.5], [3.4, 5]]);
  const r = resumo({ duracao: 5, ps: falaPorPlano(planos([1, 3], 5), W), palavras: W, silencios: [[3.4, 5]] });
  assert.equal(r.fundoNasPausas, 0.45); // 1,3 s de pausa com som de 2,9 s de pausa
  assert.equal(r.gancho3s, 'Isso mudou tudo. Em 1886');
  assert.equal(r.planos, 3);
});
