import React from "react";
import { AbsoluteFill } from "remotion";
import mechJson from "../mech-gears.json";
import { C, EASE, EASE_IN, EASE_OUT, EV, MONO, S, TL, clamp01, jolt, ramp, springAt } from "../theme";

type G = { id: string; z: number; r: number; ra: number; rf: number; x: number; y: number; phi: number };
const MECH = mechJson as unknown as { m: number; gears: G[]; paths: Record<string, string>; tooth20: string };
const [NEW, ...BIZ] = MECH.gears;
const M = TL.mech;
const DEG = 180 / Math.PI;

const LABEL: Record<string, { text: string; dx: number; dy: number; anchor: "middle" | "start" }> = {
  agenda: { text: "AGENDA", dx: 0, dy: -(BIZ[0].ra + 26), anchor: "middle" },
  mensajes: { text: "MENSAJES", dx: 0, dy: -(BIZ[1].ra + 26), anchor: "middle" },
  facturas: { text: "FACTURAS", dx: BIZ[2].ra + 22, dy: 10, anchor: "start" },
};

/** Angle of a business gear meshing with the new one (tooth 0 at +x, SVG y-down): a gap faces the new gear's tooth. */
const meshAngle = (g: G, thN: number) => g.phi + Math.PI - Math.PI / g.z - (NEW.z / g.z) * (thN - g.phi);

const Icon: React.FC<{ kind: string; col: string }> = ({ kind, col }) => {
  const p = { fill: "none", stroke: col, strokeWidth: 5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "agenda") {
    return (
      <g {...p}>
        <rect x={-30} y={-24} width={60} height={52} rx={7} /><path d="M-30 -8 H30 M-16 -32 V-18 M16 -32 V-18" />
        {[-14, 0, 14].map((x) => [6, 17].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r={2.2} fill={col} stroke="none" />))}
      </g>
    );
  }
  if (kind === "mensajes") {
    return <g {...p}><rect x={-30} y={-21} width={60} height={42} rx={6} /><path d="M-28 -18 L0 4 L28 -18" /></g>;
  }
  return <g {...p}><path d="M-22 -30 H10 L24 -16 V30 H-22 Z" /><path d="M10 -30 V-16 H24" /><path d="M-11 -2 H13 M-11 10 H13 M-11 22 H3" /></g>;
};

/** «tú»: a plain bust in the hole where the missing gear should be, arms stretched out to the three gears, holding them together. */
const Tu: React.FC<{ t: number }> = ({ t }) => {
  const inP = springAt(t, EV.tu, 13, 190);
  const outP = ramp(t, EV.fabrica - 0.42, EV.fabrica - 0.02, EASE_IN);
  if (inP <= 0.001 || outP >= 1) return null;
  const shake = M.grind.reduce((a, g, i) => a + jolt(t, g + 0.015, 0.22, 11) * (i % 2 ? -1 : 1), 0);
  const reach = ramp(t, EV.tu + 0.08, EV.tu + 0.45, EASE_OUT);
  const cx = NEW.x + shake * 9;
  const cy = NEW.y + 30 * outP;
  const hands = BIZ.map((g) => {
    const ux = Math.cos(g.phi);
    const uy = Math.sin(g.phi);
    return { x: g.x - ux * (g.rf - 6), y: g.y - uy * (g.rf - 6) };
  });
  const shoulders = [[cx - 52, cy + 26], [cx + 52, cy + 26], [cx, cy + 74]];
  return (
    <g opacity={clamp01(inP * 1.3) * (1 - outP)}>
      {hands.map((h, i) => {
        const [sx, sy] = shoulders[i];
        const ex = sx + (h.x - sx) * reach;
        const ey = sy + (h.y - sy) * reach;
        const strain = M.grind.reduce((a, g) => a + Math.max(0, jolt(t, g, 0.2, 9)), 0);
        return (
          <g key={i}>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="rgba(255,255,255,0.9)" strokeWidth={11 - 2 * strain} strokeLinecap="round" />
            {reach > 0.95 && <circle cx={ex} cy={ey} r={13} fill={C.white} />}
            {reach > 0.95 && strain > 0.05 && [0, 1, 2].map((k) => {
              const a = Math.atan2(ey - sy, ex - sx) + (k - 1) * 0.7 + Math.PI / 2;
              return <line key={k} x1={ex + Math.cos(a) * 22} y1={ey + Math.sin(a) * 22} x2={ex + Math.cos(a) * (22 + 18 * strain)} y2={ey + Math.sin(a) * (22 + 18 * strain)}
                stroke={C.white} strokeWidth={4} strokeLinecap="round" opacity={strain} />;
            })}
          </g>
        );
      })}
      <g transform={`translate(${cx} ${cy}) scale(${0.6 + 0.4 * inP})`}>
        <circle cx={0} cy={-34} r={36} fill={C.white} />
        <path d="M-66 64 C-66 18 -40 6 0 6 C40 6 66 18 66 64 Z" fill={C.white} />
      </g>
      <text x={cx + 3} y={cy - 92} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={32} letterSpacing={6} fill={C.white}>TÚ</text>
    </g>
  );
};

