// F3 — post animado. Três modos, um layout estático com um vídeo rodando dentro:
//   post    — moldura do perfil + texto + mídia 4:5 (miolo de um vídeo 1080x1920 do cenas.mjs, com narração)
//   noticia — moldura do perfil + texto + vídeo ORIGINAL da notícia na largura toda (mantém o áudio do vídeo)
//   meme    — faixa branca com a frase do nicho + vídeo do meme (mantém o áudio; crédito do autor embaixo)
// Uso: node motor/render/post.mjs <spec.json>   (caminhos relativos ao spec)
// spec: { "modo": "noticia", "midia": "video.mp4", "saida": "F3.mp4", "texto": "…", "subtexto": "…",
//         "cta": "Segue para aprender design e IA", "aviso": "Fonte: …", "ini": 0, "fim": 15 }
// Antigo (ainda aceito): node post.mjs <midia.mp4> <saida.mp4> "<texto>" ["aviso"]  → modo post.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import ffmpeg from 'ffmpeg-static';
import ffprobe from '@ffprobe-installer/ffprobe';

const exec = promisify(execFile);
const AQUI = dirname(fileURLToPath(import.meta.url));
const ACERVO = process.env.ACERVO || '<acervo> Drive/Brain-IA/criador - Conteúdo';
const FONTES = '<acervo>';
const W = 1080, H = 1920, LARG = 960, RAIO = 28;

let spec, base;
if (process.argv[2]?.endsWith('.json')) {
  base = dirname(resolve(process.argv[2]));
  spec = JSON.parse(readFileSync(process.argv[2], 'utf8'));
} else {
  const [midia, saida, texto, aviso = ''] = process.argv.slice(2);
  base = process.cwd();
  spec = { modo: 'post', midia, saida, texto, aviso };
}
const em = (p) => resolve(base, p);
const modo = spec.modo || 'post';

const perfil = JSON.parse(readFileSync(join(AQUI, '..', 'marca', 'perfil.json'), 'utf8'));
const selo = readFileSync(join(AQUI, '..', 'marca', 'selo-verificado.svg'), 'utf8');
const esc = (s = '') => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
// Fontes embutidas: a página não lê file:// a partir de setContent.
const fonte = (n) => 'data:font/otf;base64,' + readFileSync(join(FONTES, n)).toString('base64');
const foto = 'data:image/jpeg;base64,' + readFileSync(join(ACERVO, perfil.fotoPerfil)).toString('base64');

async function sonda(arq) {
  const { stdout } = await exec(ffprobe.path, ['-v', 'error', '-show_entries', 'stream=codec_type,width,height:format=duration', '-of', 'json', arq]);
  const j = JSON.parse(stdout), v = j.streams.find((s) => s.codec_type === 'video');
  return { w: v.width, h: v.height, dur: Number(j.format.duration), audio: j.streams.some((s) => s.codec_type === 'audio') };
}

const midia = em(spec.midia);
const info = await sonda(midia);
const ini = spec.ini ?? 0, fim = Math.min(spec.fim ?? info.dur, info.dur), dur = +(fim - ini).toFixed(3);
// Quadro da mídia: 4:5 no modo post; proporção original (limitada a 4:5) nos outros.
const qh = modo === 'post' ? 1200 : Math.round(Math.min(LARG * info.h / info.w, LARG * 1.25) / 2) * 2;

const cabecalho = `<div class="cab"><img src="${foto}"><div><div class="nome">${esc(perfil.nome)} ${perfil.verificado ? selo : ''}</div><div class="arroba">${esc(perfil.arroba)}</div></div></div>`;
const corpo = modo === 'meme'
  ? `<div class="grupo"><div class="faixa">${esc(spec.texto)}</div><div class="quadro reto" style="height:${Math.round(qh * W / LARG / 2) * 2}px"></div><div class="aviso">${esc(spec.aviso)}</div></div>`
  : `<div class="grupo">${cabecalho}<div class="txt">${esc(spec.texto)}</div><div class="quadro" style="height:${qh}px"></div>
     ${spec.subtexto ? `<div class="sub">${esc(spec.subtexto)}</div>` : ''}${spec.cta ? `<div class="cta">${esc(spec.cta)}</div>` : ''}<div class="aviso">${esc(spec.aviso)}</div></div>`;

