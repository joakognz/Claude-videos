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

/** A contract sheet (cream paper, title, text lines, signature line). `onion`: the fixed-price onion deal of phase 2. */
export const contractTex = (onion: boolean, font: string, mono: string) =>
  make(512, 680, (g) => {
    g.fillStyle = "#FFF4EC";
    g.fillRect(0, 0, 512, 680);
    g.fillStyle = "#14110F";
    g.font = `800 50px "${font}"`;
    g.textAlign = "center";
    g.fillText("CONTRATO", 256, 86);
    g.font = `700 22px "${mono}"`;
    g.fillStyle = "rgba(20,17,15,0.55)";
    g.fillText(onion ? "PRECIO FIJO · CEBOLLAS" : "PUESTO: TENDERO", 256, 126);
    g.fillStyle = "rgba(20,17,15,0.16)";
    const lines = onion ? 5 : 9;
    for (let i = 0; i < lines; i++) g.fillRect(56, 168 + i * 34, i % 3 === 2 ? 300 : 400, 12);
    if (onion) {
      // onion glyph (outline only, ink)
      g.strokeStyle = "#14110F";
      g.lineWidth = 9;
      g.lineCap = "round";
      g.beginPath();
      g.moveTo(256, 352);
      g.bezierCurveTo(330, 410, 352, 450, 340, 488);
      g.bezierCurveTo(328, 528, 290, 540, 256, 540);
      g.bezierCurveTo(222, 540, 184, 528, 172, 488);
      g.bezierCurveTo(160, 450, 182, 410, 256, 352);
      g.stroke();
      g.beginPath();
      g.moveTo(256, 380);
      g.bezierCurveTo(232, 430, 232, 500, 256, 538);
      g.moveTo(256, 380);
      g.bezierCurveTo(280, 430, 280, 500, 256, 538);
      g.moveTo(256, 352);
      g.lineTo(256, 326);
      g.stroke();
    }
    g.strokeStyle = "#14110F";
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(120, 610);
    g.lineTo(400, 610);
    g.stroke();
    g.font = `800 34px "${font}"`;
    g.fillStyle = "#14110F";
    g.textAlign = "left";
    g.fillText("×", 92, 604);
  });
