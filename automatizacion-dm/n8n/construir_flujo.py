#!/usr/bin/env python3
"""Monta el flujo de n8n «Comenta AUDITORIA» a partir de los archivos de codigo/.

Uso:  python3 automatizacion-dm/n8n/construir_flujo.py
Sale: automatizacion-dm/n8n/flujo-comenta-auditoria.json  (el archivo que se importa en n8n)

El código de cada nodo vive en codigo/*.js para que se pueda leer y cambiar con calma. Si tocas uno, vuelve a
ejecutar este script y vuelve a importar el flujo en n8n.
"""
import json
import uuid
from pathlib import Path

AQUI = Path(__file__).resolve().parent
COD = AQUI / "codigo"
SALIDA = AQUI / "flujo-comenta-auditoria.json"

AJ = "$('⚙️ Ajustes').first().json"
API = f"=https://graph.instagram.com/{{{{ {AJ}.versionApi }}}}"
HOJA = "Registro"
COLUMNAS = ["clave", "fecha", "usuario", "ig_id", "reel", "tipo", "comentario", "mensaje1", "boton", "formulario"]
AHORA = "={{ $now.setZone('Europe/Madrid').toFormat('dd/MM/yyyy HH:mm') }}"

nodos = []
conexiones = {}


def uid(nombre):
    return str(uuid.uuid5(uuid.NAMESPACE_URL, "aigencyx-auditoria/" + nombre))


def nodo(nombre, tipo, version, pos, parametros, **extra):
    n = {"parameters": parametros, "id": uid(nombre), "name": nombre, "type": tipo, "typeVersion": version, "position": pos}
    n.update(extra)
    nodos.append(n)
    return nombre


def unir(origen, destino, salida=0):
    lista = conexiones.setdefault(origen, {"main": []})["main"]
    while len(lista) <= salida:
        lista.append([])
    lista[salida].append({"node": destino, "type": "main", "index": 0})


def codigo(nombre, archivo, pos, nota=None):
    extra = {"notes": nota, "notesInFlow": True} if nota else {}
    return nodo(nombre, "n8n-nodes-base.code", 2, pos, {"jsCode": (COD / archivo).read_text(encoding="utf-8")}, **extra)


def webhook(nombre, metodo, ruta, modo, pos):
    return nodo(nombre, "n8n-nodes-base.webhook", 2, pos,
                {"httpMethod": metodo, "path": ruta, "responseMode": modo, "options": {}}, webhookId=uid("hook-" + nombre))


def http(nombre, metodo, url, pos, cuerpo=None, consulta=None, al_fallar="continueRegularOutput", nota=None):
    p = {"method": metodo, "url": url, "authentication": "genericCredentialType", "genericAuthType": "httpQueryAuth"}
    if consulta:
        p["sendQuery"] = True
        p["queryParameters"] = {"parameters": [{"name": k, "value": v} for k, v in consulta.items()]}
    if cuerpo:
        p["sendBody"] = True
        p["specifyBody"] = "json"
        p["jsonBody"] = cuerpo
    p["options"] = {"timeout": 20000}
    extra = {"onError": al_fallar, "credentials": {"httpQueryAuth": {"id": "", "name": "Instagram (token)"}}}
    if nota:
        extra.update(notes=nota, notesInFlow=True)
    return nodo(nombre, "n8n-nodes-base.httpRequest", 4.2, pos, p, **extra)


def fila(nombre, valores, pos):
    asignaciones = [{"id": uid(nombre + k), "name": k, "value": v, "type": "string"} for k, v in valores.items()]
    return nodo(nombre, "n8n-nodes-base.set", 3.4, pos,
                {"mode": "manual", "assignments": {"assignments": asignaciones}, "includeOtherFields": False, "options": {}})


def hoja(nombre, operacion, columna_clave, pos):
    esquema = [{"id": c, "displayName": c, "required": False, "defaultMatch": False, "display": True,
                "type": "string", "canBeUsedToMatch": True, "removed": False} for c in COLUMNAS]
    return nodo(nombre, "n8n-nodes-base.googleSheets", 4.7, pos, {
        "authentication": "oAuth2",
        "operation": operacion,
        "documentId": {"__rl": True, "mode": "url", "value": f"={{{{ {AJ}.hojaGoogle }}}}"},
        "sheetName": {"__rl": True, "mode": "name", "value": HOJA},
        "columns": {"mappingMode": "autoMapInputData", "value": {}, "matchingColumns": [columna_clave], "schema": esquema},
        "options": {},
    }, credentials={"googleSheetsOAuth2Api": {"id": "", "name": "Google Sheets"}})


