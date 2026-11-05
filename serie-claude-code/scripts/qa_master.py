"""Checklist del reel (plantilla Master): duración = audio, sincronía voz-subtítulos, máx. 2 líneas,
cambio visible cada 2–3 s y sonoridad.

Uso: python scripts/qa_master.py episodios/ep-02.json out/claude-code-ep-02.mp4
"""
import json, os, re, subprocess, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ep = json.load(open(sys.argv[1]))
mp4 = sys.argv[2]
pal = json.load(open(os.path.join(ROOT, "public", ep["voz"]["timestamps"])))["palabras"]
ok = True


def linea(txt, bien):
    global ok
    ok &= bien
    print(("  ✓ " if bien else "  ✗ ") + txt)


# duración
probe = lambda args: subprocess.run(["ffprobe", "-v", "error", *args, mp4], capture_output=True, text=True).stdout.strip()
dur_v = float(probe(["-show_entries", "format=duration", "-of", "csv=p=0"]))
wh = probe(["-select_streams", "v", "-show_entries", "stream=width,height,r_frame_rate", "-of", "csv=p=0"])
voz = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", os.path.join(ROOT, "public", ep["voz"]["audio"])], capture_output=True, text=True).stdout
print("Formato y duración")
linea(f"{wh} · {dur_v:.2f} s (voz {float(voz):.2f} s)", wh.startswith("1080,1920,30/1") and abs(dur_v - float(voz)) < 0.1)

# subtítulos: misma lógica que src/master/componentes/Subtitulos.tsx
SIZE, ANCHO = 66, 960
ancho = lambda w: len(w) * SIZE * 0.56 + 30
bloques, cur, a = [], [[]], 0.0
for i, p in enumerate(pal):
    w = ancho(p["texto"])
    if a + w > ANCHO:
        if len(cur) == 2:
            ult = cur[1][-1] if cur[1] else None
            colg = cur[1].pop() if ult and len(cur[1]) > 1 and len(re.sub(r"[^\wñáéíóúü]", "", ult["texto"].lower())) <= 3 and not re.search(r"[.,;:?!]$", ult["texto"]) else None
            bloques.append(cur); cur, a = [[]], 0.0
            if colg:
                cur[0].append(colg); a = ancho(colg["texto"])
        else:
            cur.append([]); a = 0.0
    cur[-1].append(p); a += w
    sig = pal[i + 1] if i + 1 < len(pal) else None
    n = sum(len(l) for l in cur)
    pausa = sig["inicio"] - p["fin"] > 0.28 if sig else True
    if (sig and sig["escena"] != p["escena"]) or re.search(r"[.?!:]$", p["texto"]) or (re.search(r"[,;]$", p["texto"]) and n >= 4 and pausa):
        bloques.append(cur); cur, a = [[]], 0.0
if cur[0]:
    bloques.append(cur)
print("Subtítulos")
linea(f"{len(bloques)} bloques, máximo {max(len([l for l in b if l]) for b in bloques)} líneas", all(len([l for l in b if l]) <= 2 for b in bloques))
anchos = [sum(ancho(p['texto']) for p in l) for b in bloques for l in b if l]
linea(f"línea más ancha ≈ {max(anchos):.0f} px de {ANCHO}", max(anchos) <= ANCHO)
fuera, prev_fin = 0, -1e9
for k, b in enumerate(bloques):
    todas = [p for l in b for p in l]
    ini = max(todas[0]["inicio"] - 0.12, prev_fin)
    sig = bloques[k + 1][0][0]["inicio"] - 0.12 if k + 1 < len(bloques) else 1e9
    fin = max(todas[-1]["inicio"] + 0.1, min(sig, todas[-1]["fin"] + 0.7))
    prev_fin = fin
    fuera += sum(1 for p in todas if not (ini <= p["inicio"] < fin))
linea(f"{len(pal)} palabras: cada una se resalta en su instante de la voz ({fuera} fuera de su bloque)", fuera == 0)

# cambio visible cada 2–3 s: diferencia entre fotogramas (a 6 fps, 135x240, gris)
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", mp4, "-vf", "fps=6,scale=135:240,format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, 240, 135).astype(np.float32)
d = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))
cambios = np.nonzero(d > 0.6)[0] / 6.0
huecos = np.diff(np.concatenate([[0], cambios, [dur_v]]))
print("Ritmo visual")
linea(f"hueco más largo sin cambio visible: {huecos.max():.2f} s (umbral 3 s)", huecos.max() <= 3.0)

# sonoridad
r = subprocess.run(["ffmpeg", "-v", "info", "-i", mp4, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
I = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1])
tp = float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", r)[-1])
print("Audio")
linea(f"{I:.1f} LUFS integrados · pico real {tp:.1f} dBTP", -15 <= I <= -13 and tp <= -1.0)
print("\nTODO EN VERDE" if ok else "\nHAY PUNTOS EN ROJO")
