"""Builds the reel's audio mix and timeline.

Inputs:  ../audio/raw/claudius-tienda/<take>.mp3 (one ElevenLabs take), data/words.json (scripts/align.py)
Outputs: public/audio/mix.wav (music + sfx + voice, -14 LUFS), src/timeline.json

The take is used as is (no cuts): it starts at VOICE_AT and its own pauses mark the scenes.

Run: python scripts/build.py
"""
import json, os, subprocess
import numpy as np
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "..", "audio", "raw", "claudius-tienda")
TAKE = "a9843a6c"
SR = 48000
FPS = 30
TOTAL = 50.0
N = int(TOTAL * SR)
VOICE_AT = 0.3
rng = np.random.default_rng(23)


def load(prefix):
    src = next(f for f in os.listdir(RAW) if f.startswith(prefix))
    pcm = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", os.path.join(RAW, src), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
        capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32).astype(np.float64)


def speech_rms(x):
    hop = SR // 100
    n = len(x) // hop
    r = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    return np.sqrt(np.mean(r[r > 10 ** (-40 / 20)] ** 2))


W = json.load(open(os.path.join(ROOT, "data", "words.json")))["A"]
x = load(TAKE)
x *= 10 ** (-18 / 20) / speech_rms(x)
voice = np.zeros(N)
voice[int(VOICE_AT * SR):int(VOICE_AT * SR) + len(x)] = x[: N - int(VOICE_AT * SR)]

# words grouped by segment, on the timeline
SEGS = W["segments"]
seg_words = [[{"w": w["w"], "s": round(w["s"] + VOICE_AT, 3), "e": round(w["e"] + VOICE_AT, 3)}
              for w in W["words"] if a - 0.01 <= w["s"] < b] for a, b in SEGS]


def wt(seg, idx):
    """Timeline start of word `idx` of segment `seg`."""
    return seg_words[seg][idx]["s"]


def seg_start(seg):
    return SEGS[seg][0] + VOICE_AT


# segments: 0 Anthropic dejó… 1 Se llamaba Claudius, 2 y vendía snacks… 3 En el primer experimento… 4 Regalaba descuentos…
# 5 Llegó a inventarse… 6 Y a decir… 7 Anthropic lo admitió… 8 a ese Claudius… 9 Seis meses después… 10 empezó a ganar dinero.
# 11 Pero seguía cayendo… 12 La lección… 13 la IA no sustituye… 14 Necesita herramientas… 15 Comenta auditoría…

# ── scenes (the prompt's ten, moved onto the take's pauses) ──────────────
scenes = {
    "E1": 0.0, "E2": seg_start(3) - 0.15, "E3": seg_start(4) - 0.15, "E4": seg_start(5) - 0.15, "E5": seg_start(6) - 0.15,
    "E6": seg_start(7) - 0.15, "E7": seg_start(9) - 0.15, "E8": seg_start(11) - 0.15, "E9": seg_start(12) - 0.15,
    "E10": seg_start(15) - 0.15, "FIN": SEGS[-1][1] + VOICE_AT + 0.3, "END": TOTAL,
}
S = scenes


def cap(chunks, end, **kw):
    """chunks: (text, time, highlight) with highlight in {None, 'o'}; br=True breaks the line before the chunk"""
    out = {"chunks": [{"text": c[0], "t": round(c[1], 3), "hl": c[2], **({"br": True} if len(c) > 3 and c[3] else {})} for c in chunks],
           "start": round(chunks[0][1] - 0.12, 3), "end": round(end, 3)}
    for k in ("micro",):
        if k in kw:
            kw[k] = [[m[0], round(m[1], 3)] for m in kw[k]]
    out.update(kw)
    return out


