import { BOT_Y, PANEL_H, PANEL_W, PANEL_X, S, TOP_Y, clamp01, drift, tween, EASE } from "./theme";
import { PHONE_BASE, PHONE_CX, PHONE_SCALE } from "./components/Panel";
import type { Side } from "./components/Phone";

// ── panel choreography: E7 top fills the screen, E8 bottom does, E9 both return and melt into the clock ──
const EXP_H = 1330; // y 250 → 1580, the whole safe zone
const BACK = 0.7;

export const panelRect = (side: Side, t: number) => {
  if (side === "top") {
    const y = tween(t, [[0, TOP_Y], [S.E8, TOP_Y], [S.E8 + 0.9, -1420], [S.E9, -1420], [S.E9 + BACK, TOP_Y]]);
    const h = tween(t, [[0, PANEL_H], [S.E7, PANEL_H], [S.E7 + 0.9, EXP_H], [S.E9, EXP_H], [S.E9 + BACK, PANEL_H]]);
    return { y, h };
  }
  const y = tween(t, [[0, BOT_Y], [S.E7, BOT_Y], [S.E7 + 0.9, 1960], [S.E8, 1960], [S.E8 + 0.9, TOP_Y], [S.E9, TOP_Y], [S.E9 + BACK, BOT_Y]]);
  const h = tween(t, [[0, PANEL_H], [S.E8, PANEL_H], [S.E8 + 0.9, EXP_H], [S.E9, EXP_H], [S.E9 + BACK, PANEL_H]]);
  return { y, h };
};

export const expandP = (side: Side, t: number) => clamp01((panelRect(side, t).h - PANEL_H) / (EXP_H - PANEL_H));

/** E9: both panels slide into the clock and dissolve. */
export const MERGE_AT = () => S.E9 + 0.7;
export const mergeP = (t: number) => EASE(clamp01((t - MERGE_AT()) / 0.65));

/** Panel frame drift (shared by the frame and the hero phone hand-off). */
export const panelDrift = (side: Side, t: number) => ({
  x: drift(t, side === "top" ? 81 : 82, 4),
  y: drift(t, side === "top" ? 83 : 84, 3),
});
export const phoneTilt = (side: Side, t: number) => drift(t, side === "top" ? 61 : 62, 1.6);
export const phoneBob = (side: Side, t: number) => drift(t, side === "top" ? 63 : 64, 3);

/** 0 = phone sits on the nightstand, 1 = close-up in front of the camera. */
export const heroP = (side: Side, t: number) => {
  const a = side === "top" ? S.E7 : S.E8;
  return EASE(clamp01((t - a) / 0.9)) * (1 - EASE(clamp01((t - S.E9) / BACK)));
};

const HERO = { x: 330, y: 1562, scale: 1.38 };

/** Global pose (bottom-centre anchor) of a phone, blending its nightstand pose into the close-up. */
export const phonePose = (side: Side, t: number) => {
  const r = panelRect(side, t);
  const d = panelDrift(side, t);
  const k = r.h / PANEL_H; // the room is scaled up while the panel grows
  const lx = PANEL_W / 2 + (PHONE_CX - PANEL_W / 2) * k;
  const ly = (PHONE_BASE + phoneBob(side, t)) * k;
  const base = { x: PANEL_X + d.x + lx, y: r.y + d.y + ly, scale: PHONE_SCALE * k, rot: phoneTilt(side, t) };
  const p = heroP(side, t);
  // the close-up travels with its panel when the panel slides away (E8 top) or comes in (E8 bottom)
  const follow = r.y - TOP_Y;
  return {
    x: base.x + (HERO.x + drift(t, 101, 6) - base.x) * p,
    y: base.y + (HERO.y + follow + drift(t, 102, 5) - base.y) * p,
    scale: base.scale + (HERO.scale - base.scale) * p,
    rot: base.rot * (1 - p) + drift(t, 103, 1.2) * p,
    p,
  };
};
