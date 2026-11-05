// Formato B — "painel com degradê + recorte em camadas" (ref. leobeckerdesign DemFz + pedido do criador).
// Com insert: o rosto desce para a metade de baixo; o painel (horizonte + conteúdo) ocupa o topo e se dissolve
// num degradê; a pessoa recortada (Vision) fica NA FRENTE do painel; legenda mono por cima de tudo.
// Sem insert: rosto em tela cheia (mesmos enquadramentos do Formato A). Usa o mesmo plano.json do Formato A.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';
import { LARGURA, cssMarca, esc } from '../video/legenda.mjs';
import { renderizarOverlay, pastaDeCamadas } from '../video/cards.mjs';
import { montarCard, CSS_BASE, AJUDANTES } from './broll.mjs';
import { legendasMarca, centroRosto, rodar, dimensoes } from './compor.mjs';
import { resolverPlano, trechos, filtroBase, ENTRADA } from './formato-a.mjs';
import { CSS_VISUAL, JS_VISUAL, MONO } from './visual.mjs';
import { planoDeSom, filtroSom, alinharPicos, medirAgudos, ganhoAgudos } from './som.mjs';
import { videoMascara } from '../video/recorte.mjs';

export const DESCIDA = 440;      // quanto o rosto desce (px em 1920) quando o painel está ativo
export const FADE = [780, 1120]; // degradê do painel (y onde começa a sumir → some de vez)

// Conteúdo do painel por tipo de insert (mesmos props do Formato A), dentro da faixa 0–FADE[1].
function conteudoPainel(x) {
  const p = x.props || {};
  const tag = p.tag ? `<div class="tg"><span class="tag">${esc(p.tag)}</span></div>` : '';
  if (x.tipo === 'cena') return { html: `<img class="im" src="${esc(p.src || '')}">${tag}`, js: `tf($(r, '.im'), 'scale(' + (1.05 + 0.04 * t) + ')');` };
  if (x.tipo === 'tipografia') return { html: `${tag}<div class="pal${p.cor === 'limao' ? ' limao' : ''}"><span class="w">${esc(p.palavra || '')}</span></div>${p.sub ? `<div class="sub">${esc(p.sub)}</div>` : ''}`,
    js: `const w = $(r, '.w'); const q = cl((t - 0.08) / 0.3); w.style.opacity = q; w.style.filter = 'blur(' + (1 - q) * 20 + 'px)'; tf($(r, '.pal'), 'scale(' + (1 + 0.025 * t) + ')'); revela($(r, '.sub'), t, 0.4, 0.25);` };
  if (x.tipo === 'editorial') return { html: `${tag}<div class="mc">${esc(p.manchete || '')}</div>`, js: `revela($(r, '.mc'), t, 0.1, 0.3, 14);` };
  const card = x.tipo === 'ui' ? (p.card || { tipo: 'grade-componentes' }) : null;
  const m = card ? montarCard(card.tipo, card.props || {}) : null;
  return { html: `${tag}${p.titulo ? `<div class="ti">${esc(p.titulo)}</div>` : ''}${m ? `<div class="vidro cx"><div class="in">${m.html}</div></div>` : ''}`, css: m?.css,
    js: `revela($(r, '.ti'), t, 0.05, 0.25, 14); const cx = $(r, '.cx'); if (cx) { const q = mola(t - 0.1, { freq: 2.2, amort: 0.72 }); cx.style.opacity = cl(q * 2); cx.style.transform = 'translateY(' + (1 - q) * 120 + 'px) scale(0.8)'; ${m ? `(${m.js})(Math.max(0, t - 0.1), $(cx, '.in').firstElementChild);` : ''} }` };
}

