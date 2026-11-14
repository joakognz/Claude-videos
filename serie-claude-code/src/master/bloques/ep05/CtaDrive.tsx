/**
 * EP.5 · bloque «CTA» (escena auditoria): ¿Quieres los esquemas de este episodio? (palabra a palabra) → carpeta de
 * Drive con los esquemas → la palabra clave se escribe en un comentario y se envía → «te paso el enlace» →
 * ¿tienes un negocio? → sello AUDITORÍA DE PROCESOS → procesos que se optimizan (flechas que aceleran).
 */
import React from "react";
import { Escena } from "../../componentes/Escena";
import { Flecha } from "../../componentes/Flecha";
import { Etiqueta, Sello } from "../../componentes/Sello";
import { C, MONO, TITULO, UI, clamp01, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea as LineaT, Toma } from "../../nucleo";
import type { BloqueProps, EpisodioMaster } from "../../tipos";
import { Chip, FichaFija, Frase, Medalla, Picto, Pop } from "../../ep05/kit";

const ID = "auditoria";
const COM_Y = 1300;

const tiempos = (L: LineaT, ep: EpisodioMaster) => {
  const clave = L.en(ID, ep.cta.palabra_clave);
  const finClave = L.finDe(ID, ep.cta.palabra_clave);
  return {
    quieres: L.ini(ID),
    los: L.en(ID, "los"),
    esquemas: L.en(ID, "esquemas"),
    de: L.en(ID, "de"),
    este: L.en(ID, "este"),
    episodio: L.en(ID, "episodio"),
    comenta: L.en(ID, "Comenta"),
    clave,
    finClave,
    envia: finClave + 0.1,
    paso: L.en(ID, "paso"),
    enlace: L.en(ID, "enlace"),
    y: L.en(ID, "Y", 1),
    si: L.en(ID, "si"),
    negocio: L.en(ID, "negocio"),
    preparamos: L.en(ID, "preparamos"),
    auditoria: L.en(ID, "auditoría", 1),
    optimizar: L.en(ID, "optimizar"),
    procesos: L.en(ID, "procesos"),
  };
};

