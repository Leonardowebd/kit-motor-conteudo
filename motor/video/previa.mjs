// Prévia leve (T-005): vídeo cortado em proxy + overlays de legenda e cards,
// em baixa resolução e fps reduzido. O render final só acontece após o OK.
import { readFile, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import ffmpeg from 'ffmpeg-static';
import { agruparLegendas, paginaLegenda } from './legenda.mjs';
import { paginaCards, renderizarOverlay, salvarPagina, pastaDeCamadas } from './cards.mjs';

export const PREVIA = { largura: 540, altura: 960, fps: 15 };

function rodar(args) {
  return new Promise((ok, falha) => {
    const p = spawn(ffmpeg, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let erro = '';
    p.stderr.on('data', (d) => { erro += d; });
    p.on('close', (c) => (c === 0 ? ok() : falha(new Error(erro.slice(-800)))));
  });
}

export async function gerarPrevia({ timeline, videoProxy, cards = [], saida }) {
  const pasta = pastaDeCamadas(saida);
  await mkdir(pasta, { recursive: true });
  const duracao = timeline.saida.duracao;

  const legendaHtml = await salvarPagina(paginaLegenda(agruparLegendas(timeline.saida.palavras)), path.join(pasta, 'legenda.html'));
  const legendaMov = path.join(pasta, 'legenda.mov');
  await renderizarOverlay(legendaHtml, duracao, PREVIA.fps, legendaMov);

  const camadas = [legendaMov];
  if (cards.length) {
    const cardsHtml = await salvarPagina(paginaCards(cards), path.join(pasta, 'cards.html'));
    const cardsMov = path.join(pasta, 'cards.mov');
    await renderizarOverlay(cardsHtml, duracao, PREVIA.fps, cardsMov);
    camadas.push(cardsMov);
  }

  const { largura, altura } = PREVIA;
  let filtro = `[0:v]scale=${largura}:${altura}[b0]`;
  camadas.forEach((_, i) => {
    filtro += `;[${i + 1}:v]scale=${largura}:${altura}[o${i}];[b${i}][o${i}]overlay=shortest=1[b${i + 1}]`;
  });
  await rodar([
    '-y', '-i', videoProxy, ...camadas.flatMap((c) => ['-i', c]),
    '-filter_complex', filtro, '-map', `[b${camadas.length}]`, '-map', '0:a?',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '28', '-pix_fmt', 'yuv420p', '-c:a', 'aac', saida,
  ]);
  return saida;
}

// CLI: node motor/video/previa.mjs <timeline.json> <proxy.mp4> <saida.mp4> [cards.json]
if (import.meta.url === `file://${process.argv[1]}`) {
  const [timelineJson, videoProxy, saida, cardsJson] = process.argv.slice(2);
  const timeline = JSON.parse(await readFile(timelineJson, 'utf8'));
  const cards = cardsJson ? JSON.parse(await readFile(cardsJson, 'utf8')) : [];
  console.log(await gerarPrevia({ timeline, videoProxy, cards, saida }));
}
