/**
 * CTA (escenas auditoria → seguir): la pregunta palabra a palabra con la voz → la palabra clave se escribe en un
 * comentario y se envía → sello y remate → tarjeta del perfil con el botón Seguir, que se pulsa al decir «Sígueme».
 * Sirve para cualquier "cta.tipo" (auditoria, drive): todo sale del JSON.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../componentes/Escena";
import { Logo } from "../componentes/Logo";
import { Rejilla } from "../componentes/Rejilla";
import { Etiqueta, Sello } from "../componentes/Sello";
import { C, MONO, TITULO, UI, clamp01, norm, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Palabra, Toma } from "../nucleo";
import type { BloqueProps, EpisodioMaster } from "../tipos";

/** Cada palabra de un texto con el instante en que la voz la dice (a partir de `desde`, en orden). */
const sincronizar = (pal: Palabra[], escena: string, texto: string, desde = -Infinity) => {
  const ws = pal.filter((p) => p.escena === escena && p.inicio >= desde - 0.01);
  let j = 0;
  return texto.split(/\s+/).map((w) => {
    const k = ws.findIndex((p, i) => i >= j && norm(p.texto) === norm(w));
    if (k >= 0) {
      j = k + 1;
      return { w, at: ws[k].inicio };
    }
    return { w, at: ws[Math.min(j, ws.length - 1)]?.inicio ?? desde };
  });
};

const tiempos = (L: Linea, ep: EpisodioMaster, escenas: string[]) => {
  const [a, s] = [escenas[0], escenas[escenas.length - 1]];
  const clave = L.en(a, ep.cta.palabra_clave);
  const finClave = L.finDe(a, ep.cta.palabra_clave);
  const pregunta = sincronizar(L.palabras, a, ep.cta.pregunta);
  const remate = ep.cta.remate ? sincronizar(L.palabras, a, ep.cta.remate.texto.replace(/[¿?]/g, ""), L.en(a, ep.cta.remate.en)) : [];
  return {
    a, s,
    pregunta,
    comenta: pregunta[pregunta.length - 1].at + 0.45,
    clave,
    finClave,
    envia: finClave + 0.12,
    sello: ep.cta.sello ? L.en(a, ep.cta.sello.en) : finClave + 1,
    remate,
    remateAt: remate[0]?.at ?? finClave + 2,
    seguirIni: L.ini(s),
    pulsa: L.en(s, ep.cta.seguir ?? L.palabras.find((p) => p.escena === s)!.texto) + 0.45,
    fin: L.fin(s),
  };
};

