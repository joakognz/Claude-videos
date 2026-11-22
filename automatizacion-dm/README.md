# Automatización «Comenta AUDITORIA» (Instagram + n8n)

Cuando alguien comenta **AUDITORIA** en un reel de @aigencyx.labs:

1. Le contesta en público («¡Enviado! Mira tus mensajes 📬»).
2. Le manda un mensaje privado con un botón.
3. Al pulsar el botón le llega el enlace: los esquemas de la serie o el formulario de la auditoría, según el reel.
4. Lo apunta todo en una hoja de Google. Si después rellena el formulario de Tally, también lo marca.

Los textos exactos y el recorrido de cada mensaje están en [`mensajes.md`](mensajes.md).

## Qué hay en esta carpeta

| Archivo | Para qué sirve |
|---|---|
| `n8n/flujo-comenta-auditoria.json` | **El flujo.** Es el archivo que se importa en n8n. |
| `mensajes.md` | Los textos de todos los mensajes y el recorrido. |
| `plantilla-hoja-registro.csv` | La fila de títulos de la hoja de Google. |
| `n8n/codigo/*.js` | El código de cada nodo, para leerlo con calma. |
| `n8n/construir_flujo.py` | Rehace el `.json` a partir de `codigo/`. Si cambias un `.js`, ejecútalo y vuelve a importar. |
| `n8n/pruebas/` | Un Instagram simulado y una batería de 14 situaciones para probar el flujo sin tocar la cuenta real. |

---

## Puesta en marcha (una tarde, una sola vez)

Hay pasos que solo puedes hacer tú, porque piden entrar con tu cuenta (Meta, Google, n8n). Hazlos en este orden.

### Paso 1 · Tener n8n en internet

Meta tiene que poder avisar a n8n en cualquier momento, así que n8n tiene que estar siempre encendido y tener una
dirección web (https).

- **Recomendado para empezar: n8n Cloud** (n8n.io → *Get started*). Sin servidores ni mantenimiento, y tiene prueba
  gratis. Tu n8n quedará en una dirección del tipo `https://aigencyx.app.n8n.cloud`.
- Alternativa: instalarlo en un VPS (Hostinger tiene una plantilla de n8n). Sale más barato a la larga, pero hay que
  mantenerlo.

### Paso 2 · Crear la hoja de Google

1. Crea una hoja nueva en Google Sheets, por ejemplo «Registro AUDITORIA».
2. Cambia el nombre de la pestaña de abajo a **`Registro`**, exactamente así.
3. Escribe en la fila 1 estos títulos, uno por columna, o importa `plantilla-hoja-registro.csv`:
   `clave · fecha · usuario · ig_id · reel · tipo · comentario · mensaje1 · boton · formulario`
4. Copia la dirección de la hoja (la que sale arriba en el navegador). La usarás en el paso 5.

### Paso 3 · Crear la app de Meta y sacar el token

