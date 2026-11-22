// Decide si el reel es de la serie (mira su texto) y prepara la respuesta pública y el mensaje 1.
const cfg = $('⚙️ Ajustes').first().json;
const T = cfg.textos;
const normalizar = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const memoria = $getWorkflowStaticData('global');
memoria.pendientes = memoria.pendientes || {};
const ahora = Date.now();
for (const [k, p] of Object.entries(memoria.pendientes)) if (ahora - p.ms > 48 * 3600 * 1000) delete memoria.pendientes[k];

return $input.all().map((item, i) => {
  const d = $('Filtrar repetidos').itemMatching(i).json;
  const texto = item.json && item.json.caption;
  // Si no se pudo leer el texto del reel, se trata como de la serie (manda esquemas y auditoría, que cubre los dos casos).
  const tipo = (texto === undefined || normalizar(texto).includes(normalizar(cfg.marcaSerie))) ? 'serie' : 'suelto';
  const publicas = T.respuestasPublicas || [];
  const publico = publicas[Math.floor(Math.random() * publicas.length)] || '';

  const boton = { type: 'postback', title: tipo === 'serie' ? T.serie_boton1 : T.suelto_boton1, payload: `AIGX|${tipo}|${d.clave}` };
  const cuerpo1 = {
    recipient: { comment_id: d.comentario_id },
    message: { attachment: { type: 'template', payload: { template_type: 'button', text: tipo === 'serie' ? T.serie_mensaje1 : T.suelto_mensaje1, buttons: [boton] } } },
  };
  const cuerpoPlanB = { recipient: { comment_id: d.comentario_id }, message: { text: T.planB_mensaje1 } };

  // Para el plan B: si luego contesta «sí» por privado, sabremos de qué reel venía.
  const pendiente = { clave: d.clave, tipo, ms: ahora };
  memoria.pendientes[d.ig_id] = pendiente;
  if (d.usuario) memoria.pendientes['@' + String(d.usuario).toLowerCase()] = pendiente;

  return { json: { ...d, tipo, publico, cuerpo1, cuerpoPlanB }, pairedItem: { item: i } };
});
