import React from "react";
import { C, COND, EASE, EV, MONO, S, clamp01, rise, windowed } from "../theme";
import { CORE_PT } from "./Shop";
import { PHONE } from "./Phone";
import { Logo } from "./Logo";

// ── E6: floating list over the shop, each line lights up as it is said ───
const ITEMS = ["RESPONDER MENSAJES", "CONFIRMAR CITAS Y PEDIDOS", "ENVIAR RECORDATORIOS", "AVISAR DE CAMBIOS"];
export const ListPanel: React.FC<{ t: number }> = ({ t }) => {
  const p = Math.min(rise(t, S.E6 - 0.05, 0.4), 1 - EASE(clamp01((t - EV.listOut + 0.25) / 0.3)));
  if (p <= 0) return null;
  return (
    <div style={{
      position: "absolute", left: 150, width: 780, top: 400 + (1 - p) * 30 + Math.sin(t * 1.4) * 4, opacity: p, padding: "22px 30px",
      background: "rgba(8,8,9,0.82)", border: "1.5px solid #2C2C2E", borderRadius: 18, boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
      display: "flex", flexDirection: "column", gap: 14,
    }}>
      {ITEMS.map((it, i) => {
        const on = rise(t, EV.list[i] - 0.05, 0.25);
        const appear = rise(t, S.E6 + 0.1 + i * 0.08, 0.3);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, opacity: appear }}>
            <div style={{
              width: 38, height: 38, borderRadius: 8, border: `3px solid ${on > 0.5 ? C.orange : C.grey2}`, background: on > 0.5 ? C.orange : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center", boxShadow: on > 0.5 ? "0 0 22px rgba(255,122,0,0.6)" : "none", flexShrink: 0,
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" style={{ opacity: on }}>
                <path d="M5 12.5 L10 17 L19 7.5" stroke={C.ink} strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{
              fontFamily: MONO, fontWeight: 700, fontSize: 33, letterSpacing: "0.06em", color: on > 0.5 ? C.orange : C.grey2,
              textShadow: on > 0.5 ? "0 0 18px rgba(255,122,0,0.45)" : "none", transform: `translateX(${on * 6}px)`,
            }}>
              {it}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── E7-E9: floating grey "WEB" sign with a shop-window icon ─────────────
export const WebSign: React.FC<{ t: number }> = ({ t }) => {
  const p = Math.min(rise(t, EV.web, 0.45), 1 - EASE(clamp01((t - EV.webOut) / 0.35)));
  if (p <= 0) return null;
  const bob = Math.sin(t * 1.8) * 5;
  return (
    <div style={{
      position: "absolute", left: 540 - 150, width: 300, top: 614 + bob + (1 - p) * 40, opacity: p, transform: `scale(${0.85 + 0.15 * p})`,
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 18, padding: "14px 26px", borderRadius: 16, background: "#3A3A3A",
        border: `3px solid ${C.grey2}`, boxShadow: "0 18px 40px rgba(0,0,0,0.6)",
      }}>
        <svg width="54" height="54" viewBox="0 0 48 48">
          <path d="M6 18 L10 8 H38 L42 18 Z" fill="#8A8A8A" />
          <path d="M6 18 q4.5 5 9 0 q4.5 5 9 0 q4.5 5 9 0 q4.5 5 9 0" fill="#6E6E6E" />
          <rect x="9" y="22" width="30" height="18" fill="none" stroke="#8A8A8A" strokeWidth="3" />
          <rect x="13" y="26" width="13" height="10" fill="#6E6E6E" />
        </svg>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 46, letterSpacing: "0.12em", color: "#E6E6E6" }}>WEB</div>
      </div>
      {/* thin hanger towards the shop */}
      <div style={{ width: 3, height: 34, background: "#3A3A3A" }} />
    </div>
  );
};

// ── E12: counters ──────────────────────────────────────────────────────
export const Counters: React.FC<{ t: number }> = ({ t }) => {
  const out = 1 - EASE(clamp01((t - (S.E13 - 0.25)) / 0.3));
  if (t < EV.counters[0] - 0.05 || out <= 0) return null;
  const hours = Math.round(10 * clamp01((t - EV.counters[0]) / 0.7));
  const rows = [`-${hours} H / SEMANA`, "0 LLAMADAS PERDIDAS", "TODO CONFIRMADO SOLO"];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 504 + Math.sin(t * 1.6) * 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: out }}>
      {rows.map((r, i) => {
        const p = rise(t, EV.counters[i], 0.35);
        return (
          <div key={i} style={{
            opacity: p, transform: `translateY(${(1 - p) * 22}px) scale(${0.9 + 0.1 * p})`, padding: i === 0 ? "10px 30px" : "8px 24px",
            borderRadius: 999, background: "rgba(12,6,0,0.88)", border: `2.5px solid ${C.orange}`, boxShadow: "0 0 28px rgba(255,122,0,0.45)",
            fontFamily: MONO, fontWeight: 700, fontSize: i === 0 ? 46 : 32, letterSpacing: "0.08em", color: C.orange,
          }}>
            {r}
          </div>
        );
      })}
    </div>
  );
};

const bez = (k: number, a: number, b: number, c: number, d: number) =>
  (1 - k) ** 3 * a + 3 * (1 - k) ** 2 * k * b + 3 * (1 - k) * k * k * c + k ** 3 * d;

