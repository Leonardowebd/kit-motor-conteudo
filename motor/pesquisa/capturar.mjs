// Captura de material oficial do assunto do vídeo (agente pesquisador).
// Para cada página oficial: print em desktop (1440x900, escala 2x; celular só com CAPTURAR_CELULAR=1), imagem de destaque
// (og:image), ícone/logo do site e a lista de vídeos diretos (mp4/webm) da página. Tudo vai para
// <pastaAtivos>/manifesto.json com fonte, crédito e data — crédito é obrigatório no vídeo (regra MARCA).
// Vídeo de YouTube/X: baixado com yt-dlp quando instalado (~/.local/bin/yt-dlp ou no PATH); senão fica listado como pendente.
//
// Uso: node motor/pesquisa/capturar.mjs <pastaAtivos> <credito> <url> [url ...]
//      node motor/pesquisa/capturar.mjs <pastaAtivos> <credito> --video <url-youtube-ou-x> [--inicio 00:01:10 --fim 00:01:25]
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const exec = promisify(execFile);
const slug = (u) => new URL(u).hostname.replace(/^www\./, '') + new URL(u).pathname.replace(/[^a-z0-9]+/gi, '-').replace(/-+$/, '');
const hoje = () => new Date().toISOString().slice(0, 10);

async function lerManifesto(pasta) {
  const f = path.join(pasta, 'manifesto.json');
  return existsSync(f) ? JSON.parse(await readFile(f, 'utf8')) : { itens: [] };
}
async function gravarManifesto(pasta, m) { await writeFile(path.join(pasta, 'manifesto.json'), JSON.stringify(m, null, 2)); }

async function baixar(url, destino) {
  const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!r.ok) throw new Error(`HTTP ${r.status} em ${url}`);
  await writeFile(destino, Buffer.from(await r.arrayBuffer()));
  return destino;
}

// Prints + og:image + ícone + vídeos diretos de uma página oficial.
export async function capturarPagina(url, pasta, credito) {
  await mkdir(pasta, { recursive: true });
  const base = slug(url), itens = [];
  const b = await chromium.launch();
  try {
    // Regra do criador (2026-11-03): telas de site SEMPRE em desktop (mostra mais, não corta no layout dividido, mantém a qualidade).
  // Celular só com CAPTURAR_CELULAR=1 (ex.: quando o assunto é o app mobile em si).
  const formatos = [['desktop', { width: 1440, height: 900 }, 2]];
  if (process.env.CAPTURAR_CELULAR === '1') formatos.push(['celular', { width: 430, height: 764 }, 2.5]);
  for (const [nome, viewport, escala] of formatos) {
      const pg = await b.newPage({ viewport, deviceScaleFactor: escala, userAgent: nome === 'celular' ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile Safari/604.1' : undefined });
      await pg.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => pg.waitForTimeout(3000));
      await pg.waitForTimeout(1500);
      // esconde avisos de cookies/consentimento fixos na tela (não aceita nada: só tira da frente do print)
      await pg.evaluate(() => { for (const el of document.querySelectorAll('body *')) { const cs = getComputedStyle(el); if ((cs.position === 'fixed' || cs.position === 'sticky') && /cookie|consent|privacidade|privacy/i.test(el.innerText || '') && el.getBoundingClientRect().height > 80) el.style.display = 'none'; } });
      await pg.waitForTimeout(300);
      const arquivo = path.join(pasta, `${base}-print-${nome}.png`);
      await pg.screenshot({ path: arquivo });
      itens.push({ tipo: 'print', formato: nome, arquivo: path.basename(arquivo), fonte: url, credito, data: hoje() });
      if (nome === 'desktop') {
        const meta = await pg.evaluate(() => ({
          og: document.querySelector('meta[property="og:image"]')?.content,
          titulo: document.querySelector('meta[property="og:title"]')?.content || document.title,
          icone: [...document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]')].map((l) => l.href).pop(),
          videos: [...new Set([...document.querySelectorAll('video[src], video source[src]')].map((v) => v.src).filter((s) => /^https?:/.test(s)))],
        }));
        for (const [tipo, u] of [['destaque', meta.og], ['icone', meta.icone]]) {
          if (!u) continue;
          const ext = (new URL(u).pathname.match(/\.(png|jpe?g|webp|svg|gif)$/i)?.[0]) || '.png';
          try { const f = await baixar(u, path.join(pasta, `${base}-${tipo}${ext}`)); itens.push({ tipo, arquivo: path.basename(f), fonte: u, pagina: url, credito, data: hoje() }); } catch { /* sem a imagem, segue */ }
        }
        for (const [i, v] of meta.videos.slice(0, 5).entries()) {
          try { const f = await baixar(v, path.join(pasta, `${base}-video-${i + 1}${path.extname(new URL(v).pathname) || '.mp4'}`)); itens.push({ tipo: 'video', arquivo: path.basename(f), fonte: v, pagina: url, credito, data: hoje() }); } catch { itens.push({ tipo: 'video-pendente', fonte: v, pagina: url, credito }); }
        }
        itens.push({ tipo: 'pagina', titulo: meta.titulo, fonte: url, credito, data: hoje() });
      }
      await pg.close();
    }
  } finally { await b.close(); }
  return itens;
}

// Vídeo oficial de YouTube/X: trecho opcional (--inicio/--fim) com yt-dlp, se estiver instalado.
export async function capturarVideo(url, pasta, credito, { inicio, fim } = {}) {
  await mkdir(pasta, { recursive: true });
  const bin = [path.join(homedir(), '.local', 'bin', 'yt-dlp'), 'yt-dlp'].find((b) => b.includes('/') ? existsSync(b) : true);
  const saida = path.join(pasta, `${slug(url)}-oficial.%(ext)s`);
  const args = ['-q', '--no-warnings', '-f', 'bv*[height<=1920]+ba/b', '--merge-output-format', 'mp4', '-o', saida];
  if (inicio && fim) args.push('--download-sections', `*${inicio}-${fim}`);
  try {
    await exec(bin, [...args, url], { timeout: 10 * 60 * 1000 });
    return [{ tipo: 'video', arquivo: path.basename(saida.replace('%(ext)s', 'mp4')), fonte: url, trecho: inicio && fim ? `${inicio}-${fim}` : 'inteiro', credito, data: hoje() }];
  } catch (e) {
    return [{ tipo: 'video-pendente', fonte: url, credito, motivo: /ENOENT/.test(e.message) ? 'yt-dlp não instalado' : e.message.split('\n')[0].slice(0, 200) }];
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const [pasta, credito] = args;
  const op = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
  const m = await lerManifesto(pasta);
  let novos = [];
  if (args.includes('--video')) novos = await capturarVideo(op('--video'), pasta, credito, { inicio: op('--inicio'), fim: op('--fim') });
  else for (const u of args.slice(2)) novos.push(...(await capturarPagina(u, pasta, credito)));
  m.itens.push(...novos);
  await gravarManifesto(pasta, m);
  console.log(novos.map((x) => `${x.tipo}${x.formato ? '/' + x.formato : ''}: ${x.arquivo || x.fonte}${x.motivo ? ' (' + x.motivo + ')' : ''}`).join('\n'));
}
