// Formato A — "rosto cinematográfico + inserts" (Base/formato-principal.md).
// Base: rosto em tela cheia e SEMPRE centralizado; cada corte troca o enquadramento (médio ↔ close).
// Por cima: legenda pequena no peito, inserts em tela cheia (entram com zoom+desfoque),
// momento REC P&B na virada, CTA sobre o peito e SFX por ação visível.
//
// plano.json {
//   destaques?: [palavra], correcoes?: {},
//   inserts: [{ palavra, ocorrencia?: 1, dur, tipo, props, antes?: 0.4, sfx?: categoria|null, flash?: bool }],
//   rec?: { palavra, ate },            // janela P&B com moldura REC (da palavra até a palavra `ate`)
//   cta?: { palavra, tipo: 'comentario', props },
//   musica?: { arquivo, volume }       // opcional, sempre abaixo da voz
// }
// Tempos ancorados em palavras da fala: o plano sobrevive a um novo corte.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';
import { LARGURA, ALTURA, cssMarca, esc } from '../video/legenda.mjs';
import { renderizarOverlay, pastaDeCamadas } from '../video/cards.mjs';
import { videoMascara } from '../video/recorte.mjs';
import { temaDe } from './temas.mjs';
import { JS_FUNDOS } from './kit.mjs';
import { montarCard, CSS_BASE, AJUDANTES, CAIXA } from './broll.mjs';
import { legendasMarca, centroRosto, rodar, dimensoes } from './compor.mjs';
import { montarTela, CSS_VISUAL, JS_VISUAL } from './visual.mjs';
import { planoDeSom, filtroSom, alinharPicos, medirAgudos, ganhoAgudos } from './som.mjs';

const r3 = (x) => Math.round(x * 1000) / 1000;
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}-]/gu, '');
export const ENQUADRAMENTOS = ['medio', 'close']; // locutor sempre no centro (pedido 2026-10-31)
export const LEGENDA_Y = 1430;
export const DIVIDIDO = { painel: 900, descida: 240 }; // insert 'dividido': imagem no topo, rosto desce 240 px (queixo acima da legenda)
export const ENTRADA = 0.22; // duração da entrada zoom+desfoque dos inserts

// Acha a n-ésima ocorrência de uma palavra (sem acento/pontuação) nas palavras da saída.
export function acharPalavra(palavras, alvo, ocorrencia = 1) {
  const a = norm(alvo); let n = 0;
  for (const p of palavras) if (norm(p.texto) === a && ++n === ocorrencia) return p;
  throw new Error(`palavra não encontrada no corte: "${alvo}" (#${ocorrencia})`);
}

// Trechos de saída (planos) com o enquadramento de cada um; vizinhos sempre diferentes.
// movimento de câmera por trecho (refs. reels: empurrão lento, corte seco parado, ângulo inclinado)
export const MOVIMENTOS = ['empurra', 'fixo', 'angulo', 'empurra'];
// Um trecho é um PLANO, não um segmento: tirar uma micro-pausa (mesma frase, mesma tomada) não troca enquadramento nem
// reinicia o zoom — senão 25 emendas em 30 s viram 25 pulos de câmera (criador: "balançando muito", 2026-11-01).
// Plano novo quando a fonte salta (outra frase/tomada: > SALTO s ou outro arquivo) ou quando o plano já passou de PLANO_MAX s;
// plano nunca fica com menos de PLANO_MIN s.
export const SALTO = 0.8, PLANO_MIN = 1.5, PLANO_MAX = 4.5;
export function trechos(timeline) {
  const planos = []; let t = 0, ant = null;
  for (const s of timeline.segmentos) {
    const d = s.fim - s.ini, atual = planos.at(-1);
    const salto = ant && (s.fonte !== ant.fonte || s.ini - ant.fim > SALTO);
    const longo = atual && t - atual.ini >= PLANO_MAX;
    if (!atual || ((salto || longo) && t - atual.ini >= PLANO_MIN)) planos.push({ ini: r3(t), fim: r3(t + d) });
    else atual.fim = r3(t + d);
    t += d; ant = s;
  }
  if (planos.length > 1 && planos.at(-1).fim - planos.at(-1).ini < PLANO_MIN) planos.at(-2).fim = planos.pop().fim; // rabo curto junta
  return planos.map((p, i) => ({ ...p, enq: ENQUADRAMENTOS[i % ENQUADRAMENTOS.length], mov: MOVIMENTOS[i % MOVIMENTOS.length] }));
}

