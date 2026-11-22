// Prepara el mensaje 2 (y el 3 en los reels de la serie) para quien ha pulsado el botón.
// Si vuelve a pulsar, solo se le reenvía el enlace (mensaje 2), sin repetir la oferta.
const cfg = $('⚙️ Ajustes').first().json;
const T = cfg.textos;
const memoria = $getWorkflowStaticData('global');
memoria.seguimientos = memoria.seguimientos || {};
const ahora = Date.now();

const plantilla = (remitente, texto, titulo, url) => ({
  recipient: { id: remitente },
  message: { attachment: { type: 'template', payload: { template_type: 'button', text: texto, buttons: [{ type: 'web_url', url, title: titulo }] } } },
});

return $input.all().map((item, i) => {
  const d = item.json;
  const yaEnviado = !!memoria.seguimientos[d.clave];
  memoria.seguimientos[d.clave] = ahora;
  const igId = String(d.clave).split('_')[0] || d.remitente;
  const sep = cfg.enlaceFormulario.includes('?') ? '&' : '?';
  const urlFormulario = `${cfg.enlaceFormulario}${sep}ig_id=${encodeURIComponent(igId)}`;

  let cuerpo2, cuerpo3 = null;
  if (d.tipo === 'suelto') {
    cuerpo2 = plantilla(d.remitente, T.suelto_mensaje2, T.suelto_boton2, urlFormulario);
  } else {
    cuerpo2 = plantilla(d.remitente, T.serie_mensaje2, T.serie_boton2, cfg.enlaceEsquemas);
    cuerpo3 = plantilla(d.remitente, T.serie_mensaje3, T.serie_boton3, urlFormulario);
  }
  return { json: { ...d, ig_id: igId, cuerpo2, cuerpo3, enviarMensaje3: !!cuerpo3 && !yaEnviado }, pairedItem: { item: i } };
});
