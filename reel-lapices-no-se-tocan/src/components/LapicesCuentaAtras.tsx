import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, LapizData, MONO } from "../theme";
import { Placa } from "./Placa";
import { Grain, HudFrame, Vignette } from "./Hud";

export type CuentaAtrasProps = {
  data: LapizData; // per-frame curves from scripts/build.py (counter, needle, dimple, camera)
  hudTag?: string;
  label?: string;
  showCounter?: boolean;
  /** Override the frame (e.g. to show a held frame). */
  frameOverride?: number;
};

/** Three-digit countdown (JetBrains Mono Bold 170 px) with its label, one number per frame, orange for the last ten. */
export const Contador: React.FC<{ data: LapizData; frame: number; label: string }> = ({ data, frame, label }) => {
  const fz = Math.min(frame, data.freeze);
  const v = data.counter[fz];
  const done = v <= 10; // the last ten numbers turn orange (white before, so it reads over the orange skin)
  return (
    // beside the gap, where the two points are thinnest, so it never covers the tips
    <div style={{ position: "absolute", right: 64, top: 716, width: 440, textAlign: "right", fontFamily: MONO }}>
      <div style={{ position: "absolute", left: 40, right: -64, top: -50, height: 330, background: "radial-gradient(ellipse 55% 50% at 60% 50%, rgba(5,5,5,0.6), rgba(5,5,5,0))" }} />
      <div style={{ position: "relative", fontSize: 26, fontWeight: 500, letterSpacing: 7, color: C.white, opacity: 0.75, textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>{label}</div>
      <div style={{
        position: "relative", fontSize: 170, fontWeight: 700, lineHeight: 1.05, letterSpacing: 2, color: done ? C.orange : C.white,
        textShadow: done ? "0 0 30px rgba(255,107,26,0.45), 0 6px 30px rgba(0,0,0,0.6)" : "0 6px 30px rgba(0,0,0,0.6)",
        fontVariantNumeric: "tabular-nums",
      }}>{String(v).padStart(3, "0")}</div>
    </div>
  );
};

/**
 * Block A — 7 s countdown without voice: two sharpened pencils closing in, HUD, counter.
 * Reusable and themeless: every text comes in through props, every curve through `data`.
 */
export const LapicesCuentaAtras: React.FC<CuentaAtrasProps> = ({ data, hudTag = "CAM 01", label = "CUENTA ATRÁS", showCounter = true, frameOverride }) => {
  const current = useCurrentFrame();
  const frame = frameOverride ?? current;
  const fz = Math.min(frame, data.freeze);
  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <Placa data={data} frame={frame} />
      <Vignette />
      <Grain frame={fz} />
      <HudFrame frame={frame} tcFrames={fz} tag={hudTag} />
      {showCounter && <Contador data={data} frame={frame} label={label} />}
    </AbsoluteFill>
  );
};
