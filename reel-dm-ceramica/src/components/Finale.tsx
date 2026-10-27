import React from "react";
import { spring } from "remotion";
import { C, FPS, S, SANS, SERIF, TL, clamp01, EASE, drift } from "../theme";
import { Logo } from "./Logo";

const pop = (frame: number, at: number, damping = 10) =>
  spring({ frame: frame - at * FPS, fps: FPS, config: { damping, stiffness: 150, mass: 0.8 } });

/** E13: the six nodes collapse into a giant "6". */
export const BigSix: React.FC<{ frame: number; t: number }> = ({ frame, t }) => {
  const w = TL.captions.E13.words; // Seis pasos. Cero personas despiertas.
  if (t < S.E13 || t > S.E14 + 0.6) return null;
  const s6 = pop(frame, w[0].start - 0.05, 8);
  const a6 = clamp01((t - (w[0].start - 0.05)) / 0.15);
  const sP = pop(frame, w[1].start, 200);
  const sZ = pop(frame, w[2].start, 200);
  const out = EASE(clamp01((t - S.E14) / 0.45));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out, translate: `0px ${-out * 260}px`, filter: `blur(${out * 18}px)` }}>
      <div style={{
        position: "absolute", left: 0, right: 0, top: 880 + drift(t, 50, 12), translate: "0px -50%", textAlign: "center",
        fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 820, lineHeight: 1, color: C.accent,
        scale: String(0.2 + 0.8 * s6), opacity: a6, rotate: `${drift(t, 51, 3)}deg`, filter: `blur(${(1 - a6) * 20}px)`,
        textShadow: "0 0 90px rgba(61,220,151,0.55)",
      }}>6</div>
      <div style={{
        position: "absolute", left: 0, right: 0, top: 1300, textAlign: "center", fontFamily: SANS, fontWeight: 800,
        fontSize: 112, letterSpacing: 6, color: C.white, opacity: clamp01(sP * 1.4), translate: `0px ${(1 - sP) * 50}px`,
      }}>PASOS</div>
      <div style={{
        position: "absolute", left: 0, right: 0, top: 1440, textAlign: "center", fontFamily: SANS, fontWeight: 800,
        fontSize: 60, color: "rgba(255,255,255,0.88)", opacity: clamp01(sZ * 1.4), translate: `0px ${(1 - sZ) * 40}px`,
      }}>
        <span style={{ color: C.accent }}>0</span> personas{" "}
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 68 }}>despiertas</span>
      </div>
    </div>
  );
};

/** E15: call to action. */
export const CTA: React.FC<{ frame: number; t: number }> = ({ frame, t }) => {
  const w = TL.captions.E15.words; // Comenta AUDITORIA y te lo cuento.
  if (t < S.E15 - 0.1) return null;
  const s1 = pop(frame, w[0].start - 0.05, 200);
  const s2 = pop(frame, w[1].start - 0.05, 9);
  const s3 = pop(frame, w[1].end, 12);
  const s4 = pop(frame, w[2].start, 200);
  const s5 = pop(frame, w[3].start, 200);
  const bounce = Math.abs(Math.sin(t * 4.2)) * 26;
  return (
    <div style={{ position: "absolute", inset: 0, translate: `${drift(t, 60, 6)}px ${drift(t, 61, 10)}px` }}>
      <div style={{
        position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: SANS, fontWeight: 800,
        fontSize: 116, letterSpacing: 4, color: C.white, opacity: clamp01(s1 * 1.5), translate: `0px ${(1 - s1) * 60}px`,
        filter: `blur(${(1 - clamp01(s1 * 1.5)) * 10}px)`,
      }}>COMENTA</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 715, display: "flex", justifyContent: "center" }}>
        <div style={{
          padding: "6px 34px", borderRadius: 30, background: C.accent, fontFamily: SANS, fontWeight: 800, fontSize: 122,
          letterSpacing: 2, color: C.ink, scale: String(Math.max(0, s2)), rotate: `${-2 + drift(t, 62, 1.5)}deg`,
          boxShadow: `0 0 ${70 + 20 * Math.sin(t * 4)}px rgba(61,220,151,0.6)`,
        }}>AUDITORIA</div>
      </div>
      <div style={{
        position: "absolute", left: 0, right: 0, top: 905 + bounce * s3, textAlign: "center", fontFamily: SANS,
        fontWeight: 800, fontSize: 130, color: C.accent, opacity: clamp01(s3), textShadow: "0 0 40px rgba(61,220,151,0.6)",
      }}>↓</div>
      <div style={{
        position: "absolute", left: 80, right: 80, top: 1100, textAlign: "center", fontFamily: SANS, fontWeight: 700,
        fontSize: 56, lineHeight: 1.2, color: "rgba(255,255,255,0.9)", opacity: clamp01(s4 * 1.4), translate: `0px ${(1 - s4) * 40}px`,
      }}>
        Te digo qué automatizar{" "}
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 64, color: C.accent }}>primero</span>
      </div>
      <div style={{
        position: "absolute", left: 0, right: 0, top: 1265, display: "flex", justifyContent: "center",
        opacity: clamp01(s5 * 1.5), scale: String(0.6 + 0.4 * s5), rotate: `${(1 - s5) * -25 + drift(t, 63, 2)}deg`,
        filter: `drop-shadow(0 0 30px rgba(255,107,26,0.4))`,
      }}>
        <Logo size={210} />
      </div>
    </div>
  );
};
