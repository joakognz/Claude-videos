import React from "react";
import { C, EV, MONO, EASE_OUT, ramp } from "../theme";
import { Logo } from "../components/Logo";

/** Closing: the only dark frame besides the CRT blackout. Logo + @aigencyx.labs; the connection tone returns clean. */
export const Finale: React.FC<{ t: number }> = ({ t }) => {
  const k = EASE_OUT(ramp(t, EV.close, EV.close + 0.4));
  const ring = ramp(t, EV.tone, EV.tone + 0.7);
  return (
    <div style={{ position: "absolute", inset: 0, background: C.black }}>
      <div style={{ position: "absolute", left: 270, top: 520, width: 540, height: 540, transform: `scale(${0.88 + 0.12 * k})`, opacity: k }}>
        <Logo size={540} />
      </div>
      {ring > 0 && ring < 1 && <div style={{ position: "absolute", left: 270 - 120 * ring, top: 520 - 120 * ring, width: 540 + 240 * ring, height: 540 + 240 * ring, borderRadius: "50%", border: `5px solid ${C.orange}`, opacity: 1 - ring, boxSizing: "border-box" }} />}
      <div style={{ position: "absolute", left: 0, width: 1080, top: 1130, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 56, color: C.orange, opacity: ramp(t, EV.close + 0.3, EV.close + 0.6) }}>@aigencyx.labs</div>
    </div>
  );
};
