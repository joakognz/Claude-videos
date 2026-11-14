# Serie «Máster de Claude Code» · EP.5 «El archivo CLAUDE.md y /init»

**Duración:** 2:33,9 (4.617 fotogramas): la voz (152,7 s) más 1,2 s de cola para que el botón «Seguir» termine.
1080x1920 · 30 fps.
**Proyecto:** `serie-claude-code/`, composición `Master`, `episodios/ep-05.json`.
**Entrega:** `entregas/serie-claude-code-ep-05.mp4`.

## Render
```bash
cd serie-claude-code
python scripts/logos_ep05.py                                   # logos del episodio → public/logos/
python scripts/preparar.py episodios/ep-05.json --mp3 ../audio/raw/serie-claude-code/ep-05_ElevenLabs_2026-11-14T02_36_21_Manu_Gordillo_v4.mp3 --modelo <sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8>
ffmpeg -i public/episodios/ep-05/voz.wav -af apad=pad_dur=1.2 -c:a pcm_s24le cola.wav && mv cola.wav public/episodios/ep-05/voz.wav
node scripts/render-lote.mjs episodios/ep-05.json              # → out/claude-code-ep-05.mp4
python scripts/qa_master.py episodios/ep-05.json out/claude-code-ep-05.mp4
```

## Voz
Una sola toma de ElevenLabs (Manu Gordillo, v4), entera y sin cortes. Timestamps: Parakeet TDT local + texto del guion
(383/387 palabras ancladas). En los subtítulos se escribe lo que se dice con su forma escrita: «CLAUDE.md»,
«/init», «Next.js», «n8n», «132».

## Bloques (tiempos sacados del audio)
| # | Bloque | Tiempo | En pantalla |
|---|---|---|---|
| 1 | intro | 0–3,8 | rejilla 10x5, EP.1–4 encendidos, el 5 late y se enciende → partículas → título |
| 2 | memoria | 3,8–21,6 | HOY · Preparamos el proyecto antes de empezar → iconos en órbita alrededor de CLAUDE.md → Claude, EMPLEADO NUEVO, el sol de cada mañana, bocadillo «AYER» que se tacha y queda en blanco, BRILLANTE, MEMORIA EN BLANCO → mesa y nota adhesiva CLAUDE.md que cae sobre ella |
| 3 | contenido | 21,6–35,5 | La lee al empezar cada conversación → 5 tarjetas (qué es / para quién / estilo / qué evitar / cómo trabajar) → SIN NOTA (Claude tenue con interrogantes, REPITES TODO) / CON NOTA (✓, arranca, SABE CÓMO JUEGAS) |
| 4 | init | 35,5–40,2 | ¿Y se escribe a mano? (hoja y lápiz) → sello NO → EXISTE UN COMANDO, mascota de Claude Code y «/init» que se escribe en grande |
| 5 | pasos | 40,2–59,1 | PASO 1 carpeta + diálogo «Nueva carpeta» (landing-cliente-clínica-estética) ✓ · PASO 2 Visual Studio Code, ventana del proyecto y panel de Claude Code ✓ · PASO 3 menú con /init, Claude explora, crea CLAUDE.md, «Lo revisas / Lo ajustas» ✓ |
| 6 | vacia | 59,1–77,8 | OJO · AQUÍ HAY TRAMPA → carpeta vacía y lupa → CLAUDE.md mínimo y el aviso real «Siguiente paso…» → framework · dependencias (npm, Node.js) · git init (Git) → flecha a /init → Codex y Gemini, sus configuraciones viajan hasta Claude → NO EMPIEZAS DE CERO |
| 7 | entrevista | 77,8–88,1 | ¿Cómo sacamos uno bueno sin escribir código? → ENTREVISTA → se escribe la petición real en el panel → «Te voy a preguntar en dos rondas…» · POR RONDAS |
| 8 | rondas | 88,1–107,6 | RONDA 1 tecnología (Astro RECOMENDADA, Next.js, Vite, HTML/CSS) · RONDA 2 dónde publicar (Vercel, Netlify, Cloudflare Pages, FTP) · RONDA 3 formulario (webhook a n8n, script PHP). Se marca lo elegido en la grabación: Astro, FTP, n8n |
| 9 | abiertas | 107,6–119,1 | PREGUNTAS ABIERTAS en 5 grupos (1–3, 4–6, 7, 8–11, 12) → ES UNA PRUEBA → se escribe «Como esto es una prueba invéntate todos los datos…» y se envía |
| 10 | resultado | 119,1–131,2 | contador 0 → 132 líneas mientras el CLAUDE.md se recorre en el editor → Clínica Aurora Estética (Valencia) · Astro + Tailwind · Despliegue por FTP · Consentimiento RGPD · Sin rastreo |
| 11 | resumen | 131,2–135,0 | RECUERDA: carpeta → /init → entrevista → revisar |
| 12 | ctaDrive | 135,0–144,5 | ¿Quieres los esquemas de este episodio? → Drive con los esquemas → AUDITORIA se escribe y se envía → Te paso el enlace con todo → ¿TIENES UN NEGOCIO? → AUDITORÍA DE PROCESOS → OPTIMIZA TUS PROCESOS |
| 13 | avance | 144,5–153,9 | rejilla: EP.5 hecho, el 6 se enciende y la cámara entra → EP.6 · PRÓXIMO EPISODIO · PROMPTING MAESTRO · Pídelo bien a la primera → perfil @aigencyx.labs, Seguir → Siguiendo ✓ |

## Decisiones
- **Pantallas:** recreadas a partir de la grabación de la clase (Visual Studio Code con el panel de Claude Code en
  macOS) con los mismos textos, pestañas y opciones, a un tamaño que se lee en vertical. No se usa la grabación tal
  cual: a 1920x1080 el texto no se lee recortado a 9:16 y lleva la cámara del ponente encima. Las rutas con el nombre
  del usuario se sustituyen por `~/Desktop/…`.
- **CLAUDE.md:** en el editor solo salen las líneas que se ven en la grabación; los tramos que no salen van plegados
  («⋯»). Los datos de la clínica son los ficticios que inventó Claude en la grabación.
- **Logos:** los adjuntos, sin redibujar (`scripts/logos_ep05.py`): se quita el fondo blanco conectado al borde y se
  recorta. Los que tienen texto oscuro (Vercel, Next.js, Vite, Netlify, Cloudflare Pages, n8n, npm, Node.js, Git) van
  sobre ficha blanca. Gemini: el logotipo en degradado; Codex: solo el icono; Astro: sin el lema «I Build Fast Static
  Sites» del banner. WhatsApp, GitHub y Copilot no se usan (la voz no los nombra).
- **Iconos propios** (planos, en coral): CLAUDE.md, carpeta, FTP, HTML/CSS y pictogramas de apoyo.
- **Estilo:** plantilla Master (fondo #0B0D12, acento #D97757). Insignia EP.5/50, marca de agua @aigencyx.labs y
  barra de progreso del vídeo arriba (`"progreso": true`).
- **Orden final:** el de la voz (CTA → avance del EP.6 → Sígueme).
- **Música:** la de la serie, a -20 dB con ducking de -8 dB bajo la voz.
