# Serie «Máster de Claude Code» · EP.6 «Prompting maestro»

**Duración:** 2:12,1 (3.964 fotogramas): la voz (130,9 s) más 1,2 s de cola para que el botón «Seguir» termine.
1080x1920 · 30 fps.
**Proyecto:** `serie-claude-code/`, composición `Master`, `episodios/ep-06.json`.
**Entrega:** `entregas/serie-claude-code-ep-06.mp4`.
**Guion, prompt maestro y caption:** `serie-claude-code/guiones/ep-06/`.

## Render
```bash
cd serie-claude-code
python scripts/preparar.py episodios/ep-06.json --mp3 ../audio/raw/serie-claude-code/ep-06_ElevenLabs_2026-11-15T15_04_08_Manu_Gordillo_v4.mp3 --modelo <sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8>
# (después, los 4 ajustes a mano de palabras.json: ver su campo «nota»)
ffmpeg -i public/episodios/ep-06/voz.wav -af apad=pad_dur=1.2 -c:a pcm_s24le cola.wav && mv cola.wav public/episodios/ep-06/voz.wav
node scripts/render-lote.mjs episodios/ep-06.json              # → out/claude-code-ep-06.mp4
python scripts/qa_master.py episodios/ep-06.json out/claude-code-ep-06.mp4
```

## Fuente
Lección 1.3 del curso: el esquema propio en PDF (`esquema_prompting_maestro.pdf`) y fotogramas del vídeo de la
clase (un documento leído en pantalla, sin demo de Claude Code). Del vídeo solo sale una idea que no está en el
PDF: «Incluso háblalo previamente con tu agente de IA». El audio del curso no se transcribió.

## Voz
Una sola toma de ElevenLabs (Manu Gordillo, v4), entera y sin cortes, que dice el guion tal cual. Timestamps:
Parakeet TDT local + texto del guion (357/360 palabras ancladas). La ASR oyó «Clos» por «Clave dos»: ese tramo y
tres inicios de escena («Es», «¿Quieres», «Sígueme») se colocaron a mano con la energía del audio.

## Bloques (tiempos sacados del audio)
| # | Bloque | Tiempo | En pantalla |
|---|---|---|---|
| 1 | intro | 0–3,8 | rejilla 10x5, EP.1–5 encendidos, el 6 late y se enciende → partículas → título |
| 2 | hoy | 3,8–13,2 | HOY · PROMPTING MAESTRO → bocadillo → Claude → la flecha da en la diana: A LA PRIMERA → PROMPT = LO QUE LE ESCRIBES, panel de Claude Code donde se escribe la frase de la voz |
| 3 | regla | 13,2–27,0 | LA REGLA · PIDES → Claude → RECIBES con barras de CALIDAD (las de la derecha siguen a las de la izquierda) → Claude MUY CAPAZ · bola de cristal tachada: NO LEE TU MENTE → Mejor explicas → Mejor sale → MENOS VUELTAS (3 → 1) |
| 4 | peticiones | 27,0–47,6 | Mismo Claude, distinta petición · caja de Claude Code arriba, Claude en medio, dos móviles. FLOJA: «hazme una web» → boceto gris GENÉRICO → ✗ NO TE SIRVE. BUENA: la petición larga se escribe al ritmo de la voz, cada pieza se subraya y aparece en el móvil (una página · fontanero de Madrid · botón grande de WhatsApp · colores azules · sección de precios) → ✓ USABLE A LA PRIMERA |
| 5 | claves | 47,6–69,0 | ¿Qué ha cambiado? · 1 2 3 · TRES CLAVES → CLAVE 1 DA CONTEXTO (para quién: Fontanero de Madrid · de qué va: Web de una página · qué estilo: Colores azules) → CLAVE 2 ACOTA LA TAREA (secciones de la web; marco de recorte en Precios: SÍ; candado en el resto: NO) → CLAVE 3 SEÑALA EJEMPLOS (REFERENCIA y CAPTURA viajan a Claude Code) → 1 EJEMPLO > 1.000 EXPLICACIONES |
| 6 | truco | 69,0–92,5 | EL TRUCO · QUE CASI NADIE USA → tú con interrogantes, Claude, bocadillos: QUE TE ENTREVISTE → ESCRÍBELE: en el panel se escribe «Antes de empezar, hazme todas las preguntas que necesites» y se envía → preguntas 1–4 que pasan a ✓: SACA EL DETALLE → EN EL EP.5: la pregunta real de aquella grabación (stack de la landing, Astro marcada) y CLAUDE.md ✓ → MÁS ALLÁ: tú ↔ TU AGENTE DE IA (ANTES) → Claude Code |
| 7 | ojo | 92,5–108,1 | ⚠ OJO → Claude Code y su código que se escribe solo: ✓ CRACK ESCRIBIENDO CÓDIGO · PERO NO EN TODO → NO ES EXPERTO EN… 4 fichas con ✗ (prompts que vendan · comunicación · branding · embudos de venta) → AHÍ ENTRAS TÚ: las ✗ pasan a ✓ · tú o TU AGENTE → TENLO EN CUENTA |
| 8 | resumen6 | 108,1–114,2 | RECUERDA: 1 Contexto → 2 Tarea acotada → 3 Ejemplos · SI TE ATASCAS + Entrevista |
| 9 | ctaDrive | 114,2–123,8 | (el del EP.5) ¿Quieres los esquemas…? → Drive → AUDITORIA se escribe y se envía → AUDITORÍA DE PROCESOS |
| 10 | avance6 | 123,8–132,1 | rejilla: EP.6 hecho, el 7 se enciende y la cámara entra → EP.7 · PRÓXIMO EPISODIO · CAMBIOS Y CORRECCIONES · Cuando no sale a la primera, mascota y lápiz ✓ → perfil @aigencyx.labs, Seguir → Siguiendo ✓ |

