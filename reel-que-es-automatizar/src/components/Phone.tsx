import React from "react";
import { C, COND, EASE_IN, EASE_OUT, EV, MONO, clamp01, rise, windowed } from "../theme";

// Always the same spot: bottom-right corner, medium size.
export const PHONE = { x: 742, y: 1102, w: 238, h: 476 };
const SCREEN = { x: 11, y: 11, w: PHONE.w - 22, h: PHONE.h - 22, r: 30 };

/** Slide offset: 0 in place, 1 fully below the frame. */
const slide = (t: number) => {
  let off = 1;
  EV.phoneIn.forEach((a, i) => {
    const b = EV.phoneOut[i];
    if (t >= a - 0.01 && t <= b + 0.6) {
      const inn = EASE_OUT(clamp01((t - a) / 0.55));
      const out = EASE_IN(clamp01((t - b) / 0.45));
      off = Math.min(off, 1 - inn + out);
    }
  });
  return off;
};

const Bubble: React.FC<{ side: "in" | "out"; text: string; p: number; orange?: boolean; label?: string }> = ({ side, text, p, orange, label }) => (
  <div style={{
    alignSelf: side === "in" ? "flex-start" : "flex-end", maxWidth: "84%", opacity: p,
    transform: `translateY(${(1 - p) * 14}px) scale(${0.9 + 0.1 * p})`, transformOrigin: side === "in" ? "left bottom" : "right bottom",
  }}>
    {label && (
      <div style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", color: C.orangeLo, textAlign: "right", marginBottom: 3 }}>{label}</div>
    )}
    <div style={{
      background: orange ? C.orange : "#ECECEE", color: C.ink, fontFamily: COND, fontWeight: 600, fontSize: 21, lineHeight: 1.12,
      padding: "8px 11px", borderRadius: 16, borderBottomLeftRadius: side === "in" ? 4 : 16, borderBottomRightRadius: side === "out" ? 4 : 16,
    }}>
      {text}
    </div>
  </div>
);

const Typing: React.FC<{ t: number; p: number }> = ({ t, p }) => (
  <div style={{ alignSelf: "flex-end", opacity: p, background: "#FFE2C2", borderRadius: 14, padding: "9px 12px", display: "flex", gap: 5 }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{ width: 7, height: 7, borderRadius: 4, background: C.orangeLo, opacity: 0.4 + 0.6 * Math.max(0, Math.sin(t * 9 - i * 0.9)) }} />
    ))}
  </div>
);

const Header: React.FC<{ title: string; sub: string; orange: boolean }> = ({ title, sub, orange }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "34px 12px 10px", borderBottom: "1px solid #E6E6E8", background: "#FAFAFA" }}>
    <div style={{ width: 30, height: 30, borderRadius: 15, background: orange ? C.orange : "#9A9A9A", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path d="M3 9 L5 4 H19 L21 9 Z M4 10 H20 V20 H4 Z" fill={C.ink} opacity={0.85} />
      </svg>
    </div>
    <div style={{ lineHeight: 1.05 }}>
      <div style={{ fontFamily: COND, fontWeight: 700, fontSize: 18, color: C.ink }}>{title}</div>
      <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.1em", color: orange ? C.orangeLo : "#8A8A8A" }}>{sub}</div>
    </div>
  </div>
);

/** E5: question → typing → automatic reply. */
const ChatAuto: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Header title="Tu negocio" sub="RESPUESTA AUTOMÁTICA ON" orange />
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "14px 12px" }}>
      <Bubble side="in" text="¿A qué hora abrís mañana?" p={rise(t, EV.msgIn, 0.3)} />
      {t < EV.autoReply + 0.05 && <Typing t={t} p={windowed(t, EV.typing, EV.autoReply + 0.05, 0.2, 0.08)} />}
      {t >= EV.autoReply && <Bubble side="out" orange label="AUTOMÁTICO · 0,4 S" text="Mañana abrimos a las 9:00. ¿Quieres que te reserve algo?" p={rise(t, EV.autoReply, 0.3)} />}
    </div>
  </>
);

/** E8: with only a web, the questions keep piling up unanswered. */
const ChatPile: React.FC<{ t: number }> = ({ t }) => {
  const texts = ["¿Podéis cambiarme la cita?", "¿Tenéis disponible este producto?", "Llamo y no me cogen"];
  const n = EV.bubbles.filter((b) => t >= b).length;
  return (
    <>
      <Header title="Tu negocio" sub={`SIN RESPONDER · ${n}`} orange={false} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "14px 12px" }}>
        {texts.map((tx, i) => (t >= EV.bubbles[i] ? <Bubble key={i} side="in" text={tx} p={rise(t, EV.bubbles[i], 0.3)} /> : null))}
        {n > 0 && (
          <div style={{ alignSelf: "center", marginTop: 4, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: "#8A8A8A" }}>
            {"VISTO · SIN RESPUESTA"}
          </div>
        )}
      </div>
    </>
  );
};

