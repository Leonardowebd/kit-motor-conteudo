---
tipo: pericia
data: 2026-10-31
status: vigente
refs: [US-004, AC-005, US-005]
---
# Perícia quadro a quadro — referências de edição (B-roll, cortes, legenda)

> Fonte: 16 MP4 em `Conteudo/Videos/Referencias Edições:Estilos de Videos (variações)/` (13), `Conteudo/Carrossel/referencias/realskytan-*.mp4` (2), `<acervo>` (1).
> Pranchas (quadro a cada 0,5 s, 8 colunas, tempo no canto): `Conteudo/Videos/Pericia/prancha-<arquivo>.jpg` (acervo, fora do git).
> Método: ffprobe (metadados); ffmpeg `select='gt(scene,X)',showinfo` com X=0,3 e X=0,1 (trocas < 0,25 s fundidas); mlx_whisper large-v3-turbo com timestamps por palavra; leitura visual de todas as pranchas. Tempos de plano lidos na prancha têm resolução ±0,25 s.
> ATENÇÃO detector: em layout dividido (card em cima, rosto embaixo) a troca do card muda só metade do quadro e o `scene>0.3` NÃO a detecta. Para esses vídeos a contagem de trocas abaixo vem da prancha, não do detector.

## 0. Correções ao índice `Base/referencias-video.md`
| Item do índice | Observado |
|---|---|
| E4 "Personagem estilizado (eusoier)" | `eusoier-post-De1-Yb0AbaK.mp4` é **E1** (rosto embaixo + card ilustrado de UI em cima). O personagem pixel/voxel aparece em `fabianocarvalhojr-post-DexOI-vHb8s.mp4` (card ilustrado com bonecos voxel) e no LBKMAG (`fabianocarvalhojr-post-De70JVjDzy--0{2,3}`). |
| E3 "leobeckerdesign 01 Escolha um estilo" | Arquivo é `fabianocarvalhojr-post-De70JVjDzy--02.mp4` (e `--03` = "02 Motion design com 1 prompt"). |
| E5 "UI escura, legenda mono caixa-alta" | Bate com `fabianocarvalhojr-post-Dexi2rrkgtO.mp4` (49 s), mas o layout é o mesmo de E1 (dividido 50/50). E5 = E1 com cards escuros + legenda mono. |
| raycfu | Card NÃO é faixa separada: rosto ocupa a tela inteira (plano médio, fundo claro) e o card flutua sobre a região 20–45 % da altura (sobre a parede/cabeça). |

