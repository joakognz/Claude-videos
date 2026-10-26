import React from "react";
import { spring } from "remotion";
import { C, FPS, S, SANS, TL, clamp01, drift, EASE } from "../theme";

/** E2: "IA" lands in a green box over the phone. */
export const IABadge: React.FC<{ frame: number; t: number }> = ({ frame, t }) => {
  const w = TL.captions.S2.words[3];
  const s = spring({ frame: frame - w.start * FPS, fps: FPS, config: { damping: 10, stiffness: 150, mass: 0.9 } });
  const out = EASE(clamp01((t - S.E3) / 0.3));
  if (t < w.start - 0.1 || out >= 1) return null;
  return (
    <div style={{
      position: "absolute", left: 540, top: 700 + drift(t, 4, 10), translate: `-50% ${-50 - out * 40}%`,
      scale: String(Math.max(0, s) * (1 - out * 0.3)), rotate: `${-4 + drift(t, 5, 2)}deg`, opacity: 1 - out,
      filter: `blur(${out * 12}px)`, padding: "6px 48px", borderRadius: 34, background: C.accent,
      fontFamily: SANS, fontWeight: 800, fontSize: 190, lineHeight: 1.1, color: C.ink,
      boxShadow: "0 0 80px rgba(255,107,26,0.65), 0 30px 60px rgba(0,0,0,0.5)",
    }}>IA</div>
  );
};

/** E3: "clientes perdidos" counter that ticks 0 → 1. */
export const LostCounter: React.FC<{ frame: number; t: number }> = ({ frame, t }) => {
  const inS = spring({ frame: frame - (S.E3 + 0.25) * FPS, fps: FPS, config: { damping: 14, stiffness: 140 } });
  const perdido = TL.captions.S3.words[8].start;
  const roll = spring({ frame: frame - perdido * FPS, fps: FPS, config: { damping: 11, stiffness: 170 } });
  const out = EASE(clamp01((t - S.WIPE) / 0.35));
  if (t < S.E3 || out >= 1) return null;
  return (
    <div style={{
      position: "absolute", left: 840 + drift(t, 7, 8), top: 700 + drift(t, 8, 10), translate: "-50% -50%",
      scale: String(inS * (1 - out * 0.2)), rotate: `${5 + drift(t, 9, 2)}deg`, opacity: 1 - out, filter: `blur(${out * 10}px)`,
      padding: "22px 30px 18px", borderRadius: 28, background: "rgba(30,10,12,0.88)", border: `3px solid ${C.red}`,
      boxShadow: "0 0 50px rgba(255,90,95,0.45), 0 24px 50px rgba(0,0,0,0.5)", fontFamily: SANS, textAlign: "center",
    }}>
      <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: 2, color: C.red }}>CLIENTES PERDIDOS</div>
      <div style={{ position: "relative", height: 130, overflow: "hidden", marginTop: 4 }}>
        {[0, 1].map((n) => (
          <div key={n} style={{
            position: "absolute", left: 0, right: 0, fontWeight: 800, fontSize: 120, lineHeight: "130px", color: C.white,
            translate: `0px ${(n - roll) * 130}px`,
          }}>{n}</div>
        ))}
      </div>
    </div>
  );
};

/** Small disclaimer at the top, visible during the DESPUÉS part (E4-E5). */
export const Disclaimer: React.FC<{ t: number }> = ({ t }) => {
  const o = Math.min(clamp01((t - S.E4 - 0.4) / 0.4), clamp01((S.E6 - t) / 0.3));
  if (o <= 0) return null;
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, top: 262, textAlign: "center", fontFamily: SANS, fontWeight: 600,
      fontSize: 26, letterSpacing: 1, color: "rgba(255,255,255,0.55)", opacity: o,
    }}>Demo simulada · datos ficticios</div>
  );
};
