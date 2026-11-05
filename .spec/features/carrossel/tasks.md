# Tasks: Carrossel

> feature: carrossel

<!--
  Como ler este arquivo (o formato é verificado por `onp-spec audit`):
  - T-xxx = tarefa (código de rastreio, único no projeto inteiro).
  - Toda tarefa referencia em `Refs:` pelo menos uma história de usuário
    (US-xxx) ou critério de aceite (AC-xxx).
  - Toda tarefa lista os arquivos que cria/altera em `Arquivos:` — capriche:
    é o que decide o que `onp-spec plano` roda em PARALELO (arquivos
    disjuntos) e o que roda em sequência.
  - Campos opcionais por tarefa, usados pelo plano de execução:
    `- Modelo: claude-sonnet-5` e `- Esforço: alto` (baixo|medio|alto|xalto|max).
  - Uma tarefa só pode virar [concluida] quando os critérios de aceite dela
    tiverem prova PASS registrada por `onp-spec verify`.
  Status: pendente | em-andamento | concluida
    (atalho: `onp-spec tarefa <feature> <T-xxx> <status>`)
-->

## T-001 — Validador de estrutura e acento [concluida]

- Refs: US-001, AC-001, AC-002
- Arquivos: motor/carrossel/carrossel.mjs, motor/carrossel/carrossel.test.mjs
- Notas: `validar()` — 6–10 slides, capa-gancho, virada, CTA final com entregável, ≤1 acento, número exige fonte.

## T-002 — Render HTML→PNG 1080x1350 na marca, prancha e legenda [concluida]

- Refs: US-003, AC-002, AC-003
- Arquivos: motor/carrossel/carrossel.mjs, motor/carrossel/carrossel.test.mjs
- Notas: reaproveita `cssMarca()` de motor/video/legenda.mjs; falha se o texto estourar o slide.

## T-003 — Barra de mecanismos obrigatória e agente diretor [concluida]

- Refs: US-002, AC-004
- Arquivos: motor/carrossel/carrossel.mjs, .claude/agents/carrossel.md, Base/roteiro-copy/carrossel.md
- Notas: render recusa sem `bar.md`; agente registra os três críticos em `critica.md`.

## T-004 — Famílias B (notícia com print) e capa com foto do criador [pendente]

- Refs: US-002
- Arquivos: motor/carrossel/carrossel.mjs
- Notas: hoje só família A; B precisa do print oficial do pesquisador (modo MATERIAL).
