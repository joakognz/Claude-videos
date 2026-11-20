# Esquemas de la serie (los recursos del CTA «Comenta AUDITORIA»)

Son las láminas que el usuario sube a su carpeta de esquemas de Drive y que el CTA promete («los esquemas de este
episodio»). Uno o varios por episodio, en PNG de 1920x1080.

## Estilo (sacado de `referencias/`, los del usuario de los EP.5 a EP.9)
- Fondo gris muy oscuro `#1C1C1E`. Firma `@aigencyx.labs` abajo a la derecha, gris `#A4A4A5`, en negrita.
- Título arriba a la izquierda, en mayúsculas, Poppins 700 a 40 px, con subtítulo gris debajo (si lo hay).
- Cajas naranjas `#F2781F` con borde más claro y trazo «a mano alzada» (como Excalidraw): texto blanco en negrita,
  en mayúsculas y numerado («1 · DA CONTEXTO»). Las claves que no son pasos van sin número («TU TAREA»).
- Flechas blancas finas, curvas, con punta abierta.
- Listas con checks naranjas (✓) y texto blanco Poppins 400 a unos 24 px; un «!» amarillo para las excepciones.
- Composiciones que ya ha usado: flujo de pasos en fila con una frase debajo, mapa mental con la caja central,
  árbol de decisión (SÍ / NO), escalera de niveles y tres columnas de claves. Casi siempre cierra con «TU TAREA» o
  una caja de conclusión.
- Contenido propio: nada de capturas ni frases del curso. Ejemplos de la serie (la floristería), no los del curso.

## Cómo se hace uno
1. Copia `esquema_ep13.html` como `esquema_epNN.html` y cambia el bloque `<script>` del final. Las piezas están en
   `esquema.js`: `cabecera`, `caja`, `texto`, `lista` y `flecha` (coordenadas en píxeles de la lámina 1920x1080).
2. Pásalo a PNG:
   ```bash
   node briefs/esquemas/render.mjs briefs/esquemas/esquema_epNN.html briefs/serie-claude-code-ep-NN/7_publicacion/esquema_epNN.png
   ```
3. Míralo entero y comprueba que ningún texto se sale de su caja ni se monta con otro.

Usa la letra de `fuentes/` (Poppins, licencia OFL) y el dibujo a mano alzada de `lib/rough.js` (rough.js, licencia
MIT), así que no necesita internet.

## Hechos
| EP | Archivo |
|---|---|
| 13 · Cierre del módulo 1 | `esquema_ep13.html` → `briefs/serie-claude-code-ep-13/7_publicacion/esquema_ep13.png` |
