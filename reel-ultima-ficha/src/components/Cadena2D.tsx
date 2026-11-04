import React from "react";
import { AbsoluteFill } from "remotion";
import { C, EASE, EASE_IN, EASE_OUT, EV, MONO, S, TL, clamp01, jolt, ramp, springAt } from "../theme";

/**
 * Scenes 5–6, a domino chain seen from the side (2D). «el mensaje, la cita, el presupuesto, la factura»: four tiles pop
 * in on their words, with two empty places between each pair — nothing can fall onto the next. «y cada ficha la empujas
 * tú»: a hand («TÚ») shoves them one by one, straining; each rocks and settles back. «montamos la cadena»: the gaps fill
 * with orange tiles; «tú das el primer toque»: one light touch; «y el resto cae solo»: the whole chain falls by itself,
 * each impact at a real chain's accelerating rhythm (TL.chain2d.fallT), every label ticked as its tile goes.
 */
const K = TL.chain2d;
const NT = 10;
const BASE = 1090; // table line (px)
const TH = 230; // tile height
const TW = 40; // tile thickness (side view)
const X0 = 115;
const DX = (775 - 115) / (NT - 1); // leaves room on the right for the last tile to lie down
const BIZ = [0, 3, 6, 9];
const ORANGE = [1, 2, 4, 5, 7, 8];
const PHI_C = Math.asin((DX - TW) / TH); // tilt at which a tile touches the next one
const PHI_LAND = Math.PI / 2;
const DEG = 180 / Math.PI;

/** Tilt of the leaning tile i resting on tile i+1 at tilt q (side view, pivot at the bottom-right corner). */
const lean = (q: number) => q + Math.asin(Math.max(-1, Math.min(1, (DX * Math.cos(q) - TW) / TH)));

/** Every tile's tilt (radians, falling to the right) while the chain falls by itself. */
const chainTilts = (t: number) => {
  const T = K.fallT;
  const out = new Array(NT).fill(0);
  if (t < T[0]) return out;
  // the leading tile: falling freely from T[k] to T[k+1] (accelerating), the last one down to the table
  let k = 0;
  while (k < NT - 1 && t >= T[k + 1]) k++;
  const u = clamp01((t - T[k]) / (T[k + 1] - T[k]));
  out[k] = (k === NT - 1 ? PHI_LAND : PHI_C) * u * u;
  if (k === NT - 1 && t >= T[NT]) out[k] = PHI_LAND;
  // the rest lean on the next one
  for (let j = k - 1; j >= 0; j--) out[j] = lean(out[j + 1]);
  return out;
};

/** A tile pushed by the hand: rocks forward ~13°, strains, then settles back with a damped wobble. */
const pushTilt = (t: number, p: number) => {
  const press = ramp(t, p, p + 0.2, EASE_OUT) * (1 - ramp(t, p + 0.22, p + 0.34, EASE_IN));
  const wob = t > p + 0.34 ? 0.05 * jolt(t, p + 0.34, 0.22, 4) : 0;
  return (13 / DEG) * press + wob + (press > 0.6 ? 0.012 * Math.sin(t * 90) : 0);
};

const Tile: React.FC<{ x: number; phi: number; fill: string; edge: string; y?: number; scale?: number; opacity?: number }> = ({ x, phi, fill, edge, y = 0, scale = 1, opacity = 1 }) => (
  // pivot: bottom-right corner (the chain falls to the right)
  <g transform={`translate(${x + TW / 2} ${BASE + y}) rotate(${phi * DEG}) scale(${scale})`} opacity={opacity}>
    <rect x={-TW} y={-TH} width={TW} height={TH} rx={7} fill={fill} stroke={edge} strokeWidth={2} />
    <rect x={-TW + 6} y={-TH + 8} width={5} height={TH - 16} rx={2.5} fill="#FFFFFF" opacity={0.28} />
    <rect x={-TW + 4} y={-TH / 2 - 1.5} width={TW - 8} height={3} rx={1.5} fill="rgba(5,5,5,0.55)" />
  </g>
);

