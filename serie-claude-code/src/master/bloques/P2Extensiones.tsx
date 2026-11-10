/**
 * Bloque 2, extensiones: tres tarjetas con logo y una línea animada hacia Visual Studio Code (Claude Code, Hostinger
 * Connector, Live Server); Hostinger Connector (despliegas y gestionas, cuenta con «1 clic» o «token de API»); Node.js
 * se lo pides a Claude; Live Server (la web en local que se actualiza al guardar) y «ábreme la web…».
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../componentes/Escena";
import { Flecha } from "../componentes/Flecha";
import { IconCheck, IconHosting } from "../componentes/Iconos";
import { Logo } from "../componentes/Logo";
import { Cursor } from "../componentes/Piezas";
import { Etiqueta, Sello } from "../componentes/Sello";
import { ChatClaude, Codigo, EstadoLive, Navegador, PanelClaude, VSC, VentanaVs } from "../componentes/VsCode";
import { C, EASE, EASE_OUT, MONO, TITULO, UI, clamp01, enCurva, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps } from "../tipos";
import { Titular, datosBloque } from "./P2Inicio";
import { escribe, pulso, rutaCursor } from "./P2VsCode";

export const MORADO = "#673DE6"; // color de Hostinger (solo para su botón)
export const EXTS = [
  { id: "claude", nombre: "Claude Code", logo: "logos/claude.png", blanco: false },
  { id: "hostinger", nombre: "Hostinger Connector", logo: "logos/hostinger.png", blanco: true },
  { id: "liveserver", nombre: "Live Server", logo: "logos/liveserver.png", blanco: true },
] as const;

/** Tarjeta de una extensión: número, logo y nombre. */
export const TarjetaExt: React.FC<{ i: number; x: number; y: number; w: number; t: number; at: number; out?: number; activa?: number; tenue?: number; hecha?: number }> = ({ i, x, y, w, t, at, out, activa = 0, tenue = 1, hecha = 0 }) => {
  const v = vis(t, at, out, 0.7);
  if (!v.on) return null;
  const e = EXTS[i];
  const h = 150;
  return (
    <div style={{ position: "absolute", left: x, top: y - h / 2, width: w, height: h, borderRadius: 32, background: activa > 0 ? `color-mix(in srgb, ${C.acento} ${Math.round(16 * activa)}%, ${C.panel})` : C.panel, border: `4px solid ${activa > 0.5 ? C.acento : C.borde}`, boxShadow: activa > 0 ? `0 0 ${50 * activa}px ${C.acento}55` : "0 20px 50px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 24, padding: "0 26px", boxSizing: "border-box", opacity: v.opacity * tenue, transform: `translateX(${(1 - v.s) * -120}px) scale(${1 + 0.05 * activa})`, transformOrigin: "0% 50%" }}>
      <div style={{ width: 54, height: 54, borderRadius: 16, background: hecha > 0.5 ? C.acento : C.panel2, color: hecha > 0.5 ? C.oscuro : C.acento, fontFamily: TITULO, fontWeight: 800, fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
      <div style={{ width: 104, height: 104, borderRadius: 24, background: e.blanco ? "#FFFFFF" : C.fondo, border: e.blanco ? "none" : `3px solid ${C.borde}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Img src={staticFile(e.logo)} style={{ width: e.blanco ? 84 : 70, height: e.blanco ? 84 : 70, objectFit: "contain" }} />
      </div>
      <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: e.nombre.length > 14 ? 38 : 46, color: C.texto, whiteSpace: "nowrap", letterSpacing: -0.5 }}>{e.nombre}</div>
      {hecha > 0 && (
        <div style={{ marginLeft: "auto", width: 64, height: 64, borderRadius: "50%", background: C.acento, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sp(t, at, {}) > 0 ? 0.6 + 0.4 * hecha : 0})`, flexShrink: 0 }}>
          <IconCheck s={50} color={C.oscuro} p={hecha} />
        </div>
      )}
    </div>
  );
};

// ── tres extensiones → Visual Studio Code ──────────────────────────────────────────────────────────────────────────
const tExt = (L: Linea) => ({
  ini: L.ini("extensiones"),
  ext: L.en("extensiones", "extensiones"),
  rapido: L.en("extensiones", "rápido"),
  una: L.en("una", "Una"),
  claude: L.en("una", "Claude"),
  tienes: L.en("una", "tienes"),
  vas: L.en("una", "Vas"),
  delante: L.en("una", "delante"),
});

export const Ext: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta, escenas }) => {
  const T = tExt(L);
  const b = datosBloque(ep, escenas[0]);
  const out = hasta + 0.3;
  const ys = [1000, 1190, 1380];
  const VSX = 900;
  const VSY = 1190;
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1080, z: 0.92 },
    { t: T.ext - 0.2, x: 540, y: 1120, z: 0.98, d: 1.0 },
    { t: T.una - 0.25, x: 470, y: 1060, z: 1.16, d: 0.9 },
    { t: T.vas - 0.2, x: 540, y: 1150, z: 0.98, d: 1.0 },
  ];
  const act1 = ramp(t, T.una - 0.1, T.una + 0.25);
  return (
    <Escena t={t} tomas={tomas}>
      <Sello texto={`BLOQUE ${b?.n ?? 2}`} x={540} y={690} t={t} at={T.ini} out={out} size={58} rot={-4} />
      <Titular txt={(b?.titulo ?? "Extensiones").toUpperCase()} y={810} t={t} at={T.ext - 0.05} out={out} size={92} />
      <Logo src={ep.logos.vscode} x={VSX} y={VSY} w={180} t={t} at={T.ext + 0.1} out={out} pulsos={[T.ext + 1.0, T.ext + 1.2, T.ext + 1.4]} />
      {EXTS.map((_, i) => {
        const at = T.ext + 0.15 + i * 0.2;
        const p = ramp(t, at + 0.25, at + 0.9, EASE_OUT);
        const curva = { a: { x: 650, y: ys[i] }, c: { x: 760, y: (ys[i] + VSY) / 2 }, b: { x: VSX - 110, y: VSY } };
        return (
          <React.Fragment key={i}>
            <Flecha curva={curva} p={p} ancho={6} opacity={i === 0 ? 1 : 1 - 0.5 * act1} brillo={i === 0 ? act1 : 0} />
            <TarjetaExt i={i} x={60} y={ys[i]} w={590} t={t} at={at} out={out} activa={i === 0 ? act1 : 0} tenue={i === 0 ? 1 : 1 - 0.45 * act1} hecha={i === 0 ? ramp(t, T.tienes, T.tienes + 0.35) : 0} />
          </React.Fragment>
        );
      })}
      <Etiqueta texto="⚡ MÁS RÁPIDO" x={540} y={1530} t={t} at={T.rapido - 0.05} out={T.una - 0.1} size={44} variante="borde" fuente="titulo" />
      <Etiqueta texto="YA LA TIENES" x={560} y={ys[0] - 100} t={t} at={T.tienes} out={out} size={38} variante="acento" fuente="titulo" />
      {(() => {
        const v = vis(t, T.vas - 0.05, out, 0.6);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 540, top: 1540, width: 0, height: 0, opacity: v.opacity }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${v.scale})`, display: "flex", alignItems: "center", gap: 18, whiteSpace: "nowrap" }}>
              <div style={{ display: "flex", gap: 8 }}>
                {[0, 1, 2].map((k) => (
                  <div key={k} style={{ width: 40, height: 16, borderRadius: 8, background: k === 0 ? C.acento : C.panel2, border: `2px solid ${k === 0 ? C.acento : C.borde}` }} />
                ))}
              </div>
              <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 46, color: C.texto }}>VAS UNA POR DELANTE</div>
            </div>
          </div>
        );
      })()}
    </Escena>
  );
};

export const eventosExt = (L: Linea): Evento[] => {
  const T = tExt(L);
  return [
    { t: T.ini + 0.1, sfx: "golpe", vol: 0.55 },
    ...[0, 1, 2].map((i) => ({ t: T.ext + 0.15 + i * 0.2, sfx: "pop" as const, vol: 0.35 })),
    { t: T.una, sfx: "pop", vol: 0.4 },
    { t: T.tienes, sfx: "tick", vol: 0.55 },
  ];
};

// ── Hostinger Connector ────────────────────────────────────────────────────────────────────────────────────────────
const tHost = (L: Linea) => ({
  dos: L.en("hostinger", "Dos"),
  hostinger: L.en("hostinger", "Hostinger"),
  conecta: L.en("hostinger", "Conecta"),
  hosting: L.en("hostinger", "hosting"),
  despliegas: L.en("hostinger", "despliegas"),
  gestionas: L.en("hostinger", "gestionas"),
  sin: L.en("hostinger", "sin"),
  editor: L.en("hostinger", "editor"),
  conectarlo: L.en("conectar", "conectarlo"),
  cuenta: L.en("conectar", "cuenta"),
  conector: L.en("conectar", "conector"),
  clic: L.en("conectar", "clic"),
  o: L.en("conectar", "O"),
  token: L.en("conectar", "token"),
  api: L.en("conectar", "API"),
  fin: L.fin("conectar"),
});

export const Hostinger: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tHost(L);
  const out = hasta + 0.3;
  const Y2 = 2000; // panel de la cuenta, debajo: la cámara baja hasta él
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1000, z: 0.95 },
    { t: T.conecta - 0.3, x: 540, y: 1100, z: 1.0, d: 0.9 },
    { t: T.sin - 0.2, x: 540, y: 1200, z: 0.98, d: 0.9 },
    { t: T.conectarlo - 0.2, x: 540, y: Y2 + 250, z: 1.0, d: 1.0 },
    { t: T.clic - 0.4, x: 540, y: Y2 + 230, z: 1.04, d: 0.8 },
    { t: T.token - 0.35, x: 540, y: Y2 + 280, z: 1.04, d: 0.8 },
  ];
  const A = { x: 250, y: 1150 };
  const B = { x: 830, y: 1150 };
  const ida = { a: { x: A.x + 110, y: A.y - 30 }, c: { x: 540, y: A.y - 150 }, b: { x: B.x - 110, y: B.y - 30 } };
  const vuelta = { a: { x: B.x - 110, y: B.y + 30 }, c: { x: 540, y: B.y + 150 }, b: { x: A.x + 110, y: A.y + 30 } };
  const pIda = ramp(t, T.conecta, T.conecta + 0.7, EASE_OUT);
  const pVuelta = ramp(t, T.hosting, T.hosting + 0.7, EASE_OUT);
  const cur = rutaCursor(t, [
    { t: T.cuenta, x: 900, y: Y2 + 420 },
    { t: T.clic + 0.05, x: 640, y: Y2 + 185 },
    { t: T.token + 0.05, x: 640, y: Y2 + 420 },
  ]);
  const clics = [T.clic + 0.15, T.token + 0.15];
  const curOp = ramp(t, T.cuenta, T.cuenta + 0.3);
  const conectado = ramp(t, T.clic + 0.25, T.clic + 0.6);
  const panel = vis(t, T.conectarlo - 0.2, out, 0.85);
  return (
    <Escena t={t} tomas={tomas}>
      <TarjetaExt i={1} x={100} y={760} w={880} t={t} at={desde - 0.1} out={out} activa={ramp(t, T.dos, T.dos + 0.3)} />
      <Logo src={ep.logos.vscode} x={A.x} y={A.y} w={180} t={t} at={T.conecta - 0.1} out={out} pulsos={[T.sin]} />
      {(() => {
        const v = vis(t, T.hosting - 0.1, out, 0.3);
        return v.on ? (
          <div style={{ position: "absolute", left: B.x - 95, top: B.y - 95, width: 190, height: 190, borderRadius: 46, background: C.panel2, border: `4px solid ${MORADO}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: v.opacity, transform: `scale(${v.scale})`, boxShadow: `0 0 50px ${MORADO}55` }}>
            <IconHosting s={120} color="#FFFFFF" />
          </div>
        ) : null;
      })()}
      <Etiqueta texto="TU HOSTING" x={B.x} y={B.y + 140} t={t} at={T.hosting} out={out} size={32} variante="gris" />
      <Flecha curva={ida} p={pIda} ancho={8} brillo={ramp(t, T.despliegas, T.despliegas + 0.4)} />
      <Flecha curva={vuelta} p={pVuelta} ancho={8} color={MORADO} brillo={ramp(t, T.gestionas, T.gestionas + 0.4)} />
      {/* paquetes que viajan por el cable */}
      {[0, 1, 2].map((k) => {
        const u = ((t - T.despliegas) * 0.8 + k / 3) % 1;
        if (t < T.despliegas || t > out) return null;
        const p = enCurva(ida, u);
        return <div key={k} style={{ position: "absolute", left: p.x - 12, top: p.y - 12, width: 24, height: 24, borderRadius: 7, background: C.acento, boxShadow: `0 0 16px ${C.acento}` }} />;
      })}
      <Etiqueta texto="↑ DESPLIEGAS" x={540} y={A.y - 200} t={t} at={T.despliegas - 0.05} out={out} size={42} variante="acento" fuente="titulo" />
      <Etiqueta texto="GESTIONAS TUS WEBS" x={540} y={A.y + 200} t={t} at={T.gestionas - 0.05} out={out} size={40} variante="borde" fuente="titulo" />
      <Etiqueta texto="SIN SALIR DEL EDITOR" x={540} y={1470} t={t} at={T.sin - 0.05} out={out} size={50} variante="texto" fuente="titulo" />
      {/* cuenta de Hostinger: «1 clic» o «token de API» */}
      {panel.on && (
        <div style={{ position: "absolute", left: 90, top: Y2 - 230, width: 900, height: 820, borderRadius: 40, background: "#FFFFFF", boxShadow: "0 40px 100px rgba(0,0,0,0.6)", opacity: panel.opacity, transform: `scale(${panel.scale})`, overflow: "hidden", fontFamily: UI }}>
          <div style={{ height: 120, background: "#F4F3FF", display: "flex", alignItems: "center", gap: 26, padding: "0 40px", borderBottom: "2px solid #E6E3FA" }}>
            <Img src={staticFile(ep.logos.hostinger)} style={{ height: 80 }} />
            <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 44, color: "#2F1C6A" }}>Tu cuenta</div>
          </div>
        </div>
      )}
      {panel.on && (() => {
        const b1 = vis(t, T.conector - 0.1, out, 0.8);
        const o = vis(t, T.o - 0.05, out, 0.5);
        const b2 = vis(t, T.token - 0.1, out, 0.8);
        const campo = ramp(t, T.api, T.api + 0.6);
        return (
          <>
            {b1.on && (
              <div style={{ position: "absolute", left: 160, top: Y2 + 110, width: 760, height: 130, borderRadius: 26, background: MORADO, display: "flex", alignItems: "center", justifyContent: "center", gap: 22, opacity: b1.opacity, transform: `scale(${b1.scale * (1 - 0.05 * pulso(t, [clics[0]]))})`, boxShadow: `0 20px 50px ${MORADO}66`, fontFamily: TITULO, fontWeight: 800, fontSize: 56, color: "#FFFFFF" }}>
                {conectado > 0 ? <IconCheck s={64} color="#FFFFFF" p={conectado} /> : null}
                CON 1 CLIC
              </div>
            )}
            {o.on && <div style={{ position: "absolute", left: 540 - 40, top: Y2 + 268, width: 80, textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 44, color: "#8A86A0", opacity: o.opacity }}>O</div>}
            {b2.on && (
              <div style={{ position: "absolute", left: 160, top: Y2 + 350, width: 760, height: 130, borderRadius: 26, border: `5px solid ${MORADO}`, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", gap: 22, opacity: b2.opacity, transform: `scale(${b2.scale * (1 - 0.05 * pulso(t, [clics[1]]))})`, fontFamily: TITULO, fontWeight: 800, fontSize: 52, color: MORADO }}>
                <svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke={MORADO} strokeWidth={2.4} strokeLinecap="round"><circle cx="8" cy="15" r="4.5" /><path d="M11.2 11.8 L20 3 M16.5 6.5 l2.5 2.5 M14 9 l2 2" /></svg>
                TOKEN DE API
              </div>
            )}
            {campo > 0 && (
              <div style={{ position: "absolute", left: 160, top: Y2 + 510, width: 760, height: 90, borderRadius: 18, background: "#F1F1F6", border: "2px solid #D9D7E8", display: "flex", alignItems: "center", padding: "0 30px", boxSizing: "border-box", fontFamily: MONO, fontSize: 44, color: "#2F1C6A", letterSpacing: 6, opacity: campo }}>
                {"•".repeat(Math.round(campo * 18))}
              </div>
            )}
            {curOp > 0 && <Cursor x={cur.x} y={cur.y} pulsa={pulso(t, clics)} opacity={curOp} size={70} />}
          </>
        );
      })()}
      <Etiqueta texto="ENTRA EN TU CUENTA" x={540} y={Y2 - 300} t={t} at={T.cuenta - 0.05} out={T.clic} size={40} variante="borde" fuente="titulo" />
    </Escena>
  );
};

