// Engenharia reversa de vídeo curto: extrai os dados que o agente `engenheiro-reverso` lê antes de desconstruir.
// Uso: node motor/pesquisa/desconstruir.mjs <video> [--saida <pasta>] [--idioma pt|en|auto] [--sem-fala]
// Saída (padrão: <acervo>/Conteudo/Videos/Engenharia Reversa/<nome>/):
//   dados.md      resumo + decupagem plano a plano com a fala de cada plano (o que o agente lê primeiro)
//   dados.json    o mesmo em dados brutos (palavras com tempo, cortes, áudio)
//   prancha-N.jpg quadro a cada 0,5 s (vídeo ≤ 45 s) ou 1 s, com o tempo no canto, 8×6 por prancha
//   planos-N.jpg  um quadro do meio de cada plano, numerado (#plano e início)
// Detector de corte: pontuação de cena por quadro; corte = pico local forte. Em layout dividido (card em cima,
// rosto embaixo) a troca muda só metade do quadro: por isso o limiar relativo, e a prancha é a verdade final.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, writeFile, readFile, rm, readdir } from 'node:fs/promises';
import { basename, extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';
import ffprobe from '@ffprobe-installer/ffprobe';

const exec = promisify(execFile);
const FONTE = '/System/Library/Fonts/Supplemental/Arial Bold.ttf';
const COLS = 8, LINHAS = 6;

// ---------- funções puras (testadas em desconstruir.test.mjs) ----------

// scores: [{t, s}] por quadro → tempos de corte. Corte = s ≥ 0,3, ou pico local ≥ 0,1 e ≥ 4× a mediana ao redor.
// Cortes a menos de 0,25 s um do outro viram um só (transição de 2–3 quadros).
export function detectarCortes(scores, { forte = 0.3, fraco = 0.1, relativo = 4, janela = 15, fundir = 0.25 } = {}) {
  const cortes = [];
  for (let i = 1; i < scores.length; i++) {
    const { t, s } = scores[i];
    if (s < fraco) continue;
    const viz = scores.slice(Math.max(0, i - janela), i + janela + 1).filter((_, k) => k !== Math.min(i, janela)).map((x) => x.s).sort((a, b) => a - b);
    const mediana = viz.length ? viz[Math.floor(viz.length / 2)] : 0;
    const pico = s >= (scores[i - 1]?.s ?? 0) && s >= (scores[i + 1]?.s ?? 0);
    if (s >= forte || (pico && s >= relativo * Math.max(mediana, 0.005))) {
      if (cortes.length && t - cortes.at(-1).t < fundir) { if (s > cortes.at(-1).s) cortes[cortes.length - 1] = { t, s }; }
      else cortes.push({ t, s });
    }
  }
  return cortes.map((c) => +c.t.toFixed(3));
}

// cortes + duração → planos [{n, ini, fim, dur}]
export function planos(cortes, duracao) {
  const marcos = [0, ...cortes.filter((t) => t > 0.05 && t < duracao - 0.05), duracao];
  return marcos.slice(0, -1).map((ini, i) => ({ n: i + 1, ini: +ini.toFixed(2), fim: +marcos[i + 1].toFixed(2), dur: +(marcos[i + 1] - ini).toFixed(2) }));
}

const mediana = (xs) => { const o = [...xs].sort((a, b) => a - b); return o.length ? (o.length % 2 ? o[(o.length - 1) / 2] : (o[o.length / 2 - 1] + o[o.length / 2]) / 2) : 0; };

// palavras [{texto, ini, fim}] → frases (pontuação final ou pausa > 0,6 s)
export function frases(palavras, { pausa = 0.6 } = {}) {
  const out = []; let cur = [];
  palavras.forEach((p, i) => {
    cur.push(p);
    const prox = palavras[i + 1];
    if (!prox || /[.?!…]$/.test(p.texto) || prox.ini - p.fim > pausa) {
      out.push({ ini: cur[0].ini, fim: cur.at(-1).fim, texto: cur.map((x) => x.texto).join(' ') }); cur = [];
    }
  });
  return out;
}

// fala de cada plano (palavra entra no plano onde está o seu meio)
export function falaPorPlano(ps, palavras) {
  return ps.map((p) => ({ ...p, fala: palavras.filter((w) => { const m = (w.ini + w.fim) / 2; return m >= p.ini && m < p.fim; }).map((w) => w.texto).join(' ') }));
}

// pausas da fala ≥ minimo s (inclui antes da 1ª e depois da última palavra)
export function pausasDaFala(palavras, duracao, minimo = 0.4) {
  const marcos = [{ fim: 0 }, ...palavras, { ini: duracao }];
  const out = [];
  for (let i = 0; i < marcos.length - 1; i++) { const a = marcos[i].fim, b = marcos[i + 1].ini; if (b - a >= minimo) out.push([a, b]); }
  return out;
}

const sobreposicao = (a, bs) => bs.reduce((s, b) => s + Math.max(0, Math.min(a[1], b[1]) - Math.max(a[0], b[0])), 0);

export function resumo({ duracao, ps, palavras, silencios, temAudio = true }) {
  const durs = ps.map((p) => p.dur);
  const pausas = pausasDaFala(palavras, duracao);
  const tPausas = pausas.reduce((s, [a, b]) => s + b - a, 0);
  const tSilencio = pausas.reduce((s, p) => s + sobreposicao(p, silencios), 0);
  const fs = frases(palavras);
  return {
    planos: ps.length,
    trocasPorMin: +(Math.max(0, ps.length - 1) / duracao * 60).toFixed(1),
    planoMedio: +(duracao / ps.length).toFixed(2),
    planoMediano: +mediana(durs).toFixed(2),
    primeiroCorte: ps.length > 1 ? ps[1].ini : null,
    palavras: palavras.length,
    palavrasPorMin: palavras.length ? +(palavras.length / duracao * 60).toFixed(0) : 0,
    primeiraPalavra: palavras[0]?.ini ?? null,
    coberturaFala: +(palavras.reduce((s, w) => s + w.fim - w.ini, 0) / duracao).toFixed(2),
    // pausa da fala que não é silêncio no áudio = música/efeito por baixo
    fundoNasPausas: temAudio && tPausas > 0.5 ? +(1 - tSilencio / tPausas).toFixed(2) : null,
    gancho3s: palavras.filter((w) => w.ini < 3).map((w) => w.texto).join(' '),
    primeiraFrase: fs[0]?.texto ?? '',
    frasesMedia: fs.length ? +(palavras.length / fs.length).toFixed(1) : 0,
  };
}

// ---------- extração (ffmpeg) ----------

async function sondar(video) {
  const { stdout } = await exec(ffprobe.path, ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height,r_frame_rate,channels', '-of', 'json', video]);
  const j = JSON.parse(stdout);
  const v = j.streams.find((s) => s.codec_type === 'video'), a = j.streams.find((s) => s.codec_type === 'audio');
  const [n, d] = v.r_frame_rate.split('/').map(Number);
  return { duracao: +Number(j.format.duration).toFixed(2), largura: v.width, altura: v.height, fps: +(n / d).toFixed(2), audio: a ? a.channels : 0 };
}

async function pontuacoes(video) {
  const { stderr } = await exec(ffmpeg, ['-hide_banner', '-threads', '2', '-i', video, '-an', '-vf', "scale=320:-2,select='gte(scene,0)',metadata=print", '-f', 'null', '-'], { maxBuffer: 256 * 1024 * 1024 });
  const out = []; let t = null;
  for (const l of stderr.split('\n')) {
    const mt = l.match(/pts_time:([\d.]+)/); if (mt) t = Number(mt[1]);
    const ms = l.match(/lavfi\.scene_score=([\d.]+)/); if (ms && t != null) out.push({ t, s: Number(ms[1]) });
  }
  return out;
}

async function audio(video, temAudio) {
  if (!temAudio) return { lufs: null, silencios: [] };
  const { stderr } = await exec(ffmpeg, ['-hide_banner', '-nostats', '-i', video, '-vn', '-af', 'ebur128,silencedetect=n=-40dB:d=0.3', '-f', 'null', '-'], { maxBuffer: 64 * 1024 * 1024 });
  const lufs = Number(stderr.match(/I:\s+(-?[\d.]+) LUFS/g)?.at(-1)?.match(/-?[\d.]+/)[0] ?? NaN);
  const silencios = []; let ini = null;
  for (const l of stderr.split('\n')) {
    const a = l.match(/silence_start: (-?[\d.]+)/); if (a) ini = Math.max(0, Number(a[1]));
    const b = l.match(/silence_end: ([\d.]+)/); if (b && ini != null) { silencios.push([ini, Number(b[1])]); ini = null; }
  }
  return { lufs: Number.isFinite(lufs) ? lufs : null, silencios };
}

const rotulo = (txt) => `drawtext=fontfile='${FONTE}':text='${txt}':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=5`;

async function gerarPranchas(video, pasta, passo, duracao) {
  const linhas = Math.min(LINHAS, Math.ceil(Math.ceil(duracao / passo) / COLS)); // vídeo curto: sem linhas vazias
  await exec(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-threads', '2', '-i', video, '-an', '-vf',
    `fps=1/${passo},scale=240:-2,${rotulo('%{pts\\:hms}')},tile=${COLS}x${linhas}:padding=4:color=white`, '-fps_mode', 'vfr', '-q:v', '4', join(pasta, 'prancha-%d.jpg')]);
}

async function gerarPlanos(video, pasta, ps) {
  const linhas = Math.min(LINHAS, Math.ceil(ps.length / COLS));
  const tmp = join(pasta, '.planos'); await mkdir(tmp, { recursive: true });
  const um = (p) => exec(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(((p.ini + p.fim) / 2).toFixed(2)), '-i', video, '-frames:v', '1', '-an',
    '-vf', `scale=240:-2,${rotulo(`#${p.n}  ${p.ini.toFixed(1)}s`)}`, '-q:v', '4', join(tmp, `p-${String(p.n).padStart(4, '0')}.jpg`)]);
  for (let i = 0; i < ps.length; i += 4) await Promise.all(ps.slice(i, i + 4).map(um));
  await exec(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', '1', '-pattern_type', 'glob', '-i', join(tmp, 'p-*.jpg'),
    '-vf', `tile=${COLS}x${linhas}:padding=4:color=white`, '-fps_mode', 'vfr', '-q:v', '4', join(pasta, 'planos-%d.jpg')]);
  await rm(tmp, { recursive: true, force: true });
}

const fmt = (t) => (t == null ? '—' : `${t.toFixed(1)}s`);

function markdown({ nome, video, meta, r, ps, fs, aud, passo, pranchas, folhasPlanos, idioma }) {
  const L = [];
  L.push(`# Dados — ${nome}`, '', `Fonte: \`${video}\``, `Gerado: ${new Date().toISOString().slice(0, 10)} por \`motor/pesquisa/desconstruir.mjs\` (idioma: ${idioma}).`, '');
  L.push('## Ficha técnica', '| Item | Valor |', '|---|---|',
    `| Duração | ${meta.duracao} s |`, `| Quadro | ${meta.largura}×${meta.altura}, ${meta.fps} fps |`,
    `| Planos (detector) | ${r.planos} — ${r.trocasPorMin} trocas/min; plano médio ${r.planoMedio} s, mediano ${r.planoMediano} s |`,
    `| 1º corte | ${fmt(r.primeiroCorte)} |`,
    `| Fala | ${r.palavras} palavras, ${r.palavrasPorMin}/min; 1ª palavra em ${fmt(r.primeiraPalavra)}; fala cobre ${Math.round(r.coberturaFala * 100)}% do tempo; ${r.frasesMedia} palavras/frase |`,
    `| Áudio | ${meta.audio ? `${meta.audio} canal(is), ${aud.lufs ?? '?'} LUFS` : 'sem áudio'}; fundo sonoro nas pausas da fala: ${r.fundoNasPausas == null ? '—' : `${Math.round(r.fundoNasPausas * 100)}%`} |`,
    `| Gancho (fala até 3 s) | ${r.gancho3s || '— (sem fala)'} |`, '');
  L.push('## Imagens para ler', `- Pranchas (1 quadro a cada ${passo} s, tempo no canto): ${pranchas.map((p) => `\`${p}\``).join(', ')}`,
    `- Planos (1 quadro por plano, #n e início): ${folhasPlanos.map((p) => `\`${p}\``).join(', ')}`,
    '- O detector erra em layout dividido e em zoom/movimento contínuo: confirme na prancha.', '');
  L.push('## Roteiro (frases com tempo)', ...(fs.length ? fs.map((f) => `- ${fmt(f.ini)}–${fmt(f.fim)} ${f.texto}`) : ['— sem fala detectada']), '');
  L.push('## Decupagem por plano', '| # | Início | Dur | Fala no plano |', '|---|---|---|---|', ...ps.map((p) => `| ${p.n} | ${p.ini.toFixed(2)} | ${p.dur.toFixed(2)} | ${p.fala.replace(/\|/g, '/') || '—'} |`), '');
  return L.join('\n');
}

