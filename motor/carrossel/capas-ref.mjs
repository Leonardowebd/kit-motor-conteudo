// Capas copiadas de referências ("copiar para aprender"): replica o MECANISMO de cada capa (layout, hierarquia, composição) na paleta e fontes da marca.
// Uso: node motor/carrossel/capas-ref.mjs <pasta-da-rodada>   (espera <pasta>/assets e escreve <pasta>/capas/NN-nome.png + prancha.png)
// 1 kacio-mei (foto cheia + palavra gigante + cartão de vidro) · 2 se-eu-fosse (recorte + etiqueta girada + ícones) · 3/4 davi (foto-herói + faixa de perfil + título em caixa-alta)
// 5 clonar (palavra glitch + leque de cartões) · 6 sobre-mim (retrato P&B + rabiscos + nome grande).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
import { cssMarca } from '../video/legenda.mjs';
import { recortar } from './carrossel.mjs';

const pasta = path.resolve(process.argv[2] || '.');
const IA = process.argv.includes('--ia'); // usa as imagens geradas por IA em assets/ia (escolha por capa em ESCOLHA)
const ESCOLHA = { 1: 'c1-c.png', 2: 'c2-b.png', 3: 'c3-b.png', 4: 'c4-c.png', 6: 'c6-d.png' };
const IMG = (n) => A(`ia/${ESCOLHA[n]}`);
const corTopo = (f) => { const b = execFileSync(ffmpeg, ['-v', 'error', '-i', f, '-vf', 'crop=iw:12:0:0,scale=1:1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']); return `rgb(${b[0]},${b[1]},${b[2]})`; };
const A = (f) => pathToFileURL(path.join(pasta, 'assets', f)).href;
const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const acervo = JSON.parse(readFileSync(path.join(raiz, 'conteudo.config.json'), 'utf8')).acervo;
const avatar = pathToFileURL(path.join(acervo, 'Conteudo/Kit Perfil/foto-perfil-ig.jpg')).href;
const selo = readFileSync(path.join(raiz, 'motor/marca/selo-verificado.svg'), 'utf8').replace('<svg', '<svg width="30" height="30"');
const icone = (nome, cor) => readFileSync(path.join(pasta, 'assets', nome + '.svg'), 'utf8').replace('<svg', `<svg width="92" height="92" fill="${cor}"`);
const slide = (n) => pathToFileURL(path.join(pasta, '..', '2026-11-04-fedex-seta', 'slides', `0${n}.png`)).href;
const leo813 = pathToFileURL(recortar(path.join(pasta, 'assets', 'leo-813.jpg'))).href;
const M = (s) => s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<em>$1</em>');

const BASE = `${cssMarca()}
*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1350px;overflow:hidden}
body{position:relative;font-family:var(--fonte-texto);color:var(--gelo);-webkit-font-smoothing:antialiased}
.abs{position:absolute}em{font-style:normal}b{font-weight:800}`;
const pag = (css, corpo) => `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}${css}</style></head><body>${corpo}</body></html>`;

