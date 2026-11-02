import React from "react";
import { C, EV, UI, MONO, ANTON, ramp, EASE_OUT, rnd } from "../theme";
import { Card, BarLines } from "../components/UiBits";
import { Tile } from "../components/Tile";
import { GlitchBox } from "../components/Glitch";

/** 10.4–18.3: the employee, the email about a secret operation, and the doubt. */
export const Mail: React.FC<{ t: number }> = ({ t }) => {
  const seed = Math.floor(t * 15);
  const inK = EASE_OUT(ramp(t, EV.mailIn, EV.mailIn + 0.25));
  const doubt = t >= EV.strike;
  const gl = doubt ? (t < EV.estafa ? 0.25 + 0.2 * rnd(seed) : 0.75 * (1 - ramp(t, EV.estafa + 0.5, EV.estafa + 1.0)) + 0.2) : 0;
  const mailW = 960, mailH = 330;
  const mail = (
    <div style={{ position: "relative", width: mailW, height: mailH, background: C.tile, border: `3px solid ${C.border}`, borderRadius: 18, boxSizing: "border-box" }}>
      <div style={{ position: "absolute", left: 28, top: 28, width: 76, height: 76, borderRadius: 38, background: C.mid }} />
      <div style={{ position: "absolute", left: 124, top: 28, fontFamily: UI, fontWeight: 700, fontSize: 32, color: C.ink, letterSpacing: "0.05em" }}>DIRECTOR FINANCIERO</div>
      <div style={{ position: "absolute", left: 124, top: 74, fontFamily: MONO, fontWeight: 500, fontSize: 24, color: C.mid }}>NUEVO CORREO</div>
      <svg width={64} height={48} viewBox="0 0 64 48" style={{ position: "absolute", right: 30, top: 34 }}>
        <rect x={3} y={3} width={58} height={42} rx={6} fill="none" stroke={C.ink} strokeWidth={5} /><path d="M5 8l27 22 27-22" fill="none" stroke={C.ink} strokeWidth={5} />
      </svg>
      <BarLines x={28} y={140} w={900} n={2} gap={24} />
      {t >= EV.secret && (
        <div style={{ position: "absolute", left: 28, top: 214, fontFamily: ANTON, fontSize: 80, letterSpacing: "0.02em", color: C.ink, lineHeight: 1 }}>
          OPERACIÓN SECRETA
          {doubt && <span style={{ position: "absolute", left: -6, right: -6, top: "50%", height: 9, background: C.orange, width: `${ramp(t, EV.strike, EV.strike + 0.2) * 102}%` }} />}
        </div>
      )}
    </div>
  );
  return (
    <>
      {t < EV.mailIn && (
        <Card x={60} y={700} w={960} h={330}>
          <div style={{ position: "absolute", left: 28, top: 24, fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.mid, letterSpacing: "0.1em" }}>BANDEJA DE ENTRADA</div>
          <BarLines x={28} y={96} w={900} n={4} gap={52} h={20} />
        </Card>
      )}
      {t >= EV.mailIn && (
        <div style={{ position: "absolute", left: 60, top: 700 - (1 - inK) * 80, opacity: inK > 0.02 ? 1 : 0 }}>
          {gl > 0 ? <GlitchBox seed={seed} amount={gl} w={mailW} h={mailH}>{mail}</GlitchBox> : mail}
        </div>
      )}
      <div style={{ position: "absolute", left: 40, top: 1090, width: 1000, height: 440 }}>
        <Tile w={1000} h={440} label="EMPLEADO" kind="emp" />
      </div>
      {t >= EV.finanzas && t < EV.multi && (
        <Card x={60} y={1110} w={260} h={64} style={{ border: `3px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: UI, fontWeight: 700, fontSize: 28, letterSpacing: "0.1em" }}>FINANZAS</Card>
      )}
      {t >= EV.multi && t < EV.mailIn && (
        <Card x={60} y={1110} w={360} h={64} style={{ border: `3px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: UI, fontWeight: 700, fontSize: 28, letterSpacing: "0.1em" }}>MULTINACIONAL</Card>
      )}
      {t >= EV.doubt && (
        <div style={{ position: "absolute", left: 600, top: 1110, width: 100, height: 100, borderRadius: 50, background: C.tile, border: `5px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: ANTON, fontSize: 86, color: C.ink, transform: `scale(${1 + 0.12 * Math.sin((t - EV.doubt) * 9)})` }}>?</div>
      )}
      {t >= EV.estafa && (
        <div style={{ position: "absolute", left: 720, top: 1120, padding: "8px 26px", background: C.orange, color: C.tile, fontFamily: UI, fontWeight: 700, fontSize: 38, letterSpacing: "0.08em" }}>¿ESTAFA?</div>
      )}
    </>
  );
};
