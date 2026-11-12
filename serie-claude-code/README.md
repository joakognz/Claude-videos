# Serie «Claude Code» · reels 1080x1920 en Remotion

Un reel vertical por episodio (50 en total) a partir de **un JSON por episodio**, su **voz en off** y sus
**timestamps por palabra**. El mismo código monta todos los episodios: lo único que cambia es el JSON.

## Estructura

```
serie-claude-code/
├── episodios/                    ← ENTRADA: un JSON por episodio
│   └── ep-01.json
├── public/
│   ├── episodios/ep-01/
│   │   ├── voz.mp3               toma original de ElevenLabs (entera, sin cortar)
│   │   ├── voz.wav               la misma toma a nivel de emisión (scripts/preparar.py)
│   │   ├── palabras.json         timestamps por palabra con el texto del guion (scripts/preparar.py)
│   │   └── clips/                clips del vídeo original (opcional)
│   ├── audio/musica.wav          música original en bucle (scripts/sintetizar_audio.py)
│   ├── audio/sfx/*.wav           golpe, tick, whoosh, pop, tecleo, envío
│   ├── fonts/                    Inter, Sora, JetBrains Mono (locales)
│   └── pruebas/clip-prueba.mp4   clip sintético para probar ClipPantalla
├── scripts/
│   ├── preparar.py               voz → voz.wav (-14 LUFS en el mp4) + palabras.json
│   ├── cursor.py                 posiciones del cursor de un clip real (para el zoom)
│   ├── sintetizar_audio.py       música y efectos (una vez para toda la serie)
│   ├── render-lote.mjs           render en lote: un mp4 por JSON
│   └── qa.py                     comprueba las reglas sobre el mp4
└── src/
    ├── Root.tsx                  composición «Episodio» + calculateMetadata (duración = audio)
    ├── Episodio.tsx              las capas del reel
    ├── plan.ts                   escenas desde el audio, planos de 2–3 s, cámara, ducking, sonido
    ├── datos.ts                  duración real del audio y lectura de timestamps (4 formatos)
    ├── tipos.ts · tema.ts        esquema del JSON · estilo base, fuentes, curvas
    ├── componentes/              ← reutilizables
    │   ├── Escena.tsx            lienzo + cámara + portal al lienzo siguiente
    │   ├── Subtitulos.tsx        arriba, palabra a palabra, la activa en recuadro de acento
    │   ├── Sello.tsx             «PASO N» con golpe, sacudida y tick al completarse
    │   ├── Insignia.tsx          insignia EP.N, marca de agua y texto en pantalla
    │   ├── Sonido.tsx            voz, música con ducking y efectos en su fotograma
    │   ├── ClipPantalla.tsx      clip real recortado (sin la cámara del ponente) con zoom al cursor
    │   └── Logo.tsx · estilo.tsx
    └── imagenes/                 un tipo de plano por fichero (ver abajo)
```

## Flujo por episodio

```bash
cd serie-claude-code
npm i                                              # una vez
pip install numpy scipy pyloudnorm sherpa-onnx     # una vez (scripts de Python)
python scripts/sintetizar_audio.py                 # una vez: música y efectos

# 1) voz y timestamps (con el alineado de ElevenLabs si lo tienes; si no, reconocedor local + guion)
python scripts/preparar.py episodios/ep-02.json --mp3 ../audio/raw/serie-claude-code/ep-02.mp3 \
       [--elevenlabs alineado.json | --modelo <carpeta sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8>]
# 2) (opcional) clips reales: posiciones del cursor dentro del recorte
python scripts/cursor.py public/episodios/ep-02/clips/demo.mp4 --recorte 0,0,1440,1080 --episodio episodios/ep-02.json --escena demo
# 3) revisar en Studio
npm run dev
# 4) render
node scripts/render-lote.mjs                       # todos los episodios/ep-*.json
node scripts/render-lote.mjs episodios/ep-01.json  # solo uno → out/claude-code-ep-01.mp4
npx remotion render Episodio out/claude-code-ep-01.mp4 --props=episodios/ep-01.json   # equivalente con la CLI
# 5) comprobaciones
python scripts/qa.py out/claude-code-ep-01.mp4
```

