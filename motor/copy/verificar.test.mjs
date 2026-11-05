import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verificar, html, ETAPAS } from './verificar.mjs';

const nicho = {
  proibidos: [{ termo: 'corretor', troca: 'quem vende', motivo: 'público é o dono' }],
  glossario: [{ termo: 'lançamento', fonte: 'anúncios ativos do segmento' }],
  fatos: [{ id: 'N-1', texto: '12% respondem em menos de 10 minutos', fonte: 'Olhar Digital 2022', status: 'confirmado' }],
};
const cliente = { fatos: [{ id: 'C-1', texto: 'diagnóstico sem custo', fonte: 'a perguntar', status: 'a-confirmar' }] };
const briefing = 'o cliente quer vender sem fixo mensal para quem tem terreno e tem renda boa';
const fala = (texto, origem = 'hipotese', bloco) => ({ tipo: 'fala', texto, origem, ...(bloco && { bloco }) });
const corpo = 'A semana começa cheia de contatos e o tempo da sua empresa some com quem só estava olhando sem intenção nenhuma de fechar agora';
function base() {
  return {
    id: 't', ritmo_ppm: 180, duracao: { min: 40, max: 60 },
    publico: { avatar: 'dono', consciencia: 'problema' },
    blocos: [
      { papel: 'gancho', itens: [fala('Para onde vai o seu tempo no próximo lançamento?', 'glossario')] },
      { papel: 'a', itens: Array.from({ length: 5 }, () => fala(corpo)) },
      { papel: 'cta', itens: [fala('Toque em saiba mais e agende o diagnóstico.', 'referencia:arkom-diagnostico')] },
    ],
    ganchos_alternativos: [{ texto: 'x', pros: 'p', contras: 'c' }, { texto: 'y', pros: 'p', contras: 'c' }],
    checklist: { '3cs': { curiosidade: 'a', clareza: 'b', consequencia: 'c' }, '4ganchos': { verbal: 'a', textual: 'b', visual: 'c', micro: 'd' }, cta: { valor_antes: 'a', comando: 'b' } },
    etapas: Object.fromEntries(ETAPAS.map((e) => [e, { feito: 'ok', proximo: 'ok' }])),
  };
}
const rodar = (c, o = {}) => verificar(c, { briefing, nicho, cliente, existeRef: (x) => x === 'arkom-diagnostico', ...o });

test('copy válida passa sem erros', () => {
  const r = rodar(base());
  assert.deepEqual(r.erros, []);
  assert.ok(r.segundos >= 40 && r.segundos <= 60, `segundos=${r.segundos}`);
});

test('@spec:AC-101 @principle:P-011 reprova fala que repete 3+ palavras de conteúdo do briefing', () => {
  const c = base(); c.blocos[1].itens.push(fala('E tudo isso sem fixo mensal.'));
  assert.ok(rodar(c).erros.some((e) => e.startsWith('AC-101') && e.includes('sem fixo mensal')));
});

test('@spec:AC-101 avisa eco de 2 palavras e libera termo do glossário', () => {
  const c = base(); c.blocos[1].itens.push(fala('Quem tem terreno, renda e pressa.'));
  assert.ok(rodar(c).avisos.some((a) => a.startsWith('AC-101')));
  const g = { ...nicho, glossario: [...nicho.glossario, { termo: 'terreno e renda', fonte: 'entrevista' }] };
  assert.ok(!rodar(c, { nicho: g }).avisos.some((a) => a.startsWith('AC-101')));
});

test('@spec:AC-102 @principle:P-011 reprova termo proibido do nicho em fala e tela, com troca', () => {
  const c = base(); c.blocos[1].itens.push({ tipo: 'tela', texto: 'AGENDA DOS CORRETORES' });
  const e = rodar(c).erros.find((x) => x.startsWith('AC-102'));
  assert.ok(e && e.includes('quem vende'));
});

