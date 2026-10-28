import React from "react";
import { C, COND, EV, EASE_OUT, S, chaosAt, clamp01, mix, orangeAt, rise, rnd, windowed } from "../theme";
import { Box, U, boxFaces, groundEllipse, iso, matY, matZ, pts, quadX, quadY, quadZ } from "../iso";

const H = 3.2; // wall height
const GREY = { top: "#555555", left: "#474747", right: "#3A3A3A" };
const ORNG = { top: C.orangeHi, left: C.orange, right: C.orangeLo };
type Tone = "top" | "left" | "right";
const tone = (k: Tone, o: number, dim = 0) => {
  const c = mix(GREY[k], ORNG[k], o);
  return dim ? mix(c.startsWith("rgb") ? rgbHex(c) : c, "#000000", dim) : c;
};
const rgbHex = (c: string) => "#" + (c.match(/\d+/g) ?? []).map((v) => Number(v).toString(16).padStart(2, "0")).join("");

/** A solid box with grey→orange tones. `dim` darkens it (0..1). */
const Solid: React.FC<{ b: Box; o: number; dim?: number; glow?: boolean; edge?: boolean }> = ({ b, o, dim = 0, edge }) => {
  const f = boxFaces(b);
  return (
    <g>
      <polygon points={f.left} fill={tone("left", o, dim)} />
      <polygon points={f.right} fill={tone("right", o, dim)} />
      <polygon points={f.top} fill={tone("top", o, dim)} />
      {edge && o > 0 && (
        <polyline points={pts([iso(b.x0, b.y1, b.z1), iso(b.x1, b.y1, b.z1), iso(b.x1, b.y0, b.z1)])} fill="none" stroke={C.orangeHi} strokeWidth={1.5} opacity={o} />
      )}
    </g>
  );
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
      <polygon points={quadY(1.9, -3.5, -2.88, 0, 2.3)} fill={tone("left", o, 0.25)} />
    ) : (
      <polygon points={quadX(2.9, -3.0, -2.42, 0, 2.3)} fill={tone("right", o, 0.25)} />
    )}
    {s.boards.map((b, i) => (
      <g key={i}>
        <Solid b={b} o={o} dim={0.1} />
        {s.prods[i].map((p, j) => (
          <Solid key={j} b={p} o={o * (0.75 + 0.25 * p.shade)} dim={0.05 + p.shade * 0.25} />
        ))}
      </g>
    ))}
  </g>
);

// ── people: flat faceless silhouettes ──────────────────────────────────
export const Person: React.FC<{ x: number; y: number; o: number; t: number; seed: number; op?: number; holdPhone?: number; buzz?: number }> = ({
  x, y, o, t, seed, op = 1, holdPhone = 0, buzz = 0,
}) => {
  const [sx, sy] = iso(x, y, 0);
  const bob = Math.sin(t * 1.6 + seed) * 1.2;
  const jitter = buzz * Math.sin(t * 90) * 1.5;
  const body = mix("#262626", "#24160A", o);
  return (
    <g opacity={op} transform={`translate(${sx + jitter} ${sy}) scale(${U / 46})`}>
      <ellipse cx={0} cy={0} rx={18} ry={7} fill="#000" opacity={0.35} />
      <rect x={-13} y={-60 + bob} width={26} height={60 - bob} rx={11} fill={body} stroke={C.orange} strokeWidth={2} strokeOpacity={o} />
      <circle cx={0} cy={-71 + bob} r={9.5} fill={body} stroke={C.orange} strokeWidth={2} strokeOpacity={o} />
      {holdPhone > 0 && (
        <g opacity={holdPhone}>
          <rect x={9} y={-46 + bob} width={9} height={15} rx={2} fill={mix("#5E5E5E", C.orange, o)} />
          {buzz > 0 && <rect x={9} y={-46 + bob} width={9} height={15} rx={2} fill="#EDEDED" opacity={buzz * (0.5 + 0.5 * Math.sin(t * 40))} />}
        </g>
      )}
    </g>
  );
};

