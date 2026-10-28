import React from "react";
import { C, EASE, EASE_OUT, EV, MONO, S, SANS, clamp01, rise, windowed } from "../theme";
import { GHOSTS, ghostLabelPos, ghostScreen } from "./Shop";
import { PHONE } from "./Phone";
import { Logo } from "./Logo";

const Check: React.FC<{ size: number; p: number; draw?: number }> = ({ size, p, draw = 1 }) => (
  <div style={{
    width: size, height: size, borderRadius: size / 2, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
    background: p > 0.5 ? C.orange : "transparent", border: `3px solid ${p > 0.5 ? C.orange : "#4A403A"}`, boxSizing: "border-box",
    boxShadow: p > 0.5 ? `0 0 ${26 * p}px rgba(255,107,26,0.8)` : "none", transform: `scale(${1 + 0.25 * Math.sin(clamp01(p) * Math.PI)})`,
  }}>
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" style={{ opacity: p > 0.5 ? 1 : 0 }}>
      <path d="M5 12.5 L10 17 L19 7.5" stroke={C.ink} strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="24" strokeDashoffset={24 * (1 - draw)} />
    </svg>
  </div>
);

// ── E4: a mono tag over each copy of the assistant ─────────────────────
export const GhostLabels: React.FC<{ t: number }> = ({ t }) => {
  if (t < EV.ghostLabels - 0.1 || t > EV.ghostLabelsOut + 0.4) return null;
  return (
    <>
      {GHOSTS.map((g, i) => {
        const p = windowed(t, EV.ghostLabels + i * 0.15, EV.ghostLabelsOut, 0.3, 0.3);
        const [x, y] = ghostLabelPos(t, i);
        return (
          <div key={g.id} style={{
            position: "absolute", left: x - 120, width: 240, top: y - 44 - (1 - p) * 14, opacity: p, display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <div style={{
              fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: "0.16em", color: C.ink, background: C.orange,
              borderRadius: 8, padding: "5px 10px 5px 14px", boxShadow: "0 0 22px rgba(255,107,26,0.7)",
            }}>
              {g.label}
            </div>
            <div style={{ width: 2, height: 14, background: C.orangeHi }} />
          </div>
        );
      })}
    </>
  );
};

// ── E5: tasks that complete one by one ──────────────────────────────────
const TASKS = ["Responde WhatsApp", "Confirma cita", "Envía recordatorio", "Avisa de cambios"];
export const Tasks: React.FC<{ t: number }> = ({ t }) => {
  if (t < EV.tag[0] - 0.1 || t > EV.tagsOut + 0.5) return null;
  const out = EASE(clamp01((t - EV.tagsOut) / 0.4));
  return (
    <div style={{
      position: "absolute", left: 40, right: 40, top: 352, display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 16, columnGap: 18, opacity: 1 - out,
    }}>
      {TASKS.map((tx, i) => {
        const a = EV.tag[i];
        const p = rise(t, a, 0.35);
        const n = Math.round(tx.length * clamp01((t - a - 0.1) / 0.45));
        const c = clamp01((t - EV.check[i]) / 0.3);
        const done = c > 0.5;
        const bob = Math.sin(t * 1.7 + i * 1.3) * 4;
        return (
          <div key={i} style={{
            opacity: p, transform: `translateY(${(1 - p) * 20 + bob}px) scale(${0.92 + 0.08 * p})`, justifySelf: i % 2 ? "start" : "end",
            display: "flex", alignItems: "center", gap: 14, padding: "12px 14px 12px 20px", borderRadius: 999,
            background: done ? "rgba(26,12,4,0.92)" : "rgba(14,12,11,0.9)", border: `2.5px solid ${done ? C.orange : "#3A322C"}`,
            boxShadow: done ? "0 0 30px rgba(255,107,26,0.5)" : "0 12px 30px rgba(0,0,0,0.6)",
          }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 27, letterSpacing: "-0.01em", color: done ? "#FFE6CF" : C.white, whiteSpace: "nowrap" }}>
              {tx.slice(0, n)}
              <span style={{ opacity: 0 }}>{tx.slice(n)}</span>
            </div>
            <Check size={38} p={c} draw={clamp01((t - EV.check[i] - 0.05) / 0.3)} />
          </div>
        );
      })}
    </div>
  );
};

const bez = (k: number, a: number, b: number, c: number, d: number) =>
  (1 - k) ** 3 * a + 3 * (1 - k) ** 2 * k * b + 3 * (1 - k) * k * k * c + k ** 3 * d;

// ── E5: light line from the "móvil" copy to the phone ───────────────────
export const PhoneLink: React.FC<{ t: number }> = ({ t }) => {
  const draw = clamp01((t - (EV.msgIn - 0.2)) / 0.5);
  const vis = 1 - EASE(clamp01((t - (EV.phone[1][1] - 0.3)) / 0.3));
  if (draw <= 0 || vis <= 0) return null;
  const [gx, gy] = ghostScreen(t, 2, 1.0);
  const sx = PHONE.x + 2;
  const sy = PHONE.y + 150;
  const d = `M${gx} ${gy} C ${gx + 30} ${gy + 90}, ${sx - 60} ${sy - 40}, ${sx} ${sy}`;
  const len = 360;
  const k = (t * 1.1) % 1;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <path d={d} fill="none" stroke={C.orange} strokeWidth={10} opacity={0.35 * vis} style={{ filter: "blur(6px)" }} strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
      <path d={d} fill="none" stroke={C.orangeHi} strokeWidth={3} opacity={vis} strokeDasharray={len} strokeDashoffset={len * (1 - draw)} strokeLinecap="round" />
      {draw >= 1 && <circle cx={bez(k, gx, gx + 30, sx - 60, sx)} cy={bez(k, gy, gy + 90, sy - 40, sy)} r={5} fill="#FFF3E0" opacity={vis} />}
    </svg>
  );
};

