import React from "react";
import { C, UI, rnd } from "../theme";
import { GlitchBox } from "./Glitch";

export type TileState = {
  glitch?: number;   // 0..1 block glitch (false things only)
  mesh?: number;     // 0..1 orange face mesh traced so far
  pix?: number;      // mosaic cell size in px (0 = sharp)
  shatter?: number;  // 0..1 blocks falling away
  seed?: number;
  strike?: boolean;  // orange strike through the label
  hidden?: boolean;  // name bar hidden
};
export const STRIP = 52;

type Shape = (x: number, y: number) => boolean;
export const personShape = (w: number, hh: number): Shape => {
  const hx = w / 2, hy = hh * 0.4, hr = hh * 0.19;
  const sx = w / 2, sy = hh * 0.98, rx = w * 0.26, ry = hh * 0.46;
  return (x, y) => (x - hx) ** 2 + (y - hy) ** 2 <= hr * hr || ((x - sx) / rx) ** 2 + ((y - sy) / ry) ** 2 <= 1;
};
const headShape = (w: number, hh: number): Shape => {
  const hx = w / 2, hy = hh * 0.4, hr = hh * 0.19;
  return (x, y) => (x - hx) ** 2 + (y - hy) ** 2 <= hr * hr * 1.08;
};

const mosaicPath = (w: number, hh: number, cell: number, inside: Shape, shatter: number, seed: number) => {
  let d = "";
  const nx = Math.ceil(w / cell), ny = Math.ceil(hh / cell);
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const cx = i * cell + cell / 2, cy = j * cell + cell / 2;
      if (!inside(cx, cy)) continue;
      let ox = 0, oy = 0;
      if (shatter > 0) {
        const r = rnd(i * 31 + j * 17 + seed);
        const q = Math.max(0, shatter * 1.6 - r * 0.6);
        if (q > 1) continue;
        oy = q * q * hh * 0.7;
        ox = (rnd(i * 7 + j * 13) - 0.5) * q * cell * 3;
      }
      d += `M${(i * cell + ox).toFixed(1)} ${(j * cell + oy).toFixed(1)}h${cell}v${cell}h${-cell}z`;
    }
  }
  return d;
};

const lattice = (w: number, hh: number, s: number, inside: Shape) => {
  const rowH = s * 0.866;
  const pts: { x: number; y: number; r: number; c: number }[] = [];
  const key = new Map<string, number>();
  const rows = Math.ceil(hh / rowH);
  for (let r = 0; r <= rows; r++) {
    const off = r % 2 ? s / 2 : 0;
    for (let c = 0; c * s + off <= w; c++) {
      const x = c * s + off, y = r * rowH;
      if (inside(x, y)) { key.set(`${r},${c}`, pts.length); pts.push({ x, y, r, c }); }
    }
  }
  const edges: [number, number][] = [];
  pts.forEach((p, i) => {
    const odd = p.r % 2;
    const nb = [[p.r, p.c + 1], [p.r + 1, p.c + (odd ? 1 : 0)], [p.r + 1, p.c + (odd ? 0 : -1)]];
    nb.forEach(([rr, cc]) => { const j = key.get(`${rr},${cc}`); if (j !== undefined) edges.push([i, j]); });
  });
  return { pts, edges };
};

const Mesh: React.FC<{ w: number; hh: number; p: number }> = ({ w, hh, p }) => {
  const parts = [
    lattice(w, hh, Math.max(13, hh / 15), headShape(w, hh)),
    lattice(w, hh, Math.max(20, hh / 9), (x, y) => personShape(w, hh)(x, y) && !headShape(w, hh)(x, y)),
  ];
  const front = p * hh * 1.02;
  let lines = "", dots = "";
  parts.forEach((m) => {
    m.edges.forEach(([a, b]) => {
      if (m.pts[a].y <= front && m.pts[b].y <= front) lines += `M${m.pts[a].x.toFixed(1)} ${m.pts[a].y.toFixed(1)}L${m.pts[b].x.toFixed(1)} ${m.pts[b].y.toFixed(1)}`;
    });
    m.pts.forEach((q) => { if (q.y <= front) dots += `M${q.x.toFixed(1)} ${q.y.toFixed(1)}h0`; });
  });
  return (
    <svg width={w} height={hh} style={{ position: "absolute", left: 0, top: 0 }}>
      <path d={lines} stroke={C.orange} strokeWidth={1.6} fill="none" opacity={0.95} />
      <path d={dots} stroke={C.orangeSoft} strokeWidth={5} strokeLinecap="round" fill="none" />
      {p < 1 && <rect x={0} y={Math.min(front, hh) - 2} width={w} height={4} fill={C.orange} opacity={0.9} />}
    </svg>
  );
};

