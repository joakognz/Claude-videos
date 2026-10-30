import React from "react";
import { Cam, V3, project } from "../camera";
import { C, EASE, EASE_OUT, EV, MONO, S, TL, UI, clamp01, lerp, rand, springAt, windowed } from "../theme";
import { CASES, FRAME_PAD, FRAME_TOP, GATE, GATE_H, H, STUDENT_DESK, boxAt, caseAt, score, studentAt } from "../world/layout";
import { Micro } from "./Captions";

// The answer sheet, docked on the left above the classroom
const SH = { x: 64, y: 560, w: 300, h: 560 };
const ROW0 = SH.y + 70;
const ROW_H = 44;
const BOX = 30;
const BOX_X = SH.x + 196;
const GAUGE_X = SH.x + SH.w - 40;

const sheetPose = (t: number, cam: Cam) => {
  // in at the start; rewinds away; handed over again from the desk; breaks in E10
  const first = windowed(t, EV.sheet, EV.rewind + 0.35, 0.35, 0.35);
  const second = clamp01((t - EV.give) / 0.45);
  const [dx, dy] = project([STUDENT_DESK[0], STUDENT_DESK[1] + 0.7, STUDENT_DESK[2]], cam);
  const q = EASE_OUT(second);
  if (t < EV.give) {
    const rw = EASE(clamp01((t - EV.rewind) / 0.35));
    return { o: first, dx: 0, dy: -60 * rw, s: 0.92 + 0.08 * EASE_OUT(clamp01((t - EV.sheet) / 0.35)), blur: rw * 10 };
  }
  const cx = SH.x + SH.w / 2;
  const cy = SH.y + SH.h / 2;
  return { o: clamp01(second * 3), dx: (dx - cx) * (1 - q), dy: (dy - cy) * (1 - q), s: 0.15 + 0.85 * q, blur: 0 };
};

