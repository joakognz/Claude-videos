import React from "react";
import { C, EV, UI, MONO, ramp, lerp, EASE } from "../theme";
import { Card, Btn } from "../components/UiBits";
import { Cursor } from "../components/Chrome";

const WORD = "AUDITORIA";
/** 46.2–49.9: generic comment field types the keyword letter by letter, then Enviar is pressed on the last syllable. */
export const Cta: React.FC<{ t: number }> = ({ t }) => {
  const n = Math.max(0, Math.min(WORD.length, Math.floor((t - EV.type0) / EV.typeStep) + 1));
  const sent = t >= EV.send;
  const caret = Math.floor(t * 2.4) % 2 === 0;
  const k = EASE(ramp(t, EV.send - 0.9, EV.send - 0.05));
  const cx = lerp(900, 800, k), cy = lerp(1280, 933, k);
  const subs: [string, number][] = ["Comenta", "auditoría", "y", "te", "ayudamos", "a", "automatizar", "tu", "negocio."].map((w, i) => [w, EV[`cw${i}`]]);
  return (
    <>
      <Card x={60} y={800} w={960} h={190} style={{ border: `3px solid ${sent ? C.ink : C.border}` }}>
        <div style={{ position: "absolute", left: 30, top: 55, width: 80, height: 80, borderRadius: 40, background: C.mid }} />
        <div style={{ position: "absolute", left: 140, top: 52, fontFamily: UI, fontWeight: 600, fontSize: 28, color: C.mid }}>Escribe un comentario…</div>
        <div style={{ position: "absolute", left: 140, top: 82, height: 80, display: "flex", alignItems: "center", fontFamily: UI, fontWeight: 700, fontSize: 60, color: C.ink, letterSpacing: "0.04em", visibility: n > 0 ? "visible" : "hidden" }}>
          {WORD.slice(0, n)}
          <span style={{ display: "inline-block", width: 5, height: 62, marginLeft: 4, background: caret ? C.orange : "transparent" }} />
        </div>
        {n === 0 && <div style={{ position: "absolute", left: 140, top: 100, width: 5, height: 62, background: caret ? C.orange : "transparent" }} />}
        <Btn x={700} y={52} w={230} h={86} label="ENVIAR" pressed={sent && t < EV.send + 0.2} size={34} />
      </Card>
      <div style={{ position: "absolute", left: 60, top: 1040, width: 960, textAlign: "center", fontFamily: UI, fontWeight: 600, fontSize: 40, color: C.ink, lineHeight: 1.3 }}>
        {subs.map(([w, ts], i) => <React.Fragment key={i}><span style={{ visibility: t >= ts ? "visible" : "hidden" }}>{w} </span>{i === 4 && <br />}</React.Fragment>)}
      </div>
      <div style={{ position: "absolute", left: 60, top: 1190, width: 960, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.mid, letterSpacing: "0.1em", visibility: sent ? "visible" : "hidden" }}>ENVIADO ✓</div>
      <Cursor x={cx} y={cy} click={ramp(t, EV.send - 0.02, EV.send + 0.3)} />
    </>
  );
};
