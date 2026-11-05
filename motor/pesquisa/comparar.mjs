// Compara grupos medidos por metrificar.mjs: média por grupo e distância percentual contra a referência escolhida.
// Uso: node motor/pesquisa/comparar.mjs <metricas.json> <saida.md> "NOSSO::REF1 || REF2" ["NOSSO2::REF3" ...]
import { readFileSync, writeFileSync } from 'node:fs';
const [arq, saida, ...pares] = process.argv.slice(2);
const dados = JSON.parse(readFileSync(arq, 'utf8'));
const M = [['palavras', 'Palavras por slide', 0], ['titulo', 'Maior título (% da altura)', 100], ['areaTexto', 'Área coberta por texto (%)', 100], ['plano', 'Área lisa, sem textura (%)', 100],
  ['contraste', 'Contraste (desvio do brilho)', 0], ['sat', 'Saturação média (%)', 100], ['paleta', 'Cores ≥1% da área', 0], ['detalhe', 'Detalhe/textura (%)', 100], ['lum', 'Brilho médio (0–255)', 0]];
const media = (g, k, esc) => { const v = (dados[g] || []).map((x) => x[k]); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length) * (esc || 1) : NaN; };
const f = (x) => (Number.isNaN(x) ? '—' : x >= 100 ? x.toFixed(0) : x.toFixed(1));
let md = `# Comparativo medido: nossos slides × referências\n\nMédias por grupo; "Δ" = (nosso − referência) ÷ referência. Medido com \`motor/pesquisa/metrificar.mjs\` (OCR do Vision + estatística de pixels), em 03/11/2026.\n\n`;
for (const par of pares) {
  const [nosso, refs] = par.split('::'); const lista = refs.split(' || ');
  md += `## ${nosso}  ×  ${lista.join(' + ')}\n\n| Medida | Nosso | ${lista.map((r) => r.replace(/^REF · /, '')).join(' | ')} | Δ vs. média das refs |\n|---|---|${lista.map(() => '---|').join('')}---|\n`;
  for (const [k, nome, esc] of M) {
    const n = media(nosso, k, esc), rs = lista.map((r) => media(r, k, esc)), rm = rs.filter((x) => !Number.isNaN(x)).reduce((a, b) => a + b, 0) / rs.filter((x) => !Number.isNaN(x)).length;
    const d = rm ? ((n - rm) / rm) * 100 : NaN; md += `| ${nome} | ${f(n)} | ${rs.map(f).join(' | ')} | ${Number.isNaN(d) ? '—' : (d > 0 ? '+' : '') + d.toFixed(0) + '%'} |\n`;
  }
  md += '\n';
}
writeFileSync(saida, md); console.log(md);
