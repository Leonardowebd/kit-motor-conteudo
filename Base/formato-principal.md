---
tipo: estudo-formato
data: 2026-10-31
status: proposta (aguarda OK do criador)
refs: [Base/pericia-edicao.md, US-005, US-007]
fontes:
  - Referencias Motions/d28cdbe2c3de833fe12be1b14f429093_720w.mp4 (R1, antes/depois, 40,6 s)
  - Referencias Motions/463310d34d768aa2beece3951ebca024_720w.mp4 (R4, antes/depois, 62 s)
  - danieldalen-post-DCN96qsSP_9.mp4 (R2, 14,7 s)
  - eusoier-post-De1-Yb0AbaK.mp4 (R3, 37 s)
  - thevideoeffect.tv "Crafting depth, emotion: the power of b-roll" (out/2026)
  - Kit-de-Prompts-Historias-3D (roteirista, diretor, som)
---
# Formato principal — "rosto cinematográfico + inserts"

Lição da v1 (Vercel): o painel dividido fixo com card em moldura deixou o vídeo com cara de template.
As referências escolhidas pelo criador fazem outra coisa.

## O que as referências fazem (quadro a quadro)

### R1 e R4 (vídeos "antes/depois" de edição — o "depois" é o alvo)
- **Rosto em tela cheia é a base.** Nada de painel fixo. Color grade quente (R1 laranja, R4 vermelho).
- **O corte muda o enquadramento**: plano médio → close extremo deslocado (rosto meio fora do quadro à direita)
  com o texto no espaço vazio à esquerda. Cada corte = novo enquadramento (jump cut com propósito).
- **Texto pequeno e elegante**, 1–3 palavras, perto do rosto ou no peito; palavra revela com desfoque→nítido.
  Texto gigante e apagado **atrás** da pessoa (R1 0–1 s, "KO'PCHILIK"/"Target bu").
- **Inserts em tela cheia** que substituem o rosto por 1,5–4 s:
  - página editorial branca com foto da notícia + manchete (R4 1–5,5 s; 26–32 s; 37,5–42 s), a manchete ganha palavras uma a uma;
  - tela preta tipográfica com feixe de luz, palavra entra letra a letra com desfoque (R1 7–11 s);
  - cena abstrata (silhuetas com glitch cromático) para conceito (R1 11–17 s, 25,5–28 s), com rótulo "1-chisi/2-chisi".
- **Transições**: desfoque de movimento/zoom entre planos, pixelização (mosaico) do rosto, flash branco.
- **Momento "REC"**: trecho em preto e branco com moldura de câmera ("REC") para a frase de virada (R1 28–33 s).
- **CTA**: pílula de perfil do Instagram com botão Seguir sobre o peito (R1 38–40 s) / campo de comentário.

### R2 (danieldalen — cinemático)
- B-roll filmado do próprio criador (mesa, quarto, janela), cortes a cada ~0,5–1 s alternando luz vermelha/fria.
- Frase fixa pequena em serif no topo ("you just got lucky" / "the luck:"), cantos arredondados, vinheta.

### R3 (eusoier — explicação)
- Dividido 50/50, mas o card é uma **mini-história contínua**: o mesmo bonequinho de traço executa cada passo
  ("03 · ESCREVE", "04 · ENVIA"), UI simples monocromática, rótulo do passo no topo. O cenário não troca,
  **o personagem age** (cena contínua conta como troca).

### Artigo (thevideoeffect) + Kit (roteiro/som)
- B-roll entra quando o espectador precisaria imaginar a cena; **não sair de um rosto forte numa frase importante**.
- Camadas: plano aberto → ação → detalhe; não repetir a mesma ideia visual; continuidade.
- Kit: "cada frase vira UMA imagem clara"; antes de cada ação, um sinal (luz acende, objeto começa a cair);
  número sempre como comparação concreta, grande, perto do objeto.
- Kit (som): **1 efeito por ação visível, no momento da ação (não na palavra), nunca repetir o mesmo**;
  no momento mais forte, impacto grave + meio segundo de quase silêncio; música sempre abaixo da voz.

## O formato (proposta)

