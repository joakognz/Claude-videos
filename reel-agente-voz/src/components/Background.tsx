import React from "react";
import { AbsoluteFill, random } from "remotion";
import { C, drift } from "../theme";

/** Deep green backdrop with drifting glows and a parallax dot grid. */
export const Background: React.FC<{ t: number; camX: number; camY: number }> = ({ t, camX, camY }) => {
  const gx = -camX * 0.35 + drift(t, 1, 20);
  const gy = -camY * 0.35 - t * 6;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(130% 90% at 50% 40%, #12332a 0%, ${C.bg} 48%, ${C.bgDeep} 100%)`, overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: -200,
        backgroundImage: "radial-gradient(rgba(61,220,151,0.16) 1.6px, transparent 1.8px)",
        backgroundSize: "54px 54px", backgroundPosition: `${gx}px ${gy % 54}px`,
      }} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          position: "absolute", width: 900, height: 900, borderRadius: "50%",
          left: 540 - 450 + Math.sin(t * 0.21 + i * 2.1) * 320 - camX * (0.15 + i * 0.05),
          top: 960 - 450 + Math.cos(t * 0.17 + i * 1.7) * 520 - camY * (0.15 + i * 0.05),
          background: `radial-gradient(circle, rgba(61,220,151,${0.12 - i * 0.025}) 0%, rgba(61,220,151,0) 65%)`,
        }} />
      ))}
      {/* floating specks in a farther parallax layer */}
      {new Array(26).fill(0).map((_, i) => {
        const x = random(`x${i}`) * 1080;
        const y = (random(`y${i}`) * 2100 - t * (8 + random(`v${i}`) * 18)) % 2100;
        return (
          <div key={i} style={{
            position: "absolute", left: x - camX * 0.6, top: (y < 0 ? y + 2100 : y) - 90 - camY * 0.6,
            width: 4 + random(`s${i}`) * 5, height: 4 + random(`s${i}`) * 5, borderRadius: 10,
            background: C.green, opacity: 0.12 + random(`o${i}`) * 0.2, filter: "blur(1px)",
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

/** 4 % film grain + vignette, rendered outside the motion blur so the grain stays crisp. */
export const GrainVignette: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ background: "radial-gradient(120% 85% at 50% 48%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.62) 100%)" }} />
    <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, opacity: 0.04 * 2.2, mixBlendMode: "overlay" }}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 97} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  </AbsoluteFill>
);
