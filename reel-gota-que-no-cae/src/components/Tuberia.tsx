import React from "react";
import { AbsoluteFill } from "remotion";
import { C, EASE, EASE_IN, EASE_OUT, EV, MONO, S, TL, clamp01, jolt, ramp, springAt } from "../theme";

// layout (px): a pipe from the left edge to an elbow, down into the CLIENTES tank; three leaks on its run
const PY = 560; // pipe centre line
const PO = 46; // outer thickness
const PI_ = 24; // inner channel
const EX = 900; // elbow x
const TANK = { x: 770, y: 880, w: 250, h: 300 };
const FLOOR = 1180; // where the lost drops land
const LX = [330, 540, 750];
const LABEL_Y = [462, 400, 462];
const P = TL.pipe;

/** Is leak k sealed at t? */
const sealed = (k: number, t: number) => t >= P.leaks[k].clamp;

/** A falling drop: a teardrop that stretches a touch with the speed. */
const Drop: React.FC<{ x: number; y: number; s: number; o: number }> = ({ x, y, s, o }) => (
  <path d={`M ${x} ${y - 13 * s} C ${x + 7 * s} ${y - 2 * s} ${x + 9 * s} ${y + 6 * s} ${x} ${y + 9 * s} C ${x - 9 * s} ${y + 6 * s} ${x - 7 * s} ${y - 2 * s} ${x} ${y - 13 * s} Z`}
    fill={C.orangeSoft} opacity={o} />
);

/**
 * Scenes 5–6. «Ahora piensa en tu negocio»: the pipe from INTERESADOS to CLIENTES draws in, the flow starts; each leak
 * opens with its label on its word and drips at its own pace — every drop falls, splashes and is gone (−1, and the count of
 * the ones that got away goes up); the tank barely rises. «cerramos esas fugas»: three orange band clamps, one per syllable;
 * the drips stop; «llegue a donde tiene que llegar»: the whole flow arrives, the tank fills, a ✓ on every label.
 */
