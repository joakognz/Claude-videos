import { EASE, EASE_IN, EASE_OUT, EV, GLOBO, S, clamp01, lerp, ramp } from "../theme";
import { GloboState } from "./Globo3D";
import { TOP_Y } from "./geometry";
import { countdownState } from "./countdown";
import { redrawAngle } from "./MallaTrazada";

export const GLITCH_FRAMES = 6;

/**
 * Balloon state once the voice is in (t ≥ 7 s): frozen image → glitch on «existe» → orange wireframe
 * → mesh redrawn vertex by vertex → calm + pull back → zoom out among other generic figures.
 */
export const wireframeState = (t: number, frame: number): GloboState => {
  const s = countdownState(GLOBO, GLOBO.freeze); // the frozen frame 195
  const fNo = Math.round(EV.noExiste * 30);
  if (frame < fNo) return s;

  // glitch: 6 frames flipping between skin and mesh, then mesh only
  const g = frame - fNo;
  const glitching = g < GLITCH_FRAMES;
  const wireNow = glitching ? [1, 0, 1, 1, 0, 1][g] : 1;
  s.solid = 1 - wireNow;
  s.wire = wireNow;
  s.dense = 1;
  const tw = t - EV.noExiste;

  // wavy grid curving into the dimple; calms down in scene 4
  const calm = ramp(t, S.S4, S.S4 + 1.2);
  s.deform.ripple = 0.006 * (1 - calm) * (glitching ? 2.5 : 1);
  s.deform.ripplePhase = tw * 7;
  s.t = tw;
  s.redraw = redrawAngle(t);

  // camera: from the frozen macro, a slow orbit while the mesh redraws, a pull back on "Y tú…",
  // then the zoom out to the grid of figures
  const c0 = s.cam;
  const orbit = ramp(t, S.S3, S.S4 + 0.4, EASE) * 0.32;
  const pull = ramp(t, S.S4 + 0.1, S.S5, EASE);
  const out = ramp(t, S.S5 - 0.05, S.S6 + 0.2, (x) => EASE_OUT(EASE_IN(x) * 0.25 + x * 0.75));
  const dist = Math.exp(lerp(lerp(Math.log(c0.dist), Math.log(11), pull), Math.log(48), out));
  s.cam = {
    dist,
    elev: lerp(lerp(c0.elev + orbit * 0.15, 0.17, pull), 0.08, out),
    az: orbit * (1 - pull) + pull * 0.12 * (1 - out),
    ty: lerp(lerp(c0.ty, 0.15, pull), 0, out),
    fov: c0.fov,
  };
  s.dense = 1 - clamp01((dist - 7.5) / 3.5);
  // needle leaves and the skin relaxes as we zoom out
  s.needleOn = 1 - ramp(t, S.S5, S.S5 + 0.7);
  s.deform.dimple *= 1 - ramp(t, S.S5 + 0.2, S.S5 + 1.2);
  s.shapes = ramp(t, EV.shapes, EV.shapes + 1.3, EASE_OUT);
  s.grey = 0.7 * ramp(t, EV.shapes + 0.6, S.S6, EASE);
  s.floor = 0;
  return s;
};

export const TOP = TOP_Y;
