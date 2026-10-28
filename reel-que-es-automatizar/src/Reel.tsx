import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { FPS, orangeAt } from "./theme";
import { Bokeh, CityBack, CityFront, GroundGlow, Wave } from "./components/City";
import { ChaosIcons, ShopFront, ShopInterior } from "./components/Shop";
import { Phone } from "./components/Phone";
import { Captions } from "./components/Captions";
import { CommentBar, Counters, ListPanel, Outro, PhoneLine, Watermark, WebSign } from "./components/Overlays";

const Filters: React.FC = () => (
  <defs>
    <filter id="blur6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
    <filter id="blur12" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12" /></filter>
    <filter id="blur18" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18" /></filter>
    {/* the sign's text lives in world units (1 unit ≈ 46 px), so its glow blur is tiny in those units */}
    <filter id="blurSign" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="0.09" /></filter>
  </defs>
);

/** One fixed shot: the camera never moves. Only light, elements and text change. */
export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const o = orangeAt(t);
  return (
    <AbsoluteFill style={{ background: "#030304" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <Filters />
        <CityBack t={t} />
        <GroundGlow o={o} />
        <ShopInterior t={t} />
        <ShopFront t={t} />
        <CityFront t={t} />
        <Wave t={t} />
        <ChaosIcons t={t} />
        <Bokeh t={t} o={o} />
      </svg>
      {/* top shade keeps the captions legible over the skyline */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 28%, rgba(0,0,0,0) 40%)" }} />
      <PhoneLine t={t} />
      <ListPanel t={t} />
      <WebSign t={t} />
      <Counters t={t} />
      <Phone t={t} />
      <CommentBar t={t} />
      <Watermark t={t} />
      <Captions t={t} />
      <Outro t={t} />
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};
