"""Recorta la locución original a las frases clave (completas y a velocidad natural). Imprime los tiempos nuevos de las palabras clave.

Uso: python3 scripts/cut_voice.py <restaurante|peluqueria> entrada.mp3 salida.mp3
"""
import subprocess
import sys
import wave

import numpy as np

PRESET, SRC, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
SR = 44100
GAP = 0.28  # silencio entre frases

PRESETS = {}

# --- Restaurantes (locución de Martin Osborne, alineada con la transcripción de ElevenLabs) ---
RESTAURANTE_CLIPS = [
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
RESTAURANTE_KEYS = {
    "misma1": 0.12, "misma2": 1.44, "pero": 4.18, "lleno": 5.06, "responde": 5.70, "cualquier": 7.16,
    "reserva": 10.14, "telefono": 11.92, "evita": 14.84, "plantones": 15.30, "si": 16.20, "cancela": 16.62, "nadie": 37.26,
    "avisa": 17.48, "pide": 22.10, "resenas": 22.30, "mientras": 26.66, "enfrente": 27.64, "alas": 33.70,
    "hay": 35.60, "mesa": 35.98, "yesa": 38.78, "seva": 39.28, "ese": 40.76, "agente": 41.48, "ia": 42.50,
    "y_en": 43.34, "aigencyx": 43.72, "te_lo": 45.20, "medida": 46.02, "reservas": 52.56, "pedidos": 53.24,
    "proveedores": 53.76, "turnos": 54.54, "facturas": 55.08, "lo_que": 56.16, "lo_hace": 57.50,
    "solo": 57.98, "comenta": 58.80, "auditoria": 59.20, "auditoria_end": 60.04, "y_te": 60.12, "tuyo_end": 61.88,
}
PRESETS["restaurante"] = dict(clips=RESTAURANTE_CLIPS, keys=RESTAURANTE_KEYS, tempo=1.0, gain_db=0.0)

# --- Peluquerías (locución de Guillermo). Tiempos por pausas detectadas + recuento de sílabas. ---
G = 0.2
PRESETS["peluqueria"] = dict(
    tempo=1.0,
    gain_db=5.0,  # la toma viene baja (-24 dB de media)
    clips=[
        (0.00, 1.46, G),    # Manos llenas de tinte.
        (1.91, 2.93, G),    # Y el móvil vibrando.
        (3.50, 5.24, G),    # Es una clienta que quiere cambiar la hora.
        (6.39, 8.22, G),    # Si tardas, reserva en otro sitio.
        (15.08, 16.54, G),  # Un agente de IA… sí.
        (17.21, 21.39, G),  # Lee la reserva al momento, la mete en tu agenda y confirma a la clienta por WhatsApp.
        (22.17, 23.62, G),  # Si quiere otra hora, la cambia él.
        (25.72, 26.69, G),  # Y tú, peinando.
        (27.01, 30.80, G),  # Lo montamos en AIgencyx Labs con las herramientas que ya usas.
        (30.98, 35.29, G),  # Comenta AUDITORIA y te respondemos con los pasos para ver qué automatizar en tu negocio.
        (35.48, 38.35, 0.0),  # El móvil sigue vibrando. Esta vez ya está contestado.
    ],
    keys={
        "manos": 0.03, "movil": 1.95, "clienta": 3.54, "hora": 4.85, "tardas": 6.43, "otrositio": 7.66,
        "agente": 15.12, "ia": 15.76, "si": 16.26, "lee": 17.25, "momento": 17.7, "agenda": 18.69,
        "confirma": 19.83, "whatsapp": 20.8, "otrahora": 22.21, "cambia": 23.03, "peinando": 25.76,
        "montamos": 27.05, "aigencyx": 27.78, "herramientas": 29.49, "comenta": 31.02, "auditoria": 31.44,
        "auditoriaEnd": 32.08, "sigue": 35.52, "estavez": 36.83, "voiceEnd": 38.28,
    },
)

cfg = PRESETS[PRESET]
CLIPS, KEYS, TEMPO = cfg["clips"], cfg["keys"], cfg["tempo"]

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
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", f"atempo={TEMPO},volume={cfg['gain_db']}dB", "-ar", str(SR),
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
