"""Voz do cliente a partir de legendas do YouTube (.vtt): texto limpo com minuto + trechos por palavra-chave.
Uso: python3 .claude/skills/copy-conversao/scripts/legendas.py <pasta-com-vtt> <saida.md> [palavra-chave ...]
Cada trecho sai com [id mm:ss] para citar como fonte no glossário do nicho (copy/nichos/)."""
import re, sys, os, glob
from collections import Counter

def ler_vtt(p):
    linhas, ult = [], ''
    for bloco in open(p, encoding='utf8').read().split('\n\n'):
        m = re.search(r'(\d\d):(\d\d):(\d\d)\.\d+ -->', bloco)
        if not m: continue
        t = int(m[1]) * 3600 + int(m[2]) * 60 + int(m[3])
        txt = ' '.join(l for l in bloco.split('\n') if '-->' not in l and l.strip())
        txt = re.sub(r'<[^>]+>', '', txt).strip()
        if not txt or txt == ult: continue
        if ult and txt.startswith(ult): txt = txt[len(ult):].strip()   # legenda rolante
        ult = re.sub(r'<[^>]+>', '', bloco.split('\n')[-1]).strip() or txt
        if txt: linhas.append((t, txt))
    return linhas

def frases(linhas, janela=40):
    """Agrupa em janelas de ~janela segundos: [(t0, texto)]"""
    out, t0, buf = [], None, []
    for t, x in linhas:
        if t0 is None: t0 = t
        buf.append(x)
        if t - t0 >= janela: out.append((t0, ' '.join(buf))); t0, buf = None, []
    if buf: out.append((t0, ' '.join(buf)))
    return out

if __name__ == '__main__':
    pasta, saida, *chaves = sys.argv[1:]
    chaves = chaves or ['vend', 'cliente', 'marketing', 'comercial', 'corretor', 'imobiliária', 'lead', 'anúncio', 'agência', 'tráfego', 'captar', 'previsib', 'lançamento']
    out = [f'# Voz do cliente — trechos por palavra-chave\n\nChaves: {", ".join(chaves)}\n']
    cont = Counter()
    for p in sorted(glob.glob(os.path.join(pasta, '*.pt-orig.vtt')) or glob.glob(os.path.join(pasta, '*.vtt'))):
        vid = os.path.basename(p).split('.')[0]
        fr = frases(ler_vtt(p))
        open(os.path.join(pasta, f'{vid}.txt'), 'w').write('\n'.join(f'[{t//60:02d}:{t%60:02d}] {x}' for t, x in fr))
        hits = [(t, x) for t, x in fr if any(c in x.lower() for c in chaves)]
        for _, x in fr:
            for w in re.findall(r'[a-zà-ú]{4,}', x.lower()): cont[w] += 1
        out.append(f'\n## {vid} — https://youtu.be/{vid} ({len(hits)} trechos)\n')
        out += [f'- [{vid} {t//60:02d}:{t%60:02d}] {x}' for t, x in hits]
    out.append('\n## Palavras mais frequentes (≥4 letras)\n' + ', '.join(f'{w} {n}' for w, n in cont.most_common(150)))
    open(saida, 'w').write('\n'.join(out))
    print(saida, sum(1 for l in out if l.startswith('- [')), 'trechos')
