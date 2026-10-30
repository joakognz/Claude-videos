import * as THREE from "three";

const make = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const g = cv.getContext("2d")!;
  draw(g);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
};

/** Soft radial falloff (white → transparent), for halos and light pools. */
export const radialTex = (() => {
  let cache: THREE.Texture | null = null;
  return () => {
    if (!cache) {
      cache = make(256, 256, (g) => {
        const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
        gr.addColorStop(0, "rgba(255,255,255,1)");
        gr.addColorStop(0.25, "rgba(255,255,255,0.55)");
        gr.addColorStop(0.6, "rgba(255,255,255,0.14)");
        gr.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = gr;
        g.fillRect(0, 0, 256, 256);
      });
    }
    return cache;
  };
})();

/** Vertical fade (opaque at v=0 → transparent at v=1), for light volumes and the beacon. */
export const fadeTex = (() => {
  let cache: THREE.Texture | null = null;
  return () => {
    if (!cache) {
      cache = make(8, 256, (g) => {
        const gr = g.createLinearGradient(0, 256, 0, 0);
        gr.addColorStop(0, "rgba(255,255,255,1)");
        gr.addColorStop(0.35, "rgba(255,255,255,0.45)");
        gr.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = gr;
        g.fillRect(0, 0, 8, 256);
      });
    }
    return cache;
  };
})();

/** Text plate (cream text on a dark plate, or dark on cream). */
export const plateTex = (text: string, font: string, opts: { w?: number; h?: number; size?: number; dark?: boolean; hollow?: boolean } = {}) => {
  const { w = 1024, h = 256, size = 150, dark = true, hollow = false } = opts;
  return make(w, h, (g) => {
    if (!hollow) {
      g.fillStyle = dark ? "#1c1714" : "#FFF4EC";
      g.fillRect(0, 0, w, h);
    }
    g.font = `800 ${size}px "${font}"`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.letterSpacing = `${size * 0.08}px`;
    if (hollow) {
      g.strokeStyle = "#FFF4EC";
      g.lineWidth = 6;
      g.setLineDash([18, 12]);
      g.strokeText(text, w / 2, h / 2 + size * 0.04);
    } else {
      g.fillStyle = dark ? "#FFF4EC" : "#14110F";
      g.fillText(text, w / 2, h / 2 + size * 0.04);
    }
  });
};

/**
 * A proof sheet whose canvas is redrawn every frame: title + rows of "text" (prose) or indented "code".
 * `shift` slides the rows down by that many rows (the mismatch); `lit` turns the rows orange (verified).
 */
export const makeSheet = (title: string, kind: "prose" | "code", font: string) => {
  const W = 512;
  const H = 700;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d")!;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const ROWS = 11;
  const widths = Array.from({ length: ROWS }, (_, i) => (kind === "prose" ? 300 + ((i * 97) % 120) : 160 + ((i * 131) % 200)));
  const indent = Array.from({ length: ROWS }, (_, i) => (kind === "code" ? [0, 30, 30, 60, 60, 30, 0, 30, 60, 30, 0][i] : 0));
  const draw = (shift: number, lit: number, flick: number) => {
    g.clearRect(0, 0, W, H);
    g.fillStyle = "#FFF4EC";
    g.fillRect(0, 0, W, H);
    g.fillStyle = "#14110F";
    g.font = `800 40px "${font}"`;
    g.textAlign = "center";
    g.fillText(title, W / 2, 70);
    g.fillStyle = "rgba(20,17,15,0.25)";
    g.fillRect(60, 96, W - 120, 3);
    for (let i = 0; i < ROWS; i++) {
      const y = 140 + (i + shift) * 46;
      if (y > H - 30) continue;
      const a = lit > 0 ? `rgba(${Math.round(20 + 235 * lit)},${Math.round(17 + 90 * lit)},${Math.round(15 + 11 * lit)},${0.3 + 0.6 * lit})` : "rgba(20,17,15,0.3)";
      g.fillStyle = a;
      g.globalAlpha = i % 3 === 1 ? flick : 1;
      g.fillRect(60 + indent[i], y, widths[i], 16);
      g.globalAlpha = 1;
    }
    tex.needsUpdate = true;
  };
  return { tex, draw, rows: ROWS };
};
