"""Builds the ad's audio mix and voice timeline.

Inputs:  ../audio/raw/empleado-invisible/<take>.mp3 (three ElevenLabs narrator takes, A/B/C)
         ../audio/raw/empleado-invisible/music-28s.m4a (the music, already cut from its second 28: the chorus)
Outputs: public/audio/mix.wav (music from the first frame to the end + voice, -14 LUFS), src/timeline.json

Phrase boundaries come from the takes' pauses (silencedetect -45 dB, 0.18 s); the script text is known,
so word times are spread over each speech run by syllable count (no ASR needed).
The music is ducked under the voice and fades out over the last second.

Run: python scripts/build.py
"""
import json, os, re, subprocess
import numpy as np
import pyloudnorm as pyln

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "..", "audio", "raw", "empleado-invisible")
SR = 48000
FPS = 30
DUR = 45.0
TAKES = {"A": "5f74b8b5", "B": "469c3d08", "C": "d162facd"}


def load(name):
    f = next(x for x in os.listdir(RAW) if x.startswith(name))
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(RAW, f), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32).astype(np.float64).reshape(-1, 2)


X = {k: load(p).mean(axis=1) for k, p in TAKES.items()}

# ── phrases: (take, [(raw start, raw end, text)], timeline start) ─────────
# Sub-segments are the take's speech runs between pauses.
PHRASES = {
    "a1": ("A", [(0.00, 2.16, "Tu mejor empleado no cobra nómina.")], 0.35),
    "a2": ("A", [(2.53, 4.38, "Ahora mismo lo haces todo a mano:")], 4.05),
    "a3": ("A", [(4.65, 8.17, "llamadas, mensajes, citas apuntadas en una libreta…")], 6.15),
    "a4": ("A", [(8.64, 9.71, "Ahora imagina…")], 10.05),
    "a5": ("A", [(10.13, 11.56, "Tu empleado invisible.")], 12.7),
    "a6": ("A", [(11.85, None, "Está en el móvil, en el mostrador y en la agenda.")], 14.45),
    "b1": ("B", [(0.00, 1.09, "Responde WhatsApp.")], 17.95),
    "b2": ("B", [(1.36, 2.38, "Confirma citas.")], 19.6),
    "b3": ("B", [(2.62, 3.99, "Envía recordatorios.")], 21.2),
    "b4": ("B", [(4.23, 5.35, "Avisa de cambios.")], 22.95),
    "b5": ("B", [(5.69, 6.57, "Todo a la vez.")], 24.45),
    "b6": ("B", [(7.00, 9.11, "Un empleado: ocho horas,"), (9.34, 12.36, "vacaciones, bajas y nómina.")], 25.75),
    "b7": ("B", [(12.70, None, "Tu asistente: veinticuatro horas, sin bajas, y siempre contesta.")], 31.35),
    "c1": ("C", [(0.00, 2.22, "Y tú, por fin, a lo importante.")], 36.35),
    "c2": ("C", [(2.62, None, "Comenta auditoría y vemos qué podemos automatizar en tu negocio.")], 38.95),
}

V = "aeiouáéíóúü"
STRONG = "aeoáéóíú"


def syl(w):
    w = re.sub(r"[^\wáéíóúñü]", "", w.lower()).replace("qu", "q").replace("gue", "ge").replace("gui", "gi")
    n, prev = 0, None
    for ch in w:
        if ch in V:
            if prev is None or (prev in STRONG and ch in STRONG):
                n += 1
            prev = ch
        else:
            prev = None
    return max(n, 1)


def speech_end(x):
    """Last sample above -45 dBFS (20 ms windows)."""
    win = int(0.02 * SR)
    n = len(x) // win
    rms = np.sqrt((x[: n * win].reshape(n, win) ** 2).mean(axis=1) + 1e-12)
    loud = np.where(20 * np.log10(rms) > -45)[0]
    return (loud[-1] + 1) * win / SR


def speech_start(x, a, b):
    win = int(0.01 * SR)
    seg = x[int(a * SR): int(b * SR)]
    n = len(seg) // win
    rms = np.sqrt((seg[: n * win].reshape(n, win) ** 2).mean(axis=1) + 1e-12)
    loud = np.where(20 * np.log10(rms) > -45)[0]
    return a + (loud[0] * win / SR if len(loud) else 0)


