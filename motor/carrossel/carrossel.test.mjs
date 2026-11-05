import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { validar, validarBarra, paginaSlide, renderizar, lint, LARGURA, ALTURA } from './carrossel.mjs';

const roteiro = () => ({
  fontes: [{ texto: 'Fonte', url: 'https://exemplo.org' }],
  legenda: 'Primeira linha com os 3 Cs.',
  slides: [
    { tipo: 'capa', papel: 'gancho', sobre: 'Tema', titulo: 'A regra de *1933*', sub: 'Sub' },
    { tipo: 'grade', papel: 'desenvolvimento', titulo: 'Qual?', itens: ['a', 'b', 'c'], destaque: 1 },
    { tipo: 'numero', papel: 'prova', numero: '1933', titulo: 'Origem', corpo: 'Texto' },
    { tipo: 'texto', papel: 'desenvolvimento', titulo: 'Nome', corpo: ['Um **negrito**.'], pontos: { total: 8, destaque: [3] } },
    { tipo: 'lista', papel: 'prova', titulo: 'Lista', itens: ['um', 'dois'] },
    { tipo: 'comparacao', papel: 'desenvolvimento', titulo: 'Vs', a: { rotulo: 'A', itens: ['x'] }, b: { rotulo: 'B', itens: ['y'] } },
    { tipo: 'texto', papel: 'virada', titulo: 'Se tudo é destaque, *nada* é', corpo: 'Virada.' },
    { tipo: 'cta', papel: 'cta', titulo: 'Quer mais?', palavra: 'FOCO', entregavel: 'que eu te mando o guia' },
  ],
});
const BARRA = '- um\n- dois\n- três\n- quatro\n- cinco\n';

test('@spec:AC-001 estrutura: capa-gancho, 6–10 slides, virada e CTA final com entregável', () => {
  assert.deepEqual(validar(roteiro()), []);
  const curto = roteiro(); curto.slides.splice(1, 3);
  assert.match(validar(curto).join(), /6 a 10/);
  const semVirada = roteiro(); semVirada.slides[6].papel = 'desenvolvimento';
  assert.match(validar(semVirada).join(), /virada/);
  const semEntregavel = roteiro(); delete semEntregavel.slides.at(-1).entregavel;
  assert.match(validar(semEntregavel).join(), /entregavel/);
  const capaErrada = roteiro(); capaErrada.slides[0].tipo = 'texto';
  assert.match(validar(capaErrada).join(), /capa/);
  const semFonte = roteiro(); semFonte.fontes = [];
  assert.match(validar(semFonte).join(), /fontes/, 'número sem fonte é bloqueado (regra 8)');
});

test('@spec:AC-002 no máximo um acento por slide', () => {
  const r = roteiro(); r.slides[2].corpo = 'Com *outro* acento';  // número já é o acento
  assert.match(validar(r).join(), /slide 3: 2 acentos/);
  const r2 = roteiro(); r2.slides[3].titulo = '*Nome*';           // pontos já é o acento
  assert.match(validar(r2).join(), /slide 4: 2 acentos/);
});

test('@spec:AC-002 identidade: só paleta da marca e famílias Clash/Satoshi/mono', async () => {
  const PALETA = ['#0035D4', '#F6F6F6', '#B6FF59', '#0D0D0D', '#03050C', '#0A0F1F', '#070A14', '#4D7BFF', '#A5C4FF', '#00197A']
    .map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(','));
  const dir = mkdtempSync(path.join(tmpdir(), 'carr-'));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: LARGURA, height: ALTURA } });
    const r = roteiro();
    for (const [i, s] of r.slides.entries()) {
      const html = path.join(dir, `${i}.html`); writeFileSync(html, paginaSlide(s, i, r.slides.length));
      await page.goto(pathToFileURL(html).href);
      const { cores, fontes } = await page.evaluate(() => {
        const cores = new Set(), fontes = new Set();
        for (const el of document.querySelectorAll('body, body *')) {
          const cs = getComputedStyle(el);
          for (const k of ['color', 'backgroundColor', 'borderTopColor']) {
            const m = cs[k].match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/);
            if (m && (m[4] === undefined || +m[4] > 0)) cores.add(`${m[1]},${m[2]},${m[3]}`);
          }
          if (el.textContent.trim() && el.children.length === 0) fontes.add(cs.fontFamily);
        }
        return { cores: [...cores], fontes: [...fontes] };
      });
      for (const c of cores) assert.ok(PALETA.includes(c), `slide ${i + 1}: cor fora da paleta rgb(${c})`);
      for (const f of fontes) assert.match(f, /Clash Display|Satoshi|SF Mono/, `slide ${i + 1}: fonte ${f}`);
    }
  } finally { await browser.close(); }
});

