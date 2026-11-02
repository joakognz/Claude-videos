import React from "react";
import { C, EV, UI, GRID, tilePos, ramp, EASE, lerp } from "../theme";
import { Tile, EmptyTile } from "../components/Tile";
import { Btn } from "../components/UiBits";
import { Cursor } from "../components/Chrome";
import { LABELS } from "./Hook";
import { Card } from "../components/UiBits";
import { Silhouette } from "../components/Tile";

const lerpPath = (t: number, pts: [number, number, number][]) => {
  if (t <= pts[0][0]) return [pts[0][1], pts[0][2]];
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) {
      const k = EASE(ramp(t, pts[i - 1][0], pts[i][0]));
      return [lerp(pts[i - 1][1], pts[i][1], k), lerp(pts[i - 1][2], pts[i][2], k)];
    }
  }
  const l = pts[pts.length - 1];
  return [l[1], l[2]];
};
const clickK = (t: number, at: number) => ramp(t, at, at + 0.3);

/** 18.3–19.8: waiting room with the Unirse button */
export const Lobby: React.FC<{ t: number }> = ({ t }) => {
  const [cx, cy] = lerpPath(t, [[18.3, 900, 620], [EV.click - 0.02, 540, 1328]]);
  const pressed = t >= EV.click && t < EV.click + 0.15;
  return (
    <>
      <Card x={90} y={690} w={900} h={760}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 36, textAlign: "center", fontFamily: UI, fontWeight: 700, fontSize: 46, letterSpacing: "0.1em", color: C.ink }}>VIDEOLLAMADA</div>
        <div style={{ position: "absolute", left: 220, top: 130, width: 460, height: 340, borderRadius: 16, overflow: "hidden", background: C.room, border: `3px solid ${C.border}`, boxSizing: "border-box" }}>
          <Silhouette w={454} hh={334} color={C.dark} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 500, textAlign: "center", fontFamily: UI, fontWeight: 500, fontSize: 32, color: C.mid }}>Reunión con la dirección</div>
        <div style={{ position: "absolute", left: 250, top: 560, display: "flex", gap: 22 }}>
          {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ width: 70, height: 70, borderRadius: 35, background: C.border }} />)}
        </div>
      </Card>
      <Btn x={330} y={1260} w={420} h={110} label="UNIRSE" pressed={pressed} size={44} />
      <Cursor x={cx} y={cy} click={clickK(t, EV.click)} />
    </>
  );
};

/** 19.8–26.5: the call fills up; then everyone but the employee is revealed as fake. */
export const Call: React.FC<{ t: number }> = ({ t }) => {
  const seed = Math.floor(t * 15);
  const fills = [EV.tile0, EV.tile1, EV.tile2, EV.tile3, EV.tile4];
  const [cx, cy] = lerpPath(t, [[19.8, 540, 1328], [20.7, 640, 1535], [EV.reveal - 0.9, 640, 1535], [EV.reveal + 0.6, 930, 1535]]);
  const share = t >= 20.9 && t < 21.1;
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const p = tilePos(i);
        const isEmp = i === 5;
        const at = isEmp ? 19.82 : fills[i];
        const shown = t >= at;
        let content: React.ReactNode;
        if (!shown) content = <EmptyTile w={GRID.w} h={GRID.h} />;
        else if (isEmp) content = <Tile w={GRID.w} h={GRID.h} label={LABELS[5]} kind="emp" />;
        else {
          const resolve = 56 * (1 - ramp(t, at, at + 0.22));
          const m = ramp(t, EV.mesh + i * 0.06, EV.mesh + 0.55 + i * 0.06);
          const afterPix = ramp(t, EV.pixel + i * 0.04, EV.pixel + 0.5 + i * 0.04);
          const shat = ramp(t, EV.shatter + i * 0.05, EV.shatter + 0.85 + i * 0.05);
          const revealed = t >= EV.mesh;
          content = (
            <Tile w={GRID.w} h={GRID.h} label={LABELS[i]} kind="peer" muted={i === 3}
              st={{
                pix: revealed ? (afterPix > 0 ? 8 + afterPix * 30 : 0) : resolve,
                mesh: m,
                glitch: revealed ? Math.min(1, 0.35 + m * 0.6) * (1 - shat * 0.5) : 0,
                shatter: shat, seed: seed + i, strike: revealed && m > 0.8,
              }} />
          );
        }
        return <div key={i} style={{ position: "absolute", left: p.x, top: p.y }}>{content}</div>;
      })}
      <Btn x={40} y={1510} w={560} h={56} label="COMPARTIR PANTALLA" dark={false} size={26} pressed={share} />
      <Btn x={640} y={1510} w={400} h={56} label="FINALIZAR" dark size={26} />
      <Cursor x={cx} y={cy} click={clickK(t, 20.9)} />
    </>
  );
};

