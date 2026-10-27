import React from "react";
import { CHAIRS, Cam, GREY_C, ORANGE_C, SHOP_D, SIGN_Y, V3, at, project } from "../camera";
import { C, COND, EASE, EASE_OUT, EV, MONO, S, UI, clamp01, drift, springAt, windowed } from "../theme";

type Kind = "orange" | "grey" | "red";
const BORDER: Record<Kind, string> = { orange: C.orange, grey: "#5a5a5a", red: C.red };
const TEXT: Record<Kind, string> = { orange: "#FFB066", grey: "#9a9a9a", red: "#FF6B63" };

/** HUD tag floating `lift` px above a projected anchor, with a hairline down to a dot on the anchor. */
const Tag: React.FC<{
  xy: [number, number]; lift: number; kind: Kind; s: number; o: number; children: React.ReactNode; lineK?: number;
}> = ({ xy, lift, kind, s, o, children, lineK = 1 }) => {
  if (o <= 0.001) return null;
  const [x, y] = xy;
  const glowOn = kind === "orange";
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: o }}>
      <div style={{ position: "absolute", left: -1, top: -lift * lineK, width: 2, height: lift * lineK, background: `linear-gradient(${BORDER[kind]}, rgba(255,255,255,0))`, opacity: 0.8 }} />
      <div style={{ position: "absolute", left: -6, top: -6, width: 12, height: 12, borderRadius: 6, background: BORDER[kind], boxShadow: glowOn ? "0 0 14px #FF7A00" : "none", scale: String(s) }} />
      <div style={{
        position: "absolute", left: 0, top: -lift, translate: "-50% -100%", scale: String(s), transformOrigin: "50% 100%",
        padding: "12px 20px 11px", background: kind === "orange" ? "rgba(26,14,4,0.82)" : "rgba(18,18,18,0.82)",
        border: `2px solid ${BORDER[kind]}`, borderRadius: 6, whiteSpace: "nowrap",
        boxShadow: glowOn ? "0 0 26px rgba(255,122,0,0.45), inset 0 0 18px rgba(255,122,0,0.18)" : "0 8px 24px rgba(0,0,0,0.5)",
        fontFamily: MONO, fontWeight: 700, fontSize: 25, letterSpacing: 4, color: TEXT[kind], textAlign: "center",
      }}>
        {children}
      </div>
    </div>
  );
};

const Strike: React.FC<{ p: number; color: string }> = ({ p, color }) => (
  <div style={{ position: "absolute", left: 10, right: 10, top: "50%", height: 4, marginTop: -2, background: color, transformOrigin: "left", scale: `${p} 1`, boxShadow: `0 0 10px ${color}` }} />
);

const signAnchor = (c: V3): V3 => at(c, 0, SIGN_Y + 0.38, -SHOP_D / 2 + 0.1);
const chairAnchor = (i: number, h = 1.62): V3 => at(ORANGE_C, CHAIRS[i][0], h, CHAIRS[i][1]);

/** E1-E4: "PELUQUERÍA 1 / 2" labels with their price. */
const ShopLabels: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const out = clamp01((S.E5 - 0.1 - t) / 0.35);
  const greyOut = clamp01((S.E4 + 0.6 - t) / 0.4);
  const price = EASE_OUT(clamp01((t - EV.price) / 0.35));
  const items: [Kind, string, V3, number, number][] = [
    ["grey", "PELUQUERÍA 1", signAnchor(GREY_C), 0.9, greyOut],
    ["orange", "PELUQUERÍA 2", signAnchor(ORANGE_C), 1.15, out],
  ];
  return (
    <>
      {items.map(([kind, label, a, t0, o], i) => {
        const s = springAt(t, t0, 13, 200);
        const pr = i === 0 ? price : EASE_OUT(clamp01((t - EV.price - 0.18) / 0.35));
        return (
          <Tag key={label} xy={project(a, cam)} lift={70 + drift(t, i, 4)} kind={kind} s={Math.max(0, s)} o={clamp01(s * 2) * o}>
            <div>{label}</div>
            <div style={{ height: 60 * pr, overflow: "hidden", opacity: pr }}>
              <div style={{
                marginTop: 10, paddingTop: 8, borderTop: `1px solid ${kind === "orange" ? "rgba(255,122,0,0.5)" : "#444"}`,
                fontFamily: COND, fontWeight: 800, fontSize: 32, letterSpacing: 2, color: kind === "orange" ? C.white : "#8a8a8a",
              }}>18 € / CORTE</div>
            </div>
          </Tag>
        );
      })}
    </>
  );
};

