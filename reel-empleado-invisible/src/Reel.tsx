import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, CAM_PIVOT, FPS, beaconAt, camScale, orangeAt, partAt } from "./theme";
import { Bokeh, CityBack, CityFront, GroundGlow, View, Wave, WindowPatterns } from "./components/City";
import { ChaosIcons, ShopFront, ShopInterior } from "./components/Shop";
import { Phone } from "./components/Phone";
import { Captions } from "./components/Captions";
import { Cards, CommentBar, Counters, GhostLabels, Outro, PhoneLink, Tasks } from "./components/Overlays";

const Filters: React.FC = () => (
  <defs>
    <filter id="blur6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
    <filter id="blur12" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12" /></filter>
    <filter id="blur18" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18" /></filter>
    {/* the sign's text lives in world units (1 unit ≈ 58 px), so its glow blur is tiny in those units */}
    <filter id="blurSign" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="0.09" /></filter>
  </defs>
);

/** One shot: a far → close dolly over 0-4 s, then the camera is locked. Only light, people and overlays change. No audio. */
export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const o = orangeAt(t);
  const parts = Math.max(...[0, 1, 2, 3].map((k) => partAt(t, k)));
  const s = camScale(t);
  const [px, py] = CAM_PIVOT;
  const view: View = { x0: px - px / s, x1: px + (1080 - px) / s, y0: py - py / s, y1: py + (1920 - py) / s };
  const fog = 1 - Math.min(1, t / 3.2);
  const beacon = beaconAt(t);
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <Filters />
        <WindowPatterns />
        <rect x={0} y={0} width={1080} height={1920} fill="url(#sky)" />
        <g transform={`translate(${px} ${py}) scale(${s}) translate(${-px} ${-py})`}>
          <CityBack t={t} view={view} o={o} s={s} />
          <GroundGlow o={o} p={parts} t={t} />
          <ShopInterior t={t} />
          <ShopFront t={t} />
          <CityFront t={t} view={view} o={o} s={s} />
          <Wave t={t} />
          <ChaosIcons t={t} />
        </g>
        {/* aerial haze at the far end of the opening move hides the city's edge */}
        {fog > 0 && <rect x={0} y={0} width={1080} height={1920} fill="url(#fog)" opacity={fog} />}
        {/* E8: the city dims around the shop, which stays lit like a lighthouse */}
        {beacon > 0 && (
          <>
            <defs>
              <radialGradient id="beacon" cx="540" cy="960" r="760" gradientUnits="userSpaceOnUse">
                <stop offset="0.28" stopColor="#000" stopOpacity="0" />
                <stop offset="1" stopColor="#000" stopOpacity="0.8" />
              </radialGradient>
            </defs>
            <rect x={0} y={0} width={1080} height={1920} fill="url(#beacon)" opacity={beacon} />
            <circle cx={560} cy={960} r={260} fill={C.orange} opacity={beacon * (0.1 + 0.04 * Math.sin(t * 3))} filter="url(#blur18)" style={{ mixBlendMode: "screen" }} />
          </>
        )}
        <Bokeh t={t} o={o} />
      </svg>
      {/* top shade keeps the captions legible over the skyline */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 26%, rgba(0,0,0,0) 38%)" }} />
      <GhostLabels t={t} />
      <PhoneLink t={t} />
      <Tasks t={t} />
      <Cards t={t} />
      <Counters t={t} />
      <Phone t={t} />
      <CommentBar t={t} />
      <Captions t={t} />
      <Outro t={t} />
    </AbsoluteFill>
  );
};
