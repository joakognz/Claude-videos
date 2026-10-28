import { Composition } from "remotion";
import { Reel } from "./Reel";
import { DURATION, FPS } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ReelEmpleadoInvisible"
      component={Reel}
      durationInFrames={DURATION * FPS}
      fps={FPS}
      width={1080}
      height={1920}
    />
  );
};
