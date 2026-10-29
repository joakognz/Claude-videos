import React from "react";
import { Cam, V3, project } from "../camera";
import { C, EASE, EASE_OUT, EV, FPS, MONO, S, TITLE, TL, clamp01, rand, springAt, windowed } from "../theme";
import { NOSE, ORACLE_Y, litCount, mainScale, splitAmt } from "../world/layout";
import { SPLIT_D } from "../world/Oracle";
import { Micro } from "./Captions";

const HUD_TOP = 560;

/** E2: share of right answers, rising with each wave of tiles. */
const Counter: React.FC<{ t: number }> = ({ t }) => {
  const o = windowed(t, EV.wave0 - 0.35, S.E3 + 0.1, 0.3, 0.35);
  if (o <= 0) return null;
  const n = litCount(t);
  const done = n >= 67;
  const named = EASE_OUT(clamp01((t - EV.label) / 0.3));
  const lastWave = EV.wave0 + Math.floor(clamp01((t - EV.wave0) / (EV.waveStep * 5 + 0.01)) * 5) * EV.waveStep;
  const kick = t >= EV.wave0 ? Math.exp(-(t - lastWave) / 0.18) : 0;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: HUD_TOP, display: "flex", flexDirection: "column", alignItems: "center", opacity: o, translate: `0px ${(1 - o) * 20}px` }}>
      <div style={{ height: 32, display: "flex", gap: 14, alignItems: "center" }}>
        {named > 0 && <span style={{ opacity: named, translate: `${(1 - named) * -12}px 0px` }}><Micro size={24} color={C.orangeSoft}>CLAUDE FABLE 5.1 ·</Micro></span>}
        <Micro size={24}>ACIERTOS</Micro>
      </div>
      <div style={{
        fontFamily: TITLE, fontWeight: 800, fontSize: 116, lineHeight: 1.05, letterSpacing: -2, color: done ? C.orange : C.cream,
        textShadow: done ? "0 0 34px rgba(255,107,26,0.65)" : "0 2px 18px rgba(0,0,0,0.6)", scale: String(1 + 0.07 * kick),
      }}>{n} %</div>
      <div style={{ marginTop: 6, width: 560, height: 6, borderRadius: 3, background: "rgba(255,244,236,0.14)" }}>
        <div style={{ width: `${n}%`, height: "100%", borderRadius: 3, background: C.orange, boxShadow: "0 0 14px rgba(255,107,26,0.9)" }} />
      </div>
    </div>
  );
};

/** E3: on one blank tile the oracle starts typing "NO LO SÉ"… and the words die before the last letter. */
const NoSe: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const TEXT = "NO LO SÉ";
  const start = EV.nose;
  const stop = start + 7 * EV.noseStep;
  if (t < start - 0.3 || t > stop + 0.8) return null;
  const n = Math.max(0, Math.min(7, Math.floor((t - start) / EV.noseStep) + 1));
  const typed = t >= start ? TEXT.slice(0, n) : "";
  const die = EASE(clamp01((t - stop) / 0.55));
  const appear = EASE_OUT(clamp01((t - start + 0.3) / 0.25));
  const s = mainScale(t);
  const [x, y] = project([NOSE.p[0] * s, NOSE.p[1] * s, NOSE.p[2] * s], cam);
  const cursor = Math.floor(t * 3) % 2 === 0 && die < 0.3;
  return (
    <div style={{
      position: "absolute", left: x, top: y - 112, translate: "-50% 0", opacity: appear * (1 - die), filter: die > 0 ? `blur(${die * 6}px)` : undefined,
      scale: String(1 - 0.12 * die), padding: "12px 22px", borderRadius: 14, background: "rgba(20,17,15,0.88)", border: "1.5px solid rgba(255,244,236,0.3)",
      fontFamily: MONO, fontWeight: 700, fontSize: 34, letterSpacing: 4, color: C.cream, whiteSpace: "nowrap", display: "flex", alignItems: "center",
      boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
    }}>
      <span style={{ opacity: 1 - die * 0.6 }}>{typed}</span>
      <span style={{ width: 3, height: 34, marginLeft: 4, background: C.cream, opacity: cursor ? 1 : 0 }} />
      {/* the missing letters, as empty slots */}
      <span style={{ color: "rgba(255,244,236,0.18)" }}>{"_".repeat(Math.max(0, TEXT.length - typed.length))}</span>
      {/* pointer to the tile */}
      <span style={{ position: "absolute", left: "50%", bottom: -12, width: 20, height: 20, translate: "-50% 0", rotate: "45deg", background: "rgba(20,17,15,0.88)", borderRight: "1.5px solid rgba(255,244,236,0.3)", borderBottom: "1.5px solid rgba(255,244,236,0.3)" }} />
    </div>
  );
};

