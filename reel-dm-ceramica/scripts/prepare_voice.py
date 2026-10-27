"""Trims the narrator takes and brings them to the target pace.

Inputs:  ../audio/raw/<take>.mp3 (ElevenLabs takes)
Outputs: ../audio/clean/dm-narrador-{A,B}.mp3

- Every pause inside real silence is shortened to 0.2 s (0.3 s after the hook,
  before the twist and before the CTA). Speech is never cut.
- If the read is slower than 175-185 wpm, it is time-stretched (pitch kept).

Run: python scripts/prepare_voice.py
"""
import os, subprocess
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "..", "audio", "raw")
CLEAN = os.path.join(ROOT, "..", "audio", "clean")
SR = 44100
THR_DB = -42  # frame RMS below this = silence
MIN_SIL = 0.1

TAKES = {
    # name: (file prefix, script words, {pause index: target seconds})
    "dm-narrador-A": ("7f205b52", 30, {1: 0.3}),          # pause 1 = after the hook sentence
    "dm-narrador-B": ("b5b02ab1", 52, {"cuantos": 0.3, "comenta": 0.3}),
}


def load(path):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32).astype(np.float64)


def silences(x):
    hop = SR // 200
    n = len(x) // hop
    r = 20 * np.log10(np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1)) + 1e-9)
    quiet = r < THR_DB
    out, i = [], 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]:
                j += 1
            if (j - i) * hop / SR >= MIN_SIL or i == 0 or j == n:
                out.append([i * hop / SR, j * hop / SR])
            i = j
        else:
            i += 1
    return out


def save(x, path):
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2").tobytes()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-c:a", "libmp3lame", "-b:a", "192k", path], input=pcm, check=True)


os.makedirs(CLEAN, exist_ok=True)
for name, (prefix, n_words, special) in TAKES.items():
    src = next(f for f in os.listdir(RAW) if f.startswith(prefix))
    x = load(os.path.join(RAW, src))
    sil = silences(x)
    inner = [s for s in sil if s[0] > 0.01 and s[1] < len(x) / SR - 0.01]
    targets = [0.2] * len(inner)
    for k, v in special.items():
        if isinstance(k, int):
            targets[k] = v
    if name == "dm-narrador-B":  # the two longest pauses near the end: twist and CTA
        tail = sorted(range(len(inner)), key=lambda i: inner[i][0])[-3:]
        for i in tail:
            if 16.0 < inner[i][0] < 17.2 or 19.4 < inner[i][0] < 20.3:
                targets[i] = 0.3
    pieces, cursor = [], 0.0
    lead = sil[0][1] if sil and sil[0][0] <= 0.01 else 0.0
    cursor = max(0.0, lead - 0.04)
    fade = int(0.008 * SR)
    for (a, b), tgt in zip(inner, targets):
        if b - a > tgt:
            keep_a = a + tgt / 2
            keep_b = b - tgt / 2
            pieces.append(x[int(cursor * SR):int(keep_a * SR)])
            cursor = keep_b
    end = sil[-1][0] + 0.15 if sil and sil[-1][1] >= len(x) / SR - 0.01 else len(x) / SR
    pieces.append(x[int(cursor * SR):int(min(end, len(x) / SR) * SR)])
    # short crossfades at every splice (all inside silence)
    y = pieces[0]
    for p in pieces[1:]:
        f = min(fade, len(y), len(p))
        ramp = np.linspace(0, 1, f)
        y = np.concatenate([y[:-f], y[-f:] * (1 - ramp) + p[:f] * ramp, p[f:]])
    dur = len(y) / SR
    wpm = n_words / dur * 60
    tmp = os.path.join(CLEAN, name + ".tmp.wav")
    out = os.path.join(CLEAN, name + ".mp3")
    save(y, out)
    if wpm < 175:
        tempo = 180 / wpm
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", out, "-af", f"atempo={tempo:.4f}", tmp], check=True)
        y = load(tmp)
        os.remove(tmp)
        save(y, out)
    print(f"{name}: raw {len(x) / SR:.2f}s → {dur:.2f}s ({wpm:.0f} wpm) → {len(y) / SR:.2f}s "
          f"({n_words / (len(y) / SR) * 60:.0f} wpm) · pauses {[round(b - a, 2) for a, b in inner]}")
