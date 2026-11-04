# Reel AIgencyx Labs: «La gota que no cae»

**Duración:** 41,87 s (1.256 frames) · 1080x1920 · 30 fps · −14 LUFS.
**Concepto:** el gancho de 7 s sin voz, como en «El clic» y «Lápices», pero filmado como una cámara de alta velocidad. Una gota se forma en la boca de un grifo de latón envejecido, el cuello se estrecha, se suelta y cae hacia su propio reflejo… y **se frena en seco a 1 mm del agua**, deformada por la caída. Mientras tanto, un contador «CAE EN» va de 196 a 001, un número por frame, y en el congelado pasa a «SUSPENDIDA». Suena un **tiiick agudo de "completado"** y no suena el impacto, porque nunca llega. Después se revela que nada existe: ni el agua, ni el grifo, ni el reflejo. Y se lleva al negocio: los clientes se escapan gota a gota por tres fugas y AIgencyx Labs las cierra.
**Estilo:** la cuenta atrás es **path tracing en Blender/Cycles** con geometría real (no texturas), en un estudio oscuro. La revelación es un wireframe naranja de la misma geometría, con la misma cámara. La parte de negocio es una tubería 2D en negro, gris y naranja. Sin rojo, azul ni verde; el agua, en neutros.
**Voz:** una sola toma de ElevenLabs (Martin Osborne, Polished and Intense, v4, speed 1.02, stability 50, similarity 75), entera. El primer fonema está a 0,12 s, así que el MP3 se coloca a los 6,88 s para que caiga justo en el frame 210 (7,000 s).
**Música:** sin música (no se adjuntó pista). La mezcla y el pipeline están preparados: si se deja una pista en `music/` con su minuto de inicio en `music/from.txt` (mm:ss), `build.py` la mete con fade in desde los 7 s, nivelada, con un hueco en 1,5–4,5 kHz, ducking de −9 dB bajo cada palabra, subida en el cierre y fuera en el último segundo. La versión sin música sale igualmente (`public/audio/mix_sinmusica.wav`).

## Guion (el MP3 tal cual)
```
¿Estabas esperando a que cayera? No va a caer.
Esa gota no existe: ni el agua, ni el grifo, ni su reflejo. Todo eso lo ha calculado un ordenador.
Y aun así, no podías dejar de mirarla.
Ahora piensa en tu negocio: el mensaje sin contestar, la llamada perdida, el presupuesto que nadie sigue… gota a gota, se te escapan clientes.
En AIgencyx Labs cerramos esas fugas, para que cada cliente llegue a donde tiene que llegar.
Comenta auditoría y te decimos por dónde se te escapan.
```
(Respecto al primer borrador, «Lo ha calculado todo un ordenador» pasa a «Todo eso lo ha calculado un ordenador», para evitar que se entienda como «todo un ordenador». La toma usa esta versión: se ve la *s* de «eso» en el espectro, a los 8,80 s del MP3.)

Alineado con el alineador propio (pausas + Viterbi). Las comas de «ni el agua, ni el grifo, ni su reflejo» y de «gota a gota, se te escapan» están **ancladas a mano** con el espectro y los formantes: la toma casi no respira en esas comas y el divisor automático cortaba en la *f* de «grifo» y de «reflejo».

## Escenas