export const eventosHostinger = (L: Linea): Evento[] => {
  const T = tHost(L);
  return [
    { t: T.dos, sfx: "pop", vol: 0.45 },
    { t: T.conecta, sfx: "whoosh", vol: 0.3 },
    { t: T.despliegas, sfx: "pop", vol: 0.35 },
    { t: T.gestionas, sfx: "pop", vol: 0.35 },
    { t: T.conectarlo - 0.2, sfx: "whoosh", vol: 0.3 },
    { t: T.clic + 0.15, sfx: "tick", vol: 0.5 },
    { t: T.token + 0.15, sfx: "tick", vol: 0.4 },
    { t: T.api, sfx: "tecleo", vol: 0.25, dur: 0.6 },
  ];
};

// ── Node.js: se lo pides a Claude ──────────────────────────────────────────────────────────────────────────────────
const tNode = (L: Linea) => ({
  necesitas: L.en("node", "Necesitas"),
  node: L.en("node", "Node.js"),
  compliques: L.en("node", "compliques"),
  instalas: L.en("node", "instalas"),
  dices: L.en("node", "dices"),
  instalame: L.en("node", "instálame"),
  node2Fin: L.finDe("node", "Node.js", 1),
  hace: L.en("node", "hace"),
  fin: L.fin("node"),
});

