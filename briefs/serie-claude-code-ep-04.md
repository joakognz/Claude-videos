# Serie «Máster de Claude Code» · EP.4 · parte 1 «Lo que construirás y las 4 etapas» y parte 2 «Cuánto cuesta»

**Duración:** 2:34,5 (4.635 fotogramas): voz de 153,0 s + 1,5 s de cola para que el botón «Seguir» termine ·
1080x1920 · 30 fps · -13,8 LUFS, pico real -1,8 dBTP.
**Proyecto:** `serie-claude-code/`, composición `Master` con `"parte"` en el JSON (ver «Episodios en partes» en su README).
**Entrega:** `entregas/ep4_parte1.mp4` y `entregas/ep4_parte2.mp4` (parte 2 al final de esta ficha).

## Estructura
```
serie-claude-code/
├── episodios/
│   ├── ep-04-p1.json                 JSON de la parte 1 (escenas = guion, bloques, CTA, avance, cierre)
│   └── guiones/guion_ep4_p1.txt      guion original
├── public/
│   ├── episodios/ep-04-p1/           voz.mp3 (montaje), voz.wav (nivel de emisión), palabras.json (timestamps)
│   └── logos/wordpress.png           logo adjunto (los demás, los de la serie)
├── src/master/bloques/               meta, sistema, escalera, etapa (+ EtapaIdea/Desarrollo/Staging/Produccion),
│                                     resumen, ctaDrive, avance, seguir
├── src/master/componentes/           Escalera, Tarjeta (+ Chip, Frase), BarraProgreso, Iconos, Caja
└── scripts/prueba.mjs                fotogramas y tramos a 540x960
audio/raw/serie-claude-code/ep-04_p1_*.mp3   toma de ElevenLabs y montaje con cola
```

## Render
```bash
cd serie-claude-code
python scripts/preparar.py episodios/ep-04-p1.json --mp3 ../audio/raw/serie-claude-code/ep-04_p1_montaje.mp3 --modelo <sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8>
node scripts/prueba.mjs episodios/ep-04-p1.json --tramos intro:0-10.8,escalera:40.4-130.2,cierre:130-154.5   # pruebas 540x960
node scripts/render-lote.mjs episodios/ep-04-p1.json          # → out/ep4_parte1.mp4
node scripts/render-lote.mjs                                   # lote: todos los episodios/ep-*.json (también ep-NN-pN)
python scripts/qa_master.py episodios/ep-04-p1.json out/ep4_parte1.mp4
```

## Voz
Una toma de ElevenLabs (Manu Gordillo, v4), 153,0 s, -27,1 LUFS. Montaje: la toma entera + 1,5 s de silencio (la
última palabra acaba a 152,85 s). Timestamps: Parakeet TDT local + texto del guion, 418/419 palabras ancladas (los
números dichos en letra van en cifra en los subtítulos: «Episodio 4 de 50, parte 1», «1:», «Etapa 0:», «parte 2»).
La voz dice el guion sin cambios.

