import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { C, FPS, S, TL, clamp01, drift, moves, tween, windowed, EASE } from "./theme";
import { Background, GrainVignette } from "./components/Background";
import { Phone, PHONE_H, PHONE_W } from "./components/Phone";
import { Captions } from "./components/Captions";
import { BigClock, Disclaimer, LostCounter, UnreadBadge } from "./components/Overlays";
import { Flow } from "./components/Flow";
import { BigSix, CTA } from "./components/Finale";

const TOTAL = TL.durationInFrames / FPS;
const WIPE_END = S.E4 + 0.1;
const MB_SAMPLES = 5;

// ── the one phone, choreographed across the whole reel ──────────────────
// E1 settle → E5 grows so the chat reads at ≥ 44 px → E6 steps aside and opens → E13 hides behind the 6
// → E14 back in the centre (the loop) → E15 drops out for the CTA
const PX = moves(540, [[S.E6, 150], [S.E13 + 0.7, 540, 0.01]]);
const PY = moves(970, [[0, 922, 1.1], [S.E5 - 0.45, 1022], [S.E6, 980], [S.E13 + 0.7, 1250, 0.01], [S.E14 - 0.25, 900], [S.E15 - 0.1, 2300, 0.8]]);
const PS = moves(0.84, [[0, 0.9, 1.1], [S.E5 - 0.45, 1.45], [S.E6, 0.62], [S.E13 + 0.7, 0.75, 0.01], [S.E14 - 0.25, 0.9], [S.E15 - 0.1, 0.8, 0.8]]);
const PRY = moves(-18, [[0, -11, 1.1], [S.E5 - 0.45, -4], [S.E6, 32], [S.E13 + 0.7, -16, 0.01], [S.E14 - 0.25, -10]]);
const PO = moves(1, [[S.E13, 0, 0.5], [S.E14 - 0.25, 1, 0.5], [S.E15 + 0.2, 0, 0.5]]);
const POPEN = moves(0, [[S.E6 + 0.3, 1], [S.E13, 0, 0.5]]);
// each incoming DM makes the phone buzz
const BUZZ: [number, number][] = TL.sfx.filter((s) => s.type === "incoming").map((s) => [s.t, s.t + 0.35]);

const phonePose = (t: number) => {
  const buzz = Math.max(0, ...BUZZ.map(([a, b]) => windowed(t, a, b, 0.03, 0.12)));
  return {
    x: tween(t, PX) + Math.sin(t * Math.PI * 2 * 14) * 5 * buzz,
    y: tween(t, PY) + drift(t, 1, 12),
    sc: tween(t, PS),
    op: tween(t, PO),
    ry: tween(t, PRY) + drift(t, 2, 5),
    rx: 6 + drift(t, 3, 4),
    rz: Math.sin(t * Math.PI * 2 * 11) * 1.4 * buzz + drift(t, 5, 1.2),
  };
};

const World: React.FC<{ frame: number; after: boolean }> = ({ frame, after }) => {
  const t = frame / FPS;
  const camX = drift(t, 11, 14);
  const camY = drift(t, 12, 18);
  const { x, y, sc, ry, rx, rz, op } = phonePose(t);
  return (
    <AbsoluteFill>
      <Background t={t} camX={camX} camY={camY} />
      <BigClock frame={frame} t={t} camX={camX} camY={camY} />
      {after && <Flow frame={frame} t={t} />}
      {op > 0.001 && (
        <>
          {/* floor shadow */}
          <div style={{
            position: "absolute", left: x - 210 * sc, top: y + (PHONE_H / 2) * sc + 18, width: 420 * sc, height: 70 * sc,
            borderRadius: "50%", background: "rgba(0,0,0,0.55)", filter: `blur(${26 * sc}px)`, opacity: 0.9 * op,
          }} />
          <div style={{
            position: "absolute", left: x - PHONE_W / 2, top: y - PHONE_H / 2, width: PHONE_W, height: PHONE_H,
            scale: String(sc), opacity: op, perspective: 2200, filter: `drop-shadow(0 40px 60px rgba(0,0,0,0.55)) blur(${(1 - op) * 14}px)`,
          }}>
            <Phone t={t} frame={frame} after={after} ry={ry} rx={rx} rz={rz} open={tween(t, POPEN)} />
          </div>
        </>
      )}
      {!after && <LostCounter frame={frame} t={t} />}
    </AbsoluteFill>
  );
};

/** ANTES grading: cold & desaturated (E1-E2), then desaturated red (E3). `k` scales it (E14 loop: cold again). */
const Grade: React.FC<{ k: number; red: number; children: React.ReactNode }> = ({ k, red, children }) => (
  <AbsoluteFill style={{ isolation: "isolate" }}>
    <AbsoluteFill style={{ filter: `saturate(${1 - k * (0.68 - red * 0.15)}) brightness(${1 - 0.16 * k}) contrast(${1 + 0.06 * k})` }}>{children}</AbsoluteFill>
    <AbsoluteFill style={{ background: "#4f78b0", mixBlendMode: "color", opacity: 0.32 * k * (1 - red) }} />
    <AbsoluteFill style={{ background: C.red, mixBlendMode: "color", opacity: 0.38 * k * red }} />
  </AbsoluteFill>
);

const Blurred: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CameraMotionBlur samples={MB_SAMPLES} shutterAngle={180}>{children}</CameraMotionBlur>
);

const WorldLayer: React.FC<{ after: boolean }> = ({ after }) => {
  const frame = useCurrentFrame();
  return <World frame={frame} after={after} />;
};

/** The unread badge keeps its full red even inside the graded parts; it rides the camera push with the phone. */
const BadgeLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const { x, y, sc } = phonePose(t);
  return <UnreadBadge frame={frame} t={t} after={t >= S.E4} x={x + (PHONE_W / 2 - 34) * sc} y={y - (PHONE_H / 2 - 30) * sc} />;
};

/** Text stays outside the camera push so it never drifts into the unsafe strips. */
const TextLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill>
      <Captions frame={frame} t={t} />
      <Disclaimer t={t} />
      <BigSix frame={frame} t={t} />
      <CTA frame={frame} t={t} />
    </AbsoluteFill>
  );
};

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const wipe = EASE(clamp01((t - S.WIPE) / (WIPE_END - S.WIPE)));
  const zoom = 1 + 0.08 * (t / TOTAL);
  const barY = wipe * 1920;
  const red = clamp01((t - S.E3 + 0.1) / 0.25);
  const cold = windowed(t, S.E14 - 0.25, S.E15 - 0.1, 0.4, 0.4);
  const afterWorld = <Blurred><WorldLayer after /></Blurred>;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill style={{ scale: String(zoom) }}>
        {t < WIPE_END && (
          <AbsoluteFill style={{ clipPath: t >= S.WIPE ? `inset(${barY}px 0px 0px 0px)` : undefined }}>
            <Grade k={1} red={red}><Blurred><WorldLayer after={false} /></Blurred></Grade>
          </AbsoluteFill>
        )}
        {t >= S.WIPE && (
          <AbsoluteFill style={{ clipPath: t < WIPE_END ? `inset(0px 0px ${1920 - barY}px 0px)` : undefined }}>
            {cold > 0 ? <Grade k={cold * 0.8} red={0}>{afterWorld}</Grade> : afterWorld}
          </AbsoluteFill>
        )}
        <Blurred><BadgeLayer /></Blurred>
      </AbsoluteFill>
      <Blurred><TextLayer /></Blurred>
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
