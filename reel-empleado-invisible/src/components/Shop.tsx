import React from "react";
import { C, EASE, EASE_OUT, EV, MONO, chaosAt, clamp01, lerp, mix, orangeAt, partAt, rise, rnd, windowed } from "../theme";
import { Box, U, boxFaces, groundEllipse, iso, matY, matZ, pts, quadX, quadY, quadZ } from "../iso";

const H = 3.2; // wall height
// dark red (no system) never emits light; orange (with system) always does
const RED = { top: C.red2, left: C.red1, right: C.red0 };
const ORNG = { top: C.orangeHi, left: C.orange, right: C.orangeLo };
type Tone = "top" | "left" | "right";
const tone = (k: Tone, o: number, dim = 0) => mix(mix(RED[k], ORNG[k], o), "#000000", dim * (1 - o * 0.6));

/** A solid box with red→orange tones. `dim` darkens it (0..1). */
const Solid: React.FC<{ b: Box; o: number; dim?: number; edge?: boolean }> = ({ b, o, dim = 0, edge }) => {
  const f = boxFaces(b);
  return (
    <g>
      <polygon points={f.left} fill={tone("left", o, dim)} />
      <polygon points={f.right} fill={tone("right", o, dim)} />
      <polygon points={f.top} fill={tone("top", o, dim)} />
      {edge && o > 0 && (
        <polyline points={pts([iso(b.x0, b.y1, b.z1), iso(b.x1, b.y1, b.z1), iso(b.x1, b.y0, b.z1)])} fill="none" stroke="#FFE2C4" strokeWidth={1.5} opacity={o} />
      )}
    </g>
  );
};

/** Bloom behind an element that is lit (orange only). */
const Bloom: React.FC<{ x: number; y: number; z: number; r: number; o: number }> = ({ x, y, z, r, o }) => {
  if (o <= 0.01) return null;
  const [cx, cy] = iso(x, y, z);
  return <circle cx={cx} cy={cy} r={r} fill={C.orange} opacity={0.45 * o} filter="url(#blur18)" style={{ mixBlendMode: "screen" }} />;
};

// ── shelves: boards + products, generated once ─────────────────────────
type Prod = Box & { shade: number };
const LEVELS = [0.0, 0.72, 1.44, 2.16];
const shelfLeft: { boards: Box[]; prods: Prod[][] } = { boards: [], prods: [] };
const shelfRight: { boards: Box[]; prods: Prod[][] } = { boards: [], prods: [] };
LEVELS.forEach((z, li) => {
  shelfLeft.boards.push({ x0: -3.5, x1: -2.88, y0: -2.3, y1: 1.9, z0: z, z1: z + 0.08 });
  shelfRight.boards.push({ x0: -2.6, x1: 2.9, y0: -3.0, y1: -2.42, z0: z, z1: z + 0.08 });
  const lp: Prod[] = [];
  let y = -2.2;
  let k = li * 17;
  while (y < 1.7) {
    const w = 0.28 + rnd(++k) * 0.35;
    if (rnd(k * 1.9) > 0.18) lp.push({ x0: -3.42, x1: -2.98, y0: y, y1: Math.min(1.85, y + w), z0: z + 0.08, z1: z + 0.08 + 0.3 + rnd(k * 2.3) * 0.28, shade: rnd(k * 4.1) });
    y += w + 0.06;
  }
  shelfLeft.prods.push(lp);
  const rp: Prod[] = [];
  let x = -2.5;
  while (x < 2.7) {
    const w = 0.28 + rnd(++k * 1.3) * 0.38;
    if (rnd(k * 2.9) > 0.18) rp.push({ x0: x, x1: Math.min(2.85, x + w), y0: -2.92, y1: -2.5, z0: z + 0.08, z1: z + 0.08 + 0.3 + rnd(k * 3.7) * 0.28, shade: rnd(k * 5.3) });
    x += w + 0.06;
  }
  shelfRight.prods.push(rp);
});

const Shelves: React.FC<{ s: typeof shelfLeft; o: number; side: "L" | "R" }> = ({ s, o, side }) => (
  <g>
    {side === "L" ? (
      <polygon points={quadY(1.9, -3.5, -2.88, 0, 2.3)} fill={tone("left", o, 0.62)} />
    ) : (
      <polygon points={quadX(2.9, -3.0, -2.42, 0, 2.3)} fill={tone("right", o, 0.62)} />
    )}
    {s.boards.map((b, i) => (
      <g key={i}>
        <Solid b={b} o={o} dim={0.35} />
        {s.prods[i].map((p, j) => (
          <Solid key={j} b={p} o={o} dim={0.25 + p.shade * 0.3} />
        ))}
      </g>
    ))}
  </g>
);

