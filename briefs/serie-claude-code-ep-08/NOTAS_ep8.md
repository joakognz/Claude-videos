# Serie «Máster de Claude Code» · EP.8 «Errores típicos y troubleshooting» (lección 1.5)

**Estado:** montado en `serie-claude-code/` (composición `Master`, `episodios/ep-08.json`).
**Entrega:** `entregas/serie-claude-code-ep-08.mp4`.
**Duración:** 2:15. Son los 2:14 de la voz y 1 s de cola para que termine el botón «Seguir». Formato 1080x1920 a 30 fps.

## Archivos
- `1_guion_y_voz/voz_ep8.txt`: el bloque de voz. La toma de ElevenLabs está en `audio/raw/serie-claude-code/ep-08.mp3`; el montaje con la cola de 1 s, en `ep-08_montaje.mp3`.
- `5_proyecto_remotion/PROMPT_MAESTRO_ep8.txt`: el prompt definitivo, por si se vuelve a montar con otra IA.
- `3_tomas_pantalla/tomas_ep8.txt`: no ha hecho falta grabarlas, porque están recreadas como animación (ver abajo).
- `4_assets_extra/logos_e_imagenes_ep8.txt`: tabla de lo que hace falta y lo que ya tienes.
- `7_publicacion/caption_ep8.txt`: el texto para Instagram.

## Render
```bash
cd serie-claude-code
python scripts/preparar.py episodios/ep-08.json --mp3 ../audio/raw/serie-claude-code/ep-08_montaje.mp3 --modelo <sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8>
node scripts/render-lote.mjs episodios/ep-08.json            # → out/claude-code-ep-08.mp4
python scripts/qa_master.py episodios/ep-08.json out/claude-code-ep-08.mp4
node scripts/fotogramas.mjs episodios/ep-08.json 20 55 110    # fotogramas sueltos para revisar
```
Los tiempos de cada palabra los saca el reconocedor local (Parakeet), alineado con el texto del guion: se anclaron 366 de las 368 palabras. La voz no se ha subido a ningún servicio.

## Escenas
| Bloque | Tiempo | En pantalla |
|---|---|---|
| intro | 0–4 | cuadrícula de 50 casillas, el EP.8 se enciende y se deshace en partículas que forman el título |
| gancho | 4–17 | editor con Claude Code → cae un aviso «API Error» con un número borroso → RESPIRA (anillo) → sello NO HAS ROTO NADA → tres avisos en abanico → una lupa los lee → TU PROYECTO al 100 % |
| tienda | 17–32 | la floristería (tu ilustración), cae el cartel en el cristal de la puerta → QUÉ PASA / QUÉ HACER → PASO 1: ¿TRAE NÚMERO? → SÍ / NO → carpeta con ✓ → CONEXIÓN o CUENTA |
| cuenta | 32–56 | PASO 2 → cartel 401 «TU LLAVE YA NO ABRE» (llave que no gira) → botón «Iniciar sesión» con el logo de Claude, sello RECONECTA → el cartel gira a 400 «TARJETA RECHAZADA» (el datáfono deniega la tarjeta) → CRÉDITO o LÍMITE DE GASTO → se teclea platform.claude.com y aparece la consola recreada (Facturación) → REVISA Y RECARGA |
| esperar | 56–83 | PASO 3 con un reloj de arena → 429 «ESPERE SU TURNO» (máquina de turnos que se bloquea) → LÍMITE DE USO → la pantalla de límites, DEPENDE DE TU PLAN → 529 «AFORO COMPLETO» (cola, servidor y logo de Anthropic, aforo al 100 %) → NO ES CULPA TUYA → 500 «CERRADO POR AVERÍA» (chispas y llave inglesa) → REINTENTA |
| status | 83–91 | los dos últimos carteles → se teclea status.claude.com → la página de estado recreada, con el cursor sobre una incidencia → ES SUYO, NO TUYO |
| lía | 91–112 | PASO 4: cartel SIN NÚMERO, con SE ATASCA, REPITE y SE VA POR LAS RAMAS → la tecla Esc sobre Visual Studio Code con Claude Code («arregla la web» → Interrupted) → REFORMULA y MÁS CONTEXTO → la petición vaga se tacha y la buena se teclea con la voz → la web de la floristería con su botón «Comprar» |
| resumen | 112–119 | vuelta a la puerta: el cartel gira con la voz (529 RESPIRA → SIN NÚMERO → REFORMULA) y termina en ABIERTO |
| cta | 119–129 | la pregunta → se teclea AUDITORIA y se envía → tarjeta de esquemas con el logo de Drive → AUDITORÍA PARA TU NEGOCIO → Optimiza tus procesos |
| avance | 129–135 | la cuadrícula marca el EP.8 hecho y el EP.9 late → EP.9 · NIVEL EXPERTO → @aigencyx.labs y Seguir → Siguiendo ✓ |