const Check: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: "absolute", inset: 0 }}>
    <path d="M5 12.5 L10 17 L19 7" fill="none" stroke={C.ink} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Sheet: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  if (t < EV.sheet || t > EV.shatter) return null;
  const pose = sheetPose(t, cam);
  if (pose.o <= 0) return null;
  const sc = score(t);
  const line = EASE_OUT(clamp01((t - EV.line) / 0.45)) * (1 - clamp01((t - EV.demo) / 0.3));
  const glass = clamp01((t - EV.demo) / 0.35);
  const midY = ROW0 + 5 * ROW_H - 4;
  return (
    <div style={{
      position: "absolute", inset: 0, opacity: pose.o, filter: pose.blur > 0.2 ? `blur(${pose.blur}px)` : undefined,
      translate: `${pose.dx}px ${pose.dy}px`, scale: String(pose.s * (1 + 0.03 * glass)), transformOrigin: `${SH.x + SH.w / 2}px ${SH.y + SH.h / 2}px`,
    }}>
      <div style={{
        position: "absolute", left: SH.x, top: SH.y, width: SH.w, height: SH.h, borderRadius: 14, background: C.cream,
        boxShadow: "0 24px 60px rgba(0,0,0,0.6)", rotate: `${-1.5 + Math.sin(t * 0.9) * 1.2}deg`, translate: `0px ${Math.sin(t * 1.3) * 7}px`,
      }}>
        <div style={{ position: "absolute", left: 22, top: 18, fontFamily: MONO, fontWeight: 700, fontSize: 19, letterSpacing: 4, color: C.ink }}>QUÍMICA</div>
        <div style={{ position: "absolute", left: 22, top: 44, width: SH.w - 44, height: 2, background: "rgba(20,17,15,0.2)" }} />
        {Array.from({ length: 10 }, (_, i) => {
          const b = boxAt(i, t);
          const y = ROW0 - SH.y + i * ROW_H;
          // falling ghosts while a box goes out
          const offRank = TL.offOrder.indexOf(i);
          const fall = offRank >= 0 ? (t - EV.off0 - offRank * EV.offStep) / 0.5 : -1;
          return (
            <React.Fragment key={i}>
              <div style={{ position: "absolute", left: 22, top: y + 6, width: 30, fontFamily: MONO, fontWeight: 700, fontSize: 17, color: "rgba(20,17,15,0.55)" }}>{i + 1}</div>
              <div style={{ position: "absolute", left: 56, top: y + 10, width: 100 - (i % 3) * 18, height: 6, borderRadius: 3, background: "rgba(20,17,15,0.16)" }} />
              <div style={{ position: "absolute", left: 56, top: y + 22, width: 70 + (i % 2) * 22, height: 6, borderRadius: 3, background: "rgba(20,17,15,0.1)" }} />
              {fall > 0 && fall < 1 && [0.15, 0.3, 0.45].map((lag, g) => (
                <div key={g} style={{
                  position: "absolute", left: BOX_X - SH.x, top: y + 2 + (fall - lag) * 40, width: BOX, height: BOX, borderRadius: 6,
                  background: C.orange, opacity: Math.max(0, (1 - fall) * (0.5 - lag)), filter: "blur(3px)",
                }} />
              ))}
              <div style={{
                position: "absolute", left: BOX_X - SH.x, top: y + 2, width: BOX, height: BOX, borderRadius: 6, boxSizing: "border-box",
                border: `2.5px solid rgba(20,17,15,${0.35 * (1 - b.on) * (1 - 0.5 * b.dim)})`,
                background: b.on > 0 ? `rgba(255,107,26,${b.on * b.blink})` : `rgba(20,17,15,${0.1 * b.dim})`,
                boxShadow: b.on > 0.5 ? `0 0 ${16 * b.blink}px rgba(255,107,26,${0.85 * b.blink})` : "none",
              }}>
                {b.on > 0.6 && <div style={{ opacity: b.blink }}><Check size={BOX - 5} /></div>}
              </div>
            </React.Fragment>
          );
        })}
        {/* score gauge: ten cells filling from the bottom */}
        {Array.from({ length: 10 }, (_, k) => {
          const fill = clamp01(sc - k);
          return (
            <div key={`g${k}`} style={{
              position: "absolute", left: GAUGE_X - SH.x, top: ROW0 - SH.y + (9 - k) * ROW_H + 4, width: 18, height: ROW_H - 10, borderRadius: 4,
              background: fill > 0 ? `rgba(255,107,26,${0.25 + 0.75 * fill})` : "rgba(20,17,15,0.1)",
            }} />
          );
        })}
        {/* the 50 % threshold across the sheet */}
        {line > 0 && (
          <>
            <div style={{
              position: "absolute", left: 10, top: midY - SH.y, width: (SH.w - 20) * line, height: 5, borderRadius: 3, background: C.orange,
              boxShadow: "0 0 14px rgba(255,107,26,0.9)",
            }} />
            <div style={{ position: "absolute", left: SH.w - 92, top: midY - SH.y - 34, opacity: clamp01(line * 2 - 1), fontFamily: MONO, fontWeight: 700, fontSize: 20, color: C.orange }}>50 %</div>
          </>
        )}
        <div style={{ position: "absolute", left: 22, bottom: 16, fontFamily: MONO, fontWeight: 700, fontSize: 15, letterSpacing: 3, color: "rgba(20,17,15,0.45)" }}>HAZLO LO MEJOR POSIBLE</div>
      </div>
      {/* E10: the glass case */}
      {glass > 0 && (
        <div style={{
          position: "absolute", left: SH.x - 18, top: SH.y - 18, width: SH.w + 36, height: SH.h + 36, borderRadius: 22, opacity: glass,
          border: "3px solid rgba(255,244,236,0.75)", background: "linear-gradient(135deg, rgba(255,244,236,0.22) 0%, rgba(255,244,236,0.02) 35%, rgba(255,244,236,0.0) 60%, rgba(255,244,236,0.12) 100%)",
          boxShadow: "0 0 40px rgba(255,107,26,0.35), inset 0 0 30px rgba(255,244,236,0.12)",
        }} />
      )}
    </div>
  );
};

