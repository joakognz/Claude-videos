"""Builds the reel's audio mix and timeline.

Inputs:  ../audio/raw/matematicas-sin-verificar/<take>.mp3 (one ElevenLabs take), data/words.json (scripts/align.py)
Outputs: public/audio/mix.wav (music + sfx + voice, -14 LUFS), src/timeline.json

The take is used as is (no cuts): it starts at VOICE_AT and its own pauses mark the scenes.

Run: python scripts/build.py
"""
import json, os, subprocess
import numpy as np
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "..", "audio", "raw", "matematicas-sin-verificar")
TAKE = "551c2e70"
SR = 48000
FPS = 30
TOTAL = 53.0
N = int(TOTAL * SR)
VOICE_AT = 0.3
rng = np.random.default_rng(31)


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


# segments: 0 OpenAI dice… 1 Es Navier-Stokes, 2 las ecuaciones… 3 Dicen que tardó… 4 con unos diez mil… 5 Un modelo interno…
# 6 y GPT-6 Astra… 7 que comprueba cada paso. 8 Pero el Instituto Clay… 9 la revisará sin prisa. 10 Un estudio de octubre…
# 11 dice que el código… 12 No dicen que esté mal. 13 Dicen que lo verificado… 14 Es una afirmación, 15 no un hecho confirmado.
# 16 La lección: 17 que una IA diga… 18 Comprueba que se verifica… 19 y que alguien lo revise. 20 Comenta auditoría…

# ── scenes (the prompt's eleven, moved onto the take's pauses) ───────────
scenes = {
    "E1": 0.0, "E2": seg_start(1) - 0.15, "E3": seg_start(3) - 0.15, "E4": seg_start(5) - 0.15, "E5": seg_start(8) - 0.15,
    "E6": seg_start(10) - 0.15, "E7": seg_start(12) - 0.15, "E8": seg_start(14) - 0.15, "E9": seg_start(16) - 0.15,
    "E10": seg_start(18) - 0.15, "E11": seg_start(20) - 0.15, "FIN": SEGS[-1][1] + VOICE_AT + 0.3, "END": TOTAL,
}
S = scenes


def cap(chunks, end, **kw):
    """chunks: (text, time, highlight) with highlight in {None, 'o'}; a 4th item True breaks the line before the chunk"""
    out = {"chunks": [{"text": c[0], "t": round(c[1], 3), "hl": c[2], **({"br": True} if len(c) > 3 and c[3] else {})} for c in chunks],
           "start": round(chunks[0][1] - 0.12, 3), "end": round(end, 3)}
    if "micro" in kw:
        kw["micro"] = [[m[0], round(m[1], 3)] for m in kw["micro"]]
    out.update(kw)
    return out


captions = {
    "E1": cap([("Una IA dice haber", wt(0, 3), None), ("resuelto un", wt(0, 6), None, True), ("problema del Milenio", wt(0, 8), "o", True)],
              S["E2"] - 0.1, micro=[["ANUNCIO DE OPENAI · 8 SEP 2026", wt(0, 0)]], lines=3, size=76),
    "E2": cap([("Navier-Stokes:", wt(1, 1), "o"), ("las ecuaciones", wt(2, 1), None, True), ("de los fluidos", wt(2, 5), None)],
              S["E3"] - 0.1, micro=[["UNO DE LOS SIETE PROBLEMAS DEL MILENIO", wt(2, 0)]]),
    "E3": cap([("88 horas", wt(3, 3), "o"), ("10.000 agentes", wt(4, 2), None, True)], S["E4"] - 0.1,
              micro=[["SEGÚN OPENAI", wt(3, 0)]]),
    "E4": cap([("Un modelo la encontró;", wt(5, 0), None), ("Astra", wt(6, 2), "o", True), ("la pasó a Lean", wt(6, 3), None)],
              S["E5"] - 0.1, micro=[["COMPRUEBA CADA PASO", wt(7, 1)]], size=76),
    "E5": cap([("El Clay", wt(8, 3), None), ("la revisará", wt(9, 0), None), ("sin prisa", wt(9, 2), "o", True)], S["E6"] - 0.1,
              micro=[["INSTITUTO CLAY", wt(8, 2)], ["· UN MILLÓN DE PREMIO", wt(8, 7)]]),
    "E6": cap([("El código", wt(11, 3), None), ("no coincide", wt(11, 6), "o")], S["E7"] - 0.1,
              micro=[["ESTUDIO · OCTUBRE 2026", wt(10, 1)], ["· SIN REVISAR", wt(10, 5)]]),
    "E7": cap([("Verificado", wt(13, 3), "o"), ("no es lo que", wt(13, 4), None, True), ("se escribió", wt(13, 9), None)], S["E8"] - 0.1,
              micro=[["NO DICEN QUE ESTÉ MAL", wt(12, 0)]]),
    "E8": cap([("Una", wt(14, 1), None), ("afirmación", wt(14, 2), "o"), ("no un hecho", wt(15, 0), None, True)], S["E9"] - 0.1,
              micro=[["SIN CONFIRMAR", wt(15, 3)]]),
    "E9": cap([("Hecho", wt(17, 6), "o"), ("no es lo mismo", wt(17, 7), None, True), ("que", wt(17, 9), None), ("bien", wt(17, 11), "o")],
              S["E10"] - 0.1, micro=[["LA LECCIÓN", wt(16, 0)]]),
    "E10": cap([("Comprueba", wt(18, 0), None), ("lo correcto", wt(18, 4), "o")], S["E11"] - 0.1,
               micro=[["REVISIÓN HUMANA", wt(19, 2)]]),
}
# the aligner bunches the last words of the take; "tu IA" sits just before its end
cta = {"comenta": wt(20, 0), "keyword": wt(20, 1), "revisa": wt(20, 3), "tuia": SEGS[20][1] + VOICE_AT - 0.55, "sub": wt(20, 4)}

