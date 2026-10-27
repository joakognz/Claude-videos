import React from "react";

// Generic line icons drawn for this reel (no third-party app iconography)
type P = { size?: number; color?: string; stroke?: number };

const Svg: React.FC<P & { children: React.ReactNode }> = ({ size = 48, color = "#fff", stroke = 2.4, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}
    strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
    {children}
  </svg>
);

export const IconPhone: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </Svg>
);

export const IconMissed: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M3 14.5c5-5 13-5 18 0l-2.2 2.6-3.6-1.4v-2.4a12 12 0 0 0-6.4 0v2.4l-3.6 1.4z" />
    <path d="m8 4 4 4 4-4" />
  </Svg>
);

export const IconVoicemail: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="6.5" cy="12" r="4" />
    <circle cx="17.5" cy="12" r="4" />
    <path d="M6.5 16h11" />
  </Svg>
);

export const IconChat: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M4 20l1.4-4A8 8 0 1 1 8 19z" />
    <path d="M9 10.5h6M9 13.5h4" />
  </Svg>
);

export const IconForm: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="4" y="3" width="16" height="18" rx="2.5" />
    <path d="M8 8h8M8 12h8M8 16h4" />
  </Svg>
);

export const IconCheck: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);

export const IconMoon: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
  </Svg>
);

export const IconSun: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
  </Svg>
);

export const IconSpark: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    <path d="M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z" />
  </Svg>
);

export const IconCalendarCheck: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M3 10h18M8 3v4M16 3v4" />
    <path d="m8.5 15.5 2.3 2.3 4.7-4.7" />
  </Svg>
);

export const IconEye: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="2.8" />
  </Svg>
);
