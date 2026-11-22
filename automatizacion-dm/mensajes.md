# Mensajes de la automatización «Comenta AUDITORIA»

Son los textos que envía el flujo de n8n. Para cambiarlos, edita el nodo **«⚙️ Ajustes»** del flujo: están todos ahí,
con los mismos nombres que aquí (después, guarda y vuelve a pulsar **Publish**). Instagram corta el texto de los botones a 20 caracteres.

## Qué recibe cada persona

El flujo mira el texto de la publicación. Si contiene «Máster de Claude Code», es un reel **de la serie**. Si no, es un
reel **suelto**, y en esos el CTA solo ofrece la auditoría.

```
Comenta AUDITORIA
   │
   ├─ Respuesta pública en su comentario (una de 5, al azar)
   │
   └─ Mensaje 1 (respuesta privada) ── botón ──┐
                                               │  al pulsarlo
            ┌──────────── reel de la serie ────┴──── reel suelto ────────────┐
            │                                                                │
   Mensaje 2: enlace de los esquemas                     Mensaje 2: enlace al formulario
   (y «sígueme» sin obligar)                             de la auditoría
            │  6 segundos después
   Mensaje 3: oferta de la auditoría
   con enlace al formulario
```

¿Por qué hay un botón antes del enlace? Instagram solo deja enviar **un** mensaje automático a quien comenta. Para
enviarle más, esa persona tiene que contestar primero, y desde ese momento hay 24 horas. Pulsar el botón cuenta como
respuesta.

---

## Respuesta pública (en el comentario)

Se elige una al azar para que no se vean cinco iguales seguidas.

1. ¡Hecho! Te lo acabo de mandar por privado 📩
2. ¡Enviado! Mira tus mensajes 📬
3. ¡Ya lo tienes en tus mensajes! 🙌
4. Te lo he mandado por privado. Si no lo ves, mira en «Solicitudes» 😉
5. ¡Listo! Revisa tu bandeja de mensajes 🚀

La cuarta está porque a quien no te sigue el mensaje le puede llegar a la carpeta de solicitudes.

---

## Reels de la serie «Máster de Claude Code»

### Mensaje 1 · respuesta privada al comentario
> ¡Hola! 👋 Gracias por comentar.
>
> Tengo listos los esquemas del Máster de Claude Code para ti. Pulsa el botón y te mando el enlace 👇
>
> **[ Pásame los esquemas ]**

### Mensaje 2 · al pulsar el botón
> ¡Aquí los tienes! 📂
>
> Están los esquemas de la serie, episodio a episodio. Cada vez que salga uno nuevo, lo añado a la misma carpeta.
>
> Sígueme para no perderte el siguiente episodio 😉
>
> **[ Ver los esquemas ]** → tu carpeta de Drive

### Mensaje 3 · 6 segundos después
> Una cosa más 👇
>
> Si tienes un negocio, te preparo gratis una mini auditoría: 2 o 3 ideas concretas de IA y automatización para
> ahorrar tiempo en tu día a día.
>
> Son unos 3 minutos y te la mando por email en 48 horas laborables.
>
> **[ Quiero mi auditoría ]** → formulario de Tally

---

## Reels sueltos (solo auditoría)

### Mensaje 1 · respuesta privada al comentario
> ¡Hola! 👋 Gracias por comentar.
>
> Te preparo gratis una mini auditoría de tu negocio: 2 o 3 ideas concretas de IA y automatización para ahorrar
> tiempo. Pulsa el botón y te paso el formulario 👇
>
> **[ Quiero mi auditoría ]**

### Mensaje 2 · al pulsar el botón
> ¡Genial! Aquí lo tienes 👇
>
> Son unos 3 minutos. Con lo que me cuentes preparo tu auditoría y te la mando por email en 48 horas laborables.
>
> Sígueme para ver más ideas de IA para negocios 😉
>
> **[ Empezar (3 min) ]** → formulario de Tally

---

## Si Instagram no acepta el botón en el primer mensaje

Por si acaso, el flujo tiene un plan B. Si Instagram rechaza el mensaje 1 con botón, envía este, solo con texto:

> ¡Hola! 👋 Gracias por comentar. Respóndeme con un «SÍ» y te mando el enlace 👇

Cuando conteste «sí» (o «vale», «claro», «porfa»…), sigue igual que si hubiera pulsado el botón. El flujo solo
contesta a esos mensajes si esa persona comentó AUDITORIA en las últimas 24 horas. El resto de tus mensajes privados
no los toca.

## Si alguien escribe «AUDITORIA» por privado, sin comentar

Recibe el mensaje 2 y el mensaje 3 de la serie, sin pulsar nada (al escribirte ya ha abierto la conversación).

## El enlace del formulario

Lleva el identificador de Instagram de la persona (`?ig_id=…`). Tu formulario ya tiene ese campo oculto. Así, cuando
lo rellena, el flujo marca en la hoja de Google qué persona de Instagram era.
