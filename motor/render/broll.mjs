// T-006 — Biblioteca de cards de B-roll (estilo E1, Base/pericia-edicao.md (iv)).
// Cada tipo é uma função (props) → { html, css, js }:
//   html: marcação do card (raiz .k), css: estilos com prefixo do tipo,
//   js:   código de uma função (t, r) chamada pelo compositor a cada quadro, com t local (0 = entrada)
//         e r = elemento raiz do card. Animação só por seek(t) com molas de forma fechada
//         (mola de motor/video/cards.mjs); nunca transition/animation CSS.
// Paleta e fontes: só Base/MARCA.md (tokens de motor/marca/marca.css via cssMarca()).
// Todo card tem movimento interno contínuo (regra B4: nenhum quadro morto > 3 s).
import { mola } from '../video/cards.mjs';
import { esc } from '../video/legenda.mjs';

// Caixa útil do card dentro do painel (área segura: lateral 90, topo 220).
export const CAIXA = { x: 90, y: 230, largura: 900, altura: 660 };

// Utilitários disponíveis para o js dos cards dentro da página.
export const AJUDANTES = `
${mola.toString()}
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, x) => a + (b - a) * x;
const suave = (x) => { x = cl(x); return x * x * (3 - 2 * x); };
const $ = (r, s) => r.querySelector(s);
const $$ = (r, s) => Array.from(r.querySelectorAll(s));
const tf = (el, s) => { if (el) el.style.transform = s; };
const op = (el, v) => { if (el) el.style.opacity = v; };
`;

const TRIANGULO = (cor = 'var(--gelo)') => `<svg viewBox="0 0 100 88" class="tri"><path d="M50 0 L100 88 L0 88 Z" fill="${cor}"/></svg>`;
const ESTRELA4 = (cor = 'var(--limao)') => `<svg viewBox="0 0 40 40" class="est4"><path d="M20 0 C21.5 13 27 18.5 40 20 C27 21.5 21.5 27 20 40 C18.5 27 13 21.5 0 20 C13 18.5 18.5 13 20 0 Z" fill="${cor}"/></svg>`;
const CURSOR = `<svg viewBox="0 0 28 36" class="cursor"><path d="M2 2 L2 30 L9 23 L14 34 L19 32 L14 21 L24 21 Z" fill="var(--gelo)" stroke="var(--preto)" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
const CHECK = `<svg viewBox="0 0 24 24"><path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke="var(--preto)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const BASE_CSS = `
.k { position: absolute; inset: 0; overflow: hidden; font-family: var(--fonte-texto); color: var(--gelo); }
.k.escuro { background: var(--preto); }
.k.azul { background: var(--azul); }
.k.claro { background: var(--gelo); color: var(--preto); }
.k .grade { position: absolute; inset: -40px; background-image: radial-gradient(rgba(0,53,212,0.55) 2.2px, transparent 2.6px); background-size: 30px 30px; }
.k.azul .grade { background-image: radial-gradient(rgba(246,246,246,0.18) 2.2px, transparent 2.6px); }
.k.claro .grade { background-image: radial-gradient(rgba(0,53,212,0.16) 2.2px, transparent 2.6px); }
.k .ui { font-family: var(--fonte-texto); }
.k .tri { display: block; }
`;
// deriva contínua da grade de fundo (todo card chama)
const GRADE_JS = `tf($(r, '.grade'), 'translate(' + ((t * 22) % 30) + 'px,' + ((t * 9) % 30) + 'px)');`;

function card(tipo, tema, corpo, css, js) {
  return { html: `<div class="k k-${tipo} ${tema}"><div class="grade"></div>${corpo}</div>`, css, js: `function (t, r) { ${GRADE_JS}\n${js}\n}` };
}

export const TIPOS = {
  titulo({ linhas = ['A Vercel abriu', 'a VGPU'], destaque = 1, icone = 'vercel' } = {}) {
    const ls = linhas.map((l, i) => `<div class="ln${i === destaque ? ' d' : ''}"><span>${esc(l)}</span></div>`).join('');
    return card('titulo', 'escuro', `<div class="ic">${icone === 'vercel' ? TRIANGULO() : ESTRELA4()}</div><div class="halo"></div><div class="txt">${ls}</div><div class="sub"></div>`, `
.k-titulo .ic { position: absolute; left: 50%; top: 96px; width: 150px; margin-left: -75px; z-index: 2; }
.k-titulo .halo { position: absolute; left: 50%; top: 70px; width: 300px; height: 220px; margin-left: -150px; border-radius: 50%;
  background: radial-gradient(rgba(0,53,212,0.9), transparent 70%); }
.k-titulo .txt { position: absolute; left: 40px; right: 40px; top: 300px; text-align: center; }
.k-titulo .ln { overflow: hidden; font-family: var(--fonte-titulo); font-weight: 600; font-size: 104px; line-height: 1.08; letter-spacing: -0.025em; }
.k-titulo .ln span { display: inline-block; }
.k-titulo .ln.d span { color: var(--limao); }
.k-titulo .sub { position: absolute; left: 50%; bottom: 70px; height: 10px; width: 420px; margin-left: -210px; background: var(--limao); border-radius: 5px; transform-origin: left; }`,
    `const m = mola(t, { freq: 1.8, amort: 0.55 });
tf($(r, '.ic'), 'translateY(' + ((1 - m) * -60 + Math.sin(t * 2.2) * 6) + 'px) scale(' + (0.4 + 0.6 * m) + ') rotate(' + Math.sin(t * 1.4) * 4 + 'deg)');
op($(r, '.halo'), 0.45 + 0.35 * Math.sin(t * 3) ** 2);
$$(r, '.ln span').forEach((s, i) => { const q = mola(t - 0.12 - i * 0.14, { freq: 2.4, amort: 0.7 }); tf(s, 'translateY(' + (1 - q) * 120 + '%) scale(' + (1 + 0.012 * Math.sin(t * 2 + i)) + ')'); });
tf($(r, '.sub'), 'scaleX(' + suave((t - 0.5) / 0.6) + ')');`);
  },

  selo({ palavra = 'PÚBLICA' } = {}) {
    return card('selo', 'azul', `<div class="cad"><svg viewBox="0 0 120 150"><path class="arco" d="M28 70 V44 a32 32 0 0 1 64 0 V70" fill="none" stroke="var(--gelo)" stroke-width="14" stroke-linecap="round"/><rect x="10" y="66" width="100" height="80" rx="16" fill="var(--gelo)"/><circle cx="60" cy="100" r="11" fill="var(--azul)"/><rect x="55" y="104" width="10" height="22" rx="4" fill="var(--azul)"/></svg></div><div class="raios">${'<i></i>'.repeat(12)}</div><div class="pal">${esc(palavra)}</div>`, `