const capas = {
  // ---- 1. Kacio · "Designers finalmente no MEI?" ----
  '01-kacio-mei': pag(`
body{background:#03050C}
.foto{inset:0;background:url(${A('senado2.jpg')}) 50% 100%/cover;filter:saturate(.8) contrast(1.05)}
.veu{inset:0;background:linear-gradient(180deg,rgba(3,5,12,.5) 0%,rgba(3,5,12,.12) 45%,rgba(3,5,12,0) 70%,rgba(3,5,12,.35) 100%)}
.top{left:100px;right:100px;top:96px;display:flex;justify-content:space-between;font:500 24px var(--fonte-texto);letter-spacing:.02em}
.top .n{font-size:24px}.top b{font-weight:800}.top .c{font-weight:400}
h1{margin:0;left:0;right:0;top:170px;text-align:center;font:700 112px/1 var(--fonte-titulo);letter-spacing:-.025em;color:#fff;text-shadow:0 6px 40px rgba(0,20,90,.35)}
.g{left:0;right:0;top:290px;text-align:center;font:700 350px/.9 var(--fonte-titulo);letter-spacing:-.015em;color:var(--limao);text-shadow:0 10px 60px rgba(0,20,90,.35)}
.card{left:100px;right:100px;top:700px;padding:30px 44px;border-radius:44px;border:1px solid rgba(255,255,255,.35);background:rgba(120,125,135,.38);backdrop-filter:blur(18px);font:500 40px/1.22 var(--fonte-texto);text-align:center}
.card b{font-weight:800}
.cred{left:100px;right:100px;bottom:128px;font:600 20px var(--fonte-texto);color:rgba(13,13,13,.72);text-align:center}
.rod{left:100px;right:100px;bottom:62px;display:flex;justify-content:space-between;align-items:flex-end;font:500 24px/1.2 var(--fonte-texto);letter-spacing:.03em}
.rod .s{font-size:48px;line-height:.6}`,
`<div class="abs foto"></div><div class="abs veu"></div>
<div class="abs top"><span class="n">2026</span><span><b>LEONARDO</b> <span class="c">DESIGN &amp; IA</span></span><span class="n">/01</span></div>
<h1 class="abs">Designers no</h1><div class="abs g">MEI?</div>
<div class="abs card">Uma ideia no Senado quer incluir serviços digitais no MEI. <b>19.231 de 20.000 apoios</b> para a meta.</div>
<div class="abs cred">Foto: Senado Federal (CC BY 2.0) · dado: e-Cidadania, 04/11/2026</div>
<div class="abs rod"><span>UI/UX<br>&amp; IA</span><span class="s">⟶</span></div>`),

  // ---- 2. "Se eu fosse… ATENDIMENTO" ----
  '02-se-eu-fosse': pag(`
body{background:radial-gradient(90% 60% at 50% 38%,#0a47ff 0%,#0035D4 55%,#00197A 100%)}
.t1{left:64px;top:84px;font:600 92px/1 var(--fonte-titulo);letter-spacing:-.02em;color:#E9E7DD}
.et{left:56px;top:196px;width:940px;padding:6px 40px 14px;background:#E9E7DD;transform:rotate(-4.2deg);box-shadow:0 14px 40px rgba(0,0,0,.3)}
.et div{font:700 168px/1 var(--fonte-titulo);letter-spacing:-.03em;color:#00197A;text-transform:uppercase}
.cur{left:742px;top:315px}
.pessoa{left:0;bottom:0;width:1080px;height:1000px;background:url(${leo813}) 50% 100%/auto 100% no-repeat;filter:contrast(1.05)}
.mesa{left:0;right:0;bottom:0;height:170px;background:linear-gradient(180deg,#00197A,#000c3d)}
.txt{left:700px;top:470px;width:340px;font:700 40px/1.18 var(--fonte-titulo);color:#fff}
.txt u{text-decoration-thickness:3px;text-underline-offset:6px;color:var(--limao)}
.ap{width:176px;height:176px;border-radius:40px;background:#E9E7DD;display:flex;align-items:center;justify-content:center;box-shadow:0 14px 34px rgba(0,0,0,.35)}
.ap svg{width:96px;height:96px}
.cred{right:50px;bottom:34px;font:500 20px var(--fonte-texto);color:rgba(255,255,255,.65)}`,
`<div class="abs t1">Se eu fosse…</div>
<div class="abs et"><div>designer</div></div>
<svg class="abs cur" width="74" height="96" viewBox="0 0 11 14" shape-rendering="crispEdges"><path d="M0 0h2v1h1v1h1v1h1v1h1v1h1v1h1v1h-3v1h1v3h-2v-3h-1v1h-1v-1h-1V0z" fill="#0D0D0D"/><path d="M1 2h1v7h1V8h1v1h-1v1H3V9H2V8H1z" fill="#fff"/></svg>
<div class="abs pessoa"></div><div class="abs mesa"></div>
<div class="abs txt">de uma agência, estes seriam meus <u>apps preferidos:</u></div>
<div class="abs ap" style="left:230px;top:482px">${icone('claude', '#D97757')}</div>
<div class="abs ap" style="left:96px;top:760px">${icone('figma', '#0D0D0D')}</div>
<div class="abs ap" style="left:812px;top:800px">${icone('blender', '#E87D0D')}</div>
<div class="abs cred">Ícones: Simple Icons (CC0) · marcas dos respectivos donos</div>`),

  // ---- 3. Davi Xavier · azul (FedEx) ----
  '03-davi-azul-fedex': davi({
    topo: 'linear-gradient(180deg,#14229e 0%,#2a3cd6 55%,#3a52f0 100%)', rotulo: 'FEDEX / LANDOR', rcor: '#fff',
    heroi: `<svg class="abs" style="left:110px;top:300px" width="860" height="266" viewBox="0 0 72 22.1"><path d="${'__FED__'}" fill="rgba(255,255,255,.28)"/>__E__</svg>`,
    legenda: 'Lindon Leader, da Landor, desenhou o logo em 1994.', lcor: 'rgba(255,255,255,.8)',
    l1: 'O LOGO DA FEDEX', l2: 'ESCONDE UMA SETA', l3: 'DESDE 1994.', fade: '#0a0a0a'
  }),

  // ---- 4. Davi Xavier · branco (Von Restorff) ----
  '04-davi-branco-restorff': davi({
    topo: 'linear-gradient(180deg,#ffffff 0%,#f4f4f4 100%)', rotulo: 'VON RESTORFF / UX', rcor: '#0035D4',
    heroi: `<div class="abs" style="left:190px;top:170px;width:700px;display:grid;grid-template-columns:repeat(7,1fr);gap:26px">${Array.from({ length: 28 }, (_, i) => `<i style="aspect-ratio:1;border-radius:50%;background:${i === 17 ? '#0035D4' : '#d5d5d5'}"></i>`).join('')}</div>`,
    legenda: 'Efeito Von Restorff: entre itens parecidos, o que destoa é o mais lembrado.', lcor: 'rgba(13,13,13,.62)',
    l1: 'A REGRA DE 1933 QUE', l2: 'DECIDE ONDE VOCÊ', l3: 'CLICA.', fade: '#0a0a0a', branco: true
  }),

  // ---- 5. Capeloci · CLONAR ----
  '05-clonar': pag(`
body{background:#ECEBE5}
body:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.025) 0 2px,transparent 2px 4px)}
.top{left:58px;right:58px;top:46px;display:flex;justify-content:space-between;align-items:center;font:500 24px var(--fonte-texto);color:#222}
.top img{width:42px;height:42px;border-radius:10px;object-fit:cover;margin-right:14px;vertical-align:middle}.top i{font-style:italic}
.t1{left:0;right:0;top:182px;text-align:center;font:500 62px var(--fonte-texto);color:#111;letter-spacing:-.02em}
.gl{left:0;right:0;top:250px;text-align:center;font:700 208px/1.15 var(--fonte-titulo);letter-spacing:-.03em;color:#0035D4;text-shadow:7px 0 0 rgba(182,255,89,.95),-7px 0 0 rgba(77,123,255,.9);-webkit-mask-image:repeating-linear-gradient(0deg,#000 0 5px,rgba(0,0,0,.55) 5px 7px)}
.gl small{font-size:96px;vertical-align:48px;margin:0 6px;letter-spacing:-.1em}
.t2{left:0;right:0;top:545px;text-align:center;font:500 56px/1.18 var(--fonte-texto);color:#111;letter-spacing:-.02em}
.t2 b{font-weight:800;border-bottom:4px solid #111}
.leque{left:0;right:0;top:720px;height:500px}
.c{position:absolute;width:330px;height:412px;border-radius:26px;overflow:hidden;box-shadow:0 22px 40px rgba(0,0,0,.28);background:#000;transform-origin:50% 100%}
.c img{width:100%;height:100%;object-fit:cover}
.arr{right:58px;bottom:48px;font:italic 700 34px var(--fonte-texto);color:#0035D4}`,
`<div class="abs top"><span><img src="${avatar}">@seuperfil</span><i>IA &amp; Design</i></div>
<div class="abs t1">Como eu faço para</div>
<div class="abs gl"><small>&lt;</small>CLONAR<small>&gt;</small></div>
<div class="abs t2">a estrutura de qualquer carrossel<br>usando <b>Claude Code</b></div>
<div class="abs leque">
 <div class="c" style="left:20px;top:110px;transform:rotate(-15deg)"><img src="${slide(5)}"></div>
 <div class="c" style="left:170px;top:62px;transform:rotate(-7deg)"><img src="${slide(2)}"></div>
 <div class="c" style="left:375px;top:20px;width:330px;transform:rotate(0)"><img src="${slide(1)}"></div>
 <div class="c" style="left:590px;top:62px;transform:rotate(7deg)"><img src="${slide(3)}"></div>
 <div class="c" style="left:735px;top:110px;transform:rotate(15deg)"><img src="${slide(7)}"></div>
</div>
<div class="abs arr">arrasta aí</div>`),

  // ---- 6. Capeloci · sobre mim ----
  '06-sobre-mim': pag(`
body{background:#000}
.f{left:-140px;top:-20px;width:1200px;height:1500px;background:url(${A('leo-806.jpg')}) 50% 6%/cover;-webkit-mask-image:linear-gradient(180deg,#000 0%,#000 52%,transparent 80%)}
.gh{left:-300px;top:40px;width:1200px;height:1500px;background:url(${A('leo-806.jpg')}) 50% 6%/cover;filter:blur(22px) brightness(.8);opacity:.38;-webkit-mask-image:linear-gradient(180deg,#000 0%,#000 50%,transparent 78%)}
.top{left:46px;right:46px;top:38px;display:flex;justify-content:space-between;font:500 22px var(--fonte-mono);letter-spacing:.04em;color:rgba(246,246,246,.5);text-transform:uppercase}
.n1,.n2{font:700 28px/1.15 var(--fonte-texto);letter-spacing:.03em;color:var(--limao);text-transform:uppercase}
.n1{left:70px;top:610px;width:360px;transform:rotate(-11deg)}.n2{left:640px;top:790px;width:380px;transform:rotate(9deg)}
.sv{left:0;top:0}
.s1{left:46px;top:1010px;font:500 56px var(--fonte-texto);letter-spacing:-.02em;width:1000px;text-align:center}
.s1 em{color:var(--azul-claro)}
.nome{left:0;right:0;top:1060px;text-align:center;font:700 150px/1 var(--fonte-titulo);letter-spacing:-.035em;color:var(--limao)}
.bio{left:70px;right:70px;top:1235px;text-align:center;font:500 36px/1.25 var(--fonte-texto);letter-spacing:-.01em}
.bio em{color:var(--azul-claro)}`,
`<div class="abs gh"></div><div class="abs f"></div>
<div class="abs top"><span>@seuperfil</span><span>sem IA slop</span></div>
<svg class="abs sv" width="1080" height="1350" viewBox="0 0 1080 1350" fill="none" stroke="#B6FF59" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
 <path d="M790 250 L820 330 L880 285 L860 360 L930 380 L860 420 L895 470 L835 450 L810 505 L790 440 L745 470 L770 400 L715 365 L775 345 Z" opacity=".9"/>
 <path d="M680 705 C700 640 740 650 745 700 C750 725 720 740 700 725"/>
 <path d="M815 735 l12 -22 l8 40 l10 -34"/>
</svg>
<div class="abs n1">Design, IA, estratégia e tecnologia</div>
<div class="abs n2">pra alavancar a sua empresa</div>
<div class="abs s1"><em>[Salve!]</em> Meu nome é</div>
<div class="abs nome">criador</div>
<div class="abs bio">Falo sobre alavancar sua empresa com design, IA, estratégia e tecnologia. Esse é o resumo <em>&lt;sobre mim&gt;</em></div>`)
};


