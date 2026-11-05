// Capas a partir de imagem de impacto do Pinterest (recriada com IA e o rosto do criador) ou de meme do banco; texto sempre em código.
// Uso: node motor/carrossel/capas-pinterest.mjs <pasta-da-rodada>
// Espera <pasta>/ia/gN-x.png (imagens geradas), <pasta>/memes/*.jpg, <pasta>/assets/*.svg|jpg|png. Escreve <pasta>/capas/NN-nome.png + prancha.png.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { cssMarca } from '../video/legenda.mjs';

const pasta = path.resolve(process.argv[2] || '.');
const U = (rel) => pathToFileURL(path.join(pasta, rel)).href;
const ESCOLHA = { ondas: 'ia/g1-c.png', lounge: 'ia/g2-a.png', multidao: 'ia/g3-b.jpg', piscina: 'ia/g4-b.png' };
const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const acervo = JSON.parse(readFileSync(path.join(raiz, 'conteudo.config.json'), 'utf8')).acervo;
const avatar = pathToFileURL(path.join(acervo, 'Conteudo/Kit Perfil/foto-perfil-ig.jpg')).href;
const selo = readFileSync(path.join(raiz, 'motor/marca/selo-verificado.svg'), 'utf8').replace('<svg', '<svg width="30" height="30"');
const icone = (nome, cor) => readFileSync(path.join(pasta, 'assets', nome + '.svg'), 'utf8').replace('<svg', `<svg width="80" height="80" fill="${cor}"`);
const BASE = `${cssMarca()}*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1350px;overflow:hidden}
body{position:relative;font-family:var(--fonte-texto);color:var(--gelo);-webkit-font-smoothing:antialiased}.abs{position:absolute}em{font-style:normal}b{font-weight:800}
.cx{background:var(--limao);color:var(--preto);padding:0 .18em;border-radius:.08em;box-decoration-break:clone;-webkit-box-decoration-break:clone}`;
const pag = (css, corpo) => `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}${css}</style></head><body>${corpo}</body></html>`;

// Homografia: leva o retângulo w×h para o quadrilátero q (TL, TR, BR, BL) → matrix3d do CSS (papel do meme em perspectiva).
function matrix3d(w, h, q) {
  const src = [[0, 0], [w, 0], [w, h], [0, h]], A = [], B = [];
  src.forEach(([x, y], i) => { const [u, v] = q[i]; A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); B.push(u); A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); B.push(v); });
  for (let c = 0; c < 8; c++) { let p = c; for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r; [A[c], A[p]] = [A[p], A[c]]; [B[c], B[p]] = [B[p], B[c]];
    for (let r = 0; r < 8; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k]; B[r] -= f * B[c]; } }
  const [a, b, c, d, e, f, g, hh] = B.map((v, i) => v / A[i][i]);
  return `matrix3d(${[a, d, 0, g, b, e, 0, hh, 0, 0, 1, 0, c, f, 0, 1].join(',')})`;
}

