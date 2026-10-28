# Anuncio AIgencyx Labs: "Tu empleado invisible" (motion graphics isométrico nocturno)

**Formato:** 1080x1920 (9:16) · 30 fps · 45 s (1.350 fotogramas) · H.264.
**Audio:** música (la del vídeo que pasaste, desde su segundo 28, el estribillo) desde el primer fotograma hasta el final, con fundido de salida en el último segundo y bajada de unos 11 dB mientras habla el narrador. Voz: tres tomas de ElevenLabs (Guillermo Brazález), colocadas frase a frase. Mezcla a -14 LUFS, pico -1,2 dBFS. Se entrega también una copia con la pista de audio vacía para editar.
**Cámara:** 0-4 s, un único dolly-in desde un plano aéreo muy lejano de la ciudad hasta el local. A partir de 4 s, cámara bloqueada hasta el final (sin zoom, sin travelling, sin cortes).
**Estado del local:** rojo oscuro mate (#5A0F0F-#7A1414), sin emisión de luz → naranja emisivo (#FF6B1A / #FFB066) con glow, bloom y reflejos en el suelo y en los edificios cercanos. Las cuatro piezas (ordenador, agenda, teléfono fijo, mostrador) se encienden una a una en E5; el local entero, en E7 (33,0 s).
**Personajes:** dueño en crema (#FFF4EC), clientes en gris claro, asistente en naranja translúcido con borde de luz. Todos son siluetas lisas sin cara.
**Textos:** Sora ExtraBold, blancos, centrados entre el 10 % y el 25 % de la altura. Resaltador naranja (texto #14110F) para lo positivo y rojo oscuro (texto blanco) para lo negativo. Microtextos en JetBrains Mono.
**Móvil:** siempre abajo a la derecha (borde inferior al 82 % de la altura). Entra y sale deslizándose desde abajo.
**Marca:** solo en la escena final (logo "Oscuro" de AIgencyx Labs + @aigencyx.labs). La barra de comentarios de E8 usa un avatar genérico, sin logo y sin nombre de cuenta.

## Montaje con la voz (tomas entregadas)

Tomas en `audio/raw/empleado-invisible/`: A `5f74b8b5` (14,9 s), B `469c3d08` (17,4 s), C `d162facd` (6,3 s). Música: `music-28s.m4a` (recorte del segundo 28 en adelante). Todo se monta con `scripts/build.py`, que genera `public/audio/mix.wav` y `src/timeline.json`. Los textos y las animaciones toman de ahí los tiempos de cada palabra.

| Escena | Tiempo | Voz | En pantalla |
|---|---|---|---|
| E1 | 0-4 s | Tu mejor empleado no cobra nómina. (0,35 s) | Dolly-in. "Tu mejor empleado" → "**no cobra nómina**" (naranja, con "no") |
| E2 | 4-9,85 s | Ahora mismo lo haces todo a mano: llamadas, mensajes, citas apuntadas en una libreta… (4,05 s) | Caos: teléfono, tachones, cliente, móvil con mensajes sin leer. "Todo **a mano…**" (rojo oscuro, con "todo") |
| E3 | 9,85-12,55 s | Ahora imagina… (10,05 s) | El móvil se vacía y sale. Calma |
| E4 | 12,55-17,8 s | Tu empleado invisible. Está en el móvil, en el mostrador y en la agenda. (12,7 s) | Aparece el asistente; se desdobla al decir "Está…". Cada etiqueta (MÓVIL, MOSTRADOR, AGENDA) sale cuando se nombra |
| E5 | 17,8-25,55 s | Responde WhatsApp. Confirma citas. Envía recordatorios. Avisa de cambios. Todo a la vez. (17,95 s) | Cada etiqueta aparece con su frase y se marca ✓ al terminarla, encendiendo una pieza del local. "**A la vez**" fijo. Móvil: respuesta al instante y "¡Cita confirmada!" |
| E6 | 25,55-36,1 s | Un empleado: ocho horas, vacaciones, bajas y nómina. Tu asistente: veinticuatro horas, sin bajas, y siempre contesta. (25,75 s) | Tarjetas roja y naranja; cada línea sale cuando se dice. La roja se apaga y la naranja se enciende con "Tu asistente" |
| E7 | 36,1-38,75 s | Y tú, por fin, a lo importante. (36,35 s) | Todo el local en naranja, onda por las calles, clientes, contadores. "Tú, / a **lo importante**" |
| E8 | 38,75-42,85 s | Comenta auditoría y vemos qué podemos automatizar en tu negocio. (38,95 s) | Barra de comentarios; "AUDITORIA" se escribe al decirlo. Local como un faro |
| E9 | 42,85-45 s | (solo música, fundido final) | Logo de AIgencyx Labs + @aigencyx.labs |

## Notas
- En pantalla, AUDITORIA va sin tilde y en mayúsculas (como en los reels anteriores). En la voz, "auditoría".
- "WhatsApp" aparece solo como texto en una etiqueta, sin logotipo.
- Los datos ("-10 H / SEMANA", "0 MENSAJES SIN RESPONDER") y los mensajes del móvil son ilustrativos.
- El dueño no tiene cara (regla de siluetas lisas), así que en E7 la calma se transmite con el local lleno y fluido, no con una sonrisa.
- E6 dura 10,5 s porque las dos frases de la comparación ocupan ese tiempo en la toma B. Para no pasar de 45 s, E7 se queda en 2,6 s.
- Proyecto: `reel-empleado-invisible/` (Remotion). Audio: `python scripts/build.py`. Render: `scripts/render.sh`. Fotogramas sueltos: `scripts/stills.sh <frame>`.