## Escenas (tiempos sacados del audio)
| Bloque | Tiempo | En pantalla |
|---|---|---|
| intro | 0–10,8 | rejilla 10x5 en ola, EP.1–3 encendidos, el 4 late → partículas → asterisco, «CLAUDE CODE», mascota, MÁSTER DE CLAUDE CODE, PARTE 1 DE 2; insignia EP.4 · 1/2; iconos META, 4 ETAPAS y moneda pequeña PARTE 2 |
| meta | 10,8–32,1 | camino hasta la bandera (LA META) · «Qué vas a poder construir» · 3 tarjetas: WordPress (publicada, segura, accesos), automatización (servidor + reloj 24/7, corre sola, VPS, sin pantalla, ojo tachado), mini-app (pantalla que se enciende, a medida, desplegada, en marcha) |
| sistema | 32,1–40,6 | los tres proyectos sobre «TU SISTEMA DE TRABAJO» · ciclo PEDIR → REVISAR → CORREGIR · TU TAREA: ELIGE UNO con cursor por los tres |
| escalera | 40,6–45,6 | 4 peldaños 0 IDEA · 1 DESARROLLO · 2 STAGING · 3 PRODUCCIÓN · 4 ETAPAS · un proyecto que cambia de tamaño |
| etapa 0 | 45,6–61,9 | sello ETAPA 0 → la cámara entra en el peldaño · código en pausa · bocadillo que se acorta a QUÉ HACE + PARA QUIÉN · «Si no sabes decirlo simple, no sabes construirlo.» · funciones: imprescindibles / YA VEREMOS → VERSIÓN MÍNIMA · EL ERROR Nº 1: QUERER TODO |
| etapa 1 | 61,9–79,7 | sello ETAPA 1 · carpeta que se abre en VS Code (logo) · contexto a Claude · funcionalidades por trozos con tick · «Hazme la app entera» tachado · revisa (escáner) y ACEPTAR · GUARDA AVANCES · se rompe → flecha atrás |
| etapa 2 | 79,7–104,6 | sello ETAPA 2 · navegador STAGING, COPIA DE PRUEBA, candado y contraseña · botones con tick y ✓ · ROMPERLO A PROPÓSITO: datos raros y campos vacíos · OTRA PERSONA encuentra fallos · Claude los arregla · sello REGLA DE ORO: los problemas, aquí, no con tu cliente |
| etapa 3 | 104,6–130,1 | sello ETAPA 3 · cohete hacia HOSTING y VPS · TU ORDENADOR ✓ / ONLINE ✗ · llaves al CLIENTE · SEGURIDAD: contraseñas y SSL · vuelta a la escalera: flecha circular NO ES EL FINAL, MANTENER / ARREGLAR / MEJORAR, UN PROYECTO VIVO |
| resumen | 130,1–136,5 | escalera con 4 ticks, la bandera arriba, la cámara sube al nombrar cada etapa |
| CTA | 136,5–145,9 | «¿Quieres los esquemas de este episodio?» · carpeta de Drive con documentos y esquemas · AUDITORIA escrito y enviado · enlace a la carpeta · SI TIENES UN NEGOCIO con checks · OPTIMIZAR TUS PROCESOS |
| avance | 145,9–151,0 | tarjeta con candado que se abre · sello PARTE 2 · moneda que gira y se calma · COSTES · Cuánto cuesta · Cómo gastar menos |
| seguir | 151,0–154,5 | perfil @aigencyx.labs, rejilla 3/50 + el 4 latiendo · «Sígueme para no perdértela.» · Seguir → Siguiendo ✓ |

## Decisiones
- **Estilo:** fondo #0B0D12, acento #D97757, texto blanco; Sora (títulos), Inter (subtítulos), JetBrains Mono.
- **Logos:** los adjuntos, sin redibujar. WordPress (negro sobre transparente) va sobre ficha blanca. Los pictogramas
  (bandera, servidor, cohete, candado…) son iconos genéricos, no logos.
- **Sin texto inventado:** frases largas, funciones y formularios son barras o símbolos abstractos. «24/7» sale del
  brief. Ninguna cifra de precio; la palabra «fases» no aparece.
- **Escalera mini** fija arriba durante las 4 etapas: peldaño actual encendido y tick en las hechas (sonido de tick).
- **Transiciones:** 12 bloques con `@remotion/transitions` (avance con zoom y desenfoque, centrado en la pausa).
  Dentro de cada etapa, la cámara entra en el peldaño y el contenido sale de él.
- **Música:** la original de la serie a -20 dB con ducking de -8 dB; golpe en los sellos ETAPA N, REGLA DE ORO y PARTE 2.
- **Plantilla:** todo lo nuevo se activa con `parte` en el JSON; el EP.2 renderiza igual que su entrega.

## Checklist (`scripts/qa_master.py`, todo en verde)
- 1080x1920 a 30 fps, 154,52 s = duración de la voz montada.
- Sincronía voz-texto: 419 palabras, cada una resaltada en su instante; 73 bloques, máximo 2 líneas, línea más
  ancha 956 de 960 px.
- Cambio visible como mucho cada 0,67 s (regla: 2–3 s).
- Ninguna cifra de precio y la palabra «fases» ausente (JSON y textos de los bloques).
- -13,8 LUFS integrados, pico real -1,8 dBTP.
- Revisión visual (un fotograma cada 2,5 s): logos correctos en cada escena y ningún texto cortado (las tarjetas
  vecinas que asoman por el encuadre se atenúan).

---

# Parte 2 · «Cuánto cuesta y cómo gastar menos»

**Duración:** 1:52,4 (3.373 fotogramas): voz de 110,9 s + 1,5 s de cola · 1080x1920 · 30 fps · -13,9 LUFS, pico real
-1,7 dBTP. **JSON:** `episodios/ep-04-p2.json` · **guion:** `episodios/guiones/guion_ep4_p2.txt` · **entrega:**
`entregas/ep4_parte2.mp4`. Hecha de una, sin pruebas intermedias (lo pediste así).

```bash
python scripts/preparar.py episodios/ep-04-p2.json --mp3 ../audio/raw/serie-claude-code/ep-04_p2_montaje.mp3 --modelo <parakeet>
node scripts/render-lote.mjs episodios/ep-04-p2.json          # → out/ep4_parte2.mp4
python scripts/qa_master.py episodios/ep-04-p2.json out/ep4_parte2.mp4
```

