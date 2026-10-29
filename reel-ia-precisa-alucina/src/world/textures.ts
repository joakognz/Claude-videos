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

/** "?" in the title font, cream, for the invented answers. */
export const questionTex = (() => {
  let cache: THREE.Texture | null = null;
  return (font: string) => {
    if (!cache) {
      cache = make(256, 256, (g) => {
        g.fillStyle = "#FFF4EC";
        g.font = `800 210px "${font}"`;
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.shadowColor = "#FF6B1A";
        g.shadowBlur = 18;
        g.fillText("?", 128, 140);
      });
    }
    return cache;
  };
})();

/** Paving for the plaza: dark warm slabs with faint joints. */
export const pavingTex = (() => {
  let cache: THREE.Texture | null = null;
  return () => {
    if (!cache) {
      cache = make(1024, 1024, (g) => {
        g.fillStyle = "#231c17";
        g.fillRect(0, 0, 1024, 1024);
        const n = 16;
        const s = 1024 / n;
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            const v = 30 + ((i * 7 + j * 13) % 5) * 2;
            g.fillStyle = `rgb(${v + 9},${v},${v - 6})`;
            g.fillRect(i * s + 2, j * s + 2, s - 4, s - 4);
          }
        }
      });
    }
    return cache;
  };
})();