/** E4: seven out of ten misses come out as invented answers. */
const Pips: React.FC<{ t: number }> = ({ t }) => {
  const o = windowed(t, EV.pips - 0.1, S.E5 - 0.05, 0.25, 0.3);
  if (o <= 0) return null;
  const frame = Math.floor(t * FPS);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: HUD_TOP - 30, display: "flex", justifyContent: "center", gap: 14, opacity: o }}>
      {Array.from({ length: 10 }, (_, i) => {
        const s = springAt(t, EV.pips + i * 0.03, 12, 200);
        const at = EV.pips + 0.25 + i * 0.11;
        const fake = i < 7 ? clamp01((t - at) / 0.08) : 0;
        const jx = fake ? (rand(i + frame * 3.3) - 0.5) * 7 : 0;
        const jy = fake ? (rand(i + frame * 5.1) - 0.5) * 5 : 0;
        return (
          <div key={i} style={{ position: "relative", width: 56, height: 56, scale: String(Math.max(0, s)), translate: `${jx}px ${jy}px` }}>
            {fake > 0 && (
              <div style={{ position: "absolute", inset: 0, borderRadius: 8, background: C.orange, opacity: 0.35, translate: `${-jx * 1.8}px ${-jy * 1.8}px`, filter: "blur(3px)" }} />
            )}
            <div style={{
              position: "absolute", inset: 0, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
              background: fake ? C.orange : "rgba(255,244,236,0.08)", border: fake ? "none" : "2px solid rgba(255,244,236,0.35)",
              boxShadow: fake ? "0 0 22px rgba(255,107,26,0.7)" : "none", fontFamily: TITLE, fontWeight: 800, fontSize: 38, color: C.cream,
            }}>{fake ? "?" : ""}</div>
          </div>
        );
      })}
    </div>
  );
};

/** E6: what each half stands for. */
const SplitLabels: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  if (t < EV.labels - 0.1) return null;
  const sp = splitAmt(t);
  const fade = 1 - EASE(clamp01((t - EV.dark) / 0.5)) * 0.7;
  const right = TL.captions.E6.chunks[2].t;
  const pill = (side: -1 | 1, text: string, at: number, lit: boolean) => {
    const s = springAt(t, at, 12, 190);
    if (s <= 0) return null;
    const p: V3 = [Math.SQRT1_2 * SPLIT_D * sp * side, ORACLE_Y + 1.35, -Math.SQRT1_2 * SPLIT_D * sp * side];
    const [x, y] = project(p, cam);
    return (
      <div style={{
        position: "absolute", left: x, top: y - 40, translate: "-50% 0", scale: String(0.7 + 0.3 * s), opacity: clamp01(s * 1.4) * fade,
        padding: "10px 22px", borderRadius: 999, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 4, whiteSpace: "nowrap",
        background: lit ? C.orange : "rgba(42,33,27,0.92)", color: lit ? C.ink : "rgba(255,244,236,0.7)",
        border: lit ? "none" : "1.5px solid rgba(255,244,236,0.3)", boxShadow: lit ? "0 0 30px rgba(255,107,26,0.55)" : "none",
      }}>{text}</div>
    );
  };
  return (
    <>
      {pill(-1, "PRECISIÓN", EV.labels, true)}
      {pill(1, "FIABILIDAD", right, false)}
    </>
  );
};

export const Hud: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => (
  <>
    <Counter t={t} />
    <NoSe t={t} cam={cam} />
    <Pips t={t} />
    <SplitLabels t={t} cam={cam} />
  </>
);
