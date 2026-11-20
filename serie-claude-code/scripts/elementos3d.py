"""Saca los elementos 3D del vídeo de muestra del usuario (fondo oscuro de la serie con su trama de puntos) y los guarda
con fondo transparente en public/elementos3d/<nombre>.webm (VP9 con canal alfa), a media resolución.

  python scripts/elementos3d.py <muestra.mp4> [--prueba]

Cómo separa cada píxel del fondo
  - El fondo (color y puntos) sale de los fotogramas en los que aún no hay ningún elemento en pantalla.
  - Lo más claro que el fondo es el elemento: opaco en su interior (se rellenan los huecos) y con borde suave, al que se
    le quita el color del fondo para que no quede halo.
  - Lo más oscuro que el fondo es la sombra: negro con la transparencia justa para oscurecer igual sobre cualquier fondo.
    Se desvanece hacia los bordes del recorte, para que no se vea ningún corte recto.
No se redibuja nada: los píxeles del elemento son los del vídeo del usuario.
"""
import argparse, os, subprocess, sys
import numpy as np
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
H, W = 1920, 1080
# fotogramas de cada elemento en la muestra y recorte (x0, y0, x1, y1) en píxeles del vídeo
ELEMENTOS = {
    "ventana": {"f": (1, 135), "caja": (110, 520, 1080, 1480)},
    "raton": {"f": (136, 270), "caja": (150, 480, 1080, 1480)},
    "cursor": {"f": (271, 390), "caja": (60, 450, 900, 1400)},
    "cuadricula": {"f": (391, 525), "caja": (0, 700, 1080, 1440)},
}
VACIOS = [0, 135, 390]  # fotogramas sin elemento: de ellos sale el fondo


def leer(video):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)


def separar(p, B, borde):
    """p, B: (h, w, 3) float. Devuelve RGBA float (0-255)."""
    claro = (p - B).max(axis=2)
    oscuro = (B - p).mean(axis=2)
    # elemento: núcleo opaco con los huecos rellenos y borde suave
    base = ndimage.binary_opening(claro > 24, iterations=1)
    # huecos: se rellenan los pequeños (letras) y los que no son fondo (casillas oscuras), no el interior de un anillo
    huecos = ndimage.binary_fill_holes(base) & ~base
    lab, n = ndimage.label(huecos)
    if n:
        idx = np.arange(1, n + 1)
        area = ndimage.sum(huecos, lab, idx)
        medio = ndimage.mean(claro, lab, idx)
        ok = np.concatenate([[False], (area < 2500) | (medio > 8)])
        nucleo = base | ok[lab]
    else:
        nucleo = base
    a_el = np.clip((claro - 5) / 20, 0, 1)
    a_el = np.maximum(a_el, nucleo.astype(float))
    F = B + (p - B) / np.maximum(a_el, 1e-3)[..., None]
    F = np.clip(F, 0, 255)
    # sombra: negro con alfa (oscurece lo de detrás igual que al fondo original)
    lum = np.maximum(B.mean(axis=2), 1.0)
    a_so = ndimage.gaussian_filter(np.clip((oscuro - 1.5) / lum, 0, 1), 5) * borde * 0.9
    a = a_el + (1 - a_el) * a_so
    rgb = F * (a_el / np.maximum(a, 1e-3))[..., None]
    return np.dstack([rgb, a * 255])


def ventana_borde(h, w, m=90):
    """1 en el centro, 0 en el borde del recorte (suave)."""
    def eje(n):
        u = np.minimum(np.arange(n), np.arange(n)[::-1]) / m
        u = np.clip(u, 0, 1)
        return u * u * (3 - 2 * u)
    return np.outer(eje(h), eje(w))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("muestra")
    ap.add_argument("--prueba", action="store_true", help="solo un fotograma de cada uno, en PNG")
    args = ap.parse_args()
    v = leer(args.muestra)
    B = np.median(np.stack([v[i].astype(float) for i in VACIOS]), axis=0)
    out = os.path.join(ROOT, "public", "elementos3d")
    os.makedirs(out, exist_ok=True)
    from PIL import Image
    for nombre, e in ELEMENTOS.items():
        x0, y0, x1, y1 = e["caja"]
        Bc = B[y0:y1, x0:x1]
        borde = ventana_borde(y1 - y0, x1 - x0)
        f0, f1 = e["f"]
        if args.prueba:
            k = f0 + int((f1 - f0) * 0.8)
            rgba = separar(v[k, y0:y1, x0:x1].astype(float), Bc, borde)
            Image.fromarray(rgba.astype(np.uint8), "RGBA").save(os.path.join(out, f"_prueba_{nombre}.png"))
            continue
        w2, h2 = (x1 - x0) // 2 // 2 * 2, (y1 - y0) // 2 // 2 * 2
        enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{x1 - x0}x{y1 - y0}", "-r", "30", "-i", "-",
                                "-vf", f"scale={w2}:{h2}:flags=lanczos", "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "30",
                                "-auto-alt-ref", "0", os.path.join(out, f"{nombre}.webm")], stdin=subprocess.PIPE)
        for k in range(f0, f1):
            rgba = separar(v[k, y0:y1, x0:x1].astype(float), Bc, borde)
            enc.stdin.write(np.clip(rgba, 0, 255).astype(np.uint8).tobytes())
        enc.stdin.close()
        enc.wait()
        print(f"{nombre}: {f1 - f0} fotogramas, {w2}x{h2}")


if __name__ == "__main__":
    sys.exit(main())
