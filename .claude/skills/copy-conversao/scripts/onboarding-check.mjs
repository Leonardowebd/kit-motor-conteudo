// Gate do onboarding (spec-driven): lista as perguntas obrigatórias ainda sem resposta.
// Uso (na raiz do projeto): node .claude/skills/copy-conversao/scripts/onboarding-check.mjs [cliente] [nicho]
// Exit 1 enquanto faltar resposta → o agente NÃO escreve copy e pergunta ao usuário (docs/onboarding.md).
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const vazio = (v) => v === undefined || v === null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && (!v.length || v.every(vazio)));
const pega = (o, k) => k.split('.').reduce((a, p) => (a == null ? a : a[p]), o);
export const OBRIG = {
  marca: ['marca', 'quem_fala.nome', 'quem_fala.cargo', 'tom.descricao', 'plataformas'],
  nicho: ['nicho', 'publico', 'consciencia', 'dores', 'glossario'],
  cliente: ['cliente', 'oferta.carro_chefe', 'oferta.inclui', 'oferta.preco_modelo', 'oferta.cta_destino', 'fatos', 'proibido_prometer'],
};
export function faltando(tipo, obj) {
  if (!obj) return [`${tipo}: arquivo não existe`];
  const f = OBRIG[tipo].filter((k) => vazio(pega(obj, k))).map((k) => `${tipo}.${k}`);
  if (tipo === 'nicho' && obj.glossario?.some((g) => g.termo && !g.fonte)) f.push('nicho.glossario: termo sem fonte');
  if (tipo === 'cliente' && obj.fatos?.some((x) => x.texto && !x.status)) f.push('cliente.fatos: fato sem status');
  return f;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const ler = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null);
  const [cli, nic] = process.argv.slice(2);
  const nome = (dir, x) => x || (existsSync(dir) ? readdirSync(dir).find((f) => f.endsWith('.json'))?.replace('.json', '') : '');
  const c = nome('copy/clientes', cli), n = nome('copy/nichos', nic);
  const f = [...faltando('marca', ler('copy/identidade/marca.json')), ...faltando('nicho', ler(`copy/nichos/${n}.json`)), ...faltando('cliente', ler(`copy/clientes/${c}.json`))];
  if (!f.length) { console.log(`ONBOARDING COMPLETO · cliente=${c} nicho=${n}`); process.exit(0); }
  console.log('ONBOARDING INCOMPLETO — pergunte ao usuário (docs/onboarding.md):'); for (const x of f) console.log('  -', x); process.exit(1);
}
