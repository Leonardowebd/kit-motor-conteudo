---
tipo: adr
data: 2026-10-31
status: vigente
refs: [Base/MARCA.md, Base/referencias-video.md, Base/referencias-carrossel.md]
---
# ADR-002 — Base de marca como índices Markdown (RAG simples)
## Contexto
Usuário pediu a identidade como RAG consultável pelos agentes.
## Decisão
Índices Markdown em `Base/`: `MARCA.md` (cores `#0035D4` `#F6F6F6` `#B6FF59` `#0D0D0D`; Clash Display + Satoshi; pixel/LED), `referencias-video.md`, `referencias-carrossel.md`. Agente lê o arquivo inteiro como contexto.
## Alternativas descartadas
- Banco vetorial: volume pequeno não justifica infraestrutura nem dependência.
## Consequências
- Zero instalação; versionado no git; trocar de marca = trocar `Base/`.
- Se o volume crescer, reavaliar busca vetorial em novo ADR.