test('@spec:AC-103 @principle:P-010 número ou absoluto só com fato confirmado; pendência torna não publicável', () => {
  const c = base(); c.blocos[1].itens.push(fala('A maioria das empresas demora.'));
  assert.ok(rodar(c).erros.some((e) => e.startsWith('AC-103')));
  const ok = base(); ok.blocos[1].itens[0] = fala('Só 12% respondem em menos de dez minutos.', 'fato:N-1');
  assert.ok(!rodar(ok).erros.some((e) => e.startsWith('AC-103')));
  const pend = base(); pend.blocos[2].itens[0] = fala('Agende o diagnóstico sem custo. [CONFIRMAR]', 'fato:C-1');
  const r = rodar(pend); assert.equal(r.publicavel, false); assert.deepEqual(r.erros, []);
  const sem = base(); sem.blocos[2].itens[0] = fala('Agende o diagnóstico sem custo.', 'fato:C-1');
  assert.ok(rodar(sem).erros.some((e) => e.includes('sem [CONFIRMAR] no texto')));
});

test('@spec:AC-103 [CONFIRMAR] em tela ou cena também torna não publicável', () => {
  const c = base(); c.blocos[1].itens.push({ tipo: 'tela', texto: 'Sites reais [CONFIRMAR quais]' });
  const r = rodar(c); assert.equal(r.publicavel, false); assert.ok(r.avisos.some((a) => a.includes('tela')));
});

test('@spec:AC-104 reprova duração fora da faixa e gancho longo', () => {
  const c = base(); c.blocos[1].itens = [fala(corpo)];
  assert.ok(rodar(c).erros.some((e) => e.startsWith('AC-104') && e.includes('fora de')));
  const g = base(); g.blocos[0].itens[0] = fala('Uma frase de gancho longa demais com muitas palavras que passa do limite de quinze palavras do método', 'glossario');
  assert.ok(rodar(g).erros.some((e) => e.startsWith('AC-104') && e.includes('gancho')));
});

test('@spec:AC-105 toda fala tem origem válida e referência existente', () => {
  const c = base(); c.blocos[1].itens.push({ tipo: 'fala', texto: 'Sem origem.' });
  c.blocos[2].itens.push(fala('Outra.', 'referencia:inexistente'));
  const r = rodar(c);
  assert.ok(r.erros.some((e) => e.startsWith('AC-105') && e.includes('sem origem')));
  assert.ok(r.erros.some((e) => e.startsWith('AC-105') && e.includes('inexistente')));
  assert.ok(rodar(base(), { nicho: { ...nicho, glossario: [] } }).erros.some((e) => e.includes('glossário do nicho está vazio')));
});

test('@spec:AC-105 origem glossario exige termo do glossário na fala', () => {
  const c = base(); c.blocos[0].itens[0] = fala('Para onde vai o seu tempo nesta semana inteira?', 'glossario');
  assert.ok(rodar(c).erros.some((e) => e.includes('não usa nenhum termo do glossário')));
  const ok = base(); ok.blocos[0].itens[0] = fala('O seu próximo lançamento vai vender no ritmo certo?', 'glossario');
  assert.ok(!rodar(ok).erros.some((e) => e.includes('não usa nenhum termo')));
});

test('@spec:AC-106 exige checklist do método, nível de consciência e 2 ganchos alternativos', () => {
  const c = base(); delete c.checklist['4ganchos'].micro; c.publico.consciencia = 'x'; c.ganchos_alternativos.pop();
  const r = rodar(c);
  for (const k of ['4ganchos.micro', 'consciência', '2 ganchos']) assert.ok(r.erros.some((e) => e.startsWith('AC-106') && e.includes(k)), k);
});

test('@spec:AC-108 @principle:P-012 reprova etapa sem handoff', () => {
  const c = base(); delete c.etapas.linguagem; c.etapas.prova = { feito: 'x' };
  const r = rodar(c);
  assert.ok(r.erros.some((e) => e.includes('"linguagem"'))); assert.ok(r.erros.some((e) => e.includes('"prova"')));
});

test('@spec:AC-107 página colorida mostra tipos, origem, tempo e relatório', () => {
  const c = base(); c.blocos[1].itens.push({ tipo: 'cena', texto: 'Obra' }, { tipo: 'ia', texto: 'Vídeo IA' });
  const p = html(c, rodar(c));
  for (const s of ['#0035D4', '#7a7a7a', '#5a9a00', 'origem: glossario', 'palavras ≈', 'APROVADA']) assert.ok(p.includes(s), s);
});
