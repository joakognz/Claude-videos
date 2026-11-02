import React from "react";
import { Cam, L2W, V3, project } from "../camera";
import { C, EASE, EASE_OUT, EV, MONO, S, TITLE, clamp01, springAt, windowed } from "../theme";
import { COINS, EXAM, KEY_SPOT, LAB, LAB_H, LAB_Y, SRV, gateAt } from "../world/layout";

const at = (p: V3, cam: Cam) => project(L2W(p), cam);

/** A small mono pill pinned to a point of the world. `lit` = orange (AI / status), else dark with cream text. */
const Pill: React.FC<{ x: number; y: number; o: number; s: number; lit?: boolean; size?: number; children: React.ReactNode }> = ({
  x, y, o, s, lit, size = 24, children,
}) => {
  if (o <= 0.001) return null;
  return (
    <div style={{
      position: "absolute", left: x, top: y, translate: "-50% -50%", scale: String(0.7 + 0.3 * s), opacity: o * clamp01(s * 1.4),
      padding: `${size * 0.42}px ${size * 0.9}px`, borderRadius: 999, fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: size * 0.16,
      whiteSpace: "nowrap", textTransform: "uppercase",
      background: lit ? C.orange : "rgba(26,22,19,0.9)", color: lit ? C.ink : "rgba(255,244,236,0.85)",
      border: lit ? "none" : "1.5px solid rgba(255,244,236,0.22)",
      boxShadow: lit ? "0 0 30px rgba(255,107,26,0.55), 0 8px 24px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.5)",
    }}>{children}</div>
  );
};

const Tags: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const out: React.ReactNode[] = [];
  const tag = (key: string, p: V3, a: number, b: number, text: React.ReactNode, lit = false, size = 24) => {
    const o = windowed(t, a, b, 0.2, 0.3);
    if (o <= 0) return;
    const [x, y] = at(p, cam);
    out.push(<Pill key={key} x={x} y={y} o={o} s={springAt(t, a, 12, 200)} lit={lit} size={size}>{text}</Pill>);
  };
  const labTop: V3 = [LAB[0], LAB_Y + 0.45, LAB[2] - LAB_H];
  const srvTop: V3 = [SRV[0], 2.35, SRV[2] - 0.5];
  // who is who (names as text only)
  tag("lab", labTop, EV.planes + 0.6, S.E3, "PRUEBA DE OPENAI");
  tag("hf", srvTop, EV.hack + 0.1, S.E3, "HUGGING FACE");
  tag("exam", [EXAM[0] + 0.1, 1.55, EXAM[2] + 0.3], EV.exam, S.E3 - 0.1, "EXAMEN", true, 22);
  tag("det", srvTop, EV.detect, EV.publish, "DETECTADO", false);
  tag("pub", srvTop, EV.publish, S.E4 + 0.2, "AVISO PÚBLICO", false);
  tag("theirs", labTop, EV.theirs - 0.05, S.E5 + 0.2, "MODELOS DE OPENAI", true);
  tag("board", labTop, EV.notes - 0.1, S.E6, "TABLÓN DE MENSAJES", true);
  tag("key", [KEY_SPOT[0], KEY_SPOT[1] + 0.55, KEY_SPOT[2]], EV.key + 0.1, EV.grab + 0.6, "CREDENCIAL", false, 22);
  tag("flaws", srvTop, EV.cracks, S.E7 + 0.1, "FALLOS DESCONOCIDOS", true);
  tag("coins", [COINS[0] + 0.15, 0.95, COINS[2] + 0.15], EV.coins + 0.2, EV.courier + 0.3, "DINERO", false, 22);
  tag("exam2", [EXAM[0] + 0.1, 1.55, EXAM[2] + 0.3], EV.courier + 0.3, S.E9 + 0.2, "EXAMEN", true, 22);
  tag("claimL", labTop, EV.claims, S.E10 + 0.1, "SEGÚN OPENAI", false, 26);
  tag("claimR", srvTop, EV.claims + 0.25, S.E10 + 0.1, "SEGÚN HUGGING FACE", false, 26);
  tag("acc", [gateAt(1)[0], -0.1, gateAt(1)[2] + 0.75], EV.gates + 0.1, EV.close, "ACCESOS ABIERTOS", true, 22);
  tag("min", [gateAt(1)[0], -0.1, gateAt(1)[2] + 0.75], EV.close + 0.2, S.E11 + 0.1, "SOLO LO NECESARIO", false, 22);
  tag("dummy", [LAB[0] - 0.55, 1.6, LAB[2] + 0.4], EV.dummy + 0.15, S.E11 + 0.1, "CREDENCIAL DE PRUEBA", true, 20);
  return <>{out}</>;
};

/** E4: a dashed line traces the activity back from the servers to the test box. */
const Trace: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const o = windowed(t, EV.trace - 0.1, S.E5 + 0.2, 0.2, 0.4);
  if (o <= 0) return null;
  const [ax, ay] = at([SRV[0] - 0.4, 1.7, SRV[2]], cam);
  const [bx, by] = at([LAB[0] + 0.4, LAB_Y + 0.1, LAB[2] - 0.2], cam);
  const p = EASE_OUT(clamp01((t - EV.trace) / 0.9));
  const mx = (ax + bx) / 2;
  const my = Math.min(ay, by) - 140;
  // quadratic curve, drawn progressively with the dash offset
  const len = 1100;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o }}>
      <path d={`M ${ax} ${ay} Q ${mx} ${my} ${bx} ${by}`} fill="none" stroke={C.orange} strokeWidth={5} strokeLinecap="round"
        strokeDasharray={`${len * p} ${len}`} style={{ filter: "drop-shadow(0 0 10px rgba(255,107,26,0.8))" }} />
      <path d={`M ${ax} ${ay} Q ${mx} ${my} ${bx} ${by}`} fill="none" stroke={C.ink} strokeWidth={3} strokeDasharray="10 14"
        strokeDashoffset={-t * 60} opacity={p} />
    </svg>
  );
};

/** E7: the actions counter, up to "+17.000" (the figure the voice says). */
const Counter: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const o = windowed(t, EV.count0 - 0.2, S.E8 - 0.05, 0.25, 0.3);
  if (o <= 0) return null;
  const p = EASE(clamp01((t - EV.count0) / (EV.count1 - EV.count0)));
  const n = Math.floor(p * 17000);
  const txt = `${Math.floor(n / 1000)}.${String(n % 1000).padStart(3, "0")}`;
  const done = p >= 1;
  const [x, y] = at([SRV[0], 2.75, SRV[2] - 0.5], cam);
  return (
    <div style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", opacity: o, textAlign: "center" }}>
      <div style={{
        fontFamily: TITLE, fontWeight: 800, fontSize: 76, letterSpacing: -1, color: done ? C.orange : C.cream,
        textShadow: done ? "0 0 26px rgba(255,107,26,0.7)" : "0 4px 20px rgba(0,0,0,0.7)", minWidth: 330,
      }}>{done ? "+" : ""}{n >= 1000 ? txt : String(n)}</div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: 5, color: "rgba(255,244,236,0.7)" }}>ACCIONES</div>
    </div>
  );
};

export const Hud: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => (
  <>
    <Trace t={t} cam={cam} />
    <Tags t={t} cam={cam} />
    <Counter t={t} cam={cam} />
  </>
);
