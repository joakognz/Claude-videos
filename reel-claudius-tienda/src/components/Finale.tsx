import React from "react";
import { C, EASE, EASE_OUT, EV, S, TITLE, TL, UI, clamp01, springAt, windowed } from "../theme";
import { CAPTION_TOP, Highlight, Micro, Reveal } from "./Captions";
import { Logo } from "./Logo";

const WORD = "AUDITORIA";

/** E10: the plaza darkens, "Revisa tu IA" and an Instagram-style comment bar that types AUDITORIA. */
export const CommentCTA: React.FC<{ t: number }> = ({ t }) => {
  const { comenta, revisa, tuia, sin } = TL.cta;
  const o = windowed(t, comenta - 0.2, S.FIN + 0.15, 0.25, 0.4);
  if (o <= 0) return null;
  const n = Math.max(0, Math.min(WORD.length, Math.floor((t - EV.typeStart) / EV.typeStep) + 1));
  const text = t >= EV.typeStart ? WORD.slice(0, n) : "";
  const bar = springAt(t, comenta - 0.15, 14, 150);
  const sent = n === WORD.length ? EASE_OUT(clamp01((t - (EV.typeStart + WORD.length * EV.typeStep + 0.25)) / 0.3)) : 0;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{
        position: "absolute", left: 50, right: 50, top: CAPTION_TOP, textAlign: "center", fontFamily: TITLE, fontWeight: 800, fontSize: 86,
        lineHeight: 1.12, letterSpacing: -1.5, color: C.white, textShadow: "0 4px 30px rgba(0,0,0,0.7)",
      }}>
        <Reveal t={t} at={revisa}>Revisa</Reveal>{" "}
        <Reveal t={t} at={tuia}><Highlight text="tu IA" t={t} at={tuia} size={86} /></Reveal>
      </div>
      <div style={{
        position: "absolute", left: 90, right: 90, top: CAPTION_TOP + 120, textAlign: "center", fontFamily: UI, fontWeight: 600, fontSize: 42,
        lineHeight: 1.25, color: "rgba(255,244,236,0.92)", textShadow: "0 2px 16px rgba(0,0,0,0.7)",
      }}>
        <Reveal t={t} at={sin} dist={16}>sin arriesgar tu negocio</Reveal>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1318 + (1 - bar) * 260, textAlign: "center", opacity: clamp01(bar * 1.5) }}>
        <Reveal t={t} at={comenta} dist={14}><Micro size={26} color={C.orangeSoft}>COMENTA LA PALABRA</Micro></Reveal>
      </div>
      {/* comment bar, rising from the bottom */}
      <div style={{
        position: "absolute", left: 70, right: 70, top: 1395 + (1 - bar) * 260, opacity: clamp01(bar * 1.5),
        borderRadius: 30, background: "rgba(20,17,15,0.94)", border: "1.5px solid rgba(255,244,236,0.14)", padding: "20px 26px",
        boxShadow: "0 30px 80px rgba(0,0,0,0.7), 0 0 60px rgba(255,107,26,0.18)", fontFamily: UI,
      }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "rgba(255,244,236,0.55)", textAlign: "center", marginBottom: 14 }}>Comentarios</div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, padding: 3, background: `linear-gradient(45deg, ${C.orangeSoft}, ${C.orange})`, flexShrink: 0 }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#2b2420", border: "3px solid #14110F", boxSizing: "border-box" }} />
          </div>
          <div style={{
            flex: 1, height: 74, borderRadius: 37, border: "1.5px solid rgba(255,244,236,0.24)", display: "flex", alignItems: "center",
            padding: "0 26px", fontSize: 34, fontWeight: 700, color: C.white, letterSpacing: 1,
          }}>
            {text ? text : <span style={{ color: "rgba(255,244,236,0.4)", fontWeight: 500, letterSpacing: 0 }}>Añade un comentario…</span>}
            {Math.floor(t * 2.6) % 2 === 0 && <span style={{ width: 3, height: 40, background: C.orange, marginLeft: text ? 4 : -2, order: text ? 0 : -1 }} />}
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: n > 0 ? C.orange : "rgba(255,107,26,0.4)", scale: String(1 + 0.12 * Math.sin(Math.PI * sent)) }}>Publicar</div>
        </div>
      </div>
    </div>
  );
};

/** Close: fade to #14110F, agency logo and @aigencyx.labs. */
export const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const a = S.FIN;
  const black = EASE(clamp01((t - a) / 0.5));
  if (black <= 0) return null;
  const s1 = springAt(t, a + 0.3, 13, 150);
  const s2 = springAt(t, a + 0.55, 13, 150);
  return (
    <div style={{ position: "absolute", inset: 0, background: C.ink, opacity: black }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 620, display: "flex", justifyContent: "center", opacity: clamp01(s1 * 1.5), scale: String(0.7 + 0.3 * s1) }}>
        <Logo size={340} />
      </div>
      <div style={{
        position: "absolute", left: 0, right: 0, top: 1030, textAlign: "center", fontFamily: TITLE, fontWeight: 800, fontSize: 68, color: C.orange,
        letterSpacing: -0.5, opacity: clamp01(s2 * 1.5), translate: `0px ${(1 - s2) * 30}px`, textShadow: "0 0 30px rgba(255,107,26,0.35)",
      }}>@aigencyx.labs</div>
    </div>
  );
};

/** E10: the plaza darkens behind the call to action. */
export const Darken: React.FC<{ t: number }> = ({ t }) => {
  const d = EASE(clamp01((t - EV.dark) / 0.8));
  if (d <= 0) return null;
  return <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 58%, rgba(14,12,11,0.35) 0%, rgba(14,12,11,0.8) 70%)", opacity: d }} />;
};
