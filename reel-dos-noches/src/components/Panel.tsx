import React from "react";
import { random } from "remotion";
import { C, PANEL_H, PANEL_W, S, SANS, W, clamp01, drift, rgba, windowed, EASE, EASE_OUT } from "../theme";
import { aiOnAt, Phone, PHONE_H, PHONE_W, Side } from "./Phone";

// panel-local layout (1032 × 600)
export const PHONE_SCALE = 0.36;
export const PHONE_CX = 250;
export const PHONE_BASE = 512; // where the phone stands on the nightstand
export const phoneCenterLocal = { x: PHONE_CX, y: PHONE_BASE - (PHONE_H * PHONE_SCALE) / 2 };
const WIN = { x: 596, y: 192, w: 404, h: 286 };

const NAME: Record<Side, string> = { top: "MESÓN ROBLE", bottom: "CASA FARO" };

export const lampOffAt = (side: Side) => (side === "top" ? W("S2b", 3) - 0.05 : W("S3a", 2) - 0.05);
export const signOffAt = (side: Side) => (side === "top" ? W("S1b", 2) + 0.05 : S.E3 + 0.25);
export const nameAt = (side: Side) => (side === "top" ? S.E2 + 0.1 : S.E3 + 0.1);
export const sleepAt = (side: Side) => lampOffAt(side) + 0.2;
export const dawnAt = () => S.E6 + 0.25;

/** Sign seen through the window: lit at 21:00; the top one goes dark on "apaga". */
const Sign: React.FC<{ t: number; side: Side }> = ({ t, side }) => {
  const top = side === "top";
  const off = clamp01((t - signOffAt(side)) / 0.18);
  // two quick flickers before going dark
  const flick = off > 0 && off < 1 ? (Math.sin((t - signOffAt(side)) * 90) > 0 ? 0.25 : 1) : 1;
  const lit = (1 - off) * flick + (top ? 0 : off * 0.35);
  const glow = top ? C.warm : C.green;
  const closedP = EASE_OUT(clamp01((t - (top ? W("S2a", 1) : S.E3 + 0.4)) / 0.35));
  const dawn = clamp01((t - dawnAt()) / 0.9);
  return (
    <div style={{ position: "absolute", left: 30, top: 50, width: 320, translate: `${drift(t, side === "top" ? 41 : 42, 4)}px 0px` }}>
      <div style={{
        height: 86, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
        background: `linear-gradient(180deg, ${rgba("#2a2016", 0.95)}, ${rgba("#120d09", 0.95)})`,
        border: `3px solid ${rgba(glow, 0.25 + 0.6 * lit)}`,
        boxShadow: `0 0 ${50 * lit}px ${rgba(glow, 0.55 * lit)}, inset 0 0 ${24 * lit}px ${rgba(glow, 0.35 * lit)}`,
        fontFamily: SANS, fontWeight: 800, fontSize: 36, letterSpacing: 1, whiteSpace: "nowrap",
        color: lit > 0.5 ? "#FFF3E2" : rgba("#FFF3E2", 0.25 + 0.4 * lit + 0.3 * dawn),
        textShadow: `0 0 ${18 * lit}px ${rgba(glow, 0.9 * lit)}`,
      }}>{NAME[side]}</div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
        <div style={{
          position: "relative", padding: "6px 18px", borderRadius: 30, fontFamily: SANS, fontWeight: 800, fontSize: 24,
          letterSpacing: 1.5, color: "#0b0b0b", background: rgba("#E9FFE9", 0.85 * (1 - closedP)),
        }}>
          <span style={{ opacity: 1 - closedP }}>ABIERTO</span>
          <div style={{
            position: "absolute", left: "50%", top: 0, translate: "-50% 0px", whiteSpace: "nowrap", padding: "6px 18px",
            borderRadius: 30, background: top ? rgba(C.redDim, 0.9) : rgba("#3a4a42", 0.9), color: C.white,
            opacity: closedP, scale: String(0.8 + 0.2 * closedP),
            boxShadow: top ? `0 0 24px ${rgba(C.red, 0.4 * closedP)}` : undefined,
          }}>{top ? "CERRADO · 21:00" : "CERRADO"}</div>
        </div>
      </div>
    </div>
  );
};

