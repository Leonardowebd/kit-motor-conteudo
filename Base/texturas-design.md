# Texturas e elementos de design — biblioteca (vídeos e carrosséis)

Referências enviadas pelo criador em 2026-11-01, salvas em
`Conteudo/Referencias Design/2026-11-texturas/` (01–17). Aprender a técnica, nunca copiar a peça.
Tradução sempre nas cores da marca: azul `#0035D4` (e derivados azul-claro/azul-gelo/azul-fundo), limão `#B6FF59`,
gelo `#F6F6F6`, noite `#03050C`. Quando a referência usa outras cores (laranja, roxo, verde-água), a gente troca
pela rampa azul → azul-gelo → gelo e usa o limão só como destaque.

| # | Referência | Técnica | Tradução na marca | Uso | Código |
|---|---|---|---|---|---|
| 01 | blocos com gradiente (Toss) | bento de cards arredondados com mancha de luz radial por dentro, borda esfumada, cada card com uma textura interna (curva, binário, grade, feixes) | `blocos`: cards azul/azul-claro/gelo com luz interna, um em limão como destaque; texturas internas: binário, grade, feixes, curva bézier | vídeo (lista de recursos) + carrossel (capa) | ✅ `blocos` |
| 02 | matriz de LED com glifos | forma desenhada por uma grade de "pixels" que são glifos (⊟ ✕ ⊞ +), brilho por intensidade | `led`: palavra/ícone em matriz de glifos com rampa azul→gelo e brilho | vídeo (gancho/tipografia) + carrossel (capa) | ✅ `led` |
| 03 | cubos isométricos | 3 cubos em linha (só traço), o do meio "aceso" com degradê e anel tracejado, rótulos mono, barra de progresso | `iso`: cubo central azul→limão aceso, laterais em traço, linhas tracejadas até os rótulos | vídeo (conceito/ecossistema) | ✅ `iso` |
| 04 | camadas isométricas iridescentes | aparelho "explodido" em camadas com borda holográfica, layout em grade com textos laterais | camadas em traço com borda iridescente azul→limão→gelo | carrossel (explicativo) / vídeo depois | ⏳ |
| 05 | fitas granuladas + pílula "Searching…" | traços grossos desfocados com granulação forte; pílula com ruído e brilho | granulação (`grao`) em degradês da marca; pílula granulada | vídeo + carrossel (textura) | ✅ textura `grao` |
| 06 | pílulas de vidro medidoras | pílulas pretas com luz verde-água subindo de baixo, régua tracejada, números grandes | `progresso` com valor real (nunca número inventado) | vídeo (números) + carrossel | ✅ `progresso` |
| 07 | card de lançamento com raios | card de artigo flutuando, raios de luz de baixo, brilhos (✦), etiquetas pílula, contador 04/06 | raios limão de baixo, etiquetas em pílula contornada, contador | carrossel (capa de destaque) | ⏳ |
| 08 | ilustração duotone azul granulada | ilustração/foto monocromática gelo sobre azul chapado com granulação | `tratamento: "duotone"` em qualquer imagem do insert (azul + gelo + grão); receita de prompt para imagem gerada | vídeo + carrossel | ✅ tratamento |
| 09 | ícones de vidro + dedo P&B | foto P&B de mão tocando ícone de vidro iluminado entre outros apagados | `logos` com destaque no do meio; versão foto via imagem gerada (Google) | vídeo + carrossel | ⏳ |
| 10 | quebra-cabeça de vidro com holofote | peças translúcidas em grade, uma branca encaixando com cursor, luz de holofote | peças em traço/vidro, peça destaque gelo com logo | carrossel / vídeo ("a peça que faltava") | ⏳ |
| 11 | fundo HUD | grade com cruzes grandes nas interseções, pontinhos, hachura diagonal em blocos | `fundo: "hud"` | fundo de vídeo + carrossel | ✅ fundo |
| 12 | planta com régua e ângulos | régua numerada nas bordas, grade, linhas tracejadas de ângulo, caixa de título, fundo azul desfocado | `fundo: "planta"` (azul da marca é a cor natural da planta) | fundo de vídeo + carrossel | ✅ fundo |
| 13 | mosaico de vidro claro | grade de quadrados foscos claros com mancha de cor passando por baixo; texto grande e limpo | mosaico gelo com mancha azul→limão (combina com o tema editorial) | carrossel (passo a passo) / vídeo | ⏳ |
| 14 | pílula estilo ilha dinâmica | pílula preta com barra de progresso e bolinha brilhante com valor | entra em `progresso` (variação pílula) | vídeo (status/andamento) | ✅ `progresso` |
| 15 | card de conquista com barra brilhante | card escuro com textura de pontos, barra limão "gel" com brilho na ponta | entra em `progresso` (barra gel limão) | vídeo | ✅ `progresso` |
| 16 | widget de etapas "3 de 5" | pílula preta com círculos de check ligados por traços, texto de status e contador | `etapas`: checks azuis, etapa atual pulsando, "3 de 5" | vídeo (fluxo/automação) + carrossel | ✅ `etapas` |
| 17 | botão de vidro brilhante sobre pontos | pílula roxa translúcida com halo, fundo de matriz de pontos iluminada de um canto | `botao` azul com halo + `fundo: "pontos"` | vídeo (CTA/ação) + carrossel | ✅ `botao`, fundo `pontos` |

