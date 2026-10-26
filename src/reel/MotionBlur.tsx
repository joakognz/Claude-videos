import React from "react";
import { AbsoluteFill, Freeze, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Desenfoque de movimiento por acumulación de sub-fotogramas (centrado en el fotograma actual).
 * El número de muestras se decide por fotograma: 1 cuando no hay movimiento y hasta `max`
 * cuando la cámara o los elementos se mueven rápido, para que no queden "escalones".
 */
export const MotionBlur: React.FC<{ samples: number; shutter?: number; children: React.ReactNode }> = ({
  samples,
  shutter = 0.6,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const n = Math.max(1, Math.round(samples));
  if (n === 1) return <>{children}</>;
  return (
    <AbsoluteFill style={{ isolation: "isolate" }}>
      {new Array(n).fill(0).map((_, i) => {
        const f = Math.min(durationInFrames - 1, Math.max(0, frame + ((i + 0.5) / n - 0.5) * shutter));
        return (
          <AbsoluteFill key={i} style={{ mixBlendMode: "plus-lighter", filter: `opacity(${1 / n})` }}>
            <Freeze frame={f}>{children}</Freeze>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
