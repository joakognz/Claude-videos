/**
 * CTA con Drive (cta.tipo "auditoria_drive", escena cta): la pregunta palabra a palabra → carpeta de Drive (logo
 * adjunto) que se abre llena de documentos y esquemas → comentario en el que se escribe la palabra clave y se envía →
 * enlace del comentario a la carpeta («te paso el enlace con todo») → tarjeta de auditoría con checks («si tienes un
 * negocio… optimizar tus procesos»). Al final, plano general con las tres cosas.
 */
import React from "react";
import { Escena } from "../componentes/Escena";
import { Carpeta, Check, Comentario, Documento, Enlace, Enviar, Mejora } from "../componentes/Iconos";
import { Logo } from "../componentes/Logo";
import { Etiqueta } from "../componentes/Sello";
import { Frase } from "../componentes/Tarjeta";
import { C, EASE, MONO, TITULO, UI, clamp01, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps, EpisodioMaster } from "../tipos";

const tiempos = (L: Linea, ep: EpisodioMaster, e: string) => {
  const clave = L.en(e, ep.cta.palabra_clave);
  const finClave = L.finDe(e, ep.cta.palabra_clave);
  return {
    ini: L.ini(e),
    carpeta: L.en(e, ep.cta.carpeta?.en ?? "esquemas"),
    finPregunta: L.en(e, "episodio?"),
    comenta: L.en(e, "Comenta"),
    clave,
    finClave,
    envia: Math.max(finClave + 0.1, clave + 0.6),
    enlace: L.en(e, "enlace"),
    todo: L.en(e, "todo."),
    negocio: L.en(e, ep.cta.check?.en ?? "negocio,"),
    si: L.en(e, "si"),
    preparamos: L.en(e, "preparamos"),
    // «auditoría» (la segunda: la primera es la palabra clave, que se normaliza igual)
    auditoria: L.en(e, "auditoría", 1),
    optimizar: L.en(e, "optimizar"),
    fin: L.fin(e),
  };
};

const CARP = { x: 540, y: 1260 };
const COM = { x: 540, y: 1680 };
const AUD = { x: 540, y: 2040, h: 300 };
const DOCS = [
  { dx: -300, dy: -210, r: -16, tipo: "esquema" as const },
  { dx: -150, dy: -270, r: -7, tipo: "texto" as const },
  { dx: 0, dy: -290, r: 0, tipo: "esquema" as const },
  { dx: 150, dy: -270, r: 7, tipo: "texto" as const },
  { dx: 300, dy: -210, r: 16, tipo: "esquema" as const },
];