El modelo de reconocimiento (490 MB) está en
`https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8.tar.bz2`.
Solo hace falta si no tienes los timestamps de ElevenLabs: los tiempos salen del audio, pero el **texto de los
subtítulos es siempre el del guion**. Se alinea palabra a palabra, así que «Clod», de la ASR, sale como «Claude».

## Plantilla «Master» (desde el EP.2)

El EP.2 estrena la plantilla definitiva de la serie (composición `Master`, `src/master/`). El JSON del episodio
lleva `"composicion": "Master"` y `render-lote.mjs` elige la composición por ese campo (el EP.1 sigue con «Episodio»).

```
src/master/
├── Master.tsx            capas: bloques con transición, subtítulos, insignia, marca de agua, sonido
├── calcular.ts           calculateMetadata: duración = audio, cortes entre bloques, música con ducking, efectos
├── nucleo.ts             estilo (#0B0D12 / #D97757), línea de tiempo desde los timestamps, spring(), cámara continua
├── transicion.tsx        transición de @remotion/transitions entre bloques (avance con zoom y desenfoque)
├── tipos.ts              esquema del JSON
├── componentes/          ← reutilizables
│   ├── Escena.tsx        lienzo + cámara (las tomas se anclan a palabras de la voz)
│   ├── Subtitulos.tsx    arriba, palabra a palabra, la activa en recuadro de acento, máx. 2 líneas
│   ├── Sello.tsx         Sello (cae con golpe) y Etiqueta (entrada spring, salida antes del corte)
│   ├── Flecha.tsx        flecha curva con trazo animado
│   ├── Paquete.tsx       paquete de archivos que viaja por una curva
│   ├── Rejilla.tsx       rejilla de 50 episodios (intro, próximo, CTA)
│   ├── Logo.tsx · Caida.tsx · Piezas.tsx · Insignia.tsx · Sonido.tsx
└── bloques/              un bloque temático por fichero: intro, conseguir, ide, analogia, pushpull, proximo, cta
```

- `escenas[]`: `id` + `voz` (texto exacto del guion). La duración de cada escena sale de sus palabras en el audio.
- `bloques[]`: `{ tipo, desde }`. Cada bloque empieza en la escena `desde`; la transición queda centrada en la pausa.
- `logos`: rutas de los logos adjuntos en `public/logos/` (nunca se redibujan; GitHub va sobre ficha blanca y
  Microsoft sobre tarjeta clara porque no se leen sobre el fondo oscuro).
- `cta`: `tipo` (auditoria | drive), `pregunta`, `palabra_clave`, `texto`, `sello`, `remate`, `seguir`.
- `proximo[]`: lo que se anuncia del episodio siguiente, cada punto anclado a una palabra de la voz (`en`).

```bash
python scripts/preparar.py episodios/ep-02.json --mp3 ../audio/raw/serie-claude-code/ep-02_montaje.mp3 --modelo <parakeet>
node scripts/render-lote.mjs episodios/ep-02.json          # → out/claude-code-ep-02.mp4
python scripts/qa_master.py episodios/ep-02.json out/claude-code-ep-02.mp4
```

## Episodios en partes (desde el EP.4)

Un episodio largo se parte en reels: un JSON por parte (`episodios/ep-04-p1.json`, `ep-04-p2.json`), con
`"parte": { "n": 1, "de": 2 }`. Con eso:

- `preparar.py` deja la voz y los timestamps en `public/episodios/ep-NN-pN/`;
- la insignia pasa a «EP.4 · 1/2» y entra al terminar el título; la intro añade «PARTE 1 DE 2» y los iconos de
  `intro.iconos` (cada uno cuando la voz dice su `en`; `pequeno` = lo que viene en otra parte, atenuado);
