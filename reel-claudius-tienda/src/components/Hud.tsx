import React from "react";
import { Cam, project } from "../camera";
import { C, EASE, EV, MONO, S, TITLE, clamp01, rand, springAt, windowed } from "../theme";
import { CLAUDIUS, COUNTER } from "../world/layout";
import { Micro } from "./Captions";

/** E1: name tag over Claudius when the voice says its name. */
const NameTag: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const o = windowed(t, EV.name - 0.05, S.E2, 0.2, 0.3);
  if (o <= 0) return null;
  const [x, y] = project([CLAUDIUS[0], CLAUDIUS[1] + 1.0, CLAUDIUS[2]], cam);
  const s = springAt(t, EV.name - 0.05, 11, 200);
  const lift = 120;
  return (
    <div style={{ position: "absolute", left: x, top: y - lift, translate: "-50% -50%", opacity: o }}>
      <div style={{ position: "absolute", left: "50%", top: 36, width: 2.5, height: (lift - 46) * Math.min(1, s), background: C.orangeSoft, translate: "-50% 0", opacity: 0.8 }} />
      <div style={{
        padding: "10px 26px", borderRadius: 999, background: C.orange, color: C.ink, fontFamily: MONO, fontWeight: 700, fontSize: 32,
        letterSpacing: 6, whiteSpace: "nowrap", scale: String(0.6 + 0.4 * s), boxShadow: "0 0 36px rgba(255,107,26,0.6), 0 10px 26px rgba(0,0,0,0.5)",
      }}>CLAUDIUS</div>
    </div>
  );
};

// ── value line (E2 down, E7 up) ─────────────────────────────────────────
const CH = 230;
const PAD = 36;

type Line = { a: number; b: number; y0: number; steps: number; dy: number; s0: number; s1: number };
const DOWN: Line = { a: EV.chart0, b: EV.down1 + 0.15, y0: 0.32, steps: 5, dy: 0.12, s0: EV.down0, s1: EV.down1 };
const UP: Line = { a: EV.chartOn, b: EV.up1 + 0.15, y0: 0.9, steps: 4, dy: -0.17, s0: EV.up0, s1: EV.up1 };

/** Level (0 top → 1 bottom) of the line at time tt: flat, then one smooth step per beat. */
const levelAt = (L: Line, tt: number) => {
  let y = L.y0;
  for (let k = 0; k < L.steps; k++) {
    const at = L.s0 + (k / (L.steps - 1)) * (L.s1 - L.s0);
    y += L.dy * EASE(clamp01((tt - at) / 0.14));
  }
  return y;
};

const ValueChart: React.FC<{ t: number; L: Line; end: number; dying: boolean; left: number; w: number }> = ({ t, L, end, dying, left, w: CW }) => {
  const o = windowed(t, L.a - 0.15, end, 0.25, 0.3);
  if (o <= 0) return null;
  const pen = clamp01((t - L.a) / (L.b - L.a));
  const n = 90;
  const pts: [number, number][] = [];
  for (let k = 0; k <= n; k++) {
    const u = (k / n) * pen;
    const tt = L.a + u * (L.b - L.a);
    pts.push([PAD + u * (CW - 2 * PAD), PAD + 18 + levelAt(L, tt) * (CH - 2 * PAD - 18)]);
  }
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [hx, hy] = pts[pts.length - 1];
  // E2: once at the bottom, the line flickers and goes out
  const off = dying ? clamp01((t - EV.chartOff) / 0.35) : 0;
  const flick = dying && t > EV.chartOff && off < 1 ? (Math.floor(t * 30) % 2 ? 0.25 : 1) : 1;
  const lineO = (1 - 0.82 * off) * flick;
  const glow = dying ? 1 - off : 1 + 0.3 * Math.sin(t * 6);
  const s = springAt(t, L.a - 0.15, 13, 190);
  return (
    <div style={{ position: "absolute", left, top: 560, width: CW, height: CH, opacity: o, scale: String(0.9 + 0.1 * s) }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 26, background: "rgba(20,17,15,0.78)", border: "1.5px solid rgba(255,244,236,0.14)", boxShadow: "0 24px 60px rgba(0,0,0,0.55)" }} />
      <div style={{ position: "absolute", left: PAD, top: 18 }}>
        <Micro size={18} color="rgba(255,244,236,0.6)">VALOR DEL NEGOCIO</Micro>
      </div>
      <svg width={CW} height={CH} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* break-even line, no numbers */}
        <line x1={PAD} x2={CW - PAD} y1={PAD + 18 + 0.62 * (CH - 2 * PAD - 18)} y2={PAD + 18 + 0.62 * (CH - 2 * PAD - 18)}
          stroke="rgba(255,244,236,0.22)" strokeWidth={2} strokeDasharray="6 8" />
        <path d={d} fill="none" stroke={C.orange} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" opacity={lineO}
          style={{ filter: `drop-shadow(0 0 ${10 * glow}px rgba(255,107,26,${0.9 * glow}))` }} />
        {pen > 0 && (
          <circle cx={hx} cy={hy} r={10 + (dying ? 0 : 3 * Math.sin(t * 8))} fill={dying && off > 0.5 ? "rgba(255,244,236,0.3)" : C.orangeSoft} opacity={lineO}
            style={{ filter: "drop-shadow(0 0 12px rgba(255,107,26,0.9))" }} />
        )}
      </svg>
    </div>
  );
};