test('@spec:AC-003 exporta PNG 1080x1350 por slide, na ordem, com legenda.txt', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'carr-'));
  writeFileSync(path.join(dir, 'carrossel.json'), JSON.stringify(roteiro()));
  writeFileSync(path.join(dir, 'bar.md'), BARRA);
  const pngs = await renderizar(path.join(dir, 'carrossel.json'));
  assert.equal(pngs.length, 8);
  pngs.forEach((p, i) => {
    assert.equal(path.basename(p), `${String(i + 1).padStart(2, '0')}.png`);
    const b = readFileSync(p);
    assert.deepEqual([b.readUInt32BE(16), b.readUInt32BE(20)], [1080, 1350]);
  });
  assert.match(readFileSync(path.join(dir, 'legenda.txt'), 'utf8'), /Fontes:\n· Fonte: https:\/\/exemplo.org/);
});

test('@spec:AC-004 render recusa carrossel sem bar.md de 5 a 7 mecanismos', async () => {
  assert.deepEqual(validarBarra(BARRA), []);
  assert.match(validarBarra('- só um').join(), /5 a 7/);
  const dir = mkdtempSync(path.join(tmpdir(), 'carr-'));
  writeFileSync(path.join(dir, 'carrossel.json'), JSON.stringify(roteiro()));
  await assert.rejects(renderizar(path.join(dir, 'carrossel.json')), /bar\.md/);
});

test('@spec:AC-002 imagem de IA e rosto de famoso: regras de uso', () => {
  const r = roteiro(); r.slides[0].imagem = 'capa.png';
  assert.match(validar(r).join(), /"ia": true/);
  r.slides[0].ia = true; assert.deepEqual(validar(r), []);
  r.slides[0].rosto = 'famoso'; assert.match(validar(r).join(), /paródia/);
  const r2 = roteiro(); Object.assign(r2.slides.at(-1), { imagem: 'f.png', ia: true, rosto: 'famoso', parodia: true });
  assert.match(validar(r2).join(), /CTA/);
});

test('@spec:AC-006 anti-slop: título sem ponto final, sem exclamação, sem emoji, sem hype', () => {
  assert.deepEqual(lint(roteiro()), []);
  const r = roteiro();
  r.slides[1].titulo = 'Qual você viu primeiro.';
  r.slides[2].corpo = 'Texto incrível!';
  r.slides[3].titulo = 'Pronto 🚀';
  const e = lint(r).join('\n');
  assert.match(e, /slide 2: titulo termina com ponto final/);
  assert.match(e, /slide 3: exclamação/);
  assert.match(e, /slide 3: palavra de hype "incrível"/);
  assert.match(e, /slide 4: emoji/);
  assert.match(validar(r).join('\n'), /ponto final/, 'validar() inclui o lint');
});

test('@spec:AC-007 contraste: todo texto do slide claro tem pelo menos 4,5:1', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'carr-'));
  const post = { tipo: 'post', papel: 'desenvolvimento', titulo: 'Título do post', corpo: 'Corpo do post com texto.', fonte: 'Laws of UX',
    visual: { tipo: 'barras', destaque: 1, itens: [{ rotulo: 'Antes', valor: 2000, texto: '2000 ms' }, { rotulo: 'Depois', valor: 400, texto: '400 ms' }] } };
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: LARGURA, height: ALTURA } });
    const html = path.join(dir, 'p.html'); writeFileSync(html, paginaSlide(post, 1, 7));
    await page.goto(pathToFileURL(html).href); await page.evaluate(() => document.fonts.ready);
    const falhas = await page.evaluate(() => {
      const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      const bg = [246, 246, 246], out = [];
      for (const el of document.querySelectorAll('body *')) {
        if (el.closest('.cartao')) continue;                       // texto dentro do cartão escuro tem outro fundo
        if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
        const m = getComputedStyle(el).color.match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/); if (!m) continue;
        const a = m[4] === undefined ? 1 : +m[4], c = [1, 2, 3].map((i) => +m[i] * a + bg[i - 1] * (1 - a));
        const L1 = lum(bg), L2 = lum(c), r = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
        if (r < 4.5) out.push(`${el.className || el.tagName}: ${r.toFixed(2)}`);
      }
      return out;
    });
    assert.deepEqual(falhas, []);
  } finally { await browser.close(); }
});

test('@spec:AC-002 visuais de dados (citação, linha do tempo, barras) cabem no cartão', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'carr-'));
  writeFileSync(path.join(dir, 'bar.md'), BARRA);
  const r = roteiro();
  const v = [{ tipo: 'citacao', texto: 'Texto de uma fonte, citado com crédito.', autor: 'Fonte: Wikipedia' },
    { tipo: 'linha', itens: [{ quando: '4 out', texto: 'Novo logo' }, { quando: '11 out', texto: 'Volta ao antigo' }] },
    { tipo: 'barras', destaque: 1, itens: [{ rotulo: 'Antes', valor: 2000, texto: '2000 ms' }, { rotulo: 'Depois', valor: 400, texto: '400 ms' }] }];
  r.slides.splice(1, 5, ...v.map((vis) => ({ tipo: 'post', papel: 'desenvolvimento', titulo: 'Título', corpo: 'Corpo curto.', visual: vis, fonte: 'Teste' })));
  writeFileSync(path.join(dir, 'carrossel.json'), JSON.stringify(r));
  const pngs = await renderizar(path.join(dir, 'carrossel.json'));   // lança erro se algo estourar
  assert.equal(pngs.length, r.slides.length);
});
