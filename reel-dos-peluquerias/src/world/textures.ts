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

/** Shop sign face: "PELUQUERÍA" + scissors. `lit`: glowing orange on black, else dead grey. */
export const signTex = (lit: boolean, font: string) =>
  make(1024, 200, (g) => {
    g.fillStyle = lit ? "#120a03" : "#2c2c2c";
    g.fillRect(0, 0, 1024, 200);
    g.strokeStyle = lit ? "#FFA040" : "#3d3d3d";
    g.lineWidth = 8;
    g.strokeRect(14, 14, 996, 172);
    g.fillStyle = lit ? "#FFB066" : "#4a4a4a";
    g.font = `800 132px "${font}"`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    if (lit) {
      g.shadowColor = "#FF7A00";
      g.shadowBlur = 26;
    }
    g.fillText("PELUQUERÍA", 560, 106);
    // scissors icon
    g.save();
    g.translate(120, 100);
    g.rotate(-0.5);
    g.strokeStyle = lit ? "#FFB066" : "#4a4a4a";
    g.lineWidth = 9;
    g.beginPath();
    g.arc(-30, 22, 17, 0, Math.PI * 2);
    g.arc(-30, -22, 17, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.moveTo(-14, 16);
    g.lineTo(48, -18);
    g.moveTo(-14, -16);
    g.lineTo(48, 18);
    g.stroke();
    g.restore();
  });

/** Floor tiles (orange shop: warm dark checker; grey shop: flat dull). */
export const floorTex = (lit: boolean) => {
  const tex = make(256, 256, (g) => {
    const a = lit ? "#2a1d13" : "#3a3a3a";
    const b = lit ? "#1a120c" : "#363636";
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        g.fillStyle = (i + j) % 2 ? a : b;
        g.fillRect(i * 32, j * 32, 32, 32);
      }
    }
  });
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
};

/** Barber pole stripes. */
export const poleTex = (lit: boolean) => {
  const tex = make(64, 256, (g) => {
    g.fillStyle = lit ? "#fff3e6" : "#5a5a5a";
    g.fillRect(0, 0, 64, 256);
    g.fillStyle = lit ? "#FF7A00" : "#3c3c3c";
    for (let k = -2; k < 8; k++) {
      g.beginPath();
      g.moveTo(0, k * 48);
      g.lineTo(64, k * 48 + 40);
      g.lineTo(64, k * 48 + 64);
      g.lineTo(0, k * 48 + 24);
      g.fill();
    }
  });
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
};
