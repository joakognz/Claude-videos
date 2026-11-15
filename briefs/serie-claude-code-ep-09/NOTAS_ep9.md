# Serie «Máster de Claude Code» · EP.9 «Nivel experto» (lección 1.6), en dos partes

**Estado:** montado en `serie-claude-code/` (composición `Master`), `episodios/ep-09-parte1.json` y `ep-09-parte2.json`.
**Entregas:** `entregas/serie-claude-code-ep-09-parte1.mp4` y `entregas/serie-claude-code-ep-09-parte2.mp4`.
**Duración:** parte 1, 2:10 (2:09 de voz y 1 s de cola); parte 2, 2:09 (2:08 y 1 s de cola). Formato 1080x1920 a 30 fps.

## Por qué en dos partes
La lección tiene diez funciones. Se reparten como en el esquema:
- **Parte 1 · las de cada día:** CLAUDE.md, imágenes, modo Plan y checkpoints.
- **Parte 2 · las potentes:** subagentes, MCP, Remote Control y tres trucos (retomar sesiones, comandos con barra y dictado).

## Archivos
- `1_guion_y_voz/voz_ep9_parte1.txt` y `voz_ep9_parte2.txt`: los bloques de voz. Tomas de ElevenLabs (Manu Gordillo, v4,
  stability 50, similarity 75) en `audio/raw/serie-claude-code/ep-09-parte1.mp3` y `ep-09-parte2.mp3`; los montajes con
  la cola de 1 s, en `ep-09-parte1_montaje.mp3` y `ep-09-parte2_montaje.mp3`.
- `5_proyecto_remotion/PROMPT_MAESTRO_ep9_parte1.txt` y `_parte2.txt`: los prompts del guion, por si se monta con otra IA.
  El montaje final se aparta en algunos detalles (ver Escenas).
- `3_tomas_pantalla/tomas_ep9.txt`: no ha hecho falta grabarlas; las pantallas están recreadas.
- `4_assets_extra/logos_e_imagenes_ep9.txt`: lo que hace falta y lo que ya tienes.
- `7_publicacion/caption_ep9.txt`: los textos para Instagram de las dos partes.

## Render
```bash
cd serie-claude-code
python scripts/preparar.py episodios/ep-09-parte1.json --mp3 ../audio/raw/serie-claude-code/ep-09-parte1_montaje.mp3 --modelo <parakeet>
python scripts/preparar.py episodios/ep-09-parte2.json --mp3 ../audio/raw/serie-claude-code/ep-09-parte2_montaje.mp3 --modelo <parakeet>
node scripts/render-lote.mjs episodios/ep-09-parte1.json episodios/ep-09-parte2.json   # → out/claude-code-ep-09-parteN.mp4
python scripts/qa_master.py episodios/ep-09-parte1.json out/claude-code-ep-09-parte1.mp4
```
Los episodios en partes llevan `"parte": {"n", "de"}` (insignia «EP.9/50 · 1/2» y rótulo de la intro) y `"etiqueta"`
(`ep-09-parte1`: nombre de la carpeta de la voz y del mp4). Los tiempos por palabra salen del reconocedor local:
se anclaron 370 de 373 palabras en la parte 1 y 334 de 340 en la parte 2. La voz no se ha subido a ningún servicio.
El «Parte uno / Parte dos» va en su propia escena para que la intro no pase de 4 s.

## Escenas · parte 1 (bloques `ep9_*` en `src/master/bloques/ep09/`)
| Bloque | Tiempo | En pantalla |
|---|---|---|
| intro | 0–3,8 | la cuadrícula de 50 casillas, el EP.9 se enciende y forma el título |
| gancho | 3,8–20,9 | PARTE 1/2 → A CIEGAS (dados, «hazme una web») frente a EXPERTO → 4 cartas boca abajo, votos de la comunidad, CADA DÍA → el encargo: tu ilustración de la panadería y su web en alambre |
| memoria | 20,9–39,6 | PASO 1 · DALE MEMORIA: CLAUDE.md en Visual Studio Code con las reglas tecleadas y las muestras de color, UNA SOLA VEZ → la ficha del empleado nuevo (NUEVO, PRIMER DÍA) → tres sesiones la leen y los bocadillos repetidos se tachan → rejilla con el EP.5 |
| imagen | 39,6–58,2 | PASO 2 · ENSÉÑASELO: el panel de Claude Code, PEGA AQUÍ, una web / un boceto / un error → el boceto se pega y se teclea «hazme una portada como esta» → header, hero, CTA y grid se tachan (NO HACE FALTA) → Claude mira el boceto y construye la portada → rejilla con el EP.6 |
| plan | 58,2–83,6 | PASO 3 · MODO PLAN, EL MÁS VOTADO: el cursor abre el selector de modo y elige Plan → NO TOCA NADA → el plan con las páginas en orden, Aprobar / Corregir → el comentario añade el botón de WhatsApp → EL PLANO y el primer ladrillo esperando → dos páginas cambian de orden: CAMBIA ANTES DE CONSTRUIR |
| guardado | 83,6–102,6 | PASO 4 · CHECKPOINTS: tus mensajes y una bandera antes de cada uno → la mascota de Claude Code las recorre, PARTIDA GUARDADA → la web se rompe → el ratón sobre tu mensaje, rebobinar, «Rewind code to here» → la web vuelve pieza a pieza → NO PIERDES NADA → rejilla con el EP.7 |
| resumen | 102,6–109,4 | las cuatro cartas se dan la vuelta (MEMORIA · IMAGEN · PLAN · GUARDADO) → YA NO A CIEGAS |
| cta | 109,4–119,2 | el CTA del EP.8 (AUDITORIA, esquemas con Drive, AUDITORÍA PARA TU NEGOCIO) |
| avance | 119,2–130,1 | PARTE 2/2 · LAS POTENTES → ayudantes, conexiones, desde el móvil → perfil con tu logo de AIgencyx y Seguir → Siguiendo |

