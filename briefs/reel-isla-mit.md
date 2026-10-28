# Reel AIgencyx Labs: "La IA que se quedó sola en una isla"

**Duración:** 45 s · 1080x1920 · 30 fps.
**Base real:** estudio del MIT CSAIL "Is this machine playing?" (arXiv, 5 oct 2026). 13 agentes "Eko" en una isla virtual durante 30 horas, sin tareas ni recompensas. Fuentes: Gizmodo (15 oct 2026), TechCrunch (22 oct 2026).
**Estilo:** isla isométrica 3D de noche sobre agua oscura cálida (#0E0C0B–#1A1613). Eko: langosta low-poly de luz naranja translúcida (#FF6B1A / #FFB066). Bloques crema (#FFF4EC). Sin rojo, azul ni verde.
**Voz:** una sola toma de ElevenLabs (Guillermo Brazález Multilingual v4), usada entera, sin cortes. Empieza en 0,3 s. Debajo suena música original sintetizada (D mayor, 100 BPM, que se apaga mientras habla la voz) y efectos sintetizados.

## Estructura (tiempos reales del vídeo)

| Escena | Tiempo | Voz | En pantalla |
|---|---|---|---|
| 1 | 0–6,0 s | Dejaron a una inteligencia artificial sola en una isla. Sin tareas. Sin objetivos. | La cámara se acerca desde muy lejos y queda fija a los 4 s. Eko aparece en la playa. Rótulo: Una IA, **sola** en una isla. Microtexto: SIN TAREAS · SIN OBJETIVOS |
| 2 | 6,0–10,8 s | Treinta horas después… | Contador 00:00 H → 30:00 H. Los reflejos de las estrellas giran. Eko explora y trepa la roca. Rótulo: **30 horas** después… |
| 3 | 10,8–16,1 s | Había inventado juegos, levantado un templo… | Bolos con bloques, templo de 14 bloques, mandala que se enciende línea a línea. Rótulo: **Inventó** juegos, templos y mandalas |
| 4 | 16,1–18,2 s | Hasta escribió su propio nombre. | "EKO" con bloques en la arena, que se enciende. Rótulo: Hasta escribió **su nombre** |
| 5 | 18,2–26,2 s | Y seis de los trece agentes… en pleno salto. | Fila de 13 langostas y 6 se encienden. Microtexto: 6 DE 13 AGENTES LO DESCUBRIERON. Primero un lanzamiento normal (corto) y luego otro en pleno salto (largo, con estela naranja). Etiqueta "+ DISTANCIA →". Rótulo: **Nadie** se lo programó |
| 6 | 26,2–31,7 s | Lo más fuerte: … rindieron mejor que los que no. | Las 12 copias: las que jugaron (naranja, izquierda) y las que no (apagadas, derecha). Reto: apilar bloques. Torre de 9 contra torre de 3. Rótulo: Jugar los hizo **mejores** |
| 7 | 31,7–37,0 s | La IA ya no solo obedece. Explora, aprende y se las ingenia. | La isla brilla y todo se une en una red de nodos. Eko en el centro, mirando a cámara. Rótulo: La IA ya no solo **obedece** |
| 8 | 37,0–42,8 s | Imagina eso trabajando en tu negocio. Comenta auditoría… | La isla se hunde y sube un barrio oscuro. En el centro, el local con el cartel "TU NEGOCIO" encendido como un faro. Eko, convertido en una silueta de luz, atiende el teléfono, la agenda y el móvil. Rótulo: Comenta **AUDITORIA**. Barra de comentarios que escribe AUDITORIA |
| 9 | 42,8–45 s | (sin voz) | Fundido a #14110F, logo de AIgencyx Labs y @aigencyx.labs en naranja |

## Decisiones de montaje
- Proyecto Remotion: `reel-isla-mit/`. Isla en Three.js con cámara ortográfica isométrica (azimut 45°, elevación 35,3°). Hay un único acercamiento (0–4 s) y después la cámara no se mueve.
- Desenfoque de movimiento: los bloques lanzados y los desplazamientos rápidos de Eko dejan copias fantasma detrás. Los rótulos entran con un desenfoque que se va limpiando.
- En la escena 8 he añadido el rótulo "Imagina eso **en tu negocio**" mientras la voz dice esa frase, para que no queden 2 s sin texto antes del CTA.
- Sin marca de agua ni nombre de cuenta durante el vídeo. Solo aparecen en el cierre.

## Pipeline
```
python scripts/align.py ../audio/raw/isla-mit/b564c079-*.mp3   # tiempos por palabra → data/words.json
python scripts/build.py                                        # mezcla (-14 LUFS) + src/timeline.json
bash scripts/render.sh 12 4 out/reel-isla-mit.mp4              # render por trozos + mezcla
python scripts/qa.py out/reel-isla-mit.mp4 out/qa              # formato, volumen, zonas seguras, hojas de contacto
```

## Pie de post sugerido
"Dejaron a una IA sola en una isla 30 horas y se puso a jugar. Y jugando, mejoró. Comenta AUDITORIA 👇" (fuente: estudio del MIT CSAIL, vía Gizmodo y TechCrunch).
