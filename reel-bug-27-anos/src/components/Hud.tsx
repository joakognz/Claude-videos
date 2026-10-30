import React from "react";
import { Cam, V3, project } from "../camera";
import { C, EASE, EASE_OUT, EV, MONO, S, UI, clamp01, springAt, windowed } from "../theme";
import { FINDINGS, FINDING_OK, GATE, HALF, XFACE, orbAAt, orbBAt } from "../world/layout";
import { Micro } from "./Captions";

/** E3: the public commit slides over the gate; the bug line is underlined, a FIXED stamp drops, the credit is underlined. */
const LogCard: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const o = windowed(t, EV.logIn, EV.logOut, 0.35, 0.3);
  if (o <= 0) return null;
  const [gx, gy] = project([GATE[0], GATE[1] + 0.4, GATE[2]], cam);
  const slide = EASE_OUT(clamp01((t - EV.logIn) / 0.45));
  const u1 = EASE_OUT(clamp01((t - EV.underline1) / 0.35));
  const u2 = EASE_OUT(clamp01((t - EV.underline2) / 0.35));
  const st = clamp01((t - EV.stamp) / 0.18);
  const stampScale = st < 1 ? 2.2 - 1.2 * EASE(st) : 1 + 0.06 * Math.exp(-(t - EV.stamp - 0.18) * 12) * Math.sin((t - EV.stamp) * 40);
  const line = (text: string, u: number, bold = false) => (
    <div style={{ position: "relative", display: "inline-block", fontWeight: bold ? 700 : 500 }}>
      {text}
      <span style={{ position: "absolute", left: 0, bottom: -3, height: 4, width: `${u * 100}%`, background: C.orange, boxShadow: "0 0 10px rgba(255,107,26,0.8)" }} />
    </div>
  );
  return (
    <div style={{
      position: "absolute", left: gx - 300 + (1 - slide) * -420, top: gy - 260, width: 600, opacity: o, rotate: "-2deg",
      background: C.cream, color: C.ink, borderRadius: 18, padding: "26px 30px", fontFamily: MONO, fontSize: 23, lineHeight: 1.55,
      boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
    }}>
      <div style={{ fontSize: 18, letterSpacing: 3, opacity: 0.55, marginBottom: 10 }}>OPENBSD/SRC · TCP_INPUT.C</div>
      <div>{line("Ignore TCP SACK packets with", u1, true)}</div>
      <div>{line("invalid sequence numbers.", u1, true)}</div>
      <div style={{ opacity: 0.45 }}>… could crash the kernel …</div>
      <div style={{ marginTop: 8 }}>{line("Reported by … at anthropic dot com", u2)}</div>
      {t > EV.stamp && (
        <div style={{
          position: "absolute", right: 22, top: 70, padding: "8px 18px", border: `5px solid ${C.ink}`, borderRadius: 10, fontFamily: UI,
          fontWeight: 700, fontSize: 40, letterSpacing: 3, color: C.ink, rotate: "-12deg", scale: String(stampScale), opacity: 0.88 * Math.min(1, st * 2),
          background: "rgba(255,244,236,0.6)",
        }}>ARREGLADO</div>
      )}
    </div>
  );
};

/** E5: next to the gate: CAÍDA, not ENTRADA. */
const FallTag: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const o = windowed(t, EV.tagFall - 0.1, S.E6 + 0.1, 0.25, 0.35);
  if (o <= 0) return null;
  const [x, y] = project([GATE[0] - 1.3, 1.5, GATE[2] + 0.4], cam);
  const s1 = springAt(t, EV.tagFall, 12, 200);
  const s2 = springAt(t, EV.tagEntry, 12, 200);
  const strike = EASE_OUT(clamp01((t - EV.tagEntry - 0.15) / 0.3));
  return (
    <div style={{ position: "absolute", left: x, top: y, translate: "-50% -100%", opacity: o, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ scale: String(Math.max(0, s1)), padding: "12px 26px", borderRadius: 14, background: C.cream, color: C.ink, fontFamily: MONO, fontWeight: 700, fontSize: 40, letterSpacing: 6 }}>CAÍDA</div>
      <div style={{ position: "relative", scale: String(Math.max(0, s2)), padding: "8px 20px", borderRadius: 12, border: "2px solid rgba(255,244,236,0.35)", color: "rgba(255,244,236,0.55)", fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 5 }}>
        ENTRADA
        <span style={{ position: "absolute", left: 10, top: "50%", height: 3, width: `calc(${strike} * (100% - 20px))`, background: C.cream }} />
      </div>
    </div>
  );
};

