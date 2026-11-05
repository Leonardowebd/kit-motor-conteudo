// Anotações em balão nas páginas de copy.
//   node motor/copy/anotar.mjs injetar <pasta>         → injeta a camada de anotação em todo .html da pasta (idempotente)
//   node motor/copy/anotar.mjs servir <pasta> [porta]  → serve a pasta e salva notas em <pasta>/anotacoes/<pagina>.json
//   node motor/copy/anotar.mjs ler <pasta>             → imprime todas as notas (para o agente ler e aprender)
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const JS = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'anotar-cliente.js'), 'utf8');
const MARCA = '<!--anotar-->';
export function injetar(html) {
  const limpo = html.replace(/<!--anotar-->[\s\S]*?<!--\/anotar-->/, '');
  const bloco = `${MARCA}<script>${JS}</script><!--/anotar-->`;
  return limpo.includes('</body>') ? limpo.replace('</body>', `${bloco}</body>`) : limpo + bloco;
}
const htmls = (p) => readdirSync(p).filter((f) => f.endsWith('.html'));
const principal = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
const [cmd, pasta, porta = '4320'] = principal ? process.argv.slice(2) : [];
if (!principal) { /* importado: só exporta injetar */ } else if (cmd === 'injetar') {
  for (const f of htmls(pasta)) { const p = path.join(pasta, f); writeFileSync(p, injetar(readFileSync(p, 'utf8'))); console.log('anotação:', f); }
} else if (cmd === 'ler') {
  const d = path.join(pasta, 'anotacoes'); if (!existsSync(d)) { console.log('sem anotações'); process.exit(0); }
  for (const f of readdirSync(d).filter((x) => x.endsWith('.json'))) for (const n of JSON.parse(readFileSync(path.join(d, f)))) console.log(`[${f.replace('.json', '')}] ${n.trecho ? `“${n.trecho}” → ` : '(bloco) '}${n.nota}`);
} else if (cmd === 'servir') {
  const raiz = path.resolve(pasta), dirN = path.join(raiz, 'anotacoes'); mkdirSync(dirN, { recursive: true });
  const tipos = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.css': 'text/css', '.js': 'text/javascript' };
  createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    if (u.pathname === '/__anotacoes') {
      const pag = path.basename(u.searchParams.get('pagina') || 'index.html').replace(/\.html$/, '');
      const arq = path.join(dirN, `${pag}.json`);
      if (req.method === 'POST') { let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => { try { writeFileSync(arq, JSON.stringify(JSON.parse(b), null, 1)); res.end('ok'); } catch { res.writeHead(400).end('json inválido'); } }); return; }
      res.writeHead(200, { 'content-type': 'application/json' }); return res.end(existsSync(arq) ? readFileSync(arq) : '[]');
    }
    const p = path.join(raiz, decodeURIComponent(u.pathname));
    if (!p.startsWith(raiz) || !existsSync(p)) return res.writeHead(404).end('não encontrado');
    if (statSync(p).isDirectory()) { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(`<h3>Copies</h3><ul>${htmls(p).map((f) => `<li><a href="${encodeURIComponent(f)}">${f}</a></li>`).join('')}</ul>`); }
    res.writeHead(200, { 'content-type': tipos[path.extname(p)] || 'application/octet-stream' }); res.end(readFileSync(p));
  }).listen(+porta, '127.0.0.1', () => console.log(`anotações: http://127.0.0.1:${porta}/  (notas em ${dirN})`));
} else { console.error('uso: anotar.mjs injetar|servir|ler <pasta> [porta]'); process.exit(2); }