const capas = {
  // ---- IA: nadar contra a maré (mecanismo Kacio: foto cheia + palavra gigante em acento + cartão de vidro) ----
  '01-ondas-sem-ia': pag(`
body{background:#0b1620}
.f{inset:0;background:url(${U(ESCOLHA.ondas)}) 50% 0/cover}
.v{inset:0;background:linear-gradient(180deg,rgba(3,8,14,.72) 0%,rgba(3,8,14,.45) 28%,rgba(3,8,14,0) 46%,rgba(3,8,14,0) 70%,rgba(3,8,14,.75) 100%)}
.top{left:90px;right:90px;top:70px;display:flex;justify-content:space-between;font:500 24px var(--fonte-texto);letter-spacing:.02em}
h1{margin:0;left:0;right:0;top:132px;text-align:center;font:700 104px/1 var(--fonte-titulo);letter-spacing:-.025em;color:#fff}
.g{left:0;right:0;top:238px;text-align:center;font:700 220px/.9 var(--fonte-titulo);letter-spacing:-.02em;color:var(--limao);text-shadow:0 10px 50px rgba(0,0,0,.35)}
.card{left:100px;right:100px;top:1075px;padding:26px 44px;border-radius:44px;border:1px solid rgba(255,255,255,.35);background:rgba(120,130,140,.34);backdrop-filter:blur(18px);font:500 38px/1.22 var(--fonte-texto);text-align:center}
.rod{left:90px;right:90px;bottom:40px;display:flex;justify-content:space-between;align-items:flex-end;font:500 24px/1.2 var(--fonte-texto);letter-spacing:.03em}.rod .s{font-size:48px;line-height:.6}`,
`<div class="abs f"></div><div class="abs v"></div>
<div class="abs top"><span>2026</span><span><b>LEONARDO</b> IA &amp; DESIGN</span><span>/01</span></div>
<h1 class="abs">Fazer design</h1><div class="abs g">SEM IA?</div>
<div class="abs card">É nadar contra a maré. <b>E a onda não espera ninguém.</b></div>
<div class="abs rod"><span>IA<br>&amp; DESIGN</span><span class="s">⟶</span></div>`),

  // ---- "Se eu fosse… DESIGNER" (etiqueta girada + ícones) — IAs preferidas ----
  '02-se-eu-fosse-ias': pag(`
body{background:#a3dcc3}
.f{inset:0;background:url(${U(ESCOLHA.lounge)}) 50% 100%/cover}
.t1{left:64px;top:70px;font:600 88px/1 var(--fonte-titulo);letter-spacing:-.02em;color:#0B3B2E}
.et{left:48px;top:172px;width:980px;padding:6px 40px 14px;background:#F2EEE3;transform:rotate(-4deg);box-shadow:0 14px 40px rgba(0,0,0,.18)}
.et div{font:700 170px/1 var(--fonte-titulo);letter-spacing:-.03em;color:#0B3B2E;text-transform:uppercase}
.cur{left:770px;top:300px}
.txt{left:640px;top:430px;width:400px;font:700 42px/1.15 var(--fonte-titulo);color:#0B3B2E}
.txt u{text-decoration-thickness:4px;text-underline-offset:7px}
.ap{width:150px;height:150px;border-radius:36px;background:#F2EEE3;display:flex;align-items:center;justify-content:center;box-shadow:0 14px 30px rgba(0,0,0,.18)}
.cred{right:40px;bottom:26px;font:500 18px var(--fonte-texto);color:rgba(11,59,46,.6)}`,
`<div class="abs f"></div><div class="abs t1">Se eu fosse…</div>
<div class="abs et"><div>designer</div></div>
<svg class="abs cur" width="74" height="96" viewBox="0 0 11 14" shape-rendering="crispEdges"><path d="M0 0h2v1h1v1h1v1h1v1h1v1h1v1h1v1h-3v1h1v3h-2v-3h-1v1h-1v-1h-1V0z" fill="#0D0D0D"/><path d="M1 2h1v7h1V8h1v1h-1v1H3V9H2V8H1z" fill="#fff"/></svg>
<div class="abs txt">de uma agência, essas seriam minhas <u>IAs preferidas:</u></div>
<div class="abs ap" style="left:650px;top:650px">${icone('claude', '#D97757')}</div>
<div class="abs ap" style="left:830px;top:650px">${icone('googlegemini', '#4285F4')}</div>
<div class="abs ap" style="left:880px;top:830px">${icone('figma', '#0D0D0D')}</div>
<div class="abs cred">Ícones: Simple Icons (CC0) · marcas dos respectivos donos</div>`),

  // ---- Meme "They're the same picture" (Pam fica; conteúdo do nicho: dois sites "feitos com IA" iguais) ----
  '03-meme-mesmo-site': (() => {
    const W = 1363, H = 1524;
    const site = (titulo) => `<div style="width:600px;height:600px;background:#0b0a1a;font-family:Inter,Arial,sans-serif;position:relative;overflow:hidden">
      <div style="position:absolute;left:-80px;top:-120px;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,#7c3aed 0%,rgba(124,58,237,0) 70%)"></div>
      <div style="position:absolute;right:-120px;top:40px;width:480px;height:480px;border-radius:50%;background:radial-gradient(circle,#2563eb 0%,rgba(37,99,235,0) 70%)"></div>
      <div style="position:absolute;left:34px;right:34px;top:26px;display:flex;justify-content:space-between;font:600 20px Arial;color:#fff"><span>✦ Nexora</span><span style="opacity:.7;font-weight:400">Features · Pricing · Docs</span></div>
      <div style="position:absolute;left:0;right:0;top:150px;text-align:center;font:800 54px/1.05 Arial;color:#fff;letter-spacing:-1px">${titulo}<br><span style="background:linear-gradient(90deg,#a78bfa,#60a5fa);-webkit-background-clip:text;color:transparent">with AI</span></div>
      <div style="position:absolute;left:70px;right:70px;top:290px;text-align:center;font:400 21px/1.35 Arial;color:rgba(255,255,255,.7)">The all-in-one platform to supercharge your workflow.</div>
      <div style="position:absolute;left:190px;top:370px;width:220px;height:58px;border-radius:30px;background:linear-gradient(90deg,#7c3aed,#2563eb);font:700 22px/58px Arial;color:#fff;text-align:center">Get started →</div>
      ${[0, 1, 2].map((k) => `<div style="position:absolute;top:470px;left:${34 + k * 182}px;width:168px;height:110px;border-radius:16px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14)"></div>`).join('')}
    </div>`;
    const papel = (html, q) => `<div class="abs" style="left:0;top:0;width:600px;height:600px;transform-origin:0 0;transform:${matrix3d(600, 600, q)}">${html}</div>`;
    return pag(`
body{background:#0D0D0D}
.top{left:40px;right:40px;top:26px;display:flex;justify-content:space-between;align-items:center;font:500 24px var(--fonte-texto);color:rgba(246,246,246,.75)}
.top img{width:40px;height:40px;border-radius:50%;margin-right:12px;vertical-align:middle}
.meme{left:${(1080 - W * 0.79) / 2}px;top:86px;width:${W}px;height:${H}px;transform-origin:0 0;transform:scale(.79);background:url(${U('memes/same-picture.jpg')}) 0 0/${W}px ${H}px no-repeat}
.tarja{left:150px;right:120px;background:#111;border-radius:6px}
.leg{left:40px;right:40px;text-align:center;font:700 50px/1.16 var(--fonte-texto);color:#FFE600;text-shadow:0 2px 4px rgba(0,0,0,.6)}
.ds{left:0;right:0;bottom:22px;text-align:center;font:700 26px var(--fonte-texto);letter-spacing:.04em;color:rgba(246,246,246,.85)}`,
`<div class="abs top"><span><img src="${avatar}">@seuperfil</span><span>IA &amp; DESIGN</span></div>
<div class="abs meme">
 ${papel(site('Build faster'), [[215, 46], [717, 86], [548, 538], [21, 452]])}
 ${papel(site('Build faster'), [[856, 110], [1366, 172], [1316, 668], [632, 552]])}
 <div class="abs tarja" style="top:650px;height:112px;left:20px;right:20px"></div>
 <div class="abs leg" style="top:648px">O cliente quer que você ache a diferença entre esses dois sites feitos com IA.</div>
 <div class="abs tarja" style="top:1452px;height:64px;left:330px;right:300px"></div>
 <div class="abs leg" style="top:1452px;font-size:54px">São o mesmo site.</div>
</div>
<div class="abs ds">POR QUE TODO SITE DE IA PARECE IGUAL? &gt;&gt;&gt;</div>`);
  })(),

  // ---- Multidão: todo mundo usa a mesma IA (estrutura Davi: herói + faixa de perfil + caixa-alta) ----
  '04-multidao-mesma-ia': pag(`
body{background:#0a0a0a}
.hero{left:0;right:0;top:0;height:900px;background:url(${U(ESCOLHA.multidao)}) 50% -330px/1080px auto no-repeat}
.fade{left:0;right:0;top:600px;height:310px;background:linear-gradient(180deg,transparent,#0a0a0a 92%)}
.rot{left:60px;top:54px;font:700 48px/1 var(--fonte-titulo);color:#fff;text-transform:uppercase;text-shadow:0 4px 20px rgba(0,0,0,.5)}
.leg{left:60px;top:738px;width:960px;font:500 26px/1.25 var(--fonte-texto);color:rgba(255,255,255,.85)}
.perf{left:60px;right:60px;top:800px;display:flex;align-items:center;justify-content:center;gap:24px}
.perf .l{flex:1;height:1px;background:rgba(255,255,255,.28)}
.perf .av{width:90px;height:90px;border-radius:50%;border:5px solid var(--limao);background:url(${avatar}) center/cover}
.perf .tx{font:700 34px/1.2 var(--fonte-texto);color:#fff}.perf .tx span{display:block;font:500 28px var(--fonte-texto);color:rgba(255,255,255,.7)}.perf svg{vertical-align:-6px;margin-left:6px}
h1{margin:0;left:0;right:0;top:915px;text-align:center;font:700 72px/1.1 var(--fonte-titulo);word-spacing:.18em;color:#fff;text-transform:uppercase}
h1 em{color:var(--limao)}
.ds{left:0;right:0;bottom:46px;text-align:center;font:700 30px var(--fonte-texto);letter-spacing:.02em;color:#fff}`,
`<div class="abs hero"></div><div class="abs fade"></div>
<div class="abs rot">IA SLOP / UX</div><div class="abs leg">Efeito Von Restorff: no meio do igual, só o diferente é lembrado.</div>
<div class="abs perf"><span class="l"></span><div class="av"></div><div class="tx">criador ${selo}<span>@seuperfil</span></div><span class="l"></span></div>
<h1 class="abs">TODO MUNDO USA A MESMA IA.<br><em>POR ISSO TUDO</em><br><em>PARECE IGUAL.</em></h1>
<div class="abs ds">DESLIZE E VEJA &gt;&gt;&gt;</div>`),

  // ---- Sobre mim na piscina (mecanismo Capeloci: retrato + rabisco + nome gigante) ----
  '06-sobre-mim-piscina': pag(`
body{background:#000}
.f{inset:0;background:url(${U(ESCOLHA.piscina)}) 50% 0/cover}
.v{inset:0;background:linear-gradient(180deg,rgba(0,0,0,.45) 0%,rgba(0,0,0,0) 14%,rgba(0,0,0,0) 46%,rgba(0,0,0,.78) 68%,rgba(0,0,0,.95) 100%)}
.top{left:46px;right:46px;top:38px;display:flex;justify-content:space-between;font:500 22px var(--fonte-mono);letter-spacing:.04em;color:rgba(246,246,246,.75);text-transform:uppercase}
.n1,.n2{font:700 27px/1.15 var(--fonte-texto);letter-spacing:.03em;color:var(--limao);text-transform:uppercase}
.n1{left:56px;top:250px;width:330px;transform:rotate(-9deg)}.n2{left:700px;top:180px;width:330px;transform:rotate(8deg)}
.s1{left:0;right:0;top:960px;font:500 56px var(--fonte-texto);letter-spacing:-.02em;text-align:center}
.s1 em{color:var(--azul-claro)}
.nome{left:0;right:0;top:1015px;text-align:center;font:700 150px/1 var(--fonte-titulo);letter-spacing:-.035em;color:var(--limao)}
.bio{left:70px;right:70px;top:1195px;text-align:center;font:500 36px/1.25 var(--fonte-texto);letter-spacing:-.01em}
.bio em{color:var(--azul-claro)}`,
`<div class="abs f"></div><div class="abs v"></div>
<div class="abs top"><span>@seuperfil</span><span>sem IA slop</span></div>
<svg class="abs" style="left:0;top:0" width="1080" height="1350" viewBox="0 0 1080 1350" fill="none" stroke="#B6FF59" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
 <path d="M300 380 L325 440 L375 405 L360 465 L420 480 L362 510 L392 552 L342 536 L322 582 L305 528 L268 553 L288 496 L243 468 L292 452 Z"/>
 <path d="M620 300 C700 230 780 260 760 330"/><path d="M748 312 l14 20 l18 -18"/>
</svg>
<div class="abs n1">IA aplicada ao design</div>
<div class="abs n2">trabalho de onde der</div>
<div class="abs s1"><em>[Salve!]</em> Meu nome é</div>
<div class="abs nome">criador</div>
<div class="abs bio">Falo sobre alavancar sua empresa com IA, design, estratégia e tecnologia. Esse é o resumo <em>&lt;sobre mim&gt;</em></div>`)
};

