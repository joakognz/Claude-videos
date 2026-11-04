import { Composition } from "remotion";
import { Reel } from "./Reel";
import { CuentaAtras } from "./components/CuentaAtras";
import { FICHAS, TL } from "./theme";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ReelUltimaFicha" component={Reel} durationInFrames={TL.durationInFrames} fps={TL.fps} width={1080} height={1920} />
    {/* the countdown on its own (reusable, themeless: every text comes in through props) */}
    <Composition id="CuentaAtras" component={CuentaAtras} durationInFrames={FICHAS.voice} fps={TL.fps} width={1080} height={1920}
      defaultProps={{ data: FICHAS, hudTag: "CAM 01", label: "ÚLTIMA FICHA EN", doneLabel: "CONGELADA" }} />
  </>
);