export const CtaDrive: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L, ep);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 880, z: 1.06 },
    { t: T.esquemas - 0.1, x: 540, y: 950, z: 1.04, d: 0.8 },
    { t: T.comenta - 0.2, x: 540, y: 1180, z: 1.04, d: 0.8 },
    { t: T.enlace - 0.2, x: 540, y: 1240, z: 1.0, d: 0.8 },
    { t: T.y - 0.3, x: 540, y: 2200, z: 1.04, d: 0.9 },
    { t: T.auditoria - 0.2, x: 540, y: 2360, z: 1.02, d: 0.8 },
    { t: T.optimizar - 0.15, x: 540, y: 2500, z: 1.03, d: 0.8 },
  ];
  const fueraA = T.y;
  const clave = ep.cta.palabra_clave;
  const nLetras = Math.round(clamp01((t - T.clave) / Math.max(0.3, T.finClave - T.clave)) * clave.length);
  const enviado = sp(t, T.envia, { damping: 15, stiffness: 160 });
  const flujo = ramp(t, T.optimizar, T.procesos + 0.3);
  return (
    <Escena t={t} tomas={tomas}>
      <div style={{ position: "absolute", left: 540, top: 690, width: 0, height: 0 }}>
        <div style={{ position: "absolute", transform: "translate(-50%, -50%)" }}>
          <Frase t={t} out={T.enlace - 0.2} size={74} palabras={[{ w: "¿Quieres", at: T.quieres }, { w: "los", at: T.los }, { w: "esquemas", at: T.esquemas, acento: true }]} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 540, top: 780, width: 0, height: 0 }}>
        <div style={{ position: "absolute", transform: "translate(-50%, -50%)" }}>
          <Frase t={t} out={T.enlace - 0.2} size={74} palabras={[{ w: "de", at: T.de }, { w: "este", at: T.este }, { w: "episodio?", at: T.episodio }]} />
        </div>
      </div>
      {/* carpeta de Drive con los esquemas */}
      {(() => {
        const v = vis(t, T.esquemas - 0.05, fueraA, 0.7);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 540, top: 1030, width: 0, height: 0 }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y}px) scale(${v.scale})`, opacity: v.opacity, width: 860, boxSizing: "border-box", padding: "26px 34px", borderRadius: 32, background: C.panel, border: `3px solid ${C.borde}`, boxShadow: "0 30px 80px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", gap: 30 }}>
              <FichaFija src={ep.logos.drive} h={110} blanca={false} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 44, color: C.texto }}>Esquemas del EP.{ep.episodio}</div>
                <div style={{ display: "flex", gap: 14, marginTop: 14 }}>
                  {[0, 1, 2].map((k) => {
                    const s = sp(t, T.esquemas + 0.2 + k * 0.12, { damping: 13, stiffness: 200 });
                    return (
                      <div key={k} style={{ width: 150, height: 92, borderRadius: 12, background: "#FFFFFF", padding: 10, boxSizing: "border-box", transform: `scale(${Math.min(1, s)})`, display: "flex", alignItems: "center", justifyContent: "space-around" }}>
                        {[0, 1, 2].map((j) => (
                          <div key={j} style={{ width: 30, height: 22 + ((j + k) % 2) * 14, borderRadius: 5, border: `3px solid ${j === k ? C.acento : "#9AA3B5"}` }} />
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {/* comentario: se escribe la palabra clave y se envía */}
      {(() => {
        const v = vis(t, T.comenta - 0.05, fueraA, 0.8);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 70, top: COM_Y - 62, width: 940, height: 124, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})`, display: "flex", alignItems: "center", gap: 22, padding: "0 18px 0 22px", boxSizing: "border-box", borderRadius: 62, background: C.panel2, border: `3px solid ${nLetras > 0 && enviado < 0.5 ? C.acento : C.borde}` }}>
            <svg width={50} height={50} viewBox="0 0 24 24" style={{ flexShrink: 0, marginLeft: 10 }}>
              <path d="M4 5.5 h16 a1.5 1.5 0 0 1 1.5 1.5 v9 a1.5 1.5 0 0 1 -1.5 1.5 h-9 l-4.5 3.5 v-3.5 h-2.5 a1.5 1.5 0 0 1 -1.5 -1.5 v-9 a1.5 1.5 0 0 1 1.5 -1.5 z" fill="none" stroke={C.gris} strokeWidth={1.8} strokeLinejoin="round" />
            </svg>
            <div style={{ flex: 1, fontFamily: MONO, fontWeight: 700, fontSize: 56, color: C.acento, letterSpacing: 3, whiteSpace: "nowrap", opacity: 1 - enviado }}>
              {nLetras > 0 ? clave.slice(0, nLetras) : <span style={{ fontFamily: UI, fontWeight: 600, fontSize: 40, color: C.gris, letterSpacing: 0 }}>Añade un comentario…</span>}
              {enviado < 0.2 && <span style={{ display: "inline-block", width: 5, height: 56, marginLeft: 4, verticalAlign: "middle", background: C.texto, opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0.1 }} />}
            </div>
            <div style={{ width: 92, height: 92, borderRadius: "50%", background: nLetras === clave.length ? C.acento : C.tenue, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.15 * Math.sin(clamp01((t - T.envia + 0.1) / 0.2) * Math.PI)})` }}>
              <svg width={46} height={46} viewBox="0 0 24 24"><path d="M3 11.5 L21 3 L13.5 21 L11 13 Z" fill={C.oscuro} /></svg>
            </div>
          </div>
        );
      })()}
      {t > T.envia && (
        <div style={{ position: "absolute", left: 540, top: COM_Y, width: 0, height: 0, opacity: Math.min(1, enviado * 2) * (1 - ramp(t, fueraA - 0.35, fueraA)) }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${-118 * enviado}px) scale(${0.6 + 0.4 * enviado})`, display: "flex", alignItems: "center", gap: 18, padding: "16px 34px", borderRadius: 999, background: C.acento, boxShadow: `0 16px 50px ${C.acento}66`, whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 58, color: C.oscuro, letterSpacing: 3 }}>{clave}</span>
            <Picto nombre="check" size={44} color={C.oscuro} grosor={3.4} dibujo={clamp01((t - T.envia - 0.15) / 0.3)} />
          </div>
        </div>
      )}
      <Pop x={540} y={COM_Y + 175} t={t} at={T.enlace - 0.05} out={fueraA} rot={-6} latidos={[T.enlace + 0.5]}>
        <Chip icono={<Picto nombre="enlace" size={50} color={C.oscuro} grosor={2.6} />} texto="Te paso el enlace con todo" size={44} variante="acento" />
      </Pop>

      {/* ── ¿tienes un negocio? ── */}
      <Etiqueta texto="¿TIENES UN NEGOCIO?" x={540} y={1985} t={t} at={T.si - 0.05} out={hasta + 0.4} size={44} variante="borde" fuente="titulo" />
      <Pop x={540} y={2190} t={t} at={T.negocio - 0.05} out={hasta + 0.4} rot={-10}>
        <Medalla nombre="tienda" size={210} />
      </Pop>
      <Sello texto="AUDITORÍA DE PROCESOS" x={540} y={2420} t={t} at={T.auditoria} out={hasta + 0.4} size={58} rot={-3} />
      {[220, 540, 860].map((x, i) => (
        <Pop key={x} x={x} y={2630} t={t} at={T.preparamos + 0.15 + i * 0.12} out={hasta + 0.4}>
          <div style={{ transform: `rotate(${flujo * 360 * (i % 2 ? -1 : 1)}deg)` }}>
            <Medalla nombre="engranaje" size={124} activo={flujo > 0.1 ? 1 : 0} />
          </div>
        </Pop>
      ))}
      {[0, 1].map((i) => (
        <Flecha key={i} curva={{ a: { x: 300 + i * 320, y: 2630 }, c: { x: 380 + i * 320, y: 2590 }, b: { x: 460 + i * 320, y: 2630 } }} p={ramp(t, T.optimizar - 0.05 + i * 0.15, T.optimizar + 0.35 + i * 0.15)} ancho={8} />
      ))}
      {[220, 540, 860].map((x, i) => (
        <Pop key={`r${x}`} x={x + 52} y={2580} t={t} at={T.procesos - 0.05 + i * 0.08} out={hasta + 0.4}>
          <Picto nombre="rayo" size={52} color={C.acentoSuave} grosor={2.2} />
        </Pop>
      ))}
      <Etiqueta texto="OPTIMIZA TUS PROCESOS" x={540} y={2790} t={t} at={T.procesos} out={hasta + 0.4} size={40} variante="acento" fuente="titulo" />
    </Escena>
  );
};

export const eventosCtaDrive = (L: LineaT, ep: EpisodioMaster): Evento[] => {
  const T = tiempos(L, ep);
  return [
    { t: T.esquemas, sfx: "pop", vol: 0.4 },
    { t: T.comenta, sfx: "pop", vol: 0.35 },
    { t: T.clave, sfx: "tecleo", vol: 0.3, dur: T.finClave - T.clave },
    { t: T.envia, sfx: "envio", vol: 0.5 },
    { t: T.enlace, sfx: "pop", vol: 0.4 },
    { t: T.negocio, sfx: "pop", vol: 0.35 },
    { t: T.auditoria + 0.1, sfx: "golpe", vol: 0.55 },
    { t: T.procesos, sfx: "tick", vol: 0.5 },
  ];
};
