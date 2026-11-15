# Serie «Máster de Claude Code» · EP.9 «Nivel experto» (lección 1.6), en dos partes

**Estado:** guion listo. Falta la voz (dos MP3) y los logos e imágenes marcados como FALTA.

## Por qué en dos partes
La lección tiene diez funciones. En un solo reel tocarían a unos 12 s cada una. Se reparten como en el esquema:
- **Parte 1 · las de cada día:** CLAUDE.md, imágenes, modo Plan y checkpoints. Unas 376 palabras, unos 2:12.
- **Parte 2 · las potentes:** subagentes, MCP, Remote Control y tres trucos (retomar sesiones, comandos con barra
  y dictado por voz). Unas 347 palabras, unos 2:02.

## Archivos
- `1_guion_y_voz/voz_ep9_parte1.txt` y `voz_ep9_parte2.txt`: los bloques de voz para ElevenLabs.
- `5_proyecto_remotion/PROMPT_MAESTRO_ep9_parte1.txt` y `_parte2.txt`: escenas, logos y tomas de cada parte.
- `4_assets_extra/logos_e_imagenes_ep9.txt`: lo que hace falta y lo que ya tienes.
- `3_tomas_pantalla/tomas_ep9.txt`: no hace falta grabarlas; se recrean como en el EP.8.

## Voz
- Misma voz que el EP.8 (v4, stability 50, similarity 75).
- Archivos: `audio/raw/serie-claude-code/ep-09-parte1.mp3` y `ep-09-parte2.mp3`.
- En el JSON de escenas (para los subtítulos) se escribe «CLAUDE.md», «/remote-control», «/init» y «MCP».

## Cambios respecto al vídeo del curso
- **Otro orden:** la parte 1 es un flujo de trabajo (memoria → imagen → plan → rebobinar). En el curso es una lista
  que empieza por el modo Plan.
- **Metáforas propias:** la ficha del empleado nuevo (CLAUDE.md), el plano antes del primer ladrillo (Plan), los
  puntos de guardado de un videojuego (checkpoints), el encargado y sus ayudantes (subagentes) y el enchufe
  universal (MCP).
- **Otro ejemplo:** la web de una panadería, con sus encargos en Airtable. En el curso es la web de otro negocio y la
  conexión con una cuenta de anuncios.
- No se usan las frases, el documento, las diapositivas ni la grabación del curso.

## Datos comprobados (documentación de Claude Code)
- **Modo Plan:** en Visual Studio Code se elige en el selector de modo, abajo en el cuadro de Claude; el plan se abre
  como documento y se puede comentar.
- **Checkpoints:** al pasar el ratón por un mensaje sale el botón de rebobinar («Rewind code to here»).
- **Imágenes:** se pegan en el cuadro de Claude.
- **Subagentes:** cada uno trabaja en su propio contexto y devuelve el resultado.
- **MCP:** estándar abierto creado por Anthropic. Hostinger y Airtable tienen servidor MCP oficial.
- **Remote Control:** `/remote-control` en Visual Studio Code. Se sigue desde la app de Claude o claude.ai/code, la
  sesión corre en tu ordenador y este tiene que seguir encendido. Requiere iniciar sesión con una suscripción de
  Claude (no funciona con clave de API); no se dice en la voz.
- **Historial de sesiones** arriba en el panel, menú de comandos con «/», y dictado con el micrófono.

## Pendiente
- Voz de las dos partes.
- logo_mcp, logo_airtable y panaderia.jpg (FALTA). logo_whatsapp, logo_hostinger y logo_aigencyx: están en tu
  carpeta pero no en este repositorio.
- Caption de las dos partes, cuando se monte.
