/**
 * CTA con recurso: la carpeta de Drive se abre llena de documentos y esquemas; la palabra clave se escribe en un
 * comentario y se envía; después aparece el check de la auditoría. Todo anclado a la voz.
 */
import React from "react";
import { Carpeta3D } from "../componentes/Carpeta3D";
import { Escena } from "../componentes/Escena";
import { IconCheck, IconMotor } from "../componentes/Iconos";
import { Logo } from "../componentes/Logo";
import { Sello } from "../componentes/Sello";
import { C, EASE_OUT, MONO, TITULO, clamp01, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps, EpisodioMaster } from "../tipos";

const ID = "cta";
const tiempos = (L: Linea, ep: EpisodioMaster) => {
  const p = L.palabras.filter((w) => w.escena === ID);
  return {
    q: p.filter((w) => w.inicio < L.en(ID, "esquemas")),
    esquemas: L.en(ID, "esquemas"),
    episodio: L.en(ID, "episodio"),
    finEpisodio: L.finDe(ID, "episodio"),
    comenta: L.en(ID, "Comenta"),
    clave: L.en(ID, ep.cta.palabra_clave),
    finClave: L.finDe(ID, ep.cta.palabra_clave),
    enlace: L.en(ID, "enlace"),
    todo: L.en(ID, "todo"),
    negocio: L.en(ID, "negocio"),
    audit: L.en(ID, "auditoría", 1),
    optimizar: L.en(ID, "optimizar"),
    procesos: L.en(ID, "procesos"),
    fin: L.fin(ID),
  };
};

