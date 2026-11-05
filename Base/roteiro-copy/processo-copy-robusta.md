# Processo de copy robusta (obrigatório para anúncio e roteiro)

Criado em 2026-11-04, depois de o criador apontar copy feita às pressas: frases do briefing copiadas, remendos por substituição, preenchimento para bater tempo.
Regras-mãe: `CLAUDE.md` (só fatos) e `metodo.md` (checklist).

## Regra de toda etapa
Ao terminar **cada** etapa abaixo, registrar o handoff dela em `copy.json → etapas.<etapa>` (`feito`, `decisoes` com fonte, `falta`, `proximo`) e anexar a `handoff.md` da pasta. Erro apontado pelo criador → lição em `docs/aprendizados.md`. O verificador reprova etapa sem handoff.

## 0. Separar o briefing
- O que o cliente/criador disse vira **intenção, restrição e fato** numa tabela. **Nunca é texto do anúncio.**
- Cada fato tem dono e status: confirmado, a confirmar ou proibido prometer.

## 1. Público e nível de consciência
- Definir o avatar: quem decide, porte, situação.
- Definir o nível de consciência (Schwartz) e o que ele já acredita.
- Escrever a **dor e o desejo** com evidência, não com suposição.

## 2. Linguagem real do público (voz do cliente)
Fontes, da mais forte para a mais fraca:
1. Conversas de venda, objeções e perguntas reais (gravações, WhatsApp, anotações do comercial).
2. Comentários em anúncios e posts do segmento.
3. Entrevistas, podcasts e eventos do setor.
4. Transcrições de anúncios ativos de concorrentes.

Saída: um **glossário** com palavras que ele usa (com fonte) e palavras que ele não usa. A copy só usa termos do glossário.

## 3. Mecanismo com evidência
- Escolher a estrutura nas referências: estudos em `Base/engenharia-reversa/` e `estudo-fonetico.md`.
- Anotar: qual referência, qual indicador (dias × versões, views, outlier), e o que se copia (mecanismo) e o que não se copia (texto).

## 4. Prova disponível
- Listar só o que existe: números, cases, processo verificável e risco zero real.
- Sem prova → a estrutura muda (o risco zero substitui a prova, como na Posion). **Não inventar.**

## 5. Rascunho dentro do orçamento de tempo
- Orçamento: 40–60 s ≈ 120–170 palavras.
- Desenhar **antes** quantas palavras vai cada bloco (gancho ≤ 15, A, virada, B, CTA).
- Escrever para caber. Nunca cortar depois e encher para bater o tempo.

## 6. Auditoria (entregue junto com a copy)
- Checklist do `metodo.md` item a item:
  - 3 C's;
  - 4 ganchos (verbal, textual, visual, micro);
  - personagem, conflito e viradas;
  - CTA em 4 passos;
  - nada inventado.
- Tabela "frase → fonte": glossário, referência, fato do cliente ou hipótese.
- 2 variações de gancho com prós e contras, e qual testar primeiro.
- Leitura em voz alta cronometrada (ou estimativa pelo ritmo medido do locutor).

## 7. Correção
- Pedido de mudança → voltar à etapa que gerou o problema (público, linguagem, mecanismo) e reescrever o bloco.
- **Proibido substituir palavras por regex no texto final.**

## Anotações do criador (balões)
- Servir a pasta da copy: `node motor/copy/anotar.mjs servir <pasta>` e abrir `http://127.0.0.1:4320/`.
- Ele seleciona um trecho (ou "+ nota" no bloco) e escreve. Cada nota é salva em `<pasta>/anotacoes/<pagina>.json`.
- **Antes de corrigir qualquer copy:** `node motor/copy/anotar.mjs ler <pasta>`.
  - Cada nota vira entrada no handoff da etapa que ela corrige.
  - Se for regra, vira lição em `docs/aprendizados.md`.