/** Ventana de VS Code con el chat de Claude, en una posición del lienzo. */
const VentanaChat: React.FC<{ x: number; y: number; t: number; op: number; escala: number; entrada: string; cursor: boolean; pulsaEnviar: number; mensajes: React.ComponentProps<typeof ChatClaude>["mensajes"]; sesion: string; estado?: React.ReactNode }> = ({ x, y, t, op, escala, entrada, cursor, pulsaEnviar, mensajes, sesion, estado }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: op, transform: `scale(${escala})` }}>
    <VentanaVs
      titulo="mi-proyecto"
      activo={5}
      claude={1}
      lateral={<PanelClaude pulsaNueva={0} sesion={sesion} sesionOp={1} />}
      editor={<ChatClaude t={t} entrada={entrada} cursor={cursor} pulsaEnviar={pulsaEnviar} mensajes={mensajes} />}
      pestanas={[{ txt: sesion, activa: true, icono: <Img src={staticFile("logos/claude.png")} style={{ width: 22 }} /> }]}
      estado={estado}
    />
  </div>
);

export const Node: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tNode(L);
  const out = hasta + 0.3;
  const WX = -210;
  const WY = 1500;
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1000, z: 0.98 },
    { t: T.instalas - 0.2, x: 540, y: 1100, z: 1.0, d: 0.9 },
    { t: T.dices - 0.25, x: WX + 900, y: WY + 760, z: 1.12, d: 1.0 },
    { t: T.node2Fin + 0.1, x: WX + 860, y: WY + 330, z: 1.08, d: 0.9 },
  ];
  const enviar = T.node2Fin + 0.12;
  const entrada = t < enviar ? escribe("instálame Node.js", t, T.instalame, T.node2Fin) : "";
  const msg = ramp(t, enviar, enviar + 0.3);
  const hecho = t >= T.hace + 0.15;
  const win = vis(t, T.dices - 0.4, out, 0.9);
  return (
    <Escena t={t} tomas={tomas}>
      <Etiqueta texto="NECESITAS" x={540} y={720} t={t} at={T.necesitas - 0.05} out={T.dices} size={44} variante="borde" fuente="titulo" />
      {(() => {
        const v = vis(t, T.node - 0.1, T.dices + 0.1, 0.4);
        return v.on ? (
          <div style={{ position: "absolute", left: 540 - 230, top: 900 - 150, width: 460, height: 300, borderRadius: 36, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", opacity: v.opacity, transform: `scale(${v.scale})`, boxShadow: "0 30px 80px rgba(0,0,0,0.55)" }}>
            <Img src={staticFile(ep.logos.nodejs)} style={{ width: 360 }} />
          </div>
        ) : null;
      })()}
      {(() => {
        const v = vis(t, T.instalas - 0.1, T.dices + 0.1, 0.6);
        if (!v.on) return null;
        const tacha = ramp(t, T.instalas + 0.3, T.instalas + 0.7, EASE);
        return (
          <div style={{ position: "absolute", left: 540, top: 1230, width: 0, height: 0, opacity: v.opacity }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${v.scale})`, whiteSpace: "nowrap", fontFamily: TITULO, fontWeight: 800, fontSize: 70, color: C.texto }}>
              NO LO INSTALAS TÚ
              <div style={{ position: "absolute", left: -10, top: "52%", height: 10, width: `${tacha * 104}%`, borderRadius: 5, background: C.acento, boxShadow: `0 0 20px ${C.acento}` }} />
            </div>
          </div>
        );
      })()}
      <Etiqueta texto="SE LO DICES A CLAUDE" x={540} y={1390} t={t} at={T.dices - 0.05} out={T.dices + 0.9} size={44} variante="acento" fuente="titulo" />
      {win.on && (
        <VentanaChat
          x={WX}
          y={WY}
          t={t}
          op={win.opacity}
          escala={win.scale}
          entrada={entrada}
          cursor={t < enviar}
          pulsaEnviar={pulso(t, [enviar])}
          sesion={t > enviar ? "instálame Node.js" : "hola"}
          mensajes={[
            { de: "yo", texto: "instálame Node.js", p: msg },
            {
              de: "claude",
              p: ramp(t, enviar + 0.1, enviar + 0.3),
              pasos: [{ txt: <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Img src={staticFile(ep.logos.nodejs)} style={{ height: 30, background: "#fff", borderRadius: 4, padding: "2px 6px" }} />Node.js</span>, p: ramp(t, enviar + 0.15, enviar + 0.35), ok: hecho }],
              renglones: hecho ? 1 : 0,
            },
          ]}
        />
      )}
      {(() => {
        const v = vis(t, T.hace - 0.05, out, 0.3);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: WX + 1150, top: WY + 470, width: 0, height: 0, opacity: v.opacity }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${v.scale}) rotate(${(1 - v.s) * -12 - 3}deg)`, display: "flex", alignItems: "center", gap: 14, padding: "16px 32px", borderRadius: 999, background: C.acento, boxShadow: `0 16px 50px ${C.acento}77`, whiteSpace: "nowrap" }}>
              <IconCheck s={56} color={C.oscuro} p={ramp(t, T.hace, T.hace + 0.4)} />
              <span style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 54, color: C.oscuro }}>Y LO HACE</span>
            </div>
          </div>
        );
      })()}
    </Escena>
  );
};