const CSS_PAINEL = `
.pn { position: absolute; left: 0; top: 0; width: ${LARGURA}px; height: ${FADE[1]}px; display: none; overflow: hidden;
  -webkit-mask-image: linear-gradient(180deg, #000 ${FADE[0] / FADE[1] * 100}%, transparent 100%); }
.pn .hz { position: absolute; inset: 0; }
.pn .im { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 35%; }
.pn .tg { position: absolute; left: 0; right: 0; top: 250px; text-align: center; z-index: 2; }
.pn .ti { position: absolute; left: 90px; right: 90px; top: 320px; text-align: center; font-family: var(--fonte-titulo); font-weight: 600; font-size: 80px; line-height: 1.04; letter-spacing: -0.035em; color: var(--gelo); }
.pn .cx { left: 40px; right: 40px; top: 400px; height: 760px; transform-origin: 50% 0; }
.pn .cx .in { position: absolute; left: 50px; top: 40px; width: 900px; height: 660px; } .pn .cx .in > .k { background: transparent; } .pn .cx .in > .k > .grade { display: none; }
.pn .pal { position: absolute; left: 0; right: 0; top: 360px; text-align: center; font-family: var(--fonte-titulo); font-weight: 600; font-size: 190px; letter-spacing: -0.04em; color: var(--gelo); } .pn .pal.limao { color: var(--limao); }
.pn .sub { position: absolute; left: 0; right: 0; top: 590px; text-align: center; font-family: ${MONO}; font-size: 36px; color: rgba(246,246,246,0.8); }
.pn .mc { position: absolute; left: 90px; right: 90px; top: 330px; font-family: var(--fonte-titulo); font-weight: 600; font-size: 100px; line-height: 1.04; letter-spacing: -0.035em; color: var(--gelo); }
`;

// Camada de baixo: painéis (ficam atrás da pessoa recortada).
export function paginaPainel({ eventos }) {
  const ins = eventos.inserts, cs = ins.map(conteudoPainel);
  return `<!doctype html><html><head><meta charset="utf-8"><style>${cssMarca()}${CSS_BASE}${CSS_VISUAL}${CSS_PAINEL}${[...new Set(cs.map((c) => c.css || ''))].join('\n')} body{margin:0}</style></head><body>
${ins.map((x, i) => `<div class="pn" id="p${i}">${x.tipo === 'cena' ? '' : `<div class="hz" data-forma="topo"><canvas width="540" height="560"></canvas></div>`}${cs[i].html}</div>`).join('')}
<script>${AJUDANTES}${JS_VISUAL}
const I = ${JSON.stringify(ins.map(({ ini, fim }) => ({ ini, fim })))}; const ENT = ${ENTRADA};
const F = [${cs.map((c) => `function (t, r) { const hz = $(r, '.hz'); if (hz) horizonte($(hz, 'canvas'), t, 'topo'); revela($(r, '.tg'), t, 0.02, 0.2); ${c.js} }`).join(',\n')}];
const els = I.map((_, i) => document.getElementById('p' + i));
window.seek = (t) => { I.forEach((x, i) => { const on = t >= x.ini && t < x.fim; els[i].style.display = on ? 'block' : 'none'; if (!on) return;
  const e = suave((t - x.ini) / ENT); els[i].style.opacity = e; els[i].style.filter = 'blur(' + (1 - e) * 16 + 'px)'; F[i](t - x.ini, els[i]); }); };
window.seek(0);
</script></body></html>`;
}

