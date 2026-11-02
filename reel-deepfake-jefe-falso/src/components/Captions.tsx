import React from "react";
import { ANTON, C, TL, UI } from "../theme";

/** Anton rótulos: hard-cut word entrances on the voice, one orange word per caption. Lives at y 340–640 (outside the unsafe strips). */
export const Captions: React.FC<{ t: number }> = ({ t }) => {
  const cap = TL.captions.find((c) => t >= c.start - 0.001 && t < c.end);
  if (!cap) return null;
  const ws = cap.chunks;
  const joined = ws.map((w) => w.text).join(" ");
  let lines: typeof ws[] = [ws];
  if (joined.length > 14 && ws.length > 1) {
    let best = 1, bestMax = 999;
    for (let k = 1; k < ws.length; k++) {
      const m = Math.max(ws.slice(0, k).map((w) => w.text).join(" ").length, ws.slice(k).map((w) => w.text).join(" ").length);
      if (m < bestMax) { bestMax = m; best = k; }
    }
    lines = [ws.slice(0, best), ws.slice(best)];
  }
  const longest = Math.max(...lines.map((l) => l.map((w) => w.text).join(" ").length));
  const size = Math.max(140, Math.min(lines.length > 1 ? 140 : 176, Math.floor(1000 / (0.45 * longest))));
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 352, height: 290, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {lines.map((l, li) => (
        <div key={li} style={{ display: "flex", gap: size * 0.2, fontFamily: ANTON, fontSize: size, lineHeight: 0.98, textTransform: "uppercase", whiteSpace: "nowrap" }}>
          {l.map((w, i) => (
            <span key={i} style={{ color: w.hl ? C.orange : C.ink, visibility: t >= w.t - 0.001 ? "visible" : "hidden" }}>{w.text}</span>
          ))}
        </div>
      ))}
      {cap.sub && (
        <div style={{ position: "absolute", top: 276, left: 0, right: 0, textAlign: "center", fontFamily: UI, fontWeight: 600, fontSize: 38, color: C.ink, letterSpacing: "0.06em" }}>
          {cap.sub.map(([txt, st], i) => <span key={i} style={{ visibility: t >= st ? "visible" : "hidden" }}>{txt}</span>)}
        </div>
      )}
    </div>
  );
};
