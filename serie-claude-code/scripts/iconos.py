"""Genera los iconos y dibujos planos de la serie como SVG sueltos en public/iconos/ (y su muestrario en HTML).

Son los mismos que dibuja Remotion en src/master/componentes/ep08/Dibujos.tsx y Cartel.tsx, pero estáticos, para usarlos
en cualquier episodio (con <Img src={staticFile("iconos/…")} />), en otra herramienta o en los esquemas.
No son logos de marcas: los logos SOLO salen de public/logos/ (los aporta el usuario).

Uso:  python scripts/iconos.py          → public/iconos/{linea,linea-coral,dibujos}/*.svg + public/iconos/_muestrario.html
Para añadir uno: añade su entrada a LINEA (trazo 24x24) o a DIBUJOS (ilustración) y vuelve a ejecutar.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "iconos")
ACENTO, OSC, BLANCO, CREMA, TINTA = "#D97757", "#0B0D12", "#FFFFFF", "#F6EEDC", "#1C1A1A"
PANEL, BORDE, GRIS = "#2A3140", "#4A5263", "#8C93A3"

# ── iconos de trazo (24x24, sin relleno; el color lo pone el generador) ─────────────────────────────────────────────
LINEA = {
    "conexion": '<path d="M9 3 V8 M15 3 V8"/><path d="M6 8 H18 V12 A6 6 0 0 1 6 12 Z"/><path d="M12 18 V22"/>',
    "cuenta": '<circle cx="12" cy="8" r="4"/><path d="M4 21 A8 8 0 0 1 20 21"/>',
    "lupa": '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 L21 21"/>',
    "repite": '<path d="M4 12 A8 8 0 0 1 18.5 7.5"/><path d="M19 3 V8 H14"/><path d="M20 12 A8 8 0 0 1 5.5 16.5"/><path d="M5 21 V16 H10"/>',
    "ramas": '<path d="M6 21 V13 C6 9 9 8 12 8 H18"/><path d="M15 5 L18 8 L15 11"/><path d="M6 13 C6 16 9 17 11 19"/>',
    "atasca": '<rect x="2.5" y="9" width="19" height="6" rx="3"/><path d="M3.5 12 H11" stroke-width="3.4"/><path d="M15 4 V7 M18 5 L16.5 7.2 M12 5 L13.5 7.2"/>',
    "reintentar": '<path d="M20 12 A8 8 0 1 1 17 5.8"/><path d="M20 3 V8 H15"/>',
    "enlace": '<path d="M10 14 A4 4 0 0 0 15.6 14 L19 10.6 A4 4 0 0 0 13.4 5 L12 6.4"/><path d="M14 10 A4 4 0 0 0 8.4 10 L5 13.4 A4 4 0 0 0 10.6 19 L12 17.6"/>',
    "alerta": '<path d="M12 3 L22 20 H2 Z"/><path d="M12 9.5 V14"/><path d="M12 17 V17.2"/>',
    "check": '<circle cx="12" cy="12" r="9.5"/><path d="M7.5 12.5 L10.5 15.5 L16.5 9"/>',
    "cruz": '<circle cx="12" cy="12" r="9.5"/><path d="M8.5 8.5 L15.5 15.5 M15.5 8.5 L8.5 15.5"/>',
    "candado": '<rect x="5" y="10.5" width="14" height="10.5" rx="2.5"/><path d="M8 10.5 V7.5 A4 4 0 0 1 16 7.5 V10.5"/><path d="M12 14.5 V17"/>',
    "llave": '<circle cx="7.5" cy="12" r="4"/><path d="M11.5 12 H21 M17.5 12 V15 M20 12 V14.5"/>',
    "tarjeta": '<rect x="2.5" y="5.5" width="19" height="13" rx="2.5"/><path d="M2.5 9.5 H21.5"/><path d="M6 15 H10"/>',
    "datafono": '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><rect x="8.5" y="5" width="7" height="4.5" rx="1"/><path d="M9 13 H9.2 M12 13 H12.2 M15 13 H15.2 M9 16 H9.2 M12 16 H12.2 M15 16 H15.2"/>',
    "turnos": '<rect x="5" y="3" width="14" height="13" rx="2.5"/><rect x="8" y="6" width="8" height="4" rx="1"/><path d="M9 16 V21 H15 V16"/>',
    "servidor": '<rect x="3.5" y="3.5" width="17" height="6.5" rx="1.8"/><rect x="3.5" y="14" width="17" height="6.5" rx="1.8"/><path d="M7 6.8 H7.2 M10 6.8 H10.2 M7 17.2 H7.2 M10 17.2 H10.2"/>',
    "reloj-arena": '<path d="M6 3 H18 M6 21 H18"/><path d="M7 3 C7 9 12 9.5 12 12 C12 14.5 7 15 7 21 M17 3 C17 9 12 9.5 12 12 C12 14.5 17 15 17 21"/>',
    "carpeta": '<path d="M3 6.5 A1.5 1.5 0 0 1 4.5 5 H9.5 L11.5 7 H19.5 A1.5 1.5 0 0 1 21 8.5 V18 A1.5 1.5 0 0 1 19.5 19.5 H4.5 A1.5 1.5 0 0 1 3 18 Z"/><path d="M3 10 H21"/>',
    "llave-inglesa": '<path d="M15 3.5 A5 5 0 0 0 10.7 10.2 L3.8 17.1 A2 2 0 0 0 6.9 20.2 L13.8 13.3 A5 5 0 0 0 20.5 9 L17.5 10.2 L15 9 L13.8 6.5 Z"/>',
    "tecla": '<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M2.5 15.5 H21.5"/>',
    "tienda": '<path d="M3 9 L4.5 4 H19.5 L21 9"/><path d="M3 9 A3 3 0 0 0 9 9 A3 3 0 0 0 15 9 A3 3 0 0 0 21 9"/><path d="M5 11.5 V20.5 H19 V11.5"/><path d="M10 20.5 V15 H14 V20.5"/>',
    "cartel": '<path d="M12 2.5 V2.6"/><path d="M7 9 L12 3.5 L17 9"/><rect x="3.5" y="9" width="17" height="11" rx="2"/><path d="M7 14.5 H17"/>',
    "comentario": '<path d="M4 5.5 H20 A1.5 1.5 0 0 1 21.5 7 V16 A1.5 1.5 0 0 1 20 17.5 H11 L6.5 21 V17.5 H4 A1.5 1.5 0 0 1 2.5 16 V7 A1.5 1.5 0 0 1 4 5.5 Z"/>',
    "enviar": '<path d="M3 11.5 L21 3 L13.5 21 L11 13 Z"/>',
    "persona": '<circle cx="12" cy="6.5" r="3.5"/><path d="M6 21.5 V15 A6 6 0 0 1 18 15 V21.5"/>',
}

# ── dibujos planos (relleno de la serie: acento, blanco y contorno oscuro) ────────────────────────────────────────────
DIBUJOS = {
    "candado": (250, 360, f'''
  <path d="M 55 160 L 55 100 A 70 70 0 0 1 195 100 L 195 160" fill="none" stroke="{BLANCO}" stroke-width="30" stroke-linecap="round"/>
  <rect x="10" y="140" width="230" height="210" rx="34" fill="{ACENTO}" stroke="{OSC}" stroke-width="8"/>
  <circle cx="125" cy="225" r="26" fill="{OSC}"/><path d="M 113 236 L 137 236 L 132 300 L 118 300 Z" fill="{OSC}"/>'''),
    "llave": (250, 90, f'''
  <circle cx="45" cy="45" r="38" fill="{BLANCO}" stroke="{OSC}" stroke-width="6"/><circle cx="45" cy="45" r="13" fill="{OSC}"/>
  <rect x="78" y="36" width="170" height="20" rx="6" fill="{BLANCO}" stroke="{OSC}" stroke-width="5"/>
  <path d="M 180 56 L 180 76 L 196 76 L 196 56 M 214 56 L 214 70 L 230 70 L 230 56" fill="{BLANCO}" stroke="{OSC}" stroke-width="5" stroke-linejoin="round"/>'''),
    "tarjeta": (200, 128, f'''
  <rect x="3" y="3" width="194" height="122" rx="16" fill="{BLANCO}" stroke="{OSC}" stroke-width="6"/>
  <rect x="6" y="25" width="188" height="22" fill="{ACENTO}"/>
  <rect x="20" y="62" width="40" height="30" rx="6" fill="#E0B860" stroke="{OSC}" stroke-width="3"/>
  <rect x="76" y="74" width="92" height="10" rx="5" fill="#C3C8D1"/>'''),
    "datafono": (270, 350, f'''
  <rect x="3.5" y="3.5" width="263" height="343" rx="38" fill="{PANEL}" stroke="{OSC}" stroke-width="7"/>
  <rect x="30" y="34" width="210" height="112" rx="16" fill="#CFE3E8" stroke="{OSC}" stroke-width="5"/>
  {"".join(f'<rect x="{42 + (k % 3) * 66}" y="{172 + (k // 3) * 44}" width="44" height="30" rx="9" fill="{BORDE}"/>' for k in range(9))}'''),
    "maquina-turnos": (260, 300, f'''
  <rect x="3.5" y="3.5" width="253" height="293" rx="36" fill="{ACENTO}" stroke="{OSC}" stroke-width="7"/>
  <rect x="30" y="30" width="200" height="104" rx="14" fill="{OSC}" stroke="{OSC}" stroke-width="5"/>
  <rect x="44" y="238" width="172" height="20" rx="10" fill="{OSC}"/>'''),
    "ticket": (136, 84, f'''
  <rect x="2.5" y="2.5" width="131" height="79" rx="10" fill="{BLANCO}" stroke="{OSC}" stroke-width="5"/>
  <rect x="30" y="34" width="76" height="16" rx="8" fill="{OSC}" opacity="0.8"/>'''),
    "servidor": (300, 400, f'''
  <rect x="3.5" y="3.5" width="293" height="393" rx="30" fill="#1B202B" stroke="{OSC}" stroke-width="7"/>
  {"".join(f'<rect x="22" y="{26 + k * 88}" width="256" height="66" rx="14" fill="{PANEL}" stroke="{OSC}" stroke-width="4"/>' + "".join(f'<circle cx="{48 + j * 28}" cy="{59 + k * 88}" r="8" fill="{ACENTO if (k + j) % 2 == 0 else "#F0A989"}"/>' for j in range(3)) + f'<rect x="200" y="{54 + k * 88}" width="56" height="10" rx="5" fill="{BORDE}"/>' for k in range(4))}'''),
    "reloj-arena": (100, 130, f'''
  <path d="M 18 8 L 82 8 M 18 122 L 82 122" stroke="{BLANCO}" stroke-width="7" stroke-linecap="round"/>
  <path d="M 24 10 C 24 46 46 52 46 65 C 46 78 24 84 24 120 L 76 120 C 76 84 54 78 54 65 C 54 52 76 46 76 10 Z" fill="none" stroke="{BLANCO}" stroke-width="6" stroke-linejoin="round"/>
  <path d="M 36 32 L 64 32 L 52 60 L 48 60 Z" fill="{ACENTO}"/><path d="M 30 116 L 70 116 L 57 101 L 43 101 Z" fill="{ACENTO}"/>'''),
    "carpeta": (100, 80, f'''
  <path d="M 6 14 A 6 6 0 0 1 12 8 L 38 8 L 46 16 L 88 16 A 6 6 0 0 1 94 22 L 94 70 A 6 6 0 0 1 88 76 L 12 76 A 6 6 0 0 1 6 70 Z" fill="{ACENTO}" stroke="{OSC}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M 6 30 L 94 30" stroke="{OSC}" stroke-width="4"/>'''),
    "llave-inglesa": (100, 100, f'''
  <path d="M 66 10 A 22 22 0 0 0 46 40 L 12 74 A 9 9 0 0 0 26 88 L 60 54 A 22 22 0 0 0 90 34 L 76 40 L 64 36 L 60 24 L 66 10 Z" fill="{BLANCO}" stroke="{OSC}" stroke-width="5" stroke-linejoin="round"/>'''),
    "tecla-esc": (260, 234, f'''
  <rect x="3" y="29" width="254" height="202" rx="36" fill="#7A3E2C" stroke="{OSC}" stroke-width="6"/>
  <rect x="3" y="3" width="254" height="202" rx="36" fill="{ACENTO}" stroke="{OSC}" stroke-width="6"/>
  <text x="130" y="128" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="700" font-size="78" fill="{OSC}">Esc</text>'''),
    "persona": (64, 150, f'''
  <circle cx="32" cy="28" r="22" fill="#F0A989" stroke="{OSC}" stroke-width="5"/>
  <path d="M 6 146 L 6 84 A 26 26 0 0 1 58 84 L 58 146 Z" fill="{ACENTO}" stroke="{OSC}" stroke-width="5"/>'''),
    "cartel": (300, 280, f'''
  <path d="M 60 96 L 150 12 L 240 96" fill="none" stroke="{TINTA}" stroke-width="5" stroke-linejoin="round"/>
  <circle cx="150" cy="12" r="9" fill="#B8BEC6" stroke="{TINTA}" stroke-width="3"/>
  <rect x="4" y="92" width="292" height="184" rx="21" fill="{CREMA}" stroke="{TINTA}" stroke-width="7"/>
  <circle cx="60" cy="108" r="5.5" fill="{TINTA}"/><circle cx="240" cy="108" r="5.5" fill="{TINTA}"/>
  <path d="M 7.5 226 L 292.5 226 L 292.5 255 A 18 18 0 0 1 274.5 272.5 L 25.5 272.5 A 18 18 0 0 1 7.5 255 Z" fill="{ACENTO}"/>
  <path d="M 7.5 226 L 292.5 226" stroke="{TINTA}" stroke-width="5"/>'''),
    "aviso-error": (860, 190, f'''
  <rect x="1.5" y="1.5" width="857" height="187" rx="26" fill="#151A23" stroke="{ACENTO}" stroke-width="3"/>
  <g transform="translate(34 53) scale(3.8)"><path d="M 12 1.5 L 23 20.5 L 1 20.5 Z" fill="{ACENTO}" stroke="{OSC}" stroke-width="1.2" stroke-linejoin="round"/><path d="M 12 8 L 12 13.5" stroke="{OSC}" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="17" r="1.4" fill="{OSC}"/></g>
  <text x="152" y="92" font-family="JetBrains Mono, monospace" font-weight="700" font-size="50" fill="{BLANCO}">API Error ·</text>
  <rect x="152" y="118" width="220" height="14" rx="7" fill="{BORDE}"/><rect x="384" y="118" width="140" height="14" rx="7" fill="{BORDE}"/><rect x="536" y="118" width="180" height="14" rx="7" fill="{BORDE}"/>'''),
    "insignia-check": (100, 100, f'''
  <circle cx="50" cy="50" r="46" fill="{ACENTO}"/>
  <path d="M 28 52 L 43 67 L 72 36" fill="none" stroke="{OSC}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>'''),
    "insignia-cruz": (100, 100, f'''
  <circle cx="50" cy="50" r="44" fill="{ACENTO}" stroke="{OSC}" stroke-width="6"/>
  <path d="M 33 33 L 67 67 M 67 33 L 33 67" stroke="{OSC}" stroke-width="10" stroke-linecap="round"/>'''),
}


def svg_linea(cuerpo, color):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="{color}" '
            f'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">{cuerpo}</svg>\n')


def main():
    for carpeta in ("linea", "linea-coral", "dibujos"):
        os.makedirs(os.path.join(OUT, carpeta), exist_ok=True)
    for nombre, cuerpo in LINEA.items():
        open(os.path.join(OUT, "linea", f"{nombre}.svg"), "w").write(svg_linea(cuerpo, BLANCO))
        open(os.path.join(OUT, "linea-coral", f"{nombre}.svg"), "w").write(svg_linea(cuerpo, ACENTO))
    for nombre, (w, h, cuerpo) in DIBUJOS.items():
        open(os.path.join(OUT, "dibujos", f"{nombre}.svg"), "w").write(
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{cuerpo}\n</svg>\n')
    # muestrario
    celdas = lambda carpeta, nombres, alto: "".join(
        f'<figure><div style="height:{alto}px"><img src="{carpeta}/{n}.svg" style="max-height:{alto}px;max-width:200px"></div>'
        f'<figcaption>{carpeta}/{n}.svg</figcaption></figure>' for n in nombres)
    html = f'''<!doctype html><meta charset="utf-8"><title>Iconos · Máster de Claude Code</title>
<style>body{{margin:0;padding:40px;background:{OSC};color:#fff;font:600 16px Inter,Arial,sans-serif}}h2{{color:{ACENTO};margin:30px 0 10px}}
.g{{display:grid;grid-template-columns:repeat(6,1fr);gap:18px}}figure{{margin:0;padding:16px;border:2px solid #2A3140;border-radius:16px;background:#141821;text-align:center}}
figure div{{display:flex;align-items:center;justify-content:center}}figcaption{{margin-top:10px;font:500 13px monospace;color:{GRIS}}}</style>
<h1>Iconos y dibujos de la serie (no son logos)</h1>
<h2>Trazo blanco · linea/</h2><div class="g">{celdas("linea", LINEA, 80)}</div>
<h2>Trazo coral · linea-coral/</h2><div class="g">{celdas("linea-coral", LINEA, 80)}</div>
<h2>Dibujos planos · dibujos/</h2><div class="g">{celdas("dibujos", DIBUJOS, 150)}</div>'''
    open(os.path.join(OUT, "_muestrario.html"), "w").write(html)
    print(f"{len(LINEA)} iconos de trazo (x2 colores) y {len(DIBUJOS)} dibujos en {os.path.relpath(OUT, ROOT)}/")


if __name__ == "__main__":
    main()