// ---- CLONAR (aprovado em código) com as capas novas no leque — renderizado por último ----
const cap = (n) => U(`capas/${n}.png`);
capas['05-clonar'] = pag(`
body{background:#ECEBE5}
body:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.025) 0 2px,transparent 2px 4px)}
.top{left:58px;right:58px;top:46px;display:flex;justify-content:space-between;align-items:center;font:500 24px var(--fonte-texto);color:#222}
.top img{width:42px;height:42px;border-radius:10px;object-fit:cover;margin-right:14px;vertical-align:middle}.top i{font-style:italic}
.t1{left:0;right:0;top:182px;text-align:center;font:500 62px var(--fonte-texto);color:#111;letter-spacing:-.02em}
.gl{left:0;right:0;top:250px;text-align:center;font:700 208px/1.15 var(--fonte-titulo);letter-spacing:-.03em;color:#0035D4;text-shadow:7px 0 0 rgba(182,255,89,.95),-7px 0 0 rgba(77,123,255,.9);-webkit-mask-image:repeating-linear-gradient(0deg,#000 0 5px,rgba(0,0,0,.55) 5px 7px)}
.gl small{font-size:96px;vertical-align:48px;margin:0 6px;letter-spacing:-.1em}
.t2{left:0;right:0;top:545px;text-align:center;font:500 56px/1.18 var(--fonte-texto);color:#111;letter-spacing:-.02em}
.t2 b{font-weight:800;border-bottom:4px solid #111}
.c{position:absolute;width:330px;height:412px;border-radius:26px;overflow:hidden;box-shadow:0 22px 40px rgba(0,0,0,.28);background:#000;transform-origin:50% 100%}
.c img{width:100%;height:100%;object-fit:cover}
.arr{right:58px;bottom:48px;font:italic 700 34px var(--fonte-texto);color:#0035D4}`,
`<div class="abs top"><span><img src="${avatar}">@seuperfil</span><i>IA &amp; Design</i></div>
<div class="abs t1">Como eu faço para</div>
<div class="abs gl"><small>&lt;</small>CLONAR<small>&gt;</small></div>
<div class="abs t2">o estilo de qualquer capa de carrossel<br>usando <b>Claude + IA</b></div>
<div class="abs" style="left:0;right:0;top:720px;height:560px">
 <div class="c" style="left:20px;top:110px;transform:rotate(-15deg)"><img src="${cap('06-sobre-mim-piscina')}"></div>
 <div class="c" style="left:170px;top:62px;transform:rotate(-7deg)"><img src="${cap('02-se-eu-fosse-ias')}"></div>
 <div class="c" style="left:375px;top:20px"><img src="${cap('01-ondas-sem-ia')}"></div>
 <div class="c" style="left:590px;top:62px;transform:rotate(7deg)"><img src="${cap('03-meme-mesmo-site')}"></div>
 <div class="c" style="left:735px;top:110px;transform:rotate(15deg)"><img src="${cap('04-multidao-mesma-ia')}"></div>
</div>
<div class="abs arr">arrasta aí</div>`);

mkdirSync(path.join(pasta, 'capas'), { recursive: true });
const b = await chromium.launch();
const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
const feitas = [];
for (const [nome, html] of Object.entries(capas)) {
  const h = path.join(pasta, 'capas', `.${nome}.html`), f = path.join(pasta, 'capas', `${nome}.png`);
  writeFileSync(h, html); await pg.goto(pathToFileURL(h).href, { waitUntil: 'load' });
  await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(500);
  await pg.screenshot({ path: f }); feitas.push(f); console.log(nome);
}
const gr = path.join(pasta, 'capas', '.prancha.html');
const ordem = [...feitas].sort();
writeFileSync(gr, `<body style="margin:0;padding:14px;background:#161616;display:grid;grid-template-columns:repeat(3,420px);gap:14px">${ordem.map((f) => `<img src="${pathToFileURL(f).href}" style="width:420px;border-radius:8px">`).join('')}</body>`);
await pg.setViewportSize({ width: 3 * 434 + 14, height: 1400 });
await pg.goto(pathToFileURL(gr).href, { waitUntil: 'load' }); await pg.waitForTimeout(400);
await pg.screenshot({ path: path.join(pasta, 'prancha.png'), fullPage: true });
await b.close();
