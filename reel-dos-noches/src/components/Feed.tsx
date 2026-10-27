import React from "react";
import { C, S, SANS, TL, clamp01, rgba, windowed, EASE, EASE_OUT } from "../theme";
import { IconCalendarCheck, IconChat, IconCheck, IconEye, IconForm, IconMissed } from "./Icons";
import type { Side } from "./Phone";

// what each night message became (fictional demo data)
export const LOST = [
  { title: "Llamada perdida", sub: "23:07 · buzón de voz", icon: IconMissed },
  { title: "Mensaje visto", sub: "00:42 · sin respuesta", icon: IconEye },
  { title: "Chat sin leer", sub: "02:15 · sin respuesta", icon: IconChat },
  { title: "Formulario web", sub: "06:30 · sin respuesta", icon: IconForm },
  { title: "Llamada perdida", sub: "07:50 · buzón de voz", icon: IconMissed },
];
export const BOOKED = [
  { title: "Mesa para 2", sub: "vie 14 · 21:30" },
  { title: "Mesa para 4", sub: "sáb 15 · 14:00" },
  { title: "Mesa para 2", sub: "sáb 15 · 21:00" },
  { title: "Mesa para 6", sub: "dom 16 · 13:30" },
  { title: "Mesa para 3", sub: "vie 14 · 22:00" },
];

/** When the owner opens the phone in the morning (E7 top, E8 bottom). */
export const openAt = (side: Side) => (side === "top" ? S.E7 + 0.35 : S.E8 + 0.35);

/** Notification list on the phone screen: silent grey rows on top, green confirmations below. */
export const PhoneFeed: React.FC<{ t: number; side: Side }> = ({ t, side }) => {
  if (t < S.E5) return null;
  const top = side === "top";
  const open = EASE(clamp01((t - openAt(side)) / 0.6));
  const rows = TL.night.map((e, k) => ({ k, at: top ? e.lost : e.booked })).filter((r) => t >= r.at);
  const y0 = 300 - 100 * open;
  const stamp = top ? EASE_OUT(clamp01((t - (openAt("top") + 0.9)) / 0.35)) : 0;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* morning: screen opens to the summary */}
      <div style={{ position: "absolute", inset: 0, background: top ? "linear-gradient(180deg,#1c1012 0%,#0d0708 100%)" : "linear-gradient(180deg,#0e2a1f 0%,#06130e 100%)", opacity: open }} />
      <div style={{
        position: "absolute", left: 28, right: 28, top: 92, fontFamily: SANS, fontWeight: 800, fontSize: 40, lineHeight: 1.05,
        color: top ? C.red : C.green, opacity: open, translate: `0px ${(1 - open) * 20}px`,
      }}>
        {top ? "5 sin responder" : "5 reservas confirmadas"}
      </div>
      {rows.slice().reverse().map((r, i) => {
        const p = EASE_OUT(clamp01((t - r.at) / 0.4));
        const item = top ? LOST[r.k] : BOOKED[r.k];
        const Icon = top ? LOST[r.k].icon : IconCheck;
        const flash = top ? 0 : windowed(t, r.at, r.at + 0.9, 0.05, 0.6);
        return (
          <div key={r.k} style={{
            position: "absolute", left: 10, right: 10, top: y0 + i * 100 + (1 - p) * -60, height: 90, borderRadius: 24,
            display: "flex", alignItems: "center", gap: 10, padding: "0 12px", boxSizing: "border-box",
            background: top ? "rgba(60,58,62,0.55)" : rgba(C.green, 0.14 + 0.2 * flash),
            border: top ? "2px solid rgba(255,255,255,0.08)" : `3px solid ${rgba(C.green, 0.75)}`,
            opacity: p * (top ? 0.75 : 1), fontFamily: SANS,
            boxShadow: top ? undefined : `0 0 ${30 * flash}px ${rgba(C.green, 0.6 * flash)}`,
          }}>
            <div style={{
              width: 46, height: 46, borderRadius: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
              background: top ? "rgba(255,255,255,0.08)" : C.green,
            }}>
              <Icon size={30} color={top ? "rgba(255,255,255,0.55)" : C.ink} stroke={2.6} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 31, letterSpacing: -0.3, color: top ? "rgba(255,255,255,0.7)" : C.white, whiteSpace: "nowrap" }}>{item.title}</div>
              <div style={{ fontWeight: 600, fontSize: 24, color: top ? "rgba(255,255,255,0.45)" : rgba(C.green, 0.95), whiteSpace: "nowrap" }}>{item.sub}</div>
            </div>
          </div>
        );
      })}
      {/* stamp across the lost list */}
      {stamp > 0 && (
        <div style={{
          position: "absolute", left: 20, right: 20, top: 400, padding: "14px 0", borderRadius: 18, border: `5px solid ${C.red}`,
          textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 34, lineHeight: 1.1, color: C.red,
          background: "rgba(30,8,10,0.82)", rotate: "-9deg", scale: String(1.6 - 0.6 * stamp), opacity: stamp,
          boxShadow: `0 0 40px ${rgba(C.red, 0.35)}`,
        }}>
          YA RESERVARON<br />EN OTRO SITIO
        </div>
      )}
      {!top && open > 0 && (
        <div style={{ position: "absolute", right: 30, top: 96, opacity: open }}>
          <IconCalendarCheck size={40} color={C.green} stroke={2.4} />
        </div>
      )}
    </div>
  );
};

/** 08:00 alarm on both phones. */
export const AlarmScreen: React.FC<{ t: number }> = ({ t }) => {
  const o = windowed(t, S.E6 - 0.05, S.E6 + 2.4, 0.15, 0.5);
  if (o <= 0) return null;
  const ring = (t * 1.6) % 1;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o, background: "radial-gradient(120% 80% at 50% 30%, #6a3a1c 0%, #2a160c 60%, #120a06 100%)" }}>
      {[0, 1].map((i) => {
        const p = (ring + i / 2) % 1;
        return (
          <div key={i} style={{
            position: "absolute", left: "50%", top: 330, width: 200, height: 200, marginLeft: -100, marginTop: -100, borderRadius: "50%",
            border: `4px solid ${C.warm}`, scale: String(1 + p * 1.2), opacity: (1 - p) * 0.7,
          }} />
        );
      })}
      <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center", fontFamily: SANS }}>
        <div style={{ fontWeight: 700, fontSize: 32, color: "rgba(255,255,255,0.8)" }}>Alarma</div>
        <div style={{ fontWeight: 800, fontSize: 120, color: C.white, letterSpacing: -4, marginTop: 110 }}>08:00</div>
      </div>
      <div style={{
        position: "absolute", left: 60, right: 60, bottom: 90, padding: "22px 0", borderRadius: 40, textAlign: "center",
        background: C.warm, color: C.inkDark, fontFamily: SANS, fontWeight: 800, fontSize: 34,
      }}>Detener</div>
    </div>
  );
};
