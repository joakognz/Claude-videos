import React from "react";
import { spring } from "remotion";
import { BOT_Y, C, CAP, CLOCK_H, CLOCK_Y, FPS, PANEL_X, S, SANS, TL, TOP_Y, W, clamp01, drift, rgba, windowed, EASE } from "../theme";
import { ZONE_Y } from "./Captions";
import { phoneCenterLocal } from "./Panel";
import { aiOnAt } from "./Phone";

export const phoneCenter = (side: "top" | "bottom") => ({
  x: PANEL_X + phoneCenterLocal.x,
  y: (side === "top" ? TOP_Y : BOT_Y) + phoneCenterLocal.y,
});

/** E1 hook line in the top strip. */
export const Kicker: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const out = CAP.S2a.start - 0.3;
  const p = EASE(clamp01((t - out) / 0.3));
  if (p >= 1) return null;
  const s = spring({ frame, fps: FPS, config: { damping: 14, stiffness: 140 } });
  return (
    <div style={{
      position: "absolute", left: 60, right: 60, top: ZONE_Y.top, translate: `0px ${-50 - p * 80}%`,
      textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 60, lineHeight: 1.1, color: C.white,
      opacity: (1 - p) * clamp01(frame / 3), filter: `blur(${p * 14}px)`, scale: String(0.9 + 0.1 * s),
      textShadow: "0 6px 30px rgba(0,0,0,0.7)",
    }}>
      <span style={{ color: C.green }}>POV:</span> dos noches<br />llevando un negocio
    </div>
  );
};

/** E3: the pill that says the assistant stays on (outside the phone so it reads at ≥ 44 px). */
export const AiPill: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const t0 = aiOnAt();
  if (t < t0 - 0.05) return null;
  const s = spring({ frame: frame - t0 * FPS, fps: FPS, config: { damping: 12, stiffness: 150 } });
  const pulse = 0.5 + 0.5 * Math.sin(t * 4);
  const fade = 1 - windowed(t, S.E5 - 0.2, 999, 0.4, 0.01);
  return (
    <div style={{
      position: "absolute", left: PANEL_X + 360, top: BOT_Y + 388, padding: "16px 30px 16px 24px", borderRadius: 60,
      display: "flex", alignItems: "center", gap: 16, background: "rgba(6,24,17,0.88)", border: `3px solid ${C.green}`,
      boxShadow: `0 0 ${30 + 30 * pulse}px ${rgba(C.green, 0.45)}, 0 18px 40px rgba(0,0,0,0.5)`,
      fontFamily: SANS, fontWeight: 800, fontSize: 46, color: C.white, whiteSpace: "nowrap",
      scale: String(0.6 + 0.4 * s), opacity: clamp01(s * 1.5) * fade, transformOrigin: "0% 50%",
      translate: `${drift(t, 71, 6)}px ${drift(t, 72, 5)}px`,
    }}>
      <div style={{ width: 22, height: 22, borderRadius: 22, background: C.green, boxShadow: `0 0 ${12 + 10 * pulse}px ${C.green}` }} />
      Asistente <span style={{ color: C.green }}>IA</span> activo
    </div>
  );
};

/** E4: five lights (clients) leave the clock and split identically toward both phones; they wait there for E5. */
export const ClientLights: React.FC<{ t: number }> = ({ t }) => {
  const t0 = S.E4 + 0.1;
  if (t < t0) return null;
  const origin = { x: 540, y: CLOCK_Y + CLOCK_H / 2 };
  return (
    <>
      {(["top", "bottom"] as const).map((side) =>
        new Array(5).fill(0).map((_, i) => {
          const start = t0 + i * 0.14;
          const p = EASE(clamp01((t - start) / 0.95));
          if (p <= 0) return null;
          const pc = phoneCenter(side);
          // resting orbit around the phone
          const ang = (i / 5) * Math.PI * 2 + t * 0.7;
          const rest = { x: pc.x + Math.cos(ang) * 150, y: pc.y + Math.sin(ang) * 115 };
          // E5: light i dives into the phone when its message arrives
          const ev = TL.night[i];
          const dive = ev ? EASE(clamp01((t - (ev.arrive - 0.35)) / 0.35)) : 0;
          const gone = ev ? clamp01((t - ev.arrive) / 0.1) : 0;
          const arcX = Math.sin(p * Math.PI) * (side === "top" ? -1 : 1) * (60 + i * 30);
          let x = origin.x + (rest.x - origin.x) * p + arcX;
          let y = origin.y + (rest.y - origin.y) * p;
          x += (pc.x - x) * dive;
          y += (pc.y - y) * dive;
          return (
            <div key={side + i} style={{
              position: "absolute", left: x - 13, top: y - 13, width: 26, height: 26, borderRadius: 26,
              background: "radial-gradient(circle, #fff 0%, #fffbe8 40%, rgba(255,240,200,0.0) 72%)",
              boxShadow: "0 0 24px 8px rgba(255,244,214,0.55)", opacity: (1 - gone) * clamp01(p * 4),
              scale: String(1 + 0.25 * Math.sin(t * 5 + i)),
            }} />
          );
        }),
      )}
    </>
  );
};

/** E4: "5 clientes · 2 negocios" in the lower strip. */
export const ClientsLabel: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const t0 = W("S4", 2);
  if (t < t0 - 0.1) return null;
  const s = spring({ frame: frame - t0 * FPS, fps: FPS, config: { damping: 12, stiffness: 160 } });
  const out = EASE(clamp01((t - (S.E5 - 0.05)) / 0.33));
  if (out >= 1) return null;
  const chip = (n: string) => (
    <span style={{ display: "inline-block", padding: "0 14px", borderRadius: 14, background: C.white, color: C.ink, marginRight: 14 }}>{n}</span>
  );
  return (
    <div style={{
      position: "absolute", left: 60, right: 60, top: ZONE_Y.bottom, translate: `0px ${-50 - out * 80}%`,
      textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 60, color: C.white,
      opacity: clamp01(s * 1.4) * (1 - out), scale: String(0.85 + 0.15 * s), filter: `blur(${out * 14}px)`,
      textShadow: "0 6px 30px rgba(0,0,0,0.7)",
    }}>
      {chip("5")}clientes <span style={{ opacity: 0.5 }}>·</span> {chip("2")}negocios
    </div>
  );
};

/** Small notice for the simulated night and morning. */
export const Disclaimer: React.FC<{ t: number }> = ({ t }) => {
  const o = windowed(t, S.E5, S.E9 + 0.3, 0.4, 0.4);
  if (o <= 0) return null;
  return (
    <div style={{
      position: "absolute", right: PANEL_X + 26, top: BOT_Y + 560, fontFamily: SANS, fontWeight: 600, fontSize: 24,
      color: "rgba(255,255,255,0.75)", opacity: o, padding: "4px 14px", borderRadius: 10, background: "rgba(0,0,0,0.35)",
    }}>
      Demo simulada · datos ficticios
    </div>
  );
};

