import React from "react";
import { AbsoluteFill } from "remotion";
import { C, EASE_IN, EV, LOGO, S, TL, clamp01, ramp, springAt } from "../theme";
import { Logo } from "./Logo";

/** CRT power-off applied to the whole stage: collapse to a line, then to a dot. */
export const crtStyle = (t: number): React.CSSProperties => {
  if (t < S.C) return {};
  const p1 = clamp01((t - S.C) / 0.18);
  const p2 = clamp01((t - S.C - 0.18) / 0.12);
  return {
    transform: `scale(${1 - 0.997 * EASE_IN(p2)}, ${1 - 0.996 * EASE_IN(p1)})`,
    filter: `brightness(${1 + 0.6 * p1})`,
    opacity: t > S.C + 0.36 ? 0 : 1,
  };
};

/** Block C: CRT off to #0A0A0A, AIgencyx Labs logo and @aigencyx.labs. */
export const Cierre: React.FC<{ t: number }> = ({ t }) => {
  if (t < S.C) return null;
  const dot = ramp(t, S.C + 0.28, S.C + 0.45);
  const s1 = springAt(t, EV.logo, 13, 150);
  const s2 = springAt(t, EV.logo + 0.25, 13, 150);
  const breathe = 1 + 0.06 * ramp(t, EV.logo, TL.durationInFrames / TL.fps);
  return (
    <AbsoluteFill style={{ background: t < S.C + 0.36 ? "transparent" : C.end, pointerEvents: "none" }}>
      {dot > 0 && dot < 1 && <div style={{ position: "absolute", left: 534, top: 954, width: 12, height: 12, borderRadius: 6, background: C.white, opacity: 1 - dot, boxShadow: `0 0 30px ${C.orangeSoft}` }} />}
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", opacity: clamp01(s1 * 1.5), scale: String((0.7 + 0.3 * s1) * breathe) }}>
        <Logo size={360} />
      </div>
      <div style={{
        position: "absolute", left: 0, right: 0, top: 1080, textAlign: "center", fontFamily: LOGO, fontWeight: 800, fontSize: 68, color: C.orange,
        opacity: clamp01(s2 * 1.5), translate: `0px ${(1 - s2) * 30}px`, textShadow: "0 0 30px rgba(255,107,26,0.35)",
      }}>@aigencyx.labs</div>
    </AbsoluteFill>
  );
};