// ── counter items ──────────────────────────────────────────────────────
const NOTE = { x0: -0.85, x1: -0.05, y0: -0.12, y1: 0.58 };
const CORE = { x: 0.3, y: 0.22 };
const LANDLINE: Box = { x0: 0.62, x1: 1.08, y0: -0.02, y1: 0.46, z0: 1.1, z1: 1.28 };
const PC: Box = { x0: 1.35, x1: 2.15, y0: -0.22, y1: 0.48, z0: 1.1, z1: 1.78 };
export const COUNTER: Box = { x0: -1.05, x1: 2.4, y0: -0.32, y1: 0.72, z1: 1.1 };
export const CORE_PT = () => iso(CORE.x, CORE.y, 1.35);

/** Notebook: messy notes in grey (count grows with each scribble), neat checked lines in orange. */
const Notebook: React.FC<{ t: number; o: number }> = ({ t, o }) => {
  const z = 1.105;
  const page = mix("#6E6E6E", "#FFC98A", o);
  const ink = mix("#2A2A2A", "#4A2000", o);
  const marks = EV.scribble.map((s) => rise(t, s, 0.35));
  // in the flashback (E10) the old mess comes back
  const mess = t < S.E10 ? marks.slice(0, 4) : marks;
  const messy = 1 - o;
  const w = NOTE.x1 - NOTE.x0;
  return (
    <g>
      <polygon points={quadZ(z, NOTE.x0 - 0.03, NOTE.x1 + 0.03, NOTE.y0 - 0.03, NOTE.y1 + 0.03)} fill={mix("#2F2F2F", "#6B3200", o)} />
      <polygon points={quadZ(z + 0.01, NOTE.x0, NOTE.x0 + w / 2 - 0.02, NOTE.y0, NOTE.y1)} fill={page} />
      <polygon points={quadZ(z + 0.01, NOTE.x0 + w / 2 + 0.02, NOTE.x1, NOTE.y0, NOTE.y1)} fill={page} />
      <g transform={matZ(NOTE.x0, NOTE.y0, z + 0.02)}>
        {/* ruled lines */}
        {[0.12, 0.24, 0.36, 0.48, 0.6].map((v) => (
          <line key={v} x1={0.04} x2={w - 0.04} y1={v} y2={v} stroke={ink} strokeWidth={0.008} opacity={0.35} />
        ))}
        {/* messy notes + crossings */}
        <g opacity={messy}>
          {mess.map((p, i) => {
            const v = 0.1 + (i % 5) * 0.12;
            const left = i < 5 ? 0.04 : w / 2 + 0.05;
            const len = (0.22 + rnd(i * 3.3) * 0.12) * p;
            return (
              <g key={i}>
                <path d={`M${left} ${v} q ${len / 4} -0.04 ${len / 2} 0 t ${len / 2} 0`} stroke={ink} strokeWidth={0.02} fill="none" />
                {i % 2 === 1 && p > 0.6 && <path d={`M${left} ${v - 0.04} L${left + len} ${v + 0.03} M${left} ${v + 0.03} L${left + len} ${v - 0.04}`} stroke={ink} strokeWidth={0.018} />}
              </g>
            );
          })}
        </g>
        {/* neat, checked lines once automated */}
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
          <line x1={0} y1={0} x2={0.18} y2={-0.18} stroke="#8A8A8A" strokeWidth={0.04} />
        </g>
      )}
    </g>
  );
};

const RingWaves: React.FC<{ t: number }> = ({ t }) => {
  const [cx, cy] = iso(0.85, 0.22, 1.3);
  const out: React.ReactNode[] = [];
  EV.ring.forEach((r0, i) => {
    if (t < r0 || t > r0 + 1.3) return;
    for (let k = 0; k < 3; k++) {
      const p = clamp01((t - r0 - k * 0.22) / 0.8);
      if (p <= 0 || p >= 1) continue;
      out.push(<ellipse key={`${i}-${k}`} cx={cx} cy={cy - 6} rx={18 + p * 95} ry={(18 + p * 95) * 0.55} fill="none" stroke="#9C9C9C" strokeWidth={3 - p * 2} opacity={(1 - p) * 0.9} />);
    }
  });
  return <g>{out}</g>;
};

const ringing = (t: number) => Math.max(0, ...EV.ring.map((r) => windowed(t, r, r + 1.05, 0.03, 0.1)));
const buzzing = (t: number) => Math.max(0, ...EV.mobileBuzz.map((r) => windowed(t, r, r + 0.6, 0.03, 0.1)));

