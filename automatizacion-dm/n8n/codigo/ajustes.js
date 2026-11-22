// ⚙️ AJUSTES · lo único que hay que tocar del flujo.
// Cambia los textos entre comillas. No borres las comas ni las llaves.
const AJUSTES = {
  // Palabra que activa el flujo. Se compara sin tildes ni mayúsculas: «AUDITORÍA», «Auditoria»… valen todas.
  palabraClave: 'auditoria',

  // Si el texto del reel contiene esto, es un episodio de la serie (manda esquemas + auditoría).
  // Si no, es un reel suelto (solo auditoría).
  marcaSerie: 'master de claude code',

  // Versión de la API de Instagram. Solo se cambia si Meta la retira.
  versionApi: 'v24.0',

  // Enlaces
  enlaceEsquemas: 'PEGA-AQUI-EL-ENLACE-DE-TU-CARPETA-DE-DRIVE',
  enlaceFormulario: 'https://tally.so/r/RWWo2j',

  // Hoja de Google donde se apunta todo (la dirección completa, tal cual sale en el navegador).
  hojaGoogle: 'PEGA-AQUI-LA-DIRECCION-DE-TU-HOJA-DE-GOOGLE',

  // Segundos entre el mensaje 2 (esquemas) y el 3 (auditoría).
  esperaMensaje3: 6,

  textos: {
    respuestasPublicas: [
      '¡Hecho! Te lo acabo de mandar por privado 📩',
      '¡Enviado! Mira tus mensajes 📬',
      '¡Ya lo tienes en tus mensajes! 🙌',
      'Te lo he mandado por privado. Si no lo ves, mira en «Solicitudes» 😉',
      '¡Listo! Revisa tu bandeja de mensajes 🚀',
    ],

    // Reels de la serie
    serie_mensaje1: '¡Hola! 👋 Gracias por comentar.\n\nTengo listos los esquemas del Máster de Claude Code para ti. Pulsa el botón y te mando el enlace 👇',
    serie_boton1: 'Pásame los esquemas',
    serie_mensaje2: '¡Aquí los tienes! 📂\n\nEstán los esquemas de la serie, episodio a episodio. Cada vez que salga uno nuevo, lo añado a la misma carpeta.\n\nSígueme para no perderte el siguiente episodio 😉',
    serie_boton2: 'Ver los esquemas',
    serie_mensaje3: 'Una cosa más 👇\n\nSi tienes un negocio, te preparo gratis una mini auditoría: 2 o 3 ideas concretas de IA y automatización para ahorrar tiempo en tu día a día.\n\nSon unos 3 minutos y te la mando por email en 48 horas laborables.',
    serie_boton3: 'Quiero mi auditoría',

    // Reels sueltos
    suelto_mensaje1: '¡Hola! 👋 Gracias por comentar.\n\nTe preparo gratis una mini auditoría de tu negocio: 2 o 3 ideas concretas de IA y automatización para ahorrar tiempo. Pulsa el botón y te paso el formulario 👇',
    suelto_boton1: 'Quiero mi auditoría',
    suelto_mensaje2: '¡Genial! Aquí lo tienes 👇\n\nSon unos 3 minutos. Con lo que me cuentes preparo tu auditoría y te la mando por email en 48 horas laborables.\n\nSígueme para ver más ideas de IA para negocios 😉',
    suelto_boton2: 'Empezar (3 min)',

    // Plan B: si Instagram no acepta el botón en el primer mensaje
    planB_mensaje1: '¡Hola! 👋 Gracias por comentar. Respóndeme con un «SÍ» y te mando el enlace 👇',
  },

  // Respuestas por privado que cuentan como «sí» en el plan B (sin tildes ni mayúsculas).
  palabrasSi: ['si', 'sii', 'siii', 'vale', 'claro', 'ok', 'okay', 'porfa', 'por favor', 'si porfa', 'si por favor', 'yes', 'dale', 'venga', 'perfecto', 'genial', 'gracias', 'si gracias', 'pasamelo', 'mandamelo', 'quiero', 'lo quiero'],
};

// No toques nada de aquí abajo.
return [{ json: { ...AJUSTES, _entrada: $input.first().json } }];
