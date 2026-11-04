import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { GotaData } from "../theme";

/**
 * The path-traced plate of frame f (scripts/blender_gota.py): 1080×1920 with the studio, the basin and the water in it.
 * Frames past the freeze show the frozen plate (195: 128 samples, no motion blur).
 */
export const Placa: React.FC<{ data: GotaData; frame: number; style?: React.CSSProperties }> = ({ data, frame, style }) => {
  const fz = Math.min(Math.max(0, Math.round(frame)), data.freeze);
  return (
    <AbsoluteFill style={{ backgroundColor: "#050505", overflow: "hidden", ...style }}>
      <Img src={staticFile(`plates/a_${String(fz).padStart(4, "0")}.png`)} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920 }} />
    </AbsoluteFill>
  );
};