/** E10: the showcase breaks into shards. */
const Shards: React.FC<{ t: number }> = ({ t }) => {
  const q = (t - EV.shatter) / 1.3;
  if (q < 0 || q > 1) return null;
  const cols = 5;
  const rows = 8;
  const cw = (SH.w + 36) / cols;
  const ch = (SH.h + 36) / rows;
  const cx = SH.x + SH.w / 2;
  const cy = SH.y + SH.h / 2;
  const out: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (let k = 0; k < 2; k++) {
        const id = (r * cols + c) * 2 + k;
        const x0 = SH.x - 18 + c * cw;
        const y0 = SH.y - 18 + r * ch;
        const pts = k === 0 ? [[x0, y0], [x0 + cw, y0], [x0, y0 + ch]] : [[x0 + cw, y0], [x0 + cw, y0 + ch], [x0, y0 + ch]];
        const mx = (pts[0][0] + pts[1][0] + pts[2][0]) / 3;
        const my = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
        const dx = mx - cx + (rand(id) - 0.5) * 60;
        const dy = Math.max(-50, my - cy + (rand(id + 50) - 0.5) * 60);
        const e = EASE_OUT(q);
        const tx = dx * 1.4 * e;
        const ty = dy * 1.4 * e + 260 * q * q;
        const rot = (rand(id + 9) - 0.5) * 300 * e;
        const lit = rand(id + 21) < 0.3;
        out.push(
          <polygon key={id} points={pts.map(([x, y]) => `${x},${y}`).join(" ")} fill={lit ? C.orange : C.cream} fillOpacity={lit ? 0.9 : 0.85}
            stroke="rgba(255,244,236,0.9)" strokeWidth={1.5} opacity={1 - q}
            transform={`translate(${tx} ${ty}) rotate(${rot} ${mx} ${my})`} />,
        );
      }
    }
  }
  return <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>{out}</svg>;
};

/** E3: a cream hand of light hands the sheet over. */
const Hand: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const o = windowed(t, EV.hand, EV.give + 0.7, 0.25, 0.4);
  if (o <= 0) return null;
  const [dx, dy] = project([STUDENT_DESK[0], STUDENT_DESK[1] + 0.8, STUDENT_DESK[2]], cam);
  const inQ = EASE_OUT(clamp01((t - EV.hand) / (EV.give - EV.hand)));
  const outQ = EASE(clamp01((t - EV.give - 0.15) / 0.5));
  const x = lerp(dx + 260, dx + 40, inQ) + 200 * outQ;
  const y = lerp(dy - 330, dy - 70, inQ) - 260 * outQ;
  const holding = t < EV.give;
  return (
    <div style={{ position: "absolute", left: x - 70, top: y - 70, width: 140, height: 140, opacity: o, filter: "drop-shadow(0 0 18px rgba(255,244,236,0.55))" }}>
      <svg width={140} height={140} viewBox="0 0 140 140">
        {holding && <rect x={8} y={58} width={58} height={74} rx={6} fill={C.cream} stroke={C.ink} strokeWidth={3} transform="rotate(-12 37 95)" />}
        <path d="M60 100 C48 92 40 80 44 70 C47 63 55 64 60 70 L66 78 L66 36 C66 29 76 29 76 36 L76 62 L78 28 C78 21 88 21 88 28 L88 62 L92 32 C92 25 102 25 102 32 L101 64 L106 44 C107 38 116 39 115 46 L110 86 C108 102 98 114 82 114 C72 114 66 108 60 100 Z"
          fill={C.cream} />
      </svg>
    </div>
  );
};

