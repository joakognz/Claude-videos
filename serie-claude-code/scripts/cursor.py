"""Saca las posiciones del cursor de un clip de pantalla para el zoom de ClipPantalla (regla 8).

Mira solo dentro del recorte (la cámara del ponente queda fuera) y sigue dónde cambia la imagen entre fotogramas: el
puntero que se mueve, el texto que se escribe, el menú que se abre. Ignora los cambios de pantalla completa (scroll,
cambio de ventana) y suaviza el resultado en fotogramas clave cada 0,5 s.

Uso
  python scripts/cursor.py public/episodios/ep-03/clips/instalar.mp4 --recorte 0,0,1440,1080 [--desde 12 --hasta 20]
  python scripts/cursor.py … --episodio episodios/ep-03.json --escena instalar   # lo escribe en el JSON
"""
import argparse, json, subprocess
import numpy as np


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("clip")
    ap.add_argument("--recorte", required=True, help="x,y,w,h en píxeles del original")
    ap.add_argument("--desde", type=float, default=0.0)
    ap.add_argument("--hasta", type=float)
    ap.add_argument("--fps", type=float, default=10)
    ap.add_argument("--episodio")
    ap.add_argument("--escena")
    a = ap.parse_args()

    meta = json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "json", a.clip],
                                     capture_output=True, check=True).stdout)["streams"][0]
    W, H = meta["width"], meta["height"]
    rx, ry, rw, rh = [int(v) for v in a.recorte.split(",")]
    k = 4  # análisis a 1/4 de resolución
    w, h = W // k, H // k
    cmd = ["ffmpeg", "-v", "error", "-ss", str(a.desde)] + (["-to", str(a.hasta)] if a.hasta else []) + \
          ["-i", a.clip, "-vf", f"fps={a.fps},scale={w}:{h}", "-f", "rawvideo", "-pix_fmt", "gray", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    frames = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.int16)
    x0, y0, x1, y1 = rx // k, ry // k, (rx + rw) // k, (ry + rh) // k
    pts = []
    for i in range(1, len(frames)):
        d = np.abs(frames[i, y0:y1, x0:x1] - frames[i - 1, y0:y1, x0:x1]) > 18
        frac = d.mean()
        if frac == 0 or frac > 0.25:  # nada se mueve, o cambia toda la pantalla
            continue
        ys, xs = np.nonzero(d)
        # el grupo más denso (no la media de todo): mediana robusta
        cx, cy = np.median(xs), np.median(ys)
        near = (np.abs(xs - cx) < 40) & (np.abs(ys - cy) < 40)
        if near.sum() >= 3:
            cx, cy = xs[near].mean(), ys[near].mean()
        pts.append((i / a.fps, (cx + x0) * k, (cy + y0) * k))
    if not pts:
        raise SystemExit("No se detecta movimiento dentro del recorte")
    pts = np.array(pts)
    dur = len(frames) / a.fps
    claves = []
    for t in np.arange(0, dur + 1e-6, 0.5):
        m = np.abs(pts[:, 0] - t) <= 0.5
        if m.any():
            claves.append({"t": round(float(t), 2), "x": round(float(np.median(pts[m, 1]))), "y": round(float(np.median(pts[m, 2])))})
        elif claves:
            claves.append({**claves[-1], "t": round(float(t), 2)})
    out = {"ancho": W, "alto": H, "recorte": {"x": rx, "y": ry, "w": rw, "h": rh}, "desde": a.desde, "cursor": claves}
    if a.episodio and a.escena:
        ep = json.load(open(a.episodio))
        esc = next(e for e in ep["escenas"] if e["id"] == a.escena)
        esc["imagen"].update(out)
        json.dump(ep, open(a.episodio, "w"), ensure_ascii=False, indent=2)
        print(f"{len(claves)} posiciones escritas en {a.episodio} → {a.escena}")
    else:
        print(json.dumps(out, ensure_ascii=False))


if __name__ == "__main__":
    main()