# ── on-screen events ────────────────────────────────────────────────────
ev = {
    "dolly": 4.0,
    "flow": wt(1, 1) - 0.1,                                # E2: the flow lines bend, the vortex tightens
    "clock0": S["E3"] + 0.05, "clock1": wt(3, 6) + 0.35,    # E3: clock runs 0 → 88 h
    "swarm": wt(4, 2) - 0.1,                               # "diez mil": the swarm multiplies
    "cubeOut": S["E4"] - 0.05,                             # E4: the cube sinks, orb + arch rise
    "scroll": wt(5, 4) - 0.1,                              # "encontró": a scroll leaves the orb
    "arch": wt(6, 2) - 0.05, "archEnd": wt(6, 6) + 0.2,    # "Astra … Lean": it crosses the arch
    "ticks": wt(7, 1), "tickStep": 0.13,                   # "comprueba cada paso": boxes tick
    "vault": S["E5"] + 0.05, "swing": wt(9, 1) - 0.2,      # E5: vault, pendulum
    "scrolls": S["E6"] + 0.05, "shift": wt(11, 6) - 0.05,  # E6: two scrolls; "no coincide": the rows slip
    "leanOn": wt(13, 3) - 0.1, "lensE7": wt(13, 4),        # E7: Lean scroll lights, written one fades, lens trembles
    "dim": S["E8"] + 0.05, "seal": wt(14, 2) + 0.05, "hollow": wt(15, 2) - 0.05,  # E8: stamps
    "orb9": S["E9"] + 0.05, "badge": wt(17, 6) - 0.05, "slot": wt(17, 11) - 0.05,  # E9: badge, empty slot
    "scan": S["E10"] + 0.05, "fit": wt(18, 4) - 0.05, "fill": wt(19, 2) - 0.05,  # E10: lens checks, pieces fit, slot fills
    "dark": S["E11"], "typeStart": cta["keyword"] - 0.3, "typeStep": 0.075,
}
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


