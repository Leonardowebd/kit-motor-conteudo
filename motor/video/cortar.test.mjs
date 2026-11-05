import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { planejarCortes, ajustarAoSilencio, FPS } from './cortar.mjs';
import { validarTimeline, PAUSA_MAXIMA } from './timeline.mjs';

function sintetico() {
  // fala com silêncios longos no início, no meio e no fim, e pausas curtas
  const ps = [];
  let t = 2.5;
  const gaps = [0.1, 0.3, 1.8, 0.05, 0.69, 3.2, 0.2, 0.71, 0.4, 5.0, 0.15];
  for (let i = 0; i <= gaps.length; i++) {
    ps.push({ texto: `p${i}`, ini: t, fim: t + 0.3 });
    t += 0.3 + (gaps[i] ?? 0);
  }
  return { ps, dur: t + 4 };
}

test('@spec:AC-005 planejarCortes: nenhuma pausa acima de 0,7 s na saída', () => {
  const { ps, dur } = sintetico();
  const tl = planejarCortes(ps, dur, { fonte: '/x.mov' });
  const sp = tl.saida.palavras;
  for (let i = 1; i < sp.length; i++) assert.ok(sp[i].ini - sp[i - 1].fim <= PAUSA_MAXIMA + 1e-6, `pausa ${i}`);
  assert.ok(sp[0].ini <= 0.1 + 1e-6, 'silêncio inicial removido');
  assert.ok(tl.saida.duracao - sp.at(-1).fim <= 0.1 + 1e-6, 'silêncio final removido');
  assert.ok(tl.saida.duracao < dur - 10);
});

test('@spec:AC-005 planejarCortes: nenhuma palavra perdida, ordem e durações preservadas', () => {
  const { ps, dur } = sintetico();
  const tl = planejarCortes([...ps].reverse(), dur, { fonte: '/x.mov' });
  assert.deepEqual(tl.saida.palavras.map((p) => p.texto), ps.map((p) => p.texto));
  for (const [i, p] of tl.saida.palavras.entries()) {
    assert.ok(Math.abs((p.fim - p.ini) - 0.3) < 0.01, `duração palavra ${i}`);
  }
});

test('@spec:AC-005 planejarCortes: timeline válida e pausas curtas mantidas', () => {
  const { ps, dur } = sintetico();
  const tl = planejarCortes(ps, dur, { fonte: '/x.mov' });
  assert.deepEqual(validarTimeline(tl), []);
  const sp = tl.saida.palavras;
  assert.ok(Math.abs((sp[2].ini - sp[1].fim) - 0.3) < 0.01, 'pausa de 0,3 s intacta');
  assert.ok(planejarCortes([], 10, { fonte: '/x' }).segmentos.length === 0);
});

test('@spec:AC-005 integração: RAW real (requer RAW_TESTE)', async (t) => {
  const raw = process.env.RAW_TESTE;
  if (!raw || !existsSync(raw)) return t.skip('RAW_TESTE não definido');
  const { transcrever } = await import('./transcrever.mjs');
  const { palavras, duracaoFonte } = await transcrever(raw);
  const tl = planejarCortes(palavras, duracaoFonte, { fonte: raw });
  assert.deepEqual(validarTimeline(tl), []);
  assert.ok(palavras.length > 0);
});

test('@spec:AC-005 respiro medido no áudio sai do corte mesmo quando o Whisper estica a palavra', () => {
  // "você" vai de 9,8 a 12,0 no Whisper, mas o áudio tem silêncio de 10,1 a 11,9 (hesitação)
  const palavras = [{ texto: 'permite', ini: 9.2, fim: 9.7 }, { texto: 'você', ini: 9.8, fim: 12.0 }, { texto: 'utilizar', ini: 12.0, fim: 12.4 }];
  const ps = ajustarAoSilencio(palavras, [{ ini: 10.1, fim: 11.9 }]);
  const t = planejarCortes(ps, 20, { pausaMaxima: 0.22, folga: 0.06 });
  assert.ok(t.saida.duracao < 1.8, `duração ${t.saida.duracao} ainda tem o respiro`);
  assert.equal(t.saida.palavras.length, 3);
});

test('@spec:AC-005 sincronia: todo trecho começa e termina num quadro (áudio e vídeo com a mesma duração)', () => {
  const palavras = [{ texto: 'a', ini: 0.013, fim: 0.41 }, { texto: 'vercel', ini: 1.117, fim: 1.52 }, { texto: 'abriu', ini: 1.55, fim: 2.031 }];
  const t = planejarCortes(palavras, 10, { pausaMaxima: 0.22, folga: 0.06 });
  for (const s of t.segmentos) for (const x of [s.ini, s.fim]) assert.ok(Math.abs(x * FPS - Math.round(x * FPS)) < 0.01, `${x} fora do quadro`);
});

test('@spec:AC-005 borda do corte vai até o silêncio: não engole o fim da palavra nem invade a próxima', () => {
  // Whisper diz que "a" termina em 2,86, mas o som vai até 2,95; o silêncio real começa em 2,95 e a próxima palavra em 3,30
  const t = planejarCortes([{ texto: 'pública', ini: 2.1, fim: 2.54 }, { texto: 'a', ini: 2.54, fim: 2.86 }], 10,
    { pausaMaxima: 0.22, folga: 0.06, silencios: [{ ini: 2.95, fim: 3.3 }] });
  const fim = t.segmentos.at(-1).fim;
  assert.ok(fim >= 2.95 && fim <= 3.3, `fim ${fim}`);
});
