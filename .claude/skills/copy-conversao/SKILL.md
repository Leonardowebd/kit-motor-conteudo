---
name: copy-conversao
description: Método para escrever copy de anúncio e roteiro de vídeo/carrossel pensada para conversão, cliques e engajamento, com base em fatos, linguagem real do público e mecanismos de referências medidas. Use sempre que for criar, revisar ou corrigir copy, gancho, CTA ou roteiro de anúncio, para qualquer nicho ou cliente. Produz um copy.json que precisa passar em motor/copy/verificar.mjs.
---

# Copy para conversão (método do motor)

**Não é fôrma.** É processo com prova. Regras-mãe: `AGENTS.md` itens 10–13 e `.spec/constituicao.md` P-010..P-012.

## Entradas obrigatórias (ler antes de escrever)
1. `Base/roteiro-copy/processo-copy-robusta.md`: as 8 etapas e a regra de handoff.
2. `Base/roteiro-copy/metodo.md`: checklist (3 C's, 4 ganchos, storytelling, CTA em 4 passos).
3. Nicho: `Base/copy/nichos/<nicho>.json` (proibidos, glossário com fonte, fatos do setor).
4. Cliente: `Base/copy/clientes/<cliente>.json` (oferta, fatos com status, o que é proibido prometer).
5. Referências medidas: `Base/engenharia-reversa/*.md`, `Base/roteiro-copy/estudo-fonetico.md`.
6. Handoff anterior do cliente: `Base/roteiro-copy/handoff-<cliente>.md` e `handoff.md` da pasta do trabalho.

## Saída
Uma pasta de trabalho com:
- **`briefing.md`:** as palavras do cliente/criador, literais. Só para checar eco, nunca para virar texto.
- **`copy.json`:** blocos (gancho, A, virada, B, CTA) com itens `fala | narracao | cena | tela | ia`. Cada fala tem `origem` (`glossario`, `referencia:<estudo>`, `fato:<id>` ou `hipotese`) e, se houver, a versão `b` de tom. Também traz `publico.consciencia`, `checklist`, `ganchos_alternativos` (≥2 com prós e contras) e `etapas` (handoff de cada etapa).
- **`handoff.md`:** um bloco por etapa concluída.
- Página: `node motor/copy/verificar.mjs <copy.json> --html`.

## Formato do copy.json (mínimo)
```json
{ "id": "", "titulo": "", "cliente": "Base/copy/clientes/x.json", "nicho": "Base/copy/nichos/y.json", "briefing": "briefing.md",
  "duracao": {"min": 40, "max": 60}, "ritmo_ppm": 180, "gancho_max_palavras": 15,
  "publico": {"avatar": "", "consciencia": "inconsciente|problema|solucao|produto|total"},
  "blocos": [{"papel": "gancho", "itens": [{"tipo": "fala", "texto": "", "origem": "", "b": ""}]}],
  "ganchos_alternativos": [{"texto": "", "pros": "", "contras": ""}],
  "checklist": {"3cs": {"curiosidade": "", "clareza": "", "consequencia": ""}, "4ganchos": {"verbal": "", "textual": "", "visual": "", "micro": ""}, "cta": {"valor_antes": "", "comando": ""}},
  "etapas": {"briefing": {"feito": "", "decisoes": "", "falta": "", "proximo": ""}, "publico": {}, "linguagem": {}, "mecanismo": {}, "prova": {}, "rascunho": {}, "auditoria": {}} }
```

## Princípios que o código não pega (o revisor checa)
- A frase 1 vende a 2? A 2 vende a 3? (`.claude/skills/principios-conteudo`)
- O público está no nível de consciência declarado? Fala da dor dele, com as palavras dele.
- O mecanismo da referência foi copiado, e não o texto?
- Sem prova, a estrutura compensa (risco zero real, processo verificável) em vez de inventar?
- Tom: sem dado, testar A × B; não decidir no escuro.

## Aprender
- Erro apontado pelo criador → lição em `docs/aprendizados.md`, com evidência.
- Se o erro virar regra checável → novo teste em `motor/copy/verificar.test.mjs`.
- Resultado publicado → ficha de métricas (feature futura `resultados`). Técnica só vira "validada" com dado.