// ── E4: the made-up payment account ────────────────────────────────────────
const Card: React.FC = () => (
  <div style={{
    width: 440, height: 268, borderRadius: 24, background: C.cream, position: "relative", fontFamily: MONO, color: C.ink, boxSizing: "border-box",
    padding: "26px 30px",
  }}>
    <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: 4, opacity: 0.55 }}>PAGAR A</div>
    <div style={{ fontFamily: TITLE, fontWeight: 800, fontSize: 40, marginTop: 4, letterSpacing: -0.5 }}>Cuenta de pago</div>
    <div style={{ position: "absolute", left: 30, top: 128, width: 62, height: 46, borderRadius: 9, background: "#d9c3ad", border: "2px solid rgba(20,17,15,0.25)" }} />
    <div style={{ position: "absolute", left: 30, bottom: 26, fontWeight: 700, fontSize: 34, letterSpacing: 6 }}>•••• •••• ••••</div>
  </div>
);

const PaymentCard: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const o = windowed(t, EV.card, S.E5 + 0.1, 0.25, 0.3);
  if (o <= 0) return null;
  const [cx, cy0] = project([COUNTER.c[0], 2.4, COUNTER.c[2]], cam);
  const cy = cy0 - 40;
  const s = springAt(t, EV.card, 12, 190);
  const gl = t > EV.glitch ? clamp01((t - EV.glitch) / 0.3) : 0;
  const dis = clamp01((t - EV.dissolve) / 0.5);
  const q = springAt(t, EV.qmark - 0.05, 9, 170);
  const k = Math.floor(t * 15);
  const slices = 7;
  const sh = 268 / slices;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: o }}>
      {dis < 1 && (
        <div style={{
          position: "absolute", left: cx - 220, top: cy - 134, width: 440, height: 268, scale: String(0.7 + 0.3 * s),
          translate: `${gl * (rand(k) - 0.5) * 14}px 0px`, rotate: `${gl * (rand(k + 1) - 0.5) * 3}deg`,
          filter: `drop-shadow(0 20px 40px rgba(0,0,0,0.6))${dis > 0 ? ` blur(${dis * 6}px)` : ""}`,
        }}>
          {Array.from({ length: slices }, (_, i) => {
            // glitch: slices tear sideways and flicker translucent; on dissolve they drift apart and fade
            const tear = gl * (rand(k * 13 + i) > 0.55 ? (rand(k * 7 + i) - 0.5) * 70 : 0);
            const fl = gl > 0 && rand(k * 3 + i * 5) > 0.8 ? 0.35 : 1;
            const drift = dis * (rand(i + 20) - 0.5) * 160;
            const rise = -dis * (30 + rand(i + 30) * 90);
            return (
              <div key={i} style={{
                position: "absolute", inset: 0, clipPath: `inset(${i * sh}px 0 ${268 - (i + 1) * sh}px 0)`,
                translate: `${tear + drift}px ${rise}px`, opacity: fl * (1 - dis),
              }}>
                <Card />
              </div>
            );
          })}
          {/* orange scan line sweeping over the card */}
          {gl > 0 && dis < 1 && (
            <div style={{
              position: "absolute", left: -10, right: -10, top: ((t * 900) % 300) - 16, height: 6, background: C.orange, opacity: 0.7 * (1 - dis),
              boxShadow: "0 0 18px rgba(255,107,26,0.9)",
            }} />
          )}
        </div>
      )}
      {/* particles left by the dissolve */}
      {dis > 0 && dis < 1 && Array.from({ length: 26 }, (_, i) => {
        const px = cx - 200 + rand(i + 3) * 400 + dis * (rand(i + 5) - 0.5) * 120;
        const py = cy - 120 + rand(i + 7) * 240 - dis * (60 + rand(i + 9) * 160);
        const sz = 6 + rand(i + 11) * 10;
        return <div key={i} style={{ position: "absolute", left: px, top: py, width: sz, height: sz, background: i % 3 ? C.cream : C.orangeSoft, opacity: 1 - dis, borderRadius: 2 }} />;
      })}
      {q > 0 && (
        <div style={{
          position: "absolute", left: cx, top: cy, translate: "-50% -50%", fontFamily: TITLE, fontWeight: 800, fontSize: 240, lineHeight: 1,
          color: C.orange, scale: String(Math.max(0.01, q)), rotate: `${Math.sin(t * 5) * 5}deg`,
          textShadow: "0 0 50px rgba(255,107,26,0.75)", opacity: clamp01(q * 1.5),
        }}>?</div>
      )}
    </div>
  );
};

/** E7: a quick warm flash and speed lines: six months pass. */
const SkipFlash: React.FC<{ t: number }> = ({ t }) => {
  const p = (t - EV.skip + 0.15) / 0.75;
  if (p <= 0 || p >= 1) return null;
  const f = Math.sin(Math.PI * p);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(255,176,102,0.16)", opacity: f }} />
      {Array.from({ length: 14 }, (_, i) => {
        const y = 560 + rand(i + 1) * 980;
        const x = ((p * 2.2 + rand(i + 2)) % 1.4) * 1400 - 300;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 220 + rand(i + 4) * 260, height: 3, background: C.cream, opacity: 0.35 * f, filter: "blur(1px)" }} />;
      })}
    </div>
  );
};

export const Hud: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => (
  <>
    <NameTag t={t} cam={cam} />
    <ValueChart t={t} L={DOWN} end={S.E3 - 0.05} dying left={240} w={600} />
    <PaymentCard t={t} cam={cam} />
    <SkipFlash t={t} />
    <ValueChart t={t} L={UP} end={S.E8 - 0.05} dying={false} left={40} w={400} />
  </>
);

