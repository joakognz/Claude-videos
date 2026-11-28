# Claude-videos · reels de AIgencyx Labs

Reels verticales para Instagram (@aigencyx.labs). El usuario es CEO de AIgencyx Labs (IA para pymes y negocios
locales), habla español de España y no es técnico: decide tú lo razonable, explícale lo justo y escríbele en español.

- `serie-claude-code/`: la serie **«Máster de Claude Code»** (50 episodios) en Remotion. Es lo principal; está todo abajo.
- `reel-*/`: reels sueltos, cada uno con su proyecto. Su plantilla es `briefs/plantilla-reel-remotion.md` y su estilo
  de marca es otro (naranja #FF6B1A, Three.js isométrico).
- `briefs/`: ficha de cada reel o episodio · `entregas/`: los mp4 finales · `audio/raw/`: tomas originales de voz.
- `briefs/esquemas/`: los esquemas de cada episodio (las láminas que promete el CTA, que ahora viven en el link de la bio), con el estilo del usuario, sus
  referencias y la plantilla para hacer uno nuevo (ver `_LEEME.md`).
- **Biblioteca de logos e imágenes (para todo el repositorio):** `serie-claude-code/public/logos/` (índice en
  `_LEEME_LOGOS.md`, muestrario en `_muestrario.png`) y `serie-claude-code/public/imagenes/` (`_LEEME_IMAGENES.md`).
  Antes de pedirle un logo al usuario, búscalo ahí. Cuando te pase uno nuevo, guárdalo ahí y súbelo, para que ninguna
  sesión tenga que volver a pedirlo.

## Serie «Máster de Claude Code»

Resume un curso de Claude Code en formato tutorial. Si el usuario pide un episodio, un guion o un prompt de la serie,
usa también su skill `episodio-master-reels`, si la tienes (guion, bloque de voz, prompt maestro, tabla de logos).
Este archivo cuenta lo que vive en el repositorio.

### Estado
| EP | Lección | Dónde |
|---|---|---|
| 01 Qué es Claude Code | 0.1 | `episodios/ep-01.json` (composición antigua «Episodio») · `entregas/serie-claude-code-ep-01.mp4` |
| 02 VS Code, GitHub, PUSH y PULL | 0.2 | `episodios/ep-02.json` (composición «Master») · `entregas/serie-claude-code-ep-02.mp4` |
| 03 Proyectos, instalación y extensiones (2 partes) | 0.3–0.5 | rama `claude/remotion-master-claude-ep3-jykszo` |
| 04 Meta, etapas y costes (2 partes) | 0.7–0.9 | rama `claude/pensive-gates-1di7iv` |
| 05 CLAUDE.md e /init | 1.1 | rama `claude/ecstatic-clarke-w4sggd` |
| 06 Prompting maestro | 1.3 | rama `claude/hopeful-gauss-ztxf8y` |
| 07 Cambios y correcciones | 1.4 | rama `claude/clever-hopper-qupljb` |
| 08 Errores típicos y troubleshooting | 1.5 | `episodios/ep-08.json` · `entregas/serie-claude-code-ep-08.mp4` · `briefs/serie-claude-code-ep-08/` |
| 09 Nivel experto (2 partes) | 1.6 | rama `claude/episodio-9-guion-logos-z4h3v9` |
| 10 El mapa completo | 1.7 | no está en GitHub |
| 11 Variantes infinitas | 1.8 | rama `claude/funny-faraday-ckjnww` (reel de prueba) |
| 12 Computer Use | 1.9 | `episodios/ep-12.json` · `entregas/serie-claude-code-ep-12.mp4` · `briefs/serie-claude-code-ep-12/` |
| 13 Cierre del módulo 1 y votación | — | `episodios/ep-13.json` · `entregas/serie-claude-code-ep-13.mp4` · `briefs/serie-claude-code-ep-13/` |
| 13 v2 Gracias y votación (5 opciones) | — | `episodios/ep-13-v2.json` (bloques `ep13b_*`) · `entregas/serie-claude-code-ep-13-v2.mp4` · `briefs/serie-claude-code-ep-13/v2/` |

Cada episodio se hizo en su propia rama: para leer uno, `git fetch origin <rama>` y
`git show origin/<rama>:briefs/serie-claude-code-ep-NN/...`. Siguiente: EP14, primer episodio del módulo 2. Su tema es
la opción más votada en los comentarios del EP13 v2 (APPS, AUTO, WEB, ESCALAR o SEGURIDAD): pregúntaselo al usuario.

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
- **Sonidos (desde el EP.13 v2):** solo de la librería del usuario (repo privado `joakognz/sonidos-videos`, clónalo
  con `add_repo`). `"sonidos": "libreria"` en el JSON; los bloques piden grupos con `cue(t, grupo, qué, nivel)` y
  `src/master/sfx.ts` elige el archivo (pico en el evento, sin repetir, sin dos woosh seguidos).
  `python scripts/sfx_libreria.py <librería>` copia los usados a `public/sfx/`; `scripts/cues.py` comprueba y lista.
- `"carpeta": "ep-13-v2"` en el JSON permite otra versión de un episodio sin pisar la anterior.
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
  Code con el panel de Claude Code. Del EP.12: `Elemento3D` (las mini animaciones 3D del usuario, en
  `public/elementos3d/`, sacadas de su vídeo de muestra con `scripts/elementos3d.py`), `Ventana` (navegador) y las
  pantallas de Google Cloud, la API de Gmail, la verificación de la cuenta y el panel de Claude Code. Del EP.13
  (`componentes/ep13/Piezas13.tsx`): `Carta` (carta 9:16 que se da la vuelta y enseña una ilustración),
  `CajaHerramientas` (se abre, recibe piezas que caen dentro y se cierra), `FilaModulo`, `EditorFlujo` (editor de
  automatizaciones recreado, con nodos, conexiones y un pedido que viaja) y `Comentario` (caja de comentario de Instagram).

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
  `_muestrario.png`). Hay 49: AIgencyx (oscuro, naranja, naranja grande y claro), Claude, Claude Code (mascota y
  rótulo), Anthropic, Visual Studio Code, Word, Microsoft, Drive, Gmail, Google Sheets, Google Cloud, Chrome, GitHub
  (gato, círculo y rótulo), Copilot, git, npm, WhatsApp, Gemini, Codex, Next.js, Vite, Tailwind, Vercel, Netlify,
  Cloudflare Pages, Hostinger, n8n, Make, Airtable, MCP, PHP, Astro, AWS, Node.js, Live Server, YouTube y WordPress.
  Nunca se redibujan ni se inventan. Si falta uno, se pide con su nombre `logo_xxx` y se espera. Los nuevos se
  guardan en `_originales/` y se les quita el fondo con `scripts/logo_sin_fondo.py`. Los logos oscuros van sobre
  tarjeta clara (`ficha="tarjeta"`).
