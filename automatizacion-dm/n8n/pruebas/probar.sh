#!/bin/bash
# Prueba completa del flujo en un n8n local, contra Instagram simulado (las hojas de Google van desactivadas).
#
#   DIR_N8N=<carpeta con node_modules/n8n>  NODE24=<carpeta con el binario de Node 24>  bash automatizacion-dm/n8n/pruebas/probar.sh
#
# Preparación (una vez por sesión, en una carpeta temporal, nunca en el repositorio):
#   npm install n8n@latest            # n8n 2.x pide Node 24: si la máquina tiene otro, `npm install node@24`
#   (con Node 24 en el PATH) npm rebuild isolated-vm
set -u
AQUI=$(cd "$(dirname "$0")" && pwd)
TMP=${TMP_PRUEBA:-/tmp/prueba-n8n}; mkdir -p $TMP
export PATH=$NODE24:$PATH N8N_USER_FOLDER=$TMP/home N8N_DIAGNOSTICS_ENABLED=false N8N_SECURE_COOKIE=false \
       N8N_PORT=5678 N8N_LISTEN_ADDRESS=127.0.0.1 N8N_RUNNERS_BROKER_LISTEN_ADDRESS=127.0.0.1
N=$DIR_N8N/node_modules/n8n/bin/n8n
cd $TMP
pkill -f "^n8n (start|task-runner)"; pkill -f meta_simulado.py; sleep 4
: > meta.log; (python3 $AQUI/meta_simulado.py $TMP/meta.log > /dev/null 2>&1 &)
python3 - "$AQUI/../flujo-comenta-auditoria.json" <<'EOF'
import json, sys
f = json.load(open(sys.argv[1])); f['id'] = 'prueba0auditoria'
for n in f['nodes']:
    n['parameters'] = json.loads(json.dumps(n['parameters'], ensure_ascii=False).replace('https://graph.instagram.com', 'http://127.0.0.1:9999'))
    if n['type'] == 'n8n-nodes-base.googleSheets': n['disabled'] = True
    if 'httpQueryAuth' in n.get('credentials', {}): n['credentials']['httpQueryAuth']['id'] = 'credprueba000001'
    c = n['parameters'].get('jsCode', '')
    c = c.replace("'CAMBIA-ESTO-por-una-frase-larga'", "'secreto123'").replace("'PEGA-AQUI-EL-ENLACE-DE-TU-CARPETA-DE-DRIVE'", "'https://drive.google.com/drive/folders/PRUEBA'").replace("esperaMensaje3: 6", "esperaMensaje3: 2")
    if c: n['parameters']['jsCode'] = c
