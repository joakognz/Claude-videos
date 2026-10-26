# Reel AIgencyx Labs: "Llamé a las 23:00 y respondió una IA"

**Duración elegida:** 45-50 s. El briefing original dice 30-38 s, pero aquí la llamada en vivo es la prueba y necesita sus 11 s. Si la quieres en 38 s, quita las dos líneas centrales de la llamada.

**Gancho elegido:** "Llamé a este negocio a las once de la noche. Y respondió una IA." (en pantalla: "Llamé a las 23:00 y respondió una IA")
Alternativas:
- "Son las 23:00 y esta clínica acaba de cerrar una cita."
- "Tu competencia ya atiende llamadas a las once de la noche."

**Negocio de ejemplo:** Clínica Sonrisa Norte (ficticia). Tiene automatizaciones encadenadas: triaje de urgencia, agenda en tiempo real, CRM, WhatsApp, aviso al doctor de guardia.

---

## 1. Prompt para Remotion (pegar tal cual)

```
Usa el skill de Remotion (remotion:remotion-best-practices) para crear un Reel vertical con motion graphics profesionales.

═══ BRIEFING ═══
Marca: AIgencyx Labs · Logo: [link o archivo]
Tema: demo en vivo de un agente de voz con IA que atiende una llamada a las 23:07 en una clínica dental (ficticia) y, después, un vistazo por dentro de las automatizaciones que se disparan.
Estructura: ANTES (llamada fuera de horario = cliente perdido) → DESPUÉS (la IA atiende y cierra la cita) → POR DENTRO (6 automatizaciones encadenadas) → CTA.
Audiencia: dueños de pymes y negocios locales que cierran por la noche y pierden llamadas.
Objetivo: que comenten la palabra clave.
CTA: "COMENTA AUDITORIA ↓" + "Te digo qué automatizar primero"
Cifra protagonista: 6 (pasos automáticos en una sola llamada). Es un ejemplo ilustrativo: sustituir por dato real si hay caso real.
Aviso en pantalla (pequeño, escena DESPUÉS): "Demo simulada · datos ficticios".

═══ GUION (voz principal, una sola frase por escena) ═══
E1 (0-3,5 s) · "Llamé a este negocio a las once de la noche."  [emocional: *noche* · clave: 23:00]
E2 (3,5-5,5 s) · "Y respondió una IA."  [clave: IA en recuadro]
E3 (5,5-9 s) · "Lo normal: buzón de voz y un cliente perdido."  [ANTES · emocional: *perdido*]
── wipe ANTES→DESPUÉS ──
E4 (9-11,5 s) · "Pero esta clínica tiene una IA que atiende."  [clave: IA]
E5 (11,5-23 s) · LLAMADA EN VIVO (dos voces, ver sección VOZ). La música baja a -32 dB y se ve la transcripción en burbujas a medida que se habla.
E6 (23-25,5 s) · "Mira lo que pasó por dentro."  [emocional: *dentro*]
E7 (25,5-27,5 s) · "Entiende que es una urgencia."  [nodo 1]
E8 (27,5-29,5 s) · "Mira la agenda real."  [nodo 2]
E9 (29,5-31 s) · "Reserva la cita."  [nodo 3]
E10 (31-33 s) · "Crea la ficha del paciente."  [nodo 4]
E11 (33-35,5 s) · "Manda el WhatsApp con el formulario."  [nodo 5]
E12 (35,5-37,5 s) · "Y avisa al doctor de guardia."  [nodo 6]
E13 (37,5-41 s) · "Seis pasos. Cero personas despiertas."  [clave: *seis* en grande, la cifra protagonista]
E14 (41-44 s) · "¿Cuántas llamadas pierdes tú de noche?"  [giro: vuelve el teléfono sonando 23:07 de E1 para que el bucle enganche]
E15 (44-48 s) · "Comenta AUDITORIA y te lo cuento."  [clave: AUDITORIA en recuadro + CTA]

═══ ESCENAS (qué se ve) ═══
E1-E2: iPhone 3D en el centro, pantalla "Llamando…" con "23:07" enorme. Apagado, tono frío. En E2 "IA" entra en recuadro verde sobre el móvil.
E3: ANTES. Rojo #FF5A5F, desaturado. El móvil muestra "Buzón de voz" y una notificación "1 llamada perdida". Un contador "clientes perdidos" sube de 0 a 1.
Wipe con barra de luz que enciende el verde.
E4: DESPUÉS. El mismo móvil (mismo objeto, no uno nuevo) ahora con "Clínica Sonrisa Norte · Lucía (IA)" y una onda de voz verde.
E5: llamada. Burbujas de transcripción que entran palabra a palabra sincronizadas con el audio. Onda de voz reactiva al volumen de cada voz (verde la IA, blanca el cliente). Hora visible: 23:07 → 23:08.
E6: el móvil se desplaza a un lado y se abre en 3D; detrás aparece una vista de flujo (nodos).
E7-E12: seis nodos conectados por una línea de luz verde. Cada nodo se enciende al decirse su frase, con icono y etiqueta corta:
   1 Urgencia detectada · 2 Agenda en tiempo real · 3 Cita 09:10 reservada · 4 Ficha de paciente creada · 5 WhatsApp enviado · 6 Doctor de guardia avisado.
   La línea de luz avanza de nodo en nodo. Los nodos ya encendidos siguen con un pulso suave.
E13: los seis nodos se comprimen en una cifra "6" gigante con Playfair Italic; debajo "pasos · 0 personas despiertas".
E14: el móvil vuelve al centro y vuelve a sonar "23:07" (cierra el bucle con E1).
E15: CTA "COMENTA AUDITORIA ↓" con el recuadro de la palabra clave y la frase de apoyo.

═══ FORMATO ═══
1080x1920, 30 fps, 45-50 s (lo define el audio). Sin marca de agua.
Zona segura: nada importante en los 250 px superiores ni en los 340 inferiores.

═══ VOZ ═══
Te paso los guiones en texto plano y yo genero las voces en ElevenLabs.
Voz principal (narrador): Multilingual v2, velocidad 1.12, estabilidad 35 %, similitud 75 %, estilo 25-30 %.
Llamada (E5): dos voces distintas, generadas línea a línea, velocidad 1.0-1.05, estabilidad 45 %, estilo 15 % para que suene natural y no a locutor.
   Lucía (IA): voz femenina cálida, tono tranquilo.
   Cliente: voz masculina, tono normal, ligeramente cansado.
Cuando las adjunte:
- Recorta las pausas largas solo dentro de silencio real
  (máx. 0,2 s; 0,3 s tras el gancho, en el giro y antes del CTA).
- La narración a 175-185 palabras por minuto, sin cambiar el tono. La llamada NO se acelera.
- Transcribe con tiempos por palabra y sincroniza cada palabra con su fotograma.
- Cada frase se queda mínimo 10 fotogramas en pantalla tras su última palabra.

═══ ESTILO ═══
Fondo #0B1F1A, acento #3DDC97, texto blanco. ANTES apagado con rojo #FF5A5F;
DESPUÉS en verde. Transición ANTES→DESPUÉS: wipe con barra de luz que enciende el color.
Montserrat 800 + Playfair Display Italic en la palabra emocional.
Mockups de iPhone 3D con sombra y reflejo; el móvil es el mismo objeto entre escenas.
Nodos del flujo: tarjetas redondeadas con borde verde fino, icono lineal y etiqueta en Montserrat 800.

═══ MOVIMIENTO ═══
- Desenfoque de movimiento real (@remotion/motion-blur) en todo objeto que se mueva.
- Objetos: curva de aceleración y frenada suave, desplazamientos de ~0,9 s.
  Nunca rápido y luego quieto.
- Deriva continua: cada objeto sigue moviéndose suavemente toda la escena.
- Texto: spring palabra a palabra, la cursiva con overshoot; salida hacia arriba con blur.
- Zoom de cámara constante 1.0→1.08 y parallax de fondo; grano 4 % y viñeta.
- Nada quieto más de 0,5 s.

═══ SONIDO ═══
Música sintetizada y original: tensa en el ANTES, se abre en el DESPUÉS, a -22 dB.
Baja a -32 dB durante la llamada y vuelve a -22 dB en "por dentro".
Efectos: tono de llamada sintético en E1-E2, clic seco al cortarse en E3, whoosh en el wipe,
pop en palabras clave, un "ping" suave distinto en cada nodo al encenderse, whoosh corto al formar el "6".
Volumen final normalizado a -14 LUFS.

═══ PROCESO ═══
1. Pásame los guiones para las voces.
2. Con las voces: monta las 3 primeras escenas y pásame un preview con audio.
3. Con mi OK: termina todo, renderiza, revisa fotograma a fotograma y entrégamelo.
   Decide tú lo que no esté especificado, sin preguntarme.
```