- **Iconos e imágenes:** los iconos propios en SVG están en `public/iconos/` (ver `_LEEME_ICONOS.md`); los iconos
  dibujados del usuario (cronómetro, mano, marcador, matraz, tecla Esc, normales y en pegatina), en
  `public/iconos/usuario/`; y sus ilustraciones (floristería, panadería y las tres opciones del EP.13: web,
  automatización y a medida), en `public/imagenes/` (ver `_LEEME_IMAGENES.md`). Las capturas de
  `public/imagenes/referencias/` son solo modelo para recrear pantallas.
- **Nunca copiar el vídeo del curso:** otra estructura, otras metáforas, otros ejemplos (otro tipo de negocio) y otras
  frases. Las pantallas se recrean con datos ficticios.
- **Voz** (texto para el generador): números en letras, «CLAUDE punto M D», «Visual Studio Code» completo, frases
  cortas, tuteo, sin precios. Arranque «Episodio N de cincuenta. Máster de Claude Code.» y pasos «Paso uno…». CTA
  fijo (desde el EP.14): **ya no se pasa el enlace por mensaje privado**; todo está en el link de la biografía
  (un enlace que lleva a más enlaces). Se mantiene pedir el comentario, porque los comentarios alimentan el
  algoritmo: «¿Quieres los esquemas de este episodio? Comenta AUDITORIA y te respondo con el enlace. Lo tienes
  siempre en el link de mi bio. Y si tienes un negocio, te preparamos una auditoría para optimizar tus procesos.»
  Nunca decir «te paso el enlace», «te lo mando por privado» ni «te escribo».
  Cierre: «En el siguiente episodio, [tema]. Sígueme para no perdértelo.»
- **CTA antiguo (EP.1 a EP.13):** esos vídeos dicen «Comenta AUDITORIA y te paso el enlace». No se regrabaron. Al
  publicarlos: fijar un comentario propio («Todo lo del episodio, esquemas incluidos, está en el link de mi bio 👆»),
  responder en público a los dos o tres primeros comentarios («¡Hecho! Lo tienes en el link de mi bio 🔗») y poner
  en la descripción una línea que diga que todo está en el link de la bio.
- **Bio de Instagram (@aigencyx.labs):** «IA y automatización para negocios locales y pymes. / Esquemas del Máster de
  Claude Code 👇 / Mini auditoría gratis en el link». El enlace de la bio es una página (carrd) con los botones
  «Mini auditoría gratis» y «Esquemas del Máster». No hay que prometer mensajes privados en ningún sitio.
- **Datos:** no inventes cifras. Comprueba los datos técnicos (p. ej. los códigos de error con la skill `claude-api`).
- **Voz de ElevenLabs:** EP.1 y EP.2 con «Manu Gordillo» v4. La del EP.8 es v4 con stability 50 y similarity 75,
  según el nombre del archivo.

### Trampas ya vistas
- Las sesiones nuevas abren la rama principal del repositorio (`claude/script-to-mp3-animation-pukyip`). Lo que se
  guarda solo en la rama de una sesión no lo ve la siguiente: por eso los logos acababan repartidos y había que
  pedirlos otra vez. Lo común (logos, imágenes, plantilla, CLAUDE.md) tiene que llegar a la rama principal.
- Al teclear una URL al ritmo de la voz, termina en ~1 s y carga la página: si no, se ve una pantalla vacía.
- Cuando la cámara se acerca, comprueba que no corte los bordes de una ventana: con zoom z, el ancho visible es 1080/z.
- Las caras de texto del cartel ajustan la letra a la longitud. Si añades textos largos, compruébalos en un fotograma.
- `L.en` ignora tildes y signos: «Tú» encuentra antes el «tu» de «tu ratón». Busca una frase («Tú lo ves»).
- Los clips con transparencia hacen el render más lento y pesado: renderiza con `CONCURRENCIA=3`.
- `preparar.py` ancla el texto del guion a la voz. Si ancla muchas menos palabras de las que tiene el guion, la voz
  no coincide con el guion: revisa el texto de las escenas.
