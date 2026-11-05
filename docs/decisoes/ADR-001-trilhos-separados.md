---
tipo: adr
data: 2026-10-31
status: vigente
refs: [.spec/features/video/spec.md, .spec/features/carrossel/spec.md]
---
# ADR-001 — Trilhos separados vídeo e carrossel
## Contexto
Uma feature única misturava vídeo e carrossel, com dependências e ritmos diferentes. Usuário pediu separação.
## Decisão
Dois trilhos com spec própria: `.spec/features/video/` e `.spec/features/carrossel/`. Vídeo vertical vai primeiro; carrossel fica em espera até existir base de conhecimento das redes + skill de copy estratégica.
## Alternativas descartadas
- Feature única `carrossel` cobrindo tudo (acoplamento, bloqueava o vídeo).
## Consequências
- Cada trilho evolui e é auditado isoladamente; motor de render é compartilhado (ADR-003).
