// Kit visual dos inserts em tela cheia (v2) — referências do criador (out/2026):
//  · horizonte de luz + campo de caracteres (estilo GradientASCII), nas cores da marca
//  · card de vidro escuro com brilho interno azul na base (receita de 4 sombras internas)
//  · etiqueta mono com quadrado limão (LBK.MAG) · moldura de seleção de editor na palavra (R19)
// Tudo determinístico por t (seek): nada de animação CSS, nada de aleatório sem semente.
import { montarCard } from './broll.mjs';
import { esc } from '../video/legenda.mjs';

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}-]/gu, '');
import { MONO, CANVAS, HZ_JS } from './kit.mjs';
import { TELAS_EXTRA } from './telas-extra.mjs';
export { MONO };

export const CSS_VISUAL = `
.hz { position: absolute; inset: 0; background: #03050c; overflow: hidden; }
.hz canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.tag { display: inline-flex; align-items: center; gap: 16px; font-family: ${MONO}; font-size: 34px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--gelo); }
.tag::before { content: ''; width: 20px; height: 20px; background: var(--limao); }
.vidro { position: absolute; border-radius: 56px; overflow: hidden; background: linear-gradient(180deg, #0a0f1f 0%, #070a14 100%);
  box-shadow: inset 0 -80px 60px -30px rgba(20,76,205,1), inset 0 -40px 30px -8px rgba(102,148,255,0.5), inset 0 -20px 20px -6px rgba(255,255,255,0.35),
    inset 0 6px 6px -2px rgba(35,101,255,0.15), inset 0 0 0 2px rgba(246,246,246,0.07), 0 40px 120px rgba(0,0,0,0.55); }
.flut { position: absolute; left: 0; right: 0; top: 300px; text-align: center; z-index: 3; }
.flut span { display: inline-block; font-family: var(--fonte-titulo); font-weight: 600; font-size: 64px; letter-spacing: -0.02em; color: var(--gelo); padding: 18px 44px 20px; border-radius: 999px;
  background: linear-gradient(180deg, rgba(10,15,31,0.82), rgba(7,10,20,0.82)); box-shadow: inset 0 -26px 26px -14px rgba(0,53,212,0.95), inset 0 -10px 10px -6px rgba(77,123,255,0.55), inset 0 0 0 2px rgba(246,246,246,0.12), 0 20px 60px rgba(3,5,12,0.6); }
.sel { position: relative; display: inline-block; padding: 6px 22px; }
.sel .bx { position: absolute; inset: 0; border: 3px solid #4d7bff; }
.sel .h { position: absolute; width: 22px; height: 22px; background: var(--gelo); border: 3px solid #4d7bff; }
.sel .h1 { left: -12px; top: -12px; } .sel .h2 { right: -12px; top: -12px; } .sel .h3 { left: -12px; bottom: -12px; } .sel .h4 { right: -12px; bottom: -12px; }
.sel .med { position: absolute; left: 50%; bottom: -70px; transform: translateX(-50%); font-family: ${MONO}; font-size: 24px; color: var(--gelo); background: #2b5cff; padding: 6px 14px; border-radius: 8px; white-space: nowrap; }
.sel .cur { position: absolute; right: -150px; top: -40px; display: flex; align-items: flex-start; gap: 6px; }
.sel .cur svg { width: 34px; } .sel .cur b { margin-top: 26px; font-family: var(--fonte-texto); font-size: 24px; font-weight: 700; color: var(--preto); background: var(--limao); padding: 4px 12px; border-radius: 8px; }
`;

