# Spec: Vídeo

> feature: video
> status: rascunho

## Contexto

Trilho dedicado ao vídeo (separado do carrossel): Reels/Shorts 9:16 e YouTube longo 16:9. Edita as gravações brutas do criador e gera motion/b-roll na identidade dele, consultando `Base/MARCA.md` e `Base/referencias-video.md`, com crítica de quadros antes de entregar.

## Histórias

### US-004 — Editar vídeo vertical a partir da gravação bruta

Como criador, quero entregar uma gravação bruta e receber o vídeo vertical editado, para publicar no Reels e no Shorts sem editar na mão.

#### AC-005 — Corte com legenda e cards

- **Dado** uma gravação em `Conteudo/Videos-verticais/RAW/` e um estilo escolhido em `Base/referencias-video.md`
- **Quando** eu peço a edição
- **Então** recebo um MP4 9:16 sem silêncios longos (nenhuma pausa acima de 0,7 s), com legenda sincronizada à fala e cards de b-roll no estilo escolhido

#### AC-006 — Identidade da base aplicada

- **Dado** um vídeo editado
- **Quando** eu assisto
- **Então** legendas e cards usam Satoshi/Clash Display e só cores da paleta de `Base/MARCA.md`, e nenhum texto fica fora da área segura do Reels

### US-005 — Motion na identidade

Como criador, quero vinhetas, transições e b-roll animados gerados em código, para ter acabamento de motion design sem After Effects.

#### AC-007 — Motion renderizado quadro a quadro sem quadros mortos

- **Dado** uma cena de motion pedida
- **Quando** ela é renderizada (HTML + Playwright + ffmpeg)
- **Então** o relatório de crítica mostra todas as cenas com nota de pelo menos 8/10 e nenhum trecho maior que 1 s sem movimento que não esteja marcado como pausa intencional

### US-006 — Exportação por plataforma

Como criador, quero exportar no formato certo de cada plataforma, para subir sem erro.

#### AC-008 — Export limpo

- **Dado** um vídeo aprovado
- **Quando** eu exporto
- **Então** recebo MP4 H.264 yuv420p bt709 1080x1920 com áudio, verificado por ffprobe

#### AC-010 — Prévia aprovada antes do render final

- **Dado** uma edição proposta
- **Quando** os cortes e a legenda ficam prontos
- **Então** recebo uma prévia leve (baixa resolução) e o render final só acontece depois do meu OK

### US-007 — Capa e telas com o criador como persona

Como criador, quero capas e algumas telas do vídeo com uma cena do tema em que eu sou o personagem, para a capa vender o assunto no primeiro olhar.

#### AC-009 — Cena do tema com o rosto do criador

- **Dado** o tema do vídeo (ex.: marketing do golfe) e as fotos de referência em `Fotos-alta-resolucao/`
- **Quando** eu peço a capa
- **Então** recebo 2 opções de imagem 1080x1920 com uma cena ligada ao tema em que o rosto é reconhecivelmente o do criador, geradas via OpenRouter só depois de eu aprovar o custo estimado, com o título adicionado em código (nunca pela IA)

### US-008 — Pinterest como pesquisador de referências para a geração

Como criador, quero que cada imagem ou frame gerado (vídeo e carrossel) parta de referências pesquisadas no Pinterest e nas minhas pastas de referência, para a geração seguir um estilo real e não um visual genérico de IA.

#### AC-011 — Moodboard de referências antes de gerar

- **Dado** um tema e uma peça a gerar (capa, frame de vídeo ou slide)
- **Quando** eu peço a geração
- **Então** antes de chamar o OpenRouter existe um moodboard salvo no projeto com 6 a 12 referências do Pinterest e das pastas de referência (link ou caminho de cada uma) e um resumo de estilo que vai no prompt

### US-009 — Entender o acervo bruto e montar o vídeo a partir de vários RAW

Como criador, quero que todos os RAW sejam analisados (áudio e quadros) para descobrir de que vídeo cada um faz parte, em que ordem entram e qual a melhor versão de cada frase, para receber uma prévia já montada com a parte boa e sem repetições.

#### AC-012 — Inventário de todo RAW

- **Dado** a pasta `Conteudo/Videos-verticais/RAW/`
- **Quando** eu rodo o inventário
- **Então** cada RAW tem transcrição com tempo por palavra, duração, data de gravação e uma prancha de quadros em `Conteudo/Videos-verticais/Inventario/`, e um RAW já inventariado não é reprocessado

#### AC-013 — Agrupamento dos RAW por vídeo

- **Dado** o inventário completo
- **Quando** o agrupamento roda
- **Então** existe um mapa em que cada RAW aparece em exatamente um vídeo (ou como descartado, com motivo), com a ordem dos RAW dentro de cada vídeo

#### AC-014 — Melhor versão de cada frase, sem repetição

- **Dado** um vídeo com frases regravadas várias vezes
- **Quando** a montagem é gerada
- **Então** cada frase do roteiro aparece uma única vez na lista de cortes, usando a versão escolhida (completa e sem tropeço), e falas de bastidor ("volta", "peraí") não entram

#### AC-015 — Prévia montada de vários RAW

- **Dado** uma lista de cortes que mistura trechos de RAW diferentes
- **Quando** eu peço a prévia
- **Então** recebo um MP4 único na ordem da lista, com legenda sincronizada ao vídeo montado

### US-010 — Card que respeita o rosto

Como criador, quero que o card nunca tampe meu rosto, para o vídeo não perder a conexão com quem assiste.

#### AC-016 — Card desvia do rosto

- **Dado** um vídeo montado e um card a exibir
- **Quando** a prévia é renderizada
- **Então** em nenhum quadro amostrado a caixa do card se sobrepõe à caixa do rosto detectado

## Fora de escopo

- Carrossel (trilho `carrossel`).
- Publicação automática, thumbnail do YouTube, calendário e banco de ideias.
- YouTube longo 16:9 — depois do vertical (Q-005).
- Vídeo gerado por IA (OpenArt) — feature própria depois; aqui só imagem de capa/tela via OpenRouter.

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| ASM-005 | Estilo padrão é E1 (rosto + card de b-roll) | aberta | — |
| ASM-006 | Transcrição local (Whisper) para gerar legendas | aberta | — |
| ASM-007 | ffmpeg será instalado no Mac (hoje não existe) | aberta | — |
| ASM-009 | Na fase atual, agrupar RAW e escolher a melhor versão de cada frase é feito pelo agente Claude lendo o inventário (vira chamada de LLM automatizada ao produtizar) | aberta | — |
| ASM-008 | Motor de motion é HTML + seek(t) + Playwright (sem Remotion) | aberta | — |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| Q-005 | O vídeo longo do YouTube entra já neste trilho ou só depois do vertical? | respondida | Só vertical primeiro |
| Q-006 | Música de fundo: banco próprio, gerada ou nenhuma? | aberta | — |
| Q-007 | Cortes automáticos podem ir direto ou você aprova uma prévia antes? | respondida | Prévia leve antes; render final após OK |
| Q-008 | Qual modelo de imagem no OpenRouter e qual teto de custo por capa? | aberta | — |
| Q-009 | Como acessar o Pinterest (a busca exige login)? | respondida | Pinterest é o pesquisador principal de referências (T-009), via navegador logado |
