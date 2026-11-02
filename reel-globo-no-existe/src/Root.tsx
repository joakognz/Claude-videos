import { Composition } from "remotion";
import { Reel } from "./Reel";
import { GloboCuentaAtras } from "./components/GloboCuentaAtras";
import { GLOBO, TL } from "./theme";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ReelGloboNoExiste" component={Reel} durationInFrames={TL.durationInFrames} fps={TL.fps} width={1080} height={1920} />
    {/* the countdown on its own (reusable, themeless: every text comes in through props) */}
    <Composition id="GloboCuentaAtras" component={GloboCuentaAtras} durationInFrames={GLOBO.voice} fps={TL.fps} width={1080} height={1920}
      defaultProps={{ data: GLOBO, hudTag: "CAM 01", label: "CUENTA ATRÁS" }} />
  </>
);
