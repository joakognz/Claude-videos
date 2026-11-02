import React from "react";
import { C, rnd } from "../theme";

/** Block glitch: horizontal slices of the content shifted sideways + orange/white flicker bars. Only for what is false. */
export const GlitchBox: React.FC<{ seed: number; amount: number; w: number; h: number; scale?: number; children: React.ReactNode; bars?: boolean }> = ({
  seed, amount, w, h, scale = 1, children, bars = true,
}) => {
  if (amount <= 0.01) return <>{children}</>;
  const k = Math.round(2 + amount * 5);
  const slices = Array.from({ length: k }, (_, i) => {
    const r1 = rnd(seed * 13 + i * 7.3), r2 = rnd(seed * 29 + i * 3.1), r3 = rnd(seed * 17 + i * 5.7);
    const top = r1 * h * 0.9;
    const hh = h * (0.03 + r2 * 0.1 * (0.5 + amount));
    const dx = (r3 - 0.5) * 2 * (14 + amount * 70) * scale;
    return { top, hh, dx, i };
  });
  const barList = Array.from({ length: Math.round(1 + amount * 3) }, (_, i) => ({
    top: rnd(seed * 41 + i * 9.1) * h * 0.92, hh: h * (0.012 + rnd(seed * 7 + i) * 0.03),
    left: rnd(seed * 3 + i * 2.2) * w * 0.5, ww: w * (0.25 + rnd(seed * 5 + i * 1.3) * 0.7),
    orange: rnd(seed * 11 + i * 4.7) > 0.35,
  }));
  return (
    <div style={{ position: "relative", width: w, height: h }}>
      <div style={{ position: "absolute", inset: 0 }}>{children}</div>
      {slices.map((s) => (
        <div key={s.i} style={{ position: "absolute", inset: 0, clipPath: `inset(${s.top}px 0 ${Math.max(0, h - s.top - s.hh)}px 0)`, transform: `translateX(${s.dx}px)` }}>
          {children}
        </div>
      ))}
      {bars && barList.map((b, i) => (
        <div key={i} style={{ position: "absolute", top: b.top, left: b.left, width: b.ww, height: b.hh, background: b.orange ? C.orange : "#fff", opacity: b.orange ? 0.85 : 0.9 }} />
      ))}
    </div>
  );
};
