import { readFileSync } from 'node:fs';
// T-006 — testes da composição E1 e da biblioteca de B-roll.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { AREA_SEGURA, LARGURA, ALTURA } from '../video/legenda.mjs';
import { TIPOS, CAIXA } from './broll.mjs';
import { paginaComposicao, coberturaCards, escolherDestaqueMarca, normalizarCards } from './compor.mjs';

// Fala sintética contínua de 40 s e um card de cada tipo (2,5 s cada), com 2 janelas de rosto cheio.
const palavras = Array.from({ length: 100 }, (_, i) => ({ texto: ['A', 'Vercel', 'abriu', 'a', 'VGPU', 'de', 'graça', 'no', 'GitHub', 'hoje'][i % 10], ini: i * 0.4, fim: i * 0.4 + 0.35 }));
const tipos = Object.keys(TIPOS);
const cards = tipos.map((tipo, i) => ({ ini: i * 2.2, fim: (i + 1) * 2.2, tipo, props: {} }));
const DUR = 40;
const destaques = ['Vercel', 'VGPU', 'GitHub'];

async function abrir(fn) {
  const pasta = await mkdtemp(path.join(tmpdir(), 'compor-test-'));
  const arq = path.join(pasta, 'p.html');
  await writeFile(arq, paginaComposicao({ cards, palavras, destaques }));
  const b = await chromium.launch();
  try {
    const p = await b.newPage({ viewport: { width: LARGURA, height: ALTURA } });
    const erros = []; p.on('pageerror', (e) => erros.push(e.message));
    await p.goto(pathToFileURL(arq).href); await p.evaluate(() => document.fonts.ready);
    await fn(p, erros);
  } finally { await b.close(); await rm(pasta, { recursive: true, force: true }); }
}

test('@spec:AC-007 nenhum card fica > 3 s sem mudança de pixel na região do card', { timeout: 240000 }, async () => {
  await abrir(async (p, erros) => {
    const passo = 0.5, clip = { x: CAIXA.x, y: CAIXA.y, width: CAIXA.largura, height: CAIXA.altura };
    // além dos cards da lista, estica cada tipo por 7 s para provar movimento interno contínuo
    for (const c of normalizarCards(cards)) {
      let anterior = null, parado = 0;
      for (let t = c.ini + 0.05; t < c.fim; t += passo) {
        await p.evaluate((x) => window.seek(x), t);
        const img = await p.screenshot({ clip });
        parado = anterior && img.equals(anterior) ? parado + passo : 0;
        assert.ok(parado <= 3, `${c.tipo}: ${parado}s sem mudança em t=${t.toFixed(2)}`);
        anterior = img;
      }
    }
    assert.deepEqual(erros, []);
  });
  // card longo (8 s) de cada tipo: diferença entre quadros a cada 1 s nunca nula por > 3 s
  for (const tipo of tipos) {
    const pasta = await mkdtemp(path.join(tmpdir(), 'compor-longo-'));
    const arq = path.join(pasta, 'p.html');
    await writeFile(arq, paginaComposicao({ cards: [{ ini: 0, fim: 8, tipo }], palavras: [], destaques }));
    const b = await chromium.launch();
    try {
      const p = await b.newPage({ viewport: { width: LARGURA, height: ALTURA } });
      await p.goto(pathToFileURL(arq).href); await p.evaluate(() => document.fonts.ready);
      let anterior = null, parado = 0;
      for (let t = 2; t < 8; t += 1) {
        await p.evaluate((x) => window.seek(x), t);
        const img = await p.screenshot({ clip: { x: CAIXA.x, y: CAIXA.y, width: CAIXA.largura, height: CAIXA.altura } });
        parado = anterior && img.equals(anterior) ? parado + 1 : 0;
        assert.ok(parado < 3, `${tipo} parado ${parado}s no card longo`);
        anterior = img;
      }
    } finally { await b.close(); await rm(pasta, { recursive: true, force: true }); }
  }
});