export async function desconstruir(video, { saida, idioma = 'auto', semFala = false } = {}) {
  const nome = basename(video, extname(video));
  if (!saida) {
    const cfg = JSON.parse(await readFile(new URL('../../conteudo.config.json', import.meta.url), 'utf8'));
    saida = join(cfg.acervo, 'Conteudo', 'Videos', 'Engenharia Reversa', nome);
  }
  await mkdir(saida, { recursive: true });
  for (const f of await readdir(saida)) if (/^(prancha|planos)-\d+\.jpg$/.test(f)) await rm(join(saida, f));
  const meta = await sondar(video);
  const scores = await pontuacoes(video);
  const ps0 = planos(detectarCortes(scores), meta.duracao);
  const aud = await audio(video, meta.audio > 0);
  let palavras = [];
  if (!semFala && meta.audio) {
    const { transcrever } = await import('../video/transcrever.mjs');
    ({ palavras } = await transcrever(video, { idioma: idioma === 'auto' ? '' : idioma }));
  }
  const ps = falaPorPlano(ps0, palavras);
  const r = resumo({ duracao: meta.duracao, ps, palavras, silencios: aud.silencios, temAudio: meta.audio > 0 });
  const passo = meta.duracao <= 45 ? 0.5 : 1;
  await gerarPranchas(video, saida, passo, meta.duracao);
  await gerarPlanos(video, saida, ps);
  const arquivos = (await readdir(saida)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const pranchas = arquivos.filter((f) => f.startsWith('prancha-')), folhasPlanos = arquivos.filter((f) => f.startsWith('planos-'));
  const fs = frases(palavras);
  await writeFile(join(saida, 'dados.json'), JSON.stringify({ video, meta, resumo: r, audio: aud, planos: ps, frases: fs, palavras }, null, 1));
  await writeFile(join(saida, 'dados.md'), markdown({ nome, video, meta, r, ps, fs, aud, passo, pranchas, folhasPlanos, idioma }));
  return { saida, ...r };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try { (await import('node:os')).setPriority(10); } catch {}
  const args = process.argv.slice(2);
  const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
  const video = args.find((a, i) => !a.startsWith('--') && !args[i - 1]?.match(/^--(saida|idioma)$/));
  if (!video) { console.error('uso: node motor/pesquisa/desconstruir.mjs <video> [--saida pasta] [--idioma pt|en|auto] [--sem-fala]'); process.exit(1); }
  const r = await desconstruir(resolve(video), { saida: opt('saida') && resolve(opt('saida')), idioma: opt('idioma') ?? 'auto', semFala: args.includes('--sem-fala') });
  console.log(JSON.stringify(r, null, 1));
}
