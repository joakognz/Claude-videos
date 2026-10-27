"""Recorta la locución original a las frases clave (completas y a velocidad natural). Imprime los tiempos nuevos de las palabras clave.

Uso: python3 scripts/cut_voice.py public/voiceover.mp3 public/voiceover_short.mp3
"""
import subprocess
import sys
import wave

import numpy as np

SRC, OUT = sys.argv[1], sys.argv[2]
TEMPO = 1.0  # velocidad natural: frases completas, sin acelerar
SR = 44100
GAP = 0.28  # silencio entre frases

# (inicio, fin, separación posterior) en segundos de la locución original. Solo frases completas.
CLIPS = [
    (0.08, 2.42, GAP),    # Misma calle, misma carta.
    (4.12, 5.40, GAP),    # Pero uno siempre está lleno.
    (5.66, 7.84, GAP),    # Responde solo a cualquier hora
    (10.10, 12.42, GAP),  # Reserva la mesa sin que nadie descuelgue el teléfono.
    (16.16, 19.04, GAP),  # Si alguien cancela, avisa al siguiente al instante.
    (26.62, 28.30, GAP),  # Mientras tanto, enfrente:
    (35.50, 36.90, GAP),  # ¿Hay mesa mañana?
    (37.20, 38.48, GAP),  # Y nadie contesta.
    (40.70, 46.55, GAP),  # Ese sistema es un agente de IA y en AIgencyx Labs te lo adaptamos a tu medida.
    (58.74, 62.20, 0.0),  # Comenta auditoria y te muestro cómo quedaría el tuyo
]

# Palabras clave (tiempo original de inicio) para sincronizar escenas
KEYS = {
    "misma1": 0.12, "misma2": 1.44, "pero": 4.18, "lleno": 5.06, "responde": 5.70, "cualquier": 7.16,
    "reserva": 10.14, "telefono": 11.92, "evita": 14.84, "plantones": 15.30, "si": 16.20, "cancela": 16.62, "nadie": 37.26,
    "avisa": 17.48, "pide": 22.10, "resenas": 22.30, "mientras": 26.66, "enfrente": 27.64, "alas": 33.70,
    "hay": 35.60, "mesa": 35.98, "yesa": 38.78, "seva": 39.28, "ese": 40.76, "agente": 41.48, "ia": 42.50,
    "y_en": 43.34, "aigencyx": 43.72, "te_lo": 45.20, "medida": 46.02, "reservas": 52.56, "pedidos": 53.24,
    "proveedores": 53.76, "turnos": 54.54, "facturas": 55.08, "lo_que": 56.16, "lo_hace": 57.50,
    "solo": 57.98, "comenta": 58.80, "auditoria": 59.20, "auditoria_end": 60.04, "y_te": 60.12, "tuyo_end": 61.88,
}

raw = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC, "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768

parts = []
mapping = []  # (orig_start, orig_end, new_start_pre_tempo)
pos = 0.0
fade = int(0.012 * SR)
for a, b, gap in CLIPS:
    seg = x[int(a * SR):int(b * SR)].copy()
    seg[:fade] *= np.linspace(0, 1, fade)
    seg[-fade:] *= np.linspace(1, 0, fade)
    mapping.append((a, b, pos))
    parts += [seg, np.zeros(int(gap * SR), dtype=np.float32)]
    pos += len(seg) / SR + gap
y = np.concatenate(parts)

tmp = OUT + ".tmp.wav"
with wave.open(tmp, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", f"atempo={TEMPO}", "-ar", str(SR),
                "-b:a", "192k", OUT], check=True)
subprocess.run(["rm", tmp])


def new_time(t):
    for a, b, p in mapping:
        if a - 0.05 <= t <= b + 0.05:
            return (p + max(0.0, t - a)) / TEMPO
    raise ValueError(f"{t} no está en ningún clip")


print(f"duración: {pos / TEMPO:.3f}")
for k, v in KEYS.items():
    try:
        print(f"{k}: {new_time(v):.2f}")
    except ValueError:
        pass
