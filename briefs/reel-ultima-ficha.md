# Reel AIgencyx Labs: «La última ficha»

**Duración:** 47,27 s (1.418 frames) · 1080x1920 · 30 fps · -14 LUFS.
**Concepto:** el mismo gancho de 7 s que «El clic que no existe», con otro objeto: una cadena de fichas de dominó cae en curva sobre una mesa de nogal oscuro, en macro y a cámara lenta, hacia la cámara. La onda se acelera, la última ficha empieza a caer y se queda **congelada a 35° en el aire**. Parece grabado en estudio con cámara de alta velocidad y nada existe: se desvela pieza a pieza como estructura 3D, se vuelve a lanzar la cadena en la malla y se lleva al negocio (cada ficha la empujas tú → montamos la cadena y cae sola).
**Estilo:** la cuenta atrás es **path tracing en Blender/Cycles** (geometría real, no texturas planas): plano de producto a ras de mesa, con slider. Después, la misma escena en malla naranja (three.js, misma cámara), y una cadena 2D en negro/blanco/naranja. Sin rojo, azul ni verde.
**Voz:** una sola toma de ElevenLabs (Martin Osborne, Polished and Intense, v4, speed 1.02, stability 50, similarity 75), entera. El primer fonema está a 0,09 s, así que se coloca a los 6,91 s para que caiga justo en el frame 210 (7,000 s).
**Música:** no se adjuntó pista, así que el reel va **sin música** (voz + diseño de sonido). `reel-ultima-ficha.mp4` y `reel-ultima-ficha-sin-musica.mp4` tienen hoy el mismo audio. Si me pasas una pista, se mete en `music/` con `MUSIC_FROM` y solo hay que repetir la mezcla y el remux (no el render): fade in desde los 7 s, nivelada, hueco en 1,5–4,5 kHz, ducking de -9 dB bajo cada palabra, sube en el cierre y sale en el último segundo.

## Guion (el MP3 tal cual)
```
Esa última ficha no va a caer.
No porque algo la frene: porque no existe. Ni las fichas, ni la mesa, ni el sonido. Todo lo ha calculado un ordenador.
Y aun así, estabas esperando a que cayera. A tu cerebro le encantan las cadenas que funcionan solas.
Ahora piensa en tu negocio: el mensaje, la cita, el presupuesto, la factura… y cada ficha la empujas tú.
En AIgencyx Labs montamos la cadena: tú das el primer toque y el resto cae solo.
Comenta auditoría y te decimos qué ficha sigues empujando tú.
```
La toma usa la versión revisada «Todo lo ha calculado un ordenador» (se oye la /t/ inicial a los 9,94 s del MP3). Alineador propio (`scripts/align.py`, Viterbi por pausas) + 21 anclas puestas a mano sobre el espectro: «ni las fichas / ni la mesa / ni el sonido», «existe», «el mensaje / la cita / el presupuesto / la factura» y «y el resto cae solo» (hay una pausa antes de «cae»).

## Escenas

