// Biblioteca de Anúncios da Meta (BR, ativos), SEM login. Ranqueia por indicador indireto de resultado:
// dias no ar × versões ativas do mesmo criativo ("N anúncios usam esse criativo"). NÃO é métrica de resultado
// (a Biblioteca não mostra gasto/views de anúncio comercial no Brasil).
// Uso: node motor/pesquisa/anuncios.mjs <pasta> [--n 40] [--baixar 10] [--midia all|video] [--contar] "busca 1" "busca 2" ...
// Link da Biblioteca no lugar da busca (ex.: página ordenada por impressões) → mantém a ordem da página.
// --contar: só imprime o total de resultados (~N) de cada busca, sem ler os anúncios
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2); const pasta = args.shift();
let n = 40, baixar = 0, midia = 'video', contar = false; const buscas = [];
for (let i = 0; i < args.length; i++) args[i] === '--n' ? (n = +args[++i]) : args[i] === '--baixar' ? (baixar = +args[++i]) : args[i] === '--midia' ? (midia = args[++i]) : args[i] === '--contar' ? (contar = true) : buscas.push(args[i]);
mkdirSync(pasta, { recursive: true });
const MESES = { jan:0, fev:1, mar:2, abr:3, mai:4, jun:5, jul:6, ago:7, set:8, out:9, nov:10, dez:11 };
const hoje = new Date();

const b = await chromium.launch();
const pg = await b.newPage({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR' });
const todos = new Map();
for (const q of buscas) {
  const url = q.startsWith('http') ? q : `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=${encodeURIComponent(q)}&search_type=keyword_unordered&media_type=${midia}`;
  await pg.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await pg.waitForTimeout(8000);
  if (contar) { const t = await pg.evaluate(() => document.body.innerText); const m = t.match(/~?\s*([\d.,]+)\s*(mil\s*)?resultados?/i); console.log(`${q}\t${m ? m[1] + (m[2] ? ' mil' : '') : '0'}`); continue; }
  for (let i = 0; i < 10; i++) { await pg.mouse.wheel(0, 4000); await pg.waitForTimeout(1500); }
  const cards = await pg.evaluate(() => {
    const ids = [...document.querySelectorAll('span, div')].filter(e => e.children.length === 0 && /Identificação da biblioteca: \d+/.test(e.textContent));
    const out = [];
    for (const leaf of ids) {
      let el = leaf;
      while (el.parentElement && (el.parentElement.innerText.match(/Identificação da biblioteca/g) || []).length === 1) el = el.parentElement;
      const v = el.querySelector('video');
      const links = [...el.querySelectorAll('a')].map(a => a.href).filter(h => /l\.facebook\.com|^https?:\/\/(?!www\.facebook\.com\/ads)/.test(h));
      const pagina = [...el.querySelectorAll('a')].map(a => a.href).find(h => /facebook\.com\/(?!ads|l\.php)[^/?]+\/?$/.test(h));
      out.push({ texto: el.innerText, video: v?.src || '', poster: v?.poster || '', links, pagina });
    }
    return out;
  });
  for (const c of cards) {
    const id = c.texto.match(/Identificação da biblioteca: (\d+)/)?.[1]; if (!id || todos.has(id)) continue;
    const m = c.texto.match(/Veiculação iniciada em (\d+) de (\w{3})\w* de (\d{4})/);
    const inicio = m ? new Date(+m[3], MESES[m[2].toLowerCase()], +m[1]) : null;
    const dias = inicio ? Math.round((hoje - inicio) / 864e5) : null;
    const versoes = +(c.texto.match(/(\d+) anúncios usam/)?.[1] || 1);
    const linhas = c.texto.split('\n').map(s => s.trim()).filter(Boolean);
    const iPat = linhas.indexOf('Patrocinado');
    const anunciante = iPat > 0 ? linhas[iPat - 1] : '';
    const corpo = iPat >= 0 ? linhas.slice(iPat + 1).join(' ').replace(/Estamos com problemas.*$/, '').slice(0, 1200) : '';
    let destino = c.links.find(h => /l\.facebook\.com/.test(h)) || c.links[0] || '';
    try { if (/l\.facebook\.com/.test(destino)) destino = new URL(destino).searchParams.get('u') || destino; } catch {}
    todos.set(id, { id, posicao: todos.size + 1, busca: q, anunciante, dias, versoes, score: (dias || 0) * versoes, inicio: inicio?.toISOString().slice(0, 10), corpo, destino, video: c.video, link: `https://www.facebook.com/ads/library/?id=${id}` });
  }
  console.error(`"${q}": ${cards.length} cards, total único ${todos.size}`);
}
const porPagina = buscas.some((q) => /sort_data|view_all_page_id/.test(q));
const lista = [...todos.values()].sort((a, b) => porPagina ? a.posicao - b.posicao : b.score - a.score).slice(0, n);
for (const [i, a] of lista.entries()) {
  if (i < baixar && a.video) {
    try { const r = await pg.request.get(a.video); if (r.ok()) { a.arquivo = `${String(i + 1).padStart(2, '0')}-${a.id}.mp4`; writeFileSync(path.join(pasta, a.arquivo), await r.body()); } } catch {}
  }
  console.log(`${i + 1}. ${a.anunciante} | ${a.dias} dias × ${a.versoes} versões = ${a.score} | ${a.destino.slice(0, 60)} | ${a.corpo.slice(0, 110)}`);
}
writeFileSync(path.join(pasta, 'anuncios.json'), JSON.stringify({ data: hoje.toISOString().slice(0, 10), criterio: 'dias no ar × versões (indicador indireto, não métrica)', buscas, itens: lista }, null, 1));
await b.close();
