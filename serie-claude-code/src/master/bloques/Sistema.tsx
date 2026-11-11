/**
 * Sistema (escenas sistema → tarea): los tres proyectos se apoyan en una base, «TU SISTEMA DE TRABAJO» → el ciclo
 * pedir → revisar → corregir con un punto de luz que lo recorre → tarjeta de tarea «ELIGE UNO» con los tres
 * proyectos; el cursor pasa por los tres (la elección es del que mira).
 */
import React from "react";
import { Img, staticFile } from "remotion";
import { Escena } from "../componentes/Escena";
import { Comentario, Cursor, LlaveInglesa, Lupa, Movil, Servidor } from "../componentes/Iconos";
import { Etiqueta } from "../componentes/Sello";
import { Tarjeta } from "../componentes/Tarjeta";
import { C, EASE, TITULO, UI, clamp01, ramp, sp, vis } from "../nucleo";
import type { Evento, Linea, Toma } from "../nucleo";
import type { BloqueProps } from "../tipos";

const CICLO = { x: 540, y: 1330, r: 235 };
const NODOS = [
  { id: "pedir", texto: "PEDIR", ang: -90 },
  { id: "revisar", texto: "REVISAR", ang: 30 },
  { id: "corregir", texto: "CORREGIR", ang: 150 },
];
const pos = (ang: number, r = CICLO.r) => ({ x: CICLO.x + Math.cos((ang * Math.PI) / 180) * r, y: CICLO.y + Math.sin((ang * Math.PI) / 180) * r });
const TAREA = { x: 540, y: 2000 };

const tiempos = (L: Linea) => ({
  ini: L.ini("sistema"),
  eso: L.en("sistema", "todo eso"),
  montas: L.en("sistema", "montas"),
  sistema: L.en("sistema", "sistema"),
  pedir: L.en("sistema", "pedir"),
  revisar: L.en("sistema", "revisar"),
  corregir: L.en("sistema", "corregir"),
  finSistema: L.fin("sistema"),
  tarea: L.en("tarea", "tarea"),
  tu: L.ini("tarea"),
  elige: L.en("tarea", "elige"),
  cual: L.en("tarea", "cuál"),
  los: L.en("tarea", "los"),
  tres: L.en("tarea", "tres"),
  llama: L.en("tarea", "llama"),
  mas: L.en("tarea", "más"),
});

