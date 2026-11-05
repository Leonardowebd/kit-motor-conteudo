// Peças comuns das telas de insert (visual.mjs e telas-extra.mjs).
export const MONO = `'SF Mono', ui-monospace, Menlo, monospace`;
// fundo animado: forma 'horizonte'/'topo' = fundo do tema (horizonte() em visual.mjs/temas.mjs);
// 'pontos' | 'hud' | 'planta' = fundos fixos da biblioteca de texturas (Base/texturas-design.md 11, 12, 17)
export const CANVAS = (forma) => `<div class="hz" data-forma="${forma}"><canvas width="540" height="960"></canvas></div>`;
export const HZ_JS = `{ const hz = $(r, '.hz'); if (hz) fundo($(hz, 'canvas'), t, hz.dataset.forma); }`;

// Canvas em meia resolução (540×960). Determinístico por t (hash2 vem do JS_VISUAL).
export const JS_FUNDOS = `
function fundo(cv, t, forma) {
  if (forma === 'pontos') return fundoPontos(cv, t);
  if (forma === 'hud') return fundoHud(cv, t);
  if (forma === 'planta') return fundoPlanta(cv, t);
  return horizonte(cv, t, forma);
}
// 17: matriz de pontos iluminada de um canto (a luz passeia devagar)
function fundoPontos(cv, t) {
  const W = cv.width, H = cv.height, g = cv.getContext('2d'); g.fillStyle = '#03050c'; g.fillRect(0, 0, W, H);
  const lx = W * (0.18 + 0.1 * Math.sin(t * 0.5)), ly = -H * 0.05, s = 7;
  for (let y = 2; y < H; y += s) for (let x = 2; x < W; x += s) {
    const d = Math.hypot(x - lx, (y - ly) * 0.8) / (H * 0.75), v = Math.max(0, 1 - d) ** 1.6 * (0.55 + 0.45 * hash2(x, y + Math.floor(t * 6)));
    if (v < 0.03) continue; const c = v > 0.6 ? [165, 196, 255] : v > 0.3 ? [77, 123, 255] : [0, 53, 212];
    g.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + Math.min(1, v * 1.3).toFixed(3) + ')'; g.fillRect(x, y, 3, 3);
  }
}
// 11: HUD — hachura diagonal, cruzinhas, cruzes grandes nas interseções, blocos hachurados que mudam de lugar
function fundoHud(cv, t) {
  const W = cv.width, H = cv.height, g = cv.getContext('2d'); g.fillStyle = '#020a14'; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(77,123,255,0.07)'; g.lineWidth = 1;
  for (let k = -H; k < W; k += 9) { g.beginPath(); g.moveTo(k, H); g.lineTo(k + H, 0); g.stroke(); }
  const C = 96, passo = Math.floor(t * 1.2);
  for (let b = 0; b < 3; b++) { const cx = Math.floor(hash2(b, passo) * (W / C)) * C, cy = Math.floor(hash2(b + 9, passo) * (H / C)) * C;
    g.fillStyle = 'rgba(0,53,212,0.16)'; g.fillRect(cx, cy, C, C); }
  g.fillStyle = 'rgba(246,246,246,0.28)';
  for (let y = 12; y < H; y += 24) for (let x = 12; x < W; x += 24) { g.fillRect(x - 2, y, 5, 1); g.fillRect(x, y - 2, 1, 5); }
  g.strokeStyle = 'rgba(246,246,246,0.75)'; g.lineWidth = 1.2;
  for (let y = C; y < H; y += C) for (let x = C; x < W; x += C) { g.beginPath(); g.moveTo(x - 9, y); g.lineTo(x + 9, y); g.moveTo(x, y - 9); g.lineTo(x, y + 9); g.stroke(); }
  g.fillStyle = 'rgba(165,196,255,0.9)'; for (let k = 0; k < 4; k++) if (hash2(k, Math.floor(t * 3)) > 0.4) g.fillRect(Math.floor(hash2(k, 3) * W), Math.floor(hash2(k, 5) * H), 3, 3);
}
// 12: planta — fundo azul desfocado em movimento, régua numerada, grade, linhas de ângulo tracejadas e arco
function fundoPlanta(cv, t) {
  const W = cv.width, H = cv.height, g = cv.getContext('2d'); g.fillStyle = '#00197a'; g.fillRect(0, 0, W, H);
  for (let k = 0; k < 3; k++) { const x = W * (0.3 + 0.4 * Math.sin(t * 0.3 + k * 2.1)), y = H * (0.3 + 0.4 * Math.cos(t * 0.25 + k * 1.7));
    const gr = g.createRadialGradient(x, y, 0, x, y, W * 0.7); gr.addColorStop(0, 'rgba(0,53,212,0.9)'); gr.addColorStop(1, 'rgba(0,53,212,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
  const m = 46, x0 = m, x1 = W - m, y0 = 60, y1 = H - 60, n = 20, cw = (x1 - x0) / n, rows = Math.floor((y1 - y0) / cw);
  for (let i = 0; i <= n; i++) { const x = x0 + i * cw; g.strokeStyle = i % 5 ? 'rgba(246,246,246,0.12)' : 'rgba(246,246,246,0.4)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 + rows * cw); g.stroke(); }
  for (let j = 0; j <= rows; j++) { const y = y0 + j * cw; g.strokeStyle = j % 5 ? 'rgba(246,246,246,0.12)' : 'rgba(246,246,246,0.4)'; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); }
  g.fillStyle = 'rgba(246,246,246,0.75)'; g.font = '9px ${MONO.replace(/'/g, '')}'; g.textAlign = 'center';
  for (let i = 0; i <= n; i += 5) { g.fillText(String(i), x0 + i * cw, y0 - 14); g.fillText(String(i), x0 + i * cw, y0 + rows * cw + 20); }
  for (let i = 0; i <= n; i++) { g.fillRect(x0 + i * cw, y0 - 8, 1, i % 5 ? 4 : 7); }
  const ox = x0, oy = y0 + rows * cw, R = (x1 - x0), cres = Math.min(1, t / 1.2); g.setLineDash([4, 4]); g.strokeStyle = 'rgba(246,246,246,0.55)';
  [15, 30, 45, 60].forEach((a) => { const r = a * Math.PI / 180; g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + Math.cos(r) * R * 1.4 * cres, oy - Math.sin(r) * R * 1.4 * cres); g.stroke();
    g.fillText(a + '°', ox + Math.cos(r) * R * 0.32, oy - Math.sin(r) * R * 0.32 - 4); });
  g.setLineDash([]); g.beginPath(); g.arc(ox, oy, R, -Math.PI / 2 * cres, 0); g.stroke();
}`;
