# Formatos — análise das referências (2026-11-01)

Pasta: `Conteudo/Videos/Formatos (referencias)/` (16 vídeos). Análise por cortes detectados, folhas de
2 quadros/s e transcrição. Nomes provisórios até o criador mandar os nomes oficiais.
Produção: **Flow** (cenas/imagens Google), **OpenArt** (cenas, áudio, voz clonada ElevenLabs), **Magnific** (B-rolls), código (motion).

| # | Formato (provisório) | Referência | Mecanismo | RAW? | Produção |
|---|---|---|---|---|---|
| F1 | **História animada com avatar 3D** | copfybr (Coca-Cola 1886) | o criador vira um personagem 3D estilo animação e vive a história em cenas de época; legenda 1 palavra por vez no centro; etiquetas amarelas com data/número ("ATLANTA, 1886", "5 CENTAVOS"); ~18 cenas em 75 s, cada cena ~4 s com câmera lenta | não | personagem fixo (Flow, imagem de referência do rosto) → cenas por frase (Flow) → animação curta (Veo/OpenArt) → voz clonada → legenda/etiquetas em código |
| F2 | **Documentário rápido de fotos** | founded (Alexander Wang) | fotos (reais ou geradas) trocando a cada ~0,8 s (109 cortes em 87 s), zoom lento em cada uma; cartelas vermelhas chapadas com 1 frase em serifa; logos das empresas em fundo claro; narração contínua | não | roteiro → lista de imagens por frase (fotos oficiais + Flow para cenas) → narração clonada → montagem em código (Ken Burns, cartelas) |
| F3 | **Post do X animado** | caioimori (Claude Duet), nerds de negócios (Snapchat Specs) | moldura fixa de post (avatar, nome, verificado, texto em negrito) no topo; vídeo oficial do anúncio no quadro; legenda curta por cima do vídeo; sem rosto | não | print/estrutura do post em código + vídeo oficial (pesquisador) + voz opcional |
| F4 | **Notícia com rosto + card no topo** | caioimori (Reason, ArtCraft) | rosto em tela cheia, card branco/escuro no topo com UI do produto animando, título em caixa ("MONTE A CENA ANTES DE GERAR"), legenda serifada | sim | nosso Formato A/B (já pronto) |
| F5 | **Rosto + diagrama que se constrói** | mate.jimenez (TOFU) | metade de cima: diagrama/fluxograma sendo montado com zoom e destaque azul em cada termo falado; metade de baixo: rosto | sim | Formato B + componente "diagrama" em código |
| F6 | **Rosto + site rolando** | andrew.plerdy | topo: site/UI rolando sem parar; baixo: webcam com reações exageradas; título fixo em caixa | sim | Formato B com mídia rolando |
| F7 | **Reação / POV** | kacio.filipe | alterna o clipe de outra pessoa (fala polêmica) com o rosto reagindo em silêncio; título "POV: reaja comigo…" | sim (reação) | corte do clipe (fonte oficial) + RAW da reação |
| F8 | **Antes/depois de IA em 3 faixas** | lucasndesign (rotoscopia) | tela em 3 faixas: máscara do recorte / versão gerada por IA / gravação original, sincronizadas; narração conta a história da técnica | sim + IA | RAW → recorte (já temos) → vídeo-para-vídeo (OpenArt/Higgsfield) → empilhar em código |
| F9 | **Ensino com cena gerada + tipografia gigante** | trypromptwise (lentes) | personagens gerados conversando (pergunta/resposta), depois cada conceito vira um plano com número enorme e palavra gigante sobre a cena ("24MM WIDE"); CTA "COMMENT 5" | não | cenas Veo/OpenArt com diálogo + tipografia em código |
| F10 | **Tipografia cinética + transformação** | tseily (Higgsfield) | palavras gigantes com máscara/vídeo dentro, cortes de 0,3 s, closes de mãos/detalhes, tela do app, antes/depois da transformação | sim + IA | RAW curto + geração IA + tipografia em código |
| F11 | **Metáfora visual sem fala** | sixtyrich (minerando no celular), neuronvisuals (perfeccionista × ação) | cena cinematográfica ou animação de bonecos contando uma metáfora; quase sem texto; uma frase final ("STOP BEING DISTRACTED"); música | não | cenas Veo/OpenArt encadeadas + 1 tipografia; animação de bonecos pode ser código |
| F12 | **Tutorial com rosto + prints** | raycfu | rosto, título amarelo em serifa no topo, prints/cards entrando a cada frase | sim | nosso Formato A |
| F13 | **Opinião só rosto** | enricomarques | talking head puro, gancho polêmico, legenda 1 palavra no meio, sem cortes visíveis | sim | Formato A mínimo |

