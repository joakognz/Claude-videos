# Serie «Máster de Claude Code» · EP.4 «Lo que construirás y las 4 etapas» (parte 1 de 2)

**Duración:** 2:34,5 (4.635 fotogramas): voz de 153,0 s + 1,5 s de cola para que el botón «Seguir» termine ·
1080x1920 · 30 fps · -13,8 LUFS, pico real -1,8 dBTP.
**Proyecto:** `serie-claude-code/`, composición `Master` con `"parte"` en el JSON (ver «Episodios en partes» en su README).
**Entrega:** `entregas/ep4_parte1.mp4`. La parte 2 («Cuánto cuesta») queda pendiente de guion, voz y logos.

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
