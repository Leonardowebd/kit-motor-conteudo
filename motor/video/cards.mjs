// T-004 — Cards de b-roll no estilo E1 (terço superior) + render de overlay com alpha.
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir, homedir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import ffmpeg from 'ffmpeg-static';
import { AREA_SEGURA, LARGURA, ALTURA, cssMarca, esc } from './legenda.mjs';

// Mola subamortecida de forma fechada: 0 → 1 com leve overshoot.
export function mola(t, { freq = 2.2, amort = 0.62 } = {}) {
  if (t <= 0) return 0;
  const w = 2 * Math.PI * freq, wd = w * Math.sqrt(1 - amort * amort);
  return 1 - Math.exp(-amort * w * t) * (Math.cos(wd * t) + (amort * w / wd) * Math.sin(wd * t));
}

export function paginaCards(cards) {
  const { topo, lateral } = AREA_SEGURA;
  const html = cards.map((c, i) => c.tipo === 'imagem'
    ? `<div class="card img" id="c${i}" style="background-image:url('${esc(c.conteudo)}')"></div>`
    : `<div class="card txt" id="c${i}"><div>${esc(c.conteudo)}</div></div>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>${cssMarca()}
.card { position: absolute; left: ${lateral + 10}px; right: ${lateral + 10}px; top: ${topo + 40}px; height: 560px;
  box-sizing: border-box; border: 3px solid var(--azul); border-radius: 28px; background: var(--gelo);
  background-size: cover; background-position: center; opacity: 0; overflow: hidden;
  box-shadow: 0 24px 60px rgba(13,13,13,0.35); }
.card.txt { display: flex; align-items: center; justify-content: center; padding: 56px; }
.card.txt div { font-family: var(--fonte-titulo); font-weight: 600; font-size: 84px; line-height: 1.02;
  letter-spacing: -0.02em; color: var(--preto); text-align: center; text-wrap: balance; }
</style></head><body>${html}<script>
const C = ${JSON.stringify(cards.map(({ ini, fim }) => ({ ini, fim })))};
${mola.toString()}
window.seek = (t) => C.forEach((c, i) => {
  const el = document.getElementById('c' + i);
  if (t < c.ini || t >= c.fim) { el.style.opacity = 0; return; }
  const entra = mola(t - c.ini), sai = Math.min(1, Math.max(0, (c.fim - t) / 0.18));
  el.style.opacity = Math.min(1, entra * 1.6) * sai;
  el.style.transform = 'translateY(' + ((1 - entra) * 120) + 'px) scale(' + (0.86 + 0.14 * Math.min(1, entra)) + ')';
});
window.seek(0);
</script></body></html>`;
}

function rodar(cmd, args) {
  return new Promise((ok, falha) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => { err += d; });
    p.on('close', (c) => (c === 0 ? ok() : falha(new Error(`ffmpeg saiu com ${c}: ${err.slice(-800)}`))));
  });
}

// Pasta dos arquivos intermediários de um render (página HTML, camada .mov, som.json). Fica no Mac, fora do
// Google Drive: a camada ProRes tem centenas de MB e o Drive tentava subir de novo a cada render.
// No Drive vão só os vídeos finais (o .mp4 e o -sem-musica.mp4).
export function pastaDeCamadas(saida) {
  return path.join(homedir(), 'Library', 'Caches', 'motor-conteudo', 'camadas', path.basename(saida, '.mp4') + '-camadas');
}

// Abre a página, captura cada quadro com fundo transparente e monta ProRes 4444 (.mov com alpha).
// inicio: começa a capturar em t = inicio (camada só de um trecho; o .mov começa em 0).
export async function renderizarOverlay(htmlPath, duracao, fps, saidaMov, { inicio = 0 } = {}) {
  const pasta = await mkdtemp(path.join(tmpdir(), 'overlay-'));
  try {
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage({ viewport: { width: LARGURA, height: ALTURA } });
      await page.goto(pathToFileURL(path.resolve(htmlPath)).href);
      await page.evaluate(() => document.fonts.ready);
      const n = Math.round(duracao * fps);
      for (let q = 0; q < n; q++) {
        await page.evaluate((t) => window.seek(t), inicio + q / fps);
        const arquivo = path.join(pasta, `q${String(q).padStart(6, '0')}.png`);
        // Mac carregado (Drive sincronizando, memória cheia) às vezes engasga um quadro: espera mais e tenta de novo
        for (let tentativa = 1; ; tentativa++) {
          try { await page.screenshot({ path: arquivo, omitBackground: true, timeout: 90000 }); break; }
          catch (e) { if (tentativa >= 3 || e.name !== 'TimeoutError') throw e; }
        }
      }
    } finally { await browser.close(); }
    await rodar(ffmpeg, ['-y', '-framerate', String(fps), '-i', path.join(pasta, 'q%06d.png'),
      '-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le', '-vendor', 'apl0', saidaMov]);
  } finally { await rm(pasta, { recursive: true, force: true }); } // quadros saem mesmo se falhar
  return saidaMov;
}

export async function salvarPagina(html, arquivo) { await writeFile(arquivo, html); return arquivo; }
