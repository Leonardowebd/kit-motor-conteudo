// Montador dos formatos sem RAW (F1 avatar, F2 documentário, F9 explainer, F11 metáfora).
// Uso: node motor/render/cenas.mjs <plano.json> <saida.mp4>
// Plano (caminhos relativos ao plano):
// { "narracao": "f1/narracao.mp3", "palavras": "f1/palavras.json", "musica": "trilha.mp3", "lufsMusica": -24,
//   "cenas": [{ "src": "clipe-1.mp4" | "foto.png", "ini": 0 }],      // cada cena vai até o ini da próxima
//   "fim": 41.6,                                                     // opcional; padrão = fim da narração + 0.6
//   "etiquetas": [{ "texto": "US$ 200/SEMANA", "ini": 6.6, "fim": 9.8 }],
//   "cartelas": [{ "texto": "Vão a Nova York.", "ini": 11.9, "fim": 12.7 }],   // tela vermelha chapada (F2)
//   "frases": [{ "texto": "A PRIMEIRA TELA É A FOTO.", "ini": 12, "fim": 15 }], // tipografia gigante sobre a cena
//   "destaques": ["foto", "200", "400"], "ocultar": [38.12] }        // palavras em limão; palavras a não legendar (ini)
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve, extname } from 'node:path';
import ffmpeg from 'ffmpeg-static';

const exec = promisify(execFile);
const W = 1080, H = 1920, FPS = 30;
const FONTES = '<acervo>';

const planoArq = resolve(process.argv[2]);
const saida = resolve(process.argv[3]);
const base = dirname(planoArq);
const P = JSON.parse(readFileSync(planoArq, 'utf8'));
const em = (p) => resolve(base, p);

const ts = (s) => { const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = (s % 60).toFixed(2).padStart(5, '0'); return `${h}:${String(m).padStart(2, '0')}:${x}`; };
const limpa = (t) => t.replace(/[{}\\]/g, '');
const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[^\p{L}\p{N}]/gu, '');

let palavras = [];
if (P.palavras) { const j = JSON.parse(readFileSync(em(P.palavras), 'utf8')); palavras = j.palavras || j; }
const ocultar = new Set((P.ocultar || []).map((t) => t.toFixed(2)));
// Sob cartela a frase já está escrita: a legenda falada sai.
const cobre = [...(P.cartelas || []), ...(P.frases || [])];
const sobCartela = (t) => cobre.some((c) => t >= c.ini - 0.05 && t < c.fim);
palavras = palavras.filter((w) => !ocultar.has(w.ini.toFixed(2)) && !sobCartela(w.ini));
const destaques = new Set((P.destaques || []).map(norm));
const fim = P.fim ?? (palavras.length ? palavras.at(-1).fim + 0.6 : P.cenas.at(-1).ini + 3);