## Escenas · parte 2
| Bloque | Tiempo | En pantalla |
|---|---|---|
| intro | 0–3,8 | igual que la parte 1 |
| gancho2 | 3,8–17,1 | PARTE 2/2 → tres preguntas (¿repartir el trabajo? ¿usar tus herramientas? ¿hacerte caso desde el móvil?) → «Puede»: se marcan → LAS POTENTES → la panadería y la web de la parte 1 |
| subagentes | 17,1–38,8 | PASO 1: el encargado (logo de Claude) lanza dos ayudantes, cada uno en su espacio, y le devuelven el resultado → el panel sigue limpio con «2 agents» → ENCARGADO, TEXTOS y FALLOS → TÚ solo hablas con el encargado |
| mcp | 38,8–64,8 | PASO 2: logo de MCP, ESTÁNDAR ABIERTO, lo creó Anthropic → la regleta con Claude Code → se enchufa Airtable → la tabla de encargos, la petición tecleada y la web estrena «Los más encargados» → se enchufa Hostinger: DOMINIO y HOSTING → de CÓDIGO a NEGOCIO |
| remote | 64,8–84,5 | PASO 3: se teclea /remote-control con el menú de comandos → «Remote Control is active…» → la misma conversación en la app de Claude del móvil y en claude.ai/code → desde fuera se pide «añade el pan de centeno a la portada» y la web lo estrena → LO HACE TU ORDENADOR → Encendido y DÉJALO ENCENDIDO |
| trucos | 84,5–104,2 | PASO 4 · 3 TRUCOS: el historial de sesiones (la de ayer) → «/» con /init resaltado (EP.5) → el micrófono y el texto que se escribe solo |
| resumen | 104,2–112,4 | SUBAGENTES reparten · MCP conecta · REMOTE CONTROL desde el móvil |
| cta | 112,4–122,4 | el CTA del EP.8 |
| avance | 122,4–128,8 | la rejilla marca el EP.9 y el EP.10 late → EP.10 · EL MAPA COMPLETO → perfil y Seguir |

## Cambios respecto al vídeo del curso
- **Otro orden:** la parte 1 es un flujo de trabajo (memoria → imagen → plan → rebobinar); el curso es una lista que
  empieza por el modo Plan. Las funciones van repartidas en dos reels, con sus propios ganchos.
- **Metáforas propias:** la ficha del empleado nuevo, el plano antes del primer ladrillo, los puntos de guardado de un
  videojuego, el encargado con sus ayudantes y la regleta como enchufe universal.
- **Otro ejemplo:** la web de una panadería (tu boceto e ilustración), con sus encargos en Airtable. En el curso es la web
  de otro negocio y la conexión con una cuenta de anuncios.
- No se usan las frases, el documento, las diapositivas ni la grabación del curso. Del vídeo solo se miró la interfaz.

## Datos comprobados (documentación de Claude Code)
- Modo Plan en el selector de modo del cuadro de Claude, con el plan como documento comentable; «Manual» es el modo por
  defecto que aparece en ese selector.
- Rebobinar: botón al pasar el ratón por un mensaje, con «Fork conversation from here», «Rewind code to here» y
  «Fork conversation and rewind code».
- Subagentes con su propio contexto y contador de agentes en el cuadro de entrada.
- MCP: estándar abierto creado por Anthropic; Hostinger y Airtable tienen servidor MCP oficial.
- Remote Control: `/remote-control` en Visual Studio Code; se sigue desde la app de Claude o claude.ai/code; la sesión
  corre en tu ordenador, que tiene que seguir encendido. Requiere suscripción de Claude (no funciona con clave de API):
  no se dice en la voz.
- Historial de sesiones (botón del reloj), menú de comandos con «/» y dictado con el micrófono.

## Decisiones
- **Logos:** solo los tuyos. El de AIgencyx es la variante «Oscuro» de tu lienzo de perfil, pasada a PNG tal cual.
  WhatsApp trae su fondo blanco, así que va dentro de botones claros. MCP y Airtable, sobre ficha clara.
- **Web de la panadería:** recreada a partir de tu lienzo «Boceto web – Panadería» (colores, Fraunces y DM Sans, textos
  y dibujos de los panes), en versión vertical. Las fuentes Fraunces y DM Sans están en `public/fonts/` (licencia OFL).
- **Pantallas:** Visual Studio Code con Claude Code, la app de Claude y claude.ai/code recreadas con datos ficticios.
  Las etiquetas de la interfaz van en inglés, como en la extensión.
- **Música y efectos:** la música del proyecto a -20 dB, con -8 dB bajo la voz; golpes en los sellos, tecleo y clics.