// Plano → eventos com tempo de saída (inserts, rec, cta). Inserts não se sobrepõem (o seguinte corta o anterior).
export function resolverPlano(plano, palavras, duracao) {
  const ins = (plano.inserts || []).map((x) => {
    const p = acharPalavra(palavras, x.palavra, x.ocorrencia);
    const ini = Math.max(0, r3(p.ini - (x.antes ?? 0.4)));
    return { ...x, ini, fim: Math.min(duracao, r3(ini + x.dur)) };
  }).sort((a, b) => a.ini - b.ini);
  // sobreposição: o seguinte corta o anterior. Furo curto (< 0,5 s) entre duas telas vira emenda: o rosto piscando
  // por 2–3 quadros entre telas parece defeito.
  for (let i = 0; i + 1 < ins.length; i++) if (ins[i].fim > ins[i + 1].ini || ins[i + 1].ini - ins[i].fim < 0.5) ins[i].fim = ins[i + 1].ini;
  const rec = plano.rec ? { ini: r3(acharPalavra(palavras, plano.rec.palavra, plano.rec.ocorrencia).ini - 0.05), fim: r3(acharPalavra(palavras, plano.rec.ate, plano.rec.ocorrenciaAte).fim + 0.1) } : null;
  const cta = plano.cta ? { ...plano.cta, ini: r3(acharPalavra(palavras, plano.cta.palavra, plano.cta.ocorrencia).ini - 0.6), fim: duracao } : null;
  return { inserts: ins, rec, cta };
}