- `"salida": "ep4_parte1"` da nombre al mp4; `"barra_progreso": true` añade la barra fina de arriba.

Bloques nuevos (`src/master/bloques/`), todos anclados a palabras de la voz:

| tipo | qué hace |
|---|---|
| `meta` | camino hasta la bandera y tres tarjetas de proyecto que la cámara visita |
| `sistema` | base «tu sistema de trabajo», ciclo pedir → revisar → corregir y tarjeta de tarea «ELIGE UNO» |
| `escalera` | los cuatro peldaños se levantan (0 IDEA · 1 DESARROLLO · 2 STAGING · 3 PRODUCCIÓN) |
| `etapa` (+ `"etapa": N`) | la cámara sube al peldaño N, sello «ETAPA N» con golpe, entra en el peldaño y se desarrolla la etapa (`EtapaIdea`, `EtapaDesarrollo`, `EtapaStaging`, `EtapaProduccion`); tick al terminar. Mientras duran las etapas, una escalera mini fija arriba marca la actual y las hechas |
| `resumen` | escalera completa con ticks, la bandera arriba y la cámara subiendo al nombrar cada etapa |
| `ctaDrive` | `cta.tipo: "auditoria_drive"`: carpeta de Drive con documentos, comentario con la palabra clave, enlace y tarjeta de auditoría |
| `avance` | tarjeta con candado que se abre: sello «PARTE N» (o «EP.N» con su casilla en la rejilla), icono, título y puntos |
| `seguir` | perfil, rejilla, frase de `cierre` y botón Seguir → Siguiendo ✓ |

Parte 2 (costes): `moneda` (moneda que gira y se calma), `gratis` (baldosas con «0 €»), `pagas` (lo que se paga, con la
etiqueta fija de `precios`), `reglas` (3 REGLAS y REGLA 1/2/3: medidor, modelos, curva de gasto), `resumenCostes`.
`avance` con `"tipo": "episodio"` añade la rejilla con la casilla siguiente, `en` (palabra del sello) y `titulo_en`.

Componentes reutilizables nuevos: `Escalera` (y `EscaleraMini`), `Tarjeta`, `Chip`, `Frase` (texto grande palabra a
palabra con la voz), `BarraProgreso`, `Iconos` (pictogramas genéricos; los logos de marca siguen siendo los adjuntos).

```bash
python scripts/preparar.py episodios/ep-04-p1.json --mp3 ../audio/raw/serie-claude-code/ep-04_p1_montaje.mp3 --modelo <parakeet>
node scripts/prueba.mjs episodios/ep-04-p1.json --tramos intro:0-10.8      # pruebas a 540x960 → out/pruebas/
node scripts/prueba.mjs episodios/ep-04-p1.json --fotos 12,48.5            # fotogramas sueltos
node scripts/render-lote.mjs episodios/ep-04-p1.json                       # → out/ep4_parte1.mp4
python scripts/qa_master.py episodios/ep-04-p1.json out/ep4_parte1.mp4
```

## Portadas

Composición `Portada` (imagen fija 1080x1920) a partir del campo `"portada"` del JSON:
`{ "titulo": ["¿CUÁNTO", "CUESTA?"], "subtitulo": "...", "chips": ["3 REGLAS", ...] }` (la última línea del título va en
acento). Todo lo importante cae dentro del recorte 3:4 de la cuadrícula del perfil (y 240–1680).

```bash
node scripts/portada.mjs                          # todas las que tengan "portada" → out/<salida>_portada.png
node scripts/portada.mjs episodios/ep-04-p2.json
```

## El JSON de un episodio (EP.1, composición «Episodio»)

