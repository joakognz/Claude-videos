# AIgencyx Labs · Reel restaurantes (9:16)

Vídeo vertical 1080×1920 a 30 fps para Instagram Reels, hecho con [Remotion](https://remotion.dev).
Versión corta: locución recortada (31,35 s) + 1 s de cierre en bucle = 32,35 s.
La versión larga (63 s) está en el commit `831c181`.

## Estructura

- `public/voiceover.mp3`: locución original completa.
- `public/voiceover_30s.mp3`: locución recortada a las frases clave y acelerada ×1,12 (`scripts/cut_voice.py`,
  que además imprime los tiempos nuevos de cada palabra clave).
- `public/music_30s.wav`: música electrónica minimalista a 110 BPM, generada con `scripts/make_music.py`
  (sube en las funciones, baja en «Mientras tanto, enfrente…» y vuelve a subir en el cierre).
- `src/reel/timeline.ts`: **todos los tiempos** (sacados de la transcripción por palabra), los textos en pantalla y la cámara.
  Si cambia la locución, se ajusta aquí.
- `src/reel/City.tsx`: ciudad isométrica nocturna (SVG), restaurantes verde/ámbar, red de automatizaciones.
- `src/reel/Phone.tsx`, `src/reel/Scenes.tsx`: interfaz de cada sección (chat, reserva, recordatorio, lista de espera, carta, reseñas…).
- `src/reel/Headline.tsx`: titulares con entrada desenfocada (0,3 s), palabra clave resaltada y etiqueta de sección.
- `src/reel/MotionBlur.tsx`: desenfoque de movimiento por sub-fotogramas, con muestras adaptativas según la velocidad.

## Comandos

```bash
npm i
npx remotion studio                       # previsualizar (composición AIgencyxReelPreview = sin motion blur, más rápida)
npx remotion render AIgencyxReel out/reel.mp4 --crf=16
python3 scripts/cut_voice.py public/voiceover.mp3 public/voiceover_30s.mp3
python3 scripts/make_music.py public/music_30s.wav 32.4 3.1 12.6 18.6 31.35 110
```

Sin acceso a remotion.media, se puede usar un Chromium local: `REMOTION_BROWSER=/ruta/chrome-headless-shell`.

Tipografía: Inter (SIL Open Font License), incluida en `public/fonts`.
