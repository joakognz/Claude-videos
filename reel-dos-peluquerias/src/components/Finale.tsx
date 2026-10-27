import React from "react";
import { C, COND, EASE, EASE_OUT, EV, MONO, S, TL, UI, clamp01, drift, springAt, windowed } from "../theme";
import { Highlight } from "./Captions";
import { IgIcon } from "./Chrome";
import { Logo } from "./Logo";

/** E11: dark glass loyalty card: LAURA · TUS PUNTOS 120 → Corte gratis. */
export const PointsCard: React.FC<{ t: number }> = ({ t }) => {
  const o = windowed(t, EV.card, S.E12 + 0.25, 0.3, 0.45);
  if (o <= 0) return null;
  const s = springAt(t, EV.card, 14, 150);
  const count = EASE_OUT(clamp01((t - EV.card - 0.35) / 1.1));
  const pts = Math.round(110 + 10 * count);
  const pressed = t >= EV.redeem && t < EV.redeem + 0.3 ? Math.sin(((t - EV.redeem) / 0.3) * Math.PI) : 0;
  const done = EASE_OUT(clamp01((t - EV.redeem - 0.1) / 0.3));
  const plus = clamp01((t - EV.card - 0.35) / 1.2);
  return (
    <div style={{
      position: "absolute", left: 130, right: 130, top: 690 + (1 - s) * 140, opacity: o, scale: String(0.9 + 0.1 * s),
      rotate: `${drift(t, 9, 0.6)}deg`, padding: "40px 44px 44px", borderRadius: 40,
      background: "linear-gradient(160deg, rgba(40,32,26,0.72), rgba(14,12,10,0.82))", border: "1.5px solid rgba(255,255,255,0.14)",
      backdropFilter: "blur(18px)", boxShadow: "0 40px 100px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 70px rgba(255,122,0,0.18)",
      color: C.white,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 25, letterSpacing: 5, color: "rgba(255,255,255,0.8)" }}>LAURA · TUS PUNTOS</span>
        <span style={{ width: 16, height: 16, borderRadius: 8, background: C.orange, boxShadow: "0 0 14px #FF7A00" }} />
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 6 }}>
        <span style={{ fontFamily: COND, fontWeight: 800, fontSize: 210, lineHeight: 1, color: C.orange, textShadow: "0 0 40px rgba(255,122,0,0.55)" }}>{pts}</span>
        <span style={{ fontFamily: COND, fontWeight: 800, fontSize: 64, color: C.orangeSoft, opacity: plus > 0 && plus < 1 ? 1 - plus : 0, translate: `0px ${-plus * 40}px` }}>+10</span>
      </div>
      <div style={{ height: 16, borderRadius: 8, background: "rgba(255,255,255,0.1)", marginTop: 10, overflow: "hidden" }}>
        <div style={{ width: `${(pts / 120) * 100}%`, height: "100%", borderRadius: 8, background: `linear-gradient(90deg, ${C.orange}, ${C.orangeSoft})`, boxShadow: "0 0 16px rgba(255,122,0,0.8)" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 19, letterSpacing: 3, color: "rgba(255,255,255,0.45)", marginTop: 10 }}>
        <span>0</span><span>120</span>
      </div>
      <div style={{ height: 1, background: "rgba(255,255,255,0.12)", margin: "28px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
        <div>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 21, letterSpacing: 5, color: "rgba(255,255,255,0.55)" }}>PREMIO</div>
          <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 44, marginTop: 4 }}>Corte gratis</div>
        </div>
        <div style={{
          padding: "22px 30px", borderRadius: 20, background: done > 0 ? C.white : C.orange, color: C.ink, fontFamily: UI, fontWeight: 800,
          fontSize: 30, whiteSpace: "nowrap", scale: String(1 - 0.06 * pressed), boxShadow: `0 10px 30px rgba(255,122,0,0.45), 0 0 0 ${12 * pressed}px rgba(255,122,0,0.3)`,
        }}>{done > 0 ? "¡Canjeado!" : "Canjear · 120"}</div>
      </div>
    </div>
  );
};

const WORD = "PELUQUERÍA";

