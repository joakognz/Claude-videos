import { Composition } from "remotion";
import { Reel } from "./Reel";
import { LapicesCuentaAtras, ZoomBlurSubframes } from "./components/LapicesCuentaAtras";
import { LAPIZ, TL } from "./theme";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ReelLapices" component={Reel} durationInFrames={TL.durationInFrames} fps={TL.fps} width={1080} height={1920} />
    {/* the countdown on its own (reusable, themeless: every text comes in through props) */}
    <Composition id="LapicesCuentaAtras" component={LapicesCuentaAtras} durationInFrames={LAPIZ.voice} fps={TL.fps} width={1080} height={1920}
      defaultProps={{ data: LAPIZ, hudTag: "CAM 01", label: "CUENTA ATRÁS" }} />
    {/* subframes of the dolly-in, averaged into motion blur by scripts/render.sh */}
    <Composition id="ZoomBlur" component={ZoomBlurSubframes} fps={TL.fps * LAPIZ.blur.samples}
      durationInFrames={(LAPIZ.blur.to - LAPIZ.blur.from) * LAPIZ.blur.samples} width={1080} height={1920} defaultProps={{ data: LAPIZ }} />
  </>
);