| Campo | Qué es |
|---|---|
| `serie`, `episodio`, `total_episodios`, `titulo` | «Claude Code», N, 50 |
| `usuario` | marca de agua y CTA (`@aigencyx.labs`) |
| `voz.audio`, `voz.timestamps` | rutas dentro de `public/`. También vale `voz.palabras` en línea |
| `musica` | `{ audio, db: -20, duckingDb: -8 }`: nivel respecto a la voz y cuánto baja mientras habla |
| `cta` | `{ seguir, pregunta, comenta }` |
| `estilo` | opcional: cualquier color del estilo base (`acento`, `fondo`, `texto`…) |
| `escenas[]` | el guion: `id`, `segundos` (orientativo), `voz` (texto exacto), `texto` (en pantalla; lista = cambia con los planos), `imagen`, `paso`, `pasoCompleto`, `etiquetas[]` |

Las anclas (`en`) son palabras o frases de la voz: el elemento aparece cuando la voz lo dice. Una escena con
`"imagen": { "tipo": "continuar" }` sigue en el lienzo de la anterior.

### Tipos de imagen (`src/imagenes/`)

| tipo | para qué | portal (por dónde entra la cámara al siguiente) |
|---|---|---|
| `serie` | intro: rejilla de los 50 episodios, se enciende el de hoy | la casilla del episodio |
| `titular` | antetítulo + título + subtítulo, con `lupa` o `panel` de código | la lupa / el panel |
| `mapa` | cajas anidadas (empresa → marca → productos + base) | `portal`: id de una caja |
| `antesAhora` | comparación antes/ahora | la carpeta |
| `opciones` | N opciones que convergen en un núcleo | el núcleo |
| `terminal` | petición que se escribe mientras se dice | la zona de salida |
| `revision` | escáner por líneas, una marcada y corregida | su ✓ |
| `ciclo` | pasos en círculo con flechas | el centro |
| `lista` | tarjetas que aparecen al nombrarlas | el botón de la última |
| `dato` | cifra + texto + **fuente obligatoria** | la cifra |
| `clip` | clip real recortado con zoom al cursor | el centro del clip |
| `cta` | seguir, pregunta y comentario que se escribe solo | — (último) |

## Cómo se cumple cada regla

| # | Regla | Dónde |
|---|---|---|
| 1 | La duración de cada escena sale del audio | `plan.ts`: cada escena va de su primera a su última palabra; `segundos` se ignora |
| 2 | Subtítulos arriba, palabra a palabra, activa en recuadro de acento | `Subtitulos.tsx` |
| 3 | Cambio de plano cada 2–3 s | `plan.ts › planos()`: corta donde aparece algo y parte lo que pase de 3 s; zoom, giro y texto cambian en cada plano. `qa.py` lo mide |
| 4 | Metáfora continua, de lo general al detalle | `Escena.tsx`: cada lienzo vive dentro de un elemento del anterior y la cámara siempre entra (serie → episodio → lupa → empresa → producto → …) |
| 5 | Insignia EP.N fija + marca de agua | `Insignia.tsx` |
| 6 | «PASO N» con golpe y tick al completarse | `Sello.tsx` + eventos `golpe`/`tick` en `plan.ts` |
| 7 | Etiquetas y flechas; cifra ⇒ fuente | `etiquetas[]` (la cámara las encuadra); tipo `dato`; el plan avisa si la voz dice una cifra sin fuente |
| 8 | Clips sin cámara del ponente, zoom al cursor | `ClipPantalla.tsx` + `scripts/cursor.py`; composición de prueba «ClipPantalla» |
| 9 | Música a -20 dB con ducking | `plan.ts › envolventeMusica()` (-20 dB, -8 dB bajo la voz, ataque 0,15 s, relajación 0,5 s) |
| 10 | 3 s iniciales: serie y episodio; 6 s finales: CTA | `plan.ts` alarga la intro a 3 s y adelanta el CTA a 6 s si hace falta. `qa.py` lo comprueba |
| 11 | Sin datos inventados; español de España | el texto sale del guion; código abstracto (barras), sin peticiones de ejemplo inventadas |
| 12 | Componentes reutilizables y render en lote | `src/componentes/`, `src/imagenes/`, `scripts/render-lote.mjs` |
