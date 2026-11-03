import React from "react";
import { AbsoluteFill } from "remotion";
import { C, EV, MONO, S, UI, clamp01, ramp, springAt } from "../theme";
import { CAPTION_TOP, Word } from "./Captions";

const WORD = "AUDITORIA";

/** Scene 7: a generic comment field types AUDITORIA letter by letter with the voice; Enviar is pressed on the last syllable. */
export const CampoComentario: React.FC<{ t: number }> = ({ t }) => {
  if (t < S.S7) return null;
  const n = t < EV.typeStart ? 0 : Math.min(WORD.length, Math.floor((t - EV.typeStart) / EV.typeStep) + 1);
  const sent = t >= EV.send;
  const text = sent ? "" : WORD.slice(0, n);
  const press = ramp(t, EV.send - 0.06, EV.send) * (1 - ramp(t, EV.send + 0.04, EV.send + 0.2));
  const typing = n > 0 && n < WORD.length && !sent;
  const caret = typing || Math.floor(t * 2.6) % 2 === 0;
  const field = springAt(t, S.S7 + 0.05, 14, 180);
  const posted = springAt(t, EV.send + 0.05, 14, 200);
  return (
    <AbsoluteFill style={{ background: "#050505" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 40% at 50% 46%, rgba(255,107,26,0.10), rgba(5,5,5,0) 70%)" }} />
      {/* posted comment */}
      {sent && (
        <div style={{
          position: "absolute", left: 90, right: 90, top: 640, display: "flex", alignItems: "center", gap: 22, fontFamily: UI,
          opacity: clamp01(posted * 1.4), translate: `0px ${(1 - posted) * 40}px`,
        }}>
          <div style={{ width: 70, height: 70, borderRadius: 35, background: "linear-gradient(160deg, #3a3330, #1c1816)", border: `2px solid ${C.grey}` }} />
          <div style={{ fontSize: 44, fontWeight: 700, color: C.white, letterSpacing: 2 }}>{WORD}</div>
          <svg width={40} height={40} viewBox="0 0 40 40"><path d="M8 21 L17 30 L33 11" fill="none" stroke={C.orange} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      )}
      {/* field */}
      <div style={{
        position: "absolute", left: 70, right: 70, top: 800, height: 128, borderRadius: 28, background: "#100c0a",
        border: `2px solid ${n > 0 && !sent ? C.orange : "rgba(138,138,138,0.6)"}`, display: "flex", alignItems: "center", padding: "0 22px 0 26px",
        gap: 22, fontFamily: UI, opacity: clamp01(field * 1.5), scale: String(0.94 + 0.06 * Math.min(1, field)),
        boxShadow: n > 0 && !sent ? "0 0 40px rgba(255,107,26,0.18)" : "none",
      }}>
        <div style={{ width: 70, height: 70, borderRadius: 35, background: "linear-gradient(160deg, #3a3330, #1c1816)", border: `2px solid ${C.grey}`, flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", fontSize: 46, fontWeight: 700, color: C.white, letterSpacing: 3, whiteSpace: "nowrap" }}>
          {text ? text : <span style={{ color: C.grey, fontWeight: 600, letterSpacing: 0, fontSize: 38 }}>Añade un comentario…</span>}
          {caret && <span style={{ width: 4, height: 54, background: C.orange, marginLeft: text ? 6 : 0, order: text ? 0 : -1, marginRight: text ? 0 : 10 }} />}
        </div>
        <div style={{
          padding: "0 30px", height: 78, borderRadius: 39, display: "flex", alignItems: "center", fontSize: 34, fontWeight: 700,
          background: n === WORD.length || sent ? C.orange : "rgba(255,107,26,0.18)", color: n === WORD.length || sent ? "#050505" : "rgba(255,255,255,0.5)",
          scale: String(1 - 0.12 * press), boxShadow: press > 0 ? `0 0 ${30 * press}px ${C.orange}` : "none",
        }}>Enviar</div>
      </div>
      {/* rótulo */}
      <div style={{ position: "absolute", left: 50, right: 50, top: CAPTION_TOP, textAlign: "center", fontFamily: UI }}>
        <div style={{ fontSize: 46, fontWeight: 600, lineHeight: 1.3, color: C.white, opacity: 0.92 }}>
          <Word t={t} at={EV.comenta} hl={false} size={46} last>Comenta</Word>
        </div>
        <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.08, letterSpacing: -2.5 }}>
          <Word t={t} at={EV.typeStart} hl size={92} last>AUDITORIA</Word>
        </div>
      </div>
      <div style={{
        position: "absolute", left: 60, right: 60, top: CAPTION_TOP + 180, textAlign: "center", fontFamily: MONO, fontWeight: 500, fontSize: 30,
        letterSpacing: 3, color: C.grey, opacity: t >= EV.ayudamos ? 1 : 0,
      }}>TE AYUDAMOS A AUTOMATIZAR</div>
    </AbsoluteFill>
  );
};
