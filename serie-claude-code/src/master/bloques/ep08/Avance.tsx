/**
 * EP.8 · Avance y despedida (escena avance): la rejilla marca el episodio de hoy como hecho y el siguiente late →
 * tarjeta «EP.N+1 · TÍTULO» (anclas en avance.en y avance.enSub del JSON; por defecto, las del EP.8) → perfil con el botón Seguir, que se pulsa al decir «Sígueme».
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Rejilla } from "../../componentes/Rejilla";
import { Etiqueta } from "../../componentes/Sello";
import { C, TITULO, UI, clamp01, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps, EpisodioMaster } from "../../tipos";

const E = "avance";
const G = { cx: 540, cy: 800, celda: 54, hueco: 12, cols: 10, filas: 5 };

/** Anclas del título y del subtítulo: las del JSON (avance.en, avance.enSub) o las del EP.8. */
const tiempos = (L: Linea, ep: EpisodioMaster) => ({
  siguiente: L.en(E, "siguiente"),
  episodio: L.en(E, "episodio,"),
  nivel: L.en(E, ep.avance?.en ?? "nivel"),
  experto: L.en(E, ep.avance?.enSub ?? "experto."),
  sigueme: L.en(E, "Sígueme"),
});

export const Avance: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tiempos(L, ep);
  const sig = ep.siguiente_episodio;
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1000, z: 1.02 },
    { t: T.episodio, x: 540, y: 1060, z: 1.0, d: 1.0 },
    { t: T.sigueme - 0.3, x: 540, y: 1130, z: 1.0, d: 1.0 },
  ];
  const pulsa = T.sigueme + 0.45;
  const hund = Math.sin(clamp01((t - pulsa + 0.08) / 0.2) * Math.PI) * 0.08;
  const siguiendo = ramp(t, pulsa + 0.05, pulsa + 0.25);
  const vPerfil = vis(t, T.sigueme - 0.15, Infinity, 0.8);
  return (
    <Escena t={t} tomas={tomas}>
      <Rejilla
        g={G}
        total={ep.total}
        estado={(n) => {
          const e = sp(t, desde - 0.25 + ((n - 1) % 10) * 0.015, { damping: 14, stiffness: 180 });
          const hecho = n === ep.episodio ? ramp(t, T.siguiente - 0.1, T.siguiente + 0.25) : 0;
          const late = n === sig && t > T.episodio - 0.1 ? 0.14 * Math.abs(Math.sin((t - T.episodio + 0.1) * 6)) : 0;
          return {
            opacity: Math.min(1, e * 2),
            escala: 0.7 + 0.3 * e,
            encendida: n <= ep.episodio ? 1 : 0,
            latido: late + (n === ep.episodio ? Math.sin(Math.min(1, hecho) * Math.PI) * 0.25 : 0),
            contorno: n === sig ? ramp(t, T.episodio - 0.1, T.episodio + 0.1) : 0,
            check: n < ep.episodio ? 1 : n === ep.episodio ? hecho : 0,
          };
        }}
      />
      <Etiqueta texto={`EP.${sig}`} x={540} y={1110} t={t} at={T.episodio} size={86} variante="texto" fuente="titulo" />
      <Etiqueta texto={ep.avance?.titulo ?? "PRÓXIMAMENTE"} x={540} y={1225} t={t} at={T.nivel - 0.05} size={58} variante="acento" fuente="titulo" />
      {ep.avance?.subtitulo && <Etiqueta texto={ep.avance.subtitulo} x={540} y={1320} t={t} at={T.experto + 0.1} size={34} variante="gris" fuente="titulo" />}
      {vPerfil.on && (
        <div style={{ position: "absolute", left: 540, top: 1470, width: 0, height: 0, opacity: vPerfil.opacity }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${vPerfil.y}px) scale(${vPerfil.scale})`, display: "flex", alignItems: "center", gap: 24, padding: "20px 22px 20px 20px", borderRadius: 999, background: C.panel, border: `3px solid ${C.borde}`, whiteSpace: "nowrap", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ width: 100, height: 100, borderRadius: "50%", background: C.fondo, border: `4px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Img src={staticFile(ep.logos.claude_code)} style={{ width: 70 }} />
            </div>
            <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 44, color: C.texto }}>{ep.handle}</div>
            <div style={{ width: 290, height: 96, borderRadius: 999, transform: `scale(${1 - hund})`, background: siguiendo > 0.5 ? C.panel2 : C.acento, border: `4px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: UI, fontWeight: 700, fontSize: 42, color: siguiendo > 0.5 ? C.texto : C.oscuro, boxShadow: t < pulsa ? `0 0 ${26 + 18 * Math.sin(t * 6)}px ${C.acento}88` : "none" }}>
              {siguiendo > 0.5 ? (
                <>
                  Siguiendo
                  <svg width={36} height={36} viewBox="0 0 24 24"><path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke={C.acento} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={22} strokeDashoffset={22 * (1 - clamp01((t - pulsa - 0.2) / 0.3))} /></svg>
                </>
              ) : (
                "Seguir"
              )}
            </div>
          </div>
        </div>
      )}
      {t > pulsa - 0.5 && t < pulsa + 0.6 && (
        <div style={{ position: "absolute", left: 790, top: 1480, width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: `5px solid ${C.acento}`, opacity: Math.min(clamp01((t - pulsa + 0.5) / 0.2), 1 - clamp01((t - pulsa - 0.3) / 0.3)), transform: `translate(${(1 - clamp01((t - pulsa + 0.5) / 0.4)) * 110}px, ${(1 - clamp01((t - pulsa + 0.5) / 0.4)) * 80}px) scale(${1 - 0.25 * Math.sin(clamp01((t - pulsa) / 0.2) * Math.PI)})` }} />
      )}
    </Escena>
  );
};

export const eventosAvance = (L: Linea, ep: EpisodioMaster): Evento[] => {
  const T = tiempos(L, ep);
  return [
    { t: T.siguiente, sfx: "tick", vol: 0.5 },
    { t: T.episodio, sfx: "pop", vol: 0.4 },
    { t: T.nivel - 0.05, sfx: "golpe", vol: 0.4 },
    { t: T.sigueme - 0.15, sfx: "whoosh", vol: 0.25 },
    { t: T.sigueme + 0.45, sfx: "tick", vol: 0.55 },
  ];
};