const Landline: React.FC<{ t: number; o: number }> = ({ t, o }) => {
  const r = ringing(t);
  const hop = r * Math.abs(Math.sin(t * 44)) * 0.06;
  return (
    <g>
      <Solid b={LANDLINE} o={o} dim={0.15} />
      <Solid b={{ x0: 0.66, x1: 1.04, y0: 0.06, y1: 0.18, z0: 1.28 + hop, z1: 1.36 + hop }} o={o} />
      {[0, 1, 2].map((i) => (
        <polygon key={i} points={quadZ(1.285, 0.7 + i * 0.12, 0.78 + i * 0.12, 0.28, 0.4)} fill={mix("#2A2A2A", "#5A2800", o)} />
      ))}
    </g>
  );
};

const Computer: React.FC<{ t: number; o: number }> = ({ t, o }) => {
  const scr = { x0: 1.45, x1: 2.05, z0: 1.24, z1: 1.68 };
  return (
    <g>
      <Solid b={{ x0: 1.5, x1: 2.0, y0: -0.1, y1: 0.4, z0: 1.1, z1: 1.16 }} o={o} dim={0.2} />
      <Solid b={PC} o={o} dim={0.08} />
      <polygon points={quadY(PC.y1 + 0.001, scr.x0, scr.x1, scr.z0, scr.z1)} fill={mix("#262626", "#2A1200", o)} />
      <g transform={matY(PC.y1 + 0.002, scr.x0, scr.z1)}>
        {/* grey: a dull blinking cursor · orange: a live dashboard */}
        <rect x={0.06} y={0.06} width={0.05} height={0.06} fill="#6A6A6A" opacity={(1 - o) * (Math.sin(t * 6) > 0 ? 1 : 0.2)} />
        <g opacity={o}>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={0.06} y={0.06 + i * 0.09} width={0.12 + ((i * 0.13 + t * 0.4) % 0.32)} height={0.045} fill={C.orange} />
          ))}
        </g>
      </g>
      {o > 0 && <polygon points={quadY(PC.y1 + 0.003, scr.x0, scr.x1, scr.z0, scr.z1)} fill={C.orange} opacity={o * 0.18} filter="url(#blur6)" />}
    </g>
  );
};

/** The orange "brain" on the counter: lights up in E9, switches off in E10, back for good in E11. */
const Core: React.FC<{ t: number; o: number }> = ({ t, o }) => {
  const on = Math.max(Math.min(rise(t, EV.core, 0.45), 1 - rise(t, EV.grey, 0.25)), o);
  if (on <= 0.001) return null;
  const s = 0.16 * (0.6 + 0.4 * EASE_OUT(on));
  const b: Box = { x0: CORE.x - s, x1: CORE.x + s, y0: CORE.y - s, y1: CORE.y + s, z0: 1.1, z1: 1.1 + s * 2 };
  const f = boxFaces(b);
  const [cx, cy] = iso(CORE.x, CORE.y, 1.1 + s);
  const pulse = 0.75 + 0.25 * Math.sin(t * 5);
  const ring = groundEllipse(0.45 + 0.1 * Math.sin(t * 3));
  const [gx, gy] = iso(CORE.x, CORE.y, 1.105);
  return (
    <g opacity={on}>
      <ellipse cx={gx} cy={gy} rx={ring.rx} ry={ring.ry} fill="none" stroke={C.orange} strokeWidth={2} opacity={0.7} />
      <circle cx={cx} cy={cy} r={34} fill={C.orange} opacity={0.35 * pulse} filter="url(#blur12)" />
      <polygon points={f.left} fill={C.orange} />
      <polygon points={f.right} fill={C.orangeLo} />
      <polygon points={f.top} fill={C.orangeHi} />
    </g>
  );
};

