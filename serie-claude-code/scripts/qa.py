"""Comprobaciones de un episodio renderizado contra las reglas de la serie.

Uso: python scripts/qa.py out/claude-code-ep-01.mp4 [episodios/ep-01.json]
Lee también out/claude-code-ep-NN.plan.json (lo deja scripts/render-lote.mjs) y escribe hojas de contactos en out/qa/.
"""
import json, os, re, subprocess, sys
import numpy as np
import pyloudnorm as pyln

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
mp4 = sys.argv[1]
n = int(re.search(r"ep-(\d+)", mp4).group(1))
ep_path = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, "episodios", f"ep-{n:02d}.json")
ep = json.load(open(ep_path))
plan = json.load(open(mp4.replace(".mp4", ".plan.json")))
ok_all = True


def check(nombre, ok, detalle=""):
    global ok_all
    ok_all &= bool(ok)
    print(f"{'✓' if ok else '✗'} {nombre}{' · ' + detalle if detalle else ''}")


probe = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", mp4], capture_output=True, check=True).stdout)
v = next(s for s in probe["streams"] if s["codec_type"] == "video")
a = next((s for s in probe["streams"] if s["codec_type"] == "audio"), None)
dur = float(probe["format"]["duration"])
fps = eval(v["r_frame_rate"])
check("Formato 1080x1920 a 30 fps, H.264 + AAC", v["width"] == 1080 and v["height"] == 1920 and abs(fps - 30) < 1e-3 and v["codec_name"] == "h264" and a and a["codec_name"] == "aac",
      f"{v['width']}x{v['height']} {fps:.2f} fps {v['codec_name']}/{a['codec_name'] if a else '-'}")

voz = os.path.join(ROOT, "public", ep["voz"]["audio"])
dvoz = float(json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_format", "-of", "json", voz], capture_output=True).stdout)["format"]["duration"])
check("Regla 1/salida: duración = duración del audio", abs(int(v.get("nb_frames", round(dur * 30))) / 30 - dvoz) <= 1 / 30 + 1e-6,
      f"vídeo {int(v.get('nb_frames', 0)) / 30:.3f} s · voz {dvoz:.3f} s")

# planos (regla 3): cambios = inicio de cada plano + inicio de cada entrada por portal
cambios = sorted({round(p["inicio"], 3) for L in plan["lienzos"] for p in L["planos"]} | {round(L["entrada"], 3) for L in plan["lienzos"]} | {plan["duracion"]})
gaps = np.diff(cambios)
check("Regla 3: un cambio de plano como mucho cada 3 s", gaps.max() <= 3.0 + 1e-6, f"{len(cambios) - 1} planos · media {gaps.mean():.2f} s · máx {gaps.max():.2f} s")

e0, eN = plan["escenas"][0], plan["escenas"][-1]
check("Regla 10: los 3 primeros segundos anuncian serie y episodio", e0["fin"] >= 3.0 and plan["lienzos"][0]["imagen"]["tipo"] == "serie", f"intro 0–{e0['fin']:.2f} s")
check("Regla 10: los 6 últimos segundos son el llamado a la acción", plan["duracion"] - eN["inicio"] >= 6.0 - 1e-6, f"CTA {eN['inicio']:.2f}–{plan['duracion']:.2f} s ({plan['duracion'] - eN['inicio']:.2f} s)")

pasos = [e["paso"] for e in plan["escenas"] if e.get("paso")]
ev = plan["eventos"]
golpes = [x["t"] for x in ev if x["sfx"] == "golpe"]
ticks = [x["t"] for x in ev if x["sfx"] == "tick"]
check("Regla 6: cada PASO con golpe y tick", all(any(abs(g - (p["t"] + 0.16)) < 0.01 for g in golpes) and any(abs(k - p["completo"]) < 0.01 for k in ticks) for p in pasos),
      ", ".join(f"PASO {p['n']} {p['t']:.2f}→✓{p['completo']:.2f}" for p in pasos))

mus = np.array(plan["musica"])
if len(mus):
    # voz activa por fotograma (la misma regla que el plan) y nivel de la música en cada caso
    m = ep.get("musica", {})
    base, duck = m.get("db", -20), m.get("db", -20) + m.get("duckingDb", -8)
    act = np.zeros(len(mus), bool)
    P = plan["palabras"]
    for k, w in enumerate(P):
        fin = P[k + 1]["inicio"] if k + 1 < len(P) and P[k + 1]["inicio"] - w["fin"] < 0.35 else w["fin"] + 0.12
        act[max(0, int((w["inicio"] - 0.08) * 30)): int(np.ceil(fin * 30))] = True
    db = 20 * np.log10(np.maximum(mus, 1e-6))
    t = np.arange(len(mus)) / 30
    lejos = (t > 0.6) & (t < plan["duracion"] - 1.2)
    con = db[act & lejos]
    sin = db[~act & lejos]
    asentado = np.convolve(act.astype(float), np.ones(30) / 30, "same")  # ≥ 1 s seguido en el mismo estado
    sin_ok = db[(asentado == 0) & lejos]
    detalle = f"tope {db.max():.1f} dB · bajo la voz {np.median(con):.1f} dB ({act.mean() * 100:.0f} % del vídeo con voz)"
    detalle += f" · sin voz {np.max(sin_ok):.1f} dB" if len(sin_ok) else " · no hay ningún tramo de ≥1 s sin voz"
    check("Regla 9: música a -20 dB con ducking bajo la voz", db.max() <= base + 0.05 and abs(np.median(con) - duck) < 0.7 and (not len(sin_ok) or abs(np.max(sin_ok) - base) < 0.7), detalle)

check("Regla 11/7: sin avisos del plan (anclas, cifras sin fuente)", not plan["avisos"], "; ".join(plan["avisos"]))

# sonoridad del mp4
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", mp4, "-ac", "2", "-ar", "48000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(pcm, np.float32).reshape(-1, 2).astype(np.float64)
lufs = pyln.Meter(48000).integrated_loudness(x)
r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", mp4, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
tp = float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", r)[-1])
check("Mezcla a -14 LUFS (±1), pico real ≤ -1 dBTP", abs(lufs + 14) <= 1.0 and tp <= -1.0, f"{lufs:.1f} LUFS · {tp:.1f} dBTP")

# hojas de contactos (1 fotograma por segundo)
qa = os.path.join(os.path.dirname(mp4), "qa")
os.makedirs(qa, exist_ok=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp4, "-vf", "fps=1,scale=270:480,tile=8x2", os.path.join(qa, f"ep-{n:02d}-hoja-%02d.png")], check=True)
print(f"hojas de contactos en {os.path.relpath(qa, ROOT)}/")
print("TODO OK" if ok_all else "HAY FALLOS")
sys.exit(0 if ok_all else 1)
