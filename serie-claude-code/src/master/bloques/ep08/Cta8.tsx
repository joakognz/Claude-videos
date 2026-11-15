/**
 * EP.8 · CTA (escena auditoria): la pregunta palabra a palabra → AUDITORIA se escribe en un comentario y se envía →
 * el enlace con los esquemas (logo de Drive) → sello AUDITORÍA PARA TU NEGOCIO → «Optimiza tus procesos».
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Logo } from "../../componentes/Logo";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { IcoEnlace, Pieza } from "../../componentes/ep08/Dibujos";
import { C, MONO, TITULO, clamp01, norm, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps, EpisodioMaster } from "../../tipos";

const E = "auditoria";
const tiempos = (L: Linea, ep: EpisodioMaster) => {
  const ws = L.palabras.filter((p) => p.escena === E);
  const pregunta = ep.cta.pregunta.split(/\s+/).map((w) => ({ w, at: ws.find((p) => norm(p.texto) === norm(w))?.inicio ?? L.ini(E) }));
  return {
    pregunta,
    comenta: L.en(E, "Comenta"),
    clave: L.en(E, ep.cta.palabra_clave),
    finClave: L.finDe(E, ep.cta.palabra_clave),
    paso: L.en(E, "paso"),
    enlace: L.en(E, "enlace"),
    todo: L.en(E, "todo."),
    tienes: L.en(E, "tienes"),
    negocio: L.en(E, "negocio,"),
    optimizar: L.en(E, "optimizar"),
    tus: L.en(E, "tus"),
    procesos: L.en(E, "procesos."),
  };
};

export const Cta8: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L, ep);
  const envia = T.finClave + 0.08;
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 920, z: 1.06 },
    { t: T.comenta - 0.3, x: 540, y: 1060, z: 1.04, d: 0.9 },
    { t: T.enlace - 0.4, x: 540, y: 1250, z: 1.0, d: 0.9 },
    { t: T.tienes - 0.2, x: 540, y: 1640, z: 1.0, d: 0.9 },
    { t: T.optimizar - 0.3, x: 540, y: 1760, z: 1.02, d: 1.0 },
  ];
  const clave = ep.cta.palabra_clave;
  const nLetras = Math.round(clamp01((t - T.clave) / Math.max(0.3, T.finClave - T.clave)) * clave.length);
  const enviado = sp(t, envia, { damping: 15, stiffness: 160 });
  const mitad = 3;
  const vCom = vis(t, T.comenta - 0.1, T.tienes + 0.3, 0.8);
  const vDrive = vis(t, T.enlace - 0.1, Infinity, 0.8);
  return (
    <Escena t={t} tomas={tomas}>
      {/* pregunta */}
      <div style={{ position: "absolute", left: 540, top: 860, width: 0, height: 0, opacity: 1 - ramp(t, T.tienes - 0.1, T.tienes + 0.3) }}>
        <div style={{ position: "absolute", transform: "translate(-50%, -50%)", textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 68, lineHeight: 1.12, color: C.texto, whiteSpace: "nowrap" }}>
          {[T.pregunta.slice(0, mitad), T.pregunta.slice(mitad)].map((ln, i) => (
            <div key={i}>
              {ln.map(({ w, at }, k) => {
                const s = sp(t, at - 0.04, { damping: 13, stiffness: 220 });
                return (
                  <span key={k} style={{ display: "inline-block", marginRight: 20, opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * 40}px) scale(${0.8 + 0.2 * s})`, color: norm(w) === "esquemas" ? C.acento : C.texto }}>
                    {w}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* comentario */}
      {vCom.on && (
        <div style={{ position: "absolute", left: 70, top: 1060, width: 940, height: 124, opacity: vCom.opacity, transform: `translateY(${vCom.y}px) scale(${vCom.scale})`, display: "flex", alignItems: "center", gap: 22, padding: "0 18px 0 22px", boxSizing: "border-box", borderRadius: 62, background: C.panel2, border: `3px solid ${nLetras > 0 && enviado < 0.5 ? C.acento : C.borde}` }}>
          <div style={{ width: 84, height: 84, borderRadius: "50%", background: C.tenue, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "flex-end", justifyContent: "center", position: "relative" }}>
            <div style={{ position: "absolute", top: 16, width: 30, height: 30, borderRadius: "50%", background: C.gris }} />
            <div style={{ width: 54, height: 28, borderRadius: "27px 27px 0 0", background: C.gris }} />
          </div>
          <div style={{ flex: 1, fontFamily: MONO, fontWeight: 700, fontSize: 56, color: C.acento, letterSpacing: 3, whiteSpace: "nowrap", opacity: 1 - enviado }}>
            {clave.slice(0, nLetras)}
            {enviado < 0.2 && <span style={{ display: "inline-block", width: 5, height: 56, marginLeft: 4, verticalAlign: "middle", background: C.texto, opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0.1 }} />}
          </div>
          <div style={{ width: 92, height: 92, borderRadius: "50%", background: nLetras === clave.length ? C.acento : C.tenue, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.15 * Math.sin(clamp01((t - envia + 0.1) / 0.2) * Math.PI)})` }}>
            <svg width={46} height={46} viewBox="0 0 24 24"><path d="M3 11.5 L21 3 L13.5 21 L11 13 Z" fill={C.oscuro} /></svg>
          </div>
        </div>
      )}
      {t > envia && (
        <div style={{ position: "absolute", left: 540, top: 1122, width: 0, height: 0, opacity: Math.min(1, enviado * 2) * (1 - ramp(t, T.tienes - 0.1, T.tienes + 0.3)) }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${-120 * enviado}px) scale(${0.6 + 0.4 * enviado})`, display: "flex", alignItems: "center", gap: 18, padding: "16px 32px", borderRadius: 999, background: C.acento, boxShadow: `0 16px 50px ${C.acento}66`, whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 54, color: C.oscuro, letterSpacing: 3 }}>{clave}</span>
            <svg width={42} height={42} viewBox="0 0 24 24"><path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke={C.oscuro} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={22} strokeDashoffset={22 * (1 - clamp01((t - envia - 0.15) / 0.3))} /></svg>
          </div>
        </div>
      )}
      {/* el enlace con los esquemas */}
      {vDrive.on && (
        <div style={{ position: "absolute", left: 540, top: 1330, width: 0, height: 0, opacity: vDrive.opacity }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${vDrive.y}px) scale(${vDrive.scale})`, display: "flex", alignItems: "center", gap: 26, padding: "24px 40px 24px 150px", borderRadius: 34, background: C.panel, border: `3px solid ${C.borde}`, whiteSpace: "nowrap", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
            <div>
              <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 48, color: C.texto }}>Esquemas · EP.{ep.episodio}</div>
              <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 28, color: C.gris }}>enlace con todo</div>
            </div>
            <IcoEnlace s={62} color={C.acento} />
          </div>
        </div>
      )}
      <Logo src={ep.logos.drive} x={300} y={1330} w={120} t={t} at={T.enlace} out={Infinity} pulsos={[T.todo]} />
      {ep.cta.sello && <Sello texto={ep.cta.sello.texto} x={540} y={1610} t={t} at={T.negocio} out={hasta + 0.3} size={46} rot={-4} />}
      <div style={{ position: "absolute", left: 540, top: 1810, width: 0, height: 0 }}>
        <div style={{ position: "absolute", transform: "translate(-50%, -50%)", whiteSpace: "nowrap", fontFamily: TITULO, fontWeight: 800, fontSize: 68 }}>
          {[
            { w: "Optimiza", at: T.optimizar },
            { w: "tus", at: T.tus },
            { w: "procesos", at: T.procesos },
          ].map(({ w, at }, k) => {
            const s = sp(t, at - 0.04, { damping: 14, stiffness: 220 });
            return (
              <span key={k} style={{ display: "inline-block", marginRight: k < 2 ? 22 : 0, transform: `translateY(${(1 - s) * 30}px)`, opacity: Math.min(1, s * 1.6), color: k === 2 ? C.acento : C.texto }}>
                {w}
              </span>
            );
          })}
        </div>
      </div>
      <Etiqueta texto="TE PREPARAMOS UNA AUDITORÍA" x={540} y={1470} t={t} at={T.tienes} out={T.negocio - 0.05} size={34} variante="gris" fuente="titulo" />
      <Pieza x={540} y={1950} t={t} at={T.procesos + 0.3} out={hasta + 0.3}>
        <div style={{ width: 300, height: 8, borderRadius: 4, background: C.acento, transform: `scaleX(${ramp(t, T.procesos + 0.3, T.procesos + 0.8)})` }} />
      </Pieza>
    </Escena>
  );
};

export const eventosCta8 = (L: Linea, ep: EpisodioMaster): Evento[] => {
  const T = tiempos(L, ep);
  return [
    { t: T.comenta - 0.1, sfx: "pop", vol: 0.4 },
    { t: T.clave, sfx: "tecleo", vol: 0.3, dur: T.finClave - T.clave },
    { t: T.finClave + 0.08, sfx: "envio", vol: 0.5 },
    { t: T.enlace - 0.1, sfx: "pop", vol: 0.4 },
    { t: T.negocio + 0.12, sfx: "golpe", vol: 0.55 },
    { t: T.optimizar, sfx: "pop", vol: 0.3 },
  ];
};
