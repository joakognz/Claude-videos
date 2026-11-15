# Serie «Máster de Claude Code» · EP.8 «Errores típicos y troubleshooting» (lección 1.5)

**Estado:** guion y prompt hechos. Falta `logo_anthropic`, la voz (`voz_ep8.mp3`) y las tomas 01 a 04.
**Duración estimada:** 379 palabras, entre 2:22 y 2:32 a 150-160 palabras por minuto.

## Archivos
- `1_guion_y_voz/voz_ep8.txt`: el bloque de voz, listo para el generador.
- `5_proyecto_remotion/PROMPT_MAESTRO_ep8.txt`: un borrador hasta que llegue `logo_anthropic`.
- `3_tomas_pantalla/tomas_ep8.txt`: cuatro tomas que tienes que grabar.
- `4_assets_extra/logos_e_imagenes_ep8.txt`: lo que hace falta y lo que ya tienes.
- `7_publicacion/caption_ep8.txt`: el texto para Instagram.

## Cambios respecto al vídeo del curso
- **Metáfora propia:** cada código es un cartel en la puerta de una tienda: «espere su turno», «aforo completo», «cerrado por avería», la tarjeta rechazada en el datáfono. En el curso no hay metáfora: se repasa un documento.
- **Otro orden:** se agrupan por lo que tienes que hacer (los que se arreglan desde tu cuenta: 401 y saldo; los que se arreglan esperando: 429, 529 y 500). El curso los repasa en la lista 401, 429, 529, 500 y saldo.
- **Otro ejemplo:** la web de una floristería en lugar de la landing de una clínica estética. Además, para «dale más contexto» se muestra una petición vaga y su versión con contexto.
- No se usan el documento, las diapositivas ni las frases del curso.

## Datos comprobados
- 401 `authentication_error`, 429 `rate_limit_error`, 500 `api_error` y 529 `overloaded_error` coinciden con la referencia de errores de la API de Anthropic. Los tres últimos se pueden reintentar.
- **Saldo:** cuando se acaba el crédito o se llega al límite de gasto, la API responde con un 400 y un mensaje de saldo. Además existe un 402 (`billing_error`) para problemas de pago. No se nombra, para no liar al público.
- `status.claude.com` y `platform.claude.com` son las direcciones que aparecen en la lección. Desde este entorno no se pudo abrir status.claude.com (la red lo bloquea), así que no he podido comprobarla.

## Pendiente
- El teaser del EP.7 («En el siguiente episodio…») no está en este repositorio. Revisa que anuncie errores y troubleshooting.