| Bloque / escena | Tiempo | Voz | En pantalla | Sonido (cada uno en su frame) |
|---|---|---|---|---|
| A · Cuenta atrás | 0–7,0 s | — | **196 fotogramas en Cycles.** 40 fichas en una curva que viene del fondo hacia la cámara; la onda ya está cayendo al empezar y la cámara la sigue mientras el slider empuja hacia la última. El reloj de la «cámara de alta velocidad» pasa de 9× a 4× a cámara lenta (la onda se acelera), **frena desde el frame 184** y se para en seco en el 195, con la última ficha a 35,0°. Contador «ÚLTIMA FICHA EN» 196 → 001, un número por frame, que late en cada pulsación; en el congelado pasa a «CONGELADA» y ya no se mueve nada salvo el REC | Latido de 52 a 150 ppm (10 latidos, **el último justo en el frenazo**, 6,13 s). **26 clacs, uno por cada impacto real de la simulación** (cada vez que una ficha golpea a la siguiente), que se aceleran; dron y riser que se tensan. En el congelado: golpe seco + clac + **tiiick (3,1 kHz)** + zumbido |
| 1 | 7,0–9,6 s | Esa última ficha no va a caer. | Fotograma congelado a 128 muestras, sin desenfoque de movimiento. REC parpadeando, timecode congelado. «Esa última ficha / no va a **caer**» | zumbido del congelado |
| 2 | 9,6–16,75 s | No porque algo la frene: porque no existe. Ni las fichas, ni la mesa, ni el sonido. | En «frene» (10,53 s), una línea de escaneo revisa la imagen. En «existe» (11,94 s), glitch de 6 frames y **la última ficha pasa a malla naranja** (casa con la placa al píxel); el HUD cambia a «RENDER 3D · t 1,850 s» (el reloj de la simulación). **Cada cosa que se nombra se desvela como estructura 3D en su palabra**: «fichas» (13,61 s), la foto se retira ficha a ficha, de la última hacia el fondo, y aparecen las 40 mallas; «mesa» (14,65 s), el nogal se convierte en su rejilla de cerca a lejos; «sonido» (15,82 s), aparece el espectrograma 3D del clac (36 instantes × 24 bandas), flotando sobre la cadena. Arriba a la izquierda, una lista FICHAS / MESA / SONIDO que se tacha en cada palabra (→ 40 MALLAS 3D · 1 PLANO · REJILLA · ESPECTRO · 24 BANDAS). En la respiración tras «sonido.» (16,45 s), **el clac vuelve a sonar y su espectro se dibuja mientras suena** | escaneo · glitch · barrido digital por elemento · tachón por elemento · clac con un eco corto (dura lo mismo que se tarda en dibujar) |
| 3 | 16,75–19,36 s | Todo lo ha calculado un ordenador. | La cámara se aleja, sube y gira a tres cuartos: se ve toda la curva. Cotas sobre la malla, una por sílaba: **ÁNGULO DE CAÍDA 35,0°** (arco dibujado en el eje de la última ficha, «Todo»), **VELOCIDAD DE LA ONDA 0,73 m/s** (flecha a lo largo de la cadena, «calculado»), **SEPARACIÓN 30 mm** (cota entre dos fichas, «ordenador») | un tic por cota |
| 4 | 19,36–26,21 s | Y aun así, estabas esperando a que cayera. A tu cerebro le encantan las cadenas que funcionan solas. | La mesa desaparece y la cadena de malla **se rebobina** (19,47–20,16 s) y **vuelve a caer en el aire** con la misma física (20,35–21,58 s), frenando otra vez a 35° justo en «cayera». Se queda así mientras la cámara se acerca; **en «solas» (25,39 s) la última ficha cae por fin** (a 6× más lenta) y aterriza a los 25,61 s con un destello | rebobinado · 39 clacs al ritmo real de la caída · golpe de aterrizaje |
| 5 | 26,21–35,36 s | Ahora piensa en tu negocio: el mensaje, la cita, el presupuesto, la factura… y cada ficha la empujas tú. | Barrido de rejilla → cadena 2D de perfil. MENSAJE (28,54) · CITA (29,61) · PRESUPUESTO (30,44) · FACTURA (31,67) aparecen en su palabra, **con dos huecos entre cada una**. «y cada ficha la empujas tú»: una mano «TÚ» (con el antebrazo entrando desde fuera de plano) empuja las cuatro (32,98 / 33,45 / 33,92 / 34,39 s), con esfuerzo; cada una se inclina y vuelve a su sitio, porque no hay nada a lo que empujar | pop por tarjeta · 4 empujones con esfuerzo |
| 6 | 35,36–41,6 s | En AIgencyx Labs montamos la cadena: tú das el primer toque y el resto cae solo. | Desde «montamos», **6 fichas naranjas encajan en los huecos** (36,68–37,83 s). La mano da **un solo toque** en «toque» (39,31 s) y la cadena **cae sola** (impactos de 39,37 a 40,88 s, cada vez más seguidos, como una cadena real; la última se tumba a los 41,04 s). Cada etiqueta recibe su ✓ al caer su ficha | encaje ×6 · toque · un clac por impacto · ✓ ×4 · golpe final |
| 7 · CTA | 41,6–45,32 s | Comenta auditoría y te decimos qué ficha sigues empujando tú. | Campo de comentario que escribe AUDITORIA letra a letra y se envía; «QUÉ FICHA **EMPUJAS TÚ** →» aparece en «qué» (43,53 s) | una tecla por letra · envío |
| C · Cierre | 45,32–47,27 s | — | Apagón CRT, logo y @aigencyx.labs | crt |

