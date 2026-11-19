# Serie «Máster de Claude Code» · EP.12 «Computer Use» (lección 1.9)

**Estado:** guion escrito, pendiente de que lo apruebes y generes la voz. Intro nueva hecha y probada sin voz
(`serie-claude-code/src/master/bloques/ep12/Intro12.tsx`, bloque `ep12_intro`). Faltan los elementos 3D con fondo
transparente.

## Archivos
- `1_guion_y_voz/voz_ep12.txt`: el texto para ElevenLabs (328 palabras, unos 2:00–2:10).
- `3_tomas_pantalla/tomas_ep12.txt`: las pantallas, recreadas a partir del vídeo de la lección (no hay que grabar).
- `4_assets_extra/logos_e_imagenes_ep12.txt`: lo que hace falta y lo que ya tienes.
- `5_proyecto_remotion/PROMPT_MAESTRO_ep12.txt`: el prompt, por si se monta con otra IA.

## La intro nueva (solo en este episodio)
Abre con el gancho, no con la cuadrícula. Un navegador rellena solo el formulario «Nuevo proyecto»
(`pedidos-floristeria`), Claude pulsa «Crear» y sale «Proyecto creado». Mientras, tu mano está levantada y tu ratón,
quieto. Con «Episodio 12 de 50» el mismo navegador busca «máster de claude code» y abre la portada: la cuadrícula
de 50 (se enciende la 12), que se encoge cuando entran los logos, el título y «EP.12 · COMPUTER USE».

## Escenas (los tiempos los marcará la voz)
| Escena | Voz | Protagonista | Mini animación 3D (secundaria) |
|---|---|---|---|
| gancho + intro | No estoy tocando… Máster de Claude Code | navegador que trabaja solo → portada de la serie | E2 ratón quieto, pequeño, junto a «TU RATÓN, QUIETO» |
| que | Esto es Computer Use… ayudante | rótulo COMPUTER USE con la mascota de Claude Code; tres fichas: abre páginas (Chrome), rellena campos, pulsa botones | E3 cursor con clic, junto a «pulsa botones» |
| ejemplo | Un ejemplo… Se los dejamos a Claude | la floristería (tu ilustración) → sobres de pedidos → Gmail y Google Cloud → laberinto de pantallas «muchos clics» → logo de Claude | E1 ventana en miniatura, en una esquina |
| paso1 | Prepara el terreno… | PASO 1 → Chrome con Google Cloud recreado, sesión iniciada → «TÚ LO DEJAS ABIERTO» | — |
| paso2 | Explícale… Solo de esa | PASO 2 → Visual Studio Code con Claude Code: se teclea la petición → varias ventanas, solo una con el candado coral «SOLO ESA» | — |
| paso3 | El plan… te pregunta | PASO 3 → el plan se marca: crear proyecto, activar Gmail, credenciales (llave) → burbuja «?» de Claude | — |
| paso4 | Déjale trabajar… se para | PASO 4 → proyecto creado → página de Gmail → Habilitar → Habilitada, con los pasos en el panel de Claude Code → tecla Esc (tu icono) | E2 ratón quieto («sin mover tu ratón») y E3 cursor con clic («pulsa Habilitar») |
| clave | Pero ojo… Claude sigue | «Demuestra que eres tú» (recreada) → Claude en pausa → la contraseña la escribes tú (tu mano) → contraseña tachada en el chat, «NUNCA EN EL CHAT» → «ya lo tienes» y sigue | — |
| resultado | Resultado… | Google Cloud ✓ y Gmail ✓ | E1 ventana con el check, pequeña |
| resumen | En resumen… | TÚ PREPARAS (mano) → CLAUDE HACE LOS CLICS → LAS LLAVES, TUYAS (llave) | E3 cursor en la ficha del medio |
| auditoria | CTA fijo | como el EP.8: se teclea AUDITORIA, esquemas con Drive, auditoría para tu negocio | — |
| avance | En el siguiente episodio… | EP.13 · CIERRE DEL MÓDULO 1 | E4 cuadrícula 3D con el 12, detrás de la tarjeta |

Las mini animaciones 3D van pequeñas, a un lado y un poco más tenues que lo principal: acompañan, no mandan.

## Cambios respecto al vídeo del curso
- **Otro ejemplo:** los pedidos de la floristería en lugar de un lector de correos genérico; proyecto
  `pedidos-floristeria` en lugar de `lector-gmail-demo`.
- **Otro navegador y otro orden:** Chrome en lugar de Safari. Se empieza por el resultado (el navegador trabajando
  solo) y después se explica, en cuatro pasos y una advertencia.
- **Metáfora propia:** el ayudante sentado a tu lado y «las llaves, siempre en tu mano».
- No se usan las frases, la petición ni la grabación del curso. Las pantallas se recrean con datos ficticios.

## Datos comprobados (en el vídeo de la lección)
- Claude Code maneja el navegador «por detrás», sin mover tu ratón ni tu teclado.
- Antes de empezar enseña el plan: crear el proyecto, activar la API de Gmail, la pantalla de consentimiento y las
  credenciales. Además pregunta lo que necesita decidir.
- Cuando Google pide verificar la cuenta («Demuestra que eres tú»), la contraseña la escribe la persona en la página.
  Después le dice a Claude «ya lo tienes» y Claude sigue.
- Claude crea el proyecto, abre la página de la API de Gmail y pulsa «Habilitar»: el estado pasa a «Habilitada». El
  guion no dice que termine las credenciales, porque en el vídeo no se ve.
- La tecla Escape para a Claude Code (EP.8).