# ── music (original, synthesised): suspended, curious, D minor → F major lift for the lesson, 84 BPM ──
BPM = 84
beat = 60 / BPM
bar = 4 * beat
prog_a = [[38, 53, 57, 60, 64], [34, 53, 57, 62, 65], [31, 53, 58, 62, 65], [33, 52, 57, 61, 64]]  # Dm9 · B♭maj7 · Gm9 · A7sus-ish
prog_b = [[41, 57, 60, 64, 67], [38, 57, 60, 62, 65], [34, 57, 60, 62, 65], [36, 55, 60, 64, 67]]  # Fmaj7 · Dm9 · B♭maj9 · C
padL, padR, bass, arp, kick, hat = (np.zeros(N) for _ in range(6))
t0, ci = 0.0, 0
while t0 < TOTAL:
    chord = (prog_b if t0 >= S["E9"] - 0.5 else prog_a)[ci % 4]
    i0 = int(t0 * SR)
    n = min(int((bar + 1.0) * SR), N - i0)
    if n <= 0:
        break
    tl = np.arange(n) / SR
    e = env_ar(n, 0.7, 1.0)
    for m in chord[1:]:
        f = note_hz(m)
        tri = sum(np.sin(2 * np.pi * f * h * tl) / h ** 2 for h in (1, 3, 5))
        padL[i0:i0 + n] += (np.sin(2 * np.pi * f * 0.997 * tl) * 0.07 + tri * 0.03) * e
        padR[i0:i0 + n] += (np.sin(2 * np.pi * f * 1.003 * tl) * 0.07 + tri * 0.03) * e
    root = note_hz(chord[0])
    for pos, ln in ((0, 2.5), (2.5, 1.5)):
        j = int((t0 + pos * beat) * SR)
        nn = min(int(ln * beat * SR), N - j)
        if nn <= 0:
            break
        tl2 = np.arange(nn) / SR
        bass[j:j + nn] += (np.sin(2 * np.pi * root * tl2) + 0.3 * np.sin(4 * np.pi * root * tl2)) * np.exp(-tl2 / 0.6) * env_ar(nn, 0.01, 0.05)
    # glassy 16th arpeggio (the "computation")
    pat = [1, 2, 3, 4, 3, 2, 4, 3]
    for s in range(16):
        j = int((t0 + s * beat / 4) * SR)
        nn = min(int(0.4 * SR), N - j)
        if nn <= 0:
            break
        tl2 = np.arange(nn) / SR
        f = note_hz(chord[pat[s % 8]] + 12)
        arp[j:j + nn] += (np.sin(2 * np.pi * f * tl2) + 0.2 * np.sin(2 * np.pi * f * 3.01 * tl2) * np.exp(-tl2 / 0.03)) * np.exp(-tl2 / 0.14) * (1 if s % 4 == 0 else 0.5)
    for bt in range(4):
        j = int((t0 + bt * beat) * SR)
        nn = min(int(0.35 * SR), N - j)
        if nn > 0 and bt in (0, 2):
            tl2 = np.arange(nn) / SR
            fr = 46 + 70 * np.exp(-tl2 / 0.03)
            kick[j:j + nn] += np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tl2 / 0.18)
        jh = int((t0 + (bt + 0.5) * beat) * SR)
        nh = min(int(0.05 * SR), N - jh)
        if nh > 0:
            hat[jh:jh + nh] += hp(rng.standard_normal(nh), 7500) * np.exp(-np.arange(nh) / SR / 0.014)
    t0 += bar
    ci += 1

padL, padR = lp(padL, 2400), lp(padR, 2400)
arp = lp(arp, 5200)
# arrangement: pad from the start; arp from E2; pulse from E3 (the run); thins out for the doubts (E6–E8); lifts for the lesson
intro = step(tt, 0, 1.2)
arp_on = step(tt, S["E2"] - 0.3, S["E2"] + 0.3) * (1 - 0.6 * step(tt, S["E6"] - 0.2, S["E6"] + 0.2) * (1 - step(tt, S["E9"] - 0.2, S["E9"] + 0.3)))
pulse = step(tt, S["E3"] - 0.2, S["E3"]) * (1 - 0.8 * step(tt, S["E6"] - 0.2, S["E6"]) * (1 - step(tt, S["E9"] - 0.1, S["E9"] + 0.2)))
lift = step(tt, S["E9"] - 0.2, S["E9"] + 0.3)
out = 1 - step(tt, S["FIN"] - 0.1, S["FIN"] + 0.3)
phase = (tt % beat) / beat
pump = 1 - (1 - (0.65 + 0.35 * np.clip(phase / 0.4, 0, 1) ** 0.7)) * pulse
mL = (padL * (0.8 + 0.3 * lift) * pump * intro + 0.1 * arp * arp_on + 0.34 * bass * pulse + 0.4 * kick * pulse
      + 0.05 * hat * pulse * (0.5 + 0.5 * lift)) * out
