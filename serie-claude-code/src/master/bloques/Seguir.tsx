/** Última escena: la frase de cierre y el botón de seguir, que se pulsa al decir «Sígueme». */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../componentes/Escena";
import { Logo } from "../componentes/Logo";
import { GEO_REJILLA, Rejilla } from "../componentes/Rejilla";
import { Etiqueta } from "../componentes/Sello";
import { C, TITULO, UI, clamp01, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps, EpisodioMaster } from "../tipos";

const ID = "seguir";
const tiempos = (L: Linea, ep: EpisodioMaster) => ({
  ini: L.ini(ID),
  pulsa: L.en(ID, ep.cta.seguir ?? "Sígueme") + 0.4,
  fin: L.fin(ID),
});

export const Seguir: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tiempos(L, ep);
  const frase = (ep.avance?.cierre ?? "").replace(/[.]/g, "").split(" ");
  const pal = L.palabras.filter((p) => p.escena === ID);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1180, z: 0.97 },
    { t: T.pulsa - 0.3, x: 540, y: 1180, z: 1.0, d: 1.0 },
  ];
  const a = desde + 0.05;
  const pulsado = t > T.pulsa;
  const hund = Math.sin(clamp01((t - T.pulsa + 0.08) / 0.2) * Math.PI) * 0.08;
  const siguiendo = ramp(t, T.pulsa + 0.05, T.pulsa + 0.25);
  const card = vis(t, a, Infinity, 0.85);
  const g = { ...GEO_REJILLA, cx: 540, cy: 1415, celda: 24, hueco: 7, cols: 25, filas: 2 };
  return (
    <Escena t={t} tomas={tomas}>
      {/* frase de cierre, palabra a palabra con la voz */}
      <div style={{ position: "absolute", left: 540, top: 745, width: 0, height: 0 }}>
        <div style={{ position: "absolute", transform: "translate(-50%, -50%)", textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 92, lineHeight: 1.12, color: C.texto, whiteSpace: "nowrap" }}>
          {[frase.slice(0, 2), frase.slice(2)].map((ln, i) => (
            <div key={i}>
              {ln.map((w, k) => {
                const idx = i === 0 ? k : 2 + k;
                const at = (pal[Math.min(idx, pal.length - 1)]?.inicio ?? T.ini) - 0.04;
                const s = sp(t, at, { damping: 13, stiffness: 220 });
                return (
                  <span key={k} style={{ display: "inline-block", marginRight: 22, opacity: Math.min(1, s * 1.6), transform: `translateY(${(1 - s) * 40}px) scale(${0.8 + 0.2 * s})`, color: idx === frase.length - 1 ? C.acento : C.texto }}>
                    {w}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {card.on && (
        <div style={{ position: "absolute", left: 90, top: 905, width: 900, height: 700, borderRadius: 44, background: C.panel, border: `3px solid ${C.borde}`, boxShadow: "0 40px 100px rgba(0,0,0,0.55)", opacity: card.opacity, transform: `scale(${card.scale})` }} />
      )}
      <Logo src={ep.logos.claude_code_texto} x={540} y={1025} w={360} t={t} at={a + 0.08} sombra={false} />
      {(() => {
        const v = vis(t, a + 0.05, Infinity, 0.6);
        return v.on ? (
          <div style={{ position: "absolute", left: 540 - 62, top: 1205 - 62, width: 124, height: 124, borderRadius: "50%", background: C.fondo, border: `5px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: v.opacity, transform: `scale(${v.scale})` }}>
            <Img src={staticFile(ep.logos.claude_code)} style={{ width: 86 }} />
          </div>
        ) : null;
      })()}
      <Etiqueta texto={ep.handle} x={540} y={1308} t={t} at={a + 0.1} size={46} variante="texto" fuente="titulo" />
      {(() => {
        const v = vis(t, a + 0.12, Infinity, 0.8);
        return v.on ? (
          <div style={{ position: "absolute", left: 0, top: 0, opacity: v.opacity }}>
            <Rejilla g={g} total={ep.total} estado={(n) => ({ opacity: 1, escala: 1, encendida: n <= ep.episodio ? 1 : 0, latido: 0, contorno: 0, check: 0 })} />
          </div>
        ) : null;
      })()}
      {(() => {
        const v = vis(t, a + 0.2, Infinity, 0.7);
        return v.on ? (
          <div style={{ position: "absolute", left: 540 - 190, top: 1520 - 52, width: 380, height: 104, borderRadius: 999, opacity: v.opacity, transform: `scale(${v.scale * (1 - hund)})`, background: siguiendo > 0.5 ? C.panel2 : C.acento, border: `4px solid ${C.acento}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontFamily: UI, fontWeight: 700, fontSize: 46, color: siguiendo > 0.5 ? C.texto : C.oscuro, boxShadow: pulsado ? "none" : `0 0 ${30 + 20 * Math.sin(t * 6)}px ${C.acento}88` }}>
            {siguiendo > 0.5 ? (
              <>
                Siguiendo
                <svg width={38} height={38} viewBox="0 0 24 24"><path d="M5 12.5 L10 17.5 L19 7" fill="none" stroke={C.acento} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={22} strokeDashoffset={22 * (1 - clamp01((t - T.pulsa - 0.2) / 0.3))} /></svg>
              </>
            ) : (
              "Seguir"
            )}
          </div>
        ) : null;
      })()}
      {t > T.pulsa - 0.5 && t < T.pulsa + 0.6 && (
        <div style={{ position: "absolute", left: 630, top: 1540, width: 66, height: 66, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: `5px solid ${C.acento}`, opacity: Math.min(clamp01((t - T.pulsa + 0.5) / 0.2), 1 - clamp01((t - T.pulsa - 0.3) / 0.3)), transform: `translate(${(1 - clamp01((t - T.pulsa + 0.5) / 0.4)) * 120}px, ${(1 - clamp01((t - T.pulsa + 0.5) / 0.4)) * 90}px) scale(${1 - 0.25 * Math.sin(clamp01((t - T.pulsa) / 0.2) * Math.PI)})` }} />
      )}
    </Escena>
  );
};

export const eventosSeguir = (L: Linea, ep: EpisodioMaster): Evento[] => {
  const T = tiempos(L, ep);
  return [{ t: T.pulsa, sfx: "tick", vol: 0.55 }];
};