// ── people: flat faceless silhouettes ──────────────────────────────────
type Kind = "owner" | "client" | "ghost";
export const Person: React.FC<{ x: number; y: number; t: number; seed: number; kind: Kind; op?: number; rim?: number; phone?: number; scaleY?: number }> = ({
  x, y, t, seed, kind, op = 1, rim = 0, phone = 0, scaleY = 1,
}) => {
  if (op <= 0.01) return null;
  const [sx, sy] = iso(x, y, 0);
  const bob = Math.sin(t * 1.6 + seed) * 1.2;
  const body = kind === "owner" ? C.cream : kind === "client" ? C.client : C.orange;
  const ghost = kind === "ghost";
  const shimmer = ghost ? 0.85 + 0.15 * Math.sin(t * 7 + seed * 3) : 1;
  return (
    <g opacity={op} transform={`translate(${sx} ${sy}) scale(${U / 46} ${(U / 46) * scaleY})`}>
      {!ghost && <ellipse cx={0} cy={0} rx={18} ry={7} fill="#000" opacity={0.4} />}
      {ghost && (
        <g style={{ mixBlendMode: "screen" }}>
          <ellipse cx={0} cy={0} rx={22} ry={8} fill={C.orange} opacity={0.5} filter="url(#blur6)" />
          <rect x={-17} y={-64 + bob} width={34} height={64 - bob} rx={14} fill={C.orange} opacity={0.55 * shimmer} filter="url(#blur6)" />
          <circle cx={0} cy={-71 + bob} r={13} fill={C.orange} opacity={0.55 * shimmer} filter="url(#blur6)" />
        </g>
      )}
      <rect x={-13} y={-60 + bob} width={26} height={60 - bob} rx={11} fill={body} fillOpacity={ghost ? 0.38 * shimmer : 1}
        stroke={ghost ? C.orangeHi : C.orange} strokeWidth={ghost ? 2.6 : 2} strokeOpacity={ghost ? 1 : rim} />
      <circle cx={0} cy={-71 + bob} r={9.5} fill={body} fillOpacity={ghost ? 0.38 * shimmer : 1}
        stroke={ghost ? C.orangeHi : C.orange} strokeWidth={ghost ? 2.6 : 2} strokeOpacity={ghost ? 1 : rim} />
      {phone > 0 && (
        <g opacity={phone}>
          <rect x={9} y={-47 + bob} width={10} height={17} rx={2.5} fill="#FFF4EC" />
          <rect x={9} y={-47 + bob} width={10} height={17} rx={2.5} fill={C.orange} opacity={0.5 + 0.5 * Math.sin(t * 6)} />
        </g>
      )}
    </g>
  );
};

// ── counter items ──────────────────────────────────────────────────────
const NOTE = { x0: -0.85, x1: -0.05, y0: -0.12, y1: 0.58 };
const LANDLINE: Box = { x0: 0.62, x1: 1.08, y0: -0.02, y1: 0.46, z0: 1.1, z1: 1.28 };
const PC: Box = { x0: 1.35, x1: 2.15, y0: -0.22, y1: 0.48, z0: 1.1, z1: 1.78 };
export const COUNTER: Box = { x0: -1.05, x1: 2.4, y0: -0.32, y1: 0.72, z1: 1.1 };
/** World anchor of each part lit in E5: 0 computer, 1 notebook, 2 landline, 3 counter. */
export const PARTS: [number, number, number][] = [[1.75, 0.13, 1.5], [-0.45, 0.22, 1.12], [0.85, 0.22, 1.3], [0.7, 0.72, 0.6]];

/** Notebook: messy crossed-out notes on dark red, neat checked lines once it is orange. */
const Notebook: React.FC<{ t: number; o: number }> = ({ t, o }) => {
  const z = 1.105;
  const page = mix("#9A3328", "#FFD3A6", o);
  const ink = mix("#1E0505", "#5A2200", o);
  const marks = EV.scribble.map((s) => rise(t, s, 0.35));
  const messy = 1 - o;
  const w = NOTE.x1 - NOTE.x0;
  return (
    <g>
      <polygon points={quadZ(z, NOTE.x0 - 0.03, NOTE.x1 + 0.03, NOTE.y0 - 0.03, NOTE.y1 + 0.03)} fill={mix("#3A0909", "#8A3A00", o)} />
      <polygon points={quadZ(z + 0.01, NOTE.x0, NOTE.x0 + w / 2 - 0.02, NOTE.y0, NOTE.y1)} fill={page} />
      <polygon points={quadZ(z + 0.01, NOTE.x0 + w / 2 + 0.02, NOTE.x1, NOTE.y0, NOTE.y1)} fill={page} />
      <g transform={matZ(NOTE.x0, NOTE.y0, z + 0.02)}>
        {[0.12, 0.24, 0.36, 0.48, 0.6].map((v) => (
          <line key={v} x1={0.04} x2={w - 0.04} y1={v} y2={v} stroke={ink} strokeWidth={0.008} opacity={0.35} />
        ))}
        <g opacity={messy}>
          {marks.map((p, i) => {
            const v = 0.1 + (i % 5) * 0.12;
            const left = i < 3 ? 0.04 : w / 2 + 0.05;
            const len = (0.22 + rnd(i * 3.3) * 0.12) * p;
            return (
              <g key={i}>
                <path d={`M${left} ${v} q ${len / 4} -0.04 ${len / 2} 0 t ${len / 2} 0`} stroke={ink} strokeWidth={0.022} fill="none" />
                {p > 0.6 && <path d={`M${left} ${v - 0.04} L${left + len} ${v + 0.03} M${left} ${v + 0.03} L${left + len} ${v - 0.04}`} stroke={ink} strokeWidth={0.02} />}
              </g>
            );
          })}
        </g>
        <g opacity={o}>
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <path d={`M0.05 ${0.1 + i * 0.12} l0.03 0.03 l0.05 -0.06`} stroke={ink} strokeWidth={0.02} fill="none" />
              <line x1={0.16} x2={0.34} y1={0.1 + i * 0.12} y2={0.1 + i * 0.12} stroke={ink} strokeWidth={0.02} />
            </g>
          ))}
        </g>
      </g>
      {/* scribbling pencil while in chaos */}
      {messy > 0.01 && chaosAt(t) > 0.05 && (
        <g transform={matZ(NOTE.x0 + 0.15 + ((t * 0.8) % 0.5), NOTE.y0 + 0.3, z + 0.05)} opacity={chaosAt(t)}>
          <line x1={0} y1={0} x2={0.18} y2={-0.18} stroke="#C9B8A8" strokeWidth={0.04} />
        </g>
      )}
      <Bloom x={-0.45} y={0.22} z={1.12} r={40} o={o} />
    </g>
  );
};

