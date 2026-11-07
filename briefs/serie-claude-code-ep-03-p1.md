# Serie «Máster de Claude Code» · EP.3 parte 1 «¿Qué es un proyecto?»

**Duración:** 2:06,3 (3.789 fotogramas), la de la voz · 1080x1920 · 30 fps · -13,9 LUFS, pico real -1,6 dBTP.
**Entrega:** `entregas/serie-claude-code-ep-03-parte-1.mp4` · pruebas a 540x960 en `entregas/ep03-p1-pruebas/`.

## Render
```bash
cd serie-claude-code
python scripts/preparar.py episodios/ep-03-p1.json --mp3 ../audio/raw/serie-claude-code/ep-03-p1.mp3 --modelo <parakeet>
node scripts/render-lote.mjs episodios/ep-03-p1.json      # → out/claude-code-ep-03-p1.mp4
python scripts/qa_master.py episodios/ep-03-p1.json out/claude-code-ep-03-p1.mp4
```
Pruebas: `node scripts/prueba.mjs episodios/ep-03-p1.json out/prueba intro:0-5 …` · fotogramas: `scripts/fotos.mjs`.

## Bloques
intro · hoy · carpeta (3D, «NADA MÁS», web/YouTube/WhatsApp, dos «?») · hecho (cara/motor/memoria) · vive (4 opciones, 24/7, luna, AWS) · tabla (7 tipos) · resumen · ctadrive · avance (candado → PARTE 2) · seguir.

## Decisiones
- El CTA sigue el orden de la voz: primero el comentario AUDITORIA y después el check de la auditoría.
- Dónde viven el 3, el 6 y el 7 no lo dice el guion: se muestra hosting, hosting y AWS (deducción; quitable en `Tabla.tsx`).
- Para «web» se usa un icono genérico de globo (no hay logo de marca). El cangrejo es la mascota de Claude Code.
- La voz termina a 126,15 s del audio de 126,28 s: el fundido final queda ajustado.
- Parte 2 pendiente: guion, voz, 8 tomas de pantalla y logos de Hostinger y Live Server.