const html = `<html><head><style>
@font-face{font-family:S;src:url(${fonte('Satoshi-Black.otf')})}
@font-face{font-family:R;src:url(${fonte('Satoshi-Medium.otf')})}
*{margin:0;box-sizing:border-box} body{width:${W}px;height:${H}px;background:#000;color:#f4f4f2;font-family:R;display:flex;align-items:center;justify-content:center}
.grupo{width:${LARG}px;display:flex;flex-direction:column;gap:30px}
.cab{display:flex;align-items:center;gap:24px}.cab img{width:110px;height:110px;border-radius:50%;object-fit:cover}
.nome{font-family:S;font-size:44px;display:flex;align-items:center;gap:10px}.nome svg{width:38px;height:38px}
.arroba{font-size:32px;color:#8a8a90;margin-top:2px}
.txt{font-family:S;font-size:52px;line-height:1.16;letter-spacing:-.4px}
.quadro{width:${LARG}px;border-radius:${RAIO}px;background:#111}
.sub{font-size:36px;line-height:1.3;color:#b8b8bd}.cta{font-family:S;font-size:44px;text-align:center;margin-top:10px}
.faixa{background:#fff;color:#000;font-family:S;font-size:58px;line-height:1.15;text-align:center;padding:36px 40px;margin:0 -${(W - LARG) / 2}px}
.reto{border-radius:0;margin:-30px -${(W - LARG) / 2}px 0;width:${W}px}
.aviso{font-size:26px;color:#77777c}
</style></head><body>${corpo}</body></html>`;

const tmp = mkdtempSync(join(tmpdir(), 'post-'));
try {
  const png = join(tmp, 'moldura.png'), mask = join(tmp, 'mascara.png');
  const nav = await chromium.launch();
  const pag = await nav.newPage({ viewport: { width: W, height: H } });
  await pag.setContent(html, { waitUntil: 'load' });
  await pag.evaluate(() => document.fonts.ready);
  const r = await pag.evaluate(() => { const b = document.querySelector('.quadro').getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; });
  await pag.screenshot({ path: png });
  const raio = modo === 'meme' ? 0 : RAIO;
  await pag.setViewportSize({ width: r.w, height: r.h });
  await pag.setContent(`<body style="margin:0;background:#000"><div style="width:${r.w}px;height:${r.h}px;border-radius:${raio}px;background:#fff"></div></body>`);
  await pag.screenshot({ path: mask });
  await nav.close();

  // post: miolo 4:5 do vídeo vertical; outros: vídeo inteiro preenchendo o quadro (corta só o excesso acima de 4:5).
  const enc = modo === 'post' ? `crop=1080:1350:0:285,scale=${r.w}:${r.h}` : `scale=${r.w}:${r.h}:force_original_aspect_ratio=increase,crop=${r.w}:${r.h}`;
  const f = `[0:v]trim=${ini}:${fim},setpts=PTS-STARTPTS,fps=30,${enc},format=rgba[m];[2:v]format=gray,scale=${r.w}:${r.h}[k];[m][k]alphamerge[mr];` +
    `[1:v][mr]overlay=${r.x}:${r.y}:shortest=1,format=yuv420p[v]`;
  const fa = info.audio ? `;[0:a]atrim=${ini}:${fim},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo[a]` : '';
  const audio = info.audio ? ['-map', '[a]', '-c:a', 'aac', '-b:a', '192k'] : [];
  await exec(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', midia, '-loop', '1', '-t', String(dur), '-i', png, '-loop', '1', '-t', String(dur), '-i', mask,
    '-filter_complex', f + fa, '-map', '[v]', ...audio, '-c:v', 'libx264', '-crf', '19', '-r', '30', '-t', String(dur), '-movflags', '+faststart', em(spec.saida)]);
  console.log('ok', em(spec.saida), `${dur}s`, info.audio ? 'com áudio do vídeo' : 'sem áudio (música entra no app)');
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