/** E7-E10: bookings over the chairs, the clash, the cancellation and the waiting list. */
const ChairTags: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const off = clamp01((EV.plus - 0.1 - t) / 0.35);
  const pop = (t0: number) => Math.max(0, springAt(t, t0, 13, 210));
  const clashIn = EV.clash + 0.25;
  const clashX = EV.clashX - 0.6;
  const strikeRed = EASE(clamp01((t - clashX) / 0.25));
  const shake = t > clashX && t < clashX + 0.35 ? Math.sin(t * 80) * 8 * (1 - (t - clashX) / 0.35) : 0;
  const clashOut = clamp01((S.E8 - 0.1 - t) / 0.3);
  const strikeGrey = EASE(clamp01((t - EV.cancel) / 0.3));
  const fedeOut = clamp01((EV.walk + 1.5 - t) / 0.35);
  const laura = EV.walk + 1.75;
  const offNL = clamp01((S.E9 - t) / 0.35);
  return (
    <>
      <Tag xy={project(chairAnchor(0), cam)} lift={60} kind="orange" s={pop(EV.tag1)} o={clamp01(pop(EV.tag1) * 2) * offNL}>NICO · 12:00</Tag>
      <Tag xy={project(chairAnchor(1), cam)} lift={60} kind="orange" s={pop(EV.tag2)} o={clamp01(pop(EV.tag2) * 2) * offNL}>LUCAS · 12:00</Tag>
      {t >= clashIn && clashOut > 0 && (() => {
        const [x, y] = project(chairAnchor(0), cam);
        return (
          <Tag xy={[x + shake, y]} lift={150} kind={strikeRed > 0 ? "red" : "grey"} s={pop(clashIn)} o={clamp01(pop(clashIn) * 2) * clashOut} lineK={0}>
            <div style={{ position: "relative" }}>
              <span style={{ opacity: 1 - strikeRed * 0.35 }}>+ NICO · 12:00</span>
              <Strike p={strikeRed} color={C.red} />
            </div>
            {strikeRed > 0 && (
              <div style={{ marginTop: 8, color: C.white, background: C.red, padding: "2px 10px", fontSize: 22, letterSpacing: 5, scale: String(0.6 + 0.4 * strikeRed) }}>OCUPADO</div>
            )}
          </Tag>
        );
      })()}
      <Tag xy={project(chairAnchor(2), cam)} lift={60} kind={strikeGrey > 0 ? "grey" : "orange"} s={pop(EV.fede)} o={clamp01(pop(EV.fede) * 2) * fedeOut}>
        <div style={{ position: "relative" }}>
          <span>FEDE · 17:30</span>
          <Strike p={strikeGrey} color="#8a8a8a" />
        </div>
        {strikeGrey > 0 && <div style={{ marginTop: 8, color: "#d0d0d0", background: C.grey, padding: "2px 10px", fontSize: 22, letterSpacing: 5, scale: String(0.6 + 0.4 * strikeGrey) }}>CANCELÓ</div>}
      </Tag>
      <Tag xy={project(chairAnchor(2), cam)} lift={60} kind="orange" s={pop(laura)} o={clamp01(pop(laura) * 2) * off}>LAURA · 17:30</Tag>
    </>
  );
};