captions = {
    "E1": cap([("Una IA", wt(0, 3), None), ("llevó", wt(0, 4), None), ("una tienda real", wt(0, 6), "o")], S["E2"] - 0.1,
              micro=[["ANTHROPIC × ANDON LABS", wt(1, 0)], ["· SAN FRANCISCO", wt(2, 7)]]),
    "E2": cap([("Sin", wt(3, 6), None), ("beneficios", wt(3, 8), "o")], S["E3"] - 0.1,
              micro=[["PROJECT VEND · FASE 1 · 2025", wt(3, 0)]]),
    "E3": cap([("Regalaba", wt(4, 0), None), ("descuentos", wt(4, 1), "o")], S["E4"] - 0.1,
              micro=[["VENDÍA POR DEBAJO DEL COSTE", wt(4, 3)]]),
    "E4": cap([("Inventó", wt(5, 2), None), ("una cuenta de pago", wt(5, 4), "o")], S["E5"] - 0.1,
              micro=[["CUENTA INEXISTENTE", wt(5, 8)]]),
    "E5": cap([("Dijo ser", wt(6, 2), None), ("una persona", wt(6, 5), "o")], S["E6"] - 0.1,
              micro=[["31 MAR – 1 ABR 2025", wt(6, 8)]]),
    "E6": cap([("No lo contrataría", wt(8, 3), "o")], S["E7"] - 0.1,
              micro=[["ANTHROPIC · INFORME DE JUNIO 2025", wt(7, 0)]]),
    "E7": cap([("Seis meses después,", wt(9, 0), None), ("empezó a ganar", wt(10, 0), "o", True), ("dinero", wt(10, 3), None)],
              S["E8"] - 0.1, micro=[["FASE 2 · DICIEMBRE 2025", wt(9, 4)]]),
    "E8": cap([("Seguía", wt(11, 1), None), ("cayendo en trampas", wt(11, 2), "o")], S["E9"] - 0.1,
              micro=[["UNA PERSONA TUVO QUE FRENARLO", wt(11, 8)]]),
    "E9a": cap([("La IA", wt(13, 1), None), ("no sustituye", wt(13, 2), None), ("al criterio", wt(13, 4), "o")], wt(14, 0) - 0.1,
               micro=[["LA LECCIÓN PARA TU NEGOCIO", wt(12, 0)]]),
    "E9b": cap([("La IA necesita", wt(14, 0), None), ("supervisión", wt(14, 7), "o")], S["E10"] - 0.1,
               micro=[["HERRAMIENTAS", wt(14, 1)], ["· LÍMITES", wt(14, 2)], ["· REVISIÓN", wt(14, 7)]]),
}
cta = {"comenta": wt(15, 0), "keyword": wt(15, 1), "revisa": wt(15, 3), "tuia": wt(15, 7), "sin": wt(15, 9)}

# ── on-screen events ────────────────────────────────────────────────────
ev = {
    "dolly": 4.0,                                         # camera locks on the shop
    "name": wt(1, 2),                                     # "Claudius": name tag
    "sale": wt(2, 1) - 0.1,                               # "vendía": a snack slides onto the counter…
    "chart0": S["E2"] + 0.05,                             # E2: the value line draws in…
    "down0": wt(3, 4), "down1": wt(3, 8) + 0.25,          # …and steps down ("el negocio … beneficios")
    "chartOff": wt(3, 8) + 0.55,                          # …then dies
    "fly0": wt(4, 0) - 0.05, "flyStep": 0.085,            # E3: products leave the shelves ("Regalaba")
    "tags": wt(4, 1) + 0.05,                              # price tags drop ("descuentos")
    "card": S["E4"] + 0.1, "glitch": wt(5, 2) - 0.05,     # E4: the payment card, glitching from "inventarse"
    "dissolve": wt(5, 8) - 0.05, "qmark": wt(5, 9),       # dissolves into "?" ("no existía")
    "human": wt(6, 2) - 0.1, "humanFull": wt(6, 6),       # E5: the human pictogram over Claudius ("persona")
    "doc": S["E6"] + 0.1, "docAway": wt(8, 3) - 0.1,      # E6: the contract, floating away from "no lo contrataría"
    "skip": S["E7"] + 0.05,                               # E7: time skip
    "tower": wt(9, 5) - 0.1,                              # "herramientas": register tower
    "boss": wt(9, 8) - 0.1,                               # "agente jefe": balcony + boss orb
    "up0": wt(10, 0) - 0.05, "up1": wt(10, 3) + 0.4,      # "empezó a ganar dinero": the line climbs
    "deal": S["E8"] + 0.1,                                # E8: the contract on the counter
    "reach": wt(11, 1),                                   # the hand of light reaches for it
    "barrier": wt(11, 9) - 0.12,                          # "persona": the barrier drops
    "tools": wt(14, 1) - 0.05,                            # E9: "herramientas"
    "rails": wt(14, 2) - 0.05,                            # "límites"
    "lens0": wt(13, 5) - 0.1, "lens": wt(14, 7) - 0.05,   # "criterio" / "supervise": the lens
    "dark": S["E10"],                                     # E10: the plaza darkens
    "typeStart": cta["keyword"] - 0.3, "typeStep": 0.075,
}
ev["chartOn"] = ev["up0"] - 0.6
ev = {k: round(v, 3) for k, v in ev.items()}

