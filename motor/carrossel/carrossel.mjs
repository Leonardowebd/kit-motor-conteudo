// Carrossel do Instagram: roteiro JSON → validação → slides HTML na marca → PNG 1080×1350 + prancha + legenda.
// Uso: node motor/carrossel/carrossel.mjs <pasta>/carrossel.json
// Estrutura do roteiro e regras de copy: Base/roteiro-copy/carrossel.md. Spec: .spec/features/carrossel.
// Marcação no texto: *trecho* = acento limão (no máximo 1 por slide) · **trecho** = negrito branco.
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { cssMarca } from '../video/legenda.mjs';

export const LARGURA = 1080, ALTURA = 1350;
export const TIPOS = ['capa', 'post', 'texto', 'numero', 'lista', 'grade', 'comparacao', 'imagem', 'cta'];
export const PAPEIS = ['gancho', 'desenvolvimento', 'prova', 'virada', 'cta'];
const perfil = JSON.parse(readFileSync(new URL('../marca/perfil.json', import.meta.url), 'utf8'));
const selo = readFileSync(new URL('../marca/selo-verificado.svg', import.meta.url), 'utf8');
function fotoPerfil() {
  let acervo = process.env.MOTOR_ACERVO;
  try { acervo ||= JSON.parse(readFileSync(new URL('../../conteudo.config.json', import.meta.url), 'utf8')).acervo; } catch { /* sem config */ }
  const f = acervo && path.join(acervo, perfil.fotoPerfil);
  return f && existsSync(f) ? pathToFileURL(f).href : '';
}

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const marcar = (s = '') => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em class="a">$1</em>');
const acentosNoTexto = (s = '') => (String(s).replace(/\*\*(.+?)\*\*/g, '').match(/\*(.+?)\*/g) || []).length;
const textos = (s) => [s.sobre, s.titulo, s.gigante, s.texto, s.autor, s.sub, s.corpo, s.legenda_imagem, ...(s.itens || []).map((i) => (typeof i === 'string' ? i : i.texto)),
  ...[s.a, s.b].filter(Boolean).flatMap((c) => [c.rotulo, ...(c.itens || [])])].filter(Boolean);

// Acento limão por slide: o que o autor marcou + o que o próprio tipo já pinta (número, item destacado, palavra do CTA).
export function acentos(s) {
  if (s.visual) return textos(s).reduce((n, t) => n + acentosNoTexto(t), 0) + acentos({ ...s.visual, papel: s.papel });
  const implicito = s.tipo === 'numero' || s.tipo === 'cta' || (s.tipo === 'grade' && (Number.isInteger(s.destaque) || s.destaque === 'todos')) || (s.tipo === 'barras' && Number.isInteger(s.destaque)) || s.pontos?.destaque?.length ? 1 : 0;
  return textos(s).reduce((n, t) => n + acentosNoTexto(t), implicito);
}

// Anti-slop (adaptado de unslop, CC BY 4.0, Damir Sokolovsky — github.com/heydamir/unslop): copy sem os sinais clássicos.
const HYPE = /\b(incr[ií]vel|revolucion[aá]ri[oa]|revolucionar|m[aá]gic[oa]|supercharge|transforme|desbloqueie|poderos[oa]|imperd[ií]vel|sensacional|game.?changer|seamless)\b/i;
export function lint(r) {
  const e = [];
  (r.slides || []).forEach((s, i) => {
    const n = `slide ${i + 1}`;
    const campos = [['titulo', s.titulo], ['sub', s.sub], ['gigante', s.gigante], ['sobre', s.sobre], ['visual.titulo', s.visual?.titulo]];
    for (const [k, v] of campos) if (typeof v === 'string' && /\.\s*$/.test(v)) e.push(`${n}: ${k} termina com ponto final`);
    const todos = [...textos(s), ...(s.visual ? textos(s.visual) : []), s.palavra, s.entregavel, s.segue].filter(Boolean).join('\n');
    if (todos.includes('!')) e.push(`${n}: exclamação no texto`);
    if (/\p{Extended_Pictographic}/u.test(todos)) e.push(`${n}: emoji no texto`);
    const h = todos.match(HYPE); if (h) e.push(`${n}: palavra de hype "${h[0]}"`);
  });
  return e;
}

