import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { C, FPS, S, TL, clamp01, drift, moves, tween, windowed, EASE } from "./theme";
import { Background, GrainVignette } from "./components/Background";
import { Phone, PHONE_H, PHONE_W } from "./components/Phone";
import { Captions } from "./components/Captions";
import { Disclaimer, IABadge, LostCounter } from "./components/Overlays";
import { CallBubbles } from "./components/CallBubbles";
import { Flow } from "./components/Flow";
import { BigSix, CTA } from "./components/Finale";

const TOTAL = TL.durationInFrames / FPS;
const WIPE_END = S.E4 + 0.1;
const MB_SAMPLES = 5;

// ── the one phone, choreographed across the whole reel ──────────────────
const PX = moves(540, [[S.E6, 150], [S.E13 + 0.7, 540, 0.01]]);
const PY = moves(950, [[0, 880, 1.1], [S.E5, 690], [S.E6, 980], [S.E13 + 0.7, 1350, 0.01], [S.E14, 880], [S.E15 - 0.1, 2300, 0.7]]);
const PS = moves(0.94, [[0, 1, 1.1], [S.E5, 0.72], [S.E6, 0.62], [S.E13 + 0.7, 0.8, 0.01], [S.E14, 1], [S.E15, 0.85, 1.0]]);
const PRY = moves(-16, [[0, -12, 1.1], [S.E5, -8], [S.E6, 36], [S.E13 + 0.7, -14, 0.01], [S.E14, -10]]);
const PO = moves(1, [[S.E13, 0, 0.6], [S.E13 + 0.7, 0, 0.01], [S.E14, 1, 0.5], [S.E15 - 0.1, 0, 0.5]]);
const POPEN = moves(0, [[S.E6 + 0.3, 1], [S.E13, 0, 0.5]]);
const RINGS: [number, number][] = TL.sfx.filter((s) => s.type === "ring").map((s) => [s.t, s.t + 1.35]);

const World: React.FC<{ frame: number }> = ({ frame }) => {
  const t = frame / FPS;
  const camX = drift(t, 11, 14);
  const camY = drift(t, 12, 18);
  const ring = Math.max(0, ...RINGS.map(([a, b]) => windowed(t, a, b, 0.05, 0.1)));
  const x = tween(t, PX);
  const y = tween(t, PY) + drift(t, 1, 12);
  const sc = tween(t, PS);
  const ry = tween(t, PRY) + drift(t, 2, 5);
  const rx = 6 + drift(t, 3, 4);
  const rz = Math.sin(t * Math.PI * 2 * 9) * 1.6 * ring + drift(t, 5, 1.2);
  const op = tween(t, PO);
  const exitBlur = clamp01((t - S.E15) / 0.6) * 14;
  return (
    <AbsoluteFill>
      <Background t={t} camX={camX} camY={camY} />
      {/* floor shadow */}
      <div style={{
        position: "absolute", left: x - 210 * sc, top: y + (PHONE_H / 2) * sc + 18, width: 420 * sc, height: 70 * sc,
        borderRadius: "50%", background: "rgba(0,0,0,0.55)", filter: `blur(${26 * sc}px)`, opacity: op * 0.9,
      }} />
      <div style={{
        position: "absolute", left: x - PHONE_W / 2, top: y - PHONE_H / 2, width: PHONE_W, height: PHONE_H,
        scale: String(sc), opacity: op, perspective: 2200, filter: `drop-shadow(0 40px 60px rgba(0,0,0,0.55)) blur(${exitBlur}px)`,
      }}>
        <Phone t={t} ry={ry} rx={rx} rz={rz} open={tween(t, POPEN)} />
      </div>
      <IABadge frame={frame} t={t} />
      <LostCounter frame={frame} t={t} />
      <Flow frame={frame} t={t} />
      <CallBubbles frame={frame} t={t} />
      <BigSix frame={frame} t={t} />
      <CTA frame={frame} t={t} />
    </AbsoluteFill>
  );
};

/** ANTES grading: cold & desaturated (E1-E2), then desaturated red (E3). */
const Grade: React.FC<{ t: number; children: React.ReactNode }> = ({ t, children }) => {
  const red = clamp01((t - S.E3 + 0.1) / 0.25);
  return (
    <AbsoluteFill style={{ isolation: "isolate" }}>
      <AbsoluteFill style={{ filter: `saturate(${0.32 + red * 0.15}) brightness(0.86) contrast(1.06)` }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ background: "#4f78b0", mixBlendMode: "color", opacity: 0.32 * (1 - red) }} />
      <AbsoluteFill style={{ background: C.red, mixBlendMode: "color", opacity: 0.38 * red }} />
    </AbsoluteFill>
  );
};

const Blurred: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CameraMotionBlur samples={MB_SAMPLES} shutterAngle={180}>{children}</CameraMotionBlur>
);

const WorldLayer: React.FC = () => {
  const frame = useCurrentFrame();
  return <World frame={frame} />;
};

const CaptionLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill>
      <Captions frame={frame} t={t} />
      <Disclaimer t={t} />
    </AbsoluteFill>
  );
};

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const wipe = EASE(clamp01((t - S.WIPE) / (WIPE_END - S.WIPE)));
  const zoom = 1 + 0.08 * (t / TOTAL);
  const barY = wipe * 1920;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill style={{ scale: String(zoom) }}>
        {t < WIPE_END && (
          <AbsoluteFill style={{ clipPath: t >= S.WIPE ? `inset(${barY}px 0px 0px 0px)` : undefined }}>
            <Grade t={t}><Blurred><WorldLayer /></Blurred></Grade>
          </AbsoluteFill>
        )}
        {t >= S.WIPE && (
          <AbsoluteFill style={{ clipPath: t < WIPE_END ? `inset(0px 0px ${1920 - barY}px 0px)` : undefined }}>
            <Blurred><WorldLayer /></Blurred>
          </AbsoluteFill>
        )}
        <Blurred><CaptionLayer /></Blurred>
      </AbsoluteFill>
      {/* wipe: a bar of light that switches the colour on */}
      {t >= S.WIPE - 0.05 && t < WIPE_END + 0.15 && (
        <div style={{
          position: "absolute", left: -40, right: -40, top: barY - 9, height: 18, borderRadius: 18,
          background: "linear-gradient(90deg, rgba(61,220,151,0) 0%, #eafff5 30%, #ffffff 50%, #eafff5 70%, rgba(61,220,151,0) 100%)",
          boxShadow: "0 0 60px 24px rgba(61,220,151,0.75), 0 0 160px 60px rgba(61,220,151,0.35)",
          opacity: windowed(t, S.WIPE - 0.05, WIPE_END + 0.15, 0.06, 0.12),
        }} />
      )}
      <GrainVignette frame={frame} />
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};
