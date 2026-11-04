/**
 * Clip real de pantalla (regla 8): se recorta la zona útil del vídeo original (fuera queda la cámara del ponente) y se
 * hace zoom hacia el cursor, siguiendo sus posiciones suavizadas. Las posiciones las saca scripts/cursor.py.
 */
import { Video } from "@remotion/media";
import React from "react";
import { Sequence, staticFile } from "remotion";
import { EASE, ramp } from "../tema";
import type { Rect } from "../tipos";
import { useEstilo } from "./estilo";

export type ClipProps = {
  src: string;
  desde?: number;
  ancho?: number;
  alto?: number;
  recorte: { x: number; y: number; w: number; h: number };
  cursor?: { t: number; x: number; y: number }[];
  zoom?: number;
};

/** Marco del clip dentro del lienzo: lo más ancho posible sin pasar de 820 px de alto. */
export const marcoClip = (c: ClipProps): Rect => {
  let w = 1000, h = (w * c.recorte.h) / c.recorte.w;
  if (h > 820) { h = 820; w = (h * c.recorte.w) / c.recorte.h; }
  return { x: 540 - w / 2, y: 1060 - h / 2, w, h };
};

/** Cursor en el instante `s` (segundos desde el inicio del trozo), interpolado y suavizado (media de ±0,4 s). */
export const cursorEn = (c: ClipProps, s: number) => {
  const k = c.cursor ?? [];
  if (!k.length) return null;
  const at = (u: number) => {
    if (u <= k[0].t) return k[0];
    const j = k.findIndex((p) => p.t > u);
    if (j < 0) return k[k.length - 1];
    const a = k[j - 1], b = k[j];
    const f = EASE((u - a.t) / Math.max(1e-6, b.t - a.t));
    return { t: u, x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  };
  let x = 0, y = 0;
  const N = 9;
  for (let i = 0; i < N; i++) {
    const p = at(s - 0.4 + (0.8 * i) / (N - 1));
    x += p.x / N;
    y += p.y / N;
  }
  return { x, y };
};

export const ClipPantalla: React.FC<{ clip: ClipProps; t: number; inicio: number; fin: number; fps: number }> = ({ clip, t, inicio, fin, fps }) => {
  const E = useEstilo();
  const F = marcoClip(clip);
  const rec = clip.recorte;
  const srcW = clip.ancho ?? 1920, srcH = clip.alto ?? 1080;
  const s = t - inicio;
  const cur = cursorEn(clip, s);
  // zoom hacia el cursor: entra en 0,8 s y se mantiene; sin datos de cursor, se queda en el plano general del recorte
  const z = cur ? 1 + ((clip.zoom ?? 1.8) - 1) * ramp(s, 0.2, 1.0) : 1;
  const vw = rec.w / z, vh = rec.h / z;
  const cx = Math.min(rec.x + rec.w - vw / 2, Math.max(rec.x + vw / 2, cur?.x ?? rec.x + rec.w / 2));
  const cy = Math.min(rec.y + rec.h - vh / 2, Math.max(rec.y + vh / 2, cur?.y ?? rec.y + rec.h / 2));
  const k = (F.w / rec.w) * z;
  const vx = cx - vw / 2, vy = cy - vh / 2;
  return (
    <div style={{ position: "absolute", left: F.x, top: F.y, width: F.w, height: F.h, borderRadius: 26, overflow: "hidden", border: `3px solid ${E.borde}`, boxSizing: "border-box", background: "#000" }}>
      <Sequence from={Math.round(inicio * fps)} durationInFrames={Math.max(1, Math.round((fin - inicio) * fps))} layout="none">
        <div style={{ position: "absolute", left: -vx * k, top: -vy * k, width: srcW * k, height: srcH * k }}>
          <Video src={staticFile(clip.src)} trimBefore={Math.round((clip.desde ?? 0) * fps)} muted style={{ width: "100%", height: "100%" }} />
        </div>
      </Sequence>
      {cur && (
        <div style={{
          position: "absolute", left: (cur.x - vx) * k - 34, top: (cur.y - vy) * k - 34, width: 68, height: 68, borderRadius: 34,
          border: `4px solid ${E.acento}`, boxShadow: `0 0 24px ${E.acento}`, opacity: ramp(s, 0.6, 1.0),
        }} />
      )}
    </div>
  );
};
