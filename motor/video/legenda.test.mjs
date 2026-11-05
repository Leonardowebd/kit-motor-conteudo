import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { agruparLegendas, paginaLegenda, AREA_SEGURA, LARGURA, ALTURA } from './legenda.mjs';
import { paginaCards } from './cards.mjs';

const frase = 'Hoje eu vou te mostrar como transformar 3 horas de gravação em 12 vídeos curtos sem perder qualidade nenhuma na edição final';
const palavras = frase.split(' ').map((texto, i) => ({ texto, ini: i * 0.32 + (i > 9 ? 0.6 : 0), fim: i * 0.32 + 0.28 + (i > 9 ? 0.6 : 0) }));

test('@spec:AC-005 legenda sincronizada: blocos cobrem só suas palavras, sem sobreposição, sem perda', () => {
  const blocos = agruparLegendas(palavras);
  const todas = blocos.flatMap((b) => b.palavras.map((p) => p.texto));
  assert.deepEqual(todas, palavras.map((p) => p.texto));
  blocos.forEach((b, i) => {
    assert.ok(b.palavras.length <= 4);
    for (const p of b.palavras) assert.ok(p.ini >= b.ini - 1e-9 && p.fim <= b.fim + 1e-9);
    if (i) assert.ok(blocos[i - 1].fim <= b.ini + 1e-9, 'sobreposição');
    if (b.destaque !== null) {
      const w = b.palavras[b.destaque].texto.replace(/[^\p{L}\p{N}]/gu, '');
      assert.ok(/\d/.test(w) || w.length >= 6, `destaque fraco: ${w}`);
    }
  });
  assert.ok(blocos.some((b) => b.destaque !== null && /\d/.test(b.palavras[b.destaque].texto)), 'número destacado');
});

test('@spec:AC-006 CSS só usa paleta e famílias da marca; texto dentro da área segura', async () => {
  const blocos = agruparLegendas(palavras);
  const cards = [{ ini: 0, fim: 5, tipo: 'texto', conteudo: '3 horas → 12 vídeos com um fluxo só' }];
  const paginas = [paginaLegenda(blocos), paginaCards(cards)];
  // paleta = tokens de motor/marca/marca.css (4 cores + derivados oficiais)
  const permitidas = new Set([...readFileSync(new URL('../marca/marca.css', import.meta.url), 'utf8').matchAll(/--[\w-]+:\s*(#[0-9a-fA-F]{6})/g)].map((m) => m[1].toLowerCase()));
  for (const html of paginas) {
    const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
    for (const h of css.match(/#[0-9a-f]{3,8}\b/gi) ?? []) assert.ok(permitidas.has(h.toLowerCase()), `cor fora: ${h}`);
    for (const m of css.matchAll(/rgba?\((\d+),\s*(\d+),\s*(\d+)/g)) assert.deepEqual([m[1], m[2], m[3]].map(Number), [13, 13, 13]);
    for (const m of css.matchAll(/font-family:\s*([^;]+)/g)) assert.match(m[1], /Clash Display|Satoshi|SF Mono|var\(--fonte-(titulo|texto|mono)\)/);
  }
  const dir = await mkdtemp(path.join(tmpdir(), 'leg-'));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: LARGURA, height: ALTURA } });
    for (const [i, html] of paginas.entries()) {
      const f = path.join(dir, `p${i}.html`);
      await writeFile(f, html);
      await page.goto(pathToFileURL(f).href);
      await page.evaluate(() => document.fonts.ready);
      const fam = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family));
      for (const t of [0.1, 1.2, 2.5, 4.0, 6.0]) {
        await page.evaluate((x) => window.seek(x), t);
        const caixas = await page.evaluate(() => [...document.querySelectorAll('.p, .card')]
          .filter((e) => getComputedStyle(e).opacity !== '0').map((e) => e.getBoundingClientRect().toJSON()));
        for (const r of caixas) {
          assert.ok(r.left >= AREA_SEGURA.lateral - 0.5 && r.right <= LARGURA - AREA_SEGURA.lateral + 0.5, `lateral ${JSON.stringify(r)}`);
          assert.ok(r.top >= AREA_SEGURA.topo - 0.5 && r.bottom <= ALTURA - AREA_SEGURA.base + 0.5, `vertical ${JSON.stringify(r)}`);
        }
      }
      assert.ok(fam.length > 0, 'fonte da marca carregada');
    }
  } finally { await browser.close(); }
});
