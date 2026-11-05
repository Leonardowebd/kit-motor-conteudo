// Editor interno de vídeo (Formato A): ajustar inserts, trocar imagem/vídeo, textos e tempos, e renderizar.
// Uso: node motor/editor/servidor.mjs [--porta 4317]   → abre http://127.0.0.1:4317
// Edita o plano de cada vídeo (<acervo>/Conteudo/Videos/Producao/<id>/plano-a.json); a prévia ao vivo usa a mesma
// página de overlay do render (paginaFormatoA) sobre o corte com voz (Finais/<id>.mp4). Só escuta em 127.0.0.1.
import http from 'node:http';
import { spawn } from 'node:child_process';
import { createReadStream, existsSync } from 'node:fs';
import { readFile, writeFile, readdir, stat, mkdir, rename, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolverPlano, paginaFormatoA, trechos } from '../render/formato-a.mjs';
import { TELAS } from '../render/visual.mjs';
import { TELAS_EXTRA } from '../render/telas-extra.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '../..');
const ACERVO = path.resolve(JSON.parse(await readFile(path.join(RAIZ, 'conteudo.config.json'), 'utf8')).acervo);
const V = path.join(ACERVO, 'Conteudo', 'Videos');
const ATIVOS = path.join(V, 'Ativos do Assunto');
const args = process.argv.slice(2);
const PORTA = Number(args[args.indexOf('--porta') + 1]) || 4317;

const TIPOS_MIDIA = { '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf' };
const ENVIO_OK = new Set(['.mp4', '.mov', '.webm', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif']);
const MIDIA = /\.(png|jpe?g|webp|svg|gif|mp4|mov|webm)$/i;

const caminhos = (id) => ({
  plano: path.join(V, 'Producao', id, 'plano-a.json'),
  corte: path.join(V, 'Finais', `${id}.mp4`),
  timeline: path.join(V, 'Finais', `${id}.timeline.json`),
  aprovado: path.join(V, 'Aprovados', `${id}.mp4`),
  previa: path.join(V, 'Previas', `${id}-editor.mp4`),
});
const idValido = (id) => /^[\w.-]+$/.test(id);
const dentroDoAcervo = (p) => { const r = path.resolve(p); return r === ACERVO || r.startsWith(ACERVO + path.sep); };
const urlArquivo = (abs) => `/arquivo?p=${encodeURIComponent(abs)}`;
const lerJson = async (p) => JSON.parse(await readFile(p, 'utf8'));

// src relativo ao plano.json → absoluto; e o inverso para gravar no plano
const absDoSrc = (id, src) => (src.startsWith('file://') ? fileURLToPath(src) : path.resolve(path.dirname(caminhos(id).plano), src));
const srcDoAbs = (id, abs) => path.relative(path.dirname(caminhos(id).plano), abs).split(path.sep).join('/');

// cópia do plano com toda mídia relativa trocada por URL do servidor (para a prévia no navegador)
function paraNavegador(id, o) {
  if (Array.isArray(o)) return o.map((x) => paraNavegador(id, x));
  if (o && typeof o === 'object') return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, paraNavegador(id, v)]));
  if (typeof o === 'string' && MIDIA.test(o) && !o.includes('://')) return urlArquivo(absDoSrc(id, o));
  return o;
}

