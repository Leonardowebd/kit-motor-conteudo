# Spec: Copy

> feature: copy
> status: em-implementacao

## Contexto

Criada em 2026-11-04 a partir de um caso real (anúncio da Cliente para construtoras e incorporadoras). A copy foi feita às pressas e o criador apontou os erros:
- frases do briefing dele copiadas como texto do anúncio;
- correções por troca de palavra;
- corte e enchimento para bater o tempo;
- checklist do método pulado;
- jargão que não é do público;
- dado sem fonte.

Objetivo: copy de anúncio e roteiro **embasada**, escrita pelo agente `copywriter` e aprovada só pelo `revisor-copy`, com as regras checadas por código (`motor/copy/verificar.mjs`).

Em seguida, cada copy publicada recebe métricas, e uma técnica só passa a "validada" com dado (feature futura `resultados`). O método é de qualquer nicho; nicho e cliente ficam em arquivos próprios (`Base/copy/nichos/`, `Base/copy/clientes/`).

## Histórias

### US-101 — Copy verificável antes de chegar ao criador

Como criador, quero que toda copy passe por um verificador automático antes de eu ler, para não receber texto com os erros que já corrigi.

#### AC-101 — Briefing não vira texto
- **Dado** um `copy.json` com o caminho do briefing do cliente
- **Quando** o verificador roda
- **Então** reprova toda fala que repete 3 ou mais palavras de conteúdo seguidas do briefing, e avisa quando repete 2. A exceção é o termo que está no glossário do nicho com fonte externa.

#### AC-102 — Linguagem do público, sem termo proibido
- **Dado** o arquivo do nicho com termos proibidos
- **Quando** uma fala ou texto de tela contém um termo proibido
- **Então** o verificador reprova e mostra a troca sugerida e o motivo

#### AC-103 — Só fatos
- **Dado** uma fala com número, percentual ou absoluto ("a maioria", "todos", "nunca", "sempre")
- **Quando** a fala não aponta para um fato do cliente/nicho com status `confirmado`
- **Então** o verificador reprova. Toda fala com `[CONFIRMAR]` ou origem em fato não confirmado marca a copy como **não publicável**

#### AC-104 — Tempo planejado, não cortado
- **Dado** a duração-alvo (padrão 40–60 s) e o ritmo (padrão 180 palavras/min)
- **Quando** o verificador soma as falas
- **Então** reprova se ficar fora da faixa ou se o gancho passar do limite de palavras (padrão 15)

#### AC-105 — Toda frase tem origem
- **Dado** as falas
- **Quando** alguma fala não tem `origem` (glossario, referencia:<arquivo>, fato:<id> ou hipotese), ou aponta para uma referência que não existe em `Base/engenharia-reversa/`
- **Então** o verificador reprova

#### AC-106 — Auditoria do método entregue junto
- **Dado** o `copy.json`
- **Quando** falta algum item do checklist (3 C's, 4 ganchos, CTA, nível de consciência) ou há menos de 2 ganchos alternativos com prós e contras
- **Então** o verificador reprova

#### AC-108 — Handoff de cada etapa
- **Dado** o `copy.json`
- **Quando** alguma etapa do processo (briefing, publico, linguagem, mecanismo, prova, rascunho, auditoria) não tem handoff com `feito` e `proximo`
- **Então** o verificador reprova

### US-102 — Ver a copy separada por tipo

Como criador, quero ver a copy colorida por fala, cena e IA/tela, com a origem de cada frase e o relatório do verificador, para aprovar rápido.

#### AC-107 — Página da copy
- **Dado** um `copy.json`
- **Quando** rodo o verificador com `--html`
- **Então** é gerada uma página com fala, cena e IA/tela em cores diferentes, a origem de cada fala, o tempo estimado e a lista de erros e avisos

## Fora de escopo
- Métricas e aprendizado por resultado: feature futura `resultados`.
- Uso por outras pessoas e outros nichos (empacotamento).
- Escrever a copy: é trabalho do agente; o código só verifica e exibe.

## Suposições
| ID | Suposição | Status | Resolução |
|---|---|---|---|
| ASM-101 | 180 palavras/min é o ritmo padrão até medirmos o locutor | confirmada | estudo-fonetico.md (151–252 nos anúncios do segmento) |
| ASM-102 | Eco de briefing medido por n-gramas de palavras de conteúdo | aberta | testar nos casos da Cliente |

## Perguntas em aberto
| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| Q-101 | Onde guardar a voz do cliente (gravações de venda)? | aberta | pedir à Cliente |
