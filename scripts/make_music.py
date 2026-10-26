"""Genera una pista electrónica minimalista (105 BPM) con la automatización de volumen
del reel: baja en la intro, sube en las funciones, baja en "Mientras tanto, enfrente…"
y vuelve a subir en el cierre. Siempre muy por debajo de la locución."""
import sys
import wave

import numpy as np

SR = 44100
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 63.28
OUT = sys.argv[1] if len(sys.argv) > 1 else "public/music.wav"
BPM = 105
BEAT = 60 / BPM
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)


def midi(m):
    return 440 * 2 ** ((m - 69) / 12)


# Am - F - C - G, dos compases por acorde
CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
BAR = BEAT * 4


def chord_at(sec):
    return CHORDS[int(sec // (BAR * 2)) % len(CHORDS)]


# Secciones (segundos, sincronizadas con la locución)
FEAT_START, DUCK_START, CLOSE_START, END_VOICE = 5.65, 26.6, 40.7, 62.28


def env_curve(points):
    xs, ys = zip(*points)
    return np.interp(t, xs, ys)


# --- Pad aditivo (siempre) ---
pad = np.zeros(N)
for i in range(int(DUR // (BAR * 2)) + 1):
    s0 = i * BAR * 2
    a, b = int(s0 * SR), min(N, int((s0 + BAR * 2 + 0.6) * SR))
    if a >= N:
        break
    tt = t[a:b] - s0
    seg = np.zeros(b - a)
    for note in CHORDS[i % 4]:
        f = midi(note)
        for h, amp in [(1, 1.0), (2, 0.35), (3, 0.12)]:
            for det in (-0.12, 0.12):
                seg += amp * np.sin(2 * np.pi * f * h * (1 + det / 100) * tt + rng.uniform(0, 6))
    fade = np.clip(tt / 0.6, 0, 1) * np.clip((BAR * 2 + 0.6 - tt) / 0.6, 0, 1)
    pad[a:b] += seg * fade
pad /= np.max(np.abs(pad))

# --- Percusión y bajo ---
kick = np.zeros(N)
hats = np.zeros(N)
bass = np.zeros(N)
arp = np.zeros(N)
klen = int(0.35 * SR)
kt = np.arange(klen) / SR
kick_s = np.sin(2 * np.pi * (45 * kt + (75 / 18) * (1 - np.exp(-18 * kt)))) * np.exp(-9 * kt)
hlen = int(0.06 * SR)
hn = rng.standard_normal(hlen)
hat_s = np.diff(np.concatenate([[0], hn])) * np.exp(-np.arange(hlen) / (0.012 * SR))
blen = int(BEAT / 2 * SR)
bt = np.arange(blen) / SR
plen = int(0.3 * SR)
pt = np.arange(plen) / SR


def add(buf, sig, pos):
    a = int(pos * SR)
    if a >= N:
        return
    b = min(N, a + len(sig))
    buf[a:b] += sig[: b - a]


n_beats = int(DUR / BEAT) + 1
for k in range(n_beats):
    pos = k * BEAT
    add(kick, kick_s, pos)
    add(hats, hat_s, pos + BEAT / 2)
    add(hats, 0.5 * hat_s, pos + BEAT * 0.75)
    root = midi(chord_at(pos)[0] - 24)
    for e in range(2):
        bs = (np.sin(2 * np.pi * root * bt) + 0.3 * np.sin(4 * np.pi * root * bt)) * np.exp(-6 * bt)
        bs *= np.clip(bt / 0.005, 0, 1)
        add(bass, bs, pos + e * BEAT / 2)
    notes = chord_at(pos)
    for s in range(4):
        n = notes[(k * 4 + s) % 3] + 12 + (12 if s == 3 else 0)
        f = midi(n)
        pl = (np.sin(2 * np.pi * f * pt) + 0.2 * np.sin(4 * np.pi * f * pt)) * np.exp(-14 * pt)
        add(arp, pl * np.clip(pt / 0.003, 0, 1), pos + s * BEAT / 4)

for b in (kick, hats, bass, arp):
    b /= np.max(np.abs(b)) + 1e-9

# Automatización por capa
energy = env_curve([
    (0, 0.0), (FEAT_START - 0.4, 0.0), (FEAT_START + 0.4, 1.0),
    (DUCK_START - 0.3, 1.0), (DUCK_START + 0.6, 0.0),
    (CLOSE_START - 0.5, 0.0), (CLOSE_START + 0.6, 1.0),
    (END_VOICE, 1.0), (DUR, 0.0),
])
master = env_curve([
    (0, 0.55), (FEAT_START, 0.6), (FEAT_START + 0.8, 1.0),
    (DUCK_START - 0.2, 1.0), (DUCK_START + 0.8, 0.42),
    (CLOSE_START - 0.6, 0.45), (CLOSE_START + 0.8, 1.0),
    (END_VOICE - 0.2, 1.0), (DUR - 0.05, 0.0), (DUR, 0.0),
])
intro_hats = env_curve([(0, 0.35), (FEAT_START, 0.35), (FEAT_START + 0.4, 1.0), (DUR, 1.0)])

mix_l = 0.55 * pad + energy * (0.75 * kick + 0.4 * bass) + 0.18 * hats * np.maximum(energy, 0.35 * (t < FEAT_START)) * intro_hats
mix_r = mix_l.copy()
# Arpegio con ligero paneo alterno
pan = 0.5 + 0.25 * np.sin(2 * np.pi * t / (BEAT * 2))
mix_l += energy * 0.32 * arp * (1 - pan) * 2
mix_r += energy * 0.32 * arp * pan * 2
mix = np.stack([mix_l, mix_r], axis=1) * master[:, None]

# Nivel final: la locución manda. Pico de música en torno a -21 dBFS.
mix *= 10 ** (-21 / 20) / np.max(np.abs(mix))
pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open(OUT, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("ok", OUT, DUR)
