# Serie «Máster de Claude Code» · EP.12 «Computer Use» (lección 1.9)

**Estado:** montado en `serie-claude-code/` (composición `Master`, `episodios/ep-12.json`).
**Entrega:** `entregas/serie-claude-code-ep-12.mp4`. 1080x1920 a 30 fps.

## Archivos
- `1_guion_y_voz/voz_ep12.txt`: el texto que se grabó. La toma de ElevenLabs (v4, stability 50, similarity 75) está en
  `audio/raw/serie-claude-code/ep-12.mp3`; el montaje con 1 s de cola, en `ep-12_montaje.mp3`.
- `3_tomas_pantalla/tomas_ep12.txt`: las pantallas, recreadas (no se grabó nada).
- `4_assets_extra/logos_e_imagenes_ep12.txt`: lo que hace falta y lo que ya tienes.
- `5_proyecto_remotion/PROMPT_MAESTRO_ep12.txt`: el prompt, por si se monta con otra IA.
- `7_publicacion/caption_ep12.txt`: el texto para Instagram.

## Render
```bash
cd serie-claude-code
python scripts/preparar.py episodios/ep-12.json --mp3 ../audio/raw/serie-claude-code/ep-12_montaje.mp3 --modelo <parakeet>
node scripts/fotogramas.mjs episodios/ep-12.json 5 20 40      # fotogramas sueltos
CONCURRENCIA=3 node scripts/render-lote.mjs episodios/ep-12.json   # → out/claude-code-ep-12.mp4
python scripts/qa_master.py episodios/ep-12.json out/claude-code-ep-12.mp4
```
Se anclaron 337 de las 339 palabras del guion a la voz. La voz no se ha subido a ningún servicio.

## La intro nueva (solo en este episodio)
Empieza por el gancho: un navegador rellena solo «Nuevo proyecto» (`pedidos-floristeria`) con la etiqueta CLAUDE AL
MANDO, tu mano levantada y tu ratón 3D con la pausa («TU RATÓN, QUIETO»). Claude pulsa «Crear». Con «Episodio 12 de
50» el navegador busca «máster de claude code» y abre la portada: la cuadrícula de 50 (se enciende la 12), que se
encoge al entrar los logos, el título y «EP.12 · COMPUTER USE». Bloque `ep12_intro`.

## Elementos 3D del usuario
Llegaron en un vídeo de muestra con el fondo pegado. `scripts/elementos3d.py` los separa sin redibujar nada: saca el
fondo (color y puntos) de los fotogramas vacíos, deja opaco el elemento y convierte la sombra en negro semitransparente
que se desvanece hacia los bordes. Quedan en `public/elementos3d/` (WebM con transparencia, a media resolución) y se
usan con `Elemento3D` (`componentes/ep12/Piezas12.tsx`), pequeños y algo tenues:
- **ratón quieto:** en la intro y en «sin mover tu ratón» (paso 4), parado antes de que entre su cursor.
- **cursor con clic (bucle):** en «pulsa botones», en «pulsa Habilitar» (la punta sobre el botón) y en «Claude hace los clics».
- **ventana «Claude al mando»:** en «se los dejamos a Claude» y en el resultado, con su check.
- **cuadrícula del 12:** en el avance, encima de la tarjeta del EP.13.

## Escenas
| Bloque | En pantalla |
|---|---|
| intro (gancho + título) | lo de arriba |
| que | COMPUTER USE con la mascota y el rótulo → escribe código + usa tu ordenador (Chrome, carpeta, mensajes) → ABRE PÁGINAS · RELLENA CAMPOS · PULSA BOTONES → tú y Claude sentados juntos: «Crea el proyecto» → Hecho |
| ejemplo | UN EJEMPLO: tu floristería y tres sobres de pedidos → LEE LOS PEDIDOS DEL CORREO → 1 · Google Cloud → 2 · Gmail → montaña de pantallas (MUCHOS CLICS, «?») → se recogen en el logo de Claude |
| preparar (pasos 1 y 2) | PASO 1: Chrome con Google Cloud, tu mano lo abre, «Sesión iniciada» → Claude trabaja sobre lo que dejas abierto · PASO 2: Visual Studio Code con Claude Code, la petición se escribe con la voz → DALE PERMISO → de tres ventanas, solo Google Cloud (candado): SOLO ESA |
| plan (paso 3) | ANTES DE TOCAR NADA → «El plan» se marca: crear el proyecto, activar Gmail, preparar las credenciales → la llave: LAS LLAVES DE TU AUTOMATIZACIÓN → «¿Uso la cuenta de la tienda?» |
| trabaja (paso 4) | DÉJALE TRABAJAR → CLAUDE AL MANDO: proyecto creado → «gmail api» → Habilitar → Habilitada → LO VES EN DIRECTO → tu tecla Esc: la ventana se pausa (SE PARA) |
| clave | OJO → LÍNEA ROJA → «Demuestra que eres tú»: Claude ESPERA, TU TURNO, la contraseña en la página → NUNCA EN EL CHAT (tachada) → «ya lo tienes» → CLAUDE SIGUE |
| final (resultado + resumen) | ¿EL RESULTADO? Proyecto creado ✓ y Gmail activado ✓ → SIN BUSCAR NI UN BOTÓN → EN RESUMEN: tú preparas y das permiso · Claude hace los clics · las llaves, siempre tuyas |
| cta | el del EP.8 (AUDITORIA, esquemas con Drive, auditoría para tu negocio) |
| avance | cuadrícula 3D → EP.13 · CIERRE DEL MÓDULO 1 → tú eliges: WEB · AUTOMATIZACIONES · A MEDIDA → Seguir |

## Cambios respecto al vídeo del curso
- **Otro ejemplo:** los pedidos de la floristería en lugar de un lector de correos genérico; proyecto
  `pedidos-floristeria` en lugar de `lector-gmail-demo`.
- **Otro navegador y otro orden:** Chrome en lugar de Safari; primero el resultado (el navegador trabajando solo) y
  después cuatro pasos y la línea roja.
- **Metáforas propias:** el ayudante sentado a tu lado, la línea roja y «las llaves, siempre tuyas».
- No se usan las frases, la petición ni la grabación del curso. Las pantallas (Google Cloud, la API de Gmail, la
  verificación de la cuenta, Visual Studio Code) se han recreado con datos ficticios.

## Datos comprobados (en el vídeo de la lección)
- Claude Code maneja el navegador «por detrás», sin mover tu ratón ni tu teclado.
- Antes de empezar enseña el plan (proyecto, API de Gmail, pantalla de consentimiento, credenciales) y pregunta lo que
  necesita decidir.
- Cuando Google pide verificar la cuenta, la contraseña la escribe la persona en la página; luego le dice «ya lo
  tienes» y Claude sigue.
- Claude crea el proyecto, abre la API de Gmail y pulsa «Habilitar»: el estado pasa a «Habilitada». El guion no dice
  que termine las credenciales, porque en el vídeo no se ve.

## Decisiones
- **Logos:** Chrome, Google Cloud (en tarjeta clara: su texto es gris), Gmail, Claude, Claude Code, Visual Studio Code
  y Drive, todos del usuario. La página «Demuestra que eres tú» va sin el logo de Google (no lo tenemos).
- **AIgencyx:** el logo está recortado de una captura (unos 296 px). En este episodio no hace falta; para usarlo
  grande, pedir el PNG exportado.
- **CTA:** se reutiliza el bloque del EP.8. El logo de Drive se aparta un poco cuando el número del episodio tiene
  dos cifras, para no pisar el texto (el EP.8 queda igual).
