// T-011/T-012 — montagem de um vídeo a partir de vários RAW. Refs: US-009, AC-013, AC-014, AC-015
//
// montagem.json {
//   videos: [{ id, titulo, raws: [nome], cortes: [{ nome, ini, fim, frase }], correcoes?: { errado: certo } }],
//   descartados: [{ nome, motivo }],
//   pendentes?: [nome]     RAW ainda sem análise (não renderiza; conta como alocado)
// }
// `nome` é o nome do RAW no inventário (ex.: "IMG_2315"); ini/fim em segundos na fonte.
// A escolha da melhor versão de cada frase é do agente editor (ASM-009); aqui
// a montagem é validada e transformada numa Timeline renderizável.
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { planejarCortes, renderizarCorte, silencios, ajustarAoSilencio, FPS } from './cortar.mjs';
import { validarTimeline } from './timeline.mjs';
import { alinharCortes, literalCortes } from './alinhamento.mjs';
import { transcreverTrechos } from './transcrever.mjs';
import { foraDaCamera } from './olhar.mjs';

export const BASTIDOR = ['volta', 'peraí', 'perai', 'corta', 'gravando', 'vai vir', 'pera aí', 'pera ai']; // 'de novo' saiu: é fala normal ('roda de novo o código')
const SIMILARIDADE_REPETIDA = 0.8;

const normalizar = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
// palavra é do corte quando o meio dela cai dentro dele (o tempo do Whisper erra por décimos nas bordas)
const palavrasDoCorte = (palavras, c) => palavras.filter((p) => (p.ini + p.fim) / 2 >= c.ini - 1e-6 && (p.ini + p.fim) / 2 <= c.fim + 1e-6);

// Fração da fala mais curta contida na outra: pega o começo interrompido de
// uma regravação ("a vercel acaba de" ⊂ "a vercel acaba de liberar…").
// Palavras de ligação não contam: "só que tem um detalhe" não repete uma frase só por ter "que", "tem", "um".
const LIGACAO = new Set('a o as os e é um uma uns umas de do da dos das no na nos nas em por para pra com sem que se nao so ja tem ter ele ela eles elas eu voce te me seu sua isso esse essa este esta ai la mais muito ou mas como quando'.split(' '));
function sobreposicao(a, b) {
  const conteudo = (t) => new Set(t.split(' ').filter((w) => w && !LIGACAO.has(w)));
  const A = conteudo(a), B = conteudo(b);
  if (Math.min(A.size, B.size) < 2) return 0; // mínimo 2 palavras de conteúdo
  const inter = [...A].filter((x) => B.has(x)).length;
  return inter / Math.min(A.size, B.size);
}

// AC-013: cada RAW do inventário aparece em exatamente um vídeo ou nos descartados.
export function validarAgrupamento(montagem, nomesInventario) {
  const erros = [];
  const contagem = new Map(nomesInventario.map((n) => [n, 0]));
  for (const v of montagem.videos) for (const n of v.raws) contagem.set(n, (contagem.get(n) ?? 0) + 1);
  for (const n of montagem.pendentes ?? []) contagem.set(n, (contagem.get(n) ?? 0) + 1);
  for (const d of montagem.descartados ?? []) {
    contagem.set(d.nome, (contagem.get(d.nome) ?? 0) + 1);
    if (!d.motivo) erros.push(`${d.nome}: descartado sem motivo`);
  }
  for (const [n, k] of contagem) {
    if (!nomesInventario.includes(n)) erros.push(`${n}: não existe no inventário`);
    else if (k !== 1) erros.push(`${n}: aparece ${k} vezes (esperado 1)`);
  }
  for (const v of montagem.videos) for (const c of v.cortes) {
    if (!v.raws.includes(c.nome)) erros.push(`${v.id}: corte usa ${c.nome}, que não está nos raws do vídeo`);
  }
  return erros;
}