// ── E6: employee vs assistant cards, one on each side of the shop ──────
const CardRows: React.FC<{ rows: string[]; t: number; a: number; color: string; check?: boolean }> = ({ rows, t, a, color, check }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
    {rows.map((r, i) => {
      const p = rise(t, a + 0.35 + i * 0.22, 0.3);
      return (
        <div key={i} style={{
          opacity: p, transform: `translateX(${(1 - p) * -14}px)`, display: "flex", alignItems: "center", gap: 10,
          fontFamily: MONO, fontWeight: 700, fontSize: 25, letterSpacing: "0.06em", color, whiteSpace: "nowrap",
        }}>
          {check ? (
            <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path d="M4 12.5 L10 18 L20 6.5" stroke={color} strokeWidth="3.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <div style={{ width: 20, display: "flex", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: color }} />
            </div>
          )}
          {r}
        </div>
      );
    })}
  </div>
);
export const Cards: React.FC<{ t: number }> = ({ t }) => {
  if (t < EV.cardRed - 0.1 || t > EV.cardsOut + 0.5) return null;
  const out = EASE(clamp01((t - EV.cardsOut) / 0.4));
  const pr = rise(t, EV.cardRed, 0.45);
  const po = rise(t, EV.cardOrange, 0.45);
  const off = EASE(clamp01((t - EV.redOff) / 0.45));
  const on = EASE_OUT(clamp01((t - EV.orangeOn) / 0.4));
  const flash = windowed(t, EV.orangeOn, EV.orangeOn + 0.7, 0.08, 0.5);
  const top = 1150;
  return (
    <>
      {/* dark red: flat, matte, then switched off */}
      <div style={{
        position: "absolute", left: 36, width: 372, top: top + (1 - pr) * 40 + off * 10, opacity: pr * (1 - out) * (1 - 0.6 * off),
        padding: "22px 22px 24px", borderRadius: 22, background: C.red0, border: `3px solid ${C.red2}`, boxSizing: "border-box",
        filter: `saturate(${1 - 0.6 * off}) brightness(${1 - 0.35 * off})`, transform: `scale(${1 - 0.04 * off})`,
      }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 34, letterSpacing: "0.12em", color: C.white }}>EMPLEADO</div>
        <div style={{ height: 2, background: C.red2, marginTop: 12 }} />
        <CardRows rows={["8 H", "VACACIONES", "BAJAS", "NÓMINA"]} t={t} a={EV.cardRed} color="#F2D6D0" />
      </div>
      {/* orange: lit, and it lights up for real when the red one goes out */}
      <div style={{
        position: "absolute", left: 672, width: 372, top: top + (1 - po) * 40, opacity: po * (1 - out),
        padding: "22px 22px 24px", borderRadius: 22, boxSizing: "border-box",
        background: on > 0 ? `rgba(255,107,26,${0.12 + 0.88 * on})` : "rgba(26,12,4,0.92)", border: `3px solid ${C.orange}`,
        boxShadow: `0 0 ${24 + 70 * on + 60 * flash}px rgba(255,107,26,${0.45 + 0.45 * on})`, transform: `scale(${1 + 0.05 * on - 0.02 * (1 - po)})`,
      }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 34, letterSpacing: "0.12em", color: on > 0.5 ? C.ink : C.orange }}>ASISTENTE</div>
        <div style={{ height: 2, background: on > 0.5 ? C.ink : C.orange, marginTop: 12 }} />
        <CardRows check rows={["24 H", "SIN BAJAS", "SIEMPRE CONTESTA"]} t={t} a={EV.cardOrange} color={on > 0.5 ? C.ink : C.orangeHi} />
      </div>
    </>
  );
};

