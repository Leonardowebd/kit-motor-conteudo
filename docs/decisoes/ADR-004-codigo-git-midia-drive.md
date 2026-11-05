---
tipo: adr
data: 2026-10-31
status: vigente
refs: [conteudo.config.json, commit 90c1299]
---
# ADR-004 — Código em git fora do Drive; mídia no Drive
## Contexto
Projeto estava em pasta do Google Drive sem git; executor headless do `onp-spec` exige git/worktrees.
## Decisão
Código, specs, `Base/`, `docs/` em `~/Projetos/motor-conteudo` (privado, github.com/criadorwebd/motor-conteudo). Mídias brutas e referências ficam no Drive, apontadas por `conteudo.config.json` → `acervo`.
## Alternativas descartadas
- git dentro do Drive: sincronização do Drive corrompe `.git`.
- Mídia no git: arquivos grandes.
## Consequências
- Caminho do acervo é configuração, não código → portável para outra pessoa.
