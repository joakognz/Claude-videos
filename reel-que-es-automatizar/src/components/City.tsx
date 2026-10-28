import React from "react";
import { C, S, WAVE_DUR, clamp01, mix, rnd } from "../theme";
import { Box, OX, OY, U, boxFaces, groundEllipse, iso, matX, matY, pts, quadZ } from "../iso";

// ── layout (world units) ────────────────────────────────────────────────
// Streets: front y∈[4.6,7.6], back y∈[-11.4,-8.4], right x∈[5.4,8.4], left x∈[-12.6,-9.6].
// The shop sits at the front of the central block, x∈[-3.5,3.5], y∈[-3,3].
const XS: [number, number][] = [[-40.6, -27.6], [-24.6, -12.6], [-9.6, 5.4], [8.4, 21.4], [24.4, 37.4]];
const YS: [number, number][] = [[-40.4, -27.4], [-24.4, -11.4], [-8.4, 4.6], [7.6, 20.6], [23.6, 36.6]];
export const STREETS = { front: [4.6, 7.6], back: [-11.4, -8.4], right: [5.4, 8.4], left: [-12.6, -9.6] };

const onScreen = (b: Box) => {
  const [l] = iso(b.x0, b.y1, 0);
  const [r] = iso(b.x1, b.y0, 0);
  const [, top] = iso(b.x0, b.y0, b.z1);
  const [, bot] = iso(b.x1, b.y1, 0);
  return r > -60 && l < 1140 && bot > -40 && top < 1980;
};

/** Max height so a box in front of the shop never covers it (its top stays below the shop's floor line). */
const frontCap = (b: Box) => {
  const sx0 = iso(b.x0, b.y1, 0)[0];
  const sx1 = iso(b.x1, b.y0, 0)[0];
  if (sx1 < 200 || sx0 > 880) return 99;
  if (b.x1 + b.y1 < 2) return 99;
  const [, yTop] = iso(b.x0, b.y0, 0);
  return Math.max(0.35, (yTop - 1230) / U);
};

const buildings: Box[] = (() => {
  const out: Box[] = [];
  let seed = 1;
  XS.forEach(([bx0, bx1], i) => {
    YS.forEach(([by0, by1], j) => {
      if (i === 2 && j === 2) return; // the shop's own block is drawn by hand
      const n = 3;
      const cw = (bx1 - bx0 - 1.6) / n;
      const ch = (by1 - by0 - 1.6) / n;
      for (let a = 0; a < n; a++) {
        for (let b = 0; b < n; b++) {
          seed++;
          if (rnd(seed) < 0.12 && !(a === 1 && b === 1)) continue; // a few empty lots
          const x0 = bx0 + 0.8 + a * cw + 0.25;
          const y0 = by0 + 0.8 + b * ch + 0.25;
          const far = -(bx0 + by0) / 30; // further back → taller
          let h = 2.5 + rnd(seed * 3.3) * 5 + Math.max(0, far) * 5;
          const box: Box = { x0, x1: x0 + cw - 0.5, y0, y1: y0 + ch - 0.5, z1: h };
          h = Math.min(h, frontCap(box));
          box.z1 = h;
          if (onScreen(box)) out.push(box);
        }
      }
    });
  });
  // the shop's block: neighbours behind and to the left (taller), a low annex to the right
  out.push({ x0: -9.0, x1: -6.2, y0: -2.8, y1: 3.4, z1: 6.2 });
  out.push({ x0: -6.0, x1: -3.9, y0: -2.8, y1: 3.4, z1: 4.6 });
  out.push({ x0: -9.0, x1: -3.9, y0: -7.8, y1: -3.3, z1: 8.4 });
  out.push({ x0: -3.4, x1: 1.4, y0: -7.8, y1: -3.6, z1: 7.2 });
  out.push({ x0: 1.8, x1: 4.8, y0: -7.8, y1: -3.6, z1: 5.4 });
  return out.sort((p, q) => p.x0 + p.y0 + p.x1 + p.y1 - (q.x0 + q.y0 + q.x1 + q.y1));
})();

const sidewalks = XS.flatMap(([x0, x1]) => YS.map(([y0, y1]) => ({ x0, x1, y0, y1 })));

