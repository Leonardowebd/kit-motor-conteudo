// T-004 — Legenda no estilo E1 (Base/referencias-video.md).
// agruparLegendas é pura; paginaLegenda gera HTML 1080x1920 transparente com window.seek(t).
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

export const AREA_SEGURA = { topo: 220, base: 250, lateral: 90 };
export const LARGURA = 1080;
export const ALTURA = 1920;

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const STOP = new Set(['porque', 'quando', 'também', 'depois', 'agora', 'sempre', 'aquele', 'aquela', 'nenhum', 'alguma', 'algum', 'muito', 'muita', 'outros', 'outras', 'entre', 'sobre', 'estava', 'estou', 'tinha', 'fazer', 'vamos', 'assim', 'então', 'ainda', 'apenas']);
const letras = (s) => s.replace(/[^\p{L}\p{N}]/gu, '');

// Heurística: número > palavra ≥6 letras não-funcional (penaliza verbos no gerúndio/infinitivo e advérbios).
function escolherDestaque(palavras) {
  let melhor = null, nota = -Infinity;
  palavras.forEach((p, i) => {
    const l = letras(p.texto);
    const base = l.toLowerCase();
    let n;
    if (/\d/.test(l)) n = 100 + l.length;
    else if (l.length >= 6 && !STOP.has(base)) {
      n = l.length;
      if (/(mente|ando|endo|indo|ar|er|ir|ava|ou)$/.test(base)) n -= 4;
    } else return;
    if (n > nota) { nota = n; melhor = i; }
  });
  return melhor;
}

export function agruparLegendas(palavras, { maxPalavras = 4, maxCaracteres = 22, maxDuracao = 1.6, pausaQuebra = 0.45 } = {}) {
  const blocos = [];
  let atual = [];
  const linhas = (ps) => { // quebra gulosa em linhas de até maxCaracteres
    const out = []; let l = '';
    for (const p of ps) { const c = l ? `${l} ${p.texto}` : p.texto; if (l && c.length > maxCaracteres) { out.push(l); l = p.texto; } else l = c; }
    if (l) out.push(l);
    return out.length;
  };
  const fechar = () => {
    if (!atual.length) return;
    blocos.push({ ini: atual[0].ini, fim: atual.at(-1).fim, palavras: atual.map((p) => ({ ...p })), destaque: escolherDestaque(atual) });
    atual = [];
  };
  for (const p of palavras) {
    if (atual.length) {
      const ult = atual.at(-1);
      const cand = [...atual, p];
      if (atual.length >= maxPalavras || linhas(cand) > 2 || p.fim - atual[0].ini > maxDuracao
        || p.ini - ult.fim > pausaQuebra || /[.!?…]$/.test(ult.texto)) fechar();
    }
    atual.push(p);
  }
  fechar();
  // segura o bloco até o próximo começar se o buraco for curto (evita piscar), sem sobrepor
  for (let i = 0; i < blocos.length - 1; i++) {
    const gap = blocos[i + 1].ini - blocos[i].fim;
    if (gap > 0 && gap < 0.3) blocos[i].fim = blocos[i + 1].ini;
  }
  return blocos;
}

export function pastaFontes() {
  let acervo;
  let identidade = 'Identidade';
  try { const cfg = JSON.parse(readFileSync(path.join(RAIZ, 'conteudo.config.json'), 'utf8')); acervo = cfg.acervo; identidade = cfg.identidade || identidade; } catch { /* sem config */ }
  acervo = process.env.MOTOR_ACERVO || acervo;
  if (!acervo) throw new Error('acervo não configurado (conteudo.config.json ou MOTOR_ACERVO)');
  const id = path.join(acervo, process.env.MOTOR_IDENTIDADE || identidade);
  return {
    clash: pathToFileURL(path.join(id, 'ClashDisplay_Complete/Fonts/WEB/fonts')).href,
    satoshi: pathToFileURL(path.join(id, 'Satoshi_Complete/Fonts/WEB/fonts')).href,
  };
}

export function cssMarca() {
  const f = pastaFontes();
  return readFileSync(path.join(RAIZ, 'motor/marca/marca.css'), 'utf8')
    .replaceAll('{{FONTES_CLASH}}', f.clash).replaceAll('{{FONTES_SATOSHI}}', f.satoshi);
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function paginaLegenda(blocos) {
  const { base, lateral } = AREA_SEGURA;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${cssMarca()}
#leg { position: absolute; left: ${lateral + 20}px; right: ${lateral + 20}px; bottom: ${base + 170}px;
  text-align: center; font-family: var(--fonte-texto); font-weight: 700; font-size: 74px; line-height: 1.12;
  letter-spacing: -0.01em; color: var(--gelo); text-wrap: balance;
  text-shadow: 0 4px 18px rgba(13,13,13,0.55), 0 0 3px rgba(13,13,13,0.9);
  -webkit-text-stroke: 1.5px rgba(13,13,13,0.35); }
#leg .p { display: inline-block; margin: 0 0.03em; }
#leg .d { color: var(--limao); }
</style></head><body><div id="leg"></div><script>
const B = ${JSON.stringify(blocos)};
const el = document.getElementById('leg');
let mostrado = -1;
window.seek = (t) => {
  const i = B.findIndex((b) => t >= b.ini && t < b.fim);
  if (i !== mostrado) {
    mostrado = i;
    el.innerHTML = i < 0 ? '' : B[i].palavras.map((p, k) =>
      '<span class="p' + (k === B[i].destaque ? ' d' : '') + '">' + p.texto.replace(/[&<>]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])) + '</span>').join(' ');
  }
  // leve pop de entrada (mola fechada) na troca de bloco
  if (i >= 0) {
    const dt = Math.max(0, t - B[i].ini), w = 2 * Math.PI * 3.2, z = 0.55, wd = w * Math.sqrt(1 - z * z);
    const x = 1 - Math.exp(-z * w * dt) * (Math.cos(wd * dt) + (z * w / wd) * Math.sin(wd * dt));
    el.style.transform = 'scale(' + (0.9 + 0.1 * x) + ')';
  }
  return i;
};
window.seek(0);
</script></body></html>`;
}

export { esc };