// Camada de cima: legenda mono (na costura quando há painel), REC e CTA — por cima da pessoa.
export function paginaTopo({ palavras, destaques, eventos }) {
  const { inserts, rec, cta } = eventos;
  const ctaCard = cta ? montarCard(cta.tipo || 'comentario', cta.props || {}) : null;
  const B = legendasMarca(palavras, destaques);
  return `<!doctype html><html><head><meta charset="utf-8"><style>${cssMarca()}${CSS_BASE}${CSS_VISUAL}${ctaCard?.css || ''}
body { margin: 0; }
#leg { position: absolute; left: 50%; transform: translateX(-50%); z-index: 10; font-family: ${MONO}; font-weight: 700; font-size: 44px; line-height: 1.15; letter-spacing: 0.02em; text-transform: uppercase; color: var(--gelo);
  background: rgba(3,5,12,0.82); padding: 10px 22px; border-radius: 6px; box-shadow: inset 0 0 0 2px rgba(77,123,255,0.45); white-space: nowrap; }
#leg:empty { display: none; } #leg .p { margin-right: 0.5em; } #leg .p:last-child { margin-right: 0; } #leg .d { color: var(--limao); }
#rec { position: absolute; inset: 0; display: none; font-family: ${MONO}; color: var(--gelo); }
#rec .tx { position: absolute; left: 110px; top: 300px; font-weight: 700; font-size: 40px; display: flex; align-items: center; gap: 14px; } #rec .tx i { width: 22px; height: 22px; border-radius: 50%; background: #ff3b30; }
#rec .c { position: absolute; width: 70px; height: 70px; border: 5px solid rgba(246,246,246,0.9); }
#rec .c1 { left: 80px; top: 270px; border-right: 0; border-bottom: 0; } #rec .c2 { right: 80px; top: 270px; border-left: 0; border-bottom: 0; } #rec .c3 { left: 80px; bottom: 300px; border-right: 0; border-top: 0; } #rec .c4 { right: 80px; bottom: 300px; border-left: 0; border-top: 0; }
#cta { position: absolute; left: 90px; top: 1180px; width: 900px; height: 360px; display: none; } #cta .k { background: transparent; } #cta .grade { display: none; }
#flash { position: absolute; inset: 0; background: var(--gelo); opacity: 0; }
</style></head><body>
<div id="rec"><div class="c c1"></div><div class="c c2"></div><div class="c c3"></div><div class="c c4"></div><div class="tx"><i></i>REC</div></div>
${ctaCard ? `<div id="cta">${ctaCard.html}</div>` : ''}<div id="leg"></div><div id="flash"></div>
<script>${AJUDANTES}
const I = ${JSON.stringify(inserts.map(({ ini, fim, flash }) => ({ ini, fim, flash: !!flash })))}; const B = ${JSON.stringify(B)};
const REC = ${JSON.stringify(rec)}, CTA = ${JSON.stringify(cta ? { ini: cta.ini } : null)}; const FCTA = ${ctaCard ? ctaCard.js : 'null'};
const leg = document.getElementById('leg'), rec = document.getElementById('rec'), ctaEl = document.getElementById('cta'), flash = document.getElementById('flash');
let bloco = -2;
window.seek = (t) => {
  const painel = I.some((x) => t >= x.ini && t < x.fim);
  let fl = 0; I.forEach((x) => { if (x.flash && t >= x.ini && t < x.ini + 0.3) fl = 1 - (t - x.ini) / 0.3; }); flash.style.opacity = fl * 0.8;
  const emRec = REC && !painel && t >= REC.ini && t < REC.fim; rec.style.display = emRec ? 'block' : 'none'; if (emRec) rec.querySelector('.tx i').style.opacity = Math.floor(t * 2) % 2 ? 0.25 : 1;
  const emCta = CTA && !painel && t >= CTA.ini; if (ctaEl) { ctaEl.style.display = emCta ? 'block' : 'none'; if (emCta) FCTA(t - CTA.ini, ctaEl.firstElementChild); }
  const i = B.findIndex((b) => t >= b.ini && t < b.fim);
  if (i !== bloco) { bloco = i; leg.innerHTML = i < 0 ? '' : B[i].palavras.map((p, k) => '<span class="p' + (k === B[i].destaque ? ' d' : '') + '">' + p.texto.replace(/[&<>]/g, '') + '</span>').join(''); }
  leg.style.top = (painel ? ${FADE[0] + 40} : emCta ? 1060 : 1290) + 'px';
  if (i >= 0) { const q = cl((t - B[i].ini) / 0.16); leg.style.opacity = q; }
};
window.seek(0);
</script></body></html>`;
}