// ── E7: counters ──────────────────────────────────────────────────────
export const Counters: React.FC<{ t: number }> = ({ t }) => {
  const out = 1 - EASE(clamp01((t - (S.E8 - 0.3)) / 0.3));
  if (t < EV.counters[0] - 0.05 || out <= 0) return null;
  const hours = Math.round(10 * clamp01((t - EV.counters[0]) / 0.8));
  const rows = [`-${hours} H / SEMANA`, "0 MENSAJES SIN RESPONDER"];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 420 + Math.sin(t * 1.6) * 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: out }}>
      {rows.map((r, i) => {
        const p = rise(t, EV.counters[i], 0.35);
        return (
          <div key={i} style={{
            opacity: p, transform: `translateY(${(1 - p) * 22}px) scale(${0.9 + 0.1 * p})`, padding: i === 0 ? "10px 30px" : "8px 24px",
            borderRadius: 999, background: "rgba(26,12,4,0.9)", border: `2.5px solid ${C.orange}`, boxShadow: "0 0 30px rgba(255,107,26,0.55)",
            fontFamily: MONO, fontWeight: 700, fontSize: i === 0 ? 44 : 30, letterSpacing: "0.08em", color: C.orange, whiteSpace: "nowrap",
          }}>
            {r}
          </div>
        );
      })}
    </div>
  );
};

// ── E8: Instagram-style comment bar (generic avatar, no logo, no account name) ──
export const CommentBar: React.FC<{ t: number }> = ({ t }) => {
  const p = rise(t, EV.bar, 0.5);
  const out = 1 - clamp01((t - S.E9) / 0.4);
  if (p <= 0 || out <= 0) return null;
  const word = "AUDITORIA";
  const n = Math.round(word.length * clamp01((t - EV.typeStart) / (EV.typeEnd - EV.typeStart)));
  const typed = word.slice(0, n);
  const caret = Math.floor(t * 2.4) % 2 === 0 || (t > EV.typeStart && t < EV.typeEnd);
  const done = n === word.length;
  return (
    <div style={{
      position: "absolute", left: 56, right: 56, top: 1395 + (1 - p) * 260, opacity: p * out, display: "flex", alignItems: "center", gap: 18,
    }}>
      <div style={{ width: 76, height: 76, borderRadius: 38, background: "#2A2420", flexShrink: 0, overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", left: 26, top: 14, width: 24, height: 24, borderRadius: 12, background: C.cream }} />
        <div style={{ position: "absolute", left: 14, top: 42, width: 48, height: 44, borderRadius: 22, background: C.cream }} />
      </div>
      <div style={{
        flex: 1, height: 82, borderRadius: 41, background: "#16130F", border: `2px solid ${done ? C.orange : "#3A332D"}`, display: "flex", alignItems: "center",
        padding: "0 28px", gap: 14, boxShadow: done ? "0 0 34px rgba(255,107,26,0.45)" : "0 10px 30px rgba(0,0,0,0.6)",
      }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", fontFamily: SANS, fontWeight: 700, fontSize: 34, color: C.white, letterSpacing: "0.02em" }}>
          {typed ? <span>{typed}</span> : <span style={{ color: "#857B73", fontWeight: 500, fontSize: 30, letterSpacing: 0 }}>Añade un comentario…</span>}
          <span style={{ width: 3, height: 40, marginLeft: 3, background: C.orange, opacity: caret ? 1 : 0 }} />
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, color: done ? C.orange : "#5A524C" }}>Publicar</div>
      </div>
    </div>
  );
};

// ── E9: fade to #14110F with the logo and the handle ───────────────────
export const Outro: React.FC<{ t: number }> = ({ t }) => {
  const p = EASE(clamp01((t - S.E9) / 0.5));
  if (p <= 0) return null;
  const q = rise(t, S.E9 + 0.45, 0.6);
  const h = rise(t, S.E9 + 0.85, 0.5);
  return (
    <div style={{ position: "absolute", inset: 0, background: C.ink, opacity: p, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 34 }}>
      <div style={{ opacity: q, transform: `scale(${0.88 + 0.12 * q})`, marginTop: -60 }}>
        <Logo size={420} />
      </div>
      <div style={{
        opacity: h, transform: `translateY(${(1 - h) * 18}px)`, fontFamily: SANS, fontWeight: 800, fontSize: 66, letterSpacing: "-0.01em", color: C.orange,
      }}>
        @aigencyx.labs
      </div>
    </div>
  );
};
