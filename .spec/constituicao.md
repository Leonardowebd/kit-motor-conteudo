# Constituição — v1.1.0

<!--
  Princípios inegociáveis do projeto. Não são estilo: são restrições.
  P-xxx = princípio (código de rastreio, como US/AC/T).
  Níveis: [DEVE] obrigatório · [RECOMENDADO] forte · [PODE] permitido/explícito.
  Todo [DEVE] precisa de verificação executável — senão o audit acusa
  "princípio sem verificação" (PRINCIPIO_SEM_VERIFICACAO). Formatos:
    - verificação(gate): satisfeita pelo próprio audit (só p/ princípios "meta")
    - verificação(teste): @principle:P-xxx
    - verificação(proibido): `regex` em `glob`
    - verificação(obrigatório): `regex` em `glob`
-->

## P-001 [DEVE] Todo requisito tem prova executável

Nenhuma feature é declarada pronta sem o audit em modo CI sair limpo (exit 0).
Este princípio é verificado pelo próprio mecanismo do audit (AC_SEM_TESTE,
AC_SEM_PROVA, TASK_CONCLUIDA_SEM_PROVA) — não precisa de teste extra seu.

- verificação(gate): intrínseca ao audit

## P-002 [RECOMENDADO] Segredos nunca em código

Chaves e senhas vêm de variáveis de ambiente, nunca hard-coded.

- verificação(proibido): `(api[_-]?key|senha|password)\s*[:=]\s*['"][^'"]{8,}` em `motor/video/**/*.mjs`

## P-010 [DEVE] Só fatos na copy

Número, percentual ou absoluto em fala de copy só com fato confirmado (cliente/nicho). Fato não confirmado ou `[CONFIRMAR]` = copy não publicável.

- verificação(teste): @principle:P-010

## P-011 [DEVE] Briefing não vira texto e linguagem é do público

Fala que repete 3+ palavras de conteúdo do briefing é reprovada; termo proibido do nicho é reprovado.

- verificação(teste): @principle:P-011

## P-012 [DEVE] Toda etapa deixa handoff e aprendizado

Toda copy declara as etapas do processo com handoff (o que foi feito, decisões, o que falta); sem isso o verificador reprova.

- verificação(teste): @principle:P-012
