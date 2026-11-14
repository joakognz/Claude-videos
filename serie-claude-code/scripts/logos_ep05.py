"""Logos del EP.5: recorte y fondo transparente a partir de los adjuntos (fuentes/logos-ep05/).

No se redibuja nada. Solo se quita el fondo blanco liso conectado al borde (los blancos interiores del logo se quedan),
se recorta al contenido y, cuando un adjunto trae dos versiones en la misma imagen, se separan.
  - Gemini: el logotipo en degradado con la estrella (mitad inferior del adjunto).
  - Codex: solo el icono de la nube con «>_» (mitad superior).
  - Netlify y Cloudflare Pages vienen en la misma imagen: se separan.
  - Next.js: el símbolo circular (mitad superior).
  - Astro: el banner trae debajo el lema «I Build Fast Static Sites», que no es parte del logo: se tapa con el
    mismo azul del banner y se recorta al símbolo y la palabra.
  - Tailwind: el adjunto es una ficha 3D blanca; se recorta la ficha con sus esquinas redondeadas.
  - Git y Node.js (webp) ya son transparentes: solo se recortan y se reducen.

Uso: python scripts/logos_ep05.py  →  public/logos/*.png
"""
import os
from collections import deque

import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "fuentes", "logos-ep05")
OUT = os.path.join(ROOT, "public", "logos")
MAX = 900  # lado mayor de salida


def cargar(nombre):
    return np.array(Image.open(os.path.join(SRC, nombre)).convert("RGBA")).astype(np.float64)


def quitar_blanco(a, umbral=246):
    """Fondo = blanco casi puro conectado al borde. Borde antialias: se «desmultiplica» el blanco."""
    rgb = a[:, :, :3]
    h, w = rgb.shape[:2]
    claro = rgb.min(axis=2) >= umbral
    fondo = np.zeros((h, w), bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if claro[y, x] and not fondo[y, x]:
                fondo[y, x] = True
                q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if claro[y, x] and not fondo[y, x]:
                fondo[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            yy, xx = y + dy, x + dx
            if 0 <= yy < h and 0 <= xx < w and claro[yy, xx] and not fondo[yy, xx]:
                fondo[yy, xx] = True
                q.append((yy, xx))
    # banda de 2 px alrededor del fondo: alfa por distancia al blanco (antialias limpio)
    from scipy.ndimage import binary_dilation

    banda = binary_dilation(fondo, iterations=2) & ~fondo
    alfa = np.ones((h, w))
    alfa[fondo] = 0
    d = (255 - rgb[banda]).max(axis=1) / 255
    alfa[banda] = np.clip(d * 1.15, 0, 1)
    out = a.copy()
    sel = banda & (alfa > 0)
    al = alfa[sel][:, None]
    out[:, :, :3][sel] = np.clip((rgb[sel] - (1 - al) * 255) / np.maximum(al, 1e-3), 0, 255)
    out[:, :, 3] = alfa * 255 * (a[:, :, 3] / 255)
    return out


def recortar(a, margen=6):
    al = a[:, :, 3] > 8
    ys, xs = np.nonzero(al)
    y0, y1 = max(0, ys.min() - margen), min(a.shape[0], ys.max() + margen + 1)
    x0, x1 = max(0, xs.min() - margen), min(a.shape[1], xs.max() + margen + 1)
    return a[y0:y1, x0:x1]


def guardar(a, nombre):
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGBA")
    if max(im.size) > MAX:
        k = MAX / max(im.size)
        im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    im.save(os.path.join(OUT, nombre), optimize=True)
    print(f"{nombre}: {im.width}x{im.height}")


def zona(a, x0=0, y0=0, x1=None, y1=None):
    return a[y0:y1, x0:x1].copy()


def main():
    os.makedirs(OUT, exist_ok=True)
    guardar(recortar(quitar_blanco(cargar("npm.png"))), "npm.png")
    guardar(recortar(quitar_blanco(zona(cargar("gemini.png"), y0=780))), "gemini.png")
    guardar(recortar(quitar_blanco(zona(cargar("codex.png"), y1=640))), "codex.png")
    guardar(recortar(quitar_blanco(cargar("n8n.png"))), "n8n.png")
    guardar(recortar(quitar_blanco(cargar("php.png"))), "php.png")
    nc = cargar("netlify-cloudflare.png")
    guardar(recortar(quitar_blanco(zona(nc, y1=700))), "netlify.png")
    guardar(recortar(quitar_blanco(zona(nc, y0=840))), "cloudflare-pages.png")
    guardar(recortar(quitar_blanco(cargar("vercel.png"))), "vercel.png")
    guardar(recortar(quitar_blanco(cargar("vite.png"))), "vite.png")
    guardar(recortar(quitar_blanco(zona(cargar("nextjs.png"), y1=700))), "nextjs.png")

    # Astro: se tapa el lema con el azul del banner y se recorta al símbolo + palabra
    a = cargar("astro.png")
    azul = a[400, 100].copy()
    a[760:900, 470:1200] = azul
    a = a[470:860, 205:1195]
    im = Image.fromarray(a.astype(np.uint8), "RGBA")
    m = Image.new("L", im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, im.width - 1, im.height - 1], radius=48, fill=255)
    im.putalpha(m)
    guardar(np.array(im).astype(np.float64), "astro.png")

    # Tailwind: ficha con esquinas redondeadas (la ficha ocupa 172..1227)
    a = cargar("tailwind.png")[172:1228, 172:1228]
    im = Image.fromarray(a.astype(np.uint8), "RGBA")
    m = Image.new("L", im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([2, 2, im.width - 3, im.height - 3], radius=235, fill=255)
    im.putalpha(m)
    guardar(np.array(im).astype(np.float64), "tailwind.png")

    guardar(recortar(cargar("git.webp")), "git.png")
    guardar(recortar(cargar("nodejs.webp")), "nodejs.png")


if __name__ == "__main__":
    main()
