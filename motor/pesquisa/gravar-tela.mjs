// Gravação de tela de um site/repositório dentro de uma janela de navegador (formato dos posts do X e inserts).
// Sempre desktop (regra 2026-11-03): nada de viewport de celular, para mostrar melhor e não perder qualidade no layout dividido.
// Uso: node motor/pesquisa/gravar-tela.mjs <url> <saida.mp4> [--largura 1440] [--altura 900] [--rolar 1400] [--segurar 0] [--sem-moldura]
// Abre a página, espera carregar, segura --segurar s (animação parada no topo), rola devagar até --rolar px e volta. Com moldura: barra do navegador com a URL.
// Não faz login nem aceita termos/cookies; só esconde avisos fixos para a gravação.
import { chromium } from 'playwright';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import ffmpeg from 'ffmpeg-static';
import ffprobe from '@ffprobe-installer/ffprobe';

const exec = promisify(execFile);
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const [url, saidaRel] = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));
const saida = resolve(saidaRel);
const W = +opt('largura', 1440), H = +opt('altura', 900), ROLAR = +opt('rolar', 1400), moldura = !args.includes('--sem-moldura');
const SEGURAR = +opt('segurar', 0) * 1000;
const BARRA = 56, MARGEM = 40;

const tmp = mkdtempSync(join(tmpdir(), 'gravar-'));
try {
  const nav = await chromium.launch();
  const ctx = await nav.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: tmp, size: { width: W, height: H } } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  // banners de cookie/login fixos atrapalham a leitura: escondidos (não clicados)
  await p.addStyleTag({ content: '[id*="cookie" i],[class*="cookie" i],[aria-label*="cookie" i],[class*="consent" i]{display:none!important}' }).catch(() => {});
  await p.waitForTimeout(2500 + SEGURAR);
  const passos = Math.max(1, Math.round(ROLAR / 20));
  for (let i = 0; i < passos; i++) { await p.mouse.wheel(0, 20); await p.waitForTimeout(70); }
  await p.waitForTimeout(1200);
  for (let i = 0; i < passos; i++) { await p.mouse.wheel(0, -20); await p.waitForTimeout(45); }
  await p.waitForTimeout(1000);
  await ctx.close();
  const bruto = join(tmp, readdirSync(tmp).find((f) => f.endsWith('.webm')));

  // os 2,5 s iniciais (página carregando) saem
  if (!moldura) {
    await exec(ffmpeg, ['-loglevel', 'error', '-y', '-ss', '2.4', '-i', bruto, '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-an', saida]);
  } else {
    const fw = W + MARGEM * 2, fh = H + BARRA + MARGEM * 2;
    const pag = await nav.newPage({ viewport: { width: fw, height: fh } });
    const host = new URL(url).host + new URL(url).pathname.replace(/\/$/, '');
    await pag.setContent(`<body style="margin:0;background:#0b0b0c;width:${fw}px;height:${fh}px;font-family:-apple-system,Helvetica">
      <div style="position:absolute;left:${MARGEM}px;top:${MARGEM}px;width:${W}px;height:${H + BARRA}px;border-radius:18px;background:#1f1f22;box-shadow:0 0 0 1px #333">
      <div style="height:${BARRA}px;display:flex;align-items:center;gap:10px;padding:0 18px">
      <i style="width:14px;height:14px;border-radius:50%;background:#ff5f57"></i><i style="width:14px;height:14px;border-radius:50%;background:#febc2e"></i><i style="width:14px;height:14px;border-radius:50%;background:#28c840"></i>
      <div style="margin-left:18px;flex:1;height:32px;border-radius:9px;background:#2c2c30;color:#c9c9cf;font-size:16px;display:flex;align-items:center;padding:0 14px">🔒 ${host}</div></div></div></body>`);
    const png = join(tmp, 'janela.png'); await pag.screenshot({ path: png });
    const mask = join(tmp, 'mascara.png');
    await pag.setViewportSize({ width: W, height: H });
    await pag.setContent(`<body style="margin:0;background:#000"><div style="width:${W}px;height:${H}px;background:#fff;border-radius:0 0 18px 18px"></div></body>`);
    await pag.screenshot({ path: mask });
    const { stdout } = await exec(ffprobe.path, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', bruto]);
    const dur = String(Math.max(1, (Number(stdout.trim()) || 30) - 2.4).toFixed(2)); // imagem em loop precisa de fim
    await exec(ffmpeg, ['-loglevel', 'error', '-y', '-ss', '2.4', '-i', bruto, '-loop', '1', '-t', dur, '-i', png, '-loop', '1', '-t', dur, '-i', mask, '-filter_complex',
      `[0:v]format=rgba[v];[2:v]format=gray[k];[v][k]alphamerge[vr];[1:v][vr]overlay=${MARGEM}:${MARGEM + BARRA}:shortest=1,format=yuv420p[o]`,
      '-map', '[o]', '-t', dur, '-c:v', 'libx264', '-crf', '18', '-an', saida]);
  }
  await nav.close();
  console.log('ok', saida);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