## 1. Metadados e cortes (todos)
| Arquivo | Dur (s) | Res | fps | Áudio | Estilo | Trocas de quadro (método) | Trocas/min | Plano médio (s) |
|---|---|---|---|---|---|---|---|---|
| raycfu-post-DeZRVmkvhiR | 54,7 | 1440x2560 | 30 | fala EN | E1 | 46 (detector 0,1) / ~40 cards (prancha) | 50 | 1,16 (mediana 1,10) |
| fabianocarvalhojr-post-Dexi2rrkgtO | 49,0 | 1080x1920 | 30 | fala PT | E1/E5 | ~32 (prancha) | ~39 | ~1,5 |
| fabianocarvalhojr-post-DexOI-vHb8s | 29,9 | 1080x1920 | 30 | fala PT | E1 (card ilustrado voxel) | ~18 (prancha) | ~36 | ~1,7 |
| eusoier-post-De1-Yb0AbaK | 37,0 | 1080x1920 | 30 | fala PT | E1 (card ilustração linha) | ~20 (prancha; detector viu 10) | ~32 | ~1,8 |
| leobeckerdesign-post-DemFzHpTbCH | 13,5 | 1080x1920 | 30 | fala PT | E1 | 7 (prancha) | ~31 | ~1,9 |
| leobeckerdesign-post-DdC9a_qt3s4 | 57,8 | 1080x1920 | 60 | música | E3 (notícia, mídia em quadro) | 30 (detector 0,1) | 31 | 1,86 (mediana 1,30) |
| fabianocarvalhojr-post-De70JVjDzy--02 | 20,0 | 1080x1350 | 30 | sem áudio | E3 | 16 | 48 | 1,17 (mediana 0,83) |
| fabianocarvalhojr-post-De70JVjDzy--03 | 15,9 | 1080x1350 | 30 | sem áudio | E3 | 2 (+ anima contínua) | 8 | 5,3 |
| danieldalen-post-DL9lz8xh0Qf | 36,0 | 1080x1920 | 24 | fala EN | E2 | 26 | 43 | 1,33 (mediana 0,96) |
| danieldalen-post-DCN96qsSP_9 | 14,7 | 1080x1920 | 25 | música | E2 | 15 (corte a cada ~0,9 s, na batida) | 61 | 0,92 |
| danieldalenshorts-post-C_PBG_wMxs1 | 11,6 | 1080x1920 | 30 | música | E2 (colagem) | 8 | 41 | 1,29 |
| danieldalen-post-DP2llClgUTa | 14,9 | 1080x1920 | 30 | fala EN (pouca) | E2 (plano único) | 0 | 0 | 14,9 |
| danieldalen-post-Dewb2QJBofi | 25,4 | 1080x608 | 25 | fala EN | E2 (plano único) | 0 | 0 | 25,4 |
| leobeckerdesign-post-DeXOmZyHOCD-01 | 7,1 | 1024x1280 | 30 | sem áudio | slide animado (carrossel) | 0 | 0 | — |
| realskytan-post-DexfsH5l0q6-01 | 5,0 | 720x900 | 30 | sem áudio | slide animado (carrossel) | 0 | 0 | — |
| realskytan-post-DexfsH5l0q6-05 | 5,0 | 1080x1350 | 30 | sem áudio | slide animado: grade 7x4 de miniaturas preenchendo "Month 1..6 of 6", coluna vencedora com contorno laranja | 0 | 0 | — |

Os 3 últimos não são edição de vídeo falado (animação de slide de carrossel); medidos só em metadados.

---

## 2. raycfu-post-DeZRVmkvhiR (E1 — referência de formato e processo)
- Layout: rosto plano médio tela cheia, fundo claro (parede branca + planta). Card arredondado (raio ~3 % da largura, sombra suave, largura ~92 %) sobre 20–45 % da altura. Rosto nunca sai.
- Título gancho 0–8 s: 3 linhas serifadas brancas no topo (y 8–20 %), 1 palavra-chave com fundo amarelo ("motion design", "Claude Opus 5.5"). Some quando o 1º card ocupa a área.
- Legenda: serifada branca com sombra, 2 linhas, ~4–6 palavras por bloco, centro y ≈ 60 %, altura de linha ~3,5 % da altura. Sem cor de destaque na legenda (o destaque está no título).
- Trocas de card: ~40 em 54,7 s; card dura 0,5–3 s (típico 1,0–1,5 s). Entra com mola (escala+opacidade, ~6–8 quadros), sai por corte seco ou é empurrado pelo próximo.
- A-roll limpo (sem card) só em 4 janelas: ~9,5–10 s ("Here's exactly how you build it"), ~19,5 s, ~35,5–37 s ("This next part is the real secret"), ~52–54 s (CTA). Regra: frase de virada/anúncio = rosto sozinho.

