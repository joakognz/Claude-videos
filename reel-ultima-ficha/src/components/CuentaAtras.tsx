import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, FichasData, MONO } from "../theme";
import { Placa } from "./Placa";
import { Grain, HudFrame, Vignette } from "./Hud";

export type CuentaAtrasProps = {
  data: FichasData; // per-frame curves from scripts/cuenta.py (counter, tilts, camera, heartbeat)
  hudTag?: string;
  label?: string;
  doneLabel?: string;
  showCounter?: boolean;
  frameOverride?: number;
};

/** Heartbeat envelope at frame f: a sharp thump on every beat (data.beats, in frames), decaying in ~3 frames. */
export const beatPulse = (data: FichasData, f: number) => {
  let v = 0;
  for (const b of data.beats) {
    const x = f - b;
    if (x >= 0 && x < 12) v = Math.max(v, Math.exp(-x / 2.6));
  }
  return v;
};

/**
 * Three-digit countdown (JetBrains Mono Bold 170 px): one number per frame, thumping on each heartbeat, orange for the
 * last ten. From the freeze on it is completely still («CONGELADA», 001): only the REC dot keeps blinking.
 */
export const Contador: React.FC<{ data: FichasData; frame: number; label: string; doneLabel: string }> = ({ data, frame, label, doneLabel }) => {
  const fz = Math.min(frame, data.freeze);
  const v = data.counter[fz];
  const hot = v <= 10;
  const done = frame >= data.freeze;
  const pulse = done ? 0 : beatPulse(data, frame);
  return (
    <div style={{ position: "absolute", right: 70, top: 1350, width: 520, textAlign: "right", fontFamily: MONO }}>
      <div style={{ position: "absolute", left: 0, right: -70, top: -70, height: 360, background: "radial-gradient(ellipse 60% 52% at 62% 50%, rgba(5,5,5,0.72), rgba(5,5,5,0))" }} />
      <div style={{
        position: "relative", fontSize: 26, fontWeight: done ? 700 : 500, letterSpacing: 7, color: done ? C.orange : C.white,
        opacity: done ? 1 : 0.78, textShadow: done ? "0 0 18px rgba(255,107,26,0.6)" : "0 2px 12px rgba(0,0,0,0.8)",
      }}>{done ? doneLabel : label}</div>
      <div style={{
        position: "relative", fontSize: 170, fontWeight: 700, lineHeight: 1.05, letterSpacing: 2, color: hot ? C.orange : C.white,
        scale: String(1 + 0.065 * pulse), transformOrigin: "100% 60%",
        textShadow: hot
          ? "0 0 34px rgba(255,107,26,0.5), 0 6px 30px rgba(0,0,0,0.6)"
          : `0 0 ${24 * pulse}px rgba(255,255,255,${0.35 * pulse}), 0 6px 30px rgba(0,0,0,0.6)`,
        fontVariantNumeric: "tabular-nums",
      }}>{String(v).padStart(3, "0")}</div>
    </div>
  );
};

/**
 * Block A — 7 s countdown without voice: a domino chain falling toward the camera in path-traced slow motion,
 * heartbeat HUD, counter. Reusable and themeless: every text comes in through props, every curve through `data`.
 */
export const CuentaAtras: React.FC<CuentaAtrasProps> = ({
  data, hudTag = "CAM 01", label = "ÚLTIMA FICHA EN", doneLabel = "CONGELADA", showCounter = true, frameOverride,
}) => {
  const current = useCurrentFrame();
  const frame = frameOverride ?? current;
  const fz = Math.min(frame, data.freeze);
  const pulse = frame < data.freeze ? beatPulse(data, frame) : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <Placa data={data} frame={frame} />
      {/* the heartbeat squeezes the frame edges a touch */}
      <Vignette strength={0.5 + 0.22 * pulse} />
      <Grain frame={fz} />
      <HudFrame frame={frame} tcFrames={fz} tag={hudTag} />
      {showCounter && <Contador data={data} frame={frame} label={label} doneLabel={doneLabel} />}
    </AbsoluteFill>
  );
};