# ── helpers ─────────────────────────────────────────────────────────────
tt = np.arange(N) / SR


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, fs=SR, output="sos"), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, btype="high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def note_hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def place(buf, x, t0, gain=1.0):
    i = int(round(t0 * SR))
    if i < 0:
        x, i = x[-i:], 0
    n = max(0, min(len(x), len(buf) - i))
    buf[i:i + n] += x[:n] * gain


def env_ar(n, a, r):
    e = np.ones(n)
    na, nr = min(int(a * SR), n), min(int(r * SR), n)
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def step(t, a, b):
    return np.clip((t - a) / (b - a), 0, 1)


# ── music (original, synthesised): night-shop lounge, F minor → A♭ major lift, 92 BPM ──
BPM = 92
beat = 60 / BPM
bar = 4 * beat
# Fm9 · D♭maj7 · A♭maj7 · E♭6 (phase 1)  →  A♭maj9 · Fm9 · D♭maj9 · E♭sus (phase 2 onwards)
prog_a = [[41, 56, 60, 63, 67], [37, 56, 60, 65, 68], [44, 55, 60, 63, 67], [39, 55, 58, 63, 65]]
prog_b = [[44, 55, 60, 63, 70], [41, 56, 60, 63, 67], [37, 56, 60, 63, 65], [39, 56, 58, 63, 65]]
padL, padR, bass, keys, kick, hat, snap = (np.zeros(N) for _ in range(7))
t0, ci = 0.0, 0
while t0 < TOTAL:
    chord = (prog_b if t0 >= S["E7"] - 0.5 else prog_a)[ci % 4]
    i0 = int(t0 * SR)
    n = min(int((bar + 1.0) * SR), N - i0)
    if n <= 0:
        break
    tl = np.arange(n) / SR
    e = env_ar(n, 0.6, 1.0)
    for m in chord[1:]:
        f = note_hz(m)
        tri = sum(np.sin(2 * np.pi * f * h * tl) / h ** 2 for h in (1, 3, 5))
        padL[i0:i0 + n] += (np.sin(2 * np.pi * f * 0.997 * tl) * 0.07 + tri * 0.03) * e
        padR[i0:i0 + n] += (np.sin(2 * np.pi * f * 1.003 * tl) * 0.07 + tri * 0.03) * e
    root = note_hz(chord[0])
    for s, (pos, ln) in enumerate(((0, 1.5), (1.5, 0.5), (2, 1.0), (3, 0.75), (3.75, 0.25))):  # syncopated bass
        j = int((t0 + pos * beat) * SR)
        nn = min(int(ln * beat * SR), N - j)
        if nn <= 0:
            break
        tl2 = np.arange(nn) / SR
        r = root * (1.5 if s == 3 else 1)
        bass[j:j + nn] += (np.sin(2 * np.pi * r * tl2) + 0.3 * np.sin(4 * np.pi * r * tl2)) * np.exp(-tl2 / 0.4) * env_ar(nn, 0.01, 0.04)
    # electric-piano stabs on the off-beats (sine + bell partial)
    for pos in (0.5, 1.75, 2.5, 3.5):
        j = int((t0 + pos * beat) * SR)
        nn = min(int(0.7 * SR), N - j)
        if nn <= 0:
            break
        tl2 = np.arange(nn) / SR
        for m in chord[2:]:
            f = note_hz(m)
            keys[j:j + nn] += (np.sin(2 * np.pi * f * tl2) + 0.18 * np.sin(2 * np.pi * f * 4.0 * tl2) * np.exp(-tl2 / 0.05)) * np.exp(-tl2 / 0.28)
    for bt in range(4):
        j = int((t0 + bt * beat) * SR)
        nn = min(int(0.35 * SR), N - j)
        if nn > 0 and bt in (0, 2):
            tl2 = np.arange(nn) / SR
            fr = 48 + 70 * np.exp(-tl2 / 0.03)
            kick[j:j + nn] += np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tl2 / 0.17)
        if nn > 0 and bt in (1, 3):
            m = min(int(0.12 * SR), N - j)
            snap[j:j + m] += bp(rng.standard_normal(m), 1200, 6000) * np.exp(-np.arange(m) / SR / 0.03)
        for half in (0.5, 0.0):
            jh = int((t0 + (bt + half) * beat) * SR)
            nh = min(int(0.05 * SR), N - jh)
            if nh > 0:
                hat[jh:jh + nh] += hp(rng.standard_normal(nh), 7500) * np.exp(-np.arange(nh) / SR / 0.014) * (1 if half else 0.5)
    t0 += bar
    ci += 1