## Como usar no plano
- Fundo de qualquer insert: `"fundo": "pontos" | "hud" | "planta"` (sem isso, o fundo é o do tema).
- Tratamento de imagem: `"tratamento": "duotone"` (azul + gelo + grão) em inserts com imagem.
- Granulação por cima do insert: `"grao": true`.
- Componentes novos: ver tabela de componentes em `Base/variacoes-ui.md`.

## Para carrosséis (futuro)
As mesmas peças em HTML servem para slides 1080×1350: o render de carrossel pode reaproveitar `telas-extra.mjs`
e os fundos, trocando só a área útil. Prioridade lá: 01 (capa bento), 07 (lançamento), 13 (passo a passo), 12 (planta).

## Referências de código — React Bits (enviadas em 2026-11-01)
Licença: **MIT + Commons Clause** (github.com/DavidHDev/react-bits). Pode usar dentro de um produto, mas **não pode
vender/redistribuir os componentes, nem em versão portada**. Como o motor pode virar produto, a regra é: **aprender a
técnica e escrever a nossa versão** (determinística por `seek(t)`, nas cores da marca), nunca colar o código.
Os componentes originais são interativos (mouse, requestAnimationFrame); o nosso render precisa de tempo fixo, então a
tradução é sempre uma reescrita.

| Componente | Técnica que vale aprender | Nossa versão (plano) |
|---|---|---|
| PatternWaves | superfície ondulada (seda/ondas/anéis) desenhada por marcas (pontos, +, glifos) cujo tamanho/brilho segue a luz | fundo `ondas`: meio-tom de pontos azuis com dobra de seda passando |
| Topography | curvas de nível de um relevo em perspectiva, linhas-índice a cada 5, brilho e névoa | fundo `relevo`: curvas de nível azuis subindo |
| CursorGrid | grade cujas células acendem com rastro e um anel que se propaga | fundo `grade`: células acendendo em onda a partir do ponto de ênfase |
| TechText | palavra que vira contorno tracejado letra a letra, moldura de seleção que desliza, quadradinhos piscando, linhas tipográficas | `tipografia` com efeito "técnico" (contorno tracejado + linhas de baseline) |
| RefineFrame | imagem que nasce pixelada (mosaico) e vai refinando por faixas, com brilho na frente | `tratamento: "refino"` em mídias (revelar print/imagem gerada) |
| SpecularButton | luz especular correndo pela borda de um botão de vidro | evoluir `botao`: borda com luz girando |
| LaserFlow | feixe de luz caindo sobre um card e escorrendo pelas bordas, poeira e névoa | `feixe`: luz azul caindo no card do produto (gancho/lançamento) |
| FolderFloat | pasta que abre e solta pílulas flutuando | `pasta`: recursos saindo de uma pasta (lista de features) |
| FlexCarousel | fileira de cards dobrando numa lente invisível, com dispersão de cor | `carrossel` de prints com dobra (vários prints de uma ferramenta) |
| PaperCrumple | papel 3D amassando (three.js) | descartado por peso; efeito parecido só com imagem gerada |
| Ferrofluid | ferrofluido com espinhos refletindo luzes de estúdio | descartado por peso (ray marching); usar como referência de clima |
| SpecularButton/TechText | detalhes de "editor de design" (molduras, medidas, handles) | já temos `selecao`; ampliar com medidas e guias |
