// T-006 — Composição E1 dividida (Base/pericia-edicao.md (iv)-1):
// card de B-roll em cima (painel 0–48 % da altura), rosto reposicionado na metade de baixo,
// legenda na costura (~47 %). Sem card (janelas de rosto cheio) o vídeo ocupa a tela inteira.
// Overlay = uma página 1080x1920 com window.seek(t) global, renderizada por renderizarOverlay (ProRes 4444).
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';
import { AREA_SEGURA, LARGURA, ALTURA, agruparLegendas, cssMarca } from '../video/legenda.mjs';
import { renderizarOverlay, pastaDeCamadas } from '../video/cards.mjs';
import { montarCard, CSS_BASE, AJUDANTES, CAIXA } from './broll.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
export const PAINEL = 920;            // altura do painel do card (48 % de 1920)
export const COSTURA = 905;           // centro vertical da legenda no modo dividido (~47 %)
export const LEGENDA_CHEIA = 1560;    // centro da legenda em rosto cheio (~81 %, abaixo do card sobreposto)
export const ROSTO = { y: PAINEL, altura: ALTURA - PAINEL }; // 1080x1000

const letras = (s) => s.replace(/[^\p{L}\p{N}-]/gu, '');
const norm = (s) => letras(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const FUNCAO = new Set(['a', 'o', 'e', 'é', 'eu', 'se', 'ela', 'ele', 'no', 'na', 'da', 'de', 'do', 'um', 'uma']);

// Destaque da marca: palavra listada > número > nome próprio/termo com maiúscula (fora de início de frase) > palavra longa.
export function escolherDestaqueMarca(palavras, destaques = [], anterior = '') {
  const lista = new Set(destaques.map(norm));
  let melhor = null, nota = 0;
  palavras.forEach((p, i) => {
    const l = letras(p.texto), n = norm(p.texto);
    if (!l || FUNCAO.has(n)) return;
    const prev = i > 0 ? palavras[i - 1].texto : anterior;
    const inicioFrase = !prev || /[.!?…]$/.test(prev);
    let s = 0;
    if (lista.has(n)) s = 300;
    else if (/\d/.test(l)) s = 200;
    else if (/^\p{Lu}/u.test(l) && !inicioFrase) s = 150;
    else if (/^\p{Lu}{2,}/u.test(l)) s = 150;
    else if (l.length >= 7) s = l.length - (/(mente|ando|endo|indo|ar|er|ir)$/.test(n) ? 4 : 0);
    if (s > nota) { nota = s; melhor = i; }
  });
  return melhor;
}

export function legendasMarca(palavras, destaques) {
  const blocos = agruparLegendas(palavras, { maxPalavras: 3, maxCaracteres: 18 });
  blocos.forEach((b, i) => {
    const ant = i > 0 ? blocos[i - 1].palavras.at(-1).texto : '';
    b.destaque = escolherDestaqueMarca(b.palavras, destaques, ant);
    b.palavras.forEach((p) => { p.texto = p.texto.replace(/[.,;:]$/, ''); });
  });
  return blocos;
}

// Normaliza a lista: ordena, corta sobreposição (o seguinte vence) e separa cards do painel e sobrepostos.
export function normalizarCards(cards) {
  const cs = cards.map((c) => ({ ...c })).sort((a, b) => a.ini - b.ini);
  for (let i = 0; i < cs.length - 1; i++) if (cs[i].fim > cs[i + 1].ini) cs[i].fim = cs[i + 1].ini;
  return cs.filter((c) => c.fim > c.ini);
}
export const noPainel = (c) => (c.modo || 'painel') === 'painel';

export function coberturaCards(cards, duracao) {
  const soma = normalizarCards(cards).filter(noPainel).reduce((s, c) => s + Math.min(c.fim, duracao) - Math.max(0, c.ini), 0);
  return soma / duracao;
}

// Intervalos em que o painel está ativo (cards consecutivos fundidos).
export function janelasPainel(cards) {
  const out = [];
  for (const c of normalizarCards(cards).filter(noPainel)) {
    const u = out.at(-1);
    if (u && c.ini - u.fim < 0.02) u.fim = c.fim; else out.push({ ini: c.ini, fim: c.fim });
  }
  return out;
}

export function paginaComposicao({ cards, palavras, destaques = [], faixa = '' }) {
  const cs = normalizarCards(cards);
  const montados = cs.map((c) => montarCard(c.tipo, c.props || {}));
  const cssTipos = [...new Map(cs.map((c, i) => [c.tipo, montados[i].css])).values()].join('\n');
  const blocos = legendasMarca(palavras, destaques);
  const { lateral } = AREA_SEGURA;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${cssMarca()}
${CSS_BASE}
${cssTipos}
#painel { position: absolute; left: 0; top: 0; width: ${LARGURA}px; height: ${PAINEL}px; background: var(--preto); overflow: hidden; display: none; }
#painel .grade { position: absolute; inset: -40px; background-image: radial-gradient(rgba(0,53,212,0.5) 2px, transparent 2.4px); background-size: 30px 30px; }
#painel .luz { position: absolute; left: 50%; top: ${CAIXA.y + CAIXA.altura / 2}px; width: 1100px; height: 900px; margin: -450px 0 0 -550px; border-radius: 50%; background: radial-gradient(rgba(0,53,212,0.45), transparent 65%); }
#caixa { position: absolute; left: ${CAIXA.x}px; top: ${CAIXA.y}px; width: ${CAIXA.largura}px; height: ${CAIXA.altura}px; box-sizing: border-box;
  border: 5px solid var(--azul); border-radius: 40px; overflow: hidden; background: var(--preto); box-shadow: 0 0 0 1px rgba(0,53,212,0.6), 0 30px 80px rgba(0,53,212,0.35); }
#faixa { position: absolute; left: ${CAIXA.x}px; right: ${CAIXA.x}px; top: 130px; display: flex; align-items: center; gap: 18px; font-family: var(--fonte-texto); font-weight: 700; font-size: 30px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gelo); }
#faixa i { width: 14px; height: 14px; border-radius: 50%; background: var(--limao); flex: none; }
#faixa b { flex: 1; height: 3px; background: linear-gradient(90deg, var(--azul), transparent); }
#caixa .slot { position: absolute; inset: 0; display: none; }
#sobre .slot { position: absolute; left: ${CAIXA.x}px; top: 1130px; width: ${CAIXA.largura}px; height: 360px; display: none; }
#sobre .slot .k { background: transparent; } #sobre .slot .grade { display: none; }
#leg { position: absolute; left: ${lateral}px; right: ${lateral}px; text-align: center; font-family: var(--fonte-texto); font-weight: 900; font-size: 68px; line-height: 1.08;
  letter-spacing: -0.015em; color: var(--gelo); text-wrap: balance; transform-origin: 50% 50%; z-index: 10;
  text-shadow: 0 4px 0 rgba(13,13,13,0.9), 0 0 18px rgba(13,13,13,0.85); -webkit-text-stroke: 2px rgba(13,13,13,0.85); paint-order: stroke fill; }
