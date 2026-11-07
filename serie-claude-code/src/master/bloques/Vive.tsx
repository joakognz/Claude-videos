/** Segunda pregunta, «¿Dónde vive?»: cuatro opciones que entran una a una (ordenador, hosting, VPS con reloj 24/7 y luna, nube con AWS). */
import React from "react";
import { Escena } from "../componentes/Escena";
import { IconHosting, IconLuna, IconOrdenador, IconReloj, IconVps } from "../componentes/Iconos";
import { Logo } from "../componentes/Logo";
import { Sello } from "../componentes/Sello";
import { C, TITULO, UI, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps, EpisodioMaster } from "../tipos";

export const AZUL = "#5B8DEF";
const CARDS = [
  { id: "pc", x: 300, y: 940, ancla: "ordenador", titulo: "TU ORDENADOR", detalle: "Si es algo personal" },
  { id: "hosting", x: 780, y: 940, ancla: "hosting", titulo: "HOSTING WEB", detalle: "Que cualquiera lo vea online" },
  { id: "vps", x: 300, y: 1390, ancla: "VPS", titulo: "VPS", detalle: "Un ordenador encendido" },
  { id: "nube", x: 780, y: 1390, ancla: "nube", titulo: "NUBE GRANDE", detalle: "Para los proyectos gordos" },
] as const;

const tiempos = (L: Linea) => ({
  segunda: L.en("segunda", "Segunda"),
  donde: L.en("segunda", "dónde"),
  cards: CARDS.map((c) => L.en("vive", c.ancla)),
  veinticuatro: L.en("vive", "veinticuatro"),
  solo: L.en("vive", "solo"),
  duermes: L.en("vive", "duermes"),
  aws: L.en("vive", "AWS"),
  fin: L.fin("vive"),
});

