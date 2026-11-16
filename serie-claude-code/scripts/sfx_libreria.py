"""Efectos de sonido del reel con la librería del usuario (repo privado joakognz/sonidos-videos).

Convierte los eventos de sonido que calcula la plantilla (golpe de sello, clic, woosh de corte, tecleo…) en «cues»
con archivos REALES de la librería. Nada se sintetiza. Sigue las reglas de la skill `sonidos-videos`:

- cada tipo de evento tiene su carpeta (tabla de la sección 1) y se elige por nombre y duración con CATALOGO.md;
- el pico del sonido cae en el evento: inicio = evento − pico (en transiciones, la mitad del movimiento);
- nunca el mismo archivo que uno de los dos anteriores, ni un woosh justo después de otro;
- efectos unos 10 dB por debajo de la voz («Medio») o unos 14 dB («Bajo»), medidos sobre cada archivo;
- si un evento no tiene sonido adecuado, se queda en silencio y se avisa.

Copia al proyecto (public/sfx/, con su carpeta y nombre originales) solo los archivos usados. public/sfx/ está en
.gitignore: el repositorio Claude-videos es público y la librería es privada.

Uso (lo llama scripts/sonidos.mjs):
  python scripts/sfx_libreria.py --episodio episodios/ep-11.json --eventos out/claude-code-ep-11.eventos.json [--repo RUTA]
Deja public/episodios/ep-NN/cues.json y out/claude-code-ep-NN.sonidos.txt (lista momento → archivo).
"""
import argparse, json, os, re, shutil, subprocess, sys
import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy.signal import lfilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30

# ── qué suena con cada evento (carpeta del repo → archivos candidatos) ────────────────────────────────────────────
W, CL, GL, DE, FO, VA, UI = (
    "01 Woosh - transiciones/", "02 Clicks - textos/", "03 Glitches/", "04 Destellos y notificaciones/",
    "05 Fotos - flash y shutter/", "06 Varios/", "06 Varios/Interfaz y ventanas/",
)
n2 = lambda pref, nums: [f"{pref} {n:02d}.wav" for n in nums]
POOLS = {
    # corte entre bloques (la transición dura 0,67 s y el evento es su mitad)
    "whoosh": [W + f for f in n2("Woosh rapido", [13, 14, 19, 24, 29, 30, 33, 37, 40, 42, 43])]
    + [W + "VS_Short Whoosh 1.wav", W + "VS_Short Whoosh 3.wav", W + "VS_Short Whoosh 4.wav", W + "Woosh Effect 4.wav", W + "SWHOOSH.wav"],
    # zoom de cámara
    "zoom": [W + "Largos (zooms)/" + f for f in n2("Woosh largo", range(1, 11))],
    # texto, etiqueta o logo que entra
    "pop": [CL + f for f in n2("Click suave", range(1, 7)) + n2("Tick", [1, 2, 7, 8, 9, 11]) + ["Pop up SFX.wav", "Click 01.wav", "Click 04.wav"]],
    # sello que cae o remate
    "golpe": [VA + f for f in n2("Golpe", range(3, 16))],
    # clic del cursor sobre un botón, menú o tecla
    "tick": [UI + f for f in n2("Switch", [8, 9, 10, 11]) + n2("Ventana", [1, 2, 3, 4, 9, 19, 21]) + ["Hover 01.wav"]],
    # ventana o panel que se abre
    "ventana": [UI + f for f in n2("Ventana", [6, 7, 8, 12, 18, 22, 23, 25, 26])],
    # algo sale bien, un ✓, un brillo
    "check": [DE + f for f in n2("Destello", range(1, 14)) + n2("Notificacion digital", [1, 3, 5])],
    # mensaje enviado o notificación
    "envio": [DE + f for f in n2("Notificacion digital", [1, 3, 5, 6, 7, 8, 9])],
    # pantalla o interfaz que falla o «se procesa»
    "glitch": [GL + f for f in n2("Glitch digital", range(1, 7)) + n2("Glitch", [5, 6, 7, 8, 9])],
    # foto que aparece
    "foto": [FO + f for f in ["Camera Flash.wav", "Camera Flash (Double).wav", "Camera Shot.wav", "Camera Shutter.wav", "Shutter 2.wav", "CameraShutterMotorized35mmShutters.wav"]],
    # error o pregunta
    "error": [VA + f for f in n2("Error y pregunta", range(1, 13))],
    # revelación o golpe fuerte (con cuidado)
    "revelacion": [VA + f for f in ["Deep Bass Hit 1.wav", "Sub Bass Hit.wav", "Boom 2.wav", "04 Grand Hit B.wav"]],
    # texto que se escribe letra a letra: tramos de tecleo real (no se repite la misma tecla)
    "tecleo": [CL + "Escribir teclado.wav", CL + "Type Digital SFX.wav", CL + "Efecto type de letras.wav"],
}
# nivel respecto a la voz (dB): «Medio» ≈ −10, «Bajo» ≈ −14 (tabla de la skill); el tecleo es una cama continua
NIVEL = {"whoosh": -11, "zoom": -15, "pop": -15, "golpe": -10, "tick": -15, "ventana": -14, "check": -11, "envio": -11,
         "glitch": -14, "foto": -11, "error": -13, "revelacion": -9, "tecleo": -17}
