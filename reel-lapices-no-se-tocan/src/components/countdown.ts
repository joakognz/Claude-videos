import { LapizData } from "../theme";
import { LapizState } from "./Lapices3D";

/** Countdown state for frame f; everything is frozen from data.freeze on. The camera path is the one the
 *  Cycles plates were rendered with (src/timeline-lapiz.json), so the wireframe lines up with them. */
export const countdownState = (data: LapizData, f: number): LapizState => {
  const fz = Math.min(Math.max(0, Math.round(f)), data.freeze);
  const [dist, elev, az, ty, fov] = data.cam[fz];
  return {
    gap: data.gap[fz],
    cam: { dist, elev, az, ty, fov },
    solid: 1, wire: 0, redraw: Infinity, grey: 0, wireAlpha: 1, ripple: 0, ripplePhase: 0, gauge: 0,
    t: fz / data.fps,
  };
};