/** E11: order confirmed + notifications arriving on their own. */
const Confirmed: React.FC<{ t: number }> = ({ t }) => {
  const p = rise(t, EV.confirm, 0.45);
  const notes = ["Cita confirmada · 10:30", "Recordatorio enviado", "Pedido #214 en camino"];
  return (
    <div style={{ position: "relative", height: "100%" }}>
      <div style={{ position: "absolute", top: 40, left: 10, right: 10, display: "flex", flexDirection: "column", gap: 7 }}>
        {notes.map((n, i) => {
          const q = rise(t, EV.notifs[i], 0.35);
          return (
            <div key={i} style={{
              opacity: q, transform: `translateY(${(1 - q) * -20}px)`, background: "rgba(255,255,255,0.96)", borderRadius: 12,
              padding: "7px 9px", display: "flex", alignItems: "center", gap: 7, boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
            }}>
              <div style={{ width: 16, height: 16, borderRadius: 8, background: C.orange, flexShrink: 0 }} />
              <div style={{ fontFamily: COND, fontWeight: 600, fontSize: 16, color: C.ink }}>{n}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 230, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 96, height: 96, borderRadius: 48, background: C.orange, display: "flex", alignItems: "center", justifyContent: "center",
          transform: `scale(${0.4 + 0.6 * p})`, opacity: p, boxShadow: `0 0 ${40 * p}px rgba(255,122,0,0.6)`,
        }}>
          <svg width="56" height="56" viewBox="0 0 24 24">
            <path d="M5 12.5 L10 17 L19 7.5" stroke={C.ink} strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="24" strokeDashoffset={24 * (1 - clamp01((t - EV.confirm - 0.15) / 0.35))} />
          </svg>
        </div>
        <div style={{ fontFamily: COND, fontWeight: 800, fontSize: 30, color: C.ink, opacity: p }}>¡Pedido confirmado!</div>
      </div>
    </div>
  );
};

export const Phone: React.FC<{ t: number }> = ({ t }) => {
  const off = slide(t);
  if (off >= 0.999) return null;
  const buzzTimes = [EV.msgIn, ...EV.bubbles, EV.confirm, ...EV.notifs];
  const buzz = Math.max(0, ...buzzTimes.map((b) => windowed(t, b - 0.05, b + 0.3, 0.02, 0.1)));
  const jx = Math.sin(t * 95) * 3 * buzz;
  const mode = t < EV.phoneOut[0] + 0.7 ? "auto" : t < EV.phoneOut[1] + 0.7 ? "pile" : "done";
  return (
    <div style={{
      position: "absolute", left: PHONE.x + jx, top: PHONE.y + off * 900, width: PHONE.w, height: PHONE.h,
      borderRadius: 40, background: "linear-gradient(145deg, #FFFFFF, #E4E4E8)", boxShadow: "0 30px 70px rgba(0,0,0,0.7), inset 0 0 0 2px #F7F7F9, inset 0 0 0 4px #CFCFD4",
    }}>
      {/* side buttons */}
      <div style={{ position: "absolute", right: -3, top: 120, width: 4, height: 54, borderRadius: 2, background: "#D5D5DA" }} />
      <div style={{ position: "absolute", left: -3, top: 100, width: 4, height: 34, borderRadius: 2, background: "#D5D5DA" }} />
      <div style={{
        position: "absolute", left: SCREEN.x, top: SCREEN.y, width: SCREEN.w, height: SCREEN.h, borderRadius: SCREEN.r, overflow: "hidden",
        background: mode === "done" ? "linear-gradient(180deg, #FFF4E8, #FFE0BF)" : "#FFFFFF",
      }}>
        {/* status bar + notch */}
        <div style={{ position: "absolute", top: 8, left: 0, right: 0, display: "flex", justifyContent: "space-between", padding: "0 18px", fontFamily: MONO, fontSize: 10, fontWeight: 700, color: C.ink, zIndex: 2 }}>
          <span>21:47</span>
          <span>●●● ▮</span>
        </div>
        <div style={{ position: "absolute", top: 7, left: SCREEN.w / 2 - 34, width: 68, height: 18, borderRadius: 9, background: "#0B0B0B", zIndex: 3 }} />
        {mode === "auto" && <ChatAuto t={t} />}
        {mode === "pile" && <ChatPile t={t} />}
        {mode === "done" && <Confirmed t={t} />}
      </div>
    </div>
  );
};
