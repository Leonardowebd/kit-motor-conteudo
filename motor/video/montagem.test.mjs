import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validarAgrupamento, validarCortes, timelineDaMontagem } from './montagem.mjs';
import { validarTimeline, PAUSA_MAXIMA } from './timeline.mjs';

// Fala sintética: cada palavra dura 0.3s, com `pausa` entre elas.
function fala(texto, inicio = 0, pausa = 0.1) {
  let t = inicio;
  return texto.split(' ').map((w) => { const p = { texto: w, ini: t, fim: t + 0.3 }; t += 0.3 + pausa; return p; });
}

// Dois RAW: A tem a frase gravada duas vezes (a 1ª com tropeço) e fala de bastidor; B continua o vídeo.
const A = [...fala('A Vercel acaba de', 0.5), ...fala('volta pra ele', 3), ...fala('A Vercel acaba de liberar a WebGPU deles', 6)];
const B = fala('e ela roda direto no navegador', 0.4, 1.5);
const inv = {
  A: { nome: 'A', arquivo: '/raw/A.MOV', duracao: 12, palavras: A },
  B: { nome: 'B', arquivo: '/raw/B.MOV', duracao: 15, palavras: B },
  C: { nome: 'C', arquivo: '/raw/C.MOV', duracao: 5, palavras: fala('teste de som', 0.2) },
};
const palavrasPorNome = { A, B, C: inv.C.palavras };
const video = {
  id: 'v1', titulo: 'WebGPU da Vercel', raws: ['A', 'B'],
  cortes: [{ nome: 'A', ini: 6, fim: 9.8 }, { nome: 'B', ini: 0, fim: 15 }],
};

test('@spec:AC-013 cada RAW aparece em exatamente um vídeo ou descartado com motivo', () => {
  assert.deepEqual(validarAgrupamento({ videos: [video], descartados: [{ nome: 'C', motivo: 'teste de som' }] }, ['A', 'B', 'C']), []);
  const sobra = validarAgrupamento({ videos: [video], descartados: [] }, ['A', 'B', 'C']);
  assert.ok(sobra.some((e) => e.startsWith('C:')), 'RAW fora de qualquer vídeo é acusado');
  const duplo = validarAgrupamento({ videos: [video, { ...video, id: 'v2' }], descartados: [{ nome: 'C', motivo: 'x' }] }, ['A', 'B', 'C']);
  assert.ok(duplo.some((e) => e.includes('2 vezes')), 'RAW em dois vídeos é acusado');
  assert.ok(validarAgrupamento({ videos: [video], descartados: [{ nome: 'C' }] }, ['A', 'B', 'C']).some((e) => e.includes('sem motivo')));
});

test('@spec:AC-014 frase regravada entra uma vez só, sem bastidor', () => {
  assert.deepEqual(validarCortes(video, palavrasPorNome), []);
  const repetido = { ...video, cortes: [{ nome: 'A', ini: 0, fim: 2.5 }, { nome: 'A', ini: 6, fim: 9.8 }] };
  assert.ok(validarCortes(repetido, palavrasPorNome).some((e) => e.includes('repete')), 'duas versões da mesma frase são acusadas');
  const bastidor = { ...video, cortes: [{ nome: 'A', ini: 3, fim: 4.5 }] };
  assert.ok(validarCortes(bastidor, palavrasPorNome).some((e) => e.includes('bastidor')), '"volta pra ele" é acusado');
});

test('@spec:AC-015 cortes de vários RAW viram uma timeline única, em ordem, com legenda no tempo montado', () => {
  const t = timelineDaMontagem(video, inv);
  assert.deepEqual(validarTimeline(t), []);
  assert.deepEqual([...new Set(t.segmentos.map((s) => s.fonte))], ['/raw/A.MOV', '/raw/B.MOV']);
  assert.equal(t.saida.palavras.map((p) => p.texto).join(' '), 'A Vercel acaba de liberar a WebGPU deles e ela roda direto no navegador');
  const soma = t.segmentos.reduce((s, x) => s + (x.fim - x.ini), 0);
  assert.ok(Math.abs(soma - t.saida.duracao) < 0.01, 'duração montada = soma dos segmentos');
  const ultima = t.saida.palavras.at(-1);
  assert.ok(ultima.fim <= t.saida.duracao + 1e-6, 'legenda termina dentro do vídeo montado');
  t.saida.palavras.slice(1).forEach((p, i) => assert.ok(p.ini - t.saida.palavras[i].fim <= PAUSA_MAXIMA + 1e-6, 'pausas longas do RAW B encurtadas'));
});

