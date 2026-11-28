"""Lista de cues de un episodio con sonidos de la librería: comprueba las reglas y la guarda en JSON y en texto.

Uso: python scripts/cues.py out/claude-code-ep-13-v2.plan.json ../briefs/serie-claude-code-ep-13/v2/cues.json
Reglas: el pico cae en el evento; nunca el mismo archivo que uno de los dos anteriores; nunca dos woosh seguidos;
ningún inicio negativo.
"""
import json, os, sys
plan = json.load(open(sys.argv[1]))
lib = json.load(open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "sfx", "_libreria.json")))
ev = [e for e in plan["eventos"] if e.get("src")]
fallos = []
for i, e in enumerate(ev):
    if e["src"] in [x["src"] for x in ev[max(0, i - 2):i]]:
        fallos.append(f"{e['t']:.2f}s repite {e['src']}")
    if i and e.get("grupo") in ("woosh", "zoom") and ev[i - 1].get("grupo") in ("woosh", "zoom"):
        fallos.append(f"{e['t']:.2f}s dos woosh seguidos")
    ini = e["t"] if e.get("desde") is not None else e["t"] - e["pico"]
    if ini < 0:
        fallos.append(f"{e['t']:.2f}s empieza antes de 0")
out = [{"momento": f"{int(e['t'] // 60)}:{e['t'] % 60:05.2f}", "segundo": round(e["t"], 2), "fotograma": round(e["t"] * 30),
        "que": e.get("que"), "grupo": e.get("grupo"), "nivel": e.get("nivel"),
        "archivo": lib["archivos"][e["src"]]["origen"], "pico_s": e["pico"], "volumen": round(e["vol"], 3)} for e in ev]
os.makedirs(os.path.dirname(os.path.abspath(sys.argv[2])), exist_ok=True)
json.dump({"reglas_ok": not fallos, "fallos": fallos, "cues": out}, open(sys.argv[2], "w"), ensure_ascii=False, indent=1)
for c in out:
    print(f"{c['momento']}  {c['archivo']:62s} {c['que']}")
print(f"\n{len(out)} sonidos · " + ("reglas OK" if not fallos else "FALLOS: " + "; ".join(fallos)))
