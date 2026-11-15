"""Tiempos PROVISIONALES para desarrollar las escenas mientras no llega la voz: reparte las palabras del guion
a ~160 palabras/min con pausas en la puntuación y deja un wav en silencio de esa duración. Se sustituye por
scripts/preparar.py en cuanto está la toma real."""
import json, re, subprocess, sys, unicodedata
ep = json.load(open(sys.argv[1])); out = sys.argv[2]
t, pal = 0.25, []
for esc in ep["escenas"]:
    for w in esc["voz"].split():
        n = len(re.sub(r"[^a-zñ0-9]", "", unicodedata.normalize("NFD", w.lower())))
        d = 0.085 + 0.052 * n
        pal.append({"texto": w, "inicio": round(t, 3), "fin": round(t + d, 3), "escena": esc["id"]})
        t += d + (0.42 if re.search(r"[.?!:]$", w) else 0.2 if w.endswith(",") else 0.0)
    t += 0.22
dur = round(t + 0.9, 3)
json.dump({"fuente": "provisional", "duracion": dur, "palabras": pal}, open(f"{out}/palabras.json", "w"), ensure_ascii=False, indent=1)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", str(dur), "-c:a", "pcm_s24le", f"{out}/voz.wav"], check=True)
print(len(pal), "palabras", dur, "s")
for e in ep["escenas"]:
    ws = [p for p in pal if p["escena"] == e["id"]]
    print(f"  {ws[0]['inicio']:6.2f}-{ws[-1]['fin']:6.2f} {e['id']}")
