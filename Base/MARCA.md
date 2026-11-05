# MARCA — {{marca.nome}} (preencher no onboarding)

> Fonte única de identidade para todos os trilhos (copy, carrossel, vídeo, imagem). Todo agente lê este arquivo antes de criar.
> Caminhos de mídia são relativos ao **acervo** (`conteudo.config.json → acervo`).

## Posicionamento
- Objetivo: {{objetivo}} (ex.: autoridade e audiência em <tema>; vender <oferta>)
- Plataformas: {{plataformas}} (ex.: Reels 9:16, carrossel 4:5, Shorts, anúncio Meta)
- Idioma: {{idioma}} · Tom: {{tom}} (sem dado → testar A/B)

## Cores (tokens em `motor/marca/marca.css`)
| Papel | Hex |
|---|---|
| Cor dominante | {{cor.dominante}} |
| Fundo claro | {{cor.claro}} |
| Acento único (só no que importa) | {{cor.acento}} |
| Texto / fundo escuro | {{cor.escuro}} |
Regra: 1 cor dominante + 1 acento por peça.

## Tipografia (arquivos em `<acervo>/{{identidade}}/…/Fonts/WEB/fonts`)
- Títulos: {{fonte.titulos}} · Corpo: {{fonte.corpo}}
- Fontes NÃO vão para o git se a licença proibir redistribuição.

## Rosto / personagem (se aparecer)
- Fotos reais de referência: `<acervo>/Conteudo/Personagem/referencias/` (alta resolução).
- Regras de geração com rosto: só fotos reais ou ficha aprovada como referência; o prompt diz "mesma pessoa das referências" sem descrever etnia/traços; nunca usar imagem de IA não aprovada como referência; rosto de IA só vai a público com aprovação.

## Proibido
- Texto gerado por IA de imagem (texto é sempre código).
- Inventar dado em card (números, estrelas, preços, datas).
- {{proibidos.marca}}
