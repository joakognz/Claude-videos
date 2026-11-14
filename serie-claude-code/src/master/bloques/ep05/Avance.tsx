/**
 * EP.5 · bloque «Avance» (escenas proximo → seguir):
 * la rejilla de la serie marca el EP.5 como hecho, la casilla 6 se enciende y la cámara entra en ella → tarjeta
 * «EP.6 · PRÓXIMO EPISODIO · PROMPTING MAESTRO · Pídelo bien a la primera» con la mascota de Claude Code y la diana
 * → tarjeta del perfil con el botón Seguir, que se pulsa al decir «Sígueme».
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../../componentes/Escena";
import { Logo } from "../../componentes/Logo";
import { GEO_REJILLA, Rejilla, posCasilla } from "../../componentes/Rejilla";
import { Etiqueta } from "../../componentes/Sello";
import { C, TITULO, UI, clamp01, ramp, sp, vis } from "../../nucleo";
import type { Evento, Linea, Toma } from "../../nucleo";
import type { BloqueProps, EpisodioMaster } from "../../tipos";
import { Picto, Pop } from "../../ep05/kit";

const G = { ...GEO_REJILLA, cy: 1150 };
const ID = "proximo";
const S = "seguir";

const tiempos = (L: Linea, ep: EpisodioMaster) => {
  const episodio = L.en(ID, "episodio");
  const portal = episodio + 0.15;
  const seguirIni = L.ini(S);
  return {
    ini: L.ini(ID),
    siguiente: L.en(ID, "siguiente"),
    episodio,
    portal,
    cambio: portal + 0.62,
    prompting: L.en(ID, "prompting"),
    maestro: L.en(ID, "maestro"),
    como: L.en(ID, "cómo"),
    claude: L.en(ID, "Claude"),
    primera: L.en(ID, "primera"),
    seguirIni,
    pulsa: L.en(S, ep.cta.seguir ?? "Sígueme") + 0.45,
  };
};

export const Avance: React.FC<BloqueProps> = ({ t, ep, L, desde }) => {
  const T = tiempos(L, ep);
  const sig = ep.siguiente_episodio;
  const c = posCasilla(G, sig);
  const av = ep.avance ?? { titulo: "", subtitulo: "" };
  const tomasA: Toma[] = [
    { t: desde - 1, x: 540, y: G.cy, z: 1.0 },
    { t: T.siguiente - 0.3, x: 540 + (posCasilla(G, ep.episodio).x - 540) * 0.3, y: G.cy - 40, z: 1.14, d: 0.6 },
    { t: T.portal, x: c.x, y: c.y, z: 3.2, d: 0.75 },
  ];
  const tomasB: Toma[] = [
    { t: T.cambio - 0.3, x: 540, y: 1060, z: 0.82 },
    { t: T.cambio - 0.25, x: 540, y: 1060, z: 1.02, d: 0.8 },
    { t: T.como - 0.2, x: 540, y: 1110, z: 1.02, d: 0.8 },
    { t: T.claude - 0.2, x: 540, y: 1130, z: 1.0, d: 0.8 },
    { t: T.seguirIni - 0.35, x: 540, y: 2250, z: 0.96, d: 0.9 },
    { t: T.pulsa + 0.3, x: 540, y: 2280, z: 1.04, d: 1.4 },
  ];
  const opA = 1 - ramp(t, T.cambio - 0.35, T.cambio);
  const opB = ramp(t, T.cambio - 0.3, T.cambio + 0.05);
  const enciende = ramp(t, T.episodio - 0.05, T.episodio + 0.3);
  const hecho = ramp(t, T.siguiente, T.siguiente + 0.35);
  // seguir
  const pulsado = t > T.pulsa;
  const hund = Math.sin(clamp01((t - T.pulsa + 0.08) / 0.2) * Math.PI) * 0.08;
  const siguiendo = ramp(t, T.pulsa + 0.05, T.pulsa + 0.25);
  const fueraCard = T.seguirIni;
  return (
    <>
      {opA > 0 && (
        <Escena t={t} tomas={tomasA} opacity={opA}>
          <Rejilla
            g={G}
            total={ep.total}
            estado={(n) => {
              const e = sp(t, desde - 0.2 + ((n - 1) % 10) * 0.015, { damping: 14, stiffness: 180 });
              const late = n === sig && t > T.episodio - 0.1 ? 0.12 * Math.abs(Math.sin((t - T.episodio + 0.1) * 6)) : 0;
              return {
                opacity: Math.min(1, e * 2) * (n === sig ? 1 : 1 - ramp(t, T.portal, T.portal + 0.5)),
                escala: 0.7 + 0.3 * e,
                encendida: n <= ep.episodio ? 1 : n === sig ? enciende : 0,
                latido: late + (n === ep.episodio ? Math.sin(Math.min(1, hecho) * Math.PI) * 0.25 : 0),
                contorno: n === sig ? ramp(t, T.siguiente, T.episodio) : 0,
                check: n <= ep.episodio ? (n === ep.episodio ? hecho : 1) : 0,
              };
            }}
          />
          <Etiqueta texto="EN EL SIGUIENTE EPISODIO" x={540} y={G.cy - 330} t={t} at={T.siguiente - 0.05} out={T.portal + 0.3} size={40} variante="borde" fuente="titulo" />
        </Escena>
      )}
      {opB > 0 && (
        <Escena t={t} tomas={tomasB} opacity={opB}>
          {(() => {
            const v = vis(t, T.cambio - 0.3, fueraCard + 0.4, 0.85);
            return v.on ? (
              <div style={{ position: "absolute", left: 70, top: 600, width: 940, height: 1000, borderRadius: 44, background: C.panel, border: `3px solid ${C.acento}`, boxShadow: `0 40px 100px rgba(0,0,0,0.55), 0 0 60px ${C.acento}33`, opacity: v.opacity, transform: `scale(${v.scale})` }} />
            ) : null;
          })()}
          <Etiqueta texto={`EP.${sig}`} x={540} y={735} t={t} at={T.cambio - 0.2} out={fueraCard + 0.4} size={120} variante="texto" fuente="titulo" />
          <Etiqueta texto="PRÓXIMO EPISODIO" x={540} y={860} t={t} at={T.cambio} out={fueraCard + 0.4} size={38} variante="acento" fuente="titulo" />
          {av.titulo.split(" ").map((w, i) => (
            <Pop key={w} x={540} y={1000 + i * 110} t={t} at={(i === 0 ? T.prompting : T.maestro) - 0.05} out={fueraCard + 0.4}>
              <div style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 104, letterSpacing: 2, color: i === 0 ? C.texto : C.acento }}>{w}</div>
            </Pop>
          ))}
          <Pop x={540} y={1225} t={t} at={T.como - 0.05} out={fueraCard + 0.4}>
            <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 48, color: C.gris }}>{av.subtitulo}</div>
          </Pop>
          <Logo src={ep.logos.claude_code} x={400} y={1420} w={150} t={t} at={T.claude - 0.05} out={fueraCard + 0.4} />
          <Pop x={680} y={1420} t={t} at={T.primera - 0.3} out={fueraCard + 0.4} rot={-20}>
            <div style={{ position: "relative" }}>
              <Picto nombre="diana" size={150} grosor={2} />
              {t > T.primera && (
                <div style={{ position: "absolute", left: 40, top: 40, width: 70, height: 70, borderRadius: "50%", background: C.acento, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${Math.min(1.1, sp(t, T.primera, { damping: 10, stiffness: 240 }))})` }}>
                  <Picto nombre="check" size={46} color={C.oscuro} grosor={3.2} dibujo={ramp(t, T.primera + 0.1, T.primera + 0.4)} />
                </div>
              )}
            </div>
          </Pop>

          {/* ── seguir: tarjeta del perfil ── */}
          {(() => {
            const v = vis(t, T.seguirIni - 0.05, Infinity, 0.85);
            if (!v.on) return null;
            return <div style={{ position: "absolute", left: 90, top: 1960, width: 900, height: 640, borderRadius: 44, background: C.panel, border: `3px solid ${C.borde}`, boxShadow: "0 40px 100px rgba(0,0,0,0.55)", opacity: v.opacity, transform: `scale(${v.scale})` }} />;
          })()}
          <Logo src={ep.logos.claude_code_texto} x={540} y={1810} w={440} t={t} at={T.seguirIni + 0.1} sombra={false} />
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
                <Rejilla g={g} total={ep.total} estado={(n) => ({ opacity: 1, escala: 1, encendida: n <= ep.episodio ? 1 : 0, latido: 0, contorno: n === sig ? 0.6 : 0, check: 0 })} />
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
                    <Picto nombre="check" size={40} grosor={3.4} dibujo={clamp01((t - T.pulsa - 0.2) / 0.3)} />
                  </>
                ) : (
                  "Seguir"
                )}
              </div>
            );
          })()}
          {t > T.pulsa - 0.5 && t < T.pulsa + 0.6 && (
            <div style={{ position: "absolute", left: 640, top: 2520, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: `5px solid ${C.acento}`, opacity: Math.min(clamp01((t - T.pulsa + 0.5) / 0.2), 1 - clamp01((t - T.pulsa - 0.3) / 0.3)), transform: `translate(${(1 - clamp01((t - T.pulsa + 0.5) / 0.4)) * 120}px, ${(1 - clamp01((t - T.pulsa + 0.5) / 0.4)) * 90}px) scale(${1 - 0.25 * Math.sin(clamp01((t - T.pulsa) / 0.2) * Math.PI)})` }} />
          )}
        </Escena>
      )}
    </>
  );
};

export const eventosAvance = (L: Linea, ep: EpisodioMaster): Evento[] => {
  const T = tiempos(L, ep);
  return [
    { t: T.siguiente + 0.05, sfx: "tick", vol: 0.5 },
    { t: T.episodio, sfx: "pop", vol: 0.4 },
    { t: T.portal, sfx: "whoosh", vol: 0.35 },
    { t: T.prompting, sfx: "golpe", vol: 0.45 },
    { t: T.claude, sfx: "pop", vol: 0.35 },
    { t: T.primera + 0.05, sfx: "tick", vol: 0.5 },
    { t: T.seguirIni - 0.3, sfx: "whoosh", vol: 0.3 },
    { t: T.pulsa, sfx: "tick", vol: 0.55 },
  ];
};