PAD_IN, PAD_OUT = 0.05, 0.12
voice = np.zeros(int(DUR * SR))
words, spans = {}, {}
for pid, (take, subs, t0) in PHRASES.items():
    x = X[take]
    first = speech_start(x, subs[0][0], subs[0][0] + 0.5)
    ws, last_end = [], None
    for a, b, text in subs:
        if b is None:
            b = speech_end(x)
        a = speech_start(x, a, a + 0.5)
        ta = t0 + (a - first)
        tb = t0 + (b - first)
        toks = text.split()
        n = sum(syl(w) for w in toks)
        acc = 0
        for w in toks:
            s = syl(w)
            ws.append({"text": w, "start": round(ta + (tb - ta) * acc / n, 3), "end": round(ta + (tb - ta) * (acc + s) / n, 3)})
            acc += s
        # place the audio of this run (with a little air on both sides)
        ra, rb = max(0, a - PAD_IN), min(len(x) / SR, b + PAD_OUT)
        clip = x[int(ra * SR): int(rb * SR)].copy()
        f = int(0.01 * SR)
        clip[:f] *= np.linspace(0, 1, f)
        clip[-f:] *= np.linspace(1, 0, f)
        at = int((ta - (a - ra)) * SR)
        voice[at: at + len(clip)] += clip[: len(voice) - at]
        last_end = tb
    words[pid] = ws
    spans[pid] = [round(t0, 3), round(last_end, 3)]
    assert last_end < DUR, pid

# no two phrases overlap
order = sorted(spans.items(), key=lambda kv: kv[1][0])
for (p, (a, b)), (q, (c, d)) in zip(order, order[1:]):
    assert b + 0.08 < c, f"{p} ({a}-{b}) runs into {q} ({c}-{d})"

# ── music: from the first frame to the end, ducked under the voice ────────
mf = next(x for x in os.listdir(RAW) if x.startswith("music-28s"))
mpcm = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(RAW, mf), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
                      capture_output=True, check=True).stdout
music = np.frombuffer(mpcm, np.float32).astype(np.float64).reshape(-1, 2)[: len(voice)]
music = np.pad(music, ((0, len(voice) - len(music)), (0, 0)))

# voice activity envelope (attack 60 ms, release 350 ms) → music gain
t = np.arange(len(voice)) / SR
active = np.zeros(len(voice))
for a, b in spans.values():
    active[int((a - 0.08) * SR): int((b + 0.1) * SR)] = 1
k = int(0.005 * SR)
env = active[::k]
sm = np.zeros_like(env)
for i in range(1, len(env)):
    c = 0.08 if env[i] > sm[i - 1] else 0.014  # per 5 ms step
    sm[i] = sm[i - 1] + (env[i] - sm[i - 1]) * c
duck = np.interp(t, np.arange(len(sm)) * k / SR, sm)
DUCK_DB = -11.0
gain = 10 ** (DUCK_DB * duck / 20)
gain *= np.clip(t / 0.15, 0, 1)                 # click-free start on the chorus
gain *= np.clip((DUR - t) / 1.2, 0, 1) ** 1.5   # fade out over the last 1.2 s

# levels: voice at -16 LUFS on its own, music bed 6 dB under it when nothing is said
meter = pyln.Meter(SR)
v2 = np.stack([voice, voice], axis=1)
vl = meter.integrated_loudness(v2)
v2 *= 10 ** ((-16 - vl) / 20)
ml = meter.integrated_loudness(music)
music *= 10 ** ((-22 - ml) / 20)
mix = v2 + music * gain[:, None]

ln = meter.integrated_loudness(mix)
mix *= 10 ** ((-14 - ln) / 20)
peak = np.abs(mix).max()
lim = 10 ** (-1.2 / 20)
if peak > lim:  # soft-knee limiter on the few peaks
    over = np.abs(mix) > lim * 0.9
    mix[over] = np.sign(mix[over]) * (lim * 0.9 + (lim * 0.1) * np.tanh((np.abs(mix[over]) - lim * 0.9) / (lim * 0.1)))
print(f"voice {vl:.1f} LUFS · music {ml:.1f} LUFS · mix {meter.integrated_loudness(mix):.2f} LUFS · peak {20 * np.log10(np.abs(mix).max()):.2f} dBFS")

os.makedirs(os.path.join(ROOT, "public", "audio"), exist_ok=True)
pcm16 = (np.clip(mix, -1, 1) * 32767).astype("<i2").tobytes()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-", os.path.join(ROOT, "public", "audio", "mix.wav")],
               input=pcm16, check=True)

json.dump({"fps": FPS, "duration": DUR, "phrases": spans, "words": words}, open(os.path.join(ROOT, "src", "timeline.json"), "w"), ensure_ascii=False, indent=1)
for pid, ws in words.items():
    print(pid, spans[pid], " ".join(f"{w['text']}@{w['start']:.2f}" for w in ws))