## Decisiones
- **Sin tomas nuevas:** la clase no tiene demo en pantalla. El panel de Claude Code es el recreado en el EP.5 desde
  su grabación; la pregunta de la entrevista («¿Con qué stack quieres construir la landing?») es la real de aquella
  grabación y sale rotulada «EN EL EP.5», que es lo que dice la voz.
- **La web del fontanero es un boceto:** sin teléfono, sin cifras en los precios y sin nombre de empresa; solo las
  piezas que nombra la petición. La «genérica» es un boceto gris con «Lorem ipsum».
- **Las tres claves usan el ejemplo del fontanero** (los datos salen de la propia petición buena) para que se vea
  qué es «contexto» y «acotar». Las secciones de la clave 2 (Cabecera, Botón de WhatsApp, Precios) son las de esa web.
- **Logos:** los adjuntos, sin redibujar: Claude, Claude Code (mascota y texto pixelado), WhatsApp (en el botón del
  móvil y en la clave 2) y Drive (CTA). WhatsApp viene de la rama del EP.3.
- **Iconos propios** (planos, en coral): bocadillo, diana, bola de cristal, llave, chincheta, etiqueta de precio,
  recorte, candado, captura, clip, agente de IA, megáfono, sello de marca, embudo, lápiz.
- **Subtítulos:** el texto del guion con su forma escrita («6», «50», «5», «CLAUDE.md»).
- **Estilo:** plantilla Master (fondo #0B0D12, acento #D97757). Insignia EP.6/50, marca de agua y barra de progreso.
- **Música:** la de la serie, a -20 dB con ducking de -8 dB bajo la voz.

## Checklist (`scripts/qa_master.py`, todo en verde)
- 1080x1920 a 30 fps, 132,14 s = duración de la voz con su cola.
- Sincronía voz-texto: 360 palabras, cada una resaltada en su instante; 69 bloques de subtítulos, máximo 2 líneas,
  línea más ancha 956 de 960 px.
- Cambio visible como mucho cada 0,67 s (regla: 2–3 s).
- -13,9 LUFS integrados, pico real -1,8 dBTP.
- Revisión visual (fotogramas sueltos de cada bloque y de cada transición): logos correctos, ningún texto cortado ni
  tapado por los subtítulos.
