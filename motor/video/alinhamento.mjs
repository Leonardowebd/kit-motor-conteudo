// Ponte JS → alinhar.py (alinhamento forçado à la WhisperX). Para cada corte: extrai o áudio 16 kHz do trecho
// (com 0,4 s de margem) e refina os tempos das palavras que o Whisper deu dentro do corte.
// Também dá a fala literal de cada corte (literalCortes), que mostra onde uma frase parou e recomeçou.
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';

const exec = promisify(execFile);
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const PY = path.join(AQUI, '..', '.venv', 'bin', 'python');
const MARGEM = 0.4;

// Extrai o áudio 16 kHz de cada trecho (com margem) e roda alinhar.py uma vez para todos (um carregamento do modelo).
async function rodar(trechos, tarefa) {
  const pasta = await mkdtemp(path.join(tmpdir(), 'alinhar-'));
  try {
    const tarefas = [];
    for (const [i, c] of trechos.entries()) {
      const offset = Math.max(0, c.ini - (c.margem ?? MARGEM)), wav = path.join(pasta, `c${i}.wav`);
      await exec(ffmpeg, ['-nostdin', '-y', '-loglevel', 'error', '-threads', '2', '-ss', String(offset), '-t', String(c.fim + (c.margem ?? MARGEM) - offset), '-i', c.arquivo, '-ac', '1', '-ar', '16000', wav]);
      tarefas.push({ wav, offset, ...tarefa(c) });
    }
    const entrada = path.join(pasta, 'tarefas.json'), saida = path.join(pasta, 'saida.json');
    await writeFile(entrada, JSON.stringify(tarefas));
    await exec('nice', ['-n', '15', PY, path.join(AQUI, 'alinhar.py'), entrada, saida], { maxBuffer: 64 << 20, timeout: 30 * 60 * 1000 });
    return JSON.parse(await readFile(saida, 'utf8'));
  } finally { await rm(pasta, { recursive: true, force: true }); }
}

// cortes: [{arquivo, ini, fim, palavras, margem?}] → [[palavras com ini/fim alinhados]]
export const alinharCortes = (cortes) => rodar(cortes, (c) => ({ palavras: c.palavras.map(({ texto, ini, fim }) => ({ texto, ini, fim })) }));

// cortes: [{arquivo, ini, fim}] → [[{texto, ini, fim}]] literal: inclui tentativas interrompidas e recomeços
export const literalCortes = (cortes) => rodar(cortes.map((c) => ({ ...c, margem: 0.1 })), () => ({ literal: true }));
