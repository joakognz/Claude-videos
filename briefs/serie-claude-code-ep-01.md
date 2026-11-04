# Serie «Claude Code» · EP.1 «Qué es Claude Code»

**Duración:** 63,71 s (1.911 fotogramas), igual que la toma · 1080x1920 · 30 fps · -14 LUFS.
**Proyecto:** `serie-claude-code/`, plantilla para los 50 episodios: un JSON por episodio y render en lote (ver su README).
**Voz:** una sola toma de ElevenLabs (Manu Gordillo, v4, speed 0.82, stability 50, similarity 100), usada entera.
**Entrega:** `entregas/serie-claude-code-ep-01.mp4`.
**QA (`scripts/qa.py`, todo en verde):** 1080x1920 a 30 fps · 1.911 fotogramas, igual que la voz · 41 planos (media de 1,55 s, máximo de 2,70 s) · intro de 0 a 3,82 s · CTA de 57,44 a 63,71 s (6,27 s) · 3 pasos con golpe y tick · música a -28 dB bajo la voz (tope de -20 dB) · -14,0 LUFS, pico real de -1,7 dBTP · voz desplazada 5 ms respecto a la toma (el arranque del AAC).

## Guion (transcrito de la toma)
No llegó el guion en texto, así que lo saqué del MP3 con dos reconocedores locales: Parakeet TDT 0.6B v3, que da los tiempos, y Whisper small como contraste. Después lo corregí a mano:
```
Empiezo una serie de Claude Code. Episodio 1.
Antes de tocar nada, hay que entender qué es.
Anthropic es la empresa. Claude es su marca.
Dentro hay varios productos: Claude Design, Claude Cowork y Claude Code.
Debajo de todos, los modelos: Fable, Opus y Sonnet.
Y Claude Code es una herramienta que escribe código por ti.
Antes, un desarrollador lo escribía todo a mano: web, scripts, Python.
Ahora le dices qué quieres y lo escribe en tus carpetas.
Paso 1. Elige dónde abrirlo: terminal, VS Code, JetBrains o la app de escritorio. Es la misma herramienta, solo cambia dónde la abres.
Paso 2. Pídele lo que quieres, con tus palabras.
Paso 3. Revisa lo que hace y corrígelo.
Pedir, revisar, corregir. Ese es el ciclo.
En los próximos episodios: qué es VS Code, instalarlo y tu primer proyecto.
Sígueme para no perderte ninguno. ¿Qué tarea de tu negocio quitarías primero? Comenta auditoría.
```

## Metáfora continua (regla 4): un único zoom hacia dentro
Rejilla de los 50 episodios → la casilla del EP.1 → la lupa de «¿Qué es?» → el mapa Anthropic ⊃ Claude ⊃ productos, con los modelos debajo → la caja de Claude Code → su panel de código → la carpeta de «tus carpetas» → el núcleo «Claude Code» de las cuatro puertas → la salida del terminal → el ✓ de la línea corregida → el centro del ciclo → el botón del último próximo episodio → el CTA.

## Escenas (tiempos sacados del audio)
| Escena | Tiempo | En pantalla |
|---|---|---|
| intro | 0–3,82 | SERIE / Claude Code / 50 EPISODIOS; se enciende la casilla 1 en «Episodio» y aparece la etiqueta EPISODIO 1 DE 50 |
| entender | 3,82–6,80 | ANTES DE TOCAR NADA · «¿Qué es?» · lupa |
| mapa / productos / modelos | 6,80–19,76 | cajas que aparecen al nombrarlas; MODELOS con la etiqueta DEBAJO DE TODOS |
| herramienta | 19,76–23,70 | Claude Code · «escribe código por ti» · el código se escribe solo (barras abstractas) |
| antes / ahora | 23,70–32,44 | ANTES: todo a mano, teclado, Web/Scripts/Python · AHORA: «qué quieres» → los archivos vuelan a la carpeta |
| paso 1 | 32,44–41,97 | sello PASO 1 · 4 tarjetas que se encienden al nombrarlas · flechas al núcleo LA MISMA HERRAMIENTA · tick |
| paso 2 | 41,97–45,41 | sello PASO 2 · se escribe «Lo que quieres, con tus palabras» · TU PETICIÓN · tick |
| paso 3 | 45,41–48,61 | sello PASO 3 · escáner por las líneas, una marcada, corregida · REVISA / CORRIGE · tick |
| ciclo | 48,61–52,03 | Pedir → Revisar → Corregir, EL CICLO, un punto de luz que lo recorre |
| próximos | 52,03–57,44 | ¿Qué es VS Code? · Instalarlo · Tu primer proyecto (sin numerar: la voz no dice qué número tienen) |
| CTA | 57,44–63,71 (6,27 s) | @aigencyx.labs + Seguir → Siguiendo ✓ · la pregunta · AUDITORIA se escribe letra a letra y se envía |

## Decisiones
- **Estilo base:** el prompt traía «[PEGAR ESTILO BASE]» sin rellenar, así que usé el de la marca (negro, naranja #FF6B1A / #FFB066, crema; Sora, Inter, JetBrains Mono; sin rojo, azul ni verde). Se cambia por episodio con `"estilo"` en el JSON o para toda la serie en `src/tema.ts`.
- **Marca de agua:** @aigencyx.labs abajo a la izquierda, al 42 %, por encima de la zona que tapa Instagram.
- **Música:** original y sintetizada (`scripts/sintetizar_audio.py`): la menor a 100 ppm, pad, bajo, arpegio y batería suave, con un hueco en 1,5–4 kHz para la voz. Va a -20 dB respecto a la voz y baja -8 dB mientras habla. En este episodio la voz casi no para, así que la música está a -28 dB casi todo el tiempo.
- **Sin datos inventados:** no hay cifras en el guion, así que no hay fuentes que mostrar (el tipo `dato` las exige). En el terminal se escribe la frase de la propia voz, no una petición inventada, y el código son barras abstractas.
- **Clips reales:** este episodio no trae. `ClipPantalla` y `scripts/cursor.py` se probaron con un clip sintético (cámara del ponente fuera del recorte, cursor en movimiento y texto escribiéndose): composición «ClipPantalla» en Studio.

## Pendiente de comprobar (tú)
1. **«Claude Design»:** la ASR oyó «Clode The Sang» / «Cloud Deseng» (12,10–13,00 s). Encaja con el producto de Anthropic, pero confírmalo.
2. El **estilo base** que querías pegar: si es otro, se cambia en `src/tema.ts` y se vuelve a renderizar.
3. Que la fila de sellos PASO (arriba a la derecha, y 258–318 px) no choque con los iconos de Instagram en tu cuenta.