En [developers.facebook.com](https://developers.facebook.com), con la cuenta de Facebook que administra
@aigencyx.labs:

1. **Crear app** → tipo *Empresa* (Business) → caso de uso de **Instagram**: la *API de Instagram con inicio de sesión
   de Instagram* (*Instagram API with Instagram Login*). No necesitas página de Facebook.
2. Dentro de la app, en Instagram → *Configuración de la API*:
   - **Añade tu cuenta @aigencyx.labs** y genera el **token de acceso** (*Generate token*). Cópialo y guárdalo en un
     sitio seguro. Ese token lo usarás en el paso 4.
   - Permisos que tiene que tener: `instagram_business_basic`, `instagram_business_manage_comments` y
     `instagram_business_manage_messages`.
3. En *Roles de la app* → *Evaluadores de Instagram* (*Instagram testers*), **añade una segunda cuenta de Instagram**
   tuya o de alguien de confianza. Con ella harás las pruebas.
4. En *Configuración básica* rellena la **URL de la política de privacidad**. Meta la pide para activar la app (paso 7).

> El token caduca a los **60 días**. Pon un recordatorio cada 50 días para generar uno nuevo y pegarlo en n8n
> (paso 4, credencial «Instagram (token)»). Si caduca, los mensajes dejan de salir y n8n muestra el error.

### Paso 4 · Importar el flujo en n8n y conectarlo

1. En n8n: **Create workflow** → menú `⋯` → **Import from file** → `n8n/flujo-comenta-auditoria.json`.
2. **Credencial de Instagram.** Abre el nodo «Leer el reel» → *Credential* → *Create new*:
   - Tipo: **Query Auth**. Nombre de la credencial: `Instagram (token)`.
   - *Name*: `access_token` · *Value*: el token del paso 3.

   El resto de nodos de Instagram (los de los mensajes) la cogen solos. Si alguno sale en rojo, ábrelo y elígela.
3. **Credencial de Google.** Abre «Apuntar comentario» → *Credential* → *Create new* → **Sign in with Google**.
   Elige la misma en «Apuntar botón» y en «Apuntar formulario».

### Paso 5 · Rellenar los ajustes

Abre el nodo **«⚙️ Ajustes»** y cambia lo que está en mayúsculas:

- `enlaceEsquemas`: el enlace de tu carpeta de esquemas de Drive. En Drive, la carpeta tiene que estar compartida como
  **«Cualquier persona con el enlace»** (lector).
- `hojaGoogle`: la dirección de la hoja del paso 2.

Abre el nodo **«🔑 Contraseña de Meta»** y cambia `CAMBIA-ESTO-por-una-frase-larga` por una frase que te inventes
(sin espacios, por ejemplo `aigencyx-reels-2026-dm`). Es una contraseña entre Meta y tu n8n, no la de tu cuenta.

Guarda y pulsa **Publish** (arriba a la derecha). En versiones antiguas de n8n el botón se llama *Active*.

### Paso 6 · Decirle a Meta dónde avisar

1. En n8n, abre el nodo **«Instagram · verificación»** y copia la **Production URL**. Acaba en `/webhook/ig-auditoria`.
2. En la app de Meta → Instagram → *Configurar webhooks* (*Configure webhooks*):
   - *Callback URL*: la dirección que acabas de copiar.
   - *Verify token*: la frase del nodo «🔑 Contraseña de Meta».
   - Pulsa **Verificar y guardar**. Si da error, el flujo no está publicado o la frase no coincide.
3. Suscríbete a estos campos: **`comments`**, **`messages`** y **`messaging_postbacks`**.

**Tally** (para que la hoja marque quién rellena el formulario): en tally.so → tu formulario → *Integrations* →
*Webhooks* → pega la **Production URL** del nodo «Tally · formulario enviado», que acaba en `/webhook/tally-auditoria`.

### Paso 7 · Probar con la segunda cuenta y activar

1. Con la cuenta de prueba del paso 3, comenta **AUDITORIA** en un reel de la serie. Deberías ver:
   - la respuesta pública en el comentario;
   - el mensaje privado con el botón «Pásame los esquemas»;
   - al pulsarlo, el enlace de los esquemas y, unos segundos después, la oferta de la auditoría;
   - una fila nueva en la hoja.
2. Repite con un reel suelto (debe llegar solo la auditoría) y rellena el formulario (debe marcarse en la hoja).
3. Si algo no llega, mira en n8n → *Executions*: cada aviso de Meta sale ahí, con el paso que falló en rojo.
4. Cuando todo funcione, cambia la app de Meta a modo **Activo** (*Live*). Mientras esté en desarrollo, solo funciona
   con las cuentas que tienen un rol en la app.

> **Puede pasar en este paso:** que con la app en modo Activo no lleguen los comentarios de gente que no tiene rol en
> la app. Las fuentes no se ponen de acuerdo en si, para tu propia cuenta, basta el acceso estándar o Meta exige el
> **acceso avanzado** (*Advanced Access*) de `instagram_business_manage_comments` y `instagram_business_manage_messages`.
> La prueba es fácil: pide a alguien sin rol que comente AUDITORIA. Si no le llega nada y en n8n no aparece ninguna
> ejecución, hay que pedir ese acceso en *Revisión de la app* (*App Review*). Meta suele pedir la verificación del
> negocio y un vídeo corto del flujo funcionando. El vídeo se puede grabar con la cuenta de prueba.

---

## Reglas de Instagram que marcan cómo funciona

- **Un solo mensaje automático por comentario**, y dentro de los 7 días siguientes al comentario. Por eso el primer
  mensaje lleva un botón ([Meta · Private Replies](https://developers.facebook.com/docs/instagram-platform/private-replies/)).
- **Después, 24 horas.** Cuando la persona contesta (o pulsa el botón), hay 24 horas para mandarle más mensajes. El
  flujo envía el 2 y el 3 en ese momento, así que no hay problema.
- **Límite por hora.** Instagram limita cuántos mensajes automáticos salen por hora. Si un reel se hace viral, algunos
  pueden no salir: lo verás en la columna `mensaje1` de la hoja («error…»).
- A quien no te sigue, el mensaje le puede llegar a **«Solicitudes»**. Una de las respuestas públicas lo avisa.

## Qué hace en cada caso

| Situación | Qué pasa |
|---|---|
| Comenta AUDITORIA (o auditoría, Auditoria porfa…) | Respuesta pública + mensaje 1 con botón + fila en la hoja |
| Vuelve a comentar en el mismo reel | Nada, para no repetir (en otro reel sí recibe) |
| Pulsa el botón en un reel de la serie | Mensaje 2 (esquemas) + mensaje 3 (auditoría) a los 6 s |
| Pulsa el botón en un reel suelto | Mensaje 2 (formulario de la auditoría) |
| Vuelve a pulsar el botón | Solo se le reenvía el enlace, sin repetir la oferta |
| Instagram no acepta el botón | Plan B: mensaje de texto «Respóndeme con un SÍ» y, al contestar, sigue igual |
| Escribe AUDITORIA por privado | Mensaje 2 (esquemas) + mensaje 3 (auditoría) |
| Cualquier otro mensaje privado | Nada: esos los contestas tú |
| Rellena el formulario de Tally | Se marca la fecha en la columna `formulario` |

Cómo decide si un reel es de la serie: mira si su texto contiene «Máster de Claude Code», como pone el de cada
episodio («Episodio 13 de 50 del Máster de Claude Code»). Si algún día cambias esa frase, cámbiala en
`marcaSerie` del nodo «⚙️ Ajustes».

## Cambiar textos o enlaces

Todo está en el nodo **«⚙️ Ajustes»** de n8n. Cambia el texto entre comillas, guarda y vuelve a pulsar
**Publish**: si no, n8n sigue usando la versión anterior. `\n` es un salto de línea. Los botones admiten 20
caracteres como mucho.

## Para el equipo técnico

- Una sola dirección para Meta: `GET /webhook/ig-auditoria` (verificación, rama aparte con «Responder a Meta») y
  `POST /webhook/ig-auditoria` (avisos, responde 200 al momento). n8n no deja que una entrada que responde al momento
  llegue a un nodo «Responder», por eso la verificación va separada.
- Los botones llevan `AIGX|<serie|suelto>|<ig_id>_<reel>`. La memoria de repetidos y de «pendientes del plan B» está
  en los datos estáticos del flujo (`$getWorkflowStaticData`), que solo se guardan en ejecuciones de producción.
- El token va como `access_token` en la URL (credencial *Query Auth*), contra `graph.instagram.com/v24.0`.
- Probado en n8n 2.48 contra un Instagram simulado (`n8n/pruebas/probar.sh`): la verificación con contraseña buena y
  mala y las 14 situaciones de la tabla, con las hojas de Google desactivadas. **No probado todavía contra Instagram
  de verdad ni contra Google Sheets:** eso es el paso 7.