padL, padR = lp(padL, 2400), lp(padR, 2400)
keys = lp(keys, 4200)
# arrangement: pad + keys from the start; pulse from E1's end; the groove drops out during the failures' worst
# moments (E4–E6), returns brighter with phase 2 (E7), softens for the lesson (E9) and stops at FIN
intro = step(tt, 0, 1.2)
pulse = step(tt, 3.8, 4.2) * (1 - 0.7 * step(tt, S["E4"] - 0.2, S["E4"]) * (1 - step(tt, S["E7"] - 0.1, S["E7"] + 0.2)))
pulse *= 1 - 0.45 * step(tt, S["E9"] - 0.2, S["E9"] + 0.3)
lift = step(tt, S["E7"] - 0.2, S["E7"] + 0.3)
out = 1 - step(tt, S["FIN"] - 0.1, S["FIN"] + 0.3)
phase = (tt % beat) / beat
pump = 1 - (1 - (0.65 + 0.35 * np.clip(phase / 0.4, 0, 1) ** 0.7)) * pulse
# the music wobbles down in pitch (tape-stop feel) when the business value dies in E2: done as a filter dip
dip = 1 - 0.5 * np.exp(-((tt - ev["chartOff"]) / 0.35) ** 2)
mL = (padL * (0.8 + 0.3 * lift) * pump * intro + 0.09 * keys * intro * (0.6 + 0.4 * pulse) + 0.36 * bass * pulse
      + 0.4 * kick * pulse + 0.08 * snap * pulse + 0.05 * hat * pulse * (0.4 + 0.6 * lift)) * out * dip
mR = (padR * (0.8 + 0.3 * lift) * pump * intro + 0.09 * np.roll(keys, int(0.011 * SR)) * intro * (0.6 + 0.4 * pulse) + 0.36 * bass * pulse
      + 0.4 * kick * pulse + 0.08 * np.roll(snap, 120) * pulse + 0.05 * np.roll(hat, 240) * pulse * (0.4 + 0.6 * lift)) * out * dip
# ending chord over the logo (A♭ add9)
i_end = int(S["FIN"] * SR)
tl = np.arange(N - i_end) / SR
end_chord = sum(np.sin(2 * np.pi * note_hz(m) * tl) for m in (44, 51, 56, 58, 63)) * np.exp(-tl / 1.1) * 0.06 * env_ar(N - i_end, 0.02, 0.3)
mL[i_end:] += end_chord
mR[i_end:] += end_chord

# ── sound effects (synthesised) ─────────────────────────────────────────
sfx = np.zeros(N)
sfx_list = []


