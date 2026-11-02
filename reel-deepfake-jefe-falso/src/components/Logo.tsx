import React from "react";
import { ANTON, C, UI } from "../theme";

/** AIgencyx Labs badge: thin orange ring, cream "A", orange nodes, "LABS". Drawn at 800 px and scaled to `size`. */
export const Logo: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, position: "relative" }}>
    <div style={{
      position: "absolute", left: 0, top: 0, width: 800, height: 800, scale: String(size / 800), transformOrigin: "0 0",
      borderRadius: "50%", border: `10px solid ${C.orange}`, boxSizing: "border-box", background: C.black,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26,
    }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, lineHeight: 1 }}>
        <span style={{ fontFamily: ANTON, fontSize: 340, lineHeight: 0.8, color: C.cream }}>A</span>
        <svg width="210" height="210" viewBox="0 0 100 100" fill="none">
          <path d="M20 20 L80 80 M80 20 L20 80" stroke={C.orange} strokeWidth="12" strokeLinecap="round" />
          <circle cx="20" cy="20" r="9" fill={C.orange} />
          <circle cx="20" cy="80" r="9" fill={C.orange} />
          <circle cx="80" cy="80" r="9" fill={C.orange} />
          <circle cx="80" cy="20" r="13" fill={C.black} stroke={C.orange} strokeWidth="6" />
        </svg>
      </div>
      <div style={{ fontFamily: UI, fontSize: 46, fontWeight: 700, letterSpacing: "0.5em", paddingLeft: "0.5em", color: C.cream }}>LABS</div>
    </div>
  </div>
);
