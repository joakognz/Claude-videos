import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, GloboData, MONO } from "../theme";
import { Globo3D } from "./Globo3D";
import { Backdrop, Grain, HudFrame, Vignette } from "./Hud";
import { countdownState } from "./countdown";

export type CuentaAtrasProps = {
  data: GloboData; // per-frame curves from scripts/build.py (counter, needle, dimple, camera)
  hudTag?: string;
  label?: string;
  showCounter?: boolean;
  /** Override the frame (used by the motion-blur subframe composition). */
  frameOverride?: number;
  /** Fractional frame for the 3D only (camera, needle), so subframes blur the motion and nothing else. */
  subFrame?: number;
};

/** Three-digit countdown (JetBrains Mono Bold ≈190 px) with its label; flickers on each hundred, orange at 001. */
export const Contador: React.FC<{ data: GloboData; frame: number; label: string }> = ({ data, frame, label }) => {
  const fz = Math.min(frame, data.freeze);
  const v = data.counter[fz];
  const done = v <= 10; // the last ten numbers turn orange (white before, so it reads over the orange skin)
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1270, textAlign: "center", fontFamily: MONO }}>
      <div style={{ position: "absolute", left: 140, right: 140, top: -60, height: 360, background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(5,5,5,0.78), rgba(5,5,5,0.35) 60%, rgba(5,5,5,0))" }} />
      <div style={{ position: "relative", fontSize: 28, fontWeight: 500, letterSpacing: 8, paddingLeft: 8, color: C.white, opacity: 0.75, textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>{label}</div>
      <div style={{
        position: "relative", fontSize: 190, fontWeight: 700, lineHeight: 1.05, letterSpacing: 4, color: done ? C.orange : C.white,
        textShadow: done ? "0 0 30px rgba(255,107,26,0.45), 0 6px 30px rgba(0,0,0,0.6)" : "0 6px 30px rgba(0,0,0,0.6)",
        fontVariantNumeric: "tabular-nums",
      }}>{String(v).padStart(3, "0")}</div>
    </div>
  );
};

/**
 * Block A — 7 s countdown without voice: needle, studio balloon, HUD, counter.
 * Reusable and themeless: every text comes in through props, every curve through `data`.
 */
export const GloboCuentaAtras: React.FC<CuentaAtrasProps> = ({ data, hudTag = "CAM 01", label = "CUENTA ATRÁS", showCounter = true, frameOverride, subFrame }) => {
  const current = useCurrentFrame();
  const frame = frameOverride ?? current;
  const fz = Math.min(frame, data.freeze);
  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <Backdrop />
      <Globo3D s={countdownState(data, subFrame ?? frame)} />
      {/* the floor reflection fades into the dark */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,5,5,0) 60%, rgba(5,5,5,0.55) 72%, rgba(5,5,5,0.92) 92%)", opacity: 1 - data.camMix[Math.floor(fz)] }} />
      <Vignette />
      <Grain frame={fz} />
      <HudFrame frame={frame} tcFrames={fz} tag={hudTag} />
      {showCounter && <Contador data={data} frame={frame} label={label} />}
    </AbsoluteFill>
  );
};

/**
 * Motion-blur source: `samples` subframes per frame across the dolly-in; render.sh averages each group
 * of subframes into one frame (shutter `shutter` of a frame, centred) and lays them over the main render.
 * Only the 3D moves between subframes; counter, HUD and grain are those of the whole frame.
 */
export const ZoomBlurSubframes: React.FC<{ data: GloboData }> = ({ data }) => {
  const i = useCurrentFrame();
  const { from, samples, shutter } = data.blur;
  const f = from + Math.floor(i / samples);
  const k = i % samples;
  const ft = f + ((k + 0.5) / samples - 0.5) * shutter;
  return <GloboCuentaAtras data={data} frameOverride={f} subFrame={ft} />;
};