// ================= VERSÃO COM IA (imagem-base gerada com as fotos oficiais; texto/ícones/ornamentos em código) =================
const capasIA = {
  '01-kacio-mei': pag(`
body{background:#03050C}
.foto{inset:0;background:url(${IMG(1)}) 50% 0/cover}
.veu{inset:0;background:linear-gradient(180deg,rgba(3,5,12,.45) 0%,rgba(3,5,12,0) 22%,rgba(3,5,12,0) 46%,rgba(3,5,12,.62) 66%,rgba(3,5,12,.9) 100%)}
.top{left:100px;right:100px;top:96px;display:flex;justify-content:space-between;font:500 24px var(--fonte-texto);letter-spacing:.02em}
.top .c{font-weight:400}
h1{margin:0;left:0;right:0;top:690px;text-align:center;font:700 104px/1 var(--fonte-titulo);letter-spacing:-.025em;color:#fff;text-shadow:0 6px 40px rgba(0,0,0,.35)}
.g{left:0;right:0;top:770px;text-align:center;font:700 330px/.9 var(--fonte-titulo);letter-spacing:-.015em;color:var(--limao);text-shadow:0 10px 60px rgba(0,0,0,.35)}
.card{left:100px;right:100px;top:1048px;padding:26px 44px;border-radius:44px;border:1px solid rgba(255,255,255,.35);background:rgba(120,125,135,.38);backdrop-filter:blur(18px);font:500 36px/1.22 var(--fonte-texto);text-align:center}
.card b{font-weight:800}
.rod{left:100px;right:100px;bottom:42px;display:flex;justify-content:space-between;align-items:flex-end;font:500 24px/1.2 var(--fonte-texto);letter-spacing:.03em}
.rod .s{font-size:48px;line-height:.6}`,
`<div class="abs foto"></div><div class="abs veu"></div>
<div class="abs top"><span>2026</span><span><b>LEONARDO</b> <span class="c">DESIGN &amp; IA</span></span><span>/01</span></div>
<h1 class="abs">Designers no</h1><div class="abs g">MEI?</div>
<div class="abs card">Uma ideia no Senado quer incluir serviços digitais no MEI. <b>19.231 de 20.000 apoios</b> para a meta.</div>
<div class="abs rod"><span>UI/UX<br>&amp; IA</span><span class="s">⟶</span></div>`),

  '02-se-eu-fosse': pag(`
body{background:linear-gradient(180deg,${corTopo(path.join(pasta, 'assets/ia', ESCOLHA[2]))} 0%,${corTopo(path.join(pasta, 'assets/ia', ESCOLHA[2]))} 100%)}
.ph{left:90px;top:225px;width:900px;height:1125px;background:url(${IMG(2)}) 50% 0/900px auto no-repeat;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 14%,#000 86%,transparent 100%),linear-gradient(180deg,transparent 0,#000 16%);-webkit-mask-composite:source-in;mask-composite:intersect}
.t1{left:64px;top:60px;font:600 92px/1 var(--fonte-titulo);letter-spacing:-.02em;color:#F1E9DA}
.et{left:50px;top:166px;width:960px;padding:6px 40px 14px;background:#EFE8D8;transform:rotate(-4.2deg);box-shadow:0 14px 40px rgba(0,0,0,.28)}
.et div{font:700 168px/1 var(--fonte-titulo);letter-spacing:-.03em;color:#0B3B2E;text-transform:uppercase}
.cur{left:742px;top:290px}
.txt{left:735px;top:395px;width:310px;font:700 38px/1.18 var(--fonte-titulo);color:#0B3B2E}
.txt u{text-decoration-thickness:3px;text-underline-offset:6px}
.ap{width:170px;height:170px;border-radius:40px;background:#EFE8D8;display:flex;align-items:center;justify-content:center;box-shadow:0 14px 34px rgba(0,0,0,.3)}
.ap svg{width:92px;height:92px}
.cred{right:50px;bottom:30px;font:500 18px var(--fonte-texto);color:rgba(255,255,255,.7)}`,
`<div class="abs ph"></div><div class="abs t1">Se eu fosse…</div>
<div class="abs et"><div>designer</div></div>
<svg class="abs cur" width="74" height="96" viewBox="0 0 11 14" shape-rendering="crispEdges"><path d="M0 0h2v1h1v1h1v1h1v1h1v1h1v1h1v1h-3v1h1v3h-2v-3h-1v1h-1v-1h-1V0z" fill="#0D0D0D"/><path d="M1 2h1v7h1V8h1v1h-1v1H3V9H2V8H1z" fill="#fff"/></svg>
<div class="abs txt">de uma agência, estes seriam meus <u>apps preferidos:</u></div>
<div class="abs ap" style="left:60px;top:420px">${icone('claude', '#D97757')}</div>
<div class="abs ap" style="left:46px;top:660px">${icone('figma', '#0D0D0D')}</div>
<div class="abs ap" style="left:858px;top:700px">${icone('blender', '#E87D0D')}</div>
<div class="abs cred">Ícones: Simple Icons (CC0) · marcas dos respectivos donos</div>`),

  '03-davi-azul-fedex': daviIA({
    img: IMG(3), recorte: pathToFileURL(recortar(path.join(pasta, 'assets/ia', ESCOLHA[3]))).href, rotulo: 'FEDEX / LANDOR', rcor: '#fff', fundo: 'transparent',
    wm: true, legenda: 'criador mostra a seta do logo desenhado por Lindon Leader em 1994.', lcor: 'rgba(255,255,255,.85)',
    l1: 'O LOGO DA FEDEX', l2: 'ESCONDE UMA SETA', l3: 'DESDE 1994.'
  }),
  '04-davi-branco-restorff': daviIA({
    img: IMG(4), rotulo: 'VON RESTORFF / UX', rcor: '#0035D4', fundo: '#fff', wm: false,
    legenda: 'criador explica: entre itens parecidos, o que destoa é o mais lembrado.', lcor: 'rgba(255,255,255,.85)',
    l1: 'A REGRA DE 1933 QUE', l2: 'DECIDE ONDE VOCÊ', l3: 'CLICA.'
  }),

  '05-clonar': pag(`
body{background:#ECEBE5}
body:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.025) 0 2px,transparent 2px 4px)}
.top{left:58px;right:58px;top:46px;display:flex;justify-content:space-between;align-items:center;font:500 24px var(--fonte-texto);color:#222}
.top img{width:42px;height:42px;border-radius:10px;object-fit:cover;margin-right:14px;vertical-align:middle}.top i{font-style:italic}
.t1{left:0;right:0;top:182px;text-align:center;font:500 62px var(--fonte-texto);color:#111;letter-spacing:-.02em}
.gl{left:0;right:0;top:250px;text-align:center;font:700 208px/1.15 var(--fonte-titulo);letter-spacing:-.03em;color:#0035D4;text-shadow:7px 0 0 rgba(182,255,89,.95),-7px 0 0 rgba(77,123,255,.9);-webkit-mask-image:repeating-linear-gradient(0deg,#000 0 5px,rgba(0,0,0,.55) 5px 7px)}
.gl small{font-size:96px;vertical-align:48px;margin:0 6px;letter-spacing:-.1em}
.t2{left:0;right:0;top:545px;text-align:center;font:500 56px/1.18 var(--fonte-texto);color:#111;letter-spacing:-.02em}
.t2 b{font-weight:800;border-bottom:4px solid #111}
.leque{left:0;right:0;top:720px;height:560px}
.c{position:absolute;width:330px;height:412px;border-radius:26px;overflow:hidden;box-shadow:0 22px 40px rgba(0,0,0,.28);background:#000;transform-origin:50% 100%}
.c img{width:100%;height:100%;object-fit:cover}
.arr{right:58px;bottom:48px;font:italic 700 34px var(--fonte-texto);color:#0035D4}`,
`<div class="abs top"><span><img src="${avatar}">@seuperfil</span><i>IA &amp; Design</i></div>
<div class="abs t1">Como eu faço para</div>
<div class="abs gl"><small>&lt;</small>CLONAR<small>&gt;</small></div>
<div class="abs t2">o estilo de qualquer capa de carrossel<br>usando <b>Claude + IA</b></div>
<div class="abs leque">
 <div class="c" style="left:20px;top:110px;transform:rotate(-15deg)"><img src="${capaIA('06-sobre-mim')}"></div>
 <div class="c" style="left:170px;top:62px;transform:rotate(-7deg)"><img src="${capaIA('02-se-eu-fosse')}"></div>
 <div class="c" style="left:375px;top:20px;transform:rotate(0)"><img src="${capaIA('01-kacio-mei')}"></div>
 <div class="c" style="left:590px;top:62px;transform:rotate(7deg)"><img src="${capaIA('03-davi-azul-fedex')}"></div>
 <div class="c" style="left:735px;top:110px;transform:rotate(15deg)"><img src="${capaIA('04-davi-branco-restorff')}"></div>
</div>
<div class="abs arr">arrasta aí</div>`),

  '06-sobre-mim': pag(`
body{background:#000}
.f{inset:0;background:url(${IMG(6)}) 50% 0/cover}
.gh{left:-300px;top:30px;width:1080px;height:1350px;background:url(${IMG(6)}) 50% 0/cover;filter:blur(22px) brightness(.8);opacity:.4;-webkit-mask-image:linear-gradient(180deg,#000 0%,#000 55%,transparent 85%)}
.veu{inset:0;background:linear-gradient(180deg,rgba(0,0,0,.35) 0%,rgba(0,0,0,0) 18%,rgba(0,0,0,0) 52%,rgba(0,0,0,.92) 80%,#000 100%)}
.top{left:46px;right:46px;top:38px;display:flex;justify-content:space-between;font:500 22px var(--fonte-mono);letter-spacing:.04em;color:rgba(246,246,246,.55);text-transform:uppercase}
.n1,.n2{font:700 27px/1.15 var(--fonte-texto);letter-spacing:.03em;color:var(--limao);text-transform:uppercase}
.n1{left:70px;top:640px;width:340px;transform:rotate(-11deg)}.n2{left:650px;top:820px;width:370px;transform:rotate(9deg)}
.s1{left:46px;top:1000px;font:500 56px var(--fonte-texto);letter-spacing:-.02em;width:1000px;text-align:center}
.s1 em{color:var(--azul-claro)}
.nome{left:0;right:0;top:1050px;text-align:center;font:700 150px/1 var(--fonte-titulo);letter-spacing:-.035em;color:var(--limao)}
.bio{left:70px;right:70px;top:1228px;text-align:center;font:500 36px/1.25 var(--fonte-texto);letter-spacing:-.01em}
.bio em{color:var(--azul-claro)}`,
`<div class="abs gh"></div><div class="abs f"></div><div class="abs veu"></div>
<div class="abs top"><span>@seuperfil</span><span>sem IA slop</span></div>
<svg class="abs" style="left:0;top:0" width="1080" height="1350" viewBox="0 0 1080 1350" fill="none" stroke="#B6FF59" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
 <path d="M830 120 L860 200 L920 155 L900 230 L970 250 L900 290 L935 340 L875 320 L850 375 L830 310 L785 340 L810 270 L755 235 L815 215 Z" opacity=".9"/>
</svg>
<div class="abs n1">Design, IA, estratégia e tecnologia</div>
<div class="abs n2">pra alavancar a sua empresa</div>
<div class="abs s1"><em>[Salve!]</em> Meu nome é</div>
<div class="abs nome">criador</div>
<div class="abs bio">Falo sobre alavancar sua empresa com design, IA, estratégia e tecnologia. Esse é o resumo <em>&lt;sobre mim&gt;</em></div>`)
};
function capaIA(nome) { return pathToFileURL(path.join(pasta, 'capas-ia', `${nome}.png`)).href; }
function daviIA({ img, recorte, rotulo, rcor, fundo, wm, legenda, lcor, l1, l2, l3 }) {
  const fed = readFileSync(path.join(pasta, 'assets', 'fedex-express.svg'), 'utf8');
  const fedPath = fed.match(/<path d="([^"]*)" style="fill:#2a007c"/)[1];
  const pols = [...fed.matchAll(/<polygon points="([^"]*)"/g)].map((m) => m[1]);
  const seta = '46.798,12.337 53.607,12.337 53.607,7.772 59.619,14.528 53.607,21.283 53.607,16.526 46.798,16.526';
  const marca = wm ? `<svg class="abs" style="left:40px;top:250px" width="1000" height="310" viewBox="0 0 72 22.1"><path d="${fedPath}" fill="rgba(255,255,255,.3)"/><polygon points="${pols[1]}" fill="rgba(255,255,255,.3)"/><polygon points="${pols[0]}" fill="rgba(255,255,255,.3)"/><polygon points="${seta}" fill="#B6FF59" style="filter:drop-shadow(0 0 1px #B6FF59)"/></svg><div class="abs" style="left:0;top:0;width:1080px;height:1350px;background:url(${recorte}) 50% 0/1080px auto no-repeat"></div>` : '';
  return pag(`
body{background:#0a0a0a}
.hero{left:0;right:0;top:0;height:900px;overflow:hidden;background:#fff}
.hero .im{left:0;top:0;width:1080px;height:1350px;background:url(${img}) 50% 0/1080px auto no-repeat}
.fade{left:0;right:0;top:560px;height:350px;background:linear-gradient(180deg,transparent,#0a0a0a 94%)}
.rot{left:60px;top:54px;font:700 48px/1 var(--fonte-titulo);letter-spacing:-.01em;color:${rcor};text-transform:uppercase;z-index:3}
.leg{left:60px;top:738px;width:960px;font:500 26px/1.25 var(--fonte-texto);color:${lcor};z-index:3}
.perf{left:60px;right:60px;top:800px;display:flex;align-items:center;justify-content:center;gap:24px}
.perf .l{flex:1;height:1px;background:rgba(255,255,255,.28)}
.perf .av{width:90px;height:90px;border-radius:50%;border:5px solid var(--limao);background:url(${avatar}) center/cover}
.perf .tx{font:700 34px/1.2 var(--fonte-texto);color:#fff}.perf .tx span{display:block;font:500 28px var(--fonte-texto);color:rgba(255,255,255,.7)}.perf svg{vertical-align:-6px;margin-left:6px}
h1{margin:0;left:0;right:0;top:930px;text-align:center;font:700 80px/1.1 var(--fonte-titulo);letter-spacing:-.005em;word-spacing:.18em;color:#fff;text-transform:uppercase}
h1 em{color:var(--limao);font-style:normal}
.ds{left:0;right:0;bottom:46px;text-align:center;font:700 30px var(--fonte-texto);letter-spacing:.02em;color:#fff}`,
`<div class="abs hero"><div class="abs im"></div></div>${wm ? `<div class="abs" style="left:0;top:0;width:1080px;height:900px;overflow:hidden">${marca}</div>` : ''}<div class="abs fade"></div>
<div class="abs rot">${rotulo}</div><div class="abs leg">${legenda}</div>
<div class="abs perf"><span class="l"></span><div class="av"></div><div class="tx">criador ${selo}<span>@seuperfil</span></div><span class="l"></span></div>
<h1 class="abs">${l1}<br>${l2}<br><em>${l3}</em></h1>
<div class="abs ds">DESLIZE E VEJA &gt;&gt;&gt;</div>`);
}

