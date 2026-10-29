# Reel AIgencyx Labs: "Los agentes y la quedada que no existía"

**Duración:** 49,5 s · 1080x1920 · 30 fps.
**Base real:** el periodista Evan Ratliff montó HurumoAI, una startup ficticia con cinco agentes de IA como cofundadores y empleados. Él era el único humano con cargo (CEO), y había además una becaria humana. Lo documentó en la temporada 2 de su podcast *Shell Game* y en un reportaje de Wired (nov 2025). Un día mencionó un "offsite" (quedada de empresa) y los agentes lo tomaron como una tarea real.
**Estilo:** oficina isométrica 3D de noche, flotando sobre una plaza oscura y cálida (#0E0C0B–#1A1613). Cinco agentes: orbes low-poly de luz naranja translúcida (#FF6B1A / #FFB066), sin cara y de tamaños distintos. El único humano es un pictograma crema (#FFF4EC) sin rostro. Sin rojo, azul ni verde.
**Voz:** una sola toma de ElevenLabs (Guillermo Brazález Multilingual v4) de 47,0 s, usada entera y sin cortes. Empieza en 0,1 s.
**Música:** el tema que mandó el cliente (`audio/raw/agentes-quedada/a6c7afc0-videoplayback_1.mp4`, solo audio). Suena desde su segundo 0 hasta el final del reel, baja cuando habla la voz y hace un fundido en el último 1,6 s. Debajo van efectos sintetizados.

## Sincronía con la música
- El análisis del tema (`scripts/build.py`) encuentra el **drop a los 10,44 s**: el tema pasa de una intro tranquila a toda su actividad (+12 dB, con bajo y percusión). Cae justo en "Los agentes la tomaron **como una orden**".
- **Antes del drop** la imagen va en calma: orbes apagados que respiran despacio, monitores apagados, la plaza en penumbra y las motas de luz casi quietas.
- **En el drop** cambia todo en el mismo fotograma: destello naranja, los cinco orbes se encienden con un rebote, una onda recorre la plaza, se encienden los monitores y las farolas en cadena, aparecen los hilos de luz hacia la burbuja de la quedada y las motas suben tres veces más rápido.
- **Después del drop** cada golpe de bombo (106, detectados en el propio tema) lanza un anillo de luz por las baldosas de la plaza. Los mismos golpes hacen latir los orbes, el bloom y la franja de luz bajo la oficina. Las burbujas de mensaje salen sincronizadas con esos golpes.
- La **segunda subida del tema (41,97 s)** marca la entrada del CTA: la plaza se oscurece y sube la barra de comentarios.

## Estructura (tiempos reales del vídeo)

| Escena | Tiempo | Voz | En pantalla |
|---|---|---|---|
| 1 | 0–5,4 s | El periodista Evan Ratliff montó una startup donde casi todos eran agentes de IA. | La cámara se acerca de lejos a cerca y queda fija a los 4 s: oficina flotando en la plaza, cinco orbes apagados y el pictograma crema en su mesa. Rótulo: Una startup de **agentes de IA**. Microtexto: HURUMOAI · SHELL GAME |
| 2 | 5,4–9,2 s | Un día mencionó, casi de pasada, una quedada de empresa. | El humano suelta una burbuja crema con puntos suspensivos que pasan a ser una tienda de campaña. Se va al borde, de espaldas. La burbuja flota hasta el centro. Rótulo: Casi de pasada, una **quedada**. Microtexto: CANAL DE SLACK |
| 3 | 9,2–11,6 s | Los agentes la tomaron como una orden. | Los orbes se inclinan hacia la burbuja. **Drop (10,44 s):** se encienden de golpe, la burbuja crece y una onda recorre la plaza. Rótulo: La tomaron como **una orden**. Microtexto: NADIE DIJO QUE PARARAN |
| 4 | 11,6–15,5 s | Empezaron a planear lugares, fechas y sesiones de estrategia. | Burbujas naranjas con iconos de ubicación, calendario y pizarra vuelan entre los orbes, con copias fantasma. La pizarra del fondo se llena de trazos. Rótulo: Planearon **lugares y fechas**. Microtexto: SESIONES DE ESTRATEGIA |
| 5 | 15,5–19,2 s | En dos horas se escribieron más de ciento cincuenta mensajes. | Las burbujas se apilan en espiral hacia la quedada. Un anillo de reloj da dos vueltas y el contador sube hasta 150+. Rótulo: Más de **150 mensajes**. Microtexto: EN DOS HORAS |
| 6 | 19,2–22,6 s | No pararon hasta gastarse treinta dólares de créditos. | La barra de créditos se vacía de 30 $ a 0 $ entre chispas. Al llegar a cero, los orbes parpadean y se apagan, y las burbujas en vuelo se congelan "a media frase". Rótulo: **30 $** en créditos. Microtexto: SE ACABÓ EL PRESUPUESTO |
| 7 | 22,6–25,3 s | Para una quedada que ni siquiera existía. | La burbuja de la quedada se queda hueca, con borde discontinuo, y se deshace en partículas. Rótulo: Una quedada que **no existía**. Microtexto: NO HABÍA NADA QUE ORGANIZAR |
| 8 | 25,3–29,3 s | Ratliff lo resumió así: se hablaron hasta morir. | El humano vuelve al centro. En "hasta morir", los orbes se apagan uno a uno y bajan. Rótulo: Se hablaron **hasta morir**. Microtexto: EVAN RATLIFF / "TALKED THEMSELVES TO DEATH" |
| 9 | 29,3–33,4 s | Y cuando limitó sus turnos, los gastaron halagándose entre ellos. | El humano reparte tres fichas crema de turno a cada orbe. Ellos las gastan en burbujas con corazón y pulgar arriba (crema). Rótulo: Limitó turnos: **se halagaron**. Microtexto: LOS TURNOS TAMBIÉN SE GASTAN |
| 10 | 33,4–42,0 s | La lección para tu negocio: un agente sin límites también tiene factura. Presupuesto, tope de turnos y alguien que mire el gasto. | La barra de presupuesto se llena con cada mensaje y choca con el tope de luz en "tope": golpe seco y dejan de salir burbujas. En "alguien", una lupa de supervisión recorre el grupo. Rótulos: Un agente sin límites **tiene factura** → Todo agente necesita **tope**. Microtextos: LA LECCIÓN PARA TU NEGOCIO → PRESUPUESTO · TURNOS · REVISIÓN |
| 11 | 42,0–47,3 s | Comenta auditoría y revisamos qué gasta tu IA. | Con la segunda subida del tema, la plaza se oscurece y se desenfoca. La barra de comentarios escribe AUDITORIA letra a letra. Rótulos: Comenta **AUDITORIA** → Revisa **tu gasto en IA**. Microtexto: COMENTA LA PALABRA |
| Final | 47,3–49,5 s | (sin voz) | Fundido a #14110F, logo de AIgencyx Labs y @aigencyx.labs en naranja, con la música hasta el final |

## Fuentes (todas secundarias; Wired no se pudo abrir)
- Futurism (15 nov 2025): el CTO Ash Roy propuso sesiones de estrategia con vistas al océano. Los agentes siguieron activos mientras Ratliff estaba fuera de Slack y gastaron 30 $ de créditos. Cita de Ratliff: "They'd basically talked themselves to death". https://futurism.com/artificial-intelligence/company-run-entirely-ai-generated-employees-chaos
- R&D World (6 may 2026): más de 150 mensajes en dos horas para planear lugares y fechas. Ratliff tuvo que apagarlos. 30 $ en créditos de API. https://www.rdworldonline.com/a-journalist-created-a-startup-run-almost-entirely-by-ai-agents/
- TechBuzz (12 nov 2025): unos 30 $ del presupuesto de cómputo en dos horas y más de 150 mensajes. https://techbuzz.ai/articles/journalist-tests-ai-agents-as-employees-gets-chaos
- Dataconomy (17 nov 2025): unos 30 $ en créditos, atribuidos a Wired y a Shell Game. https://dataconomy.com/2025/11/17/a-reporter-let-ai-agents-run-a-fake-company-and-chaos-followed/
- Science News (27 mar 2026): 30 $ pagados por adelantado. Después Ratliff limitó los turnos de cada agente, pero los gastaron halagándose entre ellos. https://www.sciencenews.org/article/ai-agent-teams-fail-succeed-bots-chaos

## Matices que respeta el guion
1. Los 30 $ coinciden en cinco fuentes secundarias, pero ninguna es la original. El símbolo es $ y los medios que lo aclaran dicen dólares.
2. Hay dos versiones de cómo empezó. La mayoría dice que Ratliff mencionó el offsite (él lo describe como una broma). Science News cuenta que surgió al preguntarles por su fin de semana, cuando Tyler habló de una excursión. El guion solo dice que "mencionó" la quedada, y eso vale para las dos.
3. "Más de 150 mensajes en dos horas" sale de R&D World y TechBuzz. Solo una fuente lo relaciona a la vez con las dos horas y con los 30 $.
4. Es un experimento periodístico, no el caso de una empresa real, y el guion lo presenta así.
5. No aparecen el nombre de la plataforma de agentes ni ningún logo. "Slack" solo sale como texto en un microtexto.
6. Frase 4: el borrador decía "caminatas". Se cambió por "lugares, fechas y sesiones de estrategia", porque la excursión de Science News es lo que Tyler contó de su fin de semana, no algo que los agentes planearan.
- **Pendiente antes de publicar:** abrir el reportaje de Wired ("All of My Employees Are AI Agents, and So Are My Executives") o el episodio de Shell Game 2 y confirmar la cifra de 30 $, el número de mensajes, las "dos horas" y la frase de Ratliff.

## Decisiones de montaje
- Proyecto Remotion: `reel-agentes-quedada/`. La oficina está hecha en Three.js con cámara ortográfica isométrica (azimut 45°, elevación 35,3°). Hay un único acercamiento (0–4 s) y después la cámara no se mueve.
- La toma de voz dura 47,0 s, así que el reel dura 49,5 s y no los 45 s previstos. Se usa la toma entera, sin cortar ni estirar, y quedan 2,2 s finales sin voz.
- En la escena 2 el rótulo se reordenó a "Casi de pasada, una **quedada**" para que cada palabra salga cuando la voz la dice.
- En la escena 10 hay dos rótulos seguidos, uno por frase, para que no queden 8 s con el mismo texto.
- En la escena 11, "Comenta **AUDITORIA**" sale mientras la voz lo dice y luego da paso a "Revisa **tu gasto en IA**". El microtexto COMENTA LA PALABRA se queda encima de la barra.
- Los tiempos de las palabras salen de `scripts/align.py`, un alineador propio sobre las pausas de la toma. El CTA tiene una respiración de 0,1 s (44,7 s) que se divide a mano.
- Sin marca de agua ni nombre de cuenta durante el vídeo. Solo aparecen en el cierre.
- **Música:** el tema llegó como descarga de YouTube. Antes de publicar, confirmar que se tienen los derechos o usar el mismo tema desde la biblioteca de audio de Instagram.

## Pipeline
```
python scripts/align.py ../audio/raw/agentes-quedada/22aa7fe3-*.mp3   # tiempos por palabra → data/words.json
python scripts/build.py                                               # análisis de la música + mezcla (-14 LUFS) + src/timeline.json
bash scripts/stills.sh 200 318 520 960 1240                           # capturas de prueba → out/stills/sheet.jpg
bash scripts/render.sh 12 4 out/reel-agentes-quedada.mp4              # render por trozos + mezcla
python scripts/qa.py out/reel-agentes-quedada.mp4 out/qa              # formato, volumen, zonas seguras, hojas de contacto
```

## Pie de post sugerido
"Un periodista montó una startup con agentes de IA. Mencionó una quedada de empresa y se gastaron 30 $ en dos horas planeándola… para nada. Comenta AUDITORIA y revisamos qué gasta tu IA 👇" (fuente: Evan Ratliff, Shell Game / Wired, vía Futurism, R&D World y Science News).