const entre = (js) => js.map((j) => `between(t,${j.ini.toFixed(3)},${(j.fim - 0.001).toFixed(3)})`).join('+') || '0';

export async function comporFormatoB({ video, timeline, plano, saida, pastaSfx, largura = 540, altura = 960, fps = 15 }) {
  const t0 = Date.now();
  const duracao = timeline.saida.duracao, palavras = timeline.saida.palavras;
  const trs = trechos(timeline), eventos = resolverPlano(plano, palavras, duracao);
  const pasta = pastaDeCamadas(saida);
  await mkdir(pasta, { recursive: true });
  // 1) base: enquadramentos + grade; com painel, o rosto desce DESCIDA px
  const dim = await dimensoes(video);
  const rosto = await centroRosto(video, [1, duracao * 0.25, duracao * 0.5, duracao * 0.75, duracao - 1.5]);
  const d = Math.round(DESCIDA * altura / 1920);
  const fb = filtroBase({ larguraFonte: dim.largura, alturaFonte: dim.altura, rosto, trs, rec: eventos.rec, largura, altura })
    + `;[grade]split[g1][g2];[g2]crop=${largura}:${altura - d}:0:0,pad=${largura}:${altura}:0:${d}:color=0x03050c[desce];[g1][desce]overlay=0:0:enable='${entre(eventos.inserts)}'[base]`;
  const base = path.join(pasta, 'base.mp4');
  await rodar(ffmpeg, ['-y', '-i', video, '-filter_complex', fb, '-map', '[base]', '-r', String(fps), '-threads', '4', '-filter_complex_threads', '2', '-c:v', 'libx264', '-crf', '14', '-pix_fmt', 'yuv420p', '-t', String(duracao), base]);
  // 2) máscara da pessoa sobre a base final
  const mascara = await videoMascara(base, pasta, fps);
  // 3) camadas HTML
  const hp = path.join(pasta, 'painel.html'), ht = path.join(pasta, 'topo.html');
  await writeFile(hp, paginaPainel({ eventos })); await writeFile(ht, paginaTopo({ palavras, destaques: plano.destaques, eventos }));
  const mp = path.join(pasta, 'painel.mov'), mt = path.join(pasta, 'topo.mov');
  await renderizarOverlay(hp, duracao, fps, mp); await renderizarOverlay(ht, duracao, fps, mt);
  // 4) composição: base → painel → pessoa recortada (só com painel) → topo; + som
  const som = await alinharPicos(planoDeSom({ eventos, plano, pastaSfx }));
  const fv = [`[1:v]scale=${largura}:${altura}[pn]`, `[0:v][pn]overlay=0:0[b1]`, `[3:v]scale=${largura}:${altura},format=gray[m]`,
    `[0:v][m]alphamerge[pessoa]`, `[b1][pessoa]overlay=0:0:enable='${entre(eventos.inserts)}'[b2]`, `[2:v]scale=${largura}:${altura}[tp]`, `[b2][tp]overlay=0:0[saida]`].join(';');
  const agudos = ganhoAgudos(await medirAgudos(video));
  const fa = filtroSom(som, 5, { agudos }).replace('[0:a]', '[4:a]');
  await rodar(ffmpeg, ['-y', '-i', base, '-i', mp, '-i', mt, '-i', mascara, '-i', video, ...som.flatMap((s) => ['-i', s.arquivo]),
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
  return { saida, inserts: eventos.inserts.length, sfx: som.length, segundos: (Date.now() - t0) / 1000 };
}

// CLI: node motor/render/formato-b.mjs <video> <timeline.json> <plano.json> <saida.mp4> [--final]
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
  console.log(JSON.stringify(await comporFormatoB({ video, timeline, plano, saida, pastaSfx: path.join(cfg.acervo, 'Conteudo', 'SFX Audio'), ...(final ? { largura: 1080, altura: 1920, fps: 30 } : {}) }), null, 1));
}
