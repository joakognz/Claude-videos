# AIgencyx Labs · Reel restaurantes (9:16)

Vídeo vertical 1080×1920 a 30 fps para Instagram Reels, hecho con [Remotion](https://remotion.dev).
Versión corta: frases completas de la locución a velocidad natural (27,22 s) + 1 s de cierre en bucle = 28,22 s.
Versiones anteriores: 63 s en el commit `831c181`, 32 s en `7dd59d1`.

## Estructura

- `public/voiceover.mp3`: locución original completa.
- `public/voiceover_short.mp3`: locución recortada a las frases clave, completas y sin acelerar (`scripts/cut_voice.py`,
  que además imprime los tiempos nuevos de cada palabra clave).
- `public/music_short.wav`: música electrónica minimalista a 110 BPM, generada con `scripts/make_music.py`
  (sube en las funciones, baja en «Mientras tanto, enfrente…» y vuelve a subir en el cierre).
- `src/reel/timeline.ts`: **todos los tiempos** (sacados de la transcripción por palabra), los textos en pantalla y la cámara.
  Si cambia la locución, se ajusta aquí.
- `src/reel/City.tsx`: ciudad isométrica nocturna (SVG), restaurantes verde/ámbar, red de automatizaciones.
- `src/reel/Phone.tsx`, `src/reel/Scenes.tsx`: interfaz de cada sección (chat, reserva, recordatorio, lista de espera, carta, reseñas…).
- `src/reel/Headline.tsx`: titulares con entrada desenfocada (0,3 s), palabra clave resaltada y etiqueta de sección.
- `src/reel/Logo.tsx`: logo de AIgencyx Labs (versión oscura, Sora + naranja #FF6B1A) con animación de trazado.
- `src/reel/MotionBlur.tsx`: desenfoque de movimiento por sub-fotogramas, con muestras adaptativas según la velocidad.

## Comandos

```bash
npm i
npx remotion studio                       # previsualizar (composición AIgencyxReelPreview = sin motion blur, más rápida)
npx remotion render AIgencyxReel out/reel.mp4 --crf=16
python3 scripts/cut_voice.py public/voiceover.mp3 public/voiceover_short.mp3
python3 scripts/make_music.py public/music_short.wav 28.3 4.15 12.4 17.6 27.22 110
```

Sin acceso a remotion.media, se puede usar un Chromium local: `REMOTION_BROWSER=/ruta/chrome-headless-shell`.

Tipografías: Inter y Sora (SIL Open Font License), incluidas en `public/fonts`.
