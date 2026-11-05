// Cria a estrutura padrão do acervo (mídias fora do git). Uso: node motor/criar-acervo.mjs <pasta-do-acervo>
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
const raiz = process.argv[2]; if (!raiz) { console.error('uso: node motor/criar-acervo.mjs <pasta-do-acervo>'); process.exit(2); }
const pastas = ['Identidade', 'Conteudo/Personagem/referencias', 'Conteudo/Personagem/oficial', 'Conteudo/Kit Perfil', 'SFX Audio',
  'Conteudo/Videos/RAW', 'Conteudo/Videos/Producao', 'Conteudo/Videos/Previas', 'Conteudo/Videos/Finalizados', 'Conteudo/Videos/Engenharia Reversa', 'Conteudo/Videos/Pesquisa Funil',
  'Conteudo/Carrossel', 'Conteudo/Imagens', 'Conteudo/Estudos', 'Conteudo/Clientes'];
for (const p of pastas) mkdirSync(path.join(raiz, p), { recursive: true });
const leia = path.join(raiz, 'LEIA-ME.txt');
if (!existsSync(leia)) writeFileSync(leia, `Acervo do motor de conteúdo (mídias fora do git).
Identidade/            fontes (ClashDisplay_Complete/Fonts/WEB/fonts, Satoshi_Complete/...), logos, paleta
Conteudo/Personagem/   fotos reais do rosto (referencias/) e ficha aprovada (oficial/) para geração com IA
Conteudo/Kit Perfil/   foto de perfil e prints do perfil
SFX Audio/             efeitos sonoros (catálogo do plano de som)
Conteudo/Videos/       RAW → Producao/<id> → Previas → Finalizados; Engenharia Reversa; Pesquisa Funil
Conteudo/Carrossel/    uma pasta por carrossel (roteiro, slides, prancha, legenda)
Conteudo/Imagens/      imagens geradas (com o prompt e a referência usada)
Conteudo/Clientes/     uma pasta por cliente → uma por peça (briefing, copy.json, handoff, revisão, anotações)
`);
console.log('acervo criado em', raiz, '→ aponte conteudo.config.json → "acervo" para esta pasta');