| Camada | Regra |
|---|---|
| Base | Rosto em tela cheia, color grade da marca (azul frio + realce quente na pele) |
| Cortes no rosto | Cada corte de frase troca o enquadramento: médio ↔ close ↔ close deslocado (lado alterna) |
| Texto | Legenda pequena (Satoshi 600, ~44 px) 1–3 palavras no peito; palavra-chave em limão; texto gigante apagado atrás em 1–2 momentos (gancho) |
| Inserts | Tela cheia, 1,5–4 s, só quando a fala pede imagem: notícia/produto (página editorial ou UI real recriada), conceito (cena OpenArt/Flow animada), número (tipografia grande) |
| Transições | Desfoque de zoom (padrão), flash branco (impacto), pixelização (revelação) |
| Virada | Momento "REC" P&B na frase de virada |
| CTA | Campo de comentário digitando a palavra-gatilho + pílula de perfil |
| Som | SFX por ação visível (whoosh na transição, click/teclado na UI, ding na palavra-gatilho, impacto grave na virada), sem repetir arquivo; música baixa |

Painel dividido E1 vira **variação** (vídeo passo a passo), não o padrão.

## Nota (pedido do criador, 2026-10-31): vídeo de notícia/ferramenta ecoa o estilo do assunto
Quando o tema é uma ferramenta ou notícia (Dots/OpenAI, Higgsfield, Vercel…), o vídeo **copia um pouco do estilo do
assunto sem mudar a identidade** (cores e fontes continuam as da marca):
- Pesquisar a linguagem visual do assunto em fontes oficiais (site, vídeo de lançamento, X/YouTube oficiais) e listar
  2–3 efeitos característicos (ex.: Dots = bolhas/"dots" pulsando; Higgsfield = cortes cinematográficos rápidos; Vercel = triângulo/grade).
- Recriar esses efeitos em código, nas cores da marca, **principalmente no gancho** (0–3 s), para o público reconhecer o assunto na hora.
- Usar logos oficiais e mídia oficial (com crédito) do assunto; nunca review de outros criadores.

## Regra (2026-10-31): notícia → a imagem mais viral da notícia aparece junto com o gancho
- Em vídeo de notícia, o gancho (0–3 s) mostra **a imagem mais viral/reconhecível do anúncio** (arte-chave oficial,
  ex.: o logo "dots" com os mascotes), de fonte oficial e com crédito, **em tela dividida** (imagem no painel de cima,
  locutor embaixo — insert com `"dividido": true`), nunca cobrindo o rosto. O pesquisador procura essa imagem primeiro.

## Regra (2026-10-31): trilha combina com o tema
- A música é escolhida pelo clima do assunto (ex.: Dots = lúdico/fofo/tech leve; notícia séria = tensão/corporativo),
  não uma trilha genérica. Sem faixa adequada no acervo, gerar uma trilha sob medida (OpenArt áudio, com aprovação de créditos).

## Resultado aprovado (2026-10-31): Graphify — cortes limpos
Prévia `Previas/graphify-A-previa.mp4` (38 s, Formato A) aprovada. O que a deixou certa:
- **Palavras no lugar certo:** alinhamento forçado wav2vec2 (técnica do WhisperX) refaz o tempo de cada palavra no som.
- **Sem bastidor:** detector de olhar (Apple Vision) tira trechos lendo roteiro ou sem rosto; olhada < 0,8 s fica.
- **Sem ladainha:** "Isso porque…", "E aí…" repetidos no começo das frases saem a partir da 2ª vez.
- **Sem meia-frase repetida:** o Whisper funde as tentativas numa frase limpa e esconde os recomeços. O motor ouve a
  fala literal de cada corte (wav2vec2 sem modelo de linguagem), tira as tentativas interrompidas e fica com a
  última, a concluída; depois retranscreve só ela para a legenda. No Graphify saíram recomeços em 6 de 12 cortes
  (até 4 tentativas da mesma frase). Repetição de propósito ("cada conexão… cada conexão de arquitetura") fica.
- **Conferência obrigatória:** antes de mostrar a prévia, transcrever o vídeo pronto e ler a fala inteira.
- **Leve no Mac:** um passo pesado por vez, ffmpeg com videotoolbox e threads limitadas, prioridade baixa.