// AC-014: nenhuma frase repetida e nenhuma fala de bastidor na lista de cortes.
export function validarCortes(video, palavrasPorNome) {
  const erros = [];
  const textos = video.cortes.map((c) => normalizar(palavrasDoCorte(palavrasPorNome[c.nome] ?? [], c).map((p) => p.texto).join(' ')));
  textos.forEach((t, i) => {
    if (!t) erros.push(`${video.id} corte ${i}: sem fala`);
    for (const b of BASTIDOR) if (` ${t} `.includes(` ${b} `)) erros.push(`${video.id} corte ${i}: fala de bastidor "${b}"`);
    for (let j = 0; j < i; j++) {
      if (t && sobreposicao(t, textos[j]) >= SIMILARIDADE_REPETIDA) erros.push(`${video.id} corte ${i}: repete o corte ${j}`);
    }
  });
  return erros;
}

// AC-015: lista de cortes (vários RAW) -> Timeline única. Pausas longas dentro de
// cada corte são encurtadas com a mesma regra da T-003.
// silencios (opcional): por corte, os silêncios medidos no áudio; com eles os respiros
// saem e a pausa máxima cai para 0,22 s (ritmo das referências).
// Aberturas de frase que viram ladainha quando se repetem entre cortes seguidos ("Isso porque…", "E aí…").
// A 1ª ocorrência fica; nas seguintes a abertura sai e a frase começa direto no conteúdo.
export const ABERTURAS = [['isso', 'porque'], ['e', 'aí'], ['e', 'ai'], ['então'], ['entao'], ['basicamente'], ['e', 'isso'], ['aí'], ['ai']];
const semAcento = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
export function tirarAberturaRepetida(palavras, vistas) {
  for (const ab of ABERTURAS) {
    const k = ab.map(semAcento).join(' ');
    if (palavras.length > ab.length && ab.every((w, i) => semAcento(palavras[i].texto) === semAcento(w))) {
      if (vistas.has(k)) return palavras.slice(ab.length);
      vistas.add(k); return palavras;
    }
  }
  return palavras;
}

// Recomeços dentro de um corte: "isso porque toda vez o Claude roda… isso porque toda vez o Claude Code roda de novo…".
// Lê a fala LITERAL (alinhar.py modo literal; o Whisper funde as tentativas numa frase limpa) e, quando um trecho
// recomeça com as mesmas palavras de uma tentativa anterior, a tentativa anterior sai e fica só a última, a que
// foi concluída. Repetição de propósito ("cada conexão, cada mensagem… e cada conexão de arquitetura") não é
// recomeço: a tentativa anterior precisa estar quase toda contida no começo da nova (contenção ≥ 50%).
const semAcentoLit = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
function distancia(a, b) {
  const d = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = d[0]; d[0] = i;
    for (let j = 1; j <= b.length; j++) { const t = d[j]; d[j] = Math.min(d[j] + 1, d[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1)); diag = t; }
  }
  return d[b.length];
}
// grafia do modo literal é aproximada ("diversas"/"diversos", "chama"/"chame"): parecidas ≥ 60%; palavra curta só igual
const parecidas = (a, b) => a === b || (Math.min(a.length, b.length) >= 3 && 1 - distancia(a, b) / Math.max(a.length, b.length) >= 0.6);
function comumEmOrdem(A, B) {
  const m = Array.from({ length: A.length + 1 }, () => new Array(B.length + 1).fill(0));
  for (let i = 1; i <= A.length; i++) for (let j = 1; j <= B.length; j++) m[i][j] = parecidas(A[i - 1], B[j - 1]) ? m[i - 1][j - 1] + 1 : Math.max(m[i - 1][j], m[i][j - 1]);
  return m[A.length][B.length];
}

