// Plano de som (Kit de roteiro, PROMPT 4): 1 efeito por ação visível, no momento da ação,
// nunca o mesmo arquivo duas vezes; impacto grave na virada; voz sempre por cima.
// Catálogo = arquivos da pasta SFX Audio do acervo (cada usuário troca pelo seu kit).
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import ffmpeg from 'ffmpeg-static';
const exec = promisify(execFile);

// categoria → arquivos (relativos à pasta SFX Audio), em ordem de preferência
export const CATALOGO = {
  whoosh: ['SFX Sound Effects/Short Whoosh.mp3', 'SFX for my video editing/Whoosh Digital 01.wav', 'SFX Sound Effects/clean-fast-swooshaiff-14784.mp3',
    'SFX Sound Effects/fast-whoosh-118248.mp3', 'SFX Sound Effects/mixkit-arrow-whoosh-1491.wav', 'SFX Sound Effects/Swoosh.mp3', 'SFX Sound Effects/whoosh-6316.mp3',
    'SFX Sound Effects/rm whoosh.wav', 'SFX Sound Effects/Whoosh 2.mp3', 'SFX for my video editing/Whoosh Fast 01.wav', 'SFX for my video editing/Short whoose_1.mp3',
    'SFX Sound Effects/mixkit-cinematic-wind-swoosh-1471.wav', 'SFX for my video editing/clean fast swoosh.mp3'],
  impacto: ['SFX Sound Effects/mixkit-big-cinematic-impact-788.mp3', 'SFX Sound Effects/05 Impact.wav', 'SFX Sound Effects/03 Grand Hit A.wav'],
  flash: ['SFX Sound Effects/camera shot flash 2.wav', 'SFX for my video editing/Camera Flash.mp3', 'SFX Sound Effects/camera shot flash 4.wav'],
  digitar: ['SFX Sound Effects/keyboard-typing-5997.mp3', 'SFX for my video editing/typing.mp3', 'SFX Sound Effects/Writing on keyboard Sound Effect.mp3'],
  clique: ['SFX Sound Effects/mouse-click-153941.mp3', 'SFX Sound Effects/rm click (1).wav', 'SFX for my video editing/Mouse Click.mp3', 'SFX Sound Effects/rm click (3).wav'],
  pop: ['SFX Sound Effects/mixkit-hard-pop-click-2364.wav', 'SFX Sound Effects/Pop 1.mp3', 'SFX for my video editing/pop-6.mp3', 'SFX Sound Effects/Pop 9.mp3'],
  dinheiro: ['SFX Sound Effects/cash ting.mp3', 'SFX for my video editing/TING SOUND EFFECT.mp3'],
  sucesso: ['SFX Sound Effects/correct sfx.mp3', 'SFX Sound Effects/quick-win.mp3', 'SFX Sound Effects/Ding.mp3'],
  brilho: ['SFX Sound Effects/shot light energy.mp3', 'SFX Sound Effects/mixkit-electricity-static-power-up-2600.wav', 'SFX Sound Effects/Lens flare transition sound effect.mp3'],
  riser: ['_bonus_ SFX Starter Kit/SFX - Riser Metallic.mp3', '_bonus_ SFX Starter Kit/SFX- Long Riser.wav', '_bonus_ SFX Starter Kit/SFX- Riser Bell Reverse.mp3'],
};
// Níveis do guia de sound design (estudo-viral-reels §5): whoosh −12 dB, textura −6/−7 dB, riser −5 dB, música −19 dB.
// [volume linear, duração máxima, âncora]: âncora 'pico' = o pico do arquivo cai no alvo (whoosh no quadro mais rápido);
// 'fim' = o arquivo termina no alvo (riser resolve na transição); 'inicio' = começa no alvo (textura no quadro do evento).
const DB = (d) => Math.round(10 ** (d / 20) * 1000) / 1000;
const PERFIL = {
  whoosh: [DB(-12), 0.8, 'pico'], flash: [DB(-7), 0.6, 'pico'], impacto: [DB(-6), 1.6, 'pico'],
  digitar: [DB(-9), 1.1, 'inicio'], clique: [DB(-7), 0.3, 'inicio'], pop: [DB(-7), 0.35, 'inicio'], dinheiro: [DB(-7), 0.9, 'inicio'],
  sucesso: [DB(-7), 0.9, 'inicio'], brilho: [DB(-8), 1.0, 'inicio'], riser: [DB(-5), 1.8, 'fim'],
};
export const MUSICA_DB = -19;