## Padrões que se repetem
- **Gancho em 1 frase-choque** e legenda grande palavra por palavra (F1, F9, F13).
- **Etiquetas de dado** (data, preço, número) como ponto de ancoragem visual (F1, F2, F9) — só com dado real.
- **Ritmo:** cenas geradas ~3–4 s; fotos ~0,8 s; tipografia cinética ~0,3 s.
- **Sem RAW:** voz clonada + imagens Google + animação curta + motion em código cobrem F1, F2, F3, F9, F11.

## Próximos passos
1. criador manda os nomes oficiais dos formatos → renomear esta tabela.
2. Escolher o 1º formato sem RAW (sugestão: F1 ou F2) e montar o pipeline: roteiro → cenas → voz clonada → montagem.
3. Créditos de Flow/OpenArt/Magnific só com aprovação por rodada.

## Nomes usados no mercado (pesquisa 2026-11-01)
| Nosso | Nome de mercado | Observação |
|---|---|---|
| F1 | **AI Avatar Storytelling / Animated Story (3D)** | narrativa 3D < 50 s; Reels favorece 3D estético mais que o TikTok (1 análise) |
| F2 | **Documentary Edit / Narrated Photo Story** | cortes rápidos de fotos + narração |
| F3 | **Tweet/Post Video (post animado)** | sem dado de mercado próprio; formato de páginas de notícia |
| F9 | **Edutainment / AI Explainer** | ensino com cenas geradas |
| F11 | **Faceless Cinematic / Visual Metaphor** | "faceless storytelling" entre os 6 formatos de IA em alta |
| F7 (fora: tem RAW) | Reaction / Duet / POV | Kacio fica nos formatos com RAW |

Outros em alta em 2026: **tier list/ranking**, **POV recreation**, **horror/curiosidade narrada**, **high-dopamine edit**,
**3 dicas em 30 s (listicle)**, **antes/depois**, **"você está fazendo errado"**, **séries** (storytelling serializado).
Ressalva: fontes são majoritariamente blogs de ferramentas. Fontes: kapwing.com, viral.app (3,3 mi de vídeos), virvid.ai,
miraflow.ai, alici.ai, sorriai.com.br.

## Decisões do criador (2026-11-01, após o teste Airbnb)
| Formato | Uso | Referência |
|---|---|---|
| **F3 post animado** (aprovado) | **notícias** de tecnologia, IA, design e sites; **memes do nicho**; depois, estilo "motivacional" Daniel Dalen (fundo preto, frase curta em serifa no topo, vídeo com cantos arredondados, música viral; ainda sem material) | `Referencias Edições…/danieldalen-post-DCN96qsSP_9.mp4` |
| **Histórias de design** → **personagem 3D** (F1) | foco em **UX, sites, psicologia por trás**: explicar o mecanismo e gerar comentário; nunca virar "história de fotógrafo/empreendedor" | `Formatos (referencias)/historia-3d-personagem.mp4` (copfy: personagem fixo, etiqueta amarela, legenda 1 palavra) |
| **Avatar IA com meu rosto falando** | fala no meu lugar sem RAW; cortes para prints/UI em fundo claro, palavra destacada em caixa roxa no título | `Formatos (referencias)/avatar-ia-rosto-falando.mp4` |
| **RAW clean** (sortear nos vídeos com RAW) | rosto + prints de notícia com marca-texto, mídia em quadro arredondado sobre grade preta, legenda branca 1 palavra | `Referencias Edições…/raw-edicao-clean.mp4` |
F2, F9 e F11 ficam para notícias/tutoriais, não para histórias.

**CTA padrão (por enquanto):** "Segue para aprender mais sobre design e IA — sem IA slop." (nada de "comenta X").
**Música:** os vídeos saem SEM música — o criador coloca o áudio viral no app ao postar (decisão 2026-11-01). Não gerar trilha nem pôr "musica" nos planos.
**Áudio:** master estéreo −14 LUFS, pico −1 dB (padrão Reels; o F3 do teste saiu mono a −18). Voz clonada: amostra atual tem 92 s em MP3 95 kbps — clonar de novo com 2–3 min em WAV limpo melhora a voz.

### F3 em 3 modos (`node motor/render/post.mjs <spec.json>`, 2026-11-01)
| Modo | O que é | Áudio | Referência |
|---|---|---|---|
| `post` | moldura + texto + mídia 4:5 com narração (voz clonada) | narração; música no app | F3-figma-agente |
| `noticia` | moldura + texto + **vídeo original da notícia** rodando (resto estático) + subtexto/CTA | **o do vídeo** (se tiver música, fica); sem áudio → música no app | `f3-noticia-video-original-a/b.mp4` |
| `meme` | faixa branca com frase do nicho + **meme existente** (gringo, traduzido/adaptado), foco em comentário | o do meme | `f3-meme-traduzido.mp4` |
Feito para volume: um `spec.json` por post (modo, midia, texto, subtexto, cta, aviso, ini, fim). Vídeo de notícia só de fonte oficial; meme sempre com crédito do autor no `aviso`.