.k-selo .cad { position: absolute; left: 50%; top: 110px; width: 230px; margin-left: -115px; }
.k-selo .arco { transform-origin: 92px 70px; }
.k-selo .raios { position: absolute; left: 50%; top: 260px; width: 0; height: 0; }
.k-selo .raios i { position: absolute; left: -5px; top: -170px; width: 10px; height: 46px; border-radius: 5px; background: var(--limao); transform-origin: 5px 170px; }
.k-selo .pal { position: absolute; left: 0; right: 0; top: 420px; text-align: center; font-family: var(--fonte-titulo); font-weight: 700; font-size: 132px; letter-spacing: 0.02em; }
.k-selo .pal { color: var(--preto); background: var(--limao); width: max-content; margin: 0 auto; padding: 4px 40px 0; border-radius: 22px; }`,
    `const e = mola(t, { freq: 2, amort: 0.6 }), ab = mola(t - 0.45, { freq: 2.6, amort: 0.45 });
tf($(r, '.cad'), 'translateY(' + ((1 - e) * 80 - 40 * suave((t - 0.9) / 0.4)) + 'px) scale(' + (0.6 + 0.4 * e - 0.25 * suave((t - 0.9) / 0.4)) + ') rotate(' + Math.sin(t * 9) * 3 * (1 - cl(ab)) + 'deg)');
const arco = $(r, '.arco'); if (arco) arco.style.transform = 'translateY(' + (-22 * ab) + 'px) rotate(' + (38 * ab) + 'deg)';
$$(r, '.raios i').forEach((el, i) => { const q = mola(t - 0.55, { freq: 2.2, amort: 0.7 }); el.style.transform = 'rotate(' + (i * 30 + t * 14) + 'deg) translateY(' + (1 - q) * 60 + 'px) scaleY(' + (0.3 + 0.7 * q) * (0.8 + 0.2 * Math.sin(t * 6 + i)) + ')'; el.style.opacity = cl(q) * 0.9; });
const p = mola(t - 0.85, { freq: 2.6, amort: 0.5 });
op($(r, '.pal'), cl(p * 3)); tf($(r, '.pal'), 'scale(' + (1.6 - 0.6 * p + 0.015 * Math.sin(t * 4)) + ') rotate(' + (-8 + 5 * p) + 'deg)');`);
  },

  wordmark({ palavra = 'VGPU' } = {}) {
    const letras = [...palavra].map((c) => `<span>${esc(c)}</span>`).join('');
    return card('wordmark', 'escuro', `<div class="brilho"></div><div class="pal">${letras}</div><div class="faixa"></div>`, `
.k-wordmark .pal { position: absolute; left: 0; right: 0; top: 150px; text-align: center; font-family: var(--fonte-titulo); font-weight: 700; font-size: ${palavra.length > 5 ? 200 : 290}px; line-height: 1; letter-spacing: -0.03em; color: var(--limao); white-space: nowrap; }
.k-wordmark .pal span { display: inline-block; }
.k-wordmark .brilho { position: absolute; left: 50%; top: 320px; width: 760px; height: 420px; margin: -210px 0 0 -380px; border-radius: 50%; background: radial-gradient(rgba(0,53,212,0.85), transparent 68%); }
.k-wordmark .faixa { position: absolute; left: 160px; right: 160px; top: 500px; height: 14px; border-radius: 7px; background: var(--azul); transform-origin: center; }`,
    `$$(r, '.pal span').forEach((s, i) => { const q = mola(t - i * 0.08, { freq: 2.3, amort: 0.5 }); s.style.transform = 'translateY(' + (1 - q) * -260 + 'px) rotate(' + (1 - q) * (i % 2 ? 14 : -14) + 'deg)'; s.style.opacity = cl(q * 2); });
tf($(r, '.pal'), 'scale(' + (1 + 0.035 * t) + ')');
tf($(r, '.brilho'), 'scale(' + (0.9 + 0.12 * Math.sin(t * 2.4)) + ')');
tf($(r, '.faixa'), 'scaleX(' + suave((t - 0.45) / 0.5) * (0.92 + 0.08 * Math.sin(t * 3)) + ')');`);
  },

  'grade-componentes'() {
    const pecas = [
      '<div class="bt pri">Começar</div>', '<div class="inp"><span>email@site.com</span><i></i></div>', '<div class="tg"><b></b></div>',
      '<div class="av"><i></i><i></i><i></i></div>', '<div class="sl"><i></i><b></b></div>', '<div class="bt sec">Cancelar</div>',
      '<div class="bdg">Novo</div>', '<div class="mini"><i></i><i></i><i></i></div>', '<div class="chk"><b>' + CHECK + '</b><span>Aceito</span></div>',
    ];
    return card('grade-componentes', 'escuro', `<div class="g">${pecas.map((p) => `<div class="cel">${p}</div>`).join('')}</div>`, `
