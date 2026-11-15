# Serie «Máster de Claude Code» · EP.7 «Cambios y correcciones: trabajar sin miedo a romper nada»

**Duración:** 2:09,5 (3.885 fotogramas), la de la voz · 1080x1920 · 30 fps · -13,7 LUFS, pico real -1,6 dBTP.
**Lección de origen:** 1.4 (checkpoints, ver el cambio antes de aceptarlo, /rewind).
**Proyecto:** `serie-claude-code/`, composición `Master`, bloques `intro, miedo, pasos12, pasos34, paso5, porque, tarea, cierre`.
**Entrega:** `entregas/serie-claude-code-ep-07.mp4` (entrega directa, sin render de prueba, por encargo).
**Producción:** `serie-claude-code/produccion/ep07/` (guion y voz, prompt maestro, logos y tomas, caption, notas).

## Render
```bash
cd serie-claude-code
ffmpeg -i ../audio/raw/serie-claude-code/ep-07_ElevenLabs_2026-11-15T16_04_20_Manu_Gordillo_v4.mp3 -af apad=pad_dur=1.2 -b:a 192k ../audio/raw/serie-claude-code/ep-07_montaje.mp3
python scripts/preparar.py episodios/ep-07.json --mp3 ../audio/raw/serie-claude-code/ep-07_montaje.mp3 --modelo <sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8>
node scripts/render-lote.mjs episodios/ep-07.json              # → out/claude-code-ep-07.mp4
python scripts/qa_master.py episodios/ep-07.json out/claude-code-ep-07.mp4
```

## Voz
Una sola toma de ElevenLabs (Manu Gordillo, v4), entera, con 1,2 s de cola para que termine el botón «Seguir».
Timestamps: Parakeet TDT local + texto del guion (349/360 palabras ancladas; el resto son cifras y «Claude», que el
reconocedor escribe de otra forma). La toma dice el guion completo, sin cambios.

## Guion
```
Episodio siete de cincuenta. Máster de Claude Code.
¿Y si lo estropeo? Es el mayor miedo cuando empiezas con Claude Code.
Hoy te lo quito, porque Claude Code guarda tu trabajo solo y te deja volver atrás en el tiempo.
Te lo enseño en cinco pasos.
Paso uno. Pides algo. Una instrucción normal, con tus palabras.
Paso dos. Antes de tocar nada, Claude Code crea un punto de guardado. Se llama checkpoint, y se hace solo.
Cada petición que haces es un punto de guardado nuevo.
Guarda los cien más recientes de la sesión, y los conserva junto a la conversación. Así que puedes volver atrás incluso otro día.
Paso tres. Claude te propone el cambio, marcado en colores. En rojo, lo que quita. En verde, lo que añade.
Paso cuatro. Tú decides. Lo revisas, y lo aceptas o lo rechazas. Si lo rechazas, le pides otro cambio.
Nada se cambia sin tu visto bueno.
Con una excepción: si activas el modo que se salta los permisos, el llamado bypass permissions, Claude ya no te pregunta.
Paso cinco. ¿Algo ha fallado? Vuelves atrás.
Con el cuadro de texto vacío, pulsa la tecla Escape dos veces, o escribe barra rewind, que en inglés significa rebobinar.
Se abre un menú con tus mensajes anteriores. Eliges el punto al que quieres volver, confirmas, y recuperas el código y la conversación tal como estaban.
Es una máquina del tiempo para tu proyecto.
Eso sí: deshace lo que cambió Claude, no lo que hayas tocado tú a mano.
¿Por qué importa tanto? Porque te da permiso para experimentar. Pruebas, te equivocas, y vuelves atrás sin perder nada.
Esa seguridad separa a quien avanza de quien tiene miedo de tocar.
Tu tarea: rechaza un cambio a propósito y pide otro. Y prueba barra rewind para volver a un punto anterior.
En resumen: pides, Claude guarda, te propone, tú decides, y si algo falla, rebobinas.
¿Quieres los esquemas de este episodio? Comenta AUDITORIA y te paso el enlace con todo.
Y si tienes un negocio, te preparamos una auditoría para optimizar tus procesos.
En el siguiente episodio, los errores típicos y cómo solucionarlos.
Sígueme para no perdértelo.
```