/** The missing gear, built tooth by tooth while it hovers, lowered onto its axle, then driving the train. */
const Nueva: React.FC<{ t: number; th: number }> = ({ t, th }) => {
  const body = ramp(t, M.toothStart - 0.22, M.toothStart + 0.05, EASE_OUT);
  if (body <= 0) return null;
  const lower = ramp(t, M.slide, M.seat, EASE_IN);
  const bounce = t >= M.seat ? 0.035 * jolt(t, M.seat, 0.12, 7) : 0;
  const scale = 1.08 - 0.08 * lower - bounce;
  const lift = 1 - lower;
  const teeth = Array.from({ length: NEW.z }, (_, k) => {
    const at = M.toothStart + k * M.toothStep;
    return { k: (k + 15) % NEW.z, p: springAt(t, at, 14, 320) };
  });
  const running = t >= M.engage;
  return (
    <g>
      {/* shadow on the board while it hovers */}
      <circle cx={NEW.x + 14 * lift} cy={NEW.y + 34 * lift} r={NEW.ra * scale} fill="rgba(0,0,0,0.55)" opacity={0.9 * lift * body} style={{ filter: "blur(18px)" }} />
      <g transform={`translate(${NEW.x} ${NEW.y}) scale(${scale}) rotate(${th * DEG})`}>
        <circle r={NEW.rf + 1} fill={C.orange} opacity={body} />
        <circle r={NEW.rf + 1} fill="none" stroke={C.orangeSoft} strokeWidth={3} strokeDasharray={`${2 * Math.PI * NEW.rf * body} 9999`} />
        {teeth.map(({ k, p }) => p > 0.001 && (
          <g key={k} transform={`rotate(${(k * 360) / NEW.z}) translate(${(1 - Math.min(1, p)) * 26} 0)`} opacity={clamp01(p * 2)}>
            <path d={MECH.tooth20} fill={C.orange} stroke={C.orange} strokeWidth={0.8} />
          </g>
        ))}
        {[0, 1, 2, 3, 4].map((k) => {
          const a = (k * 2 * Math.PI) / 5 + 0.3;
                return <circle key={k} cx={Math.cos(a) * NEW.rf * 0.6} cy={Math.sin(a) * NEW.rf * 0.6} r={NEW.rf * 0.19} fill="#1a0d06" opacity={body} />;
        })}
        <circle r={36} fill="#1a0d06" opacity={body} />
        <circle r={16} fill={running ? C.orangeSoft : C.grey} opacity={body} />
      </g>
      {/* the light stays put while the gear turns: a fixed sheen over the disc */}
      <circle cx={NEW.x} cy={NEW.y} r={NEW.rf * scale} fill="url(#brillo)" opacity={body} />
    </g>
  );
};

/**
 * Scenes 5–6. «Ahora piensa en tu negocio»: three gears pop in (agenda, mensajes, facturas) around an empty axle —
 * nothing between them, so nothing turns; «tú» stands in the hole holding them, shoved three times («pegamento»).
 * «fabricamos las piezas que faltan»: the orange gear is built tooth by tooth, lowered in, seats with a knock;
 * on «encaje» the whole train runs by itself (the clicks are the new gear's teeth passing, TL.mech.spinRate).
 */
