# Serie «Máster de Claude Code» · EP.13 «Cierre del módulo 1» (sin lección del curso)

**Estado:** montado en `serie-claude-code/` (composición `Master`, `episodios/ep-13.json`).
**Entrega:** `entregas/serie-claude-code-ep-13.mp4`. **Duración:** DURACION (1:47 de voz y 1 s de cola). 1080x1920 a 30 fps, SONORIDAD.

## Archivos
- `1_guion_y_voz/voz_ep13.txt`: el texto que se grabó. La toma de ElevenLabs («Manu Gordillo», v4, stability 50,
  similarity 75) está en `audio/raw/serie-claude-code/ep-13.mp3`; el montaje con 1 s de cola, en `ep-13_montaje.mp3`.
- `4_assets_extra/logos_e_imagenes_ep13.txt`: lo que hace falta y lo que ya tienes (está todo).
- `5_proyecto_remotion/PROMPT_MAESTRO_ep13.txt`: el prompt, por si se monta con otra IA.
- `7_publicacion/caption_ep13.txt`: el texto para Instagram.
- No hay tomas de pantalla: el editor de flujos y la caja de comentario están recreados con datos ficticios.

## Render
```bash
cd serie-claude-code
python scripts/preparar.py episodios/ep-13.json --mp3 ../audio/raw/serie-claude-code/ep-13_montaje.mp3 --modelo <parakeet>
node scripts/fotogramas.mjs episodios/ep-13.json 5 20 40      # fotogramas sueltos
node scripts/render-lote.mjs episodios/ep-13.json             # → out/claude-code-ep-13.mp4
python scripts/qa_master.py episodios/ep-13.json out/claude-code-ep-13.mp4
```
Se anclaron 288 de las 291 palabras del guion a la voz. La voz no se ha subido a ningún servicio.

## Escenas
| Bloque | Tiempo | En pantalla |
|---|---|---|
| intro | 0–4 | la cuadrícula de 50 casillas: el EP.13 se enciende y se deshace en partículas que forman el título |
| gancho | 4–14 | las 13 casillas del módulo 1 se encienden y se marcan → sello MÓDULO 1 ✓ con el logo de AIgencyx → ¿ACABAS DE LLEGAR? → EMPIEZA AQUÍ → el cronómetro del usuario: TODO EL MÓDULO EN 2 MINUTOS → tres cartas boca abajo: DECIDES TÚ |
| repaso | 14–48 | la caja de herramientas MÓDULO 1 se abre; cada frase deja piezas que caen dentro (Claude Code, Visual Studio Code, la carpeta y GitHub · CLAUDE.md y la floristería · CONTEXTO, TAREA CONCRETA y EJEMPLOS · rebobinar y un error leído con lupa) mientras se enciende la casilla de su episodio → NIVEL EXPERTO: plan, equipo, MCP, abanico de variantes y el cursor que usa tu ordenador |
| caminos | 48–54 | la caja se cierra (LAS HERRAMIENTAS ✓), sube y se hace pequeña → AHORA, ALGO REAL → tres caminos hasta tres cartas boca abajo, 1, 2 y 3 |
| web | 54–59 | la carta 1 se da la vuelta (ilustración de la web) → WEB, con Next.js, Astro y WordPress; al «publicada en internet», Vercel, Netlify y Hostinger → IDEA → EN INTERNET |
| auto | 59–70 | la carta 2 (ilustración de la automatización) → AUTOMATIZAR, con n8n y Make → SE HACEN SOLAS → la cámara baja al ejemplo: editor de flujos «Pedidos · Floristería» con WhatsApp (nuevo pedido) → Google Sheets (añadir fila) → Gmail (confirmación); el pedido recorre el flujo → PEDIDO CONFIRMADO |
| medida | 70–81 | la carta 3 (ilustración del panel) → A MEDIDA, con Node.js y AWS → PANEL DE PEDIDOS · AGENDA DE CITAS · GESTOR DE CLIENTES → SE ADAPTA A TI, con la llave inglesa → «Y NO TÚ A ELLA» se tacha |
| voto | 81–92 | EN RESUMEN: la caja cerrada con su ✓ → ¡A CONSTRUIR! → ¿POR DÓNDE EMPEZAMOS?: las tres cartas boca arriba; cada palabra se ilumina y se escribe en un comentario de Instagram → barras de votación sin cifras → MÓDULO 2 |
| cta | 92–101 | el del EP.8 (AUDITORIA, esquemas con Drive, auditoría para tu negocio) |
| avance | 101–108 | la cuadrícula con el módulo 1 completo y la casilla 14 latiendo → EP.14 · MÓDULO 2 · La opción ganadora → @aigencyx.labs con el logo de AIgencyx y Seguir → Siguiendo ✓ |

## Respecto al curso
Este episodio no tiene lección del curso: es un cierre propio. El repaso sale de los guiones de la serie (EP.1 a EP.12);
la metáfora de la caja de herramientas, las tres cartas y la votación son nuestras.

## Decisiones
- **Votación:** se comenta WEB, AUTOMATIZAR o MEDIDA; la más votada abre el módulo 2. En pantalla, las barras no
  llevan cifras (no hay datos todavía).
- **Ejemplo común:** la floristería de la serie, en las tres opciones (ilustraciones del usuario).
- **Editor de flujos:** recreado a partir de la captura de referencia (`public/imagenes/referencias/n8n_flujo.webp`),
  con datos ficticios y en español. El logo de n8n solo sale como logo, fuera del editor.
- **Casillas del repaso:** 1–4 con Claude Code, Visual Studio Code, la carpeta y GitHub; 5 con CLAUDE.md; 6 con pedir
  bien; 7 y 8 con rebobinar y el error; 9–12 con las funciones de experto. El EP.10 no está en GitHub, así que no se
  nombra.
- **Pendiente del usuario:** subir a la carpeta de esquemas de Drive el esquema del módulo 1 (el CTA lo promete).
