---
tipo: adr
data: 2026-10-31
status: vigente
refs: [AC-007, AC-008, Estudo/01-estudo-acervo.md]
---
# ADR-003 — Motor de render HTML + seek(t) + Playwright + ffmpeg
## Contexto
Estudo do acervo (raycfu, criador-de-carrosseis, hyperframes) converge em código que pinta quadro a quadro.
## Decisão
Um motor único: página HTML expõe `seek(t)`; Playwright captura cada quadro; ffmpeg costura MP4. Movimento por molas de forma fechada; cortes na batida; autocrítica de quadros mortos até ≥ 8/10.
## Alternativas descartadas
- Remotion: exige stack React e repo `remotion-dev/skills` sem licença; o motor HTML atende carrossel, carrossel vivo e motion.
## Consequências
- Depende de ffmpeg instalado (ausente em 2026-10-31; Homebrew ausente).
- Determinístico e inspecionável quadro a quadro.
