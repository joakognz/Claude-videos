# Reel AIgencyx Labs: «Globo que no existe»

**Duración:** 34,67 s (1.040 frames) · 1080x1920 · 30 fps · -14 LUFS, pico real -2,1 dBTP.
**Gancho:** idea tomada de la grabación de pantalla que me pasaste (un reel de terceros). Aquí la he rehecho entera en 3D original; esa grabación no aparece en el vídeo.
**Estilo:** render 3D de estudio sobre negro (#050505 que baja a #1a0d06 en la parte de abajo) que se convierte en wireframe naranja #FF6B1A / #FFB066. Texto blanco y HUD gris #8A8A8A. Sin rojo, azul ni verde.
**Voz:** una sola toma de ElevenLabs (Martin Osborne, Deep and Passionate, v4), usada entera, sin cortes ni cambios de velocidad. El MP3 no trae silencio inicial: la voz empieza a los 0,050 s. Por eso se coloca a los 6,950 s, de modo que el primer fonema cae justo en el frame 210 (7,000 s).

## Guion final (el MP3 tal cual)
```
Acabas de mirar un globo durante siete segundos.
Un globo que no existe.
No hay goma, ni aire, ni fotografía. Lo ha dibujado un ordenador.
Y tú has esperado hasta el final.
Esto es lo de menos de lo que hacemos en AIgencyx Labs.
Lo que hacemos de verdad es que tu negocio trabaje solo, mientras tú haces otra cosa.
Comenta auditoría y te ayudamos a automatizar tu negocio.
```
Las pausas de la toma dan 11 tramos que forman las 7 frases: la frase 3 se corta en 2 tramos, la 4 en 2 y la 6 en 3. Todos encajan con el guion.

## Escenas (tiempos reales del vídeo)

| Bloque / escena | Tiempo | Voz | En pantalla | Transición de entrada |
|---|---|---|---|---|
| A · Cuenta atrás | 0–7,0 s (f 0–210) | — | Globo naranja de estudio, aguja de acero, HUD (● REC, código de tiempo, CAM 01) y contador 211 → 001. Plano general con un acercamiento del 8 %. En el frame 64 hay un zoom de 6 frames a un macro de la parte de arriba del globo, como en el gancho original, y desde ahí otro acercamiento del 8 %. Pausas en 138 (f 31) y 045 (f 115) con la aguja vibrando 1 px. Toque en el frame 170, hoyuelo hasta el 195. **Congelado en el frame 195**: solo parpadea el REC | — |
| 1 | 7,0–10,1 s | Acabas de mirar un globo durante siete segundos. | Sigue la imagen congelada. Rótulo «Acabas de mirar un **globo** / durante **7** segundos», palabra a palabra | corte seco (desaparece el contador) |
| 2 | 10,1–12,1 s | Un globo que no existe. | En «existe» (11,15 s, f 335): glitch de 6 frames y el globo pasa a malla wireframe naranja, con ondas que se curvan hacia el hoyuelo. Rótulo «Un globo que / **no existe**» | glitch por bloques |
| 3 | 12,1–17,1 s | No hay goma, ni aire, ni fotografía. Lo ha dibujado un ordenador. | La malla se vuelve a dibujar desde el hoyuelo hacia fuera (puntos y triángulos). Etiquetas GOMA · AIRE · FOTO, cada una tachada en naranja cuando la voz dice su palabra (12,45 / 13,46 / 14,20 s). Órbita lenta de la cámara. Rótulo «Lo ha dibujado / un **ordenador**» | barrido de rejilla |
| 4 | 17,1–19,9 s | Y tú has esperado hasta el final. | La malla se calma, la cámara se aleja y el código de tiempo vuelve a correr desde 00:00:06:15. Rótulo «Y tú has **esperado**» | (movimiento continuo) |
| 5 | 19,9–23,3 s | Esto es lo de menos de lo que hacemos en AIgencyx Labs. | Zoom out: el globo queda pequeño en una cuadrícula de 8 figuras wireframe grises (cubo, toro, pirámide, octaedro, cilindro, icosaedro, cono, dodecaedro) y se vuelve gris como «una más». Rótulo «Esto es / **lo de menos**» | zoom |
| 6 | 23,3–28,9 s | Lo que hacemos de verdad es que tu negocio trabaje solo, mientras tú haces otra cosa. | Diagrama de 4 cajas (sobre → documento → engranaje → campana, en bucle). Un pulso naranja las recorre solo, una cada 0,55 s. Silueta gris sin cara, quieta en una esquina; en «tú» le aparece un aro discontinuo. Rótulo «Tu negocio / **trabaja solo**» | barrido de rejilla |
| 7 | 28,9–32,7 s | Comenta auditoría y te ayudamos a automatizar tu negocio. | Campo de comentario genérico que escribe AUDITORIA letra a letra mientras la voz dice «auditoría», con cursor naranja. «Enviar» se pulsa en la última sílaba (29,90 s) y el comentario queda publicado encima. Rótulo «Comenta **AUDITORIA**» y debajo, en mono gris, «TE AYUDAMOS A AUTOMATIZAR» | glitch por bloques (5 frames) |
| C · Cierre | 32,7–34,7 s | — | Apagón CRT (línea → punto) a #0A0A0A, logo de AIgencyx Labs y @aigencyx.labs en naranja | apagón CRT |

Orden de las transiciones: glitch → barrido → zoom → barrido → glitch → CRT. Nunca hay dos iguales seguidas.

## Audio (sintetizado en build.py, original)
- **Fase 1 (f 0–195):** curva «tension» = (1 − distancia aguja-globo / distancia inicial)^1,6, exportada por frame en `src/timeline-globo.json`. Capas: drone de 49 + 55 Hz; bombo seco desde tension 0,15, que acelera de forma continua de 60 a 140 bpm; colchón de sierras con paso bajo que se abre de 300 Hz a 8 kHz; riser de sierra que sube dos octavas (110 → 440 Hz) desde tension 0,4; ruido en paso alto en el último 25 %. El nivel sigue una curva medida de -28 a -10 LUFS (medido: -27,7 → -11). Tic en cada cambio de centena (más agudo cuanto más tensión) y clic metálico en las pausas 138 y 045.
- **Fase 2:** corte total en el frame 195 (mismo sample en todas las capas) y zumbido de 41 Hz a -43 dBFS RMS hasta la voz. Golpe sordo en el primer fonema (7,000 s), glitch de audio de 6 frames en «existe», drone muy bajo bajo la voz, acordes abiertos (pulso «solución») desde la frase 5, música 12 dB más baja cuando habla la voz, tecleo y clic de Enviar sincronizados, sonido de apagón CRT y, en el último segundo, el motivo de apertura (dos notas de cristal sobre el drone, igual que en el frame 0) para que el bucle suene continuo.
- Mezcla a -14 LUFS con limitador con anticipación (lookahead) y techo de -3 dBFS, para que el AAC no se pase de -1 dBTP.

## Decisiones tomadas (no especificadas)
- **Gancho:** la grabación de pantalla es un reel de otra cuenta, con su marca y la interfaz de Instagram. No la incrusto: reconstruyo su idea en 3D propio, como pide el prompt. Del original conservo el corte de plano general a macro de la parte de arriba del globo.
- Hueco aguja-globo al empezar: 0,5 unidades (≈155 px en el plano general). La aguja es más gruesa en el plano general (≈2,5 px) para que se vea y conserva su grosor real en el macro.
- Profundidad del hoyuelo: 0,16 unidades. El globo se infla un 6 % entre los frames 10 y 170.
- La fila REC / código de tiempo / CAM 01 está a 260 px (justo dentro de la zona segura). Las esquinas en L están a 60 px del borde.
- El contador empieza en 211 y desaparece con un corte seco cuando entra la voz.
- La frase 6 dice «trabaje» y el rótulo dice «trabaja solo» (como en el prompt).
- Debajo del CTA añado «TE AYUDAMOS A AUTOMATIZAR» (4 palabras, mono gris) para que no haya 2,5 s sin cambios después de Enviar.
- Las texturas de grano son PNG precalculados (`public/assets/grain_*.png`) y se congelan junto con la imagen hasta «existe».
- 3D con GL por software (`--gl=swangle`): funciona sin GPU.
- La entrega está recomprimida a CRF 19 (43 MB). El máster CRF 16 (75 MB) queda en `reel-globo-no-existe/out/`.

## QA (scripts/qa.py, todo PASS)
Formato 1080x1920 a 30 fps · 34,67 s · -14,0 LUFS / -2,1 dBTP · (a) frames 195–209 idénticos salvo el punto REC, y 210–334 idénticos al 195 por encima de los rótulos · (b) primer fonema a los 7,000 s = frame 210,00 (correlación cruzada de la mezcla con el MP3) · (c) RMS por segundo de la música: -27,6 → -13,3 dB antes del congelado · (d) ningún rótulo fuera de 250–1580 px · (e) wireframe en el frame 335 («existe»), con la piel sólida al 51 % antes y al 1 % después.
Ventanas «quietas»: la imagen congelada de la frase 1 (es lo que pide el guion; los rótulos cambian palabra a palabra) y los últimos 0,1 s del logo.

## Pendiente de comprobar (tú)
1. **Cómo pronuncia la voz «AIgencyx»** (14,88–15,69 s del MP3; 21,8–22,6 s del vídeo). No lo he podido verificar de oído: no tengo reconocimiento de voz en este entorno. Dura 0,8 s, lo que encaja con «ei-yen-six» o «ai-yen-six». Escúchalo.
2. Que el gancho te funcione en el móvil a los 0–2 s (plano general) y que el corte a macro del frame 64 no te resulte brusco.
3. Que la interfaz de Instagram no tape la fila REC / código de tiempo (a 260 px).
4. El volumen de la subida de la cuenta atrás (llega a unos -10 LUFS a corto plazo, más alto que la voz, para que el corte en el frame 195 se note).

## Pipeline
```
python scripts/align.py ../audio/raw/globo-no-existe/941757ed-*.mp3   # palabras → data/words.json (11 tramos → 7 frases)
python scripts/make_assets.py                                         # grano precalculado → public/assets/
python scripts/build.py                                               # timeline.json, timeline-globo.json, public/audio/mix.wav
bash scripts/render.sh 12 4 out/reel-globo-no-existe.mp4              # render por trozos (swangle) + mezcla
python scripts/qa.py out/reel-globo-no-existe.mp4 out/qa              # comprobaciones (a)–(e) + hojas de contacto
```
El componente `GloboCuentaAtras` también se puede renderizar suelto (composición `GloboCuentaAtras`, 210 frames). Todo su texto entra por props (`hudTag`, `label`) y sus curvas por `data`.
