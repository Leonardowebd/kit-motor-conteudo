# Aprendizados — vídeos com RAW (Formato A/B), até 2026-11-01

Resumo do que funcionou nos vídeos aprovados (Vercel WebGPU, ChatGPT Dots, Graphify, Claude Code grátis, WA-AKG).
Vale para os próximos formatos sempre que houver fala gravada (minha voz real ou clonada).

## Corte da fala (motor/video/montagem.mjs)
1. **História primeiro:** mapear todas as tomadas do RAW por frase, escolher a última tentativa concluída de cada frase e montar a sequência gancho → contexto → passos → fecho → CTA.
2. **Recomeços:** o Whisper funde tentativas; a fala literal (wav2vec2 sem modelo de linguagem) mostra onde parou e recomeçou. Sai a tentativa interrompida.
3. **Bastidor:** detector de olhar (Apple Vision) tira leitura de roteiro e trechos sem rosto; trocar pela tomada olhando para a câmera.
4. **Aberturas repetidas** ("Isso porque…", "E aí…") só na 1ª vez.
5. **Bordas do editor mandam:** palavra entra pelo meio; alinhamento e folga não puxam fala de fora.
6. **Respiros** saem (silêncio −30 dB); cortes no quadro (30 fps).
7. **Conferir sempre:** transcrever o vídeo pronto e ouvir as emendas literalmente antes de mostrar.

## Visual (motor/render)
- Locutor centralizado; legenda mono fixa no centro-baixo; palavra-chave em limão.
- Gancho: imagem mais viral do assunto em tela dividida, com o locutor recortado por cima (`dividido` + `recorte`).
- Repertório: temas `vidro | editorial | linha`, 16 componentes (ver `Base/variacoes-ui.md`), fundos `pontos | hud | planta`, `duotone`, `grao`.
- Câmera: empurrão lento, corte seco e ângulo balançando no rosto; telas entram em 3D; furo < 0,5 s entre telas vira emenda.
- Variar tema e componentes a cada vídeo, sem perder a identidade.
- Só fontes oficiais com crédito; nenhum número sem fonte.

## Som
- Trilha sob medida por tema (Lyria via Magnific, 30 s, ~80 créditos), normalizada (−27 LUFS), mais baixa sob as telas.
- SFX do acervo com picos alinhados ao movimento; sempre exportar também a versão sem música.

## Operação
- Uma tarefa pesada por vez (Mac 8 GB); arquivos intermediários fora do Drive; quadro que engasga tenta de novo.
- Magnific: gastar pouco e apagar tudo depois.
- Quadros estáticos (`quadros.mjs`) antes do render completo; catálogo (`catalogo.mjs`) para revisar componentes.

## Correções de 2026-11-01 (React Bits / 21st.dev)
- **Entregar sempre `--final`** (1080×1920, 30 fps). A prévia sem `--final` é 540×960 a 15 fps: só para conferência interna.
- **Voz normalizada** em `som.mjs`: highpass 80 Hz + loudnorm −15 LUFS. RAW variam de −30 a −16 LUFS.
- **Sem redução de ruído (afftdn)**: tirava ~10 dB de agudos e deixava a voz abafada (criador, 2026-11-01).
- **Agudos adaptativos**: o motor mede o brilho da voz (energia > 4 kHz relativa ao total; AKG aprovado ≈ −29 dB) e só realça o que falta até −30 dB, teto +8 dB (`medirAgudos`/`ganhoAgudos`). A sessão IMG_8962–8965 foi gravada abafada (≈ −38 dB).
- **Ângulo da câmera** reduzido de ~2,5° para ~0,6° (balançava demais).
- **Títulos**: Clash Display com letter-spacing negativo colava palavras → `word-spacing` global em `CSS_BASE`.
- **Enumeração não é recomeço** ("como você vai enviar X, como você vai enviar Y"): regra + teste em `montagem.mjs`.
- Rodar render pesado **depois das 21h** quando o criador pedir (Mac livre).
- **Tema editorial + fundo planta** = texto escuro sobre azul, ilegível. No editorial, não usar `fundo: planta`.
- **Fim do corte com folga**: o motor não deixa a última palavra passar de `fim + 0,12 s`. Marcar `fim` ≥ fim da última palavra no inventário (+0,1 s), senão a palavra final some ("nesse [mercado]").
- **`olhar: false` no corte** desliga o detector de olhar nesse trecho; usar quando a imagem vai ficar coberta por tela cheia (gancho gravado sentando ou olhando para baixo).
- **RAW que começa com o criador sentando**: cobrir os primeiros ~2 s com a imagem do assunto em tela cheia (sem `dividido`), o rosto entra já sentado.
- **Correções da legenda** (`correcoes`) usam a palavra sem pontuação como chave (`togos`, não `togos.`).
