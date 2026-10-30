# Reel AIgencyx Labs: "Un fallo de 27 años"

**Duración:** 47 s · 1080x1920 · 30 fps. La toma dura 44,4 s y el cierre necesita unos 2 s, así que queda 2 s por encima de los 45 s previstos.
**Voz:** una sola toma de ElevenLabs (Guillermo Brazález Multilingual v4), usada entera, sin cortes. Empieza en 0,3 s.
**Estilo:** fortaleza isométrica de piedra crema en una plaza nocturna. La Lupa: lente low-poly de luz naranja con núcleo brillante, aro y mango. Paleta #0E0C0B–#1A1613 / #FF6B1A / #FFB066 / #FFF4EC, sin rojo, azul ni verde. Sin logotipos: OpenBSD y Anthropic solo aparecen como texto.

## Guion final (tal como se grabó)
```
Anthropic dice que su IA encontró un fallo de veintisiete años en OpenBSD.
Un sistema famoso por su seguridad.
OpenBSD confirma el fallo: lo arregló en marzo y cita a un investigador de Anthropic.
Un paquete de red mal formado podía tumbar el sistema.
Ojo: era una caída, no una puerta de entrada.
Los veintisiete años los cuenta Anthropic; no hemos podido comprobarlos.
Un laboratorio, sabiendo ya dónde buscar, lo encontró con un modelo público. Con otro, no.
La IA encuentra fallos que nadie veía. Valorar su gravedad sigue siendo trabajo humano.
Para tu negocio: IA como segunda revisión, y que decida una persona.
Comenta auditoría y revisamos la seguridad de tu software.
```

Cambios respecto al guion propuesto:
1. "El propio proyecto lo confirma" pasa a "OpenBSD confirma el fallo", para que no parezca que confirma también los 27 años. El commit acredita a un investigador de Anthropic, no a la empresa.
2. "OpenBSD lo clasificó como corrección de fiabilidad" sale de la voz para ganar tiempo. El dato sigue en pantalla, en el microtexto.
3. "No está verificado por terceros" pasa a "no hemos podido comprobarlos": no sabemos si alguien lo ha verificado, solo que nosotros no pudimos.
4. "Un laboratorio independiente lo reprodujo" pasa a "Un laboratorio, sabiendo ya dónde buscar, lo encontró". Vidoc probó casos ya parcheados, y además es una empresa de seguridad.
5. "Pero no sabe lo graves que son" pasa a "Valorar su gravedad sigue siendo trabajo humano". Lo primero no lo respaldan las fuentes: Anthropic describió bien el impacto y, según Epoch, su salto está en desarrollar exploits.

## Estructura (tiempos reales)

