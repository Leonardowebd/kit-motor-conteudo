# AGENTS.md — motor-conteudo

Motor de produção de conteúdo (vídeo vertical + carrossel) com IA, spec-anchored. Objetivo final: produto que qualquer criador instala e aponta para o próprio acervo e marca.

## Mapa
| Caminho | O que é |
|---|---|
| `.spec/` | Especificações (fonte da verdade): `features/video` (prioridade), `features/carrossel` (ativo), `features/copy` (ativo: verificador + agentes copywriter/revisor-copy) |
| `Base/` | Base de conhecimento consultada antes de criar: `MARCA.md`, `referencias-video.md`, `referencias-carrossel.md` |
| `Estudo/` | Estudos do acervo de referência (método, licenças) |
| `motor/` | Código do motor |
| `docs/` | Documentação do processo (dono: agente `escrivao`) |
| `conteudo.config.json` | `acervo`: raiz das mídias (fora do git) |

## Regras
0. **Onboarding primeiro:** `npm run onboarding` precisa estar COMPLETO antes de criar qualquer peça; se não estiver, faça as perguntas de `docs/ONBOARDING.md` ao usuário.
1. Leia `Base/MARCA.md` e a referência do trilho antes de gerar qualquer peça.
2. Texto em peça é sempre código; IA de imagem nunca escreve texto.
3. Geração paga (OpenRouter/OpenArt) só com orçamento aprovado pelo usuário.
4. Todo critério de aceite vira teste `@spec:AC-xxx`; "pronto" = `node ~/.claude/skills/onp-spec-driven/scripts/onp-spec.mjs audit --ci` com exit 0.
5. Mídia (MP4/MOV/WAV) nunca entra no git; fica no `acervo`.
6. Ao fim de cada sessão ou decisão relevante, chame o agente `escrivao`.
7. Não copiar código/texto de repositórios sem licença (ver `Estudo/01-estudo-acervo.md` §6).
8. Nunca inventar dado em card (números, estrelas, preços, datas). Só dado dito na fala ou verificado com fonte; sem dado, usar rótulo.
9. Motores de IA (padrão do criador original; troque no onboarding): imagem pelo Google (Flow/Magnific), vídeo Google ou OpenArt. **Crédito de qualquer motor só com o preço mostrado e aprovação explícita por rodada.**
10. **REGRA ABSOLUTA — só fatos.** A única verdade são fatos, métricas e técnicas validadas; o resto é especulação e vai marcado como hipótese ou `[CONFIRMAR]`. Se um pedido (inclusive do criador) não tiver base, dizer isso e propor teste, em vez de concordar.
11. **Briefing não é texto.** O que o cliente ou o criador diz é intenção, restrição ou fato; nunca vai literal para copy, roteiro ou peça. A linguagem vem do público, com fonte (glossário do nicho em `Base/copy/nichos/`).
12. **Copy segue `Base/roteiro-copy/processo-copy-robusta.md`.** Quem escreve é o agente `copywriter`; quem aprova é o `revisor-copy`. Nada chega ao criador sem `node motor/copy/verificar.mjs <copy.json>` limpo. Correção = voltar à etapa que errou e reescrever, nunca trocar palavra por substituição automática.
13. **Aprender e passar o bastão em toda etapa.** Ao terminar cada etapa (pesquisa, briefing, rascunho, revisão, correção, entrega, resultado), escrever um handoff curto na pasta do trabalho (`handoff.md`: o que foi feito, decisões com fonte, erros, o que falta, próxima etapa). Todo erro corrigido pelo criador vira lição com evidência em `docs/aprendizados.md` e, se for regra, entra aqui ou na constituição. Robustez antes de velocidade.