/** E16: Instagram-style comment bar typing PELUQUERÍA, under the CTA caption. */
export const CommentCTA: React.FC<{ t: number }> = ({ t }) => {
  const a = S.E16;
  const o = windowed(t, a - 0.05, S.E17 + 0.2, 0.35, 0.4);
  if (o <= 0) return null;
  const { comenta, peluqueria, small, tuyo } = TL.cta;
  const n = Math.max(0, Math.min(WORD.length, Math.floor((t - EV.typeStart) / EV.typeStep) + 1));
  const text = t >= EV.typeStart ? WORD.slice(0, n) : "";
  const bar = springAt(t, a + 0.05, 14, 150);
  const w1 = EASE_OUT(clamp01((t - comenta + 0.08) / 0.26));
  const w2 = EASE_OUT(clamp01((t - peluqueria + 0.08) / 0.26));
  const w3 = EASE_OUT(clamp01((t - small + 0.05) / 0.4));
  const sent = n === WORD.length ? EASE_OUT(clamp01((t - (EV.typeStart + WORD.length * EV.typeStep + 0.25)) / 0.3)) : 0;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", left: 60, right: 60, top: 330, textAlign: "center", fontFamily: COND, fontWeight: 800, fontSize: 118, lineHeight: 1.05, color: C.white, textShadow: "0 4px 30px rgba(0,0,0,0.65)" }}>
        <span style={{ display: "inline-block", opacity: w1, translate: `0px ${(1 - w1) * 34}px` }}>Comenta</span>{" "}
        <span style={{ display: "inline-block", opacity: w2, translate: `0px ${(1 - w2) * 34}px` }}>
          <Highlight text="PELUQUERÍA" kind="o" t={t} at={peluqueria} size={118} />
        </span>
      </div>
      <div style={{
        position: "absolute", left: 80, right: 80, top: 600, textAlign: "center", fontFamily: UI, fontWeight: 600, fontSize: 46,
        color: "rgba(255,255,255,0.92)", opacity: w3, translate: `0px ${(1 - w3) * 20}px`, textShadow: "0 2px 16px rgba(0,0,0,0.7)",
      }}>
        y te muestro cómo quedaría el <Highlight text="tuyo." kind="o" t={t} at={tuyo} size={46} />
      </div>
      {/* comment bar */}
      <div style={{
        position: "absolute", left: 70, right: 70, top: 980 + (1 - bar) * 200, opacity: clamp01(bar * 1.5), scale: String(0.94 + 0.06 * bar),
        borderRadius: 30, background: "rgba(18,18,20,0.92)", border: "1.5px solid rgba(255,255,255,0.12)", padding: "26px 30px",
        boxShadow: "0 30px 80px rgba(0,0,0,0.7), 0 0 60px rgba(255,122,0,0.15)", fontFamily: UI,
      }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 20 }}>Comentarios</div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 70, height: 70, borderRadius: 35, padding: 3, background: "linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf)", flexShrink: 0 }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#2b2b2e", border: "3px solid #121214", boxSizing: "border-box" }} />
          </div>
          <div style={{
            flex: 1, height: 82, borderRadius: 41, border: "1.5px solid rgba(255,255,255,0.22)", display: "flex", alignItems: "center",
            padding: "0 28px", fontSize: 36, fontWeight: 600, color: C.white, letterSpacing: 1,
          }}>
            {text ? text : <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 500, letterSpacing: 0 }}>Añade un comentario…</span>}
            {Math.floor(t * 2.6) % 2 === 0 && <span style={{ width: 3, height: 42, background: C.orange, marginLeft: text ? 4 : -2, order: text ? 0 : -1 }} />}
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: n > 0 ? "#0095F6" : "rgba(0,149,246,0.4)", scale: String(1 + 0.12 * Math.sin(Math.PI * sent)) }}>Publicar</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1240, textAlign: "center", fontFamily: COND, fontWeight: 800, fontSize: 110, color: C.orange, opacity: EASE(clamp01((t - peluqueria - 0.3) / 0.3)), translate: `0px ${Math.abs(Math.sin(t * 4)) * 18}px`, textShadow: "0 0 34px rgba(255,122,0,0.6)" }}>↓</div>
    </div>
  );
};

/** E17: fade to black, agency logo, Instagram icon and @aigencyxlabs. */
export const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const a = S.E17;
  const black = EASE(clamp01((t - a) / 0.5));
  if (black <= 0) return null;
  const s1 = springAt(t, a + 0.3, 13, 150);
  const s2 = springAt(t, a + 0.5, 13, 150);
  const s3 = springAt(t, a + 0.62, 13, 150);
  return (
    <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${black})` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", opacity: clamp01(s1 * 1.5), scale: String(0.7 + 0.3 * s1) }}>
        <Logo size={190} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 920, display: "flex", justifyContent: "center", opacity: clamp01(s2 * 1.5), scale: String(0.7 + 0.3 * s2) }}>
        <IgIcon size={130} />
      </div>
      <div style={{
        position: "absolute", left: 0, right: 0, top: 1090, textAlign: "center", fontFamily: UI, fontWeight: 700, fontSize: 64, color: C.white,
        letterSpacing: -0.5, opacity: clamp01(s3 * 1.5), translate: `0px ${(1 - s3) * 30}px`,
      }}>@aigencyxlabs</div>
    </div>
  );
};
