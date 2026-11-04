"""Prepara la voz de un episodio para Remotion: copia la toma, la deja a nivel de emisión y saca los tiempos por palabra.

Entradas
  episodios/ep-NN.json           el guion en escenas (cada escena con su «voz», el texto exacto de la toma)
  --mp3 <toma.mp3>               la toma de ElevenLabs, entera (no se corta ni se estira)
  --elevenlabs <alineado.json>   opcional: el alineado por caracteres que devuelve ElevenLabs (with-timestamps)
                                 Si no se da, los tiempos salen de un reconocedor local (Parakeet TDT 0.6B v3, sherpa-onnx,
                                 --modelo o $PARAKEET_DIR) y se alinean con el texto del guion.

Salidas (rutas que lee el JSON del episodio)
  public/episodios/ep-NN/voz.mp3        la toma original
  public/episodios/ep-NN/voz.wav        la misma toma, misma duración: paso alto, compresión suave y limitador
                                        → -17 LUFS en mono (-14 LUFS en el mp4 estéreo), pico ≤ -1,5 dBFS
  public/episodios/ep-NN/palabras.json  [{texto, inicio, fin, escena}] en segundos, con el texto del guion (no el de la ASR)

Uso
  python scripts/preparar.py episodios/ep-01.json --mp3 ../audio/raw/serie-claude-code/ep-01_*.mp3
"""
import argparse, difflib, json, os, re, shutil, subprocess, sys, unicodedata
import numpy as np
import pyloudnorm as pyln
from scipy.ndimage import minimum_filter1d, uniform_filter1d
from scipy.signal import butter, sosfiltfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
TARGET_LUFS = -17.0  # mono: al reproducirse en los dos canales suma +3 dB → -14 LUFS en el mp4
CEILING_DB = -1.5


def load(path, sr=SR):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32).astype(np.float64)


def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9ñ]", "", w)


# ── voz a nivel de emisión ────────────────────────────────────────────────────────────────────────────────────────
def master_voice(x):
    x = sosfiltfilt(butter(2, 70, btype="high", fs=SR, output="sos"), x)
    # compresor RMS suave (3:1 por encima del nivel medio de la voz)
    hop = SR // 200
    env = np.sqrt(uniform_filter1d(x ** 2, size=int(0.02 * SR)) + 1e-12)
    lvl = 20 * np.log10(env)
    speech = lvl[lvl > np.percentile(lvl, 40)]
    thr = np.median(speech) + 2.0
    over = np.maximum(0.0, lvl - thr)
    gr = -over * (1 - 1 / 3.0)
    # ataque 5 ms / relajación 120 ms sobre la reducción
    g = np.empty_like(gr)
    a_att, a_rel = np.exp(-1 / (0.005 * SR)), np.exp(-1 / (0.12 * SR))
    acc = 0.0
    for i in range(0, len(gr), hop):  # por bloques de 5 ms (suficiente para la envolvente)
        target = gr[i]
        coef = a_att ** hop if target < acc else a_rel ** hop
        acc = target + (acc - target) * coef
        g[i:i + hop] = acc
    x = x * 10 ** (g / 20)
    meter = pyln.Meter(SR)
    x = x * 10 ** ((TARGET_LUFS - meter.integrated_loudness(x)) / 20)
    for _ in range(3):  # el limitador quita algo de sonoridad: se compensa antes de limitar
        y = limit(x)
        x = x * 10 ** ((TARGET_LUFS - meter.integrated_loudness(y)) / 20)
    y = limit(x)
    return y, meter.integrated_loudness(y)


def limit(x):
    # limitador con anticipación (5 ms): la ganancia nunca deja pasar un pico por encima del techo
    ceil = 10 ** (CEILING_DB / 20)
    need = np.minimum(1.0, ceil / (np.abs(x) + 1e-12))
    L = int(0.005 * SR)
    gl = uniform_filter1d(minimum_filter1d(need, size=2 * L + 1), size=L + 1)
    rel = np.exp(-1 / (0.08 * SR))
    out = np.empty_like(gl)
    acc = 1.0
    for i in range(0, len(gl), 64):  # relajación por bloques de 64 muestras, sin superar nunca la ganancia necesaria
        blk = gl[i:i + 64]
        acc = min(blk.min(), 1 - (1 - acc) * rel ** 64)
        out[i:i + 64] = np.minimum(blk, acc)
    return np.clip(x * out, -ceil, ceil)


