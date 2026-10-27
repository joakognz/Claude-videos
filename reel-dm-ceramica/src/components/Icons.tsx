import React from "react";

type P = { size?: number; color?: string; stroke?: number };

const Svg: React.FC<P & { children: React.ReactNode }> = ({ size = 48, color = "#fff", stroke = 2.4, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}
    strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

// ── chat UI (generic, no platform iconography) ──────────────────────────
export const IconBack: React.FC<P> = (p) => (
  <Svg {...p}><path d="M15 5l-7 7 7 7" /></Svg>
);

export const IconInfo: React.FC<P> = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.5v.01" /></Svg>
);

export const IconSend: React.FC<P> = (p) => (
  <Svg {...p}><path d="M12 19V5M6 11l6-6 6 6" /></Svg>
);

export const IconImage: React.FC<P> = (p) => (
  <Svg {...p}><rect x="3.5" y="4.5" width="17" height="15" rx="3" /><circle cx="9" cy="10" r="1.6" /><path d="M20 16l-4.5-4.5L7 19.5" /></Svg>
);

export const IconSmile: React.FC<P> = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M8.5 14.5c1.8 2 5.2 2 7 0M9 9.5v.01M15 9.5v.01" /></Svg>
);

export const IconChecks: React.FC<P> = (p) => (
  <Svg {...p}><path d="M2.5 12.5l4 4 8-9M11 16.5l1 0 8.5-9" /></Svg>
);

export const IconCheck: React.FC<P> = (p) => (
  <Svg {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>
);

export const IconLock: React.FC<P> = (p) => (
  <Svg {...p}><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></Svg>
);

// ── flow nodes ──────────────────────────────────────────────────────────
export const IconSpark: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M12 3.5l1.9 4.9 4.9 1.9-4.9 1.9-1.9 4.9-1.9-4.9-4.9-1.9 4.9-1.9z" />
    <path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
  </Svg>
);

export const IconBox: React.FC<P> = (p) => (
  <Svg {...p}><path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z" /><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9" /></Svg>
);

export const IconMug: React.FC<P> = (p) => (
  <Svg {...p}><path d="M4.5 7h11v8a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4z" /><path d="M15.5 9h1.5a2.5 2.5 0 0 1 0 5h-1.5M8 3.5c0 1 1 1 1 2M11.5 3.5c0 1 1 1 1 2" /></Svg>
);

export const IconReceipt: React.FC<P> = (p) => (
  <Svg {...p}><path d="M6 3h12v18l-2.5-1.6L13 21l-2-1.6L8.5 21 6 19.4z" /><path d="M9 8h6M9 12h6M9 16h3" /></Svg>
);

export const IconCard: React.FC<P> = (p) => (
  <Svg {...p}><rect x="2.5" y="5.5" width="19" height="13" rx="2.5" /><path d="M2.5 10h19M6.5 15h4" /></Svg>
);

export const IconBell: React.FC<P> = (p) => (
  <Svg {...p}><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 20.5a2.2 2.2 0 0 0 4 0" /></Svg>
);
