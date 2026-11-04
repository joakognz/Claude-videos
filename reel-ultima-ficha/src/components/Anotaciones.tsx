import React from "react";
import { AbsoluteFill } from "remotion";
import { C, EASE_OUT, EV, FICHAS, MONO, S, TL, clamp01, ramp } from "../theme";
import { Cam, V3, placeOnTile, project } from "./camara";
import { HERO } from "./escena";

/**
 * S2: a checklist of what looks real, struck through on its word as each element is revealed as a 3D structure —
 * «ni las fichas» → «ni la mesa» → «ni el sonido». Top-left, in the studio's black above the table.
 */
const ITEMS = [
  { at: EV.fichas, label: "FICHAS", mesh: `${FICHAS.N} MALLAS 3D` },
  { at: EV.mesa, label: "MESA", mesh: "1 PLANO · REJILLA" },
  { at: EV.sonido, label: "SONIDO", mesh: "ESPECTRO · 24 BANDAS" },
];
export const Tachados: React.FC<{ t: number }> = ({ t }) => {
  const out = ramp(t, S.S3, S.S3 + 0.3);
  if (t < EV.fichas - 0.1 || out >= 1) return null;
  return (
    <div style={{ position: "absolute", left: 92, top: 350, fontFamily: MONO, opacity: 1 - out }}>
      {ITEMS.map((it, i) => {
        const inP = EASE_OUT(clamp01((t - it.at + 0.06) / 0.18));
        if (inP <= 0) return null;
        const strike = EASE_OUT(clamp01((t - it.at - 0.18) / 0.22));
        const mesh = EASE_OUT(clamp01((t - it.at - 0.32) / 0.25));
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, height: 62, opacity: inP, translate: `${(1 - inP) * -16}px 0px` }}>
            <div style={{ position: "relative", fontSize: 34, fontWeight: 700, letterSpacing: 4, color: strike > 0.5 ? C.grey : C.white }}>
              {it.label}
              <div style={{ position: "absolute", left: -6, top: "52%", height: 4, width: `calc(${strike * 100}% + 12px)`, background: C.orange, boxShadow: `0 0 10px ${C.orange}` }} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: 3, color: C.orangeSoft, opacity: mesh, translate: `${(1 - mesh) * -10}px 0px` }}>→ {it.mesh}</div>
          </div>
        );
      })}
    </div>
  );
};

type Callout = { at: number; title: string; value: string };
const fmt = (v: number, d: number) => v.toFixed(d).replace(".", ",");
const CALL: Record<string, Callout> = Object.fromEntries(TL.anot.map((a) => [a.k, {
  at: a.t,
  title: a.k === "angulo" ? "ÁNGULO DE CAÍDA" : a.k === "onda" ? "VELOCIDAD DE LA ONDA" : "SEPARACIÓN",
  value: a.k === "angulo" ? `${fmt(TL.freezeDeg, 1)}°` : a.k === "onda" ? `${fmt(TL.waveSpeed, 2)} m/s` : `${Math.round(TL.spacing * 1000)} mm`,
}]));

const Box: React.FC<{ x: number; y: number; c: Callout; p: number; fade: number; side: "left" | "right" }> = ({ x, y, c, p, fade, side }) => {
  const W = 330;
  const left = Math.max(70, Math.min(1080 - 70 - W, side === "right" ? x : x - W));
  const top = Math.max(300, Math.min(1180, y));
  return (
    <div style={{
      position: "absolute", left, top, width: W, boxSizing: "border-box", fontFamily: MONO, opacity: p * fade,
      translate: `${(1 - p) * (side === "right" ? -14 : 14)}px 0px`, background: "rgba(5,5,5,0.8)", padding: "8px 14px",
      borderLeft: side === "right" ? `3px solid ${C.orange}` : undefined, borderRight: side === "left" ? `3px solid ${C.orange}` : undefined,
      textAlign: side === "right" ? "left" : "right",
    }}>
      <div style={{ fontSize: 21, fontWeight: 500, letterSpacing: 3, color: C.grey, lineHeight: 1.35, whiteSpace: "nowrap" }}>{c.title}</div>
      <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: 1, color: C.white, lineHeight: 1.15, whiteSpace: "nowrap" }}>{c.value}</div>
    </div>
  );
};

const pathD = (pts: [number, number][]) => pts.map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" ");

/**
 * S3 «Todo lo ha calculado un ordenador»: engineering call-outs pinned to the wireframe, one per syllable —
 * the fall angle drawn at the last tile's axle, the wave speed as an arrow along the chain, the spacing as a dimension.
 */
