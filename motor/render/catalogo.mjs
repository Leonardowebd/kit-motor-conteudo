// Catálogo do repertório: cada tela de insert (visual.mjs + telas-extra.mjs) em cada tema de UI, num quadro já assentado.
// Uso: node motor/render/catalogo.mjs <pastaSaida> [imagemExemplo] [--temas vidro,editorial,linha] [--tipos chat,terminal]
// Saída: <pasta>/<tema>/<tipo>.png e <pasta>/catalogo-<tema>.png (folha com todos). Só para revisão de design.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import ffmpeg from 'ffmpeg-static';
import { paginaFormatoA } from './formato-a.mjs';
import { TEMAS } from './temas.mjs';

const args = process.argv.slice(2);
const opc = (n) => { const i = args.indexOf(n); return i >= 0 ? args.splice(i, 2)[1] : null; };
const temas = (opc('--temas') || Object.keys(TEMAS).join(',')).split(',');
const soTipos = opc('--tipos')?.split(',');
const [pasta, img] = args;
if (!pasta) { console.error('uso: node motor/render/catalogo.mjs <pastaSaida> [imagemExemplo] [--temas a,b] [--tipos x,y]'); process.exit(1); }
const foto = img ? pathToFileURL(path.resolve(img)).href : '';

// conteúdo de exemplo (fictício, só para ver o desenho — nunca vai para vídeo)
const EXEMPLOS = {
  terminal: { tag: 'no terminal', titulo: 'Instala em 1 linha', linhas: ['$ npx free-claude-code', 'baixando provedores…', '✓ conectado ao DeepSeek'] },
  chat: { tag: 'no seu app', titulo: 'Manda mensagem', app: 'AKG', mensagens: [{ de: 'eu', texto: 'resume meu dia?' }, { de: 'outro', texto: '3 reuniões e 1 entrega às 18h' }, { de: 'eu', texto: 'valeu!' }] },
  notificacao: { app: 'GitHub', assunto: 'Novo release', texto: 'v2.0 está no ar com suporte a agentes', tag: 'aviso', titulo: 'Chegou atualização' },
  passos: { tag: 'em 3 passos', titulo: 'Como usar', itens: ['Clona o repo', 'Pega a chave', 'Roda no terminal'] },
  celular: { tag: 'no celular', titulo: 'O app por dentro', src: foto, credito: 'Fonte: exemplo' },
  antesdepois: { tag: 'resultado', titulo: 'Antes e depois', antes: { texto: 'site genérico' }, depois: { src: foto } },
  roleta: { tag: 'serve para', itens: ['Design', 'Código', 'Vídeo', 'Agentes'], ativo: 3 },
  lupa: { tag: 'o segredo é', palavras: ['ideia', 'código', 'design', 'tempo', 'prompt', 'agente', 'dados'], alvo: 'prompt' },
  polaroid: { tag: 'quem fez', titulo: 'O dev por trás', src: foto, legenda: 'o criador', circulo: [0.5, 0.42, 0.22] },
  cubo: { tag: 'tudo junto', titulo: 'Uma skill só', faces: ['IA', 'Design', 'Código', 'Dados'] },
  tipografia: { palavra: 'R$ 0', tag: 'custo', cor: 'limao' },
  midia: { src: foto, tag: 'no GitHub', titulo: 'Repositório oficial', credito: 'Fonte: exemplo', foco: 0.1 },
  grafo: { tag: 'seus prompts vão para', titulo: 'LLMs gratuitas', rotulos: ['DeepSeek', 'Kimi', 'GLM'], semente: 7 },
  blocos: { tag: 'o que ele faz', titulo: '', itens: [{ texto: 'Várias contas', cor: 'claro', textura: 'curva' }, { texto: 'n8n', cor: 'azul' }, { texto: 'Figurinhas', cor: 'limao', textura: 'feixes' }, { texto: 'Envio em massa', cor: 'noite', textura: 'binario' }, { texto: 'Respostas automáticas', cor: 'azul', textura: 'grade' }] },
  led: { texto: 'WA', tag: 'no seu próprio app' },
  iso: { centro: 'WA-AKG', esquerda: 'WhatsApp', direita: 'n8n', tag: 'conecta tudo', titulo: 'Um painel só' },
  progresso: { tag: 'envio seguro', titulo: 'Intervalo aleatório', itens: [{ rotulo: 'entre mensagens', valor: 60, texto: '10–30 s' }, { rotulo: 'lote 1', valor: 100 }, { rotulo: 'lote 2', valor: 45 }] },
  etapas: { tag: 'automático', nome: 'WA-AKG', etapas: ['Conectar', 'Painel', 'Respostas', 'Envio', 'n8n'], atual: 3, status: 'Configurando respostas…' },
  botao: { texto: 'Conectar WhatsApp', tag: 'é só isso' },
  'tipografia+planta': { _tipo: 'tipografia', _ins: { fundo: 'planta' }, palavra: 'Processo', tag: 'confie no' },
  'grafo+hud': { _tipo: 'grafo', _ins: { fundo: 'hud' }, tag: 'conexões', titulo: 'Fluxo de bots', rotulos: ['WhatsApp', 'n8n', 'CRM'], semente: 4 },
  'midia+duotone': { _tipo: 'midia', _ins: { tratamento: 'duotone' }, src: foto, tag: 'tratamento', titulo: 'Duotone azul', credito: 'Fonte: exemplo', foco: 0.1 },
};
const tipos = Object.keys(EXEMPLOS).filter((t) => !soTipos || soTipos.includes(t));
const T = 2.4; // quadro já assentado