/** The forearm of «tú», reaching in from off-screen left; drawn BEHIND the tiles so it never covers the chain. */
const Brazo: React.FC<{ tipX: number; tipY: number; opacity: number }> = ({ tipX, tipY, opacity }) => (
  <g opacity={opacity}>
    <defs>
      {/* fades out toward the left, so it reads as an arm coming in, not a rail across the chain (it never rotates) */}
      <linearGradient id="brazo" gradientUnits="userSpaceOnUse" x1={tipX - 520} x2={tipX - 150} y1={0} y2={0}>
        <stop offset="0" stopColor={C.white} stopOpacity={0} />
        <stop offset="1" stopColor={C.white} stopOpacity={0.92} />
      </linearGradient>
    </defs>
    <rect x={tipX - 520} y={tipY - 20} width={380} height={44} rx={18} fill="url(#brazo)" />
  </g>
);

/** The hand of «tú»: a white pointing hand, finger to the right; `tipX, tipY` is the fingertip. */
const Mano: React.FC<{ tipX: number; tipY: number; strain: number; opacity: number; label: number }> = ({ tipX, tipY, strain, opacity, label }) => {
  const shake = strain > 0.05 ? Math.sin(tipX * 0.7 + tipY) * 0 : 0;
  return (
    <g opacity={opacity}>
      <g transform={`translate(${tipX + shake} ${tipY})`}>
        <rect x={-150} y={-36} width={84} height={70} rx={22} fill={C.white} />
        <rect x={-80} y={-34} width={80} height={24} rx={12} fill={C.white} />
        <rect x={-100} y={4} width={46} height={20} rx={10} fill={C.white} />
        <rect x={-128} y={20} width={44} height={22} rx={11} fill={C.white} transform="rotate(-12 -106 31)" />
        <rect x={-210} y={-20} width={70} height={44} rx={8} fill={C.white} opacity={0.92} />
        {strain > 0.05 && [0, 1, 2].map((k) => {
          const a = -1.0 + k * 1.0;
          return <line key={k} x1={8 * Math.cos(a)} y1={-22 + 8 * Math.sin(a)} x2={(8 + 26 * strain) * Math.cos(a)} y2={-22 + (8 + 26 * strain) * Math.sin(a)}
            stroke={C.orangeSoft} strokeWidth={4} strokeLinecap="round" opacity={strain} />;
        })}
      </g>
      <text x={Math.max(70, tipX - 60)} y={tipY - 64} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={32} letterSpacing={6} fill={C.white} opacity={label}>TÚ</text>
    </g>
  );
};

