# Reel AIgencyx Labs: "Dos peluquerías" (ciudad isométrica nocturna)

**Duración:** 58 s · 1080x1920 · 30 fps (si la voz lo pide, ±1 s).
**Negocios de ejemplo (ficticios):** Peluquería 1 (gris, sin sistema) · Peluquería 2 (naranja, con sistema).
**Estilo:** maqueta isométrica de ciudad de noche, edificios #0A0A0A–#141414. Con sistema: naranja #FF7A00 / #FFA040 con glow. Sin sistema: gris #3A3A3A–#555555, mate.
**Voz:** narrador en español de España. Debajo, música electrónica minimalista sin letra, clics de interfaz y un "ding" en cada reserva.

## Estructura

| Escena | Tiempo | Voz | Texto en pantalla (palabra resaltada) |
|---|---|---|---|
| E1 | 0-3 s | Misma calle. Dos peluquerías. | Misma calle. **Dos** peluquerías. |
| E2 | 3-6 s | Mismos servicios. Mismo precio. | Mismos servicios. **Mismo precio.** |
| E3 | 6-9 s | Pero una siempre está llena. | Pero una siempre está **llena.** |
| E4 | 9-12 s | ¿La diferencia? Tiene un sistema. | Tiene un **sistema.** |
| E5 | 12-16 s | Sus clientes reservan solos, desde el móvil. | Reservan **solos.** · etapa RESERVA |
| E6 | 16-19 s | A cualquier hora. Sin llamar. | A cualquier hora. **Sin llamar.** · etapa AGENDA |
| E7 | 19-23 s | Cero citas pisadas: cada hueco, para una sola persona. | Cero citas **pisadas.** |
| E8 | 23-27 s | Si alguien cancela… | Si alguien **cancela…** (gris) · etapa ESPERA |
| E9 | 27-31 s | …la lista de espera se entera al momento. | La lista de espera **se entera.** |
| E10 | 31-35 s | Y cada cliente suma puntos. | Cada cliente suma **puntos.** · etapa PUNTOS |
| E11 | 35-39 s | Con ciento veinte, el corte le sale gratis. Y vuelve. | Tarjeta "LAURA · TUS PUNTOS 120" |
| E12 | 39-42 s | Mientras tanto, la otra… | Mientras tanto, **la otra…** (gris) |
| E13 | 42-46 s | Libreta y WhatsApp. | **Libreta** y WhatsApp. (gris) |
| E14 | 46-50 s | Mensajes sin contestar y las tijeras en la mano. Tu negocio se llama… | Tu negocio se llama… (se corta) |
| E15 | 50-53 s | ¿Y tú? | ¿Y tú? |
| E16 | 53-56 s | Comenta PELUQUERÍA y te muestro cómo quedaría el tuyo. | Comenta **PELUQUERÍA** · y te muestro cómo quedaría el **tuyo.** |
| E17 | 56-58 s | (sin voz) | Fundido a negro, icono de Instagram y @aigencyxlabs |

## Guion para ElevenLabs: narrador (texto plano)

Voz recomendada: Guillermo Brazález Multilingual (qUPtETgSYRhCRb2pfOla), la de los reels anteriores.
Ajustes: Multilingual v2 · velocidad 1.10 · estabilidad 35 % · similitud 75 % · estilo 25-30 % · speaker boost.
Genera cada bloque por separado (tres mp3). Si prefieres una sola toma con todo, también sirve: la corto por los silencios.

**Bloque A** (E1-E4, 0-12 s)
```
Misma calle. Dos peluquerías.
Mismos servicios. Mismo precio.
Pero una siempre está llena.
¿La diferencia? Tiene un sistema.
```

**Bloque B** (E5-E11, 12-39 s)
```
Sus clientes reservan solos, desde el móvil.
A cualquier hora. Sin llamar.
Cero citas pisadas: cada hueco, para una sola persona.
Si alguien cancela... la lista de espera se entera al momento.
Y cada cliente suma puntos.
Con ciento veinte, el corte le sale gratis. Y vuelve.
```

**Bloque C** (E12-E16, 39-56 s)
```
Mientras tanto, la otra...
Libreta y WhatsApp.
Mensajes sin contestar y las tijeras en la mano.
Tu negocio se llama...
¿Y tú?
Comenta peluquería y te muestro cómo quedaría el tuyo.
```

Notas de lectura:
- "peluquería" va en minúscula en la voz para que no la deletree. En pantalla sale "PELUQUERÍA".
- "ciento veinte" va en letra para que se lea igual en todas las tomas.
- Los "..." marcan una pausa en suspenso. En "Tu negocio se llama..." la frase se queda en el aire a propósito.
- Si "WhatsApp" suena raro, prueba "guasap" en esa toma.
- Cálculo a unas 150 palabras por minuto: el bloque A dura unos 8 s, el B unos 19 s y el C unos 12 s. El resto son pausas y transiciones de cámara. Encaja en los 58 s.

## Decisiones de montaje
- Proyecto Remotion: `reel-dos-peluquerias/`. Ciudad 3D isométrica real (Three.js, cámara ortográfica con un único eje en todo el vídeo), con bloom y profundidad de campo tipo maqueta.
- La voz se coloca frase a frase al inicio de cada escena (`scripts/build.py`). Las tomas se usan tal cual, sin estirarlas.
- E9: quien estaba en la lista de espera es Laura. Su etiqueta "LAURA · 17:30" sustituye a la de Fede, y es la misma Laura de la tarjeta de puntos (E11).
- E14: además de las cuatro preguntas del guion, siguen llegando burbujas ("¿Hola?", "¿Abrís el sábado?"…) y un contador "SIN RESPONDER".
- Cierre (E17): logo de AIgencyx Labs, icono de Instagram y @aigencyxlabs.

## Antes de publicar
- Las dos peluquerías, los nombres (Nico, Lucas, Fede, Laura) y los puntos son ficticios.
- El icono de Instagram solo aparece junto a @aigencyxlabs (marca de agua, barra de comentarios y cierre). No sale ningún otro logo real.
- **Portada sugerida:** "Misma calle. Dos peluquerías."
