// Gate de onboarding do kit (spec-driven): lista o que falta para o motor criar QUALQUER peça (copy, carrossel, vídeo, imagem).
// Uso (na raiz do kit): node motor/onboarding.mjs   → exit 1 enquanto faltar algo (o agente pergunta ao usuário: docs/ONBOARDING.md)
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ler = (p) => { try { return JSON.parse(readFileSync(path.join(RAIZ, p), 'utf8')); } catch { return null; } };
const vazio = (v) => v == null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && (!v.length || v.every(vazio)));
const pega = (o, k) => k.split('.').reduce((a, p) => (a == null ? a : a[p]), o);
export const OBRIG_COPY = {
  nicho: ['nicho', 'publico', 'glossario'],
  cliente: ['cliente', 'oferta', 'fatos'],
};
export function checar() {
  const f = [];
  const cfg = ler('conteudo.config.json');
  if (!cfg) f.push('[1 identidade] conteudo.config.json ausente: copie conteudo.config.exemplo.json e aponte "acervo"');
  else {
    if (!cfg.acervo || !existsSync(cfg.acervo)) f.push(`[1 identidade] pasta do acervo não existe: ${cfg.acervo || '(vazio)'} → npm run criar-acervo`);
    else {
      const id = path.join(cfg.acervo, cfg.identidade || 'Identidade');
      for (const fam of ['ClashDisplay_Complete', 'Satoshi_Complete']) if (!existsSync(path.join(id, fam, 'Fonts/WEB/fonts'))) f.push(`[1 identidade] fontes ausentes: ${path.join(id, fam, 'Fonts/WEB/fonts')} (baixe em fontshare.com ou troque as fontes em motor/marca/marca.css + motor/video/legenda.mjs)`);
    }
  }
  const marca = existsSync(path.join(RAIZ, 'Base/MARCA.md')) ? readFileSync(path.join(RAIZ, 'Base/MARCA.md'), 'utf8') : '';
  const ph = [...new Set(marca.match(/\{\{[^}]+\}\}/g) || [])];
  if (!marca) f.push('[1 identidade] Base/MARCA.md ausente'); else if (ph.length) f.push(`[1 identidade] Base/MARCA.md com campos sem resposta: ${ph.join(', ')}`);
  const perfil = ler('motor/marca/perfil.json');
  if (!perfil) f.push('[1 identidade] motor/marca/perfil.json ausente (copie perfil.exemplo.json e preencha)');
  else if (perfil.nome === 'Seu Nome' || vazio(perfil.arroba)) f.push('[1 identidade] perfil.json ainda com valores de exemplo');
  for (const [tipo, dir] of [['nicho', 'Base/copy/nichos'], ['cliente', 'Base/copy/clientes']]) {
    const arqs = existsSync(path.join(RAIZ, dir)) ? readdirSync(path.join(RAIZ, dir)).filter((x) => x.endsWith('.json')) : [];
    if (!arqs.length) { f.push(`[2-3 público/oferta] nenhum ${tipo} em ${dir}`); continue; }
    for (const a of arqs) { const o = ler(path.join(dir, a)); for (const k of OBRIG_COPY[tipo]) if (vazio(pega(o, k))) f.push(`[2-3 público/oferta] ${dir}/${a}: ${k}`); }
  }
  return f;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const f = checar();
  if (!f.length) { console.log('ONBOARDING COMPLETO — o motor pode criar peças.'); process.exit(0); }
  console.log('ONBOARDING INCOMPLETO — responda (docs/ONBOARDING.md):'); for (const x of f) console.log('  -', x); process.exit(1);
}
