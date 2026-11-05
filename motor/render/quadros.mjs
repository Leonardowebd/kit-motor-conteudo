// Fotos estáticas da página do Formato A em tempos escolhidos (checagem rápida de design, sem render completo).
// Uso: node motor/render/quadros.mjs <timeline.json> <plano.json> <pastaSaida> [t1 t2 ...]  (sem tempos: meio de cada insert)
// TEMA=editorial|linha|vidro troca o tema de UI do plano (comparar temas sem render).
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { resolverPlano, trechos, paginaFormatoA } from './formato-a.mjs';

const [tl, pj, pasta, ...ts] = process.argv.slice(2);
const timeline = JSON.parse(await readFile(tl, 'utf8'));
const plano = JSON.parse(await readFile(pj, 'utf8'));
// caminho relativo de mídia (imagem/vídeo/svg) em qualquer lugar do plano → URL file:// relativa ao plano.json
  const MIDIA = /\.(png|jpe?g|webp|svg|mp4|mov)$/i;
  const fixar = (o) => { if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { if (typeof v === 'string' && MIDIA.test(v) && !v.includes('://')) o[k] = pathToFileURL(path.resolve(path.dirname(pj), v)).href; else fixar(v); } };
fixar(plano);
const ev = resolverPlano(plano, timeline.saida.palavras, timeline.saida.duracao);
await mkdir(pasta, { recursive: true });
const html = path.join(pasta, 'pagina.html');
await writeFile(html, paginaFormatoA({ palavras: timeline.saida.palavras, destaques: plano.destaques, eventos: ev, trs: trechos(timeline), tema: process.env.TEMA || plano.tema }));
const tempos = ts.length ? ts.map(Number) : ev.inserts.map((x) => +(x.ini + Math.min(1.1, (x.fim - x.ini) * 0.75)).toFixed(2));
const b = await chromium.launch();
const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await pg.goto(pathToFileURL(html).href); await pg.evaluate(() => document.fonts.ready);
for (const t of tempos) { await pg.evaluate((x) => window.seek(x), t); await pg.screenshot({ path: path.join(pasta, `q-${t.toFixed(2)}.png`) }); }
await b.close();
console.log(tempos.join(' '));
