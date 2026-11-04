import { Composition } from "remotion";
import { Reel } from "./Reel";
import { GotaCuentaAtras } from "./components/GotaCuentaAtras";
import { GOTA, TL } from "./theme";
import timeline from "./timeline.json";

const BEATS = (timeline as unknown as { beats: number[] }).beats;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ReelGota" component={Reel} durationInFrames={TL.durationInFrames} fps={TL.fps} width={1080} height={1920} />
    {/* the countdown on its own (reusable, themeless: every text comes in through props) */}
    <Composition id="GotaCuentaAtras" component={GotaCuentaAtras} durationInFrames={GOTA.voice} fps={TL.fps} width={1080} height={1920}
      defaultProps={{ data: GOTA, beats: BEATS, hudTag: "CAM 01 · 888 FPS", label: "CAE EN", doneLabel: "SUSPENDIDA" }} />
  </>
);
