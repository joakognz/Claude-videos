// 🔑 Meta comprueba que esta dirección es tuya antes de mandarte avisos.
// Pon aquí la misma contraseña que escribas en Meta, en el campo «Verify token» de los webhooks.
const CONTRASENA_META = 'CAMBIA-ESTO-por-una-frase-larga';

const q = $input.first().json.query || {};
const ok = q['hub.mode'] === 'subscribe' && q['hub.verify_token'] === CONTRASENA_META;
return [{ json: { codigo: ok ? 200 : 403, respuesta: ok ? String(q['hub.challenge']) : 'contraseña incorrecta' } }];
