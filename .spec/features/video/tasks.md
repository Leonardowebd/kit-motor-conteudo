# Tasks: Vídeo

> feature: video

## T-002 — Ambiente: ffmpeg, Playwright e transcrição local [em-andamento]
- Refs: AC-008, AC-005
- Arquivos: motor/package.json, motor/package-lock.json, motor/setup.sh
- Notas: instala ffmpeg no Mac, Playwright+Chromium e Whisper local; base para todas as outras.

## T-003 — Transcrição e corte de silêncios do RAW [pendente]

- Refs: US-004, AC-005
- Arquivos: motor/video/timeline.mjs, motor/video/transcrever.mjs, motor/video/cortar.mjs, motor/video/cortar.test.mjs
- Notas: depende de T-002. Pausa máxima 0,7 s; gera timeline JSON com palavras e tempos.

## T-004 — Legenda e cards de b-roll no estilo E1 [pendente]

- Refs: AC-005, AC-006
- Arquivos: motor/video/legenda.mjs, motor/video/cards.mjs, motor/marca/marca.css, motor/video/legenda.test.mjs
- Notas: lê Base/MARCA.md e Base/referencias-video.md; área segura do Reels.

## T-005 — Prévia leve e aprovação [pendente]

- Refs: US-004, AC-010
- Arquivos: motor/video/previa.mjs
- Notas: depende de T-003/T-004; render baixa resolução, espera OK.

## T-006 — Motor de motion (HTML + seek + Playwright) e crítica de quadros [em-andamento]

- Refs: US-005, AC-007
- Arquivos: motor/render/broll.mjs, motor/render/compor.mjs, motor/render/compor.test.mjs
- Notas: molas fechadas; caçador de trechos parados > 1 s; nota por cena ≥ 8.

## T-007 — Export limpo com verificação ffprobe [pendente]

- Refs: US-006, AC-008
- Arquivos: motor/video/exportar.mjs

## T-008 — Capa com o criador como persona (OpenRouter) [pendente]

- Refs: US-007, AC-009
- Arquivos: motor/capa/gerar-capa.mjs, motor/capa/titulo.html
- Notas: orçamento aprovado antes de gerar; título em código; fotos de Fotos-alta-resolucao/ como referência.

## T-009 — Pesquisa de referências no Pinterest + pastas → moodboard [pendente]

- Refs: US-008, AC-011
- Arquivos: motor/pesquisa/pinterest.mjs, motor/pesquisa/moodboard.mjs
- Notas: navegador logado (Chrome) para a busca do Pinterest; serve aos dois trilhos; alimenta o prompt de T-008.

## T-010 — Inventário do acervo bruto [em-andamento]

- Refs: US-009, AC-012
- Arquivos: motor/video/inventario.mjs, motor/video/inventario.test.mjs

## T-011 — Agrupamento dos RAW e escolha da melhor versão de cada frase [pendente]

- Refs: US-009, AC-013, AC-014
- Arquivos: motor/video/montagem.mjs, motor/video/montagem.test.mjs
- Notas: produz `montagem.json` (vídeos → lista de cortes {fonte, ini, fim}); seleção feita pelo agente lendo o inventário (ASM-009); montagem.mjs valida (sem frase repetida, sem bastidor).

## T-012 — Render e prévia a partir de lista de cortes com vários RAW [pendente]

- Refs: US-009, AC-015
- Arquivos: motor/video/montagem.mjs, motor/video/montagem.test.mjs, motor/video/cortar.mjs, motor/video/timeline.mjs
- Notas: render da T-003 generalizado para segmentos com fonte própria (cortar.mjs); timeline da montagem em montagem.mjs; reaproveita previa.mjs.

## T-013 — Card que desvia do rosto [pendente]

- Refs: US-010, AC-016
- Arquivos: motor/video/rosto.mjs, motor/video/rosto.test.mjs
- Notas: detecção de rosto por quadro amostrado; card sobe/encolhe ou o vídeo desce.