def add(kind, t, gain=1.0, **kw):
    sfx_list.append({"t": round(t, 3), "type": kind})
    nn = int(1.2 * SR)
    tl = np.arange(nn) / SR
    if kind == "whoosh":  # long air sweep (the dolly-in)
        nn = int(4.2 * SR)
        tl = np.arange(nn) / SR
        x = bp(rng.standard_normal(nn), 250, 3500) * np.sin(np.pi * np.clip(tl / 4.2, 0, 1)) ** 2 * 0.25
    elif kind == "swish":
        nn = int(0.35 * SR)
        tl = np.arange(nn) / SR
        x = bp(rng.standard_normal(nn), 900, 6000) * np.sin(np.pi * tl / 0.35) ** 2 * 0.3
    elif kind == "register":  # cash register: drawer rattle, then the bell
        x = np.zeros(nn)
        m = int(0.16 * SR)
        x[:m] += bp(rng.standard_normal(m), 600, 3000) * np.exp(-np.arange(m) / SR / 0.05) * 0.5
        j = int(0.12 * SR)
        tb = np.arange(nn - j) / SR
        x[j:] += sum(np.sin(2 * np.pi * f * tb) * a for f, a in ((2093, 0.5), (2637, 0.3), (5274, 0.12), (3520, 0.1))) * np.exp(-tb / 0.45) * 0.5
    elif kind == "fall":  # value line stepping down: descending tone
        nn = int(kw.get("dur", 1.4) * SR)
        tl = np.arange(nn) / SR
        f = 660 * np.exp(-tl * 1.1)
        ph = 2 * np.pi * np.cumsum(f) / SR
        x = (np.sin(ph) + 0.3 * np.sin(2 * ph)) * env_ar(nn, 0.02, 0.4) * 0.22
    elif kind == "dead":  # the line goes out: low thump + short buzz
        nn = int(0.6 * SR)
        tl = np.arange(nn) / SR
        x = (np.sin(2 * np.pi * 70 * tl) * np.exp(-tl / 0.15) * 0.6 + np.sign(np.sin(2 * np.pi * 110 * tl)) * 0.06 * np.exp(-tl / 0.12))
    elif kind == "tag":  # price tag hitting the floor
        nn = int(0.1 * SR)
        tl = np.arange(nn) / SR
        x = (bp(rng.standard_normal(nn), 2500, 7000) * 0.5 + np.sin(2 * np.pi * kw.get("f", 1900) * tl) * 0.35) * np.exp(-tl / 0.018)
    elif kind == "glitch":  # digital crackle: bit-crushed noise bursts
        nn = int(kw.get("dur", 0.9) * SR)
        x = np.zeros(nn)
        k = 0
        while k < nn:
            ln = int(rng.uniform(0.01, 0.06) * SR)
            if rng.random() < 0.6:
                seg = rng.standard_normal(min(ln, nn - k))
                hold = int(rng.integers(4, 40))
                seg = np.repeat(seg[::hold], hold)[: len(seg)]
                x[k:k + len(seg)] = np.round(seg * 3) / 3 * rng.uniform(0.15, 0.4)
            k += ln
        x = hp(x, 300)
    elif kind == "dissolve":  # sparkly fizz upwards
        nn = int(0.8 * SR)
        tl = np.arange(nn) / SR
        x = bp(rng.standard_normal(nn), 3000, 9000) * np.exp(-tl / 0.3) * 0.25 + sum(
            np.sin(2 * np.pi * f * tl) for f in (1760, 2217, 2637)) * 0.04 * np.exp(-tl / 0.25)
    elif kind == "appear":  # soft shimmer + low bloom
        x = (sum(np.sin(2 * np.pi * note_hz(m) * tl) for m in (72, 75, 79, 84)) * 0.08 * np.exp(-tl / 0.5)
             + np.sin(2 * np.pi * 70 * tl) * 0.5 * np.exp(-tl / 0.4)) * env_ar(nn, 0.04, 0.1)
    elif kind == "tremble":  # uneasy wobble under the human pictogram
        nn = int(kw.get("dur", 2.0) * SR)
        tl = np.arange(nn) / SR
        x = np.sin(2 * np.pi * (180 + 6 * np.sin(2 * np.pi * 9 * tl)) * tl) * (0.5 + 0.5 * np.sin(2 * np.pi * 11 * tl)) * env_ar(nn, 0.2, 0.4) * 0.12
    elif kind == "paper":  # sheet rustle
        nn = int(0.5 * SR)
        tl = np.arange(nn) / SR
        x = bp(rng.standard_normal(nn), 2000, 8000) * np.sin(np.pi * tl / 0.5) ** 3 * 0.25 * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * tl))
    elif kind == "float":  # airy rise as the sheet drifts off
        nn = int(1.6 * SR)
        tl = np.arange(nn) / SR
        x = bp(rng.standard_normal(nn), 600, 3000) * np.sin(np.pi * tl / 1.6) ** 2 * 0.18
    elif kind == "rewind":  # time skip: fast tick run + swell
        nn = int(1.1 * SR)
        tl = np.arange(nn) / SR
        x = bp(rng.standard_normal(nn), 800, 6000) * (tl / 1.1) ** 2 * 0.25
        for k in range(14):
            j = int((k * 0.075) * SR)
            m = int(0.015 * SR)
            x[j:j + m] += hp(rng.standard_normal(m), 4000) * 0.5
    elif kind == "pop":
        nn = int(0.12 * SR)
        tl = np.arange(nn) / SR
        x = np.sin(2 * np.pi * (400 + 900 * tl / 0.12) * tl) * np.exp(-tl / 0.035) * 0.35
    elif kind == "boom":  # module / lens lands
        nn = int(1.6 * SR)
        tl = np.arange(nn) / SR
        x = (np.sin(2 * np.pi * 55 * tl) * 0.7 * np.exp(-tl / 0.45) + lp(rng.standard_normal(nn), 400) * 0.3 * np.exp(-tl / 0.12)
             + sum(np.sin(2 * np.pi * note_hz(m) * tl) for m in (75, 80, 84)) * 0.05 * np.exp(-tl / 0.8))
    elif kind == "riseTone":  # value line climbing
        nn = int(kw.get("dur", 1.2) * SR)
        tl = np.arange(nn) / SR
        f = 330 * np.exp(tl * 0.9)
        ph = 2 * np.pi * np.cumsum(f) / SR
        x = (np.sin(ph) + 0.25 * np.sin(2 * ph)) * env_ar(nn, 0.05, 0.25) * 0.18
    elif kind == "slam":  # dry hit of the barrier
        nn = int(0.5 * SR)
        tl = np.arange(nn) / SR
        x = (np.sin(2 * np.pi * (90 + 120 * np.exp(-tl / 0.02)) * tl) * np.exp(-tl / 0.09) * 0.9
             + bp(rng.standard_normal(nn), 800, 5000) * np.exp(-tl / 0.012) * 0.7)
    elif kind == "hum":  # lens switching on
        nn = int(1.4 * SR)
        tl = np.arange(nn) / SR
        x = (np.sin(2 * np.pi * 120 * tl) * 0.2 + np.sin(2 * np.pi * note_hz(80) * tl) * 0.07) * env_ar(nn, 0.15, 0.8)
    elif kind == "blip":
        nn = int(0.15 * SR)
        tl = np.arange(nn) / SR
        x = np.sin(2 * np.pi * kw.get("f", 1320) * tl) * np.exp(-tl / 0.04) * 0.3
    elif kind == "key":
        nn = int(0.05 * SR)
        tl = np.arange(nn) / SR
        x = (bp(rng.standard_normal(nn), 2000, 6000) * 0.6 + np.sin(2 * np.pi * 1700 * tl) * 0.2) * np.exp(-tl / 0.008)
    elif kind == "down":  # plaza darkening
        nn = int(1.0 * SR)
        tl = np.arange(nn) / SR
        x = lp(rng.standard_normal(nn), 500) * np.sin(np.pi * tl / 1.0) * 0.35
    else:
        raise ValueError(kind)
    place(sfx, x, t, gain)


