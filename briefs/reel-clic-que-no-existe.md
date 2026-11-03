# Reel AIgencyx Labs: «El clic que no existe»

**Duración:** 42,70 s (1.281 frames) · 1080x1920 · 30 fps · -14 LUFS.
**Concepto:** el gancho de 7 s otra vez, pero con otro objeto y otro remate que en «Globo» y «Lápices»: dos engranajes en macro a cámara lenta que se acercan mientras un **latido de corazón se acelera**; frenan en seco, los dientes encajan y suena un **tiiick agudo de "completado"**. La revelación («no existen») no es un wireframe sin más sino un **despiece naranja tipo CAD**, y la parte de negocio es un **mecanismo** en el que tú haces de pegamento y nosotros fabricamos el engranaje que falta.
**Estilo:** la cuenta atrás es **path tracing en Blender/Cycles** (geometría real, no texturas), como un plano de producto sobre una platina de mecanismo. Después, wireframe naranja (three.js) con la misma cámara, y un mecanismo 2D en negro/gris/naranja. Sin rojo, azul ni verde.
**Voz:** una sola toma de ElevenLabs (Martin Osborne, Polished and Intense, v4), entera. El primer fonema está a 0,11 s, así que se coloca a los 6,89 s para que caiga justo en el frame 210 (7,000 s).
**Música:** la pista que me pasaste (instrumental, desde el 4:36), con fade in desde los 7,0 s («¿Has oído…») y a su nivel desde «mentira». Nivelada, con un hueco en la banda de presencia de la voz y ducking de -9 dB bajo cada palabra; sube un poco en el cierre y se va en el último segundo.

## Guion (el MP3 tal cual)
```
¿Has oído ese clic? Es el sonido de que algo encaja.
Pues es mentira: esos engranajes no existen. Los ha calculado un ordenador. Y el sonido, también.
Y aun así, tu cerebro se lo ha creído: le encanta que las cosas encajen.
Ahora piensa en tu negocio: la agenda, los mensajes, las facturas… y tú en medio, haciendo de pegamento.
En AIgencyx Labs fabricamos las piezas que faltan para que todo encaje solo.
Comenta auditoría y te enseñamos cuál es la que no te encaja.
```
Alineador propio (pausas + comas). «la agenda / los mensajes / las facturas» van anclados a mano a las pausas de las comas (análisis espectral).

## Escenas

| Bloque / escena | Tiempo | Voz | En pantalla | Sonido (cada uno en su frame) |
|---|---|---|---|---|
| A · Cuenta atrás | 0–7,0 s | — | **196 fotogramas en Cycles.** Engranaje de latón (24 dientes) bajando hacia uno de acero (32 dientes), empuje de slider desde los dos engranajes hasta el punto de engrane. Se acelera con la tensión, **frena desde el frame 184** y encaja en el 195. Contador «ENCAJE EN» 196 → 001, un número por frame, que late en cada pulsación; en el congelado pasa a «ENCAJADO» y se abre un anillo de luz desde donde se tocan los dientes | Latido de 52 a 150 ppm: 11 latidos, **el último justo en el frenazo**. Clics de dientes calculados de la rotación real (uno por cada diente que pasa por el engrane), dron que se tensa. En el congelado: golpe de asiento + **tiiick (3,1 kHz)** + zumbido |
| 1 | 7,0–11,05 s | ¿Has oído ese clic? Es el sonido de que algo encaja. | Fotograma congelado a 128 muestras. «¿Has oído / ese **clic?**» → «Es el sonido / de que algo **encaja**» | el clic otra vez, flojito, en la respiración tras «clic?» (con su anillo de luz) |
| 2 | 11,05–14,69 s | Pues es mentira: esos engranajes no existen. | Línea de escaneo naranja sobre la imagen congelada en «mentira». En «existen» (13,685 s): glitch de 6 frames y todo pasa a wireframe naranja; el HUD cambia de «CAM 01» a «RENDER 3D» | escaneo · glitch |
| 3 | 14,69–18,55 s | Los ha calculado un ordenador. Y el sonido, también. | La cámara gira a tres cuartos y **el conjunto se despieza pieza a pieza, cada una en una sílaba** (arandelas, clips, prisioneros, engranajes). Cotas «z 24 · m 1,0», «z 32 · m 1,0», «α 20° · evolvente» y circunferencias primitivas a trazos. En la respiración tras «sonido,» el **clic se dibuja como forma de onda** (CLIC.WAV · sintetizado) mientras suena | un «release» metálico por pieza · el tiiick otra vez, bajo su forma de onda |
| 4 | 18,55–23,95 s | Y aun así, tu cerebro se lo ha creído: le encanta que las cosas encajen. | Las piezas vuelven a su sitio una a una y hacen clic; **la última, el engranaje A, aterriza en «encajen»** | snap por pieza · asiento + tiiick en «encajen» |
| 5 | 23,95–32,1 s | Ahora piensa en tu negocio… haciendo de pegamento. | Barrido de rejilla → mecanismo: tres engranajes grises (AGENDA, MENSAJES, FACTURAS) aparecen en su palabra alrededor de un eje vacío. «tú» aparece en medio sujetándolos con los brazos estirados; en «pegamento» reciben tres empujones | pop por engranaje · 3 empujones con chirrido |
| 6 | 32,1–37,0 s | En AIgencyx Labs fabricamos las piezas que faltan para que todo encaje solo. | El engranaje naranja **se fabrica diente a diente** (20 dientes, un clic cada uno), baja a su eje en «faltan» y asienta con un golpe; en «encaje» todo el tren gira solo y en «solo» cada etiqueta recibe su ✓ | construcción ×20 · deslizamiento · asiento · snap + arranque · clics de engrane al ritmo del giro |
| 7 · CTA | 37,0–40,7 s | Comenta auditoría y te enseñamos cuál es la que no te encaja. | Campo de comentario que escribe AUDITORIA letra a letra y se envía; «CUÁL NO TE **ENCAJA** →» aparece en «cuál» | una tecla por letra · envío |
| C · Cierre | 40,7–42,7 s | — | Apagón CRT, logo y @aigencyx.labs | crt |

