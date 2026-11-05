# Variações de UI — mesma identidade, pele diferente a cada vídeo

Pedido do criador (2026-10-31): "variar os designs da UI mantendo o padrão, mudando um pouco a UI sem perder a identidade".
Estudo feito nas pastas `Referencias Edições:Estilos de Videos (variações)/` (13 vídeos) e `Referencias Motions/` (24 vídeos).

## O que NUNCA muda (identidade)
- Cores: azul `#0035D4`, limão `#B6FF59` (palavra-chave), gelo `#F6F6F6`, noite `#03050C` e derivados de `marca.css`.
- Fontes da marca (título + mono); legenda mono caixa-alta fixa no centro-baixo (y≈1430).
- Esqueleto do vídeo: gancho com a imagem mais viral (tela dividida/recorte), inserts ancorados na fala, REC na virada, CTA de comentário.

## O que varia (a "pele" da UI)
Cada vídeo escolhe **um tema** no `plano-a.json` (`"tema": "..."`). O tema troca 4 coisas, sempre juntas:
**moldura** dos cards/mídias · **fundo** animado das telas · **título/etiqueta** · **entrada** (transição).

| Tema | De onde vem (referência) | Moldura | Fundo | Título/etiqueta | Entrada |
|---|---|---|---|---|---|
| **vidro** (atual) | fabianocarvalhojr (UI escura), Motion_inspiration Glass | vidro escuro com brilho azul por dentro | horizonte + ASCII | pílula de vidro flutuante + tag mono com quadrado limão | zoom 1,12→1 + desfoque |
| **editorial** | leobeckerdesign "01 Escolha um estilo", LBK Media House, LBKMAG | quadro de borda fina (2 px) sobre papel gelo, mídia recortada reta | papel gelo com granulação leve; contador "02 / 10" no canto | número grande "01" em azul + título pesado em noite; rodapé mono com metadados | corte seco + linha que se desenha |
| **linha** | hairline (ilustrações lineares, bilíngue), Harvey (bonecos e cards em traço branco) | cards em traço 2 px gelo/azul, sem preenchimento | noite com grade de pontos | rótulo mono em caixa com borda, legenda dupla (PT + termo em inglês menor) | traço que se desenha (stroke) |
| **bloco** | DOO "BLUE BOX", LBKMAG cubos | placas 3D (CSS 3D) com faces azul/vidro, sombra longa | degradê gelo→cinza com luz lateral | tipografia leve grande, lista empilhada à esquerda | rotação 3D curta + assentar com mola |
| **pilha** | antes/depois (cards de celular), "Editado/Bruto", pilha PIN | mockups de celular/cartões empilhados com leve rotação e sombra | cinza claro liso ou noite | rótulos manuscritos curtos (antes/depois, passo 1) | cartão entra por cima da pilha |
| **colagem** | Samir (fotos com fita, círculo marcador, pastas), "mas a boa NOTÍCIA" | polaroid/papel com fita, círculo de marcador em limão | textura de papel/grade | título recortado em blocos | encaixe com tremida (stop-motion) |

Variações de tipografia cinética que valem para qualquer tema (uma por vídeo, no máximo):
- **roleta**: lista vertical desfocada passando, item ativo com seta "→" (ref. MI "Ads/Content/Ranking").
- **lupa**: palavra revelada dentro de um círculo que passa por cima de palavras apagadas (ref. soulmatevisuals).

## Regras de uso
1. **Nunca repetir o tema do vídeo anterior.** O tema de cada vídeo fica anotado em `Producao/<id>/plano-a.json`.
2. O tema combina com o assunto: notícia/ferramenta de IA → vidro, linha ou bloco; design/criativo → editorial ou colagem; antes/depois e passo a passo → pilha.
3. O eco do estilo do assunto (regra de 2026-10-31) continua: entra principalmente no gancho, por cima do tema.
4. Só código; nada de frame reaproveitado das referências.

## Ordem de construção
1. `editorial` e `linha` (mais distantes do vidro atual, só CSS/canvas).
2. `bloco` (CSS 3D).
3. `pilha` e `colagem`.

## Repertório de componentes (telas de insert) — 2026-10-31
Todos funcionam nos 3 temas prontos (vidro, editorial, linha). Revisar o desenho de todos de uma vez:
`node motor/render/catalogo.mjs <pasta> [imagem] [--temas …] [--tipos …]`.

| Tipo | Para quê | Props principais |
|---|---|---|
| `terminal` | ferramenta de dev, comando de instalação | `linhas` (`$` comando digita, `✓` saída em destaque), `janela`, `tag`, `titulo` |
| `chat` | app de mensagem, agente respondendo | `mensagens: [{de: 'eu'\|'outro', texto}]`, `app` |
| `notificacao` | aviso, lançamento, alerta | `app`, `assunto`, `texto`, `icone`, `hora` |
| `passos` | passo a passo 1→2→3 | `itens`, `ritmo` (s entre passos) |
| `celular` | print de app/site dentro de um iPhone | `src`, `foco`, `rolagem`, `credito` |
| `antesdepois` | comparação | `antes`/`depois`: `{src}` ou `{texto}`, `rotulos` |
| `roleta` | lista passando até parar numa palavra | `itens`, `ativo` (índice) |
| `lupa` | revelar a palavra-chave entre outras | `palavras`, `alvo` |
| `polaroid` | foto de pessoa/objeto com marcador | `src`, `legenda`, `circulo: [x, y, raio]` (frações) |
| `cubo` | objeto 3D com 4 palavras | `faces` |
| `blocos` | lista de recursos em bento com luz interna (ref. 01) | `itens: [{texto, cor: azul\|claro\|gelo\|limao\|noite, textura: binario\|grade\|feixes\|curva}]` |
| `led` | palavra/ícone em matriz de LED de glifos (ref. 02) | `texto`, `colunas` |
| `iso` | ecossistema: cubo central aceso + laterais em traço (ref. 03) | `centro`, `esquerda`, `direita`, `progresso` |
| `progresso` | pílulas com barra gel e valor (ref. 06/14/15) — só valor real | `itens: [{rotulo, valor, texto?}]` |
| `etapas` | widget "3 de 5" com checks (ref. 16) | `nome`, `etapas`, `atual`, `status` |
| `botao` | botão de vidro com halo e clique (ref. 17) | `texto`, `clique` (s) |
| já existiam | `tipografia`, `midia`, `cena`, `logos`, `grafo`, `editorial`, `ui`, `clip` | ver `motor/render/visual.mjs` |

Opções de qualquer insert: `dividido` (tela dividida), `recorte` (pessoa recortada por cima da imagem), `flash`,
`fundo: pontos|hud|planta`, `tratamento: duotone`, `grao: true` (ver `Base/texturas-design.md`).
