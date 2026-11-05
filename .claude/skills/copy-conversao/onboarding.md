# Onboarding (spec-driven): perguntas obrigatórias

Nenhuma copy é escrita antes destas respostas. O agente pergunta ao usuário (uma rodada por bloco), grava as respostas nos arquivos indicados e roda `node .claude/skills/copy-conversao/scripts/onboarding-check.mjs`. Enquanto o check falhar, **não escreve copy**. Resposta que o usuário não sabe = `"a-confirmar"` (vira pendência, nunca invenção).

## Bloco 1 — Identidade (`copy/identidade/marca.json`)
| Campo | Pergunta |
|---|---|
| `marca` | Qual é o nome da marca/empresa? |
| `quem_fala.nome`, `quem_fala.cargo` | Quem aparece/fala nos vídeos? Nome e cargo. |
| `tom.descricao` | Como a marca fala? (ex.: direto e coloquial · sofisticado sem gírias). Se não houver dado, o tom vira teste A/B. |
| `tom.exemplos` | 2–3 frases que soam como a marca. |
| `proibidos_marca` | Palavras, promessas ou temas que a marca nunca usa. |
| `visual.cores`, `visual.fontes` | Cores e fontes para textos de tela. |
| `plataformas` | Onde a peça vai rodar (Meta Ads, Reels, TikTok, YouTube…). |

## Bloco 2 — Público (`copy/nichos/<nicho>.json`)
| Campo | Pergunta |
|---|---|
| `nicho` | Qual nicho/segmento? (um público por criativo) |
| `publico` | Quem decide a compra? Porte, situação, quem vende hoje. |
| `consciencia` | O que ele já sabe? (inconsciente · problema · solucao · produto · total) |
| `dores` | Quais dores, com fonte (conversa real, comentário, entrevista)? |
| `glossario` | Como ele fala? Termos com fonte (se não houver: etapa de pesquisa de voz do cliente). |
| `proibidos` | Termos que afastam esse público (jargão de outro segmento, palavra de agência). |

## Bloco 3 — Oferta e fatos (`copy/clientes/<cliente>.json`)
| Campo | Pergunta |
|---|---|
| `oferta.carro_chefe` | Qual produto/serviço o anúncio vende primeiro? |
| `oferta.inclui` | O que está incluído (só o que é verdade hoje)? |
| `oferta.nao_vender_no_anuncio` | O que fica para depois (pós-venda, outro criativo)? |
| `oferta.preco_modelo` | Como cobra? (mensalidade, % da venda, projeto…) |
| `oferta.risco_zero` | Existe garantia/risco zero real? Qual? |
| `oferta.cta_destino` | Para onde vai o clique (formulário, WhatsApp, agenda)? Quais perguntas/filtro? |
| `fatos[]` | Números, cases, depoimentos — cada um com `fonte` e `status`. |
| `proibido_prometer` | O que não pode ser prometido (ex.: garantia de venda). |

## Bloco 4 — Referências e métricas (`copy/referencias/`, `copy.config.json`)
| Campo | Pergunta |
|---|---|
| referência validada | Existe anúncio/roteiro que já funcionou (com métrica ou dias no ar)? Mande o link/arquivo. |
| `metrica_decisora` | Qual número decide se a peça funcionou? (ex.: custo por formulário qualificado) |
| `verba_teste` | Quanto por criativo/semana para testar? |