// ── E5: the light line from the phone to the counter ──────────────────
export const PhoneLine: React.FC<{ t: number }> = ({ t }) => {
  const draw = clamp01((t - EV.line) / 0.55);
  const vis = 1 - EASE(clamp01((t - EV.phoneOut[0] + 0.15) / 0.3));
  if (draw <= 0 || vis <= 0) return null;
  const [cx, cy] = CORE_PT();
  const sx = PHONE.x + 4;
  const sy = PHONE.y + 300;
  const d = `M${sx} ${sy} C ${sx - 120} ${sy - 10}, ${cx + 60} ${cy + 140}, ${cx} ${cy}`;
  const len = 700;
  const k = (t * 0.9) % 1;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <path d={d} fill="none" stroke={C.orange} strokeWidth={10} opacity={0.35 * vis} style={{ filter: "blur(6px)" }}
        strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
      <path d={d} fill="none" stroke={C.orangeHi} strokeWidth={3.5} opacity={vis} strokeDasharray={len} strokeDashoffset={len * (1 - draw)} strokeLinecap="round" />
      {draw >= 1 && <circle cx={bez(k, sx, sx - 120, cx + 60, cx)} cy={bez(k, sy, sy - 10, cy + 140, cy)} r={6} fill="#FFF3E0" opacity={vis} />}
      <circle cx={cx} cy={cy} r={10 + 6 * Math.sin(t * 6)} fill={C.orange} opacity={0.5 * vis * draw} style={{ filter: "blur(4px)" }} />
    </svg>
  );
};

// ── generic Instagram glyph (only next to @aigencyx.labs) ───────────────
export const IgGlyph: React.FC<{ size: number; color?: string }> = ({ size, color = C.white }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke={color} strokeWidth="2" />
    <circle cx="12" cy="12" r="4.4" stroke={color} strokeWidth="2" />
    <circle cx="17.4" cy="6.6" r="1.3" fill={color} />
  </svg>
);

// ── E13: Instagram-style comment bar ───────────────────────────────────
export const CommentBar: React.FC<{ t: number }> = ({ t }) => {
  const p = rise(t, EV.bar, 0.45);
  const out = 1 - clamp01((t - S.OUTRO) / 0.4);
  if (p <= 0 || out <= 0) return null;
  const word = "AUDITORIA";
  const n = Math.round(word.length * clamp01((t - EV.typeStart) / (EV.typeEnd - EV.typeStart)));
  const typed = word.slice(0, n);
  const caret = Math.floor(t * 2.4) % 2 === 0 || (t > EV.typeStart && t < EV.typeEnd);
  const done = n === word.length;
  return (
    <div style={{
      position: "absolute", left: 60, right: 60, top: 1395 + (1 - p) * 120, opacity: p * out, display: "flex", alignItems: "center", gap: 18,
    }}>
      <div style={{ width: 76, height: 76, borderRadius: 38, padding: 3, background: `conic-gradient(${C.orange}, ${C.orangeHi}, ${C.orange})`, flexShrink: 0 }}>
        <div style={{ borderRadius: "50%", padding: 3, background: "#111" }}>
          <Logo size={64} />
        </div>
      </div>
      <div style={{
        flex: 1, height: 82, borderRadius: 41, background: "#141416", border: `2px solid ${done ? C.orange : "#3A3A3E"}`, display: "flex", alignItems: "center",
        padding: "0 28px", gap: 14, boxShadow: done ? "0 0 30px rgba(255,122,0,0.35)" : "0 10px 30px rgba(0,0,0,0.6)",
      }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", fontFamily: COND, fontWeight: 700, fontSize: 40, color: C.white, letterSpacing: "0.04em" }}>
          {typed ? <span>{typed}</span> : <span style={{ color: "#77777C", fontWeight: 600, letterSpacing: 0 }}>Añade un comentario…</span>}
          <span style={{ width: 3, height: 44, marginLeft: 3, background: C.orange, opacity: caret ? 1 : 0 }} />
        </div>
        <div style={{ fontFamily: COND, fontWeight: 800, fontSize: 34, color: done ? C.orange : "#55555A" }}>Publicar</div>
      </div>
    </div>
  );
};

// ── outro: fade to black with the Instagram handle ─────────────────────
export const Outro: React.FC<{ t: number }> = ({ t }) => {
  const p = EASE(clamp01((t - S.OUTRO) / 0.5));
  if (p <= 0) return null;
  const q = rise(t, S.OUTRO + 0.25, 0.5);
  return (
    <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${0.94 * p})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}>
      <div style={{ opacity: q, transform: `scale(${0.85 + 0.15 * q})`, filter: `drop-shadow(0 0 ${50 * q}px rgba(255,107,26,0.45))` }}>
        <Logo size={260} />
      </div>
      <div style={{ opacity: rise(t, S.OUTRO + 0.45, 0.5), display: "flex", alignItems: "center", gap: 20, marginTop: 10 }}>
        <IgGlyph size={70} color={C.orange} />
        <div style={{ fontFamily: COND, fontWeight: 800, fontSize: 80, color: C.white, letterSpacing: "0.01em" }}>@aigencyx.labs</div>
      </div>
      <div style={{ opacity: q * windowed(t, S.OUTRO + 0.5, 99, 0.4, 0.1), fontFamily: MONO, fontWeight: 500, fontSize: 24, letterSpacing: "0.3em", color: "rgba(255,255,255,0.6)" }}>
        AUTOMATIZACIÓN PARA TODO TIPO DE NEGOCIOS
      </div>
    </div>
  );
};
