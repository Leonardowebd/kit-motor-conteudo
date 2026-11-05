---
tipo: adr
data: 2026-10-31
status: vigente
refs: [ADR-006, commit 6401d70, commit 70cb95e]
---
# ADR-007 — Regra de identidade em geração com rosto
## Contexto
- Ficha do personagem v1–v3 falhou (envelhecido, rosto largo, outra pessoa); v4 aprovada.
## Decisão
- Referências = só fotos reais, rosto recortado em alta resolução (`motor/video/rosto.swift`, Vision/macOS).
- Prompt mínimo: "mesma pessoa"; sem descrever etnia/traços; sem pedir correção de distorção.
- Nunca imagem gerada por IA como referência.
- Toda geração com rosto parte da ficha oficial `{acervo}/Conteudo/Personagem/oficial/` (painel três quartos preferido).
## Alternativas descartadas
- Referência reduzida (rosto ~150 px) → envelhece (v1).
- Descrição textual de traços + referência de IA → outra pessoa (v3).
## Consequências
- Identidade estável entre peças; regra em `Base/` (commit `70cb95e`).
