"""Música y efectos originales, sintetizados aquí (sin derechos de terceros). Se generan una vez para toda la serie.

Salidas
  public/audio/musica.wav         base de 153,6 s (64 compases a 100 ppm) que enlaza consigo misma (reverb circular),
                                  normalizada a -14 LUFS: así «-20 dB» en el JSON es 20 dB por debajo de la voz
  public/audio/sfx/golpe.wav      sello de PASO: golpe grave + chasquido de madera
  public/audio/sfx/tick.wav       tick de paso completado (dos parciales brillantes)
  public/audio/sfx/whoosh.wav     entrada por el portal (ruido con barrido de banda)
  public/audio/sfx/pop.wav        aparición de etiquetas y tarjetas
  public/audio/sfx/tecleo.wav     tecleo en bucle (1,2 s)
  public/audio/sfx/envio.wav      enviar el comentario

Uso: python scripts/sintetizar_audio.py
"""
import os, subprocess
import numpy as np
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt, sosfiltfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
rng = np.random.default_rng(7)


def save(path, x, peak_db=None):
    if peak_db is not None:
        x = x / (np.abs(x).max() + 1e-12) * 10 ** (peak_db / 20)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f64le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "pcm_s16le", path],
                   input=np.ascontiguousarray(x, np.float64).tobytes(), check=True)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)


def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d)


# ── efectos ────────────────────────────────────────────────────────────────────────────────────────────────────────
def golpe():
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    f = 50 + 70 * np.exp(-t / 0.035)
    thump = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.16)
    click = bp(rng.standard_normal(n), 900, 4500) * env(n, 0.0005, 0.012)
    wood = np.sin(2 * np.pi * 690 * t) * env(n, 0.001, 0.05) * 0.5
    return np.tanh(1.6 * (thump + 0.6 * click + wood))


def tick():
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    tone = (np.sin(2 * np.pi * 2637 * t) + 0.55 * np.sin(2 * np.pi * 3951 * t)) * env(n, 0.001, 0.09)
    tone2 = np.sin(2 * np.pi * 3520 * t) * env(n, 0.001, 0.07) * 0.6
    tone2 = np.roll(tone2, int(0.07 * SR)); tone2[: int(0.07 * SR)] = 0
    click = hp(rng.standard_normal(n), 3000) * env(n, 0.0003, 0.004) * 0.6
    return tone + tone2 + click


def whoosh():
    n = int(0.75 * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    out = np.zeros(n)
    blk = 512
    for i in range(0, n, blk):  # barrido de banda por bloques (300 Hz → 3,2 kHz)
        u = i / n
        fc = 300 * (3200 / 300) ** u
        seg = bp(x[max(0, i - 2048): i + blk], fc * 0.7, min(fc * 1.4, 20000))[-min(blk, n - i):]
        out[i:i + blk] = seg
    shape = np.sin(np.pi * np.clip(t / 0.75, 0, 1)) ** 1.6
    return out * shape


def pop():
    n = int(0.18 * SR)
    t = np.arange(n) / SR
    f = 420 + 700 * np.exp(-t / 0.018)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.035)


def tecleo():
    n = int(1.2 * SR)
    out = np.zeros(n)
    t = 0.0
    while t < 1.2 - 0.03:
        i = int(t * SR)
        m = int(0.03 * SR)
        k = hp(rng.standard_normal(m), 2200) * env(m, 0.0004, 0.004)
        body = np.sin(2 * np.pi * rng.uniform(900, 1500) * np.arange(m) / SR) * env(m, 0.0005, 0.008) * 0.5
        out[i:i + m] += (k + body) * rng.uniform(0.6, 1.0)
        t += rng.uniform(0.055, 0.11)
    return out


def envio():
    n = int(0.4 * SR)
    t = np.arange(n) / SR
    f = 500 + 1100 * np.clip(t / 0.15, 0, 1)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.005, 0.08)
    air = bp(rng.standard_normal(n), 2000, 8000) * env(n, 0.02, 0.06) * 0.3
    return tone + air


# ── música ────────────────────────────────────────────────────────────────────────────────────────────────────────
BPM = 100
BEAT = 60 / BPM
BAR = 4 * BEAT
BARS = 64
N = int(round(BARS * BAR * SR))
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
# la menor: Am – F – C – G (dos compases cada acorde)
CHORDS = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 60], [55, 59, 62, 67]]
BASS = [45, 41, 48, 43]


def place(buf, x, at):
    i = int(round(at * SR)) % N
    m = min(len(x), N - i)
    buf[i:i + m] += x[:m]
    if m < len(x):  # lo que sobra al final da la vuelta (bucle sin costura)
        buf[: len(x) - m] += x[m:]


def saw(f, n):
    t = np.arange(n) / SR
    return 2 * ((t * f) % 1) - 1