#leg .p { display: inline-block; margin: 0 0.04em; }
#leg .d { color: var(--limao); }
</style></head><body>
<div id="painel"><div class="grade"></div><div class="luz"></div>${faixa ? `<div id="faixa"><i></i><span>${faixa.replace(/[&<>]/g, '')}</span><b></b></div>` : ''}<div id="caixa">${cs.map((c, i) => noPainel(c) ? `<div class="slot" id="k${i}">${montados[i].html}</div>` : '').join('')}</div></div>
<div id="sobre">${cs.map((c, i) => noPainel(c) ? '' : `<div class="slot" id="k${i}">${montados[i].html}</div>`).join('')}</div>
<div id="leg"></div>
<script>
${AJUDANTES}
const C = ${JSON.stringify(cs.map(({ ini, fim, modo }) => ({ ini, fim, painel: (modo || 'painel') === 'painel' })))};
const F = [${montados.map((m) => m.js).join(',\n')}];
const B = ${JSON.stringify(blocos)};
const COSTURA = ${COSTURA}, CHEIA = ${LEGENDA_CHEIA};
const painel = document.getElementById('painel'), caixa = document.getElementById('caixa'), leg = document.getElementById('leg');
const slots = C.map((_, i) => document.getElementById('k' + i));
let bloco = -1;
window.seek = (t) => {
  let ativo = -1, temPainel = false;
  C.forEach((c, i) => {
    const on = t >= c.ini && t < c.fim;
    slots[i].style.display = on ? 'block' : 'none';
    if (on) { F[i](t - c.ini, slots[i].firstElementChild); if (c.painel) { ativo = i; temPainel = true; } else slots[i].style.opacity = Math.min(1, (c.fim - t) / 0.2); }
  });
  painel.style.display = temPainel ? 'block' : 'none';
  if (temPainel) {
    const fx = document.querySelector('#faixa i'); if (fx) fx.style.opacity = 0.4 + 0.6 * Math.abs(Math.sin(t * 2.5));
    const g = painel.querySelector('.grade'); g.style.transform = 'translate(' + ((t * 14) % 30) + 'px,' + ((t * 6) % 30) + 'px)';
    // troca de card: mola curta de entrada (B7), sem transição longa
    const dt = t - C[ativo].ini, q = mola(dt, { freq: 3.2, amort: 0.7 });
    caixa.style.transform = 'scale(' + (0.95 + 0.05 * q) + ')';
  }
  const i = B.findIndex((b) => t >= b.ini && t < b.fim);
  if (i !== bloco) {
    bloco = i;
    leg.innerHTML = i < 0 ? '' : B[i].palavras.map((p, k) => '<span class="p' + (k === B[i].destaque ? ' d' : '') + '">' + p.texto.replace(/[&<>]/g, '') + '</span>').join(' ');
  }
  const cy = temPainel ? COSTURA : CHEIA;
  leg.style.top = (cy - leg.offsetHeight / 2) + 'px';
  if (i >= 0) { const x = mola(t - B[i].ini, { freq: 3.4, amort: 0.55 }); leg.style.transform = 'scale(' + (0.86 + 0.14 * x) + ')'; }
  return { ativo, temPainel, bloco: i };
};
window.seek(0);
</script></body></html>`;
}

export function rodar(cmd, args) {
  return new Promise((ok, falha) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let erro = '';
    p.stderr.on('data', (d) => { erro += d; });
    p.on('close', (c) => (c === 0 ? ok() : falha(new Error(erro.slice(-1200)))));
  });
}

// Centro do rosto (fração da largura/altura do vídeo), mediana de alguns quadros, via Vision (rosto-bin).
export async function centroRosto(video, tempos) {
  const bin = path.join(AQUI, '..', 'video', 'rosto-bin');
  if (!existsSync(bin)) execFileSync('swiftc', ['-O', path.join(AQUI, '..', 'video', 'rosto.swift'), '-o', bin]);
  const pasta = await mkdtemp(path.join(tmpdir(), 'rosto-'));
  try {
    const imgs = [];
    for (const [k, t] of tempos.entries()) {
      const img = path.join(pasta, `r${k}.jpg`);
      await rodar(ffmpeg, ['-y', '-ss', String(t), '-i', video, '-frames:v', '1', img]);
      imgs.push(img);
    }
    const linhas = execFileSync(bin, imgs, { encoding: 'utf8' }).trim().split('\n').map((l) => JSON.parse(l));
    const xs = [], ys = [], hs = [];
    for (const l of linhas) {
      const r = (l.rostos || []).sort((a, b) => b.w * b.h - a.w * a.h)[0];
      if (r) { xs.push((r.x + r.w / 2) / l.largura); ys.push((r.y + r.h / 2) / l.altura); hs.push(r.h / l.altura); }
    }
    const med = (a) => a.sort((p, q) => p - q)[Math.floor(a.length / 2)];
    if (!xs.length) return { x: 0.5, y: 0.4, h: 0.25, amostras: 0 };
    return { x: med(xs), y: med(ys), h: med(hs), amostras: xs.length };
  } finally { await rm(pasta, { recursive: true, force: true }); }
}

const entre = (js) => js.map((j) => `between(t,${j.ini.toFixed(3)},${(j.fim - 0.001).toFixed(3)})`).join('+') || '0';

// Filtro ffmpeg: base em tela cheia; metade de baixo (rosto recortado) quando há painel; punch-in nas janelas pedidas.
export function filtroComposicao({ larguraFonte, alturaFonte, rosto, janelas, punch = [], largura, altura }) {
  const esc = largura / LARGURA;
  const H = Math.round(ROSTO.altura * esc), Y = Math.round(ROSTO.y * esc);
  // recorte do rosto com proporção 1080:1000, o mais largo possível, rosto a ~42 % da altura do recorte
  // zoom 1,2 no rosto: recorte mais estreito que a largura da fonte
  let cw = Math.round(larguraFonte / 1.2), ch = Math.round(cw * ROSTO.altura / LARGURA);
  if (ch > alturaFonte) { ch = alturaFonte; cw = Math.round(ch * LARGURA / ROSTO.altura); }
  const cx = Math.round(Math.min(larguraFonte - cw, Math.max(0, rosto.x * larguraFonte - cw / 2)));
  const cy = Math.round(Math.min(alturaFonte - ch, Math.max(0, rosto.y * alturaFonte - ch * 0.42)));
  const z = 1.14, pw = Math.round(larguraFonte / z / 2) * 2, ph = Math.round(alturaFonte / z / 2) * 2;
  const px = Math.round(Math.min(larguraFonte - pw, Math.max(0, rosto.x * larguraFonte - pw / 2)));
  const py = Math.round(Math.min(alturaFonte - ph, Math.max(0, rosto.y * alturaFonte - ph * 0.4)));
  return [
    `[0:v]split=3[v0][v1][v2]`,
    `[v0]scale=${largura}:${altura},setsar=1[cheio]`,
    `[v1]crop=${cw}:${ch}:${cx}:${cy},scale=${largura}:${H},setsar=1[meio]`,
    `[v2]crop=${pw}:${ph}:${px}:${py},scale=${largura}:${altura},setsar=1[zoom]`,
    `[cheio][zoom]overlay=0:0:enable='${entre(punch)}'[b1]`,
    `[b1][meio]overlay=0:${Y}:enable='${entre(janelas)}'[b2]`,
    `[1:v]scale=${largura}:${altura}[ov]`,
    `[b2][ov]overlay=0:0:shortest=1[saida]`,
  ].join(';');
}

export async function dimensoes(video) {
  const out = await new Promise((ok) => { const p = spawn(ffmpeg, ['-i', video]); let e = ''; p.stderr.on('data', (d) => { e += d; }); p.on('close', () => ok(e)); });
  const m = out.match(/Video:.*?(\d{2,5})x(\d{2,5})/);
  return { largura: +m[1], altura: +m[2] };
}

// Gera a composição: overlay (HTML → ProRes alpha) + ffmpeg (rosto reposicionado).
export async function comporVideo({ video, timeline, dados, saida, largura = 540, altura = 960, fps = 15 }) {
  const t0 = Date.now();
  const duracao = timeline.saida.duracao;
  const pasta = pastaDeCamadas(saida);
  await mkdir(pasta, { recursive: true });
  const html = paginaComposicao({ cards: dados.cards, palavras: timeline.saida.palavras, destaques: dados.destaques, faixa: dados.faixa });
  const htmlPath = path.join(pasta, 'composicao.html');
  await writeFile(htmlPath, html);
  const mov = path.join(pasta, 'composicao.mov');
  await renderizarOverlay(htmlPath, duracao, fps, mov);
  const t1 = Date.now();
  const dim = await dimensoes(video);
  const rosto = await centroRosto(video, [1, duracao * 0.25, duracao * 0.5, duracao * 0.75, duracao - 1.5]);
  const filtro = filtroComposicao({ larguraFonte: dim.largura, alturaFonte: dim.altura, rosto, janelas: janelasPainel(dados.cards), punch: dados.rostoCheio?.filter((j) => j.punch) || [], largura, altura });
  await rodar(ffmpeg, ['-y', '-i', video, '-i', mov, '-filter_complex', filtro, '-map', '[saida]', '-map', '0:a?', '-r', String(fps),
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '24', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', saida]);
  return { saida, rosto, cobertura: coberturaCards(dados.cards, duracao), segundosOverlay: (t1 - t0) / 1000, segundosTotal: (Date.now() - t0) / 1000 };
}

// CLI: node motor/render/compor.mjs <video> <timeline.json> <cards.json> <saida.mp4>
if (import.meta.url === `file://${process.argv[1]}`) {
  // --final: 1080x1920 a 30 fps (padrão: prévia 540x960 a 15 fps)
  const final = process.argv.includes('--final');
  const [video, tl, cj, saida] = process.argv.slice(2).filter((a) => a !== '--final');
  const timeline = JSON.parse(await readFile(tl, 'utf8'));
  const dados = JSON.parse(await readFile(cj, 'utf8'));
  // src relativo de card (ex.: cena) é relativo ao cards.json
  const { resolve, dirname } = await import('node:path');
  const { pathToFileURL } = await import('node:url');
  for (const c of dados.cards) if (c.props?.src && !c.props.src.includes('://')) c.props.src = pathToFileURL(resolve(dirname(cj), c.props.src)).href;
  console.log(JSON.stringify(await comporVideo({ video, timeline, dados, saida, ...(final ? { largura: 1080, altura: 1920, fps: 30 } : {}) }), null, 1));
}