| Escena | Tiempo | En pantalla | Rótulo | Microtexto |
|---|---|---|---|---|
| 1 | 0–5,3 | La cámara se acerca de lejos a la fortaleza. La Lupa se enciende encima | Un fallo de **27 años** | ANTHROPIC · 7 ABR 2026 |
| 2 | 5,3–7,8 | Capas de luz recorren los muros; placa de texto OPENBSD sobre la puerta | Famoso por su **seguridad** | SISTEMA OPERATIVO |
| 3 | 7,8–13,4 | Un registro crema se desliza sobre la puerta: subraya la línea del fallo, cae el sello ARREGLADO, subraya el crédito | El propio proyecto **lo confirma** | CÓDIGO PÚBLICO · 20 MAR 2026 |
| 4 | 13,4–16,8 | El paquete retorcido acelera por el camino, con estela, golpea la puerta y se apagan las luces | Un paquete mal formado **lo tumbaba** | RED · TCP |
| 5 | 16,8–20,3 | La fortaleza a oscuras con la puerta cerrada. Etiqueta CAÍDA, con ENTRADA tachado | Una **caída**, no una entrada | CORRECCIÓN DE FIABILIDAD · SIN CVE |
| 6 | 20,3–24,7 | Vuelve la luz. 27 muescas en el muro que se atenúan hacia el fondo, y una cinta con "?" | Los años, **según Anthropic** | PENDIENTE DE VERIFICAR |
| 7 | 24,7–30,7 | Dos orbes escanean los muros: el A ilumina la grieta (✓), el B pasa de largo (✗) | Uno sí. El otro **no** | LABORATORIO · ABR 2026 · CASO YA CONOCIDO |
| 8 | 30,7–36,6 | La Lupa ilumina cuatro grietas; una balanza de luz no consigue equilibrarse | Encuentra fallos que nadie **veía** / La **gravedad** la valora una persona | DETECTAR ≠ VALORAR |
| 9 | 36,6–41,4 | La fortaleza se hunde y sube un edificio crema, "TU NEGOCIO". La Lupa saca tres hallazgos y una lente crema los revisa: ✓, ✗, ✓ | Segunda revisión, **decisión humana** | LA LECCIÓN |
| 10 | 41,4–45,0 | La plaza se oscurece; la barra de comentarios escribe AUDITORIA | Revisa **tu software** | COMENTA LA PALABRA |
| Final | 45,0–47 | Fundido a #14110F, logo y @aigencyx.labs | — | — |

## Fuentes (comprobadas el 30/10/2026 en el brief)
- Commit 0e8206e en openbsd/src (Alexander Bluhm, tcp_input.c r1.465, 20 mar 2026): "Ignore TCP SACK packets with invalid sequence numbers". Crédito: "Reported by Nicholas Carlini at anthropic dot com". github.com/openbsd/src/commit/0e8206e596add74fef1653b4472de6b3723c435f
- Errata 025 de OpenBSD 7.8 (25 mar 2026): "TCP packets with invalid SACK options could crash the kernel". RELIABILITY FIX, sin CVE. openbsd.org/errata78.html
- Anthropic, anthropic.com/research/mythos-preview (7 abr 2026): "a now-patched 27-year-old bug in OpenBSD"; permitía tumbar cualquier máquina OpenBSD que respondiera por TCP.
- Vidoc Security Lab (14 abr 2026): reproducción con modelos públicos sobre casos ya parcheados. blog.vidocsecurity.com/blog/we-reproduced-anthropics-mythos-findings-with-public-models
- Epoch AI (11 jun 2026): epochai.substack.com/p/are-mythos-cyber-capabilities-overhyped
- Debate: news.ycombinator.com/item?id=47692284

## Matices que respeta el vídeo
1. El fallo es real, está corregido y OpenBSD acredita a un investigador de Anthropic.
2. El impacto es una caída del sistema (denegación de servicio), no un acceso. OpenBSD lo trató como corrección de fiabilidad y no tiene CVE.
3. Los 27 años son una afirmación de Anthropic que no se ha podido comprobar con el historial de OpenBSD.
4. La reproducción con modelos públicos partía de un caso conocido y acotado.
5. No se muestran el coste (20.000 $ / 50 $), el 99 % sin parchear ni los resultados 3/3 y 0/3.
6. No es el exploit de shmat de 37 años de Calif (oct 2026), que no tiene relación con este fallo.
7. La fuente principal es la empresa que fabrica el modelo. Por eso el vídeo se apoya en el commit de OpenBSD.

## Pendiente antes de publicar
- `git blame` / historial CVS de la lógica SACK, para saber si el código es de 1998. Si se confirma, se podría quitar el "lo cuenta Anthropic".
- Releer errata78.html por si cambia la clasificación o se asigna un CVE.

## Pipeline
```
python scripts/align.py ../audio/raw/bug-27-anos/bf2f7f80-*.mp3
python scripts/build.py
bash scripts/render.sh 12 4 out/reel-bug-27-anos.mp4
python scripts/qa.py out/reel-bug-27-anos.mp4 out/qa
```
