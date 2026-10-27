import React from "react";
import { C, EASE, EASE_IN, EASE_OUT, EV, S, UI, clamp01, drift, springAt } from "../theme";

const W = 500;
const H = 1000;
const NAME = "Laura";
const TEL = "612 345 678";

const typed = (t: number, start: number, text: string, step: number) => text.slice(0, Math.max(0, Math.min(text.length, Math.floor((t - start) / step) + 1)));

const Slot: React.FC<{ time: string; busy: boolean; sel: number }> = ({ time, busy, sel }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "center", height: 74, padding: "0 26px", borderRadius: 18,
    background: sel > 0 ? `rgba(255,122,0,${sel})` : busy ? "#F2F2F2" : "#FFF4EA", border: `2px solid ${sel > 0 ? C.orange : busy ? "#EBEBEB" : "#FFD3AD"}`,
    boxShadow: sel > 0 ? `0 8px 24px rgba(255,122,0,${0.35 * sel})` : "none", scale: String(1 + 0.03 * Math.sin(Math.PI * sel)),
  }}>
    <span style={{ fontSize: 30, fontWeight: 700, color: busy ? "#A3A3A3" : "#111" }}>{time}</span>
    <span style={{ fontSize: 24, fontWeight: 600, color: busy ? "#A3A3A3" : sel > 0.5 ? "#111" : C.orange, display: "flex", alignItems: "center", gap: 8 }}>
      {busy ? "Ocupado" : "Libre"}
      {sel > 0.5 && (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      )}
    </span>
  </div>
);

const Field: React.FC<{ label: string; value: string; active: boolean; t: number }> = ({ label, value, active, t }) => (
  <div style={{ marginTop: 16 }}>
    <div style={{ fontSize: 21, fontWeight: 600, color: "#777", marginBottom: 8 }}>{label}</div>
    <div style={{
      height: 66, borderRadius: 16, border: `2px solid ${active ? "#111" : "#E3E3E3"}`, display: "flex", alignItems: "center",
      padding: "0 22px", fontSize: 29, fontWeight: 500, color: "#111", background: "#FAFAFA",
    }}>
      {value}
      {active && Math.floor(t * 2.4) % 2 === 0 && <span style={{ width: 3, height: 34, background: C.orange, marginLeft: 3 }} />}
    </div>
  </div>
);

const Booking: React.FC<{ t: number }> = ({ t }) => {
  const sel = EASE_OUT(clamp01((t - EV.slot) / 0.25));
  const nameStart = EV.typing;
  const telStart = nameStart + NAME.length * 0.09 + 0.18;
  const name = t >= nameStart ? typed(t, nameStart, NAME, 0.09) : "";
  const tel = t >= telStart ? typed(t, telStart, TEL, 0.06) : "";
  const press = t >= EV.press && t < EV.press + 0.3 ? Math.sin(((t - EV.press) / 0.3) * Math.PI) : 0;
  return (
    <div style={{ padding: "0 30px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 18 }}>
        <div style={{ width: 62, height: 62, borderRadius: 31, background: C.orange, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <circle cx="6" cy="7" r="2.6" /><circle cx="6" cy="17" r="2.6" /><path d="M8.2 8.4 20 17M8.2 15.6 20 7" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 33, fontWeight: 700, color: "#111", letterSpacing: -0.5 }}>Peluquería 2</div>
          <div style={{ fontSize: 21, color: "#8a8a8a", fontWeight: 500 }}>Reserva online · 24 h</div>
        </div>
      </div>
      <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
        <span style={{ padding: "10px 18px", borderRadius: 30, background: "#111", color: "#fff", fontSize: 22, fontWeight: 600 }}>Corte + barba</span>
        <span style={{ padding: "10px 18px", borderRadius: 30, background: "#F2F2F2", color: "#555", fontSize: 22, fontWeight: 600 }}>Hoy</span>
      </div>
      <div style={{ marginTop: 24, fontSize: 21, fontWeight: 700, color: "#9a9a9a", letterSpacing: 2 }}>HUECOS</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
        <Slot time="10:00" busy sel={0} />
        <Slot time="11:30" busy sel={0} />
        <Slot time="12:00" busy={false} sel={sel} />
      </div>
      <Field label="Nombre" value={name} active={t >= nameStart - 0.2 && t < telStart} t={t} />
      <Field label="Teléfono" value={tel} active={t >= telStart && t < EV.press} t={t} />
      <div style={{
        marginTop: 26, height: 84, borderRadius: 20, background: "#0A0A0A", color: "#fff", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 31, fontWeight: 700, scale: String(1 - 0.05 * press), boxShadow: `0 0 0 ${10 * press}px rgba(255,122,0,${0.35 * press})`,
      }}>Reservar</div>
    </div>
  );
};

const Confirmed: React.FC<{ t: number }> = ({ t }) => {
  const s = springAt(t, EV.confirm, 10, 200);
  const draw = EASE(clamp01((t - EV.confirm - 0.15) / 0.35));
  const txt = EASE_OUT(clamp01((t - EV.confirm - 0.25) / 0.35));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 170 }}>
      <div style={{
        width: 190, height: 190, borderRadius: 95, background: C.orange, display: "flex", alignItems: "center", justifyContent: "center",
        scale: String(Math.max(0, s)), boxShadow: "0 18px 50px rgba(255,122,0,0.5)",
      }}>
        <svg width="110" height="110" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" strokeDasharray="22" strokeDashoffset={22 * (1 - draw)} />
        </svg>
      </div>
      <div style={{ marginTop: 50, fontSize: 46, fontWeight: 800, color: "#111", letterSpacing: -1, opacity: txt, translate: `0px ${(1 - txt) * 20}px` }}>¡Cita reservada!</div>
      <div style={{ marginTop: 14, fontSize: 29, fontWeight: 500, color: "#666", opacity: txt, translate: `0px ${(1 - txt) * 20}px` }}>Hoy · 12:00 · Corte + barba</div>
      <div style={{
        marginTop: 60, padding: "18px 26px", borderRadius: 18, background: "#F5F5F5", fontSize: 23, color: "#555", fontWeight: 600,
        display: "flex", alignItems: "center", gap: 12, opacity: EASE_OUT(clamp01((t - EV.confirm - 0.6) / 0.4)),
      }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16zM10 20.5a2 2 0 0 0 4 0" /></svg>
        Recordatorio activado
      </div>
    </div>
  );
};

