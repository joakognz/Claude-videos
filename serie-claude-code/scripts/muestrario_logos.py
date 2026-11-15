"""Muestrario de logos o iconos sobre el fondo oscuro de la serie y sobre claro: python scripts/muestrario_logos.py public/logos public/logos/_muestrario.png"""
import glob, os, sys
from PIL import Image, ImageDraw, ImageFont
carpeta, salida = sys.argv[1], sys.argv[2]
fs = sorted(f for f in glob.glob(os.path.join(carpeta, "*.png")) if not os.path.basename(f).startswith("_"))
C, F = 260, 44
cols = 6
filas = (len(fs) + cols - 1) // cols
W, H = cols * C, filas * (C * 2 + F)
hoja = Image.new("RGB", (W, H), (30, 30, 30))
d = ImageDraw.Draw(hoja)
try:
    fuente = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 17)
except Exception:
    fuente = ImageFont.load_default()
for i, f in enumerate(fs):
    x, y = (i % cols) * C, (i // cols) * (C * 2 + F)
    im = Image.open(f).convert("RGBA")
    im.thumbnail((C - 40, C - 40), Image.LANCZOS)
    for k, fondo in enumerate([(11, 13, 18), (240, 238, 232)]):
        celda = Image.new("RGBA", (C, C), fondo + (255,))
        celda.alpha_composite(im, ((C - im.width) // 2, (C - im.height) // 2))
        hoja.paste(celda.convert("RGB"), (x, y + k * C))
    d.rectangle([x, y + 2 * C, x + C, y + 2 * C + F], fill=(20, 20, 20))
    d.text((x + 8, y + 2 * C + 12), os.path.basename(f), fill=(255, 210, 120), font=fuente)
    d.rectangle([x, y, x + C - 1, y + 2 * C + F - 1], outline=(70, 70, 70))
hoja.save(salida)
print(len(fs), "logos ·", salida)
