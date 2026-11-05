// Extrai uma aula longa para estudo: transcrição com tempo (por frase) + quadros nas trocas de tela.
// Uso: node motor/pesquisa/aula.mjs <video> <pasta-saida>
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import ffmpeg from 'ffmpeg-static';
import { transcrever } from '../video/transcrever.mjs';
const exec = promisify(execFile);
const [video, saida] = process.argv.slice(2);
await mkdir(join(saida, 'quadros'), { recursive: true });

// quadros: troca de tela (scene>0.2) ou no máximo a cada 20 s
await exec('nice', ['-n', '10', ffmpeg, '-nostdin', '-hide_banner', '-loglevel', 'error', '-y', '-i', video,
  '-vf', "select='gt(scene,0.2)+isnan(prev_selected_t)+gte(t-prev_selected_t,20)',scale=640:-2,drawtext=text='%{pts\\:hms}':x=10:y=10:fontsize=22:fontcolor=yellow:box=1:boxcolor=black",
  '-vsync', 'vfr', '-q:v', '5', join(saida, 'quadros', 'q-%04d.jpg')], { maxBuffer: 1 << 26 });

const { palavras, duracaoFonte } = await transcrever(video, { idioma: 'pt' });
const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const linhas = []; let atual = [];
for (const [i, p] of palavras.entries()) {
  atual.push(p);
  const prox = palavras[i + 1];
  if (!prox || /[.?!]$/.test(p.texto) || prox.ini - p.fim > 0.8 || atual.length > 40) {
    linhas.push(`[${fmt(atual[0].ini)}] ${atual.map(x => x.texto).join(' ')}`); atual = [];
  }
}
await writeFile(join(saida, 'transcricao.md'), `# ${video.split('/').pop()}\nDuração: ${fmt(duracaoFonte)}\n\n${linhas.join('\n')}\n`);
console.log('ok', (await readdir(join(saida, 'quadros'))).length, 'quadros', palavras.length, 'palavras');
