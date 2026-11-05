"""Medidas de fala de vídeos já desconstruídos (dados.json do desconstruir.mjs) — para comparar referências.
Uso: python3 .claude/skills/copy-conversao/scripts/fonetica.py <saida.json> <pasta-desconstrucao-1> [<pasta-2> ...]
Mede só o que dá para medir; nada aqui explica "por que funcionou" (isso é hipótese).
Texto: ritmo, frases, gancho, pronomes, negação, números, perguntas, imperativos, contraste, fonética (oclusivas, aliteração, sílabas, repetição).
Áudio: tom (F0, em semitons), variação de volume, pausas (librosa)."""
import json, re, sys, subprocess, os, tempfile, statistics as st
from collections import Counter
import numpy as np, librosa

FF = os.environ.get('FFMPEG', 'ffmpeg')
GRUPOS = {
  'voce': r'\b(você|voce|vocês|seu|sua|seus|suas|te|ti|contigo)\b',
  'eu_nos': r'\b(eu|meu|minha|meus|minhas|me|comigo|nós|nos|nosso|nossa|nossos|nossas|a gente)\b',
  'negacao': r'\b(não|nao|nunca|nem|nenhum|nenhuma|nada|ninguém)\b',
  'numero': r'(\d+|\b(um|uma|dois|duas|três|quatro|cinco|seis|sete|oito|nove|dez|cem|mil|milhão|milhões|bilhão)\b)',
  'dinheiro': r'(r\$|\breais\b|\bfatur\w*|\blucr\w*|\bvend\w*|\bdinheiro\b|\bcaixa\b|\bcusto\w*)',
  'tempo': r'\b(hoje|agora|amanhã|ontem|minuto\w*|hora\w*|dia\w*|semana\w*|mês|meses|ano\w*|segunda|terça|quarta|quinta|sexta|sábado|domingo)\b',
  'imperativo': r'\b(clique|clica|toque|toca|comente|comenta|chama|fale|fala|preencha|agende|agenda|descubra|veja|vê|olha|olhe|imagine|imagina|conheça|acesse|garanta|saiba|pare|para de|faça|faz|entre|entra|venha|vem|responda|assista)\b',
  'nicho': r'\b(lançamento\w*|construtora\w*|incorporadora\w*|corretor\w*|lead\w*|imobiliári\w*|empreendimento\w*|obra\w*|imóve\w*|imóvel|apartamento\w*|vgv|decorado|planta)\b',
  'contraste': r'(\bnão é\b.{0,40}\bé\b|\bmas\b|\bporém\b|\bsó que\b|\be sim\b|\bem vez de\b)',
}
OCL = re.compile(r'^(p|t|b|d|g|k|q|c(?=[aou]))', re.I)
VOG = re.compile(r'[aeiouáéíóúâêôãõà]+', re.I)
STOP = set('a o e de da do das dos que em no na nos nas um uma para pra por com se é os as ao à ele ela isso esse essa este esta mais muito já foi ser ter tem só'.split())

def silabas(w): return max(1, len(VOG.findall(w)))

def medir_texto(d):
    pal = [p['texto'] for p in d['palavras']]; txt = ' '.join(pal).lower()
    n = max(1, len(pal)); dur = d['meta']['duracao']; fr = d['frases']
    r = {k: round(100 * len(re.findall(v, txt)) / n, 2) for k, v in GRUPOS.items()}  # por 100 palavras
    limpas = [re.sub(r'[^\wáéíóúâêôãõàç]', '', w.lower()) for w in pal]
    cont = [w for w in limpas if w and w not in STOP]
    r['oclusivas_inicio_pct'] = round(100 * sum(1 for w in cont if OCL.match(w)) / max(1, len(cont)), 1)
    r['aliteracao_por100'] = round(100 * sum(1 for a, b in zip(cont, cont[1:]) if a[0] == b[0]) / max(1, len(cont)), 2)
    r['silabas_por_palavra'] = round(st.mean(silabas(w) for w in limpas if w), 2)
    fala_s = sum(p['fim'] - p['ini'] for p in d['palavras']) or 1
    r['silabas_por_s'] = round(sum(silabas(w) for w in limpas if w) / fala_s, 2)
    r['palavras_por_min'] = d['resumo']['palavrasPorMin']
    r['palavras_por_frase'] = round(n / max(1, len(fr)), 1)
    r['perguntas_por_min'] = round(60 * sum(1 for f in fr if f['texto'].strip().endswith('?')) / dur, 2)
    r['repetidas'] = [w for w, c in Counter(w for w in cont if len(w) > 3).most_common(5) if c >= 3]
    r['primeira_frase'] = fr[0]['texto'] if fr else ''
    r['gancho3s'] = d['resumo'].get('gancho3s', '')
    r['primeira_palavra_s'] = d['resumo'].get('primeiraPalavra')
    r['duracao_s'] = dur; r['trocas_por_min'] = d['resumo'].get('trocasPorMin')
    return r

