import React from "react";
import { clamp, COLORS, easeOutBack, keys, prog, rand, vis } from "./anim";
import { AMBER, Box, CITY, EXTENT, GREEN, LAMPS, NET_NODES, STREETS_X, STREETS_Y } from "./cityData";
import { faceX, faceY, ground, iso, P2, pts } from "./iso";
import { camera, T } from "./timeline";

const N_PATTERNS = 6;

/* ---------- Estado del mundo en función del tiempo ---------- */
const worldState = (t: number) => {
  const greenFull = keys(t, [[0, 0.17], [T.s2 + 0.1, 0.17], [T.s2 + 1.2, 1], [T.close + 0.1, 1], [T.end - 0.15, 0.17]]);
  const amberPeople = keys(t, [[0, 1], [T.s2 + 0.1, 1], [T.s2 + 1.0, 0], [T.close + 0.1, 0], [T.end - 0.15, 1]]);
  const lights = keys(t, [[0, 1], [T.s10, 1], [T.s10 + 1, 0.75], [T.s13 + 0.5, 0.75], [T.s14a + 0.6, 1], [T.s15, 1], [T.s15 + 0.9, 0.06], [T.close, 0.06], [T.end - 0.2, 1]]);
  const amberGlow = keys(t, [[0, 0.75], [T.s13, 0.75], [T.s13 + 1.2, 0.45], [T.s14a + 1, 0.55], [T.s15, 0.55], [T.s15 + 0.8, 0], [T.close, 0], [T.end - 0.2, 0.75]]);
  const greenPulse = Math.max(0, 1 - Math.abs(t - (T.s13 + 1.35)) / 0.45);
  const greenGlow = keys(t, [[0, 1], [T.s15, 1], [T.s15 + 0.8, 1.45], [T.close, 1.45], [T.end - 0.2, 1]]) + greenPulse * 0.5;
  const net = vis(t, T.s14a + 0.3, T.s14e + 0.5, 0.3, 0.45);
  return { greenFull, amberPeople, lights, amberGlow, greenGlow, net };
};

/* ---------- Primitivas ---------- */
const shade = (seed: number) => {
  const r = rand(seed);
  const k = Math.floor(r() * 10);
  return { top: `rgb(${44 + k},${47 + k},${54 + k})`, fx: `rgb(${30 + k},${33 + k},${39 + k})`, fy: `rgb(${21 + k},${23 + k},${28 + k})` };
};

const Building: React.FC<{ b: Box; lights: number }> = ({ b, lights }) => {
  const { x0, y0, x1, y1, h, seed } = b;
  const c = shade(seed);
  const r = rand(seed + 3);
  const pX = Math.floor(r() * N_PATTERNS);
  const pY = Math.floor(r() * N_PATTERNS);
  const offX = (r() * 1.32).toFixed(2);
  const offY = (r() * 1.32).toFixed(2);
  const lx = y1 - y0;
  const ly = x1 - x0;
  const top = pts([iso(x0, y0, h), iso(x1, y0, h), iso(x1, y1, h), iso(x0, y1, h)]);
  const roofBox = b.roof
    ? (() => {
        const ax = x0 + 0.25 + r() * 0.5;
        const ay = y0 + 0.25 + r() * 0.5;
        const s = 0.28 + r() * 0.2;
        const rh = 0.14 + r() * 0.12;
        return { ax, ay, s, rh };
      })()
    : null;
  return (
    <g>
      <polygon points={top} fill={c.top} />
      <g transform={faceX(x1, y0)}>
        <rect x={0} y={0} width={lx} height={h} fill={c.fx} />
        <rect x={0} y={0} width={lx} height={h - 0.05} fill="url(#winOff)" transform={`translate(${offX} 0)`} />
        <rect x={0} y={0} width={lx} height={h - 0.05} fill={`url(#win${pX})`} opacity={lights} />
      </g>
      <g transform={faceY(x0, y1)}>
        <rect x={0} y={0} width={ly} height={h} fill={c.fy} />
        <rect x={0} y={0} width={ly} height={h - 0.05} fill="url(#winOff)" transform={`translate(${offY} 0)`} />
        <rect x={0} y={0} width={ly} height={h - 0.05} fill={`url(#win${pY})`} opacity={lights * 0.8} />
      </g>
      <polyline
        points={pts([iso(x0, y1, h), iso(x1, y1, h), iso(x1, y0, h)])}
        fill="none"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth={1.2}
      />
      <line {...line(iso(x1, y1, 0), iso(x1, y1, h))} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
      {roofBox ? <MiniBox x={roofBox.ax} y={roofBox.ay} s={roofBox.s} h={h} rh={roofBox.rh} c={c} /> : null}
    </g>
  );
};