---

## 2. Guion para ElevenLabs: narrador (texto plano, pegar tal cual)

Pega cada bloque por separado para poder colocar la llamada en medio.

**Bloque A**
```
Llamé a este negocio a las once de la noche.
Y respondió una IA.
Lo normal: buzón de voz y un cliente perdido.
Pero esta clínica tiene una IA que atiende.
```

**Bloque B** (tras la llamada)
```
Mira lo que pasó por dentro.
Entiende que es una urgencia.
Mira la agenda real.
Reserva la cita.
Crea la ficha del paciente.
Manda el WhatsApp con el formulario.
Y avisa al doctor de guardia.
Seis pasos. Cero personas despiertas.
¿Cuántas llamadas pierdes tú de noche?
Comenta AUDITORIA y te lo cuento.
```

## 3. Guion de la llamada (dos voces, líneas separadas)

```
LUCÍA: Clínica Sonrisa Norte, soy Lucía. ¿En qué te ayudo?
CLIENTE: Me duele una muela desde esta tarde.
LUCÍA: Vaya, lo siento. Te busco hueco mañana a primera hora.
LUCÍA: Tengo las nueve y diez con el doctor Ruiz. ¿Te la reservo?
CLIENTE: Sí, por favor.
LUCÍA: Hecha. Te acabo de mandar la confirmación por WhatsApp.
```

Genera cada línea por separado con su voz, sin el nombre del personaje. La hora, "nueve y diez", va en letra para que la lean igual.

---

## 4. Extras del reel

**Música:** electrónica minimalista y tensa que se abre en la segunda mitad, 100-110 BPM, sin letra. Búsquedas en la biblioteca de Instagram:
- "tension build cinematic"
- "tech minimal pulse"
- "futuristic ambient"

**Portada:** "Respondió una IA" (3 palabras).

**Descripción sugerida:** si quieres, te la preparo con la skill de descripciones.

**Antes de publicar:**
- La clínica y la llamada son una demo. Deja visible el aviso "Demo simulada · datos ficticios" para no inducir a error.
- Ninguna cifra del vídeo es un dato real de mercado. La única cifra es el 6, que es el número de pasos del flujo de ejemplo.
- Si grabas una llamada real a un cliente tuyo, necesitas su permiso para usar el audio.