| Bloque / escena | Tiempo | Voz | En pantalla | Sonido (cada uno en su frame) |
|---|---|---|---|---|
| A · Cuenta atrás | 0–7,0 s | — | **196 placas en Cycles** (0–195). La gota se hincha (perfiles de Young-Laplace, frames 0–117), se forma el cuello (118–147), **se suelta en el 148**, sale la gota satélite y cae. La cámara empuja en continuo hacia el punto de impacto. Desde el frame 184 el reloj de la escena se frena (tasa ·(1−u)²) y **en el 195 todo se congela** con la gota achatada a 1,000 mm del agua. Contador «CAE EN» 196 → 001 (−1 por frame) que late con el corazón; en el 195 pasa a «SUSPENDIDA» | Latido de 52 a 150 ppm (10 latidos, **el último en el frame 184**). Dron que se tensa. Resonancia de tensión superficial que sube con el cuello y crujidos al ceder. **Plip húmedo en el 148** y tic del satélite. Silbido de aire proporcional a la velocidad. Desde el 184 todo el colchón se **ralentiza y baja de tono** con el reloj. En el 195: **silencio seco + tiiick (3,1 kHz) + zumbido**. Sin impacto |
| 1 | 7,0–10,5 s | ¿Estabas esperando a que cayera? No va a caer. | Placa congelada (128 muestras, sin blur), REC parpadeando y timecode congelado. En «No» se dibuja una **cota naranja** entre la gota y el agua; en «caer», el rótulo «1 mm · HASTA EL AGUA» | calibre + línea que sube al dibujarse · clic del rótulo en «caer» |
| 2 | 10,5–15,3 s | Esa gota no existe: ni el agua, ni el grifo, ni su reflejo. | En «existe» (11,30 s), **glitch de 6 frames** y paso a wireframe naranja con la misma cámara (casa con la placa). La cámara se aleja hasta que entra la boca del grifo. **El agua se apaga en «agua», el grifo en «grifo» y la gota reflejada en «reflejo»**, cada uno con su etiqueta tachada | glitch · tres apagados (blip descendente) en su palabra |
| 3 | 15,3–17,7 s | Todo eso lo ha calculado un ordenador. | Todo se vuelve a encender; la cámara se aleja y gira a tres cuartos desde arriba. Cuatro anotaciones, cada una en su sílaba: **tensión superficial γ = 0,072 N/m** (Todo), **perfil de Young-Laplace** (cal-), **IOR 1,333** (-la-), **velocidad de caída v = 0,78 m/s** (ordenador; es la velocidad real de la gota en el congelado) | barrido de encendido · un tic por anotación |
| 4 | 17,7–20,7 s | Y aun así, no podías dejar de mirarla. | La cámara baja a ras de la malla del agua. En «mirarla» el reloj vuelve a correr: **la gota por fin cae** (1 mm), se funde y **abre anillos en la malla**; el satélite cae después y abre otros más pequeños | arranque de cinta · **plink con eco** en «-rar-» · plink pequeño del satélite |
| 5 | 20,7–30,9 s | Ahora piensa en tu negocio: el mensaje sin contestar, la llamada perdida, el presupuesto que nadie sigue… gota a gota, se te escapan clientes. | Barrido de rejilla. La tubería de INTERESADOS a CLIENTES se dibuja y empieza el flujo. Tres fugas, cada una con su etiqueta en su palabra: **SIN RESPUESTA** (mensaje) · **LLAMADA PERDIDA** (llamada) · **SIN SEGUIMIENTO** (presupuesto). Cada fuga gotea a su ritmo: cada gota cae, salpica, sale un «−1» y sube el contador «SE ESCAPAN». El flujo se debilita tras cada fuga y el depósito de CLIENTES **apenas sube** | barrido · pop por etiqueta · **un goteo por cada gota que toca el suelo**, en el mismo instante que en pantalla |
| 6 | 30,9–36,4 s | En AIgencyx Labs cerramos esas fugas, para que cada cliente llegue a donde tiene que llegar. | **Tres abrazaderas naranjas** sellan las fugas en ce-**RRA**-mos · **E**-sas · **FU**-gas y el goteo se corta. En «llegue» el flujo llega entero y el depósito se llena; en «llegar», ✓ en cada etiqueta | clamp metálico por abrazadera · flujo continuo · tono de llenado · tres ✓ |
| 7 · CTA | 36,4–39,9 s | Comenta auditoría y te decimos por dónde se te escapan. | Campo de comentario que escribe AUDITORIA letra a letra y se envía; «POR DÓNDE SE TE **ESCAPAN** →» en «por dónde» | glitch · una tecla por letra · envío |
| C · Cierre | 39,9–41,9 s | — | Apagón CRT, logo y @aigencyx.labs | crt |

## Decisiones
- **Física, no simulación** (`scripts/drop_geom.py`, `scripts/physics.py`). La gota colgante es la familia cuasiestática de **Young-Laplace** (dφ/ds = 2b − z − sinφ/x en unidades de longitud capilar, 2,71 mm), anclada en un círculo mojado de 2,4 mm bajo la rejilla. Volumen máximo: 90 µL. En el cuello, el radio mínimo baja como (1 − p)^0,6 (ley de pinzamiento). La gota libre arranca con la forma que tenía al soltarse, descompuesta en **modos de Legendre**, y oscila a las frecuencias de **Rayleigh** (ω₂ = 211 rad/s). El reloj se ha elegido para que llegue **achatada justo en el congelado** (3π/ω₂ = 44,6 ms de escena). La altura del grifo sale de la caída para que la gota quede a 1,000 mm del agua, contando la altura de los anillos bajo ella.
- **Reloj de escena:** la toma equivale a una cámara de **888 fps** reproducida a 30. Del frame 184 al 195 la tasa cae a cero, y con ella se frenan la gota, su oscilación, el satélite, el rebote del resto que queda en el grifo, los anillos, el polvo, la cámara y el sonido.
- **Modelado de verdad** (`scripts/blender_gota.py`):
  - El caño es un tubo barrido por una curva, con su extremo torneado y una **rosca M24×1 helicoidal real** (tres vueltas a la vista).
  - Junta de goma negra.
  - El aireador es un perfil de torno con labio, chaflanes gastados y **moleteado de 96 estrías en geometría**.
  - **Rejilla perforada** en malla hexagonal.
  - **Costra de cal** modelada en el labio interior y a parches en el canto exterior.
  - El latón lleva manchas de agua secas, pátina en los huecos (pointiness), aristas gastadas y brillantes, y arañazos finos.