// curb lights along the four streets (they turn orange as the wave passes)
const curbLights: [number, number][] = [];
for (let x = -38; x <= 36; x += 2.2) {
  curbLights.push([x, 4.75], [x, 7.45], [x, -8.55], [x, -11.25]);
}
for (let y = -38; y <= 36; y += 2.2) {
  curbLights.push([5.55, y], [8.25, y], [-12.45, y], [-9.75, y]);
}
const visibleLights = curbLights
  .filter(([x, y]) => {
    const [sx, sy] = iso(x, y);
    return sx > -20 && sx < 1100 && sy > 400 && sy < 1940;
  })
  // not under the shop's front (the lamps there would sit on top of the facade on screen)
  .filter(([x, y]) => !(y > 4 && y < 5 && x > -4 && x < 4));

export const LAMPS: [number, number][] = [[-6.2, 4.15], [4.9, 4.15], [4.9, -4.0], [-15.0, 4.15], [9.0, 8.1], [-9.0, -8.0], [9.0, -12.0], [-13.2, 8.1]];

/** Wave front radius (world units) at time t. */
export const waveRadius = (t: number) => {
  const p = clamp01((t - S.E11) / WAVE_DUR);
  return p * p * 46;
};
/** 0 → 1 as the wave front passes a world point. */
export const litBy = (t: number, x: number, y: number) => clamp01((waveRadius(t) - Math.hypot(x, y) + 1) / 2.5);

const WindowPatterns: React.FC = () => (
  <defs>
    <pattern id="winL" patternUnits="userSpaceOnUse" width="0.9" height="1.1">
      <rect x="0.22" y="0.3" width="0.46" height="0.56" fill="#1A1A1C" />
    </pattern>
    <pattern id="winR" patternUnits="userSpaceOnUse" width="0.9" height="1.1">
      <rect x="0.22" y="0.3" width="0.46" height="0.56" fill="#121214" />
    </pattern>
    <radialGradient id="halo">
      <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
      <stop offset="0.25" stopColor="#F2F6FF" stopOpacity="0.18" />
      <stop offset="1" stopColor="#F2F6FF" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="pool">
      <stop offset="0" stopColor="#E9EEF5" stopOpacity="0.2" />
      <stop offset="1" stopColor="#E9EEF5" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="poolOrange">
      <stop offset="0" stopColor={C.orange} stopOpacity="0.32" />
      <stop offset="1" stopColor={C.orange} stopOpacity="0" />
    </radialGradient>
    <radialGradient id="sky" cx="0.5" cy="0.38" r="0.75">
      <stop offset="0" stopColor="#101014" />
      <stop offset="1" stopColor="#030304" />
    </radialGradient>
  </defs>
);

const Building: React.FC<{ b: Box; i: number }> = ({ b, i }) => {
  const f = boxFaces(b);
  const top = [C.b2, "#121212", "#161616"][i % 3];
  return (
    <g>
      <polygon points={f.left} fill={C.b1} />
      <polygon points={f.right} fill={C.b0} />
      <polygon points={f.top} fill={top} />
      {b.z1 > 1.6 && (
        <>
          <g transform={matY(b.y1, b.x0, b.z1)}>
            <rect x={0.3} y={0.35} width={Math.max(0, b.x1 - b.x0 - 0.6)} height={Math.max(0, b.z1 - 0.9)} fill="url(#winL)" />
          </g>
          <g transform={matX(b.x1, b.y1, b.z1)}>
            <rect x={0.3} y={0.35} width={Math.max(0, b.y1 - b.y0 - 0.6)} height={Math.max(0, b.z1 - 0.9)} fill="url(#winR)" />
          </g>
        </>
      )}
      {/* roof edge highlight */}
      <polyline points={pts([iso(b.x0, b.y1, b.z1), iso(b.x1, b.y1, b.z1), iso(b.x1, b.y0, b.z1)])} fill="none" stroke="#252528" strokeWidth={1.2} />
    </g>
  );
};

/** Lane dashes and crossings. */
const Streets: React.FC = () => {
  const dashes: React.ReactNode[] = [];
  const fy = (STREETS.front[0] + STREETS.front[1]) / 2;
  const by = (STREETS.back[0] + STREETS.back[1]) / 2;
  const rx = (STREETS.right[0] + STREETS.right[1]) / 2;
  const lx = (STREETS.left[0] + STREETS.left[1]) / 2;
  for (let x = -40; x < 38; x += 2) {
    dashes.push(<polygon key={`f${x}`} points={quadZ(0, x, x + 0.9, fy - 0.05, fy + 0.05)} fill="#1A1A1D" />);
    dashes.push(<polygon key={`b${x}`} points={quadZ(0, x, x + 0.9, by - 0.05, by + 0.05)} fill="#1A1A1D" />);
  }
  for (let y = -40; y < 38; y += 2) {
    dashes.push(<polygon key={`r${y}`} points={quadZ(0, rx - 0.05, rx + 0.05, y, y + 0.9)} fill="#1A1A1D" />);
    dashes.push(<polygon key={`l${y}`} points={quadZ(0, lx - 0.05, lx + 0.05, y, y + 0.9)} fill="#1A1A1D" />);
  }
  // zebra crossing in front of the shop's corner
  for (let k = 0; k < 6; k++) {
    const x = 5.6 + k * 0.48;
    dashes.push(<polygon key={`z${k}`} points={quadZ(0, x, x + 0.26, 3.9, 4.5)} fill="#19191C" />);
  }
  return <g>{dashes}</g>;
};

