import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, EngrData, MONO, clamp01 } from "../theme";
import { Placa } from "./Placa";
import { Grain, HudFrame, Vignette } from "./Hud";
import { b2t, plateCam, project } from "./camara";

export type CuentaAtrasProps = {
  data: EngrData; // per-frame curves from scripts/build.py (counter, gap, gear angles, camera, heartbeat)
  hudTag?: string;
  label?: string;
  doneLabel?: string;
  showCounter?: boolean;
  /** Override the frame (e.g. to show a held frame). */
  frameOverride?: number;
};

/** Heartbeat envelope at frame f: a sharp thump on every beat (data.beats, in frames), decaying in ~3 frames. */
export const beatPulse = (data: EngrData, f: number) => {
  let v = 0;
  for (const b of data.beats) {
    const x = f - b;
    if (x >= 0 && x < 12) v = Math.max(v, Math.exp(-x / 2.6));
  }
  return v;
};

/** Three-digit countdown (JetBrains Mono Bold 170 px): one number per frame, thumping on each heartbeat, orange for the last ten. */
export const Contador: React.FC<{ data: EngrData; frame: number; label: string; doneLabel: string }> = ({ data, frame, label, doneLabel }) => {
  const fz = Math.min(frame, data.freeze);
  const v = data.counter[fz];
  const hot = v <= 10;
  const done = frame >= data.freeze;
  const pulse = done ? 0 : beatPulse(data, frame);
  const flash = done ? Math.exp(-(frame - data.freeze) / 4) : 0;
  return (
    <div style={{ position: "absolute", right: 70, top: 1290, width: 460, textAlign: "right", fontFamily: MONO }}>
      <div style={{ position: "absolute", left: 0, right: -70, top: -70, height: 360, background: "radial-gradient(ellipse 60% 52% at 62% 50%, rgba(5,5,5,0.72), rgba(5,5,5,0))" }} />
      <div style={{
        position: "relative", fontSize: 26, fontWeight: done ? 700 : 500, letterSpacing: 7, color: done ? C.orange : C.white,
        opacity: done ? 1 : 0.75, textShadow: done ? "0 0 18px rgba(255,107,26,0.6)" : "0 2px 12px rgba(0,0,0,0.8)",
      }}>{done ? doneLabel : label}</div>
      <div style={{
        position: "relative", fontSize: 170, fontWeight: 700, lineHeight: 1.05, letterSpacing: 2, color: hot ? C.orange : C.white,
        scale: String(1 + 0.065 * pulse + 0.05 * flash), transformOrigin: "100% 60%",
        textShadow: hot
          ? `0 0 ${30 + 40 * flash}px rgba(255,107,26,${0.45 + 0.4 * flash}), 0 6px 30px rgba(0,0,0,0.6)`
          : `0 0 ${24 * pulse}px rgba(255,255,255,${0.35 * pulse}), 0 6px 30px rgba(0,0,0,0.6)`,
        fontVariantNumeric: "tabular-nums",
      }}>{String(v).padStart(3, "0")}</div>
    </div>
  );
};

/** The "tiiick" of the freeze: a thin ring of light opening from the contact point between the teeth. */
export const AnilloClic: React.FC<{ x: number; y: number; t: number; strong?: number }> = ({ x, y, t, strong = 1 }) => {
  if (t < 0 || t > 0.9) return null;
  const p = clamp01(t / 0.75);
  const e = 1 - Math.pow(1 - p, 3);
  const rings = [0, 0.12];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{
        position: "absolute", left: x - 140, top: y - 140, width: 280, height: 280, borderRadius: 140,
        background: "radial-gradient(circle, rgba(255,240,225,0.85), rgba(255,176,102,0.25) 30%, rgba(255,107,26,0) 62%)",
        opacity: strong * Math.exp(-t / 0.09), mixBlendMode: "screen",
      }} />
      {rings.map((d, i) => {
        const q = clamp01((t - d) / 0.75);
        if (q <= 0 || q >= 1) return null;
        const r = 18 + (i === 0 ? 260 : 190) * (1 - Math.pow(1 - q, 3));
        return (
          <div key={i} style={{
            position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: r, boxSizing: "border-box",
            border: `${(i === 0 ? 3.5 : 2) * (1 - 0.6 * q)}px solid ${i === 0 ? C.orangeSoft : C.white}`,
            opacity: strong * (1 - q) * (i === 0 ? 0.95 : 0.6), boxShadow: `0 0 18px rgba(255,107,26,${0.5 * (1 - e)})`,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

/** Where the teeth touch on the frozen frame (px). */
export const contactPx = (data: EngrData) => project(plateCam(data, data.freeze), b2t([0, -0.0028, 0]));

/**
 * Block A — 7 s countdown without voice: two gears engaging in macro, heartbeat HUD, counter.
 * Reusable and themeless: every text comes in through props, every curve through `data`.
 */
export const EngranajesCuentaAtras: React.FC<CuentaAtrasProps> = ({
  data, hudTag = "CAM 01", label = "ENCAJE EN", doneLabel = "ENCAJADO", showCounter = true, frameOverride,
}) => {
  const current = useCurrentFrame();
  const frame = frameOverride ?? current;
  const fz = Math.min(frame, data.freeze);
  const pulse = frame < data.freeze ? beatPulse(data, frame) : 0;
  const [cx, cy] = contactPx(data);
  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <Placa data={data} frame={frame} />
      {/* the heartbeat squeezes the frame edges a touch */}
      <Vignette strength={0.55 + 0.2 * pulse} />
      <Grain frame={fz} />
      <HudFrame frame={frame} tcFrames={fz} tag={hudTag} />
      {showCounter && <Contador data={data} frame={frame} label={label} doneLabel={doneLabel} />}
      <AnilloClic x={cx} y={cy} t={(frame - data.freeze) / data.fps} />
    </AbsoluteFill>
  );
};
