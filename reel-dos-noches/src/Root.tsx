import { Composition } from "remotion";
import { Reel } from "./Reel";
import { TL } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ReelDosNoches"
      component={Reel}
      durationInFrames={TL.durationInFrames}
      fps={TL.fps}
      width={1080}
      height={1920}
    />
  );
};
