import React from "react";
import { AbsoluteFill } from "remotion";
import { C, rand } from "../theme";

/** Block glitch cut: displaced slabs, orange/white bars and a scan band for `frames` frames from `at`. */
export const GlitchBlocks: React.FC<{ frame: number; at: number; frames?: number }> = ({ frame, at, frames = 6 }) => {
  const g = frame - at;
  if (g < 0 || g >= frames) return null;
  const blocks = Array.from({ length: 14 }, (_, i) => {
    const r = (k: number) => rand(at * 13.7 + g * 101.3 + i * 7.1 + k);
    const kind = r(1);
    return {
      top: Math.floor(r(2) * 1920), h: 8 + Math.floor(r(3) * 120), left: Math.floor(r(4) * 700) - 200, w: 200 + Math.floor(r(5) * 900),
      bg: kind < 0.4 ? C.orange : kind < 0.62 ? C.white : kind < 0.85 ? "#050505" : C.orangeSoft, op: 0.35 + r(6) * 0.6,
    };
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {blocks.map((b, i) => (
        <div key={i} style={{ position: "absolute", top: b.top, left: b.left, width: b.w, height: b.h, background: b.bg, opacity: b.op }} />
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: (g * 337) % 1920, height: 60, background: "rgba(255,255,255,0.12)" }} />
    </AbsoluteFill>
  );
};

/** Horizontal jolt of the image layer during a glitch. */
export const glitchShift = (frame: number, at: number, frames = 6) => {
  const g = frame - at;
  if (g < 0 || g >= frames) return 0;
  return (rand(at + g * 3.3) - 0.5) * 90;
};

/** Grid sweep: a bright scan line with a trail of grid rows, top → bottom (dir 1) or bottom → top (dir -1). */
export const GridSweep: React.FC<{ t: number; at: number; dur?: number; dir?: 1 | -1 }> = ({ t, at, dur = 0.5, dir = 1 }) => {
  const p = (t - at) / dur;
  if (p < 0 || p > 1) return null;
  const y = dir === 1 ? -80 + p * 2080 : 2000 - p * 2080;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{
        position: "absolute", left: 0, right: 0, top: dir === 1 ? y - 260 : y, height: 260,
        backgroundImage: `repeating-linear-gradient(0deg, rgba(255,107,26,0.35) 0 2px, transparent 2px 26px), repeating-linear-gradient(90deg, rgba(255,107,26,0.22) 0 2px, transparent 2px 26px)`,
        WebkitMaskImage: `linear-gradient(${dir === 1 ? "180deg" : "0deg"}, transparent, black)`,
      }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: y - 2, height: 4, background: C.orangeSoft, boxShadow: `0 0 24px 6px ${C.orange}` }} />
    </AbsoluteFill>
  );
};

/** Where the sweep line is (px from the top) at time t, for clipping the layers either side. */
export const sweepY = (t: number, at: number, dur = 0.5) => -80 + Math.min(1, Math.max(0, (t - at) / dur)) * 2080;
