/** Un logo que cae desde arriba (gravedad), golpea y rebota sobre otros. Sale subiendo y fundiéndose. */
import React from "react";
import { Img, staticFile } from "remotion";
import { C, clamp01, ramp } from "../nucleo";

export const Caida: React.FC<{ src: string; x: number; y: number; w: number; t: number; aterriza: number; out: number; altura?: number }> = ({
  src, x, y, w, t, aterriza, out, altura = 760,
}) => {
  const caida = 0.36;
  if (t < aterriza - caida) return null;
  const u = clamp01((t - (aterriza - caida)) / caida);
  const dy = t < aterriza ? -altura * (1 - u * u) : 0;
  const k = t - aterriza;
  const aplasta = k > 0 ? Math.sin(k * 26) * Math.exp(-k * 7) * 0.16 : 0;
  const rebote = k > 0 ? -Math.abs(Math.sin(k * 13)) * Math.exp(-k * 6) * 40 : 0;
  const sal = ramp(t, out - 0.4, out);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, zIndex: 5 }}>
      <div
        style={{
          position: "absolute", transform: `translate(-50%, -50%) translateY(${dy + rebote - sal * 120}px) scale(${1 + aplasta}, ${1 - aplasta}) rotate(${(1 - u) * -10}deg)`,
          opacity: Math.min(1, u * 3) * (1 - sal), transformOrigin: "50% 100%",
          padding: `${w * 0.1}px ${w * 0.13}px`, borderRadius: w * 0.09, background: "#F6F7F9", boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 0 5px ${C.acento}`,
        }}
      >
        <Img src={staticFile(src)} style={{ width: w * 0.74, display: "block" }} />
      </div>
    </div>
  );
};

/** Pequeño hundimiento de un elemento al recibir el golpe de una caída. */
export const golpeEn = (t: number, aterriza: number) => {
  const k = t - aterriza;
  return k > 0 ? Math.sin(k * 24) * Math.exp(-k * 8) * 0.12 : 0;
};
