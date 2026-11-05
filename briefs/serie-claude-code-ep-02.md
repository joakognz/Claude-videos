# Serie «Máster de Claude Code» · EP.2 «Visual Studio Code, GitHub, PUSH y PULL»

**Duración:** 1:47,5 (3.226 fotogramas), la de la voz montada · 1080x1920 · 30 fps · -13,8 LUFS, pico real -1,4 dBTP.
**Proyecto:** `serie-claude-code/`, composición `Master` (plantilla de la serie desde este episodio; ver su README).
**Entrega:** `entregas/serie-claude-code-ep-02.mp4`.

## Render
```bash
cd serie-claude-code
python scripts/preparar.py episodios/ep-02.json --mp3 ../audio/raw/serie-claude-code/ep-02_montaje.mp3 --modelo <sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8>
node scripts/render-lote.mjs episodios/ep-02.json              # → out/claude-code-ep-02.mp4
python scripts/qa_master.py episodios/ep-02.json out/claude-code-ep-02.mp4
```

## Voz
Dos tomas de ElevenLabs (Manu Gordillo, v4), en `audio/raw/serie-claude-code/`:
- larga, cortada en la pausa de 76,10 s (entre «…lo recuperas cuando quieras» y «Si eres dueño de un negocio…»);
- corta («Y hasta aquí el episodio 2…»), metida en medio.

Montaje (`ep-02_montaje.mp3`): larga 0–76,10 s → 0,35 s de silencio → corta → 0,45 s → larga desde 76,20 s → 1 s de
cola para que el botón «Seguir» termine. Fundidos de 10–40 ms en cada empalme. Las dos tomas estaban a -27,8 y
-27,4 LUFS: no hizo falta igualarlas. Timestamps: Parakeet TDT local + texto del guion (289/290 palabras ancladas).

## Escenas (tiempos sacados del audio)
| # | Escena | Tiempo | En pantalla |
|---|---|---|---|
| 1 | intro | 0–3,75 | rejilla 10x5 en ola, EP.1 encendido, EP.2 late y se enciende → partículas → asterisco de Claude + «CLAUDE CODE» pixelado + cangrejo, «MÁSTER DE CLAUDE CODE» |
| 2 | hoy | 3,9–9,2 | HOY · 1 ¿Qué es Visual Studio Code? · 2 Cómo se organiza tu forma de trabajar |
| 3 | conseguir | 9,5–11,2 | logo de VS Code · ¿Dónde conseguirlo? |
| 4 | buscador | 11,5–16,2 | se escribe «visual studio code», primer resultado, el cursor lo pulsa → grabación real de la web (sin barra de estado ni centro de control) con zoom a «Download for Mac» y toques |
| 5 | gratis | 16,5–18,3 | sellos GRATIS y CÓDIGO ABIERTO |
| 6 | ide | 18,7–26,9 | ¿Qué es? → editor con código que se escribe → «IDE» con golpe → Integrated / Development / Environment letra a letra + «Entorno de desarrollo integrado» |
| 7 | escribir | 27,2–30,3 | vuelta al editor · LENGUAJE DE PROGRAMACIÓN |
| 8 | word | 30,3–36,2 | pantalla dividida: Word, PROCESADOR DE TEXTO, documento, LENGUAJE HUMANO |
| 9 | microsoft | 36,4–41,4 | VS Code, LO MISMO, PERO CON CÓDIGO · Microsoft cae sobre los dos |
| 10 | guardar | 41,7–43,5 | huecos «?» · ¿Dónde se guarda? |
| 11 | nubes | 43,7–47,5 | Word → Drive y VS Code → GitHub (flechas dibujadas, logos con spring) |
| 12 | versiones | 47,7–51,8 | ARCHIVOS (paquetes) · VERSIONES (tarjetas apiladas) · COMPARTIR |
| 13 | compra | 51,8–56,4 | Microsoft cae solo sobre GitHub · YA EXISTÍA · Más adelante lo vemos a fondo |
| 14 | acciones | 56,6–59,4 | LO IMPORTANTE · DOS ACCIONES |
| 15 | push | 59,6–63,5 | flecha superior, tres paquetes de VS Code a GitHub · PUSH = SUBIR |
| 16 | pull | 63,7–66,4 | flecha inferior, el paquete vuelve · PULL = SACAR |
| 17 | bucle | 66,6–69,1 | las dos flechas en bucle; PUSH y PULL se resaltan al nombrarlos |
| 18 | esquema | 69,3–76,1 | mapa completo con Word y Drive tenues · ESCRIBES / GUARDAS / RECUPERAS, la cámara va a cada uno |
| 19 | próximo | 76,3–95,4 | la rejilla marca el EP.2 hecho, el EP.3 late, la cámara entra en él → tarjeta EP.3 PRÓXIMAMENTE con lo que dice la voz |
| 20 | auditoria | 95,7–103,5 | pregunta palabra a palabra · AUDITORIA se escribe y se envía · AUDITORÍA GRATUITA · ¿Qué procesos podemos optimizar? |
| 21 | seguir | 103,7–107,5 | «CLAUDE CODE» pixelado, perfil @aigencyx.labs, rejilla con 2/50 · Seguir → Siguiendo ✓ |

## Decisiones
- **Estilo:** fondo #0B0D12, acento #D97757, texto blanco; Sora (títulos), Inter (subtítulos), JetBrains Mono.
- **Logos:** los adjuntos, sin redibujar. Al cangrejo se le quitó solo el fondo blanco liso conectado al borde (los
  ojos siguen blancos). El octocat negro va sobre ficha blanca y Microsoft sobre tarjeta clara (sobre negro no se
  leían). El logo «GitHub» con texto no se usa: trae el fondo de cuadros incrustado.
- **Insignia** EP.2/50 arriba a la izquierda y **marca de agua** @aigencyx.labs arriba a la derecha (abajo chocaba
  con textos y la tapa la interfaz de Instagram).
- **Transiciones:** 7 bloques temáticos con `@remotion/transitions` (avance con zoom y desenfoque, 0,67 s, centrado en la
  pausa entre bloques). Dentro de cada bloque la cámara es continua, sin saltos, y encuadra lo que nombra la voz.
- **Música:** la original del proyecto, a -20 dB con ducking de -8 dB bajo la voz; golpe suave en cada sello.
- **Textos:** salen del guion. «Integrated Development Environment» es la expansión de las siglas que dice la voz.
  El título del resultado de búsqueda y la URL son los de la grabación.

## Checklist (`scripts/qa_master.py`, todo en verde)
- 1080x1920 a 30 fps, 107,54 s = duración de la voz.
- Sincronía voz-texto: 290 palabras, cada una resaltada en su instante; 52 bloques de subtítulos, máximo 2 líneas,
  línea más ancha 956 de 960 px.
- Cambio visible como mucho cada 0,83 s (regla: 2–3 s).
- -13,8 LUFS integrados, pico real -1,4 dBTP.
- Revisión visual (un fotograma cada 2,5 s + fotogramas sueltos de cada escena): logos correctos en cada escena y
  ningún texto cortado.
