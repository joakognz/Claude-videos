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

/** Sign face with `text` in Sora: glowing orange-on-dark when `lit`, else a dead sign. */
export const signTex = (text: string, lit: boolean, font: string) =>
  make(1024, 220, (g) => {
    g.fillStyle = lit ? "#1a0d05" : "#1c1714";
    g.fillRect(0, 0, 1024, 220);
    g.strokeStyle = lit ? "#FFB066" : "#3a302a";
    g.lineWidth = 10;
    g.strokeRect(16, 16, 992, 188);
    g.fillStyle = lit ? "#FFF4EC" : "#4a3e35";
    g.font = `800 120px "${font}"`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    if (lit) {
      g.shadowColor = "#FF6B1A";
      g.shadowBlur = 34;
    }
    g.fillText(text, 512, 116);
  });
