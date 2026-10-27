import { Composition } from "remotion";
import { FPS, TOTAL_SECONDS } from "./reel/anim";
import { Reel } from "./reel/Reel";
import { SalonReel } from "./salon/SalonReel";
import { TOTAL as SALON_TOTAL } from "./salon/timeline";

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
      <Composition
        id="AIgencyxPeluqueria"
        component={SalonReel}
        durationInFrames={Math.ceil(SALON_TOTAL * FPS)}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ motionBlur: true }}
      />
      <Composition
        id="AIgencyxPeluqueriaPreview"
        component={SalonReel}
        durationInFrames={Math.ceil(SALON_TOTAL * FPS)}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ motionBlur: false }}
      />
    </>
  );
};