export const Tuberia: React.FC<{ t: number }> = ({ t }) => {
  if (t < EV.sweep || t >= S.S7 + 0.05) return null;
  const draw = ramp(t, EV.sweep + 0.15, EV.sweep + 1.0, EASE);
  const flowOn = ramp(t, EV.sweep + 0.6, EV.sweep + 1.2);
  // how much of the flow survives each stretch of pipe (each open leak takes its share)
  const keep = [0.66, 0.6, 0.55];
  const seg = [1, 1, 1, 1];
  for (let k = 0; k < 3; k++) {
    const open = ramp(t, P.leaks[k].at - 0.05, P.leaks[k].at + 0.25) * (1 - ramp(t, P.leaks[k].clamp, P.leaks[k].clamp + 0.3));
    for (let j = k + 1; j < 4; j++) seg[j] *= 1 - (1 - keep[k]) * open;
  }
  const level = 0.05 + 0.07 * ramp(t, EV.sweep + 1, EV.clamp1, (x) => x) + 0.8 * ramp(t, P.fill[0], P.fill[1], EASE);
  const full = ramp(t, P.fill[1] - 0.05, P.fill[1] + 0.3);
  // drops of every leak: in the air, splashing, gone
  const drops: React.ReactNode[] = [];
  let lost = 0;
  P.leaks.forEach((lk, k) => {
    lk.drops.forEach((d, j) => {
      const a = t - d;
      if (a < -0.25) return;
      if (a >= P.fallT) lost += 1;
      const x = LX[k];
      if (a < 0) {
        // the bead swelling under the leak
        const g = EASE_OUT(clamp01((a + 0.25) / 0.25));
        drops.push(<circle key={`b${k}-${j}`} cx={x} cy={PY + PO / 2 + 5 * g} r={3 + 4 * g} fill={C.orangeSoft} opacity={0.9} />);
      } else if (a < P.fallT) {
        const q = a / P.fallT;
        const y = PY + PO / 2 + 8 + (FLOOR - PY - PO / 2 - 8) * q * q;
        drops.push(<Drop key={`d${k}-${j}`} x={x} y={y} s={1 + 0.35 * q} o={0.95} />);
      } else if (a < P.fallT + 0.5) {
        const q = (a - P.fallT) / 0.5;
        drops.push(
          <g key={`s${k}-${j}`} opacity={1 - q}>
            <ellipse cx={x} cy={FLOOR} rx={8 + 34 * EASE_OUT(q)} ry={3 + 7 * EASE_OUT(q)} fill="none" stroke={C.orangeSoft} strokeWidth={2.5} />
            <circle cx={x - 14 - 16 * q} cy={FLOOR - 26 * Math.sin(Math.PI * Math.min(1, q * 1.6))} r={3} fill={C.orangeSoft} />
            <circle cx={x + 12 + 18 * q} cy={FLOOR - 20 * Math.sin(Math.PI * Math.min(1, q * 1.6))} r={2.5} fill={C.orangeSoft} />
            <text x={k === 2 ? x - 66 : x + 26} y={FLOOR - 30 - 46 * EASE_OUT(q)} fontFamily={MONO} fontWeight={700} fontSize={30} fill={C.white} opacity={0.9}>−1</text>
          </g>,
        );
      }
    });
  });
  const dash = (t * 260) % 60;
  const pathH = `M -30 ${PY} L ${EX - 40} ${PY} Q ${EX} ${PY} ${EX} ${PY + 40} L ${EX} ${TANK.y + 6}`;
  const totalLen = EX + 30 + 63 + (TANK.y - PY - 34);
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <AbsoluteFill style={{
        backgroundImage: "radial-gradient(rgba(138,138,138,0.22) 1.6px, transparent 1.8px)", backgroundSize: "40px 40px",
        opacity: 0.75 * ramp(t, EV.sweep, EV.sweep + 0.5),
      }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 55% 30% at 75% 52%, rgba(255,107,26,${0.13 * full}), rgba(5,5,5,0) 70%)` }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="tanque"><rect x={TANK.x + 6} y={TANK.y + 6} width={TANK.w - 12} height={TANK.h - 12} rx={18} /></clipPath>
          <linearGradient id="brilloTubo" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.22} />
            <stop offset="0.45" stopColor="#FFFFFF" stopOpacity={0.03} />
            <stop offset="1" stopColor="#000000" stopOpacity={0.3} />
          </linearGradient>
        </defs>
        {/* the floor where lost drops end */}
        <line x1={60} x2={TANK.x - 30} y1={FLOOR + 4} y2={FLOOR + 4} stroke={C.grey} strokeWidth={2} strokeDasharray="6 10" opacity={0.6 * draw} />
        {/* pipe body, drawn in */}
        <path d={pathH} fill="none" stroke="#2a2726" strokeWidth={PO} strokeLinecap="butt" strokeDasharray={`${totalLen * draw} 9999`} />
        <path d={pathH} fill="none" stroke="#3a3533" strokeWidth={PO - 6} strokeLinecap="butt" strokeDasharray={`${totalLen * draw} 9999`} opacity={0.6} />
        <rect x={-30} y={PY - PO / 2} width={(EX - 10) * draw} height={PO} fill="url(#brilloTubo)" />
        {/* the flow inside: moving dashes, dimmer after every open leak */}
        {[0, 1, 2, 3].map((k) => {
          const x0 = k === 0 ? -30 : LX[k - 1];
          const x1 = k === 3 ? EX - 40 : LX[k];
          return (
            <line key={k} x1={x0} x2={x0 + (x1 - x0) * clamp01(draw * 1.2)} y1={PY} y2={PY} stroke={C.orangeSoft} strokeWidth={PI_ - 10} strokeLinecap="round"
              strokeDasharray="34 26" strokeDashoffset={-dash} opacity={flowOn * (0.25 + 0.75 * seg[k])} />
          );
        })}
        <path d={`M ${EX - 40} ${PY} Q ${EX} ${PY} ${EX} ${PY + 40} L ${EX} ${TANK.y + 6}`} fill="none" stroke={C.orangeSoft} strokeWidth={PI_ - 10}
          strokeDasharray="34 26" strokeDashoffset={-dash} opacity={flowOn * (0.25 + 0.75 * seg[3]) * ramp(t, EV.sweep + 0.8, EV.sweep + 1.1)} />
        {/* tank */}
        <g opacity={ramp(t, EV.sweep + 0.6, EV.sweep + 1.0)}>
          <rect x={TANK.x} y={TANK.y} width={TANK.w} height={TANK.h} rx={22} fill="#0d0b0a" stroke={full > 0 ? C.orangeSoft : C.grey} strokeWidth={3} />
          <g clipPath="url(#tanque)">
            <rect x={TANK.x} y={TANK.y + TANK.h * (1 - level)} width={TANK.w} height={TANK.h * level + 4} fill={C.orange} opacity={0.85} />
            <path d={`M ${TANK.x} ${TANK.y + TANK.h * (1 - level)} q 30 ${-6 * Math.sin(t * 6)} 62 0 t 62 0 t 62 0 t 64 0`} fill="none" stroke={C.orangeSoft} strokeWidth={4} />
          </g>
          <text x={TANK.x + TANK.w / 2} y={TANK.y + 52} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={32} letterSpacing={4} fill={C.white}>CLIENTES</text>
          {full > 0 && (
            <path d="M0 0 L12 13 L34 -12" transform={`translate(${TANK.x + TANK.w / 2 - 17} ${TANK.y + 110}) scale(${EASE_OUT(full) * 1.4})`} fill="none" stroke={C.white}
              strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          )}
        </g>
        {/* source */}
        <g opacity={ramp(t, EV.sweep + 0.3, EV.sweep + 0.7)}>
          <text x={60} y={PY + PO / 2 + 52} fontFamily={MONO} fontWeight={700} fontSize={32} letterSpacing={4} fill={C.white}>INTERESADOS</text>
          <text x={60} y={PY + PO / 2 + 90} fontFamily={MONO} fontWeight={500} fontSize={24} letterSpacing={3} fill={C.grey}>ENTRAN →</text>
        </g>
        {/* leaks, labels, clamps */}
        {P.leaks.map((lk, k) => {
          const pop = springAt(t, lk.at, 12, 200);
          if (pop <= 0.001) return null;
          const x = LX[k];
          const cl = t >= lk.clamp - 0.18 ? springAt(t, lk.clamp - 0.18, 14, 260) : 0;
          const shake = jolt(t, lk.clamp, 0.12, 12);
          const ok = ramp(t, EV.llegar + 0.12 * k, EV.llegar + 0.12 * k + 0.22, EASE_OUT);
          const ly = LABEL_Y[k];
          const tw = lk.label.length * 17.7 - 1.5;
          return (
            <g key={k}>
              {/* the crack */}
              {!sealed(k, t) && <path d={`M ${x - 9} ${PY + PO / 2 - 4} l 5 4 l 4 -3 l 4 4 l 5 -3`} fill="none" stroke={C.orangeSoft} strokeWidth={2.5} opacity={pop} />}
              <line x1={x} y1={ly + 12} x2={x} y2={PY - PO / 2 - 6} stroke={C.grey} strokeWidth={2} strokeDasharray="4 6" opacity={clamp01(pop)} />
              <g transform={`translate(${x} ${ly}) scale(${0.85 + 0.15 * Math.min(1.1, pop)})`} opacity={clamp01(pop * 1.4)}>
                <rect x={-tw / 2 - 14} y={-34} width={tw + 28 + (ok > 0 ? 44 : 0)} height={46} rx={6} fill="rgba(5,5,5,0.85)" stroke={sealed(k, t) ? C.orange : C.grey} strokeWidth={2} />
                <text x={-tw / 2} y={0} fontFamily={MONO} fontWeight={700} fontSize={27} letterSpacing={1.5} fill={C.white}>{lk.label}</text>
                {ok > 0 && <path d="M0 0 L8 9 L23 -9" transform={`translate(${tw / 2 + 12} ${-12}) scale(${ok})`} fill="none" stroke={C.orange} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />}
              </g>
              {/* the clamp: an orange band dropped onto the crack and cinched */}
              {cl > 0 && (
                <g transform={`translate(${x + shake * 3} ${PY - 90 * (1 - Math.min(1, cl))})`} opacity={clamp01(cl * 2)}>
                  <rect x={-20} y={-PO / 2 - 7} width={40} height={PO + 14} rx={7} fill={C.orange} />
                  <rect x={-20} y={-PO / 2 - 7} width={40} height={PO + 14} rx={7} fill="url(#brilloTubo)" />
                  <rect x={-9} y={-PO / 2 - 24} width={18} height={18} rx={3} fill={C.orangeSoft} />
                  <line x1={-5} x2={5} y1={-PO / 2 - 15} y2={-PO / 2 - 15} stroke="#5a2a0c" strokeWidth={3} />
                </g>
              )}
              {cl > 0.9 && t < lk.clamp + 0.6 && (() => {
                const q = clamp01((t - lk.clamp) / 0.55);
                return <circle cx={x} cy={PY} r={30 + 50 * EASE_OUT(q)} fill="none" stroke={C.orangeSoft} strokeWidth={3} opacity={1 - q} />;
              })()}
            </g>
          );
        })}
        {drops}
        {/* the count of the ones that got away */}
        <g opacity={ramp(t, P.leaks[0].at + P.fallT - 0.1, P.leaks[0].at + P.fallT + 0.2) * (1 - ramp(t, EV.fluye, EV.fluye + 0.4))}>
          <text x={60} y={FLOOR + 56} fontFamily={MONO} fontWeight={500} fontSize={24} letterSpacing={3} fill={C.grey}>SE ESCAPAN</text>
          <text x={258} y={FLOOR + 58} fontFamily={MONO} fontWeight={700} fontSize={34} fill={C.orange}>{String(lost)}</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
export { EASE_IN };