mR = (padR * (0.8 + 0.3 * lift) * pump * intro + 0.1 * np.roll(arp, int(0.012 * SR)) * arp_on + 0.34 * bass * pulse
      + 0.4 * kick * pulse + 0.05 * np.roll(hat, 240) * pulse * (0.5 + 0.5 * lift)) * out
# ending chord over the logo (F add9)
i_end = int(S["FIN"] * SR)
tl = np.arange(N - i_end) / SR
end_chord = sum(np.sin(2 * np.pi * note_hz(m) * tl) for m in (41, 48, 53, 55, 60)) * np.exp(-tl / 1.1) * 0.06 * env_ar(N - i_end, 0.02, 0.3)
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
    elif kind == "swirl":  # flow speeding up: filtered noise sweeping up
        nn = int(kw.get("dur", 2.0) * SR)
        tl = np.arange(nn) / SR
        fc = 300 + 2500 * (tl / tl[-1]) ** 2
        x = np.zeros(nn)
        seg = int(0.05 * SR)
        noise = rng.standard_normal(nn)
        for k in range(0, nn, seg):
            x[k:k + seg] = bp(noise[k:k + seg + 200], max(100, fc[k] * 0.6), fc[k] * 1.4)[: len(x[k:k + seg])]
        x *= env_ar(nn, 0.3, 0.4) * 0.22
    elif kind == "swarm":  # buzzing hum that grows (many detuned saws, amplitude-modulated)
        nn = int(kw.get("dur", 3.0) * SR)
        tl = np.arange(nn) / SR
        x = sum(np.sign(np.sin(2 * np.pi * (180 + 9 * k) * tl + k)) * 0.04 for k in range(8))
        x = lp(x, 1800) * (0.55 + 0.45 * np.sin(2 * np.pi * 23 * tl)) * np.clip(tl / tl[-1] * 1.4, 0, 1) * env_ar(nn, 0.05, 0.5)
    elif kind == "tick":  # clock tick
        nn = int(0.03 * SR)
        x = hp(rng.standard_normal(nn), 3500) * np.exp(-np.arange(nn) / SR / 0.005) * 0.5
    elif kind == "rise":  # prop rising out of the floor
        nn = int(0.9 * SR)
        tl = np.arange(nn) / SR
        x = lp(rng.standard_normal(nn), 700) * np.sin(np.pi * tl / 0.9) * 0.35 + np.sin(2 * np.pi * 60 * tl) * 0.25 * np.sin(np.pi * tl / 0.9)
    elif kind == "appear":  # soft shimmer + low bloom
        x = (sum(np.sin(2 * np.pi * note_hz(m) * tl) for m in (74, 77, 81, 86)) * 0.08 * np.exp(-tl / 0.5)
             + np.sin(2 * np.pi * 73 * tl) * 0.5 * np.exp(-tl / 0.4)) * env_ar(nn, 0.04, 0.1)
    elif kind == "paper":
        nn = int(0.5 * SR)
        tl = np.arange(nn) / SR
        x = bp(rng.standard_normal(nn), 2000, 8000) * np.sin(np.pi * tl / 0.5) ** 3 * 0.25 * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * tl))
    elif kind == "click":  # Lean checkbox
        nn = int(0.06 * SR)
        tl = np.arange(nn) / SR
        x = (np.sin(2 * np.pi * kw.get("f", 1800) * tl) * 0.5 + bp(rng.standard_normal(nn), 2500, 7000) * 0.4) * np.exp(-tl / 0.01)
    elif kind == "pend":  # slow pendulum: soft wooden tock at each end of the swing
        nn = int(0.15 * SR)
        tl = np.arange(nn) / SR
        x = (np.sin(2 * np.pi * 420 * tl) * 0.5 + bp(rng.standard_normal(nn), 400, 2000) * 0.3) * np.exp(-tl / 0.04)
    elif kind == "slip":  # rows slipping out of line: short detuned wobble
        nn = int(0.7 * SR)
        tl = np.arange(nn) / SR
        f = 520 * (1 - 0.15 * tl / 0.7)
        x = (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.5 + np.sin(2 * np.pi * np.cumsum(f * 1.06) / SR) * 0.5) * env_ar(nn, 0.02, 0.3) * 0.25
    elif kind == "glow":  # Lean scroll lights up
        x = sum(np.sin(2 * np.pi * note_hz(m) * tl) for m in (77, 81, 84, 89)) * 0.07 * np.exp(-tl / 0.7) * env_ar(nn, 0.15, 0.2)
    elif kind == "thud":  # stamp
        nn = int(0.6 * SR)
        tl = np.arange(nn) / SR
        x = (np.sin(2 * np.pi * (70 + 60 * np.exp(-tl / 0.02)) * tl) * np.exp(-tl / 0.12) * 0.9
             + lp(rng.standard_normal(nn), 900) * np.exp(-tl / 0.025) * 0.5)
    elif kind == "hollow":  # the empty "HECHO" stamp: airy, hollow tone
        nn = int(1.0 * SR)
        tl = np.arange(nn) / SR
        x = bp(rng.standard_normal(nn), 500, 900) * np.exp(-tl / 0.35) * 0.4
    elif kind == "ding":
        x = sum(np.sin(2 * np.pi * note_hz(m) * tl) * a for m, a in ((86, 0.5), (91, 0.3), (98, 0.12))) * np.exp(-tl / 0.35) * 0.5
    elif kind == "empty":  # empty slot flickers: two soft low blips
        nn = int(0.4 * SR)
        tl = np.arange(nn) / SR
        x = np.sin(2 * np.pi * 220 * tl) * (np.exp(-tl / 0.04) + np.exp(-np.clip(tl - 0.18, 0, None) / 0.04) * (tl > 0.18)) * 0.35
    elif kind == "fit":  # pieces snapping together
        nn = int(0.25 * SR)
        tl = np.arange(nn) / SR
        x = (bp(rng.standard_normal(nn), 1500, 5000) * 0.5 + np.sin(2 * np.pi * 900 * tl) * 0.4) * np.exp(-tl / 0.02)
    elif kind == "hum":  # lens scanning
        nn = int(kw.get("dur", 1.4) * SR)
        tl = np.arange(nn) / SR
        x = (np.sin(2 * np.pi * 120 * tl) * 0.2 + np.sin(2 * np.pi * note_hz(81) * tl) * 0.05) * env_ar(nn, 0.15, 0.4)
    elif kind == "down":
        nn = int(1.0 * SR)
        tl = np.arange(nn) / SR
        x = lp(rng.standard_normal(nn), 500) * np.sin(np.pi * tl / 1.0) * 0.35
    elif kind == "key":
        nn = int(0.05 * SR)
        tl = np.arange(nn) / SR
        x = (bp(rng.standard_normal(nn), 2000, 6000) * 0.6 + np.sin(2 * np.pi * 1700 * tl) * 0.2) * np.exp(-tl / 0.008)
    else:
        raise ValueError(kind)
    place(sfx, x, t, gain)


