# Fluxos do motor (passo a passo, como fazemos)

Antes de qualquer fluxo: `npm run onboarding` verde. Toda etapa deixa **handoff** (o que foi feito, decisões com fonte, o que falta, próximo passo) e todo erro corrigido vira lição em `docs/aprendizados.md`.

## 1. Pesquisa (o que funciona, com dado)
- **Perfis/Reels de referência sem login:** `node motor/pesquisa/instagram.mjs <pasta> --reels @perfil` (views, outlier = ≥5× a mediana do perfil) · `--baixar <url>` salva o vídeo.
- **Anúncios ativos (Meta):** `node motor/pesquisa/anuncios.mjs <pasta> --midia all "busca"` (ranqueia por dias no ar × versões; aceita link de página ordenada por impressões; `--contar` só conta) → vídeos: `anuncios-baixar.mjs <pasta> "<regex>"` (precisa do Google Chrome).
- **Visual (Pinterest):** `node motor/pesquisa/pinterest.mjs <pasta> --n 24 "busca"` → prancha numerada.
- **Voz do cliente:** legendas do YouTube (`uvx yt-dlp --skip-download --write-auto-subs --sub-langs "pt.*" …`) → `python3 motor/pesquisa/legendas.py <pasta> <saida.md> palavras…`.
- **Engenharia reversa de um vídeo:** `node motor/pesquisa/desconstruir.mjs <video>` (transcrição, cortes, pranchas) → agente `engenheiro-reverso` escreve o estudo em `Base/engenharia-reversa/`.
- Agente que orquestra: `pesquisador` (modos FUNIL, RADAR, VIRAIS, MEMES, NOTÍCIA, MATERIAL).

## 2. Copy / roteiro
Skill `copy-conversao` + agentes `copywriter` → `revisor-copy`. Ver `Base/roteiro-copy/processo-copy-robusta.md`.
`node motor/copy/verificar.mjs <copy.json> --html` · anotações em balão: `node motor/copy/anotar.mjs servir <pasta>` → `http://127.0.0.1:4320/`.

## 3. Carrossel (Instagram 4:5)
1. Roteiro em `carrossel.json` (estrutura e regras em `Base/roteiro-copy/carrossel.md`) + `bar.md` com 5–7 mecanismos da referência escolhida.
2. `node motor/carrossel/carrossel.mjs <pasta>/carrossel.json` → valida (estrutura, acento, número com fonte) → PNG 1080×1350 + prancha + legenda.
3. Capas: `capas-ref.mjs` (copiar o mecanismo de capas de referência) ou `capas-pinterest.mjs` (imagem de impacto recriada com IA + texto em código).
4. Agente `carrossel` dirige e registra a crítica em `critica.md`.

## 4. Imagem com IA
- Imagem de impacto: referência do Pinterest → prompt → modelo de imagem (ex.: Google via MCP do Magnific/Flow) com as fotos reais do rosto como referência.
- Regras: texto nunca é gerado pela IA (sempre código por cima); rosto só com referências reais/aprovadas; cada rodada de crédito com preço mostrado e aprovado; apagar do serviço depois de baixar.

## 5. Vídeo / Reels
- **Com RAW (rosto):** `video/inventario.mjs` (transcreve o acervo) → `video/cortar.mjs` (corta silêncios/regravações) → plano de inserts → `render/formato-a.mjs` (rosto cinematográfico + inserts em tela cheia) ou `render/formato-b.mjs` (painel + recorte da pessoa) → legenda (`video/legenda.mjs`) → som (`render/som.mjs`) → prévia leve (`video/previa.mjs`) → aprovação → render final.
- **Sem RAW:** `render/cenas.mjs <plano.json> <saida.mp4>` (avatar, documentário, explainer, metáfora) · post animado F3: `render/post.mjs <spec.json>`.
- **Editor visual:** `npm run editor` → `http://127.0.0.1:4317` (ajustar inserts, textos e tempos, renderizar).
- Formatos e perícia: `Base/formato-principal.md`, `Base/formatos-referencias.md`, `Base/pericia-edicao.md`, `Base/variacoes-ui.md`.

## 6. Publicar e medir
Ficha de resultado em `Base/copy/resultados/<peca>.json` (ver `docs/BANCO-DE-DADOS.md`). Técnica só vira "validada" com dado; teste A/B muda uma variável por vez.
