import React from "react";
import { C, TL, UI } from "../theme";

export const CAPTION_TOP = 1290;

/** Inter SemiBold 64 px, two lines max, one keyword in orange. Each word cuts in dry on its own syllable. */
export const Captions: React.FC<{ t: number }> = ({ t }) => {
  const cap = TL.captions.find((c) => t >= c.start && t < c.end);
  if (!cap) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: CAPTION_TOP }}>
      <div style={{
        position: "absolute", left: -60, right: -60, top: -70, height: 330,
        background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(5,5,5,0.72), rgba(5,5,5,0))",
      }} />
      {cap.lines.map((ln, i) => (
        <div key={i} style={{
          position: "relative", textAlign: "center", fontFamily: UI, fontWeight: 600, fontSize: 64, lineHeight: 1.18, letterSpacing: -0.5,
          color: C.white, textShadow: "0 3px 22px rgba(0,0,0,0.75)",
        }}>
          {ln.map((w, k) => (
            <span key={k} style={{ color: w.hl ? C.orange : C.white, opacity: t >= w.t ? 1 : 0 }}>
              {w.text}{k < ln.length - 1 ? " " : ""}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};