def pausas_texto(d):
    w = d['palavras']; g = [b['ini'] - a['fim'] for a, b in zip(w, w[1:]) if b['ini'] - a['fim'] >= 0.25]
    dur = d['meta']['duracao']
    return {'pausas_por_min': round(60 * len(g) / dur, 1), 'pausa_media_s': round(float(np.mean(g)), 2) if g else 0}

def medir_audio(video, palavras=None):
    with tempfile.TemporaryDirectory() as t:
        wav = os.path.join(t, 'a.wav')
        subprocess.run([FF, '-y', '-v', 'error', '-i', video, '-ac', '1', '-ar', '16000', wav], check=True)
        y, sr = librosa.load(wav, sr=16000)
    if palavras:  # só os trechos com fala (reduz a contaminação da trilha)
        y = np.concatenate([y[int(p['ini'] * sr): int(p['fim'] * sr)] for p in palavras if p['fim'] > p['ini']] or [y])
    f0, voiced, _ = librosa.pyin(y, fmin=65, fmax=400, sr=sr, frame_length=1024, hop_length=320)
    f0 = f0[~np.isnan(f0)]
    st_ = 12 * np.log2(f0 / np.median(f0)) if len(f0) else np.array([0])
    rms = librosa.feature.rms(y=y, frame_length=1024, hop_length=320)[0]
    db = 20 * np.log10(rms + 1e-6); fala = db > (np.max(db) - 35)
    # pausas = trechos sem voz >= 0,25 s dentro da fala
    hop = 320 / sr; pausas = []; run = 0
    for v in (db > (np.max(db) - 30)):
        if not v: run += 1
        else:
            if run * hop >= 0.25: pausas.append(run * hop)
            run = 0
    dur = len(y) / sr
    def tom(seg):
        f, _, _ = librosa.pyin(seg, fmin=65, fmax=400, sr=sr, frame_length=1024, hop_length=320); f = f[~np.isnan(f)]
        return round(float(np.std(12 * np.log2(f / np.median(f)))), 2) if len(f) > 5 else None
    return {
      'tom_mediano_hz': round(float(np.median(f0)), 1) if len(f0) else None,
      'tom_variacao_st': round(float(np.std(st_)), 2),            # desvio do tom em semitons (monótono < ~2)
      'tom_amplitude_st': round(float(np.percentile(st_, 90) - np.percentile(st_, 10)), 2),
      'tom_variacao_gancho3s_st': tom(y[: int(3 * sr)]),
      'volume_variacao_db': round(float(np.std(db[fala])), 2),
    }

if __name__ == '__main__':
    saida, pastas = sys.argv[1], sys.argv[2:]
    out = []
    for p in pastas:
        d = json.load(open(os.path.join(p, 'dados.json')))
        r = {'nome': os.path.basename(p.rstrip('/')), **medir_texto(d)}
        r.update(pausas_texto(d))
        try: r.update(medir_audio(d['video'], d['palavras']))
        except Exception as e: r['erro_audio'] = str(e)[:120]
        out.append(r); print(r['nome'], 'ok', file=sys.stderr)
    json.dump(out, open(saida, 'w'), ensure_ascii=False, indent=1)