export const Cta: React.FC<BloqueProps> = ({ t, ep, L, desde, escenas }) => {
  const T = tiempos(L, ep, escenas);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 880, z: 1.08 },
    { t: T.comenta - 0.4, x: 540, y: 1060, z: 1.06, d: 0.9 },
    { t: T.sello - 0.4, x: 540, y: 1240, z: 1.0, d: 0.9 },
    { t: T.remateAt - 0.2, x: 540, y: 1360, z: 1.0, d: 1.0 },
    { t: T.seguirIni - 0.35, x: 540, y: 2230, z: 0.96, d: 1.0 },
    { t: T.pulsa + 0.3, x: 540, y: 2260, z: 1.04, d: 1.6 },
  ];
  const clave = ep.cta.palabra_clave;
  const nLetras = Math.round(clamp01((t - T.clave) / Math.max(0.3, T.finClave - T.clave)) * clave.length);
  const enviado = sp(t, T.envia, { damping: 15, stiffness: 160 });
  const pulsado = t > T.pulsa;
  const hund = Math.sin(clamp01((t - T.pulsa + 0.08) / 0.2) * Math.PI) * 0.08;
  const siguiendo = ramp(t, T.pulsa + 0.05, T.pulsa + 0.25);
  // lo de arriba (pregunta, comentario, sello, remate) termina de salir justo cuando entra el perfil
  const fuera1 = T.seguirIni;
  // dos líneas para la pregunta: se corta a la mitad de palabras
  const mitad = Math.ceil(T.pregunta.length / 2);
  const remMitad = Math.ceil(T.remate.length / 2);
  return (
    <Escena t={t} tomas={tomas}>
      {/* pregunta, palabra a palabra con la voz */}
      <div style={{ position: "absolute", left: 540, top: 880, width: 0, height: 0 }}>
        <div style={{ position: "absolute", transform: "translate(-50%, -50%)", textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 92, lineHeight: 1.1, color: C.texto, whiteSpace: "nowrap", opacity: 1 - ramp(t, fuera1 - 0.35, fuera1) }}>
          {[T.pregunta.slice(0, mitad), T.pregunta.slice(mitad)].map((ln, i) => (
            <div key={i}>
              {ln.map(({ w, at }, k) => {
                const s = sp(t, at - 0.04, { damping: 13, stiffness: 220 });
                return (
                  <span key={k} style={{ display: "inline-block", marginRight: 22, opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * 40}px) scale(${0.8 + 0.2 * s})`, color: i === 1 && k === ln.length - 1 ? C.acento : C.texto }}>
                    {w}
                    {i === 1 && k === ln.length - 1 ? "…" : ""}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* comentario: se escribe la palabra clave y se envía */}
      {(() => {
        const v = vis(t, T.comenta, fuera1, 0.8);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 70, top: 1120, width: 940, height: 124, opacity: v.opacity * (1 - 0.0 * enviado), transform: `translateY(${v.y}px) scale(${v.scale})`, display: "flex", alignItems: "center", gap: 22, padding: "0 18px 0 22px", boxSizing: "border-box", borderRadius: 62, background: C.panel2, border: `3px solid ${nLetras > 0 && enviado < 0.5 ? C.acento : C.borde}` }}>
            <div style={{ width: 84, height: 84, borderRadius: "50%", background: C.tenue, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "flex-end", justifyContent: "center", position: "relative" }}>
              <div style={{ position: "absolute", top: 16, width: 30, height: 30, borderRadius: "50%", background: C.gris }} />
              <div style={{ width: 54, height: 28, borderRadius: "27px 27px 0 0", background: C.gris }} />
            </div>
            <svg width={50} height={50} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path d="M4 5.5 h16 a1.5 1.5 0 0 1 1.5 1.5 v9 a1.5 1.5 0 0 1 -1.5 1.5 h-9 l-4.5 3.5 v-3.5 h-2.5 a1.5 1.5 0 0 1 -1.5 -1.5 v-9 a1.5 1.5 0 0 1 1.5 -1.5 z" fill="none" stroke={C.gris} strokeWidth={1.8} strokeLinejoin="round" />
            </svg>
            <div style={{ flex: 1, fontFamily: MONO, fontWeight: 700, fontSize: 56, color: C.acento, letterSpacing: 3, whiteSpace: "nowrap", opacity: 1 - enviado }}>
              {clave.slice(0, nLetras)}
              {enviado < 0.2 && <span style={{ display: "inline-block", width: 5, height: 56, marginLeft: 4, verticalAlign: "middle", background: C.texto, opacity: Math.floor(t * 2.4) % 2 === 0 ? 1 : 0.1 }} />}
            </div>
            <div style={{ width: 92, height: 92, borderRadius: "50%", background: nLetras === clave.length ? C.acento : C.tenue, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - 0.15 * Math.sin(clamp01((t - T.envia + 0.1) / 0.2) * Math.PI)})` }}>
              <svg width={46} height={46} viewBox="0 0 24 24"><path d="M3 11.5 L21 3 L13.5 21 L11 13 Z" fill={C.oscuro} /></svg>
            </div>
          </div>
        );
      })()}
      {/* el comentario enviado sube como publicado */}
      {t > T.envia && (
        <div style={{ position: "absolute", left: 540, top: 1182, width: 0, height: 0, opacity: Math.min(1, enviado * 2) * (1 - ramp(t, fuera1 - 0.35, fuera1)) }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${-128 * enviado}px) scale(${0.6 + 0.4 * enviado})`, display: "flex", alignItems: "center", gap: 18, padding: "18px 34px", borderRadius: 999, background: C.acento, boxShadow: `0 16px 50px ${C.acento}66`, whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 60, color: C.oscuro, letterSpacing: 3 }}>{clave}</span>
            <svg width={44} height={44} viewBox="0 0 24 24"><path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke={C.oscuro} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={22} strokeDashoffset={22 * (1 - clamp01((t - T.envia - 0.15) / 0.3))} /></svg>
          </div>
        </div>
      )}
      {ep.cta.sello && <Sello texto={ep.cta.sello.texto} x={540} y={1360} t={t} at={T.sello} out={fuera1} size={62} rot={-4} />}
      {T.remate.length > 0 && (
        <div style={{ position: "absolute", left: 540, top: 1560, width: 0, height: 0, opacity: 1 - ramp(t, fuera1 - 0.35, fuera1) }}>
          <div style={{ position: "absolute", transform: "translate(-50%, -50%)", textAlign: "center", fontFamily: TITULO, fontWeight: 700, fontSize: 64, lineHeight: 1.15, color: C.texto, whiteSpace: "nowrap" }}>
            {[T.remate.slice(0, remMitad), T.remate.slice(remMitad)].map((ln, i) => (
              <div key={i}>
                {ln.map(({ w, at }, k) => {
                  const s = sp(t, at - 0.04, { damping: 14, stiffness: 220 });
                  const primera = i === 0 && k === 0;
                  const ultima = i === 1 && k === ln.length - 1;
                  return (
                    <span key={k} style={{ display: "inline-block", marginRight: 16, opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * 30}px)` }}>
                      {primera && ep.cta.remate!.texto.startsWith("¿") ? "¿" : ""}
                      {w.charAt(0).toUpperCase() === w.charAt(0) || !primera ? w : w.charAt(0).toUpperCase() + w.slice(1)}
                      {ultima && ep.cta.remate!.texto.endsWith("?") ? "?" : ""}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* seguir: tarjeta del perfil */}
      {(() => {
        const v = vis(t, T.seguirIni - 0.05, Infinity, 0.85);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 90, top: 1960, width: 900, height: 640, borderRadius: 44, background: C.panel, border: `3px solid ${C.borde}`, boxShadow: "0 40px 100px rgba(0,0,0,0.55)", opacity: v.opacity, transform: `scale(${v.scale})` }} />
        );
      })()}
      <Logo src={ep.logos.claude_code_texto} x={540} y={1800} w={440} t={t} at={T.seguirIni + 0.1} sombra={false} />
      {(() => {
        const v = vis(t, T.seguirIni + 0.05, Infinity, 0.6);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 540 - 85, top: 2050 - 85, width: 170, height: 170, borderRadius: "50%", background: C.fondo, border: `5px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: v.opacity, transform: `scale(${v.scale})` }}>
            <Img src={staticFile(ep.logos.claude_code)} style={{ width: 120 }} />
          </div>
        );
      })()}
      <Etiqueta texto={ep.handle} x={540} y={2200} t={t} at={T.seguirIni - 0.05} size={54} variante="texto" fuente="titulo" />
      <Etiqueta texto={ep.serie} x={540} y={2268} t={t} at={T.seguirIni + 0.05} size={34} variante="gris" />
      {(() => {
        const v = vis(t, T.seguirIni + 0.1, Infinity, 0.8);
        if (!v.on) return null;
        const g = { cx: 540, cy: 2370, celda: 24, hueco: 7, cols: 25, filas: 2 };
        return (
          <div style={{ position: "absolute", left: 0, top: 0, opacity: v.opacity }}>
            <Rejilla g={g} total={ep.total} estado={(n) => ({ opacity: 1, escala: 1, encendida: n <= ep.episodio ? 1 : 0, latido: 0, contorno: n === ep.siguiente_episodio ? 0.6 : 0, check: 0 })} />
          </div>
        );
      })()}
      {(() => {
        const v = vis(t, T.seguirIni + 0.2, Infinity, 0.7);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 540 - 200, top: 2500 - 56, width: 400, height: 112, borderRadius: 999, opacity: v.opacity, transform: `scale(${v.scale * (1 - hund)})`, background: siguiendo > 0.5 ? C.panel2 : C.acento, border: `4px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontFamily: UI, fontWeight: 700, fontSize: 48, color: siguiendo > 0.5 ? C.texto : C.oscuro, boxShadow: pulsado ? "none" : `0 0 ${30 + 20 * Math.sin(t * 6)}px ${C.acento}88` }}>
            {siguiendo > 0.5 ? (
              <>
                Siguiendo
                <svg width={40} height={40} viewBox="0 0 24 24"><path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke={C.acento} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={22} strokeDashoffset={22 * (1 - clamp01((t - T.pulsa - 0.2) / 0.3))} /></svg>
              </>
            ) : (
              "Seguir"
            )}
          </div>
        );
      })()}
      {/* toque sobre el botón */}
      {t > T.pulsa - 0.5 && t < T.pulsa + 0.6 && (
        <div style={{ position: "absolute", left: 640, top: 2520, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: `5px solid ${C.acento}`, opacity: Math.min(clamp01((t - T.pulsa + 0.5) / 0.2), 1 - clamp01((t - T.pulsa - 0.3) / 0.3)), transform: `translate(${(1 - clamp01((t - T.pulsa + 0.5) / 0.4)) * 120}px, ${(1 - clamp01((t - T.pulsa + 0.5) / 0.4)) * 90}px) scale(${1 - 0.25 * Math.sin(clamp01((t - T.pulsa) / 0.2) * Math.PI)})` }} />
      )}
    </Escena>
  );
};

export const eventosCta = (L: Linea, ep: EpisodioMaster): Evento[] => {
  const ids = ep.escenas.map((e) => e.id);
  const k = ids.indexOf(ep.bloques[ep.bloques.length - 1].desde);
  const T = tiempos(L, ep, ids.slice(k));
  return [
    { t: T.comenta, sfx: "pop", vol: 0.4 },
    { t: T.clave, sfx: "tecleo", vol: 0.3, dur: T.finClave - T.clave },
    { t: T.envia, sfx: "envio", vol: 0.5 },
    { t: T.sello + 0.12, sfx: "golpe", vol: 0.55 },
    { t: T.seguirIni - 0.3, sfx: "whoosh", vol: 0.3 },
    { t: T.pulsa, sfx: "tick", vol: 0.55 },
  ];
};