**Voz:** una toma de ElevenLabs (Manu Gordillo, v4) que dice el guion sin cambios; 295/300 palabras ancladas
(«/init» se pronuncia «barra init»).

## Escenas (tiempos sacados del audio)
| Bloque | Tiempo | En pantalla |
|---|---|---|
| intro | 0–9,6 | la intro de la serie con PARTE 2 DE 2 e insignia EP.4 · 2/2; iconos COSTES (moneda grande), HOSTING y 3 REGLAS |
| moneda | 9,6–13,7 | moneda grande que gira y se calma, anillos que respiran · POR ENCIMA · check al decir «sorpresas» |
| gratis | 13,7–24,4 | LA BUENA NOTICIA · «Casi todo el entorno es gratis.» · VS Code, Node.js y extensiones, cada uno con su «0 €» |
| pagas | 24,4–52,5 | ¿Qué pagas? DOS COSAS: Claude y Hostinger · DOS FORMAS: interruptores SUSCRIPCIÓN MENSUAL / POR USO, PLAN PRO para empezar · DEPENDE DEL PROYECTO: una web → HOSTING BÁSICO, automatización o app → VPS (una moneda más, CUESTA ALGO MÁS) · etiqueta fija PRECIOS ORIENTATIVOS · COMPRUÉBALOS, que en «Ojo» pasa al centro: LOS PRECIOS CAMBIAN, MIRA EL PRECIO ACTUAL |
| reglas | 52,5–80,3 | sello 3 REGLAS · REGLA 1: medidor que se llena justo hasta LO MÍNIMO, PLAN PRO + HOSTING BÁSICO bastan, PLAN GRANDE «POR SI ACASO» tachado · REGLA 2: LIGERO → LO SENCILLO (gasta menos), POTENTE → LO COMPLICADO · REGLA 3: contador de gasto y curva de la primera semana; al ajustar no llega a SE DISPARA |
| resumen | 80,3–87,0 | CASI TODO GRATIS ✓ · PAGAS CLAUDE + HOSTING ✓ · 3 REGLAS, cada una con su tick |
| CTA | 87,0–96,7 | como en la parte 1: carpeta de Drive, AUDITORIA, enlace y tarjeta de auditoría |
| avance | 96,7–108,6 | tarjeta con candado · sello EP.5 · la casilla 5 se enciende en la rejilla · mascota con latido · EL CORAZÓN DE CLAUDE CODE · Archivos claude.md · El comando /init · El ciclo de trabajo |
| seguir | 108,6–112,4 | perfil con la rejilla 4/50 completa y la 5 latiendo · «Sígueme para no perderte el siguiente.» · Seguir → Siguiendo ✓ |

## Decisiones
- **El guion manda sobre el brief:** el avance anuncia lo que dice la voz («el corazón de Claude Code»: claude.md,
  /init y el ciclo de trabajo), no «Tu primer Hola Mundo»; el cierre es «Sígueme para no perderte el siguiente.».
- **Sin cifras de precio:** solo conceptos, monedas y medidores sin números. La única cifra es el «0 €» de lo gratis,
  que pedía el brief (el QA lo admite como «gratis» y rechaza cualquier otra).
- **Logos:** Node.js (letras gris oscuro) y Hostinger, sobre tarjeta clara; los demás, como en la parte 1. Los modelos
  ligero y potente no llevan nombre (la voz no los nombra): engranaje pequeño y grande.

## Checklist (`scripts/qa_master.py`, todo en verde)
- 1080x1920 a 30 fps, 112,45 s = duración de la voz montada.
- Sincronía voz-texto: 300 palabras, cada una en su instante; 52 bloques, máximo 2 líneas, línea más ancha 956 de 960 px.
- Cambio visible como mucho cada 0,83 s. Ninguna cifra de precio; «fases» ausente. -13,9 LUFS, pico real -1,7 dBTP.
- Revisión visual (un fotograma cada 2,5 s): logos correctos y ningún texto cortado. La parte 1 sigue igual que su entrega.

## Portada (parte 2)
`entregas/ep4_parte2_portada.png` (1080x1920): MÁSTER DE CLAUDE CODE · EP.4 · PARTE 2/2 · moneda grande · «¿CUÁNTO
CUESTA?» · «y cómo gastar menos» · 3 REGLAS / QUÉ ES GRATIS / QUÉ PAGAS. Lo importante va dentro del recorte 3:4 central
(y 240–1680), que es lo que enseña la cuadrícula del perfil; la rejilla de la serie y el usuario quedan debajo.
Se genera desde el campo `"portada"` del JSON: `node scripts/portada.mjs episodios/ep-04-p2.json` (composición `Portada`).