## Decisiones
- **Modelado, no pintado** (`scripts/blender_fichas.py`). Ficha jumbo de 48 × 24 × 10 mm. La losa sale de un contorno 2D encogido con shapely y extruido con bevel: cantos redondeados de 1,3 mm y esquinas de 3,2 mm en planta, con vértices soldados y las aristas entre caras planas y bevel marcadas como sharp. Lleva:
  - **Puntos taladrados** con booleanos exactos (cortador de revolución: avellanado cónico, agujero recto y fondo en punta de broca), rellenos de pintura negra hasta un nivel irregular (distinto en cada punto y en cada ficha).
  - Ranura central pintada y **remache de latón abombado**.
  - **Tres fichas con una esquina desportillada**, una de ellas la protagonista, visible los 7 s de congelado.
- **Superficie (v2, reflejos ante todo):** urea marfil (cuerpo mate, un toque de subsurface) bajo una **laca casi espejo** (clearcoat, rugosidad 0,012, IOR 1,6, con una piel de naranja muy leve que hace temblar un poco los reflejos). Tiene huellas (solo en algunas fichas, enturbian el reflejo), microarañazos en familias de direcciones, polvo en las caras que miran arriba, aristas algo gastadas y suciedad en los bordes de los puntos. La pintura de los puntos es negra brillante: refleja barras de luz pero sigue leyéndose negra. **Remache de latón pulido** (espejo). Mapas precalculados en `scripts/make_textures.py`.
- **Mesa:** tres tablas de nogal cortadas en plano y encoladas (catedrales y vetas), con poro abierto bajo un **barniz pulido tipo piano**, casi espejo, con ondulaciones lentas como un barniz real. Refleja cada ficha, sus puntos y sus remaches con nitidez, y la veta se sigue viendo debajo (mapas de 8K, ~10 texels/mm). Lleva marcas de pulido, rayas finas y motas de polvo modeladas alrededor de la última ficha.
- **Física determinista** (`scripts/cadena.py`, `scripts/fisica.py`):
  - Cada ficha rueda sobre su arista delantera inferior.
  - La ley de contacto entre vecinas (el canto superior de una contra la cara trasera de la siguiente, con las curvas incluidas) se calcula numéricamente; así toda la cadena apoyada es un sistema de un grado de libertad (Lagrange).
  - Cada choque es plástico.
  - Salen 0,73 m/s de onda, 39 impactos y el aterrizaje de la última.
  - Los mismos números mueven las placas de Cycles, la malla de three.js y cada clac del sonido.
- **Reloj de cámara de alta velocidad** (`scripts/cuenta.py`): 9× → 4× de cámara lenta, frenazo desde el 184 y parada en el 195. Al congelarse, la última ficha está a 35,0° y las de detrás, apoyadas, a 53°, 63°, 68° y 69°.
- **Cámara:** slider a ras de mesa, con un tele de 20° de campo vertical, de 1,08 m a 0,40 m de la última ficha. Al principio encuadra la onda y la última ficha a la vez, y en el último segundo se queda en la última. Profundidad de campo real de f/11 a f/20, con el enfoque en la cara de la última ficha; desenfoque de movimiento real.
- **Luz (pensada para que lo que se lea sea el reflejo):** estudio oscuro, y cada fuente tiene forma para que su imagen en la laca y en el barniz se reconozca como reflejo:
  - Un banco de 9 tiras con travesaño, detrás de la cámara. Las caras de pie miran ligeramente hacia la mesa, así que lo ven a través del espejo del barniz: barras que se deslizan por puntos y remaches mientras el slider empuja.
  - **Tiras colocadas exactamente sobre el reflejo del rayo de cámara en los biseles** de la ficha congelada (canto superior y arista vertical): dos destellos limpios durante los 7 s de congelado.
  - Tiras en el canto superior y en el lateral, contraluces bajos y un softbox principal pequeño arriba a la izquierda para el modelado.
  - Tres tiras finas muy al fondo, que la cámara no ve directamente pero el barniz sí: bajan por la mesa como estelas de luz, con la silueta de la cadena recortada encima.
  - Lo descartado: una tarjeta reflectora visible solo en los reflejos (iluminaba la mesa) y un primer montaje de luces más difusas, que dejaba las caras satinadas.