/** E6: a translucent ribbon with a question mark across the 27 notches. */
const Doubt: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const o = windowed(t, EV.doubt, S.E7 - 0.1, 0.35, 0.35);
  if (o <= 0) return null;
  const a = project([XFACE, 1.0, HALF - 0.3], cam);
  const b = project([XFACE, 1.0, -HALF + 0.3], cam);
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const w = EASE_OUT(clamp01((t - EV.doubt) / 0.5));
  const q = springAt(t, EV.doubt + 0.25, 10, 180);
  return (
    <div style={{ position: "absolute", left: a[0], top: a[1] - 80, width: len * w, height: 64, transformOrigin: "0 50%", rotate: `${ang}rad`, opacity: o,
      background: "linear-gradient(90deg, rgba(255,244,236,0.28), rgba(255,244,236,0.08))", borderTop: "1.5px solid rgba(255,244,236,0.4)", borderBottom: "1.5px solid rgba(255,244,236,0.4)" }}>
      <div style={{ position: "absolute", left: len * 0.3, top: -40, rotate: `${-ang}rad`, scale: String(Math.max(0, q)), fontFamily: UI, fontWeight: 700, fontSize: 110, color: C.cream, textShadow: "0 0 30px rgba(255,244,236,0.5)" }}>?</div>
    </div>
  );
};

const Mark: React.FC<{ x: number; y: number; ok: boolean; s: number; o?: number }> = ({ x, y, ok, s, o = 1 }) => (
  <div style={{
    position: "absolute", left: x, top: y, translate: "-50% -50%", scale: String(Math.max(0, s)), opacity: o, width: 64, height: 64, borderRadius: 32,
    display: "flex", alignItems: "center", justifyContent: "center", fontFamily: UI, fontWeight: 700, fontSize: 38,
    background: ok ? C.orange : "rgba(42,33,27,0.92)", color: ok ? C.ink : "rgba(255,244,236,0.6)",
    border: ok ? "none" : "2px solid rgba(255,244,236,0.3)", boxShadow: ok ? "0 0 30px rgba(255,107,26,0.6)" : "none",
  }}>{ok ? "✓" : "✗"}</div>
);

/** E7: ✓ next to the orb that found the crack, ✗ next to the one that flew past. */
const OrbMarks: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const o = windowed(t, EV.found, S.E8 - 0.2, 0.2, 0.35);
  if (o <= 0) return null;
  const [ax, ay] = project(orbAAt(t), cam);
  const [bx, by] = project(orbBAt(Math.min(t, EV.missed + 0.4)), cam);
  return (
    <>
      <Mark x={ax + 20} y={ay - 80} ok s={springAt(t, EV.found + 0.1, 11, 200)} o={o} />
      {t > EV.missed && <Mark x={bx} y={by - 80} ok={false} s={springAt(t, EV.missed + 0.1, 11, 200)} o={o} />}
      <div style={{ position: "absolute", left: ax + 20, top: ay - 140, translate: "-50% 0", opacity: o }}><Micro size={18} color={C.orangeSoft}>MODELO A</Micro></div>
      {t > EV.orbB && <div style={{ position: "absolute", left: bx, top: by - 140, translate: "-50% 0", opacity: o * clamp01((t - EV.orbB) / 0.3) }}><Micro size={18}>MODELO B</Micro></div>}
    </>
  );
};

/** E9: the cream lens weighs each finding: ✓ kept, ✗ dropped. */
const ReviewMarks: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const o = windowed(t, EV.review, S.E10 + 0.3, 0.2, 0.4);
  if (o <= 0) return null;
  return (
    <>
      {FINDINGS.map((f, i) => {
        const at = EV.review + i * EV.reviewStep;
        if (t < at) return null;
        const [x, y] = project([f[0], f[1], f[2]] as V3, cam);
        return <Mark key={i} x={x + 52} y={y - 46} ok={FINDING_OK[i]} s={springAt(t, at, 11, 200)} o={o} />;
      })}
    </>
  );
};

export const Hud: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => (
  <>
    <LogCard t={t} cam={cam} />
    <FallTag t={t} cam={cam} />
    <Doubt t={t} cam={cam} />
    <OrbMarks t={t} cam={cam} />
    <ReviewMarks t={t} cam={cam} />
  </>
);
