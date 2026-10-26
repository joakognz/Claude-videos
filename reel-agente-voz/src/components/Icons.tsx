import React from "react";

type P = { size?: number; color?: string; stroke?: number; progress?: number };

const Svg: React.FC<P & { children: React.ReactNode }> = ({ size = 48, color = "#fff", stroke = 2.4, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke}
    strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

export const IconPhone: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </Svg>
);

export const IconHangup: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M3 14.5c5-5 13-5 18 0l-2.2 2.6-3.6-1.4v-2.4a12 12 0 0 0-6.4 0v2.4l-3.6 1.4z" />
  </Svg>
);

export const IconVoicemail: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="6.5" cy="12" r="4" />
    <circle cx="17.5" cy="12" r="4" />
    <path d="M6.5 16h11" />
  </Svg>
);

export const IconTooth: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M7 3c-2.5 0-4 2-4 4.5 0 2 1 3.5 1.5 5.5.6 2.5.8 8 2.7 8 1.7 0 1.6-5 3-5h1.6c1.4 0 1.3 5 3 5 1.9 0 2.1-5.5 2.7-8 .5-2 1.5-3.5 1.5-5.5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3z" />
  </Svg>
);

export const IconMic: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </Svg>
);

export const IconSpeaker: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M4 9v6h4l5 4V5L8 9z" />
    <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
  </Svg>
);

export const IconKeypad: React.FC<P> = (p) => (
  <Svg {...p}>
    {[5, 12, 19].map((x) => [5, 12, 19].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" />))}
  </Svg>
);

// ── flow node icons ─────────────────────────────────────────────────────
export const IconAlert: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M12 3 2.5 20h19z" />
    <path d="M12 10v4.5M12 17.5v.2" />
  </Svg>
);

export const IconCalendar: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M3 10h18M8 3v4M16 3v4" />
    <path d="M7.5 14h2M11 14h2M14.5 14h2M7.5 17.5h2M11 17.5h2" />
  </Svg>
);

export const IconCalendarCheck: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M3 10h18M8 3v4M16 3v4" />
    <path d="m8.5 15.5 2.3 2.3 4.7-4.7" />
  </Svg>
);

export const IconUserFile: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="4" y="3" width="16" height="18" rx="2.5" />
    <circle cx="12" cy="10" r="3" />
    <path d="M7.5 18a4.5 4.5 0 0 1 9 0" />
  </Svg>
);

export const IconChat: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M4 20l1.4-4A8 8 0 1 1 8 19z" />
    <path d="M9 10.5h6M9 13.5h4" />
  </Svg>
);

export const IconDoctor: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M6 3v5a4 4 0 0 0 8 0V3" />
    <path d="M10 12v2a5 5 0 0 0 10 0v-2" />
    <circle cx="20" cy="10" r="2" />
    <path d="M4.5 3H7.5M12.5 3h3" />
  </Svg>
);

export const IconCheck: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);