def condicion(izq, op, der=""):
    tipo, operacion = op
    c = {"id": uid(izq + operacion + str(der)), "leftValue": izq, "rightValue": der,
         "operator": {"type": tipo, "operation": operacion}}
    if operacion in ("true", "false", "empty", "notEmpty", "exists", "notExists"):
        c["operator"]["singleValue"] = True
    return {"options": {"caseSensitive": True, "leftValue": "", "typeValidation": "loose", "version": 2},
            "conditions": [c], "combinator": "and"}


# ── Entradas ──────────────────────────────────────────────────────────────────────────────────────────────
X = 0
webhook("Instagram · verificación", "GET", "ig-auditoria", "responseNode", [X, -200])
webhook("Instagram · eventos", "POST", "ig-auditoria", "onReceived", [X, 200])
webhook("Tally · formulario enviado", "POST", "tally-auditoria", "onReceived", [X, 400])
codigo("⚙️ Ajustes", "ajustes.js", [X + 260, 200], "Textos, enlaces y contraseñas: lo único que se toca")
codigo("Leer evento", "leer_evento.js", [X + 480, 200])
for e in ("Instagram · eventos", "Tally · formulario enviado"):
    unir(e, "⚙️ Ajustes")
unir("⚙️ Ajustes", "Leer evento")

ACCIONES = ["comentario", "boton", "dm_palabra", "dm_si", "tally"]
reglas = []
for a in ACCIONES:
    r = condicion("={{ $json.accion }}", ("string", "equals"), a)
    r["options"]["typeValidation"] = "strict"
    reglas.append({"conditions": r, "renameOutput": True, "outputKey": a})
nodo("¿Qué ha pasado?", "n8n-nodes-base.switch", 3.2, [X + 700, 200], {"rules": {"values": reglas}, "options": {}})
unir("Leer evento", "¿Qué ha pasado?")

# ── Meta comprueba el webhook (rama aparte: n8n no deja que los avisos lleguen a un «Responder») ────────────
codigo("🔑 Contraseña de Meta", "comprobar_meta.js", [X + 260, -200], "La contraseña («Verify token») de Meta")
nodo("Responder a Meta", "n8n-nodes-base.respondToWebhook", 1.1, [X + 480, -200], {
    "respondWith": "text", "responseBody": "={{ $json.respuesta }}",
    "options": {"responseCode": "={{ $json.codigo }}"}})
unir("Instagram · verificación", "🔑 Contraseña de Meta")
unir("🔑 Contraseña de Meta", "Responder a Meta")

# ── 1 · Alguien comenta AUDITORIA ────────────────────────────────────────────────────────────────────────
Y = -60
codigo("Filtrar repetidos", "filtrar_repetidos.js", [X + 980, Y], "Un mensaje por persona y reel")
http("Leer el reel", "GET", API + "/{{ $json.reel }}", [X + 1200, Y], consulta={"fields": "caption"},
     nota="Mira si el reel es de la serie")
codigo("Preparar mensaje 1", "preparar_mensaje1.js", [X + 1420, Y])
http("Responder en público", "POST", API + "/{{ $json.comentario_id }}/replies", [X + 1640, Y],
     consulta={"message": "={{ $json.publico }}"})
http("Mensaje 1 con botón", "POST", API + "/me/messages", [X + 1860, Y],
     cuerpo="={{ JSON.stringify($('Preparar mensaje 1').item.json.cuerpo1) }}", al_fallar="continueErrorOutput",
     nota="Si falla, salta al plan B (solo texto)")
http("Mensaje 1 · plan B", "POST", API + "/me/messages", [X + 2080, Y + 160],
     cuerpo="={{ JSON.stringify($('Preparar mensaje 1').item.json.cuerpoPlanB) }}")