// Horizonte + caracteres num <canvas>. forma: 'horizonte' (arco embaixo) | 'topo' (luz de cima).
export const JS_VISUAL = `
function hash2(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function mistura(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
const RAMPA = [[0, 25, 120], [0, 53, 212], [77, 123, 255], [165, 196, 255], [246, 246, 246]];
function cor(v) { v = Math.max(0, Math.min(0.999, v)) * (RAMPA.length - 1); const i = Math.floor(v); return mistura(RAMPA[i], RAMPA[i + 1], v - i); }
const CHARS = ' .:-=+xX0#';
function horizonte(cv, t, forma) {
  const W = cv.width, H = cv.height, g = cv.getContext('2d');
  g.clearRect(0, 0, W, H);
  // luz difusa (gradiente)
  const cy = forma === 'topo' ? -H * 0.12 : H * 0.98, ry = H * 0.58;
  const gr = g.createRadialGradient(W / 2, cy, 0, W / 2, cy, ry);
  gr.addColorStop(0, 'rgba(165,196,255,0.95)'); gr.addColorStop(0.18, 'rgba(77,123,255,0.85)'); gr.addColorStop(0.45, 'rgba(0,53,212,0.55)'); gr.addColorStop(1, 'rgba(0,25,120,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // arco escuro (planeta) para o horizonte
  if (forma !== 'topo') { g.fillStyle = '#03050c'; g.beginPath(); g.ellipse(W / 2, H * 1.32 + Math.sin(t * 0.6) * 6, W * 1.05, H * 0.42, 0, 0, Math.PI * 2); g.fill();
    const rim = g.createLinearGradient(0, H * 0.9, 0, H * 0.93); g.strokeStyle = 'rgba(246,246,246,0.85)'; g.lineWidth = 3; g.beginPath(); g.ellipse(W / 2, H * 1.32 + Math.sin(t * 0.6) * 6, W * 1.05, H * 0.42, 0, Math.PI * 1.08, Math.PI * 1.92); g.stroke(); }
  // campo de caracteres
  const cs = 20, cw = cs * 0.62; g.font = '600 ' + Math.round(cs * 0.8) + 'px ${MONO.replace(/'/g, '')}'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const tick = Math.floor(t * 9);
  for (let y = 0; y < H; y += cs) for (let x = 0; x < W; x += cw) {
    const dx = (x - W / 2) / ry, dy = (y - cy) / ry; let v = 1 - Math.sqrt(dx * dx + dy * dy);
    if (forma !== 'topo' && y > H * 0.9 + Math.pow((x - W / 2) / W, 2) * H * 0.35) continue;
    v += (hash2(x, y + tick) - 0.5) * 0.12 + Math.sin(x * 0.01 + t * 1.3) * 0.04;
    if (v < 0.22 || hash2(x * 1.3, y * 0.7) > (v - 0.2) * 1.3) continue;
    const c = cor(v * 1.15), ch = CHARS[Math.min(CHARS.length - 1, Math.floor(v * CHARS.length * 1.4))];
    g.fillStyle = 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + (0.12 + (v - 0.2) * 0.7) + ')';
    g.fillText(ch, x + cw / 2, y + cs / 2);
  }
}
function revela(el, t, ini, dur, blur) { if (!el) return; const q = cl((t - ini) / dur); el.style.opacity = q; el.style.filter = 'blur(' + (1 - q) * (blur || 12) + 'px)'; el.style.transform = 'translateY(' + (1 - suave(q)) * 24 + 'px)'; }
function selecao(r, t, ini) { const s = $(r, '.sel'); if (!s) return; const q = mola(t - ini, { freq: 2.4, amort: 0.7 }); const bx = $(s, '.bx'); if (bx) bx.style.clipPath = 'inset(0 ' + (1 - cl(q)) * 100 + '% 0 0)';
  $$(s, '.h').forEach((h) => { h.style.opacity = cl(q * 2 - 0.6); }); revela($(s, '.med'), t, ini + 0.25, 0.2, 6); const c = $(s, '.cur'); if (c) { c.style.opacity = cl((t - ini - 0.2) * 5); c.style.transform = 'translate(' + (1 - suave(cl((t - ini - 0.2) / 0.4))) * 80 + 'px,' + (1 - suave(cl((t - ini - 0.2) / 0.4))) * 60 + 'px)'; } }
`;

const CURSOR = `<svg viewBox="0 0 28 36"><path d="M2 2 L2 30 L9 23 L14 34 L19 32 L14 21 L24 21 Z" fill="#ff5a1f" stroke="#f6f6f6" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
const SEL = (conteudo, medida, rotulo) => `<span class="sel"><span class="bx"></span><i class="h h1"></i><i class="h h2"></i><i class="h h3"></i><i class="h h4"></i>${conteudo}${medida ? `<span class="med">${esc(medida)}</span>` : ''}${rotulo ? `<span class="cur">${CURSOR}<b>${esc(rotulo)}</b></span>` : ''}</span>`;


export const TELAS = {
  // palavra grande sobre o horizonte, com moldura de seleção (R19); sub opcional
  tipografia({ palavra = 'VGPU', sub = '', tag = '', medida = '', rotulo = '', cor = 'gelo' } = {}) {
    return { html: `<div class="t-tipo">${CANVAS('horizonte')}${tag ? `<div class="tg"><span class="tag">${esc(tag)}</span></div>` : ''}<div class="pal ${cor}">${SEL(`<span class="w">${esc(palavra)}</span>`, medida, rotulo)}</div>${sub ? `<div class="sub">${esc(sub)}</div>` : ''}</div>`,
      css: `.t-tipo { position: absolute; inset: 0; }
