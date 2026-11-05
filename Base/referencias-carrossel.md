# Referências — Carrossel (índice para consulta dos agentes)

> Pasta: `Conteudo/Carrossel/referencias/`. Uso: o agente diretor de arte abre este índice, escolhe 2–3 referências pela FAMÍLIA e mede os mecanismos. Nunca copiar texto/arte.

## Famílias

### A. Editorial escuro com serifa condensada (realskytan, 02–09 + 01/05 em MP4)
- Fundo preto quente com vinheta; título serifado condensado itálico em laranja, CAIXA ALTA, centrado.
- Sobretítulo pequeno ("THE TRUTH:", "BENEFIT 1:") em grotesk branca.
- Corpo 2 linhas, branco, com 1 trecho em laranja (o acento só na ideia-chave).
- Prova visual no meio: ícones de processo, grade de números gigantes (7·4·6), gráfico antes×depois, par de thumbnails "vs".
- Capa = silhueta em foto + grade/calendário sobreposto + título enorme.
- Fecho = CTA "Comment “PLAYBOOK”" com entregável nomeado.
- Mecanismos: 1 acento só; número/palavra gigante por slide; prova em par; ritmo título→1 frase→prova→1 frase.

### B. Notícia tech em cards (leobeckerdesign 02–03)
- Fundo verde-petróleo escuro, moldura de UI com etiqueta "■ CRIAÇÃO COM IA" / "■ OPEN SOURCE" (mono, ponto vermelho).
- Imagem/print do produto no topo, título condensado grande, parágrafo explicativo longo com negritos.
- Mecanismos: etiqueta de categoria; print real do produto; densidade alta (ler, salvar).

### C. Capa choque com personagem 3D (fabianocarvalhojr 01)
- Personagem 3D expressivo em cena, título vermelho pincelado no topo, chamada branca/vermelha embaixo ("Caramba, o Claude agora faz filmes.").
- Contador "01/10 →", "SALVA PRA DEPOIS", @ no rodapé.

### D. Thumbnail composta / prova de resultado (victor.thumbmaker 01)
- Fundo branco, cards arredondados empilhados; foto real + UI de venda (notificações "Nova Venda R$", gráfico R$100 Mil) + robô.
- Mecanismo: prova financeira visual + pessoa real + IA como personagem.

### E. Capa foto-conceito com IA (Pinterest, `referencias/familia-E/pinterest-01..13.png`, 2026-11-03)
- Foto hiper-realista com conceito surreal ligado ao tema: cabeça cortada/aberta com cena dentro, cabeça na bandeja do mercado,
  corpo sentado na própria cabeça, famoso em figurino do tema, animal com acessório.
- Título enorme **atrás** do sujeito (camadas), 1 palavra em cor ou script; etiquetas pequenas nos cantos (MARKETING · DESIGN · ESTRATÉGIA).
- Miolo estilo post (atiladesigner 11–12): título + parágrafo + imagem/print em card arredondado.
- No motor: família A + `imagem` na capa e no CTA (aprovado pelo criador: "só precisa de imagens bem geradas").

## Tradução para a marca criador
- Família A com paleta criador: preto `#0D0D0D` + acento limão `#B6FF59` (ou azul `#0035D4` em fundo gelo); serifa condensada → **Clash Display**; grotesk → **Satoshi**.
- Textura de pixel/LED (`ref-design.png`) no lugar da vinheta.

## Aprendizados (agente carrossel)
- 2026-11-03 · Classe do tipo do slide no contêiner colidia com o CSS do componente (`.grade`, `.lista`, `.numero`) → contêiner usa `t-<tipo>`.
- 2026-11-03 · Slide só-texto entre provas visuais fica fraco: usar `pontos` (N pontos, 1 aceso) para isolamento/proporção.
- 2026-11-03 · Comparação em 2 colunas: itens ≤ 4 palavras, senão quebra feia; `text-wrap: balance`.
- 2026-11-03 · "Demonstrar enquanto ensina": o slide-payoff que aponta para o próprio carrossel ("repara…") fecha o laço da capa.
- 2026-11-03 · Contêiner com overflow:hidden cortava anel do avatar e sombra do card no post → .t-post com overflow: visible (o detector de estouro mede conteúdo, não sombra).
- 2026-11-03 · Regra geral `.t-post h2 { margin: 0 }` anulava o espaçamento do título → margem dentro da própria regra. Galeria no post precisa de flex:1 + min-height:0 para preencher.
- 2026-11-04 · "Copiar para aprender" (kacio.filipe, Apple/mordida): pergunta "Por que X tem Y?" + par visual no hook; o CTA mora na legenda ("Comenta PALAVRA") depois da lição. Sem login só se leem os 2 primeiros slides + legenda; a ferramenta de captura não alcança o miolo/CTA da referência.
- 2026-11-04 · Capa com imagem própria: o véu do renderizador (`.veu`) escurece abaixo de ~52% da altura; posicionar o elemento aceso entre 30% e 52% (y 405–700 de 1350) e deixar a palavra gigante SEM acento quando a imagem já tem o acento.
- 2026-11-04 · `visual: linha`/`comparacao` saem pequenos em cartão grande; para dado simples (antes → depois) um cartão tipográfico em código (Clash Display, 1 acento) lê melhor.
- 2026-11-04 · Capas em código (`motor/carrossel/capas-ref.mjs`): APROVADAS pelo criador e reutilizáveis em outros processos — `01-kacio-mei` (foto cheia + palavra gigante + cartão de vidro), `03-davi-azul-fedex` e `04-davi-branco-restorff` (herói + faixa de perfil + título caixa-alta), `05-clonar` (palavra glitch + leque de cartões). REPROVADAS: `02-se-eu-fosse` e `06-sobre-mim` (precisam de pose/expressão reais → imagem de IA com as fotos dele). Pasta: `Conteudo/Carrossel/2026-11-04-capas-copiadas/capas/`.
