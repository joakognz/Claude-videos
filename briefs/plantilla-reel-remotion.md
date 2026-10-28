# Plantilla: reel animado a partir de guion + MP3 (AIgencyx Labs)

Prompt reutilizable para Claude Code en este repo. Es la versión genérica del que se usó en `reel-isla-mit/`.
Rellena lo que va entre `{{ }}`, adjunta el MP3 y pégalo tal cual.

---

## PROMPT

```
Genera el reel completo en Remotion dentro de este repo, igual que los anteriores (reel-isla-mit/ es la referencia más reciente).

DATOS
- Nombre del proyecto: reel-{{slug}}
- Tema / base real: {{resumen de la noticia o idea, con fuentes y fechas}}
- Guion de la voz (texto exacto de la toma): 
  {{pegar guion, una frase por línea}}
- MP3 adjunto: una sola toma de ElevenLabs. Úsala entera, sin cortar ni estirar. Cópiala a audio/raw/{{slug}}/.
- Duración objetivo: {{45}} s · 1080x1920 · 30 fps. Deja ~2 s finales sin voz para el cierre.
- CTA: Comenta {{AUDITORIA}} (en pantalla sin tilde; en la voz con tilde).
- Cuenta: @aigencyx.labs (solo en el cierre, nunca como marca de agua).

ESCENAS (los tiempos los fijan las pausas del MP3, no esta tabla)
| Escena | Frase(s) de la voz | Qué pasa en pantalla | Rótulo (palabra resaltada en **negrita**) | Microtexto |
|---|---|---|---|---|
| 1 | {{...}} | {{...}} | {{...}} | {{...}} |
| … | | | | |
| Final | (sin voz) | Fundido a #14110F, logo centrado y @aigencyx.labs en naranja | — | — |

ESTILO (fijo de marca)
- Mundo 3D isométrico nocturno en Three.js: cámara ortográfica, azimut 45°, elevación 35,3°.
- Cámara: {{un único acercamiento de lejos a cerca en 0–4 s y luego fija | movimientos por escena}}.
- Paleta estricta: fondo oscuro cálido #0E0C0B–#1A1613, naranja #FF6B1A / #FFB066 para todo lo que es IA, crema #FFF4EC para objetos. Sin rojo, azul ni verde.
- Protagonista: {{descripción del personaje/objeto de luz naranja, low-poly, translúcido, sin cara realista}}.
- Bloom suave y viñeta. Motion blur en lo que se mueve rápido (copias fantasma/estela) y entrada de rótulos con desenfoque.
- Rótulos: Sora ExtraBold blanco, centrados entre el 10 % y el 25 % de la altura. Palabra clave sobre caja naranja con texto #14110F. Microtextos en JetBrains Mono, mayúsculas, espaciados. Cada palabra aparece cuando la voz la dice.
- Zonas seguras: nada brillante en los 250 px de arriba ni en los 340 px de abajo.
- CTA: barra de comentarios estilo Instagram que escribe la palabra letra a letra.
- Cierre: logo AIgencyx Labs (aro naranja fino, "A" crema, nodos naranjas, "LABS") y @aigencyx.labs en naranja.
- Sin logos de marcas reales, sin marca de agua, sin personas realistas. No inventes cifras que no estén en el guion.

AUDIO
- {{Música original sintetizada suave debajo de la voz, que baje cuando habla, + efectos sincronizados | Solo voz}}.
- Mezcla final a -14 LUFS, pico ≤ -1 dBTP.

PROCESO (como en reel-isla-mit/scripts)
1. align.py: tiempos por palabra a partir de las pausas del MP3 → data/words.json.
2. build.py: escenas, rótulos y eventos anclados a palabras → src/timeline.json; mezcla → public/audio/mix.wav.
3. Montar escenas en src/ (world/ para 3D, components/ para rótulos, HUD, CTA y cierre).
4. Capturas de prueba en momentos clave, corregir solapes y legibilidad antes de renderizar.
5. render.sh por trozos en paralelo; qa.py (formato, volumen, zonas seguras, hojas de contacto).
6. Copiar a entregas/reel-{{slug}}.mp4, escribir briefs/reel-{{slug}}.md, commit y push.

Decide tú lo que no esté especificado y dime al final qué decidiste.
```

---

## Notas de uso
- Si solo tienes el guion (sin MP3), pide primero "pásame el guion para ElevenLabs" y después adjunta el MP3 con este prompt.
- Para un vídeo sin personaje 3D (por ejemplo, con un móvil o una interfaz), cambia la línea de "Protagonista" y la de "Mundo 3D". El resto se mantiene.
- Referencias de código: `reel-isla-mit/` (isla, personaje y red de nodos), `reel-dos-peluquerias/` (ciudad, tiendas, móvil y tarjeta).