const b = await chromium.launch();
try {
  const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const tema of temas) {
    await mkdir(path.join(pasta, tema), { recursive: true });
    for (const tipo of tipos) {
      const html = path.join(pasta, tema, `${tipo}.html`);
      const { _tipo, _ins = {}, ...props } = EXEMPLOS[tipo];
      await writeFile(html, paginaFormatoA({ palavras: [], destaques: [], eventos: { inserts: [{ tipo: _tipo || tipo, props, ..._ins, ini: 0, fim: 4 }], rec: null, cta: null }, trs: [], tema }));
      await pg.goto(pathToFileURL(html).href); await pg.evaluate(() => document.fonts.ready);
      await pg.evaluate((x) => window.seek(x), T);
      await pg.screenshot({ path: path.join(pasta, tema, `${tipo}.png`) });
    }
    // folha: 7 por linha, 270×480 cada
    const ent = tipos.flatMap((t) => ['-i', path.join(pasta, tema, `${t}.png`)]);
    const por = 7, linhas = Math.ceil(tipos.length / por);
    const esc = tipos.map((_, i) => `[${i}]scale=270:480[s${i}]`);
    const fil = [...Array(linhas)].map((_, l) => { const ids = tipos.map((_, i) => i).slice(l * por, l * por + por); while (ids.length < por) ids.push(null);
      return ids.map((i, k) => (i === null ? `color=black:s=270x480:d=1[v${l}_${k}]` : `[s${i}]null[v${l}_${k}]`)).join(';') + `;${ids.map((_, k) => `[v${l}_${k}]`).join('')}hstack=${por}[l${l}]`; });
    const fc = [...esc, ...fil, linhas > 1 ? `${[...Array(linhas)].map((_, l) => `[l${l}]`).join('')}vstack=${linhas}[o]` : '[l0]null[o]'].join(';');
    execFileSync(ffmpeg, ['-nostdin', '-y', '-loglevel', 'error', ...ent, '-filter_complex', fc, '-map', '[o]', '-frames:v', '1', path.join(pasta, `catalogo-${tema}.png`)]);
    console.log(`✔ ${tema}: ${tipos.length} telas → ${path.join(pasta, `catalogo-${tema}.png`)}`);
  }
} finally { await b.close(); }