export const CtaDrive: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta, escenas }) => {
  const T = tiempos(L, ep, escenas[0]);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 960, z: 1.0 },
    { t: T.carpeta - 0.2, x: 540, y: 1120, z: 1.0, d: 0.8 },
    { t: T.comenta - 0.3, x: 540, y: 1440, z: 1.0, d: 0.8 },
    { t: T.si - 0.3, x: 540, y: 1860, z: 1.04, d: 0.8 },
    { t: T.optimizar - 0.2, x: 540, y: 1640, z: 0.9, d: 1.0 },
  ];
  const abre = ramp(t, T.carpeta + 0.2, T.carpeta + 0.6);
  const clave = ep.cta.palabra_clave;
  const nLetras = Math.round(clamp01((t - T.clave) / Math.max(0.3, T.finClave - T.clave)) * clave.length);
  const enviado = sp(t, T.envia, { damping: 15, stiffness: 160 });
  const enlace = ramp(t, T.enlace - 0.2, T.enlace + 0.4);
  const todo = Math.sin(clamp01((t - T.todo) / 0.5) * Math.PI);
  const checks = [T.preparamos, T.auditoria, T.optimizar];
  return (
    <Escena t={t} tomas={tomas}>
      <Frase lineas={["¿Quieres los esquemas", "de este episodio?"]} escena={escenas[0]} palabras={L.palabras} x={540} y={700} t={t} out={T.comenta + 0.15} size={70} acento={["esquemas"]} />

      {/* documentos que salen de la carpeta (detrás de la tapa) */}
      {DOCS.map((d, i) => {
        const u = EASE(ramp(t, T.carpeta + 0.35 + i * 0.07, T.carpeta + 0.9 + i * 0.07, (x) => x));
        if (u <= 0) return null;
        const lat = todo * 0.12 * (i % 2 ? 1 : 0.7);
        return (
          <div key={i} style={{ position: "absolute", left: CARP.x + d.dx * u - 60, top: CARP.y - 20 + d.dy * u - 60, transform: `rotate(${d.r * u}deg) scale(${(0.5 + 0.5 * u) * (1 + lat)})`, opacity: Math.min(1, u * 3) }}>
            <Documento s={120} tipo={d.tipo} />
          </div>
        );
      })}
      {/* carpeta de Drive */}
      {(() => {
        const v = vis(t, T.carpeta - 0.15, hasta, 0.4);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: CARP.x - 170, top: CARP.y - 170, width: 340, height: 340, opacity: v.opacity, transform: `scale(${v.scale * (1 + todo * 0.06)})` }}>
            <Carpeta s={340} abierta={abre} relleno="#E3E6EB" />
          </div>
        );
      })()}
      <Logo src={ep.logos.drive} x={CARP.x} y={CARP.y + 60} w={120} t={t} at={T.carpeta + 0.05} out={hasta} sombra={false} />
      <Etiqueta texto={ep.cta.carpeta?.texto ?? "ESQUEMAS"} x={CARP.x} y={CARP.y + 220} t={t} at={T.carpeta + 0.3} out={T.comenta + 0.2} size={36} variante="acento" />

      {/* comentario con la palabra clave */}
      {(() => {
        const v = vis(t, T.comenta - 0.1, hasta, 0.8);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: COM.x - 450, top: COM.y - 62, width: 900, height: 124, opacity: v.opacity * (1 - enviado), transform: `translateY(${v.y}px) scale(${v.scale})`, display: "flex", alignItems: "center", gap: 20, padding: "0 18px 0 26px", boxSizing: "border-box", borderRadius: 62, background: C.panel2, border: `3px solid ${nLetras > 0 ? C.acento : C.borde}` }}>
            <Comentario s={56} />
            <div style={{ flex: 1, fontFamily: MONO, fontWeight: 700, fontSize: 56, color: C.acento, letterSpacing: 3, whiteSpace: "nowrap" }}>
              {clave.slice(0, nLetras)}
              <span style={{ display: "inline-block", width: 5, height: 56, marginLeft: 4, verticalAlign: "middle", background: C.texto, opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0.1 }} />
            </div>
            <div style={{ width: 92, height: 92, borderRadius: "50%", background: nLetras === clave.length ? C.acento : C.tenue, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.15 * Math.sin(clamp01((t - T.envia + 0.1) / 0.2) * Math.PI)})` }}>
              <Enviar s={46} />
            </div>
          </div>
        );
      })()}
      {/* comentario publicado: botón con la palabra clave */}
      {t > T.envia && (
        <div style={{ position: "absolute", left: COM.x, top: COM.y, width: 0, height: 0, opacity: Math.min(1, enviado * 2) * (1 - ramp(t, hasta - 0.35, hasta)) }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * enviado})`, display: "flex", alignItems: "center", gap: 18, padding: "20px 38px", borderRadius: 999, background: C.acento, boxShadow: `0 16px 50px ${C.acento}66`, whiteSpace: "nowrap" }}>
            <Comentario s={52} c={C.oscuro} />
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 62, color: C.oscuro, letterSpacing: 3 }}>{clave}</span>
            <Check s={46} c={C.oscuro} trazo={7} p={clamp01((t - T.envia - 0.15) / 0.3)} />
          </div>
        </div>
      )}
      {/* enlace del comentario a la carpeta */}
      {enlace > 0 && (
        <>
          <div style={{ position: "absolute", left: COM.x - 3, top: CARP.y + 170 + (COM.y - 60 - CARP.y - 170) * (1 - enlace), width: 6, height: (COM.y - 60 - CARP.y - 170) * enlace, background: `repeating-linear-gradient(180deg, ${C.acento} 0 14px, transparent 14px 26px)`, opacity: 1 - ramp(t, hasta - 0.35, hasta) }} />
          <div style={{ position: "absolute", left: COM.x + 30, top: (CARP.y + 170 + COM.y - 60) / 2 - 40, width: 80, height: 80, borderRadius: "50%", background: C.panel, border: `3px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sp(t, T.enlace, { damping: 10, stiffness: 220 })})`, opacity: 1 - ramp(t, hasta - 0.35, hasta) }}>
            <Enlace s={54} c={C.acento} />
          </div>
        </>
      )}

      {/* auditoría */}
      {(() => {
        const v = vis(t, T.si - 0.15, hasta, 0.7);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: AUD.x - 420, top: AUD.y - AUD.h / 2, width: 840, height: AUD.h, borderRadius: 36, background: `linear-gradient(165deg, ${C.panel2}, ${C.panel})`, border: `3px solid ${t > T.optimizar ? C.acento : C.borde}`, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})`, boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
            <div style={{ position: "absolute", left: 40, top: 34, fontFamily: UI, fontWeight: 700, fontSize: 30, letterSpacing: 2, color: C.gris }}>{ep.cta.check?.titulo ?? "SI TIENES UN NEGOCIO"}</div>
            {/* lista de comprobación */}
            {checks.map((c, i) => {
              const p = clamp01((t - c) / 0.3);
              return (
                <div key={i} style={{ position: "absolute", left: 40, top: 100 + i * 70, display: "flex", alignItems: "center", gap: 18, opacity: ramp(t, T.si + i * 0.1, T.si + 0.3 + i * 0.1) }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, border: `3px solid ${p > 0 ? C.acento : C.borde}`, background: p > 0 ? C.acento : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {p > 0 && <Check s={36} c={C.oscuro} trazo={7} p={p} />}
                  </div>
                  <div style={{ height: 14, width: [260, 200, 240][i], borderRadius: 7, background: p > 0 ? C.texto : C.tenue }} />
                </div>
              );
            })}
            {/* gran check de auditoría */}
            {t > T.auditoria - 0.1 && (
              <div style={{ position: "absolute", right: 46, top: 50, width: 200, height: 200, borderRadius: "50%", background: C.acento, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sp(t, T.auditoria - 0.1, { damping: 10, stiffness: 200 })})`, boxShadow: `0 0 50px ${C.acento}99` }}>
                <Check s={140} c={C.oscuro} trazo={6} p={ramp(t, T.auditoria, T.auditoria + 0.35)} />
              </div>
            )}
          </div>
        );
      })()}
      {(() => {
        const v = vis(t, T.optimizar - 0.1, hasta, 0.6);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: AUD.x, top: AUD.y - AUD.h / 2 - 72, width: 0, height: 0, opacity: v.opacity }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${v.scale})`, display: "flex", alignItems: "center", gap: 16, whiteSpace: "nowrap", padding: "14px 34px 14px 22px", borderRadius: 999, background: C.acento, fontFamily: TITULO, fontWeight: 800, fontSize: 42, color: C.oscuro }}>
              <Mejora s={52} c={C.oscuro} p={ramp(t, T.optimizar, T.optimizar + 0.5)} />
              {ep.cta.check?.texto ?? "OPTIMIZAR TUS PROCESOS"}
            </div>
          </div>
        );
      })()}
    </Escena>
  );
};

export const eventosCtaDrive = (L: Linea, ep: EpisodioMaster, _b: unknown, escenas: string[]): Evento[] => {
  const T = tiempos(L, ep, escenas[0]);
  return [
    { t: T.carpeta, sfx: "pop", vol: 0.4 },
    { t: T.carpeta + 0.35, sfx: "whoosh", vol: 0.3 },
    { t: T.comenta - 0.1, sfx: "pop", vol: 0.35 },
    { t: T.clave, sfx: "tecleo", vol: 0.3, dur: Math.max(0.4, T.finClave - T.clave) },
    { t: T.envia, sfx: "envio", vol: 0.5 },
    { t: T.enlace, sfx: "pop", vol: 0.3 },
    { t: T.auditoria, sfx: "tick", vol: 0.5 },
    { t: T.optimizar, sfx: "pop", vol: 0.35 },
  ];
};