const line = (a: P2, b: P2) => ({ x1: a[0], y1: a[1], x2: b[0], y2: b[1] });

const MiniBox: React.FC<{ x: number; y: number; s: number; h: number; rh: number; c: ReturnType<typeof shade> }> = ({ x, y, s, h, rh, c }) => (
  <g>
    <polygon points={pts([iso(x + s, y, h), iso(x + s, y + s, h), iso(x + s, y + s, h + rh), iso(x + s, y, h + rh)])} fill={c.fx} />
    <polygon points={pts([iso(x, y + s, h), iso(x + s, y + s, h), iso(x + s, y + s, h + rh), iso(x, y + s, h + rh)])} fill={c.fy} />
    <polygon points={pts([iso(x, y, h + rh), iso(x + s, y, h + rh), iso(x + s, y + s, h + rh), iso(x, y + s, h + rh)])} fill={c.top} />
  </g>
);

/* ---------- Personas, mesas, farolas, árboles ---------- */
export const Person: React.FC<{ x: number; y: number; z?: number; s?: number; seated?: boolean; tint?: string; seed?: number }> = ({
  x, y, z = 0, s = 1, seated, tint, seed = 0,
}) => {
  if (s <= 0.01) return null;
  const [px, py] = iso(x, y, z);
  const bh = seated ? 11 : 17;
  const shirt = ["#D7DBE2", "#B9C0CB", "#E6E1D8", "#9EA7B4"][seed % 4];
  return (
    <g transform={`translate(${px} ${py}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={7} ry={3.5} fill="rgba(0,0,0,0.45)" />
      <rect x={-5} y={-bh - 2} width={10} height={bh} rx={5} fill={shirt} />
      <circle cx={0} cy={-bh - 7} r={4.6} fill="#F1F2F4" />
      {tint ? <rect x={-5} y={-bh - 2} width={3} height={bh} rx={1.5} fill={tint} opacity={0.7} /> : null}
    </g>
  );
};

const Table: React.FC<{ x: number; y: number; glow: string }> = ({ x, y, glow }) => {
  const [px, py] = iso(x, y, 0.13);
  const [lx, ly] = iso(x, y, 0);
  return (
    <g>
      <line x1={lx} y1={ly} x2={px} y2={py} stroke="#2A2D33" strokeWidth={2.5} />
      <ellipse cx={px} cy={py} rx={11} ry={5.5} fill="#3A3E46" stroke={glow} strokeOpacity={0.35} strokeWidth={1} />
      {[-0.17, 0.17].map((d) => {
        const [cx, cy] = iso(x + d, y, 0.07);
        return <rect key={d} x={cx - 3.5} y={cy - 4} width={7} height={6} rx={1.5} fill="#2B2E35" />;
      })}
    </g>
  );
};

const Lamp: React.FC<{ x: number; y: number; on: number }> = ({ x, y, on }) => {
  const [bx, by] = iso(x, y, 0);
  const [hx, hy] = iso(x, y, 0.95);
  return (
    <g>
      <ellipse cx={bx} cy={by} rx={55} ry={28} fill="url(#lampPool)" opacity={0.55 * on} />
      <line x1={bx} y1={by} x2={hx} y2={hy} stroke="#3A3E46" strokeWidth={2.5} />
      <circle cx={hx} cy={hy} r={26} fill="url(#lampGlow)" opacity={0.8 * on} />
      <circle cx={hx} cy={hy} r={3.2} fill="#FFE9C4" opacity={0.3 + 0.7 * on} />
    </g>
  );
};

const TreeG: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => {
  const [bx, by] = iso(x, y, 0);
  const [cx, cy] = iso(x, y, 0.42 * s);
  return (
    <g>
      <ellipse cx={bx} cy={by} rx={16 * s} ry={8 * s} fill="rgba(0,0,0,0.4)" />
      <line x1={bx} y1={by} x2={cx} y2={cy} stroke="#2A2620" strokeWidth={3} />
      <circle cx={cx} cy={cy - 6 * s} r={17 * s} fill="#1B2621" />
      <circle cx={cx - 5 * s} cy={cy - 12 * s} r={10 * s} fill="#22302A" />
    </g>
  );
};

/* ---------- Restaurantes ---------- */
const Restaurant: React.FC<{
  b: Box; color: string; glow: number; full: number; flicker?: number; seed: number; frontIsX: boolean;
}> = ({ b, color, glow, full, flicker = 1, seed }) => {
  const { x0, y0, x1, y1, h } = b;
  const lx = y1 - y0;
  const ly = x1 - x0;
  const g = glow * flicker;
  const top = pts([iso(x0, y0, h), iso(x1, y0, h), iso(x1, y1, h), iso(x0, y1, h)]);
  const gid = seed === 1 ? "G" : "A";
  // Siluetas dentro del cristal
  const heads = (len: number, count: number, salt: number) => {
    const r = rand(seed * 31 + salt);
    return new Array(count).fill(0).map((_, i) => {
      const u = 0.2 + ((i + 0.5) / count) * (len - 0.4) + (r() - 0.5) * 0.08;
      const appear = clamp((full * count - i) * 1.5);
      return appear > 0.01 ? (
        <g key={i} opacity={appear}>
          <rect x={u - 0.045} y={0.08} width={0.09} height={0.15 * appear} rx={0.04} fill="rgba(10,12,8,0.55)" />
          <circle cx={u} cy={0.27} r={0.035 * appear} fill="rgba(10,12,8,0.6)" />
        </g>
      ) : null;
    });
  };
  const glass = (len: number, faceSalt: number, door: boolean) => (
    <>
      <rect x={0.08} y={0.05} width={len - 0.16} height={0.47} fill={`url(#glass${gid})`} opacity={0.35 + 0.65 * clamp(g)} />
      <rect x={0.08} y={0.05} width={len - 0.16} height={0.47} fill={color} opacity={0.12 * clamp(g - 1, 0, 1)} />
      {heads(len, door ? 6 : 5, faceSalt)}
      {[0.33, 0.66].map((k) => (
        <rect key={k} x={0.08 + (len - 0.16) * k - 0.012} y={0.05} width={0.024} height={0.47} fill="#14161A" />
      ))}
      {door ? <rect x={len - 0.62} y={0} width={0.26} height={0.52} fill={color} opacity={0.55 + 0.45 * clamp(g)} /> : null}
      {/* faja superior con tira de neón */}
      <rect x={0} y={0.55} width={len} height={0.1} fill="#1A1C21" />
      <rect x={0.05} y={0.595} width={len - 0.1} height={0.018} fill={color} opacity={0.4 + 0.6 * clamp(g)} />
    </>
  );
  // Rótulo en la azotea (sin texto ni logos): panel con marco de neón y un icono de plato
  const sx0 = x0 + 0.35;
  const sx1 = x1 - 0.35;
  const sy = (y0 + y1) / 2 + 0.2;
  return (
    <g>
      {/* derrame de luz en la acera */}
      <g transform={ground(0)} style={{ mixBlendMode: "screen" }}>
        <rect x={x0 - 0.2} y={y1} width={ly + 0.4} height={1.1} fill={`url(#spill${gid}V)`} opacity={0.9 * clamp(g, 0, 1.4)} />
        <rect x={x1} y={y0 - 0.2} width={1.1} height={lx + 0.4} fill={`url(#spill${gid}H)`} opacity={0.75 * clamp(g, 0, 1.4)} />
      </g>
      <polygon points={top} fill="#2C2F36" />
      <g transform={faceX(x1, y0)}>
        <rect x={0} y={0} width={lx} height={h} fill="#1F2227" />
        {glass(lx, 1, false)}
      </g>
      <g transform={faceY(x0, y1)}>
        <rect x={0} y={0} width={ly} height={h} fill="#17191D" />
        {glass(ly, 2, true)}
      </g>
      <polyline points={pts([iso(x0, y1, h), iso(x1, y1, h), iso(x1, y0, h)])} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={1.2} />
      {/* toldo */}
      <polygon
        points={pts([iso(x0 + 0.05, y1, 0.66), iso(x1, y1, 0.66), iso(x1, y1 + 0.2, 0.56), iso(x0 + 0.05, y1 + 0.2, 0.56)])}
        fill="#23262C"
        stroke={color}
        strokeOpacity={0.35 * clamp(g)}
        strokeWidth={1}
      />
      {/* rótulo */}
      <g transform={faceY(sx0, sy)}>
        <rect x={0} y={h} width={sx1 - sx0} height={0.34} fill="#121418" />
        <rect x={0.03} y={h + 0.03} width={sx1 - sx0 - 0.06} height={0.28} fill="none" />
        <rect x={0.03} y={h + 0.03} width={sx1 - sx0 - 0.06} height={0.02} fill={color} opacity={clamp(g)} />
        <rect x={0.03} y={h + 0.29} width={sx1 - sx0 - 0.06} height={0.02} fill={color} opacity={clamp(g)} />
        <rect x={0.03} y={h + 0.03} width={0.02} height={0.28} fill={color} opacity={clamp(g)} />
        <rect x={sx1 - sx0 - 0.05} y={h + 0.03} width={0.02} height={0.28} fill={color} opacity={clamp(g)} />
        <ellipse cx={(sx1 - sx0) / 2} cy={h + 0.17} rx={0.09} ry={0.09} fill="none" stroke={color} strokeWidth={0.022} opacity={clamp(g)} />
        <rect x={(sx1 - sx0) / 2 - 0.2} y={h + 0.09} width={0.018} height={0.16} fill={color} opacity={clamp(g)} />
        <rect x={(sx1 - sx0) / 2 + 0.18} y={h + 0.09} width={0.018} height={0.16} fill={color} opacity={clamp(g)} />
      </g>
    </g>
  );
};

/* ---------- Red de automatizaciones ---------- */
const HUB: [number, number, number] = [0, -2.25, 1.2];
const EDGES = (() => {
  const nodes = NET_NODES;
  const e: { a: [number, number, number]; b: [number, number, number]; delay: number }[] = [];
  nodes.forEach((n, i) => {
    if (i < 8) e.push({ a: HUB, b: [n.x, n.y, n.z], delay: i * 0.35 });
    else e.push({ a: [nodes[i - 8].x, nodes[i - 8].y, nodes[i - 8].z], b: [n.x, n.y, n.z], delay: 1.6 + (i - 8) * 0.3 });
  });
  for (let i = 0; i < Math.min(5, nodes.length - 1); i++) {
    const a = nodes[i];
    const b = nodes[(i + 3) % nodes.length];
    e.push({ a: [a.x, a.y, a.z], b: [b.x, b.y, b.z], delay: 3.2 + i * 0.3 });
  }
  return e.map((ed) => {
    const hn = Math.max(ed.a[2], ed.b[2]) + 0.7;
    const poly: P2[] = [
      iso(ed.a[0], ed.a[1], ed.a[2]),
      iso(ed.a[0], ed.a[1], hn),
      iso(ed.b[0], ed.a[1], hn),
      iso(ed.b[0], ed.b[1], hn),
      iso(ed.b[0], ed.b[1], ed.b[2]),
    ];
    let len = 0;
    for (let i = 1; i < poly.length; i++) len += Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]);
    return { ...ed, poly, len };
  });
})();

