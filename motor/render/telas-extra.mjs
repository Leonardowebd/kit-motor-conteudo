// Repertório extra de telas de insert (pedido do criador, 2026-10-31: "mais componentes, objetos e elementos").
// Mesmo contrato das TELAS de visual.mjs: tipo(props) → { html, css, js: 'function (t, r) {…}' }, tudo determinístico
// por t (seek). Cores e fontes só da marca; a pele (moldura .vidro, fundo, etiqueta) vem do tema (temas.mjs).
import { esc } from '../video/legenda.mjs';
import { MONO, CANVAS, HZ_JS } from './kit.mjs';

// etiqueta + título no topo, iguais em todas as telas extras
const cab = (tag, titulo) => `${tag ? `<div class="tg"><span class="tag">${esc(tag)}</span></div>` : ''}${titulo ? `<div class="ti">${esc(titulo)}</div>` : ''}`;
const CSS_CAB = (c, yTag = 290, yTi = 350) => `.${c} { position: absolute; inset: 0; }
.${c} .tg { position: absolute; left: 0; right: 0; top: ${yTag}px; text-align: center; z-index: 3; }
.${c} .ti { position: absolute; left: 80px; right: 80px; top: ${yTi}px; text-align: center; z-index: 3; font-family: var(--fonte-titulo); font-weight: 600; font-size: 84px; line-height: 1.04; letter-spacing: -0.035em; color: var(--gelo); }`;
const JS_CAB = `revela($(r, '.tg'), t, 0.02, 0.2); revela($(r, '.ti'), t, 0.06, 0.25, 14);`;
const entra = (sel, ini) => `{ const el = $(r, '${sel}'); if (el) { const q = mola(t - ${ini}, { freq: 2.2, amort: 0.72 }); el.style.opacity = cl(q * 2); el.style.transform = 'translateY(' + (1 - q) * 160 + 'px)'; } }`;