test('@spec:AC-014 frase curta com palavras de ligação em comum não conta como repetição', async () => {
  const { validarCortes } = await import('./montagem.mjs');
  const p = (txt, ini) => txt.split(' ').map((w, i) => ({ texto: w, ini: ini + i * 0.3, fim: ini + i * 0.3 + 0.25 }));
  const palavras = { R: [...p('ele não é só um chat que tem computador próprio', 0), ...p('só que tem um detalhe', 20)] };
  const video = { id: 'v', cortes: [{ nome: 'R', ini: 0, fim: 3 }, { nome: 'R', ini: 20, fim: 21.5 }] };
  assert.deepEqual(validarCortes(video, palavras), []);
});

test('@spec:AC-014 bastidor pela imagem: sem rosto ou cabeça virada (lendo roteiro) vira trecho fora da câmera', async () => {
  const { trechosFora } = await import('./olhar.mjs');
  const r = (p, y) => ({ pitch: (p * Math.PI) / 180, yaw: (y * Math.PI) / 180 });
  const amostras = [r(2, 1), r(-3, 2), r(30, -35), r(28, -40), null, r(1, 0)].map((rosto, i) => ({ t: i * 0.25, rosto }));
  const js = trechosFora(amostras);
  assert.equal(js.length, 1);
  assert.ok(js[0].ini <= 0.5 && js[0].fim >= 1.0, JSON.stringify(js));
});

test('@spec:AC-014 olhada rápida (< 0,8 s) com rosto visível não é bastidor; sem rosto sempre é', async () => {
  const { trechosFora } = await import('./olhar.mjs');
  const r = (p, y) => ({ pitch: (p * Math.PI) / 180, yaw: (y * Math.PI) / 180 });
  const olhada = [r(1, 0), r(25, -30), r(1, 0)].map((rosto, i) => ({ t: i / 3, rosto }));
  assert.deepEqual(trechosFora(olhada, { passo: 1 / 3 }), []);
  const sumiu = [r(1, 0), null, r(1, 0)].map((rosto, i) => ({ t: i / 3, rosto }));
  assert.equal(trechosFora(sumiu, { passo: 1 / 3 }).length, 1);
});

test('@spec:AC-014 abertura repetida entre frases ("Isso porque…", "E aí…") sai a partir da 2ª vez', async () => {
  const { tirarAberturaRepetida } = await import('./montagem.mjs');
  const w = (t) => t.split(' ').map((texto, i) => ({ texto, ini: i, fim: i + 0.5 }));
  const vistas = new Set();
  assert.equal(tirarAberturaRepetida(w('Isso porque diversos usuários'), vistas).map((p) => p.texto).join(' '), 'Isso porque diversos usuários');
  assert.equal(tirarAberturaRepetida(w('Isso porque um dev soltou'), vistas).map((p) => p.texto).join(' '), 'um dev soltou');
  assert.equal(tirarAberturaRepetida(w('E aí o Claude tem'), vistas).map((p) => p.texto).join(' '), 'E aí o Claude tem');
  assert.equal(tirarAberturaRepetida(w('E aí o Claude Max'), vistas).map((p) => p.texto).join(' '), 'o Claude Max');
});

test('recomeço dentro do corte: fica só a última tentativa, a concluída (fala literal)', async () => {
  const { tirarRecomecos } = await import('./montagem.mjs');
  // como o modo literal ouve: grafia aproximada, tentativas interrompidas antes da completa
  const ws = [...fala('eu plano de', 0), ...fala('isso porque diversas suário estão seclan e', 2), ...fala('isso porque diversos usuários estão cancelando seoplando maxe', 6), ...fala('isso porque diversas usuário estão transcelano seplando om marte de economizando rios de toquens', 10)];
  const { trechos, recomecos } = tirarRecomecos(ws, { ini: 0, fim: 17 });
  assert.equal(recomecos.length, 2);
  assert.equal(trechos.length, 1); // "eu plano de" (rabo de outra tentativa) sai junto
  assert.ok(Math.abs(trechos[0].ini - 9.55) < 0.01 && trechos[0].fim === 17);
});

test('repetição de propósito não é recomeço', async () => {
  const { tirarRecomecos } = await import('./montagem.mjs');
  const ws = fala('cada conecção cada mensage raprelada e cada conecção de arquitetura', 1);
  const { trechos, recomecos } = tirarRecomecos(ws, { ini: 1, fim: 6 });
  assert.equal(recomecos.length, 0);
  assert.deepEqual(trechos, [{ ini: 1, fim: 6 }]);
});

test('tirarRecomecos: enumeração com o mesmo começo não é recomeço', async () => {
  const { tirarRecomecos } = await import('./montagem.mjs');
  const frase = 'onde você vai construir como você vai enviar os arquivos como você vai enviar as referências e como você vai pedir para a IA';
  const literal = frase.split(' ').map((texto, i) => ({ texto, ini: i * 0.3, fim: i * 0.3 + 0.25 }));
  const r = tirarRecomecos(literal, { ini: 0, fim: literal.at(-1).fim });
  assert.equal(r.recomecos.length, 0);
});
