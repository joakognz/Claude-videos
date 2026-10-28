# Anuncio AIgencyx Labs: "Tu empleado invisible" (motion graphics isométrico nocturno)

**Formato:** 1080x1920 (9:16) · 30 fps · 45 s (1.350 fotogramas) · H.264.
**Audio:** música de tu vídeo desde su segundo 30,4 (un compás después del 28) hasta el final, con fundido de salida en el último segundo. El narrador va 3 dB por encima de la música, que baja 8 dB mientras habla, así que en las pausas la música llena el hueco. Voz: tres tomas de ElevenLabs (Guillermo Brazález), frase a frase y con pausas cortas. Mezcla a -14 LUFS, pico -1,2 dBFS. Se entrega también una copia con la pista de audio vacía.
**Cámara:** 0-4 s, un único dolly-in desde un plano aéreo muy lejano de la ciudad hasta el local. A partir de 4 s, cámara bloqueada hasta el final (sin zoom, sin travelling, sin cortes).
**Estado del local:** rojo oscuro mate (#5A0F0F-#7A1414), sin emisión de luz → naranja emisivo (#FF6B1A / #FFB066) con glow, bloom y reflejos en el suelo y en los edificios cercanos. Las cuatro piezas (ordenador, agenda, teléfono fijo, mostrador) se encienden una a una en E5; el local entero, en E7 (33,0 s).
**Personajes:** dueño en crema (#FFF4EC), clientes en gris claro, asistente en naranja translúcido con borde de luz. Todos son siluetas lisas sin cara.
**Textos:** Sora ExtraBold, blancos, centrados entre el 10 % y el 25 % de la altura. Resaltador naranja (texto #14110F) para lo positivo y rojo oscuro (texto blanco) para lo negativo. Microtextos en JetBrains Mono.
**Móvil:** siempre abajo a la derecha (borde inferior al 82 % de la altura). Entra y sale deslizándose desde abajo.
**Marca:** solo en la escena final (logo "Oscuro" de AIgencyx Labs + @aigencyx.labs). La barra de comentarios de E8 usa un avatar genérico, sin logo y sin nombre de cuenta.

## Montaje con la voz y la música

Tomas en `audio/raw/empleado-invisible/`: A `5f74b8b5`, B `469c3d08`, C `d162facd`. Música: `music-28s.m4a` (50 s desde el segundo 28 de la canción). `scripts/build.py` genera `public/audio/mix.wav` y `src/timeline.json`, con las palabras, la curva de energía de la música y sus golpes. El brillo naranja respira con la música y da un golpe con cada acento fuerte.

**Sincronía con la canción**
- 0-12,6 s: parte tranquila de la canción (caos y "Ahora imagina…").
- **12,6 s, entrada del bajo** (segundo 43,0 de la canción) = "Tu empleado invisible": el asistente aparece con rayos, destello y dos anillos en el suelo.
- **29,8 s, inicio de compás** (segundo 60,2 de la canción) = "Tu asistente…": todo el local se enciende con un haz de luz hacia el cielo, destello, chispas y una onda por las calles.
- Desde 12,6 s la canción va con todo, igual que el vídeo: tareas, tarjetas, local encendido y CTA.

| Escena | Tiempo | Voz (inicio) |
|---|---|---|
| E1 | 0-4 s | Tu mejor empleado no cobra nómina. (0,45) |
| E2 | 4-9 s | Ahora mismo lo haces todo a mano: (2,85) llamadas, mensajes, citas… (5,0) |
| E3 | 9-11,85 s | Ahora imagina… (9,95) |
| E4 | 11,85-17,25 s | Tu empleado invisible. (12,6) Está en el móvil, en el mostrador y en la agenda. (14,25) |
| E5 | 17,25-24,1 s | Responde WhatsApp (17,4) · Confirma citas (18,75) · Envía recordatorios (20,05) · Avisa de cambios (21,7) · Todo a la vez (23,1) |
| E6 | 24,1-34,45 s | Un empleado: ocho horas… (24,25) · Tu asistente: veinticuatro horas… (29,81, el local se enciende) |
| E7 | 34,45-37,4 s | Y tú, por fin, a lo importante. (34,85) |
| E8 | 37,4-42,25 s | Comenta auditoría y vemos qué podemos automatizar en tu negocio. (37,55) |
| E9 | 42,25-45 s | (música) logo + @aigencyx.labs |

## Notas
- En pantalla, AUDITORIA va sin tilde y en mayúsculas (como en los reels anteriores). En la voz, "auditoría".
- "WhatsApp" aparece solo como texto en una etiqueta, sin logotipo.
- Los datos ("-10 H / SEMANA", "0 MENSAJES SIN RESPONDER") y los mensajes del móvil son ilustrativos.
- El dueño no tiene cara (regla de siluetas lisas), así que en E7 la calma se transmite con el local lleno y fluido, no con una sonrisa.
- El local se enciende con "Tu asistente" (y no en E7) para que coincida con el compás de la canción. Las tarjetas siguen en pantalla hasta que termina la frase.
- Proyecto: `reel-empleado-invisible/` (Remotion). Audio: `python scripts/build.py`. Render: `scripts/render.sh`. Fotogramas sueltos: `scripts/stills.sh <frame>`.
