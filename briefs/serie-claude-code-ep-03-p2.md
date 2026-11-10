# Serie «Máster de Claude Code» · EP.3 parte 2 «Instalar y extensiones»

**Duración:** la de la voz, 131,2 s · 1080x1920 · 30 fps.
**Proyecto:** `serie-claude-code/`, composición `Master`, JSON `episodios/ep-03-p2.json`.

## Render
```bash
cd serie-claude-code
python scripts/preparar.py episodios/ep-03-p2.json --mp3 ../audio/raw/serie-claude-code/ep-03-p2.mp3 --modelo <parakeet>
node scripts/prueba.mjs episodios/ep-03-p2.json out/prueba-p2 intro:0-4.6 toma:19-31.2 cierre:101.5-131.2   # pruebas 540x960
node scripts/render-lote.mjs episodios/ep-03-p2.json      # → out/claude-code-ep-03-p2.mp4
python scripts/qa_master.py episodios/ep-03-p2.json out/claude-code-ep-03-p2.mp4
```

## Voz y guion
Toma de ElevenLabs (Manu Gordillo, v4) de 131,2 s. No llegó guion escrito: el texto se sacó de la propia voz con
Parakeet y se corrigió a mano (Claude, Hostinger, Node.js, «Ve a extensiones», «instala la de Anthropic»). 368 palabras.

## Bloques
intro · hoy2 (Claude Code entra en VS Code + extensiones) · recuerdo (UN PROYECTO = UNA CARPETA) · bloque (BLOQUE 1) ·
toma (web real de VS Code del EP.2, plano corto con insignia EP.2) · vscode (pasos 2–4 en la maqueta: Open Folder,
extensiones → Claude Code de Anthropic → PRO O MAX, icono en la barra lateral, sesión y «hola», Claude mira la carpeta
y pregunta) · ext (BLOQUE 2, tres tarjetas → VS Code) · hostinger (despliegas / gestionas, «1 clic» o «token de API»)
· node («instálame Node.js») · live (se actualiza al guardar, «ábreme la web…») · resumen2 · ctadrive · avance (EP.4)
· seguir.

Los pasos 1–4 salen de `"pasos"` en el JSON: sello «PASO N» con golpe al empezar y tick al completarse
(`componentes/PasosHud.tsx`).

## Tomas
- **Paso 1:** la grabación real de la web de Visual Studio Code del EP.2 (`ep-02/clips/web-vscode.mp4`), a 1,35x.
- **Pasos 2–4, Hostinger, Node.js y Live Server:** recreados sobre una maqueta de Visual Studio Code
  (`componentes/VsCode.tsx`). El vídeo del curso adjunto se usó solo como referencia de la interfaz: es de otra
  persona, sale su cara en todos los planos y enseña datos privados (correo, proyectos, conversación).
- La grabación de pantalla adjunta (`ScreenRecording_11-07-2026…`) no se usa: es un formulario de Tally con
  respuestas de la auditoría y el correo de un contacto, no la instalación.
- En pantalla no hay datos privados: carpeta «mi-proyecto», archivos genéricos, token enmascarado (••••).
