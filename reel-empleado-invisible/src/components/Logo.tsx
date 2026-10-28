import React from "react";
import { SANS } from "../theme";

const BRAND = { orange: "#FF6B1A", ink: "#14110F", cream: "#FFF4EC" };

/** AIgencyx Labs logo ("Oscuro" variant: thin orange ring, cream A, orange nodes, LABS), drawn at 800 px and scaled to `size`. */
export const Logo: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, position: "relative" }}>
    <div style={{
      position: "absolute", left: 0, top: 0, width: 800, height: 800, scale: String(size / 800), transformOrigin: "0 0",
      background: BRAND.ink, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, color: BRAND.orange,
    }}>
      <div style={{
        width: 660, height: 660, boxSizing: "border-box", borderRadius: "50%", border: `5px solid ${BRAND.orange}`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18,
      }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, lineHeight: 1 }}>
          <span style={{ fontSize: 300, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 0.8, color: BRAND.cream }}>A</span>
          <svg width="200" height="200" viewBox="0 0 100 100" fill="none">
            <path d="M20 20 L80 80 M80 20 L20 80" stroke={BRAND.orange} strokeWidth="13" strokeLinecap="round" />
            <circle cx="20" cy="20" r="9" fill={BRAND.orange} />
            <circle cx="20" cy="80" r="9" fill={BRAND.orange} />
            <circle cx="80" cy="80" r="9" fill={BRAND.orange} />
            <circle cx="80" cy="20" r="13" fill={BRAND.ink} stroke={BRAND.orange} strokeWidth="6" />
          </svg>
        </div>
        <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: "0.42em", paddingLeft: "0.42em" }}>LABS</div>
      </div>
    </div>
  </div>
);