// Escolhe o próximo arquivo da categoria ainda não usado no vídeo (sem repetição).
function escolher(cat, usados) {
  const lista = CATALOGO[cat]; if (!lista) throw new Error(`categoria de som desconhecida: ${cat}`);
  const f = lista.find((x) => !usados.has(x)) ?? lista[usados.size % lista.length];
  usados.add(f); return f;
}

// PURA: eventos resolvidos → lista de sons { arquivo, alvo, ancora, volume, dur, cat } (t final sai de alinharPicos).
export function planoDeSom({ eventos, plano = {}, pastaSfx }) {
  const usados = new Set(), sons = [];
  const add = (cat, alvo, extra = {}) => { const [volume, dur, ancora] = PERFIL[cat]; sons.push({ cat, alvo: Math.round(alvo * 1000) / 1000, t: Math.max(0, alvo), ancora, volume, dur, arquivo: path.join(pastaSfx, escolher(cat, usados)), ...extra }); };
  const ins = eventos.inserts;
  // PASSO 1 — whooshes: toda entrada de insert é movimento (zoom+desfoque); o quadro mais rápido é ~0,08 s após o início
  for (const x of ins) add(x.flash ? 'flash' : 'whoosh', x.ini + 0.08);
  // PASSO 2 — texturas: o que acontece dentro do insert sem deslizar (pop, clique, digitar…), no quadro do evento
  for (const x of ins) for (const s of [].concat(x.sfx || [])) add(s.cat || s, x.ini + (s.em ?? 0.3));
  if (eventos.cta) { add('digitar', eventos.cta.ini + 0.35); add('sucesso', eventos.cta.ini + 1.3); }
  // PASSO 3 — risers + hit: 1º ~5 s após o gancho (termina na transição seguinte), outro na virada (REC)
  const transicao5s = ins.find((x) => x.ini >= 4.5);
  if (transicao5s) { add('riser', transicao5s.ini); add('impacto', transicao5s.ini); }
  if (eventos.rec) { add('riser', eventos.rec.ini); add('impacto', eventos.rec.ini); }
  // PASSO 4 — música: nivelada por loudness abaixo da voz, abaixa um pouco nos inserts
  if (plano.musica) sons.push({ cat: 'musica', t: 0, alvo: 0, ancora: 'inicio', volume: 1, lufs: plano.musica.lufs ?? -28, dur: 600, arquivo: path.isAbsolute(plano.musica.arquivo) ? plano.musica.arquivo : path.join(pastaSfx, plano.musica.arquivo), janelas: ins.map(({ ini, fim }) => ({ ini, fim })) });
  return sons.sort((a, b) => a.t - b.t);
}

// Mede onde está o pico de cada arquivo (whoosh/flash/hit) e posiciona t pela âncora. Async (lê o áudio).
export async function alinharPicos(sons) {
  const pico = new Map();
  for (const s of sons) {
    if (s.ancora === 'pico' && !pico.has(s.arquivo)) {
      const { stdout } = await exec(ffmpeg, ['-v', 'error', '-i', s.arquivo, '-t', '2', '-ac', '1', '-ar', '1000', '-f', 's16le', '-'], { encoding: 'buffer', maxBuffer: 1 << 22 });
      let max = 0, idx = 0;
      for (let i = 0; i + 1 < stdout.length; i += 2) { const v = Math.abs(stdout.readInt16LE(i)); if (v > max) { max = v; idx = i / 2; } }
      pico.set(s.arquivo, idx / 1000);
    }
    if (s.ancora === 'pico') s.t = s.alvo - pico.get(s.arquivo);
    else if (s.ancora === 'fim') s.t = s.alvo - s.dur;
    else s.t = s.alvo;
    s.t = Math.max(0, Math.round(s.t * 1000) / 1000);
  }
  return sons.sort((a, b) => a.t - b.t);
}

