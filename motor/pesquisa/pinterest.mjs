// Referências visuais do Pinterest por palavra-chave (sem login: só lê a página pública de busca).
// Uso: node motor/pesquisa/pinterest.mjs <pasta> [--n 24] [--prompts] "<busca 1>" ["<busca 2>" …]
//   Argumento que começa com http = link de pin (ex.: achado via busca `site:pinterest.com <tema> prompt`): baixa a imagem
//   e a descrição pública do pin (sem login a página de busca esconde links/descrições; a do pin não).
//   --prompts: abre cada pin e guarda a descrição; marca `temPrompt` quando ela traz um prompt de IA (base para o nosso).
// Saída: <pasta>/NN.jpg (736px), prancha.jpg numerada e manifesto.json (busca, link do pin, data).
// Referência é para medir mecanismo (composição, luz, conceito) e guiar o prompt; nunca republicar o pin.
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const pasta = path.resolve(args.shift() || '');
let n = 24, prompts = false; const buscas = [];
for (let i = 0; i < args.length; i++) args[i] === '--n' ? (n = Number(args[++i])) : args[i] === '--prompts' ? (prompts = true) : buscas.push(args[i]);
if (!pasta || !buscas.length) { console.error('uso: pinterest.mjs <pasta> [--n 24] "<busca>" …'); process.exit(2); }
mkdirSync(pasta, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 2000 }, locale: 'pt-BR',
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36' });
const vistos = new Map();
try {
  for (const q of buscas.filter((b) => /^https?:/.test(b))) {
    await page.goto(q, { waitUntil: 'domcontentloaded', timeout: 40000 }); await page.waitForTimeout(2000);
    const m = await page.evaluate(() => ({ src: document.querySelector('meta[property="og:image"]')?.content || '',
      descricao: document.querySelector('meta[name="description"]')?.content || '' }));
    if (m.src) vistos.set(m.src, { src: m.src, pin: q, alt: '', busca: 'pin', descricao: m.descricao, temPrompt: undefined });
  }
  for (const q of buscas.filter((b) => !/^https?:/.test(b))) {
    await page.goto('https://br.pinterest.com/search/pins/?q=' + encodeURIComponent(q), { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4000);
    for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, 2200); await page.waitForTimeout(1200); }
    const achados = await page.evaluate(() => [...document.querySelectorAll('img[src*="i.pinimg.com"]')]
      .filter((img) => !/\/(60x60|75x75|30x30)\//.test(img.src) && img.naturalWidth >= 150)
      .map((img) => ({ src: img.src, pin: img.closest('a[href*="/pin/"]')?.href || '', alt: img.alt || '' })));
    for (const a of achados) {
      const alta = a.src.replace(/\/\d+x(\d+)?\//, '/736x/');
      if (!vistos.has(alta)) vistos.set(alta, { ...a, src: alta, busca: q });
    }
  }
  const itens = [...vistos.values()].slice(0, n);
  for (const [i, it] of itens.entries()) {
    const r = await page.request.get(it.src);
    if (!r.ok()) { it.erro = r.status(); continue; }
    it.arquivo = `${String(i + 1).padStart(2, '0')}.jpg`;
    writeFileSync(path.join(pasta, it.arquivo), await r.body());
  }
  const PROMPT = /\bprompt\b|--ar\b|--v \d|midjourney|nano banana|stable diffusion|dall.?e|\bflux\b|cinematic|hyper.?realistic|8k|photograph of/i;
  for (const it of itens) if (it.descricao) it.temPrompt = PROMPT.test(it.descricao);
  if (prompts) for (const it of itens.filter((x) => x.arquivo && x.pin && !x.descricao)) {
    try {
      await page.goto(it.pin, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1500);
      it.descricao = await page.evaluate(() => [document.querySelector('meta[name="description"]')?.content,
        document.querySelector('meta[property="og:description"]')?.content,
        document.querySelector('[data-test-id="truncated-description"], [data-test-id="pin-description"]')?.innerText].filter(Boolean).sort((a, b) => b.length - a.length)[0] || '');
      it.temPrompt = /\bprompt\b|--ar\b|--v \d|midjourney|nano banana|stable diffusion|dall.?e|flux|cinematic|hyper.?realistic|8k|photograph of/i.test(it.descricao);
    } catch { it.descricao = ''; }
  }
  const ok = itens.filter((it) => it.arquivo);
  writeFileSync(path.join(pasta, 'manifesto.json'), JSON.stringify({ data: new Date().toISOString().slice(0, 10), buscas, itens: ok }, null, 2));
  // prancha numerada para escolher as referências de uma vez
  const cols = 6, w = 260;
  await page.setViewportSize({ width: cols * (w + 12) + 12, height: 800 });
  const html = path.join(pasta, '.prancha.html');
  writeFileSync(html, `<body style="margin:0;padding:12px;background:#111;columns:${cols} ${w}px;column-gap:12px;font:bold 26px sans-serif">${ok.map((it) =>
    `<div style="position:relative;break-inside:avoid;margin-bottom:12px"><img src="${it.arquivo}" style="width:${w}px;display:block;border-radius:8px"><span style="position:absolute;top:6px;left:6px;background:#B6FF59;color:#0D0D0D;padding:2px 8px;border-radius:6px">${it.arquivo.slice(0, 2)}</span></div>`).join('')}</body>`);
  await page.goto(pathToFileURL(html).href, { waitUntil: 'load' });
  await page.screenshot({ path: path.join(pasta, 'prancha.jpg'), fullPage: true, quality: 80, type: 'jpeg' });
  console.log(`${ok.length} referências em ${pasta} (prancha.jpg, manifesto.json)` + (prompts ? ` · ${ok.filter((x) => x.temPrompt).length} com prompt` : ''));
} finally { await browser.close(); }
