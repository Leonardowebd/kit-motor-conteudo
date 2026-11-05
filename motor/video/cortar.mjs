// T-003 — corte de silêncios e render vertical SDR. Refs: US-004, AC-005
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';
import { PAUSA_MAXIMA, validarTimeline, fonteParaSaida } from './timeline.mjs';

const exec = promisify(execFile);
const r3 = (x) => Math.round(x * 1000) / 1000;

// PURA: palavras (tempos na fonte) -> Timeline.
export const FPS = 30;
const quadro = (x) => Math.round(x * FPS) / FPS; // corte sempre num quadro: áudio e vídeo com a mesma duração

// Estende as bordas de cada trecho até o silêncio mais próximo (sem engolir começo/fim de palavra).
// Fica 0,06 s de silêncio de cada lado; sem silêncio perto, a borda não muda.
export function estenderAoSilencio(segs, sils, margem = 0.06) {
  return segs.map((sg, i) => {
    let { ini, fim } = sg;
    const antes = sils.filter((s) => s.fim >= ini - 0.35 && s.fim <= ini + 0.03).sort((a, b) => b.fim - a.fim)[0];
    if (antes) ini = Math.min(ini, Math.max(antes.ini, antes.fim - margem));
    const depois = sils.filter((s) => s.ini >= fim - 0.05 && s.ini <= fim + 0.35).sort((a, b) => a.ini - b.ini)[0];
    if (depois) fim = Math.max(fim, Math.min(depois.fim, depois.ini + margem));
    const prev = segs[i - 1], next = segs[i + 1];
    if (prev) ini = Math.max(ini, prev.fim); if (next) fim = Math.min(fim, next.ini);
    return { ini, fim };
  });
}

export function planejarCortes(palavras, duracaoFonte, { pausaMaxima = PAUSA_MAXIMA, folga = 0.08, fonte = '', silencios: sils = null } = {}) {
  const ps = palavras
    .filter((p) => p && p.texto && p.fim >= p.ini)
    .map((p) => ({ texto: p.texto, ini: Math.max(0, p.ini), fim: Math.min(duracaoFonte, p.fim) }))
    .sort((a, b) => a.ini - b.ini);
  const f = Math.min(folga, pausaMaxima / 2);
  const segmentos = [];
  for (const p of ps) {
    const ini = Math.max(0, p.ini - f);
    const fim = Math.min(duracaoFonte, p.fim + f);
    const ult = segmentos[segmentos.length - 1];
    if (!ult) { segmentos.push({ ini, fim }); continue; }
    const pausa = ini - ult.fim; // silêncio que sobraria entre os trechos
    if (pausa <= pausaMaxima - f * 2 || pausa <= 0) {
      // mantém a pausa original inteira (já curta) juntando os trechos
      ult.fim = Math.max(ult.fim, fim);
    } else {
      // pausa longa: o corte deixa só a folga das duas palavras (2f ≤ pausaMaxima)
      segmentos.push({ ini, fim });
    }
  }
  const bordas = sils ? estenderAoSilencio(segmentos, sils) : segmentos;
  const r5 = (x) => Math.round(x * 1e5) / 1e5;
  const segs = bordas.map((s) => ({ ini: r5(quadro(s.ini)), fim: r5(Math.min(quadro(duracaoFonte), quadro(s.fim))) })).filter((s) => s.fim > s.ini);
  const saidaPalavras = ps.map((p) => {
    const ini = fonteParaSaida(segs, p.ini) ?? fonteParaSaida(segs, p.ini + 1e-3);
    const fim = fonteParaSaida(segs, p.fim) ?? fonteParaSaida(segs, p.fim - 1e-3);
    return { texto: p.texto, ini: r3(ini), fim: r3(Math.max(ini, fim)) };
  });
  for (let i = 1; i < saidaPalavras.length; i++) {
    if (saidaPalavras[i].ini < saidaPalavras[i - 1].fim) saidaPalavras[i - 1].fim = saidaPalavras[i].ini;
  }
  const duracao = r3(segs.reduce((a, s) => a + (s.fim - s.ini), 0));
  return { fonte, duracaoFonte, palavras: ps, segmentos: segs, saida: { duracao, palavras: saidaPalavras } };
}