// ── after: ordered light network + pulses ───────────────────────────────
const ZN = 2.75;
type Seg = [[number, number, number], [number, number, number]];
const NET: Seg[] = [
  // drops from each element up to the network plane
  [[1.75, 0.13, 1.78], [1.75, 0.13, ZN]],
  [[0.85, 0.22, 1.36], [0.85, 0.22, ZN]],
  [[-0.45, 0.22, 1.12], [-0.45, 0.22, ZN]],
  [[-3.0, -0.2, 2.3], [-3.0, -0.2, ZN]],
  [[0.2, -2.6, 2.3], [0.2, -2.6, ZN]],
  [[2.75, 2.6, 2.4], [2.75, 2.6, ZN]],
  // the plane: an ordered L-shaped bus
  [[-3.0, -0.2, ZN], [-0.45, -0.2, ZN]],
  [[-0.45, -0.2, ZN], [1.75, -0.2, ZN]],
  [[0.2, -2.6, ZN], [0.2, -0.2, ZN]],
  [[-0.45, -0.2, ZN], [-0.45, 0.22, ZN]],
  [[0.85, -0.2, ZN], [0.85, 0.22, ZN]],
  [[1.75, -0.2, ZN], [1.75, 0.13, ZN]],
  [[1.75, 0.13, ZN], [2.75, 0.13, ZN]],
  [[2.75, 0.13, ZN], [2.75, 2.6, ZN]],
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

/** Small check badges popping above the elements while the business runs itself. */
const Checks: React.FC<{ t: number; o: number }> = ({ t, o }) => {
  if (o <= 0) return null;
  const spots: [number, number, number][] = [[-0.45, 0.22, 1.3], [0.85, 0.22, 1.45], [1.75, 0.13, 1.9], [-3.0, -0.2, 2.5], [0.2, -2.6, 2.5]];
  return (
    <g opacity={o}>
      {spots.map(([x, y, z], i) => {
        const period = 2.2;
        const ph = ((t - S.E11 - 1.4 - i * 0.45) % period + period) % period;
        if (t < S.E11 + 1.4 + i * 0.45) return null;
        const p = ph / 1.1;
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
const Sign: React.FC<{ t: number; o: number }> = ({ t, o }) => {
  const f = boxFaces(SIGN);
  const w = SIGN.x1 - SIGN.x0;
  const h = SIGN.z1 - SIGN.z0;
  const flash = windowed(t, EV.signFlash, EV.signFlash + 1.15, 0.12, 0.45);
  const sweep = clamp01((t - EV.signFlash) / 0.55);
  const lit = o;
  const textProps = {
    x: w / 2, y: h / 2 + 0.24, textAnchor: "middle" as const, fontFamily: COND, fontWeight: 800, fontSize: 0.7, letterSpacing: 0.04,
  };
  return (
    <g>
      {/* mounting posts */}
      <polygon points={quadY(3.16, -2.2, -2.1, H - 0.4, H)} fill="#2A2A2A" />
      <polygon points={quadY(3.16, 1.4, 1.5, H - 0.4, H)} fill="#2A2A2A" />
      <polygon points={f.top} fill={mix("#4A4A4A", "#3A1C00", lit)} />
      <polygon points={f.right} fill={mix("#333333", "#2A1400", lit)} />
      <polygon points={f.left} fill={mix("#3C3C3C", "#140A00", lit)} />
      <g transform={matY(SIGN.y1, SIGN.x0, SIGN.z1)}>
        <rect x={0.08} y={0.08} width={w - 0.16} height={h - 0.16} rx={0.08} fill="none" stroke={mix("#555555", C.orange, lit)} strokeWidth={0.03} />
        <text {...textProps} fill={mix("#7A7A7A", C.orangeHi, lit)}>TU NEGOCIO</text>
        {lit > 0 && (
          <text {...textProps} fill={C.orange} opacity={lit * 0.8} filter="url(#blurSign)">TU NEGOCIO</text>
        )}
        {flash > 0 && (
          <g opacity={flash}>
            <clipPath id="sweep">
              <rect x={0} y={0} width={w * sweep} height={h} />
            </clipPath>
            <g clipPath="url(#sweep)">
              <text {...textProps} fill={C.orange} filter="url(#blurSign)">TU NEGOCIO</text>
              <text {...textProps} fill={C.orangeHi}>TU NEGOCIO</text>
            </g>
          </g>
        )}
      </g>
      {lit > 0 && <polygon points={f.left} fill={C.orange} opacity={lit * 0.25} filter="url(#blur12)" />}
    </g>
  );
};

// ── glass fronts ───────────────────────────────────────────────────────
const KNEE = 0.62;
const DOOR = { x0: 2.25, x1: 3.15 };
const Glass: React.FC<{ o: number; t: number }> = ({ o, t }) => {
  const frame = mix("#5A5A5A", C.orangeHi, o);
  const glassFill = mix("#B8C2CC", C.orangeHi, o);
  const mullY = [-3.5, -1.2, 1.1, DOOR.x0, DOOR.x1, 3.5];
  const mullX = [-3, -1, 1, 3];
  const sheen = (t * 0.05) % 1;
  return (
    <g>
      {/* right glass (x = 3.5) */}
      <polygon points={quadX(3.5, -3, 3, KNEE, H)} fill={glassFill} opacity={0.06 + o * 0.05} />
      <polygon points={quadX(3.5, -3, 3, 0, KNEE)} fill={tone("right", o)} />
      {mullX.map((y) => (
        <polygon key={y} points={quadX(3.5, y - 0.05, y + 0.05, KNEE, H)} fill={frame} />
      ))}
      <polygon points={quadX(3.5, -3, 3, KNEE - 0.04, KNEE + 0.04)} fill={frame} />
      {/* left glass (y = 3), with the door */}
      <polygon points={quadY(3, -3.5, 3.5, KNEE, H)} fill={glassFill} opacity={0.06 + o * 0.05} />
      <polygon points={quadY(3, DOOR.x0, DOOR.x1, 0, KNEE)} fill={glassFill} opacity={0.06 + o * 0.05} />
      <polygon points={quadY(3, -3.5, DOOR.x0, 0, KNEE)} fill={tone("left", o)} />
      <polygon points={quadY(3, DOOR.x1, 3.5, 0, KNEE)} fill={tone("left", o)} />
      {mullY.map((x) => (
        <polygon key={x} points={quadY(3, x - 0.05, x + 0.05, x === DOOR.x0 || x === DOOR.x1 ? 0 : KNEE, H)} fill={frame} />
      ))}
      <polygon points={quadY(3, -3.5, DOOR.x0, KNEE - 0.04, KNEE + 0.04)} fill={frame} />
      <polygon points={quadY(3, DOOR.x1, 3.5, KNEE - 0.04, KNEE + 0.04)} fill={frame} />
      <polygon points={quadY(3, DOOR.x0, DOOR.x1, 2.55, 2.63)} fill={frame} />
      {/* soft reflection sweeping over the glass */}
      <g opacity={0.07}>
        <polygon points={quadY(3, -3.5 + sheen * 9, -2.9 + sheen * 9, KNEE, H)} fill="#FFFFFF" />
      </g>
      {/* top rims */}
      <polygon points={quadZ(H, -3.7, 3.7, 2.86, 3.06)} fill={tone("top", o)} />
      <polygon points={quadZ(H, 3.44, 3.64, -3.2, 3.06)} fill={tone("top", o)} />
      <polygon points={quadY(3.06, -3.7, 3.64, H - 0.12, H)} fill={tone("left", o, 0.1)} />
      <polygon points={quadX(3.64, -3.2, 3.06, H - 0.12, H)} fill={tone("right", o, 0.1)} />
      {o > 0 && (
        <polyline points={pts([iso(-3.7, 3.06, H), iso(3.64, 3.06, H), iso(3.64, -3.2, H)])} fill="none" stroke={C.orangeHi} strokeWidth={2} opacity={o} />
      )}
    </g>
  );
};

// ── people schedule ────────────────────────────────────────────────────
const custIn = (t: number, a: number) => rise(t, S.E11 + a, 0.5);
/** A customer walking in from the street through the door after the wave. */
const walker = (t: number): [number, number] | null => {
  const a = S.E11 + 1.6;
  const p = clamp01((t - a) / 2.6);
  if (t < a) return null;
  // along the sidewalk, then turn into the door
  if (p < 0.6) return [lerp(0.2, 2.7, p / 0.6), 4.0];
  return [2.7, lerp(4.0, 2.2, (p - 0.6) / 0.4)];
};
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Pedestrian strolling past in the "before". */
const stroller = (t: number): [number, number] => [-9 + t * 0.55, 4.05];

export const ShopInterior: React.FC<{ t: number }> = ({ t }) => {
  const o = orangeAt(t);
  const chaos = chaosAt(t);
  const buzz = buzzing(t);
  const cold = 1 - o;
  const w = walker(t);
  return (
    <g>
      {/* floor */}
      <polygon points={quadZ(0, -3.5, 3.5, -3, 3)} fill={mix("#2C2C2C", "#5A2A00", o)} />
      <g transform={matZ(-3.5, -3, 0.001)} opacity={0.5}>
        {Array.from({ length: 7 }, (_, i) => (
          <line key={`a${i}`} x1={i + 1} y1={0} x2={i + 1} y2={6} stroke={mix("#353535", "#7A3A00", o)} strokeWidth={0.02} />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <line key={`b${i}`} x1={0} y1={i + 1} x2={7} y2={i + 1} stroke={mix("#353535", "#7A3A00", o)} strokeWidth={0.02} />
        ))}
      </g>
      {/* cold, dim ceiling light pool in the before */}
      <ellipse cx={iso(0.4, 0.2)[0]} cy={iso(0.4, 0.2)[1]} rx={groundEllipse(2.6).rx} ry={groundEllipse(2.6).ry} fill="url(#pool)" opacity={cold * 0.9} />
      {/* back walls (inner faces) */}
      <polygon points={quadY(-3, -3.5, 3.5, 0, H)} fill={tone("left", o, 0.18)} />
      <polygon points={quadX(-3.5, -3, 3, 0, H)} fill={tone("right", o, 0.12)} />
      <polygon points={quadZ(H, -3.7, 3.5, -3.2, -3)} fill={tone("top", o)} />
      <polygon points={quadZ(H, -3.7, -3.5, -3.2, 3)} fill={tone("top", o)} />
      {o > 0 && (
        <polyline points={pts([iso(-3.5, 3, H), iso(-3.5, -3, H), iso(3.5, -3, H)])} fill="none" stroke={C.orangeHi} strokeWidth={2} opacity={o} />
      )}
      <Shelves s={shelfLeft} o={o} side="L" />
      <Shelves s={shelfRight} o={o} side="R" />
      {/* people behind the counter line */}
      <Person x={-2.3} y={-1.6} o={o} t={t} seed={4} op={custIn(t, 1.0)} />
      <Person x={0.25} y={-1.0} o={o} t={t} seed={1} holdPhone={t < S.E11 ? 1 : 1 - o} buzz={buzz} />
      <Solid b={COUNTER} o={o} dim={0.05} edge />
      <polygon points={quadY(COUNTER.y1 + 0.001, COUNTER.x0 + 0.15, COUNTER.x1 - 0.15, 0.25, 0.85)} fill={mix("#3F3F3F", "#E06A00", o)} />
      <Notebook t={t} o={o} />
      <Core t={t} o={o} />
      <Landline t={t} o={o} />
      <Computer t={t} o={o} />
      <RingWaves t={t} />
      {/* customers in front of the counter */}
      <Person x={0.55} y={1.75} o={o} t={t} seed={2} />
      {/* a waiting customer's "?" while the owner is busy */}
      {chaos > 0.05 && (
        <g transform={`translate(${iso(0.55, 1.75)[0] + 22} ${iso(0.55, 1.75)[1] - 104})`} opacity={chaos}>
          <rect x={-18} y={-18} width={36} height={30} rx={8} fill="#5A5A5A" />
          <text x={0} y={5} textAnchor="middle" fontFamily={COND} fontWeight={800} fontSize={24} fill="#1A1A1A">?</text>
        </g>
      )}
      <Person x={-1.7} y={1.5} o={o} t={t} seed={3} op={custIn(t, 0.7)} />
      <Person x={2.0} y={2.2} o={o} t={t} seed={5} op={custIn(t, 1.25)} />
      {w && w[1] < 3.1 && <Person x={w[0]} y={w[1]} o={o} t={t} seed={6} />}
      <Network t={t} o={o} />
      <Checks t={t} o={o} />
    </g>
  );
};

// ── chaos pictograms (grey): rings, messages, crossed-out notes popping over the shop ──
const MSG_TIMES = [3.35, 4.7, 5.6, 41.75, 42.7, 43.45];
const pop = (t: number, a: number) => {
  const p = (t - a) / 1.25;
  if (p < 0 || p > 1) return null;
  return { s: EASE_OUT(clamp01(p / 0.22)), o: Math.min(1, (1 - p) / 0.3), up: p * 34 };
};
export const ChaosIcons: React.FC<{ t: number }> = ({ t }) => {
  const [lx, ly] = iso(0.85, 0.22, 1.35);
  const [hx, hy] = iso(0.25, -1.0, 2.0);
  const [nx, ny] = iso(-0.45, 0.22, 1.15);
  const items: React.ReactNode[] = [];
  EV.ring.forEach((r, i) => {
    const q = pop(t, r);
    if (!q) return;
    items.push(
      <g key={`r${i}`} transform={`translate(${lx + 70} ${ly - 120 - q.up}) scale(${q.s * 1.3})`} opacity={q.o}>
        <circle r={34} fill="#3A3A3A" stroke="#6A6A6A" strokeWidth={2} />
        <path d="M-15 -4 q15 -14 30 0 l-4 7 l-6 -3 v-4 q-5 -2 -10 0 v4 l-6 3 z" fill="#B0B0B0" />
        <rect x={-10} y={4} width={20} height={9} rx={2} fill="#B0B0B0" />
        <path d="M-40 -22 q-8 22 0 44 M40 -22 q8 22 0 44" stroke="#8A8A8A" strokeWidth={3} fill="none" opacity={0.5 + 0.5 * Math.sin(t * 30)} />
      </g>,
    );
  });
  MSG_TIMES.forEach((m, i) => {
    const q = pop(t, m);
    if (!q) return;
    const dx = [-40, 30, -10][i % 3];
    items.push(
      <g key={`m${i}`} transform={`translate(${hx + dx} ${hy - 70 - q.up}) scale(${q.s * 1.3})`} opacity={q.o}>
        <path d="M-30 -22 h60 a10 10 0 0 1 10 10 v24 a10 10 0 0 1 -10 10 h-36 l-14 12 v-12 h-10 a10 10 0 0 1 -10 -10 v-24 a10 10 0 0 1 10 -10 z" fill="#4A4A4A" stroke="#6A6A6A" strokeWidth={2} />
        {[-14, 0, 14].map((x) => <circle key={x} cx={x} cy={0} r={4} fill="#A8A8A8" />)}
      </g>,
    );
  });
  EV.scribble.forEach((sc, i) => {
    const q = pop(t, sc);
    if (!q) return;
    const dx = [-95, -150, -60, -125][i % 4];
    const rot = [-8, 6, -3, 10][i % 4];
    items.push(
      <g key={`n${i}`} transform={`translate(${nx + dx} ${ny - 60 - q.up - (i % 2) * 40}) rotate(${rot}) scale(${q.s * 1.3})`} opacity={q.o}>
        <rect x={-30} y={-30} width={60} height={60} rx={3} fill="#6E6E6E" />
        {[-16, -4, 8, 20].map((y) => <path key={y} d={`M-20 ${y} q10 -4 20 0 t20 0`} stroke="#2A2A2A" strokeWidth={2.5} fill="none" />)}
        <path d="M-22 -22 L22 22 M22 -22 L-22 22" stroke="#2A2A2A" strokeWidth={4} strokeLinecap="round" />
      </g>,
    );
  });
  return <g>{items}</g>;
};

export const ShopFront: React.FC<{ t: number }> = ({ t }) => {
  const o = orangeAt(t);
  const w = walker(t);
  const [px, py] = stroller(t);
  return (
    <g>
      <Glass o={o} t={t} />
      <Sign t={t} o={o} />
      {/* people outside, in front of the facade */}
      {t < S.E11 + 1 && px < 12 && <Person x={px} y={py} o={0} t={t} seed={8} op={1 - rise(t, S.E11 + 0.2, 0.6)} />}
      {w && w[1] >= 3.1 && <Person x={w[0]} y={w[1]} o={o} t={t} seed={6} />}
    </g>
  );
};

export { H as WALL_H, U as UNIT };