// AC-001 (estrutura narrativa) + regra 8 do AGENTS.md (sem número sem fonte). Devolve a lista de problemas.
export function validar(r) {
  const erros = [], S = r.slides || [];
  if (S.length < 6 || S.length > 10) erros.push(`precisa de 6 a 10 slides (tem ${S.length})`);
  S.forEach((s, i) => {
    const n = `slide ${i + 1}`;
    if (!TIPOS.includes(s.tipo)) erros.push(`${n}: tipo "${s.tipo}" desconhecido (${TIPOS.join(', ')})`);
    if (!PAPEIS.includes(s.papel)) erros.push(`${n}: papel "${s.papel}" desconhecido (${PAPEIS.join(', ')})`);
    if (acentos(s) > 1) erros.push(`${n}: ${acentos(s)} acentos — máximo 1 por slide`);
    if (s.tipo === 'imagem' && !s.imagens?.length && (!s.imagem || !s.credito)) erros.push(`${n}: imagem precisa de "imagem" e "credito"`);
    if (s.imagens && !s.imagens.every((m) => m.src && m.credito)) erros.push(`${n}: cada item de "imagens" precisa de "src" e "credito"`);
    if (s.imagem && ['capa', 'cta'].includes(s.tipo) && !s.ia && !s.credito) erros.push(`${n}: imagem de fundo precisa de "ia": true (gerada) ou "credito"`);
    if (s.rosto === 'famoso' && !s.parodia) erros.push(`${n}: rosto de famoso só como paródia evidente ("parodia": true)`);
    if (s.rosto === 'famoso' && s.tipo === 'cta') erros.push(`${n}: rosto de famoso nunca no slide do CTA (pareceria endosso)`);
    if (s.tipo === 'grade' && !(s.itens?.length >= 3)) erros.push(`${n}: grade precisa de 3+ itens`);
    if (s.pontos && !(s.pontos.total >= 2 && s.pontos.total <= 40)) erros.push(`${n}: pontos.total entre 2 e 40`);
  });
  if (S.length) {
    if (S[0].tipo !== 'capa' || S[0].papel !== 'gancho') erros.push('slide 1 tem que ser capa com papel "gancho"');
    const u = S.at(-1);
    if (u.tipo !== 'cta' || u.papel !== 'cta' || !u.palavra || !u.entregavel) erros.push('último slide tem que ser cta com "palavra" e "entregavel" nomeado');
    if (!S.some((s) => s.papel === 'virada')) erros.push('falta um slide com papel "virada"');
    if (S.slice(0, -1).some((s) => s.tipo === 'cta')) erros.push('CTA só no último slide (depois da maior entrega)');
  }
  // Estrutura "post" é um norte (2026-11-03): hook de impacto com imagem → body (cards de post de preferência, elementos variam)
  // → CTA com foto do criador. Só o que é inegociável vira erro: imagem no hook e no CTA.
  if (r.estrutura === 'post' && S.length) {
    if (!S[0].imagem) erros.push('estrutura post: o hook (slide 1) precisa de imagem');
    if (!S.at(-1).imagem) erros.push('estrutura post: o CTA precisa de foto do criador (banco ou IA)');
  }
  S.forEach((s, i) => {
    if (s.tipo === 'post' && !s.imagem && !s.imagens?.length && !s.visual) erros.push(`slide ${i + 1}: post sem imagem — a imagem é obrigatória`);
    if (s.tipo === 'post' && s.imagem && !s.ia && !s.credito) erros.push(`slide ${i + 1}: imagem do post precisa de "credito" (ou "ia": true)`);
  });
  const temNumero = S.some((s) => textos(s).some((t) => /\d/.test(t)) || s.numero);
  if (temNumero && !(r.fontes || []).some((f) => /^https?:\/\//.test(f.url || ''))) erros.push('há números nos slides: liste as fontes (url) em "fontes"');
  erros.push(...lint(r));
  if (!r.legenda?.trim()) erros.push('falta "legenda" (1ª linha com os 3 C\'s)');
  return erros;
}

const CSS = `
html, body { width: ${LARGURA}px; height: ${ALTURA}px; }
body { position: relative; background: var(--noite); color: var(--gelo); font-family: var(--fonte-texto); font-weight: 500; -webkit-font-smoothing: antialiased; }
.fundo { position: absolute; inset: 0; overflow: hidden; }
.rodape { position: absolute; left: 64px; right: 64px; bottom: 52px; z-index: 3; display: flex; justify-content: space-between; align-items: center;
  font-family: var(--fonte-titulo); font-weight: 600; font-size: 34px; color: rgba(246,246,246,0.7); }
.rodape .seta { font-size: 40px; }
body.claro .rodape { color: rgba(13,13,13,0.6); }
.conteudo { position: absolute; top: 150px; bottom: 150px; left: 90px; right: 90px; display: flex; flex-direction: column;
  justify-content: center; align-items: center; text-align: center; gap: 38px; overflow: hidden; }
.sobre { font-family: var(--fonte-texto); font-weight: 700; font-size: 26px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gelo);
  background: var(--vidro-1); border: 1px solid rgba(77,123,255,0.35); border-radius: 10px; padding: 12px 20px; }
h1 { margin: 0; font-family: var(--fonte-titulo); font-weight: 600; font-size: 92px; line-height: 1.02; letter-spacing: -0.02em;
  word-spacing: 0.08em; text-wrap: balance; }
.t-capa h1 { font-size: 128px; line-height: 0.94; text-transform: uppercase; letter-spacing: -0.025em; }
.sub, .corpo { margin: 0; font-size: 44px; line-height: 1.32; color: rgba(246,246,246,0.84); text-wrap: pretty; max-width: 860px; }
.corpo p { margin: 0 0 22px; } .corpo p:last-child { margin: 0; }
.sub { font-size: 40px; }
em.a { font-style: normal; color: var(--limao); }
strong { color: var(--gelo); font-weight: 700; }
.numero { font-family: var(--fonte-titulo); font-weight: 600; font-size: 300px; line-height: 0.85; letter-spacing: -0.04em; color: var(--limao); }
.lista { list-style: none; margin: 0; padding: 0; width: 100%; display: flex; flex-direction: column; gap: 18px; text-align: left; }
.lista li { display: flex; gap: 26px; align-items: baseline; background: linear-gradient(180deg, var(--vidro-1), var(--vidro-2));
  border: 1px solid rgba(77,123,255,0.25); border-radius: 22px; padding: 26px 32px; font-size: 38px; line-height: 1.25; }
.lista .k { font-family: var(--fonte-titulo); font-weight: 600; font-size: 28px; color: var(--azul-claro); flex: none; }
.grade { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; width: 100%; }
.grade div { background: var(--vidro-1); border: 1px solid rgba(77,123,255,0.22); border-radius: 20px; padding: 34px 10px;
  font-family: var(--fonte-titulo); font-weight: 600; font-size: 36px; color: rgba(246,246,246,0.55); }
.grade div.d { background: var(--limao); color: var(--preto); border-color: var(--limao); }
.pontos { display: flex; flex-wrap: wrap; justify-content: center; gap: 26px; max-width: 760px; }
.pontos i { width: 64px; height: 64px; border-radius: 50%; background: var(--vidro-1); border: 2px solid rgba(165,196,255,0.28); }
.pontos i.d { background: var(--limao); border-color: var(--limao); }
.citacao { margin: 0; width: 100%; text-align: left; border-left: 4px solid rgba(246,246,246,0.28); padding-left: 32px; }
.citacao p { margin: 0 0 20px; font-size: 40px; line-height: 1.35; font-weight: 500; color: var(--gelo); }
.citacao cite { font-style: normal; font-size: 24px; color: rgba(246,246,246,0.62); }
.linha { display: flex; width: 100%; }
.linha .no { flex: 1; text-align: left; border-top: 2px solid rgba(246,246,246,0.28); padding: 28px 24px 0 0; }
.linha .q { font-family: var(--fonte-titulo); font-weight: 600; font-size: 56px; line-height: 1; margin-bottom: 16px; color: var(--gelo); }
.linha .t { font-size: 28px; line-height: 1.35; color: rgba(246,246,246,0.78); }
.barras { width: 100%; display: flex; flex-direction: column; gap: 32px; text-align: left; }
.barras .lin { display: grid; gap: 12px; }
.barras .rot { font-size: 28px; color: rgba(246,246,246,0.78); }
.barras .trilho { height: 44px; background: rgba(246,246,246,0.08); border-radius: 12px; overflow: hidden; }
.barras .bar { height: 100%; background: rgba(246,246,246,0.5); border-radius: 12px; }
.barras .bar.d { background: var(--limao); }
.barras .val { font-family: var(--fonte-titulo); font-weight: 600; font-size: 40px; color: var(--gelo); }
.comp { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%; text-align: left; }
.comp > div { border-radius: 24px; padding: 36px 32px; background: var(--vidro-2); border: 1px solid rgba(246,246,246,0.12); }
.comp > div.b { background: var(--vidro-1); border-color: rgba(246,246,246,0.28); }
.comp .r { font-family: var(--fonte-texto); font-weight: 700; font-size: 24px; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(246,246,246,0.55); margin-bottom: 18px; }
.comp .b .r { color: var(--azul-gelo); }
.comp ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 22px; font-size: 36px; line-height: 1.25; text-wrap: balance; hyphens: none; }
.comp .a-l li { color: rgba(246,246,246,0.6); }
.quadro { box-sizing: border-box; width: 100%; border-radius: 28px; overflow: hidden; border: 1px solid rgba(77,123,255,0.4); background: var(--vidro-2);
  box-shadow: 0 30px 80px rgba(0,0,0,0.5), 0 0 0 8px rgba(10,15,31,0.6); }
.quadro img { display: block; width: 100%; max-height: 600px; object-fit: cover; object-position: top; }
.credito { font-family: var(--fonte-texto); font-weight: 500; font-size: 22px; color: rgba(165,196,255,0.7); }
.chamada { display: flex; flex-direction: column; align-items: center; gap: 18px; }
.chamada .c { font-size: 36px; color: rgba(246,246,246,0.7); }
.chamada .p { font-family: var(--fonte-titulo); font-weight: 600; font-size: 120px; line-height: 1; letter-spacing: 0.02em; color: var(--limao);
  border: 2px solid var(--limao); border-radius: 28px; padding: 22px 48px 14px; }
.segue { font-size: 32px; color: rgba(246,246,246,0.6); }

.foto { position: absolute; inset: 0; z-index: 0; } .foto img { width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; }
.foto.frente { z-index: 2; pointer-events: none; }
.veu { position: absolute; inset: 0; z-index: 1; background: linear-gradient(180deg, rgba(3,5,12,0.55) 0%, rgba(3,5,12,0) 30%, rgba(3,5,12,0) 52%, rgba(3,5,12,0.92) 82%, rgba(3,5,12,1) 100%); }
body.com-foto .conteudo { z-index: 1; } body.com-foto .rodape, body.com-foto .base { z-index: 3; }
body.com-foto .fundo { display: none; }
.t-capa.sobre-foto { top: 120px; justify-content: flex-start; gap: 28px; }
.t-capa.sobre-foto h1 { font-size: 150px; line-height: 0.9; font-weight: 700; text-shadow: 0 10px 50px rgba(3,5,12,0.45); }
.base { position: absolute; left: 90px; right: 90px; bottom: 150px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 30px; }
.base .sub { text-shadow: 0 2px 20px rgba(3,5,12,0.9); color: var(--gelo); }
.t-cta.sobre-foto { justify-content: flex-end; padding-bottom: 10px; }
.t-cta.sobre-foto h1 { text-shadow: 0 6px 40px rgba(3,5,12,0.8); }
.galeria { display: grid; gap: 18px; width: 100%; }
.galeria figure { margin: 0; display: flex; flex-direction: column; gap: 12px; }
.galeria img { box-sizing: border-box; width: 100%; height: 480px; object-fit: cover; object-position: top; border-radius: 22px; border: 1px solid rgba(77,123,255,0.4); display: block; }
.galeria figcaption { font-family: var(--fonte-texto); font-weight: 500; font-size: 20px; color: rgba(165,196,255,0.7); }

body.claro { background: var(--gelo); color: var(--preto); }
body.claro .fundo { display: none; }
.t-post { overflow: visible; top: 80px; bottom: 130px; left: 64px; right: 64px; justify-content: flex-start; align-items: stretch; text-align: left; gap: 0; }
.t-post > .cab { margin-bottom: 44px; } .t-post > .corpo { margin-bottom: 40px; }
.t-post > .cartao, .t-post > .galeria { margin-bottom: 16px; }
.cab { display: flex; align-items: center; gap: 24px; }
.cab .av { width: 104px; height: 104px; border-radius: 50%; object-fit: cover; }
.cab .nome { font-weight: 700; font-size: 40px; line-height: 1.1; display: flex; align-items: center; gap: 12px; letter-spacing: -0.01em; }
.cab .nome svg { width: 40px; height: 40px; }
.cab .arroba { font-size: 30px; line-height: 1.2; color: rgba(13,13,13,0.6); }
.t-post h2 { margin: 0 0 24px; font-family: var(--fonte-titulo); font-weight: 600; font-size: 56px; line-height: 1.08; letter-spacing: -0.01em; word-spacing: 0.06em; color: rgba(13,13,13,0.92); text-wrap: balance; }
.t-post .corpo { font-size: 38px; line-height: 1.4; color: rgba(13,13,13,0.75); max-width: none; }
body.claro em.a { color: var(--azul); } body.claro strong { color: var(--preto); }
.cartao { flex: 1; min-height: 360px; border-radius: 36px; overflow: hidden; box-shadow: 0 24px 50px rgba(13,13,13,0.16), 0 3px 10px rgba(13,13,13,0.08); }
.cartao img { width: 100%; height: 100%; object-fit: cover; display: block; }
.t-post .credito { color: rgba(13,13,13,0.62); }
.t-post .galeria { flex: 1; min-height: 0; } .t-post .galeria figure { height: 100%; min-height: 0; }
.t-post .galeria img { flex: 1; min-height: 0; height: auto; border: none; box-shadow: 0 20px 44px rgba(13,13,13,0.18); }
.t-post .galeria figcaption { color: rgba(13,13,13,0.62); }
.cartao.escuro { background: #0b0d14; border: 1px solid rgba(246,246,246,0.08); color: var(--gelo);
  display: flex; align-items: center; justify-content: center; padding: 40px; }
.cartao.escuro .cena { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 24px; }
.cartao.escuro .grade div { padding: 22px 8px; font-size: 30px; }
.cartao.escuro .comp ul { font-size: 32px; } .cartao.escuro .comp > div { padding: 26px; }
.cartao.escuro em.a { color: var(--limao); } .cartao.escuro strong { color: var(--gelo); }

.foto.direita img { position: absolute; right: -170px; top: 0; height: 100%; width: auto; object-fit: initial; -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 45%); }
.multidao { position: absolute; inset: 0; z-index: 0; overflow: hidden;
  background: var(--noite); }
.multidao img { position: absolute; bottom: 0; object-fit: cover; object-position: center top; }
.multidao .r1 { filter: grayscale(1) brightness(0.22) blur(2px); } .multidao .r2 { filter: grayscale(1) brightness(0.38) blur(0.6px); }
.t-capa.sobre-foto .gigante { align-self: stretch; text-align: center; font-family: var(--fonte-titulo); font-weight: 700; text-transform: uppercase; font-size: 250px; line-height: 0.8;
  letter-spacing: -0.03em; white-space: nowrap; }
.t-capa.sobre-foto:has(.gigante) h1 { font-size: 92px; line-height: 1.0; }
.topo-claro .t-capa.sobre-foto h1, .topo-claro .t-capa.sobre-foto .gigante { color: var(--preto); text-shadow: none; }
.topo-claro .veu { background: linear-gradient(180deg, rgba(246,246,246,0.45) 0%, rgba(246,246,246,0) 34%, rgba(3,5,12,0) 52%, rgba(3,5,12,0.92) 82%, rgba(3,5,12,1) 100%); }
.t-capa.sobre-foto .gigante { text-shadow: 0 6px 40px rgba(3,5,12,0.45); }
.foto.frente img { -webkit-mask-image: linear-gradient(180deg, #000 72%, transparent 97%); }
.foto.frente.destaque img { filter: none; }
.veu-esq { position: absolute; inset: 0; z-index: 1; background: linear-gradient(90deg, rgba(3,5,12,0.96) 0%, rgba(3,5,12,0.88) 38%, rgba(3,5,12,0) 72%), linear-gradient(0deg, rgba(3,5,12,0.7) 0%, rgba(3,5,12,0) 30%); }
.t-cta.retrato { top: 110px; bottom: 130px; right: 42%; left: 72px; align-items: flex-start; text-align: left; justify-content: center; gap: 0; }
.retrato > h1 { margin-bottom: 28px; } .retrato > .corpo { margin-bottom: 56px; } .retrato > .chamada { margin-bottom: 48px; }
.retrato h1 { font-family: var(--fonte-titulo); font-weight: 600; font-size: 58px; line-height: 1.08; letter-spacing: -0.01em; }
.retrato .corpo { font-size: 32px; line-height: 1.4; }
.retrato .chamada { align-items: flex-start; gap: 10px; }
.retrato .chamada .c1 { font-size: 44px; font-weight: 500; color: var(--gelo); line-height: 1.1; }
.retrato .chamada .p { border: 0; padding: 0; box-shadow: none; font-size: 96px; line-height: 1; text-shadow: none; }
.retrato .chamada .c { font-size: 30px; line-height: 1.35; max-width: 520px; margin-top: 6px; }
.retrato .segue { font-weight: 700; font-size: 34px; color: rgba(246,246,246,0.62); line-height: 1.2; }
`;

function corpoSlide(s) {
  const sobre = s.sobre ? `<div class="sobre">${marcar(s.sobre)}</div>` : '';
  // Título da capa com palavra gigante: o corpo da fonte diminui conforme o título cresce (não estoura nem esconde a imagem).
  const tam = s.tipo === 'capa' && s.gigante ? Math.max(72, Math.min(92, Math.floor(92 - Math.max(0, String(s.titulo).length - 34) * 0.9))) : 0;
  const h1 = s.titulo ? `<h1${tam ? ` style="font-size:${tam}px"` : ''}>${marcar(s.titulo)}</h1>` : '';
  const corpo = s.corpo ? `<div class="corpo">${[].concat(s.corpo).map((p) => `<p>${marcar(p)}</p>`).join('')}</div>` : '';
  const sub = s.sub ? `<p class="sub">${marcar(s.sub)}</p>` : '';
  const pontos = s.pontos ? `<div class="pontos">${Array.from({ length: s.pontos.total }, (_, i) => `<i class="${(s.pontos.destaque || []).includes(i) ? 'd' : ''}"></i>`).join('')}</div>` : '';
  switch (s.tipo) {
    case 'capa': return s._fundo ? sobre + h1 + (s.gigante ? `<div class="gigante" style="font-size:${Math.min(250, Math.floor(900 / (String(s.gigante).replace(/\*/g, '').length * 0.7)))}px">${marcar(s.gigante)}</div>` : '') : sobre + h1 + sub;
    case 'texto': return sobre + pontos + h1 + corpo;
    case 'numero': return sobre + `<div class="numero" style="font-size:${Math.min(300, Math.floor(760 / (String(s.numero).length * 0.62)))}px">${esc(s.numero)}</div>` + h1 + corpo;
    case 'lista': return sobre + h1 + `<ul class="lista">${s.itens.map((t, i) => `<li><span class="k">${String(i + 1).padStart(2, '0')}</span><span>${marcar(t)}</span></li>`).join('')}</ul>` + corpo;
    case 'grade': return sobre + h1 + `<div class="grade">${s.itens.map((t, i) => `<div class="${i === s.destaque || s.destaque === 'todos' ? 'd' : ''}">${esc(t)}</div>`).join('')}</div>` + corpo;
    case 'comparacao': return sobre + h1 + `<div class="comp">${['a', 'b'].map((k) => `<div class="${k === 'a' ? 'a-l' : 'b'}"><div class="r">${esc(s[k].rotulo)}</div><ul>${s[k].itens.map((t) => `<li>${marcar(t)}</li>`).join('')}</ul></div>`).join('')}</div>` + corpo;
    case 'imagem': return sobre + h1 + (s._galeria
      ? `<div class="galeria" style="grid-template-columns:repeat(${s._galeria.length},minmax(0,1fr))">${s._galeria.map((m) => `<figure><img src="${m.url}"><figcaption>${esc(m.credito)}</figcaption></figure>`).join('')}</div>`
      : `<div class="quadro"><img src="${s._imagemUrl}"></div><div class="credito">${esc(s.credito)}</div>`) + corpo;
    case 'citacao': return `<blockquote class="citacao"><p>${marcar(s.texto)}</p><cite>${esc(s.autor || '')}</cite></blockquote>`;
    case 'linha': return `<div class="linha">${s.itens.map((it) => `<div class="no"><div class="q">${esc(it.quando)}</div><div class="t">${marcar(it.texto)}</div></div>`).join('')}</div>`;
    case 'barras': { const max = Math.max(...s.itens.map((x) => x.valor)); return `<div class="barras">${s.itens.map((it, i) => `<div class="lin"><div class="rot">${esc(it.rotulo)}</div><div class="trilho"><div class="bar${i === s.destaque ? ' d' : ''}" style="width:${Math.round(it.valor / max * 100)}%"></div></div><div class="val">${esc(it.texto)}</div></div>`).join('')}</div>`; }
    case 'post': return `<div class="cab">${s._avatar ? `<img class="av" src="${s._avatar}">` : ''}<div><div class="nome">${esc(perfil.nome)}${perfil.verificado ? selo : ''}</div><div class="arroba">${esc(perfil.arroba)}</div></div></div>`
      + (s.titulo ? `<h2>${marcar(s.titulo)}</h2>` : '') + corpo
      + (s._galeria ? `<div class="galeria" style="grid-template-columns:repeat(${s._galeria.length},minmax(0,1fr))">${s._galeria.map((m) => `<figure><img src="${m.url}"><figcaption>${esc(m.credito)}</figcaption></figure>`).join('')}</div>`
        : s.visual ? `<div class="cartao escuro"><div class="cena t-${s.visual.tipo}">${corpoSlide(s.visual)}</div></div>`
        : `<div class="cartao"><img src="${s._imagemUrl}" style="object-position:${esc(s.foco || 'center')}"></div>`)
      + (s.visual && !s.fonte ? '' : `<div class="credito">${esc(s.credito || (s.fonte ? 'Fonte: ' + s.fonte : '') || (s.ia ? 'Imagem gerada com IA' : ''))}</div>`);
    case 'cta': if (s._fundo) return h1 + corpo + `<div class="chamada"><div class="c1">Comenta</div><div class="p" style="font-size:${Math.min(96, Math.floor(500 / ((String(s.palavra).length + 2) * 0.66)))}px">“${esc(s.palavra)}”</div><div class="c">${marcar(s.entregavel)}</div></div><div class="segue">${marcar(s.segue || 'E me segue aí: design e IA sem IA slop.')}</div>`;
      return sobre + h1 + `<div class="chamada"><div class="c">Comenta</div><div class="p">${esc(s.palavra)}</div><div class="c">${marcar(s.entregavel)}</div></div><div class="segue">Segue ${esc(perfil.arroba)} · design e IA sem IA slop</div>`;
  }
}

export function paginaSlide(s, i, total) {
  const ultimo = i === total - 1;
  const retrato = s.tipo === 'cta' && s._fundo;
  const foto = s._fundo ? `<div class="foto${retrato ? ' direita' : ''}"><img src="${s._fundo}" style="object-position:${esc(s.foco || 'center top')}"></div><div class="${retrato ? 'veu-esq' : 'veu'}"></div>` : '';
  const frente = s._recorte ? `<div class="foto frente${s.cena === 'multidao' ? ' destaque' : ''}"><img src="${s._recorte}" style="object-position:${esc(s.foco || 'center top')};transform-origin:50% 100%;transform:translateY(${Number(s.descida) || 0}px) scale(${Number(s.escala) || 1})"></div>` : '';
  if (s.cena === 'multidao' && s._recorte) {
    // Multidão: cópias apagadas do próprio recorte atrás do sujeito (Von Restorff em cena; sem IA).
    const fila = (n, esc, cls, y) => Array.from({ length: n }, (_, k) => {
      const w = LARGURA * esc, x = (k + 0.5) * (LARGURA * 1.3 / n) - LARGURA * 0.15;
      return `<img class="${cls}" src="${s._recorte}" style="width:${w}px;height:${ALTURA * esc}px;left:${x - w / 2}px;bottom:${y}px">`;
    }).join('');
    s._cena = `<div class="multidao">${fila(7, 0.5, 'r1', 330)}${fila(5, 0.68, 'r2', 120)}</div><div class="veu"></div>`;
  }
  const base = s._fundo && s.tipo === 'capa' && s.sub ? `<div class="base"><p class="sub">${marcar(s.sub)}</p></div>` : '';
  return `<!doctype html><html><head><meta charset="utf-8"><style>${cssMarca()}${CSS}</style></head><body class="${s._fundo ? 'com-foto' : ''}${s._topoClaro ? ' topo-claro' : ''}${s.tipo === 'post' ? 'claro' : ''}">
<div class="fundo"></div>${s._cena || foto}

<div class="conteudo t-${s.tipo}${retrato ? ' retrato' : s._fundo ? ' sobre-foto' : ''}">${corpoSlide(s)}</div>${frente}${base}
<div class="rodape"><span class="n">${i + 1}</span><span class="seta">${ultimo ? '' : '→'}</span></div>
<script>document.fonts.ready.then(() => { const g = document.querySelector('.gigante'); if (!g) return; let t = parseFloat(g.style.fontSize) || 200; while (g.scrollWidth > g.clientWidth && t > 60) { t -= 4; g.style.fontSize = t + 'px'; } });</script>
</body></html>`;
}

export function textoLegenda(r) {
  const fontes = (r.fontes || []).map((f) => `· ${f.texto ? f.texto + ': ' : ''}${f.url}`).join('\n');
  const ia = r.slides.some((s) => s.ia) ? '\n\nImagens geradas com IA.' : '';
  return r.legenda.trim() + ia + (fontes ? `\n\nFontes:\n${fontes}` : '') + '\n';
}

// Título atrás da pessoa: recorta a pessoa da imagem (Vision, motor/video/recorte.swift) em PNG com alfa. Cache ao lado da imagem.
export function recortar(img) {
  const saida = img.replace(/\.[a-z]+$/i, '') + '.recorte.png';
  if (existsSync(saida) && statSync(saida).mtimeMs > statSync(img).mtimeMs) return saida;
  const video = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'video');
  const bin = path.join(video, 'recorte-bin');
  if (!existsSync(bin)) execFileSync('swiftc', ['-O', path.join(video, 'recorte.swift'), '-o', bin]);
  const tmp = mkdtempSync(path.join(tmpdir(), 'recorte-'));
  try {
    mkdirSync(path.join(tmp, 'in'));
    execFileSync(ffmpeg, ['-y', '-v', 'error', '-i', img, path.join(tmp, 'in', 'q.png')]);
    execFileSync(bin, [path.join(tmp, 'in'), path.join(tmp, 'out')], { stdio: 'ignore' });
    execFileSync(ffmpeg, ['-y', '-v', 'error', '-i', path.join(tmp, 'in', 'q.png'), '-i', path.join(tmp, 'out', 'q.png'),
      '-filter_complex', '[1:v]format=gray,boxblur=1[m];[0:v][m]alphamerge,format=rgba', saida]);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
  return saida;
}

// Brilho médio (0–255) do terço de cima da imagem: decide se o texto da capa é preto ou branco (contraste não depende de sorte).
export function brilhoTopo(img) {
  const px = execFileSync(ffmpeg, ['-v', 'error', '-i', img, '-vf', 'crop=iw:ih*0.42:0:0,scale=1:1', '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'gray', '-']);
  return px[0];
}

// AC-004: todo carrossel nasce de uma barra medida na referência (bar.md com 5 a 7 mecanismos em "- ").
export function validarBarra(texto) {
  const n = (texto.match(/^- \S/gm) || []).length;
  return n >= 5 && n <= 7 ? [] : [`bar.md precisa de 5 a 7 mecanismos em lista "- " (tem ${n})`];
}

// Renderiza todos os slides. Falha se o texto estourar a área do slide (nada cortado sai para o feed).
export async function renderizar(arquivo, { saida } = {}) {
  const base = path.dirname(path.resolve(arquivo));
  const r = JSON.parse(readFileSync(arquivo, 'utf8'));
  let barra = '';
  try { barra = readFileSync(path.join(base, 'bar.md'), 'utf8'); } catch { /* sem barra */ }
  const erros = [...validar(r), ...validarBarra(barra)];
  if (erros.length) throw new Error('roteiro inválido:\n- ' + erros.join('\n- '));
  const pasta = saida || path.join(base, 'slides');
  mkdirSync(pasta, { recursive: true });
  const tmp = mkdtempSync(path.join(tmpdir(), 'carrossel-'));
  const browser = await chromium.launch();
  const arquivos = [];
  try {
    const page = await browser.newPage({ viewport: { width: LARGURA, height: ALTURA } });
    for (const [i, s0] of r.slides.entries()) {
      const url = (p) => pathToFileURL(path.resolve(base, p)).href;
      const s = { ...s0, _imagemUrl: s0.imagem ? url(s0.imagem) : '' };
      if (s0.imagem && ['capa', 'cta'].includes(s0.tipo)) {
        s._fundo = url(s0.imagem);
        if (s0.tipo === 'capa') s._topoClaro = brilhoTopo(path.resolve(base, s0.imagem)) > 158;
        if (s0.camada) s._recorte = pathToFileURL(recortar(path.resolve(base, s0.imagem))).href;
      }
      if (s0.tipo === 'post') s._avatar = fotoPerfil();
      if (s0.imagens) s._galeria = s0.imagens.map((m) => ({ url: url(m.src), credito: m.credito }));
      const html = path.join(tmp, `${i}.html`);
      writeFileSync(html, paginaSlide(s, i, r.slides.length));
      await page.goto(pathToFileURL(html).href, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      const estouro = await page.evaluate(() => { const c = document.querySelector('.conteudo'); return Math.max(c.scrollHeight - c.clientHeight, c.scrollWidth - c.clientWidth); });
      if (estouro > 1) throw new Error(`slide ${i + 1}: texto estoura ${estouro}px — encurte a copy`);
      const png = path.join(pasta, `${String(i + 1).padStart(2, '0')}.png`);
      await page.screenshot({ path: png });
      arquivos.push(png);
    }
    // Prancha de revisão: todos os slides lado a lado (para o crítico e para o criador aprovar de uma vez).
    const cols = Math.min(5, arquivos.length), linhas = Math.ceil(arquivos.length / cols), w = 360, h = 450, g = 24;
    await page.setViewportSize({ width: cols * w + (cols + 1) * g, height: linhas * h + (linhas + 1) * g });
    const prancha = path.join(tmp, 'prancha.html');
    writeFileSync(prancha, `<body style="margin:0;background:#1a1a1a;display:grid;grid-template-columns:repeat(${cols},${w}px);gap:${g}px;padding:${g}px">${arquivos.map((a) => `<img src="${pathToFileURL(a).href}" style="width:${w}px;height:${h}px;border-radius:12px">`).join('')}</body>`);
    await page.goto(pathToFileURL(prancha).href, { waitUntil: 'load' });
    await page.screenshot({ path: path.join(base, 'prancha.png') });
  } finally {
    await browser.close();
    rmSync(tmp, { recursive: true, force: true });
  }
  writeFileSync(path.join(base, 'legenda.txt'), textoLegenda(r));
  return arquivos;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arq = process.argv[2];
  if (!arq) { console.error('uso: node motor/carrossel/carrossel.mjs <pasta>/carrossel.json'); process.exit(2); }
  renderizar(arq).then((a) => console.log(`${a.length} slides em ${path.dirname(a[0])}\nprancha.png e legenda.txt em ${path.dirname(path.resolve(arq))}`))
    .catch((e) => { console.error(e.message); process.exit(1); });
}
