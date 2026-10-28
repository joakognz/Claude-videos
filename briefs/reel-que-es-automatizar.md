# Reel AIgencyx Labs: "¿Qué es una automatización?" (plano fijo isométrico nocturno)

**Duración:** 58 s · 1080x1920 · 30 fps (si la voz lo pide, ±1 s).
**Negocio de ejemplo:** local genérico de barrio con cartel "TU NEGOCIO", sin sector concreto.
**Cámara:** un solo plano fijo, lejano, isométrico elevado. Sin zoom, sin travelling, sin cortes.
**Estilo:** ciudad nocturna, edificios #0A0A0A–#141414. Antes: gris #3A3A3A–#555555, mate. Después: naranja #FF7A00 / #FFA040 con glow.
**Voz:** narrador en español de España, leyendo lo mismo que sale en pantalla. Debajo, base electrónica minimalista sin letra que se vuelve más brillante en el "después", clics de interfaz, "ding" de confirmación y vibración de móvil.

## Estructura

| Escena | Tiempo | Voz | Texto en pantalla (palabra resaltada) |
|---|---|---|---|
| E1 | 0-4 s | Tienes un negocio. | Tienes un **negocio.** (gris) |
| E2 | 4-8 s | Llamadas, mensajes, pedidos y citas... apuntados a mano. | Llamadas, mensajes, pedidos y citas apuntados a mano… |
| E3 | 8-11 s | Quizá no sabes qué es una automatización. | Quizá no sabes qué es una **automatización.** |
| E4 | 11-14 s | Te lo explico. | Te lo **explico.** (naranja) · destello en el cartel |
| E5 | 14-21 s | Automatizar es que tu negocio haga solo lo repetitivo. Te escriben... y se contesta solo. | Automatizar es que tu negocio haga **solo** lo repetitivo. · WhatsApp en el móvil |
| E6 | 21-25 s | Responder mensajes. Confirmar citas y pedidos. Enviar recordatorios. Avisar de cambios. | Mini-lista que se enciende línea a línea |
| E7 | 25-29 s | ¿Y una web? | ¿Y una web? · rótulo "WEB" gris |
| E8 | 29-37 s | Una web no te ahorra todo el tiempo... porque la gente sigue llamando, y tú sigues confirmando. | Una web **no** te ahorra todo el tiempo… / …porque la gente sigue llamando y tú **sigues confirmando.** |
| E9 | 37-41 s | La web es un escaparate. La automatización, un empleado que no duerme. | La web es un escaparate. / La automatización, un empleado que **no duerme.** |
| E10 | 41-44 s | Este era tu negocio antes. | Este era tu negocio **antes.** (gris) · vuelve el caos |
| E11 | 44-50 s | Y así es tu negocio con automatización. | Así es tu negocio **con automatización.** · onda naranja |
| E12 | 50-54 s | Ahora sí marca la diferencia. | Ahora sí marca la **diferencia.** · contadores |
| E13 | 54-58 s | Comenta auditoría y te enseño cómo quedaría tu negocio. | Comenta **AUDITORIA** · y te enseño cómo quedaría tu negocio. · fundido con el logo de AIgencyx Labs y @aigencyx.labs |

## Guion para ElevenLabs: narrador (texto plano)

Voz recomendada: Guillermo Brazález Multilingual (qUPtETgSYRhCRb2pfOla), la de los reels anteriores.
Ajustes: Multilingual v2 · velocidad 1.10 · estabilidad 35 % · similitud 75 % · estilo 25-30 % · speaker boost.
Genera cada bloque por separado (tres mp3). Si prefieres una sola toma con todo, también sirve: la corto por los silencios.

**Bloque A** (E1-E4, 0-14 s)
```
Tienes un negocio.
Llamadas, mensajes, pedidos y citas... apuntados a mano.
Quizá no sabes qué es una automatización.
Te lo explico.
```

**Bloque B** (E5-E9, 14-41 s)
```
Automatizar es que tu negocio haga solo lo repetitivo.
Te escriben... y se contesta solo.
Responder mensajes. Confirmar citas y pedidos. Enviar recordatorios. Avisar de cambios.
¿Y una web?
Una web no te ahorra todo el tiempo...
porque la gente sigue llamando, y tú sigues confirmando.
La web es un escaparate. La automatización, un empleado que no duerme.
```

**Bloque C** (E10-E13, 41-58 s)
```
Este era tu negocio antes.
Y así es tu negocio con automatización.
Ahora sí marca la diferencia.
Comenta auditoría y te enseño cómo quedaría tu negocio.
```

Notas de lectura:
- La palabra clave es **AUDITORIA**: en pantalla, sin tilde y en mayúsculas (como en "Dos noches"). En la voz va "auditoría", en minúscula y con tilde, para que la pronuncie bien.
- Los "..." marcan una pausa corta. En E5, la pausa de "Te escriben..." coincide con el WhatsApp que llega al móvil, y "se contesta solo" con la respuesta automática.
- En voz se dice "Te escriben" en vez de "WhatsApp" para no nombrar la marca.
- La lista de E6 es la parte más justa (unos 4 s). Si la toma va lenta, alargo E6 hasta 1 s y recorto el silencio de E7.
- Cálculo a unas 150 palabras por minuto: el bloque A dura unos 8 s, el B unos 22 s y el C unos 9 s. El resto son pausas, la onda naranja de E11 y el cierre. Encaja en los 58 s.

## Montaje (tomas entregadas)
- Tomas: A `8e6035ca` (9,6 s), B `2f6384e0` (28,8 s), C `1dd43732` (11,1 s). Proyecto: `reel-que-es-automatizar/`.
- La toma B trae unos 3,5 s de voz después de "un empleado que no duerme" que no están en el guion. No se usan.
- Duración final: 58,6 s (1.758 fotogramas), -14 LUFS. La voz se coloca frase a frase (`scripts/build.py`), y de ahí salen los tiempos de textos y animaciones.
- En pantalla, E11 dice "Así es tu negocio con automatización." aunque la voz dice "Y así es…".

## Antes de publicar
- El negocio, los mensajes y los contadores ("-10 H / SEMANA", "0 LLAMADAS PERDIDAS") son ilustrativos.
- La burbuja del móvil es genérica (sin logo de WhatsApp). El icono de Instagram solo aparece junto a @aigencyx.labs (marca de agua, barra de comentarios y cierre).
- **Portada sugerida:** "¿Qué es una automatización?"
