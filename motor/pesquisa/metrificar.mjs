// Mede imagens (referências × nossos slides) para comparar o quanto uma peça se afasta da referência.
// Uso: node motor/pesquisa/metrificar.mjs <config.json> <saida.json>
//   config.json = { "NOME DO GRUPO": ["/caminho/img1.png", ...], ... }
// Por imagem: lum (brilho médio 0–255), contraste (desvio do brilho), sat (saturação média 0–1), paleta (nº de cores que ocupam ≥1%),
// plano (% da área sem textura = fundo liso), detalhe (gradiente médio), palavras, areaTexto (% da imagem coberta por texto), titulo (altura da maior linha, % da altura).
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const [cfgPath, saida] = process.argv.slice(2);
const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
const ocrBin = path.join(AQUI, 'ocr-bin');
const mime = (f) => (/\.png$/i.test(f) ? 'image/png' : 'image/jpeg');

const b = await chromium.launch();
const pg = await b.newPage();
await pg.setContent('<canvas id=c></canvas>');
const medir = (b64, tipo) => pg.evaluate(async ([b64, tipo]) => {
  const img = new Image(); img.src = `data:${tipo};base64,${b64}`; await img.decode();
  const W = 360, H = Math.round(img.naturalHeight * W / img.naturalWidth), c = document.getElementById('c'); c.width = W; c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H).data, n = W * H, Y = new Float32Array(n), bins = new Uint32Array(512);
  let s = 0, s2 = 0, sat = 0;
  for (let i = 0; i < n; i++) {
    const r = d[i * 4], gg = d[i * 4 + 1], bb = d[i * 4 + 2], y = 0.2126 * r + 0.7152 * gg + 0.0722 * bb; Y[i] = y; s += y; s2 += y * y;
    const mx = Math.max(r, gg, bb), mn = Math.min(r, gg, bb); sat += mx ? (mx - mn) / mx : 0; bins[((r >> 5) << 6) | ((gg >> 5) << 3) | (bb >> 5)]++;
  }
  const m = s / n; let grad = 0;
  for (let y = 0; y < H - 1; y++) for (let x = 0; x < W - 1; x++) { const i = y * W + x; grad += (Math.abs(Y[i + 1] - Y[i]) + Math.abs(Y[i + W] - Y[i])) / 2; }
  let lisos = 0, blocos = 0; const B = 12;
  for (let by = 0; by + B <= H; by += B) for (let bx = 0; bx + B <= W; bx += B) {
    let a = 0, a2 = 0; for (let y = 0; y < B; y++) for (let x = 0; x < B; x++) { const v = Y[(by + y) * W + bx + x]; a += v; a2 += v * v; }
    const mm = a / (B * B), sd = Math.sqrt(Math.max(0, a2 / (B * B) - mm * mm)); blocos++; if (sd < 5) lisos++;
  }
  return { lum: m, contraste: Math.sqrt(Math.max(0, s2 / n - m * m)), sat: sat / n, paleta: [...bins].filter((v) => v / n >= 0.01).length, plano: lisos / blocos, detalhe: grad / (n * 255) };
}, [b64, tipo]);

const resultado = {};
for (const [grupo, arqs] of Object.entries(cfg)) {
  const ocr = {};
  for (let i = 0; i < arqs.length; i += 40) for (const l of execFileSync(ocrBin, arqs.slice(i, i + 40), { maxBuffer: 1 << 26 }).toString().trim().split('\n')) { try { const j = JSON.parse(l); ocr[j.arquivo] = j; } catch { /* linha vazia */ } }
  resultado[grupo] = [];
  for (const f of arqs) {
    const px = await medir(readFileSync(f).toString('base64'), mime(f)), o = ocr[path.basename(f)] || {};
    resultado[grupo].push({ arquivo: f, ...px, palavras: o.palavras ?? 0, areaTexto: o.areaTexto ?? 0, titulo: o.maiorTexto ?? 0 });
  }
  console.log(grupo, resultado[grupo].length);
}
await b.close();
writeFileSync(saida, JSON.stringify(resultado, null, 1));
