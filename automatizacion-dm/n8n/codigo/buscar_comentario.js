// Plan B: alguien ha contestado «sí» por privado. Solo seguimos si comentó AUDITORIA en las últimas 24 horas.
const memoria = $getWorkflowStaticData('global');
const pendientes = memoria.pendientes || {};
const ahora = Date.now();
const salida = [];
$input.all().forEach((item, i) => {
  const d = $('Leer evento').itemMatching(i).json;
  const usuario = item.json && item.json.username ? '@' + String(item.json.username).toLowerCase() : '';
  const p = pendientes[d.remitente] || (usuario && pendientes[usuario]);
  if (!p || ahora - p.ms > 24 * 3600 * 1000) return;
  salida.push({ json: { accion: 'boton', remitente: d.remitente, tipo: p.tipo, clave: p.clave, fecha: d.fecha }, pairedItem: { item: i } });
});
return salida;