const pointAt = (poly: P2[], len: number, f: number): P2 => {
  let d = f * len;
  for (let i = 1; i < poly.length; i++) {
    const seg = Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]);
    if (d <= seg) {
      const k = seg === 0 ? 0 : d / seg;
      return [poly[i - 1][0] + (poly[i][0] - poly[i - 1][0]) * k, poly[i - 1][1] + (poly[i][1] - poly[i - 1][1]) * k];
    }
    d -= seg;
  }
  return poly[poly.length - 1];
};

const Network: React.FC<{ t: number; amount: number }> = ({ t, amount }) => {
  if (amount <= 0.001) return null;
  const t0 = T.s14a + 0.35;
  return (
    <g opacity={amount} style={{ mixBlendMode: "screen" }}>
      {EDGES.map((e, i) => {
        const p = prog(t, t0 + e.delay * 0.5, 0.8);
        if (p <= 0) return null;
        const d = `M ${pts(e.poly).replace(/ /g, " L ")}`;
        const pulse = pointAt(e.poly, e.len, (Math.max(0, t - t0 - e.delay * 0.5) * 0.7 + i * 0.17) % 1);
        const end = e.poly[e.poly.length - 1];
        return (
          <g key={i}>
            <path d={d} fill="none" stroke={COLORS.lime} strokeOpacity={0.2} strokeWidth={14} strokeDasharray={e.len} strokeDashoffset={e.len * (1 - p)} strokeLinejoin="round" />
            <path d={d} fill="none" stroke={COLORS.lime} strokeWidth={4.2} strokeDasharray={e.len} strokeDashoffset={e.len * (1 - p)} strokeLinejoin="round" />
            {p >= 1 ? <circle cx={pulse[0]} cy={pulse[1]} r={10} fill="#EFFFC2" /> : null}
            <circle cx={end[0]} cy={end[1]} r={14 * easeOutBack(clamp((p - 0.9) * 10))} fill={COLORS.lime} opacity={0.9} />
            <circle cx={end[0]} cy={end[1]} r={40 * clamp((p - 0.9) * 10)} fill="url(#limeGlow)" />
          </g>
        );
      })}
      <circle cx={iso(...HUB)[0]} cy={iso(...HUB)[1]} r={70} fill="url(#limeGlow)" />
    </g>
  );
};

