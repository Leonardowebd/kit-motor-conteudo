// T-010 — inventário do acervo bruto: para cada RAW, transcrição com tempos por
// palavra, metadados e uma prancha de quadros amostrados. Cacheado por arquivo:
// um RAW já inventariado não é reprocessado.
import { readdir, mkdir, writeFile, access, readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';
import ffprobeInst from '@ffprobe-installer/ffprobe';
import { transcrever } from './transcrever.mjs';

const exec = promisify(execFile);
const EXTENSOES = new Set(['.mov', '.mp4', '.m4v']);

async function existe(p) { try { await access(p); return true; } catch { return false; } }

async function metadados(arquivo) {
  const { stdout } = await exec(ffprobeInst.path, ['-v', 'error', '-print_format', 'json', '-show_format', arquivo]);
  const f = JSON.parse(stdout).format;
  return { duracao: Number(f.duration), criado: f.tags?.creation_time ?? null };
}

// Prancha 4x3 com 12 quadros espaçados igualmente, para leitura visual do conteúdo.
async function prancha(arquivo, duracao, saida) {
  const intervalo = Math.max(duracao / 12, 0.5);
  await exec(ffmpeg, ['-v', 'error', '-y', '-i', arquivo, '-vf', `fps=1/${intervalo},scale=240:-2,tile=4x3`, '-frames:v', '1', saida]);
}

export async function inventariar(pastaRaw, pastaSaida) {
  await mkdir(pastaSaida, { recursive: true });
  const arquivos = (await readdir(pastaRaw)).filter((a) => EXTENSOES.has(extname(a).toLowerCase())).sort();
  const itens = [];
  for (const a of arquivos) {
    const nome = basename(a, extname(a));
    const json = join(pastaSaida, `${nome}.json`);
    if (await existe(json)) { itens.push(JSON.parse(await readFile(json, 'utf8'))); continue; }
    const caminho = join(pastaRaw, a);
    const meta = await metadados(caminho);
    const { palavras } = await transcrever(caminho);
    const quadros = join(pastaSaida, `${nome}.jpg`);
    await prancha(caminho, meta.duracao, quadros);
    const item = { arquivo: caminho, nome, ...meta, texto: palavras.map((p) => p.texto).join(' '), palavras, quadros };
    await writeFile(json, JSON.stringify(item, null, 2));
    itens.push(item);
    console.log(`✔ ${nome} ${meta.duracao.toFixed(1)}s — ${item.texto.slice(0, 90)}`);
  }
  await writeFile(join(pastaSaida, 'indice.json'), JSON.stringify(itens.map(({ palavras, ...r }) => r), null, 2));
  return itens;
}

// CLI: node motor/video/inventario.mjs <pastaRaw> <pastaSaida>
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [pastaRaw, pastaSaida] = process.argv.slice(2);
  await inventariar(pastaRaw, pastaSaida);
}
