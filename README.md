# AIgencyx Labs · Reels 9:16

Vídeo vertical 1080×1920 a 30 fps para Instagram Reels, hecho con [Remotion](https://remotion.dev).
Versión corta: frases completas de la locución a velocidad natural (27,22 s) + 1 s de cierre en bucle = 28,22 s.
Versiones anteriores: 63 s en el commit `831c181`, 32 s en `7dd59d1`.

## Estructura

- `public/voiceover.mp3`: locución original completa.
- `public/voiceover_short.mp3`: locución recortada a las frases clave, completas y sin acelerar (`scripts/cut_voice.py`,
  que además imprime los tiempos nuevos de cada palabra clave).
- Sin música de fondo (solo la locución). `scripts/make_music.py` sigue disponible si se quiere añadir.
- `src/reel/timeline.ts`: **todos los tiempos** (sacados de la transcripción por palabra), los textos en pantalla y la cámara.
  Si cambia la locución, se ajusta aquí.
- `src/reel/City.tsx`: ciudad isométrica nocturna (SVG), restaurantes verde/ámbar, red de automatizaciones.
- `src/reel/Phone.tsx`, `src/reel/Scenes.tsx`: interfaz de cada sección (chat, reserva, recordatorio, lista de espera, carta, reseñas…).
- `src/reel/Headline.tsx`: titulares con entrada desenfocada (0,3 s), palabra clave resaltada y etiqueta de sección.
- Movimiento constante: cámara con deriva y giro, golpes de zoom en cada frase, transiciones "zoom a través"
  con destello en los cortes (`CUTS` en `timeline.ts`), titulares cinéticos y tarjetas que flotan.
- `src/reel/Logo.tsx`: logo de AIgencyx Labs (versión oscura, Sora + naranja #FF6B1A) con animación de trazado.
- `src/reel/MotionBlur.tsx`: desenfoque de movimiento por sub-fotogramas, con muestras adaptativas según la velocidad.

## Comandos

```bash
npm i
npx remotion studio                       # previsualizar (composición AIgencyxReelPreview = sin motion blur, más rápida)
npx remotion render AIgencyxReel out/reel.mp4 --crf=16
python3 scripts/cut_voice.py public/voiceover.mp3 public/voiceover_short.mp3
```

Sin acceso a remotion.media, se puede usar un Chromium local: `REMOTION_BROWSER=/ruta/chrome-headless-shell`.

Tipografías: Inter y Sora (SIL Open Font License), incluidas en `public/fonts`.

## Reel peluquerías (`AIgencyxPeluqueria`)

- `src/salon/timeline.ts`: inicio de cada palabra clave de la locución (`A`), textos en pantalla y cámara.
  **Al recibir el mp3**: transcribir con marcas por palabra y actualizar solo el bloque `A`.
- `src/salon/Salon.tsx`: peluquería isométrica en corte (espejos, sillón, estilista con guantes de tinte,
  mostrador con el móvil) y salón de enfrente al otro lado de la calle. Ámbar = problema; lima = con agente.
- `src/salon/Overlays.tsx`: mensaje sin contestar, web de reservas → escaparate, panel del agente con la agenda,
  logo + herramientas, comentario AUDITORIA y respuesta final.
- Partes compartidas en `src/reel/`: `camera.ts`, `Headline.tsx`, `MotionBlur.tsx`, `CommentCard.tsx`, `Logo.tsx`.

```bash
npx remotion render AIgencyxPeluqueria out/peluqueria.mp4 --crf=16
```