.k-grade-componentes .g { position: absolute; left: 40px; right: 40px; top: 60px; bottom: 60px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
.k-grade-componentes .cel { border-radius: 26px; background: rgba(246,246,246,0.06); border: 2px solid rgba(246,246,246,0.12); display: flex; align-items: center; justify-content: center; }
.k-grade-componentes .bt { font-weight: 700; font-size: 32px; padding: 20px 30px; border-radius: 16px; }
.k-grade-componentes .pri { background: var(--gelo); color: var(--preto); }
.k-grade-componentes .sec { border: 2px solid rgba(246,246,246,0.5); }
.k-grade-componentes .inp { width: 220px; height: 64px; border-radius: 14px; border: 2px solid var(--azul); background: var(--preto); display: flex; align-items: center; padding: 0 16px; font-size: 22px; color: rgba(246,246,246,0.7); gap: 4px; }
.k-grade-componentes .inp i { width: 3px; height: 30px; background: var(--limao); }
.k-grade-componentes .tg { width: 130px; height: 70px; border-radius: 35px; background: var(--azul); position: relative; }
.k-grade-componentes .tg b { position: absolute; top: 7px; left: 7px; width: 56px; height: 56px; border-radius: 50%; background: var(--gelo); }
.k-grade-componentes .av { display: flex; }
.k-grade-componentes .av i { width: 70px; height: 70px; border-radius: 50%; border: 4px solid var(--preto); margin-left: -18px; background: var(--azul); }
.k-grade-componentes .av i:nth-child(2) { background: var(--limao); } .k-grade-componentes .av i:nth-child(3) { background: var(--gelo); }
.k-grade-componentes .sl { width: 200px; height: 10px; border-radius: 5px; background: rgba(246,246,246,0.2); position: relative; }
.k-grade-componentes .sl i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 5px; background: var(--limao); }
.k-grade-componentes .sl b { position: absolute; top: -15px; width: 40px; height: 40px; margin-left: -20px; border-radius: 50%; background: var(--gelo); }
.k-grade-componentes .bdg { background: var(--limao); color: var(--preto); font-weight: 900; font-size: 30px; padding: 10px 26px; border-radius: 30px; }
.k-grade-componentes .mini { width: 200px; display: flex; flex-direction: column; gap: 12px; }
.k-grade-componentes .mini i { height: 16px; border-radius: 8px; background: rgba(246,246,246,0.3); } .k-grade-componentes .mini i:first-child { width: 60%; background: var(--gelo); }
.k-grade-componentes .chk { display: flex; align-items: center; gap: 14px; font-size: 30px; font-weight: 700; }
.k-grade-componentes .chk b { width: 48px; height: 48px; border-radius: 12px; background: var(--limao); display: flex; } .k-grade-componentes .chk svg { width: 100%; }`,
    `$$(r, '.cel').forEach((c, i) => { const q = mola(t - (i % 3 + Math.floor(i / 3)) * 0.09, { freq: 2.4, amort: 0.6 }); c.style.transform = 'translateY(' + (1 - q) * 90 + 'px) scale(' + (0.7 + 0.3 * q) + ')'; c.style.opacity = cl(q * 2); });
const tg = suave(((t * 0.8) % 2 < 1 ? (t * 0.8) % 1 : 1 - (t * 0.8) % 1) * 3 - 1); tf($(r, '.tg b'), 'translateX(' + tg * 60 + 'px)');
const sv = 0.5 + 0.4 * Math.sin(t * 2.2); const sl = $(r, '.sl i'); if (sl) sl.style.width = sv * 100 + '%'; const sb = $(r, '.sl b'); if (sb) sb.style.left = sv * 100 + '%';
op($(r, '.inp i'), Math.floor(t * 2.5) % 2 ? 0 : 1);
tf($(r, '.pri'), 'scale(' + (1 + 0.04 * Math.sin(t * 4)) + ')');`);
  },

  carrossel({ itens = ['Button', 'Input', 'Card', 'Toggle', 'Dialog', 'Tabs', 'Badge'] } = {}) {
    const vis = (n, i) => [
      '<div class="v bt">Enviar</div>', '<div class="v in"><span>Buscar…</span></div>', '<div class="v cd"><i></i><i></i><i></i></div>',
      '<div class="v tg"><b></b></div>', '<div class="v dg"><i></i><b>OK</b></div>', '<div class="v tb"><b>Um</b><span>Dois</span><span>Três</span></div>', '<div class="v bd">Beta</div>',
    ][i % 7];
    const cartas = [...itens, ...itens].map((n, i) => `<div class="c${i % 3 === 1 ? ' l' : ''}">${vis(n, i % itens.length)}<div class="nm">${esc(n)}</div></div>`).join('');
    return card('carrossel', 'escuro', `<div class="tit">componentes</div><div class="trilho">${cartas}</div>`, `
.k-carrossel .tit { position: absolute; left: 50px; top: 50px; font-family: var(--fonte-titulo); font-weight: 600; font-size: 54px; color: var(--limao); }
.k-carrossel .trilho { position: absolute; top: 170px; left: 0; display: flex; gap: 28px; }
.k-carrossel .c { width: 320px; height: 400px; flex: none; border-radius: 30px; background: var(--gelo); color: var(--preto); position: relative; display: flex; align-items: center; justify-content: center; }
.k-carrossel .c.l { background: var(--azul); color: var(--gelo); }
.k-carrossel .nm { position: absolute; left: 28px; bottom: 24px; font-weight: 700; font-size: 34px; }
.k-carrossel .bt { background: var(--preto); color: var(--gelo); font-weight: 700; font-size: 34px; padding: 22px 40px; border-radius: 18px; }
.k-carrossel .in { width: 240px; height: 70px; border-radius: 16px; border: 3px solid currentColor; display: flex; align-items: center; padding-left: 20px; font-size: 26px; opacity: 0.8; }
.k-carrossel .cd { width: 230px; display: flex; flex-direction: column; gap: 14px; } .k-carrossel .cd i { height: 22px; border-radius: 11px; background: currentColor; opacity: 0.3; } .k-carrossel .cd i:first-child { height: 90px; opacity: 0.85; border-radius: 14px; }
.k-carrossel .tg { width: 150px; height: 80px; border-radius: 40px; background: var(--limao); position: relative; } .k-carrossel .tg b { position: absolute; right: 8px; top: 8px; width: 64px; height: 64px; border-radius: 50%; background: var(--preto); }
.k-carrossel .dg { width: 240px; height: 170px; border-radius: 20px; background: var(--preto); position: relative; } .k-carrossel .dg i { position: absolute; left: 24px; right: 60px; top: 30px; height: 18px; border-radius: 9px; background: rgba(246,246,246,0.5); } .k-carrossel .dg b { position: absolute; right: 20px; bottom: 20px; background: var(--limao); color: var(--preto); padding: 8px 24px; border-radius: 12px; font-size: 26px; }
.k-carrossel .tb { display: flex; gap: 6px; padding: 8px; border-radius: 16px; background: rgba(13,13,13,0.08); font-size: 26px; font-weight: 700; } .k-carrossel .tb > * { padding: 12px 18px; border-radius: 12px; } .k-carrossel .tb b { background: var(--preto); color: var(--gelo); }
.k-carrossel .bd { background: var(--limao); color: var(--preto); padding: 14px 34px; border-radius: 40px; font-size: 38px; font-weight: 900; }`,
    `const e = mola(t, { freq: 1.6, amort: 0.8 });
tf($(r, '.trilho'), 'translateX(' + (60 + (1 - e) * 500 - t * 300) + 'px)');
$$(r, '.c').forEach((c, i) => { c.style.transform = 'translateY(' + Math.sin(t * 3 + i * 0.9) * 12 + 'px) rotate(' + Math.sin(t * 2 + i) * 1.5 + 'deg)'; });
op($(r, '.tit'), cl(t * 4));`);
  },

  'ui-app'({ prompt = 'botão de assinatura' } = {}) {
    return card('ui-app', 'claro', `<div class="jan"><div class="barra"><i></i><i></i><i></i><span class="url">vercel.com/vgpu</span></div>
