// Temas de UI (Base/variacoes-ui.md): mesma identidade (cores, fontes, legenda, esqueleto), pele diferente por vídeo.
// Um tema troca juntas: moldura dos cards (.vidro), fundo animado (horizonte do canvas), título/etiqueta e entrada.
// css: vem depois do CSS das telas, com prefixo body.tema-<nome> para ganhar delas.
// js: redeclara function horizonte(cv, t, forma) (a última declaração vale) — o fundo de todas as telas muda junto.
// entrada: 'zoom' (zoom 1,12→1 + desfoque) | 'seco' (corte seco com deslize curto) | 'traco' (a tela se desenha de cima para baixo).
const E = 'body.tema-editorial', L = 'body.tema-linha';

export const TEMAS = {
  vidro: { css: '', js: '', entrada: 'zoom' },

  // ref. leobeckerdesign "01 Escolha um estilo", LBK Media House: papel gelo, moldura fina com sombra azul chapada,
  // número grande do insert e contador de página, título pesado alinhado à esquerda
  editorial: {
    entrada: 'seco',
    css: `
${E} .hz { background: var(--gelo); }
${E} .ins::before { content: attr(data-n); position: absolute; left: 80px; top: 150px; z-index: 4; font-family: var(--fonte-titulo); font-weight: 700; font-size: 120px; line-height: 1; letter-spacing: -0.05em; color: var(--azul); }
${E} .ins::after { content: attr(data-pg); position: absolute; left: 80px; right: 80px; top: 118px; z-index: 4; border-top: 3px solid var(--noite); padding-top: 14px; text-align: right; font-family: var(--fonte-mono); font-size: 26px; letter-spacing: 0.08em; color: var(--noite); }
${E} .ins.div::before, ${E} .ins.div::after, ${E} .ins.cheia::before, ${E} .ins.cheia::after { display: none; }
${E} .ins:has(.t-cel)::before { display: none; }
/* fundos fixos escuros da biblioteca (pontos/hud/planta): texto volta a ser claro */
${E} .ins.escuro .ti, ${E} .ins.escuro .tag, ${E} .ins.escuro .t-tipo .pal.gelo .w { color: var(--gelo); } ${E} .ins.escuro::after { color: var(--gelo); border-color: var(--gelo); } ${E} .ins.escuro::before { color: var(--azul-claro); }
${E} .ins.escuro .tag::before { background: var(--limao); }
${E} .ins.escuro .vidro { background: linear-gradient(180deg, #0a0f1f, #070a14); box-shadow: inset 0 0 0 2px rgba(246,246,246,0.14), 12px 12px 0 var(--azul); } /* o celular ocupa a altura toda: sem número grande */
${E} .ti, ${E} .t-edit .mc { color: var(--noite); text-align: left; font-weight: 700; letter-spacing: -0.02em; word-spacing: 0.08em; }
${E} .tg { text-align: left !important; padding-left: 80px; }
${E} .tag { color: var(--noite); } ${E} .tag::before { background: var(--azul); }
${E} .t-tipo .pal.gelo .w { color: var(--noite); }
${E} .t-tipo .pal.limao .w { color: var(--noite); background: var(--limao); padding: 0 0.12em; }
${E} .t-tipo .sub { color: rgba(3,5,12,0.7); }
${E} .vidro { background: #fff; border-radius: 6px; box-shadow: 0 0 0 3px var(--noite), 16px 16px 0 var(--azul); }
${E} .t-midia .cr, ${E} .t-cena .cr { color: rgba(3,5,12,0.62); }
${E} .t-logos .x { color: var(--azul); }
${E} .t-grafo .ar { stroke: var(--azul); } ${E} .t-grafo .nn { fill: var(--azul); } ${E} .t-grafo .nr { fill: var(--limao); stroke: var(--noite); stroke-width: 3; }
${E} .t-grafo .halo { fill: rgba(0,53,212,0.12); } ${E} .t-grafo text { fill: var(--noite); }
${E} .flut span { color: var(--gelo); background: var(--azul); box-shadow: none; border-radius: 6px; }
${E} .t-term .cmd { color: var(--noite); } ${E} .t-term .ok { color: var(--azul); } ${E} .t-term .out { color: rgba(3,5,12,0.7); }
${E} .t-term .bar { border-color: rgba(3,5,12,0.12); } ${E} .t-term .bar span { color: rgba(3,5,12,0.55); } ${E} .t-term .bar i { background: rgba(3,5,12,0.2); }
${E} .t-chat .ap { color: var(--noite); border-color: rgba(3,5,12,0.12); } ${E} .t-chat .ou .tx, ${E} .t-chat .dg { background: #e9edf7; color: var(--noite); box-shadow: none; } ${E} .t-chat .dg i { background: var(--noite); }
${E} .t-notif .cx { color: var(--noite); } ${E} .t-notif .pilha { background: rgba(3,5,12,0.08); }
${E} .t-pass .trilho { background: rgba(3,5,12,0.14); } ${E} .t-pass .nb { background: #fff; color: var(--noite); box-shadow: inset 0 0 0 4px var(--noite); }
${E} .t-pass .it.on .nb { background: var(--limao); box-shadow: inset 0 0 0 4px var(--noite), 6px 6px 0 var(--azul); } ${E} .t-pass .rt { color: rgba(3,5,12,0.32); } ${E} .t-pass .it.on .rt { color: var(--noite); }
${E} .t-ad .cd .tx { color: var(--noite); }
${E} .t-rol .rw { color: rgba(3,5,12,0.45); } ${E} .t-rol .rw.on { color: var(--noite); } ${E} .t-rol .seta { color: var(--azul); }
${E} .t-lupa .pw { color: rgba(3,5,12,0.25); } ${E} .t-lupa .pw.dentro { color: var(--noite); } ${E} .t-lupa .pw.fim { color: var(--azul); background: var(--limao); }
${E} .t-lupa .lente { box-shadow: inset 0 0 0 7px var(--noite); background: rgba(0,53,212,0.06); } ${E} .t-lupa .lente i { background: var(--noite); }
${E} .t-cel .cr, ${E} .t-pola .cr { color: rgba(3,5,12,0.62); }`,
    js: `
function horizonte(cv, t, forma) {
  const W = cv.width, H = cv.height, g = cv.getContext('2d');
  g.fillStyle = '#f6f6f6'; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(0,53,212,0.07)'; g.lineWidth = 1;
  for (let y = 36; y < H; y += 24) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke(); }
  const tick = Math.floor(t * 12); // granulação de papel, troca 12×/s
  for (let i = 0; i < 1600; i++) { g.fillStyle = 'rgba(3,5,12,' + (0.025 + hash2(i, 7) * 0.05) + ')'; g.fillRect(hash2(i, tick) * W, hash2(i * 1.7, tick + 3) * H, 1, 1); }
}`,
  },

  // ref. hairline (ilustrações lineares) e Harvey (cards em traço): tudo em traço sobre grade de pontos que pulsa
  linha: {
    entrada: 'traco',
    css: `
${L} .vidro { background: rgba(3,5,12,0.55); border-radius: 14px; box-shadow: inset 0 0 0 2px rgba(246,246,246,0.92), 0 0 0 12px rgba(3,5,12,0), 0 0 0 14px rgba(77,123,255,0.45); }
${L} .tag { padding: 8px 18px; box-shadow: inset 0 0 0 2px rgba(246,246,246,0.85); }
${L} .tag::before { background: transparent; box-shadow: inset 0 0 0 3px var(--limao); }
${L} .ti { font-weight: 500; letter-spacing: -0.03em; }
${L} .vidro::after { content: ''; position: absolute; inset: 18px; border: 2px dashed rgba(77,123,255,0.55); border-radius: 8px; pointer-events: none; }
${L} .flut span { background: transparent; box-shadow: inset 0 0 0 2px var(--gelo); }
${L} .t-logos .x { color: var(--gelo); font-weight: 400; }
${L} .t-grafo .nn { fill: none; stroke: var(--gelo); stroke-width: 3; } ${L} .t-grafo .halo { fill: none; stroke: rgba(246,246,246,0.25); stroke-width: 2; }
${L} .t-grafo .ar { stroke: rgba(246,246,246,0.7); stroke-width: 2; }
${L} .t-pass .nb { background: transparent; } ${L} .t-pass .it.on .nb { background: transparent; color: var(--limao); box-shadow: inset 0 0 0 4px var(--limao); }
${L} .t-chat .eu .tx { background: transparent; box-shadow: inset 0 0 0 2px var(--azul-claro); } ${L} .t-chat .ou .tx { background: transparent; box-shadow: inset 0 0 0 2px rgba(246,246,246,0.6); }
${L} .t-cubo .fc { background: rgba(3,5,12,0.35); box-shadow: inset 0 0 0 3px var(--gelo); } ${L} .t-cubo .tp, ${L} .t-cubo .bt { background: rgba(3,5,12,0.35); }
${L} .t-cel .cel { box-shadow: inset 0 0 0 3px var(--gelo), 0 0 0 14px rgba(3,5,12,0), 0 0 0 16px rgba(77,123,255,0.45); }`,
    js: `
function horizonte(cv, t, forma) {
  const W = cv.width, H = cv.height, g = cv.getContext('2d');
  g.fillStyle = '#03050c'; g.fillRect(0, 0, W, H);
  const cy = forma === 'topo' ? 0 : H, s = 16;
  for (let y = 8; y < H; y += s) for (let x = 8; x < W; x += s) { // onda saindo do horizonte
    const d = Math.hypot(x - W / 2, y - cy) / W, a = 0.16 + 0.5 * Math.max(0, Math.sin(d * 9 - t * 2.4)) * Math.max(0, 1 - d * 0.8);
    g.fillStyle = 'rgba(165,196,255,' + a.toFixed(3) + ')'; g.fillRect(x, y, 2, 2);
  }
  g.lineWidth = 1.5; // arcos em traço saindo do horizonte (ilustração linear), crescendo com o tempo
  for (let k = 0; k < 7; k++) { const r = ((k / 7 + t * 0.08) % 1) * H * 1.1; g.strokeStyle = 'rgba(246,246,246,' + (0.32 * (1 - r / (H * 1.1))).toFixed(3) + ')';
    g.beginPath(); g.arc(W / 2, cy, r, 0, Math.PI * 2); g.stroke(); }
}`,
  },
};

export function temaDe(nome = 'vidro') {
  const t = TEMAS[nome];
  if (!t) throw new Error(`tema de UI desconhecido: ${nome} (existem: ${Object.keys(TEMAS).join(', ')})`);
  return t;
}