function davi({ topo, rotulo, rcor, heroi, legenda, lcor, l1, l2, l3, fade, branco }) {
  const fed = readFileSync(path.join(pasta, 'assets', 'fedex-express.svg'), 'utf8');
  const fedPath = fed.match(/<path d="([^"]*)" style="fill:#2a007c"/)[1];
  const pols = [...fed.matchAll(/<polygon points="([^"]*)"/g)].map((m) => m[1]);
  const seta = '46.798,12.337 53.607,12.337 53.607,7.772 59.619,14.528 53.607,21.283 53.607,16.526 46.798,16.526';
  const h = heroi.replace('__FED__', fedPath).replace('__E__', `<polygon points="${pols[1]}" fill="rgba(255,255,255,.28)"/><polygon points="${pols[0]}" fill="rgba(255,255,255,.28)"/><polygon points="${seta}" fill="#B6FF59" style="filter:drop-shadow(0 0 1px #B6FF59)"/>`);
  return pag(`
body{background:#0a0a0a}
.hero{left:0;right:0;top:0;height:880px;background:${topo}}
.fade{left:0;right:0;top:560px;height:340px;background:linear-gradient(180deg,transparent,#0a0a0a 92%)}
.rot{left:60px;top:54px;font:700 48px/1 var(--fonte-titulo);letter-spacing:-.01em;color:${rcor};text-transform:uppercase}
.leg{left:60px;top:700px;width:760px;font:500 27px/1.25 var(--fonte-texto);color:${lcor}}
.perf{left:60px;right:60px;top:788px;display:flex;align-items:center;justify-content:center;gap:24px}
.perf .l{flex:1;height:1px;background:rgba(255,255,255,.28)}
.perf .av{width:90px;height:90px;border-radius:50%;border:5px solid var(--limao);background:url(${avatar}) center/cover}
.perf .tx{font:700 34px/1.2 var(--fonte-texto);color:#fff}.perf .tx span{display:block;font:500 28px var(--fonte-texto);color:rgba(255,255,255,.7)}.perf svg{vertical-align:-6px;margin-left:6px}
h1{margin:0;left:0;right:0;top:920px;text-align:center;font:700 80px/1.1 var(--fonte-titulo);letter-spacing:-.005em;word-spacing:.18em;color:#fff;text-transform:uppercase}
h1 em{color:var(--limao)}
.ds{left:0;right:0;bottom:50px;text-align:center;font:700 30px var(--fonte-texto);letter-spacing:.02em;color:#fff}
i{display:block}`,
`<div class="abs hero"></div>${h}<div class="abs fade"></div>
<div class="abs rot">${rotulo}</div><div class="abs leg">${legenda}</div>
<div class="abs perf"><span class="l"></span><div class="av"></div><div class="tx">criador ${selo}<span>@seuperfil</span></div><span class="l"></span></div>
<h1 class="abs">${l1}<br>${l2}<br><em>${l3}</em></h1>
<div class="abs ds">DESLIZE E VEJA &gt;&gt;&gt;</div>`);
}