.t-tipo .tg { position: absolute; left: 0; right: 0; top: 560px; text-align: center; }
.t-tipo .pal { position: absolute; left: 0; right: 0; top: 700px; text-align: center; font-family: var(--fonte-titulo); font-weight: 600; font-size: ${palavra.length > 7 ? 150 : 200}px; line-height: 1.05; letter-spacing: -0.04em; }
.t-tipo .pal.limao .w { color: var(--limao); } .t-tipo .pal.gelo .w { color: var(--gelo); }
.t-tipo .sub { position: absolute; left: 0; right: 0; top: 1010px; text-align: center; font-family: ${MONO}; font-size: 36px; letter-spacing: 0.04em; color: rgba(246,246,246,0.8); }`,
      js: `function (t, r) { ${HZ_JS} revela($(r, '.tg'), t, 0.05, 0.25); const w = $(r, '.w'); if (w) { const q = cl((t - 0.08) / 0.3); w.style.opacity = q; w.style.filter = 'blur(' + (1 - q) * 20 + 'px)'; }
  tf($(r, '.pal'), 'scale(' + (1 + 0.025 * t) + ')'); selecao(r, t, 0.3); revela($(r, '.sub'), t, 0.45, 0.25); }` };
  },

  // grafo de conhecimento se montando (eco do assunto "knowledge graph"): nós surgem, arestas se desenham, pulso percorre
  grafo({ titulo = '', tag = '', rotulos = [], semente = 3 } = {}) {
    let x = semente * 9301 + 49297; const rnd = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
    const N = 18, nos = Array.from({ length: N }, (_, i) => ({ x: 120 + rnd() * 840, y: 560 + rnd() * 700, r: i < rotulos.length ? 22 : 9 + rnd() * 8 }));
    const ar = []; nos.forEach((n, i) => { const d = nos.map((m, j) => [j, Math.hypot(m.x - n.x, m.y - n.y)]).filter(([j]) => j !== i).sort((a, b) => a[1] - b[1]); for (const [j] of d.slice(0, 2)) if (!ar.some(([a, b]) => (a === j && b === i))) ar.push([i, j]); });
    const svg = `<svg viewBox="0 0 1080 1920" class="gf">${ar.map(([a, b], k) => `<line class="ar" data-k="${k}" x1="${nos[a].x}" y1="${nos[a].y}" x2="${nos[b].x}" y2="${nos[b].y}" pathLength="1"/>`).join('')}${nos.map((n, i) => `<g class="no" data-i="${i}" transform="translate(${n.x} ${n.y})"><circle r="${n.r * 2.2}" class="halo"/><circle r="${n.r}" class="${i < rotulos.length ? 'nr' : 'nn'}"/>${i < rotulos.length ? `<text y="${n.r + 46}">${esc(rotulos[i])}</text>` : ''}</g>`).join('')}</svg>`;
    return { html: `<div class="t-grafo">${CANVAS('topo')}${tag ? `<div class="tg"><span class="tag">${esc(tag)}</span></div>` : ''}${titulo ? `<div class="ti">${esc(titulo)}</div>` : ''}${svg}</div>`,
      css: `.t-grafo { position: absolute; inset: 0; } .t-grafo .gf { position: absolute; inset: 0; width: 100%; height: 100%; }