/* ---------- Mundo completo ---------- */
type Drawable = { depth: number; el: React.ReactNode; bbox: [number, number, number, number] };

export const City: React.FC<{ t: number; sceneWalkers: React.ReactNode }> = ({ t, sceneWalkers }) => {
  const cam = camera(t);
  const s = worldState(t);
  const halfW = 540 / cam.zoom + 260;
  const halfH = 960 / cam.zoom + 420;
  const vx0 = cam.cx - halfW;
  const vx1 = cam.cx + halfW;
  const vy0 = cam.cy - halfH;
  const vy1 = cam.cy + halfH;
  const visible = (bb: [number, number, number, number]) => bb[2] > vx0 && bb[0] < vx1 && bb[3] > vy0 && bb[1] < vy1;
  const boxBB = (b: Box): [number, number, number, number] => [
    iso(b.x0, b.y1)[0], iso(b.x0, b.y0, b.h + 0.5)[1], iso(b.x1, b.y0)[0], iso(b.x1, b.y1)[1],
  ];

  const items: Drawable[] = [];
  for (const b of CITY.boxes) {
    items.push({ depth: (b.x0 + b.x1 + b.y0 + b.y1) / 2, el: <Building key={`b${b.seed}`} b={b} lights={s.lights} />, bbox: boxBB(b) });
  }
  for (const tr of CITY.trees) {
    const [x, y] = iso(tr.x, tr.y);
    items.push({ depth: tr.x + tr.y, el: <TreeG key={`t${tr.x}${tr.y}`} {...tr} />, bbox: [x - 30, y - 80, x + 30, y + 10] });
  }
  LAMPS.forEach((l, i) => {
    const [x, y] = iso(l.x, l.y);
    const on = 0.25 + 0.75 * clamp((s.lights - 0.06) / 0.94);
    items.push({ depth: l.x + l.y, el: <Lamp key={`l${i}`} x={l.x} y={l.y} on={on} />, bbox: [x - 60, y - 130, x + 60, y + 30] });
  });
  const amberFlicker = 0.9 + 0.1 * Math.sin(t * 13.1) * Math.sin(t * 3.7) - (Math.sin(t * 1.3) > 0.97 ? 0.25 : 0);
  items.push({
    depth: (GREEN.x0 + GREEN.x1 + GREEN.y0 + GREEN.y1) / 2,
    el: <Restaurant key="green" b={GREEN} color={COLORS.lime} glow={s.greenGlow} full={s.greenFull} seed={1} frontIsX={false} />,
    bbox: boxBB(GREEN),
  });
  items.push({
    depth: (AMBER.x0 + AMBER.x1 + AMBER.y0 + AMBER.y1) / 2,
    el: <Restaurant key="amber" b={AMBER} color={COLORS.amber} glow={s.amberGlow} full={0.15 * s.amberPeople} flicker={amberFlicker} seed={2} frontIsX />,
    bbox: boxBB(AMBER),
  });
  // Terrazas
  const gTables: [number, number][] = [[-0.6, -1.12], [-0.05, -1.12], [1.25, -1.12]];
  gTables.forEach(([x, y], i) => {
    items.push({ depth: x + y - 0.01, el: <Table key={`gt${i}`} x={x} y={y} glow={COLORS.lime} />, bbox: [-1e5, -1e5, 1e5, 1e5] });
    [-0.2, 0.2].forEach((d, j) => {
      const idx = i * 2 + j;
      const sc = easeOutBack(clamp((s.greenFull * 7 - idx - 0.6) * 1.4));
      items.push({
        depth: x + d + y + 0.02,
        el: <Person key={`gp${idx}`} x={x + d} y={y + 0.02} z={0.05} seated s={sc} seed={idx} tint={COLORS.lime} />,
        bbox: [-1e5, -1e5, 1e5, 1e5],
      });
    });
  });
  // Cola en la puerta del verde cuando está lleno
  [[0.75, -1.0], [0.92, -0.93]].forEach(([x, y], i) => {
    const sc = easeOutBack(clamp((s.greenFull - 0.75 - i * 0.1) * 6));
    items.push({ depth: x + y, el: <Person key={`q${i}`} x={x} y={y} s={sc} seed={i + 2} tint={COLORS.lime} />, bbox: [-1e5, -1e5, 1e5, 1e5] });
  });
  const aTables: [number, number][] = [[3.62, 1.85], [3.62, 2.6]];
  aTables.forEach(([x, y], i) => {
    items.push({ depth: x + y - 0.01, el: <Table key={`at${i}`} x={x} y={y} glow={COLORS.amber} />, bbox: [-1e5, -1e5, 1e5, 1e5] });
  });
  items.push({
    depth: 3.6 + 1.85 + 0.02,
    el: <Person key="ap0" x={3.45} y={1.87} z={0.05} seated s={easeOutBack(clamp(s.amberPeople * 1.2))} seed={1} />,
    bbox: [-1e5, -1e5, 1e5, 1e5],
  });
  items.push({
    depth: 3.6 + 2.6 + 0.02,
    el: <Person key="ap1" x={3.79} y={2.62} z={0.05} seated s={easeOutBack(clamp(s.amberPeople * 1.2 - 0.2))} seed={3} />,
    bbox: [-1e5, -1e5, 1e5, 1e5],
  });

  const drawn = items.filter((it) => visible(it.bbox)).sort((a, b) => a.depth - b.depth);

  // Suelo
  const E = EXTENT + 2;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <Defs />
      <g transform={`translate(540 960) scale(${cam.zoom}) translate(${-cam.cx} ${-cam.cy})`}>
        <polygon points={pts([iso(-E, -E), iso(E, -E), iso(E, E), iso(-E, E)])} fill="#14161B" />
        <g transform={ground(0)}>
          {STREETS_Y.map(([a, b], i) => (
            <rect key={`sy${i}`} x={-E} y={a} width={2 * E} height={b - a} fill="#0C0D10" />
          ))}
          {STREETS_X.map(([a, b], i) => (
            <rect key={`sx${i}`} x={a} y={-E} width={b - a} height={2 * E} fill="#0C0D10" />
          ))}
          {/* marcas viales de la calle principal */}
          {new Array(40).fill(0).map((_, i) => (
            <rect key={`d${i}`} x={-E + i * 1.1} y={-0.025} width={0.5} height={0.05} fill="#2E3138" />
          ))}
          {/* paso de cebra junto al ámbar */}
          {new Array(6).fill(0).map((_, i) => (
            <rect key={`z${i}`} x={3.95 + i * 0.2} y={0.85} width={0.1} height={0.5} fill="#24272D" />
          ))}
        </g>
        {/* resplandor ambiental de cada restaurante */}
        <g style={{ mixBlendMode: "screen" }}>
          <ellipse cx={iso(0.3, -1.6)[0]} cy={iso(0.3, -1.6)[1]} rx={330} ry={190} fill="url(#limeGlow)" opacity={0.55 * Math.min(1.5, s.greenGlow)} />
          <ellipse cx={iso(3.4, 2.4)[0]} cy={iso(3.4, 2.4)[1]} rx={260} ry={150} fill="url(#amberGlow)" opacity={0.5 * s.amberGlow} />
        </g>
        {drawn.map((d) => d.el)}
        {sceneWalkers}
        <Network t={t} amount={s.net} />
        {/* bruma volumétrica sobre los restaurantes */}
        <g style={{ mixBlendMode: "screen" }}>
          <ellipse cx={iso(0, -2.2, 0.9)[0]} cy={iso(0, -2.2, 0.9)[1]} rx={210} ry={170} fill="url(#limeGlow)" opacity={0.28 * Math.min(1.5, s.greenGlow)} />
          <ellipse cx={iso(2.8, 2.3, 0.9)[0]} cy={iso(2.8, 2.3, 0.9)[1]} rx={170} ry={140} fill="url(#amberGlow)" opacity={0.22 * s.amberGlow} />
        </g>
      </g>
    </svg>
  );
};

