/**
 * Parte 2, cierre: resumen en tres iconos (Claude, Visual Studio Code y las tres extensiones) y avance al episodio
 * siguiente: se enciende su casilla en la rejilla, el candado se abre («EP.N», «COSAS MUY GORDAS») y entran los tres
 * iconos de lo que viene (la meta, las cuatro etapas en secuencia y una moneda que se hace más pequeña).
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../componentes/Escena";
import { IconCandado } from "../componentes/Iconos";
import { GEO_REJILLA, Rejilla, posCasilla } from "../componentes/Rejilla";
import { Etiqueta, Sello } from "../componentes/Sello";
import { C, EASE, EASE_OUT, TITULO, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps, EpisodioMaster } from "../tipos";
import { EXTS } from "./P2Extensiones";

// ── resumen ────────────────────────────────────────────────────────────────────────────────────────────────────────
const tRes = (L: Linea) => ({
  resumen: L.en("resumen", "Resumen"),
  claude: L.en("resumen", "Claude"),
  visual: L.en("resumen", "Visual"),
  tres: L.en("resumen", "tres"),
  empezar: L.en("resumen", "empezar"),
});

const Tile: React.FC<{ x: number; y: number; t: number; at: number; out: number; children: React.ReactNode; etiqueta: string; borde?: string }> = ({ x, y, t, at, out, children, etiqueta, borde = C.borde }) => {
  const v = vis(t, at - 0.05, out, 0.3);
  if (!v.on) return null;
  return (
    <>
      <div style={{ position: "absolute", left: x - 135, top: y - 135, width: 270, height: 270, borderRadius: 60, background: C.panel, border: `4px solid ${borde}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: v.opacity, transform: `translateY(${v.y}px) scale(${v.scale}) rotate(${(1 - v.s) * -10}deg)`, boxShadow: "0 30px 70px rgba(0,0,0,0.5)" }}>{children}</div>
      <Etiqueta texto={etiqueta} x={x} y={y + 200} t={t} at={at + 0.1} out={out} size={32} variante="gris" fuente="titulo" />
    </>
  );
};

export const Resumen2: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tRes(L);
  const out = hasta + 0.3;
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 1080, z: 0.92 },
    { t: T.claude - 0.2, x: 470, y: 1130, z: 1.04, d: 0.9 },
    { t: T.visual - 0.2, x: 540, y: 1140, z: 1.06, d: 0.8 },
    { t: T.tres - 0.2, x: 610, y: 1140, z: 1.04, d: 0.8 },
    { t: T.empezar - 0.4, x: 540, y: 1180, z: 0.96, d: 0.9 },
  ];
  return (
    <Escena t={t} tomas={tomas}>
      <Sello texto="RESUMEN RÁPIDO" x={540} y={760} t={t} at={T.resumen} out={out} size={66} rot={-3} />
      <Tile x={190} y={1110} t={t} at={T.claude} out={out} etiqueta="CLAUDE CODE" borde={C.acento}>
        <Img src={staticFile(ep.logos.claude)} style={{ width: 170 }} />
      </Tile>
      <Etiqueta texto="+" x={365} y={1110} t={t} at={T.visual - 0.1} out={out} size={70} variante="gris" fuente="titulo" />
      <Tile x={540} y={1110} t={t} at={T.visual} out={out} etiqueta="VS CODE">
        <Img src={staticFile(ep.logos.vscode)} style={{ width: 170 }} />
      </Tile>
      <Etiqueta texto="+" x={715} y={1110} t={t} at={T.tres - 0.1} out={out} size={70} variante="gris" fuente="titulo" />
      <Tile x={890} y={1110} t={t} at={T.tres} out={out} etiqueta="3 EXTENSIONES">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {EXTS.map((e, i) => {
            const s = sp(t, T.tres + 0.1 + i * 0.12, { damping: 12, stiffness: 200 });
            return (
              <div key={e.id} style={{ width: 200, height: 62, borderRadius: 16, background: e.blanco ? "#fff" : C.fondo, border: e.blanco ? "none" : `2px solid ${C.borde}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: Math.min(1, s * 2), transform: `translateX(${(1 - s) * 40}px)` }}>
                <Img src={staticFile(e.logo)} style={{ height: 48, maxWidth: 170, objectFit: "contain" }} />
              </div>
            );
          })}
        </div>
      </Tile>
      <Etiqueta texto="YA PUEDES EMPEZAR" x={540} y={1470} t={t} at={T.empezar - 0.1} out={out} size={62} variante="acento" fuente="titulo" />
    </Escena>
  );
};

export const eventosResumen2 = (L: Linea): Evento[] => {
  const T = tRes(L);
  return [
    { t: T.resumen + 0.1, sfx: "golpe", vol: 0.45 },
    { t: T.claude, sfx: "pop", vol: 0.4 },
    { t: T.visual, sfx: "pop", vol: 0.4 },
    { t: T.tres, sfx: "pop", vol: 0.4 },
    { t: T.empezar, sfx: "tick", vol: 0.5 },
  ];
};

// ── avance al episodio siguiente ───────────────────────────────────────────────────────────────────────────────────
const tAv = (L: Linea) => ({
  ini: L.ini("avance"),
  episodio: L.en("avance", "episodio"),
  cosas: L.en("avance", "cosas"),
  gordas: L.en("avance", "gordas"),
  ensenyo: L.en("avance", "enseño"),
  montar: L.en("avance", "montar"),
  master: L.en("avance", "máster"),
  veremos: L.en("avance", "Veremos"),
  etapas: L.en("avance", "etapas"),
  tamanyo: L.en("avance", "tamaño"),
  encima: L.en("avance", "encima"),
  interesa: L.en("avance", "interesa"),
  cuanto: L.en("avance", "cuánto"),
  gastar: L.en("avance", "gastar"),
  menos: L.en("avance", "menos"),
  fin: L.fin("avance"),
});

/** Los tres rótulos de lo que viene, sacados del título del avance («Tu meta, las 4 etapas y los costes»). */
const rotulos = (ep: EpisodioMaster) => (ep.avance?.titulo ?? "").split(/,\s*|\s+y\s+/).map((s) => s.trim().toUpperCase());