export const TELAS_EXTRA = {
  // janela de terminal com comandos sendo digitados ($ comando em gelo, ✓ saída em limão, resto em azul-gelo)
  terminal({ titulo = '', tag = '', linhas = ['$ npx skills add', '✓ pronto'], janela = 'terminal' } = {}) {
    const ls = linhas.map((l) => `<div class="ln ${l.startsWith('$') ? 'cmd' : l.startsWith('✓') ? 'ok' : 'out'}" data-tx="${esc(l)}"></div>`).join('');
    return { html: `<div class="t-term">${CANVAS('horizonte')}${cab(tag, titulo)}<div class="vidro jn"><div class="bar"><i></i><i></i><i></i><span>${esc(janela)}</span></div><div class="cp">${ls}</div></div></div>`,
      css: `${CSS_CAB('t-term')}
.t-term .jn { left: 70px; right: 70px; top: 560px; height: 760px; }
.t-term .bar { height: 76px; display: flex; align-items: center; gap: 14px; padding: 0 34px; border-bottom: 2px solid rgba(246,246,246,0.08); }
.t-term .bar i { width: 22px; height: 22px; border-radius: 50%; background: rgba(246,246,246,0.22); } .t-term .bar i:first-child { background: var(--limao); }
.t-term .bar span { margin-left: auto; font-family: ${MONO}; font-size: 26px; color: rgba(246,246,246,0.5); }
.t-term .cp { padding: 40px 44px; font-family: ${MONO}; font-size: 40px; line-height: 1.55; white-space: pre-wrap; word-break: break-all; }
.t-term .cmd { color: var(--gelo); } .t-term .ok { color: var(--limao); } .t-term .out { color: var(--azul-gelo); opacity: 0.85; }
.t-term .cur { display: inline-block; width: 0.6em; height: 1.05em; vertical-align: -0.15em; background: var(--limao); margin-left: 4px; }`,
      js: `function (t, r) { ${HZ_JS} ${JS_CAB} ${entra('.jn', 0.05)}
  let ini = 0.35; const ls = $$(r, '.ln'); let ultima = null;
  ls.forEach((l) => { const tx = l.dataset.tx, cmd = l.classList.contains('cmd'), vel = cmd ? 26 : 90; // comando digita, saída aparece rápido
    const n = Math.max(0, Math.min(tx.length, Math.floor((t - ini) * vel))); l.textContent = tx.slice(0, n); if (n > 0) ultima = l; ini += tx.length / vel + 0.22; });
  $$(r, '.cur').forEach((c) => c.remove()); if (ultima && Math.floor(t * 2.5) % 2 === 0) { const c = document.createElement('span'); c.className = 'cur'; ultima.appendChild(c); } }` };
  },

  // conversa em bolhas (eu à direita em azul, outro à esquerda em vidro), com "digitando…" antes da resposta
  chat({ titulo = '', tag = '', mensagens = [{ de: 'eu', texto: 'oi' }, { de: 'outro', texto: 'olá!' }], app = '' } = {}) {
    const bs = mensagens.map((m) => `<div class="bl ${m.de === 'eu' ? 'eu' : 'ou'}"><div class="dg"><i></i><i></i><i></i></div><div class="tx">${esc(m.texto)}</div></div>`).join('');
    return { html: `<div class="t-chat">${CANVAS('horizonte')}${cab(tag, titulo)}<div class="vidro cv">${app ? `<div class="ap">${esc(app)}</div>` : ''}<div class="ms">${bs}</div></div></div>`,
      css: `${CSS_CAB('t-chat')}
.t-chat .cv { left: 70px; right: 70px; top: 560px; height: 780px; }
.t-chat .ap { height: 80px; display: flex; align-items: center; justify-content: center; font-family: var(--fonte-texto); font-weight: 700; font-size: 32px; color: var(--gelo); border-bottom: 2px solid rgba(246,246,246,0.08); }
.t-chat .ms { position: absolute; left: 36px; right: 36px; bottom: 44px; display: flex; flex-direction: column; gap: 22px; }
.t-chat .bl { max-width: 76%; position: relative; transform-origin: 100% 100%; }
.t-chat .bl.eu { align-self: flex-end; } .t-chat .bl.ou { align-self: flex-start; transform-origin: 0 100%; }
.t-chat .tx { font-family: var(--fonte-texto); font-size: 40px; line-height: 1.25; padding: 22px 30px; border-radius: 38px; }
.t-chat .eu .tx { background: var(--azul); color: var(--gelo); border-bottom-right-radius: 10px; }
.t-chat .ou .tx { background: rgba(246,246,246,0.12); color: var(--gelo); border-bottom-left-radius: 10px; box-shadow: inset 0 0 0 2px rgba(246,246,246,0.08); }
.t-chat .dg { display: none; gap: 10px; padding: 26px 30px; border-radius: 38px; background: rgba(246,246,246,0.12); width: max-content; }
.t-chat .dg i { width: 16px; height: 16px; border-radius: 50%; background: var(--gelo); }`,
      js: `function (t, r) { ${HZ_JS} ${JS_CAB} ${entra('.cv', 0.05)}
  let ini = 0.3; $$(r, '.bl').forEach((b) => { const ou = b.classList.contains('ou'), dg = $(b, '.dg'), tx = $(b, '.tx');
    const digita = ou ? 0.45 : 0; const em = ini + digita; const vis = t >= ini;
    b.style.display = vis ? 'block' : 'none'; if (!vis) { ini += digita + 0.5; return; }
    const escrevendo = ou && t < em; dg.style.display = escrevendo ? 'flex' : 'none'; tx.style.display = escrevendo ? 'none' : 'block';
    if (escrevendo) $$(dg, 'i').forEach((d, k) => { d.style.opacity = 0.35 + 0.65 * Math.max(0, Math.sin(t * 9 - k * 0.9)); });
    const q = mola(t - (escrevendo ? ini : em), { freq: 3, amort: 0.6 }); b.style.transform = 'scale(' + (0.6 + 0.4 * q) + ')'; b.style.opacity = cl(q * 2);
    ini = em + 0.5; }); }` };
  },

  // aviso no estilo iPhone que desce do topo, com outro empilhado atrás
  notificacao({ titulo = '', tag = '', app = 'Mensagens', assunto = '', texto = '', icone = '', hora = 'agora' } = {}) {
    const ic = icone ? `<img src="${esc(icone)}">` : `<b>${esc(app.slice(0, 1))}</b>`;
    return { html: `<div class="t-notif">${CANVAS('topo')}<div class="pilha"></div><div class="vidro nt"><div class="ic">${ic}</div><div class="cx"><div class="l1"><span class="ap">${esc(app)}</span><span class="hr">${esc(hora)}</span></div>${assunto ? `<div class="as">${esc(assunto)}</div>` : ''}<div class="tx">${esc(texto)}</div></div></div>${cab(tag, titulo)}</div>`,
      css: `${CSS_CAB('t-notif', 860, 920)}
.t-notif .nt { left: 60px; right: 60px; top: 420px; min-height: 210px; border-radius: 52px; display: flex; gap: 30px; padding: 34px 38px; box-sizing: border-box; }
.t-notif .pilha { position: absolute; left: 110px; right: 110px; top: 470px; height: 200px; border-radius: 48px; background: rgba(246,246,246,0.08); box-shadow: inset 0 0 0 2px rgba(246,246,246,0.06); }
.t-notif .ic { width: 104px; height: 104px; border-radius: 26px; background: var(--azul); flex: none; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.t-notif .ic img { width: 100%; height: 100%; object-fit: cover; } .t-notif .ic b { font-family: var(--fonte-titulo); font-size: 56px; color: var(--gelo); }
.t-notif .cx { flex: 1; min-width: 0; font-family: var(--fonte-texto); color: var(--gelo); }
.t-notif .l1 { display: flex; justify-content: space-between; font-size: 28px; opacity: 0.6; letter-spacing: 0.02em; text-transform: uppercase; }
.t-notif .as { font-size: 38px; font-weight: 700; margin-top: 8px; } .t-notif .tx { font-size: 36px; line-height: 1.3; margin-top: 6px; opacity: 0.92; }`,
      js: `function (t, r) { ${HZ_JS} revela($(r, '.tg'), t, 0.35, 0.2); revela($(r, '.ti'), t, 0.4, 0.25, 14);
  const q = mola(t - 0.08, { freq: 2.4, amort: 0.55 }); const nt = $(r, '.nt'); nt.style.transform = 'translateY(' + (1 - q) * -620 + 'px) scale(' + (0.94 + 0.06 * cl(q)) + ')';
  const p = $(r, '.pilha'); const q2 = mola(t - 0.25, { freq: 2.4, amort: 0.7 }); p.style.opacity = cl(q2) * 0.9; p.style.transform = 'translateY(' + (1 - q2) * -200 + 'px)'; }` };
  },

  // trilha de passos 1 → 2 → 3 que acende em sequência (linha de progresso entre os círculos)
  passos({ titulo = '', tag = '', itens = ['Escolha', 'Conecte', 'Rode'], ritmo = 0.45 } = {}) {
    const its = itens.map((x, i) => `<div class="it"><div class="nb">${i + 1}</div><div class="rt">${esc(x)}</div></div>`).join('');
    return { html: `<div class="t-pass">${CANVAS('horizonte')}${cab(tag, titulo)}<div class="lista"><div class="trilho"><div class="fio"></div></div>${its}</div></div>`,
      css: `${CSS_CAB('t-pass')}
.t-pass .lista { position: absolute; left: 130px; right: 90px; top: 580px; display: flex; flex-direction: column; gap: 70px; }
.t-pass .trilho { position: absolute; left: 54px; top: 60px; bottom: 60px; width: 6px; background: rgba(246,246,246,0.14); border-radius: 3px; }
.t-pass .fio { position: absolute; left: 0; top: 0; width: 100%; height: 0; background: var(--limao); border-radius: 3px; }
.t-pass .it { position: relative; display: flex; align-items: center; gap: 44px; }
.t-pass .nb { width: 114px; height: 114px; flex: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--fonte-titulo); font-weight: 700; font-size: 54px;
  color: var(--gelo); background: #0a0f1f; box-shadow: inset 0 0 0 4px rgba(246,246,246,0.25); }
.t-pass .it.on .nb { background: var(--limao); color: var(--noite); box-shadow: 0 0 40px rgba(182,255,89,0.45); }
.t-pass .rt { font-family: var(--fonte-titulo); font-weight: 600; font-size: 72px; letter-spacing: -0.03em; color: rgba(246,246,246,0.4); }
.t-pass .it.on .rt { color: var(--gelo); }`,
      js: `function (t, r) { ${HZ_JS} ${JS_CAB} const its = $$(r, '.it'), n = its.length;
  its.forEach((it, i) => { const a = 0.25 + i * ${ritmo}; const q = mola(t - a + 0.2, { freq: 2.4, amort: 0.7 }); it.style.opacity = cl(q * 2); it.style.transform = 'translateX(' + (1 - q) * 80 + 'px)';
    it.classList.toggle('on', t >= a); const nb = $(it, '.nb'); if (t >= a) nb.style.transform = 'scale(' + (1 + 0.18 * Math.exp(-(t - a) * 9)) + ')'; });
  $(r, '.fio').style.height = (cl((t - 0.25) / (${ritmo} * Math.max(1, n - 1))) * 100) + '%'; }` };
  },

  // celular com o print/foto dentro, entra inclinado e assenta; a tela rola devagar (rolagem: quanto desce, 0–1)
  celular({ src = '', titulo = '', tag = '', credito = '', foco = 0, rolagem = 0.12 } = {}) {
    return { html: `<div class="t-cel">${CANVAS('horizonte')}${cab(tag, titulo)}<div class="cel"><div class="tela"><img src="${esc(src)}"></div><div class="ilha"></div></div>${credito ? `<div class="cr">${esc(credito)}</div>` : ''}</div>`,
      css: `${CSS_CAB('t-cel', 200, 250)}
.t-cel .cel { position: absolute; left: 50%; top: 400px; width: 520px; height: 1060px; margin-left: -260px; border-radius: 86px; background: #0b0d14; padding: 20px; box-sizing: border-box;
  box-shadow: inset 0 0 0 3px rgba(246,246,246,0.18), 0 0 0 2px #000, 0 60px 140px rgba(0,0,0,0.6), 0 0 120px rgba(0,53,212,0.35); transform-origin: 50% 100%; }
.t-cel .tela { width: 100%; height: 100%; border-radius: 68px; overflow: hidden; background: #000; }
.t-cel .tela img { width: 100%; height: 100%; object-fit: cover; }
.t-cel .ilha { position: absolute; left: 50%; top: 44px; width: 150px; height: 44px; margin-left: -75px; border-radius: 22px; background: #000; }
.t-cel .cr { position: absolute; left: 0; right: 0; top: 1490px; text-align: center; font-family: var(--fonte-mono); font-size: 26px; color: rgba(246,246,246,0.62); }`,
      js: `function (t, r) { ${HZ_JS} ${JS_CAB} revela($(r, '.cr'), t, 0.4, 0.2, 6);
  const q = mola(t - 0.05, { freq: 2, amort: 0.7 }); const c = $(r, '.cel'); c.style.opacity = cl(q * 2);
  c.style.transform = 'perspective(1600px) translateY(' + (1 - q) * 300 + 'px) rotateX(' + (1 - q) * 28 + 'deg) rotateZ(' + (1 - q) * -6 + 'deg)';
  $(r, '.tela img').style.objectPosition = '50% ' + ((${foco} + ${rolagem} * suave(cl((t - 0.4) / 2.2))) * 100) + '%'; }` };
  },

  // antes/depois: o "antes" pequeno e apagado à esquerda, o "depois" grande entra por cima
  antesdepois({ titulo = '', tag = '', antes = { texto: 'antes' }, depois = { texto: 'depois' }, rotulos = ['antes', 'depois'] } = {}) {
    const card = (x, c) => `<div class="vidro cd ${c}">${x.src ? `<img src="${esc(x.src)}">` : `<div class="tx">${esc(x.texto || '')}</div>`}<span class="rot">${esc(c === 'a' ? rotulos[0] : rotulos[1])}</span></div>`;
    return { html: `<div class="t-ad">${CANVAS('horizonte')}${cab(tag, titulo)}${card(antes, 'a')}${card(depois, 'd')}</div>`,
      css: `${CSS_CAB('t-ad')}
.t-ad .cd { width: 470px; height: 640px; top: 600px; border-radius: 40px; }
.t-ad .cd.a { left: 70px; filter: grayscale(1) brightness(0.75); } .t-ad .cd.d { right: 60px; width: 540px; height: 720px; top: 560px; }
.t-ad .cd img { width: 100%; height: 100%; object-fit: cover; }
.t-ad .cd .tx { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 40px; text-align: center; font-family: var(--fonte-titulo); font-weight: 600; font-size: 64px; line-height: 1.05; color: var(--gelo); }
.t-ad .rot { position: absolute; left: 28px; top: 28px; font-family: ${MONO}; font-size: 28px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 8px 16px; border-radius: 10px; background: rgba(3,5,12,0.7); color: var(--gelo); }
.t-ad .cd.d .rot { background: var(--limao); color: var(--noite); }`,
      js: `function (t, r) { ${HZ_JS} ${JS_CAB}
  const qa = mola(t - 0.05, { freq: 2.2, amort: 0.72 }), a = $(r, '.cd.a'); a.style.opacity = cl(qa * 2); a.style.transform = 'translateX(' + (1 - qa) * -200 + 'px) rotate(' + (-4 * qa) + 'deg)';
  const qd = mola(t - 0.45, { freq: 2.2, amort: 0.62 }), d = $(r, '.cd.d'); d.style.opacity = cl(qd * 2); d.style.transform = 'translateX(' + (1 - qd) * 300 + 'px) rotate(' + (3 * qd) + 'deg) scale(' + (0.9 + 0.1 * qd) + ')'; }` };
  },

  // roleta: lista vertical passando, a palavra ativa para no centro com seta (ref. MI "Ads/Content/Ranking")
  roleta({ itens = ['Design', 'Código', 'IA', 'Marketing'], ativo = null, tag = '' } = {}) {
    const k = ativo ?? itens.length - 1;
    const its = [...itens, ...itens].map((x) => `<div class="rw">${esc(x)}</div>`).join('');
    return { html: `<div class="t-rol">${CANVAS('horizonte')}${cab(tag, '')}<div class="seta">→</div><div class="jan"><div class="fita">${its}</div></div></div>`,
      css: `${CSS_CAB('t-rol', 420)}
.t-rol .jan { position: absolute; left: 220px; right: 40px; top: 560px; height: 700px; overflow: hidden; -webkit-mask-image: linear-gradient(180deg, transparent, #000 30%, #000 70%, transparent); }
.t-rol .fita { position: absolute; left: 0; right: 0; top: 0; }
.t-rol .rw { height: 140px; display: flex; align-items: center; font-family: var(--fonte-titulo); font-weight: 600; font-size: 110px; letter-spacing: -0.04em; color: rgba(246,246,246,0.7); white-space: nowrap; } .t-rol .rw.on { color: var(--gelo); }
.t-rol .seta { position: absolute; left: 100px; top: 840px; font-family: var(--fonte-titulo); font-size: 110px; line-height: 140px; color: var(--limao); z-index: 2; }`,
      js: `function (t, r) { ${HZ_JS} revela($(r, '.tg'), t, 0.02, 0.2);
  const alvo = ${itens.length + k}, pos = alvo * suave(cl((t - 0.05) / 1.0)) ** 0.8; // desacelera até parar no item ativo
  $(r, '.fita').style.transform = 'translateY(' + (280 - pos * 140) + 'px)';
  $$(r, '.rw').forEach((w, i) => { const d = Math.abs(i - pos); w.style.opacity = Math.max(0.12, 1 - d * 0.42); w.style.filter = 'blur(' + Math.min(10, d * 4) + 'px)'; w.classList.toggle('on', d < 0.5); });
  revela($(r, '.seta'), t, 0.9, 0.2, 6); }` };
  },

  // lupa: palavras apagadas espalhadas; a lente passa por elas e para na palavra-alvo, que acende (ref. soulmatevisuals)
  lupa({ palavras = ['ideia', 'código', 'design', 'tempo', 'prompt', 'agente'], alvo = 'agente', tag = '', semente = 5 } = {}) {
    let x = semente * 9301 + 49297; const rnd = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
    const lista = palavras.includes(alvo) ? palavras : [...palavras, alvo];
    const pos = lista.map((p, i) => ({ p, x: 150 + ((i % 3) * 300) + rnd() * 120, y: 640 + Math.floor(i / 3) * 210 + rnd() * 80 }));
    const ia = pos.findIndex((q) => q.p === alvo);
    const ws = pos.map((q, i) => `<div class="pw${i === ia ? ' al' : ''}" style="left:${q.x.toFixed(0)}px;top:${q.y.toFixed(0)}px">${esc(q.p)}</div>`).join('');
    const rota = [pos[0], pos[Math.min(2, pos.length - 1)], pos[Math.max(0, pos.length - 2)], pos[ia]].map((q) => [q.x + 70, q.y + 30]);
    return { html: `<div class="t-lupa">${CANVAS('horizonte')}${cab(tag, '')}${ws}<div class="lente"><i></i></div></div>`,
      css: `${CSS_CAB('t-lupa', 420)}
.t-lupa .pw { position: absolute; transform: translate(-30%, -50%); font-family: ${MONO}; font-size: 44px; color: rgba(246,246,246,0.22); white-space: nowrap; } .t-lupa .pw.dentro { color: var(--gelo); } .t-lupa .pw.fim { color: var(--limao); }
.t-lupa .lente { position: absolute; left: 0; top: 0; width: 300px; height: 300px; margin: -150px 0 0 -150px; border-radius: 50%; box-shadow: inset 0 0 0 7px var(--gelo), 0 0 60px rgba(0,53,212,0.5); background: rgba(0,53,212,0.12); z-index: 2; }
.t-lupa .lente i { position: absolute; left: 236px; top: 236px; width: 20px; height: 150px; background: var(--gelo); border-radius: 10px; transform: rotate(-45deg); transform-origin: 50% 0; }`,
      js: `function (t, r) { ${HZ_JS} revela($(r, '.tg'), t, 0.02, 0.2);
  const R = ${JSON.stringify(rota)}, u = suave(cl((t - 0.1) / 1.2)) * (R.length - 1), i = Math.min(R.length - 2, Math.floor(u)), f = suave(u - i);
  const lx = R[i][0] + (R[i + 1][0] - R[i][0]) * f, ly = R[i][1] + (R[i + 1][1] - R[i][1]) * f; const le = $(r, '.lente'); le.style.left = lx + 'px'; le.style.top = ly + 'px';
  $$(r, '.pw').forEach((w) => { const d = Math.hypot(w.offsetLeft + 40 - lx, w.offsetTop - ly), dentro = d < 150, fim = w.classList.contains('al') && t > 1.25;
    w.classList.toggle('dentro', dentro && !fim); w.classList.toggle('fim', fim); w.style.transform = 'translate(-30%, -50%) scale(' + (fim ? 1.6 : dentro ? 1.3 : 1) + ')'; }); }` };
  },

  // polaroid com fita e círculo de marcador desenhado (circulo: [x, y, raio] em fração da foto); entra em stop-motion
  polaroid({ src = '', legenda = '', titulo = '', tag = '', circulo = null, credito = '' } = {}) {
    const c = circulo ? `<svg class="mk" viewBox="0 0 100 100" preserveAspectRatio="none"><ellipse cx="${circulo[0] * 100}" cy="${circulo[1] * 100}" rx="${circulo[2] * 100}" ry="${circulo[2] * 82}" pathLength="1"/></svg>` : '';
    return { html: `<div class="t-pola">${CANVAS('horizonte')}${cab(tag, titulo)}<div class="pol"><i class="fita f1"></i><i class="fita f2"></i><div class="ft"><img src="${esc(src)}">${c}</div>${legenda ? `<div class="lg">${esc(legenda)}</div>` : ''}</div>${credito ? `<div class="cr">${esc(credito)}</div>` : ''}</div>`,
      css: `${CSS_CAB('t-pola')}
.t-pola .pol { position: absolute; left: 160px; top: 560px; width: 760px; padding: 34px 34px 0; background: #fbfbf7; box-shadow: 0 30px 80px rgba(0,0,0,0.5); }
.t-pola .ft { position: relative; height: 640px; overflow: hidden; background: #ddd; } .t-pola .ft img { width: 100%; height: 100%; object-fit: cover; }
.t-pola .lg { height: 130px; display: flex; align-items: center; justify-content: center; font-family: var(--fonte-titulo); font-style: italic; font-weight: 600; font-size: 52px; color: var(--noite); }
.t-pola .fita { position: absolute; top: -26px; width: 210px; height: 62px; background: rgba(182,255,89,0.72); box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
.t-pola .f1 { left: -40px; transform: rotate(-24deg); } .t-pola .f2 { right: -40px; transform: rotate(22deg); }
.t-pola .mk { position: absolute; inset: 0; width: 100%; height: 100%; } .t-pola .mk ellipse { fill: none; stroke: var(--limao); stroke-width: 1.6; stroke-dasharray: 1; stroke-dashoffset: 1; vector-effect: non-scaling-stroke; stroke-width: 9px; stroke-linecap: round; }
.t-pola .cr { position: absolute; left: 0; right: 0; top: 1390px; text-align: center; font-family: var(--fonte-mono); font-size: 26px; color: rgba(246,246,246,0.62); }`,
      js: `function (t, r) { ${HZ_JS} ${JS_CAB} revela($(r, '.cr'), t, 0.4, 0.2, 6);
  const tq = Math.floor(t * 12) / 12; // stop-motion: 12 quadros por segundo
  const q = cl((tq - 0.05) / 0.35), p = $(r, '.pol'), tr = (1 - q) * 3 + Math.sin(tq * 31) * (q < 1 ? 1.5 : 0.4);
  p.style.opacity = cl(q * 3); p.style.transform = 'translateY(' + (1 - suave(q)) * 260 + 'px) rotate(' + (-4 + tr) + 'deg) scale(' + (1.12 - 0.12 * suave(q)) + ')';
  const e = $(r, '.mk ellipse'); if (e) e.style.strokeDashoffset = 1 - cl((tq - 0.6) / 0.4); }` };
  },

  // objeto 3D: cubo de vidro/azul girando com uma palavra por face (ref. DOO "Blue Box", LBKMAG)
  cubo({ faces = ['IA', 'Design', 'Código', 'Dados'], titulo = '', tag = '' } = {}) {
    const fs = [0, 1, 2, 3].map((i) => `<div class="fc f${i}"><span>${esc(faces[i % faces.length] || '')}</span></div>`).join('');
    return { html: `<div class="t-cubo">${CANVAS('horizonte')}${cab(tag, titulo)}<div class="cena3"><div class="cb">${fs}<div class="fc tp"></div><div class="fc bt"></div></div><div class="sombra"></div></div></div>`,
      css: `${CSS_CAB('t-cubo')}
.t-cubo .cena3 { position: absolute; left: 50%; top: 820px; width: 0; height: 0; perspective: 2200px; }
.t-cubo .cb { position: absolute; left: -210px; top: -210px; width: 420px; height: 420px; transform-style: preserve-3d; }
.t-cubo .fc { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; backface-visibility: hidden;
  background: linear-gradient(160deg, rgba(77,123,255,0.95), rgba(0,53,212,0.95) 55%, rgba(0,25,122,0.98)); box-shadow: inset 0 0 0 3px rgba(165,196,255,0.6), inset 0 0 80px rgba(165,196,255,0.25); }
.t-cubo .fc span { font-family: var(--fonte-titulo); font-weight: 700; font-size: 74px; letter-spacing: -0.03em; color: var(--gelo); }
.t-cubo .f0 { transform: translateZ(210px); } .t-cubo .f1 { transform: rotateY(90deg) translateZ(210px); } .t-cubo .f2 { transform: rotateY(180deg) translateZ(210px); } .t-cubo .f3 { transform: rotateY(270deg) translateZ(210px); }
.t-cubo .tp { transform: rotateX(90deg) translateZ(210px); background: linear-gradient(135deg, rgba(165,196,255,0.95), rgba(77,123,255,0.9)); } .t-cubo .bt { transform: rotateX(-90deg) translateZ(210px); background: #00197a; }
.t-cubo .sombra { position: absolute; left: -260px; top: 330px; width: 520px; height: 90px; border-radius: 50%; background: radial-gradient(rgba(0,0,0,0.55), transparent 70%); }`,
      js: `function (t, r) { ${HZ_JS} ${JS_CAB}
  const q = mola(t - 0.05, { freq: 1.8, amort: 0.6 }), cb = $(r, '.cb'); cb.style.opacity = cl(q * 2);
  const giro = -25 - Math.floor(cl((t - 0.3) / 2.4) * 4) * 90 - 90 * suave(((cl((t - 0.3) / 2.4) * 4) % 1)); // vira face a face, assentando com mola
  cb.style.transform = 'translateY(' + (1 - q) * 240 + 'px) rotateX(-18deg) rotateY(' + giro + 'deg)';
  $(r, '.sombra').style.opacity = cl(q) * 0.9; }` };
  },

  // 01 (Toss): bento de cards com luz radial por dentro, borda esfumada e textura interna; um card em limão de destaque
  // itens: [{ texto, cor: 'azul'|'claro'|'gelo'|'limao'|'noite', textura: 'binario'|'grade'|'feixes'|'curva' }]
  blocos({ titulo = '', tag = '', itens = [{ texto: 'Design', cor: 'claro', textura: 'curva' }, { texto: 'Código', cor: 'azul' }, { texto: 'IA', cor: 'limao', textura: 'feixes' }, { texto: 'Dados', cor: 'noite', textura: 'binario' }] } = {}) {
    const TX = { binario: () => `<div class="tx-bin">${Array.from({ length: 9 }, (_, i) => '0110100101110010101100101011101001'.slice(i % 5) + '1011100101').join('<br>')}</div>`,
      grade: () => '<div class="tx-gr"></div>', feixes: () => '<div class="tx-fx"><i></i><i></i><i></i></div>',
      curva: () => `<svg class="tx-cv" viewBox="0 0 300 100"><path d="M30 60 C 110 60, 120 20, 150 20 S 190 60, 270 60" /><line x1="30" y1="60" x2="270" y2="60" /><circle cx="150" cy="20" r="6"/><rect x="24" y="54" width="12" height="12" transform="rotate(45 30 60)"/><rect x="264" y="54" width="12" height="12" transform="rotate(45 270 60)"/></svg>` };
    // linhas de 2 com larguras alternadas (2/3 + 1/3, depois 1/3 + 2/3); sobra = largura toda
    const linhas = []; for (let i = 0; i < itens.length; i += 2) linhas.push(itens.slice(i, i + 2));
    const html = linhas.map((l, li) => `<div class="lb">${l.map((x, k) => `<div class="bk ${x.cor || 'azul'}" style="flex:${l.length === 1 ? 1 : (li % 2 === 0) === (k === 0) ? 1.8 : 1}"><div class="luz"></div>${x.textura ? TX[x.textura]?.() || '' : ''}<span>${esc(x.texto)}</span></div>`).join('')}</div>`).join('');
    return { html: `<div class="t-blocos">${CANVAS('topo')}${cab(tag, titulo)}<div class="gb">${html}</div></div>`,
      css: `${CSS_CAB('t-blocos', 300, 360)}
.t-blocos .gb { position: absolute; left: 60px; right: 60px; top: 540px; display: flex; flex-direction: column; gap: 30px; }
.t-blocos .lb { display: flex; gap: 30px; height: 240px; }
.t-blocos .bk { position: relative; border-radius: 72px; overflow: hidden; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 50px rgba(255,255,255,0.55), inset 0 0 0 2px rgba(255,255,255,0.35), 0 30px 80px rgba(0,25,122,0.45); }
.t-blocos .bk .luz { position: absolute; inset: -20%; }
.t-blocos .bk span { position: relative; z-index: 2; font-family: var(--fonte-texto); font-weight: 600; font-size: 52px; letter-spacing: -0.01em; color: var(--gelo); text-shadow: 0 0 18px rgba(255,255,255,0.6); }
.t-blocos .azul { background: #0035d4; } .t-blocos .azul .luz { background: radial-gradient(ellipse at 50% 50%, #a5c4ff 0%, #4d7bff 25%, #0035d4 55%, #00197a 100%); }
.t-blocos .claro { background: #a5c4ff; } .t-blocos .claro .luz { background: radial-gradient(ellipse at 50% 45%, #f6f6f6 0%, #a5c4ff 35%, #4d7bff 75%, #a5c4ff 100%); } .t-blocos .claro span { color: var(--noite); text-shadow: 0 0 16px rgba(255,255,255,0.9); }
.t-blocos .gelo { background: #f6f6f6; } .t-blocos .gelo .luz { background: radial-gradient(ellipse at 50% 50%, #ffffff 0%, #dfe8ff 45%, #a5c4ff 100%); } .t-blocos .gelo span { color: var(--noite); text-shadow: none; }
.t-blocos .limao { background: #b6ff59; } .t-blocos .limao .luz { background: radial-gradient(ellipse at 50% 50%, #ffffff 0%, #e4ffbf 20%, #b6ff59 50%, #4f8a12 100%); } .t-blocos .limao span { color: var(--noite); text-shadow: 0 0 14px rgba(255,255,255,0.8); }
.t-blocos .noite { background: #03050c; } .t-blocos .noite .luz { background: radial-gradient(ellipse at 50% 50%, rgba(77,123,255,0.85) 0%, rgba(0,53,212,0.5) 40%, #03050c 85%); }
.t-blocos .tx-bin { position: absolute; inset: 0; z-index: 1; font-family: ${MONO}; font-size: 20px; line-height: 26px; letter-spacing: 3px; color: rgba(182,255,89,0.7); padding: 18px 30px; overflow: hidden; -webkit-mask-image: radial-gradient(ellipse at 50% 50%, #000 30%, transparent 75%); }
.t-blocos .tx-gr { position: absolute; left: -10%; right: -10%; bottom: -20%; height: 90%; z-index: 1; background-image: linear-gradient(rgba(246,246,246,0.35) 2px, transparent 2px), linear-gradient(90deg, rgba(246,246,246,0.35) 2px, transparent 2px); background-size: 46px 46px; transform: perspective(400px) rotateX(55deg); transform-origin: 50% 100%; -webkit-mask-image: linear-gradient(transparent, #000); }
.t-blocos .tx-fx { position: absolute; inset: 0; z-index: 1; display: flex; justify-content: center; gap: 22px; } .t-blocos .tx-fx i { width: 26px; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent); filter: blur(3px); }
.t-blocos .tx-cv { position: absolute; left: 15%; top: 8%; width: 70%; z-index: 1; } .t-blocos .tx-cv path, .t-blocos .tx-cv line { fill: none; stroke: rgba(255,255,255,0.85); stroke-width: 2.5; } .t-blocos .tx-cv circle, .t-blocos .tx-cv rect { fill: none; stroke: #fff; stroke-width: 2.5; }`,
      js: `function (t, r) { ${HZ_JS} ${JS_CAB}
  $$(r, '.bk').forEach((b, i) => { const q = mola(t - 0.1 - i * 0.09, { freq: 2.4, amort: 0.62 }); b.style.opacity = cl(q * 2); b.style.transform = 'scale(' + (0.7 + 0.3 * q) + ')';
    const l = $(b, '.luz'); l.style.transform = 'translate(' + Math.sin(t * 1.3 + i) * 8 + '%,' + Math.cos(t * 1.1 + i * 2) * 6 + '%) scale(' + (1 + 0.08 * Math.sin(t * 2 + i)) + ')';
    const fx = $$(b, '.tx-fx i'); fx.forEach((f, k) => { f.style.transform = 'translateX(' + Math.sin(t * 2.4 + k * 1.7) * 30 + 'px)'; f.style.opacity = 0.5 + 0.5 * Math.sin(t * 3 + k); });
    const bn = $(b, '.tx-bin'); if (bn) bn.style.transform = 'translateY(' + (-(t * 26) % 26) + 'px)'; }); }` };
  },

  // 02: palavra/ícone em matriz de LED feita de glifos (+ ⊟ ✕ ⊞ ■), rampa azul → gelo e brilho; acende numa varredura
  led({ texto = 'IA', titulo = '', tag = '', colunas = null } = {}) {
    colunas = colunas ?? Math.max(34, Math.round(texto.length * 10)); // ~10 células por letra: a palavra fica legível
    return { html: `<div class="t-led">${CANVAS('pontos')}${cab(tag, titulo)}<canvas class="lm" width="1080" height="900" data-tx="${esc(texto)}"></canvas></div>`,
      css: `${CSS_CAB('t-led', 300, 1380)} .t-led .lm { position: absolute; left: 0; top: 470px; width: 1080px; height: 900px; }`,
      js: `function (t, r) { ${HZ_JS} ${JS_CAB}
  const cv = $(r, '.lm'), g = cv.getContext('2d'), W = cv.width, H = cv.height, N = ${colunas}, cs = W / N, M = Math.floor(H / cs);
  if (!cv._m) { const o = document.createElement('canvas'); o.width = N; o.height = M; const og = o.getContext('2d'); const tx = cv.dataset.tx;
    const fam = getComputedStyle(document.documentElement).getPropertyValue('--fonte-titulo') || 'sans-serif'; let fs = M * 0.9; og.font = '700 ' + fs + 'px ' + fam;
    while (og.measureText(tx).width > N * 0.92 && fs > 4) { fs -= 1; og.font = '700 ' + fs + 'px ' + fam; }
    og.fillStyle = '#fff'; og.textAlign = 'center'; og.textBaseline = 'middle'; og.fillText(tx, N / 2, M / 2 + fs * 0.05); cv._m = og.getImageData(0, 0, N, M).data; }
  const m = cv._m, frente = cl((t - 0.1) / 0.9) * (N + 6); g.clearRect(0, 0, W, H); g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 ' + Math.floor(cs * 0.9) + 'px ${MONO.replace(/'/g, '')}';
  const GL = ['+', '⊟', '✕', '⊞', '■'], RAMPA = [[0, 53, 212], [77, 123, 255], [165, 196, 255], [246, 246, 246]];
  for (let y = 0; y < M; y++) for (let x = 0; x < N; x++) {
    let v = m[(y * N + x) * 4] / 255; const borda = Math.max(0, 1 - Math.abs(x - frente) / 4);
    if (x > frente) v = 0; v = Math.max(v, borda * 0.35 * hash2(x, y)); const fundoV = 0.06 + 0.05 * hash2(x * 3, y * 7 + Math.floor(t * 8));
    if (v < 0.12) { g.fillStyle = 'rgba(77,123,255,' + fundoV + ')'; g.fillText('+', x * cs + cs / 2, y * cs + cs / 2); continue; }
    const k = Math.min(3, Math.floor(v * 3.99)), c = RAMPA[k], tw = 0.75 + 0.25 * hash2(x, y + Math.floor(t * 10));
    g.shadowColor = 'rgba(' + c + ',0.9)'; g.shadowBlur = 10 * v; g.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (v * tw) + ')';
    if (v > 0.55) g.fillRect(x * cs + cs * 0.12, y * cs + cs * 0.12, cs * 0.76, cs * 0.76); // célula cheia: o contorno da letra fica nítido
    else g.fillText(GL[Math.min(4, 1 + Math.floor(v * 4))], x * cs + cs / 2, y * cs + cs / 2); g.shadowBlur = 0; } }` };
  },

  // 03: três cubos isométricos — o do meio aceso (azul → limão) com anel tracejado girando; laterais só em traço; rótulos mono
  iso({ centro = 'WA-AKG', esquerda = '', direita = '', titulo = '', tag = '', progresso = 0.35 } = {}) {
    const hex = (cx, cy, r) => { const p = [0, 1, 2, 3, 4, 5].map((i) => [cx + r * Math.cos(Math.PI / 6 + i * Math.PI / 3), cy + r * Math.sin(Math.PI / 6 + i * Math.PI / 3)]); return p.map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' '); };
    const cubo = (cx, cy, r, cls) => `<g class="${cls}"><polygon points="${hex(cx, cy, r)}" class="cx"/><path d="M${cx} ${cy} L${cx} ${cy + r} M${cx} ${cy} L${(cx - r * Math.cos(Math.PI / 6)).toFixed(1)} ${cy - r / 2} M${cx} ${cy} L${(cx + r * Math.cos(Math.PI / 6)).toFixed(1)} ${cy - r / 2}" class="ar"/></g>`;
    return { html: `<div class="t-iso">${CANVAS('hud')}${cab(tag, titulo)}<svg class="sv" viewBox="0 0 1080 1100"><defs><linearGradient id="gIso" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4d7bff"/><stop offset="0.55" stop-color="#0035d4"/><stop offset="1" stop-color="#b6ff59"/></linearGradient><filter id="bIso"><feGaussianBlur stdDeviation="18"/></filter></defs>
  ${esquerda ? cubo(220, 420, 140, 'lat l') : ''}${direita ? cubo(860, 420, 140, 'lat d') : ''}
  <polygon points="${hex(540, 300, 230)}" class="anel"/><polygon points="${hex(540, 300, 170)}" class="glow" filter="url(#bIso)"/><polygon points="${hex(540, 300, 170)}" class="nuc"/>
  <path d="M540 300 L540 470 M540 300 L393 215 M540 300 L687 215" class="nucl"/>
  <line x1="540" y1="560" x2="540" y2="650" class="lig"/>${esquerda ? '<line x1="220" y1="590" x2="220" y2="760" class="lig"/><line x1="370" y1="420" x2="420" y2="390" class="lig"/>' : ''}${direita ? '<line x1="860" y1="590" x2="860" y2="760" class="lig"/><line x1="710" y1="420" x2="660" y2="390" class="lig"/>' : ''}
  <text x="540" y="710" class="rc">${esc(centro)}</text>${esquerda ? `<text x="220" y="820" class="rl">${esc(esquerda)}</text>` : ''}${direita ? `<text x="860" y="820" class="rl">${esc(direita)}</text>` : ''}
  <rect x="420" y="960" width="240" height="22" rx="11" class="pb"/><rect x="420" y="960" width="0" height="22" rx="11" class="pf"/></svg></div>`,
      css: `${CSS_CAB('t-iso', 250, 300)} .t-iso .sv { position: absolute; left: 0; top: 440px; width: 1080px; height: 1100px; }
.t-iso .cx { fill: rgba(246,246,246,0.05); stroke: rgba(246,246,246,0.55); stroke-width: 3; } .t-iso .ar { fill: none; stroke: rgba(246,246,246,0.35); stroke-width: 2.5; stroke-dasharray: 10 9; }
.t-iso .anel { fill: none; stroke: rgba(246,246,246,0.4); stroke-width: 3; stroke-dasharray: 16 14; } .t-iso .glow { fill: #4d7bff; opacity: 0.8; }
.t-iso .nuc { fill: url(#gIso); } .t-iso .nucl { fill: none; stroke: rgba(3,5,12,0.35); stroke-width: 3; stroke-dasharray: 10 9; }
.t-iso .lig { stroke: rgba(246,246,246,0.45); stroke-width: 2.5; stroke-dasharray: 10 10; }
.t-iso .rc { fill: var(--gelo); font-family: ${MONO}; font-size: 46px; letter-spacing: 0.08em; text-anchor: middle; } .t-iso .rl { fill: rgba(246,246,246,0.85); font-family: ${MONO}; font-size: 34px; letter-spacing: 0.08em; text-anchor: middle; text-transform: uppercase; }
.t-iso .pb { fill: rgba(246,246,246,0.12); } .t-iso .pf { fill: var(--limao); }`,
      js: `function (t, r) { ${HZ_JS} ${JS_CAB}
  const q = mola(t - 0.05, { freq: 2.2, amort: 0.6 }); $$(r, '.nuc, .glow, .nucl').forEach((e) => { e.style.transformOrigin = '540px 300px'; e.style.transform = 'scale(' + (0.6 + 0.4 * q) + ')'; e.style.opacity = cl(q * 2); });
  $(r, '.glow').style.opacity = cl(q) * (0.6 + 0.3 * Math.sin(t * 3)); $(r, '.anel').style.strokeDashoffset = -t * 40;
  $$(r, '.lat').forEach((l, i) => { const ql = mola(t - 0.3 - i * 0.12, { freq: 2.2, amort: 0.7 }); l.style.opacity = cl(ql * 2); l.style.transform = 'translateY(' + (1 - ql) * 80 + 'px)'; });
  $$(r, '.lig').forEach((l) => { l.style.strokeDashoffset = -t * 30; l.style.opacity = cl((t - 0.5) / 0.3); }); $$(r, '.rc, .rl').forEach((x) => { x.style.opacity = cl((t - 0.6) / 0.3); });
  $(r, '.pf').setAttribute('width', 240 * ${progresso} * suave(cl((t - 0.4) / 1.2))); }` };
  },

  // 06/14/15: pílulas de progresso com barra "gel" brilhante e régua tracejada; valor sempre real (ou texto, ex.: "10–30 s")
  // itens: [{ rotulo, valor: 0–100, texto? }]
  progresso({ titulo = '', tag = '', itens = [{ rotulo: 'enviando', valor: 72 }] } = {}) {
    const ps = itens.map((x) => `<div class="vidro pp"><div class="regua"></div><div class="trilho"><div class="gel"><i class="ponta"></i></div></div><div class="rot">${esc(x.rotulo || '')}</div><div class="val" data-v="${Number(x.valor) || 0}" data-tx="${esc(x.texto || '')}"></div></div>`).join('');
    return { html: `<div class="t-prog">${CANVAS('pontos')}${cab(tag, titulo)}<div class="lp">${ps}</div></div>`,
      css: `${CSS_CAB('t-prog')}
.t-prog .lp { position: absolute; left: 70px; right: 70px; top: 580px; display: flex; flex-direction: column; gap: 46px; align-items: center; }
.t-prog .pp { position: relative; width: 100%; height: 210px; border-radius: 120px; } .t-prog .pp:nth-child(2) { width: 88%; } .t-prog .pp:nth-child(3) { width: 76%; }
.t-prog .regua { position: absolute; left: 60px; right: 60px; top: 104px; height: 16px; background: repeating-linear-gradient(90deg, rgba(165,196,255,0.55) 0 4px, transparent 4px 12px); }
.t-prog .trilho { position: absolute; left: 50px; right: 50px; bottom: 34px; height: 34px; border-radius: 17px; background: rgba(246,246,246,0.08); }
.t-prog .gel { position: absolute; left: 0; top: 0; bottom: 0; width: 0; border-radius: 17px; background: linear-gradient(180deg, #e9ffc9, #b6ff59 45%, #6fb81c); box-shadow: 0 0 30px rgba(182,255,89,0.6); }
.t-prog .ponta { position: absolute; right: -6px; top: 50%; width: 46px; height: 46px; margin-top: -23px; border-radius: 50%; background: radial-gradient(#fff, rgba(182,255,89,0.9) 45%, transparent 70%); filter: blur(2px); }
.t-prog .rot { position: absolute; left: 60px; top: 34px; font-family: var(--fonte-texto); font-size: 44px; font-weight: 500; color: var(--gelo); }
.t-prog .val { position: absolute; right: 60px; top: 14px; font-family: var(--fonte-titulo); font-weight: 600; font-size: 96px; letter-spacing: -0.04em; color: var(--gelo); text-shadow: 0 0 30px rgba(165,196,255,0.6); }`,
      js: `function (t, r) { ${HZ_JS} ${JS_CAB}
  $$(r, '.pp').forEach((p, i) => { const q = mola(t - 0.1 - i * 0.14, { freq: 2.2, amort: 0.72 }); p.style.opacity = cl(q * 2); p.style.transform = 'translateY(' + (1 - q) * 120 + 'px)';
    const vEl = $(p, '.val'), v = +vEl.dataset.v, k = suave(cl((t - 0.35 - i * 0.14) / 1.1)); $(p, '.gel').style.width = (v * k) + '%';
    vEl.textContent = vEl.dataset.tx || Math.round(v * k) + '%'; }); }` };
  },

  // 16: widget preto de etapas ("3 de 5"): checks ligados por traços que acendem; etapa atual pulsa; status digitando
  etapas({ titulo = '', tag = '', nome = 'Automação', etapas = ['Conectar', 'Painel', 'Respostas', 'Envio', 'n8n'], atual = 3, status = '' } = {}) {
    const n = etapas.length;
    const ns = etapas.map((_, i) => `${i ? '<div class="tr"><i></i></div>' : ''}<div class="ck"><svg viewBox="0 0 24 24"><path d="M6 12.5 L10.2 16.5 L18 8" /></svg></div>`).join('');
    return { html: `<div class="t-etp">${CANVAS('topo')}${cab(tag, titulo)}<div class="wd"><div class="hd"><span>${esc(nome)}</span></div><div class="fila">${ns}</div><div class="rp"><span class="st" data-tx="${esc(status || etapas[Math.min(atual, n - 1)] + '…')}"></span><span class="ct">0 de ${n}</span></div></div></div>`,
      css: `${CSS_CAB('t-etp')}
.t-etp .wd { position: absolute; left: 60px; right: 60px; top: 640px; height: 470px; border-radius: 110px; background: #000; padding: 70px 76px; box-sizing: border-box; box-shadow: 0 40px 120px rgba(0,0,0,0.6), inset 0 0 0 2px rgba(246,246,246,0.06); }
.t-etp .hd span { font-family: var(--fonte-texto); font-weight: 700; font-size: 50px; color: var(--gelo); }
.t-etp .fila { display: flex; align-items: center; margin-top: 60px; }
.t-etp .ck { width: 104px; height: 104px; flex: none; border-radius: 50%; box-shadow: inset 0 0 0 7px rgba(0,53,212,0.65); display: flex; align-items: center; justify-content: center; }
.t-etp .ck svg { width: 60px; } .t-etp .ck path { fill: none; stroke: var(--gelo); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 20; stroke-dashoffset: 20; }
.t-etp .ck.on { background: #1a73ff; box-shadow: none; } .t-etp .ck.agora { box-shadow: inset 0 0 0 7px #4d7bff, 0 0 40px rgba(77,123,255,0.7); }
.t-etp .tr { flex: 1; height: 10px; margin: 0 14px; border-radius: 5px; background: rgba(0,53,212,0.45); overflow: hidden; } .t-etp .tr i { display: block; height: 100%; width: 0; background: #1a73ff; }
.t-etp .rp { display: flex; justify-content: space-between; margin-top: 60px; font-family: var(--fonte-texto); font-size: 44px; color: rgba(246,246,246,0.55); }`,
      js: `function (t, r) { ${HZ_JS} ${JS_CAB} ${entra('.wd', 0.05)}
  const A = ${Math.max(0, Math.min(n, atual))}, cks = $$(r, '.ck'), trs = $$(r, '.tr i'), dur = 0.32, f = cl((t - 0.35) / (dur * Math.max(1, A))) * A;
  cks.forEach((c, i) => { const on = i < Math.floor(f + 1e-6) && i < A; c.classList.toggle('on', on); $(c, 'path').style.strokeDashoffset = on ? 20 * (1 - cl((f - i) * 2.5)) : 20;
    const agora = i === A && f >= A - 1e-6; c.classList.toggle('agora', agora); if (agora) c.style.transform = 'scale(' + (1 + 0.06 * Math.sin(t * 6)) + ')'; });
  trs.forEach((tr, i) => { tr.style.width = (cl(f - i) * 100) + '%'; });
  $(r, '.ct').textContent = Math.min(A, Math.floor(f + 1e-6)) + ' de ${n}'; const st = $(r, '.st'), tx = st.dataset.tx; st.textContent = tx.slice(0, Math.floor(cl((t - 0.5) * 26 / tx.length) * tx.length)); }` };
  },

  // 17: botão de vidro azul com halo sobre a matriz de pontos; um cursor entra e clica (aperta e solta)
  botao({ texto = 'Começar', titulo = '', tag = '', clique = 1.0 } = {}) {
    return { html: `<div class="t-bot">${CANVAS('pontos')}${cab(tag, titulo)}<div class="bt"><span>${esc(texto)}</span><svg viewBox="0 0 24 24" class="seta"><path d="M3 11 L21 3 L13 21 L11 13 Z"/></svg></div><div class="onda"></div><svg class="cur" viewBox="0 0 28 36"><path d="M2 2 L2 30 L9 23 L14 34 L19 32 L14 21 L24 21 Z" fill="#f6f6f6" stroke="#03050c" stroke-width="2.5" stroke-linejoin="round"/></svg></div>`,
      css: `${CSS_CAB('t-bot', 520, 580)}
.t-bot .bt { position: absolute; left: 50%; top: 860px; transform: translateX(-50%); display: flex; align-items: center; gap: 22px; padding: 44px 84px; border-radius: 999px; white-space: nowrap;
  background: linear-gradient(180deg, rgba(77,123,255,0.92), rgba(0,53,212,0.92)); box-shadow: inset 0 2px 0 rgba(255,255,255,0.45), inset 0 -10px 24px rgba(165,196,255,0.55), inset 0 0 0 2px rgba(165,196,255,0.7), 0 0 90px rgba(77,123,255,0.75), 0 0 200px rgba(0,53,212,0.5); }
.t-bot .bt span { font-family: var(--fonte-texto); font-weight: 500; font-size: 62px; color: var(--gelo); } .t-bot .seta { width: 54px; } .t-bot .seta path { fill: none; stroke: var(--gelo); stroke-width: 2; stroke-linejoin: round; }
.t-bot .onda { position: absolute; left: 50%; top: 930px; width: 40px; height: 40px; margin: -20px; border-radius: 50%; box-shadow: 0 0 0 4px rgba(182,255,89,0.9); opacity: 0; }
.t-bot .cur { position: absolute; width: 70px; left: 0; top: 0; }`,
      js: `function (t, r) { ${HZ_JS} ${JS_CAB}
  const bt = $(r, '.bt'), q = mola(t - 0.05, { freq: 2, amort: 0.7 }), C = ${clique}; const ap = t > C && t < C + 0.12 ? 0.93 : 1;
  bt.style.opacity = cl(q * 2); bt.style.transform = 'translateX(-50%) translateY(' + (1 - q) * 100 + 'px) scale(' + ap + ')';
  const k = suave(cl((t - 0.35) / (C - 0.35))), cx = 900 - 330 * k, cy = 1250 - 300 * k; const cur = $(r, '.cur'); cur.style.left = cx + 'px'; cur.style.top = cy + 'px'; cur.style.opacity = cl((t - 0.3) * 4);
  const o = $(r, '.onda'), u = cl((t - C) / 0.6); o.style.opacity = t > C ? 1 - u : 0; o.style.transform = 'scale(' + (1 + u * 14) + ')'; }` };
  },

  // F3 "post animado": moldura de post (avatar, nome, selo, @, texto) fixa no topo e a mídia oficial no quadro.
  // perfil vem de marca/perfil.json (avatar, nome, arroba, verificado) — passado pelo plano.
  post({ avatar = '', nome = 'Seu Nome', arroba = '@seuperfil', verificado = true, texto = '', src = '', credito = '', selo = '' } = {}) {
    const sv = verificado && selo ? `<img class="sl" src="${esc(selo)}">` : '';
    const midia = /\.(mp4|mov|webm)(\?|$)/i.test(src) ? `<video src="${esc(src)}" muted playsinline></video>` : (src ? `<img src="${esc(src)}">` : '');
    return { html: `<div class="t-post"><div class="pb"><div class="cab"><img class="av" src="${esc(avatar)}"><div><div class="nm">${esc(nome)}${sv}</div><div class="ar">${esc(arroba)}</div></div></div><div class="tx">${esc(texto)}</div><div class="md">${midia}</div>${credito ? `<div class="cr">${esc(credito)}</div>` : ''}</div></div>`,
      css: `.t-post { position: absolute; inset: 0; background: #03050c; }
.t-post .pb { position: absolute; left: 50px; right: 50px; top: 230px; }
.t-post .cab { display: flex; align-items: center; gap: 22px; } .t-post .av { width: 96px; height: 96px; border-radius: 50%; object-fit: cover; }
.t-post .nm { display: flex; align-items: center; gap: 10px; font-family: var(--fonte-texto); font-weight: 700; font-size: 40px; color: var(--gelo); } .t-post .sl { width: 36px; height: 36px; }
.t-post .ar { font-family: var(--fonte-texto); font-size: 32px; color: rgba(246,246,246,0.55); }
.t-post .tx { margin-top: 26px; font-family: var(--fonte-texto); font-weight: 600; font-size: 46px; line-height: 1.25; color: var(--gelo); }
.t-post .md { margin-top: 30px; height: 760px; border-radius: 28px; overflow: hidden; background: #0a0f1f; } .t-post .md img, .t-post .md video { width: 100%; height: 100%; object-fit: cover; }
.t-post .cr { margin-top: 14px; font-family: var(--fonte-mono); font-size: 24px; color: rgba(246,246,246,0.5); }`,
      js: `function (t, r) { revela($(r, '.cab'), t, 0.02, 0.2); revela($(r, '.tx'), t, 0.1, 0.25, 10); ${entra('.md', 0.15)} }` };
  },
};