// ---------- página do overlay ----------
export function paginaFormatoA({ palavras, destaques = [], eventos, trs, tema: nomeTema = 'vidro' }) {
  const { inserts, rec, cta } = eventos;
  const tema = temaDe(nomeTema);
  // "fundo" no insert troca o fundo animado da tela (pontos/hud/planta — Base/texturas-design.md)
  const telas = inserts.map((x) => { const t = montarTela(x.tipo, x.props); return x.fundo ? { ...t, html: t.html.replace(/data-forma="[^"]*"/, `data-forma="${x.fundo}"`) } : t; });
  const ctaCard = cta ? montarCard(cta.tipo || 'comentario', cta.props || {}) : null;
  const blocos = legendasMarca(palavras, destaques);
  const cssTipos = [...new Set([...telas.map((t) => t.css), ctaCard?.css || ''])].join('\n');
  return `<!doctype html><html><head><meta charset="utf-8"><style>${cssMarca()}
${CSS_BASE}
${CSS_VISUAL}
${cssTipos}
body { margin: 0; }
.ins { position: absolute; inset: 0; display: none; overflow: hidden; }
.ins.div { bottom: auto; height: ${DIVIDIDO.painel}px; transform-origin: 50% 0; -webkit-mask-image: linear-gradient(180deg, #000 94%, transparent); }
.ins.div .t-cena .vin { display: none; }
.ins.div .t-cena .cr { top: 24px; text-align: right; right: 40px; left: auto; font-size: 22px; }
#flash { position: absolute; inset: 0; background: var(--gelo); opacity: 0; z-index: 20; }
#scan { position: absolute; left: 0; right: 0; height: 6px; margin-top: -3px; display: none; z-index: 9; background: var(--gelo); box-shadow: 0 0 24px 6px rgba(165,196,255,0.9), 0 0 80px 20px rgba(0,53,212,0.6); }
#rec { position: absolute; inset: 0; display: none; z-index: 5; font-family: var(--fonte-texto); color: var(--gelo); }
#rec .tx { position: absolute; left: 110px; top: 300px; font-weight: 700; font-size: 40px; letter-spacing: 0.08em; display: flex; align-items: center; gap: 14px; }
#rec .tx i { width: 22px; height: 22px; border-radius: 50%; background: #ff3b30; }
#rec .tc { position: absolute; right: 110px; top: 300px; font-size: 36px; font-weight: 500; font-variant-numeric: tabular-nums; }
#rec .c { position: absolute; width: 70px; height: 70px; border: 5px solid rgba(246,246,246,0.9); }
#rec .c1 { left: 80px; top: 270px; border-right: 0; border-bottom: 0; } #rec .c2 { right: 80px; top: 270px; border-left: 0; border-bottom: 0; }
#rec .c3 { left: 80px; bottom: 300px; border-right: 0; border-top: 0; } #rec .c4 { right: 80px; bottom: 300px; border-left: 0; border-top: 0; }
#cta { position: absolute; left: ${CAIXA.x}px; top: 1000px; width: ${CAIXA.largura}px; height: 360px; display: none; z-index: 6; }
#cta .k { background: transparent; } #cta .grade { display: none; }
#leg { position: absolute; z-index: 10; font-family: 'SF Mono', ui-monospace, Menlo, monospace; font-weight: 700; font-size: 60px; line-height: 1.15; letter-spacing: 0.02em; text-transform: uppercase; color: var(--gelo);
  background: rgba(3,5,12,0.82); padding: 10px 22px; border-radius: 6px; box-shadow: inset 0 0 0 2px rgba(77,123,255,0.45); max-width: 900px; text-align: center; text-wrap: balance; }
#leg:empty { display: none; }
#leg .p { display: inline-block; margin-right: 0.5em; } #leg .p:last-child { margin-right: 0; } #leg .d { color: var(--limao); }
${tema.css}
.grao { position: absolute; inset: -60px; z-index: 6; pointer-events: none; opacity: 0.32; mix-blend-mode: overlay; background-size: 220px 220px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)'/%3E%3C/svg%3E"); }
.ins.duo img { filter: url(#duo); }
</style></head><body class="tema-${nomeTema}">
<svg width="0" height="0" style="position:absolute"><filter id="duo"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="table" tableValues="0 0.965"/><feFuncG type="table" tableValues="0.208 0.965"/><feFuncB type="table" tableValues="0.831 0.965"/></feComponentTransfer></filter></svg>
<div id="rec"><div class="c c1"></div><div class="c c2"></div><div class="c c3"></div><div class="c c4"></div><div class="tx"><i></i>REC</div><div class="tc"></div></div>
${telas.map((t, i) => `<div class="ins${inserts[i].dividido ? ' div' : ''}${inserts[i].tipo === 'cena' && !inserts[i].props?.inteira ? ' cheia' : ''}${inserts[i].tratamento === 'duotone' ? ' duo' : ''}${/data-forma="(pontos|hud|planta)"/.test(t.html) ? ' escuro' : ''}" id="i${i}" data-n="${String(i + 1).padStart(2, '0')}" data-pg="${String(i + 1).padStart(2, '0')} / ${String(inserts.length).padStart(2, '0')}">${t.html}${inserts[i].grao || inserts[i].tratamento === 'duotone' ? '<div class="grao"></div>' : ''}</div>`).join('')}
${ctaCard ? `<div id="cta">${ctaCard.html}</div>` : ''}
<div id="leg"></div><div id="scan"></div><div id="flash"></div>
<script>
${AJUDANTES}
${JS_VISUAL}
${tema.js}
${JS_FUNDOS}
const ENTRADA_TEMA = '${tema.entrada}';
const I = ${JSON.stringify(inserts.map(({ ini, fim, flash }) => ({ ini, fim, flash: !!flash })))};
const F = [${telas.map((t) => t.js).join(',\n')}];
const REC = ${JSON.stringify(rec)}, CTA = ${JSON.stringify(cta ? { ini: cta.ini, fim: cta.fim } : null)};
const FCTA = ${ctaCard ? ctaCard.js : 'null'};
const TR = ${JSON.stringify(trs)};
const B = ${JSON.stringify(blocos)};
const ENT = ${ENTRADA};
const leg = document.getElementById('leg'), scan = document.getElementById('scan'), flash = document.getElementById('flash'), recEl = document.getElementById('rec'), ctaEl = document.getElementById('cta');
const els = I.map((_, i) => document.getElementById('i' + i));
let bloco = -1;
window.seek = (t) => {
  let ativo = -1; scan.style.display = 'none';
  I.forEach((x, i) => {
    const on = t >= x.ini && t < x.fim; els[i].style.display = on ? 'block' : 'none';
    if (!on) return; ativo = i; const dt = t - x.ini, sai = x.fim - t;
    // entrada: zoom 1,12→1 + desfoque 18→0 (transição das referências); saída curta com desfoque
    const e = suave(dt / ENT), s = sai < 0.12 ? suave(sai / 0.12) : 1;
    if (ENTRADA_TEMA === 'seco') { // corte seco: entra inteiro, deslize curto de 0,12 s
      els[i].style.opacity = s; els[i].style.filter = 'none'; els[i].style.transform = 'perspective(1600px) rotateX(' + (1 - suave(cl(dt / 0.16))) * 12 + 'deg) translateY(' + (1 - suave(cl(dt / 0.12))) * 40 + 'px)';
    } else if (ENTRADA_TEMA === 'traco') { // a tela se desenha de cima para baixo, com uma linha de luz na frente
      const k = suave(cl(dt / 0.2)); els[i].style.opacity = s; els[i].style.filter = 'none'; els[i].style.transform = 'none'; els[i].style.clipPath = 'inset(0 0 ' + (1 - k) * 100 + '% 0)';
      if (k < 1 && !els[i].classList.contains('div')) { scan.style.display = 'block'; scan.style.top = (k * ${1920}) + 'px'; scan.style.opacity = 1 - k * 0.3; } else scan.style.display = 'none';
    } else {
      els[i].style.opacity = Math.min(cl(dt / 0.1), s);
      els[i].style.filter = 'blur(' + ((1 - e) * 18 + (1 - s) * 14) + 'px)';
      els[i].style.transform = 'perspective(1600px) rotateY(' + ((1 - e) * (i % 2 ? 16 : -16)) + 'deg) rotateX(' + ((1 - e) * 8) + 'deg) scale(' + (1.12 - 0.12 * e + (1 - s) * 0.06) + ')'; // entra girando em 3D
    }
    F[i](dt, els[i].firstElementChild);
  });
  const gq = Math.floor(t * 12); document.querySelectorAll('.grao').forEach((g) => { g.style.transform = 'translate(' + ((gq * 37) % 60 - 30) + 'px,' + ((gq * 53) % 60 - 30) + 'px)'; }); // grão vivo, 12×/s
  let fl = 0; I.forEach((x) => { if (x.flash && t >= x.ini && t < x.ini + 0.3) fl = 1 - (t - x.ini) / 0.3; });
  if (REC && ativo < 0 && t >= REC.ini && t < REC.ini + 0.25) fl = Math.max(fl, 1 - (t - REC.ini) / 0.25);
  flash.style.opacity = fl * 0.85;
  const emRec = REC && t >= REC.ini && t < REC.fim && ativo < 0;
  recEl.style.display = emRec ? 'block' : 'none';
  if (emRec) { recEl.querySelector('.tx i').style.opacity = Math.floor(t * 2) % 2 ? 0.25 : 1; const s = t - REC.ini; recEl.querySelector('.tc').textContent = '00:00:' + String(Math.floor(s)).padStart(2, '0') + ':' + String(Math.floor((s % 1) * 30)).padStart(2, '0'); }
  const emCta = CTA && t >= CTA.ini && ativo < 0;
  if (ctaEl) { ctaEl.style.display = emCta ? 'block' : 'none'; if (emCta) FCTA(t - CTA.ini, ctaEl.firstElementChild); }
  // legenda: posição fixa no centro, visível também sobre os inserts (a troca de cena não a move)
  const i = B.findIndex((b) => t >= b.ini && t < b.fim);
  if (i !== bloco) { bloco = i; leg.innerHTML = i < 0 ? '' : B[i].palavras.map((p, k) => '<span class="p' + (k === B[i].destaque ? ' d' : '') + '">' + p.texto.replace(/[&<>]/g, '') + '</span>').join(''); }
  leg.style.left = ((${LARGURA} - leg.offsetWidth) / 2) + 'px'; leg.style.top = (${LEGENDA_Y} - leg.offsetHeight / 2) + 'px';
  if (i >= 0) { const q = cl((t - B[i].ini) / 0.16); leg.style.opacity = q; leg.style.filter = 'blur(' + (1 - q) * 8 + 'px)'; }
  return { ativo, emRec, emCta, bloco: i };
};
window.seek(0);
</script></body></html>`;
}

// ---------- vídeo base: enquadramentos + grade de cor + P&B no REC (compartilhado com o Formato B) ----------
export function filtroBase({ larguraFonte: W, alturaFonte: H, rosto, trs, rec, largura, altura }) {
  const janela = (z, fx, fy) => { // recorte com zoom z e o rosto em (fx, fy) do quadro
    const cw = Math.round(W / z / 2) * 2, ch = Math.round(H / z / 2) * 2;
    const cx = Math.round(Math.min(W - cw, Math.max(0, rosto.x * W - cw * fx)));
    const cy = Math.round(Math.min(H - ch, Math.max(0, rosto.y * H - ch * fy)));
    return `crop=${cw}:${ch}:${cx}:${cy},`;
  };
  const ENQ = { medio: '', close: janela(1.32, 0.5, 0.4) };
  const n = trs.length;
  const partes = [`[0:v]split=${n}${trs.map((_, i) => `[s${i}]`).join('')}`];
  trs.forEach((tr, i) => { const d = Math.max(0.2, tr.fim - tr.ini), L = largura, A = altura;
    const MOV = { // empurra: zoom lento 1→1,16; angulo: inclinação mínima (~0,6°) — 2,5° balançava demais (criador, 2026-11-01)
      // zoom em resolução dobrada (passo de 0,5 px) e reduzido no fim: movimento contínuo, sem degraus; 1→1,16 com saída suave
      empurra: `,format=gbrp,scale=${2 * L}:${2 * A},scale=w='trunc(${2 * L}*(1+0.16*(1-pow(1-min(t/${d.toFixed(3)},1),2))))':h=-1:eval=frame:flags=bicubic,crop=${2 * L}:${2 * A},scale=${L}:${A}:flags=area,format=yuv420p`,
      angulo: `,scale=${Math.round(L * 1.1 / 2) * 2}:-2,rotate=a='0.01*sin(PI*t/${d.toFixed(3)})':ow=${L}:oh=${A}`,
    };
    partes.push(`[s${i}]trim=start=${tr.ini}:end=${tr.fim},setpts=PTS-STARTPTS,${ENQ[tr.enq]}scale=${L}:${A}${MOV[tr.mov] || ''},setsar=1[e${i}]`); });
  partes.push(`${trs.map((_, i) => `[e${i}]`).join('')}concat=n=${n}:v=1:a=0[base]`);
  // grade: contraste leve, sombras frias (azul da marca), vinheta
  const pb = rec ? `,hue=s=0:enable='between(t,${rec.ini},${rec.fim})'` : '';
  partes.push(`[base]eq=contrast=1.06:saturation=1.06:gamma=0.98,colorbalance=bs=0.05:rh=0.02:bh=-0.02,vignette=angle=PI/5${pb}[grade]`);
  return partes.join(';'); // termina em [grade]
}

// Inserts 'dividido': nas janelas deles o rosto desce DIVIDIDO.descida px (o topo vira o painel da imagem). [grade] → [base2]
export function filtroDividido(inserts, largura, altura) {
  const js = inserts.filter((x) => x.dividido);
  if (!js.length) return ';[grade]null[base2]';
  const d = Math.round(DIVIDIDO.descida * altura / 1920);
  const en = js.map((j) => `between(t,${j.ini},${(j.fim - 0.001).toFixed(3)})`).join('+');
  return `;[grade]split[g1][g2];[g2]crop=${largura}:${altura - d}:0:0,pad=${largura}:${altura}:0:${d}:color=0x03050c[desce];[g1][desce]overlay=0:0:enable='${en}'[base2]`;
}

// Inserts de vídeo gerado (tipo 'clip'): entram por baixo da página (etiquetas/textos de código ficam por cima),
// em tela cheia, com fade de 0,15 s. Devolve o trecho de filtro que leva [entrada] até [comclips].
export function filtroClips(inserts, { largura, altura, primeiraEntrada, entrada = 'grade' }) {
  const clips = inserts.filter((x) => x.tipo === 'clip');
  if (!clips.length) return { filtro: `[${entrada}]null[comclips]`, arquivos: [] };
  const partes = []; let atual = entrada;
  clips.forEach((x, j) => {
    const k = primeiraEntrada + j, d = (x.fim - x.ini).toFixed(3);
    partes.push(`[${k}:v]scale=${largura}:${altura}:force_original_aspect_ratio=increase,crop=${largura}:${altura},setsar=1,fps=30,trim=duration=${d},setpts=PTS-STARTPTS+${x.ini}/TB,format=yuva420p,fade=t=in:st=${x.ini}:d=0.15:alpha=1[c${j}]`);
    partes.push(`[${atual}][c${j}]overlay=0:0:eof_action=pass:enable='between(t,${x.ini},${x.fim})'[k${j}]`);
    atual = `k${j}`;
  });
  partes.push(`[${atual}]null[comclips]`);
  const arquivo = (src) => (src.startsWith('file://') ? fileURLToPath(src) : src);
  return { filtro: partes.join(';'), arquivos: clips.map((x) => arquivo(x.props.src)) };
}

export async function comporFormatoA({ video, timeline, plano, saida, pastaSfx, largura = 540, altura = 960, fps = 15 }) {
  const t0 = Date.now();
  const duracao = timeline.saida.duracao;
  const palavras = timeline.saida.palavras;
  const trs = trechos(timeline);
  const eventos = resolverPlano(plano, palavras, duracao);
  const pasta = pastaDeCamadas(saida);
  await mkdir(pasta, { recursive: true });
  // inserts "recorte": a pessoa recortada (Vision) fica na frente da imagem do insert, a legenda por cima de tudo.
  // Com "dividido": tela dividida e a cabeça passa por cima da parte de baixo do painel (como no Formato B).
  // Sem "dividido": a imagem vira o fundo inteiro, como em fundo verde.
  // Eles saem da página principal e ganham uma camada própria só no trecho deles.
  const recortes = eventos.inserts.filter((x) => x.recorte);
  const htmlPath = path.join(pasta, 'formato-a.html');
  await writeFile(htmlPath, paginaFormatoA({ palavras, destaques: plano.destaques, eventos: { ...eventos, inserts: eventos.inserts.filter((x) => !x.recorte) }, trs, tema: plano.tema }));
  const mov = path.join(pasta, 'formato-a.mov');
  await renderizarOverlay(htmlPath, duracao, fps, mov);
  const dim = await dimensoes(video);
  const rosto = await centroRosto(video, [1, duracao * 0.25, duracao * 0.5, duracao * 0.75, duracao - 1.5]);
  const som = await alinharPicos(planoDeSom({ eventos, plano, pastaSfx }));
  await writeFile(path.join(pasta, 'som.json'), JSON.stringify(som, null, 2));
  const cl = filtroClips(eventos.inserts, { largura, altura, primeiraEntrada: 2, entrada: 'base2' });
  let fv = filtroBase({ larguraFonte: dim.largura, alturaFonte: dim.altura, rosto, trs, rec: eventos.rec, largura, altura })
    + filtroDividido(eventos.inserts, largura, altura) + `;${cl.filtro}`;
  let entradas = ['-i', video, '-i', mov, ...cl.arquivos.flatMap((a) => ['-i', a])], voz = '[0:a]';
  if (recortes.length) {
    // 1) vídeo base pronto (enquadramentos, grade, clipes) para a máscara sair do mesmo quadro que vai para a tela
    const base = path.join(pasta, 'base.mp4');
    await rodar(ffmpeg, ['-y', ...entradas, '-filter_complex', fv, '-map', '[comclips]', '-r', String(fps),
      '-threads', '4', '-filter_complex_threads', '2', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '14', '-pix_fmt', 'yuv420p', '-t', String(duracao), base]);
    const ini = Math.min(...recortes.map((x) => x.ini)), fim = Math.max(...recortes.map((x) => x.fim)), dur = fim - ini;
    // 2) máscara da pessoa só nesse trecho; 3) camada só com as imagens de fundo, no mesmo trecho
    const mascara = await videoMascara(base, pasta, fps, { ini, dur });
    const fundoHtml = path.join(pasta, 'fundo.html'), fundo = path.join(pasta, 'fundo.mov');
    await writeFile(fundoHtml, paginaFormatoA({ palavras: [], destaques: [], eventos: { inserts: recortes, rec: null, cta: null }, trs, tema: plano.tema }));
    await renderizarOverlay(fundoHtml, dur, fps, fundo, { inicio: ini });
    // 4) base → fundo → pessoa recortada → página principal (legenda); voz vem do corte original
    // entradas abaixo: 0 base, 1 página, 2 corte (voz), 3 fundo, 4 máscara
    const k = 3, en = recortes.map((x) => `between(t,${x.ini},${(x.fim - 0.001).toFixed(3)})`).join('+');
    const em = () => `setpts=PTS-STARTPTS+${ini}/TB`;
    fv = `[0:v]split[bs1][bs2];[${k}:v]scale=${largura}:${altura},${em()}[fd];[bs1][fd]overlay=0:0:eof_action=pass:enable='${en}'[r1];`
      + `[${k + 1}:v]scale=${largura}:${altura},format=gray,${em()}[mk];[bs2]trim=start=${ini}:end=${fim},${em()}[pv];[pv][mk]alphamerge[pessoa];`
      + `[r1][pessoa]overlay=0:0:eof_action=pass:enable='${en}'[comclips]`;
    entradas = ['-i', base, '-i', mov, '-i', video, '-i', fundo, '-i', mascara]; voz = '[2:a]';
  }
  fv += `;[1:v]scale=${largura}:${altura}[ov];[comclips][ov]overlay=0:0:shortest=1[saida]`;
  const nEntradas = entradas.length / 2;
  const agudos = ganhoAgudos(await medirAgudos(video)); // voz abafada ganha agudos até o nível do AKG
  const fa = filtroSom(som, nEntradas, { agudos }).replace('[0:a]', voz);
  await rodar(ffmpeg, ['-y', ...entradas, ...som.flatMap((s) => ['-i', s.arquivo]),
    '-filter_complex', `${fv};${fa}`, '-map', '[saida]', '-map', '[audio]', '-r', String(fps),
    '-threads', '4', '-filter_complex_threads', '2', '-c:v', 'libx264', '-preset', fps > 15 ? 'medium' : 'veryfast', '-crf', fps > 15 ? '18' : '24', '-pix_fmt', 'yuv420p',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-t', String(duracao), saida]);
  // Sempre também uma versão SEM música (voz + efeitos), para usar a trilha do banco do Instagram/TikTok/Shorts.
  if (som.some((x) => x.cat === 'musica')) {
    const semMusica = som.filter((x) => x.cat !== 'musica');
    // entrada 0 = vídeo pronto (imagem), 1 = corte original (voz), 2.. = efeitos
    await rodar(ffmpeg, ['-y', '-i', saida, '-i', video, ...semMusica.flatMap((x) => ['-i', x.arquivo]),
      '-filter_complex', filtroSom(semMusica, 2, { agudos }).replace('[0:a]', '[1:a]'), '-map', '0:v', '-map', '[audio]', '-c:v', 'copy',
      '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-t', String(duracao), saida.replace(/\.mp4$/, '-sem-musica.mp4')]);
  }
  return { saida, rosto, trechos: trs.length, inserts: eventos.inserts.length, sfx: som.length, segundos: (Date.now() - t0) / 1000 };
}

// CLI: node motor/render/formato-a.mjs <video> <timeline.json> <plano.json> <saida.mp4> [--final]
// src relativo nos props é relativo ao plano.json; SFX vêm de <acervo>/Conteudo/SFX Audio.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // prioridade baixa: o Mac continua responsivo durante o render (filhos — ffmpeg, Chrome, Python — herdam)
  try { (await import('node:os')).setPriority(10); } catch {}
  const final = process.argv.includes('--final');
  const [video, tl, pj, saida] = process.argv.slice(2).filter((a) => a !== '--final');
  const timeline = JSON.parse(await readFile(tl, 'utf8'));
  const plano = JSON.parse(await readFile(pj, 'utf8'));
  // caminho relativo de mídia (imagem/vídeo/svg) em qualquer lugar do plano → URL file:// relativa ao plano.json
  const MIDIA = /\.(png|jpe?g|webp|svg|mp4|mov)$/i;
  const fixar = (o) => { if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { if (typeof v === 'string' && MIDIA.test(v) && !v.includes('://')) o[k] = pathToFileURL(path.resolve(path.dirname(pj), v)).href; else fixar(v); } };
  fixar(plano);
  const cfg = JSON.parse(await readFile(new URL('../../conteudo.config.json', import.meta.url), 'utf8'));
  const pastaSfx = path.join(cfg.acervo, 'Conteudo', 'SFX Audio');
  console.log(JSON.stringify(await comporFormatoA({ video, timeline, plano, saida, pastaSfx, ...(final ? { largura: 1080, altura: 1920, fps: 30 } : {}) }), null, 1));
}
