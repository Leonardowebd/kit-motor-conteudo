# Por que um banco de dados robusto é o centro de tudo

Copy boa não sai de "criatividade": sai de **fatos certos, na língua certa, com um mecanismo que já funcionou**. Sem um banco organizado, cada copy recomeça do zero, o agente inventa (número, promessa, jargão) e nada do que funcionou vira aprendizado. O banco é o que transforma tentativa em sistema.

O que o banco precisa garantir:
1. **Fonte para tudo.** Cada fato, termo e referência tem origem (link, minuto do vídeo, quem confirmou e quando).
2. **Status.** Fato `confirmado` × `a-confirmar`. O verificador bloqueia publicação com pendência.
3. **Separação.** Método (a skill) ≠ nicho (linguagem do público) ≠ cliente (oferta e fatos) ≠ trabalho (uma peça). Isso deixa trocar de nicho ou cliente sem refazer o método.
4. **Retroalimentação.** Resultado de cada peça publicada volta para o banco e decide o que é "técnica validada".

## Estrutura (padrão, modular)
```
copy/
  identidade/marca.json        ← respostas do onboarding: quem fala, tom, proibições da marca
  nichos/<nicho>.json          ← público, glossário COM FONTE, termos proibidos/evitar, fatos do setor
  clientes/<cliente>.json      ← oferta, fatos com status, o que é proibido prometer
  referencias/<ref>.md         ← mecanismos medidos (o que copiar e o que não copiar)
  voz-cliente/<nicho>/         ← transcrições/entrevistas que alimentam o glossário
  resultados/<peca>.json       ← métricas de cada peça publicada
  aprendizados.md              ← erro corrigido → lição com evidência
trabalhos/<cliente>/<AAAA-MM-DD>-<peca>/
  briefing.md  copy.json  copy.html  handoff.md  revisao.md  anotacoes/
```

## Ficha de resultado (`copy/resultados/<peca>.json`)
```json
{ "peca": "trabalhos/cliente/2026-11-04-anuncio/copy.json", "plataforma": "meta", "inicio": "2026-11-10", "fim": "2026-11-17",
  "variavel_testada": "ambiente: carro", "braco": "A", "verba": 300,
  "metricas": { "impressoes": 0, "retencao_3s": 0, "thruplay": 0, "cliques": 0, "formularios": 0, "formularios_qualificados": 0, "custo_por_qualificado": 0 },
  "fonte": "export do gerenciador de anúncios (arquivo)", "conclusao": "hipótese até significância" }
```
Quando várias pessoas e nichos usarem o mesmo formato de ficha, os resultados somam — e o método aprende com todos (anonimizar antes de compartilhar).
