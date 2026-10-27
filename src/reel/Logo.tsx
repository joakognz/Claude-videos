import React from "react";
import { logoFont } from "./fonts";

export const BRAND = { orange: "#FF6B1A", dark: "#14110F", cream: "#FFF4EC" };

/**
 * Logo de AIgencyx Labs (versión oscura): círculo con "A" + marca en aspa y "LABS".
 * Geometría tomada del diseño original (660 px de diámetro).
 * `draw` (0..1) anima la aparición de anillo, letra, marca y "LABS".
 */
export const Logo: React.FC<{ size: number; draw?: number }> = ({ size, draw = 1 }) => {
  const s = size / 660;
  const ph = (a: number, b: number) => Math.min(1, Math.max(0, (draw - a) / (b - a)));
  const ring = ph(0, 0.5);
  const letter = ph(0.15, 0.6);
  const mark = ph(0.3, 0.8);
  const labs = ph(0.5, 1);
  const C = Math.PI * 2 * 327;
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        background: BRAND.dark,
        fontFamily: logoFont,
        color: BRAND.orange,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18 * s,
        boxShadow: `0 0 ${80 * s}px ${BRAND.orange}44`,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 660 660" style={{ position: "absolute", inset: 0, rotate: "-90deg" }}>
        <circle cx={330} cy={330} r={327} fill="none" stroke={BRAND.orange} strokeWidth={6} strokeDasharray={C} strokeDashoffset={C * (1 - ring)} strokeLinecap="round" />
      </svg>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6 * s, lineHeight: 1 }}>
        <span
          style={{
            fontSize: 300 * s,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 0.8,
            color: BRAND.cream,
            opacity: letter,
            translate: `0 ${(1 - letter) * 30 * s}px`,
          }}
        >
          A
        </span>
        <svg width={200 * s} height={200 * s} viewBox="0 0 100 100" fill="none" style={{ opacity: mark, scale: `${0.6 + 0.4 * mark}`, rotate: `${(1 - mark) * -90}deg` }}>
          <path d="M20 20 L80 80 M80 20 L20 80" stroke={BRAND.orange} strokeWidth={13} strokeLinecap="round" />
          <circle cx={20} cy={20} r={9} fill={BRAND.orange} />
          <circle cx={20} cy={80} r={9} fill={BRAND.orange} />
          <circle cx={80} cy={80} r={9} fill={BRAND.orange} />
          <circle cx={80} cy={20} r={13} fill={BRAND.dark} stroke={BRAND.orange} strokeWidth={6} />
        </svg>
      </div>
      <div style={{ fontSize: 40 * s, fontWeight: 700, letterSpacing: `${0.42 + (1 - labs) * 0.3}em`, paddingLeft: "0.42em", opacity: labs }}>LABS</div>
    </div>
  );
};
