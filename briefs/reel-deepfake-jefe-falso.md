# Reel AIgencyx Labs: "Sala falsa" (deepfake, jefe falso)

**Duración:** 52,0 s (voz 0,06–49,71 s + 2,3 s de apagón y cierre) · 1080x1920 · 30 fps · -14 LUFS, pico real -1,6 dBFS.
**Voz:** una toma de ElevenLabs (Guillermo Brazález, Multilingual v4), usada entera: `audio/raw/deepfake-jefe-falso/401d63f6.mp3`.
**Proyecto:** `reel-deepfake-jefe-falso/` (Remotion, 2D; sin Three.js).

## Guion final (13 frases, 130 palabras)
Su jefe le ordenó transferir más de veinticinco millones de dólares. / Su jefe no existía. / Lo contó la policía de Hong Kong en febrero de dos mil veinticuatro. / Un empleado de finanzas de una multinacional recibió un correo sobre una operación secreta. / Desconfió y pensó que era una estafa. / Entonces lo invitaron a una videollamada. / Ahí estaban el director financiero y varios compañeros, todos falsos según la policía. / Hizo quince transferencias a cinco cuentas. / Lo descubrió una semana después, al consultarlo con su empresa. / La policía no ha dicho quién era ni qué empresa. / Una cara o una voz ya no prueban nada. / Ningún pago debería depender de reconocer a alguien: confírmalo por otro canal, llamando tú al número de siempre. / Comenta auditoría y te ayudamos a automatizar tu negocio.

## Escenas (tiempos reales)
| Escena | Tiempo | Qué se ve | Transición de entrada |
|---|---|---|---|
| Gancho | 0–4,45 | Rejilla de llamada; zoom al tile del director financiero que glitchea; "25 M $" sobre naranja | — |
| No existía | 4,45–6,48 | La silueta se pixela y se rompe en bloques; etiqueta tachada en naranja | glitch por bloques |
| Policía | 6,48–10,39 | Rueda de prensa genérica (silueta, atril), POLICÍA, HONG KONG, FEB 2024 | rebanadas que se cierran |
| Correo | 10,39–15,67 | Empleado + notificación con OPERACIÓN SECRETA | salto de pestaña (cursor) |
| Duda | 15,67–18,30 | Correo tachado y con glitch, "?" y ¿ESTAFA? | corte |
| Lobby | 18,30–19,80 | Botón UNIRSE, cursor que hace clic | pixelado |
| Llamada | 19,80–26,54 | La sala se llena; "todos falsos": malla naranja, pixelado, bloques; la música se corta | corte (clic) |
| Dinero | 26,54–29,43 | 15 filas, 5 cuentas, odómetro hasta 25 M $ | zoom a tile |
| Tiempo | 29,43–33,09 | 7 casillas sin numerales tachadas, aviso a la empresa | barrido de barra |
| Anónimo | 33,09–36,45 | Empleado y empresa pixelados, nombres ocultos, SIN DATOS | salto de pestaña |
| Lección 1 | 36,45–39,19 | Sala limpia: cara y voz con glitch y tachadas | pixelado |
| Lección 2 | 39,19–46,20 | Orden de pago → verificación → llamada de vuelta → check naranja | corte |
| CTA | 46,20–49,92 | Campo de comentario escribe AUDITORIA; ENVIAR en la última sílaba | rebanadas |
| Apagón + cierre | 49,92–52,0 | Apagón CRT; negro, logo y @aigencyx.labs; vuelve el tono de conexión | CRT |

## Matices que respeta el guion
- Todo atribuido a la policía de Hong Kong; "todos falsos" es lo que dice la policía.
- Sin nombre de empresa (ni en voz ni en pantalla) y sin decir qué herramienta de IA se usó.
- "Más de veinticinco millones": 200 M de dólares de Hong Kong ≈ 25,6 M de dólares estadounidenses.
- Sin sede del director financiero, sin detenciones, sin cifras de pérdidas globales.

## Decisiones
- El MP3 dura 49,7 s (más que los 43 s previstos): total 52 s, dentro de 30–60.
- El MP3 detecta 15 segmentos por pausas frente a 13 frases: dos frases largas llevan pausa interna (coma tras "compañeros" y dos puntos tras "alguien"). Coincide con la duración de cada tramo.
- La voz es idéntica al guion que aprobaste.
- Cuenta atrás visual: el odómetro enseña números intermedios al subir (es el efecto pedido); las casillas de la semana no llevan numerales. El reloj de la barra es analógico, sin cifras.
- Rótulos de 140 px (dos líneas) a 176 px (una línea). Se añadieron rótulos de apoyo ("VEINTICINCO MILLONES", "DE DÓLARES", "AHÍ ESTABAN") para que no haya huecos.
- Música: A menor, 104 bpm, sub-bajo en corcheas, filtro que se abre en cada bloque de dinero; se corta del todo en "falsos" (queda un zumbido de 50 Hz); en la lección entra un pulso más luminoso con acordes abiertos.
- Tono de conexión (dos campanillas): al empezar, al pulsar UNIRSE, desafinado y roto en la revelación, y limpio en el último segundo.
- Mezcla final con limitador (alimiter 0,8) para quedar bajo -1 dBTP tras el AAC.

## Pipeline
```
python scripts/align.py ../audio/raw/deepfake-jefe-falso/401d63f6.mp3   # data/words.json
python scripts/build.py                                                  # mix.wav + src/timeline.json
bash scripts/render.sh 8 2 out/reel-deepfake-jefe-falso.mp4
python scripts/qa.py out/reel-deepfake-jefe-falso.mp4 out/qa
```

## Fuentes (todas secundarias: las primarias no se pudieron abrir desde el entorno)
CNN 4-feb-2024 y 16-may-2024; Hong Kong Free Press 5-feb-2024; SCMP feb-2024; Gobierno de Hong Kong 26-jun-2024 (LCQ9); INCIBE (BEC fraud in multinational); Security Affairs 5-feb-2024; FBI IC3 PSA 3-dic-2024.

## Pendiente para ti antes de publicar
- Abrir una fuente primaria y confirmar: 15 transferencias, 5 cuentas, 200 M HK$, "todos los demás eran falsos".
- Decidir sobre "una semana después": viene de fuentes secundarias (INCIBE y otra); si no la ves en origen, cámbiala por "días después".
- Revisar si hay novedades posteriores a mayo de 2024 (detenciones, juicio).