<div class="lado">${TRIANGULO('var(--preto)')}<div class="it a">Componentes</div><div class="it">Temas</div><div class="it">Blocos</div><div class="it">Docs</div></div>
<div class="area"><div class="hd">Componentes</div><div class="lista"><div class="li">Button</div><div class="li">Card</div><div class="li alvo">Dialog</div><div class="li">Tabs</div></div>
<div class="prev"><div class="dlg"><div class="l1"></div><div class="l2"></div><div class="ok">Confirmar</div></div></div></div></div>
<div class="clique"></div>${CURSOR}`, `
.k-ui-app .jan { position: absolute; left: 34px; right: 34px; top: 40px; bottom: 40px; border-radius: 24px; background: var(--gelo); border: 2px solid rgba(13,13,13,0.14); overflow: hidden; box-shadow: 0 20px 50px rgba(13,13,13,0.18); }
.k-ui-app .barra { height: 56px; background: var(--preto); display: flex; align-items: center; gap: 10px; padding-left: 22px; }
.k-ui-app .barra i { width: 14px; height: 14px; border-radius: 50%; background: rgba(246,246,246,0.35); }
.k-ui-app .url { margin-left: 18px; color: rgba(246,246,246,0.75); font-size: 22px; background: rgba(246,246,246,0.08); padding: 6px 18px; border-radius: 10px; }
.k-ui-app .lado { position: absolute; left: 0; top: 56px; bottom: 0; width: 230px; border-right: 2px solid rgba(13,13,13,0.08); padding: 26px 20px; box-sizing: border-box; }
.k-ui-app .lado .tri { width: 44px; margin: 0 0 26px 8px; }
.k-ui-app .it { font-size: 26px; font-weight: 500; padding: 12px 14px; border-radius: 12px; color: rgba(13,13,13,0.6); }
.k-ui-app .it.a { background: var(--preto); color: var(--gelo); font-weight: 700; }
.k-ui-app .area { position: absolute; left: 230px; right: 0; top: 56px; bottom: 0; padding: 26px 30px; box-sizing: border-box; }
.k-ui-app .hd { font-family: var(--fonte-titulo); font-weight: 600; font-size: 44px; color: var(--preto); }
.k-ui-app .lista { display: flex; gap: 12px; margin-top: 18px; flex-wrap: wrap; }
.k-ui-app .li { font-size: 24px; font-weight: 700; padding: 10px 20px; border-radius: 30px; border: 2px solid rgba(13,13,13,0.2); color: var(--preto); }
.k-ui-app .li.alvo.on { background: var(--azul); color: var(--gelo); border-color: var(--azul); }
.k-ui-app .prev { position: absolute; left: 30px; right: 30px; top: 190px; bottom: 30px; border-radius: 20px; background: rgba(0,53,212,0.08); display: flex; align-items: center; justify-content: center; }
.k-ui-app .dlg { width: 340px; padding: 28px; border-radius: 22px; background: var(--preto); }
.k-ui-app .dlg .l1 { height: 22px; width: 70%; border-radius: 11px; background: var(--gelo); } .k-ui-app .dlg .l2 { height: 16px; width: 90%; margin-top: 16px; border-radius: 8px; background: rgba(246,246,246,0.35); }
.k-ui-app .ok { margin-top: 26px; margin-left: auto; width: max-content; background: var(--limao); color: var(--preto); font-weight: 700; font-size: 26px; padding: 12px 26px; border-radius: 12px; }
.k-ui-app .cursor { position: absolute; left: 0; top: 0; width: 46px; z-index: 5; }
.k-ui-app .clique { position: absolute; width: 80px; height: 80px; margin: -40px 0 0 -40px; border-radius: 50%; border: 5px solid var(--azul); z-index: 4; }`,
    `const e = mola(t, { freq: 2, amort: 0.75 }); tf($(r, '.jan'), 'translateY(' + (1 - e) * 80 + 'px) scale(' + (0.92 + 0.08 * e) + ')');
const alvo = { x: 590, y: 225 }, ini = { x: 760, y: 600 };
const m = suave((t - 0.25) / 0.55), cx = lerp(ini.x, alvo.x, m) + Math.sin(t * 2) * 4, cy = lerp(ini.y, alvo.y, m) - Math.sin(m * Math.PI) * 60;
const press = t > 0.85 && t < 0.98 ? 0.85 : 1;
tf($(r, '.cursor'), 'translate(' + cx + 'px,' + cy + 'px) scale(' + press + ')');
const li = $(r, '.alvo'); if (li) li.classList.toggle('on', t > 0.9);
const c = cl((t - 0.9) / 0.45); const ck = $(r, '.clique'); if (ck) { ck.style.left = alvo.x + 18 + 'px'; ck.style.top = alvo.y + 18 + 'px'; ck.style.opacity = t > 0.9 ? 1 - c : 0; ck.style.transform = 'scale(' + (0.4 + 1.4 * c) + ')'; }
const d = mola(t - 1.0, { freq: 2.4, amort: 0.55 }); const dl = $(r, '.dlg'); op(dl, cl(d * 2)); tf(dl, 'scale(' + (0.6 + 0.4 * d) + ') translateY(' + Math.sin(t * 2.5) * 5 + 'px)');`);
  },

  contador({ de = 199, para = 0, prefixo = 'R$ ', rotulo = 'por mês', selo = 'GRÁTIS' } = {}) {
    return card('contador', 'escuro', `<div class="rot">${esc(rotulo)}</div><div class="num"><span class="pre">${esc(prefixo)}</span><span class="v">${de}</span></div><div class="selo">${esc(selo)}</div>`, `
.k-contador .rot { position: absolute; left: 0; right: 0; top: 70px; text-align: center; font-size: 40px; font-weight: 700; color: rgba(246,246,246,0.6); letter-spacing: 0.08em; text-transform: uppercase; }
.k-contador .num { position: absolute; left: 0; right: 0; top: 150px; text-align: center; font-family: var(--fonte-titulo); font-weight: 700; font-size: 260px; line-height: 1; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; white-space: nowrap; }
.k-contador .pre { font-size: 130px; vertical-align: 0.5em; margin-right: 12px; color: rgba(246,246,246,0.7); }
.k-contador .risco { position: absolute; left: 130px; right: 130px; top: 290px; height: 16px; border-radius: 8px; background: var(--limao); transform-origin: left; }
.k-contador .selo { position: absolute; left: 50%; top: 470px; transform-origin: center; font-family: var(--fonte-titulo); font-weight: 700; font-size: 90px; color: var(--preto); background: var(--limao); padding: 6px 44px 0; border-radius: 24px; white-space: nowrap; }`,
    `const k = suave(t / 0.5); const v = Math.round(lerp(${de}, ${para}, k)); const sv = $(r, '.v'); if (sv) sv.textContent = v;
