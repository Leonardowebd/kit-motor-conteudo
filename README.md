# copy-conversao · skill para Claude Code (versão de TESTE)

Sistema para gerar **copy de anúncio e roteiro pensada para conversão** com Claude Code, baseada em **fatos**, **linguagem real do público** e **mecanismos de referências medidas**, não em "criatividade" solta. Nasceu de um caso real (anúncio para donos de construtora) e de vários erros corrigidos, que viraram regras checadas por código.

> ⚠️ Não é a versão definitiva. É para testar e devolver feedback.

## O que vem no pacote
| Peça | O que faz |
|---|---|
| **Skill** `.claude/skills/copy-conversao/` | o método: onboarding obrigatório, 7 etapas com handoff, checklist, ferramentas de pesquisa |
| **Agente `copywriter`** | escreve seguindo a skill; nunca se autoaprova |
| **Agente `revisor-copy`** | revisor independente e cético; aprova ou reprova com motivos |
| **Verificador** `scripts/verificar.mjs` | reprova por código: eco do briefing, jargão proibido do nicho, número sem fato confirmado, tempo fora da faixa, frase sem origem, checklist ausente, etapa sem handoff |
| **Gate de onboarding** `scripts/onboarding-check.mjs` | bloqueia a criação de copy enquanto faltar resposta obrigatória (estilo spec-driven) |
| **Balões de anotação** `scripts/anotar.mjs` | você anota em cima do texto no navegador; o agente lê as notas antes de corrigir |
| **Pesquisa** `anuncios.mjs`, `anuncios-baixar.mjs`, `legendas.py`, `fonetica.py` | Biblioteca de Anúncios da Meta (sem login), voz do cliente por legendas do YouTube, medidas de fala |
| **Banco de dados** `copy/` | identidade, nichos, clientes, referências, voz do cliente, resultados, aprendizados |

## Instalação passo a passo
**Requisitos:** [Claude Code](https://docs.claude.com/claude-code), Node.js 20+, git. Opcionais: Google Chrome (baixar vídeos de anúncios), [uv](https://docs.astral.sh/uv/) (para `uvx yt-dlp`), Python 3 com `numpy librosa` e ffmpeg (medidas de fala).

```bash
# 1. clonar (o repositório já é um projeto pronto)
git clone <url-deste-repo> meu-projeto-copy && cd meu-projeto-copy

# 2. dependências
npm install
npx playwright install chromium

# 3. conferir que está tudo de pé
npm test                 # testes do verificador e do onboarding
npm run onboarding       # deve dizer COMPLETO (dados de exemplo fictícios)
npm run verificar -- trabalhos/_exemplo/2026-11-04-anuncio/copy.json --html

# 4. abrir o Claude Code NA RAIZ do projeto (importante: os agentes do projeto só aparecem assim)
claude
```
**Já tem um projeto?** Copie `.claude/skills/copy-conversao/`, `.claude/agents/copywriter.md`, `.claude/agents/revisor-copy.md`, `CLAUDE.md` (ou junte as regras ao seu), `copy.config.json` e a pasta `copy/` para a raiz dele. Para usar a skill em todos os projetos, copie a pasta da skill para `~/.claude/skills/` (os comandos rodam a partir da raiz do projeto onde estão `copy/` e `copy.config.json`).

## Primeiro uso (spec-driven)
1. **Apague os dados de exemplo** de `copy/identidade`, `copy/nichos`, `copy/clientes`, `copy/referencias` e `trabalhos/_exemplo` (ou mantenha para comparar).
2. No Claude Code: *"Use a skill copy-conversao. Quero um anúncio para <cliente>."*
3. O agente roda `npm run onboarding`. Enquanto estiver **INCOMPLETO**, ele **não escreve copy**: faz as perguntas obrigatórias de `docs/onboarding.md`, em 4 blocos:
   - **Identidade:** marca, quem fala, tom, proibições, visual, plataformas.
   - **Público:** nicho, quem decide, nível de consciência, dores com fonte, glossário com fonte.
   - **Oferta e fatos:** carro-chefe, o que inclui, modelo de preço, risco zero real, CTA e filtro, fatos com status, o que é proibido prometer.
   - **Referências e métricas:** anúncio que já funcionou, métrica decisora, verba de teste.
   - Resposta "não sei" vira `a-confirmar`: pendência visível, nunca invenção.
4. Com o gate verde, o `copywriter` cria `trabalhos/<cliente>/<data>-<peca>/` e percorre as etapas com handoff. Depois vêm o verificador e o `revisor-copy`.
5. Veja e anote: `node .claude/skills/copy-conversao/scripts/anotar.mjs servir trabalhos/<cliente>/<peca>` → abra `http://127.0.0.1:4320/`, selecione um trecho e escreva no balão.
6. Peça a correção. O agente lê as notas, volta à etapa que errou e reescreve.

## Por que o banco de dados importa
Leia `docs/banco-de-dados.md`. Em resumo:
- **Sem fonte não há verdade.** Fato sem status é tratado como hipótese.
- **Separar método × nicho × cliente × peça** permite reaproveitar tudo ao mudar de cliente.
- **A ficha de resultado de cada peça** é o que transforma hipótese em técnica validada.
- **O padrão é o mesmo para todos.** Dados de várias pessoas e nichos podem somar (anonimizados).

## Estrutura de pastas (padrão, modular)
```
.claude/
  skills/copy-conversao/   SKILL.md · docs/ · scripts/ · templates/
  agents/                  copywriter.md · revisor-copy.md
CLAUDE.md                  regras do projeto (só fatos, briefing ≠ texto, processo, handoff, robustez)
copy.config.json           pastas configuráveis
copy/                      ← BANCO DE DADOS
  identidade/ nichos/ clientes/ referencias/ voz-cliente/ resultados/ aprendizados.md
trabalhos/<cliente>/<AAAA-MM-DD>-<peca>/
  briefing.md copy.json copy.html handoff.md revisao.md anotacoes/
```
Cada módulo é trocável: outro nicho é só um novo `copy/nichos/<nicho>.json`; outro cliente, um novo `copy/clientes/<cliente>.json`. O método não muda.

## Limites conhecidos
- **Contagens da Biblioteca da Meta:** buscas por palavra-chave têm ruído. "Dias no ar × versões" é indicador indireto, não métrica de resultado.
- **Tickets e números de portais:** são ordem de grandeza. Confirme antes de usar em copy.
- **Agentes:** só aparecem com o Claude Code aberto na raiz do projeto.
- **Coleta:** respeite os termos das plataformas. As ferramentas leem só páginas públicas, sem login, para pesquisa interna.

## Feedback
Abra uma issue com: o que você pediu, o que saiu, o que o verificador ou o revisor deixaram passar e o que você corrigiu. Cada correção vira regra ou teste.