add("whoosh", 0.0, 0.8)
add("appear", 2.0, 0.7)
add("blip", ev["name"] + 0.1, 0.8)
add("swish", ev["sale"], 0.5)
add("register", ev["sale"] + 0.55, 0.9)
add("blip", ev["chart0"], 0.5, f=990)
add("fall", ev["down0"], 1.0, dur=ev["down1"] - ev["down0"] + 0.2)
add("dead", ev["chartOff"], 0.8)
for i in range(8):
    add("swish", ev["fly0"] + i * ev["flyStep"], 0.45)
for i in range(6):
    add("tag", ev["tags"] + 0.35 + i * 0.07, 0.6, f=1700 + 160 * i)
add("appear", ev["card"], 0.5)
add("glitch", ev["glitch"], 0.9, dur=ev["dissolve"] - ev["glitch"] + 0.2)
add("dissolve", ev["dissolve"] + 0.1, 0.9)
add("blip", ev["qmark"] + 0.1, 0.7, f=660)
add("appear", ev["human"], 0.6)
add("tremble", ev["humanFull"] - 0.3, 1.0, dur=S["E6"] - ev["humanFull"] + 0.3)
add("paper", ev["doc"], 0.8)
add("float", ev["docAway"], 1.0)
add("rewind", ev["skip"] - 0.2, 0.9)
add("boom", ev["tower"] + 0.2, 0.7)
add("boom", ev["boss"] + 0.25, 0.6)
add("appear", ev["boss"] + 0.35, 0.6)
add("riseTone", ev["up0"], 1.0, dur=ev["up1"] - ev["up0"])
add("register", ev["up1"] - 0.1, 0.6)
add("paper", ev["deal"], 0.7)
add("swish", ev["reach"] + 0.1, 0.5)
add("slam", ev["barrier"] + 0.2, 1.0)
for i in range(3):
    add("blip", ev["tools"] + i * 0.12, 0.6, f=1100 + 220 * i)
