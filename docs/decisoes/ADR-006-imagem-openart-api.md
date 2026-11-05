---
tipo: adr
data: 2026-10-31
status: vigente
refs: [ADR-005, T-009, commit 92f92c3]
---
# ADR-006 — Geração de imagem via API do OpenArt com preço consultado antes
## Contexto
- OpenArt CLI 0.1.1 não expõe parâmetros do modelo (resolução, referências).
- Plano Starter: 4000 créditos. image2image 10–44; image2video 50–600 créditos.
## Decisão
- `motor/imagem/openart.mjs` chama `https://openart.ai/suite/api/cli/v1` direto: `generate`, `model-cost` (POST, preço exato por configuração), download.
- Antes de cada rodada: consultar `model-cost`, apresentar orçamento; usuário aprova por rodada.
- Só gastar em teste que entre no resultado final.
- Economia: animação, UI e texto em código; rascunho barato → final caro; ficha de personagem única reutilizada; biblioteca de imagens; resolução certa (Nano Banana Pro 2K = 1K = 40 créditos).
- `visualReferences` exigem id de upload.
## Alternativas descartadas
- CLI `openart` pura (motivo: sem parâmetros do modelo).
- image2video para animar (motivo: 50–600 créditos; animação sai em código).
## Consequências
- Custo previsível; complementa/substitui OpenRouter (ADR-005) para imagem com persona.
