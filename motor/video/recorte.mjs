// Recorte da pessoa (Vision do macOS, recorte.swift) — máscara em vídeo cinza para compor a pessoa
// na frente de painéis e imagens (Formato B; insert "recorte" do Formato A).
import { rm, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync, spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
function rodar(cmd, args) {
  return new Promise((ok, falha) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'ignore', 'pipe'] }); let err = '';
    p.stderr.on('data', (d) => { err += d; });
    p.on('close', (c) => (c === 0 ? ok() : falha(new Error(`ffmpeg saiu com ${c}: ${err.slice(-800)}`))));
  });
}

// Máscara da pessoa quadro a quadro (Vision) → vídeo cinza. Com ini/dur: só aquele trecho (a máscara começa em 0).
export async function videoMascara(base, pasta, fps, { ini = 0, dur = null } = {}) {
  const bin = path.join(AQUI, 'recorte-bin');
  if (!existsSync(bin)) execFileSync('swiftc', ['-O', path.join(AQUI, 'recorte.swift'), '-o', bin]);
  const qd = path.join(pasta, 'quadros'), mk = path.join(pasta, 'mascaras');
  await rm(qd, { recursive: true, force: true }); await rm(mk, { recursive: true, force: true }); await mkdir(qd, { recursive: true });
  await rodar(ffmpeg, ['-y', ...(ini ? ['-ss', String(ini)] : []), ...(dur ? ['-t', String(dur)] : []), '-i', base, '-vf', `fps=${fps}`, path.join(qd, 'q%06d.jpg')]);
  execFileSync(bin, [qd, mk], { stdio: 'ignore' });
  const saida = path.join(pasta, 'mascara.mp4');
  await rodar(ffmpeg, ['-y', '-framerate', String(fps), '-i', path.join(mk, 'q%06d.png'), '-vf', 'format=gray,boxblur=2', '-c:v', 'libx264', '-crf', '12', '-pix_fmt', 'yuv420p', saida]);
  await rm(qd, { recursive: true, force: true }); await rm(mk, { recursive: true, force: true });
  return saida;
}

