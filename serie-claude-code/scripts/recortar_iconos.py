"""Recorta los 5 iconos de la hoja del usuario a PNG con transparencia, sin redibujar ni recolorear nada.
Fila 1 (fondo crema) -> icono con su contorno oscuro.  Fila 3 (pegatina sobre oscuro) -> icono con borde crema."""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

hoja, salida = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(hoja).convert("RGB")).astype(np.float32)
H, W, _ = im.shape
nombres = ["marcador", "reloj", "esc", "mano", "matraz"]

def franja(y0, y1, sufijo):
    reg = im[y0:y1]
    fondo = np.median(reg[:6].reshape(-1, 3), axis=0)           # color de fondo de la franja
    dist = np.linalg.norm(reg - fondo, axis=2)
    # fondo = lo conectado al borde con color casi igual al de fondo
    casi = dist < 14
    etiquetas, _ = ndi.label(casi)
    borde = np.unique(np.concatenate([etiquetas[0], etiquetas[-1], etiquetas[:, 0], etiquetas[:, -1]]))
    es_fondo = np.isin(etiquetas, borde[borde > 0])
    objeto = ~es_fondo
    # rellena huecos interiores: lo que no toca el borde es parte del icono
    objeto = ndi.binary_fill_holes(objeto)
    # alfa suave en el filo: desmezcla respecto al color del fondo en una banda de 2 px
    interior = ndi.binary_erosion(objeto, iterations=2)
    exterior = ~ndi.binary_dilation(objeto, iterations=2)
    alfa = np.where(interior, 1.0, 0.0).astype(np.float32)
    banda = ~interior & ~exterior
    # color de referencia del contorno: el del píxel interior más cercano
    _, (iy, ix) = ndi.distance_transform_edt(~interior, return_indices=True)
    ref = reg[iy, ix]
    num = ((reg - fondo) * (ref - fondo)).sum(axis=2)
    den = ((ref - fondo) ** 2).sum(axis=2) + 1e-6
    a_banda = np.clip(num / den, 0, 1)
    alfa[banda] = a_banda[banda]
    rgb = reg.copy()
    rgb[banda] = ref[banda]                                      # sin halo del color de fondo
    # separa los cinco iconos por columnas vacías
    cols = (alfa > 0.5).any(axis=0)
    cambios = np.flatnonzero(np.diff(np.concatenate([[0], cols.astype(int), [0]])))
    tramos = [(cambios[i], cambios[i + 1]) for i in range(0, len(cambios), 2) if cambios[i + 1] - cambios[i] > 30]
    assert len(tramos) == 5, tramos
    for nombre, (x0, x1) in zip(nombres, tramos):
        filas = np.flatnonzero((alfa[:, x0:x1] > 0.02).any(axis=1))
        m = 6
        ya, yb = max(filas[0] - m, 0), min(filas[-1] + 1 + m, reg.shape[0])
        xa, xb = max(x0 - m, 0), min(x1 + m, W)
        out = np.dstack([rgb[ya:yb, xa:xb], alfa[ya:yb, xa:xb] * 255]).round().astype(np.uint8)
        Image.fromarray(out, "RGBA").save(f"{salida}/{nombre}{sufijo}.png")
        print(f"{nombre}{sufijo}: {xb - xa}x{yb - ya}  fondo={fondo.round().astype(int).tolist()}")

franja(0, 340, "")            # sobre crema: icono con contorno oscuro
franja(680, 1020, "_pegatina")  # pegatina con borde crema