| t (s) | Card (tipo) | Fala no momento (palavra-chave) |
|---|---|---|
| 0–2,5 | título serif (motion tipográfico) | "Most people don't realize…" |
| 2,5–4,5 | grid de vídeos de motion (UI/print) | "AI motion graphics videos all over your feed" |
| 4,5–6 | xícara 3D / abstrato laranja (B-roll gerado) | "a **studio** that you set up once" |
| 6–7,5 | card "$2100/month" verde (UI em código) | "paying **$2,000 to $3,000**" (entra ~0,9 s antes do número) |
| 7,5–9 | logo "MOTION" glitch, "CLAUDE" (texto em código) | "these videos / how you build it" |
| 10,5–12 | UI de terminal/editor claro | "headless render engine loop system" |
| 12,5–13 | forma borrada (gráfico) | "Claude does not make a video" |
| 13–15 | código pintando frame | "writes code that **paints every single frame**" |
| 15–17 | logos Node → FFmpeg → Playwright, um por palavra | "Install **Node, FFmpeg, and Playwright**" (1 card por substantivo, ~0,5 s cada) |
| 17–19 | seletor de modelo "Opus 5.5" (UI) | "Claude **Opus 5.5** set on extra high" |
| 20–23,5 | tira de quadros / montagem → MP4 | "captures **every frame**… **stitches** them… final **MP4**" |
| 23,5–26 | referências de landing (UI real) | "give it a **reference** in real assets" |
| 26–29 | landing "cyber" com degradê, depois borrada | "all-caps centered text on a **gradient**… AI slop" |
| 29–31 | painel de configuração de mola + curva | "real **spring physics**" |
| 31–33 | código CSS | "**Ban basic CSS**… close-form springs" |
| 33–35 | animação escura laranja/vermelha | "makes the UI look good" |
| 35–36 | UI de síntese de som + onda | "synthesize the **sound**… lock every cut to the **beat**" |
| 37–43 | painéis de quadros com barras de nota (vermelho→verde) | "watch his own **frames** and critique… **8 out of 10**" |
| 44–45 | cards de passos (guia) | "DIY step-by-step **guide**" |
| 47,5–52 | palavra "MOTION" amarela sobre a cabeça | "comment **Motion**" (palavra-gatilho do CTA) |

