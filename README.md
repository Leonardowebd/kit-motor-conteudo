# Kit Motor de Conteúdo · Claude Code (versão de TESTE)

Sistema completo para produzir conteúdo e anúncios com Claude Code, **baseado em fatos, dados e referências medidas**:
**pesquisa → copy/roteiro → imagem com IA → carrossel → vídeo/Reels → publicar e medir**, com agentes, verificadores em código e aprendizado registrado a cada etapa.

> ⚠️ Não é a versão definitiva. Feito para testar e devolver feedback.

## O que vem
| Trilho | Peças |
|---|---|
| **Pesquisa** | `motor/pesquisa/`: Instagram (Reels com views e outliers), Biblioteca de Anúncios da Meta (ranking e vídeos), Pinterest, legendas do YouTube (voz do cliente), engenharia reversa de vídeo, captura de telas em desktop, gravação de tela, métricas de imagem. Agentes `pesquisador` e `engenheiro-reverso` |
| **Copy** | skill `copy-conversao`, agentes `copywriter` + `revisor-copy`, verificador (`motor/copy/verificar.mjs`), anotações em balão (`motor/copy/anotar.mjs`) |
| **Carrossel** | `motor/carrossel/` (JSON → PNG 1080×1350 validado na marca, capas a partir de referências e de imagem de impacto), agente `carrossel` |
| **Vídeo / Reels** | `motor/video/` (transcrição, corte de silêncio e regravação, alinhamento, legenda, olhar/bastidor, recorte da pessoa, prévia) e `motor/render/` (Formato A, Formato B, cenas sem RAW, post animado, B-roll, temas de UI, plano de som), editor visual (`motor/editor/`) |
| **Imagem com IA** | regras e fluxo (Pinterest → prompt → modelo com referências reais), cliente OpenArt (`motor/imagem/openart.mjs`); geração via MCP (Magnific/Flow) |
| **Processo** | `AGENTS.md` (regras), `.spec/` (constituição + specs com critérios de aceite), skill `principios-conteudo`, agente `escrivao` (documenta decisões e lições) |
| **Banco** | `Base/` (conhecimento: marca, formatos, perícia, referências, nichos, clientes, resultados) + acervo de mídias fora do git |

