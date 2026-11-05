// Verificador de copy (feature `copy`). Não escreve copy: reprova o que quebra as regras do motor.
// Uso (na raiz do projeto): node .claude/skills/copy-conversao/scripts/verificar.mjs <copy.json> [--html]
// Regras: CLAUDE.md do projeto (regras 1–5) e docs/processo-copy-robusta.md da skill.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Raiz do projeto = pasta de onde o comando roda (onde está copy.config.json). Pastas configuráveis em copy.config.json.
const RAIZ = process.cwd();
const CFG = existsSync(path.join(RAIZ, 'copy.config.json')) ? JSON.parse(readFileSync(path.join(RAIZ, 'copy.config.json'), 'utf8')) : {};
const REFS = CFG.referencias || 'copy/referencias';
export const ETAPAS = ['briefing', 'publico', 'linguagem', 'mecanismo', 'prova', 'rascunho', 'auditoria'];
export const CONSCIENCIA = ['inconsciente', 'problema', 'solucao', 'produto', 'total'];
const STOP = new Set(('a o as os e é de da do das dos que em no na nos nas um uma uns umas para pra pro por com se ao à às ' +
  'isso esse essa este esta isto ele ela eles elas seu sua seus suas meu minha nosso nossa você vocês eu nós a gente gente ' +
  'mais muito já foi ser ter tem têm está estão era como mas ou quando onde quem qual quais lhe lo la le me te nos vai vão ' +
  'só também então ainda até sobre entre depois antes bem aqui ali lá isso aquele aquela num numa pelo pela pelos pelas').split(' '));
const ABSOLUTOS = /\b(maioria|metade|todos|todas|nunca|sempre|ninguem|dobro|triplo|mil|milhao|milhoes|bilhao|bilhoes)\b|\d|%|r\$/;

export const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\[[^\]]*\]/g, ' ').replace(/[^a-z0-9%$ ]+/g, ' ').replace(/\s+/g, ' ').trim();
const conteudo = (s) => norm(s).split(' ').filter((w) => w && !STOP.has(w));
const ngramas = (ws, n) => { const o = []; for (let i = 0; i + n <= ws.length; i++) o.push(ws.slice(i, i + n).join(' ')); return o; };
const palavras = (s) => norm(s).split(' ').filter(Boolean).length;

function lerJSON(p, base) {
  if (!p) return null;
  for (const c of [path.resolve(base, p), path.resolve(RAIZ, p)]) if (existsSync(c)) return JSON.parse(readFileSync(c, 'utf8'));
  return null;
}
function lerTexto(p, base) {
  if (!p) return '';
  for (const c of [path.resolve(base, p), path.resolve(RAIZ, p)]) if (existsSync(c)) return readFileSync(c, 'utf8');
  return null;
}

/** Itens de texto de uma copy: [{bloco, tipo, texto, origem, b}] */
export function itens(copy) {
  return (copy.blocos || []).flatMap((bl) => (bl.itens || []).map((it) => ({ bloco: bl.papel, ...it })));
}
const ehFala = (it) => it.tipo === 'fala' || it.tipo === 'narracao';