export const Vive: React.FC<BloqueProps> = ({ t, L, desde, hasta }) => {
  const T = tiempos(L);
  const out = hasta + 0.3;
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1060, z: 0.88 },
    { t: T.donde - 0.2, x: 540, y: 900, z: 1.0, d: 0.9 },
    ...CARDS.map((c, i) => ({ t: T.cards[i] - 0.3, x: c.x, y: c.y + 10, z: 1.2, d: 0.9 })),
    { t: T.duermes + 0.3, x: 300, y: 1400, z: 1.2, d: 0.9 },
    { t: T.aws - 0.5, x: 780, y: 1400, z: 1.2, d: 0.9 },
    { t: T.fin - 0.5, x: 540, y: 1160, z: 0.9, d: 1.1 },
  ];
  const card = vis(t, desde + 0.1, out, 0.85);
  const noche = ramp(t, T.duermes - 0.1, T.duermes + 0.6);
  return (
    <Escena t={t} tomas={tomas}>
      {card.on && (
        <div style={{ position: "absolute", left: 40, top: 560, width: 1000, height: 1100, borderRadius: 48, background: `linear-gradient(180deg, ${AZUL}26, ${C.panel} 34%)`, border: `4px solid ${AZUL}`, boxShadow: `0 40px 100px rgba(0,0,0,0.55), 0 0 60px ${AZUL}33`, opacity: card.opacity, transform: `scale(${card.scale})` }} />
      )}
      <Sello texto="PREGUNTA 2" x={290} y={628} t={t} at={T.segunda} out={out} size={44} rot={-3} />
      {(() => {
        const v = vis(t, T.donde - 0.05, out, 0.8);
        return v.on ? (
          <div style={{ position: "absolute", left: 540, top: 760, width: 0, height: 0 }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) translateY(${v.y}px) scale(${v.scale})`, opacity: v.opacity, fontFamily: TITULO, fontWeight: 800, fontSize: 88, color: C.texto, whiteSpace: "nowrap", letterSpacing: -1.5 }}>
              ¿<span style={{ color: AZUL }}>DÓNDE</span> VIVE?
            </div>
          </div>
        ) : null;
      })()}
      {CARDS.map((c, i) => {
        const at = T.cards[i];
        const v = vis(t, at - 0.1, out, 0.5);
        if (!v.on) return null;
        const esVps = c.id === "vps";
        const fondo = esVps ? `color-mix(in srgb, #0A1030 ${Math.round(noche * 100)}%, ${C.panel2})` : C.panel2;
        return (
          <div key={c.id} style={{ position: "absolute", left: c.x - 215, top: c.y - 190, width: 430, height: 380, borderRadius: 38, background: fondo, border: `4px solid ${AZUL}`, opacity: v.opacity, transform: `scale(${v.scale}) rotate(${(1 - v.s) * (i % 2 ? 5 : -5)}deg)`, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.45)" }}>
            {esVps && noche > 0 && Array.from({ length: 9 }, (_, k) => (
              <div key={k} style={{ position: "absolute", left: 40 + ((k * 97) % 360), top: 28 + ((k * 53) % 120), width: 5, height: 5, borderRadius: "50%", background: "#fff", opacity: noche * (0.4 + 0.5 * Math.abs(Math.sin(t * 2 + k))) }} />
            ))}
            <div style={{ position: "absolute", left: 0, top: 36, width: 430, display: "flex", justifyContent: "center" }}>
              {c.id === "pc" && <IconOrdenador s={150} color={C.texto} />}
              {c.id === "hosting" && <IconHosting s={150} color={C.texto} />}
              {esVps && <div style={{ marginTop: 26 }}><IconVps s={140} color={C.texto} /></div>}
              {c.id === "nube" && <div style={{ marginTop: 16 }}><Logo src="logos/aws.png" x={215} y={90} w={170} t={t} at={T.aws - 0.1} ficha="tarjeta" sombra={false} /></div>}
            </div>
            {esVps && (() => {
              const r = vis(t, T.veinticuatro - 0.1, Infinity, 0.3);
              const l = vis(t, T.duermes - 0.05, Infinity, 0.3);
              return (
                <>
                  {r.on && (
                    <div style={{ position: "absolute", left: 18, top: 16, display: "flex", alignItems: "center", gap: 8, opacity: r.opacity, transform: `scale(${r.scale})`, transformOrigin: "0 0" }}>
                      <IconReloj s={58} t={t - T.veinticuatro} color={C.acento} />
                      <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 34, color: C.acento }}>24/7</div>
                    </div>
                  )}
                  {l.on && (
                    <div style={{ position: "absolute", right: 24, top: 20, opacity: l.opacity, transform: `scale(${l.scale}) rotate(${(1 - l.s) * 40}deg)` }}>
                      <IconLuna s={96} color="#F6E7A8" fill />
                    </div>
                  )}
                </>
              );
            })()}
            <div style={{ position: "absolute", left: 0, top: 232, width: 430, textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 44, color: C.texto, letterSpacing: -0.5 }}>{c.titulo}</div>
            <div style={{ position: "absolute", left: 0, top: 296, width: 430, textAlign: "center", fontFamily: UI, fontWeight: 600, fontSize: 28, color: esVps && noche > 0.5 ? "#F6E7A8" : C.gris }}>
              {esVps && noche > 0.5 ? "Mientras tú duermes" : c.detalle}
            </div>
          </div>
        );
      })}
      {/* aviso de que el VPS «trabaja solo» */}
      {(() => {
        const v = vis(t, T.solo - 0.05, T.duermes + 1.2, 0.7);
        return v.on ? (
          <div style={{ position: "absolute", left: 300, top: 1215, width: 0, height: 0, opacity: v.opacity }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${v.scale})`, background: C.acento, color: C.oscuro, fontFamily: TITULO, fontWeight: 800, fontSize: 34, padding: "8px 24px", borderRadius: 99, whiteSpace: "nowrap" }}>TRABAJA SOLO</div>
          </div>
        ) : null;
      })()}
      <div style={{ position: "absolute", left: 90, top: 1642, width: 900 * sp(t, desde, { damping: 30, stiffness: 40 }), height: 4, borderRadius: 2, background: `linear-gradient(90deg, ${AZUL}, transparent)`, opacity: 0.0 }} />
    </Escena>
  );
};

export const eventosVive = (L: Linea, _ep: EpisodioMaster): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.segunda, sfx: "golpe", vol: 0.45 },
    { t: T.donde, sfx: "pop", vol: 0.35 },
    ...T.cards.map((c) => ({ t: c - 0.05, sfx: "pop" as const, vol: 0.45 })),
    { t: T.veinticuatro, sfx: "tick", vol: 0.5 },
    { t: T.duermes, sfx: "whoosh", vol: 0.3 },
  ];
};