.t-grafo .tg { position: absolute; left: 0; right: 0; top: 300px; text-align: center; z-index: 2; }
.t-grafo .ti { position: absolute; left: 80px; right: 80px; top: 360px; text-align: center; font-family: var(--fonte-titulo); font-weight: 600; font-size: 84px; line-height: 1.04; letter-spacing: -0.035em; color: var(--gelo); z-index: 2; }
.t-grafo .ar { stroke: var(--azul-claro); stroke-width: 3; stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0.8; }
.t-grafo .nn { fill: var(--azul-gelo); } .t-grafo .nr { fill: var(--limao); } .t-grafo .halo { fill: rgba(0,53,212,0.35); }
.t-grafo text { fill: var(--gelo); font-family: var(--fonte-mono); font-size: 30px; text-anchor: middle; }`,
      js: `function (t, r) { const hz = $(r, '.hz'); if (hz) fundo($(hz, 'canvas'), t, hz.dataset.forma); revela($(r, '.tg'), t, 0.02, 0.2); revela($(r, '.ti'), t, 0.06, 0.25, 14);
  $$(r, '.no').forEach((g, i) => { const q = mola(t - 0.1 - i * 0.045, { freq: 2.6, amort: 0.55 }); g.style.opacity = cl(q * 2); const c = g.querySelector('circle:nth-child(2)'); if (c) c.style.transform = 'scale(' + (0.2 + 0.8 * q) + ')'; const h = g.querySelector('.halo'); if (h) h.style.opacity = 0.5 + 0.5 * Math.sin(t * 4 + i); });
  $$(r, '.ar').forEach((l, k) => { l.style.strokeDashoffset = 1 - cl((t - 0.3 - k * 0.03) / 0.35); l.style.stroke = (Math.floor(t * 6) % ${Math.max(1, ar.length)}) === k ? 'var(--limao)' : 'var(--azul-claro)'; }); }` };
  },

  // mídia oficial do assunto (print/foto/vídeo de fonte oficial) emoldurada em vidro, com título e crédito obrigatório
  midia({ src = '', titulo = '', tag = '', credito = '', foco = 0.3 } = {}) {
    return { html: `<div class="t-midia">${CANVAS('topo')}${tag ? `<div class="tg"><span class="tag">${esc(tag)}</span></div>` : ''}${titulo ? `<div class="ti">${esc(titulo)}</div>` : ''}<div class="vidro mold"><img src="${esc(src)}" style="object-position: 50% ${foco * 100}%"></div>${credito ? `<div class="cr">${esc(credito)}</div>` : ''}</div>`,
      css: `.t-midia { position: absolute; inset: 0; }
.t-midia .tg { position: absolute; left: 0; right: 0; top: 300px; text-align: center; }
.t-midia .ti { position: absolute; left: 80px; right: 80px; top: 360px; text-align: center; font-family: var(--fonte-titulo); font-weight: 600; font-size: 84px; line-height: 1.04; letter-spacing: -0.035em; color: var(--gelo); }
.t-midia .mold { left: 40px; right: 40px; top: 620px; height: 600px; padding: 18px; box-sizing: border-box; }
.t-midia .mold img { width: 100%; height: 100%; object-fit: cover; border-radius: 40px; display: block; }
.t-midia .cr { position: absolute; left: 0; right: 0; top: 1240px; text-align: center; font-family: var(--fonte-mono); font-size: 26px; color: rgba(246,246,246,0.6); letter-spacing: 0.04em; }`,
      js: `function (t, r) { ${HZ_JS} revela($(r, '.tg'), t, 0.02, 0.2); revela($(r, '.ti'), t, 0.06, 0.25, 14);
  const m = $(r, '.mold'); const q = mola(t - 0.1, { freq: 2.2, amort: 0.72 }); m.style.opacity = cl(q * 2); m.style.transform = 'translateY(' + (1 - q) * 140 + 'px) scale(' + (1 + 0.02 * t) + ')';
  revela($(r, '.cr'), t, 0.4, 0.2, 6); }` };
  },

  // logos oficiais do tema (notícia; regra MARCA: logo do produto citado pode aparecer) em placas de vidro, unidos por "×"
  logos({ logos = [], titulo = '', tag = '', claro = [] } = {}) {
    const placas = logos.map((src, i) => `<div class="vidro pl"><img src="${esc(src)}" class="${claro.includes(i) ? 'inv' : ''}"></div>`).join('<div class="x">×</div>');
    return { html: `<div class="t-logos">${CANVAS('horizonte')}${tag ? `<div class="tg"><span class="tag">${esc(tag)}</span></div>` : ''}<div class="fila${logos.length >= 3 ? ' muitos' : ''}">${placas}</div>${titulo ? `<div class="ti">${esc(titulo)}</div>` : ''}</div>`,
      css: `.t-logos { position: absolute; inset: 0; }