## Escenas (tiempos sacados del audio)
| # | Escena | Tiempo (s) | En pantalla |
|---|---|---|---|
| 1 | intro | 0,0–3,8 | rejilla 10x5 con los EP.1-6 encendidos, el 7 late y se enciende → partículas → logo de Claude + «CLAUDE CODE» pixelado + mascota |
| 2 | miedo | 3,9–8,2 | bocadillo «¿Y si lo estropeo?» palabra a palabra · ventana de código que se agrieta · EL MAYOR MIEDO · mascota de Claude Code |
| 3 | solucion | 8,4–13,8 | la grieta se cierra al revés · LA SOLUCIÓN · cae el marcador (GUARDA TU TRABAJO SOLO) · reloj con flecha de rebobinado (Y TE DEJA VOLVER ATRÁS) |
| 4 | cinco | 14,0–15,9 | EL CICLO · casillas 1-5 · 5 PASOS |
| 5 | paso1 | 16,2–20,2 | sello PASO 1 · chat de Claude Code: la petición se teclea y se envía · CON TUS PALABRAS |
| 6 | paso2 | 20,6–27,2 | sello PASO 2 · ANTES DE TOCAR NADA · línea de tiempo: la mascota deja el primer marcador · CHECKPOINT = PUNTO DE GUARDADO · SE HACE SOLO |
| 7 | paso2b | 27,5–30,4 | tres peticiones más → tres marcadores más · 1 PETICIÓN = 1 PUNTO DE GUARDADO |
| 8 | paso2c | 30,6–37,8 | contador hasta 100 con rejilla de 100 casillas · LOS 100 MÁS RECIENTES · «Guardados junto a la conversación» · calendario HOY → MAÑANA «incluso otro día» |
| 9 | paso3 | 38,1–45,2 | sello PASO 3 · ventana index.html «Claude propone este cambio»: línea roja (QUITA) y línea verde (AÑADE) |
| 10 | paso4 | 45,6–52,9 | sello PASO 4 · TÚ DECIDES · botones Aceptar / Rechazar · el cursor rechaza · se teclea otra petición · OTRA PROPUESTA |
| 11 | paso4b | 53,1–55,0 | escudo con ✓ · sello NADA SIN TU VISTO BUENO |
| 12 | paso4c | 55,3–62,1 | EXCEPCIÓN · interruptor «Bypass permissions · Se salta los permisos» se activa · el escudo se apaga y los cambios pasan solos · YA NO TE PREGUNTA |
| 13 | paso5 | 62,4–65,6 | sello PASO 5 · página rota con aviso · ¿ALGO HA FALLADO? · flecha de rebobinado · VUELVES ATRÁS |
| 14 | paso5b | 65,6–73,1 | cuadro de texto vacío · tecla esc del usuario que se hunde dos veces (×2) · se teclea /rewind · REWIND = REBOBINAR |
| 15 | paso5c | 73,2–81,6 | menú «Rewind to…» recreado: el cursor elige un mensaje anterior → «Fork and rewind» → Continue → «Code rewind successful» · la línea de tiempo vuelve al marcador elegido · CÓDIGO ✓ · CONVERSACIÓN ✓ · TAL COMO ESTABAN |
| 16 | paso5d | 81,8–84,1 | reloj grande con flecha de rebobinado · sello MÁQUINA DEL TIEMPO · PARA TU PROYECTO |
| 17 | paso5e | 84,3–88,3 | ESO SÍ · dos tarjetas: «Lo que cambió Claude» SE DESHACE ✓ / «Lo que tocaste tú a mano» (mano del usuario) NO SE DESHACE ✕ |
| 18 | porque | 88,6–95,6 | «¿Por qué importa tanto?» · matraz · PERMISO PARA EXPERIMENTAR · PRUEBAS → TE EQUIVOCAS → VUELVES ATRÁS · SIN PERDER NADA |
| 19 | porque2 | 95,6–99,2 | ESA SEGURIDAD MARCA LA DIFERENCIA · carril QUIEN AVANZA (con marcadores) / carril QUIEN TIENE MIEDO DE TOCAR (parado) |
| 20 | tarea | 99,5–106,0 | tarjeta TU TAREA con dos casillas que se marcan |
| 21 | resumen | 106,2–112,6 | EL CICLO en círculo: PIDES · GUARDA · PROPONE · DECIDES · REBOBINAS, cada uno al nombrarlo |
| 22 | cta | 112,6–117,9 | pregunta palabra a palabra · esquema del episodio (imagen del usuario) con el logo de Drive · AUDITORIA se teclea y se envía · Y TE PASO EL ENLACE |
| 23 | cta2 | 118,0–122,3 | sello AUDITORÍA PARA TU NEGOCIO · «Optimiza tus procesos» |
| 24 | avance | 122,5–126,4 | la rejilla marca el EP.7 hecho, el EP.8 late → tarjeta EP.8 PRÓXIMAMENTE · ERRORES TÍPICOS · Y cómo solucionarlos |
| 25 | seguir | 126,5–128,2 | «CLAUDE CODE» pixelado · perfil con el logo de AIgencyx Labs · @aigencyx.labs · rejilla 7/50 · Seguir → Siguiendo ✓ |

