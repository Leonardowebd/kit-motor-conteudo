# Spec: Carrossel

> feature: carrossel
> status: em-implementacao

## Contexto

**Ativo desde 2026-11-03** (meta de 100 posts/rede em 30 dias). Pré-requisito cumprido: método de copy em `Base/roteiro-copy/metodo.md` → estrutura de carrossel em `Base/roteiro-copy/carrossel.md`. Motor: `motor/carrossel/carrossel.mjs`; agente `carrossel`.

Trilho dedicado ao carrossel do Instagram (separado do vídeo). Gera carrosséis na identidade do criador consultando a base `Base/MARCA.md` e `Base/referencias-carrossel.md`, renderizados em código e aprovados por crítica contra uma referência medida.

## Histórias

### US-001 — Gerar carrossel a partir de uma ideia

Como criador, quero informar um tema e receber um carrossel completo, para publicar sem desenhar slide por slide.

#### AC-001 — Estrutura narrativa completa

- **Dado** um tema informado
- **Quando** eu peço a geração do carrossel
- **Então** recebo um BRIEF e de 6 a 10 slides numerados com capa (gancho), slides de desenvolvimento, uma virada e um slide final com chamada para ação com entregável nomeado

#### AC-002 — Identidade da base aplicada

- **Dado** um carrossel gerado
- **Quando** eu abro os slides
- **Então** todo texto usa Clash Display ou Satoshi e toda cor usada pertence à paleta de `Base/MARCA.md` (#0035D4, #F6F6F6, #B6FF59, #0D0D0D), com no máximo um acento por slide

### US-002 — Nível da referência

Como criador, quero que o carrossel siga uma família das minhas referências, para chegar ao mesmo nível visual.

#### AC-004 — Barra de mecanismos da referência

- **Dado** uma família escolhida em `Base/referencias-carrossel.md`
- **Quando** o carrossel é gerado
- **Então** o render só roda se existir um `bar.md` ao lado do roteiro com 5 a 7 mecanismos observáveis; o veredito dos três críticos (pedido, sistema, visual) fica em `critica.md`

### US-003 — Exportar para o Instagram

Como criador, quero os slides em imagem no formato do Instagram, para subir direto.

#### AC-003 — Exportação em PNG 4:5

- **Dado** um carrossel aprovado
- **Quando** eu exporto
- **Então** recebo um PNG por slide em 1080x1350, na ordem, mais a legenda em `legenda.txt`, numa pasta própria em `Conteudo/Carrossel/`

## Fora de escopo

- Vídeo e edição (trilho `video`).
- Publicação automática; LinkedIn.
- Carrossel vivo (MP4 por slide) — fica para depois do estático aprovado.

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| ASM-001 | Formato único 4:5 (1080x1350) | confirmada | AC-003 |
| ASM-002 | Slides em HTML renderizados para PNG com Playwright | confirmada | motor/carrossel/carrossel.mjs |
| ASM-003 | Idioma português do Brasil | confirmada | Base/MARCA.md |
| ASM-004 | Família A (editorial escuro) é o padrão quando não indicada | confirmada | agente carrossel, 2026-11-03 |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| Q-001 | Quantos slides por carrossel (faixa)? | respondida | 6 a 10 (padrão das referências) — a confirmar |
| Q-002 | Seguir referências ou só identidade? | respondida | Referências via base (RAG) + identidade criador |
| Q-003 | Texto escrito pelo Claude a partir do tema, ou roteiro vem pronto? | respondida | Claude escreve, mas só depois de existir a base de conhecimento do projeto nas redes + skill de copy estratégica (pré-requisito; trilho em espera, vídeo tem prioridade) |
| Q-004 | Seu rosto aparece nas capas? | respondida | Sim quando o tema pede: cena ligada ao tema com o rosto/corpo do criador como persona (ex.: vídeo sobre marketing do golfe → criador jogando golfe), gerada via OpenRouter a partir das fotos de `Fotos-alta-resolucao/` |
