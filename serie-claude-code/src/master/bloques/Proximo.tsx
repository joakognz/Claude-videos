/**
 * Bloque «Próximo episodio»: la rejilla de la serie marca el episodio de hoy como hecho, el siguiente late y la
 * cámara entra en su casilla, que se abre en la tarjeta «EP.N+1 · PRÓXIMAMENTE» con lo que dice la voz.
 */
import React from "react";
import { Escena } from "../componentes/Escena";
import { Logo } from "../componentes/Logo";
import { GEO_REJILLA, Rejilla, posCasilla } from "../componentes/Rejilla";
import { Etiqueta } from "../componentes/Sello";
import { C, TITULO, UI, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps, EpisodioMaster } from "../tipos";

const G = { ...GEO_REJILLA, cy: 1150 };
const ID = "proximo";
const FILAS_Y = [1040, 1340, 1640];

const tiempos = (L: Linea, ep: EpisodioMaster) => ({
  hasta: L.en(ID, "hasta"),
  hecho: L.en(ID, `${ep.episodio}.`),
  proximo: L.en(ID, "próximo"),
  veremos: L.en(ID, "veremos"),
  items: (ep.proximo ?? []).map((p) => L.en(ID, p.en)),
});

export const Proximo: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L, ep);
  const sig = ep.siguiente_episodio;
  const c = posCasilla(G, sig);
  const portal = T.proximo + 0.15;
  const cambio = portal + 0.75; // la rejilla se ha acercado a la casilla y entra la tarjeta
  const items = ep.proximo ?? [];
  const detalles = items.map((p) => (p.detalle ?? []).map((d) => L.en(ID, d.en)));
  const tomasA: Toma[] = [
    { t: desde - 1, x: 540, y: G.cy, z: 1.0 },
    { t: T.hecho - 0.5, x: 540 + (posCasilla(G, ep.episodio).x - 540) * 0.25, y: G.cy - 40, z: 1.12, d: 0.9 },
    { t: portal, x: c.x, y: c.y, z: 3.2, d: 0.85 },
  ];
  // la tarjeta cabe entera a z ≈ 0,95: la cámara solo baja lo justo para que la cabecera no quede bajo los subtítulos
  const tomasB: Toma[] = [
    { t: cambio - 0.3, x: 540, y: 1000, z: 0.8 },
    { t: cambio - 0.25, x: 540, y: 1000, z: 1.02, d: 0.9 },
    ...items.flatMap((_, i) => [
      { t: T.items[i] - 0.25, x: 540, y: Math.min(1296, 1120 + i * 90), z: 0.97, d: 0.9 },
      ...(detalles[i].length ? [{ t: detalles[i][0] - 0.2, x: 540, y: Math.min(1296, 1160 + i * 90), z: 0.99, d: 0.9 }] : []),
    ]),
    { t: L.fin(ID) - 0.5, x: 540, y: 1230, z: 0.88, d: 1.1 },
  ];
  const opA = 1 - ramp(t, cambio - 0.35, cambio);
  const opB = ramp(t, cambio - 0.3, cambio + 0.05);
  return (
    <>
      {opA > 0 && (
        <Escena t={t} tomas={tomasA} opacity={opA}>
          <Rejilla
            g={G}
            total={ep.total}
            estado={(n) => {
              const e = sp(t, desde - 0.2 + ((n - 1) % 10) * 0.015, { damping: 14, stiffness: 180 });
              const hecho = n === ep.episodio ? ramp(t, T.hecho, T.hecho + 0.35) : 0;
              const late = n === sig && t > T.proximo - 0.1 ? 0.12 * Math.abs(Math.sin((t - T.proximo + 0.1) * 6)) : 0;
              return {
                opacity: Math.min(1, e * 2) * (n === sig ? 1 : 1 - ramp(t, portal, portal + 0.5)),
                escala: 0.7 + 0.3 * e,
                encendida: n <= ep.episodio ? 1 : 0,
                latido: late + (n === ep.episodio ? Math.sin(Math.min(1, hecho) * Math.PI) * 0.25 : 0),
                contorno: n === sig ? ramp(t, T.proximo - 0.1, T.proximo + 0.1) : 0,
                check: n <= ep.episodio ? (n === ep.episodio ? hecho : 1) : 0,
              };
            }}
          />
          <Etiqueta texto={`HASTA AQUÍ EL EPISODIO ${ep.episodio}`} x={540} y={G.cy - 330} t={t} at={T.hasta} out={portal} size={40} variante="borde" fuente="titulo" />
          <Etiqueta texto="EN EL PRÓXIMO" x={c.x} y={c.y + 80} t={t} at={T.proximo - 0.05} out={portal + 0.3} size={22} variante="acento" />
        </Escena>
      )}
      {opB > 0 && (
        <Escena t={t} tomas={tomasB} opacity={opB}>
          {(() => {
            const v = vis(t, cambio - 0.3, hasta + 0.4, 0.85);
            return v.on ? (
              <div style={{ position: "absolute", left: 70, top: 620, width: 940, height: 1190, borderRadius: 44, background: C.panel, border: `3px solid ${C.borde}`, boxShadow: "0 40px 100px rgba(0,0,0,0.55)", opacity: v.opacity, transform: `scale(${v.scale})` }} />
            ) : null;
          })()}
          <Etiqueta texto={`EP.${sig}`} x={540} y={770} t={t} at={cambio - 0.2} out={hasta + 0.4} size={120} variante="texto" fuente="titulo" />
          <Etiqueta texto="PRÓXIMAMENTE" x={540} y={890} t={t} at={cambio} out={hasta + 0.4} size={38} variante="acento" fuente="titulo" />
          {items.map((it, i) => {
            const v = vis(t, T.items[i] - 0.05, hasta + 0.4, 0.8);
            if (!v.on) return null;
            const y = FILAS_Y[i];
            return (
              <React.Fragment key={i}>
                <div style={{ position: "absolute", left: 130, top: y - 50, display: "flex", alignItems: "center", gap: 26, opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale})`, transformOrigin: "0 50%" }}>
                  <div style={{ width: 72, height: 72, borderRadius: 20, background: C.acento, color: C.oscuro, fontFamily: TITULO, fontWeight: 800, fontSize: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                  <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 54, color: C.texto, whiteSpace: "nowrap" }}>{it.titulo}</div>
                </div>
                {(it.detalle ?? []).map((d, k) => {
                  const vd = vis(t, detalles[i][k] - 0.05, hasta + 0.4, 0.8);
                  return vd.on ? (
                    <div key={k} style={{ position: "absolute", left: 230, top: y + 50 + k * 64, display: "flex", alignItems: "center", gap: 16, opacity: vd.opacity, transform: `translateX(${(1 - vd.s) * -30}px)`, fontFamily: UI, fontWeight: 600, fontSize: 36, color: C.gris, whiteSpace: "nowrap" }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: C.acento }} />
                      {d.texto}
                    </div>
                  ) : null;
                })}
                {(it.logos ?? []).map((lg, k) => {
                  // cada logo entra cuando la voz lo nombra
                  const at = L.en(ID, lg.en);
                  const x = 300 + k * 260;
                  return (
                    <React.Fragment key={lg.id}>
                      <Logo src={ep.logos[lg.id]} x={x} y={y + 120} w={lg.id === "vscode" ? 120 : 170} t={t} at={at} out={hasta + 0.4} />
                      {k > 0 && <Etiqueta texto="+" x={x - 130} y={y + 120} t={t} at={at - 0.05} out={hasta + 0.4} size={60} variante="gris" fuente="titulo" />}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            );
          })}
        </Escena>
      )}
    </>
  );
};

export const eventosProximo = (L: Linea, ep: EpisodioMaster): Evento[] => {
  const T = tiempos(L, ep);
  return [
    { t: T.hecho + 0.05, sfx: "tick", vol: 0.5 },
    { t: T.proximo + 0.15, sfx: "whoosh", vol: 0.35 },
    { t: T.proximo + 0.85, sfx: "pop", vol: 0.4 },
    ...T.items.map((t) => ({ t: t - 0.05, sfx: "pop" as const, vol: 0.4 })),
  ];
};
