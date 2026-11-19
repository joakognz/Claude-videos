# Claude-videos · reels de AIgencyx Labs

Reels verticales para Instagram (@aigencyx.labs). El usuario es CEO de AIgencyx Labs (IA para pymes y negocios
locales), habla español de España y no es técnico: decide tú lo razonable, explícale lo justo y escríbele en español.

- `serie-claude-code/`: la serie **«Máster de Claude Code»** (50 episodios) en Remotion. Es lo principal; está todo abajo.
- `reel-*/`: reels sueltos, cada uno con su proyecto. Su plantilla es `briefs/plantilla-reel-remotion.md` y su estilo
  de marca es otro (naranja #FF6B1A, Three.js isométrico).
- `briefs/`: ficha de cada reel o episodio · `entregas/`: los mp4 finales · `audio/raw/`: tomas originales de voz.

## Serie «Máster de Claude Code»

Resume un curso de Claude Code en formato tutorial. Si el usuario pide un episodio, un guion o un prompt de la serie,
usa también su skill `episodio-master-reels`, si la tienes (guion, bloque de voz, prompt maestro, tabla de logos).
Este archivo cuenta lo que vive en el repositorio.

### Estado
| EP | Lección | Dónde |
|---|---|---|
| 01 Qué es Claude Code | 0.1 | `episodios/ep-01.json` (composición antigua «Episodio») · `entregas/serie-claude-code-ep-01.mp4` |
| 02 VS Code, GitHub, PUSH y PULL | 0.2 | `episodios/ep-02.json` (composición «Master») · `entregas/serie-claude-code-ep-02.mp4` |
| 03–07 | 0.3–1.4 | no están en este repositorio (hechos en la carpeta del usuario) |
| 08 Errores típicos y troubleshooting | 1.5 | `episodios/ep-08.json` · `entregas/serie-claude-code-ep-08.mp4` · `briefs/serie-claude-code-ep-08/` |
| 12 Computer Use | 1.9 | en curso: intro nueva hecha (`bloques/ep12/Intro12.tsx`, prueba sin voz); falta guion y voz |

Hoja de ruta: EP09 Nivel experto (1.6, probable 2 partes) · EP10 El mapa completo (1.7) · EP11 Variantes infinitas (1.8) ·
EP12 Computer Use (1.9) · EP13 Cierre del módulo 1: pregunta a la audiencia (web / automatizaciones / a medida).

### Cómo se hace un episodio aquí
Material: la voz en MP3 (de ElevenLabs, la genera el usuario), el documento o esquema de la lección y, si hay, el
vídeo del curso, **solo como referencia**. El vídeo del curso nunca entra en el reel.
```bash
cd serie-claude-code
npm ci                                                    # una vez por sesión
pip install numpy scipy pyloudnorm sherpa-onnx soundfile   # una vez por sesión
# modelo de reconocimiento local (490 MB, se descarga en cada sesión; guárdalo en el scratchpad, no en el repositorio):
#   https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8.tar.bz2
# 1) episodios/ep-NN.json: "escenas" con el texto exacto de la voz (con cifras: «401», «platform.claude.com»…)
#    y "bloques" (tipo + escena de inicio). Copia el MP3 a ../audio/raw/serie-claude-code/ep-NN.mp3
#    Añade 1 s de silencio al final (ffmpeg -af apad=pad_dur=1.0) para que el botón «Seguir» termine.
python scripts/preparar.py episodios/ep-NN.json --mp3 ../audio/raw/serie-claude-code/ep-NN_montaje.mp3 --modelo <carpeta del modelo>
node scripts/fotogramas.mjs episodios/ep-NN.json 5 20 40 …   # revisar fotogramas sueltos (rápido)
node scripts/render-lote.mjs episodios/ep-NN.json            # render final → out/claude-code-ep-NN.mp4 (unos 4 min)
python scripts/qa_master.py episodios/ep-NN.json out/claude-code-ep-NN.mp4   # todo en verde
cp out/claude-code-ep-NN.mp4 ../entregas/serie-claude-code-ep-NN.mp4
```
- La máquina tiene 4 núcleos: no pongas `CONCURRENCIA` por encima de 4 (el valor por defecto ya va bien).
- La voz no se sube a ningún servicio: los tiempos por palabra salen del reconocedor local.
- Revisa siempre con fotogramas sueltos antes del render y un fotograma cada 2,5 s después.
- Ficha del episodio en `briefs/serie-claude-code-ep-NN/` (voz, prompt maestro, tomas, logos, caption, NOTAS).

### Plantilla «Master» (`serie-claude-code/src/master/`)
- Bloques comunes en `bloques/` (intro, conseguir, ide, analogia, pushpull, proximo, cta). Cuando un episodio
  necesita escenas propias, van en `bloques/epNN/` y sus piezas en `componentes/epNN/`, registradas en
  `bloques/index.ts` con prefijo (`ep8_gancho`…). Así los episodios anteriores no cambian.
- Todo depende del tiempo `t`, y los momentos salen de las palabras de la voz: `L.en(escena, "palabra")`.
  **Ojo:** devuelve la primera vez que sale esa palabra en la escena. Si se repite (`en`, `la`, `qué`), busca una frase
  (`L.en("escape", "«en la web")`) o pasa el número de aparición (`L.en("tienda", "qué", 1)`).
- La cámara (`Toma[]`) encuadra el lienzo. La zona útil está entre y=640 y y=1580 de pantalla: arriba van los
  subtítulos y abajo la interfaz de Instagram.
- Piezas reutilizables: `Sello` (PASO N), `Etiqueta`, `Logo`, `Flecha`, `Rejilla` (las 50 casillas), `Cursor`, `Toque`
  y `Editor`. Del EP.8: `Cartel` (cartel colgante que gira de cara), `Dibujos` y `Pantallas`. Las pantallas son
  recreaciones con datos ficticios de la consola de Claude, los límites de uso, la página de estado y Visual Studio
  Code con el panel de Claude Code.

### Reglas fijas
- **Estilo:** fondo #0B0D12, acento coral #D97757, texto blanco. Tipos: Sora (títulos), Inter (subtítulos) y
  JetBrains Mono (código). 1080x1920 a 30 fps.
- **Composición:** intro con la cuadrícula de 50 casillas (máx. 4 s). El EP.12 estrena otra: abre con el gancho (el
  navegador trabaja solo) y el título sale como una página en ese navegador (`ep12_intro`). Subtítulos arriba, palabra a palabra, con la
  activa en caja coral (máx. 2 líneas). Insignia EP.N/50 arriba a la izquierda y @aigencyx.labs arriba a la derecha.
- **Música:** -20 dB y -8 dB más bajo la voz. Sonoridad final de -14 LUFS, pico por debajo de -1 dBTP.
- **Movimiento:** como mucho 3 s sin un cambio visible. Solo `spring`, `interpolate` y `Easing`: nada de CSS
  transitions ni `setTimeout`.
- **Logos:** solo los archivos del usuario (`serie-claude-code/public/logos/`, ver `_LEEME_LOGOS.md` y
  `_muestrario.png`). Hay 39: Claude, Claude Code (mascota y rótulo), Anthropic, Visual Studio Code, Word, Microsoft,
  Drive, GitHub (gato, círculo y rótulo), Copilot, git, npm, WhatsApp, Gemini, Codex, Next.js, Vite, Tailwind, Vercel,
  Netlify, Cloudflare Pages, n8n, PHP, Astro, AWS, Node.js, Live Server, YouTube, WordPress, Chrome y AIgencyx (oscuro,
  naranja y claro). Falta hostinger.
  Nunca se redibujan ni se inventan. Si falta uno, se pide con su nombre `logo_xxx` y se espera. Los nuevos se
  guardan en `_originales/` y se les quita el fondo con `scripts/logo_sin_fondo.py`. Los logos oscuros van sobre
  tarjeta clara (`ficha="tarjeta"`).
- **Iconos e imágenes:** los iconos propios en SVG están en `public/iconos/` (ver `_LEEME_ICONOS.md`); los iconos
  dibujados del usuario (cronómetro, mano, marcador, matraz, tecla Esc, normales y en pegatina), en
  `public/iconos/usuario/`; y sus ilustraciones o fotos de ejemplo (la floristería), en `public/imagenes/`.
- **Nunca copiar el vídeo del curso:** otra estructura, otras metáforas, otros ejemplos (otro tipo de negocio) y otras
  frases. Las pantallas se recrean con datos ficticios.
- **Voz** (texto para el generador): números en letras, «CLAUDE punto M D», «Visual Studio Code» completo, frases
  cortas, tuteo, sin precios. Arranque «Episodio N de cincuenta. Máster de Claude Code.» y pasos «Paso uno…». CTA
  fijo: «¿Quieres los esquemas de este episodio? Comenta AUDITORIA y te paso el enlace con todo. Y si tienes un
  negocio, te preparamos una auditoría para optimizar tus procesos.» Cierre: «En el siguiente episodio, [tema].
  Sígueme para no perdértelo.»
- **Datos:** no inventes cifras. Comprueba los datos técnicos (p. ej. los códigos de error con la skill `claude-api`).
- **Voz de ElevenLabs:** EP.1 y EP.2 con «Manu Gordillo» v4. La del EP.8 es v4 con stability 50 y similarity 75,
  según el nombre del archivo.

### Trampas ya vistas
- Al teclear una URL al ritmo de la voz, termina en ~1 s y carga la página: si no, se ve una pantalla vacía.
- Cuando la cámara se acerca, comprueba que no corte los bordes de una ventana: con zoom z, el ancho visible es 1080/z.
- Las caras de texto del cartel ajustan la letra a la longitud. Si añades textos largos, compruébalos en un fotograma.
- `preparar.py` ancla el texto del guion a la voz. Si ancla muchas menos palabras de las que tiene el guion, la voz
  no coincide con el guion: revisa el texto de las escenas.