const n = $(r, '.num'); tf(n, 'translateY(' + Math.sin(t * 30) * (k < 1 ? 3 : 0) + 'px) scale(' + (1 + 0.1 * mola(t - 0.9, { freq: 3, amort: 0.4 }) * (t > 0.5 ? 1 : 0) - (t > 0.5 ? 0.1 : 0) + 0.02 * Math.sin(t * 3)) + ')');
if (n) n.style.color = k >= 1 ? 'var(--limao)' : 'var(--gelo)';
const s = mola(t - 0.5, { freq: 2.4, amort: 0.5 }); const se = $(r, '.selo'); op(se, cl(s * 3)); tf(se, 'translateX(-50%) rotate(' + (-6 + Math.sin(t * 3) * 2) + 'deg) scale(' + (0.3 + 0.7 * s) + ')');`);
  },

  // estrelas: só um número real e verificado; sem ele o card mostra o rótulo (nunca inventar dado).
  repo({ dono = 'vercel', nome = 'vgpu', estrelas = null, rotulo = 'Grátis', descricao = 'Componentes de interface da Vercel, abertos.' } = {}) {
    return card('repo', 'escuro', `<div class="rc"><div class="top"><svg viewBox="0 0 24 24" class="bk"><path d="M5 3h11a2 2 0 0 1 2 2v14H7a2 2 0 0 0-2 2V3z" fill="none" stroke="var(--gelo)" stroke-width="2"/></svg><span class="nm">${esc(dono)} / <b>${esc(nome)}</b></span><span class="pub">Public</span></div>
<div class="ds">${esc(descricao)}</div><div class="arq">${['components/', 'themes/', 'README.md', 'LICENSE'].map((a) => `<div class="f"><i></i>${a}</div>`).join('')}</div>
<div class="rod"><div class="star"><svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" fill="var(--limao)"/></svg><span class="n">${estrelas == null ? esc(rotulo) : '0'}</span></div><div class="btn">Star</div></div></div>`, `
.k-repo .rc { position: absolute; left: 40px; right: 40px; top: 50px; bottom: 50px; border-radius: 26px; border: 2px solid rgba(246,246,246,0.18); background: var(--preto); padding: 36px 40px; box-sizing: border-box; }
.k-repo .top { display: flex; align-items: center; gap: 16px; font-size: 40px; }
.k-repo .bk { width: 44px; } .k-repo .nm { color: rgba(246,246,246,0.8); } .k-repo .nm b { color: var(--gelo); }
.k-repo .pub { font-size: 24px; font-weight: 700; padding: 4px 16px; border-radius: 20px; border: 2px solid rgba(246,246,246,0.4); color: rgba(246,246,246,0.8); }
.k-repo .ds { margin-top: 20px; font-size: 30px; color: rgba(246,246,246,0.7); }
.k-repo .arq { margin-top: 26px; border-radius: 16px; border: 2px solid rgba(246,246,246,0.12); }
.k-repo .f { display: flex; align-items: center; gap: 16px; font-size: 26px; padding: 14px 22px; border-top: 2px solid rgba(246,246,246,0.08); } .k-repo .f:first-child { border-top: 0; }
.k-repo .f i { width: 22px; height: 22px; border-radius: 5px; background: var(--azul); }
.k-repo .rod { position: absolute; left: 40px; right: 40px; bottom: 34px; display: flex; align-items: center; justify-content: space-between; }
.k-repo .star { display: flex; align-items: center; gap: 16px; font-family: var(--fonte-titulo); font-weight: 700; font-size: 80px; color: var(--limao); font-variant-numeric: tabular-nums; }
.k-repo .star svg { width: 76px; }
.k-repo .btn { font-size: 30px; font-weight: 700; padding: 14px 36px; border-radius: 14px; background: var(--gelo); color: var(--preto); }`,
    `const e = mola(t, { freq: 2.1, amort: 0.7 }); tf($(r, '.rc'), 'translateY(' + (1 - e) * 100 + 'px) rotate(' + (1 - e) * -3 + 'deg)');
$$(r, '.f').forEach((f, i) => { const q = mola(t - 0.15 - i * 0.07, { freq: 2.5, amort: 0.75 }); f.style.opacity = cl(q * 2); f.style.transform = 'translateX(' + (1 - q) * 40 + 'px)'; });
${estrelas == null ? '' : `const k = 1 - Math.pow(1 - cl((t - 0.2) / 1.0), 3); const n = Math.round(${estrelas} * k);
const sn = $(r, '.n'); if (sn) sn.textContent = n >= 1000 ? (n / 1000).toFixed(1).replace('.', ',') + ' mil' : n;`}
tf($(r, '.star svg'), 'rotate(' + t * 90 + 'deg) scale(' + (1 + 0.12 * Math.sin(t * 6)) + ')');`);
  },

  chip({ texto = 'AI-first' } = {}) {
    return card('chip', 'azul', `<div class="ondas"><i></i><i></i><i></i></div><div class="pill"><span>${esc(texto)}</span>${ESTRELA4()}</div>`, `
.k-chip .pill { position: absolute; left: 50%; top: 50%; display: flex; align-items: center; gap: 26px; padding: 34px 60px 30px; border-radius: 120px; background: var(--preto); font-family: var(--fonte-titulo); font-weight: 600; font-size: 120px; line-height: 1; white-space: nowrap; color: var(--gelo); }
.k-chip .est4 { width: 96px; }
.k-chip .ondas i { position: absolute; left: 50%; top: 50%; width: 640px; height: 240px; margin: -120px 0 0 -320px; border-radius: 120px; border: 4px solid var(--limao); }`,
    `const e = mola(t, { freq: 2.2, amort: 0.5 }); const p = $(r, '.pill');
