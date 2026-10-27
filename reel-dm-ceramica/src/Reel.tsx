import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { C, FPS, S, TL, clamp01, drift, moves, tween, windowed, EASE } from "./theme";
import { Background, GrainVignette } from "./components/Background";
import { Phone, PHONE_H, PHONE_W } from "./components/Phone";
import { Captions } from "./components/Captions";
import { BigClock, Disclaimer, LostCounter, UnreadBadge } from "./components/Overlays";

const TOTAL = TL.durationInFrames / FPS;
const WIPE_END = S.E4 + 0.1;
const MB_SAMPLES = 5;

// ── the one phone, choreographed across the whole reel ──────────────────
const PX = moves(540, []);
const PY = moves(970, [[0, 922, 1.1]]);
const PS = moves(0.84, [[0, 0.9, 1.1]]);
const PRY = moves(-18, [[0, -11, 1.1]]);
// each incoming DM makes the phone buzz
const BUZZ: [number, number][] = TL.sfx.filter((s) => s.type === "incoming").map((s) => [s.t, s.t + 0.35]);

const phonePose = (t: number) => {
  const buzz = Math.max(0, ...BUZZ.map(([a, b]) => windowed(t, a, b, 0.03, 0.12)));
  return {
    x: tween(t, PX) + Math.sin(t * Math.PI * 2 * 14) * 5 * buzz,
    y: tween(t, PY) + drift(t, 1, 12),
    sc: tween(t, PS),
    ry: tween(t, PRY) + drift(t, 2, 5),
    rx: 6 + drift(t, 3, 4),
    rz: Math.sin(t * Math.PI * 2 * 11) * 1.4 * buzz + drift(t, 5, 1.2),
  };
};

const World: React.FC<{ frame: number; after: boolean }> = ({ frame, after }) => {
  const t = frame / FPS;
  const camX = drift(t, 11, 14);
  const camY = drift(t, 12, 18);
  const { x, y, sc, ry, rx, rz } = phonePose(t);
  return (
    <AbsoluteFill>
      <Background t={t} camX={camX} camY={camY} />
      <BigClock frame={frame} t={t} camX={camX} camY={camY} />
      {/* floor shadow */}
      <div style={{
        position: "absolute", left: x - 210 * sc, top: y + (PHONE_H / 2) * sc + 18, width: 420 * sc, height: 70 * sc,
        borderRadius: "50%", background: "rgba(0,0,0,0.55)", filter: `blur(${26 * sc}px)`, opacity: 0.9,
      }} />
      <div style={{
        position: "absolute", left: x - PHONE_W / 2, top: y - PHONE_H / 2, width: PHONE_W, height: PHONE_H,
        scale: String(sc), perspective: 2200, filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.55))",
      }}>
        <Phone t={t} frame={frame} after={after} ry={ry} rx={rx} rz={rz} />
      </div>
      {!after && <LostCounter frame={frame} t={t} />}
    </AbsoluteFill>
  );
};

/** ANTES grading: cold & desaturated (E1-E2), then desaturated red (E3). */
const Grade: React.FC<{ t: number; children: React.ReactNode }> = ({ t, children }) => {
  const red = clamp01((t - S.E3 + 0.1) / 0.25);
  return (
    <AbsoluteFill style={{ isolation: "isolate" }}>
      <AbsoluteFill style={{ filter: `saturate(${0.32 + red * 0.15}) brightness(0.84) contrast(1.06)` }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ background: "#4f78b0", mixBlendMode: "color", opacity: 0.32 * (1 - red) }} />
      <AbsoluteFill style={{ background: C.red, mixBlendMode: "color", opacity: 0.38 * red }} />
    </AbsoluteFill>
  );
};

const Blurred: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CameraMotionBlur samples={MB_SAMPLES} shutterAngle={180}>{children}</CameraMotionBlur>
);

const WorldLayer: React.FC<{ after: boolean }> = ({ after }) => {
  const frame = useCurrentFrame();
  return <World frame={frame} after={after} />;
};

/** Overlays that keep their full colour even inside the graded ANTES part. */
const CaptionLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const { x, y, sc } = phonePose(t);
  return (
    <AbsoluteFill>
      <UnreadBadge frame={frame} t={t} after={t >= S.E4} x={x + (PHONE_W / 2 - 34) * sc} y={y - (PHONE_H / 2 - 30) * sc} />
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
            <Grade t={t}><Blurred><WorldLayer after={false} /></Blurred></Grade>
          </AbsoluteFill>
        )}
        {t >= S.WIPE && (
          <AbsoluteFill style={{ clipPath: t < WIPE_END ? `inset(0px 0px ${1920 - barY}px 0px)` : undefined }}>
            <Blurred><WorldLayer after /></Blurred>
          </AbsoluteFill>
        )}
        <Blurred><CaptionLayer /></Blurred>
      </AbsoluteFill>
      {/* wipe: a bar of light that switches the colour on */}
      {t >= S.WIPE - 0.05 && t < WIPE_END + 0.15 && (
        <div style={{
          position: "absolute", left: -40, right: -40, top: barY - 9, height: 18, borderRadius: 18,
          background: "linear-gradient(90deg, rgba(61,220,151,0) 0%, #e4fff2 30%, #ffffff 50%, #e4fff2 70%, rgba(61,220,151,0) 100%)",
          boxShadow: "0 0 60px 24px rgba(61,220,151,0.75), 0 0 160px 60px rgba(61,220,151,0.35)",
          opacity: windowed(t, S.WIPE - 0.05, WIPE_END + 0.15, 0.06, 0.12),
        }} />
      )}
      <GrainVignette frame={frame} />
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};
