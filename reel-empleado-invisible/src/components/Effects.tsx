import React from "react";
import { ALL_ON, C, DROP, EASE_OUT, clamp01, rnd } from "../theme";
import { groundEllipse, iso } from "../iso";
import { ghostScreen } from "./Shop";

/** Light rays fanning out from a point (screen px), `p` 0→1 over the burst. */
const Rays: React.FC<{ cx: number; cy: number; p: number; n: number; len: number; spin: number }> = ({ cx, cy, p, n, len, spin }) => (
  <g filter="url(#blur6)">
    {Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + spin + rnd(i * 3.7) * 0.2;
      const l = len * (0.6 + 0.4 * rnd(i * 1.9)) * EASE_OUT(p);
      const w = 0.035;
      const pts = [
        [cx, cy],
        [cx + Math.cos(a - w) * l, cy + Math.sin(a - w) * l * 0.75],
        [cx + Math.cos(a + w) * l, cy + Math.sin(a + w) * l * 0.75],
      ];
      return <polygon key={i} points={pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")} fill={C.orangeHi} opacity={(1 - p) * 0.75} />;
    })}
  </g>
);

/** The bass drop: the invisible employee bursts out of the light (rays, a flash and two rings on the floor). */
export const DropBurst: React.FC<{ t: number }> = ({ t }) => {
  const p = (t - DROP) / 1.3;
  if (p < 0 || p > 1) return null;
  const [cx, cy] = ghostScreen(t, 0, 1.1);
  const [gx, gy] = ghostScreen(t, 0, 0);
  const ring = (lag: number, max: number) => {
    const q = clamp01((t - DROP - lag) / 1.0);
    if (q <= 0 || q >= 1) return null;
    const e = groundEllipse(0.4 + max * EASE_OUT(q));
    return <ellipse cx={gx} cy={gy} rx={e.rx} ry={e.ry} fill="none" stroke={C.orangeHi} strokeWidth={5 * (1 - q) + 1} opacity={1 - q} />;
  };
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <circle cx={cx} cy={cy} r={40 + 230 * EASE_OUT(p)} fill={C.orange} opacity={0.75 * (1 - p) ** 2} filter="url(#blur18)" />
      <circle cx={cx} cy={cy} r={18 + 50 * EASE_OUT(p)} fill="#FFF1DE" opacity={0.9 * (1 - p) ** 3} filter="url(#blur12)" />
      <Rays cx={cx} cy={cy} p={p} n={16} len={420} spin={t * 0.3} />
      {ring(0, 8)}
      {ring(0.14, 5)}
    </g>
  );
};

const SPARKS = Array.from({ length: 56 }, (_, i) => ({
  a: -Math.PI / 2 + (rnd(i * 2.1) - 0.5) * 2.6,
  v: 380 + rnd(i * 5.3) * 520,
  r: 2 + rnd(i * 7.7) * 3.5,
  d: rnd(i * 9.9) * 0.15,
  hot: rnd(i * 4.4) > 0.6,
}));

/** The whole shop lights up: a beam into the sky, a white-hot flash, sparks and an extra ring through the streets. */
export const AllOnBurst: React.FC<{ t: number }> = ({ t }) => {
  const dt = t - ALL_ON;
  if (dt < -0.05 || dt > 2.6) return null;
  const [rx, ry] = iso(0, 0, 3.2);
  const [cx, cy] = iso(0.2, 0.2, 1.4);
  const beam = Math.min(clamp01((dt + 0.05) / 0.12), 1 - clamp01((dt - 0.5) / 2.0));
  const p = clamp01(dt / 1.4);
  const ringQ = clamp01((dt - 0.3) / 1.8);
  const e = groundEllipse(1 + 30 * ringQ * ringQ);
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <defs>
        <linearGradient id="beam" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={C.orangeHi} stopOpacity="0.95" />
          <stop offset="0.5" stopColor={C.orange} stopOpacity="0.45" />
          <stop offset="1" stopColor={C.orange} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* the beam: the lighthouse among the dark buildings */}
      {beam > 0 && (
        <g opacity={beam}>
          <polygon points={`${rx - 150},${ry} ${rx + 150},${ry} ${rx + 60},${ry - 1500} ${rx - 60},${ry - 1500}`} fill="url(#beam)" filter="url(#blur18)" />
          <polygon points={`${rx - 34},${ry} ${rx + 34},${ry} ${rx + 10},${ry - 1500} ${rx - 10},${ry - 1500}`} fill="url(#beam)" />
        </g>
      )}
      <circle cx={cx} cy={cy} r={60 + 520 * EASE_OUT(p)} fill={C.orange} opacity={0.8 * (1 - p) ** 2} filter="url(#blur18)" />
      <circle cx={cx} cy={cy} r={30 + 120 * EASE_OUT(p)} fill="#FFF4E6" opacity={(1 - p) ** 3} filter="url(#blur12)" />
      <Rays cx={cx} cy={cy} p={p} n={22} len={700} spin={-t * 0.25} />
      {SPARKS.map((s, i) => {
        const q = dt - s.d;
        if (q <= 0 || q > 1.7) return null;
        const x = rx + Math.cos(s.a) * s.v * q;
        const y = ry + Math.sin(s.a) * s.v * q + 520 * q * q;
        return <circle key={i} cx={x} cy={y} r={s.r * (1 - q / 1.8)} fill={s.hot ? "#FFF4E6" : C.orangeHi} opacity={1 - q / 1.7} />;
      })}
      {ringQ > 0 && ringQ < 1 && <ellipse cx={iso(0, 0)[0]} cy={iso(0, 0)[1]} rx={e.rx} ry={e.ry} fill="none" stroke={C.orange} strokeWidth={14} opacity={0.5 * (1 - ringQ)} filter="url(#blur12)" />}
    </g>
  );
};

/** A brief warm flash over the whole frame on the drop and on the switch-on. */
export const ScreenFlash: React.FC<{ t: number }> = ({ t }) => {
  const f = (a: number, peak: number, d: number) => (t >= a && t < a + d ? peak * (1 - (t - a) / d) ** 2 : 0);
  const o = Math.max(f(DROP, 0.22, 0.5), f(ALL_ON, 0.38, 0.6));
  if (o <= 0) return null;
  return <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 52% 48%, #FFE2C2 0%, #FF6B1A 45%, rgba(255,107,26,0) 80%)", opacity: o, mixBlendMode: "screen" }} />;
};
