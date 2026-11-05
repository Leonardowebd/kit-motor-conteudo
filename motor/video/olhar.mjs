// Detecta trechos de bastidor pela IMAGEM: sem rosto ou cabeça fora da câmera (lendo roteiro = olhando para baixo/lado).
// Calibrado no IMG_2322 (2026-10-31): falando para a câmera |pitch|,|yaw| < 10°; lendo/bastidor pitch 20–45°, yaw −30 a −50°.
import { mkdtemp, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';

const exec = promisify(execFile);
const AQUI = path.dirname(fileURLToPath(import.meta.url));
export const LIMITE = { pitch: 18, yaw: 22 };  // graus
const FPS = 3;
const graus = (r) => (r * 180) / Math.PI;

// PURA: amostras [{t, rosto:{pitch,yaw}|null}] → trechos fora da câmera [{ini, fim}] (com folga de 0,15 s)
// olhada rápida (< minimo s) com o rosto visível NÃO é leitura de roteiro: fica (senão corta palavra no meio da frase)
export function trechosFora(amostras, { limite = LIMITE, passo = 1 / FPS, folga = 0.15, minimo = 0.8 } = {}) {
  const virado = (a) => a.rosto && (Math.abs(graus(a.rosto.pitch)) > limite.pitch || Math.abs(graus(a.rosto.yaw)) > limite.yaw);
  const fora = amostras.map((a) => !a.rosto || Math.abs(graus(a.rosto.pitch)) > limite.pitch || Math.abs(graus(a.rosto.yaw)) > limite.yaw);
  const out = [];
  amostras.forEach((a, i) => {
    if (!fora[i]) return;
    const ult = out[out.length - 1];
    if (ult && a.t - ult.fim <= passo * 1.5) ult.fim = a.t + passo / 2;
    else out.push({ ini: a.t - passo / 2, fim: a.t + passo / 2 });
  });
  // trecho só com cabeça virada (rosto visível) e curto = olhada → descarta; sem rosto conta sempre
  const valido = (j) => j.fim - j.ini >= minimo || amostras.some((a) => !a.rosto && a.t >= j.ini && a.t <= j.fim);
  return out.filter(valido).map((j) => ({ ini: +(j.ini - folga).toFixed(3), fim: +(j.fim + folga).toFixed(3) }));
}

// Amostra o trecho [ini, fim] do RAW e devolve os trechos fora da câmera (tempos na fonte).
export async function foraDaCamera(arquivo, ini, fim) {
  const bin = path.join(AQUI, 'rosto-bin');
  if (!existsSync(bin)) execFileSync('swiftc', ['-O', path.join(AQUI, 'rosto.swift'), '-o', bin]);
  const pasta = await mkdtemp(path.join(tmpdir(), 'olhar-'));
  try {
    await exec(ffmpeg, ['-nostdin', '-loglevel', 'error', '-threads', '2', '-hwaccel', 'videotoolbox', '-ss', String(ini), '-t', String(fim - ini), '-i', arquivo, '-vf', `fps=${FPS},scale=480:-2`, path.join(pasta, 'q%05d.jpg')]);
    const imgs = (await readdir(pasta)).filter((f) => f.endsWith('.jpg')).sort().map((f) => path.join(pasta, f));
    if (!imgs.length) return [];
    const { stdout } = await exec(bin, imgs, { maxBuffer: 16 << 20 });
    const amostras = stdout.trim().split('\n').map((l, i) => {
      const j = JSON.parse(l); const r = (j.rostos || []).sort((a, b) => b.w * b.h - a.w * a.h)[0];
      return { t: ini + (i + 0.5) / FPS, rosto: r ? { pitch: r.pitch, yaw: r.yaw } : null };
    });
    return trechosFora(amostras);
  } finally { await rm(pasta, { recursive: true, force: true }); }
}
