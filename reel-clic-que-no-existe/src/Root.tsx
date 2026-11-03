import { Composition } from "remotion";
import { Reel } from "./Reel";
import { EngranajesCuentaAtras } from "./components/EngranajesCuentaAtras";
import { ENGR, TL } from "./theme";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ReelClic" component={Reel} durationInFrames={TL.durationInFrames} fps={TL.fps} width={1080} height={1920} />
    {/* the countdown on its own (reusable, themeless: every text comes in through props) */}
    <Composition id="EngranajesCuentaAtras" component={EngranajesCuentaAtras} durationInFrames={ENGR.voice} fps={TL.fps} width={1080} height={1920}
      defaultProps={{ data: ENGR, hudTag: "CAM 01", label: "ENCAJE EN", doneLabel: "ENCAJADO" }} />
  </>
);