/** Cars: pairs of soft headlight dots gliding along the streets. */
const Cars: React.FC<{ t: number }> = ({ t }) => {
  const cars = [
    { axis: "x", lane: 5.6, speed: 2.4, phase: 0 },
    { axis: "x", lane: 6.6, speed: -2.0, phase: 27 },
    { axis: "y", lane: 6.2, speed: 1.9, phase: 11 },
    { axis: "y", lane: 7.6, speed: -2.2, phase: 40 },
    { axis: "x", lane: -10.4, speed: 1.6, phase: 33 },
    { axis: "y", lane: -11.6, speed: -1.7, phase: 5 },
    { axis: "x", lane: 5.6, speed: 2.1, phase: 52 },
    { axis: "x", lane: 6.6, speed: -2.6, phase: 64 },
    { axis: "y", lane: 6.2, speed: 2.3, phase: 47 },
    { axis: "y", lane: 7.6, speed: -1.8, phase: 70 },
    { axis: "x", lane: -9.4, speed: -2.2, phase: 18 },
    { axis: "y", lane: -10.4, speed: 2.0, phase: 58 },
  ];
  return (
    <g>
      {cars.map((c, i) => {
        const span = 80;
        const p = ((((c.phase + c.speed * t) % span) + span) % span) - 40;
        const [x, y] = c.axis === "x" ? [p, c.lane] : [c.lane, p];
        const dir = Math.sign(c.speed);
        const [ax, ay] = c.axis === "x" ? [dir, 0] : [0, dir];
        const head1 = iso(x + ax * 0.9 - ay * 0.3, y + ay * 0.9 + ax * 0.3, 0.35);
        const head2 = iso(x + ax * 0.9 + ay * 0.3, y + ay * 0.9 - ax * 0.3, 0.35);
        const tail = iso(x - ax * 0.9, y - ay * 0.9, 0.35);
        return (
          <g key={i}>
            <polygon points={c.axis === "x" ? quadZ(0.05, x - 1, x + 1, y - 0.42, y + 0.42) : quadZ(0.05, x - 0.42, x + 0.42, y - 1, y + 1)} fill="#151518" />
            <circle cx={head1[0]} cy={head1[1]} r={3.2} fill="#F4F7FF" opacity={0.85} />
            <circle cx={head2[0]} cy={head2[1]} r={3.2} fill="#F4F7FF" opacity={0.85} />
            <circle cx={(head1[0] + head2[0]) / 2} cy={(head1[1] + head2[1]) / 2} r={30} fill="url(#halo)" opacity={0.9} />
            <circle cx={tail[0]} cy={tail[1]} r={2.4} fill="#8A8A90" opacity={0.6} />
          </g>
        );
      })}
    </g>
  );
};

const Lamp: React.FC<{ x: number; y: number; t: number; i: number }> = ({ x, y, t, i }) => {
  const base = iso(x, y, 0);
  const top = iso(x, y, 3.4);
  const flicker = 0.92 + 0.08 * Math.sin(t * (3 + i) + i * 2) * Math.sin(t * 1.3 + i);
  const pool = groundEllipse(3.2);
  return (
    <g>
      <ellipse cx={base[0]} cy={base[1]} rx={pool.rx} ry={pool.ry} fill="url(#pool)" opacity={flicker} />
      <line x1={base[0]} y1={base[1]} x2={top[0]} y2={top[1]} stroke="#26262A" strokeWidth={3} />
      <rect x={top[0] - 7} y={top[1] - 4} width={14} height={6} rx={2} fill="#3A3A40" />
      <circle cx={top[0]} cy={top[1] + 3} r={4} fill="#FFFFFF" />
      <circle cx={top[0]} cy={top[1] + 3} r={95} fill="url(#halo)" opacity={flicker} />
    </g>
  );
};

