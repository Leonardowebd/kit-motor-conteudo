# Estrutura de copy — Carrossel (Instagram 4:5)

Derivado de [metodo.md](metodo.md) (3 C's, gancho, CTA, storytelling) para o formato carrossel. Render:
`node motor/carrossel/carrossel.mjs <pasta>/carrossel.json`. Agente: `.claude/agents/carrossel.md`.

## A métrica que manda
Carrossel cresce por **salvamento e compartilhamento** (e pelo tempo de arrasto). Cada slide tem um trabalho:
fazer arrastar para o próximo. Se um slide não puxa o seguinte, ele sai.

## Esqueleto (6–10 slides; 8–9 é o ponto doce)
| # | Papel | Trabalho do slide | Tipos de layout |
|---|---|---|---|
| 1 | **gancho** | Capa com 3 C's. Promete sem entregar. Laço aberto no subtítulo. | `capa` |
| 2 | desenvolvimento | **Cumprir a capa já no 2** (alusão direta) + envolver o leitor (teste, pergunta, cena do dia a dia). | `grade`, `texto`, `imagem` |
| 3 | prova | Fato com fonte: número, origem, print oficial. Autoridade sem arrogância. | `numero`, `imagem` |
| 4–5 | desenvolvimento / prova | Explicar com metáfora concreta antes do termo técnico; exemplos que o leitor já viveu. | `texto`+`pontos`, `lista` |
| 6 | **virada** | Quebra de expectativa: o erro comum, o "mas", o lado que ninguém conta. É o slide que mais gera comentário. | `texto` |
| 7 | desenvolvimento | Aplicação prática (antes × depois, passo a passo). É o que faz **salvar**. | `comparacao`, `lista` |
| 8 | prova | Payoff: fechar o laço da capa / "repara que este carrossel fez isso". | `texto`, `imagem` |
| último | **cta** | Valor dito antes do comando → "Comenta PALAVRA" + entregável nomeado. | `cta` |

## Imagens (estrutura padrão)
Capa = imagem de IA com rosto (criador/personagem do tema) e título atrás da pessoa · miolo = prints/imagens das fontes
em grade + construções em código · último = imagem de IA de impacto atrás do CTA. Detalhe no agente `carrossel` (passo 4b).

## Regras de texto
1. **Capa (3 C's):** curiosidade > clareza > consequência. Máx. ~8 palavras no título; 1 palavra em acento.
   O C que não coube no título vai para o subtítulo. Número real na capa ajuda ("de 1933", "3 erros").
2. **Um slide = uma ideia.** Título ≤ 9 palavras; corpo ≤ 2 parágrafos de até ~25 palavras.
3. **Cada slide termina abrindo o próximo** (micro-gancho): pergunta, "mas…", lista que continua, "repara".
4. **Acento único** (`*trecho*`): só na palavra que carrega a ideia. Negrito (`**`) no máximo 1 por slide.
5. **Fala de gente:** "você", verbo no presente, frases curtas. Sem tom de coach, sem "incrível/revolucionário".
6. **Nenhum dado sem fonte** (regra 8). Número no slide → URL em `fontes`. O render recusa sem isso.
7. **Demonstrar enquanto ensina:** carrossel de design tem que ser exemplo do que ensina.
8. **CTA:** padrão = comunidade gratuita (meta de 40 membros) ou isca real que já existe. Nunca prometer
   entregável que não existe; se precisar criar, entra como pendência antes de publicar.

## Legenda (`legenda`)
- **1ª linha = título com os 3 C's** (aparece antes do "mais"; ~125 caracteres).
- 2–4 parágrafos curtos: o resumo do carrossel para quem não arrastou + 1 frase de opinião do criador.
- CTA repetido igual ao do último slide + "Salva pra…" com motivo concreto.
- Fontes são anexadas automaticamente no fim.

## Tipos por pilar (ponto de partida)
- **P1 notícia:** capa com o fato + `imagem` (print oficial com crédito) + "o que muda pra você" + virada (o que ninguém comentou).
- **P2 psicologia / P3 IA aplicada:** teste interativo no slide 2 (`grade`/`pontos`), origem com fonte, aplicação em `comparacao`.
- **P4 história / P5 marca / P6 guerrilha:** narrativa com revelação adiada (a marca só no fim), um slide por ato.
- **P7 meme:** 1–3 slides, sem esqueleto completo (não usar este trilho; post simples).
- **P8 opinião:** capa com tese polêmica, 3 argumentos, a objeção honesta (virada), convite a comentar.

## Regras de execução (feedback do criador, 2026-11-03)
- **Praticar o que ensina:** o carrossel é prova do conteúdo. Se ensina hierarquia, cada slide tem UM ponto focal
  (nada de pílulas, selos e etiquetas disputando). Se a imagem já tem a cor de acento, o texto não usa acento.
- **Não vender o que não executamos:** nada de "toda semana eu…", "todo app…", "os melhores…" sem prova. CTA só promete
  o que existe; link inexistente = carrossel não publica.
- **Bordas:** só o número do card ("3") e a seta "→" (último slide sem seta). Sem @, sem "arrasta", sem pílulas.
  Aviso de IA vai na legenda.
- **Fontes:** só Clash Display (títulos, número) e Satoshi (texto, créditos, rótulos).
- **Espaço:** escala fixa no post (cabeçalho 44 · título 24 · texto 40 · imagem 16 · crédito); nada de margem negativa.

## Checklist antes de renderizar
1. Pauta veio do radar com sinal de alta (outlier) ou pilar com demanda? Modelando, não copiando?
2. Capa passa nos 3 C's? Fiz **2 capas alternativas** e escolhi com crítica?
3. Slide 2 cumpre a capa? Cada slide puxa o próximo? Existe uma virada?
4. Há pelo menos 3 slides com prova visual (não só texto)?
5. Todo número tem fonte? O CTA tem entregável real?
6. Lido em sequência em voz alta, em < 60 s?
7. O carrossel aplica o que ensina? Alguma frase promete algo que ainda não fazemos?