# ── palabras de referencia con tiempos ─────────────────────────────────────────────────────────────────────────────
def words_from_elevenlabs(path):
    d = json.load(open(path))
    d = d.get("alignment") or d.get("normalized_alignment") or d
    chars, st, en = d["characters"], d["character_start_times_seconds"], d["character_end_times_seconds"]
    out, cur = [], None
    for c, s, e in zip(chars, st, en):
        if c.isspace():
            cur = None
            continue
        if cur is None:
            cur = {"w": "", "s": s, "e": e}
            out.append(cur)
        cur["w"] += c
        cur["e"] = e
    return out


def words_from_asr(mp3, model_dir):
    import sherpa_onnx
    rec = sherpa_onnx.OfflineRecognizer.from_transducer(
        encoder=f"{model_dir}/encoder.int8.onnx", decoder=f"{model_dir}/decoder.int8.onnx",
        joiner=f"{model_dir}/joiner.int8.onnx", tokens=f"{model_dir}/tokens.txt",
        model_type="nemo_transducer", num_threads=os.cpu_count() or 4)
    x = load(mp3, 16000).astype(np.float32)
    h = 160
    e = 20 * np.log10(np.sqrt(np.mean(x[: len(x) // h * h].reshape(-1, h) ** 2, axis=1)) + 1e-9)
    cuts, pos = [0.0], 0.0
    while len(x) / 16000 - pos > 20:  # trozos < 20 s cortados en el punto más silencioso
        lo, hi = int((pos + 12) * 100), int((pos + 20) * 100)
        pos = (lo + int(np.argmin(e[lo:hi]))) / 100
        cuts.append(pos)
    cuts.append(len(x) / 16000)
    words = []
    for a, b in zip(cuts[:-1], cuts[1:]):
        s = rec.create_stream()
        s.accept_waveform(16000, x[int(a * 16000):int(b * 16000)])
        rec.decode_stream(s)
        for tok, t in zip(s.result.tokens, s.result.timestamps):
            if tok.startswith(("▁", " ")) or not words:
                words.append({"w": tok.lstrip("▁ "), "s": t + a, "e": None})
            else:
                words[-1]["w"] += tok
    return words


# ── alineado guion ↔ referencia (Needleman-Wunsch con parecido de letras) ────────────────────────────────────────────
def align(guion, ref):
    G, R = [norm(w) for w in guion], [norm(w["w"]) for w in ref]
    n, m = len(G), len(R)
    sim = lambda a, b: difflib.SequenceMatcher(None, a, b).ratio() if a and b else 0.0
    S = np.zeros((n + 1, m + 1))
    P = np.zeros((n + 1, m + 1), np.int8)
    S[1:, 0] = -0.4 * np.arange(1, n + 1)
    S[0, 1:] = -0.4 * np.arange(1, m + 1)
    P[1:, 0], P[0, 1:] = 1, 2
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            opts = (S[i - 1, j - 1] + 2 * sim(G[i - 1], R[j - 1]) - 0.6, S[i - 1, j] - 0.4, S[i, j - 1] - 0.4)
            k = int(np.argmax(opts))
            S[i, j], P[i, j] = opts[k], k
    pairs, i, j = {}, n, m
    while i > 0 and j > 0:
        if P[i, j] == 0:
            if sim(G[i - 1], R[j - 1]) >= 0.45:
                pairs[i - 1] = j - 1
            i, j = i - 1, j - 1
        elif P[i, j] == 1:
            i -= 1
        else:
            j -= 1
    return pairs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episodio")
    ap.add_argument("--mp3", required=True)
    ap.add_argument("--elevenlabs")
    ap.add_argument("--modelo", default=os.environ.get("PARAKEET_DIR"))
    args = ap.parse_args()

    ep = json.load(open(args.episodio))
    tag = f"ep-{ep['episodio']:02d}"
    out_dir = os.path.join(ROOT, "public", "episodios", tag)
    os.makedirs(out_dir, exist_ok=True)
    shutil.copyfile(args.mp3, os.path.join(out_dir, "voz.mp3"))

    x = load(args.mp3)
    dur = len(x) / SR
    y, lufs = master_voice(x.copy())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f64le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-c:a", "pcm_s24le", os.path.join(out_dir, "voz.wav")], input=y.tobytes(), check=True)
    print(f"voz.wav: {dur:.3f} s · {lufs:.1f} LUFS · pico {20 * np.log10(np.abs(y).max()):.1f} dBFS")

    # guion → palabras (con la escena a la que pertenece cada una)
    guion, escena_de = [], []
    for esc in ep["escenas"]:
        for w in esc["voz"].split():
            guion.append(w)
            escena_de.append(esc["id"])

    if args.elevenlabs:
        ref, fuente = words_from_elevenlabs(args.elevenlabs), "elevenlabs"
    else:
        if not args.modelo:
            sys.exit("Falta --modelo (carpeta de sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8) o --elevenlabs")
        ref, fuente = words_from_asr(args.mp3, args.modelo), "parakeet-tdt-0.6b-v3"
    pairs = align(guion, ref)
    print(f"{len(pairs)}/{len(guion)} palabras del guion ancladas a la referencia ({fuente})")

    # inicios: anclas directas; el resto se reparte por número de letras entre anclas
    starts = [None] * len(guion)
    for gi, rj in pairs.items():
        starts[gi] = ref[rj]["s"]
    known = [i for i, s in enumerate(starts) if s is not None]
    if not known:
        sys.exit("No se pudo alinear el guion con el audio: ¿es la toma correcta?")
    for a, b in zip([-1] + known, known + [len(guion)]):
        if b - a <= 1:
            continue
        s0 = starts[a] if a >= 0 else 0.0
        s1 = starts[b] if b < len(guion) else dur
        span = range(a + 1, b)
        weights = np.cumsum([0] + [len(norm(guion[k])) + 1 for k in span])
        tot = weights[-1] + (len(norm(guion[a])) + 1 if a >= 0 else 0)
        off = (len(norm(guion[a])) + 1) if a >= 0 else 0
        for idx, k in enumerate(span):
            starts[k] = s0 + (s1 - s0) * (off + weights[idx]) / tot

    # finales y ajuste fino con la energía (marcos de 10 ms)
    hop = SR // 100
    e = 20 * np.log10(np.sqrt(np.mean(x[: len(x) // hop * hop].reshape(-1, hop) ** 2, axis=1)) + 1e-9)
    thr = max(np.percentile(e, 10) + 14, np.percentile(e, 60) - 30)
    voiced = e > thr
    fr = lambda t: int(np.clip(round(t * 100), 0, len(e) - 1))
    for k in range(len(starts)):
        s = starts[k]
        pre = voiced[max(0, fr(s) - 15):fr(s)]
        if len(pre) >= 10 and pre.mean() < 0.2:  # viene de una pausa real: el inicio es el ataque de la voz
            lo = fr(s - 0.1)
            for f in range(lo, fr(s + 0.16)):
                if voiced[f] and voiced[f:f + 10].mean() >= 0.6:
                    starts[k] = max(f / 100 - 0.01, starts[k - 1] + 0.05 if k else 0.0)
                    break
    ends = []
    for k, s in enumerate(starts):
        nxt = starts[k + 1] if k + 1 < len(starts) else dur
        end = nxt
        if k + 1 == len(starts):
            v = np.nonzero(voiced)[0]
            end = min(dur, v[-1] / 100 + 0.05) if len(v) else dur
        else:  # solo hay final antes del siguiente inicio si hay una pausa de verdad (≥ 150 ms) en la segunda mitad
            run = 0
            for f in range(fr(s + max(0.2, 0.45 * (nxt - s))), fr(nxt)):
                run = run + 1 if not voiced[f] else 0
                if run >= 15:
                    end = (f - run + 1) / 100 + 0.03
                    break
        ends.append(max(end, s + 0.06))

    palabras = [{"texto": w, "inicio": round(float(s), 3), "fin": round(float(f), 3), "escena": sc}
                for w, s, f, sc in zip(guion, starts, ends, escena_de)]
    json.dump({"fuente": fuente, "duracion": round(dur, 3), "palabras": palabras},
              open(os.path.join(out_dir, "palabras.json"), "w"), ensure_ascii=False, indent=1)
    print(f"palabras.json: {len(palabras)} palabras")
    for p in palabras:
        print(f"  {p['inicio']:6.2f}-{p['fin']:6.2f} {p['texto']}")


if __name__ == "__main__":
    main()