/** E2/E8: the lab tag on the frame. */
const LabTag: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const o = Math.max(windowed(t, EV.tag - 0.1, S.E3 + 0.2, 0.3, 0.3), windowed(t, EV.relight, S.E9 + 0.1, 0.3, 0.3));
  if (o <= 0) return null;
  const a = H + FRAME_PAD;
  const [x, y] = project([-a, FRAME_TOP, -a], cam);
  const s = springAt(t, t < S.E8 ? EV.tag - 0.1 : EV.relight, 12, 200);
  return (
    <div style={{
      position: "absolute", left: x, top: y + 16, translate: "-50% 0", opacity: o, scale: String(0.8 + 0.2 * s), whiteSpace: "nowrap",
      padding: "10px 20px", borderRadius: 999, border: `2px solid ${C.cream}`, background: "rgba(20,17,15,0.85)",
    }}>
      <Micro size={20} color={C.cream}>ENTORNO DE PRUEBA</Micro>
    </div>
  );
};

/** E7: hollow thought bubble with a mask. */
const Thought: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const o = windowed(t, EV.think, S.E8 + 0.1, 0.3, 0.35);
  if (o <= 0) return null;
  const st = studentAt(t);
  const [sx, sy] = project([st.p[0], st.p[1] + 0.75, st.p[2]], cam);
  const s = springAt(t, EV.think, 11, 180);
  const m = springAt(t, EV.mask, 10, 220);
  const bx = sx - 20;
  const by = sy - 250 + Math.sin(t * 2) * 5;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o, overflow: "visible" }}>
      <circle cx={sx + 6} cy={sy - 70} r={8 * s} fill="none" stroke={C.cream} strokeWidth={3} />
      <circle cx={sx - 4} cy={sy - 115} r={13 * s} fill="none" stroke={C.cream} strokeWidth={3} />
      <ellipse cx={bx} cy={by} rx={125 * s} ry={82 * s} fill="rgba(255,244,236,0.05)" stroke={C.cream} strokeWidth={4} strokeDasharray="14 9" />
      {m > 0 && (
        <g transform={`translate(${bx} ${by}) scale(${m * 1.6})`}>
          <path d="M-34 -14 C-20 -22 -8 -16 0 -10 C8 -16 20 -22 34 -14 C34 4 24 16 12 16 C4 16 2 8 0 6 C-2 8 -4 16 -12 16 C-24 16 -34 4 -34 -14 Z" fill={C.cream} />
          <ellipse cx={-14} cy={-2} rx={7} ry={5} fill={C.ink} />
          <ellipse cx={14} cy={-2} rx={7} ry={5} fill={C.ink} />
        </g>
      )}
    </svg>
  );
};

/** E9: a watching lens-eye; it scans the Student. */
const Eye: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const o = windowed(t, EV.eye - 0.1, S.E10 + 0.1, 0.3, 0.35);
  if (o <= 0) return null;
  const st = studentAt(t);
  const [sx, sy] = project(st.p, cam);
  const s = springAt(t, EV.eye - 0.1, 12, 160);
  const ex = 820;
  const ey = 690 + Math.sin(t * 1.3) * 8;
  const ang = Math.atan2(sy - ey, sx - ex);
  const px = ex + Math.cos(ang) * 16;
  const py = ey + Math.sin(ang) * 10;
  const blink = Math.abs(Math.sin((t - EV.eye) * 1.1)) > 0.985 ? 0.15 : 1;
  const W = 120 * s;
  const Hh = 62 * s * blink;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o }}>
      <defs>
        <linearGradient id="beam" x1={ex} y1={ey} x2={sx} y2={sy} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(255,244,236,0.28)" />
          <stop offset="100%" stopColor="rgba(255,244,236,0.02)" />
        </linearGradient>
      </defs>
      <polygon points={`${ex},${ey} ${sx - 90},${sy + 40} ${sx + 90},${sy - 20}`} fill="url(#beam)" />
      <path d={`M ${ex - W} ${ey} Q ${ex} ${ey - Hh * 1.6} ${ex + W} ${ey} Q ${ex} ${ey + Hh * 1.6} ${ex - W} ${ey} Z`} fill="rgba(20,17,15,0.85)" stroke={C.cream} strokeWidth={5}
        style={{ filter: "drop-shadow(0 0 14px rgba(255,244,236,0.5))" }} />
      <circle cx={px} cy={py} r={34 * s * Math.min(1, blink * 2)} fill="none" stroke={C.cream} strokeWidth={5} />
      <circle cx={px} cy={py} r={13 * s * Math.min(1, blink * 2)} fill={C.cream} />
    </svg>
  );
};

