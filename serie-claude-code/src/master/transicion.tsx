/** Transición entre bloques temáticos (regla 7): la cámara sigue avanzando. El bloque que sale se acerca y se funde;
 * el que entra llega desde un poco más lejos. Sin cortes secos ni saltos de cámara. */
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import React from "react";
import { AbsoluteFill } from "remotion";

type P = Record<string, never>;
const Avance: React.FC<TransitionPresentationComponentProps<P>> = ({ children, presentationDirection, presentationProgress }) => {
  const p = presentationProgress;
  const entra = presentationDirection === "entering";
  const escala = entra ? 0.86 + 0.14 * p : 1 + 0.22 * p;
  const op = entra ? Math.min(1, p * 1.25) : 1 - Math.max(0, (p - 0.15) / 0.85);
  const blur = entra ? (1 - p) * 10 : p * 12;
  return (
    <AbsoluteFill style={{ transform: `scale(${escala})`, opacity: op, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>{children}</AbsoluteFill>
  );
};
export const avance = (): TransitionPresentation<P> => ({ component: Avance, props: {} });
