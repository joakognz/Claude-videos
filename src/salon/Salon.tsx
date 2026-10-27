import React from "react";
import { clamp, COLORS, keys, rand, vis } from "../reel/anim";
import { worldTransform } from "../reel/camera";
import { Building, Lamp, WorldDefs } from "../reel/City";
import type { Box } from "../reel/cityData";
import { faceX, faceY, ground, iso, P2, pts } from "../reel/iso";
import { A, camera, CLOSE, END } from "./timeline";

const R = 6; // lado del local (unidades isométricas)
const WALL = 3; // altura de las paredes
const TH = 0.22; // grosor de pared

export const mix = (a: string, b: string, p: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * clamp(p))).join(",")})`;
};

/* ---------- Estado del mundo ---------- */
export const salonState = (t: number) => {
  // ámbar = problema, lima = con agente; vuelve a ámbar al final para el bucle
  const acc = keys(t, [[A.agente - 0.05, 0], [A.agente + 0.45, 1], [CLOSE + 0.3, 1], [END - 0.15, 0]]);
  const vib1 = vis(t, A.movil, A.tardas + 0.5, 0.05, 0.1);
  const vib2 = vis(t, A.sigue, A.estavez + 0.5, 0.05, 0.1);
  const screenAmber = vis(t, A.movil - 0.05, A.web, 0.1, 0.3);
  const screenLime = vis(t, A.sigue - 0.05, END - 0.2, 0.1, 0.2);
  const rival = vis(t, A.otrositio, A.web + 1.2, 0.25, 0.5);
  const done = keys(t, [[A.peinando - 0.05, 0], [A.peinando + 0.25, 1], [CLOSE + 0.3, 1], [END - 0.15, 0]]);
  return { acc, vib1, vib2, screenAmber, screenLime, rival, done };
};

/** Ámbar = problema; blanco neutro = resuelto (sin fondos verdes). */
export const SOLVE = COLORS.white;
const accent = (acc: number) => mix(COLORS.amber, SOLVE, acc);

/* ---------- Primitivas ---------- */
type Cols = { top: string; fx: string; fy: string };
const DARK: Cols = { top: "#2E3138", fx: "#22252B", fy: "#191B20" };

const Block: React.FC<{ x0: number; y0: number; z0?: number; x1: number; y1: number; z1: number; c?: Cols }> = ({
  x0, y0, z0 = 0, x1, y1, z1, c = DARK,
}) => (
  <g>
    <polygon points={pts([iso(x1, y0, z0), iso(x1, y1, z0), iso(x1, y1, z1), iso(x1, y0, z1)])} fill={c.fx} />
    <polygon points={pts([iso(x0, y1, z0), iso(x1, y1, z0), iso(x1, y1, z1), iso(x0, y1, z1)])} fill={c.fy} />
    <polygon points={pts([iso(x0, y0, z1), iso(x1, y0, z1), iso(x1, y1, z1), iso(x0, y1, z1)])} fill={c.top} />
  </g>
);

/** Cilindro vertical (disco en planta isométrica). */
const Cyl: React.FC<{ x: number; y: number; z0: number; z1: number; r: number; side: string; top: string }> = ({ x, y, z0, z1, r, side, top }) => {
  const [bx, by] = iso(x, y, z0);
  const [tx, ty] = iso(x, y, z1);
  const rx = r * 122.5;
  const ry = r * 70.7;
  return (
    <g>
      <path d={`M ${bx - rx} ${by} A ${rx} ${ry} 0 0 0 ${bx + rx} ${by} L ${tx + rx} ${ty} L ${tx - rx} ${ty} Z`} fill={side} />
      <ellipse cx={tx} cy={ty} rx={rx} ry={ry} fill={top} />
    </g>
  );
};

/* ---------- Personajes ---------- */
const SKIN = "#C99A74";
const GLOVE = "#17181B";
const DYE = "#C0602A";

const Client: React.FC<{ x: number; y: number; done: number; t: number }> = ({ x, y, done }) => {
  const [hx, hy] = iso(x - 0.05, y, 1.37);
  const [sx, sy] = iso(x, y, 1.17);
  const [bx, by] = iso(x, y, 0.6);
  return (
    <g>
      {/* capa */}
      <path d={`M ${sx - 24} ${sy} Q ${sx} ${sy - 10} ${sx + 24} ${sy} L ${bx + 40} ${by} Q ${bx} ${by + 14} ${bx - 40} ${by} Z`} fill="#33363E" />
      <path d={`M ${sx - 24} ${sy} Q ${sx} ${sy - 10} ${sx + 24} ${sy}`} stroke="#4A4E57" strokeWidth={3} fill="none" />
      <rect x={hx - 6} y={hy + 8} width={12} height={14} rx={4} fill={SKIN} />
      {/* pelo con tinte y papel de aluminio */}
      <g opacity={1 - done}>
        <circle cx={hx} cy={hy} r={18} fill="#3B2619" />
        <ellipse cx={hx - 2} cy={hy - 6} rx={15} ry={10} fill={DYE} opacity={0.9} />
        <ellipse cx={hx + 6} cy={hy + 2} rx={8} ry={6} fill={DYE} opacity={0.7} />
        {[[-12, -8, -30], [-3, -15, -10], [8, -12, 20], [13, -2, 40]].map(([dx, dy, r], i) => (
          <rect key={i} x={hx + dx - 5} y={hy + dy - 3} width={10} height={6} rx={1.5} fill="#D6DAE0" transform={`rotate(${r} ${hx + dx} ${hy + dy})`} />
        ))}
      </g>
      {/* peinado terminado */}
      <g opacity={done}>
        <path d={`M ${hx - 19} ${hy + 2} Q ${hx - 20} ${hy - 22} ${hx} ${hy - 20} Q ${hx + 20} ${hy - 22} ${hx + 19} ${hy + 2} Q ${hx + 22} ${hy + 26} ${hx + 14} ${hy + 30} L ${hx - 14} ${hy + 30} Q ${hx - 22} ${hy + 26} ${hx - 19} ${hy + 2} Z`} fill="#8A3F1C" />
        <path d={`M ${hx - 10} ${hy - 14} Q ${hx} ${hy - 19} ${hx + 9} ${hy - 13}`} stroke="#E0955E" strokeWidth={3} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
};

const Stylist: React.FC<{ x: number; y: number; target: [number, number, number]; done: number; t: number; acc: string }> = ({ x, y, target, done, t, acc }) => {
  const [fx, fy] = iso(x, y, 0);
  const [, wy] = iso(x, y, 0.85);
  const [, shy] = iso(x, y, 1.42);
  const [hx, hy] = iso(x, y, 1.62);
  const [tx, ty] = iso(...target);
  // las manos nunca se quedan quietas
  const wob = Math.sin(t * 5.2);
  const comb = Math.sin(t * 7) * 10 * done;
  const lh: P2 = [tx - 14 + wob * 2, ty - 10 + Math.cos(t * 4.1) * 2];
  const rh: P2 = [tx + 12 + comb, ty + 4 + wob * 3 - done * 6];
  const arm = (sx: number, h: P2, key: string) => {
    const ex = (sx + h[0]) / 2 + 6;
    const ey = (shy + h[1]) / 2 + 16;
    return (
      <g key={key}>
        <path d={`M ${sx} ${shy + 4} Q ${ex} ${ey} ${h[0]} ${h[1]}`} stroke="#121316" strokeWidth={11} fill="none" strokeLinecap="round" />
        <circle cx={h[0]} cy={h[1]} r={7.5} fill={GLOVE} />
        <circle cx={h[0] - 2} cy={h[1] - 2} r={3.2} fill={DYE} opacity={1 - done * 0.7} />
        <circle cx={h[0] + 3} cy={h[1] + 2} r={2.2} fill={DYE} opacity={1 - done * 0.7} />
      </g>
    );
  };
  return (
    <g>
      <ellipse cx={fx} cy={fy} rx={24} ry={11} fill="rgba(0,0,0,0.45)" />
      <rect x={fx - 14} y={wy} width={12} height={fy - wy} rx={5} fill="#1B1C20" />
      <rect x={fx + 2} y={wy} width={12} height={fy - wy} rx={5} fill="#1B1C20" />
      <rect x={fx - 21} y={shy} width={42} height={wy - shy + 10} rx={14} fill="#121316" />
      <rect x={fx - 15} y={shy + 18} width={30} height={wy - shy - 6} rx={6} fill="#26282E" />
      <rect x={fx + 2} y={shy + 24} width={9} height={4} rx={1.5} fill={acc} />
      <rect x={hx - 5} y={hy + 10} width={10} height={10} fill={SKIN} />
      <circle cx={hx} cy={hy} r={14.5} fill={SKIN} />
      <path d={`M ${hx - 15} ${hy + 1} Q ${hx - 14} ${hy - 17} ${hx} ${hy - 16} Q ${hx + 15} ${hy - 17} ${hx + 15} ${hy + 1} Q ${hx + 8} ${hy - 8} ${hx - 15} ${hy + 1} Z`} fill="#2A1E16" />
      <circle cx={hx + 4} cy={hy - 18} r={7} fill="#2A1E16" />
      {arm(fx - 16, lh, "l")}
      {arm(fx + 16, rh, "r")}
      {/* herramienta: pincel de tinte o peine */}
      <g opacity={1 - done}>
        <line x1={rh[0]} y1={rh[1]} x2={rh[0] - 16} y2={rh[1] - 12} stroke="#E8E2D8" strokeWidth={3} strokeLinecap="round" />
        <circle cx={rh[0] - 17} cy={rh[1] - 13} r={3} fill={DYE} />
      </g>
      <g opacity={done}>
        <rect x={rh[0] - 3} y={rh[1] - 22} width={5} height={24} rx={2} fill="#D9DCE2" />
        <rect x={lh[0] - 20} y={lh[1] - 12} width={24} height={12} rx={6} fill="#2E3138" />
        <rect x={lh[0] - 30} y={lh[1] - 10} width={12} height={8} rx={3} fill="#3E424B" />
      </g>
    </g>
  );
};

/* ---------- Teléfono sobre el mostrador ---------- */
const Phone: React.FC<{ t: number; s: ReturnType<typeof salonState> }> = ({ t, s }) => {
  const vib = Math.max(s.vib1, s.vib2);
  const buzz = vib * (Math.sin(t * 6.5) > -0.2 ? 1 : 0);
  const jx = Math.sin(t * 95) * 2.2 * buzz;
  const jy = Math.cos(t * 83) * 1.2 * buzz;
  const [cx, cy] = iso(4.55, 0.65, 1.02);
  const scr = s.screenLime > 0 ? mix("#15171A", SOLVE, s.screenLime) : mix("#15171A", COLORS.amber, s.screenAmber);
  const ringCol = s.screenLime > 0 ? SOLVE : COLORS.amber;
  return (
    <g>
      <g transform={`translate(${jx} ${jy})`}>
        <g transform={ground(1.01)}>
          <rect x={4.43} y={0.45} width={0.25} height={0.42} rx={0.04} fill="#0B0C0E" />
          <rect x={4.445} y={0.465} width={0.22} height={0.39} rx={0.03} fill={scr} />
        </g>
      </g>
      <ellipse cx={cx} cy={cy} rx={60} ry={34} fill={ringCol} opacity={0.25 * Math.max(s.screenAmber, s.screenLime)} style={{ mixBlendMode: "screen" }} />
      {[0, 1, 2].map((i) => {
        const k = (t * 2.2 + i / 3) % 1;
        return buzz > 0 ? (
          <ellipse key={i} cx={cx} cy={cy} rx={30 + k * 50} ry={(30 + k * 50) * 0.58} fill="none" stroke={ringCol} strokeWidth={2.5} opacity={(1 - k) * 0.9} />
        ) : null;
      })}
    </g>
  );
};

/* ---------- Decoración de paredes ---------- */
const Mirror: React.FC<{ y0: number; acc: string; glow: number }> = ({ y0, acc, glow }) => (
  <g transform={faceX(0, y0)}>
    <rect x={0} y={1.0} width={1.6} height={1.5} rx={0.08} fill="#1C232C" />
    <polygon points="0.25,1.05 0.6,1.05 0.2,2.45 -0.15,2.45" fill="#FFFFFF" opacity={0.06} transform="translate(0.2 0)" />
    {[
      [0, 1.0, 1.6, 0.03], [0, 2.47, 1.6, 0.03], [0, 1.0, 0.03, 1.5], [1.57, 1.0, 0.03, 1.5],
    ].map(([x, y, w, h], i) => (
      <rect key={i} x={x} y={y} width={w} height={h} fill={acc} opacity={0.55 + 0.45 * glow} />
    ))}
  </g>
);

const Bottles: React.FC<{ y0: number }> = ({ y0 }) => {
  const r = rand(Math.round(y0 * 100));
  return (
    <g>
      <Block x0={0} y0={y0} x1={0.32} y1={y0 + 1.5} z0={0.84} z1={0.9} c={{ top: "#3A3D45", fx: "#2A2D33", fy: "#24272D" }} />
      {new Array(6).fill(0).map((_, i) => {
        const yy = y0 + 0.15 + i * 0.24;
        const h = 0.14 + r() * 0.1;
        const col = ["#E8E2D8", "#B9C0CB", "#C0602A", "#6E5A8A", "#D9DCE2", "#8FA3B8"][i];
        return <Cyl key={i} x={0.17} y={yy} z0={0.9} z1={0.9 + h} r={0.045} side={col} top="#F4F6F8" />;
      })}
    </g>
  );
};

const NeonSign: React.FC<{ x0: number; acc: string; glow: number }> = ({ x0, acc, glow }) => (
  <g transform={faceY(x0, 0)}>
    <rect x={0.25} y={1.65} width={1.3} height={0.75} rx={0.06} fill="#121418" />
    <g fill="none" stroke={acc} strokeWidth={0.035} opacity={0.6 + 0.4 * glow} strokeLinecap="round">
      <circle cx={0.62} cy={1.84} r={0.08} />
      <circle cx={0.62} cy={2.18} r={0.08} />
      <path d="M 0.7 1.88 L 1.05 2.12 M 0.7 2.14 L 1.05 1.9" />
      <path d="M 1.15 1.85 H 1.4 M 1.15 2.02 H 1.35 M 1.15 2.19 H 1.42" />
    </g>
  </g>
);

const NightWindow: React.FC = () => {
  const r = rand(77);
  return (
    <g transform={faceY(1.0, 0)}>
      <rect x={0} y={1.1} width={2.2} height={1.4} fill="#0D1526" />
      {new Array(26).fill(0).map((_, i) => (
        <rect key={i} x={0.1 + r() * 2.0} y={1.15 + r() * 0.9} width={0.05} height={0.06} fill="#FFD08A" opacity={0.3 + r() * 0.5} />
      ))}
      <rect x={0} y={1.1} width={2.2} height={0.04} fill="#2E3138" />
      <rect x={0} y={2.46} width={2.2} height={0.04} fill="#2E3138" />
      <rect x={1.08} y={1.1} width={0.04} height={1.4} fill="#2E3138" />
    </g>
  );
};

/* ---------- Ciudad de fondo ---------- */
const BG = (() => {
  const r = rand(9);
  const list: Box[] = [];
  const add = (x0: number, y0: number, w: number, d: number, h: number) =>
    list.push({ x0, y0, x1: x0 + w, y1: y0 + d, h, seed: Math.floor(r() * 1e9), roof: r() < 0.4 });
  for (let gx = -12; gx < -1; gx += 1.8) for (let gy = -12; gy < 9; gy += 1.8) add(gx, gy, 1.55, 1.55, 1.5 + r() * 4);
  for (let gy = -12; gy < -1; gy += 1.8) for (let gx = -1; gx < 7; gx += 1.8) add(gx, gy, 1.55, 1.55, 1.5 + r() * 4);
  for (let gx = 9.6; gx < 20; gx += 1.8)
    for (let gy = -12; gy < 12; gy += 1.8) {
      if (gx < 13 && gy > -0.5 && gy < 4.6) continue; // solar del salón de enfrente
      add(gx, gy, 1.55, 1.55, gy > 4 ? 0.8 + r() * 1.2 : 1.5 + r() * 3.5);
    }
  return list;
})();
const RIVAL: Box = { x0: 9.6, y0: 0.6, x1: 12.6, y1: 4.2, h: 2.1, seed: 5 };

const Rival: React.FC<{ lit: number }> = ({ lit }) => {
  const { x0, y0, x1, y1, h } = RIVAL;
  return (
    <g>
      <Block x0={x0} y0={y0} x1={x1} y1={y1} z1={h} />
      <g transform={faceY(x0, y1)}>
        <rect x={0.15} y={0.08} width={x1 - x0 - 0.3} height={1.0} fill="#DDE7FF" opacity={0.18 + 0.7 * lit} />
        <rect x={0.15} y={1.25} width={x1 - x0 - 0.3} height={0.5} fill="#121418" />
        <rect x={0.3} y={1.47} width={x1 - x0 - 0.6} height={0.05} fill="#DDE7FF" opacity={0.4 + 0.6 * lit} />
      </g>
      <g transform={faceX(x1, y0)}>
        <rect x={0.15} y={0.08} width={y1 - y0 - 0.3} height={1.0} fill="#DDE7FF" opacity={0.12 + 0.5 * lit} />
      </g>
      <g transform={ground(0)} style={{ mixBlendMode: "screen" }}>
        <rect x={x0} y={y1} width={x1 - x0} height={1.2} fill="url(#rivalSpill)" opacity={0.3 + 0.7 * lit} />
      </g>
    </g>
  );
};

/* ---------- Mundo ---------- */
export const SalonWorld: React.FC<{ t: number }> = ({ t }) => {
  const cam = camera(t);
  const s = salonState(t);
  const acc = accent(s.acc);
  const glow = 0.85 + 0.15 * Math.sin(t * 3.1);
  const halfW = 640 / cam.zoom + 300;
  const halfH = 1010 / cam.zoom + 450;
  const inView = (b: Box) => {
    const l = iso(b.x0, b.y1)[0];
    const rr = iso(b.x1, b.y0)[0];
    const top = iso(b.x0, b.y0, b.h + 0.5)[1];
    const bot = iso(b.x1, b.y1)[1];
    return rr > cam.cx - halfW && l < cam.cx + halfW && bot > cam.cy - halfH && top < cam.cy + halfH;
  };
  const sortB = (l: Box[]) => l.filter(inView).sort((a, b) => a.x0 + a.y0 - (b.x0 + b.y0));
  const back = sortB(BG.filter((b) => b.x1 < 0 || b.y1 < 0));
  const right = sortB([...BG.filter((b) => b.x0 > 9), RIVAL]);
  const E = 30;
  const target: [number, number, number] = [1.32, 2.5, 1.4];
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <WorldDefs />
      <defs>
        <radialGradient id="accGlow">
          <stop offset="0%" stopColor={acc} stopOpacity={0.5} />
          <stop offset="100%" stopColor={acc} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="rivalSpill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DDE7FF" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#DDE7FF" stopOpacity={0} />
        </linearGradient>
        <pattern id="tiles" patternUnits="userSpaceOnUse" width={1} height={1}>
          <rect width={1} height={1} fill="#202229" />
          <rect width={0.5} height={0.5} fill="#262830" />
          <rect x={0.5} y={0.5} width={0.5} height={0.5} fill="#262830" />
        </pattern>
      </defs>
      <g transform={worldTransform(cam)}>
        <polygon points={pts([iso(-E, -E), iso(E, -E), iso(E, E), iso(-E, E)])} fill="#121418" />
        <g transform={ground(0)}>
          <rect x={7.0} y={-E} width={1.9} height={2 * E} fill="#0B0C0F" />
          <rect x={-E} y={7.0} width={2 * E} height={1.9} fill="#0B0C0F" />
          {new Array(30).fill(0).map((_, i) => (
            <rect key={i} x={7.92} y={-E + i * 2} width={0.06} height={0.9} fill="#2E3138" />
          ))}
        </g>
        {back.map((b) => (
          <Building key={b.seed} b={b} lights={1} />
        ))}
        {/* base y paredes del local (maqueta en corte) */}
        <Block x0={-TH} y0={-TH} z0={-0.35} x1={R} y1={R} z1={0} c={{ top: "#1A1C21", fx: "#26292F", fy: "#1E2026" }} />
        <g transform={ground(0)}>
          <rect x={0} y={0} width={R} height={R} fill="url(#tiles)" />
        </g>
        <Block x0={-TH} y0={-TH} x1={0} y1={R} z1={WALL} c={{ top: "#3A3D45", fx: "#24272D", fy: "#2C2F36" }} />
        <Block x0={0} y0={-TH} x1={R} y1={0} z1={WALL} c={{ top: "#3A3D45", fx: "#2C2F36", fy: "#1E2126" }} />
        <g transform={faceX(0, 0)}>
          <rect x={0} y={0} width={R} height={0.7} fill="#1E2025" />
        </g>
        <g transform={faceY(0, 0)}>
          <rect x={0} y={0} width={R} height={0.7} fill="#191B20" />
        </g>
        <NightWindow />
        <NeonSign x0={3.9} acc={acc} glow={glow} />
        <Mirror y0={1.75} acc={acc} glow={glow} />
        <Mirror y0={3.95} acc={acc} glow={glow} />
        <Bottles y0={1.8} />
        <Bottles y0={4.0} />
        {/* resplandor del acento en el suelo y luz cálida ambiente */}
        <g style={{ mixBlendMode: "screen" }}>
          <ellipse cx={iso(3, 3)[0]} cy={iso(3, 3)[1]} rx={520} ry={300} fill="url(#lampPool)" opacity={0.8} />
          <ellipse cx={iso(0.8, 2.6)[0]} cy={iso(0.8, 2.6)[1]} rx={260} ry={150} fill="url(#accGlow)" opacity={0.7} />
          <ellipse cx={iso(0.8, 4.7)[0]} cy={iso(0.8, 4.7)[1]} rx={220} ry={130} fill="url(#accGlow)" opacity={0.45} />
          <ellipse cx={iso(4.8, 1.2)[0]} cy={iso(4.8, 1.2)[1]} rx={230} ry={130} fill="url(#accGlow)" opacity={0.6} />
        </g>
        {/* carrito con el bol de tinte */}
        <Block x0={2.7} y0={0.9} x1={3.2} y1={1.4} z0={0.05} z1={0.75} c={{ top: "#3A3D45", fx: "#2A2D33", fy: "#22252B" }} />
        <Cyl x={2.95} y={1.15} z0={0.75} z1={0.85} r={0.13} side="#E8E2D8" top={DYE} />
        {/* sillón vacío */}
        <Cyl x={1.35} y={4.65} z0={0} z1={0.05} r={0.3} side="#1B1D22" top="#2A2D33" />
        <Block x0={1.05} y0={4.35} x1={1.65} y1={4.95} z0={0.42} z1={0.6} c={{ top: "#3B3F48", fx: "#2B2E35", fy: "#24272D" }} />
        <Block x0={1.62} y0={4.35} x1={1.78} y1={4.95} z0={0.6} z1={1.2} c={{ top: "#3B3F48", fx: "#2B2E35", fy: "#24272D" }} />
        {/* sillón con la clienta */}
        <Cyl x={1.35} y={2.55} z0={0} z1={0.05} r={0.3} side="#1B1D22" top="#2A2D33" />
        <Block x0={1.05} y0={2.25} x1={1.65} y1={2.85} z0={0.42} z1={0.6} c={{ top: "#3B3F48", fx: "#2B2E35", fy: "#24272D" }} />
        <Client x={1.35} y={2.55} done={s.done} t={t} />
        <Block x0={1.62} y0={2.25} x1={1.78} y1={2.85} z0={0.6} z1={1.12} c={{ top: "#3B3F48", fx: "#2B2E35", fy: "#24272D" }} />
        <Stylist x={1.95} y={2.0} target={target} done={s.done} t={t} acc={acc} />
        {/* mostrador de recepción */}
        <Block x0={3.9} y0={0.25} x1={5.7} y1={1.05} z1={1.0} c={{ top: "#34373F", fx: "#24272D", fy: "#1D2025" }} />
        <g transform={faceY(3.9, 1.05)}>
          <rect x={0.05} y={0.78} width={1.7} height={0.03} fill={acc} opacity={0.7 + 0.3 * glow} />
        </g>
        <Cyl x={5.4} y={0.55} z0={1.0} z1={1.14} r={0.09} side="#5A4636" top="#3D2E22" />
        <circle cx={iso(5.4, 0.55, 1.3)[0]} cy={iso(5.4, 0.55, 1.3)[1]} r={14} fill="#1F3A2B" />
        <circle cx={iso(5.4, 0.55, 1.3)[0] - 7} cy={iso(5.4, 0.55, 1.3)[1] - 7} r={9} fill="#2A4A37" />
        <Block x0={4.95} y0={0.45} x1={5.15} y1={0.75} z0={1.0} z1={1.05} c={{ top: "#4A4E57", fx: "#2A2D33", fy: "#24272D" }} />
        <Phone t={t} s={s} />
        {/* planta y farolas */}
        <Cyl x={5.4} y={5.4} z0={0} z1={0.35} r={0.2} side="#3D2E22" top="#2A2018" />
        <circle cx={iso(5.4, 5.4, 0.8)[0]} cy={iso(5.4, 5.4, 0.8)[1]} r={30} fill="#1F3A2B" />
        <circle cx={iso(5.4, 5.4, 0.8)[0] + 12} cy={iso(5.4, 5.4, 0.8)[1] - 14} r={20} fill="#2A4A37" />
        <Lamp x={6.6} y={2.0} on={1} />
        <Lamp x={6.6} y={6.4} on={1} />
        <Lamp x={9.3} y={5.0} on={1} />
        {right.map((b) => (b === RIVAL ? <Rival key="rival" lit={s.rival} /> : <Building key={b.seed} b={b} lights={1} />))}
      </g>
    </svg>
  );
};
