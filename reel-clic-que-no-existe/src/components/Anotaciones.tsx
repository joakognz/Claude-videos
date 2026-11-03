import React from "react";
import { AbsoluteFill } from "remotion";
import { C, EASE_OUT, ENGR, EV, MONO, S, TL, clamp01, ramp } from "../theme";
import { Cam, V3, project } from "./camara";
import { WireState } from "./Engranajes3D";

const RA = (ENGR.module * ENGR.zA) / 2;
const RB = (ENGR.module * ENGR.zB) / 2;

type Callout = { at: number; anchor: (s: WireState) => V3; box: [number, number]; side: "left" | "right"; lines: string[] };
// three engineering call-outs, each on its own syllable of «Los ha calculado un ordenador»; the boxes sit in the
// empty corners of the exploded view, a leader runs from a dot on the part to the box
const CALLOUTS: Callout[] = [
  {
    at: TL.explode[1].t, box: [690, 430], side: "right", lines: ["ENGRANAJE A", "z 24 · m 1,0"],
    anchor: (s) => { const o = s.offsets.engranajeA ?? [0, 0, 0]; const a = (-10 * Math.PI) / 180; return [RA * Math.cos(a) + o[0], RA + RA * Math.sin(a) + o[1], 0.0026 + o[2]]; },
  },
  {
    at: TL.explode[3].t, box: [70, 960], side: "left", lines: ["ENGRANAJE B", "z 32 · m 1,0"],
    anchor: (s) => { const o = s.offsets.engranajeB ?? [0, 0, 0]; const a = (160 * Math.PI) / 180; return [RB * Math.cos(a) + o[0], -RB + RB * Math.sin(a) + o[1], 0.0031 + o[2]]; },
  },
  {
    at: TL.explode[4].t, box: [730, 800], side: "right", lines: ["PERFIL", "α 20° · evolvente"],
    anchor: (s) => { const o = s.offsets.engranajeB ?? [0, 0, 0]; return [o[0], o[1], 0.0031 + o[2]]; },
  },
];
const BOX_W = 280;

/** Engineering call-outs pinned to the exploded wireframe: a dot on the part, a leader, two lines of mono text. */
export const Cotas: React.FC<{ t: number; s: WireState; cam: Cam }> = ({ t, s, cam }) => {
  const fade = 1 - ramp(t, EV.waveTick - 0.95, EV.waveTick - 0.6); // they make room for the waveform
  if (t < S.S3 || fade <= 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {CALLOUTS.map((c, i) => {
          const p = EASE_OUT(clamp01((t - c.at) / 0.3));
          if (p <= 0) return null;
          const [x, y] = project(cam, c.anchor(s));
          const bx = c.side === "right" ? c.box[0] : c.box[0] + BOX_W;
          const by = c.box[1] + 38;
          const ex = x + (bx - x) * p;
          const ey = y + (by - y) * p;
          return (
            <g key={i} opacity={fade}>
              <circle cx={x} cy={y} r={7} fill={C.orange} />
              <circle cx={x} cy={y} r={14 + 10 * (1 - p)} fill="none" stroke={C.orange} strokeWidth={2} opacity={0.6 * (1 - p) + 0.25} />
              <line x1={x} y1={y} x2={ex} y2={ey} stroke={C.orangeSoft} strokeWidth={2} />
            </g>
          );
        })}
      </svg>
      {CALLOUTS.map((c, i) => {
        const p = EASE_OUT(clamp01((t - c.at - 0.12) / 0.3));
        if (p <= 0) return null;
        const right = c.side === "right";
        return (
          <div key={i} style={{
            position: "absolute", left: c.box[0], top: c.box[1], width: BOX_W, boxSizing: "border-box", fontFamily: MONO,
            textAlign: right ? "left" : "right", opacity: p * fade, translate: `${(1 - p) * (right ? -14 : 14)}px 0px`,
            background: "rgba(5,5,5,0.78)", padding: "8px 14px", borderLeft: right ? `3px solid ${C.orange}` : undefined,
            borderRight: right ? undefined : `3px solid ${C.orange}`,
          }}>
            {c.lines.map((l, k) => (
              <div key={k} style={{ fontSize: k === 0 ? 22 : 30, fontWeight: k === 0 ? 500 : 700, letterSpacing: k === 0 ? 4 : 1, color: k === 0 ? C.grey : C.white, lineHeight: 1.3, whiteSpace: "nowrap" }}>{l}</div>
            ))}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * «Y el sonido, [·] también»: the tick that was heard at the freeze, replayed in the breath, drawn as it plays —
 * the envelope of the synthesised sample (TL.tickWave) as mirrored bars, revealed left → right in sync.
 */
export const OndaClic: React.FC<{ t: number }> = ({ t }) => {
  const appear = ramp(t, EV.waveTick - 0.35, EV.waveTick - 0.05, EASE_OUT);
  const gone = ramp(t, S.S4 - 0.15, S.S4 + 0.25);
  if (appear <= 0 || gone >= 1) return null;
  const w = TL.tickWave;
  const n = w.length;
  const dur = 0.45; // TL.tickWave spans the first 0.45 s of the sample
  const head = clamp01((t - EV.waveTick) / dur) * n;
  const W = 900;
  const H = 150;
  const bw = W / n;
  return (
    <div style={{
      position: "absolute", left: 90, top: 975, width: W, height: H + 54, opacity: appear * (1 - gone), fontFamily: MONO,
      translate: `0px ${(1 - appear) * 20}px`,
    }}>
      <div style={{ position: "absolute", inset: -14, background: "rgba(5,5,5,0.75)", border: "1.5px solid rgba(138,138,138,0.45)", borderRadius: 6 }} />
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 4, color: C.grey, height: 40 }}>
        <span><span style={{ color: C.orange }}>●</span>&nbsp; CLIC.WAV</span>
        <span>SINTETIZADO · 0,45 s</span>
      </div>
      <svg width={W} height={H} style={{ position: "relative" }}>
        <line x1={0} x2={W} y1={H / 2} y2={H / 2} stroke="rgba(138,138,138,0.5)" strokeWidth={1.5} />
        {w.map((v, i) => {
          const on = i < head;
          const h = Math.max(2, v * (H / 2 - 6));
          return <rect key={i} x={i * bw + bw * 0.18} width={bw * 0.64} y={H / 2 - h} height={2 * h} rx={bw * 0.3} fill={on ? C.orange : "rgba(138,138,138,0.28)"} />;
        })}
        {head > 0 && head < n && <rect x={head * bw - 1.5} width={3} y={0} height={H} fill={C.orangeSoft} />}
      </svg>
    </div>
  );
};
