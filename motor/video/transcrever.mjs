// T-003 — transcrição local (mlx_whisper) com tempos por palavra. Refs: US-004, AC-005
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';
import ffprobeInst from '@ffprobe-installer/ffprobe';

const exec = promisify(execFile);
const AQUI = dirname(fileURLToPath(import.meta.url));
const PYTHON = join(AQUI, '..', '.venv', 'bin', 'python');
export const MODELO = process.env.WHISPER_MODELO || 'mlx-community/whisper-large-v3-turbo';
// Grafia dos termos recorrentes da marca; ao produtizar, vem da base de marca.
export const VOCABULARIO = process.env.WHISPER_VOCABULARIO || 'Claude, Claude Code, Anthropic, OpenAI, ChatGPT, GitHub, Vercel, WebGPU, IA.';

const SCRIPT = `
import sys, json, mlx_whisper
# condition_on_previous_text=False: com True, um erro contamina o resto (loops tipo
# "quad quad…" ou transcrição que para na 1ª frase). initial_prompt fixa a grafia dos termos.
# idioma vazio = o Whisper detecta (referências gringas)
r = mlx_whisper.transcribe(sys.argv[1], path_or_hf_repo=sys.argv[2], word_timestamps=True, language=sys.argv[4] or None,
                           condition_on_previous_text=False, initial_prompt=sys.argv[3] or None)
ps = []
for s in r.get('segments', []):
    for w in s.get('words', []):
        t = w['word'].strip()
        if t: ps.append({'texto': t, 'ini': float(w['start']), 'fim': float(w['end'])})
sys.stdout.write('@@JSON@@' + json.dumps(ps, ensure_ascii=False))
`;

export async function duracaoDe(caminho) {
  const { stdout } = await exec(ffprobeInst.path, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', caminho]);
  return Number(stdout.trim());
}

export async function transcrever(caminhoRaw, { idioma = 'pt' } = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'transcrever-'));
  try {
    const wav = join(dir, 'audio.wav');
    await exec(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', caminhoRaw, '-vn', '-ac', '1', '-ar', '16000', wav]);
    const { stdout } = await exec(PYTHON, ['-c', SCRIPT, wav, MODELO, VOCABULARIO, idioma || ''], {
      maxBuffer: 64 * 1024 * 1024,
      // mlx_whisper chama `ffmpeg` pelo PATH: usa o binário do ffmpeg-static
      env: { ...process.env, PATH: `${dirname(ffmpeg)}:${process.env.PATH ?? ''}` },
    });
    const palavras = JSON.parse(stdout.slice(stdout.lastIndexOf('@@JSON@@') + 8));
    return { palavras, duracaoFonte: await duracaoDe(caminhoRaw) };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// Retranscreve só alguns trechos da fonte (uma tentativa de frase por trecho: o Whisper não tem
// recomeço para fundir). trechos: [{ini, fim}] → [[{texto, ini, fim}]] com tempos na fonte.
const SCRIPT_TRECHOS = `
import sys, json, mlx_whisper
saida = []
for wav, offset in json.load(open(sys.argv[1])):
    r = mlx_whisper.transcribe(wav, path_or_hf_repo=sys.argv[2], word_timestamps=True, language='pt',
                               condition_on_previous_text=False, initial_prompt=sys.argv[3] or None)
    saida.append([{'texto': w['word'].strip(), 'ini': offset + float(w['start']), 'fim': offset + float(w['end'])}
                  for s in r.get('segments', []) for w in s.get('words', []) if w['word'].strip()])
sys.stdout.write('@@JSON@@' + json.dumps(saida, ensure_ascii=False))
`;
export async function transcreverTrechos(arquivo, trechos, { folga = 0.1 } = {}) {
  if (!trechos.length) return [];
  const dir = await mkdtemp(join(tmpdir(), 'transcrever-'));
  try {
    const lista = [];
    for (const [i, t] of trechos.entries()) {
      const ini = Math.max(0, t.ini - folga), wav = join(dir, `t${i}.wav`);
      await exec(ffmpeg, ['-nostdin', '-hide_banner', '-loglevel', 'error', '-y', '-ss', String(ini), '-t', String(t.fim + folga - ini), '-i', arquivo, '-vn', '-ac', '1', '-ar', '16000', wav]);
      lista.push([wav, ini]);
    }
    const listaJson = join(dir, 'lista.json');
    await writeFile(listaJson, JSON.stringify(lista));
    const { stdout } = await exec('nice', ['-n', '15', PYTHON, '-c', SCRIPT_TRECHOS, listaJson, MODELO, VOCABULARIO], {
      maxBuffer: 64 * 1024 * 1024,
      env: { ...process.env, PATH: `${dirname(ffmpeg)}:${process.env.PATH ?? ''}` },
    });
    return JSON.parse(stdout.slice(stdout.lastIndexOf('@@JSON@@') + 8));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const raw = process.argv[2];
  if (!raw) { console.error('uso: node motor/video/transcrever.mjs <raw>'); process.exit(1); }
  console.log(JSON.stringify(await transcrever(raw), null, 2));
}
