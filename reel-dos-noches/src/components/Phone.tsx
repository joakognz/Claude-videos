import React from "react";
import { C, S, SANS, W, clamp01, drift, rgba, windowed, EASE_OUT } from "../theme";
import { clockText } from "./Clock";
import { IconMoon, IconSpark } from "./Icons";
import { AlarmScreen, PhoneFeed } from "./Feed";

// drawn at full size and scaled down inside the panels, so the close-ups in E7/E8 stay sharp
export const PHONE_W = 400;
export const PHONE_H = 820;
const BEZEL = 14;
const SCREEN_R = 52;

export type Side = "top" | "bottom";

export const dndAt = (side: Side) => (side === "top" ? W("S2b", 0) + 0.15 : S.E3 + 0.35);
export const aiOnAt = () => W("S3b", 2) - 0.05;

const StatusBar: React.FC<{ t: number; side: Side }> = ({ t, side }) => {
  const dnd = clamp01((t - dndAt(side)) / 0.3);
  return (
    <div style={{
      position: "absolute", top: 22, left: 40, right: 34, height: 34, display: "flex",
      justifyContent: "space-between", alignItems: "center", fontFamily: SANS, fontWeight: 700,
      fontSize: 21, color: C.white,
    }}>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {clockText(t)}
        <span style={{ opacity: dnd }}><IconMoon size={20} color="#B9A7FF" stroke={2.6} /></span>
      </span>
      <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
        {[7, 10, 13, 16].map((h, i) => (
          <div key={i} style={{ width: 4, height: h, borderRadius: 2, background: C.white, opacity: i < 3 ? 1 : 0.4 }} />
        ))}
        <div style={{ marginLeft: 6, width: 32, height: 16, borderRadius: 5, border: "2px solid rgba(255,255,255,0.7)", padding: 2 }}>
          <div style={{ width: "70%", height: "100%", borderRadius: 2, background: C.white }} />
        </div>
      </div>
    </div>
  );
};

const LockScreen: React.FC<{ t: number; side: Side }> = ({ t, side }) => {
  const top = side === "top";
  const wall = top
    ? "radial-gradient(120% 80% at 30% 20%, #3b4a66 0%, #1b2233 55%, #0b0f18 100%)"
    : "radial-gradient(120% 80% at 70% 20%, #2f7d5c 0%, #123a2c 55%, #06150f 100%)";
  return (
    <div style={{ position: "absolute", inset: 0, background: wall }}>
      <div style={{ position: "absolute", top: 120, width: "100%", textAlign: "center", fontFamily: SANS }}>
        <div style={{ fontWeight: 600, fontSize: 26, color: "rgba(255,255,255,0.75)" }}>viernes, 14 de noviembre</div>
        <div style={{ fontWeight: 800, fontSize: 118, letterSpacing: -4, color: C.white, lineHeight: 1.05, fontVariantNumeric: "tabular-nums" }}>
          {clockText(t)}
        </div>
      </div>
      {/* soft abstract shapes in the wallpaper so it reads as a real lock screen */}
      {[0, 1].map((i) => (
        <div key={i} style={{
          position: "absolute", width: 360, height: 360, borderRadius: "50%", left: -60 + i * 160, top: 420 + i * 120 + drift(t, 30 + i, 10),
          background: `radial-gradient(circle, ${rgba(top ? "#7d8fb8" : C.green, 0.35)} 0%, rgba(0,0,0,0) 65%)`,
        }} />
      ))}
    </div>
  );
};