/** Landline ring waves: dark red, flat (they never glow). */
const RingWaves: React.FC<{ t: number }> = ({ t }) => {
  const [cx, cy] = iso(0.85, 0.22, 1.3);
  const out: React.ReactNode[] = [];
  EV.ring.forEach((r0, i) => {
    if (t < r0 || t > r0 + 1.4) return;
    for (let k = 0; k < 3; k++) {
      const p = clamp01((t - r0 - k * 0.22) / 0.85);
      if (p <= 0 || p >= 1) continue;
      out.push(<ellipse key={`${i}-${k}`} cx={cx} cy={cy - 6} rx={18 + p * 110} ry={(18 + p * 110) * 0.55} fill="none" stroke={C.red2} strokeWidth={7 - p * 4} opacity={1 - p * 0.8} />);
    }
  });
  return <g>{out}</g>;
};

const ringing = (t: number) => Math.max(0, ...EV.ring.map((r) => windowed(t, r, r + 1.05, 0.03, 0.1)));

const Landline: React.FC<{ t: number; o: number }> = ({ t, o }) => {
  const r = ringing(t);
  const hop = r * Math.abs(Math.sin(t * 44)) * 0.06;
  return (
    <g>
      <Solid b={LANDLINE} o={o} dim={0.15} />
      <Solid b={{ x0: 0.66, x1: 1.04, y0: 0.06, y1: 0.18, z0: 1.28 + hop, z1: 1.36 + hop }} o={o} />
      {[0, 1, 2].map((i) => (
        <polygon key={i} points={quadZ(1.285, 0.7 + i * 0.12, 0.78 + i * 0.12, 0.28, 0.4)} fill={mix("#2A0606", "#7A3000", o)} />
      ))}
      <Bloom x={0.85} y={0.22} z={1.3} r={34} o={o} />
    </g>
  );
};

const Computer: React.FC<{ t: number; o: number }> = ({ t, o }) => {
  const scr = { x0: 1.45, x1: 2.05, z0: 1.24, z1: 1.68 };
  return (
    <g>
      <Solid b={{ x0: 1.5, x1: 2.0, y0: -0.1, y1: 0.4, z0: 1.1, z1: 1.16 }} o={o} dim={0.2} />
      <Solid b={PC} o={o} dim={0.1} />
      <polygon points={quadY(PC.y1 + 0.001, scr.x0, scr.x1, scr.z0, scr.z1)} fill={mix("#1E0606", "#2A1000", o)} />
      <g transform={matY(PC.y1 + 0.002, scr.x0, scr.z1)}>
        {/* off: a dull cursor · on: chat bubbles answering themselves */}
        <rect x={0.06} y={0.06} width={0.05} height={0.06} fill={C.red2} opacity={(1 - o) * (Math.sin(t * 6) > 0 ? 1 : 0.2)} />
        <g opacity={o}>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i % 2 ? 0.22 : 0.05} y={0.05 + i * 0.09} width={0.2 + ((i * 0.13 + t * 0.4) % 0.12)} height={0.055} rx={0.02} fill={i % 2 ? C.orange : "#FFE7CF"} />
          ))}
        </g>
      </g>
      {o > 0 && <polygon points={quadY(PC.y1 + 0.003, scr.x0, scr.x1, scr.z0, scr.z1)} fill={C.orange} opacity={o * 0.25} filter="url(#blur6)" />}
      <Bloom x={1.75} y={0.13} z={1.5} r={46} o={o} />
    </g>
  );
};