/** Baldosa pequeña de un proyecto (arriba y dentro de la tarea). */
const Baldosa: React.FC<{ i: number; x: number; y: number; t: number; at: number; s?: number; on?: number; out?: number; logo: string; rotulo?: string }> = ({ i, x, y, t, at, s = 150, on = 0, out, logo, rotulo }) => {
  const v = vis(t, at, out, 0.5);
  if (!v.on) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity: v.opacity }}>
      <div style={{ position: "absolute", left: -s / 2, top: -s / 2, width: s, height: s, borderRadius: s * 0.22, background: `linear-gradient(160deg, ${C.panel2}, ${C.panel})`, border: `3px solid ${on > 0.05 ? C.acento : C.borde}`, boxShadow: on > 0.05 ? `0 0 ${40 * on}px ${C.acento}77` : "0 16px 40px rgba(0,0,0,0.5)", transform: `translateY(${v.y}px) scale(${v.scale * (1 + 0.08 * on)})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {i === 0 ? (
          <div style={{ width: s * 0.6, height: s * 0.6, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Img src={staticFile(logo)} style={{ width: s * 0.46 }} />
          </div>
        ) : i === 1 ? (
          <Servidor s={s * 0.62} t={t} />
        ) : (
          <Movil s={s * 0.66} />
        )}
      </div>
      {rotulo && (
        <div style={{ position: "absolute", left: 0, top: s / 2 + 34, transform: `translate(-50%, -50%) translateY(${v.y}px)`, whiteSpace: "nowrap", fontFamily: UI, fontWeight: 700, fontSize: 26, letterSpacing: 1, color: on > 0.05 ? C.texto : C.gris }}>{rotulo}</div>
      )}
    </div>
  );
};

export const Sistema: React.FC<BloqueProps> = ({ t, ep, L, desde, hasta }) => {
  const T = tiempos(L);
  const tomas: Toma[] = [
    { t: desde - 1, x: 540, y: 820, z: 1.0 },
    { t: T.sistema - 0.35, x: 540, y: 900, z: 1.1, d: 0.7 },
    { t: T.pedir - 0.45, x: 540, y: 1250, z: 1.0, d: 0.8 },
    { t: T.tu - 0.35, x: 540, y: TAREA.y - 20, z: 1.1, d: 0.9 },
    { t: T.mas - 0.1, x: 540, y: TAREA.y, z: 1.16, d: 0.8 },
  ];
  const nodoAt = [T.pedir, T.revisar, T.corregir];
  const logoSrc = ep.logos.wordpress;
  // la base sube por debajo de los tres proyectos
  const base = sp(t, T.montas - 0.05, { damping: 14, stiffness: 150 });
  // punto de luz que recorre el ciclo cuando ya está completo
  const vuelta = t > T.corregir + 0.3 ? ((t - (T.corregir + 0.3)) / 1.6) % 1 : -1;
  // cursor de la tarea: pasa por los tres proyectos
  const paradas = [T.cual, T.los, T.tres];
  const xs = [270, 540, 810];
  let cx = 900;
  for (let k = 0; k < 3; k++) cx += (xs[k] - cx) * EASE(clamp01((t - paradas[k] + 0.15) / 0.35));
  const hover = (k: number) => (t >= paradas[k] && (k === 2 || t < paradas[k + 1]) && t < T.llama ? 1 : 0);
  const todos = ramp(t, T.mas - 0.1, T.mas + 0.2);
  return (
    <Escena t={t} tomas={tomas}>
      {/* «todo eso»: los tres proyectos */}
      {[0, 1, 2].map((i) => (
        <Baldosa key={i} i={i} x={330 + i * 210} y={640} t={t} at={desde - 0.3 + i * 0.08} out={T.pedir + 0.2} logo={logoSrc} on={0.35 * ramp(t, T.eso, T.eso + 0.3) * (1 - ramp(t, T.montas, T.montas + 0.3))} />
      ))}
      {/* la base: tu sistema de trabajo */}
      {base > 0.001 && t < T.tu + 0.2 && (
        <div style={{ position: "absolute", left: 160, top: 760, width: 760, height: 120, borderRadius: 28, background: `linear-gradient(180deg, ${C.acento}, #B85F42)`, boxShadow: `0 24px 70px ${C.acento}55`, transform: `translateY(${(1 - base) * 160}px) scaleX(${0.6 + 0.4 * base})`, opacity: Math.min(1, base * 1.6) * (1 - ramp(t, T.tu - 0.25, T.tu + 0.15)), display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: TITULO, fontWeight: 800, fontSize: 46, color: C.oscuro, letterSpacing: 1, opacity: ramp(t, T.sistema - 0.1, T.sistema + 0.25), whiteSpace: "nowrap" }}>TU SISTEMA DE TRABAJO</span>
        </div>
      )}
      <Etiqueta texto="ANTES DE TODO ESO" x={540} y={490} t={t} at={T.ini + 0.05} out={T.pedir} size={34} variante="gris" />
      {/* ciclo */}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: 1 - ramp(t, T.tu - 0.25, T.tu + 0.15) }}>
        <defs>
          <marker id="puntaCiclo" viewBox="0 0 10 10" refX={6} refY={5} markerWidth={5} markerHeight={5} orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" fill={C.acento} />
          </marker>
        </defs>
        {NODOS.map((n, i) => {
          const a0 = n.ang + 24;
          const a1 = NODOS[(i + 1) % 3].ang + 360 * (i === 2 ? 1 : 0) - 24;
          const p0 = pos(a0);
          const p1 = pos(a1);
          const at = nodoAt[(i + 1) % 3] - 0.25;
          const p = i === 2 ? ramp(t, T.corregir + 0.1, T.corregir + 0.55) : ramp(t, at, at + 0.4);
          if (p <= 0) return null;
          return <path key={i} d={`M ${p0.x} ${p0.y} A ${CICLO.r} ${CICLO.r} 0 0 1 ${p1.x} ${p1.y}`} fill="none" stroke={C.acento} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} markerEnd={p > 0.95 ? "url(#puntaCiclo)" : undefined} opacity={0.9} />;
        })}
      </svg>
      {vuelta >= 0 && (() => {
        const p = pos(-90 + vuelta * 360);
        return <div style={{ position: "absolute", left: p.x - 16, top: p.y - 16, width: 32, height: 32, borderRadius: "50%", background: C.acentoSuave, boxShadow: `0 0 30px ${C.acento}, 0 0 60px ${C.acento}`, opacity: 1 - ramp(t, T.tu - 0.2, T.tu + 0.2) }} />;
      })()}
      {NODOS.map((n, i) => {
        const p = pos(n.ang);
        const v = vis(t, nodoAt[i] - 0.08, T.tu + 0.15, 0.4);
        if (!v.on) return null;
        const brillo = Math.sin(clamp01((t - nodoAt[i]) / 0.5) * Math.PI);
        const Icono = i === 0 ? Comentario : i === 1 ? Lupa : LlaveInglesa;
        return (
          <div key={n.id} style={{ position: "absolute", left: p.x, top: p.y, width: 0, height: 0, opacity: v.opacity }}>
            <div style={{ position: "absolute", transform: `translate(-50%, -50%) scale(${v.scale * (1 + 0.12 * brillo)})`, display: "flex", alignItems: "center", gap: 14, padding: "18px 30px 18px 22px", borderRadius: 999, whiteSpace: "nowrap", background: brillo > 0.2 ? C.acento : C.panel2, border: `4px solid ${C.acento}`, boxShadow: `0 0 ${40 * brillo}px ${C.acento}AA, 0 16px 40px rgba(0,0,0,0.5)`, fontFamily: TITULO, fontWeight: 800, fontSize: 42, color: brillo > 0.2 ? C.oscuro : C.texto }}>
              <Icono s={46} c={brillo > 0.2 ? C.oscuro : C.texto} />
              {n.texto}
            </div>
          </div>
        );
      })}
      <Etiqueta texto="EL CICLO" x={CICLO.x} y={CICLO.y} t={t} at={T.corregir + 0.35} out={T.tu + 0.15} size={40} variante="gris" />

      {/* tarea */}
      <Tarjeta x={TAREA.x} y={TAREA.y} w={880} h={540} t={t} at={T.tu - 0.1} activa={todos} out={hasta}>
        {(() => {
          const s = sp(t, T.tarea - 0.05, { damping: 14, stiffness: 200 });
          return (
            <div style={{ position: "absolute", left: 40, top: 34, display: "flex", alignItems: "center", gap: 14, opacity: Math.min(1, s * 1.5), transform: `translateX(${(1 - s) * -20}px)` }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, border: `4px solid ${C.acento}` }} />
              <span style={{ fontFamily: UI, fontWeight: 700, fontSize: 34, letterSpacing: 2, color: C.gris }}>TU TAREA</span>
            </div>
          );
        })()}
        {(() => {
          const s = sp(t, T.elige - 0.05, { damping: 11, stiffness: 220 });
          if (t < T.elige - 0.05) return null;
          return (
            <div style={{ position: "absolute", left: 0, right: 0, top: 96, textAlign: "center", fontFamily: TITULO, fontWeight: 800, fontSize: 96, letterSpacing: 1, color: C.texto, opacity: Math.min(1, s * 1.6), transform: `scale(${1.5 - 0.5 * s})` }}>
              ELIGE <span style={{ color: C.acento }}>UNO</span>
            </div>
          );
        })()}
      </Tarjeta>
      {[0, 1, 2].map((i) => (
        <Baldosa key={i} i={i} x={xs[i]} y={TAREA.y + 90} s={170} t={t} at={T.elige + 0.15 + i * 0.08} logo={logoSrc} on={Math.max(hover(i), todos * (0.6 + 0.4 * Math.max(0, Math.sin((t - T.mas) * 6 - i))))} rotulo={["WEB", "AUTOMATIZACIÓN", "MINI-APP"][i]} out={hasta} />
      ))}
      {t > T.cual - 0.4 && t < hasta && (
        <div style={{ position: "absolute", left: cx + 20, top: TAREA.y + 120 + Math.sin(t * 3) * 6, opacity: ramp(t, T.cual - 0.4, T.cual - 0.1) * (1 - ramp(t, T.mas, T.mas + 0.3)) }}>
          <Cursor s={74} />
        </div>
      )}
    </Escena>
  );
};

export const eventosSistema = (L: Linea): Evento[] => {
  const T = tiempos(L);
  return [
    { t: T.montas, sfx: "whoosh", vol: 0.3 },
    { t: T.pedir, sfx: "pop", vol: 0.4 },
    { t: T.revisar, sfx: "pop", vol: 0.4 },
    { t: T.corregir, sfx: "pop", vol: 0.4 },
    { t: T.elige, sfx: "golpe", vol: 0.35 },
    { t: T.mas, sfx: "tick", vol: 0.45 },
  ];
};