const Window: React.FC<{ t: number; side: Side; camX: number; camY: number }> = ({ t, side, camX, camY }) => {
  const dawn = clamp01((t - dawnAt()) / 1.2);
  return (
    <div style={{
      position: "absolute", left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 16, overflow: "hidden",
      border: "12px solid #1a1f22", boxShadow: "0 10px 30px rgba(0,0,0,0.45), inset 0 0 0 2px rgba(255,255,255,0.06)",
      background: "#0c1530",
    }}>
      {/* night sky and dawn sky crossfade */}
      <div style={{ position: "absolute", inset: -40, background: "linear-gradient(180deg,#0a1230 0%,#18234a 75%)" }} />
      <div style={{ position: "absolute", inset: -40, background: "linear-gradient(180deg,#F49B6A 0%,#FFD9A3 70%)", opacity: dawn }} />
      {/* stars + moon, slow parallax */}
      {new Array(18).fill(0).map((_, i) => (
        <div key={i} style={{
          position: "absolute", left: random(`sx${side}${i}`) * WIN.w - camX * 0.2, top: random(`sy${side}${i}`) * 120 - camY * 0.2,
          width: 3, height: 3, borderRadius: 3, background: "#fff",
          opacity: (0.3 + 0.5 * Math.abs(Math.sin(t * 1.3 + i))) * (1 - dawn),
        }} />
      ))}
      <div style={{
        position: "absolute", right: 40 - camX * 0.25, top: 20 - camY * 0.25, width: 44, height: 44, borderRadius: 44,
        background: "#F4F1E4", boxShadow: "0 0 30px rgba(244,241,228,0.6)", opacity: 1 - dawn,
      }} />
      {/* façades across the street */}
      <div style={{ position: "absolute", left: -20 - camX * 0.4, right: -20, bottom: -10, height: 150, translate: `${drift(t, 44, 3)}px 0px` }}>
        <div style={{ position: "absolute", left: 0, bottom: 0, width: 140, height: 120, background: dawn > 0.5 ? "#7a5a4a" : "#121827" }} />
        <div style={{ position: "absolute", left: 300, bottom: 0, width: 160, height: 140, background: dawn > 0.5 ? "#6d5244" : "#0f1422" }} />
      </div>
      <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 10, marginLeft: -5, background: "#1a1f22" }} />
      <Sign t={t} side={side} />
      {/* glass reflection */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.07) 42%, rgba(255,255,255,0) 55%)" }} />
    </div>
  );
};

const Lamp: React.FC<{ t: number; side: Side }> = ({ t, side }) => {
  const on = 1 - EASE(clamp01((t - lampOffAt(side)) / 0.12));
  return (
    <div style={{ position: "absolute", left: 420, top: 330, width: 140, height: 190 }}>
      <div style={{
        position: "absolute", left: -260, top: -220, width: 660, height: 660, borderRadius: "50%",
        background: `radial-gradient(circle, ${rgba(C.warm, 0.32 * on)} 0%, rgba(0,0,0,0) 60%)`,
      }} />
      <div style={{
        position: "absolute", left: 20, top: 0, width: 100, height: 70,
        clipPath: "polygon(18% 0, 82% 0, 100% 100%, 0 100%)",
        background: on > 0.5 ? "linear-gradient(180deg,#FFE2B5,#E7B474)" : "linear-gradient(180deg,#3a3630,#24211d)",
      }} />
      <div style={{ position: "absolute", left: 66, top: 70, width: 8, height: 92, background: "#2b2723" }} />
      <div style={{ position: "absolute", left: 38, top: 160, width: 64, height: 16, borderRadius: 8, background: "#2b2723" }} />
    </div>
  );
};

const Zzz: React.FC<{ t: number; side: Side }> = ({ t, side }) => {
  const p = windowed(t, sleepAt(side), dawnAt() + 0.4, 0.5, 0.5);
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 30, top: 200, width: 120, height: 260, opacity: p }}>
      {[0, 1, 2].map((i) => {
        const c = ((t - sleepAt(side)) * 0.45 + i / 3) % 1;
        return (
          <div key={i} style={{
            position: "absolute", left: 10 + c * 70 + Math.sin(t * 2 + i) * 8, top: 220 - c * 220,
            fontFamily: SANS, fontWeight: 800, fontSize: 34 + c * 30, color: side === "top" ? "#CFE0FF" : "#D8FFEA",
            opacity: Math.sin(c * Math.PI) * 0.9, rotate: `${-12 + c * 10}deg`,
          }}>{i === 1 ? "z" : "Z"}</div>
        );
      })}
    </div>
  );
};

