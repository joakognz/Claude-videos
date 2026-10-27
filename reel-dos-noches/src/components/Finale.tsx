import React from "react";
import { spring } from "remotion";
import { C, CAP, FPS, SANS, clamp01, drift, rgba, EASE_OUT } from "../theme";
import { MERGE_AT } from "../layout";
import { Logo } from "./Logo";

/** E9 call to action under the clock (inside the safe zone). */
export const CTA: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const w = CAP.S9b.words;
  const t0 = w[0].start - 0.04;
  const t1 = w[1].start - 0.04;
  if (t < t0 - 0.1) return null;
  const s0 = spring({ frame: frame - t0 * FPS, fps: FPS, config: { damping: 14, stiffness: 160 } });
  const s1 = spring({ frame: frame - t1 * FPS, fps: FPS, config: { damping: 9, stiffness: 170, mass: 0.8 } });
  const sub = EASE_OUT(clamp01((t - t1 - 0.35) / 0.5));
  const bob = Math.sin(t * 5) * 10;
  const glow = 0.5 + 0.5 * Math.sin(t * 3.2);
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1020, textAlign: "center", fontFamily: SANS, color: C.white }}>
      <div style={{
        fontWeight: 800, fontSize: 86, letterSpacing: 4, opacity: clamp01(s0 * 1.5), translate: `${drift(t, 131, 4)}px ${(1 - s0) * 40}px`,
        textShadow: "0 6px 30px rgba(0,0,0,0.6)",
      }}>COMENTA</div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24, marginTop: 14 }}>
        <div style={{
          padding: "6px 30px", borderRadius: 26, background: C.green, color: C.ink, fontWeight: 800, fontSize: 108, letterSpacing: 2,
          boxShadow: `0 0 ${50 + 40 * glow}px ${rgba(C.green, 0.55)}`, opacity: clamp01(s1 * 1.5), scale: String(0.5 + 0.5 * s1),
          translate: `${drift(t, 132, 4)}px 0px`,
        }}>AUDITORIA</div>
        <div style={{ fontWeight: 800, fontSize: 104, color: C.green, opacity: clamp01(s1 * 1.5), translate: `0px ${bob}px` }}>↓</div>
      </div>
      <div style={{
        marginTop: 30, fontWeight: 700, fontSize: 48, color: "rgba(255,255,255,0.88)", opacity: sub,
        translate: `${drift(t, 133, 4)}px ${(1 - sub) * 24}px`,
      }}>Te digo qué automatizar primero</div>
    </div>
  );
};

export const BrandBadge: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const t0 = MERGE_AT() + 0.55;
  if (t < t0 - 0.05) return null;
  const s = spring({ frame: frame - t0 * FPS, fps: FPS, config: { damping: 12, stiffness: 140 } });
  return (
    <div style={{
      position: "absolute", left: 540 - 85, top: 520, opacity: clamp01(s * 1.5), scale: String(0.6 + 0.4 * s),
      translate: `${drift(t, 141, 5)}px ${drift(t, 142, 6)}px`, rotate: `${drift(t, 143, 3)}deg`,
      filter: "drop-shadow(0 16px 30px rgba(0,0,0,0.5))",
    }}>
      <Logo size={170} />
    </div>
  );
};

