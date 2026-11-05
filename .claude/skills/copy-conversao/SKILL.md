---
name: copy-conversao
description: Escreve e revisa copy de anúncio e roteiro (vídeo, Reels, carrossel) para conversão, com base em fatos, linguagem real do público e mecanismos de referências medidas. Use para criar, revisar ou corrigir copy, gancho, CTA ou roteiro de anúncio, para qualquer nicho ou cliente. Começa por um onboarding obrigatório (spec-driven) e só entrega copy que passa no verificador e no agente revisor-copy.
---

# Copy para conversão

**Não é fôrma; é processo com prova.** Leia antes: `CLAUDE.md` do projeto (regras 1–5), `docs/processo-copy-robusta.md`, `docs/checklist.md`, `docs/banco-de-dados.md`.

## Fluxo obrigatório
1. **Onboarding (gate):** `node .claude/skills/copy-conversao/scripts/onboarding-check.mjs`. Se falhar, faça as perguntas de `docs/onboarding.md` ao usuário (use AskUserQuestion quando houver opções; uma rodada por bloco), grave as respostas nos JSON de `copy/` e rode de novo. **Não escreva copy com o gate falhando.** "Não sei" vira `a-confirmar`, nunca invenção.
2. **Pasta do trabalho:** `trabalhos/<cliente>/<AAAA-MM-DD>-<peca>/` com `briefing.md` (palavras literais do pedido) e `copy.json` (a partir de `templates/copy.json`).
3. **Etapas** (briefing → publico → linguagem → mecanismo → prova → rascunho → auditoria), cada uma com handoff no `copy.json` e em `handoff.md`.
4. **Verificar:** `node .claude/skills/copy-conversao/scripts/verificar.mjs <copy.json> --html` até zero ERRO.
5. **Revisar:** chamar o agente `revisor-copy` (independente). Corrigir voltando à etapa que errou.
6. **Mostrar ao usuário:** `node .claude/skills/copy-conversao/scripts/anotar.mjs servir <pasta>` e abrir `http://127.0.0.1:4320/`. Ele anota em balões; leia com `anotar.mjs ler <pasta>` antes de corrigir.
7. **Aprender:** erro corrigido pelo usuário → lição em `copy/aprendizados.md`; regra checável → teste novo em `scripts/verificar.test.mjs`; peça publicada → ficha em `copy/resultados/`.

## Pesquisa (ferramentas)
- **Anúncios ativos** (Biblioteca da Meta, sem login): `node .claude/skills/copy-conversao/scripts/anuncios.mjs <pasta> --midia all "busca"` · `--contar` só conta · aceita link de página ordenada por impressões. Vídeos: `anuncios-baixar.mjs <pasta> "<regex anunciante>"` (precisa do Google Chrome instalado).
- **Voz do cliente** (YouTube, legendas): `uvx yt-dlp --skip-download --write-auto-subs --sub-langs "pt.*" --sub-format vtt -o "%(id)s" <url>` → `python3 .claude/skills/copy-conversao/scripts/legendas.py <pasta> <saida.md> palavra1 palavra2`.
- **Medidas de fala** (opcional): `fonetica.py` (precisa de `numpy librosa` e ffmpeg).

## O que o código não pega (o revisor checa)
Frase 1 vende a 2? · fala com a dor do nível de consciência declarado? · usa só palavras do público? · copia mecanismo e não texto? · prova real ou estrutura de compensação? · encenação não parece cliente real? · tom sem dado vira teste A/B.
