# Serie «Máster de Claude Code» · EP.13 v2 «Gracias · cierre del módulo 1 y votación entre cinco opciones»

**Estado:** montado en `serie-claude-code/` (composición `Master`, `episodios/ep-13-v2.json`, bloques `ep13b_*`).
La v1 (tres opciones: WEB, AUTOMATIZAR, MEDIDA) sigue intacta en `episodios/ep-13.json` y `entregas/serie-claude-code-ep-13.mp4`.
**Entrega:** `entregas/serie-claude-code-ep-13-v2.mp4`. 1080x1920 a 30 fps. Duración 1:49 (1:48 de voz y 1 s de cola).

## Archivos
- `voz_ep13_v2.txt`: el guion grabado. Toma de ElevenLabs («Manu Gordillo», v4, stability 50, similarity 75):
  `audio/raw/serie-claude-code/ep-13-v2.mp3` (montaje con 1 s de cola: `ep-13-v2_montaje.mp3`).
- `cues.json`: cada sonido (momento, fotograma, qué pasa en pantalla, archivo de la librería, pico y volumen).
- Capturas reales de Instagram (30 días hasta el 25 nov): `serie-claude-code/public/imagenes/ep13v2/` (recortes y
  originales). Los números no se tocan: solo se recortan, se inclinan y se acercan.

## Render
```bash
cd serie-claude-code
python scripts/preparar.py episodios/ep-13-v2.json --mp3 ../audio/raw/serie-claude-code/ep-13-v2_montaje.mp3 --modelo <parakeet>
python scripts/sfx_libreria.py /ruta/a/sonidos-videos        # copia a public/sfx los sonidos usados y mide su nivel
node scripts/fotogramas.mjs episodios/ep-13-v2.json 5 20 40
node scripts/render-lote.mjs episodios/ep-13-v2.json          # → out/claude-code-ep-13-v2.mp4
python scripts/cues.py out/claude-code-ep-13-v2.plan.json ../briefs/serie-claude-code-ep-13/v2/cues.json
python scripts/qa_master.py episodios/ep-13-v2.json out/claude-code-ep-13-v2.mp4
```
277 de 284 palabras del guion ancladas a la voz (reconocedor local; la voz no se ha subido a ningún servicio).

## Sonido (nuevo en este episodio)
- Efectos **solo de la librería del usuario** (repo privado `joakognz/sonidos-videos`), nada sintetizado. El JSON lleva
  `"sonidos": "libreria"`: cada bloque pide un grupo (woosh, zoom, click, remate, teclado, glitch, destello, foto,
  interfaz, impacto, golpe, riser, reloj, acierto) y `src/master/sfx.ts` elige el archivo: el pico cae en el evento,
  nunca el mismo archivo que uno de los dos anteriores y nunca dos woosh seguidos. `scripts/sfx_libreria.py` define
  los grupos, copia solo esos archivos a `public/sfx/` con su nombre original y ajusta el volumen de cada uno para que
  quede unos 10 dB por debajo de la voz («medio»), 14 dB («bajo») o 7 dB («fuerte»).
- La skill `real-sfx` no está instalada en la nube: los sonidos se colocaron con las mismas reglas a mano, y
  `scripts/cues.py` las comprueba (117 sonidos, reglas OK).
- Música: la de la serie (`public/audio/musica.wav`) a -20 dB y 8 dB más baja bajo la voz; sube 3 dB en las cinco opciones.

## Escenas
| Bloque | Tiempo | En pantalla |
|---|---|---|
| gracias | 0–1,7 | GRACIAS letra a letra con golpe, «De verdad.» |
| cifras | 1,7–10,5 | cuadrícula de 50 (1–12 encendidas, 13 latiendo) → contador 0 → 9.098 con la captura de seguidores (la gráfica se dibuja) y sello +8.911 → corte seco a la captura de reproducciones, zoom a 344.114, los dos picos se iluminan, sello EN 30 DÍAS |
| titulo | 10,5–15,2 | logos de Claude y Claude Code, destello: EP.13 · FIN DEL MÓDULO 1 · MÁSTER DE CLAUDE CODE; «un episodio normal» se tacha |
| detras | 15,2–27,2 | visor REC «DETRÁS DE CÁMARAS» → montaje de cortes de 0,4 s (reloj, guion tachado, capas, RENDER ×3, escena tachada) → contador 1 → 12 → la caja MÓDULO 1 se cierra de golpe, sello COMPLETADO |
| repaso | 27,2–44,7 | la caja se abre y saltan las herramientas: Claude Code + VS Code, CLAUDE.md, deshacer, tablero, GitHub + MCP, portátil → TU CAJA DE HERRAMIENTAS |
| agradecer | 44,7–53,6 | negro, texto que se teclea, bolas de papel, LO TENGO CLARO → golpe de zoom LO ELEGÍS VOSOTROS con la urna |
| cinco | 53,6–55,4 | cinco cartas boca abajo, sello 5 OPCIONES |
| opciones | 55,4–88,3 | fila de las cinco arriba; cada carta se da la vuelta (OPCIÓN N/5) y su demo: app «Tu negocio» con Node.js y AWS · WhatsApp → hoja de cálculo · navegador con Next.js, Astro, Vercel y Claude Code · de una persona a nueve · escudo con candado, clave emborronada y clientes.xlsx bloqueado |
| votar | 88,3–97,7 | ¿CÓMO VOTAR? y la caja de comentario donde se teclea y se borra cada palabra → anillo de historias |
| plazo | 97,7–100,8 | contador 48:00:00 que baja, barras de voto sin resultados, UN VOTO POR PERSONA |
| final | 100,8–109 | cuadrícula con el 14 latiendo, EP.14 · MÓDULO 2 · Lo elegís vosotros, @aigencyx.labs y Seguir → Siguiendo ✓ |

## Decisiones
- Las historias del usuario no salen en el vídeo (lo pidió así): las cartas de las opciones son nuevas, en el estilo
  oscuro de la serie, con iconos planos propios.
- No hay CTA AUDITORIA: se mezclaría con los votos.
- Datos ficticios en las demos («Pedido: 2 ramos», «tu-negocio.es», la clave emborronada).
