---
tipo: aprendizados
data: 2026-10-31
status: vigente
refs: [Estudo/01-estudo-acervo.md, ADR-004]
---
# Aprendizados

- Página pública do Notion só renderiza com JavaScript; leitura por fetch falha → pedir export Markdown. Evidência: `Estudo/01-estudo-acervo.md` §7.
- Executor headless do `onp-spec` exige repositório git e permissões além de node/git; não roda em pasta do Drive. Evidência: ADR-004, diário 2026-10-31.
- Não assumir ffmpeg/Homebrew no macOS do usuário; verificar antes de depender. Evidência: `Estudo/01-estudo-acervo.md` §7.
- Referência de rosto para IA precisa de recorte em alta resolução; rosto ~150 px envelhece o resultado. Evidência: ficha v1 vs v2, `motor/video/rosto.swift`, commit `6401d70`, ADR-007.
- Não descrever etnia/traços no prompt de geração com rosto; muda a pessoa. Evidência: ficha v3, ADR-007.
- Não usar imagem gerada por IA como referência; contamina identidade. Evidência: ficha v3, ADR-007.
- Whisper: `condition_on_previous_text=False` + `initial_prompt` com vocabulário; `True` causa loops e corte na 1ª frase. Evidência: commit `50193c3` (T-010).
- Arquivo do Google Drive "sob demanda" é gargalo de I/O (ffmpeg a 0,1% CPU); marcar acervo "Disponibilizar off-line". Evidência: diário 2026-10-31 (continuação).
- `ffprobe-static` arm64 quebrado → usar `@ffprobe-installer/ffprobe`. Evidência: commit `372255c` (T-002).
- Corte por silêncio não basta: regravações repetidas e bastidor exigem detecção de frase "contida em" outra. Evidência: AC-012..AC-016, commit `71b6dd2`.
- Copy: o briefing do criador foi copiado literalmente para o anúncio ("sem fixo mensal", "tem terreno e renda", "dobrar de tamanho"); correções foram feitas por substituição de palavras; o corte para 40 s foi feito cortando e depois enchendo. → Briefing é intenção, não texto; reescrever pela etapa que errou; planejar o tempo antes. Evidência: sessão 2026-11-04, `Conteudo/Clientes/Cliente/2026-11-04-anuncio-diagnostico/`, regras 11–13 do AGENTS.md, feature `copy`.
- Copy: "eco" no começo do vídeo de referência era artefato da gravação de tela, não técnica. → Confirmar com quem gravou antes de tratar um padrão como mecanismo. Evidência: `Base/engenharia-reversa/arkom-diagnostico.md` §13.
- Copy: jargão de imobiliária (corretor, plantão, stand, decorado) e a suposição de que toda construtora tem time de vendas afastam o público, que é o dono. → Glossário do nicho com termos proibidos, checado por código. Evidência: `Base/copy/nichos/construtoras.json`.
- Copy: o veto do criador a "corretor/plantão/stand/decorado" vale para o dono de **construtora de obra** (0–1 menção em entrevistas), mas não para o dono de **incorporadora** (corretor 11–56 menções por entrevista de CEO). "Lead" e "previsibilidade" são palavras de agência (0–2 nos donos). → Um nicho por público, glossário medido, um público por criativo. Evidência: `Conteudo/Estudos/voz-cliente-construtoras/voz-cliente.md`, `Base/copy/nichos/{construtoras,incorporadoras}.json`.
- Verificador: aceitava origem "glossario" com qualquer glossário não vazio. → Agora exige termo do glossário na própria fala (teste AC-105). Evidência: `motor/copy/verificar.test.mjs`.
- Copy: para anúncio da Cliente, a única referência válida são os áudios entregues pelo criador (`Base/engenharia-reversa/audios-validados-construtora.md`). O formato é curto (18–30 s a 150/min), oferta direta sem história: chamado → sem mensalidade → entregáveis → prova visual → formulário com filtro. Copies de história e de concorrentes ficam só para Reels (mecanismo). Evidência: sessão 2026-11-04.
- Verificador: `[CONFIRMAR]` em tela/cena não bloqueava a publicação → agora bloqueia (teste AC-103). Agentes do projeto (`copywriter`, `revisor-copy`) só aparecem quando a sessão roda dentro de `~/Projetos/motor-conteudo`; fora dele, rodar um agente genérico mandando seguir o arquivo do agente.
- Copy/teste: encenação (ligação, reunião) que faz parecer cliente real é afirmação sem fato (regra 10) → legenda "cena ilustrativa", pessoa da equipe, cenário não identificável; formato "recado de voz" substitui a ligação. Teste de criativo: mudar uma variável por braço, comparar só dentro do braço, declarar vencedor só com significância. Evidência: `Conteudo/Clientes/Cliente/2026-11-04-anuncio-validado/variacoes-contexto/revisao.md`.
