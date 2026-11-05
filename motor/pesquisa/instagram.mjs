// Referências de perfis/posts públicos do Instagram, SEM login (regra do pesquisador): capa, legenda e tipo de cada post.
// Uso: node motor/pesquisa/instagram.mjs <pasta> [--n 6] <@perfil | url-do-post> [...]
// Perfil público mostra os 12 posts recentes; cada post é lido pela página de incorporação (/embed/captioned/).
// Saída: <pasta>/<perfil>/<código>.jpg, manifesto.json (link, legenda, tipo) e prancha.jpg. Serve para MODELAR, nunca republicar.
// --reels  : lê a aba /reels/ do perfil (12 reels, com VIEWS, sem login), ordena por views e marca outlier (views ÷ mediana do perfil).
// --baixar : salva o mp4 de cada reel lido (para transcrever/desconstruir). Só uso interno de pesquisa.
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const pasta = path.resolve(args.shift() || '');
let n = 6, reels = false, baixar = false; const alvos = [];
for (let i = 0; i < args.length; i++) args[i] === '--n' ? (n = Number(args[++i])) : args[i] === '--reels' ? (reels = true) : args[i] === '--baixar' ? (baixar = true) : alvos.push(args[i]);
if (!alvos.length) { console.error('uso: instagram.mjs <pasta> [--n 6] <@perfil|url> ...'); process.exit(2); }
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const b = await chromium.launch();
const pg = await b.newPage({ viewport: { width: 1440, height: 1400 }, locale: 'pt-BR', userAgent: UA });
const manifesto = [];
// "2,3 mi" → 2300000 · "874 mil" → 874000 · "2.685" → 2685
const numero = (t) => { const m = String(t).toLowerCase().match(/([\d.,]+)\s*(mil|mi|k|m)?/); if (!m) return 0; const base = m[2] ? Number(m[1].replace(/\./g, '').replace(',', '.')) : Number(m[1].replace(/[.,]/g, '')); return Math.round(base * ({ mil: 1e3, k: 1e3, mi: 1e6, m: 1e6 }[m[2]] || 1)); };
const mediana = (v) => { const o = [...v].sort((a, b) => a - b); return o.length ? (o[(o.length - 1) >> 1] + o[o.length >> 1]) / 2 : 0; };
async function lerPost(codigo, perfil, extra = {}) {
  await pg.goto(`https://www.instagram.com/p/${codigo}/embed/captioned/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await pg.waitForTimeout(2500);
  const r = await pg.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')].map((i) => ({ src: i.currentSrc || i.src, w: i.naturalWidth, h: i.naturalHeight })).filter((i) => i.w >= 300).sort((a, b) => b.w * b.h - a.w * a.h);
    const leg = document.querySelector('.Caption')?.innerText || '';
    const carrossel = !!document.querySelector('[class*="Sidecar"], .EmbedSidecar, [aria-label*="Próximo"], [aria-label*="Next"]');
    const video = !!document.querySelector('video, .EmbeddedMediaVideo, [class*="Video"]');
    const curt = document.body.innerText.match(/([\d.,]+(?:\s?(?:mil|mi))?)\s+curtidas/i)?.[1] || '';
    const mp4 = [...document.querySelectorAll('video')].map((v) => v.currentSrc || v.src).find(Boolean) || '';
    return { img: imgs[0]?.src || '', leg: leg.replace(/\s+/g, ' ').trim(), carrossel, video, curt, mp4 };
  });
  const dir = path.join(pasta, perfil); mkdirSync(dir, { recursive: true });
  let arquivo = '';
  if (r.img) { const res = await pg.request.get(r.img); if (res.ok()) { arquivo = path.join(dir, `${codigo}.jpg`); writeFileSync(arquivo, await res.body()); } }
  let videoArq = '';
  if (baixar && r.mp4) { const res = await pg.request.get(r.mp4); if (res.ok()) { videoArq = path.join(dir, `${codigo}.mp4`); writeFileSync(videoArq, await res.body()); } }
  manifesto.push({ perfil, link: `https://www.instagram.com/${extra.views ? 'reel' : 'p'}/${codigo}/`, tipo: r.video ? 'reel/vídeo' : r.carrossel ? 'carrossel' : 'imagem', legenda: r.leg, curtidas: r.curt ? numero(r.curt) : undefined, ...extra, arquivo: arquivo ? path.relative(pasta, arquivo) : '', video: videoArq ? path.relative(pasta, videoArq) : '' });
  const m = manifesto.at(-1);
  console.log(perfil, codigo, m.tipo, m.views ? `${m.views} views (${m.multiplo}× a mediana)` : '', '|', r.leg.slice(0, 90));
}
try {
  for (const a of alvos) {
    const post = a.match(/instagram\.com\/(?:[^/]+\/)?(?:p|reel)\/([\w-]+)/);
    if (post) { await lerPost(post[1], 'posts-avulsos'); continue; }
    const perfil = a.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/.*$/, '');
    if (reels) {
      await pg.goto(`https://www.instagram.com/${perfil}/reels/`, { waitUntil: 'domcontentloaded', timeout: 45000 }); await pg.waitForTimeout(4500);
      const grade = (await pg.evaluate(() => [...document.querySelectorAll('a[href*="/reel/"]')].map((a) => ({ h: a.getAttribute('href'), t: a.innerText.replace(/\s+/g, ' ').trim() })))).map((x) => ({ codigo: x.h.split('/').filter(Boolean).pop(), views: numero(x.t) }));
      const med = mediana(grade.map((g) => g.views));
      for (const g of grade.sort((a, b) => b.views - a.views).slice(0, n)) { try { await lerPost(g.codigo, perfil, { views: g.views, medianaPerfil: med, multiplo: med ? Number((g.views / med).toFixed(1)) : 0 }); } catch (e) { console.log(perfil, g.codigo, 'erro', String(e.message).slice(0, 60)); } }
      continue;
    }
    await pg.goto(`https://www.instagram.com/${perfil}/`, { waitUntil: 'domcontentloaded', timeout: 45000 }); await pg.waitForTimeout(4000);
    const codigos = await pg.evaluate((p) => [...new Set([...document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]')].map((x) => x.getAttribute('href')).filter((h) => h.startsWith(`/${p}/`)).map((h) => h.split('/').filter(Boolean).pop()))], perfil);
    for (const c of codigos.slice(0, n)) { try { await lerPost(c, perfil); } catch (e) { console.log(perfil, c, 'erro', String(e.message).slice(0, 60)); } }
  }
  writeFileSync(path.join(pasta, 'manifesto.json'), JSON.stringify(manifesto, null, 2));
  const ok = manifesto.filter((m) => m.arquivo);
  const html = path.join(pasta, '.prancha.html');
  writeFileSync(html, `<body style="margin:0;padding:10px;background:#111;display:grid;grid-template-columns:repeat(6,230px);gap:10px;font:bold 13px sans-serif;color:#fff">${ok.map((m) => `<figure style="margin:0"><img src="${pathToFileURL(path.join(pasta, m.arquivo)).href}" style="width:230px;height:288px;object-fit:cover;display:block;border-radius:6px"><figcaption>${m.perfil} · ${m.tipo}</figcaption></figure>`).join('')}</body>`);
  await pg.setViewportSize({ width: 6 * 240 + 20, height: 800 });
  await pg.goto(pathToFileURL(html).href, { waitUntil: 'load' });
  await pg.screenshot({ path: path.join(pasta, 'prancha.jpg'), fullPage: true, type: 'jpeg', quality: 80 });
  console.log(`${ok.length}/${manifesto.length} posts com capa em ${pasta}`);
} finally { await b.close(); }
