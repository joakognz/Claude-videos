# Anuncio AIgencyx Labs: "Tu empleado invisible" (motion graphics isométrico nocturno)

**Formato:** 1080x1920 (9:16) · 30 fps · 45 s (1.350 fotogramas) · H.264.
**Audio:** ninguno. El MP4 lleva una pista de audio vacía (AAC estéreo 48 kHz, silencio) para que el editor tenga dónde montar la voz en off.
**Cámara:** 0-4 s, un único dolly-in desde un plano aéreo muy lejano de la ciudad hasta el local. A partir de 4 s, cámara bloqueada hasta el final (sin zoom, sin travelling, sin cortes).
**Estado del local:** rojo oscuro mate (#5A0F0F-#7A1414), sin emisión de luz → naranja emisivo (#FF6B1A / #FFB066) con glow, bloom y reflejos en el suelo y en los edificios cercanos. Las cuatro piezas (ordenador, agenda, teléfono fijo, mostrador) se encienden una a una en E5; el local entero, en E7 (33,0 s).
**Personajes:** dueño en crema (#FFF4EC), clientes en gris claro, asistente en naranja translúcido con borde de luz. Todos son siluetas lisas sin cara.
**Textos:** Sora ExtraBold, blancos, centrados entre el 10 % y el 25 % de la altura. Resaltador naranja (texto #14110F) para lo positivo y rojo oscuro (texto blanco) para lo negativo. Microtextos en JetBrains Mono.
**Móvil:** siempre abajo a la derecha (borde inferior al 82 % de la altura). Entra y sale deslizándose desde abajo.
**Marca:** solo en la escena final (logo "Oscuro" de AIgencyx Labs + @aigencyx.labs). La barra de comentarios de E8 usa un avatar genérico, sin logo y sin nombre de cuenta.

## Tiempos para sincronizar la voz

| Escena | Tiempo | Qué pasa | Texto en pantalla (aparece en) |
|---|---|---|---|
| E1 | 0,0-4,0 s | Dolly-in desde la ciudad hasta el local rojo y apagado. Dueño solo en el mostrador. | "Tu mejor empleado" (0,35 s) → "**no cobra nómina**" naranja (1,75 s) |
| E2 | 4,0-10,0 s | Teléfono fijo sonando (ondas rojo oscuro: 4,5 / 6,9 / 8,6 s), tachones en la libreta, el dueño atiende a un cliente. Móvil (entra a 4,7 s): llegan "¿Tenéis hueco mañana?" (5,2), "¿Me confirmas la cita?" (6,4) y "¿Hola? ¿Seguís abiertos?" (7,7), sin leer. | "Todo **a mano…**" rojo oscuro (4,35 s) |
| E3 | 10,0-14,0 s | El móvil se vacía (10,0) y sale (10,55). Calma. | "Ahora imagina…" (10,75 s) |
| E4 | 14,0-19,0 s | El asistente naranja se materializa junto al dueño (14,25). Se desdobla en tres (16,0): AGENDA, MOSTRADOR y MÓVIL (etiquetas a 17,0 s). | "Tu empleado / **invisible**" naranja (14,3 s; "invisible" a 14,95 s) |
| E5 | 19,0-27,0 s | Etiquetas que se completan: "Responde WhatsApp" (✓ a 20,2), "Confirma cita" (✓ 22,0), "Envía recordatorio" (✓ 23,8), "Avisa de cambios" (✓ 25,6). Cada ✓ enciende ordenador, agenda, teléfono y mostrador. Móvil (19,25-26,15): mensaje (19,95), respuesta al instante (20,8), "Sí, perfecto" (21,8), "¡Cita confirmada!" (22,6). | "**A la vez**" naranja (19,15 s) |
| E6 | 27,0-33,0 s | Tarjeta roja "EMPLEADO · 8 H · VACACIONES · BAJAS · NÓMINA" (27,2) y naranja "ASISTENTE · 24 H · SIN BAJAS · SIEMPRE CONTESTA" (27,65). La roja se apaga (30,3) y la naranja se enciende (30,75). | (sin titular; hablan las tarjetas) |
| E7 | 33,0-38,0 s | Todo el local se enciende en naranja con una onda por las calles (33,0). Se llena de clientes. Contadores "-10 H / SEMANA" (34,0) y "0 MENSAJES SIN RESPONDER" (34,6). Móvil con la bandeja a cero (33,7-37,95). | "Tú, / a **lo importante**" naranja (33,25 s) |
| E8 | 38,0-42,5 s | Barra de comentarios (38,35); se escribe "AUDITORIA" (39,0-40,3). La ciudad se oscurece y el local queda como un faro. | "Comenta / **AUDITORIA**" naranja (38,2 s) + "y vemos qué podemos automatizar en tu negocio." (39,2 s) |
| E9 | 42,5-45,0 s | Fundido a #14110F, logo de AIgencyx Labs (42,95) y "@aigencyx.labs" en naranja (43,35). | — |

## Guion orientativo para la voz (lo que dice la pantalla)

```
Tu mejor empleado no cobra nómina.
Todo a mano...
Ahora imagina...
Tu empleado invisible.
Responde WhatsApp, confirma citas, envía recordatorios y avisa de cambios. A la vez.
Un empleado: ocho horas, vacaciones, bajas y nómina. Tu asistente: veinticuatro horas, sin bajas, siempre contesta.
Y tú, a lo importante.
Comenta auditoría y vemos qué podemos automatizar en tu negocio.
```

## Notas
- En pantalla, AUDITORIA va sin tilde y en mayúsculas (como en los reels anteriores). En la voz, "auditoría".
- "WhatsApp" aparece solo como texto en una etiqueta, sin logotipo.
- Los datos ("-10 H / SEMANA", "0 MENSAJES SIN RESPONDER") y los mensajes del móvil son ilustrativos.
- El dueño no tiene cara (regla de siluetas lisas), así que en E7 la calma se transmite con el local lleno y fluido, no con una sonrisa.
- Proyecto: `reel-empleado-invisible/` (Remotion). Render: `scripts/render.sh`. Fotogramas sueltos: `scripts/stills.sh <frame>`.
