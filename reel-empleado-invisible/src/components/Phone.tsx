import React from "react";
import { C, EASE, EASE_IN, EASE_OUT, EV, MONO, SANS, clamp01, rise, windowed } from "../theme";

// Always the same spot: bottom-right corner, medium size, bottom edge ~18 % above the frame's bottom.
export const PHONE = { x: 774, y: 1060, w: 257, h: 514 };
const SCREEN = { x: 11, y: 11, w: PHONE.w - 22, h: PHONE.h - 22, r: 30 };

/** Slide offset: 0 in place, 1 fully below the frame. */
const slide = (t: number) => {
  let off = 1;
  EV.phone.forEach(([a, b]) => {
    if (t >= a - 0.01 && t <= b + 0.6) {
      const inn = EASE_OUT(clamp01((t - a) / 0.55));
      const out = EASE_IN(clamp01((t - b) / 0.45));
      off = Math.min(off, 1 - inn + out);
    }
  });
  return off;
};

const Bubble: React.FC<{ side: "in" | "out"; text: string; p: number; orange?: boolean; label?: string; unread?: boolean }> = ({ side, text, p, orange, label, unread }) => (
  <div style={{
    alignSelf: side === "in" ? "flex-start" : "flex-end", maxWidth: "86%", opacity: p, position: "relative",
    transform: `translateY(${(1 - p) * 14}px) scale(${0.9 + 0.1 * p})`, transformOrigin: side === "in" ? "left bottom" : "right bottom",
  }}>
    {label && (
      <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: C.orangeLo, textAlign: "right", marginBottom: 3 }}>{label}</div>
    )}
    <div style={{
      background: orange ? C.orange : "#EEECEA", color: C.ink, fontFamily: SANS, fontWeight: 600, fontSize: 15.5, lineHeight: 1.22,
      padding: "8px 11px", borderRadius: 16, borderBottomLeftRadius: side === "in" ? 4 : 16, borderBottomRightRadius: side === "out" ? 4 : 16,
    }}>
      {text}
    </div>
    {unread && <div style={{ position: "absolute", right: -7, top: -4, width: 12, height: 12, borderRadius: 6, background: C.red2, border: "2px solid #FFFFFF" }} />}
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
  <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "34px 12px 10px", borderBottom: "1px solid #E8E4E0", background: "#FBFAF9" }}>
    <div style={{ width: 30, height: 30, borderRadius: 15, background: orange ? C.orange : C.red2, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path d="M3 9 L5 4 H19 L21 9 Z M4 10 H20 V20 H4 Z" fill={orange ? C.ink : C.cream} opacity={0.9} />
      </svg>
    </div>
    <div style={{ lineHeight: 1.1 }}>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 15, color: C.ink }}>{title}</div>
      <div style={{ fontFamily: MONO, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.1em", color: orange ? C.orangeLo : C.red2 }}>{sub}</div>
    </div>
  </div>
);

/** E2-E3: unread messages pile up, then the screen empties before the phone leaves. */
const ChatPile: React.FC<{ t: number }> = ({ t }) => {
  const texts = ["¿Tenéis hueco mañana?", "¿Me confirmas la cita?", "¿Hola? ¿Seguís abiertos?"];
  const n = EV.chatIn.filter((b) => t >= b).length;
  const clear = (i: number) => EASE(clamp01((t - EV.chatClear - (2 - i) * 0.08) / 0.35));
  return (
    <>
      <Header title="Mensajes" sub={`${n} SIN LEER`} orange={false} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 14px" }}>
        {texts.map((tx, i) =>
          t >= EV.chatIn[i] ? (
            <div key={i} style={{ transform: `translateX(${-clear(i) * 260}px)`, opacity: 1 - clear(i), alignSelf: "flex-start", display: "flex" }}>
              <Bubble side="in" unread text={tx} p={rise(t, EV.chatIn[i], 0.3)} />
            </div>
          ) : null,
        )}
      </div>
    </>
  );
};

/** E5: the message is answered on the spot and the appointment confirmed. */
const ChatAuto: React.FC<{ t: number }> = ({ t }) => {
  const p = rise(t, EV.confirm, 0.45);
  return (
    <div style={{ position: "relative", height: "100%" }}>
      <Header title="Tu negocio" sub="RESPONDE AL INSTANTE" orange />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "14px 12px", opacity: 1 - 0.75 * p }}>
        <Bubble side="in" text="¿Tenéis hueco mañana?" p={rise(t, EV.msgIn, 0.3)} />
        {t < EV.reply + 0.05 && <Typing t={t} p={windowed(t, EV.typing, EV.reply + 0.05, 0.15, 0.08)} />}
        {t >= EV.reply && <Bubble side="out" orange label="ASISTENTE · 0,4 S" text="¡Sí! Mañana a las 10:30. ¿Te la reservo?" p={rise(t, EV.reply, 0.3)} />}
        {t >= EV.msgOk && <Bubble side="in" text="Sí, perfecto" p={rise(t, EV.msgOk, 0.3)} />}
      </div>
      {/* confirmation card */}
      <div style={{
        position: "absolute", left: 12, right: 12, top: 120, padding: "22px 10px 18px", borderRadius: 20, background: "rgba(255,255,255,0.97)",
        boxShadow: "0 12px 30px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        opacity: p, transform: `translateY(${(1 - p) * 24}px) scale(${0.92 + 0.08 * p})`,
      }}>
        <div style={{
          width: 86, height: 86, borderRadius: 43, background: C.orange, display: "flex", alignItems: "center", justifyContent: "center",
          transform: `scale(${0.4 + 0.6 * p})`, boxShadow: `0 0 ${40 * p}px rgba(255,107,26,0.7)`,
        }}>
          <svg width="52" height="52" viewBox="0 0 24 24">
            <path d="M5 12.5 L10 17 L19 7.5" stroke={C.ink} strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="24" strokeDashoffset={24 * (1 - clamp01((t - EV.confirm - 0.15) / 0.35))} />
          </svg>
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 21, color: C.ink }}>¡Cita confirmada!</div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", color: C.orangeLo }}>MAÑANA · 10:30</div>
      </div>
      {/* notifications that follow on their own */}
      <div style={{ position: "absolute", left: 10, right: 10, top: 330, display: "flex", flexDirection: "column", gap: 7 }}>
        {["Recordatorio enviado", "Cambio avisado al cliente"].map((n, i) => {
          const q = rise(t, EV.notifs[i], 0.35);
          return (
            <div key={i} style={{
              opacity: q, transform: `translateY(${(1 - q) * 16}px)`, background: "#FFFFFF", borderRadius: 12,
              padding: "8px 9px", display: "flex", alignItems: "center", gap: 7, boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
            }}>
              <div style={{ width: 16, height: 16, borderRadius: 8, background: C.orange, flexShrink: 0 }} />
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 12.5, color: C.ink }}>{n}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** E7: everything answered. */
const Inbox: React.FC<{ t: number }> = ({ t }) => {
  const rows = ["Laura · cita mañana", "Pedro · ¿horario sábado?", "Marta · cambio de hora", "Javi · presupuesto", "Ana · reserva viernes"];
  const a = EV.phone[2][0] + 0.4;
  return (
    <>
      <Header title="Mensajes" sub="0 SIN RESPONDER" orange />
      <div style={{ display: "flex", flexDirection: "column", padding: "6px 12px" }}>
        {rows.map((r, i) => {
          const q = rise(t, a + i * 0.25, 0.3);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 0", borderBottom: "1px solid #F0ECE8", opacity: 0.3 + 0.7 * q }}>
              <div style={{ width: 26, height: 26, borderRadius: 13, background: "#E6E2DE", flexShrink: 0 }} />
              <div style={{ flex: 1, fontFamily: SANS, fontWeight: 600, fontSize: 12.5, color: C.ink, whiteSpace: "nowrap", overflow: "hidden" }}>{r}</div>
              <div style={{ width: 20, height: 20, borderRadius: 10, background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${q})` }}>
                <svg width="13" height="13" viewBox="0 0 24 24">
                  <path d="M5 12.5 L10 17 L19 7.5" stroke={C.ink} strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export const Phone: React.FC<{ t: number }> = ({ t }) => {
  const off = slide(t);
  if (off >= 0.999) return null;
  const buzzTimes = [...EV.chatIn, EV.msgIn, EV.msgOk, EV.confirm, ...EV.notifs];
  const buzz = Math.max(0, ...buzzTimes.map((b) => windowed(t, b - 0.05, b + 0.3, 0.02, 0.1)));
  const jx = Math.sin(t * 95) * 3 * buzz;
  const mode = t < EV.phone[0][1] + 0.7 ? "pile" : t < EV.phone[1][1] + 0.7 ? "auto" : "inbox";
  return (
    <div style={{
      position: "absolute", left: PHONE.x + jx, top: PHONE.y + off * 900, width: PHONE.w, height: PHONE.h,
      borderRadius: 40, background: "linear-gradient(145deg, #FFFFFF, #E6E3E0)", boxShadow: "0 30px 70px rgba(0,0,0,0.7), inset 0 0 0 2px #F7F6F5, inset 0 0 0 4px #D2CECA",
    }}>
      <div style={{ position: "absolute", right: -3, top: 120, width: 4, height: 54, borderRadius: 2, background: "#D5D1CD" }} />
      <div style={{ position: "absolute", left: -3, top: 100, width: 4, height: 34, borderRadius: 2, background: "#D5D1CD" }} />
      <div style={{
        position: "absolute", left: SCREEN.x, top: SCREEN.y, width: SCREEN.w, height: SCREEN.h, borderRadius: SCREEN.r, overflow: "hidden",
        background: mode === "pile" ? "#FFFFFF" : "linear-gradient(180deg, #FFF6EE, #FFE4C8)",
      }}>
        <div style={{ position: "absolute", top: 8, left: 0, right: 0, display: "flex", justifyContent: "space-between", padding: "0 18px", fontFamily: MONO, fontSize: 10, fontWeight: 700, color: C.ink, zIndex: 2 }}>
          <span>21:47</span>
          <span>●●● ▮</span>
        </div>
        <div style={{ position: "absolute", top: 7, left: SCREEN.w / 2 - 34, width: 68, height: 18, borderRadius: 9, background: "#0B0B0B", zIndex: 3 }} />
        {mode === "pile" && <ChatPile t={t} />}
        {mode === "auto" && <ChatAuto t={t} />}
        {mode === "inbox" && <Inbox t={t} />}
      </div>
    </div>
  );
};