add("whoosh", 0.0, 0.8)
add("appear", 1.6, 0.6)
add("swirl", ev["flow"], 1.0, dur=S["E3"] - ev["flow"])
add("swarm", ev["clock0"], 1.0, dur=S["E4"] - ev["clock0"] + 0.2)
for k in range(int((ev["clock1"] - ev["clock0"]) / 0.09)):
    add("tick", ev["clock0"] + k * 0.09, 0.8 if k % 4 == 0 else 0.45)
add("rise", ev["cubeOut"] + 0.2, 0.8)
add("appear", ev["scroll"], 0.6)
add("paper", ev["arch"], 0.8)
for i in range(8):
    add("click", ev["ticks"] + i * ev["tickStep"], 0.8, f=1600 + 90 * i)
add("rise", ev["vault"], 0.9)
for k in range(4):
    add("pend", ev["swing"] + 0.6 + k * 1.25, 0.6)
add("rise", ev["scrolls"], 0.7)
add("slip", ev["shift"], 1.0)
add("glow", ev["leanOn"], 0.9)
add("hum", ev["lensE7"], 0.6, dur=S["E8"] - ev["lensE7"])
add("down", ev["dim"], 0.6)
add("thud", ev["seal"] + 0.2, 1.0)
add("hollow", ev["hollow"], 0.8)
add("ding", ev["badge"] + 0.1, 0.8)
add("empty", ev["slot"], 0.9)
add("hum", ev["scan"], 0.6, dur=ev["fit"] - ev["scan"] + 0.3)
add("fit", ev["fit"] + 0.25, 1.0)
add("fit", ev["fill"] + 0.3, 0.8)
add("ding", ev["fill"] + 0.35, 0.6)
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