.t-logos .tg { position: absolute; left: 0; right: 0; top: 470px; text-align: center; }
.t-logos .fila { position: absolute; left: 0; right: 0; top: 560px; display: flex; justify-content: center; align-items: center; gap: 36px; }
.t-logos .pl { position: relative; width: 300px; height: 300px; display: flex; align-items: center; justify-content: center; }
.t-logos .pl img { width: 62%; height: 62%; object-fit: contain; } .t-logos .pl img.inv { filter: invert(1); }
.t-logos .x { font-family: var(--fonte-titulo); font-weight: 600; font-size: 90px; color: var(--azul-claro); }
.t-logos .fila.muitos { gap: 18px; } .t-logos .fila.muitos .pl { width: 240px; height: 240px; } .t-logos .fila.muitos .x { font-size: 60px; } /* 3+ logos cabem nos 1080 px */
.t-logos .ti { position: absolute; left: 80px; right: 80px; top: 920px; text-align: center; font-family: var(--fonte-titulo); font-weight: 600; font-size: 96px; line-height: 1.04; letter-spacing: -0.035em; color: var(--gelo); }`,
      js: `function (t, r) { ${HZ_JS} revela($(r, '.tg'), t, 0.02, 0.2);
  $$(r, '.pl').forEach((p, i) => { const q = mola(t - 0.05 - i * 0.18, { freq: 2.2, amort: 0.62 }); p.style.opacity = cl(q * 2); p.style.transform = 'translateY(' + ((1 - q) * 140 + Math.sin(t * 2 + i) * 6) + 'px) scale(' + (0.7 + 0.3 * q) + ') rotate(' + (1 - q) * (i ? 8 : -8) + 'deg)'; });
  revela($(r, '.x'), t, 0.25, 0.2, 10); revela($(r, '.ti'), t, 0.35, 0.25, 14); }` };
  },

  // vídeo gerado (Flow/Veo/OpenArt): o clipe entra no ffmpeg, por baixo; aqui só a etiqueta por cima
  clip({ tag = '' } = {}) {
    return { html: `<div class="t-clip"><div class="vin"></div>${tag ? `<div class="flut"><span>${esc(tag)}</span></div>` : ''}</div>`,
      css: `.t-clip { position: absolute; inset: 0; } .t-clip .vin { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(3,5,12,0.5), transparent 20%, transparent 75%, rgba(3,5,12,0.6)); }
`,
      js: `function (t, r) { revela($(r, '.flut'), t, 0.15, 0.25, 16); }` };
  },

  // cena gerada (OpenArt) em tela cheia, etiqueta mono e moldura fina
  cena({ src = '', foco = 0.38, deriva = 1, tag = '', credito = '', inteira = false, zoom = 1 } = {}) {
    // inteira: imagem sem corte (contain) sobre uma cópia desfocada dela — para arte-chave/logo que não pode perder as bordas
    return { html: `<div class="t-cena${inteira ? ' inteira' : ''}">${src && inteira ? `<img class="fundo" src="${esc(src)}">` : ''}${src ? `<img class="fr" src="${esc(src)}" style="object-position: 50% ${foco * 100}%; transform-origin: 50% ${foco * 100}%">` : ''}<div class="vin"></div>${tag ? `<div class="flut"><span>${esc(tag)}</span></div>` : ''}${credito ? `<div class="cr">${esc(credito)}</div>` : ''}</div>`,
      css: `.t-cena .cr { position: absolute; left: 0; right: 0; top: 1560px; text-align: center; font-family: var(--fonte-mono); font-size: 26px; color: rgba(246,246,246,0.7); letter-spacing: 0.04em; }
.t-cena { position: absolute; inset: 0; background: #03050c; overflow: hidden; }
.t-cena.inteira .fundo { position: absolute; inset: -60px; width: calc(100% + 120px); height: calc(100% + 120px); object-fit: cover; filter: blur(40px) brightness(0.55); }
.t-cena.inteira .fr { object-fit: contain !important; }
.t-cena img.fr { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; } /* enquadramento por instância (inline): CSS de tipo é compartilhado */
.t-cena .vin { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(3,5,12,0.55), transparent 22%, transparent 70%, rgba(3,5,12,0.8)); }
`,
      js: `function (t, r) { tf($(r, 'img.fr'), 'scale(' + (1 + ${zoom} * (0.06 + 0.04 * t)) + ') translateX(' + (${deriva} * (10 - 9 * t)) + 'px)'); revela($(r, '.flut'), t, 0.15, 0.25, 16); }` };
  },

  // notícia (LBK.MAG nas cores da marca): mídia emoldurada + etiqueta + manchete
  editorial({ tag = 'notícia', manchete = 'A Vercel abriu a VGPU', destaque = '', midia = null } = {}) {
    const ws = manchete.split(' ').map((w) => norm(w) === norm(destaque) ? SEL(`<span class="w d">${esc(w)}</span>`, '', '') : `<span class="w">${esc(w)}</span>`).join(' ');
    const m = midia ? montarCard(midia.tipo, midia.props || {}) : null;
    return { html: `<div class="t-edit">${CANVAS('horizonte')}<div class="mold">${m ? `<div class="md">${m.html}</div>` : ''}</div><div class="faixa"><span class="tag">${esc(tag)}</span></div><div class="mc">${ws}</div></div>`,
      css: `.t-edit { position: absolute; inset: 0; }
