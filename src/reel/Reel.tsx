import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "./anim";
import { City } from "./City";
import { fontFamily } from "./fonts";
import { Headlines } from "./Headline";
import { MotionBlur } from "./MotionBlur";
import { Phone } from "./Phone";
import { CommentBox, dimAmount, Interior, LateNight, ProcessIcons, ReviewAndReturn, TravelBubble, Walkers } from "./Scenes";
import { camera, T } from "./timeline";

const SHUTTER = 0.6; // fracción de fotograma (≈216°)

/** Desplazamiento máximo en pantalla (px) que produce la cámara durante el obturador. */
const cameraTravel = (t: number, fps: number) => {
  const dt = SHUTTER / fps / 2;
  const a = camera(t - dt);
  const b = camera(t + dt);
  let max = 0;
  for (const [sx, sy] of [[0, 0], [1080, 0], [0, 1920], [1080, 1920], [540, 960]]) {
    const wx = (sx - 540) / a.zoom + a.cx;
    const wy = (sy - 960) / a.zoom + a.cy;
    const nx = (wx - b.cx) * b.zoom + 540;
    const ny = (wy - b.cy) * b.zoom + 960;
    max = Math.max(max, Math.hypot(nx - sx, ny - sy));
  }
  return max;
};

/** Ventanas con movimiento rápido de interfaz (entradas, transiciones, vuelos). */
const UI_FAST: [number, number][] = [
  [T.s3, 0.5], [T.s4 - 0.05, 0.4], [T.s5 - 0.05, 0.45], [T.s6 - 0.05, 0.4], [T.s6fill, 0.5],
  [T.s8 - 0.05, 0.45], [T.s8 + 0.3, 0.4], [T.s10 - 0.2, 0.35], [T.s11, 0.4], [T.s12, 0.45],
  [T.s13 + 0.1, 1.0], [T.s14brand, 0.4], ...T.icons.map((x) => [x, 0.4] as [number, number]),
  [T.s15 + 0.1, 0.6], [T.s16 + 0.1, 0.5], [T.close - 0.1, 0.5],
];
const uiSamples = (t: number) => (UI_FAST.some(([a, d]) => t >= a - 0.05 && t <= a + d) ? 16 : 5);

const WorldLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ backgroundColor: "#06070A" }}>
      <City t={t} sceneWalkers={<Walkers t={t} />} />
    </AbsoluteFill>
  );
};

const UILayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ fontFamily, fontFeatureSettings: '"cv08" 1' }}>
      <TravelBubble t={t} />
      <ReviewAndReturn t={t} />
      <Phone t={t} />
      <Interior t={t} />
      <LateNight t={t} />
      <ProcessIcons t={t} />
      <CommentBox t={t} />
      <Headlines t={t} />
    </AbsoluteFill>
  );
};

/** Desenfoque tilt-shift: bandas superior e inferior desenfocadas sobre el mundo. */
const TiltShift: React.FC = () => (
  <>
    {[
      { top: 0, height: 820, dir: "180deg", hard: "35%" },
      { bottom: 0, height: 760, dir: "0deg", hard: "30%" },
    ].map(({ dir, hard, ...pos }) => (
      <div
        key={dir}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          ...pos,
          backdropFilter: "blur(9px)",
          WebkitMaskImage: `linear-gradient(${dir}, black 0%, black ${hard}, transparent 100%)`,
          maskImage: `linear-gradient(${dir}, black 0%, black ${hard}, transparent 100%)`,
        }}
      />
    ))}
  </>
);

export const Reel: React.FC<{ motionBlur?: boolean }> = ({ motionBlur = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const travel = cameraTravel(t, fps);
  const worldN = motionBlur ? (travel < 0.6 ? 1 : clamp(Math.ceil(travel / 3), 3, 16)) : 1;
  const uiN = motionBlur ? uiSamples(t) : 1;
  return (
    <AbsoluteFill style={{ backgroundColor: "#06070A", overflow: "hidden" }}>
      <AbsoluteFill style={{ isolation: "isolate" }}>
        <MotionBlur samples={worldN} shutter={SHUTTER}>
          <WorldLayer />
        </MotionBlur>
        <TiltShift />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#06070A", opacity: dimAmount(t) }} />
      {/* viñeta y velo superior para la legibilidad del texto */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 65% at 50% 55%, transparent 55%, rgba(3,4,6,0.75) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,6,8,0.88) 0%, rgba(5,6,8,0.55) 22%, rgba(5,6,8,0) 38%)" }} />
      <MotionBlur samples={uiN} shutter={SHUTTER}>
        <UILayer />
      </MotionBlur>
      <Audio src={staticFile("voiceover_30s.mp3")} />
      <Audio src={staticFile("music_30s.wav")} />
    </AbsoluteFill>
  );
};