export const Cadena2D: React.FC<{ t: number }> = ({ t }) => {
  if (t < EV.sweep || t >= S.S7 + 0.05) return null;
  const xs = Array.from({ length: NT }, (_, i) => X0 + i * DX);
  const chain = chainTilts(t);
  const slotsIn = ramp(t, EV.sweep + 0.3, EV.sweep + 0.8, EASE_OUT);
  // the hand: pushes (S5), then the single touch (S6)
  let hand: { x: number; y: number; strain: number; op: number } | null = null;
  const tipY = BASE - TH * 0.72;
  const pushes = K.pushes;
  if (t >= pushes[0] - 0.45 && t < S.S6 - 0.1) {
    let k = 0;
    while (k < 3 && t >= pushes[k + 1] - 0.12) k++;
    const p = pushes[k];
    const tileX = xs[BIZ[k]] - TW / 2;
    const prevX = k > 0 ? xs[BIZ[k - 1]] - TW / 2 : tileX - 120;
    const move = ramp(t, p - 0.12 - (k === 0 ? 0.3 : 0), p - 0.02, EASE);
    const press = ramp(t, p, p + 0.2, EASE_OUT) * (1 - ramp(t, p + 0.22, p + 0.34, EASE_IN));
    const back = 14 * (1 - press);
    hand = {
      x: prevX + (tileX - prevX) * move - back + 10 * press,
      y: tipY - 10 * press + (press > 0.6 ? 3 * Math.sin(t * 95) : 0),
      strain: press, op: ramp(t, pushes[0] - 0.45, pushes[0] - 0.2) * (1 - ramp(t, S.S6 - 0.4, S.S6 - 0.1)),
    };
  } else if (t >= K.touch - 0.7 && t < K.touch + 0.6) {
    const tileX = xs[0] - TW / 2;
    const touch = ramp(t, K.touch - 0.08, K.touch, EASE_IN) * (1 - ramp(t, K.touch + 0.02, K.touch + 0.25, EASE_OUT));
    hand = {
      x: tileX - 26 + 26 * touch, y: tipY, strain: 0,
      op: ramp(t, K.touch - 0.7, K.touch - 0.45) * (1 - ramp(t, K.touch + 0.25, K.touch + 0.55)),
    };
  }
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <AbsoluteFill style={{
        backgroundImage: "radial-gradient(rgba(138,138,138,0.22) 1.6px, transparent 1.8px)", backgroundSize: "40px 40px",
        opacity: 0.8 * ramp(t, EV.sweep, EV.sweep + 0.5),
      }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 30% at 50% 52%, rgba(255,107,26,${0.1 * ramp(t, K.fills[0], K.touch)}), rgba(5,5,5,0) 70%)` }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* the table line */}
        <line x1={60} x2={1040} y1={BASE + 1} y2={BASE + 1} stroke={C.grey} strokeWidth={3} opacity={slotsIn} />
        {/* empty places: dashed outlines until an orange tile drops in */}
        {ORANGE.map((i, n) => {
          const filled = t >= K.fills[n] + 0.05;
          return !filled && (
            <rect key={`h${i}`} x={xs[i] - TW / 2} y={BASE - TH} width={TW} height={TH} rx={7} fill="none" stroke="rgba(138,138,138,0.6)"
              strokeWidth={2.5} strokeDasharray="10 9" opacity={slotsIn} />
          );
        })}
        {hand && <Brazo tipX={hand.x} tipY={hand.y} opacity={hand.op} />}
        {/* orange tiles dropping into the gaps («montamos la cadena») */}
        {ORANGE.map((i, n) => {
          const f = K.fills[n];
          if (t < f - 0.2) return null;
          const drop = ramp(t, f - 0.2, f, EASE_IN);
          const bounce = t >= f ? -10 * jolt(t, f, 0.12, 5) : 0;
          return <Tile key={`o${i}`} x={xs[i]} phi={chain[i]} y={-300 * (1 - drop) + bounce} fill={C.orange} edge="#FFB066" />;
        })}
        {/* the business tiles */}
        {BIZ.map((i, n) => {
          const c = K.cards[n];
          const s = springAt(t, c.t, 12, 200);
          if (s <= 0.001) return null;
          const phi = Math.max(chain[i], t < S.S6 ? pushTilt(t, K.pushes[n]) : 0);
          return <Tile key={`b${i}`} x={xs[i]} phi={phi} fill="#EDEDED" edge="#FFFFFF" scale={0.6 + 0.4 * Math.min(1.05, s)} opacity={clamp01(s * 2)} />;
        })}
        {hand && <Mano tipX={hand.x} tipY={hand.y} strain={hand.strain} opacity={hand.op} label={hand.op} />}
      </svg>
      {/* labels above the business tiles, ticked when their tile falls */}
      {BIZ.map((i, n) => {
        const c = K.cards[n];
        const s = springAt(t, c.t + 0.02, 13, 210);
        if (s <= 0.001) return null;
        const ok = EASE_OUT(clamp01((t - K.fallT[i]) / 0.18));
        return (
          <div key={`l${i}`} style={{
            position: "absolute", left: xs[i] - 160, width: 320, top: BASE - TH - 96, textAlign: "center", fontFamily: MONO, fontWeight: 700,
            fontSize: 30, letterSpacing: 3, color: ok > 0.5 ? C.orangeSoft : C.white, opacity: clamp01(s * 1.6), translate: `0px ${(1 - Math.min(1, s)) * 16}px`,
          }}>
            {c.label}
            <div style={{ height: 40, marginTop: 4, display: "flex", justifyContent: "center" }}>
              {ok > 0 && (
                <svg width={40} height={40} viewBox="0 0 40 40" style={{ scale: String(0.6 + 0.4 * ok) }}>
                  <path d="M8 21 L17 30 L33 11" fill="none" stroke={C.orange} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray={40} strokeDashoffset={40 * (1 - ok)} />
                </svg>
              )}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