const DndOverlay: React.FC<{ t: number; side: Side }> = ({ t, side }) => {
  const p = EASE_OUT(clamp01((t - dndAt(side)) / 0.5));
  const top = side === "top";
  return (
    <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${0.62 * p})` }}>
      <div style={{
        position: "absolute", left: 40, right: 40, top: 350, padding: "22px 0", borderRadius: 34,
        background: "rgba(40,36,60,0.75)", display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
        fontFamily: SANS, fontWeight: 800, fontSize: 30, color: C.white,
        opacity: p * (top ? 1 : 1 - windowed(t, aiOnAt(), 999, 0.4, 0.01)) * (1 - clamp01((t - S.E5) / 0.4)),
        translate: `0px ${(1 - p) * 30}px`,
      }}>
        <IconMoon size={36} color="#B9A7FF" stroke={2.4} /> No molestar
      </div>
    </div>
  );
};

/** Bottom phone only: the assistant keeps working while the owner sleeps. */
const AiOverlay: React.FC<{ t: number }> = ({ t }) => {
  const p = EASE_OUT(clamp01((t - aiOnAt()) / 0.5));
  const pulse = 0.5 + 0.5 * Math.sin(t * 4);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: p }}>
      <div style={{
        position: "absolute", left: 34, right: 34, top: 350, padding: "20px 0", borderRadius: 34,
        background: rgba(C.green, 0.18), border: `3px solid ${C.green}`, display: "flex", alignItems: "center",
        justifyContent: "center", gap: 14, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: C.green,
        boxShadow: `0 0 ${24 + 20 * pulse}px ${rgba(C.green, 0.5)}`, scale: String(0.9 + 0.1 * p),
        opacity: 1 - clamp01((t - S.E5) / 0.4),
      }}>
        <div style={{ width: 16, height: 16, borderRadius: 16, background: C.green, opacity: 0.5 + 0.5 * pulse }} />
        IA activa
      </div>
      {/* breathing ring at the screen edge */}
      <div style={{
        position: "absolute", inset: 6, borderRadius: SCREEN_R - 6, border: `3px solid ${rgba(C.green, 0.35 + 0.35 * pulse)}`,
        boxShadow: `inset 0 0 40px ${rgba(C.green, 0.25 * pulse)}`,
      }} />
      <div style={{ position: "absolute", left: "50%", top: 470, marginLeft: -40, opacity: 0.85 * (1 - clamp01((t - S.E5) / 0.4)), rotate: `${t * 30}deg` }}>
        <IconSpark size={80} color={C.green} stroke={1.8} />
      </div>
    </div>
  );
};

/** iPhone-style mockup; each panel owns one and it stays the same object for the whole reel. */
export const Phone: React.FC<{ t: number; side: Side; screen?: React.ReactNode }> = ({ t, side, screen }) => {
  const glare = 32 + drift(t, side === "top" ? 2 : 5, 10);
  return (
    <div style={{ width: PHONE_W, height: PHONE_H, position: "relative" }}>
      {/* thickness */}
      <div style={{ position: "absolute", inset: 0, borderRadius: 70, background: "#0a0c0c", translate: "8px 6px" }} />
      {/* frame */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 70, padding: BEZEL,
        background: "linear-gradient(135deg,#9aa0a0 0%,#3b4140 28%,#1d2121 62%,#7a807f 100%)",
        boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.2)",
      }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: SCREEN_R, overflow: "hidden", background: "#000" }}>
          <LockScreen t={t} side={side} />
          <DndOverlay t={t} side={side} />
          {side === "bottom" && <AiOverlay t={t} />}
          <PhoneFeed t={t} side={side} />
          <AlarmScreen t={t} />
          {screen}
          <StatusBar t={t} side={side} />
          <div style={{ position: "absolute", top: 18, left: "50%", width: 112, height: 32, marginLeft: -56, borderRadius: 18, background: "#000" }} />
          {/* glass reflection */}
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(${glare}deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.13) 47%, rgba(255,255,255,0) 60%)`,
          }} />
        </div>
      </div>
      {/* side buttons */}
      <div style={{ position: "absolute", left: -4, top: 170, width: 5, height: 60, borderRadius: 3, background: "#555b5a" }} />
      <div style={{ position: "absolute", left: -4, top: 245, width: 5, height: 60, borderRadius: 3, background: "#555b5a" }} />
      <div style={{ position: "absolute", right: -4, top: 210, width: 5, height: 95, borderRadius: 3, background: "#555b5a" }} />
    </div>
  );
};