export const eventosNode = (L: Linea): Evento[] => {
  const T = tNode(L);
  return [
    { t: T.node, sfx: "pop", vol: 0.45 },
    { t: T.instalas + 0.3, sfx: "whoosh", vol: 0.25 },
    { t: T.dices - 0.3, sfx: "whoosh", vol: 0.3 },
    { t: T.instalame, sfx: "tecleo", vol: 0.25, dur: Math.max(0.3, T.node2Fin - T.instalame) },
    { t: T.node2Fin + 0.12, sfx: "envio", vol: 0.45 },
    { t: T.hace, sfx: "tick", vol: 0.55 },
  ];
};

// ── Live Server ────────────────────────────────────────────────────────────────────────────────────────────────────
const tLive = (L: Linea) => ({
  tres: L.en("live", "Tres"),
  abre: L.en("live", "abre"),
  local: L.en("live", "local"),
  actualiza: L.en("live", "actualiza"),
  guardas: L.en("live", "guardas"),
  cambias: L.en("live", "Cambias"),
  ves: L.en("live", "ves"),
  instante: L.en("live", "instante"),
  abrirla: L.en("abrir", "abrirla"),
  claude: L.en("abrir", "Claude"),
  abreme: L.en("abrir", "ábreme"),
  verla: L.en("abrir", "verla"),
  fin: L.fin("abrir"),
});

