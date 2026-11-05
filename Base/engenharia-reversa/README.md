# Biblioteca de referências

Antes de cada vídeo novo: escolha 1 referência aqui, abra o estudo e use a seção **8. Esqueleto**.
Mídia original de cada uma: `Conteudo/Videos/Engenharia Reversa/<pasta>/`.

## Como escolher (3 perguntas)
1. **O que tenho hoje?** Uma notícia oficial → F3 notícia. Uma dor engraçada do nicho → meme. Uma ideia ou lição → F11 ou F9. Uma história de marca → F1/F2.
2. **Preciso de voz?** Enquanto a amostra nova não chega, use só as linhas com voz = não.
3. **Quanto custa?** Prefira "0 crédito". Se for gastar crédito, o criador aprova antes.

## Catálogo
| ref | formato | objetivo | gancho | voz? | crédito? | esforço | duração | serve para |
|---|---|---|---|---|---|---|---|---|
| [caioimori-claude-duet](caioimori-claude-duet.md) | F3 post | alcance | textual | não | 0 | 10 min | ~12 s | lançamento oficial com animação |
| [f3-noticia-a](f3-noticia-a.md) | F3 notícia | conversão | textual + demo | não | 0 | 15 min | curto | novidade + CTA fixo "Comente PALAVRA" |
| [f3-noticia-b](f3-noticia-b.md) | F3 notícia | autoridade | textual (ângulo de uso) | não | 0 | 15 min | ~12 s | ferramenta nova + limite honesto |
| [nerdsdenegocios](nerdsdenegocios.md) | F3 post legendado | alcance | 3 atrações no título | não | 0 | 20 min | ~70 s | anúncio oficial longo |
| [f3-meme](f3-meme.md) | F3 meme | engajamento | visual (grito) + legenda | não | 0 | 10 min | ~30 s | dor engraçada do nicho |
| [danieldalen-sorte](danieldalen-sorte.md) | time-lapse | identificação | meme textual | não | 0 | gravação de tela | ~15 s | provar o trabalho por trás |
| [neuronvisuals](neuronvisuals.md) | F11 comparação | compartilhamento | tela dividida + placar | não | 0 (animação nossa) | 1 dia | ~30 s | perfil A × perfil B |
| [sixtyrich](sixtyrich.md) | F11 metáfora | compartilhamento | ironia dramática | não | sim (cenas) | médio | ~20 s | lição sem sermão |
| [avatar-ia](avatar-ia.md) | F3 comentada | conversão | pergunta + "sim" seco | sim | 0 | médio | ~40 s | opinião sobre mudança do mercado |
| [trypromptwise](trypromptwise.md) | F9 aula | salvamentos | dor exata | sim | sim (cenas) | médio | ~35 s | ensinar 1 variável em níveis |
| [copfybr](copfybr.md) | F1 história 3D | seguidores (série) | 2ª pessoa + data | sim | sim (3D) | alto | ~75 s | história de marca com revelação |
| [founded](founded.md) | F2 mini-doc | retenção | negação do óbvio | sim | 0 (fotos) | alto | ~87 s | história de pessoas/empresas |
| [arkom-diagnostico](arkom-diagnostico.md) | anúncio B2B (Stories) | conversão (diagnóstico) | mito invertido | sim (RAW do dono) | 0 | RAW + inserts de UI | ~120 s | serviço B2B: "a mesma segunda-feira, duas vezes" + funil quiz→agenda/comunidade |

Mecanismos detalhados e fila de produção: [`sintese.md`](sintese.md). Vocabulário: [`../roteiro-copy/metodo.md`](../roteiro-copy/metodo.md).

## Ao usar uma referência
- Anote no roteiro: `ref: <nome>` e qual mecanismo foi usado.
- Copie a **estrutura**, nunca o layout, a marca, a voz ou a mídia do criador (seção 11 de cada estudo).
- Fatos só de fonte oficial; marcar `[CONFERIR]` até checar.

## Adicionar referência nova
1. Pasta da mídia em `Conteudo/Videos/Engenharia Reversa/<nome>/` e rodar `desconstruir.mjs`.
2. Agente `engenheiro-reverso` escreve `<nome>.md` com as 11 seções.
3. Acrescentar uma linha no catálogo acima e, se houver mecanismo novo, na `sintese.md`.