// literal: [{texto, ini, fim}] do corte; devolve { trechos: [{ini, fim}] a manter, recomecos: [{ini, fim, texto}] removidos }.
export function tirarRecomecos(literal, corte, { pausaFrase = 0.6 } = {}) {
  const w = literal.map((p) => ({ ...p, n: semAcentoLit(p.texto) })).filter((p) => p.n);
  const n = w.length, cortesFonte = []; // intervalos [ini, fim) na fonte que saem
  let base = 0;
  for (let j = 1; j < n; j++) {
    for (let i = base; i <= j - 2; i++) {
      let k = 0; while (i + k < j && j + k < n && parecidas(w[i + k].n, w[j + k].n)) k++;
      const forte = w.slice(j, j + k).some((p) => p.n.length >= 4);
      if (!((k >= 2 && forte) || k >= 3)) continue;
      const A = w.slice(i, j).map((p) => p.n), B = w.slice(j, j + A.length + 3).map((p) => p.n);
      if (comumEmOrdem(A, B) / A.length < 0.5) continue;
      // enumeração ("como você vai enviar os arquivos, como você vai enviar as referências"): mesmo começo, final
      // diferente. No recomeço o fim da tentativa abandonada reaparece na nova ou ela para numa palavra solta
      // ("…estão seclan e"); se a última palavra de conteúdo não volta e a última é palavra de conteúdo, é enumeração e fica.
      const rabo = A.slice(k).filter((a) => a.length >= 5).slice(-1); // última palavra de conteúdo
      if (rabo.length && A.at(-1).length >= 4 && !rabo.some((a) => B.some((b) => parecidas(a, b)))) continue;
      // a tentativa abandonada começa no início da frase de i (volta enquanto não há pausa de frase)
      let s = i; while (s > base && w[s].ini - w[s - 1].fim < pausaFrase) s--;
      const ini = s > 0 ? (w[s - 1].fim + w[s].ini) / 2 : corte.ini;
      const fim = (w[j - 1].fim + w[j].ini) / 2;
      cortesFonte.push({ ini, fim, texto: w.slice(s, j).map((p) => p.texto).join(' ') });
      base = j; break;
    }
  }
  const trechos = []; let ini = corte.ini;
  // pedaço antes de um recomeço com menos de 4 palavras é rabo de outra tentativa ("…plano de"): sai junto
  const palavrasEntre = (a, b) => w.filter((p) => p.ini >= a && p.fim <= b + 0.05).length;
  for (const c of cortesFonte) { if (c.ini - ini > 0.25 && palavrasEntre(ini, c.ini) >= 4) trechos.push({ ini, fim: c.ini }); ini = Math.max(ini, c.fim); }
  if (corte.fim - ini > 0.25) trechos.push({ ini, fim: corte.fim });
  const r3 = (x) => Math.round(x * 1000) / 1000;
  return { trechos: trechos.map((t) => ({ ini: r3(t.ini), fim: r3(t.fim) })), recomecos: cortesFonte.map((c) => ({ ...c, ini: r3(c.ini), fim: r3(c.fim) })) };
}

