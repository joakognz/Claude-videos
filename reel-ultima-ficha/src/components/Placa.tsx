import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { FichasData } from "../theme";

/**
 * The path-traced plate of frame f (scripts/blender_fichas.py): rendered at 972×1728 with the table and the dark studio
 * in it, shown at 1080×1920 (same field of view, so the wireframe still lines up).
 */
export const Placa: React.FC<{ data: FichasData; frame: number; style?: React.CSSProperties }> = ({ data, frame, style }) => {
  const fz = Math.min(Math.max(0, Math.round(frame)), data.freeze);
  return (
    <AbsoluteFill style={{ backgroundColor: "#050505", overflow: "hidden", ...style }}>
      <Img src={staticFile(`plates/a_${String(fz).padStart(4, "0")}.png`)} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920 }} />
    </AbsoluteFill>
  );
};
