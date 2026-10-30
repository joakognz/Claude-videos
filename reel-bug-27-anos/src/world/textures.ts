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

/** Shop sign face: "TU NEGOCIO". `lit`: glowing orange on dark, else a dead sign. */
export const signTex = (lit: boolean, font: string) =>
  make(1024, 220, (g) => {
    g.fillStyle = lit ? "#1a0d05" : "#1c1714";
    g.fillRect(0, 0, 1024, 220);
    g.strokeStyle = lit ? "#FFB066" : "#3a302a";
    g.lineWidth = 10;
    g.strokeRect(16, 16, 992, 188);
    g.fillStyle = lit ? "#FFF4EC" : "#3d332c";
    g.font = `800 128px "${font}"`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    if (lit) {
      g.shadowColor = "#FF6B1A";
      g.shadowBlur = 34;
    }
    g.fillText("TU NEGOCIO", 512, 116);
  });

/** Plain text plate over the gate: "OPENBSD" (name only, no logo). */
export const plateTex = (font: string) =>
  make(512, 120, (g) => {
    g.fillStyle = "#1c1714";
    g.fillRect(0, 0, 512, 120);
    g.strokeStyle = "#FFF4EC";
    g.lineWidth = 5;
    g.strokeRect(8, 8, 496, 104);
    g.fillStyle = "#FFF4EC";
    g.font = `800 64px "${font}"`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("OPENBSD", 256, 64);
  });

/** Plaza paving: dark warm slabs with fine joints. */
export const pavingTex = () => {
  const tex = make(256, 256, (g) => {
    g.fillStyle = "#1d1814";
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = "#2b231d";
    g.lineWidth = 3;
    for (let i = 0; i <= 4; i++) {
      g.beginPath();
      g.moveTo(i * 64, 0);
      g.lineTo(i * 64, 256);
      g.moveTo(0, i * 64);
      g.lineTo(256, i * 64);
      g.stroke();
    }
  });
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
};
