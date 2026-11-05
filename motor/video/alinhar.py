"""Alinhamento forçado de palavras (técnica do WhisperX: github.com/m-bain/whisperX).

O Whisper acerta O QUE foi dito, mas o tempo de cada palavra é aproximado (pode errar por segundos).
Aqui um modelo acústico wav2vec2 em português (o mesmo que o WhisperX usa para 'pt') recalcula início e fim
de cada palavra direto no som, por CTC forced alignment (torchaudio.functional.forced_align).

Uso: python alinhar.py <tarefas.json> <saida.json>   (várias tarefas, um único carregamento do modelo)
  tarefas: [{"wav": caminho, "offset": s, "palavras": [...]}]  → saida: [[palavras refinadas], ...]
           [{"wav": caminho, "offset": s, "literal": true}]   → saida: [[{"texto","ini","fim"}], ...]
  Literal = o que foi dito som por som (CTC guloso, sem modelo de linguagem): mantém as tentativas
  interrompidas e os recomeços que o Whisper funde numa frase limpa. Grafia aproximada; serve para decidir cortes.
     python alinhar.py <audio.wav 16 kHz mono> <entrada.json> <saida.json>
  entrada: {"offset": s, "palavras": [{"texto", "ini", "fim"}]}  (tempos na fonte; o wav começa em `offset`)
  saida:   mesma lista com ini/fim refinados (palavra que não alinhou mantém o tempo do Whisper, com "alinhada": false)
"""
import json, sys, unicodedata, re, wave
import numpy as np
import torch, torchaudio
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor

MODELO = "jonatasgrosman/wav2vec2-large-xlsr-53-portuguese"
torch.set_num_threads(4)  # não ocupar todos os núcleos do Mac


def limpar(t):
    t = unicodedata.normalize("NFC", t.lower())
    return re.sub(r"[^a-záàâãéêíóôõúüç' ]", "", t)


_cache = {}
def modelo_e_proc():
    if not _cache:
        _cache["proc"] = Wav2Vec2Processor.from_pretrained(MODELO)
        _cache["modelo"] = Wav2Vec2ForCTC.from_pretrained(MODELO).eval()
    return _cache["modelo"], _cache["proc"]


def main(wav, entrada, saida):
    dados = json.load(open(entrada))
    json.dump(alinhar(wav, dados["offset"], dados["palavras"]), open(saida, "w"), ensure_ascii=False)


def emissoes(wav):
    modelo, proc = modelo_e_proc()
    with wave.open(wav) as w:  # wav PCM 16-bit mono 16 kHz (gerado pelo ffmpeg)
        sr = w.getframerate(); assert sr == 16000 and w.getnchannels() == 1, "wav precisa ser 16 kHz mono"
        som = torch.from_numpy(np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0).unsqueeze(0)
    som = (som - som.mean()) / (som.std() + 1e-7)  # normalização que o wav2vec2 espera
    with torch.inference_mode():
        emis = torch.log_softmax(modelo(som).logits, dim=-1)[0]  # (quadros, vocab)
    return emis, som.shape[1] / sr / emis.shape[0]


def literal(wav, offset):
    _, proc = modelo_e_proc()
    emis, seg_por_quadro = emissoes(wav)
    inv = {v: k for k, v in proc.tokenizer.get_vocab().items()}
    branco = proc.tokenizer.pad_token_id
    out, letras, ini, fim, anterior = [], "", 0, 0, None
    def fecha():
        if letras:
            out.append({"texto": letras, "ini": round(offset + ini * seg_por_quadro, 3), "fim": round(offset + (fim + 1) * seg_por_quadro, 3)})
    for q, r in enumerate(emis.argmax(-1).tolist()):
        if r == anterior:
            if r != branco and inv[r] != "|": fim = q
            continue
        anterior = r
        if r == branco: continue
        if inv[r] == "|":
            fecha(); letras = ""; continue
        if not letras: ini = q
        letras += inv[r]; fim = q
    fecha()
    return out


def alinhar(wav, offset, palavras):
    _, proc = modelo_e_proc()
    vocab = proc.tokenizer.get_vocab()
    emis, seg_por_quadro = emissoes(wav)

    # sequência de tokens (caracteres) com o separador de palavra "|"
    tokens, dono = [], []  # dono[k] = índice da palavra do token k (-1 = separador)
    for i, p in enumerate(palavras):
        for ch in limpar(p["texto"]):
            if ch == " ":
                continue
            if ch in vocab:
                tokens.append(vocab[ch]); dono.append(i)
        if i < len(palavras) - 1 and "|" in vocab:
            tokens.append(vocab["|"]); dono.append(-1)
    if not tokens or len(tokens) > emis.shape[0]:
        return [{**p, "alinhada": False} for p in palavras]

    alvo = torch.tensor([tokens], dtype=torch.int32)
    rotulos, _ = torchaudio.functional.forced_align(emis.unsqueeze(0), alvo, blank=proc.tokenizer.pad_token_id)
    rotulos = rotulos[0].tolist()
    # mapeia cada quadro emitido (não-branco, mudança de token) ao token k
    ini_q, fim_q = {}, {}
    k, anterior = -1, None
    for q, r in enumerate(rotulos):
        if r == proc.tokenizer.pad_token_id:
            anterior = None; continue
        if r != anterior:
            k += 1
        anterior = r
        if k >= len(tokens):
            break
        w = dono[k]
        if w >= 0:
            ini_q.setdefault(w, q); fim_q[w] = q
    out = []
    for i, p in enumerate(palavras):
        if i in ini_q:
            out.append({**p, "ini": round(offset + ini_q[i] * seg_por_quadro, 3),
                        "fim": round(offset + (fim_q[i] + 1) * seg_por_quadro, 3), "alinhada": True})
        else:
            out.append({**p, "alinhada": False})
    return out


if __name__ == "__main__":
    if len(sys.argv) == 3:
        tarefas = json.load(open(sys.argv[1]))
        json.dump([literal(t["wav"], t["offset"]) if t.get("literal") else alinhar(t["wav"], t["offset"], t["palavras"]) for t in tarefas], open(sys.argv[2], "w"), ensure_ascii=False)
    else:
        main(*sys.argv[1:4])