## 3. fabianocarvalhojr-post-Dexi2rrkgtO (E1/E5 — 49 s)
- Layout dividido 50/50: card de UI escura em cima (0–50 % da altura, fundo #111-ish), rosto embaixo com luz ciano/verde no fundo. Legenda **mono caixa-alta branca**, 2–4 palavras, na costura (y ≈ 49–51 %), pequena (~2 % da altura). Em tela cheia de rosto a legenda desce para y ≈ 78 %.
- Rosto tela cheia (sem card) = pergunta retórica e CTA: 21,4–23,5 s, 43–43,5 s, 45,5–49 s. Fim: texto grande "CÓDIGO DA LEGENDA" (grotesk bold branco, y ≈ 20 %) sobre o rosto.
- B-roll (card) ocupa ~80 % do tempo; ~32 trocas; card dura 0,5–4 s, mediana ~1,5 s. Trocas detectadas pelo detector (0,3) só nas mudanças de layout: 5,3 / 21,4 / 23,7 / 28,9 / 31,7 / 36,0 / 43,2 / 45,5 s.

| t (s) | Card | Fala (palavra; tempo whisper) |
|---|---|---|
| 0–1,5 | carteirinha de estudante (objeto em código) | "**Estudantes** agora" (0,0) |
| 1,5–3 | contadores "0 0 0" girando | "**4 meses**" (1,44) |
| 3–5,3 | selo "ChatGPT Plus" | "do **ChatGPT Plus**" (3,28) — entra 0,3 s antes |
| 5,3–6 | calendário outubro | "só tem até…" (5,58) |
| 6–8 | card "31 outubro — último dia" | "**31 de outubro**" (6,48) — 0,5 s antes |
| 8–9,5 | barra 99,9 % | "fez **99,9 %**" (8,72) — 0,7 s antes |
| 9,5–13,5 | grade ARC (quadrados azul/vermelho) animando | "no **ARC**-AGI 3" (10,02) |
| 13,5–15 | painel "fazer um plano" + grade | "fazer um **plano**" (13,98) |
| 15–17,5 | barra "modelo anterior 7,8 %" | "**modelo anterior** só fez **7,8 %**" (15,38/16,56) |
| 17,5–20 | tabelas "dados reais" → órbita "simulação" | "**ciência de dados reais** e **simulações**" |
| 20–21,4 | gráfico de barras "quase 3x" | "**quase 3 vezes** melhor" (20,36) |
| 21,4–23,5 | ROSTO TELA CHEIA | "Então qual é a melhor forma…?" |
| 23,5–28,5 | UI ChatGPT → logos conectando → plugins → busca → login | "**Abre o ChatGPT, conecta… 3 cliques… plugins… login**" (passo a passo, 1 tela por verbo) |
| 29–31,5 | rascunhos → mão desenhando em tablet → personagem 3D | "dois **rascunhos** feitos **à mão** viram **simulação**" |
| 32–33 | grade 6 fotos ruins | "**seis fotos** ruins" (32,18) |
| 33,5–35,5 | escritório 3D com movimento | "reconstrói o **cômodo em 3D**" |
| 36–39 | planta de fazenda linha → render | "**planta** completa de uma **fazenda**" |
| 39–40,5 | UI Blender | "**AutoCAD** e no **Blender**" |
| 40,5–43 | interior realista (tour) → portfólio | "**tour realista** pro seu **portfólio**" |
| 43,5–45,5 | card "Estudantes elegíveis: Período integral / Meio período" | "**período integral** e de **meio período**" |
| 45,5–49 | rosto + "CÓDIGO DA LEGENDA" | CTA "comenta o código da legenda" |

## 4. fabianocarvalhojr-post-DexOI-vHb8s (E1, card ilustrado voxel — 29,9 s)
- Dividido 50/50: cena ilustrada (quarto, bonecos voxel, objetos) em cima; rosto embaixo. Faixa de título fixa no topo do card (mono caixa-alta pequena). Legenda **serifada branca 1–3 palavras sobre caixa vermelho-escuro** na costura (y ≈ 47 %), palavra a palavra.
- Card presente 100 % do tempo (0–30 s); cena ilustrada não corta, **anima dentro** (mesmo cenário, objeto novo entra) — ~18 eventos.

| t (s) | Evento no card | Fala |
|---|---|---|
| 0–2,5 | boneco voxel no PC, contador "0000" | "Se você faz vibe code… não esteja aprendendo nada" |
| 2,5–4,5 | folha de prova com "?" entra | "a **Anthropic testou**" (3,08) |
| 4,5–6,5 | placar "67 / 50" contando | "**Desenvolvedores** que programam com IA" |
| 6,5–7,5 | carimbo "-17 PONTOS" | "tiraram **17 %**" (6,88) — 0,4 s antes |
| 7,5–10 | card "PROVA SURPRESA — o que isso faz?" | "em uma **prova** sobre **código**" (8,04) — 0,5 s antes |
| 10–13 | barra crescendo + lâmpada + check | "ficaram fazendo **perguntas**… **aprenderam muito mais**" |
| 13,3–16,8 | oficina, tag "GRÁTIS" | "construiu um **plugin gratuito**" (14,54/15,06) |
| 16,8–18,7 | quadro "VIBEWISE" | "Se chama **Vibewise**" (17,12) |
| 18,7–20,8 | balão "Como você construiria?" | "o Claude **pergunta como você construiria**" |
| 20,8–22,1 | balança PRÓS/CONTRAS | "**prós e contras**" (21,68) |
| 22,1–23,9 | terminal com texto + check | "explica **o que ele mudou**" |
| 24–27,2 | lâmpada, checklist com checks | "**aprender** o que você está fazendo de fato" |
| 27,2–30 | cena noturna, caixa de comentário digitando "código da legenda" | CTA "comenta o **código da legenda**" (27,9) |

## 5. eusoier-post-De1-Yb0AbaK (E1, ilustração de linha + UI — 37 s)
- Dividido ~45/55: card em cima (fundo branco 0–5 s; fundo preto 5,4–31 s com ilustração branca de traço e cards de UI brancos), rosto embaixo (selfie de celular, quarto com luz magenta). Legenda: grotesk bold branca 1–3 palavras, palavra-chave em **caixa branca com texto preto**, na costura (y ≈ 46–50 %).
- 31–37 s: rosto tela cheia + barra de busca/comentário no topo (PiP, y ≈ 10 %) digitando "HARVEY" = CTA.

| t (s) | Card | Fala |
|---|---|---|
| 0–5,4 | janela "Claude Code" + 5 bonecos de linha surgindo | "time de vendas… **5 agentes**" (2,98) |
| 5,4–8,7 | boneco no PC → card "Mensagem" → envelope | "**escrevem um e-mail**… **enviam**" |
| 9–10,5 | logo "Harvey" + 3 ícones | "Ele se chama **Harvey**" (9,06) |
| 10,8–12,5 | formulário "você vende / pra quem" preenchendo | "o que você **vende**, pra **quem**" |
| 13–15 | mapa com lupa e pinos | "sai **caçando o cliente**" (13,98) |
| 15,5–19,5 | card de aprovação + cursor clicando "Aprovar envio" | "**revisar**… **aprovar o envio**" (18,42) |
| 19,5–20,3 | toast "Oi! Me conta mais?" | "quando alguém **responde**" (19,92) |
| 20,3–27,5 | painel/tabela de leads atualizando, linha destacada | "cai tudo num **painel**… hora exata… interessado" |
| 28–31 | card repositório "projeto aberto" + `git clone` digitando | "O **projeto é aberto**… pode **instalar**" |
| 31–37 | rosto cheio + campo de comentário "HARVEY" | CTA "comenta **Harvey**" |

## 6. leobeckerdesign-post-DemFzHpTbCH (E1 — 13,5 s)
- Dividido ~45/55: card em cima (ilustração isométrica de linha verde/laranja sobre fundo verde-escuro, depois prints do GitHub), rosto embaixo (fundo laranja/verde, microfone). Legenda **mono caixa-alta em caixa preta**, PT em cima + EN em itálico embaixo, na costura (y ≈ 42 %).
- Gancho 0 s: ilustração já animando + legenda "UMA SKILL MUITO BOA". CTA 11,3–13 s: rosto tela cheia, "COMENTA / **HAIRLINE**" (grotesk caixa-alta, palavra-gatilho em laranja, y ≈ 68–75 %), punch-in final no rosto (13 s, mão na boca).

| t (s) | Card | Fala |
|---|---|---|
| 0–1 | bandeja isométrica de linha | "Uma **skill** muito boa" |
| 1–2,5 | trilho isométrico animando | "pra criar esse tipo" |
| 2,5–3,5 | blocos/cidade isométrica | "de **ilustrações lineares**" (2,94) |
| 3,5–4,5 | grade de pontos animando | "**animadas**" (4,5) |
| 4,5–5,5 | print GitHub "hairline Public" (zoom) | "falando da **Hairline**" (5,04) |
| 5,5–8 | página do repo descendo (scroll), README | "uma skill… pra qualquer **agente de AI**" |
| 8–11,3 | galeria de ilustrações (página demo) | "pelo **Lucas Marques**… **GitHub**" |
| 11,3–13,5 | rosto + CTA tipográfico | "**Comenta Hairline**" |

## 7. leobeckerdesign-post-DdC9a_qt3s4 (E3/notícia sem rosto — 57,8 s, música)
- Fundo verde-escuro texturizado fixo; título de notícia fixo no topo (grotesk bold, linha 1 vermelha "ChatGPT Images 2.5:", linhas 2–3 brancas), y 3–12 %. Mídia (vídeo oficial do produto) num quadro 16:9 com borda fina vermelha, y 14–26 % (na escala da prancha), créditos pequenos embaixo. 30 trocas de mídia, mediana 1,3 s, cortes seguem a montagem do vídeo de origem (UI de prompt → imagem gerada, pessoas, produto).
- Mecanismo: layout congelado + só a mídia troca (= E3). Sem legenda; texto do título carrega a informação.

## 8. fabianocarvalhojr-post-De70JVjDzy--02 / --03 (E3 LBKMAG — slides de carrossel animados, sem áudio)
- Fundo creme `~#F7F1E6`; número vermelho grande "01"/"02" (serifa); título preto grotesk bold 2 linhas; parágrafo 3 linhas; mídia 16:9 cantos levemente arredondados (y ≈ 50–80 %); rodapé com métricas pequenas; paginação "02 / 10" no topo direito.
- --02: mídia troca a cada 0,8–1,7 s (16 trocas em 20 s), mesmo personagem (bloco laranja) em estilos de filme diferentes. --03: 2 planos longos (0–8 s "soft" 3D; 8–16 s "Neon Drive") com animação contínua dentro.

## 9. danieldalen (E2 — cinemático, 5 arquivos)
- Quadro de vídeo ~4:5 com cantos arredondados centralizado em tela preta 9:16 (barras pretas cima/baixo); texto **serifado pequeno branco entre aspas** no topo (y ≈ 6–8 %, altura ~1,5 %), fixo o vídeo todo (ex.: "you just got lucky" / "the luck:", "creating content is easy").
- `DL9lz8xh0Qf` (36 s, fala): A-roll = falando no carro (ciano). B-roll filmado de ambientes (escritório com vista, quarto com luz azul/vermelha, mão em tubo de neon, cadeira gamer). 26 trocas, mediana 0,96 s; legenda serifada minúscula no centro (y ≈ 55 %); 0–6 s: palavras grandes serifadas cinzas **projetadas no chão da cena** ("Why am I here", "Why am I doing this") = tipografia integrada à cena. B-roll não ilustra o substantivo literal: ilustra o estado ("questioned" → plano de cima no laptop; "deals… millions" → mão no rosto no escritório). Final 33,5–36: logo pequeno + "Good things take time".
- `DCN96qsSP_9` (14,7 s, música): mesmo enquadramento de quarto alternando grade vermelha/fria/azul a cada ~0,9 s (corte na batida); timelapse de trabalho.
- `C_PBG_wMxs1` (11,6 s, música): colagem empilhada de 3 quadros arredondados, cada um com 1 palavra branca sans ("procrastination / wastes / potential"; "discipline / builds / success"); quadros entram um a um a cada ~0,5–0,7 s, saem um a um. Frase lida de cima para baixo = 3 B-rolls.
- `DP2llClgUTa` (14,9 s): plano único fixo, tela 16:9 no meio, frase-título no topo; humor/gesto.
- `Dewb2QJBofi` (25,4 s, 1080x608): plano único com vinheta vermelha; legenda serifada palavra a palavra **dividida à esquerda e à direita da cabeça** na altura dos olhos, acumulando até 3–4 palavras e limpando por frase.

---

## 10. Síntese

### (i) Números por estilo
| Estilo | Vídeos medidos | Trocas de quadro/min | % do tempo com B-roll | Duração típica de 1 B-roll | Posição da legenda (centro, % da altura) | Fonte da legenda |
|---|---|---|---|---|---|---|
| E1 rosto + card (dividido 50/50) | Dexi2, DexOI, eusoier, DemFz | 31–39 | 80–100 % (rosto sempre visível embaixo) | 1,0–2,5 s (mediana ~1,6 s); passo a passo 0,5–1 s por tela | 42–51 % (na costura card/rosto); tela cheia: 75–78 % | mono caixa-alta / serif em caixa / grotesk bold com palavra em caixa |
| E1 rosto + card flutuante (raycfu) | raycfu | ~44 (cards) / 50 (detector) | ~75 % | 1,0–1,5 s (0,5–3 s) | ~60 %, 2 linhas | serif branca com sombra |
| E2 cinemático | DL9, DCN96, C_PBG, DP2ll, Dewb2 | 0 (plano único) ou 41–61 | 50–100 % (B-roll filmado) | 0,6–1,3 s | topo 6–8 % (frase fixa) + centro ~55 % pequeno | serif pequena, aspas |
| E3 editorial (layout fixo, mídia troca) | DdC9a, De70-02, De70-03 | 31–48 (ou 2 planos longos) | 100 % (mídia em quadro) | 0,8–1,9 s | sem legenda; título fixo no topo 3–12 % | grotesk bold + número serif vermelho |
| E4 personagem | — (nenhum vídeo é E4 puro; ver §0) | — | — | — | — | — |
| E5 = E1 com cards UI escura | Dexi2 | ~39 | ~80 % | ~1,5 s | ~50 % | mono caixa-alta |

### (ii) Regras de B-roll (mecanismos verificáveis)
| # | Regra | Evidência |
|---|---|---|
| B1 | **1 B-roll por substantivo/número-chave da frase**; listas viram 1 card por item ("Node, FFmpeg, Playwright"; "abre, conecta, plugins, login"). | raycfu 15–17 s; Dexi2 23,5–28,5 s; eusoier 15,5–19,5 s |
| B2 | **O B-roll entra 0,3–0,9 s ANTES da palavra** (mediana ~0,5 s) e fica até o próximo substantivo-chave. Nunca depois. | Dexi2: 3,0/3,28; 6,0/6,48; 8,0/8,72; 9,5/10,02. DexOI: 6,5/6,88; 7,5/8,04. raycfu: 6,0/6,92 |
| B3 | **Ilustração literal** em E1: número → contador/barra animando até o valor; nome de produto → logo/print da UI real; ação → UI com cursor executando; conceito → cena/objeto. | todas as tabelas E1 |
| B4 | **O quadro muda a cada 1,0–2,5 s** (E1 falado); nenhum card parado > 4 s sem animação interna. Em E2 musical: corte na batida (~0,9 s). | trocas/min 31–50; DCN96 0,92 s |
| B5 | **Rosto sozinho (sem B-roll) só em 3 lugares**: pergunta retórica/virada ("Então qual a melhor forma?", "This next part is the real secret"), CTA final (últimos 2–6 s) e eventualmente o 1º segundo. Fora disso o B-roll está presente. | Dexi2 21,4/43/45,5 s; raycfu 9,5/35,5/52 s; eusoier 31 s; DemFz 11,3 s |
| B6 | **CTA = palavra-gatilho materializada**: campo de comentário digitando a palavra ou a palavra gigante sobre o rosto ("MOTION", "HAIRLINE", "CÓDIGO DA LEGENDA", "HARVEY"), na cor de destaque. | raycfu 47,5; DemFz 11,3; Dexi2 47; DexOI 27,2; eusoier 31 |
| B7 | **Layout fixo, só o conteúdo troca**: card sempre na mesma caixa (mesma posição, tamanho, raio); troca por corte seco ou entrada com mola curta (6–8 quadros) — sem whip, sem transição longa. | todos E1/E3 |
| B8 | **Cena contínua conta como troca** quando um objeto novo entra no mesmo cenário (DexOI): mantém o "quadro muda" sem custo de novo B-roll. | DexOI 0–30 s |
| B9 | Gancho (0–3 s): B-roll ou título já presente no quadro 0 (nenhum vídeo E1 começa com rosto limpo); 1ª troca ≤ 1,5 s. | raycfu título 0 s; Dexi2 carteirinha 0 s; DemFz ilustração 0 s; eusoier janela 0 s |
| B10 | E2: B-roll ilustra **estado/emoção**, não substantivo; tipografia pode ser integrada à cena (texto no chão) ou palavra única sobre cada quadro da colagem. | DL9 0–6 s; C_PBG |

Som: whoosh/pop não confirmado por medição (whisper só retornou fala/música). Não medido.

### (iii) Taxonomia de B-roll e como produzir
| Tipo | Exemplos medidos | Produção no motor |
|---|---|---|
| T1 Número animado (contador, barra, gráfico, placar, "-17 pontos") | Dexi2 99,9 %/7,8 %/3x; DexOI 67/50; raycfu $2100 | **Código** (HTML+seek, molas) |
| T2 UI/print de produto (logo, tela, seletor de modelo, terminal, repo GitHub, passo a passo com cursor) | raycfu Node/FFmpeg/Opus; Dexi2 ChatGPT/plugins/Blender; DemFz GitHub | **Código** (recriar UI; decisão 2026-10-31 permite UI/logo do produto citado recriados em código) ou captura de tela real |
| T3 Card de texto/tipografia (título gancho, palavra-gatilho CTA, card "PROVA SURPRESA", "31 outubro") | raycfu título; CTA de todos | **Código** |
| T4 Ilustração de linha / ícone / diagrama (bonecos de traço, mapa com pinos, balança prós/contras, isométrico) | eusoier; DemFz; DexOI | **Código** (SVG animado) para traço/ícone; **OpenArt** se for cena ilustrada rica (cenário voxel do DexOI) — sem texto na imagem |
| T5 Cena/objeto gerado (xícara 3D, escritório 3D, personagem, interior realista, abstrato) | raycfu 4,5 s; Dexi2 29–43 s | **OpenArt** (imagem/vídeo), texto sobreposto em código |
| T6 Mídia oficial de terceiros em quadro (vídeo de lançamento) | DdC9a | Captura do material oficial do produto (notícia), em quadro com crédito |
| T7 B-roll filmado (cidade, ambiente, mãos, timelapse, rua) | danieldalen todos | **Filmagem** (RAW do criador); não substituir por IA no E2 |
| T8 Rosto (A-roll) / punch-in | todos | Filmagem RAW; punch-in em código (escala 1,0→1,15) |

### (iv) Barra do estilo padrão E1 do criador (5–7 mecanismos)
1. **Layout dividido**: card de B-roll em cima ocupando 0–48 % da altura (cantos arredondados, borda `#0035D4`), rosto embaixo 48–100 %; legenda Satoshi na costura (centro y = 46–50 %), 1–3 palavras por bloco, palavra-chave em `#B6FF59`. Verificar: bbox do card e da legenda por quadro.
2. **Ritmo**: ≥ 30 trocas de conteúdo do card por minuto; nenhum intervalo > 3,0 s sem troca ou animação interna (detector de quadro morto). Verificar: diff de quadro na região do card.
3. **Sincronia antecipada**: cada card começa 0,3–0,9 s antes da palavra-chave (timestamps whisper); 0 cards depois da palavra. Verificar: tabela card×palavra no render.
4. **Literalidade**: todo número dito vira T1 (contador até o valor exato); todo produto citado vira T2 (UI/logo em código); listas viram 1 card por item. Verificar: lista de números/entidades do roteiro ⊂ lista de cards.
5. **Rosto limpo só em virada e CTA**: B-roll presente em 75–90 % do tempo; janelas de rosto tela cheia apenas na frase de pergunta/virada e nos últimos 2–6 s. Verificar: % de quadros com card.
6. **Gancho no quadro 0**: título/card já visível em t=0 e 1ª troca ≤ 1,5 s; nenhum quadro inicial vazio.
7. **CTA materializado**: palavra-gatilho em Clash Display grande em `#B6FF59` (ou campo de comentário digitando a palavra) nos últimos 2–5 s.
