// Lee lo que ha llegado (Meta o Tally) y lo convierte en acciones sencillas:
//   comentario · boton · dm_palabra · dm_si · tally
// Si no es nada que nos interese, no devuelve nada y el flujo se para ahí.
const cfg = $input.first().json;
const entrada = cfg._entrada || {};
const body = entrada.body || {};
const PREFIJO = 'AIGX|';

const normalizar = (t) => String(t || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9ñ ]+/g, ' ').replace(/\s+/g, ' ').trim();
const palabra = normalizar(cfg.palabraClave);
const salida = [];
const anadir = (json) => salida.push({ json, pairedItem: { item: 0 } });

// 1) Tally: alguien ha enviado el formulario de la auditoría
if (body.eventType === 'FORM_RESPONSE' && body.data) {
  const campos = body.data.fields || [];
  const campo = campos.find((c) => String(c.label || '').toLowerCase() === 'ig_id' || String(c.key || '').toLowerCase() === 'ig_id');
  const igId = campo && campo.value ? String(campo.value) : '';
  if (igId) anadir({ accion: 'tally', ig_id: igId, fecha: new Date().toISOString() });
  return salida;
}

// 2) Instagram
if (body.object !== 'instagram') return salida;

for (const entry of body.entry || []) {
  const miCuenta = String(entry.id || '');

  // 2a) Comentarios
  for (const cambio of entry.changes || []) {
    if (cambio.field !== 'comments' || !cambio.value) continue;
    const v = cambio.value;
    const autor = v.from || {};
    if (!autor.id || String(autor.id) === miCuenta) continue;           // nunca contestarnos a nosotros mismos
    if (!normalizar(v.text).includes(palabra)) continue;               // «AUDITORIA», «auditoría!!», «Auditoria porfa»…
    const reel = (v.media && v.media.id) ? String(v.media.id) : '';
    anadir({
      accion: 'comentario',
      clave: `${autor.id}_${reel}`,
      ig_id: String(autor.id),
      usuario: autor.username || '',
      reel,
      comentario_id: String(v.id),
      comentario: String(v.text || '').slice(0, 300),
      fecha: new Date().toISOString(),
    });
  }

  // 2b) Mensajes privados y botones
  for (const m of entry.messaging || []) {
    const remitente = String((m.sender && m.sender.id) || '');
    if (!remitente || remitente === miCuenta) continue;
    if (m.message && m.message.is_echo) continue;                        // copias de lo que enviamos nosotros

    const payload = (m.postback && m.postback.payload) || (m.message && m.message.quick_reply && m.message.quick_reply.payload) || '';
    if (payload.startsWith(PREFIJO)) {
      // AIGX|serie|<clave>  ·  AIGX|suelto|<clave>
      const [, tipo, clave] = payload.split('|');
      anadir({ accion: 'boton', remitente, tipo: tipo === 'suelto' ? 'suelto' : 'serie', clave: clave || `${remitente}_dm`, fecha: new Date().toISOString() });
      continue;
    }

    const texto = normalizar(m.message && m.message.text);
    if (!texto) continue;
    if (texto === palabra || (texto.includes(palabra) && texto.split(' ').length <= 4)) {
      anadir({ accion: 'dm_palabra', remitente, tipo: 'serie', clave: `${remitente}_dm`, fecha: new Date().toISOString() });
    } else if ((cfg.palabrasSi || []).map(normalizar).includes(texto)) {
      anadir({ accion: 'dm_si', remitente, fecha: new Date().toISOString() });
    }
  }
}

return salida;
