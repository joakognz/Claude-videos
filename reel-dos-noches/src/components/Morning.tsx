import React from "react";
import { AbsoluteFill, spring } from "remotion";
import { C, FPS, S, SANS, SERIF, W, clamp01, drift, rgba, windowed, EASE, EASE_OUT } from "../theme";
import { phonePose } from "../layout";
import { Phone, PHONE_H, PHONE_W, Side } from "./Phone";

/** The same phone, lifted off the nightstand into a close-up (E7 top, E8 bottom). */
export const HeroPhone: React.FC<{ t: number; side: Side }> = ({ t, side }) => {
  const pose = phonePose(side, t);
  if (pose.p <= 0.001) return null;
  // wobble a little as it is picked up
  const pick = Math.sin(clamp01(pose.p) * Math.PI) * (side === "top" ? -4 : 4);
  return (
    <div style={{
      position: "absolute", left: pose.x - PHONE_W / 2, top: pose.y - PHONE_H, width: PHONE_W, height: PHONE_H,
      transformOrigin: "50% 100%", scale: String(pose.scale), rotate: `${pose.rot + pick}deg`,
      filter: `drop-shadow(0 ${40 * pose.p}px ${60 * pose.p}px rgba(0,0,0,0.65))`,
    }}>
      <Phone t={t} side={side} />
    </div>
  );
};

const COL = { left: 640, right: 1040 };

/** E7 right column: the booking counter that never moved. */
export const ZeroColumn: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const t0 = S.E7 + 0.6;
  const o = windowed(t, t0, S.E8 + 0.1, 0.4, 0.35);
  if (o <= 0) return null;
  const s = spring({ frame: frame - t0 * FPS, fps: FPS, config: { damping: 14, stiffness: 140 } });
  return (
    <div style={{
      position: "absolute", left: COL.left, width: COL.right - COL.left, top: 780, textAlign: "center", fontFamily: SANS,
      opacity: o, translate: `${drift(t, 111, 6)}px ${(1 - s) * 60 + drift(t, 112, 8)}px`,
    }}>
      <div style={{ fontWeight: 800, fontSize: 50, color: "rgba(255,255,255,0.5)" }}>reservas:</div>
      <div style={{ fontWeight: 800, fontSize: 280, lineHeight: 1, color: "rgba(255,255,255,0.32)", letterSpacing: -8 }}>0</div>
      <div style={{
        display: "inline-block", marginTop: 26, padding: "8px 22px", borderRadius: 18, border: `3px solid ${rgba(C.red, 0.8)}`,
        fontWeight: 800, fontSize: 44, color: C.red, background: rgba(C.red, 0.1),
      }}>5 perdidos</div>
    </div>
  );
};

/** E8 right column: the hero number. */
export const BigFive: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const t0 = W("S8", 5) - 0.05;
  const gather = clamp01((t - (t0 - 0.4)) / 0.4);
  const o = windowed(t, t0 - 0.4, S.E9 + 0.15, 0.1, 0.4);
  if (o <= 0) return null;
  const s = spring({ frame: frame - t0 * FPS, fps: FPS, config: { damping: 8, stiffness: 120, mass: 0.9 } });
  const cx = (COL.left + COL.right) / 2;
  const cy = 820;
  const glow = 0.5 + 0.5 * Math.sin(t * 3);
  return (
    <>
      {/* five green sparks rush in and form the number */}
      {gather < 1 && new Array(5).fill(0).map((_, i) => {
        const a = (i / 5) * Math.PI * 2 + 0.6;
        const r = 380 * (1 - EASE(gather));
        return (
          <div key={i} style={{
            position: "absolute", left: cx + Math.cos(a) * r - 14, top: cy + Math.sin(a) * r - 14, width: 28, height: 28, borderRadius: 28,
            background: C.green, boxShadow: `0 0 30px 10px ${rgba(C.green, 0.6)}`, opacity: o * (1 - gather * 0.6),
          }} />
        );
      })}
      <div style={{
        position: "absolute", left: COL.left - 40, width: COL.right - COL.left + 80, top: cy - 300, height: 520, display: "flex",
        alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 470,
        lineHeight: 1, color: C.green, opacity: o * clamp01(s * 2), scale: String(0.4 + 0.6 * s),
        textShadow: `0 0 ${60 + 40 * glow}px ${rgba(C.green, 0.55)}`, translate: `${drift(t, 121, 6)}px ${drift(t, 122, 8)}px`,
      }}>5</div>
      <div style={{
        position: "absolute", left: COL.left, width: COL.right - COL.left, top: cy + 290, textAlign: "center", fontFamily: SANS,
        fontWeight: 800, fontSize: 50, lineHeight: 1.12, color: C.white,
        opacity: o * EASE_OUT(clamp01((t - t0 - 0.25) / 0.4)), translate: `${drift(t, 123, 5)}px ${(1 - EASE_OUT(clamp01((t - t0 - 0.25) / 0.4))) * 30}px`,
      }}>
        reservas<br />mientras<br /><span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 60, color: C.green }}>dormías</span>
      </div>
    </>
  );
};

/** E6: a bar of warm light sweeps across both panels and switches the morning on. */
export const LightSweep: React.FC<{ t: number }> = ({ t }) => {
  const p = clamp01((t - S.E6 - 0.1) / 0.85);
  if (p <= 0 || p >= 1) return null;
  const x = -700 + EASE(p) * 2500;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: -400, left: x, width: 420, height: 2800, rotate: "18deg",
        background: "linear-gradient(90deg, rgba(255,190,120,0) 0%, rgba(255,214,160,0.55) 40%, rgba(255,245,225,0.9) 50%, rgba(255,214,160,0.55) 60%, rgba(255,190,120,0) 100%)",
        opacity: Math.sin(p * Math.PI),
      }} />
    </AbsoluteFill>
  );
};