export const Silhouette: React.FC<{ w: number; hh: number; color: string; pix?: number; shatter?: number; seed?: number }> = ({ w, hh, color, pix = 0, shatter = 0, seed = 0 }) => {
  const shape = personShape(w, hh);
  if (pix > 1 || shatter > 0) {
    return (
      <svg width={w} height={hh} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={mosaicPath(w, hh, Math.max(pix, 6), shape, shatter, seed)} fill={color} />
      </svg>
    );
  }
  return (
    <svg width={w} height={hh} style={{ position: "absolute", left: 0, top: 0 }}>
      <circle cx={w / 2} cy={hh * 0.4} r={hh * 0.19} fill={color} />
      <ellipse cx={w / 2} cy={hh * 0.98} rx={w * 0.26} ry={hh * 0.46} fill={color} />
    </svg>
  );
};

/** A video-call tile: faceless head-and-shoulders silhouette + generic job label strip. */
export const Tile: React.FC<{ w: number; h: number; label: string; kind: "emp" | "peer"; st?: TileState; muted?: boolean }> = ({ w, h, label, kind, st = {}, muted }) => {
  const hh = h - STRIP;
  const color = kind === "emp" ? C.dark : C.mid;
  const body = (
    <div style={{ position: "relative", width: w, height: h, background: C.tile, borderRadius: 14, border: `3px solid ${C.border}`, boxSizing: "border-box", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: w - 6, height: hh }}>
        <Silhouette w={w - 6} hh={hh} color={color} pix={st.pix} shatter={st.shatter} seed={st.seed} />
        {(st.mesh ?? 0) > 0 && <Mesh w={w - 6} hh={hh} p={st.mesh!} />}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: STRIP, background: kind === "emp" ? C.dark : C.ink, display: "flex", alignItems: "center", paddingLeft: 18, gap: 10 }}>
        {st.hidden ? (
          <div style={{ width: w * 0.5, height: 20, background: C.mid }} />
        ) : (
          <span style={{ fontFamily: UI, fontWeight: 700, fontSize: Math.min(26, (w - 90) / (label.length * 0.62)), color: C.tile, letterSpacing: "0.04em", position: "relative" }}>
            {label}
            {st.strike && <span style={{ position: "absolute", left: -4, right: -4, top: "52%", height: 5, background: C.orange }} />}
          </span>
        )}
        <span style={{ marginLeft: "auto", marginRight: 16, display: "flex", alignItems: "flex-end", gap: 3 }}>
          {[10, 16, 12].map((b, i) => <i key={i} style={{ display: "block", width: 5, height: muted ? 4 : b, background: muted ? C.mid : C.tile, opacity: muted ? 0.6 : 1 }} />)}
        </span>
      </div>
    </div>
  );
  if ((st.glitch ?? 0) > 0.01) return <GlitchBox seed={st.seed ?? 1} amount={st.glitch!} w={w} h={h} scale={w / 490}>{body}</GlitchBox>;
  return body;
};

/** Empty placeholder waiting for someone to join */
export const EmptyTile: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <div style={{ width: w, height: h, borderRadius: 14, border: `3px dashed ${C.border}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ width: 56, height: 56, borderRadius: 28, border: `4px solid ${C.border}`, borderTopColor: C.mid, boxSizing: "border-box" }} />
  </div>
);

