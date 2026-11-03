# Reel AIgencyx Labs: «Dos lápices que no se tocan»

**Duración:** 42,23 s (1.267 frames) · 1080x1920 · 30 fps · -14 LUFS.
**Concepto:** el mismo mecanismo que «Globo que no existe»: 7 s de cuenta atrás sin voz, imagen congelada, revelación («no existen»), y del 3D se pasa a la automatización del negocio. Aquí el objeto son dos lápices afilados, uno contra otro, que frenan en seco a un pelo de tocarse.
**Estilo (v2, realismo máximo):** la cuenta atrás es **path tracing en Blender/Cycles** (no WebGL), como un plano de estudio de cámara lenta: dos lápices de madera natural sin pintar, fondo de estudio gris carbón desenfocado, teleobjetivo macro en un slider motorizado. Luz de estudio real (softbox grande delante a la izquierda, dos tiras de contraluz, relleno, cenital), profundidad de campo y motion blur físicos. Madera con veta recta en las caras cepilladas, poros, grietas de secado y un nudo; el cono afilado con la fibra desgarrada y pelitos sueltos (partículas de pelo reales en Cycles), la línea de cola junto a la mina; grafito gris satinado con estrías finas. Después se revela como wireframe naranja (three.js, misma cámara). Sin rojo, azul ni verde fuera del fondo neutro.
**Voz:** una sola toma de ElevenLabs (Martin Osborne, Deep and Passionate, v4), usada entera. Empieza con voz a los 0,070 s, así que se coloca a los 6,930 s para que el primer fonema caiga justo en el frame 210 (7,000 s).

## Guion (el MP3 tal cual)
```
Llevas siete segundos esperando a que estos dos lápices se toquen.
No se van a tocar. Porque no existen.
No hay madera, ni grafito, ni cámara. Los ha dibujado un ordenador.
Y aun así, no has dejado de mirar.
Eso es lo que hace la tecnología bien hecha: que no sepas que está ahí.
En tu negocio seguro que aún hay cosas que se hacen a lápiz: citas, pedidos, facturas.
En AIgencyx Labs hacemos que se hagan solas.
Comenta auditoría y te decimos por dónde empezar.
```
Las pausas de la toma dan 12 tramos que forman las 8 frases. «citas / pedidos / facturas» van anclados a las pausas de las comas.

## Escenas

| Bloque / escena | Tiempo | Voz | En pantalla | Transición |
|---|---|---|---|---|
| A · Cuenta atrás | 0–7,0 s | — | **196 fotogramas renderizados en Cycles.** Encuadre como la referencia (puntas, conos y parte del cuerpo) y un empuje continuo de slider (×2,6, con un ligero giro para el paralaje) hasta ver los dos conos enteros. Las puntas se acercan cada vez más deprisa y **desde el frame 184 frenan en seco** hasta quedar a 0,12 mm. Congelado en el frame 195. Contador 196 → 001, un número por frame, a la derecha del hueco | — |
| 1 | 7,0–11,2 s | Llevas siete segundos esperando… | Imagen congelada. «Llevas **7** segundos esperando / a que se **toquen**» | corte seco |
| 2 | 11,2–14,5 s | No se van a tocar. Porque no existen. | Aparece una cota naranja que marca el hueco. En «existen» (13,47 s): glitch de 6 frames y los lápices pasan a wireframe naranja con una onda | glitch |
| 3 | 14,5–19,3 s | No hay madera, ni grafito, ni cámara. Los ha dibujado un ordenador. | La malla se redibuja desde las puntas hacia fuera. Etiquetas MADERA · GRAFITO · CÁMARA tachadas en su palabra. «Los ha dibujado / un **ordenador**» | barrido de rejilla |
| 4 | 19,3–21,7 s | Y aun así, no has dejado de mirar. | La malla se calma, la cámara gira y se aleja, y el código de tiempo vuelve a correr. «Y aun así, / sigues **mirando**» | (continuo) |
| 5 | 21,7–26,3 s | Eso es lo que hace la tecnología bien hecha: que no sepas que está ahí. | Zoom out hasta los lápices enteros. En «que no sepas…» la malla se vuelve gris y casi desaparece. «La tecnología / **bien hecha**» → «que no sepas / que **está ahí**» | zoom |
| 6 | 26,3–32,1 s | En tu negocio… a lápiz: citas, pedidos, facturas. | Tres huecos punteados. Cada ficha (CITAS, PEDIDOS, FACTURAS) entra en su palabra, con un lápiz gris («a mano»). «Cosas que se hacen / a **lápiz**» | barrido de rejilla |
| 7 | 32,1–35,1 s | En AIgencyx Labs hacemos que se hagan solas. | Los lápices desaparecen, las fichas se unen y un pulso naranja las recorre solo, marcando cada una con un check. «Hacemos que / se hagan **solas**» | (continuo) |
| 8 | 35,1–40,3 s | Comenta auditoría y te decimos por dónde empezar. | Campo de comentario que escribe AUDITORIA y se envía. «Comenta / **AUDITORIA**» + «POR DÓNDE EMPEZAR →» | glitch |
| C · Cierre | 40,3–42,2 s | — | Apagón CRT, logo y @aigencyx.labs; en el último segundo, el motivo de apertura para el bucle | CRT |

