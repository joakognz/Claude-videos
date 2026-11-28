"""Efectos de sonido de la librería del usuario (repo privado joakognz/sonidos-videos), nunca sintetizados.

Copia a public/sfx/ solo los archivos de los grupos de abajo (con su nombre original) y escribe public/sfx/_libreria.json:
por cada archivo, su carpeta de origen, el pico de volumen de CATALOGO.md y la ganancia que lo deja en cada nivel
(bajo, medio y fuerte) respecto a la voz. La plantilla «Master» elige de cada grupo rotando (src/master/sfx.ts).

Uso: python scripts/sfx_libreria.py /ruta/a/sonidos-videos
"""
import json, os, re, shutil, subprocess, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.dirname(ROOT)), "sonidos-videos")
SR = 48000

# grupo → archivos (ruta relativa a la librería). Elegidos con CATALOGO.md: cortos y con el pico al principio.
GRUPOS = {
    "woosh": ["01 Woosh - transiciones/Woosh rapido 05.wav", "01 Woosh - transiciones/VS_Short Whoosh 4.wav",
              "01 Woosh - transiciones/Woosh rapido 13.wav", "01 Woosh - transiciones/Woosh rapido 19.wav",
              "01 Woosh - transiciones/SWHOOSH.wav", "01 Woosh - transiciones/Woosh rapido 14.wav",
              "01 Woosh - transiciones/Woosh Effect 4.wav", "01 Woosh - transiciones/Woosh rapido 24.wav",
              "01 Woosh - transiciones/VS_Short Whoosh 1.wav", "01 Woosh - transiciones/Woosh rapido 40.wav"],
    "zoom": ["01 Woosh - transiciones/Largos (zooms)/Woosh largo 05.wav", "01 Woosh - transiciones/Largos (zooms)/Woosh largo 02.wav",
             "01 Woosh - transiciones/Largos (zooms)/Woosh largo 06.wav", "01 Woosh - transiciones/Largos (zooms)/Woosh largo 10.wav",
             "01 Woosh - transiciones/Largos (zooms)/Woosh largo 04.wav", "01 Woosh - transiciones/Largos (zooms)/Woosh largo 01.wav"],
    "click": ["02 Clicks - textos/Click suave 01.wav", "02 Clicks - textos/Tick 07.wav", "02 Clicks - textos/Click suave 03.wav",
              "02 Clicks - textos/Tick 11.wav", "02 Clicks - textos/Click 01.wav", "02 Clicks - textos/Tick 01.wav",
              "02 Clicks - textos/Click suave 06.wav", "02 Clicks - textos/Tick 08.wav"],
    "remate": ["02 Clicks - textos/Pop up SFX.wav", "02 Clicks - textos/Tick 03.wav", "02 Clicks - textos/Chasquido épico.wav",
               "02 Clicks - textos/Tick 05.wav"],
    "teclado": ["02 Clicks - textos/Efecto type de letras.wav", "02 Clicks - textos/Escribir teclado.wav",
                "02 Clicks - textos/Type Digital SFX.wav"],
    "glitch": ["03 Glitches/Glitch digital 05.wav", "03 Glitches/Glitch digital 02.wav", "03 Glitches/Glitch digital 06.wav",
               "03 Glitches/Glitch digital 04.wav", "03 Glitches/Glitch digital 01.wav", "03 Glitches/Glitch digital 03.wav"],
    "destello": ["04 Destellos y notificaciones/Destello 05.wav", "04 Destellos y notificaciones/Notificacion digital 03.wav",
                 "04 Destellos y notificaciones/Destello 03.wav", "04 Destellos y notificaciones/Notificacion digital 01.wav",
                 "04 Destellos y notificaciones/Destello 09.wav", "04 Destellos y notificaciones/Notificacion digital 05.wav",
                 "04 Destellos y notificaciones/Destello 02.wav"],
    "foto": ["05 Fotos - flash y shutter/Camera Flash.wav", "05 Fotos - flash y shutter/Camera Shot.wav",
             "05 Fotos - flash y shutter/CameraShutterMotorized35mmShutters.wav"],
    "interfaz": ["06 Varios/Interfaz y ventanas/Switch 01.wav", "06 Varios/Interfaz y ventanas/Ventana 16.wav",
                 "06 Varios/Interfaz y ventanas/Switch 04.wav", "06 Varios/Interfaz y ventanas/Ventana 27.wav",
                 "06 Varios/Interfaz y ventanas/Ventana 20.wav", "06 Varios/Interfaz y ventanas/Ventana 13.wav"],
    "impacto": ["06 Varios/Deep Bass Hit 1.wav", "06 Varios/Boom 2.wav", "06 Varios/Sub Bass Hit.wav", "06 Varios/04 Grand Hit B.wav"],
    "golpe": ["06 Varios/Golpe 17.wav", "06 Varios/Golpe 19.wav", "06 Varios/Golpe 12.wav", "06 Varios/Golpe 20.wav", "06 Varios/Golpe 11.wav"],
    "riser": ["06 Varios/RISER.wav"],
    "reloj": ["06 Varios/RELOJ.wav"],
    "acierto": ["06 Varios/Correct Answer sound effect.mp3"],
}