## Instalação passo a passo
**Requisitos:** macOS (Apple Silicon recomendado: transcrição local `mlx-whisper` e recorte com Vision), [Claude Code](https://docs.claude.com/claude-code), Node.js 20+, Python 3, git. Opcionais: Google Chrome (vídeos de anúncios), [uv](https://docs.astral.sh/uv/) (`uvx yt-dlp`).
```bash
git clone <url-deste-repo> meu-motor && cd meu-motor
npm run instalar                       # npm install + Chromium do Playwright + venv com mlx-whisper (motor/setup.sh)
npm run criar-acervo -- ~/MeuAcervo    # estrutura padrão das mídias (fora do git)
cp conteudo.config.exemplo.json conteudo.config.json      # aponte "acervo" para ~/MeuAcervo
cp motor/marca/perfil.exemplo.json motor/marca/perfil.json
# fontes padrão (gratuitas, fontshare.com): Clash Display e Satoshi → ~/MeuAcervo/Identidade/ClashDisplay_Complete/Fonts/WEB/fonts e Satoshi_Complete/Fonts/WEB/fonts
npm run onboarding                     # lista o que falta (INCOMPLETO até responder tudo)
npm test                               # testes do motor (os de identidade só passam com acervo + fontes)
claude                                 # abra o Claude Code NA RAIZ (agentes e skills do projeto só aparecem assim)
```
**Conectar ferramentas (MCP) — opcional, para gerar imagem/vídeo:** adicione o servidor MCP do provedor que você usa (ex.: Magnific, Google Flow) com `claude mcp add …` conforme a documentação dele e confira com `/mcp` dentro do Claude Code. OpenArt usa `OPENART_TOKEN` (ou login da CLI). **Toda geração paga mostra o preço e espera aprovação.**

## Primeiro uso (spec-driven)
1. No Claude Code: *"Vamos fazer o onboarding do motor."* O agente roda `npm run onboarding` e faz as perguntas obrigatórias de `docs/ONBOARDING.md` em 4 blocos:
   - **Identidade:** acervo, cores, fontes, tom, rosto, perfil, motores de IA e aprovação de crédito.
   - **Público:** nicho, quem decide, nível de consciência, dores e glossário com fonte.
   - **Oferta e fatos:** carro-chefe, preço, risco zero real, CTA, fatos com status, o que é proibido prometer.
   - **Referências e métricas:** peças que já funcionaram e a métrica que decide.
2. Com o gate verde, peça uma peça. Exemplos:
   - "pesquise anúncios ativos do meu nicho e faça a engenharia reversa do mais duplicado";
   - "escreva a copy do anúncio";
   - "monte o carrossel sobre X";
   - "edite o RAW Y no Formato A".
3. Revise no navegador (balões de anotação na copy; prévia leve no vídeo; prancha no carrossel). O agente lê as suas notas e corrige voltando à etapa que errou.
4. Depois de publicar, registre as métricas em `Base/copy/resultados/`. É isso que transforma hipótese em técnica validada.

## Regras que fazem o sistema funcionar (`AGENTS.md`)
- **Só fatos:** número, promessa ou "a maioria" só com fonte. O resto é hipótese marcada ou `a-confirmar`.
- **Briefing não é texto:** a linguagem vem do público, com fonte.
- **Texto em imagem é sempre código,** nunca gerado pela IA de imagem.
- **Robustez antes de velocidade:** corrigir é voltar à etapa e reescrever.
- **Aprender e passar o bastão em toda etapa:** handoff por etapa, e todo erro vira lição com evidência.

## Por que o banco de dados é o centro
Leia `docs/BANCO-DE-DADOS.md`. Em resumo:
- Cada fato, termo e referência tem **fonte e status**.
- **Método, nicho, cliente e peça** ficam separados.
- **Mídias ficam no acervo e o conhecimento no git.**
- **Cada resultado medido volta para o banco.**
- Sem isso, cada peça recomeça do zero e o agente inventa.

## Estrutura de pastas
```
AGENTS.md · CLAUDE.md          regras e mapa (todo agente lê)
conteudo.config.json           acervo + pasta de identidade (copiar do .exemplo)
.claude/agents/                pesquisador · engenheiro-reverso · copywriter · revisor-copy · carrossel · post-x · escrivao
.claude/skills/                copy-conversao · principios-conteudo
.spec/                         constituição + features (copy, carrossel, video) com critérios de aceite
Base/                          banco de conhecimento (ver docs/BANCO-DE-DADOS.md)
motor/                         código: pesquisa · copy · carrossel · video · render · imagem · editor · marca
docs/                          ONBOARDING · FLUXOS · BANCO-DE-DADOS · aprendizados · decisoes/
<acervo>/ (fora do git)        Identidade · Conteudo/{Personagem,Videos,Carrossel,Imagens,Clientes} · SFX Audio
```
Cada módulo é trocável: outra marca é só um novo `MARCA.md`, `perfil.json`, fontes e cores; outro nicho, um novo `Base/copy/nichos/`; outro cliente, um novo `Base/copy/clientes/`.

## Limites conhecidos
- Feito e testado em macOS com Apple Silicon. Transcrição (`mlx-whisper`) e recorte (Vision) são específicos do Mac.
- Os estudos em `Base/engenharia-reversa/` analisam peças públicas de terceiros. Copie só o mecanismo, nunca texto, marca ou rosto.
- Contagens da Biblioteca da Meta são indicadores indiretos, não métricas de resultado.
- As ferramentas de pesquisa leem só páginas públicas, sem login. Respeite os termos das plataformas.

## Feedback
Abra uma issue com: o que você pediu, o que saiu, o que os verificadores ou o revisor deixaram passar e o que você corrigiu.