async function listarVideos() {
  const ids = (await readdir(path.join(V, 'Producao'), { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  const out = [];
  for (const id of ids) {
    const c = caminhos(id);
    if (existsSync(c.plano) && existsSync(c.timeline) && existsSync(c.corte)) out.push({ id, aprovado: existsSync(c.aprovado) });
  }
  return out;
}

async function midiasDe(id, plano) {
  const pastas = new Set([path.join(ATIVOS, id)]);
  JSON.stringify(plano).replace(/"([^"]+\.(?:png|jpe?g|webp|svg|gif|mp4|mov|webm))"/gi, (_, s) => { if (!s.includes('://')) pastas.add(path.dirname(absDoSrc(id, s))); return _; });
  const out = [];
  for (const p of pastas) {
    if (!dentroDoAcervo(p) || !existsSync(p)) continue;
    for (const f of (await readdir(p)).sort()) if (MIDIA.test(f)) { const abs = path.join(p, f); out.push({ src: srcDoAbs(id, abs), url: urlArquivo(abs), nome: f, pasta: path.basename(p), video: /\.(mp4|mov|webm)$/i.test(f) }); }
  }
  return out;
}

async function dadosDoVideo(id) {
  const c = caminhos(id);
  const plano = await lerJson(c.plano);
  const tl = await lerJson(c.timeline);
  return {
    id, plano, palavras: tl.saida.palavras, duracao: tl.saida.duracao,
    corte: urlArquivo(c.corte), aprovado: existsSync(c.aprovado) ? urlArquivo(c.aprovado) : null,
    previa: existsSync(c.previa) ? urlArquivo(c.previa) : null,
    midias: await midiasDe(id, plano), tipos: [...Object.keys(TELAS), ...Object.keys(TELAS_EXTRA)].sort(),
  };
}

// página da prévia ao vivo: a mesma do render, com mídia e fontes servidas por aqui e fundo transparente
async function pagina(id, plano) {
  const tl = await lerJson(caminhos(id).timeline);
  const { palavras, duracao } = tl.saida;
  const eventos = resolverPlano(paraNavegador(id, plano), palavras, duracao);
  let html = paginaFormatoA({ palavras, destaques: plano.destaques, eventos, trs: trechos(tl), tema: plano.tema });
  html = html.replace(/file:\/\/[^"')\s]+/g, (u) => { try { const abs = fileURLToPath(u); return dentroDoAcervo(abs) ? urlArquivo(abs) : u; } catch { return u; } })
    .replace('</head>', '<style>html,body{background:transparent!important;overflow:hidden}</style></head>');
  return { html, eventos: eventos.inserts.map((x) => ({ ini: x.ini, fim: x.fim, tipo: x.tipo, dividido: !!x.dividido, recorte: !!x.recorte, src: x.props?.src ?? null })) };
}

// ---------- render (um por vez: Mac de 8 GB) ----------
let trabalho = null; // { id, modo, inicio, fim, ok, log: [] }
function renderizar(id, modo) {
  if (trabalho && !trabalho.fim) throw new Error(`já tem um render rodando (${trabalho.id})`);
  const c = caminhos(id);
  const final = modo === 'final';
  const pastaR = path.join(V, 'Producao', id, 'render');
  const saida = final ? path.join(pastaR, `${id}.mp4`) : c.previa;
  trabalho = { id, modo, inicio: Date.now(), fim: null, ok: null, log: [], saida: null };
  const t = trabalho;
  const anota = (s) => { t.log.push(...String(s).split('\n').filter(Boolean)); t.log = t.log.slice(-40); };
  mkdir(pastaR, { recursive: true }).then(() => {
    const p = spawn(process.execPath, [path.join(RAIZ, 'motor/render/formato-a.mjs'), c.corte, c.timeline, c.plano, saida, ...(final ? ['--final'] : [])], { cwd: RAIZ });
    p.stdout.on('data', anota); p.stderr.on('data', anota);
    p.on('close', async (code) => {
      try {
        if (code !== 0) throw new Error(`render saiu com código ${code}`);
        if (final) {
          // a versão aprovada anterior não se perde: vai para Aprovados/versoes-anteriores/
          if (existsSync(c.aprovado)) {
            const ant = path.join(V, 'Aprovados', 'versoes-anteriores'); await mkdir(ant, { recursive: true });
            await rename(c.aprovado, path.join(ant, `${id}-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.mp4`));
          }
          const semMusica = saida.replace(/\.mp4$/, '-sem-musica.mp4');
          await copyFile(existsSync(semMusica) ? semMusica : saida, c.aprovado);
          t.saida = urlArquivo(c.aprovado);
        } else t.saida = urlArquivo(saida);
        t.ok = true;
      } catch (e) { t.ok = false; anota(e.message); }
      t.fim = Date.now();
    });
  }).catch((e) => { t.ok = false; t.fim = Date.now(); anota(e.message); });
}

// ---------- HTTP ----------
const corpo = (req, limite = 600 * 1024 * 1024) => new Promise((ok, erro) => {
  const partes = []; let n = 0;
  req.on('data', (d) => { n += d.length; if (n > limite) { erro(new Error('arquivo grande demais')); req.destroy(); } else partes.push(d); });
  req.on('end', () => ok(Buffer.concat(partes))); req.on('error', erro);
});
const json = (res, codigo, dados) => { res.writeHead(codigo, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(dados)); };

async function servirArquivo(req, res, abs) {
  if (!dentroDoAcervo(abs) || !existsSync(abs)) return json(res, 404, { erro: 'arquivo fora do acervo ou inexistente' });
  const { size } = await stat(abs);
  const tipo = TIPOS_MIDIA[path.extname(abs).toLowerCase()] || 'application/octet-stream';
  const faixa = req.headers.range?.match(/bytes=(\d*)-(\d*)/);
  if (faixa) { // vídeo precisa de Range para o player conseguir pular no tempo
    const ini = faixa[1] ? Number(faixa[1]) : 0, fim = faixa[2] ? Math.min(Number(faixa[2]), size - 1) : size - 1;
    res.writeHead(206, { 'content-type': tipo, 'content-range': `bytes ${ini}-${fim}/${size}`, 'accept-ranges': 'bytes', 'content-length': fim - ini + 1, 'cache-control': 'no-cache' });
    return createReadStream(abs, { start: ini, end: fim }).pipe(res);
  }
  res.writeHead(200, { 'content-type': tipo, 'content-length': size, 'accept-ranges': 'bytes', 'cache-control': 'no-cache' });
  createReadStream(abs).pipe(res);
}

const servidor = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, 'http://x');
    const m = u.pathname.match(/^\/api\/video\/([^/]+)(?:\/(\w+))?$/);
    if (req.method === 'GET' && u.pathname === '/') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(await readFile(path.join(AQUI, 'index.html'))); }
    if (req.method === 'GET' && u.pathname === '/arquivo') return servirArquivo(req, res, path.resolve(u.searchParams.get('p') || ''));
    if (req.method === 'GET' && u.pathname === '/api/videos') return json(res, 200, await listarVideos());
    if (req.method === 'GET' && u.pathname === '/api/render') return json(res, 200, trabalho);
    if (m) {
      const [, id, acao] = m;
      if (!idValido(id) || !existsSync(caminhos(id).plano)) return json(res, 404, { erro: 'vídeo não encontrado' });
      if (req.method === 'GET' && !acao) return json(res, 200, await dadosDoVideo(id));
      if (req.method === 'POST' && acao === 'pagina') return json(res, 200, await pagina(id, JSON.parse(await corpo(req))));
      if (req.method === 'POST' && acao === 'plano') {
        const plano = JSON.parse(await corpo(req));
        const tl = await lerJson(caminhos(id).timeline);
        resolverPlano(plano, tl.saida.palavras, tl.saida.duracao); // palavra-âncora inexistente → erro, nada é gravado
        const c = caminhos(id), hist = path.join(path.dirname(c.plano), 'historico');
        await mkdir(hist, { recursive: true });
        await copyFile(c.plano, path.join(hist, `plano-a-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`));
        await writeFile(c.plano, JSON.stringify(plano, null, 2));
        return json(res, 200, { ok: true });
      }
      if (req.method === 'POST' && acao === 'midia') {
        const nome = path.basename(decodeURIComponent(req.headers['x-nome'] || '')).normalize('NFC').replace(/[^\w.\- ]+/g, '-');
        if (!ENVIO_OK.has(path.extname(nome).toLowerCase())) return json(res, 400, { erro: 'tipo de arquivo não aceito (imagem ou vídeo)' });
        const pasta = path.join(ATIVOS, id); await mkdir(pasta, { recursive: true });
        let destino = path.join(pasta, nome);
        for (let k = 2; existsSync(destino); k++) destino = path.join(pasta, nome.replace(/(\.\w+)$/, `-${k}$1`));
        await writeFile(destino, await corpo(req));
        return json(res, 200, { src: srcDoAbs(id, destino), url: urlArquivo(destino), nome: path.basename(destino) });
      }
      if (req.method === 'POST' && acao === 'render') { const { modo } = JSON.parse(await corpo(req)); renderizar(id, modo === 'final' ? 'final' : 'previa'); return json(res, 200, trabalho); }
    }
    json(res, 404, { erro: 'rota não encontrada' });
  } catch (e) { json(res, 400, { erro: e.message }); }
});

servidor.listen(PORTA, '127.0.0.1', () => console.log(`Editor aberto em http://127.0.0.1:${PORTA}`));
