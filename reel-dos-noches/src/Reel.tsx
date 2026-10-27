import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { CLOCK_H, CLOCK_Y, FPS, PANEL_H, PANEL_W, PANEL_X, S, TL, clamp01, drift, windowed, EASE_OUT } from "./theme";
import { expandP, heroP, mergeP, panelDrift, panelRect } from "./layout";
import { Background, GrainVignette } from "./components/Background";
import { PanelScene } from "./components/Panel";
import { Side } from "./components/Phone";
import { Clock } from "./components/Clock";
import { Captions } from "./components/Captions";
import { AiPill, ClientLights, ClientsLabel, Disclaimer, Kicker } from "./components/Overlays";
import { NightCards, NightCounters } from "./components/Night";
import { BigFive, HeroPhone, LightSweep, ZeroColumn } from "./components/Morning";
import { BrandBadge, CTA } from "./components/Finale";

const TOTAL = TL.durationInFrames / FPS;
const MB_SAMPLES = 5;

/** One rounded "window" per business. The panel that is not being talked about steps back a little. */
const PanelFrame: React.FC<{ t: number; side: Side; camX: number; camY: number }> = ({ t, side, camX, camY }) => {
  const top = side === "top";
  const enter = EASE_OUT(clamp01(t / 0.9));
  // E2 talks about the top business, E3 about the bottom one
  const dim = top ? windowed(t, S.E3, S.E4, 0.4, 0.4) : windowed(t, S.E2, S.E3, 0.4, 0.4);
  const r = panelRect(side, t);
  const d = panelDrift(side, t);
  const ex = expandP(side, t);
  const m = mergeP(t);
  if (m >= 1) return null;
  const y = r.y + (1 - enter) * (top ? -40 : 40);
  // E9: both slide into the clock band and melt away
  const toClock = (CLOCK_Y + CLOCK_H / 2 - (r.y + r.h / 2)) * m;
  return (
    <div style={{
      position: "absolute", left: PANEL_X, top: y, width: PANEL_W, height: r.h, borderRadius: 40, overflow: "hidden",
      isolation: "isolate", border: "2px solid rgba(255,255,255,0.08)", backgroundColor: "#07110d",
      boxShadow: "0 30px 70px rgba(0,0,0,0.55)", scale: String((1.03 - 0.03 * enter) * (1 - 0.015 * dim) * (1 - 0.55 * m)),
      filter: `brightness(${1 - 0.25 * dim}) blur(${m * 12}px)`, opacity: 1 - m,
      translate: `${d.x}px ${d.y + toClock}px`,
    }}>
      {/* the room grows with the panel (camera push) and falls back into soft focus behind the close-up */}
      <div style={{
        position: "absolute", left: 0, top: 0, width: PANEL_W, height: PANEL_H, transformOrigin: "50% 0%",
        scale: String(r.h / PANEL_H), filter: ex > 0.001 ? `blur(${ex * 7}px) brightness(${1 - 0.45 * ex})` : undefined,
      }}>
        <PanelScene t={t} side={side} camX={camX} camY={camY} hidePhone={heroP(side, t) > 0.001} />
      </div>
    </div>
  );
};

const World: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const camX = drift(t, 11, 14);
  const camY = drift(t, 12, 18);
  const clockO = 1 - windowed(t, S.E7, S.E9 + 0.15, 0.35, 0.45);
  return (
    <AbsoluteFill>
      <Background t={t} camX={camX} camY={camY} />
      <PanelFrame t={t} side="top" camX={camX} camY={camY} />
      <PanelFrame t={t} side="bottom" camX={camX} camY={camY} />
      <div style={{ position: "absolute", inset: 0, opacity: clockO }}>
        <Clock t={t} />
      </div>
      <ClientLights t={t} />
      <AiPill t={t} frame={frame} />
      <NightCards t={t} frame={frame} />
      <HeroPhone t={t} side="top" />
      <HeroPhone t={t} side="bottom" />
      <ZeroColumn t={t} frame={frame} />
      <BigFive t={t} frame={frame} />
      <LightSweep t={t} />
    </AbsoluteFill>
  );
};

/** Text stays outside the camera push so it never drifts into the unsafe strips. */
const TextLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill>
      <Kicker t={t} frame={frame} />
      <Captions frame={frame} t={t} />
      <NightCounters t={t} frame={frame} />
      <ClientsLabel t={t} frame={frame} />
      <BrandBadge t={t} frame={frame} />
      <CTA t={t} frame={frame} />
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
      <CameraMotionBlur samples={MB_SAMPLES} shutterAngle={180}>
        <TextLayer />
      </CameraMotionBlur>
      <GrainVignette frame={frame} />
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};
