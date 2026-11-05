// Cliente mínimo da API do OpenArt (a mesma que a CLI `openart` usa).
// A CLI não expõe parâmetros do modelo (aspectRatio, resolution…); aqui eles vão
// direto no corpo. Autenticação: OPENART_TOKEN ou o login da CLI (~/.openart).
// Espera e download ficam com a CLI: `openart creation wait <id> -o <pasta>`.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { homedir } from 'node:os';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const exec = promisify(execFile);
const ORIGEM = 'https://openart.ai/suite';
const CLI = process.env.OPENART_CLI || join(homedir(), '.local', 'bin', 'openart');

async function token() {
  if (process.env.OPENART_TOKEN) return process.env.OPENART_TOKEN;
  // `account` renova o token da CLI se estiver vencido.
  await exec(CLI, ['account', '--quiet']);
  const cred = JSON.parse(await readFile(join(homedir(), '.openart', 'cli-credentials.json'), 'utf8'));
  return cred.accessToken;
}

async function api(metodo, caminho, corpo) {
  const r = await fetch(ORIGEM + caminho, {
    method: metodo,
    headers: { authorization: `Bearer ${await token()}`, 'content-type': 'application/json' },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const texto = await r.text();
  if (!r.ok) throw new Error(`OpenArt ${caminho} HTTP ${r.status}: ${texto.slice(0, 400)}`);
  return JSON.parse(texto);
}

// Preço exato (créditos) de um pedido com os parâmetros dados, sem gastar nada.
export const custo = ({ model, media = 'image', mode, params }) => api('POST', '/api/cli/v1/model-cost', { model, media, mode, params });

// Submete a geração; devolve a resposta da API (inclui o id para esperar/baixar).
export function gerar({ model, media = 'image', mode, params }) {
  return api('POST', '/api/cli/v1/generate', { model, media, mode, params });
}

export async function esperarEBaixar(id, pasta, nome = id) {
  const { stdout } = await exec(CLI, ['creation', 'wait', id, '--json'], { timeout: 15 * 60 * 1000 });
  const urls = JSON.parse(stdout).resources.map((r) => r.url);
  await mkdir(pasta, { recursive: true });
  const arquivos = [];
  for (const [i, url] of urls.entries()) {
    const destino = join(pasta, `${nome}${urls.length > 1 ? `-${i + 1}` : ''}${extname(new URL(url).pathname) || '.png'}`);
    await writeFile(destino, Buffer.from(await (await fetch(url)).arrayBuffer()));
    arquivos.push(destino);
  }
  return arquivos;
}

// CLI: node motor/imagem/openart.mjs <pedido.json> <pastaSaida>
// pedido.json = { model, media?, mode, params }
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [pedidoJson, pasta] = process.argv.slice(2);
  const pedido = JSON.parse(await readFile(pedidoJson, 'utf8'));
  const r = await gerar(pedido);
  console.log(JSON.stringify(r));
  const id = r.history?.id ?? r.id ?? r.historyId;
  if (id && pasta) console.log((await esperarEBaixar(id, pasta)).join('\n'));
}