/** Everything behind the shop (ground, streets, buildings behind it). */
export const CityBack: React.FC<{ t: number }> = ({ t }) => {
  const behind = buildings.filter((b) => b.x0 + b.x1 + b.y0 + b.y1 < 6);
  return (
    <g>
      <WindowPatterns />
      <rect x={0} y={0} width={1080} height={1920} fill="url(#sky)" />
      <polygon points={quadZ(0, -60, 60, -60, 60)} fill={C.street} />
      {sidewalks.map((s, i) => (
        <polygon key={i} points={quadZ(0, s.x0, s.x1, s.y0, s.y1)} fill={C.walk} />
      ))}
      <Streets />
      <CurbLights t={t} />
      <Cars t={t} />
      {behind.map((b, i) => (
        <Building key={i} b={b} i={i} />
      ))}
      {LAMPS.filter(([x, y]) => x + y < 4).map(([x, y], i) => (
        <Lamp key={i} x={x} y={y} t={t} i={i} />
      ))}
    </g>
  );
};

/** Buildings and lamps in front of the shop. */
export const CityFront: React.FC<{ t: number }> = ({ t }) => {
  const front = buildings.filter((b) => b.x0 + b.x1 + b.y0 + b.y1 >= 6);
  return (
    <g>
      {front.map((b, i) => (
        <Building key={i} b={b} i={i + 1} />
      ))}
      {LAMPS.filter(([x, y]) => x + y >= 4).map(([x, y], i) => (
        <Lamp key={i} x={x} y={y} t={t} i={i + 4} />
      ))}
    </g>
  );
};

const CurbLights: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {visibleLights.map(([x, y], i) => {
      const [sx, sy] = iso(x, y, 0.05);
      const lit = litBy(t, x, y);
      const tw = 0.75 + 0.25 * Math.sin(t * 2.1 + i * 1.7);
      return (
        <g key={i}>
          <circle cx={sx} cy={sy} r={7 + lit * 5} fill={mix("#CFD6E0", C.orange, lit)} opacity={(0.1 + lit * 0.22) * tw} />
          <circle cx={sx} cy={sy} r={1.8 + lit * 0.6} fill={mix("#D7DEE8", C.orangeHi, lit)} opacity={0.55 + lit * 0.4} />
        </g>
      );
    })}
  </g>
);

/** The orange wave of E11: a ring that runs through the streets from the shop. */
export const Wave: React.FC<{ t: number }> = ({ t }) => {
  if (t < S.E11 || t > S.E11 + WAVE_DUR + 0.6) return null;
  const r = waveRadius(t);
  const fade = clamp01((S.E11 + WAVE_DUR + 0.6 - t) / 0.6);
  const e = groundEllipse(r);
  const e2 = groundEllipse(Math.max(0, r - 2.5));
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <ellipse cx={OX} cy={OY} rx={e.rx} ry={e.ry} fill="none" stroke={C.orange} strokeWidth={26} opacity={0.35 * fade} filter="url(#blur12)" />
      <ellipse cx={OX} cy={OY} rx={e.rx} ry={e.ry} fill="none" stroke={C.orangeHi} strokeWidth={4} opacity={0.95 * fade} />
      <ellipse cx={OX} cy={OY} rx={e2.rx} ry={e2.ry} fill="none" stroke={C.orange} strokeWidth={2} opacity={0.5 * fade} />
    </g>
  );
};

/** Ground glow around the shop once it is automated. */
export const GroundGlow: React.FC<{ o: number }> = ({ o }) => {
  if (o <= 0) return null;
  const e = groundEllipse(9);
  return <ellipse cx={OX} cy={OY + 0.5 * U} rx={e.rx} ry={e.ry} fill="url(#poolOrange)" opacity={o} />;
};

/** Soft out-of-focus lights at the frame edges (screen space, drifting slowly). */
export const Bokeh: React.FC<{ t: number; o: number }> = ({ t, o }) => {
  const dots = Array.from({ length: 14 }, (_, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const x = side < 0 ? 20 + rnd(i) * 150 : 910 + rnd(i) * 150;
    const y = 120 + rnd(i * 7.7) * 1700 + Math.sin(t * 0.45 + i) * 45;
    const r = 26 + rnd(i * 3.1) * 50;
    const warm = i % 3 === 0 ? o : 0;
    return { x: x + Math.sin(t * 0.35 + i * 2) * 30, y, r, warm, a: 0.06 + rnd(i * 5.3) * 0.09 };
  });
  return (
    <g filter="url(#blur18)">
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={mix("#DDE4EE", C.orange, d.warm)} opacity={d.a * (0.8 + 0.2 * Math.sin(t * 0.8 + i))} />
      ))}
    </g>
  );
};
