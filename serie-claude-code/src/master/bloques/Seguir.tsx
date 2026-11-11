/**
 * Seguir (última escena): tarjeta del perfil con la mascota, el usuario, la serie y la rejilla de episodios; la frase de
 * cierre del JSON y el botón «Seguir», que se pulsa al decir la palabra de `cta.seguir` y pasa a «Siguiendo ✓».
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../componentes/Escena";
import { Check, Cursor } from "../componentes/Iconos";
import { Logo } from "../componentes/Logo";
import { Rejilla } from "../componentes/Rejilla";
import { Etiqueta } from "../componentes/Sello";
import { C, TITULO, UI, clamp01, ramp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps, EpisodioMaster } from "../tipos";

const tiempos = (L: Linea, ep: EpisodioMaster, e: string) => {
  const ini = L.ini(e);
  return { ini, pulsa: L.en(e, ep.cta.seguir ?? L.palabras.find((p) => p.escena === e)!.texto) + 0.45, fin: L.fin(e) };
};

const CARD = { x: 540, y: 1180, w: 880, h: 900 };

export const Seguir: React.FC<BloqueProps> = ({ t, ep, L, desde, escenas }) => {
  const T = tiempos(L, ep, escenas[0]);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1170, z: 0.94 },
    { t: T.pulsa - 0.4, x: 540, y: 1210, z: 1.0, d: 0.9 },
  ];
  const pulsado = t > T.pulsa;
  const hund = Math.sin(clamp01((t - T.pulsa + 0.08) / 0.2) * Math.PI) * 0.08;
  const siguiendo = ramp(t, T.pulsa + 0.05, T.pulsa + 0.25);
  const top = CARD.y - CARD.h / 2;
  // último reel del episodio: su casilla ya está completa y late la del siguiente
  const completo = !ep.parte || ep.parte.n === ep.parte.de;
  // frase de cierre: en dos líneas si no cabe en una
  const lineas = (() => {
    const txt = ep.cierre ?? "";
    if (txt.length <= 30) return [txt];
    const w = txt.split(" ");
    const k = Math.ceil(w.length / 2);
    return [w.slice(0, k).join(" "), w.slice(k).join(" ")];
  })();
  const larga = lineas.length > 1;
  return (
    <Escena t={t} tomas={tomas}>
      {(() => {
        const v = vis(t, desde - 0.1, Infinity, 0.85);
        if (!v.on) return null;
        return <div style={{ position: "absolute", left: CARD.x - CARD.w / 2, top, width: CARD.w, height: CARD.h, borderRadius: 48, background: `linear-gradient(170deg, ${C.panel2}, ${C.panel})`, border: `3px solid ${C.borde}`, boxShadow: "0 40px 100px rgba(0,0,0,0.55)", opacity: v.opacity, transform: `scale(${v.scale})` }} />;
      })()}
      <Logo src={ep.logos.claude_code_texto} x={540} y={top + 105} w={290} t={t} at={desde} sombra={false} />
      {(() => {
        const v = vis(t, desde + 0.05, Infinity, 0.6);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 540 - 90, top: top + 300 - 90, width: 180, height: 180, borderRadius: "50%", background: C.fondo, border: `6px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: v.opacity, transform: `scale(${v.scale})`, boxShadow: `0 0 40px ${C.acento}55` }}>
            <Img src={staticFile(ep.logos.claude_code)} style={{ width: 128 }} />
          </div>
        );
      })()}
      <Etiqueta texto={ep.handle} x={540} y={top + 448} t={t} at={desde + 0.05} size={56} variante="texto" fuente="titulo" />
      <Etiqueta texto={ep.serie} x={540} y={top + 510} t={t} at={desde + 0.12} size={34} variante="gris" />
      {(() => {
        const v = vis(t, desde + 0.15, Infinity, 0.8);
        if (!v.on) return null;
        const g = { cx: 540, cy: top + 595, celda: 26, hueco: 7, cols: 25, filas: 2 };
        return (
          <div style={{ position: "absolute", left: 0, top: 0, opacity: v.opacity }}>
            <Rejilla g={g} total={ep.total} estado={(n) => ({ opacity: 1, escala: 1, encendida: n < ep.episodio || (completo && n === ep.episodio) ? 1 : n === ep.episodio ? 0.5 + 0.5 * Math.max(0, Math.sin(t * 4)) : 0, latido: 0, contorno: completo && n === ep.siguiente_episodio ? 0.5 + 0.5 * Math.max(0, Math.sin(t * 4)) : 0, check: 0 })} />
          </div>
        );
      })()}
      {/* frase de cierre */}
      {ep.cierre && (() => {
        const v = vis(t, desde + 0.2, Infinity, 0.8);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 540, top: top + (larga ? 698 : 700), width: 0, height: 0, opacity: v.opacity }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${v.scale})`, whiteSpace: "nowrap", textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: larga ? 48 : 52, lineHeight: 1.1, color: C.texto }}>
              {lineas.map((ln, i) => (
                <div key={i}>{ln}</div>
              ))}
            </div>
          </div>
        );
      })()}
      {/* botón seguir */}
      {(() => {
        const v = vis(t, desde + 0.25, Infinity, 0.7);
        if (!v.on) return null;
        return (
          <div style={{ position: "absolute", left: 540 - 220, top: top + (larga ? 835 : 815) - 60, width: 440, height: 120, borderRadius: 999, opacity: v.opacity, transform: `scale(${v.scale * (1 - hund)})`, background: siguiendo > 0.5 ? C.panel2 : C.acento, border: `4px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontFamily: UI, fontWeight: 700, fontSize: 52, color: siguiendo > 0.5 ? C.texto : C.oscuro, boxShadow: pulsado ? "none" : `0 0 ${30 + 20 * Math.sin(t * 6)}px ${C.acento}88` }}>
            {siguiendo > 0.5 ? (
              <>
                Siguiendo
                <Check s={46} c={C.acento} trazo={6} p={clamp01((t - T.pulsa - 0.2) / 0.3)} />
              </>
            ) : (
              "Seguir"
            )}
          </div>
        );
      })()}
      {t > T.pulsa - 0.55 && t < T.pulsa + 0.7 && (
        <div style={{ position: "absolute", left: 640 + (1 - ramp(t, T.pulsa - 0.55, T.pulsa - 0.05)) * 140, top: top + (larga ? 825 : 805) + (1 - ramp(t, T.pulsa - 0.55, T.pulsa - 0.05)) * 110, opacity: ramp(t, T.pulsa - 0.55, T.pulsa - 0.35) * (1 - ramp(t, T.pulsa + 0.35, T.pulsa + 0.7)), transform: `scale(${1 - 0.15 * Math.sin(clamp01((t - T.pulsa) / 0.2) * Math.PI)})` }}>
          <Cursor s={80} />
        </div>
      )}
      {/* destello al seguir */}
      {t > T.pulsa && t < T.pulsa + 0.8 && (
        <div style={{ position: "absolute", left: 540 - 260 * (1 + ramp(t, T.pulsa, T.pulsa + 0.8)), top: top + (larga ? 835 : 815) - 70 * (1 + ramp(t, T.pulsa, T.pulsa + 0.8)), width: 520 * (1 + ramp(t, T.pulsa, T.pulsa + 0.8)), height: 140 * (1 + ramp(t, T.pulsa, T.pulsa + 0.8)), borderRadius: 999, border: `4px solid ${C.acento}`, opacity: 1 - ramp(t, T.pulsa, T.pulsa + 0.8) }} />
      )}
    </Escena>
  );
};

export const eventosSeguir = (L: Linea, ep: EpisodioMaster, _b: unknown, escenas: string[]): Evento[] => {
  const T = tiempos(L, ep, escenas[0]);
  return [
    { t: T.ini - 0.1, sfx: "pop", vol: 0.35 },
    { t: T.pulsa, sfx: "tick", vol: 0.6 },
  ];
};