add("boom", ev["rails"] + 0.2, 0.5)
add("hum", ev["lens0"], 0.6)
add("appear", ev["lens"], 0.9)
add("down", ev["dark"] - 0.1, 0.8)
for i in range(9):
    add("key", ev["typeStart"] + i * ev["typeStep"], 0.7)
add("appear", S["FIN"] + 0.3, 0.8)

# ── mix: music ducked under the voice ─────────────────────────────────────
venv = np.abs(voice)
k = int(0.12 * SR)
venv = np.convolve(venv, np.ones(k) / k, mode="same")
duck = 1 - 0.45 * np.clip(venv / (np.percentile(venv[venv > 1e-4], 60) + 1e-9), 0, 1)
duck = lp(duck, 6)
L = mL * duck * 0.55 + sfx * 0.5 + voice
R = mR * duck * 0.55 + np.roll(sfx, 60) * 0.5 + voice
st = np.stack([L, R], axis=1)
meter = pyln.Meter(SR)
st *= 10 ** ((-14 - meter.integrated_loudness(st)) / 20)
peak = np.abs(st).max()
if peak > 0.84:  # soft-limit the odd peak, leaving headroom for true peak ≤ -1 dBTP
    st = np.tanh(st / 0.84 * 1.2) * 0.84 / np.tanh(1.2)
    st *= 10 ** ((-14 - meter.integrated_loudness(st)) / 20)
os.makedirs(os.path.join(ROOT, "public", "audio"), exist_ok=True)
pcm = (np.clip(st, -1, 1) * 32767).astype("<i2").tobytes()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-",
                os.path.join(ROOT, "public", "audio", "mix.wav")], input=pcm, check=True)

timeline = {"fps": FPS, "durationInFrames": int(TOTAL * FPS), "scenes": {k: round(v, 3) for k, v in scenes.items()},
            "captions": captions, "cta": {k: round(v, 3) for k, v in cta.items()}, "ev": ev, "sfx": sfx_list}
json.dump(timeline, open(os.path.join(ROOT, "src", "timeline.json"), "w"), ensure_ascii=False, indent=1)
print("scenes", {k: round(v, 2) for k, v in scenes.items()})
print("loudness", round(meter.integrated_loudness(st), 2), "LUFS · peak", round(20 * np.log10(np.abs(st).max()), 2), "dBFS")
