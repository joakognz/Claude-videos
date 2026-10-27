import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { BOT_Y, FPS, PANEL_H, PANEL_W, PANEL_X, S, TL, TOP_Y, clamp01, drift, windowed, EASE_OUT } from "./theme";
import { Background, GrainVignette } from "./components/Background";
import { PanelScene } from "./components/Panel";
import { Side } from "./components/Phone";
import { Clock } from "./components/Clock";
import { Captions } from "./components/Captions";
import { AiPill, ClientLights, ClientsLabel, Disclaimer, Kicker } from "./components/Overlays";

const TOTAL = TL.durationInFrames / FPS;
const MB_SAMPLES = 5;

/** One rounded "window" per business. The panel that is not being talked about steps back a little. */
const PanelFrame: React.FC<{ t: number; side: Side; camX: number; camY: number }> = ({ t, side, camX, camY }) => {
  const top = side === "top";
  const enter = EASE_OUT(clamp01(t / 0.9));
  // E2 talks about the top business, E3 about the bottom one
  const dim = top ? windowed(t, S.E3, S.E4, 0.4, 0.4) : windowed(t, S.E2, S.E3, 0.4, 0.4);
  const y = (top ? TOP_Y : BOT_Y) + (1 - enter) * (top ? -40 : 40);
  return (
    <div style={{
      position: "absolute", left: PANEL_X, top: y, width: PANEL_W, height: PANEL_H, borderRadius: 40, overflow: "hidden",
      isolation: "isolate", border: "2px solid rgba(255,255,255,0.08)",
      boxShadow: "0 30px 70px rgba(0,0,0,0.55)", scale: String((1.03 - 0.03 * enter) * (1 - 0.015 * dim)),
      filter: `brightness(${1 - 0.25 * dim})`,
      translate: `${drift(t, top ? 81 : 82, 4)}px ${drift(t, top ? 83 : 84, 3)}px`,
    }}>
      <PanelScene t={t} side={side} camX={camX} camY={camY} />
    </div>
  );
};

const World: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const camX = drift(t, 11, 14);
  const camY = drift(t, 12, 18);
  return (
    <AbsoluteFill>
      <Background t={t} camX={camX} camY={camY} />
      <PanelFrame t={t} side="top" camX={camX} camY={camY} />
      <PanelFrame t={t} side="bottom" camX={camX} camY={camY} />
      <Clock t={t} />
      <ClientLights t={t} />
      <AiPill t={t} frame={frame} />
      <Kicker t={t} frame={frame} />
      <Captions frame={frame} t={t} />
      <ClientsLabel t={t} frame={frame} />
      <Disclaimer t={t} />
    </AbsoluteFill>
  );
};

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  // constant camera push 1.0 → 1.08 over the whole reel
  const zoom = 1 + 0.08 * (t / TOTAL);
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B1F1A" }}>
      <AbsoluteFill style={{ scale: String(zoom) }}>
        <CameraMotionBlur samples={MB_SAMPLES} shutterAngle={180}>
          <World />
        </CameraMotionBlur>
      </AbsoluteFill>
      <GrainVignette frame={frame} />
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};