const Defs: React.FC = () => {
  const patterns = new Array(N_PATTERNS).fill(0).map((_, k) => {
    const r = rand(1000 + k);
    const wins: React.ReactNode[] = [];
    for (let col = 0; col < 6; col++) {
      for (let fl = 0; fl < 7; fl++) {
        const v = r();
        if (v < 0.26) {
          const warm = r() < 0.8;
          wins.push(
            <rect key={`${col}-${fl}`} x={col * 0.22 + 0.06} y={fl * 0.26 + 0.1} width={0.1} height={0.12} fill={warm ? "#FFD08A" : "#CFE0FF"} opacity={0.35 + r() * 0.5} />,
          );
        }
      }
    }
    return (
      <pattern key={k} id={`win${k}`} patternUnits="userSpaceOnUse" width={1.32} height={1.82}>
        {wins}
      </pattern>
    );
  });
  return (
    <defs>
      {patterns}
      <pattern id="winOff" patternUnits="userSpaceOnUse" width={0.22} height={0.26}>
        <rect x={0.06} y={0.1} width={0.1} height={0.12} fill="#0E1013" opacity={0.5} />
      </pattern>
      <radialGradient id="limeGlow">
        <stop offset="0%" stopColor={COLORS.lime} stopOpacity={0.55} />
        <stop offset="45%" stopColor={COLORS.lime} stopOpacity={0.14} />
        <stop offset="100%" stopColor={COLORS.lime} stopOpacity={0} />
      </radialGradient>
      <radialGradient id="amberGlow">
        <stop offset="0%" stopColor={COLORS.amber} stopOpacity={0.5} />
        <stop offset="50%" stopColor={COLORS.amber} stopOpacity={0.1} />
        <stop offset="100%" stopColor={COLORS.amber} stopOpacity={0} />
      </radialGradient>
      <radialGradient id="lampGlow">
        <stop offset="0%" stopColor="#FFE2B0" stopOpacity={0.7} />
        <stop offset="100%" stopColor="#FFE2B0" stopOpacity={0} />
      </radialGradient>
      <radialGradient id="lampPool">
        <stop offset="0%" stopColor="#FFD9A0" stopOpacity={0.35} />
        <stop offset="100%" stopColor="#FFD9A0" stopOpacity={0} />
      </radialGradient>
      <linearGradient id="glassG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E9FF9E" />
        <stop offset="100%" stopColor={COLORS.lime} />
      </linearGradient>
      <linearGradient id="glassA" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F2C27A" />
        <stop offset="100%" stopColor={COLORS.amberDim} />
      </linearGradient>
      <linearGradient id="spillGV" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={COLORS.lime} stopOpacity={0.45} />
        <stop offset="100%" stopColor={COLORS.lime} stopOpacity={0} />
      </linearGradient>
      <linearGradient id="spillGH" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={COLORS.lime} stopOpacity={0.35} />
        <stop offset="100%" stopColor={COLORS.lime} stopOpacity={0} />
      </linearGradient>
      <linearGradient id="spillAV" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={COLORS.amber} stopOpacity={0.35} />
        <stop offset="100%" stopColor={COLORS.amber} stopOpacity={0} />
      </linearGradient>
      <linearGradient id="spillAH" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={COLORS.amber} stopOpacity={0.4} />
        <stop offset="100%" stopColor={COLORS.amber} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
};