// ── after: ordered light network + pulses ───────────────────────────────
const ZN = 2.75;
type Seg = [[number, number, number], [number, number, number]];
const NET: Seg[] = [
  [[1.75, 0.13, 1.78], [1.75, 0.13, ZN]],
  [[0.85, 0.22, 1.36], [0.85, 0.22, ZN]],
  [[-0.45, 0.22, 1.12], [-0.45, 0.22, ZN]],
  [[-3.0, -0.2, 2.3], [-3.0, -0.2, ZN]],
  [[0.2, -2.6, 2.3], [0.2, -2.6, ZN]],
  [[-3.0, -0.2, ZN], [-0.45, -0.2, ZN]],
  [[-0.45, -0.2, ZN], [1.75, -0.2, ZN]],
  [[0.2, -2.6, ZN], [0.2, -0.2, ZN]],
  [[-0.45, -0.2, ZN], [-0.45, 0.22, ZN]],
  [[0.85, -0.2, ZN], [0.85, 0.22, ZN]],
  [[1.75, -0.2, ZN], [1.75, 0.13, ZN]],
];

const Network: React.FC<{ t: number; o: number }> = ({ t, o }) => {
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <g filter="url(#blur6)" opacity={0.8}>
        {NET.map(([a, b], i) => {
          const p = iso(...a);
          const q = iso(...b);
          return <line key={i} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={C.orange} strokeWidth={6} />;
        })}
      </g>
      {NET.map(([a, b], i) => {
        const p = iso(...a);
        const q = iso(...b);
        const k = ((t * 0.9 + i * 0.37) % 1 + 1) % 1;
        return (
          <g key={i}>
            <line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={C.orangeHi} strokeWidth={2} />
            <circle cx={p[0] + (q[0] - p[0]) * k} cy={p[1] + (q[1] - p[1]) * k} r={3.5} fill="#FFF3E0" />
          </g>
        );
      })}
    </g>
  );
};

/** E5: a burst ring on the part each task's check lights up. */
const PartBursts: React.FC<{ t: number }> = ({ t }) => (
  <g style={{ mixBlendMode: "screen" }}>
    {EV.check.map((c, i) => {
      const p = clamp01((t - c) / 0.7);
      if (p <= 0 || p >= 1) return null;
      const [x, y, z] = PARTS[i];
      const [cx, cy] = iso(x, y, z);
      const r = 14 + EASE_OUT(p) * 90;
      return (
        <g key={i} opacity={1 - p}>
          <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.58} fill="none" stroke={C.orangeHi} strokeWidth={4} />
          <circle cx={cx} cy={cy} r={30 * (1 - p) + 6} fill={C.orange} filter="url(#blur12)" />
        </g>
      );
    })}
  </g>
);