export function timelineDaMontagem(video, inventarioPorNome, { silencios: sils = null, alinhadas = null, fora = null } = {}) {
  const segmentos = [];
  const saidaPalavras = [];
  const todasPalavras = [];
  let acumulado = 0;
  const aberturas = new Set();
  for (const [ci, c] of video.cortes.entries()) {
    const item = inventarioPorNome[c.nome];
    // tempos alinhados (wav2vec2) quando existem; senão os do Whisper
    let palavras = alinhadas?.[ci] ?? palavrasDoCorte(item.palavras, c);
    // bastidor pela imagem (lendo roteiro / sem rosto): palavra cujo meio cai num trecho fora da câmera sai
    if (fora?.[ci]?.length) palavras = palavras.filter((p) => !fora[ci].some((j) => (p.ini + p.fim) / 2 >= j.ini && (p.ini + p.fim) / 2 <= j.fim));
    if (!palavras.length) continue;
    palavras = tirarAberturaRepetida(palavras, aberturas);
    if (sils) palavras = ajustarAoSilencio(palavras, sils[ci] || []);
    const t = planejarCortes(palavras, item.duracao, sils ? { fonte: item.arquivo, pausaMaxima: 0.18, folga: 0.06, silencios: sils[ci] || [] } : { fonte: item.arquivo });
    // a borda de início escolhida pelo editor manda: a folga em volta da 1ª palavra não pode trazer fala de antes
    const borda = Math.ceil(c.ini * FPS - 1e-6) / FPS;
    if (t.segmentos[0] && t.segmentos[0].ini < borda && t.segmentos[0].fim > borda) {
      const corte = borda - t.segmentos[0].ini; t.segmentos[0] = { ...t.segmentos[0], ini: borda };
      t.saida.duracao = Math.round((t.saida.duracao - corte) * 1000) / 1000;
      t.saida.palavras = t.saida.palavras.map((p) => ({ ...p, ini: Math.max(0, Math.round((p.ini - corte) * 1000) / 1000), fim: Math.max(0, Math.round((p.fim - corte) * 1000) / 1000) }));
    }
    for (const s of t.segmentos) segmentos.push({ ...s, fonte: item.arquivo });
    const corrigir = (texto) => {
      const nucleo = texto.replace(/[.,!?;:]+$/, '');
      return (video.correcoes?.[nucleo] ?? nucleo) + texto.slice(nucleo.length);
    };
    for (const p of t.saida.palavras) saidaPalavras.push({ ...p, texto: corrigir(p.texto), ini: p.ini + acumulado, fim: p.fim + acumulado });
    todasPalavras.push(...palavras);
    acumulado += t.saida.duracao;
  }
  // "%" solto vira parte do número ("100 %" → "100%"); se o alinhador pôs uma palavra no meio
  // ("100 entender %"), ela volta para antes do número, que é como foi falado.
  for (let i = saidaPalavras.length - 1; i > 0; i--) {
    if (saidaPalavras[i].texto !== '%') continue;
    const n = /^\d/.test(saidaPalavras[i - 1].texto) ? i - 1 : i >= 2 && /^\d/.test(saidaPalavras[i - 2].texto) ? i - 2 : -1;
    if (n < 0) continue;
    const num = { ...saidaPalavras[n], texto: saidaPalavras[n].texto + '%', fim: saidaPalavras[i].fim };
    if (n === i - 2) { const meio = saidaPalavras[i - 1]; num.ini = Math.max(num.ini, meio.fim); saidaPalavras.splice(n, 3, { ...meio, ini: saidaPalavras[n].ini }, num); }
    else saidaPalavras.splice(n, 2, num);
  }
  // emenda de cortes: palavra depois de fim de frase começa com maiúscula
  saidaPalavras.forEach((p, i) => {
    if (i === 0 || /[.!?]$/.test(saidaPalavras[i - 1].texto)) p.texto = p.texto.charAt(0).toUpperCase() + p.texto.slice(1);
  });
  return {
    fonte: segmentos[0]?.fonte ?? '',
    duracaoFonte: acumulado,
    palavras: todasPalavras,
    segmentos,
    saida: { duracao: Math.round(acumulado * 1000) / 1000, palavras: saidaPalavras },
  };
}

