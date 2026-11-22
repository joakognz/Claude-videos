# Instagram simulado para probar el flujo sin tocar la cuenta real.
# Responde como la API de Instagram y apunta en un archivo cada llamada que recibe.
# El comentario «C_FALLA» rechaza el botón (para probar el plan B). Token válido: TOKEN_PRUEBA.
import json, sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
LOG = sys.argv[1]
class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def _resp(self, code, obj):
        b = json.dumps(obj).encode(); self.send_response(code)
        self.send_header('Content-Type', 'application/json'); self.send_header('Content-Length', str(len(b))); self.end_headers(); self.wfile.write(b)
    def _log(self, body):
        u = urlparse(self.path)
        with open(LOG, 'a') as f: f.write(json.dumps({'m': self.command, 'path': u.path, 'q': parse_qs(u.query), 'body': body}, ensure_ascii=False) + '\n')
        return u
    def do_GET(self):
        u = self._log(None); q = parse_qs(u.query)
        if q.get('access_token', [''])[0] != 'TOKEN_PRUEBA': return self._resp(401, {'error': {'message': 'bad token'}})
        if 'caption' in q.get('fields', [''])[0]:
            cap = 'Episodio 13 de 50 del Máster de Claude Code. Comenta AUDITORIA' if u.path.endswith('REEL_SERIE') else 'Un reel suelto. Comenta auditoría'
            return self._resp(200, {'caption': cap, 'id': u.path.rsplit('/', 1)[-1]})
        i = u.path.rsplit('/', 1)[-1]; return self._resp(200, {'username': {'111': 'laura_flores', '333': 'pepe_fontaneria'}.get(i, 'usuario_' + i), 'id': i})
    def do_POST(self):
        n = int(self.headers.get('Content-Length') or 0); raw = self.rfile.read(n).decode() if n else ''
        try: body = json.loads(raw) if raw else None
        except Exception: body = raw
        u = self._log(body); q = parse_qs(u.query)
        if q.get('access_token', [''])[0] != 'TOKEN_PRUEBA': return self._resp(401, {'error': {'message': 'bad token'}})
        if u.path.endswith('/replies'): return self._resp(200, {'id': 'reply_1'})
        if isinstance(body, dict) and body.get('recipient', {}).get('comment_id') == 'C_FALLA' and 'attachment' in json.dumps(body):
            return self._resp(400, {'error': {'message': 'template not supported in private reply (simulado)', 'code': 100}})
        return self._resp(200, {'recipient_id': 'IGSID', 'message_id': 'mid_' + str(abs(hash(raw)) % 10000)})
HTTPServer(('127.0.0.1', 9999), H).serve_forever()