export const Mecanismo: React.FC<{ t: number }> = ({ t }) => {
  if (t < EV.sweep || t >= S.S7 + 0.05) return null;
  const thN = t >= M.engage ? 2 * Math.PI * M.spinRate * (t - M.engage) : 0;
  const seat = ramp(t, M.seat, M.seat + 0.12, EASE_OUT);
  const push = 1 + 0.04 * ramp(t, EV.sweep, S.S7, (x) => x);
  const pinsIn = ramp(t, EV.sweep + 0.35, EV.sweep + 0.75, EASE_OUT);
  const hole = ramp(t, S.S5 + 1.1, S.S5 + 1.5, EASE_OUT);
  const running = t >= M.engage;
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <AbsoluteFill style={{
        backgroundImage: "radial-gradient(rgba(138,138,138,0.22) 1.6px, transparent 1.8px)", backgroundSize: "40px 40px",
        opacity: 0.8 * ramp(t, EV.sweep, EV.sweep + 0.5),
      }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 34% at 50% 40%, rgba(255,107,26,${0.1 * ramp(t, M.seat, M.engage)}), rgba(5,5,5,0) 70%)` }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, scale: String(push), transformOrigin: "540px 720px" }}>
        <defs>
          <radialGradient id="brillo" cx="34%" cy="28%" r="78%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.34} />
            <stop offset="45%" stopColor="#FFFFFF" stopOpacity={0.06} />
            <stop offset="100%" stopColor="#000000" stopOpacity={0.28} />
          </radialGradient>
        </defs>
        {/* axle pins; the middle one is the empty place */}
        {BIZ.map((g) => <circle key={g.id} cx={g.x} cy={g.y} r={12} fill="none" stroke={C.grey} strokeWidth={3} opacity={pinsIn} />)}
        <circle cx={NEW.x} cy={NEW.y} r={NEW.ra} fill="none" stroke="rgba(138,138,138,0.55)" strokeWidth={3} strokeDasharray="10 14"
          opacity={hole * (1 - ramp(t, M.toothStart - 0.2, M.toothStart + 0.4))} />
        {BIZ.map((g, i) => {
          const pop = springAt(t, M.pops[i], 12, 200);
          if (pop <= 0.001) return null;
          const misfit = (1 - seat) * (Math.PI / g.z) * (i === 1 ? -1 : 1);
          const shove = M.grind.reduce((a, gt, k) => a + jolt(t, gt, 0.25, 7) * ((k + i) % 2 ? 1 : -1), 0) * 0.09;
          const th = meshAngle(g, thN) + misfit + shove;
          const lab = LABEL[g.id];
          const okP = ramp(t, EV.solo + 0.12 * i, EV.solo + 0.12 * i + 0.25, EASE_OUT);
          return (
            <g key={g.id}>
              <g transform={`translate(${g.x} ${g.y}) scale(${pop})`}>
                <g transform={`rotate(${th * DEG})`}>
                  <path d={MECH.paths[String(g.z)]} fill="#2a2726" stroke={running ? C.orangeSoft : C.grey} strokeWidth={running ? 3 : 2.5} strokeOpacity={running ? 0.8 : 1} />
                  {[0, 1, 2, 3].map((k) => {
                    const a = (k * Math.PI) / 2 + 0.6;
                    const rr = (g.rf + 44) / 2;
                    return <circle key={k} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr} r={Math.max(9, (g.rf - 44) / 5)} fill={C.black} opacity={0.85} />;
                  })}
                </g>
                <circle r={g.rf} fill="url(#brillo)" opacity={0.55} />
                <circle r={44} fill="#0b0b0b" stroke={C.grey} strokeWidth={2.5} />
                <g transform="scale(0.82)"><Icon kind={g.id} col={C.white} /></g>
              </g>
              <g opacity={clamp01(pop)}>
                <text x={g.x + lab.dx} y={g.y + lab.dy} textAnchor={lab.anchor} fontFamily={MONO} fontWeight={700} fontSize={32} letterSpacing={5} fill={C.white}>{lab.text}</text>
                {okP > 0 && (
                  <path d={`M0 0 L9 10 L26 -10`} transform={`translate(${g.x + lab.dx + (lab.anchor === "middle" ? lab.text.length * 12.2 + 14 : lab.text.length * 24.4 + 16)} ${g.y + lab.dy - 10}) scale(${okP})`}
                    fill="none" stroke={C.orange} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
                )}
              </g>
            </g>
          );
        })}
        <Tu t={t} />
        <Nueva t={t} th={thN} />
      </svg>
      {/* the knock when it seats: a ring from the axle */}
      {t >= M.seat && t < M.seat + 0.6 && (() => {
        const q = clamp01((t - M.seat) / 0.55);
        const r = NEW.ra * (1 + 0.5 * EASE(q));
        return <div style={{ position: "absolute", left: NEW.x - r, top: NEW.y - r, width: 2 * r, height: 2 * r, borderRadius: r, border: `3px solid ${C.orangeSoft}`, opacity: 1 - q, boxSizing: "border-box" }} />;
      })()}
    </AbsoluteFill>
  );
};
