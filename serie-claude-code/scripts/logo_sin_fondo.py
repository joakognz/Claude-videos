"""Quita el fondo liso de un logo (o icono) que llega con fondo blanco o de color, y lo recorta. No redibuja nada.

  python scripts/logo_sin_fondo.py entrada.png salida.png [--modo borde|global|circulo|ninguno] [--recorte x0,y0,x1,y1]

Modos
  borde    (por defecto) quita solo el fondo conectado con el borde de la imagen. Respeta los blancos que forman
           parte del logo y están encerrados (letras de npm, teléfono de WhatsApp, N de Next.js).
  global   quita todos los píxeles del color de fondo, también los encerrados (huecos de letras de un rótulo).
           Úsalo solo si el logo no tiene partes de ese color.
  circulo  logo redondo con huecos que tocan el borde (octocat): deja el círculo y quita lo de fuera.
  oscuro   logo de un solo color oscuro sobre fondo claro o con cuadros incrustados (rótulo de GitHub, Next.js):
           la transparencia sale de lo oscuro que es cada píxel.
  ninguno  solo recorta.
El color de fondo se toma de la esquina superior izquierda (de la zona recortada). Los bordes suavizados se
«desmezclan» de ese color para que no quede halo al ponerlo sobre el fondo oscuro de la serie.
"""
import argparse
import numpy as np
from PIL import Image
from scipy import ndimage

TOL, TOL2 = 14.0, 70.0  # distancia al fondo: < TOL es fondo; entre TOL y TOL2, borde suavizado


def quitar(im, modo, TOL=TOL, TOL2=TOL2):
    a = np.asarray(im.convert("RGBA")).astype(np.float64)
    rgb, alfa = a[..., :3], a[..., 3] / 255.0
    fondo = rgb[2, 2].copy()
    d = np.abs(rgb - fondo).max(axis=2)
    if modo == "ninguno":
        return im.convert("RGBA")
    if modo == "oscuro":
        lum = rgb @ np.array([0.299, 0.587, 0.114])
        a_new = np.clip((215 - lum) / (215 - 40), 0, 1)
        base = rgb.min(axis=2, keepdims=True).clip(0, 60)
        out = np.dstack([np.repeat(base, 3, axis=2), alfa * a_new * 255]).clip(0, 255).astype(np.uint8)
        return Image.fromarray(out, "RGBA")
    if modo == "circulo":
        ys, xs = np.nonzero(d > TOL)
        r = (xs.max() - xs.min()) / 2
        cx, cy = (xs.min() + xs.max()) / 2, ys.min() + r
        yy, xx = np.mgrid[: d.shape[0], : d.shape[1]]
        dist = np.hypot(xx - cx, yy - cy)
        a_new = np.clip(r + 1.5 - dist, 0, 1)
        out = np.dstack([rgb, alfa * a_new * 255]).clip(0, 255).astype(np.uint8)
        return Image.fromarray(out, "RGBA")
    if modo == "global":
        zona = np.ones_like(d, bool)
        fondo_mask = d < TOL
    else:  # borde: componentes «casi fondo» que tocan el borde de la imagen
        casi = d < TOL2
        lab, _ = ndimage.label(casi)
        borde = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
        conectado = np.isin(lab, borde[borde > 0])
        fondo_mask = conectado & (d < TOL)
        zona = conectado
    # alfa: 0 en el fondo, rampa en el borde suavizado, 1 en el logo
    k = np.clip((d - TOL) / (TOL2 - TOL), 0, 1)
    a_new = np.where(zona, k, 1.0)
    a_new[fondo_mask] = 0
    # desmezclar el color de fondo en los píxeles semitransparentes
    with np.errstate(divide="ignore", invalid="ignore"):
        limpio = (rgb - (1 - a_new[..., None]) * fondo) / np.maximum(a_new[..., None], 1e-6)
    limpio = np.where(a_new[..., None] > 0, limpio, 0)
    out = np.dstack([limpio, alfa * a_new * 255]).clip(0, 255).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("entrada")
    ap.add_argument("salida")
    ap.add_argument("--modo", default="borde", choices=["borde", "global", "circulo", "oscuro", "ninguno"])
    ap.add_argument("--recorte", help="x0,y0,x1,y1 en píxeles de la imagen original")
    ap.add_argument("--tol", type=float, default=TOL, help="distancia al color de fondo que cuenta como fondo (0-255)")
    ap.add_argument("--tol2", type=float, default=TOL2, help="hasta dónde llega el borde suavizado; bájalo si el logo tiene partes casi blancas que tocan el fondo")
    ap.add_argument("--margen", type=float, default=0.03, help="margen alrededor del logo (fracción del lado mayor)")
    args = ap.parse_args()
    im = Image.open(args.entrada)
    if args.recorte:
        im = im.crop(tuple(int(v) for v in args.recorte.split(",")))
    out = quitar(im, args.modo, args.tol, args.tol2)
    caja = out.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    if caja:
        m = int(args.margen * max(caja[2] - caja[0], caja[3] - caja[1]))
        caja = (max(0, caja[0] - m), max(0, caja[1] - m), min(out.width, caja[2] + m), min(out.height, caja[3] + m))
        out = out.crop(caja)
    out.save(args.salida)
    print(f"{args.salida}: {out.size[0]}x{out.size[1]} ({args.modo})")


if __name__ == "__main__":
    main()