## Decisiones
- **Modelado, no pintado** (`scripts/blender_engranajes.py`): dientes de evolvente reales (`scripts/gear_geom.py`: ángulo de presión 20°, holgura, radio de pie, puntas redondeadas), compartidos por el render, el wireframe y el mecanismo 2D. Todas las aristas redondeadas (0,12 mm), así cada una pilla su línea de luz. Engranaje A de latón con 6 aligeramientos; B de acero con 4 ventanas de radios; cubos con prisionero Allen en su agujero radial, chavetero + chaveta, ejes pulidos con chaflán y marca de punto de centrar, arandelas zincadas y clips E pavonados. Detrás, una platina de aluminio anodizado negro con casquillos de latón (el de A es una colisa, porque se desliza).
- **Imperfecciones en la malla:** un diente desportillado (al lado del que engrana, visible en el congelado), golpecitos en el canto, motas de polvo apoyadas en las caras. **En la superficie:** anillos de torneado irregulares con brillo anisótropo circular, marcas de fresa madre en los flancos, banda pulida en la línea primitiva, aristas gastadas y brillantes, suciedad y oxidación en los huecos, huellas dactilares y microarañazos (mapa precalculado).
- **Reflejos:** las caras son casi espejos (rugosidad 0,07–0,10). Cada softbox está colocado sobre el reflejo del rayo de cámara en las caras de los engranajes, con su borde suave cruzándolas: un degradado que se desliza con el empuje del slider. Eso es lo que se lee como metal pulido y no como un color plano.
- **Render:** Cycles por CPU, 16 muestras + OIDN, motion blur y profundidad de campo reales (f/11 → f/20), 972x1728 mostrado a 1080x1920 (43 s por fotograma, ~2,3 h). El fotograma congelado, que se ve 7 s, va a 128 muestras, denoiser completo y sin blur.
- **Wireframe** de la misma geometría (GLB exportado desde Blender), con la cámara de las placas para que case en el glitch, aristas calculadas en micras (en metros three.js fusiona los puntos del perfil), con las aristas ocultas en transparencia.
- **Sonido diseñado desde los números del timeline**: los clics de dientes salen del ángulo real de los engranajes, los latidos se construyen hacia atrás desde el frenazo, cada pieza sale y vuelve en una sílaba, la fabricación hace clic en cada diente, los clics finales siguen la velocidad del giro y el tecleo va letra a letra.

## Pendiente de comprobar (tú)
1. **Música:** es una pista comercial. En Instagram, en una cuenta de empresa, pueden silenciar o reclamar el audio. Dejo también `entregas/reel-clic-que-no-existe-sin-musica.mp4` (idéntico, sin la pista) por si acaso.
2. Cómo pronuncia la voz «AIgencyx» (25,45–26,08 s del MP3; 32,34–32,97 s del vídeo).
3. Que el contador (abajo a la derecha, 1290–1506 px) no choque con los botones laterales de Instagram.

## Pipeline
```
python scripts/align.py ../audio/raw/clic-que-no-existe/30906195-*.mp3
python scripts/make_assets.py              # grano
python scripts/make_metal_textures.py      # huellas / oxidación / polvo (public/plates_src/huellas.png)
python scripts/make_mech_paths.py          # mecanismo 2D (src/mech-gears.json)
python scripts/build.py                    # curvas, cámara, eventos, las dos mezclas (con y sin música)
<python con bpy> scripts/blender_engranajes.py --frames 0-194 --res 0.9          # placas → public/plates (+ GLB del wire)
<python con bpy> scripts/blender_engranajes.py --frames 195-195 --res 0.9 --samples 128 --noblur
bash scripts/render.sh 12 4 out/reel-clic-que-no-existe.mp4
python scripts/qa.py out/reel-clic-que-no-existe.mp4 out/qa
```
