import { EASE, EASE_OUT, EV, LAPIZ, S, lerp, ramp } from "../theme";
import { LapizState } from "./Lapices3D";
import { countdownState } from "./countdown";
import { redrawY } from "./MallaTrazada";

export const GLITCH_FRAMES = 6;

/**
 * Pencils once the voice is in (t ≥ 7 s): frozen image → gap gauge on "No se van a tocar" → glitch on
 * «existen» → orange wireframe → mesh redrawn from the tips → calm + pull back → zoom out while the mesh
 * fades away ("que no sepas que está ahí").
 */
export const wireframeState = (t: number, frame: number): LapizState => {
  const s = countdownState(LAPIZ, LAPIZ.freeze); // the frozen frame 195
  const fNo = Math.round(EV.noExiste * 30);
  s.gauge = ramp(t, EV.gauge, EV.gauge + 0.35, EASE_OUT) * (1 - ramp(t, S.S3, S.S3 + 0.25));
  if (frame < fNo) return s;

  const g = frame - fNo;
  const glitching = g < GLITCH_FRAMES;
  const wireNow = glitching ? [1, 0, 1, 1, 0, 1][g] : 1;
  s.solid = 1 - wireNow;
  s.wire = wireNow;
  const tw = t - EV.noExiste;
  const calm = ramp(t, S.S4, S.S4 + 1.2);
  s.ripple = 0.035 * (1 - calm) * (glitching ? 2 : 1);
  s.ripplePhase = tw * 7;
  s.t = tw;
  s.redraw = redrawY(t);

  // camera: slow orbit while the mesh redraws, pull back on "Y aun así…", then out to the whole pencils
  const c0 = s.cam;
  const orbit = ramp(t, S.S3, S.S4 + 0.4, EASE) * 0.5;
  const pull = ramp(t, S.S4 + 0.1, S.S5, EASE);
  const out = ramp(t, S.S5 - 0.05, S.S6 + 0.2, (x) => EASE_OUT(x));
  s.cam = {
    dist: Math.exp(lerp(lerp(Math.log(c0.dist), Math.log(7.5), pull), Math.log(26), out)),
    elev: lerp(lerp(c0.elev + orbit * 0.12, 0.12, pull), 0.18, out),
    az: c0.az + orbit * (1 - pull) + pull * 0.6 + out * 0.4,
    ty: lerp(lerp(c0.ty, 0, pull), 0, out),
    fov: lerp(c0.fov, 20, Math.max(pull, out)),
  };
  // "que no sepas que está ahí": the mesh greys and fades almost to nothing
  s.grey = 0.7 * ramp(t, EV.fade - 0.4, EV.fade + 0.8, EASE);
  s.wireAlpha = 1 - 0.9 * ramp(t, EV.fade, EV.fade + 1.4, EASE);
  return s;
};
