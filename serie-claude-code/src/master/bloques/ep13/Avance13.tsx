/**
 * EP.13 · Avance y despedida (escena avance): la cuadrícula de 50 con el módulo 1 completo (1–13 con ✓) y la casilla 14
 * latiendo → EP.14 · MÓDULO 2 → la opción ganadora (WEB · AUTOMATIZAR · MEDIDA, con «?») → perfil con el logo de
 * AIgencyx y el botón Seguir, que se pulsa al decir «Sígueme». Basado en el avance del EP.12.
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Rejilla, olaEntrada } from "../../componentes/Rejilla";
import type { RejillaGeo } from "../../componentes/Rejilla";
import { Etiqueta } from "../../componentes/Sello";
import { Caja } from "../../componentes/ep12/Piezas12";
import { C, TITULO, UI, clamp01, ramp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps } from "../../tipos";

const E = "avance";
const G: RejillaGeo = { cx: 540, cy: 840, celda: 52, hueco: 12, cols: 10, filas: 5 };

const tiempos = (L: Linea) => ({
  siguiente: L.en(E, "siguiente"),
  episodio: L.en(E, "episodio,"),
  modulo: L.en(E, "módulo"),
  opcion: L.en(E, "opción"),
  ganadora: L.en(E, "ganadora."),
  sigueme: L.en(E, "Sígueme"),
});

export const Avance13: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tiempos(L);
  const sig = ep.siguiente_episodio;
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1040, z: 1.02 },
    { t: T.episodio, x: 540, y: 1080, z: 1.0, d: 1.0 },
    { t: T.sigueme - 0.3, x: 540, y: 1130, z: 1.0, d: 1.0 },
  ];
  const pulsa = T.sigueme + 0.45;
  const hund = Math.sin(clamp01((t - pulsa + 0.08) / 0.2) * Math.PI) * 0.08;
  const siguiendo = ramp(t, pulsa + 0.05, pulsa + 0.25);
  const vPerfil = vis(t, T.sigueme - 0.15, Infinity, 0.8);
  const entra = desde - 0.4;
  return (
    <Escena t={t} tomas={tomas}>
      <Rejilla
        g={G}
        total={ep.total}
        estado={(n) => {
          const o = olaEntrada(t, entra, G, n);
          const hecho = n <= ep.episodio;
          const prox = n === sig;
          const late = prox && t > T.siguiente ? Math.max(0, Math.sin((t - T.siguiente) * 6.5)) * 0.14 : 0;
          return {
            opacity: o.opacity * (hecho || prox ? 1 : 0.55), escala: 0.6 + 0.4 * o.s, encendida: hecho ? 1 : 0, latido: late,
            contorno: prox ? clamp01((t - T.siguiente) / 0.3) : 0, check: hecho ? clamp01((t - entra - 0.4 - n * 0.025) / 0.3) : 0,
          };
        }}
      />
      <Etiqueta texto="MÓDULO 1 ✓" x={330} y={G.cy - 205} t={t} at={entra + 0.3} size={30} variante="acento" fuente="titulo" />
      <Etiqueta texto={`EP.${sig}`} x={540} y={1110} t={t} at={T.episodio} size={86} variante="texto" fuente="titulo" />
      <Etiqueta texto={ep.avance?.titulo ?? "PRÓXIMAMENTE"} x={540} y={1225} t={t} at={T.modulo - 0.05} size={58} variante="acento" fuente="titulo" />
      {ep.avance?.subtitulo && <Etiqueta texto={ep.avance.subtitulo} x={540} y={1318} t={t} at={T.opcion} out={T.sigueme - 0.2} size={36} variante="gris" fuente="titulo" />}
      {["WEB", "AUTOMATIZAR", "MEDIDA"].map((o, i) => (
        <Caja key={o} x={[215, 520, 845][i]} y={1405} t={t} at={T.ganadora - 0.1 + i * 0.12} out={T.sigueme - 0.2}>
          <div style={{ padding: "10px 24px", borderRadius: 999, border: `3px solid ${C.acento}`, background: "rgba(20,24,33,0.92)", fontFamily: UI, fontWeight: 700, fontSize: 30, color: C.texto }}>
            {o} <span style={{ color: C.acento }}>?</span>
          </div>
        </Caja>
      ))}
      {vPerfil.on && (
        <div style={{ position: "absolute", left: 540, top: 1470, width: 0, height: 0, opacity: vPerfil.opacity }}>
          <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${vPerfil.y}px) scale(${vPerfil.scale})`, display: "flex", alignItems: "center", gap: 24, padding: "20px 22px 20px 20px", borderRadius: 999, background: C.panel, border: `3px solid ${C.borde}`, whiteSpace: "nowrap", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
            <Img src={staticFile(ep.logos.aigencyx)} style={{ width: 104, height: 104, display: "block" }} />
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

export const eventosAvance13 = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.siguiente, sfx: "tick", vol: 0.5 },
    { t: T.episodio, sfx: "pop", vol: 0.4 },
    { t: T.modulo - 0.05, sfx: "golpe", vol: 0.4 },
    { t: T.ganadora - 0.1, sfx: "pop", vol: 0.35 },
    { t: T.sigueme - 0.15, sfx: "whoosh", vol: 0.25 },
    { t: T.sigueme + 0.45, sfx: "tick", vol: 0.55 },
  ];
};
