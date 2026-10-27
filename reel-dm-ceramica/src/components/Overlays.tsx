import React from "react";
import { spring } from "remotion";
import { C, FPS, S, SANS, TL, clamp01, drift, EASE } from "../theme";

/** E1-E4: giant "23:07" behind the phone. */
export const BigClock: React.FC<{ frame: number; t: number; camX: number; camY: number }> = ({ frame, t, camX, camY }) => {
  const s = spring({ frame: frame - 2, fps: FPS, config: { damping: 200, stiffness: 90 } });
  const out = EASE(clamp01((t - (S.E5 - 0.5)) / 0.6));
  if (out >= 1) return null;
  const green = clamp01((t - S.E4) / 0.4);
  const settle = EASE(clamp01((t - S.E4 - 0.1) / 0.9));
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, top: 352 + 22 * settle + drift(t, 31, 8) - camY * 0.3, translate: `${-camX * 0.3}px -50%`,
      textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 270, letterSpacing: -10, lineHeight: 1,
      color: green > 0 ? `rgba(${207 - 146 * green},${224 - 4 * green},${255 - 104 * green},0.95)` : "rgba(207,224,255,0.92)",
      opacity: s * (1 - out), scale: String((0.9 + 0.1 * s + t * 0.004) * (1 - 0.16 * settle)), filter: `blur(${(1 - s) * 18 + out * 16}px)`,
      textShadow: green > 0 ? `0 0 60px rgba(61,220,151,${0.35 * green})` : "0 0 50px rgba(207,224,255,0.25)",
    }}>23:07</div>
  );
};

/** Unread-messages badge on the phone's corner: 1, 2, 3… (ANTES) and again in E14. */
export const UnreadBadge: React.FC<{ frame: number; t: number; x: number; y: number; after: boolean }> = ({ frame, t, x, y, after }) => {
  const times = after
    ? TL.sfx.filter((e) => e.type === "incoming" && e.t > S.E14 - 0.5).map((e) => e.t)
    : TL.inbox.map((m) => m.t);
  const base = after ? 3 : 0;
  const n = times.filter((v) => t >= v).length;
  const visible = after ? t >= S.E14 - 0.2 : true;
  if (!visible || (n === 0 && !after)) return null;
  const last = times[Math.max(0, n - 1)] ?? S.E14;
  const s = spring({ frame: frame - last * FPS, fps: FPS, config: { damping: 8, stiffness: 220, mass: 0.6 } });
  const intro = after ? spring({ frame: frame - (S.E14 - 0.2) * FPS, fps: FPS, config: { damping: 14 } }) : 1;
  // ANTES badge leaves as soon as the wipe's light bar passes over it
  const out = EASE(clamp01((t - (after ? S.E15 : S.WIPE + 0.04)) / 0.25));
  if (out >= 1) return null;
  return (
    <div style={{
      position: "absolute", left: x, top: y, translate: "-50% -50%", width: 92, height: 92, borderRadius: 92,
      background: C.red, border: "5px solid #0B1F1A", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: SANS, fontWeight: 800, fontSize: 50, color: C.white, scale: String((0.75 + 0.25 * s) * intro * (1 - out)), opacity: 1 - out,
      boxShadow: "0 0 40px rgba(255,90,95,0.6), 0 14px 30px rgba(0,0,0,0.45)", rotate: `${drift(t, 21, 4)}deg`,
    }}>{base + n}</div>
  );
};

/** E3: "ventas perdidas" counter that ticks 0 → 1. */
export const LostCounter: React.FC<{ frame: number; t: number }> = ({ frame, t }) => {
  const inS = spring({ frame: frame - (S.E3 + 0.2) * FPS, fps: FPS, config: { damping: 14, stiffness: 140 } });
  const perdido = TL.captions.E3.words[8].start;
  const roll = spring({ frame: frame - perdido * FPS, fps: FPS, config: { damping: 11, stiffness: 170 } });
  const out = EASE(clamp01((t - S.WIPE) / 0.35));
  if (t < S.E3 || out >= 1) return null;
  return (
    <div style={{
      position: "absolute", left: 862 + drift(t, 7, 8), top: 850 + drift(t, 8, 10), translate: "-50% -50%",
      scale: String(inS * (1 - out * 0.2)), rotate: `${5 + drift(t, 9, 2)}deg`, opacity: clamp01((inS - 0.35) / 0.35) * (1 - out), filter: `blur(${out * 10}px)`,
      padding: "22px 30px 18px", borderRadius: 28, background: "rgba(30,10,12,0.9)", border: `3px solid ${C.red}`,
      boxShadow: "0 0 50px rgba(255,90,95,0.45), 0 24px 50px rgba(0,0,0,0.5)", fontFamily: SANS, textAlign: "center",
    }}>
      <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: 2, color: C.red }}>VENTAS PERDIDAS</div>
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
      position: "absolute", left: 0, right: 0, top: 256, textAlign: "center", fontFamily: SANS, fontWeight: 600,
      fontSize: 26, letterSpacing: 1, color: "rgba(255,255,255,0.55)", opacity: o,
    }}>Demo simulada · datos ficticios</div>
  );
};