// Legenda (ASS): 1 palavra por vez no centro-baixo; etiquetas amarelas no topo; cartelas e frases gigantes.
const LIMAO = '&H3DF5D4&', BRANCO = '&HFFFFFF&';
let ass = `[Script Info]\nScriptType: v4.00+\nPlayResX: ${W}\nPlayResY: ${H}\nWrapStyle: 0\n\n[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Fala,Satoshi Black,118,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,7,4,2,60,60,560,1
Style: Etiqueta,Satoshi Black,64,&H00000000,&H00000000,&H0000D7FF,&H0000D7FF,0,0,0,0,100,100,1,0,3,22,0,8,60,60,300,1
Style: Frase,Satoshi Black,128,&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,0,0,0,0,100,100,-2,0,1,8,6,5,70,70,0,1
Style: Cartela,Satoshi Black,150,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,-1,0,1,0,0,5,90,90,0,1

[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
const tapa = '{\\fscx70\\fscy70\\t(0,90,\\fscx100\\fscy100)}';
for (let i = 0; i < palavras.length; i++) {
  const w = palavras[i], prox = palavras[i + 1];
  const ate = Math.min(prox ? prox.ini : w.fim + 0.4, w.fim + 0.5);
  const corte = cobre.find((c) => c.ini > w.ini && c.ini < ate);
  const ateReal = corte ? corte.ini : ate;
  const cor = destaques.has(norm(w.texto)) ? LIMAO : BRANCO;
  ass += `Dialogue: 2,${ts(w.ini)},${ts(Math.max(ateReal, w.ini + 0.12))},Fala,,0,0,0,,${tapa}{\\1c${cor}}${limpa(w.texto.replace(/[.,!?;:]+$/, '').toUpperCase())}\n`;
}
for (const e of P.etiquetas || [])
  ass += `Dialogue: 3,${ts(e.ini)},${ts(e.fim)},Etiqueta,,0,0,0,,{\\fad(80,80)\\frz-2\\fscx60\\fscy60\\t(0,140,\\fscx100\\fscy100)}${limpa(e.texto)}\n`;
for (const f of P.frases || [])
  ass += `Dialogue: 4,${ts(f.ini)},${ts(f.fim)},Frase,,0,0,0,,{\\fad(120,200)\\fscx85\\fscy85\\t(0,400,\\fscx100\\fscy100)}${limpa(f.texto).replace(/\n/g, '\\N')}\n`;
for (const c of P.cartelas || [])
  ass += `Dialogue: 5,${ts(c.ini)},${ts(c.fim)},Cartela,,0,0,0,,{\\an5\\pos(${W / 2},${H / 2})\\fad(60,0)}${limpa(c.texto).replace(/\n/g, '\\N')}\n`;

const tmp = mkdtempSync(join(tmpdir(), 'cenas-'));
try {
  const assArq = join(tmp, 'legenda.ass');
  writeFileSync(assArq, ass);

  // Cada cena: clipe desacelerado para caber no tempo, ou foto com zoom lento (Ken Burns).
  const ent = [], filt = [];
  P.cenas.forEach((c, i) => {
    const dur = (P.cenas[i + 1]?.ini ?? fim) - c.ini;
    const ehFoto = ['.png', '.jpg', '.jpeg', '.webp'].includes(extname(c.src).toLowerCase());
    const cobre = `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}`;
    if (ehFoto) {
      ent.push('-loop', '1', '-t', String(dur), '-i', em(c.src));
      const n = Math.ceil(dur * FPS), z0 = c.zoom?.[0] ?? 1.0, z1 = c.zoom?.[1] ?? 1.12;
      // Zoom calculado em 2x e reduzido no fim: sem tremido.
      filt.push(`[${i}:v]scale=${W * 2}:${H * 2}:force_original_aspect_ratio=increase,crop=${W * 2}:${H * 2},` +
        `zoompan=z='${z0}+(${z1 - z0})*on/${n}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=${n}:s=${W * 2}x${H * 2}:fps=${FPS},` +
        `scale=${W}:${H},setsar=1,trim=duration=${dur},setpts=PTS-STARTPTS[v${i}]`);
    } else {
      ent.push('-i', em(c.src));
      const orig = c.dur ?? 4, fator = Math.max(dur / orig, 1);
      filt.push(`[${i}:v]${cobre},setpts=${fator.toFixed(4)}*(PTS-STARTPTS),fps=${FPS},tpad=stop_mode=clone:stop_duration=${dur},trim=duration=${dur},setpts=PTS-STARTPTS,setsar=1[v${i}]`);
    }
  });
  const nV = P.cenas.length;
  const cartelasV = (P.cartelas || []).map((c) => `between(t,${c.ini},${c.fim})`).join('+');
  let video = `${P.cenas.map((_, i) => `[v${i}]`).join('')}concat=n=${nV}:v=1:a=0`;
  if (cartelasV) video += `,drawbox=x=0:y=0:w=iw:h=ih:color=0xD7261E:t=fill:enable='${cartelasV}'`;
  video += `,ass='${assArq}':fontsdir='${FONTES}',format=yuv420p[vout]`;
  filt.push(video);

  // Áudio: narração + trilha baixa (com versão sem música).
  let k = nV, audio = [];
  if (P.narracao) { ent.push('-i', em(P.narracao)); audio.push(`[${k}:a]aformat=sample_rates=48000:channel_layouts=stereo,apad,atrim=0:${fim}[nar]`); k++; }
  if (P.musica) {
    ent.push('-stream_loop', '-1', '-i', em(P.musica));
    audio.push(`[${k}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:${fim},loudnorm=I=${P.lufsMusica ?? -26}:TP=-3,afade=t=out:st=${Math.max(fim - 1.5, 0)}:d=1.5[mus]`); k++;
  }
  const mixes = [P.narracao && '[nar]', P.musica && '[mus]'].filter(Boolean);
  if (mixes.length) audio.push(`${mixes.join('')}amix=inputs=${mixes.length}:normalize=0:duration=longest,atrim=0:${fim},loudnorm=I=-14:TP=-1:LRA=11,aformat=sample_rates=48000:channel_layouts=stereo[aout]`);
  filt.push(...audio);

  const args = ['-hide_banner', '-loglevel', 'error', '-y', '-threads', '4', ...ent, '-filter_complex', filt.join(';'),
    '-map', '[vout]', ...(mixes.length ? ['-map', '[aout]'] : []), '-t', String(fim),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-r', String(FPS), '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', saida];
  await exec(ffmpeg, args, { maxBuffer: 1 << 26 });

  // Versão sem música (exigência do canal), só quando há trilha.
  if (P.musica && P.narracao) {
    const sem = saida.replace(/\.mp4$/, '-sem-musica.mp4');
    await exec(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', saida, '-i', em(P.narracao), '-map', '0:v', '-map', '1:a',
      '-af', `aformat=sample_rates=48000:channel_layouts=stereo,apad,atrim=0:${fim},loudnorm=I=-14:TP=-1:LRA=11,aresample=48000`, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', String(fim), sem]);
  }
  console.log('ok', saida, fim.toFixed(2) + 's');
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