// CLI: node motor/video/montagem.mjs <montagem.json> <pastaInventario> <pastaSaida> [--proxy] [--video <id>]
// Valida a montagem inteira; renderiza todos os vídeos ou só o de --video.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  // prioridade baixa: o Mac continua responsivo durante o render (filhos — ffmpeg, Chrome, Python — herdam)
  try { (await import('node:os')).setPriority(10); } catch {}
  const args = process.argv.slice(2);
  const proxy = args.includes('--proxy');
  const iv = args.indexOf('--video');
  const soVideo = iv >= 0 ? args[iv + 1] : null;
  const [montagemJson, pastaInv, pastaSaida] = args.filter((a, i) => a !== '--proxy' && i !== iv && i !== iv + 1);
  const montagem = JSON.parse(await readFile(montagemJson, 'utf8'));
  // Cada RAW inventariado tem seu <nome>.json (o indice.json só existe ao fim do inventário).
  const nomes = (await readdir(pastaInv)).filter((a) => a.endsWith('.json') && a !== 'indice.json').map((a) => a.slice(0, -5));
  const inv = Object.fromEntries(await Promise.all(nomes.map(async (n) => [n, JSON.parse(await readFile(join(pastaInv, `${n}.json`), 'utf8'))])));
  const palavrasPorNome = Object.fromEntries(Object.entries(inv).map(([n, i]) => [n, i.palavras]));
  const erros = [
    ...validarAgrupamento(montagem, Object.keys(inv)),
    ...montagem.videos.flatMap((v) => validarCortes(v, palavrasPorNome)),
  ];
  if (erros.length) { console.error('montagem inválida:\n- ' + erros.join('\n- ')); process.exit(1); }
  await mkdir(resolve(pastaSaida), { recursive: true });
  for (const v of montagem.videos.filter((x) => !soVideo || x.id === soVideo)) {
    // margem de 0,4 s fora do corte: acha o silêncio onde a última/primeira palavra realmente termina/começa
    const sils = []; for (const c of v.cortes) sils.push(await silencios(inv[c.nome].arquivo, Math.max(0, c.ini - 0.4), c.fim + 0.4)); // um por vez: leve para o Mac
    // recomeços: fala literal de cada corte → só a última tentativa de cada frase fica, retranscrita sozinha
    const literal = await literalCortes(v.cortes.map((c) => ({ arquivo: inv[c.nome].arquivo, ini: c.ini, fim: c.fim })));
    const pedacos = [];
    for (const [ci, c] of v.cortes.entries()) {
      const { trechos, recomecos } = tirarRecomecos(literal[ci], c);
      if (!recomecos.length) { pedacos.push({ ci, arquivo: inv[c.nome].arquivo, ini: c.ini, fim: c.fim, palavras: palavrasDoCorte(inv[c.nome].palavras, c) }); continue; }
      console.log(`  ✂ corte ${ci} (${c.frase || ''}): ${recomecos.map((r) => `"${r.texto}"`).join(', ')} → tentativa interrompida, fica a última`);
      for (const t of trechos) pedacos.push({ ci, arquivo: inv[c.nome].arquivo, ...t, margem: 0.1, retranscrever: true });
    }
    for (const arquivo of new Set(pedacos.filter((p) => p.retranscrever).map((p) => p.arquivo))) { // um Whisper por RAW
      const lote = pedacos.filter((p) => p.retranscrever && p.arquivo === arquivo);
      (await transcreverTrechos(arquivo, lote)).forEach((ps, i) => { lote[i].palavras = ps.filter((p) => (p.ini + p.fim) / 2 >= lote[i].ini && (p.ini + p.fim) / 2 <= lote[i].fim); });
    }
    const usados = pedacos.filter((p) => p.palavras.length);
    const refinadas = await alinharCortes(usados);
    // o alinhador ouve 0,4 s antes do corte; se ali tem fala, ele estica a 1ª palavra por cima dela e esse resto
    // entra no áudio. A borda escolhida pelo editor manda: 1ª palavra não começa antes, última não passa muito do fim.
    refinadas.forEach((ps, k) => { const { ini, fim } = usados[k]; if (!ps.length) return;
      ps[0] = { ...ps[0], ini: Math.max(ps[0].ini, ini) }; const u = ps.length - 1; ps[u] = { ...ps[u], fim: Math.min(ps[u].fim, fim + 0.12) };
      ps.forEach((p, i) => { if (p.fim < p.ini) ps[i] = { ...p, fim: p.ini }; }); });
    const alinhadas = v.cortes.map((_, ci) => usados.flatMap((p, k) => (p.ci === ci ? refinadas[k] : [])));
    // olhar:false no corte = a imagem desse trecho vai ficar coberta por tela cheia; a fala não sai pelo detector de olhar
    const fora = []; for (const c of v.cortes) fora.push(c.olhar === false ? [] : await foraDaCamera(inv[c.nome].arquivo, c.ini, c.fim)); // um por vez
    fora.forEach((js, i) => { if (js.length) console.log(`  ⚠ corte ${i} (${v.cortes[i].frase || ''}): fora da câmera em ${js.map((j) => j.ini.toFixed(1) + '–' + j.fim.toFixed(1) + 's').join(', ')} → removido`); });
    const timeline = timelineDaMontagem(v, inv, { silencios: sils, alinhadas, fora });
    const errosT = validarTimeline(timeline);
    if (errosT.length) throw new Error(`${v.id}: ${errosT.join('; ')}`);
    const saida = join(pastaSaida, `${v.id}${proxy ? '-proxy' : ''}.mp4`);
    await writeFile(saida.replace(/\.mp4$/, '.timeline.json'), JSON.stringify(timeline, null, 2));
    await renderizarCorte(timeline, saida, { proxy });
    console.log(`✔ ${v.id} — ${v.titulo}: ${timeline.saida.duracao.toFixed(1)}s, ${v.cortes.length} cortes de ${v.raws.length} RAW → ${saida}`);
  }
}