- **Agua:** la gota colgante y el resto llevan una shape key por frame, y la gota libre su radio polar por frame (interpolación lineal para el motion blur). La superficie de la pila lleva los **trenes de anillos analíticos** de la gota anterior como normal exacta (dh/dr), con un reloj τ por frame. Hay polvo flotando sobre los anillos y unas motas en el aire. La pila es de pizarra negra con relieve de exfoliación, cantos mojados y gotas sobre el borde.
- **Luz:**
  - Una franja de horizonte detrás de la pila: el agua la refleja y la gota la refracta invertida.
  - Un softbox cenital detrás y arriba.
  - Una luz principal cuya ventana es el brillo nítido de la gota.
  - Dos tiras de perfil, una de ellas **naranja**.
  - Relleno bajo.
  - Cáusticas desactivadas y 12 rebotes de transmisión.
- **Render:** Cycles por CPU a **1080x1920 nativo**, 20 muestras + OIDN, motion blur real y profundidad de campo real (f/11 → f/20), unos 40 s por frame. El congelado (se ve 7 s) va a **128 muestras, sin blur**. Composición del congelado: gota en el tercio superior y reflejo en el centro, para que los rótulos no tapen nada.
- **Wireframe** (`scripts/export_wire.py`): la misma geometría y la pose exacta del frame 195 como segmentos explícitos (quads, sin diagonales ni EdgesGeometry), con ejes Blender → three (x, z, −y). El agua es una malla polar con la altura de los mismos anillos (exagerada ×9) más los anillos nuevos del impacto. El reflejo es la gota espejada en el plano del agua.
- **Sonido diseñado desde los números:** latidos construidos hacia atrás desde el frenazo, plip en el frame del pinzamiento, silbido proporcional a la velocidad, colchón ralentizado con el reloj, goteos en el instante exacto en que cada gota 2D toca el suelo, clamps por sílaba y tecleo letra a letra.
- **Marca:** solo en la voz y en el cierre. El rótulo de la escena 6 empieza en «cerramos».
- **Cortes del render en trozos:** cada trozo arranca con un fotograma clave nuevo, y sobre una imagen quieta eso se nota como un leve parpadeo. `render.sh` mueve los cortes que caerían en un tramo quieto (el congelado, la cota, los apagados) al frame en que la imagen cambia de todos modos: el congelado (195), «existe» (339) y «reflejo» (431). Así los frames 195–209 salen idénticos también después de codificar.

## QA (pasado)
`scripts/qa.py` sobre `entregas/reel-gota-que-no-cae.mp4`, con los 12 controles en verde:
- **Formato y duración:** 1080x1920, 30 fps, H.264 + AAC 48 kHz, 41,87 s.
- **Sonoridad:** −14,1 LUFS integrados, pico real −2,8 dBTP tras el AAC.
- **Congelado:** frames 195–209 idénticos salvo el REC (0,001 % de píxeles cambiados). La imagen se mantiene hasta la cota y, con la cota, hasta «existe».
- **Contador:** 196 → 001 de uno en uno. El frenazo arranca en el frame 184 y la gota queda a 1,000 mm del agua.
- **Voz:** el primer fonema cae en el frame 210,00 (7,000 s).
- **Sonido:** la cuenta atrás sube de −19,7 a −9,8 dB. El tiiick va en el congelado (6,50 s) y no hay ningún impacto antes de «mirarla».
- **Zonas seguras:** nada informativo fuera de 250–1580 px.
- **Wireframe:** aparece en «existe» (frame 339) y no antes.

Las hojas de contacto (un frame cada 0,5 s) se han revisado una a una.

`entregas/reel-gota-que-no-cae-sin-musica.mp4` es el mismo archivo, porque no hay música. Si se añade una pista, la versión con música será la que cambie.

## Pendiente de comprobar (tú)
1. **Pronunciación de «AIgencyx»** en la toma: 24,29–24,86 s del MP3 (31,17–31,74 s del vídeo).
2. **Música:** el reel va sin música porque no venía adjunta. Si quieres una pista, pásamela con su minuto de inicio y la mezclo (es solo remezcla + remux). Si es comercial, ojo con los derechos en una cuenta de empresa: Instagram puede silenciarla o reclamarla.
3. **Contador vs botones de Instagram:** el contador está abajo a la derecha (1290–1506 px), dentro de la zona segura pero cerca de los botones laterales. Revisa en el móvil que no choque.

## Pipeline
```
python scripts/align.py ../audio/raw/gota-que-no-cae/a47736cf-*.mp3   # palabras (+ anclas manuales)
python scripts/make_assets.py              # grano
python scripts/make_textures.py            # manchas/pátina/arañazos del latón, cal (public/plates_src)
python scripts/build.py                    # física (timeline-gota.json, gota_frames.npz), timeline, mezclas
bash scripts/render_plates.sh <python con bpy> 20                 # placas Cycles 0–194 (tramos <1 h, log en logs/plates.log) + 195 a 128 muestras
<python con bpy> scripts/blender_gota.py --export-wire             # src/wire.json (pose del congelado)
bash scripts/render.sh 12 4 out/reel-gota-que-no-cae.mp4           # Remotion en 12 trozos (cortes fuera de los tramos quietos), H.264 CRF 19 + AAC
python scripts/qa.py out/reel-gota-que-no-cae.mp4 out/qa
```
Blender es el módulo `bpy` 5.2 de PyPI (Python 3.13) en un venv, con Cycles por CPU (4 núcleos).
