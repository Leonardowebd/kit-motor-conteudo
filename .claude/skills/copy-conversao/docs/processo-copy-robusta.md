# Processo de copy robusta (obrigatório)

Toda copy (anúncio, roteiro de vídeo, carrossel) passa por estas etapas. **Ao fim de cada etapa, registre o handoff** em `copy.json → etapas.<etapa>` (`feito`, `decisoes`, `falta`, `proximo`) e anexe um bloco em `handoff.md` da pasta do trabalho. O verificador reprova etapa sem handoff.

| # | Etapa | O que fazer | Saída |
|---|---|---|---|
| 0 | **briefing** | Salvar as palavras do cliente/usuário **literais** em `briefing.md`. Separar em intenção, restrição e fato. **O briefing nunca vira texto da peça.** | `briefing.md` |
| 1 | **publico** | Quem decide, porte, situação. Nível de consciência (Schwartz): inconsciente · problema · solução · produto · total. | `publico` no copy.json |
| 2 | **linguagem** | Glossário do nicho com **fonte** (entrevistas, conversas de venda, comentários). Contar termos: o que o público usa × o que é palavra de agência. A copy só usa termos do glossário. | `copy/nichos/<nicho>.json` |
| 3 | **mecanismo** | Escolher a estrutura em uma referência **medida** (`copy/referencias/`): qual, com qual indicador (métrica, dias no ar × versões), o que se copia (mecanismo) e o que não se copia (texto). | `etapas.mecanismo` |
| 4 | **prova** | Listar só o que existe (cases com número, risco zero real, processo). Sem prova, a estrutura compensa (ex.: risco zero) — **nunca inventar**. | fatos em `copy/clientes/<cliente>.json` |
| 5 | **rascunho** | Planejar **antes** quantas palavras vai cada bloco (gancho ≤ 15; duração-alvo ÷ ritmo). Escrever para caber; nunca cortar depois e encher. | `copy.json` |
| 6 | **auditoria** | Verificador limpo + agente `revisor-copy` (independente) + 2 ganchos alternativos com prós/contras. | `revisao.md` |
| 7 | **correção** | Pedido de mudança → voltar à etapa que gerou o problema e **reescrever o bloco**. Proibido trocar palavras por substituição automática. | novo handoff |

## Anotações do usuário (balões)
`node .claude/skills/copy-conversao/scripts/anotar.mjs servir trabalhos/<cliente>/<peca>` → abre `http://127.0.0.1:4320/`. O usuário seleciona trechos e anota; as notas ficam em `anotacoes/<pagina>.json`. **Antes de corrigir:** `anotar.mjs ler <pasta>`.

## Depois de publicar
Registrar métricas em `copy/resultados/` (ver `docs/banco-de-dados.md`). Uma técnica só passa de "hipótese" a "validada" com dado.