/** E5-E6: white phone with the booking flow, rising in front of the shop. */
export const Phone: React.FC<{ t: number }> = ({ t }) => {
  const inS = springAt(t, EV.phoneIn, 15, 120);
  const out = EASE_IN(clamp01((t - EV.phoneOut) / 0.45));
  if (t < EV.phoneIn || out >= 1) return null;
  const swap = EASE(clamp01((t - EV.confirm) / 0.3));
  const y = 650 + (1 - inS) * 1300 + out * 900;
  return (
    <div style={{ position: "absolute", left: 540 - W / 2, top: y, width: W, height: H, perspective: 1800, opacity: 1 - out * 0.6, filter: `blur(${out * 6}px)` }}>
      <div style={{
        width: W, height: H, borderRadius: 74, background: "linear-gradient(145deg, #FFFFFF, #E9E9EC)", padding: 12, boxSizing: "border-box",
        rotate: `${drift(t, 4, 1.2)}deg`, transform: `rotateX(${(1 - inS) * 18 + drift(t, 2, 2)}deg) rotateY(${drift(t, 6, 3)}deg)`,
        boxShadow: "0 60px 120px rgba(0,0,0,0.7), 0 0 0 2px #D8D8DC, inset 0 0 0 3px #F7F7F8, 0 0 80px rgba(255,122,0,0.18)",
      }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 62, background: "#FFFFFF", overflow: "hidden", fontFamily: UI, boxShadow: "inset 0 0 0 2px #EDEDED" }}>
          <div style={{ position: "absolute", left: "50%", top: 18, translate: "-50% 0", width: 140, height: 40, borderRadius: 20, background: "#0A0A0A" }} />
          <div style={{ display: "flex", justifyContent: "space-between", padding: "26px 40px 0", fontSize: 24, fontWeight: 700, color: "#111" }}>
            <span>23:14</span>
            <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ display: "flex", gap: 3, alignItems: "flex-end" }}>{[8, 12, 16, 20].map((h) => <span key={h} style={{ width: 5, height: h, background: "#111", borderRadius: 1 }} />)}</span>
              <span style={{ width: 40, height: 20, border: "2px solid #111", borderRadius: 6, padding: 2, boxSizing: "border-box" }}><span style={{ display: "block", width: "70%", height: "100%", background: "#111", borderRadius: 2 }} /></span>
            </span>
          </div>
          <div style={{ position: "absolute", inset: "70px 0 0 0", opacity: 1 - swap, translate: `${-swap * 60}px 0px` }}><Booking t={t} /></div>
          {swap > 0 && <div style={{ position: "absolute", inset: "70px 0 0 0", opacity: swap, translate: `${(1 - swap) * 60}px 0px` }}><Confirmed t={t} /></div>}
        </div>
      </div>
    </div>
  );
};

export const PHONE_WINDOW = [S.E5, S.E7] as const;