# nivel de cada efecto respecto a la voz (máximo de RMS en 100 ms): unos 10 dB por debajo en «medio»
NIVELES = {"bajo": -14.0, "medio": -10.0, "fuerte": -7.0}


def catalogo():
    picos = {}
    carpeta = None
    for ln in open(os.path.join(LIB, "CATALOGO.md"), encoding="utf-8-sig"):
        m = re.match(r"## (.+)", ln)
        if m:
            carpeta = m.group(1).strip()
            continue
        c = [x.strip() for x in ln.strip().strip("|").split("|")]
        if carpeta and len(c) == 4 and re.match(r"^[\d.]+$", c[3] or ""):
            picos[f"{carpeta}/{c[0]}"] = (float(c[1]), float(c[3]))
    return picos


def load(path):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32).astype(np.float64)


def rms_max(x, win=0.1):
    n = int(win * SR)
    if len(x) < n:
        return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
    c = np.cumsum(np.concatenate([[0], x ** 2]))
    r = np.sqrt((c[n:] - c[:-n]) / n)
    return 20 * np.log10(r.max() + 1e-12)


def main():
    picos = catalogo()
    voz = load(os.path.join(ROOT, "public", "episodios", "ep-13-v2", "voz.wav"))
    ref = rms_max(voz)
    dst = os.path.join(ROOT, "public", "sfx")
    os.makedirs(dst, exist_ok=True)
    out = {"voz_rms_max_db": round(ref, 2), "grupos": {}, "archivos": {}}
    for g, fs in GRUPOS.items():
        out["grupos"][g] = []
        for rel in fs:
            if rel not in picos:
                sys.exit(f"No está en CATALOGO.md: {rel}")
            dur, pico = picos[rel]
            nombre = os.path.basename(rel)
            shutil.copyfile(os.path.join(LIB, rel), os.path.join(dst, nombre))
            x = load(os.path.join(LIB, rel))
            nivel = rms_max(x)
            pk = 20 * np.log10(np.abs(x).max() + 1e-12)
            gan = {}
            for k, d in NIVELES.items():
                g_db = (ref + d) - nivel
                g_db = min(g_db, -3.0 - pk)  # nunca por encima de -3 dBFS de pico
                gan[k] = round(min(1.0, 10 ** (g_db / 20)), 4)
            out["grupos"][g].append(nombre)
            out["archivos"][nombre] = {"origen": rel, "duracion": dur, "pico": pico, "rms_db": round(nivel, 1), "pico_db": round(pk, 1), "vol": gan}
    json.dump(out, open(os.path.join(dst, "_libreria.json"), "w"), ensure_ascii=False, indent=1)
    print(f"{len(out['archivos'])} archivos en public/sfx/ (voz: {ref:.1f} dB RMS máx.)")
    for n, a in out["archivos"].items():
        print(f"  {n:45s} rms {a['rms_db']:6.1f}  pico {a['pico_db']:6.1f}  vol medio {a['vol']['medio']}")


main()