const TeclaS: React.FC<{ x: number; y: number; t: number; at: number }> = ({ x, y, t, at }) => {
  const u = t - at;
  if (u < -0.05 || u > 0.9) return null;
  const s = sp(t, at - 0.05, { damping: 10, stiffness: 260 });
  const fuera = clamp01((u - 0.6) / 0.3);
  const aprieta = Math.sin(clamp01((u - 0.15) / 0.2) * Math.PI);
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", gap: 10, opacity: Math.min(1, s * 2) * (1 - fuera), transform: `scale(${(0.6 + 0.4 * s) * (1 - 0.08 * aprieta)})` }}>
      {["⌘", "S"].map((k) => (
        <div key={k} style={{ width: 84, height: 84, borderRadius: 18, background: "#F4F5F7", boxShadow: `0 ${8 - 6 * aprieta}px 0 #9AA0AA, 0 14px 30px rgba(0,0,0,0.5)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: UI, fontWeight: 700, fontSize: 44, color: "#1F2329", transform: `translateY(${6 * aprieta}px)` }}>{k}</div>
      ))}
    </div>
  );
};

export const Live: React.FC<BloqueProps> = ({ t, L, desde, hasta }) => {
  const T = tLive(L);
  const out = hasta + 0.3;
  const guarda1 = T.guardas + 0.1;
  const guarda2 = T.ves - 0.15;
  const enviar = T.verla - 0.05;
  const cambio = ramp(t, T.cambias, T.cambias + 0.4);
  const sucia = (t > T.actualiza && t < guarda1 + 0.2) || (t > T.cambias && t < guarda2 + 0.2);
  const recarga = Math.max(ramp(t, guarda1 + 0.2, guarda1 + 0.7), 0) * (t < T.cambias ? 1 : 0) + (t >= guarda2 + 0.2 ? ramp(t, guarda2 + 0.2, guarda2 + 0.7) : 0);
  const color = t >= guarda2 + 0.45 ? "#5B8DEF" : C.acento;
  const modoChat = t >= T.abrirla - 0.1;
  const navCierra = ramp(t, T.abrirla - 0.1, T.abrirla + 0.25);
  const navAbre = ramp(t, enviar + 0.1, enviar + 0.4, EASE_OUT);
  const navOp = modoChat ? navAbre : vis(t, T.abre - 0.1, out, 0.7).opacity * (1 - navCierra);
  const navEsc = modoChat ? 0.6 + 0.4 * navAbre : vis(t, T.abre - 0.1, out, 0.7).scale;
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1000, z: 0.98 },
    { t: T.abre - 0.25, x: 540, y: 1180, z: 0.94, d: 1.0 },
    { t: T.guardas - 0.3, x: 540, y: 1080, z: 1.02, d: 0.8 },
    { t: T.cambias - 0.2, x: 540, y: 1000, z: 1.08, d: 0.8 },
    { t: T.ves - 0.1, x: 540, y: 1330, z: 1.04, d: 0.8 },
    { t: T.abreme - 0.3, x: 540, y: 1100, z: 1.0, d: 0.9 },
  ];
  const editorV = vis(t, T.abre - 0.2, T.abrirla + 0.1, 0.85);
  const chatV = vis(t, T.abrirla - 0.05, out, 0.85);
  const entrada = t < enviar ? escribe("ábreme la web para que pueda verla", t, T.abreme, T.verla - 0.15) : "";
  return (
    <Escena t={t} tomas={tomas}>
      <TarjetaExt i={2} x={100} y={720} w={880} t={t} at={desde - 0.1} out={out} activa={ramp(t, T.tres, T.tres + 0.3)} />
      {/* editor con index.html */}
      {editorV.on && (
        <div style={{ position: "absolute", left: 60, top: 840, width: 960, height: 330, borderRadius: 20, overflow: "hidden", background: VSC.fondo, border: "2px solid #000", boxShadow: "0 30px 80px rgba(0,0,0,0.55)", opacity: editorV.opacity, transform: `scale(${editorV.scale})` }}>
          <div style={{ height: 52, background: "#252526", display: "flex", alignItems: "center" }}>
            <div style={{ height: 52, padding: "0 24px", display: "flex", alignItems: "center", gap: 10, background: VSC.fondo, borderTop: `2px solid ${VSC.azulClaro}`, fontFamily: UI, fontSize: 22, color: "#fff" }}>
              <span style={{ fontFamily: MONO, fontWeight: 700, color: "#E44D26" }}>&lt;&gt;</span> index.html <span style={{ color: VSC.tenue }}>{sucia ? "●" : "×"}</span>
            </div>
            <div style={{ flex: 1 }} />
          </div>
          <div style={{ transform: "scale(0.9)", transformOrigin: "0 0" }}>
            <Codigo lineas={6} cambia={3} cambio={cambio} colorCambio="#5B8DEF" />
          </div>
          <div style={{ position: "absolute", right: 0, bottom: 0, height: 40, padding: "0 16px", background: VSC.estado, display: "flex", alignItems: "center", fontFamily: UI, fontSize: 18, color: "#fff", borderTopLeftRadius: 10 }}>
            <EstadoLive activo={t > T.abre + 0.2 ? 1 : 0} resalte={ramp(t, T.abre, T.abre + 0.3) * (1 - ramp(t, T.abre + 0.8, T.abre + 1.2))} />
          </div>
        </div>
      )}
      {/* chat: «ábreme la web…» */}
      {chatV.on && (
        <div style={{ position: "absolute", left: 60, top: 840, width: 960, height: 330, borderRadius: 20, overflow: "hidden", background: VSC.fondo, border: "2px solid #000", boxShadow: "0 30px 80px rgba(0,0,0,0.55)", opacity: chatV.opacity, transform: `scale(${chatV.scale})`, fontFamily: UI }}>
          <ChatClaude t={t} entrada={entrada} cursor={t < enviar} pulsaEnviar={pulso(t, [enviar])} mensajes={[{ de: "yo", texto: "ábreme la web para que pueda verla", p: ramp(t, enviar, enviar + 0.3) }]} />
        </div>
      )}
      {/* navegador */}
      {navOp > 0.01 && (
        <div style={{ position: "absolute", left: 60, top: 1200, opacity: navOp, transform: `scale(${navEsc})`, transformOrigin: "50% 0%" }}>
          <Navegador w={960} h={420} url="127.0.0.1:5500/index.html" recarga={recarga} color={color} t={t} />
        </div>
      )}
      <Etiqueta texto="EN LOCAL" x={860} y={1228} t={t} at={T.local - 0.05} out={T.abrirla} size={30} variante="acento" fuente="titulo" />
      <TeclaS x={780} y={1040} t={t} at={guarda1} />
      <TeclaS x={780} y={1040} t={t} at={guarda2} />
      <Etiqueta texto="SE ACTUALIZA AL GUARDAR" x={540} y={1560} t={t} at={T.guardas - 0.05} out={T.cambias} size={40} variante="borde" fuente="titulo" />
      <Etiqueta texto="AL INSTANTE" x={540} y={1560} t={t} at={T.instante - 0.1} out={T.abrirla} size={52} variante="acento" fuente="titulo" />
      <Logo src="logos/claude.png" x={965} y={895} w={64} t={t} at={T.claude - 0.05} out={out} sombra={false} />
    </Escena>
  );
};

export const eventosLive = (L: Linea): Evento[] => {
  const T = tLive(L);
  return [
    { t: T.tres, sfx: "pop", vol: 0.45 },
    { t: T.abre, sfx: "whoosh", vol: 0.3 },
    { t: T.guardas + 0.25, sfx: "tick", vol: 0.45 },
    { t: T.cambias, sfx: "tecleo", vol: 0.2, dur: 0.35 },
    { t: T.ves + 0.05, sfx: "tick", vol: 0.45 },
    { t: T.abreme, sfx: "tecleo", vol: 0.25, dur: Math.max(0.3, T.verla - T.abreme) },
    { t: T.verla - 0.05, sfx: "envio", vol: 0.45 },
  ];
};