export const Cotas: React.FC<{ t: number; cam: Cam; tilts: number[] }> = ({ t, cam, tilts }) => {
  const fade = 1 - ramp(t, EV.rew0 - 0.15, EV.rew0 + 0.2);
  if (t < S.S3 || fade <= 0) return null;
  const up = (p: number[], h: number): V3 => [p[0], p[1] + h, p[2]];
  const P = (p: V3) => project(cam, p);
  // 1 · angle at the last tile
  const ca = CALL.angulo;
  const pa = EASE_OUT(clamp01((t - ca.at) / 0.35));
  const hero = FICHAS.tiles[HERO];
  const phi = tilts[HERO];
  const axle = placeOnTile(HERO, phi, hero.axle as V3);
  const Ln = 0.058;
  const vert: [number, number][] = [P(axle), P(up(axle, Ln))];
  const tip = placeOnTile(HERO, phi, up(hero.axle, Ln) as V3);
  const arc: [number, number][] = [];
  for (let k = 0; k <= 24; k++) {
    const a = (phi * k * pa) / 24;
    const r = 0.036;
    arc.push(P([axle[0] + hero.f[0] * r * Math.sin(a), axle[1] + r * Math.cos(a), axle[2] + hero.f[2] * r * Math.sin(a)]));
  }
  // 2 · wave speed: an arrow along the chain above the tiles
  const co = CALL.onda;
  const po = EASE_OUT(clamp01((t - co.at) / 0.4));
  const i0 = 14, i1 = 24;
  const wave: [number, number][] = [];
  const nWave = Math.max(2, Math.round((i1 - i0) * 4 * po) + 1);
  for (let k = 0; k < nWave; k++) {
    const u = i0 + ((i1 - i0) * k) / ((i1 - i0) * 4);
    const a = FICHAS.tiles[Math.floor(u)].c;
    const b = FICHAS.tiles[Math.min(FICHAS.N - 1, Math.floor(u) + 1)].c;
    const fr = u - Math.floor(u);
    wave.push(P([a[0] + (b[0] - a[0]) * fr, 0.06, a[2] + (b[2] - a[2]) * fr]));
  }
  const wEnd = wave[wave.length - 1];
  const wPrev = wave[Math.max(0, wave.length - 3)];
  const ang = Math.atan2(wEnd[1] - wPrev[1], wEnd[0] - wPrev[0]);
  const head = [[wEnd[0] - 22 * Math.cos(ang - 0.45), wEnd[1] - 22 * Math.sin(ang - 0.45)], wEnd, [wEnd[0] - 22 * Math.cos(ang + 0.45), wEnd[1] - 22 * Math.sin(ang + 0.45)]] as [number, number][];
  // 3 · spacing between two tiles, measured on the table at their feet
  const cs = CALL.separacion;
  const ps = EASE_OUT(clamp01((t - cs.at) / 0.35));
  const ta = FICHAS.tiles[30].c, tb = FICHAS.tiles[31].c;
  const off = (p: number[]): V3 => [p[0] - FICHAS.tiles[30].w[0] * 0.03, 0.0005, p[2] - FICHAS.tiles[30].w[2] * 0.03];
  const sA = P(off(ta));
  const sB0 = P(off(tb));
  const sB: [number, number] = [sA[0] + (sB0[0] - sA[0]) * ps, sA[1] + (sB0[1] - sA[1]) * ps];
  const tick = (q: [number, number]) => `M${q[0]} ${q[1] - 12} L${q[0]} ${q[1] + 12}`;
  const anchorA = arc[Math.floor(arc.length / 2)];
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: fade }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {pa > 0 && (
          <g>
            <path d={pathD(vert)} stroke={C.white} strokeWidth={2} strokeDasharray="7 6" fill="none" opacity={0.8 * pa} />
            <path d={pathD([P(axle), P(tip)])} stroke={C.orangeSoft} strokeWidth={2.5} fill="none" opacity={pa} />
            <path d={pathD(arc)} stroke={C.orange} strokeWidth={3.5} fill="none" />
            <circle cx={P(axle)[0]} cy={P(axle)[1]} r={6} fill={C.orange} />
          </g>
        )}
        {po > 0 && (
          <g opacity={po}>
            <path d={pathD(wave)} stroke={C.orangeSoft} strokeWidth={3} fill="none" strokeDasharray="14 8" />
            {po > 0.95 && <path d={pathD(head)} stroke={C.orangeSoft} strokeWidth={3} fill="none" strokeLinejoin="round" />}
          </g>
        )}
        {ps > 0 && (
          <g>
            <path d={`${pathD([sA, sB])} ${tick(sA)} ${ps > 0.95 ? tick(sB) : ""}`} stroke={C.white} strokeWidth={2.5} fill="none" />
          </g>
        )}
      </svg>
      {pa > 0 && <Box x={anchorA[0] + 70} y={anchorA[1] - 250} c={ca} p={pa} fade={1} side="right" />}
      {po > 0 && <Box x={Math.min(wave[0][0], wEnd[0]) - 60} y={(wave[0][1] + wEnd[1]) / 2 - 60} c={co} p={po} fade={1} side="left" />}
      {ps > 0 && <Box x={Math.min(sA[0], sB0[0]) - 60} y={(sA[1] + sB0[1]) / 2 - 20} c={cs} p={ps} fade={1} side="left" />}
    </AbsoluteFill>
  );
};