export const CtaDrive: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L, ep);
  const clave = ep.cta.palabra_clave;
  const out = hasta + 0.3;
  const cambio = T.negocio - 0.1; // la carpeta deja paso al check
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1080, z: 0.95 },
    { t: T.esquemas - 0.2, x: 540, y: 1060, z: 1.12, d: 1.0 },
    { t: T.comenta - 0.3, x: 540, y: 1300, z: 1.05, d: 0.9 },
    { t: T.enlace - 0.2, x: 540, y: 1160, z: 1.14, d: 0.9 },
    { t: cambio - 0.2, x: 540, y: 1100, z: 0.9, d: 0.7 },
    { t: T.audit - 0.3, x: 540, y: 1180, z: 1.05, d: 1.0 },
  ];
  const abre = ramp(t, T.esquemas, T.esquemas + 0.9, EASE_OUT);
  const hojas = ramp(t, T.esquemas + 0.4, T.esquemas + 1.9, EASE_OUT);
  const fuera = ramp(t, cambio - 0.3, cambio + 0.1);
  const n = Math.round(clamp01((t - T.clave) / Math.max(0.3, T.finClave - T.clave)) * clave.length);
  const envia = sp(t, T.finClave + 0.1, { damping: 15, stiffness: 160 });
  const pulso = Math.sin(clamp01((t - T.enlace) / 0.8) * Math.PI) * 0.06;
  const ver = vis(t, T.audit - 0.15, out, 0.4);
  const chk = ramp(t, T.audit + 0.1, T.audit + 0.55);
  return (
    <Escena t={t} tomas={tomas}>
      {/* pregunta */}
      <div style={{ position: "absolute", left: 540, top: 760, width: 0, height: 0, opacity: 1 - ramp(t, T.comenta - 0.45, T.comenta - 0.1) }}>
        <div style={{ position: "absolute", transform: "translate(-50%, -50%)", textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 70, lineHeight: 1.1, color: C.texto, whiteSpace: "nowrap" }}>
          {ep.cta.pregunta.split(" ").map((w, k, arr) => {
            const pal = L.palabras.filter((x) => x.escena === ID);
            const real = pal.find((x, i) => i >= k && Math.abs(i - k) < 2 && x.texto.length > 0);
            const at = (real ?? pal[Math.min(k, pal.length - 1)]).inicio;
            const s = sp(t, at - 0.04, { damping: 13, stiffness: 220 });
            return (
              <React.Fragment key={k}>
                <span style={{ display: "inline-block", marginRight: 16, opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * 36}px)`, color: w.includes("esquemas") ? C.acento : C.texto }}>{w}</span>
                {k === 2 && <br />}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      {/* carpeta de Drive */}
      {t > T.esquemas - 0.5 && (
        <div style={{ position: "absolute", left: 540, top: 1120, width: 0, height: 0, opacity: (1 - fuera) * Math.min(1, sp(t, T.esquemas - 0.4) * 2) }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${(0.4 + 0.6 * sp(t, T.esquemas - 0.4, { damping: 12, stiffness: 130 })) * (1 + pulso) * (1 - 0.35 * fuera)})` }}>
            <Carpeta3D w={560} abre={abre} hojas={hojas} n={5} logo={ep.cta.recurso} conEsquemas t={t} />
          </div>
        </div>
      )}
      {/* logo de Drive sobre la carpeta */}
      <Logo src={ep.cta.recurso ?? ep.logos.drive} x={540} y={1330} w={150} t={t} at={T.esquemas - 0.2} out={cambio} />
      {/* comentario con la palabra clave */}
      {(() => {
        const v = vis(t, T.comenta - 0.1, cambio, 0.8);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 90, top: 1450, width: 900, height: 124, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})`, display: "flex", alignItems: "center", gap: 22, padding: "0 18px 0 30px", boxSizing: "border-box", borderRadius: 62, background: C.panel2, border: `3px solid ${n > 0 && envia < 0.5 ? C.acento : C.borde}` }}>
            <div style={{ flex: 1, fontFamily: MONO, fontWeight: 700, fontSize: 56, color: C.acento, letterSpacing: 3, whiteSpace: "nowrap" }}>
              {envia < 0.4 ? clave.slice(0, n) : clave}
              {envia < 0.2 && <span style={{ display: "inline-block", width: 5, height: 56, marginLeft: 4, verticalAlign: "middle", background: C.texto, opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0.1 }} />}
            </div>
            <div style={{ width: 92, height: 92, borderRadius: "50%", background: n === clave.length ? C.acento : C.tenue, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.15 * Math.sin(clamp01((t - T.finClave) / 0.25) * Math.PI)})` }}>
              <svg width={46} height={46} viewBox="0 0 24 24"><path d="M3 11.5 L21 3 L13.5 21 L11 13 Z" fill={C.oscuro} /></svg>
            </div>
          </div>
        );
      })()}
      <Sello texto="ENLACE CON TODO" x={540} y={1650} t={t} at={T.enlace} out={cambio} size={44} rot={-3} />
      {/* check de la auditoría */}
      {ver.on && (
        <>
          <div style={{ position: "absolute", left: 540 - 175, top: 1000 - 175, width: 350, height: 350, borderRadius: "50%", background: `color-mix(in srgb, ${C.acento} ${Math.round(chk * 100)}%, ${C.panel2})`, border: `6px solid ${C.acento}`, opacity: ver.opacity, transform: `scale(${ver.scale})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${80 * chk}px ${C.acento}88` }}>
            <IconCheck s={210} color={C.oscuro} p={chk} />
          </div>
          <div style={{ position: "absolute", left: 540, top: 1290, width: 0, height: 0, opacity: ver.opacity }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${ver.scale})`, fontFamily: TITULO, fontWeight: 800, fontSize: 104, color: C.texto, letterSpacing: -2 }}>AUDITORÍA</div>
          </div>
          {(() => {
            const v = vis(t, T.optimizar - 0.1, out, 0.6);
            return v.on ? (
              <div style={{ position: "absolute", left: 540, top: 1440, width: 0, height: 0, opacity: v.opacity }}>
                <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y}px) scale(${v.scale})`, display: "flex", alignItems: "center", gap: 20, background: C.panel2, border: `3px solid ${C.acento}`, borderRadius: 999, padding: "14px 36px", whiteSpace: "nowrap" }}>
                  <IconMotor s={64} color={C.acento} giro={(t - T.optimizar) * 70} />
                  <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 50, color: C.texto }}>OPTIMIZAR TUS PROCESOS</div>
                </div>
              </div>
            ) : null;
          })()}
        </>
      )}
    </Escena>
  );
};

export const eventosCtaDrive = (L: Linea, ep: EpisodioMaster): Evento[] => {
  const T = tiempos(L, ep);
  return [
    { t: T.esquemas, sfx: "whoosh", vol: 0.35 },
    { t: T.esquemas + 0.5, sfx: "pop", vol: 0.4 },
    { t: T.clave, sfx: "tecleo", vol: 0.3, dur: T.finClave - T.clave },
    { t: T.finClave + 0.1, sfx: "envio", vol: 0.5 },
    { t: T.enlace, sfx: "golpe", vol: 0.45 },
    { t: T.audit + 0.1, sfx: "tick", vol: 0.55 },
    { t: T.optimizar, sfx: "pop", vol: 0.4 },
  ];
};