## Cambios respecto al vídeo del curso
- **Metáfora propia:** cada código es un cartel en la puerta de una tienda: «espere su turno», «aforo completo», «cerrado por avería», la tarjeta rechazada en el datáfono. En el curso no hay metáfora: se repasa un documento.
- **Otro orden:** se agrupan por lo que tienes que hacer (los que se arreglan desde tu cuenta: 401 y saldo; los que se arreglan esperando: 429, 529 y 500). El curso los repasa en la lista 401, 429, 529, 500 y saldo.
- **Otro ejemplo:** la web de una floristería en lugar de la landing de una clínica estética. Además, para «dale más contexto» se muestra una petición vaga y su versión con contexto.
- No se usan el documento, las diapositivas, las frases ni la grabación del curso.

## Tomas recreadas (a partir del vídeo de la lección)
Las pedía el guion como grabaciones tuyas, pero me pediste hacerlas a partir del vídeo que adjuntaste. Del vídeo solo se ha tomado la interfaz (menús, paneles y orden de clics) como referencia, y todo se ha redibujado con datos ficticios:
- **Consola** (`platform.claude.com`): menú lateral y página «Facturación», con un saldo de 0,00 US$ y un gasto de 50 de 50 US$.
- **Límites de velocidad:** «Nivel 2» y las cuotas con barras, sin cifras.
- **Página de estado** (`status.claude.com`): las barras de los últimos 90 días y una incidencia ficticia del 12 Oct 2026.
- **Visual Studio Code con Claude Code:** proyecto `web-floristeria`. Se envía «arregla la web», se pulsa Esc y aparece «Interrupted».
Ningún fotograma del curso entra en el reel.

## Datos comprobados
- 401 `authentication_error`, 429 `rate_limit_error`, 500 `api_error` y 529 `overloaded_error` coinciden con la referencia de errores de la API de Anthropic. Los tres últimos se pueden reintentar.
- **Saldo:** cuando se acaba el crédito o se llega al límite de gasto, la API responde con un 400 (`invalid_request_error`) y un mensaje de saldo. Además existe un 402 (`billing_error`) para problemas de pago. No se nombra, para no liar al público.
- `status.claude.com` y `platform.claude.com` son las direcciones que aparecen en la lección. Desde este entorno no se pudo abrir status.claude.com (la red lo bloquea), así que no he podido comprobarla.

## Decisiones
- **Logos:** solo los adjuntos. Anthropic va tal cual (la ficha clara con su logo). `logo_aigencyx` no está en este repositorio, así que el usuario @aigencyx.labs va en texto, como en el EP.2.
- **Estilo:** el de la plantilla Master (fondo #0B0D12, acento #D97757). El cartel lleva el trazo negro grueso de tu ilustración para que encaje con la floristería.
- **Música y efectos:** la música original del proyecto, a -20 dB y bajando otros -8 dB mientras habla la voz. Hay golpes en los sellos, tecleo al escribir y un tic en cada clic.

## Pendiente
- El teaser del EP.7 («En el siguiente episodio…») no está en este repositorio. Revisa que anuncie errores y troubleshooting.