/** E9: "Se ha liberado el turno que querías". */
const Notification: React.FC<{ t: number }> = ({ t }) => {
  const s = springAt(t, EV.notify, 14, 160);
  const o = windowed(t, EV.notify, S.E10 - 0.1, 0.25, 0.35);
  if (o <= 0) return null;
  return (
    <div style={{
      position: "absolute", left: 120, right: 120, top: 640 + (1 - s) * -90, opacity: o, scale: String(0.92 + 0.08 * s),
      padding: "22px 26px", borderRadius: 30, background: "rgba(245,242,238,0.94)", display: "flex", gap: 20, alignItems: "center",
      boxShadow: "0 20px 60px rgba(0,0,0,0.55), 0 0 50px rgba(255,122,0,0.25)", fontFamily: UI,
    }}>
      <div style={{ width: 76, height: 76, borderRadius: 18, background: C.orange, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <circle cx="6" cy="7" r="2.6" /><circle cx="6" cy="17" r="2.6" /><path d="M8.2 8.4 20 17M8.2 15.6 20 7" />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#6b6b6b", fontWeight: 600, letterSpacing: 0.5 }}>
          <span>PELUQUERÍA 2 · LISTA DE ESPERA</span><span>ahora</span>
        </div>
        <div style={{ fontSize: 31, fontWeight: 700, color: "#111", marginTop: 4, lineHeight: 1.2 }}>Se ha liberado el turno que querías</div>
        <div style={{ fontSize: 25, color: "#444", marginTop: 4 }}>Hoy · 17:30 · Toca para confirmar</div>
      </div>
    </div>
  );
};

/** E10: "+10" over every occupied chair. */
const PlusTen: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => (
  <>
    {[0, 1, 2].map((i) => {
      const t0 = EV.plus + i * 0.16;
      const p = clamp01((t - t0) / 1.9);
      if (t < t0 || p >= 1) return null;
      const s = springAt(t, t0, 10, 220);
      const [x, y] = project(chairAnchor(i, 1.75), cam);
      return (
        <div key={i} style={{
          position: "absolute", left: x, top: y - 40 - EASE_OUT(p) * 110, translate: "-50% -50%", scale: String(Math.max(0, s)),
          fontFamily: COND, fontWeight: 800, fontSize: 96, color: C.orange, opacity: 1 - EASE(clamp01((p - 0.7) / 0.3)),
          textShadow: "0 0 30px rgba(255,122,0,0.85), 0 0 4px #FFA040",
        }}>+10</div>
      );
    })}
  </>
);

const CHATS = [
  "¿Tenéis hueco mañana?", "¿A cuánto el corte?", "¿Me guardas las 12:00?", "Somos 4, ¿hay sitio?", "¿Hola?",
  "¿Abrís el sábado?", "¿Me confirmas la cita?", "¿Sigue libre lo de las 18:00?", "Hola??", "Vale, miro otra…",
];

/** E14: grey chat bubbles piling up over the counter, unanswered. */
const Bubbles: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => {
  const out = clamp01((S.E15 + 0.4 - t) / 0.45);
  const shown = EV.bubbles.filter((b) => t >= b).length;
  if (shown === 0 || out <= 0) return null;
  const [ax, ay] = project(at(GREY_C, -1.45, 1.25, 1.15), cam);
  const STEP = 100;
  // older bubbles slide up one step each time a new one lands
  const last = EV.bubbles[shown - 1];
  const slide = EASE_OUT(clamp01((t - last) / 0.3));
  const yBottom = ay - 150;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: out }}>
      {EV.bubbles.slice(0, shown).map((b, i) => {
        const k = shown - 1 - i;
        const top = k === 0 ? yBottom : yBottom - (k - 1 + slide) * STEP;
        const s = springAt(t, b, 13, 260);
        const fadeTop = clamp01((top - 560) / 110);
        return (
          <div key={i} style={{
            position: "absolute", left: Math.min(Math.max(ax - 230, 70), 1080 - 700), top, opacity: clamp01(s * 2) * fadeTop,
            scale: String(0.7 + 0.3 * Math.max(0, s)), transformOrigin: "0% 100%",
            padding: "16px 24px", borderRadius: "26px 26px 26px 6px", background: "#3a3a3a", color: "#d6d6d6",
            fontFamily: UI, fontWeight: 500, fontSize: 36, whiteSpace: "nowrap", boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            display: "flex", alignItems: "baseline", gap: 16,
          }}>
            <span>{CHATS[i % CHATS.length]}</span>
            <span style={{ fontSize: 20, color: "#8a8a8a" }}>23:{String(41 + i).padStart(2, "0")}</span>
          </div>
        );
      })}
      <div style={{
        position: "absolute", left: Math.min(Math.max(ax - 230, 70), 1080 - 700), top: ay - 60, whiteSpace: "nowrap", fontFamily: MONO, fontWeight: 700, fontSize: 22,
        letterSpacing: 4, color: "#9a9a9a", background: "rgba(20,20,20,0.85)", border: "1px solid #555", padding: "6px 12px",
      }}>SIN RESPONDER · {shown}</div>
    </div>
  );
};

export const Hud: React.FC<{ t: number; cam: Cam }> = ({ t, cam }) => (
  <>
    {t < S.E5 + 0.2 && <ShopLabels t={t} cam={cam} />}
    {t > S.E7 && t < S.E11 && <ChairTags t={t} cam={cam} />}
    <Notification t={t} />
    <PlusTen t={t} cam={cam} />
    {t > S.E14 - 0.2 && t < S.E15 + 1 && <Bubbles t={t} cam={cam} />}
  </>
);