const G = { ...GEO_REJILLA, cy: 1100 };

export const AvanceEpisodio: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tAv(L);
  const out = hasta + 0.3;
  const sig = ep.avance?.episodio ?? ep.siguiente_episodio;
  const c = posCasilla(G, sig);
  const portal = T.cosas - 0.45;
  const cambio = T.cosas - 0.1;
  const sube = ramp(t, T.ensenyo - 0.3, T.ensenyo + 0.4, EASE);
  const R = rotulos(ep);
  const X = [200, 540, 880];
  const IY = 1230;
  const at = [T.ensenyo, T.veremos, T.encima];
  const tomasA: Toma[] = [
    { t: desde - 1, x: 540, y: G.cy, z: 1.0 },
    { t: T.episodio - 0.3, x: 540 + (c.x - 540) * 0.3, y: G.cy - 30, z: 1.12, d: 0.8 },
    { t: portal, x: c.x, y: c.y, z: 3.4, d: 0.75 },
  ];
  const tomasB: Toma[] = [
    { t: cambio - 0.3, x: 540, y: 1040, z: 0.82 },
    { t: cambio - 0.25, x: 540, y: 1040, z: 1.0, d: 0.9 },
    { t: T.ensenyo - 0.2, x: 540, y: 1120, z: 0.96, d: 0.9 },
    { t: T.montar - 0.2, x: X[0] + 220, y: IY - 100, z: 1.1, d: 0.9 },
    { t: T.veremos - 0.2, x: X[1], y: IY - 100, z: 1.14, d: 0.9 },
    { t: T.tamanyo - 0.2, x: X[1], y: IY - 80, z: 1.08, d: 0.9 },
    { t: T.encima - 0.2, x: X[2] - 220, y: IY - 100, z: 1.1, d: 0.9 },
    { t: T.menos - 0.5, x: 540, y: 1180, z: 0.96, d: 1.0 },
  ];
  const opA = 1 - ramp(t, cambio - 0.3, cambio);
  const opB = ramp(t, cambio - 0.25, cambio + 0.05);
  const abre = ramp(t, T.gordas - 0.05, T.gordas + 0.5, EASE_OUT);
  const tiembla = t > T.cosas && t < T.gordas ? Math.sin(t * 40) * 5 : 0;
  // tarjeta: centrada y grande; después sube a la cabecera
  const cy = 1000 + (760 - 1000) * sube;
  const ce = 1 - 0.5 * sube;
  const card = vis(t, cambio - 0.2, out, 0.8);
  return (
    <>
      {opA > 0 && (
        <Escena t={t} tomas={tomasA} opacity={opA}>
          <Rejilla
            g={G}
            total={ep.total}
            estado={(n) => {
              const e = sp(t, desde - 0.2 + ((n - 1) % 10) * 0.015, { damping: 14, stiffness: 180 });
              const enc = n === sig ? sp(t, T.episodio, { damping: 9, stiffness: 200 }) : 0;
              return {
                opacity: Math.min(1, e * 2) * (n === sig ? 1 : 1 - ramp(t, portal, portal + 0.45)),
                escala: 0.7 + 0.3 * e,
                encendida: n < sig ? 1 : Math.min(1, enc),
                latido: n === sig ? Math.sin(Math.min(1, enc) * Math.PI) * 0.35 + (t > T.episodio ? 0.08 * Math.abs(Math.sin((t - T.episodio) * 6)) : 0) : 0,
                contorno: n === sig ? 1 : 0,
                check: n < sig ? 1 : 0,
              };
            }}
          />
          <Etiqueta texto="EL SIGUIENTE EPISODIO" x={540} y={G.cy - 330} t={t} at={T.ini} out={portal} size={42} variante="borde" fuente="titulo" />
          <Etiqueta texto={`EP.${sig}`} x={c.x} y={c.y + 80} t={t} at={T.episodio} out={portal + 0.3} size={26} variante="acento" fuente="titulo" />
        </Escena>
      )}
      {opB > 0 && (
        <Escena t={t} tomas={tomasB} opacity={opB}>
          {card.on && (
            <div style={{ position: "absolute", left: 540, top: cy, width: 0, height: 0, opacity: card.opacity }}>
              <div style={{ position: "absolute", left: -420, top: -310, width: 840, height: 620, borderRadius: 50, background: `linear-gradient(180deg, ${C.acento}22, ${C.panel} 45%)`, border: `4px solid ${abre > 0.3 ? C.acento : C.borde}`, transform: `scale(${card.scale * ce})`, boxShadow: `0 40px 100px rgba(0,0,0,0.55), 0 0 ${70 * abre}px ${C.acento}55` }}>
                <div style={{ position: "absolute", left: 420 - 90 + tiembla, top: 40, width: 180, height: 180, transform: `scale(${1 + 0.1 * Math.sin(abre * Math.PI)})` }}>
                  <IconCandado s={180} color={abre > 0.5 ? C.acento : C.gris} abierto={abre} w={3.4} />
                </div>
                <div style={{ position: "absolute", left: 0, top: 250, width: 840, textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 170, color: C.texto, letterSpacing: -4, opacity: abre, transform: `scale(${0.7 + 0.3 * abre})` }}>
                  EP.<span style={{ color: C.acento }}>{sig}</span>
                </div>
              </div>
            </div>
          )}
          <Sello texto="COSAS MUY GORDAS" x={540} y={cy + 280 * ce + (1 - sube) * 0} t={t} at={T.gordas + 0.1} out={out} size={70 - 18 * sube} rot={-4} />
          {/* 1 · la meta */}
          {(() => {
            const v = vis(t, at[0] - 0.05, out, 0.3);
            if (!v.on) return null;
            const camino = ramp(t, T.montar - 0.1, T.montar + 0.9, EASE_OUT);
            const brillo = ramp(t, T.master, T.master + 0.4);
            return (
              <div style={{ position: "absolute", left: X[0] - 150, top: IY - 150, width: 300, height: 300, borderRadius: 56, background: C.panel, border: `4px solid ${brillo > 0.5 ? C.acento : C.borde}`, opacity: v.opacity, transform: `scale(${v.scale})`, boxShadow: `0 0 ${60 * brillo}px ${C.acento}55` }}>
                <svg width={300} height={300} viewBox="0 0 300 300" fill="none">
                  <path d="M50 250 C 110 240, 90 170, 150 160 S 200 110, 210 80" stroke={C.gris} strokeWidth={8} strokeLinecap="round" strokeDasharray="14 14" pathLength={100} strokeDashoffset={0} opacity={0.35} />
                  <path d="M50 250 C 110 240, 90 170, 150 160 S 200 110, 210 80" stroke={C.acento} strokeWidth={8} strokeLinecap="round" pathLength={100} strokeDasharray="100 100" strokeDashoffset={100 * (1 - camino)} />
                  <path d="M210 90 V40" stroke="#fff" strokeWidth={7} strokeLinecap="round" />
                  <path d={`M212 42 Q ${238 + Math.sin(t * 6) * 6} ${38 + Math.cos(t * 6) * 4} 262 48 Q ${240 + Math.sin(t * 6 + 1) * 6} 58 212 64 Z`} fill={C.acento} />
                  <circle cx="50" cy="250" r="12" fill="#fff" />
                </svg>
              </div>
            );
          })()}
          {/* 2 · las cuatro etapas en secuencia */}
          {(() => {
            const v = vis(t, at[1] - 0.05, out, 0.3);
            if (!v.on) return null;
            const osc = t > T.tamanyo ? Math.sin((t - T.tamanyo) * 5) * Math.exp(-(t - T.tamanyo) * 0.9) : 0;
            return (
              <div style={{ position: "absolute", left: X[1] - 150, top: IY - 150, width: 300, height: 300, borderRadius: 56, background: C.panel, border: `4px solid ${C.borde}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: v.opacity, transform: `scale(${v.scale})` }}>
                {[0, 1, 2, 3].map((k) => {
                  const on = ramp(t, T.etapas + k * 0.28, T.etapas + k * 0.28 + 0.2);
                  return (
                    <React.Fragment key={k}>
                      <div style={{ width: 46, height: 46 + k * 22, borderRadius: 10, background: `color-mix(in srgb, ${C.acento} ${Math.round(on * 100)}%, ${C.panel2})`, border: `3px solid ${on > 0.5 ? C.acento : C.borde}`, transform: `scale(${1 + osc * (k % 2 ? 0.25 : -0.2)})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 24, color: on > 0.5 ? C.oscuro : C.gris }}>{k + 1}</div>
                    </React.Fragment>
                  );
                })}
              </div>
            );
          })()}
          {/* 3 · los costes: una moneda que se hace más pequeña */}
          {(() => {
            const v = vis(t, at[2] - 0.05, out, 0.3);
            if (!v.on) return null;
            const late = ramp(t, T.cuanto, T.cuanto + 0.3) * (1 - ramp(t, T.gastar, T.gastar + 0.3));
            const encoge = ramp(t, T.menos - 0.1, T.menos + 0.5, EASE_OUT);
            const r = 92 * (1 - 0.45 * encoge) * (1 + 0.08 * late * Math.sin(t * 9));
            return (
              <div style={{ position: "absolute", left: X[2] - 150, top: IY - 150, width: 300, height: 300, borderRadius: 56, background: C.panel, border: `4px solid ${late > 0.3 || encoge > 0.3 ? C.acento : C.borde}`, opacity: v.opacity, transform: `scale(${v.scale})` }}>
                <div style={{ position: "absolute", left: 150 - r, top: 150 - r, width: 2 * r, height: 2 * r, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #FFE6A3, #E5B455 60%, #B9852C)", boxShadow: "0 10px 30px rgba(0,0,0,0.5), inset 0 0 0 8px rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TITULO, fontWeight: 800, fontSize: r * 1.1, color: "#8A5E12" }}>€</div>
                {encoge > 0 && (
                  <svg width={70} height={70} viewBox="0 0 24 24" style={{ position: "absolute", right: 18, bottom: 18, opacity: encoge }}>
                    <path d="M12 4 V19 M5.5 12.5 L12 19 L18.5 12.5" fill="none" stroke={C.acento} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            );
          })()}
          {R.slice(0, 3).map((r, i) => (
            <Etiqueta key={i} texto={r} x={X[i]} y={IY + 215} t={t} at={(i === 0 ? T.montar : i === 1 ? T.etapas : T.cuanto) - 0.05} out={out} size={30} variante={i === 2 ? "acento" : "borde"} fuente="titulo" />
          ))}
          <Etiqueta texto="LO QUE DE VERDAD TE INTERESA" x={540} y={1560} t={t} at={T.interesa - 0.1} out={out} size={40} variante="texto" fuente="titulo" />
        </Escena>
      )}
    </>
  );
};

export const eventosAvanceEpisodio = (L: Linea): Evento[] => {
  const T = tAv(L);
  return [
    { t: T.episodio, sfx: "tick", vol: 0.5 },
    { t: T.cosas - 0.45, sfx: "whoosh", vol: 0.35 },
    { t: T.gordas, sfx: "golpe", vol: 0.55 },
    { t: T.ensenyo, sfx: "pop", vol: 0.4 },
    { t: T.veremos, sfx: "pop", vol: 0.4 },
    ...[0, 1, 2, 3].map((k) => ({ t: T.etapas + k * 0.28, sfx: "tick" as const, vol: 0.3 })),
    { t: T.encima, sfx: "pop", vol: 0.4 },
    { t: T.menos, sfx: "whoosh", vol: 0.3 },
  ];
};