json.dump([f], open('flujo_prueba.json', 'w'), ensure_ascii=False)
json.dump([{"id": "credprueba000001", "name": "Instagram (token)", "type": "httpQueryAuth", "data": {"name": "access_token", "value": "TOKEN_PRUEBA"}}], open('cred.json', 'w'))
EOF
node $N import:credentials --input=cred.json > /dev/null 2>&1
node $N import:workflow --input=flujo_prueba.json 2>&1 | grep -i "success\|error" | head -3
node $N publish:workflow --id=prueba0auditoria > /dev/null 2>&1
(nohup node $N start > n8n.out 2>&1 &)
for i in $(seq 1 90); do curl -s "http://127.0.0.1:5678/webhook/ig-auditoria?hub.mode=subscribe&hub.verify_token=secreto123&hub.challenge=OK" 2>/dev/null | grep -q "^OK$" && break; sleep 2; done
echo "Verificación de Meta: $(curl -s -w ' [%{http_code}]' 'http://127.0.0.1:5678/webhook/ig-auditoria?hub.mode=subscribe&hub.verify_token=secreto123&hub.challenge=RETO42')"
echo "Con contraseña mala:  $(curl -s -w ' [%{http_code}]' 'http://127.0.0.1:5678/webhook/ig-auditoria?hub.mode=subscribe&hub.verify_token=MAL&hub.challenge=RETO42')"
: > meta.log
U=http://127.0.0.1:5678/webhook/ig-auditoria
com() { curl -s -o /dev/null -X POST $U -H 'Content-Type: application/json' -d "{\"object\":\"instagram\",\"entry\":[{\"id\":\"MICUENTA\",\"time\":1,\"changes\":[{\"field\":\"comments\",\"value\":{\"from\":{\"id\":\"$1\",\"username\":\"$2\"},\"media\":{\"id\":\"$3\",\"media_product_type\":\"REELS\"},\"id\":\"$4\",\"text\":\"$5\"}}]}]}"; sleep 4; }
msg() { curl -s -o /dev/null -X POST $U -H 'Content-Type: application/json' -d "{\"object\":\"instagram\",\"entry\":[{\"id\":\"MICUENTA\",\"time\":1,\"messaging\":[{\"sender\":{\"id\":\"$1\"},\"recipient\":{\"id\":\"MICUENTA\"},\"timestamp\":1,$2}]}]}"; sleep 4; }
mark() { echo "{\"m\":\"---\",\"path\":\"$1\",\"q\":{},\"body\":null}" >> meta.log; }
mark "1 comenta AUDITORÍA en reel de la serie (laura)";  com 111 laura_flores REEL_SERIE C1 "AUDITORÍA 🙌"
mark "2 laura vuelve a comentar en el mismo reel";        com 111 laura_flores REEL_SERIE C1b "auditoria otra vez"
mark "3 comentario sin la palabra";                       com 112 otro REEL_SERIE C3 "qué buen vídeo"
mark "4 comenta en un reel suelto (panadería)";          com 222 panaderia_sol REEL_SUELTO C2 "Auditoria"
mark "5 Instagram rechaza el botón → plan B (pepe)";     com 333 pepe_fontaneria REEL_SERIE C_FALLA "auditoría porfa!!"
mark "6 laura pulsa el botón";                            msg 111 '"postback":{"mid":"m1","title":"Pásame los esquemas","payload":"AIGX|serie|111_REEL_SERIE"}'; sleep 3
mark "7 laura pulsa otra vez";                            msg 111 '"postback":{"mid":"m2","title":"Pásame los esquemas","payload":"AIGX|serie|111_REEL_SERIE"}'
mark "8 panadería pulsa su botón";                        msg 222 '"postback":{"mid":"m3","title":"Quiero mi auditoría","payload":"AIGX|suelto|222_REEL_SUELTO"}'
mark "9 pepe contesta «Sí!» (plan B)";                   msg 333 '"message":{"mid":"m4","text":"Sí!"}'; sleep 3
mark "10 alguien escribe AUDITORIA por privado";          msg 444 '"message":{"mid":"m5","text":"AUDITORIA"}'; sleep 3
mark "11 mensaje privado normal";                         msg 555 '"message":{"mid":"m6","text":"Hola, una pregunta sobre precios"}'
mark "12 «vale» de alguien que no comentó";               msg 666 '"message":{"mid":"m7","text":"vale"}'
mark "13 copia de un mensaje nuestro (eco)";              msg MICUENTA '"message":{"mid":"m8","text":"auditoria","is_echo":true}'
mark "14 Tally: laura rellena el formulario"; curl -s -o /dev/null -X POST http://127.0.0.1:5678/webhook/tally-auditoria -H 'Content-Type: application/json' -d '{"eventId":"e1","eventType":"FORM_RESPONSE","createdAt":"2026-11-22T10:00:00Z","data":{"responseId":"r1","formId":"RWWo2j","fields":[{"key":"question_x","label":"ig_id","type":"HIDDEN_FIELDS","value":"111"},{"key":"q2","label":"email","type":"INPUT_EMAIL","value":"a@b.c"}]}}'; sleep 4
python3 - <<'EOF'
import json
for l in open('meta.log'):
    d = json.loads(l); b = d['body']; q = {k:v[0] for k,v in d['q'].items() if k!='access_token'}
    if d['m'] == '---': print('\n## ' + d['path']); continue
    if isinstance(b, dict):
        r = b.get('recipient'); m = b.get('message', {})
        if 'attachment' in m:
            p = m['attachment']['payload']; bt = p['buttons'][0]
            desc = f"BOTÓN [{bt['title']}] → {bt.get('payload') or bt.get('url')} · «{p['text'][:40]}…»"
        else: desc = f"TEXTO «{m.get('text','')[:70]}»"
        print(f"   {d['m']} {d['path']:<24} a {json.dumps(r)}  {desc}")
    else:
        print(f"   {d['m']} {d['path']:<24} {q}")
EOF
