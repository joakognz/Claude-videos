import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, FPS, MONO, TOP_SAFE } from "../theme";

/** hh:mm:ss:ff at 30 fps. */
export const timecode = (frames: number) => {
  const f = Math.max(0, Math.floor(frames));
  const ff = f % FPS;
  const s = Math.floor(f / FPS);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}:${p(ff)}`;
};

const Corner: React.FC<{ x: "left" | "right"; y: "top" | "bottom" }> = ({ x, y }) => (
  <div style={{
    position: "absolute", [x]: 60, [y]: 60, width: 74, height: 74,
    [`border${y === "top" ? "Top" : "Bottom"}`]: `3px solid ${C.grey}`,
    [`border${x === "left" ? "Left" : "Right"}`]: `3px solid ${C.grey}`,
  }} />
);

/** Four thin L corners 60 px from the edges, ● REC + running timecode on the left, a tag on the right. */
export const HudFrame: React.FC<{ frame: number; tcFrames: number; tag: string; opacity?: number }> = ({ frame, tcFrames, tag, opacity = 1 }) => {
  const recOn = Math.floor(frame / 15) % 2 === 0; // the REC dot keeps blinking, even when everything else is frozen
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      <Corner x="left" y="top" />
      <Corner x="right" y="top" />
      <Corner x="left" y="bottom" />
      <Corner x="right" y="bottom" />
      <div style={{
        position: "absolute", left: 92, right: 92, top: TOP_SAFE + 10, display: "flex", justifyContent: "space-between", alignItems: "center",
        fontFamily: MONO, fontWeight: 500, fontSize: 30, letterSpacing: 2, color: C.grey,
        textShadow: "0 0 10px rgba(0,0,0,0.95), 0 0 3px rgba(0,0,0,0.9)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 18, height: 18, borderRadius: 9, background: C.orange, opacity: recOn ? 1 : 0.12, boxShadow: recOn ? `0 0 14px ${C.orange}` : "none" }} />
          <span style={{ color: C.white, opacity: 0.85 }}>REC</span>
          <span style={{ marginLeft: 8 }}>{timecode(tcFrames)}</span>
        </div>
        <div>{tag}</div>
      </div>
    </AbsoluteFill>
  );
};

/** Pre-computed film grain (PNG tiles), picked by frame; pass a frozen frame to stop it. */
export const Grain: React.FC<{ frame: number; opacity?: number }> = ({ frame, opacity = 0.085 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", opacity, mixBlendMode: "overlay" }}>
    <Img src={staticFile(`assets/grain_${Math.floor(frame) % 8}.png`)} style={{ width: 1080, height: 1920, imageRendering: "pixelated" }} />
  </AbsoluteFill>
);

/** Black studio with a very faint warm floor glow at the bottom. */
export const Backdrop: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.black} 0%, ${C.black} 55%, ${C.floor} 100%)` }} />
);

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)` }} />
);
