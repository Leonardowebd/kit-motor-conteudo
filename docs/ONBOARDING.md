# Onboarding (spec-driven): perguntas obrigatórias

O motor não cria nenhuma peça enquanto `npm run onboarding` disser **INCOMPLETO**. O agente faz estas perguntas ao usuário (uma rodada por bloco), grava as respostas nos arquivos indicados e roda o gate de novo. "Não sei" = `a-confirmar`: vira pendência visível, nunca invenção.

## Bloco 1 — Identidade (visual, voz, rosto)
| Pergunta | Onde grava |
|---|---|
| Onde fica o acervo de mídias? (pasta fora do git; `npm run criar-acervo -- <pasta>` cria a estrutura) | `conteudo.config.json → acervo` |
| Nome da marca, objetivo, plataformas, idioma | `Base/MARCA.md` |
| Cores: dominante, fundo claro, acento único, escuro (hex) | `Base/MARCA.md` + `motor/marca/marca.css` |
| Fontes de título e corpo (arquivos em `<acervo>/Identidade/…`) | `Base/MARCA.md` (+ `marca.css`/`legenda.mjs` se trocar Clash/Satoshi) |
| Tom de voz e 2–3 frases que soam como a marca (sem dado → teste A/B) | `Base/MARCA.md` |
| O que a marca nunca diz ou mostra | `Base/MARCA.md → Proibido` |
| Quem aparece nos vídeos? Nome, @, bio, foto | `motor/marca/perfil.json` |
| Fotos reais do rosto em alta (se houver geração com IA do rosto) | `<acervo>/Conteudo/Personagem/referencias/` |
| Quais motores de IA podem gastar crédito, e quem aprova cada rodada? | `AGENTS.md` (regra de crédito) |

## Bloco 2 — Público (um por criativo)
| Pergunta | Onde grava |
|---|---|
| Nicho e quem decide a compra | `Base/copy/nichos/<nicho>.json → nicho, publico` |
| Nível de consciência (inconsciente · problema · solução · produto · total) | `publico.consciencia` (na copy) |
| Dores e palavras do público **com fonte** (conversas de venda, comentários, entrevistas) | `nichos/<nicho>.json → dores, glossario` |
| Termos que afastam esse público | `nichos/<nicho>.json → proibidos, evitar` |

## Bloco 3 — Oferta e fatos
| Pergunta | Onde grava |
|---|---|
| Carro-chefe, o que inclui, o que fica para depois | `Base/copy/clientes/<cliente>.json → oferta` |
| Modelo de preço e risco zero real | `oferta` |
| Destino do clique (formulário/WhatsApp) e filtro | `oferta` |
| Números, cases, depoimentos — cada um com fonte e status | `fatos[]` |
| O que é proibido prometer | `proibido_prometer` |

## Bloco 4 — Referências e métricas
| Pergunta | Onde grava |
|---|---|
| Peças que já funcionaram (link/arquivo + métrica ou dias no ar) | `Base/engenharia-reversa/<ref>.md` (agente `engenheiro-reverso`) |
| Métrica que decide (ex.: custo por formulário qualificado, retenção 3 s) e verba de teste | `Base/copy/resultados/` (ficha por peça) |