# duración máxima que se deja sonar (los archivos largos se cortan con fundido)
TOPE = {"whoosh": 1.4, "zoom": 1.5, "revelacion": 2.5, "golpe": 1.0, "check": 1.0, "envio": 1.0, "glitch": 0.9, "foto": 1.0}
FUERTES = {"whoosh", "golpe", "revelacion", "foto"}
MOVIMIENTO = {"whoosh", "zoom"}
# los eventos antiguos traen el inicio del sonido sintético: su pico estaba en t + PICO_SINT
PICO_SINT = {"golpe": 0.002, "tick": 0.003, "whoosh": 0.367, "pop": 0.001, "tecleo": 0.0, "envio": 0.02}


def repo_por_defecto():
    for c in [os.environ.get("SONIDOS_VIDEOS"), os.path.join(ROOT, "..", "..", "sonidos-videos"),
              os.path.expanduser("~/sonidos-videos"), os.path.expanduser("~/Documents/sonidos-videos")]:
        if c and os.path.isfile(os.path.join(c, "CATALOGO.md")):
            return os.path.abspath(c)
    sys.exit("No encuentro la librería de sonidos (joakognz/sonidos-videos). Clónala junto a Claude-videos "
             "o pasa --repo RUTA. Sin ella no hay efectos: no se sintetizan.")


def leer_catalogo(repo):
    """CATALOGO.md → {ruta relativa: (duración, pico)}"""
    cat, carpeta = {}, None
    for l in open(os.path.join(repo, "CATALOGO.md"), encoding="utf-8-sig"):
        m = re.match(r"## (\d\d .+)", l)
        if m:
            carpeta = m.group(1).strip()
            continue
        c = [x.strip() for x in l.strip().strip("|").split("|")]
        if carpeta and len(c) >= 4 and re.match(r"[\d.]+$", c[1]) and re.match(r"[\d.]+$", c[-1]):
            cat[f"{carpeta}/{c[0]}"] = (float(c[1]), float(c[-1]))
    return cat


def kfiltro(x, sr):
    """Ponderación K (ITU-R BS.1770) para medir el nivel como lo oye una persona."""
    m = pyln.Meter(sr)
    for f in m._filters.values():
        x = lfilter(f.b, f.a, x, axis=0)
    return x


def a_estereo(x):
    return np.stack([x, x], 1) if x.ndim == 1 else x[:, :2]


def nivel_max(x, sr, ventana=0.1):
    """Nivel (LUFS) de la ventana de 100 ms más fuerte, tal como suena en estéreo."""
    y = kfiltro(a_estereo(x), sr)
    e = (y ** 2).sum(1)
    n = max(1, int(sr * ventana))
    if len(e) < n:
        e = np.pad(e, (0, n - len(e)))
    c = np.convolve(e, np.ones(n) / n, mode="valid")
    return -0.691 + 10 * np.log10(c.max() + 1e-12)


def nivel_medio(x, sr):
    y = kfiltro(a_estereo(x), sr)
    return -0.691 + 10 * np.log10(((y ** 2).sum(1)).mean() + 1e-12)


