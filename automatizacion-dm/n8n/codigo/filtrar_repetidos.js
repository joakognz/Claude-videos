// Un mensaje por persona y por reel: si ya se lo mandamos, no repetimos.
// La memoria vive dentro del propio flujo (solo cuenta cuando el flujo está activado, no en las pruebas manuales).
const memoria = $getWorkflowStaticData('global');
memoria.enviados = memoria.enviados || {};
const ahora = Date.now();
const SESENTA_DIAS = 60 * 24 * 3600 * 1000;
for (const [k, ms] of Object.entries(memoria.enviados)) if (ahora - ms > SESENTA_DIAS) delete memoria.enviados[k];

const salida = [];
$input.all().forEach((item, i) => {
  const d = item.json;
  if (memoria.enviados[d.clave]) return;
  memoria.enviados[d.clave] = ahora;
  salida.push({ json: d, pairedItem: { item: i } });
});
return salida;