P1 = "$('Preparar mensaje 1').item.json"
fila("Fila del comentario", {
    "clave": f"={{{{ {P1}.clave }}}}", "fecha": AHORA, "usuario": f"={{{{ {P1}.usuario }}}}",
    "ig_id": f"={{{{ {P1}.ig_id }}}}", "reel": f"={{{{ {P1}.reel }}}}", "tipo": f"={{{{ {P1}.tipo }}}}",
    "comentario": f"={{{{ {P1}.comentario }}}}",
    "mensaje1": "={{ $json.message_id ? ($prevNode.name === 'Mensaje 1 · plan B' ? 'texto (plan B)' : 'con botón') : 'error: ' + JSON.stringify($json.error || $json).slice(0, 200) }}",
}, [X + 2300, Y])
hoja("Apuntar comentario", "appendOrUpdate", "clave", [X + 2520, Y])
unir("¿Qué ha pasado?", "Filtrar repetidos", 0)
unir("Filtrar repetidos", "Leer el reel")
unir("Leer el reel", "Preparar mensaje 1")
unir("Preparar mensaje 1", "Responder en público")
unir("Responder en público", "Mensaje 1 con botón")
unir("Mensaje 1 con botón", "Fila del comentario", 0)
unir("Mensaje 1 con botón", "Mensaje 1 · plan B", 1)
unir("Mensaje 1 · plan B", "Fila del comentario")
unir("Fila del comentario", "Apuntar comentario")

# ── 2, 3, 4 · Pulsa el botón / escribe AUDITORIA por privado / contesta «sí» (plan B) ────────────────────
Y = 420
http("¿Quién me escribe?", "GET", API + "/{{ $json.remitente }}", [X + 980, Y + 200], consulta={"fields": "username"})
codigo("Buscar su comentario", "buscar_comentario.js", [X + 1200, Y + 200], "Solo si comentó en las últimas 24 h")
codigo("Preparar seguimiento", "preparar_seguimiento.js", [X + 1420, Y])
http("Mensaje 2", "POST", API + "/me/messages", [X + 1640, Y], cuerpo="={{ JSON.stringify($json.cuerpo2) }}")
PS = "$('Preparar seguimiento').item.json"
nodo("¿Mandar el mensaje 3?", "n8n-nodes-base.if", 2.2, [X + 1860, Y], {
    "conditions": condicion(f"={{{{ {PS}.enviarMensaje3 }}}}", ("boolean", "true")), "options": {}})
nodo("Esperar unos segundos", "n8n-nodes-base.wait", 1.1, [X + 2080, Y - 100], {
    "amount": f"={{{{ {AJ}.esperaMensaje3 }}}}", "unit": "seconds"}, webhookId=uid("wait"))
http("Mensaje 3", "POST", API + "/me/messages", [X + 2300, Y - 100], cuerpo=f"={{{{ JSON.stringify({PS}.cuerpo3) }}}}")
fila("Fila del botón", {
    "clave": f"={{{{ {PS}.clave }}}}", "ig_id": f"={{{{ {PS}.ig_id }}}}", "tipo": f"={{{{ {PS}.tipo }}}}",
    "boton": AHORA,
}, [X + 2520, Y])
hoja("Apuntar botón", "appendOrUpdate", "clave", [X + 2740, Y])
unir("¿Qué ha pasado?", "Preparar seguimiento", 1)
unir("¿Qué ha pasado?", "Preparar seguimiento", 2)
unir("¿Qué ha pasado?", "¿Quién me escribe?", 3)
unir("¿Quién me escribe?", "Buscar su comentario")
unir("Buscar su comentario", "Preparar seguimiento")
unir("Preparar seguimiento", "Mensaje 2")
unir("Mensaje 2", "¿Mandar el mensaje 3?")
unir("¿Mandar el mensaje 3?", "Esperar unos segundos", 0)
unir("¿Mandar el mensaje 3?", "Fila del botón", 1)
unir("Esperar unos segundos", "Mensaje 3")
unir("Mensaje 3", "Fila del botón")
unir("Fila del botón", "Apuntar botón")

# ── 5 · Rellena el formulario de Tally ───────────────────────────────────────────────────────────────────
Y = 860
fila("Fila del formulario", {"ig_id": "={{ $json.ig_id }}", "formulario": AHORA}, [X + 980, Y])
hoja("Apuntar formulario", "update", "ig_id", [X + 1200, Y])
unir("¿Qué ha pasado?", "Fila del formulario", 4)
unir("Fila del formulario", "Apuntar formulario")

flujo = {
    "name": "Comenta AUDITORIA → mensajes de Instagram",
    "nodes": nodos,
    "connections": conexiones,
    "settings": {"executionOrder": "v1", "saveManualExecutions": True, "timezone": "Europe/Madrid"},
    "pinData": {},
    "active": False,
    "meta": {"templateCredsSetupCompleted": False},
}
SALIDA.write_text(json.dumps(flujo, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"{SALIDA.relative_to(AQUI.parent.parent)}: {len(nodos)} nodos")