// Silêncios medidos no áudio (o Whisper estica as palavras por cima dos respiros).
// Devolve intervalos [{ini, fim}] em segundos na fonte, dentro de [ini, fim].
export async function silencios(arquivo, ini, fim, { limiar = -30, minimo = 0.15 } = {}) { // -30 dB pega respiração, não só silêncio
  const { stderr } = await exec(ffmpeg, ['-hide_banner', '-ss', String(ini), '-to', String(fim), '-i', arquivo, '-vn',
    '-af', `silencedetect=n=${limiar}dB:d=${minimo}`, '-f', 'null', '-'], { maxBuffer: 16 * 1024 * 1024 });
  const ss = [...stderr.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
  const es = [...stderr.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  return ss.map((s, i) => ({ ini: r3(ini + s), fim: r3(ini + (es[i] ?? fim - ini)) }));
}

// PURA: recorta as palavras para fora dos silêncios medidos, assim o respiro vira pausa
// entre palavras e o planejarCortes o remove.
export function ajustarAoSilencio(palavras, sils) {
  return palavras.map((p) => {
    let { ini, fim } = p;
    for (const s of sils) {
      if (ini >= s.ini && ini < s.fim) ini = s.fim;          // começa dentro do silêncio
      if (fim > s.ini && fim <= s.fim) fim = s.ini;          // termina dentro do silêncio
      if (ini < s.ini && fim > s.fim && s.fim - s.ini > 0.3) fim = s.ini; // engoliu um respiro longo
    }
    return { ...p, ini, fim: Math.max(ini, fim) };
  });
}

// HLG/bt2020 10-bit -> SDR bt709, vertical, cortado para largura x altura.
function filtroVideo(largura, altura) {
  return [
    'zscale=tin=arib-std-b67:min=bt2020nc:pin=bt2020:rin=tv:t=linear:npl=203',
    'format=gbrpf32le',
    'zscale=p=bt709',
    'tonemap=tonemap=hable:desat=0',
    'zscale=t=bt709:m=bt709:r=tv',
    'format=yuv420p',
    `scale=${largura}:${altura}:force_original_aspect_ratio=increase`,
    `crop=${largura}:${altura}`,
    'setsar=1',
  ].join(',');
}

export async function renderizarCorte(timeline, saidaMp4, { largura = 1080, altura = 1920, proxy = false } = {}) {
  if (proxy) { largura = 540; altura = 960; }
  const erros = validarTimeline(timeline);
  if (erros.length) throw new Error('timeline inválida: ' + erros.join('; '));
  // Um trecho por vez (memória baixa: um decodificador 4K aberto por vez, não 29), depois junta sem recodificar.
  // Cada trecho abre a fonte já no ponto (-ss antes do -i) e corta vídeo e áudio pela mesma duração em quadros.
  await mkdir(dirname(resolve(saidaMp4)), { recursive: true });
  const pasta = await mkdtemp(join(tmpdir(), 'corte-'));
  try {
    const partes = [];
    for (const [i, s] of timeline.segmentos.entries()) {
      const d = s.fim - s.ini, n = Math.round(d * FPS), dd = r3(n / FPS), fd = Math.min(0.012, dd / 4);
      const parte = join(pasta, `p${String(i).padStart(3, '0')}.mp4`);
      await exec(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-threads', '4', '-hwaccel', 'videotoolbox',
        '-ss', s.ini.toFixed(5), '-t', (d + 0.1).toFixed(5), '-i', s.fonte ?? timeline.fonte,
        '-filter_complex', `[0:v]fps=${FPS},trim=end_frame=${n},setpts=PTS-STARTPTS,${filtroVideo(largura, altura)}[vo];[0:a]atrim=end=${dd},asetpts=PTS-STARTPTS,afade=t=in:d=${fd},afade=t=out:st=${r3(dd - fd)}:d=${fd},aresample=48000[ao]`,
        '-map', '[vo]', '-map', '[ao]', '-threads', '4', '-filter_complex_threads', '2', '-c:v', 'libx264', '-preset', proxy ? 'ultrafast' : 'medium', '-crf', proxy ? '28' : '18',
        '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
        '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', parte], { maxBuffer: 16 * 1024 * 1024 });
      partes.push(parte);
    }
    const lista = join(pasta, 'lista.txt');
    await writeFile(lista, partes.map((p) => `file '${p}'`).join('\n'));
    await exec(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lista, '-c', 'copy', '-movflags', '+faststart', saidaMp4]);
  } finally { await rm(pasta, { recursive: true, force: true }); }
  return saidaMp4;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const proxy = args.includes('--proxy');
  const [raw, saida] = args.filter((a) => a !== '--proxy');
  if (!raw || !saida) { console.error('uso: node motor/video/cortar.mjs <raw> <saida.mp4> [--proxy]'); process.exit(1); }
  const { transcrever } = await import('./transcrever.mjs');
  const { palavras, duracaoFonte } = await transcrever(raw);
  const timeline = planejarCortes(palavras, duracaoFonte, { fonte: resolve(raw) });
  await mkdir(dirname(resolve(saida)), { recursive: true });
  await writeFile(saida.replace(/\.mp4$/i, '') + '.timeline.json', JSON.stringify(timeline, null, 2));
  await renderizarCorte(timeline, saida, { proxy });
  console.log(`fonte ${duracaoFonte.toFixed(2)}s -> saída ${timeline.saida.duracao.toFixed(2)}s, ${timeline.segmentos.length} segmentos, ${palavras.length} palavras`);
}
