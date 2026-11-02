import React from "react";
import { C, EV, ANTON, UI, GRID, tilePos, ramp, EASE, rnd } from "../theme";
import { Tile } from "../components/Tile";

export const LABELS = ["DIRECTOR FINANCIERO", "COMPAÑERA", "COMPAÑERO", "COMPAÑERA", "COMPAÑERO", "EMPLEADO"];

/** 0–6.5 s: call grid, zoom into the finance-director tile, "25 M $", then the tile that doesn't exist. */
export const Hook: React.FC<{ t: number }> = ({ t }) => {
  const r = EASE(ramp(t, EV.zoomCfo, EV.zoomCfo + 0.4));
  const s = 1 + 1.04 * r;
  const tx = (540 - 285 * s) * r, ty = (1060 - 811 * s) * r;
  const seed = Math.floor(t * 15);
  const flick = 0.35 + 0.35 * rnd(seed);
  const breakP = ramp(t, EV.cfoBreak, EV.cfoBreak + 0.9);
  const cfoSt = t < EV.cfoBreak
    ? { glitch: t < 0.3 ? 0.6 : flick, seed }
    : { glitch: 0.9 * (1 - ramp(t, EV.cfoBreak + 0.9, EV.cfoBreak + 1.4)), seed, pix: 6 + breakP * 70, shatter: ramp(t, EV.cfoBreak + 0.6, EV.cfoBreak + 1.5), strike: true };
  const money = t >= EV.bigMoney && t < EV.cfoBreak - 0.02;
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${s})` }}>
        {LABELS.map((l, i) => {
          const p = tilePos(i);
          return (
            <div key={i} style={{ position: "absolute", left: p.x, top: p.y }}>
              {i === 0 ? <Tile w={GRID.w} h={GRID.h} label={l} kind="peer" st={cfoSt} /> : <Tile w={GRID.w} h={GRID.h} label={l} kind={i === 5 ? "emp" : "peer"} muted={i === 3} />}
            </div>
          );
        })}
      </div>
      {t >= EV.moreThan && t < EV.cfoBreak - 0.02 && (
        <div style={{ position: "absolute", left: 0, width: 1080, top: 872, textAlign: "center", fontFamily: UI, fontWeight: 700, fontSize: 44, letterSpacing: "0.12em", color: C.ink }}>MÁS DE</div>
      )}
      {money && (
        <div style={{ position: "absolute", left: 90, top: 955, width: 900, height: 215, background: C.orange, display: "flex", alignItems: "center", justifyContent: "center",
          transform: `translateX(${(rnd(seed + 3) - 0.5) * 10 * (t < EV.bigMoney + 0.25 ? 4 : 0.6)}px)` }}>
          <span style={{ fontFamily: ANTON, fontSize: 250, lineHeight: 1, color: C.tile, whiteSpace: "nowrap" }}>25 M $</span>
        </div>
      )}
    </>
  );
};
