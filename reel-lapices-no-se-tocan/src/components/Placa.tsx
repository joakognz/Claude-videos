import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { LapizData } from "../theme";

/**
 * The path-traced pencils (scripts/blender_lapices.py, transparent film) over the pre-computed studio
 * backdrop. The backdrop drifts a touch with the slider push (it is far behind: little parallax).
 */
export const Placa: React.FC<{ data: LapizData; frame: number }> = ({ data, frame }) => {
  const fz = Math.min(Math.max(0, Math.round(frame)), data.freeze);
  const p = fz / data.freeze;
  const [, , az] = data.cam[fz];
  const az0 = data.cam[0][2];
  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0e10", overflow: "hidden" }}>
      <Img src={staticFile("assets/fondo_estudio.png")} style={{
        position: "absolute", left: -60, top: -107, width: 1200, height: 2134,
        transform: `translate(${(az - az0) * -160}px, 0px) scale(${1 + 0.035 * p})`,
      }} />
      <Img src={staticFile(`plates/a_${String(fz).padStart(4, "0")}.png`)} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920 }} />
    </AbsoluteFill>
  );
};