## Imágenes del usuario (nunca redibujadas ni recoloreadas)
- **Logos:** Claude, Claude Code (mascota y rótulo pixelado), VS Code y Drive (los del EP.2) y el de **AIgencyx Labs**
  (exportado de su diseño «AIgencyx Labs – Perfil», versión «Naranja grande») como avatar de la tarjeta de perfil.
- **Iconos:** marcador (cada punto de guardado), reloj (volver atrás / máquina del tiempo), tecla esc, mano y matraz,
  recortados de su hoja con transparencia. Se animan enteros y no pasan de 300 px en pantalla.
- **Esquema del episodio:** su PDF pasado a imagen, en el CTA.

## Decisiones
- **Sin tomas de pantalla:** el chat, el cambio en colores y el menú «Rewind to…» / «Fork and rewind» se recrean con
  los textos reales de Claude Code y datos ficticios (`mi-proyecto/index.html`, «Mi negocio»).
- **Indicador de pasos** fijo bajo los subtítulos (1-5, hechos con ✓, el actual con su nombre) y sello «PASO N» grande
  al empezar cada uno.
- **Rojo y verde** solo en las líneas del cambio, los botones Aceptar/Rechazar y los estados «se deshace / no se
  deshace», como en la interfaz real. El resto, paleta de la serie.
- **Datos comprobados** en la documentación oficial de checkpointing: 100 checkpoints por sesión, se guardan con la
  conversación, Esc dos veces con el cuadro vacío o /rewind, no se deshace lo editado a mano.
- **«Bypass permissions»:** el esquema original decía «BYPASS PERMISSIONS PLAN»; la voz lo cuenta como «el modo que se
  salta los permisos».
- **Formas genéricas** (bocadillo, escudo, calendario, interruptor, casillas): dibujadas en coral plano.

## Checklist (`scripts/qa_master.py`, todo en verde)
- 1080x1920 a 30 fps, 129,51 s = duración de la voz (129,49 s).
- Sincronía voz-texto: 360 palabras, cada una resaltada en su instante; 68 bloques de subtítulos, máximo 2 líneas,
  línea más ancha 956 de 960 px.
- Cambio visible como mucho cada 0,67 s.
- -13,7 LUFS integrados, pico real -1,6 dBTP.
- Revisión visual: fotogramas sueltos de cada escena con los tiempos reales + un fotograma cada 3 s del mp4 final.
