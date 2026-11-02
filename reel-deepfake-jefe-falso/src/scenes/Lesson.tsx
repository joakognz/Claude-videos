import React from "react";
import { C, EV, UI, MONO, ANTON, ramp, EASE_OUT, rnd } from "../theme";
import { Cross, Check } from "../components/UiBits";
import { Silhouette, STRIP } from "../components/Tile";
import { GlitchBox } from "../components/Glitch";

/** 36.4–39.2: a face or a voice proves nothing (both can be faked → orange glitch + strike). Clean room, white tiles. */
export const Lesson1: React.FC<{ t: number }> = ({ t }) => {
  const seed = Math.floor(t * 15);
  const g = t >= EV.bothFalse ? 0.7 : 0;
  const face = (
    <div style={{ position: "relative", width: 490, height: 470, background: C.tile, border: `3px solid ${C.border}`, borderRadius: 18, boxSizing: "border-box", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 484, height: 410 }}><Silhouette w={484} hh={410} color={C.mid} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: STRIP, background: C.ink, color: C.tile, fontFamily: UI, fontWeight: 700, fontSize: 28, letterSpacing: "0.12em", display: "flex", alignItems: "center", paddingLeft: 22 }}>CARA</div>
    </div>
  );
  const bars = Array.from({ length: 21 }, (_, i) => 30 + 150 * Math.abs(Math.sin(i * 1.7 + (t - EV.voice) * 6) * Math.cos(i * 0.6)));
  const voice = (
    <div style={{ position: "relative", width: 490, height: 470, background: C.tile, border: `3px solid ${C.border}`, borderRadius: 18, boxSizing: "border-box", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 20, top: 40, width: 440, height: 340, display: "flex", alignItems: "center", gap: 7 }}>
        {bars.map((h, i) => <i key={i} style={{ display: "block", flex: 1, height: h, background: C.mid, borderRadius: 4 }} />)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: STRIP, background: C.ink, color: C.tile, fontFamily: UI, fontWeight: 700, fontSize: 28, letterSpacing: "0.12em", display: "flex", alignItems: "center", paddingLeft: 22 }}>VOZ</div>
    </div>
  );
  const nada = ramp(t, EV.nada - 0.05, EV.nada + 0.25);
  return (
    <>
      <div style={{ position: "absolute", left: 40, top: 760 }}>
        {t >= EV.face && (g > 0 ? <GlitchBox seed={seed} amount={g} w={490} h={470}>{face}</GlitchBox> : face)}
        {t >= EV.face && nada > 0 && <Cross x={0} y={0} w={490} h={470} p={nada} width={16} />}
      </div>
      <div style={{ position: "absolute", left: 550, top: 760 }}>
        {t >= EV.voice && (g > 0 ? <GlitchBox seed={seed + 5} amount={g} w={490} h={470}>{voice}</GlitchBox> : voice)}
        {t >= EV.voice && nada > 0 && <Cross x={0} y={0} w={490} h={470} p={nada} width={16} />}
      </div>
      {t >= EV.nada && (
        <div style={{ position: "absolute", left: 40, top: 1300, width: 1000, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 44, color: C.ink, letterSpacing: "0.08em" }}>= NO ES PRUEBA</div>
      )}
    </>
  );
};

const Icon: React.FC<{ kind: string }> = ({ kind }) => {
  const s = { fill: "none", stroke: C.ink, strokeWidth: 6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "pay") return <svg width={90} height={110} viewBox="0 0 90 110"><rect x={8} y={6} width={74} height={98} rx={8} {...s} /><path d="M24 36h42M24 58h42M24 80h24" {...s} /></svg>;
  if (kind === "verify") return <svg width={110} height={100} viewBox="0 0 110 100"><rect x={6} y={8} width={98} height={84} rx={8} {...s} /><path d="M6 30h98" {...s} /><circle cx={55} cy={62} r={14} {...s} /></svg>;
  if (kind === "phone") return <svg width={100} height={100} viewBox="0 0 100 100"><path d="M24 14l14 4 4 20-10 8c6 14 16 24 30 30l8-10 20 4 4 14c-2 10-10 16-20 14C32 90 10 68 8 36c-2-10 4-18 16-22z" fill={C.ink} /></svg>;
  return <Check size={100} />;
};

/** 39.2–46.2: payment order → verification window → call back on a known number → orange check. */
export const Lesson2: React.FC<{ t: number }> = ({ t }) => {
  const cards = [
    { k: "pay", at: EV.pay - 0.9, title: "ORDEN DE PAGO", sub: "LLEGA POR CORREO O VOZ" },
    { k: "verify", at: EV.verify, title: "VERIFICACIÓN", sub: t >= EV.other ? "POR OTRO CANAL" : "ANTES DE PAGAR" },
    { k: "phone", at: EV.phone, title: "LLAMADA DE VUELTA", sub: "AL NÚMERO DE SIEMPRE" },
    { k: "check", at: EV.check, title: "CONFIRMADO", sub: "AHORA SÍ, SE PAGA" },
  ];
  const ys = [690, 910, 1130, 1350];
  const flow = (i: number) => {
    const from = i === 0 ? EV.flow : i === 1 ? EV.other : EV.check - 0.7;
    return ramp(t, from, from + 0.7);
  };
  return (
    <>
      {cards.map((c, i) => {
        if (t < c.at) return null;
        const last = i === 3;
        const k = EASE_OUT(ramp(t, c.at, c.at + 0.18));
        return (
          <div key={i} style={{ position: "absolute", left: 120, top: ys[i] + (1 - k) * 24, width: 840, height: 170, background: C.tile, border: `4px solid ${last ? C.orange : C.ink}`, borderRadius: 20, boxSizing: "border-box", opacity: 0.4 + 0.6 * k, display: "flex", alignItems: "center", gap: 40, paddingLeft: 40 }}>
            <div style={{ width: 120, display: "flex", justifyContent: "center" }}><Icon kind={c.k} /></div>
            <div>
              <div style={{ fontFamily: ANTON, fontSize: 64, lineHeight: 1, color: last ? C.orange : C.ink, letterSpacing: "0.02em" }}>{c.title}</div>
              <div style={{ fontFamily: UI, fontWeight: 600, fontSize: 28, color: C.mid, letterSpacing: "0.08em", marginTop: 8 }}>{c.sub}</div>
            </div>
          </div>
        );
      })}
      {[0, 1, 2].map((i) => {
        if (i === 1 && t < EV.verify) return null;
        if (i === 2 && t < EV.phone) return null;
        if (i === 0 && t < EV.verify) return null;
        const p = flow(i);
        return (
          <svg key={i} width={40} height={50} style={{ position: "absolute", left: 520, top: ys[i] + 172 }}>
            <path d="M20 2v36M6 28l14 14 14-14" fill="none" stroke={C.mid} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
            {p > 0 && p < 1 && <circle cx={20} cy={4 + 36 * p} r={7} fill={C.orange} />}
          </svg>
        );
      })}
      {t >= EV.other && t < EV.phone && (
        <div style={{ position: "absolute", left: 120, top: 1130, width: 840, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.ink, letterSpacing: "0.1em", opacity: 0.9 + 0.1 * rnd(Math.floor(t * 10)) }}>LLAMA TÚ</div>
      )}
    </>
  );
};