/** E8: the gate dissolves into particles. */
const GateDust: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const q = (t - EV.vanish) / 1.3;
  if (q < 0 || q > 1) return null;
  const [gx, gy] = project([GATE[0], GATE[1] + GATE_H / 2, GATE[2]], cam);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 60 }, (_, i) => {
        const x0 = gx + (rand(i + 1) - 0.5) * 150;
        const y0 = gy + (rand(i + 2) - 0.5) * 200;
        const a = rand(i + 3) * Math.PI * 2;
        const d = (20 + rand(i + 4) * 90) * EASE_OUT(q);
        return <circle key={i} cx={x0 + Math.cos(a) * d} cy={y0 + Math.sin(a) * d - 80 * q * rand(i + 5)} r={1.5 + rand(i + 6) * 3.5} fill={i % 3 ? C.cream : C.orange} opacity={(1 - q) * 0.9} />;
      })}
    </svg>
  );
};

/** E11: the review lens passes over the real cases and ticks them. */
const Review: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const o = windowed(t, EV.review - 0.15, S.E12 + 0.1, 0.3, 0.35);
  if (o <= 0) return null;
  const pts = CASES.map((_, k) => {
    const c = caseAt(k, t);
    return project([c.p[0], c.p[1] + 0.5, c.p[2]] as V3, cam);
  });
  const sweep = clamp01((t - EV.review) / 1.2);
  const seq = [3, 0, 1, 2];
  const pos = sweep * (seq.length - 1);
  const i0 = Math.floor(pos);
  const i1 = Math.min(seq.length - 1, i0 + 1);
  const f = EASE(pos - i0);
  const lx = lerp(pts[seq[i0]][0], pts[seq[i1]][0], f);
  const ly = lerp(pts[seq[i0]][1], pts[seq[i1]][1], f) - 10;
  const s = springAt(t, EV.review - 0.15, 12, 150);
  const R = 95 * s;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={lx + R * 0.72} y1={ly + R * 0.72} x2={lx + R * 1.3} y2={ly + R * 1.3} stroke={C.cream} strokeWidth={13} strokeLinecap="round" />
        <circle cx={lx} cy={ly} r={R} fill="rgba(255,244,236,0.08)" stroke={C.cream} strokeWidth={6} style={{ filter: "drop-shadow(0 0 12px rgba(255,244,236,0.45))" }} />
      </svg>
      {seq.map((k, j) => {
        const c = springAt(t, EV.review + 0.35 + j * 0.22, 11, 220);
        if (c <= 0) return null;
        const [x, y] = pts[k];
        return (
          <div key={k} style={{
            position: "absolute", left: x - 22, top: y - 74, width: 44, height: 44, borderRadius: 22, background: C.cream, border: `3px solid ${C.ink}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontFamily: UI, fontWeight: 700, fontSize: 26, color: C.ink, scale: String(c),
            boxShadow: "0 0 16px rgba(255,244,236,0.6)",
          }}>✓</div>
        );
      })}
    </div>
  );
};

export const Hud: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => (
  <>
    <LabTag t={t} cam={cam} />
    <GateDust t={t} cam={cam} />
    <Eye t={t} cam={cam} />
    <Thought t={t} cam={cam} />
    <Review t={t} cam={cam} />
    <Sheet t={t} cam={cam} />
    <Shards t={t} />
    <Hand t={t} cam={cam} />
  </>
);