def musica():
    pad, bass, arp, drums = (np.zeros(N) for _ in range(4))
    for bar in range(BARS):
        ch = CHORDS[(bar // 2) % 4]
        t0 = bar * BAR
        if bar % 2 == 0:  # pad: dos compases por acorde, sierras desafinadas y filtradas
            n = int(2 * BAR * SR + 0.6 * SR)
            tt = np.arange(n) / SR
            v = sum(saw(midi(m) * d, n) for m in ch for d in (0.996, 1.004))
            amp = np.minimum(1, tt / 0.5) * np.minimum(1, np.maximum(0, (2 * BAR + 0.6 - tt) / 0.6))
            place(pad, lp(v, 1100) * amp * 0.06, t0)
        for b in (0, 2):  # bajo en 1 y 3
            n = int(1.9 * BEAT * SR)
            tt = np.arange(n) / SR
            f = midi(BASS[(bar // 2) % 4])
            s = np.tanh(1.5 * np.sin(2 * np.pi * f * tt)) * env(n, 0.01, 0.6)
            place(bass, s * 0.32, t0 + b * BEAT)
        for k in range(8):  # arpegio en corcheas (pulsado, con eco de corchea con puntillo)
            n = int(0.5 * SR)
            tt = np.arange(n) / SR
            note = ch[[0, 2, 1, 3, 2, 1, 3, 2][k]] + 12
            s = (np.sign(np.sin(2 * np.pi * midi(note) * tt)) * 0.5 + np.sin(2 * np.pi * midi(note) * tt)) * env(n, 0.003, 0.11)
            vel = 0.75 if k % 2 else 1.0
            on = bar >= 4  # el arpegio entra al 5.º compás
            if on:
                place(arp, lp(s, 2600) * 0.05 * vel, t0 + k * BEAT / 2)
        if bar >= 8 and not (bar % 16 == 15):  # batería suave a partir del compás 9 (respira cada 16)
            for b in (0, 2):
                n = int(0.35 * SR)
                tt = np.arange(n) / SR
                f = 45 + 80 * np.exp(-tt / 0.03)
                place(drums, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.12) * 0.5, t0 + b * BEAT)
            for b in (1, 3):
                n = int(0.2 * SR)
                place(drums, bp(rng.standard_normal(n), 1200, 5000) * env(n, 0.001, 0.035) * 0.12, t0 + b * BEAT)
            for k in range(8):
                n = int(0.06 * SR)
                place(drums, hp(rng.standard_normal(n), 7000) * env(n, 0.0005, 0.012) * (0.05 if k % 2 else 0.025), t0 + k * BEAT / 2)
    # eco del arpegio (corchea con puntillo, circular)
    d = int(0.75 * BEAT * SR)
    arp = arp + 0.35 * np.roll(arp, d) + 0.12 * np.roll(arp, 2 * d)
    mix = pad + bass + arp + drums
    # reverb: convolución circular con ruido que decae (1,6 s) → el final enlaza con el principio
    ir_n = int(1.6 * SR)
    ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR / 0.45)
    ir = lp(ir, 5000)
    ir /= np.sqrt(np.sum(ir ** 2))
    wet_src = pad + arp
    H = np.fft.rfft(np.concatenate([ir, np.zeros(N - ir_n)]))
    wet = np.fft.irfft(np.fft.rfft(wet_src) * H, n=N)
    mix = mix + 0.35 * wet
    # hueco suave en la zona de la voz (1,5–4 kHz) para que la voz siempre mande
    mix = mix - 0.35 * sosfiltfilt(butter(2, [1500, 4000], btype="band", fs=SR, output="sos"), mix)
    mix = hp(mix, 35)
    meter = pyln.Meter(SR)
    mix *= 10 ** ((-14 - meter.integrated_loudness(mix)) / 20)
    pk = np.abs(mix).max()
    if pk > 0.89:
        mix = np.tanh(mix / pk * 1.2) / np.tanh(1.2) * 0.89
        mix *= 10 ** ((-14 - meter.integrated_loudness(mix)) / 20)
    return mix


if __name__ == "__main__":
    sfx = os.path.join(ROOT, "public", "audio", "sfx")
    save(os.path.join(sfx, "golpe.wav"), golpe(), -1)
    save(os.path.join(sfx, "tick.wav"), tick(), -3)
    save(os.path.join(sfx, "whoosh.wav"), whoosh(), -4)
    save(os.path.join(sfx, "pop.wav"), pop(), -6)
    save(os.path.join(sfx, "tecleo.wav"), tecleo(), -8)
    save(os.path.join(sfx, "envio.wav"), envio(), -4)
    m = musica()
    save(os.path.join(ROOT, "public", "audio", "musica.wav"), m)
    print(f"musica.wav: {len(m) / SR:.1f} s · {pyln.Meter(SR).integrated_loudness(m):.1f} LUFS · pico {20 * np.log10(np.abs(m).max()):.1f} dBFS")