const Nightstand: React.FC<{ t: number; side: Side }> = ({ t, side }) => {
  const top = side === "top";
  const nameP = EASE_OUT(clamp01((t - nameAt(side)) / 0.5));
  return (
    <>
      {/* glossy top seen in perspective */}
      <div style={{
        position: "absolute", left: -20, right: -20, top: 470, height: 76,
        background: top ? "linear-gradient(180deg,#3d3a37 0%,#2a2724 100%)" : "linear-gradient(180deg,#5a3f2b 0%,#3d2a1d 100%)",
        clipPath: "polygon(4% 0, 96% 0, 100% 100%, 0 100%)",
      }} />
      <div style={{ position: "absolute", left: -20, right: -20, top: 546, height: 60, background: top ? "#1d1b19" : "#2b1d14", borderTop: "2px solid rgba(255,255,255,0.08)" }} />
      {/* nameplate on the front */}
      <div style={{
        position: "absolute", left: 36, top: 552, padding: "2px 14px", borderRadius: 10,
        background: rgba(top ? C.redDim : C.green, 0.22), border: `2px solid ${rgba(top ? C.redDim : C.green, 0.7)}`,
        fontFamily: SANS, fontWeight: 800, fontSize: 26, letterSpacing: 2, color: top ? "#F2C9CA" : "#CFFFE6",
        opacity: nameP, translate: `${(1 - nameP) * -30 + drift(t, top ? 51 : 52, 3)}px 0px`,
      }}>{NAME[side]}</div>
    </>
  );
};

export const PanelScene: React.FC<{ t: number; side: Side; camX: number; camY: number; hidePhone?: boolean }> = ({ t, side, camX, camY, hidePhone }) => {
  const top = side === "top";
  // top panel turns cold and desaturated once its owner switches everything off
  const cold = top ? EASE(clamp01((t - signOffAt("top")) / 0.6)) : 0;
  const dawn = clamp01((t - dawnAt()) / 1.0);
  const lampOn = 1 - clamp01((t - lampOffAt(side)) / 0.15);
  const phoneTilt = drift(t, top ? 61 : 62, 1.6);
  const phoneY = drift(t, top ? 63 : 64, 3);
  const wall = top
    ? "radial-gradient(120% 120% at 40% 30%, #242a36 0%, #141922 55%, #0a0d13 100%)"
    : "radial-gradient(120% 120% at 40% 30%, #183a2d 0%, #0f241c 55%, #07130e 100%)";
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: PANEL_W, height: PANEL_H }}>
      <div style={{
        position: "absolute", inset: 0,
        filter: `saturate(${1 - 0.6 * cold}) brightness(${(0.95 - 0.08 * cold) * (0.84 + 0.16 * lampOn) + 0.3 * dawn})`,
      }}>
        <div style={{ position: "absolute", inset: -60, background: wall, translate: `${-camX * 0.15}px ${-camY * 0.15}px` }} />
        <Window t={t} side={side} camX={camX} camY={camY} />
        <Lamp t={t} side={side} />
        {!top && (
          <div style={{
            position: "absolute", left: PHONE_CX - 260, top: PHONE_BASE - 400, width: 520, height: 520, borderRadius: "50%",
            background: `radial-gradient(circle, ${rgba(C.green, 0.28)} 0%, rgba(0,0,0,0) 62%)`,
            opacity: clamp01((t - aiOnAt()) / 0.5) * (0.75 + 0.25 * Math.sin(t * 4)),
          }} />
        )}
        <Nightstand t={t} side={side} />
        {/* phone reflection on the glossy top */}
        {!hidePhone && <div style={{
          position: "absolute", left: PHONE_CX - PHONE_W / 2, top: PHONE_BASE - 2, width: PHONE_W, height: PHONE_H,
          transformOrigin: "50% 0%", scale: `${PHONE_SCALE} ${-PHONE_SCALE * 0.6}`, opacity: 0.22, filter: "blur(2px)",
          rotate: `${-phoneTilt}deg`,
          maskImage: "linear-gradient(0deg, rgba(0,0,0,0) 55%, rgba(0,0,0,1) 100%)",
        }}>
          <Phone t={t} side={side} />
        </div>}
        {/* contact shadow */}
        <div style={{
          position: "absolute", left: PHONE_CX - 90, top: PHONE_BASE - 10, width: 180, height: 24, borderRadius: "50%",
          background: "rgba(0,0,0,0.6)", filter: "blur(8px)",
        }} />
        {!hidePhone && <div style={{
          position: "absolute", left: PHONE_CX - PHONE_W / 2, top: PHONE_BASE - PHONE_H + phoneY, width: PHONE_W, height: PHONE_H,
          transformOrigin: "50% 100%", scale: String(PHONE_SCALE), rotate: `${phoneTilt}deg`,
          filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.6))",
        }}>
          <Phone t={t} side={side} />
        </div>}
        <Zzz t={t} side={side} />
      </div>
      {/* grading: cold blue wash on the "apagado" panel; warm wash at dawn on both */}
      <div style={{ position: "absolute", inset: 0, background: "#4f6f9f", mixBlendMode: "color", opacity: 0.38 * cold * (1 - dawn * 0.7) }} />
      <div style={{
        position: "absolute", inset: 0, mixBlendMode: "soft-light", opacity: 0.55 * dawn,
        background: "radial-gradient(90% 90% at 80% 30%, #FFC489 0%, #FF9A5A 50%, rgba(0,0,0,0) 100%)",
      }} />
    </div>
  );
};