def tramos_activos(x, sr, paso=0.05, umbral=-50):
    """Tramos con tecleo continuo (RMS por encima del umbral, huecos de menos de 0,3 s)."""
    m = x if x.ndim == 1 else x.mean(1)
    h = int(sr * paso)
    rms = np.array([20 * np.log10(np.sqrt(np.mean(m[i:i + h] ** 2)) + 1e-9) for i in range(0, len(m) - h, h)])
    on = rms > umbral
    tramos, a, hueco = [], None, 0
    for i, v in enumerate(on):
        if v:
            if a is None:
                a = i
            hueco = 0
        elif a is not None:
            hueco += 1
            if hueco * paso > 0.3:
                tramos.append((a * paso, (i - hueco + 1) * paso))
                a, hueco = None, 0
    if a is not None:
        tramos.append((a * paso, (len(on) - hueco) * paso))
    return [(round(s, 2), round(e, 2)) for s, e in tramos if e - s >= 0.5]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--episodio", required=True)
    ap.add_argument("--eventos", required=True)
    ap.add_argument("--repo", default=None)
    a = ap.parse_args()
    repo = os.path.abspath(a.repo) if a.repo else repo_por_defecto()
    ep = json.load(open(a.episodio, encoding="utf-8"))
    N = int(ep["episodio"])
    datos = json.load(open(a.eventos, encoding="utf-8"))
    eventos, palabras, dur_reel = datos["eventos"], datos["palabras"], datos["duracion"]
    cat = leer_catalogo(repo)
    commit = subprocess.run(["git", "-C", repo, "rev-parse", "--short", "HEAD"], capture_output=True, text=True).stdout.strip()

    # nivel de la voz tal como suena en el mp4 (mono en los dos canales)
    vx, vsr = sf.read(os.path.join(ROOT, "public", ep["voz"]["audio"]))
    VOZ = pyln.Meter(vsr).integrated_loudness(a_estereo(vx if vx.ndim == 1 else vx.mean(1)))

    # análisis de cada candidato (una vez)
    info, faltan = {}, []
    for tipo, lista in POOLS.items():
        for rel in lista:
            if rel in info:
                continue
            p = os.path.join(repo, rel)
            if not os.path.isfile(p) or rel not in cat:
                faltan.append(rel)
                continue
            x, sr = sf.read(p)
            d = {"dur": cat[rel][0], "pico": cat[rel][1], "sr": sr}
            if tipo == "tecleo":
                d["tramos"] = tramos_activos(x, sr)
                d["nivel"] = nivel_medio(x[int(d["tramos"][0][0] * sr):int(d["tramos"][-1][1] * sr)], sr) if d["tramos"] else -99
            else:
                d["nivel"] = nivel_max(x, sr)
            info[rel] = d
    if faltan:
        print(f"  ⚠ {len(faltan)} candidatos no están en el repo o en CATALOGO.md (se ignoran): {', '.join(faltan[:5])}…")

    # volumen de referencia de cada tipo en la plantilla (para respetar los matices: un golpe 0.5 suena más que uno 0.35)
    base = {}
    for e in eventos:
        base.setdefault(e["sfx"], []).append(e["vol"])
    base = {k: float(np.median(v)) for k, v in base.items()}

    # momento del evento
    evs = []
    for e in eventos:
        en = e["en"] if e.get("en") is not None else e["t"] + PICO_SINT.get(e["sfx"], 0)
        evs.append({**e, "en": en})
    evs.sort(key=lambda e: e["en"])

    habla = lambda t: any(p["inicio"] - 0.03 <= t <= p["fin"] + 0.03 for p in palabras)
    usados, cues, silencios, descartes = [], [], [], []
    ult_mov = -9.0
    orden = {}  # rotación determinista por tipo
    for i, e in enumerate(evs):
        tipo = e["sfx"]
        if tipo not in POOLS:
            silencios.append((e["en"], tipo, "no hay carpeta para este tipo"))
            continue
        # woosh tras woosh: se queda solo el primero
        if tipo in MOVIMIENTO:
            if e["en"] - ult_mov < 0.9:
                descartes.append((e["en"], tipo, "woosh justo después de otro"))
                continue
        # dos golpes a la vez suenan a error: se queda el que va primero (los cues más fuertes ya van antes)
        if tipo != "tecleo" and cues and cues[-1]["tipo"] != "tecleo" and e["en"] - cues[-1]["en"] < 0.07:
            if NIVEL[tipo] > NIVEL[cues[-1]["tipo"]]:
                descartes.append((cues[-1]["en"], cues[-1]["tipo"], "pegado a otro efecto"))
                cues.pop()
                usados.pop()
            else:
                descartes.append((e["en"], tipo, "pegado a otro efecto"))
                continue
        lista = [r for r in POOLS[tipo] if r in info]
        if not orden.get(tipo):
            rng = np.random.default_rng(N * 1000 + sum(map(ord, tipo)))
            orden[tipo] = list(rng.permutation(len(lista)))
        elegido, desde, dur = None, 0.0, None
        for _ in range(len(lista)):
            k = orden[tipo].pop(0)
            orden[tipo].append(k)
            rel = lista[k]
            if rel in usados[-2:]:
                continue
            d = info[rel]
            if tipo == "tecleo":
                quiere = max(0.4, float(e.get("dur") or 1.2))
                ok = [t for t in d["tramos"] if t[1] - t[0] >= quiere + 0.1]
                if not ok:
                    continue
                tr = ok[(i * 7) % len(ok)]
                hueco = tr[1] - tr[0] - quiere
                desde = round(tr[0] + (hueco * ((i * 0.37) % 1.0)), 2)
                dur, inicio = quiere, e["en"]
            else:
                inicio = e["en"] - d["pico"]
                if inicio < 0:
                    continue
                dur = min(d["dur"], TOPE.get(tipo, d["dur"]), dur_reel - inicio)
            elegido = rel
            break
        if not elegido:
            silencios.append((e["en"], tipo, "ningún archivo encaja (repetido, pico tardío o tecleo demasiado largo)"))
            continue
        d = info[elegido]
        rel_db = float(np.clip(20 * np.log10(max(1e-3, e["vol"]) / base.get(tipo, e["vol"])), -4, 4)) if tipo in base else 0.0
        objetivo = VOZ + NIVEL[tipo] + rel_db
        if tipo not in ("tecleo",) and NIVEL[tipo] >= -11 and habla(e["en"]):
            objetivo -= 2  # cae encima de una palabra: un poco más bajo para no taparla
        gan_db = objetivo - d["nivel"]
        vol = float(min(1.0, 10 ** (gan_db / 20)))
        cues.append({
            "en": round(e["en"], 3), "inicio": round(inicio, 3), "archivo": elegido, "desde": desde,
            "dur": round(dur, 3), "vol": round(vol, 4), "tipo": tipo, "fuerte": tipo in FUERTES,
            "fundido": 0.25 if (tipo == "tecleo" or dur < d["dur"] - 0.05) else 0,
            "db_voz": round(objetivo - VOZ + (20 * np.log10(vol) - gan_db), 1),
        })
        usados.append(elegido)
        if tipo in MOVIMIENTO:
            ult_mov = e["en"]

    # copiar solo los usados (con su carpeta y nombre originales)
    dst_base = os.path.join(ROOT, "public", "sfx")
    for rel in sorted(set(usados)):
        dst = os.path.join(dst_base, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if not os.path.isfile(dst) or os.path.getsize(dst) != os.path.getsize(os.path.join(repo, rel)):
            shutil.copy2(os.path.join(repo, rel), dst)

    nn = f"{N:02d}"
    out_cues = os.path.join(ROOT, "public", "episodios", f"ep-{nn}", "cues.json")
    os.makedirs(os.path.dirname(out_cues), exist_ok=True)
    json.dump({"libreria": "joakognz/sonidos-videos", "commit": commit, "voz_lufs": round(VOZ, 1), "cues": cues},
              open(out_cues, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    # informe: lista momento → archivo y los momentos que hay que escuchar
    mmss = lambda t: f"{int(t // 60)}:{t % 60:04.1f}"
    lin = [f"Efectos del EP.{N} · librería joakognz/sonidos-videos @ {commit} · {len(cues)} sonidos, "
           f"{len(set(usados))} archivos distintos · voz {VOZ:.1f} LUFS", ""]
    lin += [f"{mmss(c['en']):>7}  {c['tipo']:<10} {c['archivo']}" + (f"  (desde {c['desde']:.2f} s, {c['dur']:.1f} s)" if c["tipo"] == "tecleo" else "")
            for c in cues]
    if silencios:
        lin += ["", "En silencio (no hay sonido adecuado):"] + [f"{mmss(t):>7}  {ti:<10} {r}" for t, ti, r in silencios]
    if descartes:
        lin += ["", f"Quitados para no amontonar: {len(descartes)}"] + [f"{mmss(t):>7}  {ti:<10} {r}" for t, ti, r in descartes]
    # cinco momentos para escuchar con atención: los efectos más fuertes que caen sobre la voz y los racimos
    riesgo = []
    for k, c in enumerate(cues):
        vecinos = sum(1 for o in cues if o is not c and o["tipo"] != "tecleo" and abs(o["en"] - c["en"]) < 0.6)
        riesgo.append((c["db_voz"] + (4 if habla(c["en"]) else 0) + 2 * vecinos, c))
    riesgo.sort(key=lambda r: -r[0])
    vistos, top = [], []
    for _, c in riesgo:
        if all(abs(c["en"] - v) > 2 for v in vistos):
            vistos.append(c["en"])
            top.append(c)
        if len(top) == 5:
            break
    lin += ["", "Escucha estos cinco momentos (los que más riesgo tienen de tapar la voz o de amontonarse):"]
    lin += [f"{mmss(c['en']):>7}  {c['tipo']:<10} {c['archivo']}" for c in sorted(top, key=lambda c: c["en"])]
    informe = os.path.join(ROOT, "out", f"claude-code-ep-{nn}.sonidos.txt")
    os.makedirs(os.path.dirname(informe), exist_ok=True)
    open(informe, "w", encoding="utf-8").write("\n".join(lin) + "\n")
    print(f"  {len(cues)} efectos con {len(set(usados))} archivos de la librería · {len(silencios)} en silencio · "
          f"{len(descartes)} quitados para no amontonar")
    print(f"  → {os.path.relpath(out_cues, ROOT)} · {os.path.relpath(informe, ROOT)}")


if __name__ == "__main__":
    main()