/** Small check badges popping above the elements while the business runs itself (E7+). */
const Checks: React.FC<{ t: number; o: number }> = ({ t, o }) => {
  if (o <= 0) return null;
  const spots: [number, number, number][] = [[-0.45, 0.22, 1.3], [0.85, 0.22, 1.45], [1.75, 0.13, 1.9], [-3.0, -0.2, 2.5], [0.2, -2.6, 2.5]];
  return (
    <g opacity={o}>
      {spots.map(([x, y, z], i) => {
        const period = 2.2;
        const a = EV.allOn + 1.2 + i * 0.45;
        if (t < a) return null;
        const p = (((t - a) % period) + period) % period / 1.1;
        if (p > 1) return null;
        const [sx, sy] = iso(x, y, z);
        return (
          <g key={i} transform={`translate(${sx} ${sy - p * 40})`} opacity={Math.sin(p * Math.PI)}>
            <circle r={12} fill={C.orange} />
            <path d="M-5 0 l3.5 3.5 l6.5 -7" stroke={C.ink} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })}
    </g>
  );
};

// ── the sign ───────────────────────────────────────────────────────────
const SIGN: Required<Box> = { x0: -2.75, x1: 2.0, y0: 3.0, y1: 3.32, z0: H - 0.05, z1: H + 1.05 };
const Sign: React.FC<{ o: number }> = ({ o }) => {
  const f = boxFaces(SIGN);
  const w = SIGN.x1 - SIGN.x0;
  const h = SIGN.z1 - SIGN.z0;
  const textProps = {
    x: w / 2, y: h / 2 + 0.2, textAnchor: "middle" as const, fontFamily: "Sora", fontWeight: 800, fontSize: 0.58, letterSpacing: 0.02,
  };
  return (
    <g>
      <polygon points={quadY(3.16, -2.2, -2.1, H - 0.4, H)} fill="#2A0A0A" />
      <polygon points={quadY(3.16, 1.4, 1.5, H - 0.4, H)} fill="#2A0A0A" />
      <polygon points={f.top} fill={mix("#3A0C0C", "#3A1C00", o)} />
      <polygon points={f.right} fill={mix("#2A0808", "#2A1400", o)} />
      <polygon points={f.left} fill={mix("#1E0606", "#140A00", o)} />
      <g transform={matY(SIGN.y1, SIGN.x0, SIGN.z1)}>
        <rect x={0.08} y={0.08} width={w - 0.16} height={h - 0.16} rx={0.08} fill="none" stroke={mix(C.red0, C.orange, o)} strokeWidth={0.03} />
        {/* almost off: dark red letters, no light */}
        <text {...textProps} fill={mix(C.red2, C.orangeHi, o)}>TU NEGOCIO</text>
        {o > 0 && (
          <>
            <text {...textProps} fill={C.orange} opacity={o * 0.9} filter="url(#blurSign)">TU NEGOCIO</text>
            <text {...textProps} fill="#FFE9D2" opacity={o * 0.55}>TU NEGOCIO</text>
          </>
        )}
      </g>
      {o > 0 && <polygon points={f.left} fill={C.orange} opacity={o * 0.45} filter="url(#blur12)" style={{ mixBlendMode: "screen" }} />}
    </g>
  );
};

// ── glass fronts ───────────────────────────────────────────────────────
const KNEE = 0.62;
const DOOR = { x0: 2.25, x1: 3.15 };
const Glass: React.FC<{ o: number; t: number }> = ({ o, t }) => {
  const frame = mix(C.red0, C.orangeHi, o);
  const glassFill = mix("#3A1010", C.orangeHi, o);
  const mullY = [-3.5, -1.2, 1.1, DOOR.x0, DOOR.x1, 3.5];
  const mullX = [-3, -1, 1, 3];
  const sheen = (t * 0.05) % 1;
  return (
    <g>
      {/* right glass (x = 3.5) */}
      <polygon points={quadX(3.5, -3, 3, KNEE, H)} fill={glassFill} opacity={0.14 + o * 0.06} />
      <polygon points={quadX(3.5, -3, 3, 0, KNEE)} fill={tone("right", o)} />
      {mullX.map((y) => (
        <polygon key={y} points={quadX(3.5, y - 0.05, y + 0.05, KNEE, H)} fill={frame} />
      ))}
      <polygon points={quadX(3.5, -3, 3, KNEE - 0.04, KNEE + 0.04)} fill={frame} />
      {/* left glass (y = 3), with the door */}
      <polygon points={quadY(3, -3.5, 3.5, KNEE, H)} fill={glassFill} opacity={0.14 + o * 0.06} />
      <polygon points={quadY(3, DOOR.x0, DOOR.x1, 0, KNEE)} fill={glassFill} opacity={0.14 + o * 0.06} />
      <polygon points={quadY(3, -3.5, DOOR.x0, 0, KNEE)} fill={tone("left", o)} />
      <polygon points={quadY(3, DOOR.x1, 3.5, 0, KNEE)} fill={tone("left", o)} />
      {mullY.map((x) => (
        <polygon key={x} points={quadY(3, x - 0.05, x + 0.05, x === DOOR.x0 || x === DOOR.x1 ? 0 : KNEE, H)} fill={frame} />
      ))}
      <polygon points={quadY(3, -3.5, DOOR.x0, KNEE - 0.04, KNEE + 0.04)} fill={frame} />
      <polygon points={quadY(3, DOOR.x1, 3.5, KNEE - 0.04, KNEE + 0.04)} fill={frame} />
      <polygon points={quadY(3, DOOR.x0, DOOR.x1, 2.55, 2.63)} fill={frame} />
      {/* soft street reflection sweeping over the glass */}
      <g opacity={0.06}>
        <polygon points={quadY(3, -3.5 + sheen * 9, -2.9 + sheen * 9, KNEE, H)} fill="#FFF4EC" />
      </g>
      {/* top rims */}
      <polygon points={quadZ(H, -3.7, 3.7, 2.86, 3.06)} fill={tone("top", o)} />
      <polygon points={quadZ(H, 3.44, 3.64, -3.2, 3.06)} fill={tone("top", o)} />
      <polygon points={quadY(3.06, -3.7, 3.64, H - 0.12, H)} fill={tone("left", o, 0.1)} />
      <polygon points={quadX(3.64, -3.2, 3.06, H - 0.12, H)} fill={tone("right", o, 0.1)} />
      {o > 0 && (
        <>
          <polyline points={pts([iso(-3.7, 3.06, H), iso(3.64, 3.06, H), iso(3.64, -3.2, H)])} fill="none" stroke="#FFE2C4" strokeWidth={2} opacity={o} />
          {/* light spilling out of the windows */}
          <polygon points={quadY(3, -3.5, 3.5, KNEE, H)} fill={C.orange} opacity={o * 0.35} filter="url(#blur18)" style={{ mixBlendMode: "screen" }} />
          <polygon points={quadX(3.5, -3, 3, KNEE, H)} fill={C.orange} opacity={o * 0.3} filter="url(#blur18)" style={{ mixBlendMode: "screen" }} />
        </>
      )}
    </g>
  );
};

// ── people schedule ────────────────────────────────────────────────────
type Pt = [number, number];
const WALK = 2.6; // world units per second
/** Position after walking `d` world units along a polyline. */
const walk = (path: Pt[], d: number): Pt => {
  let rest = Math.max(0, d);
  for (let i = 0; i < path.length - 1; i++) {
    const [a, b] = [path[i], path[i + 1]];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (rest <= len) return [lerp(a[0], b[0], rest / len), lerp(a[1], b[1], rest / len)];
    rest -= len;
  }
  return path[path.length - 1];
};
const pathLen = (path: Pt[]) => path.slice(1).reduce((s, b, i) => s + Math.hypot(b[0] - path[i][0], b[1] - path[i][1]), 0);
const STREET_IN: Pt = [8.6, 4.05];
const DOOR_OUT: Pt = [2.7, 4.05];
const DOOR_IN: Pt = [2.7, 2.2];
/** A customer that walks in from the sidewalk at `a`, waits at `spot` and leaves at `b`. */
const visitor = (t: number, a: number, b: number, spot: Pt = [0.9, 1.7]): { p: Pt; op: number } | null => {
  const inPath = [STREET_IN, DOOR_OUT, DOOR_IN, spot];
  const outPath = [spot, DOOR_IN, DOOR_OUT, STREET_IN];
  const dur = pathLen(outPath) / WALK;
  if (t < a || t > b + dur) return null;
  if (t < b) return { p: walk(inPath, (t - a) * WALK), op: rise(t, a, 0.5) };
  return { p: walk(outPath, (t - b) * WALK), op: 1 - rise(t, b + dur - 0.5, 0.5) };
};
const CUSTOMERS = (t: number) => {
  const out: { p: Pt; op: number; seed: number }[] = [];
  const push = (v: { p: Pt; op: number } | null, seed: number) => v && out.push({ ...v, seed });
  push(visitor(t, 1.6, 10.1), 2); // E2: the customer the owner attends while the phone piles up
  push(visitor(t, 17.6, 99), 3); // E5: served calmly while the assistant answers
  // E7: full and fluid
  push(visitor(t, 32.4, 99, [-1.7, 1.5]), 4);
  push(visitor(t, 33.0, 99, [2.0, 2.3]), 5);
  push(visitor(t, 33.6, 99, [-2.3, -1.3]), 7);
  push(visitor(t, 34.4, 37.2, [-0.6, 2.4]), 9);
  push(visitor(t, 35.4, 99, [1.4, 2.6]), 10);
  return out;
};

/** Pedestrians strolling past on the sidewalk the whole time. */
const strollers = (t: number): { p: Pt; op: number; seed: number }[] =>
  [
    { x: -9 + t * 0.55, y: 4.05, seed: 8 },
    { x: 16 - ((t * 0.5 + 6) % 32), y: 4.35, seed: 11 },
    { x: 5.0, y: -14 + ((t * 0.45 + 3) % 32), seed: 12 },
  ].map((s) => ({ p: [s.x, s.y] as Pt, op: 1, seed: s.seed }));

// ── the invisible employee ──────────────────────────────────────────────
const OWNER: Pt = [0.6, -1.0];
const G_ORIGIN: Pt = [-0.6, -1.05];
/** Where each copy ends after the split: agenda (notebook), counter, phone. */
export const GHOSTS: { id: string; label: string; to: Pt }[] = [
  { id: "agenda", label: "AGENDA", to: [-0.6, -1.05] },
  { id: "mostrador", label: "MOSTRADOR", to: [2.95, 0.85] },
  { id: "movil", label: "MÓVIL", to: [2.05, -0.95] },
];
export const ghostIn = (t: number) => rise(t, EV.ghostIn + 0.35, 0.8, EASE);
const ghostPos = (t: number, i: number): Pt => {
  const p = EASE(clamp01((t - EV.split - i * 0.12) / 0.95));
  const [x0, y0] = G_ORIGIN;
  const [x1, y1] = GHOSTS[i].to;
  // a small sideways arc so the copies peel off instead of sliding on a line
  const arc = Math.sin(p * Math.PI) * 0.35 * (i === 1 ? -1 : 1);
  return [lerp(x0, x1, p) + arc * 0.5, lerp(y0, y1, p) - arc];
};
export const ghostScreen = (t: number, i: number, z = 0) => iso(...ghostPos(t, i), z);

/** Particles converging into the assistant's shape (E4). */
const Materialize: React.FC<{ t: number }> = ({ t }) => {
  const a = EV.ghostIn;
  const p = clamp01((t - a) / 1.0);
  if (p <= 0 || p >= 1) return null;
  const [cx, cy] = iso(...G_ORIGIN, 0);
  return (
    <g style={{ mixBlendMode: "screen" }}>
      {Array.from({ length: 26 }, (_, i) => {
        const ang = rnd(i * 2.3) * Math.PI * 2;
        const r0 = 90 + rnd(i * 4.1) * 120;
        const q = EASE(clamp01((p - rnd(i) * 0.25) / 0.7));
        const r = r0 * (1 - q);
        const ty = -40 - rnd(i * 6.7) * 50;
        return <circle key={i} cx={cx + Math.cos(ang) * r} cy={cy + ty + Math.sin(ang) * r * 0.6} r={2 + rnd(i * 9.1) * 3} fill={C.orangeHi} opacity={Math.sin(q * Math.PI) * 0.9 + 0.1 * (1 - p)} />;
      })}
      <ellipse cx={cx} cy={cy} rx={30 + 20 * p} ry={(30 + 20 * p) * 0.45} fill="none" stroke={C.orangeHi} strokeWidth={2} opacity={Math.sin(p * Math.PI)} />
    </g>
  );
};

/** The orange translucent assistant; it splits into three copies at EV.split. `front` draws the copies in front of the counter. */
const Ghosts: React.FC<{ t: number; front: boolean }> = ({ t, front }) => {
  const g = ghostIn(t);
  if (g <= 0) return null;
  const split = t >= EV.split;
  const ids = split ? [0, 1, 2] : [0];
  return (
    <g>
      {ids.map((i) => {
        const [x, y] = ghostPos(t, i);
        if ((y > 0.3) !== front) return null;
        const copyOp = i === 0 ? 1 : rise(t, EV.split + i * 0.12, 0.25);
        const work = rise(t, EV.split + 1.0, 0.5);
        return <Person key={i} x={x} y={y} t={t} seed={20 + i} kind="ghost" op={g * copyOp} scaleY={0.6 + 0.4 * g} phone={i === 2 ? work : 0} />;
      })}
    </g>
  );
};

export const ShopInterior: React.FC<{ t: number }> = ({ t }) => {
  const o = orangeAt(t);
  const chaos = chaosAt(t);
  const people = CUSTOMERS(t).filter(({ p }) => p[1] < 3.1);
  const behindCounter = people.filter(({ p }) => p[1] < 0.3);
  const inFront = people.filter(({ p }) => p[1] >= 0.3);
  return (
    <g>
      {/* floor */}
      <polygon points={quadZ(0, -3.5, 3.5, -3, 3)} fill={mix("#1A0404", "#7A3200", o)} />
      <g transform={matZ(-3.5, -3, 0.001)} opacity={0.5}>
        {Array.from({ length: 7 }, (_, i) => (
          <line key={`a${i}`} x1={i + 1} y1={0} x2={i + 1} y2={6} stroke={mix("#3A0C0C", "#B04A00", o)} strokeWidth={0.02} />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <line key={`b${i}`} x1={0} y1={i + 1} x2={7} y2={i + 1} stroke={mix("#3A0C0C", "#B04A00", o)} strokeWidth={0.02} />
        ))}
      </g>
      {o > 0 && <ellipse cx={iso(0.4, 0.2)[0]} cy={iso(0.4, 0.2)[1]} rx={groundEllipse(3).rx} ry={groundEllipse(3).ry} fill={C.orangeHi} opacity={0.25 * o} filter="url(#blur18)" />}
      {/* back walls (inner faces) */}
      <polygon points={quadY(-3, -3.5, 3.5, 0, H)} fill={tone("left", o, 0.5)} />
      <polygon points={quadX(-3.5, -3, 3, 0, H)} fill={tone("right", o, 0.42)} />
      <polygon points={quadZ(H, -3.7, 3.5, -3.2, -3)} fill={tone("top", o)} />
      <polygon points={quadZ(H, -3.7, -3.5, -3.2, 3)} fill={tone("top", o)} />
      {o > 0 && (
        <polyline points={pts([iso(-3.5, 3, H), iso(-3.5, -3, H), iso(3.5, -3, H)])} fill="none" stroke="#FFE2C4" strokeWidth={2} opacity={o} />
      )}
      <Shelves s={shelfLeft} o={o} side="L" />
      <Shelves s={shelfRight} o={o} side="R" />
      {/* behind the counter: owner, assistant copies, browsing customers */}
      {behindCounter.map(({ p, op, seed }) => <Person key={seed} x={p[0]} y={p[1]} t={t} seed={seed} kind="client" op={op} />)}
      <Ghosts t={t} front={false} />
      <Person x={OWNER[0]} y={OWNER[1]} t={t} seed={1} kind="owner" rim={o} />
      <Materialize t={t} />
      <Solid b={COUNTER} o={partAt(t, 3)} dim={0.05} edge />
      <polygon points={quadY(COUNTER.y1 + 0.001, COUNTER.x0 + 0.15, COUNTER.x1 - 0.15, 0.25, 0.85)} fill={mix("#4A0E0E", "#FFC48A", partAt(t, 3))} />
      <Bloom x={0.7} y={0.72} z={0.6} r={70} o={partAt(t, 3)} />
      <Notebook t={t} o={partAt(t, 1)} />
      <Landline t={t} o={partAt(t, 2)} />
      <Computer t={t} o={partAt(t, 0)} />
      <RingWaves t={t} />
      <PartBursts t={t} />
      {/* in front of the counter */}
      <Ghosts t={t} front />
      {inFront.map(({ p, op, seed }) => <Person key={seed} x={p[0]} y={p[1]} t={t} seed={seed} kind="client" op={op} />)}
      {/* the waiting customer's "?" while the owner juggles the phone and the notebook */}
      {chaos > 0.05 && t > 6 && (
        <g transform={`translate(${iso(0.9, 1.7)[0] + 22} ${iso(0.9, 1.7)[1] - 104})`} opacity={chaos * rise(t, 6, 0.3)}>
          <rect x={-18} y={-18} width={36} height={30} rx={8} fill={C.cream} />
          <text x={0} y={5} textAnchor="middle" fontFamily="Sora" fontWeight={800} fontSize={22} fill={C.red2}>?</text>
        </g>
      )}
      <Network t={t} o={o} />
      <Checks t={t} o={o} />
    </g>
  );
};

// ── chaos pictograms (dark red, flat): rings, messages, crossed-out notes ──
const pop = (t: number, a: number) => {
  const p = (t - a) / 1.25;
  if (p < 0 || p > 1) return null;
  return { s: EASE_OUT(clamp01(p / 0.22)), o: Math.min(1, (1 - p) / 0.3), up: p * 34 };
};
const GLYPH = "#E8C9BE";
// screen positions above the roofline, over the dark buildings (the camera is locked by E2)
export const ChaosIcons: React.FC<{ t: number }> = ({ t }) => {
  const items: React.ReactNode[] = [];
  EV.ring.forEach((r, i) => {
    const q = pop(t, r);
    if (!q) return;
    items.push(
      <g key={`r${i}`} transform={`translate(${800} ${650 - q.up}) scale(${q.s * 1.3})`} opacity={q.o}>
        <circle r={34} fill={C.red0} stroke={C.red2} strokeWidth={3} />
        <path d="M-15 -4 q15 -14 30 0 l-4 7 l-6 -3 v-4 q-5 -2 -10 0 v4 l-6 3 z" fill={GLYPH} />
        <rect x={-10} y={4} width={20} height={9} rx={2} fill={GLYPH} />
      </g>,
    );
  });
  EV.chatIn.forEach((m, i) => {
    const q = pop(t, m);
    if (!q) return;
    const dx = [-40, 30, -10][i % 3];
    items.push(
      <g key={`m${i}`} transform={`translate(${640 + dx} ${585 - q.up}) scale(${q.s * 1.3})`} opacity={q.o}>
        <path d="M-30 -22 h60 a10 10 0 0 1 10 10 v24 a10 10 0 0 1 -10 10 h-36 l-14 12 v-12 h-10 a10 10 0 0 1 -10 -10 v-24 a10 10 0 0 1 10 -10 z" fill={C.red0} stroke={C.red2} strokeWidth={3} />
        {[-14, 0, 14].map((x) => <circle key={x} cx={x} cy={0} r={4} fill={GLYPH} />)}
      </g>,
    );
  });
  EV.scribble.forEach((sc, i) => {
    const q = pop(t, sc);
    if (!q) return;
    const dx = [0, -60, 55, -20][i % 4];
    const rot = [-8, 6, -3, 10][i % 4];
    items.push(
      <g key={`n${i}`} transform={`translate(${340 + dx} ${650 - q.up - (i % 2) * 55}) rotate(${rot}) scale(${q.s * 1.3})`} opacity={q.o}>
        <rect x={-30} y={-30} width={60} height={60} rx={3} fill={C.red2} />
        {[-16, -4, 8, 20].map((y) => <path key={y} d={`M-20 ${y} q10 -4 20 0 t20 0`} stroke="#2A0606" strokeWidth={2.5} fill="none" />)}
        <path d="M-22 -22 L22 22 M22 -22 L-22 22" stroke={GLYPH} strokeWidth={4} strokeLinecap="round" />
      </g>,
    );
  });
  return <g>{items}</g>;
};

export const ShopFront: React.FC<{ t: number }> = ({ t }) => {
  const o = orangeAt(t);
  const outside = CUSTOMERS(t).filter(({ p }) => p[1] >= 3.1);
  return (
    <g>
      <Glass o={o} t={t} />
      <Sign o={o} />
      {[...strollers(t), ...outside].map(({ p, op, seed }) => <Person key={seed} x={p[0]} y={p[1]} t={t} seed={seed} kind="client" op={op} />)}
    </g>
  );
};

/** Ghost label anchors in screen space (the camera is locked by then). */
export const ghostLabelPos = (t: number, i: number) => ghostScreen(t, i, 2.15);
export { H as WALL_H, MONO as LABEL_FONT };