// Filtro ffmpeg: voz [0:a] + cada som (entrada primeiraEntrada+i) atrasado, cortado, com fade, mixado sem normalizar.
// Música (cat 'musica'): entra com fade e é comprimida pela própria voz (ducking) — abaixa quando você fala.
// Brilho da voz: energia acima de 4 kHz relativa ao total (dB). AKG (aprovado) ≈ −29; RAW abafados ≈ −38.
export const AGUDOS_ALVO = -30, AGUDOS_MAX = 8;
export const ganhoAgudos = (rel) => (Number.isFinite(rel) ? Math.round(Math.min(AGUDOS_MAX, Math.max(0, AGUDOS_ALVO - rel)) * 10) / 10 : 0);
export async function medirAgudos(arquivo) {
  const media = (af) => new Promise((ok) => execFile(ffmpeg, ['-hide_banner', '-t', '60', '-i', arquivo, '-vn', '-af', `${af}volumedetect`, '-f', 'null', '-'],
    { maxBuffer: 1 << 24 }, (_e, _o, err) => ok(Number((/mean_volume: (-?[\d.]+)/.exec(err) || [])[1]))));
  return (await media('highpass=f=4000,highpass=f=4000,')) - (await media(''));
}

export function filtroSom(sons, primeiraEntrada, { agudos = 0 } = {}) {
  const ps = [], efeitos = []; let musica = null;
  sons.forEach((s, i) => {
    const k = primeiraEntrada + i, ms = Math.round(s.t * 1000);
    if (s.cat === 'musica') {
      // trilha nivelada por loudness (−28 LUFS ≈ 12 dB abaixo da voz): audível sem competir; nos inserts abaixa só ~4 dB
      const sob = (s.janelas || []).map((j) => `between(t,${j.ini},${j.fim})`).join('+') || '0';
      musica = `[${k}:a]atrim=0:${s.dur},loudnorm=I=${s.lufs ?? -28}:TP=-8:LRA=11,afade=t=in:d=0.6,volume='if(${sob},0.63,1)':eval=frame,aformat=channel_layouts=stereo[mus]`; return;
    }
    ps.push(`[${k}:a]atrim=0:${s.dur},afade=t=out:st=${Math.max(0, s.dur - 0.15)}:d=0.15,volume=${s.volume},adelay=${ms}|${ms},aformat=channel_layouts=stereo[x${i}]`);
    efeitos.push(`[x${i}]`);
  });
  // voz: tira o grave de fundo, devolve os agudos que a gravação perdeu (sem redução de ruído: ela abafava, criador
  // 2026-11-01) e nivela em −15 LUFS (RAW gravados de −30 a −16 LUFS saem iguais)
  const realce = agudos > 0 ? `equalizer=f=250:t=q:w=1:g=-2,highshelf=f=3500:g=${agudos},` : '';
  const VOZ = `highpass=f=80,${realce}loudnorm=I=-15:TP=-1.5:LRA=9,aresample=48000,aformat=channel_layouts=stereo`;
  const partes = [`[0:a]aformat=channel_layouts=stereo,${VOZ}${musica ? ',asplit=2[voz][vozsc]' : '[voz]'}`, ...ps];
  if (musica) { partes.push(musica, `[mus][vozsc]sidechaincompress=threshold=0.1:ratio=2.5:attack=30:release=500[musd]`); efeitos.push('[musd]'); } // ducking leve
  if (!efeitos.length) return `${partes[0]};[voz]anull[audio]`;
  partes.push(`[voz]${efeitos.join('')}amix=inputs=${efeitos.length + 1}:duration=first:normalize=0,alimiter=limit=0.95[audio]`);
  return partes.join(';');
}
