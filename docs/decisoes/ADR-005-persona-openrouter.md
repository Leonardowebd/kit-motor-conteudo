---
tipo: adr
data: 2026-10-31
status: vigente
refs: [US-007, AC-009, US-008, AC-011, T-009, Q-008, Q-009]
---
# ADR-005 — Imagem com persona via OpenRouter, moodboard Pinterest, orçamento aprovado
## Contexto
Capas/telas devem mostrar o criador em cena do tema (ex.: golfe).
## Decisão
- Geração via OpenRouter com fotos do criador como referência.
- Antes de gerar: moodboard de referências do Pinterest (pesquisador principal, navegador logado).
- Orçamento de geração aprovado pelo usuário antes de gastar.
## Alternativas descartadas
- OpenArt como motor de imagem principal (CLI instalada, sem login; segue opcional).
## Consequências
- Em aberto: `OPENROUTER_API_KEY`; modelo e teto de custo por capa (Q-008).
