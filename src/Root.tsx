import { Composition } from "remotion";
import { FPS, TOTAL_SECONDS } from "./reel/anim";
import { Reel } from "./reel/Reel";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AIgencyxReel"
        component={Reel}
        durationInFrames={Math.ceil(TOTAL_SECONDS * FPS)}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ motionBlur: true }}
      />
      {/* Variante sin desenfoque de movimiento para previsualizar rápido */}
      <Composition
        id="AIgencyxReelPreview"
        component={Reel}
        durationInFrames={Math.ceil(TOTAL_SECONDS * FPS)}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ motionBlur: false }}
      />
    </>
  );
};