## Decisiones
- **Por qué Blender:** el realismo que pedías (fibras, grietas, luz de estudio, desenfoque real) no se consigue con WebGL por software. Instalé Blender 5.2 como módulo de Python (`bpy`, desde PyPI) y renderizo la cuenta atrás en Cycles por CPU (32 muestras + denoiser OIDN, 27 s/fotograma, 89 min en total; el fotograma congelado, que se ve 7 s, va a 128 muestras y sin motion blur, como un still nítido de cámara de alta velocidad). El fondo de estudio se compone aparte (PNG precalculado con un ligero paralaje) para no gastar muestras en un desenfoque.
- **Texturas precalculadas** (`scripts/make_pencil_textures.py`, 6144² por lápiz): para cada texel se calcula el punto 3D real de la superficie y ahí la madera (anillos alrededor de una médula desplazada → franjas rectas en las caras y arcos en el cono), fibras, poros, grietas, nudo, fibra desgarrada del corte, línea de cola y grafito. Color + mapa de normales + rugosidad/metal/sheen. Sin sombreado procedural en el render.
- **Proporciones como tu referencia:** cono más corto (14 mm) y mina de 2,4 mm.
- **Geometría del lápiz:** hexágono de aristas redondeadas ∩ cono afilado; el eje del sacapuntas va ligeramente descentrado y el corte tiene una pequeña ondulación, así que los festones salen desiguales, como en un lápiz real. Punta roma (perfil hiperbólico).
- **Frenazo:** la velocidad del acercamiento sigue siendo alta en el frame 184. Desde ahí frena con deceleración constante hasta pararse justo en el congelado. Suena un chirrido que baja de tono y un clic seco.
- **Música:** la «tensión» se mide en escala logarítmica del hueco (los últimos milímetros cuentan más). Sonoridad de -28 a unos -12 LUFS al final; la mezcla a -14 LUFS.
- **Contador** a la derecha del hueco en vez de debajo, para no tapar las puntas, que son el protagonista.
- **Rótulos en dos niveles** (línea pequeña + remate grande en negrita), como en la v3 del globo. En la escena 4 el rótulo dice «sigues mirando» (la voz dice «no has dejado de mirar», 5 palabras por línea serían demasiadas).
- La marca no aparece en los rótulos; solo la dice la voz y aparece en el cierre.

## Pendiente de comprobar (tú)
1. Cómo pronuncia la voz «AIgencyx» (25,55–26,09 s del MP3; 32,5–33,0 s del vídeo).
2. «auditoría» dura casi 2 s en la toma, así que el tecleo de AUDITORIA va a un ritmo fijo de 0,09 s por letra y «Enviar» se pulsa justo al acabar de escribir.
3. Que el contador a la derecha no choque con la interfaz de Instagram (botones laterales a partir de unos 1.100 px de alto; el contador queda entre 716 y 930 px).

## Pipeline
```
python scripts/align.py ../audio/raw/lapices-no-se-tocan/6b325a6c-*.mp3
python scripts/make_assets.py              # grano + fondo de estudio
python scripts/build.py                    # curvas, cámara compartida, mezcla
python scripts/make_pencil_textures.py     # texturas de los lápices (6144²)
<python con bpy> scripts/blender_lapices.py --frames 0-195 --samples 32   # placas Cycles → public/plates
bash scripts/render.sh 12 4 out/reel-lapices-no-se-tocan.mp4
python scripts/qa.py out/reel-lapices-no-se-tocan.mp4 out/qa
```
