import React from "react";
import { AbsoluteFill } from "remotion";
import { C, EASE_OUT, EV, GOTA, MONO, S, clamp01, ramp } from "../theme";
import { Cam, V3, b2t, plateCam, project } from "./camara";
import { WireState } from "./estado";

const FREEZE_CAM = plateCam(GOTA, GOTA.freeze);

/**
 * «No va a caer»: an orange dimension line measuring the millimetre between the bottom of the drop and the water,
 * drawn on the frozen plate (same camera, so it sits exactly on the gap). Extension lines, arrows from outside
 * (the gap is too small for them inside), and «1 mm» on «caer».
 */
export const Cota: React.FC<{ t: number }> = ({ t }) => {
  const fadeOut = 1 - ramp(t, EV.noExiste - 0.1, EV.noExiste);
  if (t < EV.cota || fadeOut <= 0) return null;
  const xo = GOTA.dropHalfWidth + 0.0028;                                // the dimension line, to the right of the drop
  const top = project(FREEZE_CAM, b2t([xo, 0, GOTA.dropBottom]));
  const bot = project(FREEZE_CAM, b2t([xo, 0, GOTA.underFreeze]));
  const topIn = project(FREEZE_CAM, b2t([0.0004, 0, GOTA.dropBottom]));
  const botIn = project(FREEZE_CAM, b2t([0.0006, 0, GOTA.underFreeze]));
  const ext = EASE_OUT(clamp01((t - EV.cota) / 0.22));
  const line = EASE_OUT(clamp01((t - EV.cota - 0.12) / 0.25));
  const lab = EASE_OUT(clamp01((t - EV.cotaLabel) / 0.2));
  const x = top[0];
  const arrow = (y: number, dir: 1 | -1) => `M ${x} ${y} L ${x - 9} ${y - dir * 18} L ${x + 9} ${y - dir * 18} Z`;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: fadeOut }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* extension lines from the drop's bottom and from the water surface */}
        <line x1={topIn[0]} y1={topIn[1]} x2={topIn[0] + (top[0] + 22 - topIn[0]) * ext} y2={top[1]} stroke={C.orangeSoft} strokeWidth={2} />
        <line x1={botIn[0]} y1={botIn[1]} x2={botIn[0] + (bot[0] + 22 - botIn[0]) * ext} y2={bot[1]} stroke={C.orangeSoft} strokeWidth={2} />
        {line > 0 && (
          <g opacity={line}>
            <line x1={x} y1={top[1] - 70 * line} x2={x} y2={top[1]} stroke={C.orange} strokeWidth={3} />
            <line x1={x} y1={bot[1]} x2={x} y2={bot[1] + 70 * line} stroke={C.orange} strokeWidth={3} />
            <path d={arrow(top[1], 1)} fill={C.orange} />
            <path d={arrow(bot[1], -1)} fill={C.orange} />
          </g>
        )}
        {lab > 0 && <line x1={x} y1={(top[1] + bot[1]) / 2} x2={x + 60 * lab} y2={(top[1] + bot[1]) / 2} stroke={C.orange} strokeWidth={2} />}
      </svg>
      {lab > 0 && (
        <div style={{
          position: "absolute", left: x + 72, top: (top[1] + bot[1]) / 2 - 44, fontFamily: MONO, opacity: lab, translate: `${(1 - lab) * -12}px 0px`,
          background: "rgba(5,5,5,0.7)", padding: "6px 14px 8px", borderLeft: `3px solid ${C.orange}`,
        }}>
          <div style={{ fontSize: 46, fontWeight: 700, color: C.orange, lineHeight: 1.05, letterSpacing: 1 }}>1 mm</div>
          <div style={{ fontSize: 20, fontWeight: 500, color: C.grey, letterSpacing: 4 }}>HASTA EL AGUA</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

type Tag = { at: number; text: string; anchor: V3; dx: number; dy: number };
// «ni el agua, ni el grifo, ni su reflejo»: each one switched off on its word, with a struck-through tag beside it
const TAGS: Tag[] = [
  { at: EV.offAgua, text: "AGUA", anchor: [-0.03, 0, 0.018], dx: -40, dy: 40 },
  { at: EV.offGrifo, text: "GRIFO", anchor: b2t([-0.0135, 0, GOTA.hMouth + 0.004]), dx: -40, dy: 60 },
  { at: EV.offReflejo, text: "REFLEJO", anchor: b2t([0.0028, 0, -0.0045]), dx: 80, dy: 10 },
];

export const Tachados: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const gone = 1 - ramp(t, EV.relight - 0.05, EV.relight + 0.25);
  if (t < EV.offAgua || gone <= 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: gone }}>
      {TAGS.map((g, i) => {
        const p = EASE_OUT(clamp01((t - g.at) / 0.18));
        if (p <= 0) return null;
        const strike = EASE_OUT(clamp01((t - g.at - 0.1) / 0.2));
        const [x, y] = project(cam, g.anchor);
        const left = Math.min(860, Math.max(90, x + g.dx));
        const top = Math.min(1150, Math.max(340, y + g.dy));
        return (
          <div key={i} style={{ position: "absolute", left, top, fontFamily: MONO, opacity: p, translate: `0px ${(1 - p) * 10}px` }}>
            <div style={{ position: "relative", fontSize: 34, fontWeight: 700, letterSpacing: 6, color: C.white, background: "rgba(5,5,5,0.72)", padding: "4px 12px" }}>
              {g.text}
              <div style={{ position: "absolute", left: 6, top: "52%", height: 4, width: `calc(${strike * 100}% - 12px)`, background: C.orange, boxShadow: `0 0 10px ${C.orange}` }} />
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

type Callout = { at: number; anchor: (s: WireState) => V3; box: [number, number]; side: "left" | "right"; lines: string[] };
const R_REM = GOTA.rContact;
// «Todo eso lo ha calculado un ordenador»: four call-outs, each on its syllable, pinned to the wire
const CALLOUTS: Callout[] = [
  { at: EV.ann1, box: [640, 360], side: "right", lines: ["TENSIÓN SUPERFICIAL", "γ = 0,072 N/m"], anchor: () => b2t([R_REM * 0.62, 0, GOTA.hMouth - 0.0011]) },
  { at: EV.ann2, box: [40, 560], side: "left", lines: ["PERFIL DE YOUNG-LAPLACE", "Δp = γ (1/R₁ + 1/R₂)"], anchor: () => b2t([-R_REM * 0.85, 0, (GOTA.hMouth + GOTA.remTip) / 2]) },
  { at: EV.ann3, box: [660, 760], side: "right", lines: ["ÍNDICE DE REFRACCIÓN", "IOR 1,333"], anchor: (s) => [GOTA.dropHalfWidth * 0.7, (GOTA.dropBottom + GOTA.dropTop) / 2 + s.dropDy, 0.0005] },
  { at: EV.ann4, box: [60, 900], side: "left", lines: ["VELOCIDAD DE CAÍDA", `v = ${GOTA.vFreeze.toFixed(2).replace(".", ",")} m/s`], anchor: (s) => [-GOTA.dropHalfWidth * 0.8, GOTA.dropBottom + 0.0006 + s.dropDy, 0] },
];
const BOX_W = 380;

/** Engineering call-outs pinned to the wire: a dot on the part, a leader, two lines of mono text. */
export const Llamadas: React.FC<{ t: number; s: WireState }> = ({ t, s }) => {
  const fade = 1 - ramp(t, S.S4 - 0.1, S.S4 + 0.3);
  if (t < EV.ann1 || fade <= 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {CALLOUTS.map((c, i) => {
          const p = EASE_OUT(clamp01((t - c.at) / 0.3));
          if (p <= 0) return null;
          const [x, y] = project(s.cam, c.anchor(s));
          const bx = c.side === "right" ? c.box[0] : c.box[0] + BOX_W;
          const by = c.box[1] + 38;
          return (
            <g key={i} opacity={fade}>
              <circle cx={x} cy={y} r={7} fill={C.orange} />
              <circle cx={x} cy={y} r={14 + 10 * (1 - p)} fill="none" stroke={C.orange} strokeWidth={2} opacity={0.6 * (1 - p) + 0.25} />
              <line x1={x} y1={y} x2={x + (bx - x) * p} y2={y + (by - y) * p} stroke={C.orangeSoft} strokeWidth={2} />
            </g>
          );
        })}
      </svg>
      {CALLOUTS.map((c, i) => {
        const p = EASE_OUT(clamp01((t - c.at - 0.1) / 0.3));
        if (p <= 0) return null;
        const right = c.side === "right";
        return (
          <div key={i} style={{
            position: "absolute", left: c.box[0], top: c.box[1], width: BOX_W, boxSizing: "border-box", fontFamily: MONO,
            textAlign: right ? "left" : "right", opacity: p * fade, translate: `${(1 - p) * (right ? -14 : 14)}px 0px`,
            background: "rgba(5,5,5,0.8)", padding: "8px 14px", borderLeft: right ? `3px solid ${C.orange}` : undefined,
            borderRight: right ? undefined : `3px solid ${C.orange}`,
          }}>
            {c.lines.map((l, k) => (
              <div key={k} style={{ fontSize: k === 0 ? 20 : 30, fontWeight: k === 0 ? 500 : 700, letterSpacing: k === 0 ? 3 : 0.5, color: k === 0 ? C.grey : C.white, lineHeight: 1.35, whiteSpace: "nowrap" }}>{l}</div>
            ))}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
