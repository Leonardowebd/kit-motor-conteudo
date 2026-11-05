# Por que um banco de dados robusto é o centro de tudo

Copy boa não sai de "criatividade": sai de **fatos certos, na língua certa, com um mecanismo que já funcionou**. Sem um banco organizado, cada copy recomeça do zero, o agente inventa (número, promessa, jargão) e nada do que funcionou vira aprendizado. O banco é o que transforma tentativa em sistema.

O que o banco precisa garantir:
1. **Fonte para tudo.** Cada fato, termo e referência tem origem (link, minuto do vídeo, quem confirmou e quando).
2. **Status.** Fato `confirmado` × `a-confirmar`. O verificador bloqueia publicação com pendência.
3. **Separação.** Método (a skill) ≠ nicho (linguagem do público) ≠ cliente (oferta e fatos) ≠ trabalho (uma peça). Isso deixa trocar de nicho ou cliente sem refazer o método.
4. **Retroalimentação.** Resultado de cada peça publicada volta para o banco e decide o que é "técnica validada".

## Estrutura (padrão, modular)
```
Base/                          ← BANCO DE CONHECIMENTO (texto, no git)
  MARCA.md                     ← identidade (onboarding bloco 1)
  formato*.md, pericia-edicao.md, variacoes-ui.md, texturas-design.md, referencias-*.md  ← como fazemos vídeo e carrossel
  engenharia-reversa/<ref>.md  ← mecanismos medidos (o que copiar e o que não copiar)
  roteiro-copy/                ← processo de copy e estrutura de carrossel
  copy/nichos/<nicho>.json     ← público, glossário COM FONTE, proibidos, fatos do setor
  copy/clientes/<cliente>.json ← oferta, fatos com status, proibido prometer
  copy/resultados/<peca>.json  ← métricas de cada peça publicada
docs/aprendizados.md           ← erro corrigido → lição com evidência
docs/decisoes/ADR-*.md         ← decisões de arquitetura
<acervo>/                      ← MÍDIAS (fora do git): Identidade, Personagem, RAW, Produção, Finalizados, Carrossel, Clientes/<cliente>/<peça>
```

## Ficha de resultado (`copy/resultados/<peca>.json`)
```json
{ "peca": "trabalhos/cliente/2026-11-04-anuncio/copy.json", "plataforma": "meta", "inicio": "2026-11-10", "fim": "2026-11-17",
  "variavel_testada": "ambiente: carro", "braco": "A", "verba": 300,
  "metricas": { "impressoes": 0, "retencao_3s": 0, "thruplay": 0, "cliques": 0, "formularios": 0, "formularios_qualificados": 0, "custo_por_qualificado": 0 },
  "fonte": "export do gerenciador de anúncios (arquivo)", "conclusao": "hipótese até significância" }
```
Quando várias pessoas e nichos usarem o mesmo formato de ficha, os resultados somam — e o método aprende com todos (anonimizar antes de compartilhar).