.t-edit .mold { position: absolute; left: 70px; right: 70px; top: 300px; height: 640px; border: 3px solid rgba(77,123,255,0.7); border-radius: 8px; overflow: hidden; background: #070a14; }
.t-edit .md { position: absolute; inset: 0; } .t-edit .md > .k { border-radius: 0; }
.t-edit .faixa { position: absolute; left: 100px; top: 905px; height: 72px; padding: 0 30px; display: flex; align-items: center; background: #03050c; border: 3px solid rgba(77,123,255,0.7); }
.t-edit .mc { position: absolute; left: 100px; right: 100px; top: 1030px; font-family: var(--fonte-titulo); font-weight: 600; font-size: 104px; line-height: 1.04; letter-spacing: -0.035em; color: var(--gelo); }
.t-edit .mc .w { display: inline-block; } .t-edit .mc .d { color: var(--limao); }
${m ? m.css : ''}`,
      js: `function (t, r) { ${HZ_JS}
  const mo = $(r, '.mold'); const q = mola(t, { freq: 2.2, amort: 0.75 }); mo.style.opacity = cl(q * 2); mo.style.transform = 'translateY(' + (1 - q) * 80 + 'px)';
  ${m ? `(${m.js})(t, $(r, '.md').firstElementChild);` : ''}
  revela($(r, '.faixa'), t, 0.2, 0.2); $$(r, '.mc .w').forEach((s, i) => revela(s, t, 0.3 + i * 0.07, 0.22)); selecao(r, t, 0.9); }` };
  },

  // card de UI do acervo dentro de um vidro escuro com brilho azul, sobre o horizonte
  ui({ titulo = '', tag = '', card = { tipo: 'grade-componentes' }, forma = 'horizonte' } = {}) {
    const m = montarCard(card.tipo, card.props || {});
    return { html: `<div class="t-ui">${CANVAS(forma)}${tag ? `<div class="tg"><span class="tag">${esc(tag)}</span></div>` : ''}${titulo ? `<div class="ti">${esc(titulo)}</div>` : ''}<div class="vidro cx"><div class="in">${m.html}</div></div></div>`,
      css: `.t-ui { position: absolute; inset: 0; }
.t-ui .tg { position: absolute; left: 0; right: 0; top: 290px; text-align: center; }
.t-ui .ti { position: absolute; left: 90px; right: 90px; top: 350px; text-align: center; font-family: var(--fonte-titulo); font-weight: 600; font-size: 92px; line-height: 1.04; letter-spacing: -0.035em; color: var(--gelo); }
.t-ui .cx { left: 70px; right: 70px; top: 590px; height: 730px; } /* termina antes da legenda (y 1430) */
.t-ui .cx .in { position: absolute; left: 20px; top: 30px; width: 900px; height: 660px; }
.t-ui .cx .in > .k { background: transparent; } .t-ui .cx .in > .k > .grade { display: none; }
${m.css}`,
      js: `function (t, r) { ${HZ_JS} revela($(r, '.tg'), t, 0.02, 0.2); revela($(r, '.ti'), t, 0.06, 0.25, 14);
  const cx = $(r, '.cx'); const q = mola(t - 0.1, { freq: 2.2, amort: 0.72 }); cx.style.opacity = cl(q * 2); cx.style.transform = 'translateY(' + (1 - q) * 160 + 'px)';
  (${m.js})(Math.max(0, t - 0.1), $(cx, '.in').firstElementChild); }` };
  },
};

export function montarTela(tipo, props) {
  const f = TELAS[tipo] ?? TELAS_EXTRA[tipo]; if (!f) throw new Error(`tipo de insert desconhecido: ${tipo}`);
  return f(props || {});
}