tf(p, 'translate(-50%,-50%) scale(' + (0.5 + 0.5 * e + 0.035 * Math.sin(t * 5.5)) + ')'); op(p, cl(e * 3));
tf($(r, '.est4'), 'rotate(' + t * 120 + 'deg) scale(' + (0.85 + 0.2 * Math.abs(Math.sin(t * 4))) + ')');
$$(r, '.ondas i').forEach((o, i) => { const f = ((t * 0.9 + i / 3) % 1); o.style.transform = 'scale(' + (0.9 + f * 0.7) + ')'; o.style.opacity = t < 0.2 ? 0 : (1 - f) * 0.8; });`);
  },

  avatares({ n = 12 } = {}) {
    const ini = ['GR', 'LS', 'MT', 'AP', 'JC', 'RV', 'DK', 'EF', 'NO', 'BH', 'SW', 'TY'];
    const cores = ['azul', 'limao', 'gelo'];
    const avs = Array.from({ length: n }, (_, i) => `<div class="a ${cores[i % 3]}">${ini[i % ini.length]}</div>`).join('');
    const commits = ['feat: Button', 'fix: Dialog foco', 'feat: tema escuro', 'docs: guia IA', 'feat: Tabs'].map((c) => `<div class="cm"><b></b><span>${esc(c)}</span></div>`).join('');
    return card('avatares', 'escuro', `<div class="gr">${avs}</div><div class="log">${commits}</div>`, `
.k-avatares .gr { position: absolute; left: 50px; right: 50px; top: 50px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 18px; }
.k-avatares .a { aspect-ratio: 1; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--fonte-titulo); font-weight: 600; font-size: 38px; border: 4px solid var(--preto); }
.k-avatares .a.azul { background: var(--azul); color: var(--gelo); } .k-avatares .a.limao { background: var(--limao); color: var(--preto); } .k-avatares .a.gelo { background: var(--gelo); color: var(--preto); }
.k-avatares .log { position: absolute; left: 60px; right: 60px; top: 345px; height: 270px; overflow: hidden; }
.k-avatares .cm { display: flex; align-items: center; gap: 18px; font-size: 30px; font-weight: 500; height: 54px; color: rgba(246,246,246,0.85); }
.k-avatares .cm b { width: 18px; height: 18px; border-radius: 50%; background: var(--limao); box-shadow: 0 0 0 6px rgba(182,255,89,0.2); }`,
    `$$(r, '.a').forEach((a, i) => { const q = mola(t - i * 0.045, { freq: 2.6, amort: 0.5 }); a.style.opacity = cl(q * 2); a.style.transform = 'scale(' + q + ') translateY(' + Math.sin(t * 3 + i * 0.7) * 6 + 'px)'; });
$$(r, '.cm').forEach((c, i) => { const q = mola(t - 0.35 - i * 0.2, { freq: 2.4, amort: 0.7 }); c.style.opacity = cl(q * 2); c.style.transform = 'translateX(' + (1 - q) * -60 + 'px)'; });
tf($(r, '.log'), 'translateY(' + -Math.max(0, t - 1.1) * 30 + 'px)');`);
  },

  prompt({ texto = 'um card de perfil com botão azul' } = {}) {
    return card('prompt', 'escuro', `<div class="campo">${ESTRELA4()}<span class="tx"></span><i class="cur"></i><div class="env">↑</div></div>
<div class="gerado"><div class="pl">Perfil</div><div class="pr">Seu Nome</div><div class="ln"></div><div class="ln c"></div><div class="bt">Seguir</div></div>`, `
.k-prompt .campo { position: absolute; left: 40px; right: 40px; top: 46px; height: 112px; border-radius: 28px; background: rgba(246,246,246,0.07); border: 3px solid var(--azul); display: flex; align-items: center; gap: 18px; padding: 0 26px; box-sizing: border-box; font-size: 36px; font-weight: 500; }
.k-prompt .est4 { width: 40px; flex: none; }
.k-prompt .tx { white-space: nowrap; overflow: hidden; }
.k-prompt .cur { width: 4px; height: 44px; background: var(--limao); flex: none; }
.k-prompt .env { margin-left: auto; width: 64px; height: 64px; flex: none; border-radius: 50%; background: var(--gelo); color: var(--preto); font-weight: 900; font-size: 36px; display: flex; align-items: center; justify-content: center; }
.k-prompt .gerado { position: absolute; left: 50%; top: 196px; width: 440px; margin-left: -220px; padding: 34px 36px; border-radius: 30px; background: var(--gelo); color: var(--preto); box-sizing: border-box; }
.k-prompt .pl { font-weight: 700; font-size: 30px; color: var(--azul); }
.k-prompt .pr { font-family: var(--fonte-titulo); font-weight: 700; font-size: 72px; line-height: 1.05; } .k-prompt .pr small { font-size: 34px; font-family: var(--fonte-texto); font-weight: 500; }
.k-prompt .ln { height: 16px; border-radius: 8px; background: rgba(13,13,13,0.15); margin-top: 16px; } .k-prompt .ln.c { width: 70%; }
.k-prompt .bt { margin-top: 26px; text-align: center; background: var(--azul); color: var(--gelo); font-weight: 700; font-size: 34px; padding: 18px; border-radius: 16px; }`,
    `const T = ${JSON.stringify(texto)}; const k = cl((t - 0.05) / 0.6); const sx = $(r, '.tx'); if (sx) sx.textContent = T.slice(0, Math.round(T.length * k));
op($(r, '.cur'), k < 1 || Math.floor(t * 3) % 2 ? 1 : 0);
const env = $(r, '.env'); const ap = t > 0.7 && t < 0.85; tf(env, 'scale(' + (ap ? 0.8 : 1) + ')'); if (env) env.style.background = t > 0.7 ? 'var(--limao)' : 'var(--gelo)';
const g = mola(t - 0.8, { freq: 2.2, amort: 0.55 }); const ge = $(r, '.gerado'); op(ge, cl(g * 2)); tf(ge, 'translateY(' + ((1 - g) * 120 + Math.sin(t * 2.4) * 6) + 'px) scale(' + (0.7 + 0.3 * g) + ')');
$$(r, '.gerado > *').forEach((el, i) => { el.style.opacity = cl((t - 0.9 - i * 0.08) * 6); });`);
  },

  barra({ rotulo = 'dificuldade', antes = 'antes', depois = 'com VGPU', de = 0.92, para = 0.18 } = {}) {
    return card('barra', 'escuro', `<div class="rt">${esc(rotulo)}</div>