const SAIDA = IA ? 'capas-ia' : 'capas';
const conjunto = IA ? capasIA : capas;
mkdirSync(path.join(pasta, SAIDA), { recursive: true });
const b = await chromium.launch();
const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
const feitas = [];
for (const [nome, html] of Object.entries(conjunto).sort(([a], [b]) => (a.startsWith('05') ? 1 : 0) - (b.startsWith('05') ? 1 : 0))) {
  const f = path.join(pasta, SAIDA, `${nome}.png`);
  writeFileSync(path.join(pasta, SAIDA, `.${nome}.html`), html);
  await pg.goto(pathToFileURL(path.join(pasta, SAIDA, `.${nome}.html`)).href, { waitUntil: 'load' });
  await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(500);
  await pg.screenshot({ path: f }); feitas.push(f); console.log(nome);
}
const gr = path.join(pasta, SAIDA, '.prancha.html');
writeFileSync(gr, `<body style="margin:0;padding:14px;background:#161616;display:grid;grid-template-columns:repeat(3,420px);gap:14px">${feitas.map((f) => `<img src="${pathToFileURL(f).href}" style="width:420px;border-radius:8px">`).join('')}</body>`);
await pg.setViewportSize({ width: 3 * 434 + 14, height: 1400 });
await pg.goto(pathToFileURL(gr).href, { waitUntil: 'load' }); await pg.waitForTimeout(400);
await pg.screenshot({ path: path.join(pasta, IA ? 'prancha-ia.png' : 'prancha.png'), fullPage: true });
await b.close();
