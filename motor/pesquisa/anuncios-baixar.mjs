// Baixa o vídeo dos anúncios de um anuncios.json (do anuncios.mjs) cujo anunciante casa com a regex.
// Usa o Google Chrome instalado (o Chromium do Playwright não toca o vídeo da Meta). Imagens são puladas.
// Uso: node motor/pesquisa/anuncios-baixar.mjs <pasta> "<regex de anunciante>"
import { chromium } from 'playwright';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
const [pasta, re] = process.argv.slice(2); const keep = new RegExp(re, 'i');
const d = JSON.parse(readFileSync(path.join(pasta, 'anuncios.json')));
const b = await chromium.launch({ channel: 'chrome', headless: true });
const pg = await b.newPage({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR' });
for (const a of d.itens.filter(x => keep.test(x.anunciante))) {
  const nome = `${a.anunciante.replace(/[^\w]+/g, '-').slice(0, 20)}-${a.id}.mp4`;
  if (existsSync(path.join(pasta, nome))) { a.arquivo = nome; continue; }
  await pg.goto(`https://www.facebook.com/ads/library/?id=${a.id}`, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
  await pg.waitForTimeout(7000);
  const src = await pg.evaluate(() => [...document.querySelectorAll('video')].map(v => v.currentSrc || v.src).filter(Boolean)[0] || '');
  if (src) { const r = await pg.request.get(src).catch(() => null); if (r?.ok()) { a.arquivo = nome; writeFileSync(path.join(pasta, nome), await r.body()); } }
  console.log(a.anunciante, a.id, a.arquivo ? 'vídeo' : 'sem vídeo (imagem/carrossel)');
}
writeFileSync(path.join(pasta, 'anuncios.json'), JSON.stringify(d, null, 1));
await b.close();