<div class="lin a"><span class="lb">${esc(antes)}</span><div class="tr"><i></i></div></div>
<div class="lin d"><span class="lb">${esc(depois)}</span><div class="tr"><i></i></div></div><div class="seta">${'↓'}</div>`, `
.k-barra .rt { position: absolute; left: 60px; top: 60px; font-family: var(--fonte-titulo); font-weight: 600; font-size: 70px; text-transform: lowercase; }
.k-barra .lin { position: absolute; left: 60px; right: 60px; }
.k-barra .lin.a { top: 230px; } .k-barra .lin.d { top: 420px; }
.k-barra .lb { font-size: 36px; font-weight: 700; color: rgba(246,246,246,0.75); }
.k-barra .tr { margin-top: 18px; height: 70px; border-radius: 35px; background: rgba(246,246,246,0.1); overflow: hidden; }
.k-barra .tr i { display: block; height: 100%; border-radius: 35px; background: var(--azul); transform-origin: left; }
.k-barra .lin.d .tr i { background: var(--limao); }
.k-barra .lin.d .lb { color: var(--limao); }
.k-barra .seta { position: absolute; right: 70px; top: 40px; font-family: var(--fonte-titulo); font-weight: 700; font-size: 120px; color: var(--limao); }`,
    `const a = mola(t - 0.05, { freq: 1.8, amort: 0.8 }); tf($(r, '.lin.a .tr i'), 'scaleX(' + ${de} * a + ')');
const d = mola(t - 0.55, { freq: 1.6, amort: 0.75 }); tf($(r, '.lin.d .tr i'), 'scaleX(' + lerp(${de}, ${para}, d) * cl((t - 0.45) * 8) + ')');
tf($(r, '.seta'), 'translateY(' + (Math.sin(t * 5) * 14) + 'px)'); op($(r, '.seta'), cl((t - 0.6) * 4));
op($(r, '.rt'), cl(t * 5)); tf($(r, '.rt'), 'translateX(' + Math.sin(t * 1.5) * 6 + 'px)');`);
  },

  checklist({ itens = ['Instalar', 'Escolher componentes', 'Gerar com IA'] } = {}) {
    const lis = itens.map((it, i) => `<div class="it"><b>${CHECK}</b><span class="n">${i + 1}</span><span class="tx">${esc(it)}</span></div>`).join('');
    return card('checklist', 'claro', `<div class="hd">passo a passo</div>${lis}`, `
.k-checklist .hd { position: absolute; left: 60px; top: 50px; font-family: var(--fonte-titulo); font-weight: 600; font-size: 62px; color: var(--azul); }
.k-checklist .it { position: absolute; left: 60px; right: 60px; height: 130px; display: flex; align-items: center; gap: 26px; border-radius: 26px; background: var(--preto); color: var(--gelo); padding: 0 30px; box-sizing: border-box; font-size: 44px; font-weight: 700; }
.k-checklist .it:nth-of-type(3) { top: 170px; } .k-checklist .it:nth-of-type(4) { top: 320px; } .k-checklist .it:nth-of-type(5) { top: 470px; }
.k-checklist .it b { width: 70px; height: 70px; border-radius: 18px; background: var(--limao); flex: none; display: flex; } .k-checklist .it b svg { width: 100%; }
.k-checklist .n { font-family: var(--fonte-titulo); color: rgba(246,246,246,0.4); }`,
    `$$(r, '.it').forEach((it, i) => { const q = mola(t - i * 0.18, { freq: 2.4, amort: 0.7 }); it.style.opacity = cl(q * 2); it.style.transform = 'translateX(' + ((1 - q) * 120 + Math.sin(t * 2 + i) * 4) + 'px)';
  const c = mola(t - 0.45 - i * 0.4, { freq: 3, amort: 0.45 }); const b = it.querySelector('b'); b.style.transform = 'scale(' + c + ') rotate(' + (1 - c) * -40 + 'deg)'; });`);
  },

  documento({ titulo = 'Guia VGPU', subtitulo = 'do zero ao primeiro componente' } = {}) {
    return card('documento', 'azul', `<div class="pg"><div class="tg">PDF</div><div class="t">${esc(titulo)}</div><div class="s">${esc(subtitulo)}</div>${'<div class="l"></div>'.repeat(5)}</div>`, `
.k-documento .pg { position: absolute; left: 50%; top: 60px; width: 520px; height: 600px; margin-left: -260px; border-radius: 22px; background: var(--gelo); color: var(--preto); padding: 44px 46px; box-sizing: border-box; transform-origin: 50% 100%; box-shadow: 0 30px 60px rgba(13,13,13,0.35); }
.k-documento .tg { width: max-content; background: var(--limao); font-weight: 900; font-size: 24px; padding: 6px 16px; border-radius: 10px; }
.k-documento .t { margin-top: 26px; font-family: var(--fonte-titulo); font-weight: 700; font-size: 74px; line-height: 1; }
.k-documento .s { margin-top: 14px; font-size: 28px; font-weight: 500; color: rgba(13,13,13,0.6); }
.k-documento .l { height: 16px; border-radius: 8px; background: rgba(0,53,212,0.25); margin-top: 22px; transform-origin: left; }
.k-documento .l:nth-of-type(odd) { width: 80%; }`,
    `const e = mola(t, { freq: 1.9, amort: 0.6 }); tf($(r, '.pg'), 'perspective(1200px) rotateX(' + (1 - e) * 70 + 'deg) rotateZ(' + Math.sin(t * 1.6) * 1.8 + 'deg) translateY(' + Math.sin(t * 2.2) * 6 + 'px)');
$$(r, '.l').forEach((l, i) => { l.style.transform = 'scaleX(' + suave((t - 0.45 - i * 0.18) / 0.35) + ')'; });`);
  },

  comentario({ palavra = 'VGPU', usuario = 'você' } = {}) {
    return card('comentario', '', `<div class="cx"><div class="av"><svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="4.2" fill="var(--gelo)"/><path d="M3.8 21 C4.6 16.4 8 14 12 14 C16 14 19.4 16.4 20.2 21 Z" fill="var(--gelo)"/></svg></div><div class="col"><div class="us">${esc(usuario)}</div><div class="fd"><span class="tx"></span><i class="cur"></i></div></div><div class="env">Publicar</div></div><div class="cor">${'<svg viewBox="0 0 24 22"><path d="M12 21 C5 15 1 11.5 1 7 A5.5 5.5 0 0 1 12 4.5 A5.5 5.5 0 0 1 23 7 C23 11.5 19 15 12 21 Z" fill="var(--limao)"/></svg>'.repeat(3)}</div>`, `