test('@spec:AC-007 cobertura de cards entre 75 e 90 % da duração (dados do vercel-webgpu)', async (t) => {
  const { readFile } = await import('node:fs/promises');
  const { pastaFontes } = await import('../video/legenda.mjs');
  let acervo; try { acervo = process.env.MOTOR_ACERVO || JSON.parse(await readFile(path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../conteudo.config.json'), 'utf8')).acervo; } catch { /* sem config */ }
  const base = path.join(acervo || '', 'Conteudo/Videos');
  try { await readFile(path.join(base, 'Producao/vercel-webgpu/cards.json')); } catch { return t.skip('precisa do vídeo de exemplo vercel-webgpu no acervo'); }
  const dados = JSON.parse(await readFile(path.join(base, 'Producao/vercel-webgpu/cards.json'), 'utf8'));
  const tl = JSON.parse(await readFile(path.join(base, 'Previas/vercel-webgpu-proxy.timeline.json'), 'utf8'));
  const c = coberturaCards(dados.cards, tl.saida.duracao);
  assert.ok(c >= 0.75 && c <= 0.9, `cobertura ${(c * 100).toFixed(1)}%`);
  assert.equal(coberturaCards([{ ini: 0, fim: 5, tipo: 'chip' }, { ini: 5, fim: 10, tipo: 'chip', modo: 'sobre' }], 10), 0.5);
});

test('@spec:AC-006 cores e fontes só da marca', async () => {
  const html = paginaComposicao({ cards, palavras, destaques });
  // paleta = tokens de motor/marca/marca.css (4 cores da marca + derivados oficiais)
  const css = readFileSync(new URL('../marca/marca.css', import.meta.url), 'utf8');
  const hexes = [...css.matchAll(/--[\w-]+:\s*(#[0-9a-fA-F]{6})/g)].map((m) => m[1].toLowerCase());
  const marca = new Set(hexes);
  const rgbMarca = new Set(hexes.map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(',')));
  for (const h of html.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g) || []) assert.ok(marca.has(h.toLowerCase()), `cor fora da marca: ${h}`);
  for (const m of html.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g)) assert.ok(rgbMarca.has(`${m[1]},${m[2]},${m[3]}`), `rgb fora da marca: ${m[0]}`);
  assert.doesNotMatch(html, /:\s*(white|black|red|blue|green|gray|grey)\b/i);
  for (const m of html.matchAll(/font-family:\s*([^;}]+)/g)) assert.match(m[1].trim(), /^(var\(--fonte-(titulo|texto|mono)\)|'Clash Display'|'Satoshi'|'SF Mono')/, `fonte fora da marca: ${m[1]}`);
  assert.doesNotMatch(html, /transition\s*:|animation\s*:/, 'animação deve ser só por seek(t)');
});

test('@spec:AC-006 legenda e card dentro da AREA_SEGURA', { timeout: 120000 }, async () => {
  const { topo, base, lateral } = AREA_SEGURA;
  const dentro = (r, nome, t) => assert.ok(r.x >= lateral - 1 && r.x + r.w <= LARGURA - lateral + 1 && r.y >= topo - 1 && r.y + r.h <= ALTURA - base + 1, `${nome} fora da área segura em t=${t}: ${JSON.stringify(r)}`);
  await abrir(async (p) => {
    for (let t = 0.3; t < DUR; t += 0.7) {
      const r = await p.evaluate((x) => {
        window.seek(x);
        const box = (el) => { const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, vis: getComputedStyle(el).display !== 'none' && b.width > 0 && el.closest('#painel, #sobre, body').offsetParent !== null }; };
        const leg = document.querySelector('#leg .p') ? box(document.getElementById('leg')) : null;
        const painel = getComputedStyle(document.getElementById('painel')).display !== 'none';
        const spans = [...document.querySelectorAll('#leg .p')].map((s) => s.getBoundingClientRect());
        const legTxt = spans.length ? { x: Math.min(...spans.map((s) => s.x)), y: Math.min(...spans.map((s) => s.y)), w: Math.max(...spans.map((s) => s.right)) - Math.min(...spans.map((s) => s.x)), h: Math.max(...spans.map((s) => s.bottom)) - Math.min(...spans.map((s) => s.y)) } : null;
        return { caixa: painel ? box(document.getElementById('caixa')) : null, leg: legTxt, legOk: !!leg };
      }, t);
      if (r.caixa) dentro(r.caixa, 'card', t);
      if (r.leg) dentro(r.leg, 'legenda', t);
    }
  });
});

test('destaque prefere termo listado, número e nome próprio', () => {
  const p = (s) => s.split(' ').map((texto) => ({ texto }));
  assert.equal(escolherDestaqueMarca(p('totalmente de graça'), ['graça']), 2);
  assert.equal(escolherDestaqueMarca(p('custa 199 reais'), []), 1);
  assert.equal(escolherDestaqueMarca(p('desenvolvedores da Vercel'), []), 2);
});

test('trechos: micro-pausas da mesma frase não trocam o plano', async () => {
  const { trechos } = await import('./formato-a.mjs');
  // 6 segmentos da mesma tomada com pausas de 0,3 s + salto para outra frase
  const seg = (ini, fim) => ({ ini, fim, fonte: 'a.mov' });
  const tl = { segmentos: [seg(0, 0.8), seg(1.1, 1.9), seg(2.2, 3.0), seg(3.3, 4.1), seg(4.4, 5.2), seg(20, 22)] };
  const trs = trechos(tl);
  assert.equal(trs.length, 2); // a tomada vira um plano; o salto de fonte abre outro
  assert.notEqual(trs[0].enq, trs[1].enq);
  assert.equal(trs.at(-1).fim, 6);
});

test('ganhoAgudos: só realça voz abafada, com teto', async () => {
  const { ganhoAgudos } = await import('./som.mjs');
  assert.equal(ganhoAgudos(-38.3), 8);   // RAW abafado (React Bits): teto
  assert.equal(ganhoAgudos(-33), 3);
  assert.equal(ganhoAgudos(-28.8), 0);   // AKG aprovado: não mexe
  assert.equal(ganhoAgudos(NaN), 0);
});