- **Render:**
  - Cycles por CPU, 16 muestras + OIDN (prefilter FAST), a 972x1728 mostrado a 1080x1920: 30–40 s por fotograma (unas 2 h el bloque; el render se reanudó desde el frame 111 tras un reinicio del contenedor).
  - El fotograma congelado (se ve 7 s) va a 128 muestras, con denoiser completo y sin desenfoque.
  - Blender 5.2.3 como módulo `bpy` de PyPI. La descarga por pip iba a 190 KB/s, así que la rueda se bajó por tramos en paralelo y se comprobó su SHA-256.
- **El desvelado:**
  - Se renderizan dos máscaras del fotograma congelado con la misma lente y el mismo enfoque: quién es cada píxel (última ficha / resto de fichas / mesa) y un parámetro (posición a lo largo de la cadena, profundidad sobre la mesa).
  - Un shader de three.js pinta la foto encima de la malla y la va retirando elemento a elemento, con una línea naranja en el frente del barrido.
  - La malla (`public/models/fichas.glb`) se exporta desde Blender en pose de reposo y three.js la inclina con la misma física: casa con la placa al píxel. Las aristas se calculan en micras y el frustum culling va desactivado: con la matriz de pose aplicada a mano, three.js descartaba fichas visibles.
- **Sonido diseñado desde los números del timeline:**
  - Clacs de resina sacados de los impactos reales (con el remapeo de tiempo).
  - Latidos construidos hacia atrás desde el frenazo.
  - Un barrido y un tachón por elemento desvelado.
  - Un tic por cota y rebobinado.
  - Los 39 clacs de la nueva caída, con su ritmo real.
  - Empujones, encajes, toque, clacs de la cadena 2D, ✓, tecleo, envío y CRT.

## QA (`scripts/qa.py`, todo en verde)
Formato 1080x1920 a 30 fps, 47,27 s · -14,1 LUFS integrados, pico real -2,3 dBTP tras AAC · frames 195–209 idénticos salvo el REC (0,000 % de píxeles cambiados) · la imagen congelada no cambia hasta el escaneo de «frene» (0,002 %) · contador 196 → 001, un número por frame, 001 en el 195, última ficha a 35,00° · voz en el frame 210,00 (correlación con el MP3) · la cuenta atrás sube de -23,5 a -14,2 dB antes del 195 · tiiick: +14,5 dB en la banda de 3 kHz a los 6,50 s · nada informativo fuera de 250–1580 px · el wireframe aparece en «existe» (frame 358) y no antes. Hojas de contactos cada 0,5 s revisadas a mano: tras ellas se corrigieron la mano «TÚ» (salía casi fuera de cuadro en la primera ficha), la ficha naranja que caía semitransparente (se veía granate) y la barra del antebrazo.

## Pendiente de comprobar (tú)
1. Cómo pronuncia la voz **«AIgencyx»** (28,68–29,39 s del MP3; 35,59–36,30 s del vídeo).
2. **Música:** no hay pista (sin problemas de derechos). Si quieres música, pásame la pista y el minuto; es solo remezcla + remux.
3. Que el **contador** (abajo a la derecha, 1.350–1.564 px de alto, termina en x = 1.010) no choque con los botones laterales de Instagram (me gusta / comentar / compartir, en la columna derecha). Si choca, se mueve a la izquierda en una línea (`CuentaAtras.tsx`) y se re-renderizan solo los 7 primeros segundos.
4. Velocidad de la onda: 0,73 m/s es lo que da el modelo para estas fichas y esta separación; en fichas reales de este tamaño suele medirse algo más (en torno a 1 m/s). La cota usa el número calculado.

## Pipeline
```
python scripts/align.py ../audio/raw/ultima-ficha/2a301c7c-*.mp3
python scripts/make_assets.py              # grano
python scripts/make_textures.py            # nogal 8K, huellas / arañazos / polvo de las fichas (public/plates_src)
python scripts/build.py                    # física, reloj, cámara, eventos, las dos mezclas (src/timeline*.json, src/caida.json)
bash scripts/render_placas.sh <python con bpy>   # placas 0-194 (16 muestras) + 195 (128, sin blur) + máscaras + GLB → public/plates, public/models
bash scripts/render.sh 12 4 out/reel-ultima-ficha.mp4   # + out/reel-ultima-ficha-sin-musica.mp4 (remux)
python scripts/qa.py out/reel-ultima-ficha.mp4 out/qa
```