.k-comentario .cx { position: absolute; left: 30px; right: 30px; top: 50%; height: 190px; margin-top: -95px; border-radius: 40px; background: linear-gradient(180deg, var(--vidro-1), var(--vidro-2)); color: var(--gelo); display: flex; align-items: center; gap: 24px; padding: 0 30px; box-sizing: border-box; box-shadow: inset 0 -40px 40px -20px rgba(0,53,212,0.95), inset 0 -16px 16px -8px rgba(77,123,255,0.5), inset 0 0 0 2px rgba(246,246,246,0.1), 0 20px 50px rgba(13,13,13,0.6); }
.k-comentario .av { width: 100px; height: 100px; border-radius: 50%; background: var(--azul); flex: none; display: flex; align-items: flex-end; justify-content: center; overflow: hidden; }
.k-comentario .av svg { width: 74px; height: 74px; margin-bottom: -4px; }
.k-comentario .col { flex: 1; min-width: 0; } .k-comentario .us { font-size: 28px; font-weight: 700; color: rgba(246,246,246,0.6); }
.k-comentario .fd { display: flex; align-items: center; height: 96px; font-family: var(--fonte-titulo); font-weight: 700; font-size: ${palavra.length > 5 ? 64 : 92}px; white-space: nowrap; }
.k-comentario .tx { color: var(--limao); }
.k-comentario .cur { width: 6px; height: 74px; margin-left: 6px; background: var(--azul); }
.k-comentario .env { font-weight: 900; font-size: 30px; padding: 18px 26px; border-radius: 18px; background: var(--preto); color: var(--limao); }
.k-comentario .cor { position: absolute; right: 70px; top: 50%; }
.k-comentario .cor svg { position: absolute; width: 60px; }`,
    `const e = mola(t, { freq: 2.2, amort: 0.6 }); tf($(r, '.cx'), 'translateY(' + (1 - e) * 140 + 'px) scale(' + (0.85 + 0.15 * e + 0.012 * Math.sin(t * 4)) + ')'); op($(r, '.cx'), cl(e * 2));
const P = ${JSON.stringify(palavra)}; const k = cl((t - 0.35) / 0.7); const sx = $(r, '.tx'); if (sx) sx.textContent = P.slice(0, Math.round(P.length * k));
op($(r, '.cur'), k < 1 || Math.floor(t * 2.5) % 2 ? 1 : 0);
const env = $(r, '.env'); const env_t = t - 1.3; tf(env, 'scale(' + (env_t > 0 && env_t < 0.15 ? 0.88 : 1) + ')');
$$(r, '.cor svg').forEach((s, i) => { const f = ((t - 1.4 - i * 0.35) % 1.2 + 1.2) % 1.2; const v = t > 1.4 + i * 0.35; s.style.opacity = v ? 1 - f / 1.2 : 0; s.style.transform = 'translate(' + (Math.sin(f * 5 + i) * 30 - i * 40) + 'px,' + (-110 - f * 260) + 'px) scale(' + (0.6 + f * 0.6) + ')'; });`);
  },

  // Cena gerada (OpenArt) animada em código: zoom lento + deriva até o rosto + vinheta.
  // src: URL file:// da imagem; foco: posição vertical do rosto na imagem (0–1).
  cena({ src = '', foco = 0.38, deriva = 1 } = {}) {
    return card('cena', 'escuro', `${src ? `<img class="im" src="${esc(src)}">` : ''}<div class="vin"></div><div class="flash"></div>`, `
.k-cena .im { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% ${foco * 100}%; transform-origin: 50% ${foco * 100}%; }
.k-cena .vin { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(13,13,13,0.75)); }
.k-cena .flash { position: absolute; inset: 0; background: var(--gelo); }`,
    `const e = mola(t, { freq: 2.2, amort: 0.75 });
tf($(r, '.im'), 'scale(' + (1.18 - 0.08 * e + 0.035 * t) + ') translateX(' + (${deriva} * (12 - 10 * t)) + 'px)');
op($(r, '.flash'), cl(0.55 - t * 3));`);
  },

  placeholder({ texto = 'CENA — OpenArt (aguardando aprovação)', nota = '' } = {}) {
    return card('placeholder', 'escuro', `<div class="mold"><div class="cantos"><i></i><i></i><i></i><i></i></div><div class="tx">${esc(texto)}</div>${nota ? `<div class="nt">${esc(nota)}</div>` : ''}<div class="var"></div></div>`, `
.k-placeholder .mold { position: absolute; left: 40px; right: 40px; top: 40px; bottom: 40px; border-radius: 26px; border: 3px dashed rgba(246,246,246,0.35); overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; }
.k-placeholder .tx { font-family: var(--fonte-titulo); font-weight: 600; font-size: 54px; text-align: center; line-height: 1.15; padding: 0 60px; color: var(--gelo); text-wrap: balance; }
.k-placeholder .nt { font-size: 28px; font-weight: 500; color: rgba(246,246,246,0.55); text-align: center; padding: 0 70px; }
.k-placeholder .var { position: absolute; top: 0; bottom: 0; width: 160px; background: linear-gradient(90deg, transparent, rgba(0,53,212,0.35), transparent); }
.k-placeholder .cantos { position: absolute; inset: 0; }
.k-placeholder .cantos i { position: absolute; width: 50px; height: 50px; border: 6px solid var(--limao); }
.k-placeholder .cantos i:nth-child(1) { left: 24px; top: 24px; border-right: 0; border-bottom: 0; } .k-placeholder .cantos i:nth-child(2) { right: 24px; top: 24px; border-left: 0; border-bottom: 0; }
.k-placeholder .cantos i:nth-child(3) { left: 24px; bottom: 24px; border-right: 0; border-top: 0; } .k-placeholder .cantos i:nth-child(4) { right: 24px; bottom: 24px; border-left: 0; border-top: 0; }`,
    `const e = mola(t, { freq: 2, amort: 0.8 }); op($(r, '.mold'), cl(e * 2));
tf($(r, '.var'), 'translateX(' + (((t * 500) % 1100) - 160) + 'px)');
tf($(r, '.cantos'), 'scale(' + (1 + 0.01 * Math.sin(t * 3)) + ')'); op($(r, '.tx'), 0.75 + 0.25 * Math.sin(t * 2.5));`);
  },
};

// Clash Display com letter-spacing negativo engole o espaço entre palavras ("Crieaconta"): devolve o espaço nos títulos.
const ESPACO_TITULOS = `.ti, .pal, .mc, .rt, .rw, .fc span, .t-pass .it, .t-blocos .bl { word-spacing: 0.16em; }`;
export const CSS_BASE = BASE_CSS + ESPACO_TITULOS;

// Monta um card pelo tipo; lança erro se o tipo não existir.
export function montarCard(tipo, props = {}) {
  const f = TIPOS[tipo];
  if (!f) throw new Error(`tipo de card desconhecido: ${tipo}`);
  return f(props);
}