export function verificar(copy, { briefing = '', nicho = {}, cliente = {}, existeRef = () => true } = {}) {
  const erros = [], avisos = [];
  const err = (ac, msg) => erros.push(`${ac} ${msg}`), avi = (ac, msg) => avisos.push(`${ac} ${msg}`);
  const todos = itens(copy), falas = todos.filter(ehFala);
  const textos = todos.filter((it) => ehFala(it) || it.tipo === 'tela').flatMap((it) => [{ it, t: it.texto }, ...(it.b ? [{ it, t: it.b }] : [])]);
  const gloss = (nicho.glossario || []).map((g) => conteudo(g.termo).join(' '));
  const noGlossario = (g) => gloss.some((t) => t.includes(g));
  const fatos = new Map([...(nicho.fatos || []), ...(cliente.fatos || [])].map((f) => [f.id, f]));

  // AC-101 / P-011 — briefing não vira texto
  const cb = conteudo(briefing), tri = new Set(ngramas(cb, 3)), bi = new Set(ngramas(cb, 2));
  for (const { it, t } of textos) {
    const ws = conteudo(t);
    const t3 = ngramas(ws, 3).filter((g) => tri.has(g) && !noGlossario(g));
    if (t3.length) { err('AC-101', `eco do briefing em "${t}": "${t3[0]}"`); continue; }
    const t2 = ngramas(ws, 2).filter((g) => bi.has(g) && !noGlossario(g));
    if (t2.length) avi('AC-101', `possível eco do briefing em "${t}": "${t2[0]}" (justificar ou reescrever)`);
  }
  // AC-102 / P-011 — termo proibido do nicho
  for (const p of nicho.proibidos || []) {
    const re = new RegExp(`\\b${norm(p.termo)}(s|es)?\\b`);
    for (const { t } of textos) if (re.test(norm(t))) err('AC-102', `termo proibido "${p.termo}" em "${t}" → ${p.troca} (${p.motivo})`);
  }
  // AC-103 / P-010 — só fatos
  let publicavel = true;
  for (const it of falas) {
    const f = String(it.origem || '').startsWith('fato:') ? fatos.get(it.origem.slice(5)) : null;
    if (String(it.origem || '').startsWith('fato:') && !f) err('AC-103', `fato "${it.origem}" não existe no cliente/nicho`);
    for (const t of [it.texto, it.b].filter(Boolean)) {
      if (ABSOLUTOS.test(norm(t)) && !(f && f.status === 'confirmado')) err('AC-103', `número/absoluto sem fato confirmado em "${t}"`);
      if (/\[CONFIRMAR/i.test(t)) { publicavel = false; avi('AC-103', `pendente [CONFIRMAR] em "${t}"`); }
    }
    if (f && f.status !== 'confirmado') {
      publicavel = false; avi('AC-103', `fato ${f.id} ainda "${f.status}": ${f.texto}`);
      if (!/\[CONFIRMAR/i.test(it.texto)) err('AC-103', `fala apoiada em fato não confirmado (${f.id}) sem [CONFIRMAR] no texto: "${it.texto}"`);
    }
  }
  for (const it of todos.filter((x) => !ehFala(x))) if (/\[CONFIRMAR/i.test(it.texto)) { publicavel = false; avi('AC-103', `pendente [CONFIRMAR] em ${it.tipo}: "${it.texto}"`); }
  // AC-104 — tempo
  const ritmo = copy.ritmo_ppm || 180, dur = copy.duracao || { min: 40, max: 60 }, gmax = copy.gancho_max_palavras || 15;
  const nPal = falas.reduce((s, it) => s + palavras(it.texto), 0), segundos = Math.round((nPal / ritmo) * 60);
  if (segundos < dur.min || segundos > dur.max) err('AC-104', `duração estimada ${segundos}s (${nPal} palavras a ${ritmo}/min) fora de ${dur.min}–${dur.max}s`);
  const nG = falas.filter((it) => it.bloco === 'gancho').reduce((s, it) => s + palavras(it.texto), 0);
  if (!nG) err('AC-104', 'sem fala no bloco "gancho"'); else if (nG > gmax) err('AC-104', `gancho com ${nG} palavras (máx. ${gmax})`);
  // AC-105 — toda frase tem origem
  for (const it of falas) {
    const o = String(it.origem || '');
    if (!/^(glossario|hipotese|fato:.+|referencia:.+)$/.test(o)) { err('AC-105', `fala sem origem válida: "${it.texto}"`); continue; }
    if (o === 'glossario' && !gloss.length) err('AC-105', `origem "glossario" mas o glossário do nicho está vazio: "${it.texto}"`);
    else if (o === 'glossario' && !gloss.some((g) => g && ` ${conteudo(it.texto).join(' ')} `.includes(` ${g} `))) err('AC-105', `origem "glossario" mas a fala não usa nenhum termo do glossário: "${it.texto}"`);
    if (o.startsWith('referencia:') && !existeRef(o.slice(11))) err('AC-105', `referência inexistente "${o}"`);
  }
  // AC-106 — auditoria do método
  const ck = copy.checklist || {};
  const exig = { '3cs': ['curiosidade', 'clareza', 'consequencia'], '4ganchos': ['verbal', 'textual', 'visual', 'micro'], cta: ['valor_antes', 'comando'] };
  for (const [g, ks] of Object.entries(exig)) for (const k of ks) if (!String(ck[g]?.[k] || '').trim()) err('AC-106', `checklist incompleto: ${g}.${k}`);
  if (!CONSCIENCIA.includes(copy.publico?.consciencia)) err('AC-106', `nível de consciência ausente ou inválido (${CONSCIENCIA.join('|')})`);
  const alt = (copy.ganchos_alternativos || []).filter((g) => g.texto && g.pros && g.contras);
  if (alt.length < 2) err('AC-106', `são exigidos 2 ganchos alternativos com prós e contras (há ${alt.length})`);
  // AC-108 / P-012 — handoff de cada etapa
  for (const e of ETAPAS) { const h = copy.etapas?.[e]; if (!h?.feito || !h?.proximo) err('AC-108', `etapa "${e}" sem handoff (feito + proximo)`); }

  return { erros, avisos, publicavel: publicavel && !erros.length, palavras: nPal, segundos };
}

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
export function html(copy, r) {
  const cor = { fala: '#0035D4', narracao: '#0035D4', cena: '#7a7a7a', tela: '#5a9a00', ia: '#5a9a00' };
  const fundo = { fala: '#e6ecff', narracao: '#e6ecff', cena: '#ececec', tela: '#ecf8dc', ia: '#ecf8dc' };
  const blocos = (copy.blocos || []).map((bl) => `<h2>${esc(bl.papel)}</h2>` + (bl.itens || []).map((it) =>
    `<div class="b" style="border-color:${cor[it.tipo]};background:${fundo[it.tipo]}"><span class="t">${esc(it.tipo)}</span>${esc(it.texto)}` +
    (it.b ? `<span class="vb">B: ${esc(it.b)}</span>` : '') + (it.origem ? `<span class="o">origem: ${esc(it.origem)}</span>` : '') + '</div>').join('')).join('');
  const lista = (t, xs, c) => xs.length ? `<h3 style="color:${c}">${t} (${xs.length})</h3><ul>${xs.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(copy.titulo || copy.id)}</title>
<style>body{background:#F6F6F6;color:#0D0D0D;font:17px/1.55 -apple-system,Helvetica,sans-serif;max-width:780px;margin:0 auto;padding:24px 16px 80px}
h2{font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#444;margin:28px 0 8px}.b{border-left:5px solid;padding:8px 12px;margin:6px 0;border-radius:4px}
.t{font-size:12px;font-weight:700;opacity:.7;margin-right:6px;text-transform:uppercase}.vb{display:block;color:#b26b00;font-size:15px;margin-top:4px}
.o{display:block;font-size:12px;color:#666;margin-top:4px}.st{padding:10px 12px;border-radius:6px;font-weight:600;color:#fff}</style></head><body>
<h1>${esc(copy.titulo || copy.id)}</h1>
<div class="st" style="background:${r.erros.length ? '#b00020' : r.publicavel ? '#2e7d32' : '#b26b00'}">${r.erros.length ? `REPROVADA · ${r.erros.length} erro(s)` : r.publicavel ? 'APROVADA PELO VERIFICADOR · publicável' : 'SEM ERROS · não publicável (pendências)'} · ${r.palavras} palavras ≈ ${r.segundos}s</div>
${lista('Erros', r.erros, '#b00020')}${lista('Avisos', r.avisos, '#b26b00')}${blocos}</body></html>`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const arq = process.argv[2]; if (!arq) { console.error('uso: node .claude/skills/copy-conversao/scripts/verificar.mjs <copy.json> [--html]'); process.exit(2); }
  const base = path.dirname(path.resolve(arq)), copy = JSON.parse(readFileSync(arq, 'utf8'));
  const briefing = lerTexto(copy.briefing, base);
  const r = verificar(copy, {
    briefing: briefing ?? '', nicho: lerJSON(copy.nicho, base) || {}, cliente: lerJSON(copy.cliente, base) || {},
    existeRef: (x) => existsSync(path.join(RAIZ, REFS, x.endsWith('.md') ? x : `${x}.md`)),
  });
  if (copy.briefing && briefing === null) r.erros.unshift(`AC-101 briefing não encontrado: ${copy.briefing}`);
  for (const e of r.erros) console.log('ERRO  ', e);
  for (const a of r.avisos) console.log('AVISO ', a);
  console.log(`${r.erros.length ? 'REPROVADA' : r.publicavel ? 'APROVADA (publicável)' : 'SEM ERROS (não publicável: pendências)'} · ${r.palavras} palavras ≈ ${r.segundos}s`);
  if (process.argv.includes('--html')) {
    const out = arq.replace(/\.json$/, '.html'), { injetar } = await import('./anotar.mjs').catch(() => ({}));
    const pg = html(copy, r); writeFileSync(out, injetar ? injetar(pg) : pg); console.log('página:', out);
  }
  process.exit(r.erros.length ? 1 : 0);
}
