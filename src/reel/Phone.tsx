import React from "react";
import { clamp, COLORS, easeInCubic, easeInOutCubic, easeOutBack, easeOutCubic, prog } from "./anim";
import { T } from "./timeline";
import { Bubble, card, enter, Icon, Typing } from "./ui";

const PW = 500;
const PH = 880;
const SW = PW - 28;

const Header: React.FC = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "8px 26px 22px", borderBottom: "1.5px solid rgba(255,255,255,0.07)" }}>
    <div
      style={{
        width: 66,
        height: 66,
        borderRadius: 33,
        background: `radial-gradient(circle at 35% 30%, #E6FF9A, ${COLORS.lime} 60%, #7FB81E)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 0 24px ${COLORS.lime}55`,
      }}
    >
      <Icon name="fork" size={38} color={COLORS.ink} stroke={8} />
    </div>
    <div>
      <div style={{ fontSize: 30, fontWeight: 700, color: COLORS.white }}>Tu restaurante</div>
      <div style={{ fontSize: 22, fontWeight: 600, color: COLORS.lime, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 10, height: 10, borderRadius: 5, background: COLORS.lime, display: "inline-block" }} />
        Agente IA · en línea
      </div>
    </div>
  </div>
);

const StatusBar: React.FC<{ time: string; moon?: boolean }> = ({ time, moon }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 34px 12px", color: COLORS.white, fontSize: 24, fontWeight: 700 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {time}
      {moon ? <Icon name="moon" size={24} color={COLORS.white} stroke={8} /> : null}
    </div>
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
      {[10, 14, 18, 22].map((h) => (
        <div key={h} style={{ width: 6, height: h, borderRadius: 2, background: COLORS.white }} />
      ))}
      <div style={{ width: 40, height: 20, borderRadius: 6, border: "2.5px solid white", marginLeft: 10, padding: 2 }}>
        <div style={{ width: "70%", height: "100%", background: "white", borderRadius: 2 }} />
      </div>
    </div>
  </div>
);

/* ---- Pantallas ---- */
const ChatScreen: React.FC<{ t: number }> = ({ t }) => (
  <>
    <StatusBar time="03:12" moon />
    <Header />
    <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: 26 }}>
      <div style={{ ...enter(t, T.s3chat - 0.2), alignSelf: "center", fontSize: 20, color: COLORS.muted, fontWeight: 600 }}>Hoy · 03:12</div>
      <div style={enter(t, T.s3chat)}>
        <Bubble side="in">Hola, ¿tenéis mesa para 4 esta noche?</Bubble>
      </div>
      {t > T.s3chat + 0.45 && t < T.s3reply ? (
        <div style={{ ...enter(t, T.s3chat + 0.45, 10, 0.15), display: "flex", flexDirection: "column" }}>
          <Typing t={t} />
        </div>
      ) : null}
      {t >= T.s3reply ? (
        <div style={{ ...enter(t, T.s3reply), display: "flex", flexDirection: "column", gap: 8 }}>
          <Bubble side="out">¡Sí! Tengo mesa a las 21:00. ¿Te la reservo?</Bubble>
          <div style={{ alignSelf: "flex-end", fontSize: 20, color: COLORS.lime, fontWeight: 600, display: "flex", gap: 6, alignItems: "center" }}>
            <Icon name="check" size={20} stroke={10} /> Respondido al instante
          </div>
        </div>
      ) : null}
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center", gap: 12 }}>
      {[
        ["chat", "Mensajes"],
        ["phone", "Llamada"],
        ["globe", "Web"],
      ].map(([icon, label], i) => {
        const e = prog(t, T.chips[i], 0.3, easeOutBack);
        return (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 18px",
              borderRadius: 30,
              background: "rgba(198,255,61,0.12)",
              border: `2px solid ${COLORS.lime}`,
              color: COLORS.lime,
              fontSize: 22,
              fontWeight: 700,
              opacity: clamp(e),
              scale: `${0.6 + 0.4 * e}`,
              filter: `blur(${(1 - clamp(e)) * 8}px)`,
            }}
          >
            <Icon name={icon} size={24} stroke={9} />
            {label}
          </div>
        );
      })}
    </div>
  </>
);

const BookingScreen: React.FC<{ t: number }> = ({ t }) => {
  const done = prog(t, T.s4confirm, 0.3);
  const rows: [string, string, string][] = [
    ["calendar", "Fecha", "Viernes"],
    ["clock", "Hora", "21:00"],
    ["user", "Comensales", "4"],
  ];
  return (
    <>
      <StatusBar time="03:13" moon />
      <Header />
      <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ ...enter(t, T.s4 + 0.1), fontSize: 34, fontWeight: 800, color: COLORS.white, marginBottom: 6 }}>Nueva reserva</div>
        {rows.map(([icon, label, value], i) => (
          <div
            key={label}
            style={{
              ...enter(t, T.s4 + 0.25 + i * 0.22, 20),
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "20px 22px",
              borderRadius: 22,
              background: "#1F2228",
              border: "1.5px solid rgba(255,255,255,0.06)",
            }}
          >
            <Icon name={icon} size={34} stroke={8} />
            <div style={{ fontSize: 26, color: COLORS.muted, fontWeight: 600, flex: 1 }}>{label}</div>
            <div style={{ fontSize: 32, color: COLORS.white, fontWeight: 800 }}>{value}</div>
          </div>
        ))}
        <div
          style={{
            ...enter(t, T.s4 + 0.95, 20),
            marginTop: 14,
            height: 96,
            borderRadius: 26,
            background: done > 0 ? COLORS.lime : "#2A2E35",
            color: done > 0 ? COLORS.ink : COLORS.white,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            fontSize: 30,
            fontWeight: 800,
            scale: `${1 - 0.06 * Math.sin(Math.PI * clamp((t - T.s4confirm + 0.15) / 0.3))}`,
            boxShadow: done > 0 ? `0 0 ${50 * done}px ${COLORS.lime}66` : "none",
          }}
        >
          {done > 0 ? (
            <>
              <div style={{ scale: `${easeOutBack(done)}` }}>
                <Icon name="check" size={36} color={COLORS.ink} stroke={11} />
              </div>
              Reserva confirmada
            </>
          ) : (
            "Confirmar reserva"
          )}
        </div>
      </div>
    </>
  );
};

const ReminderScreen: React.FC<{ t: number }> = ({ t }) => {
  const drop = prog(t, T.s5notif, 0.5, easeOutCubic);
  const pressed = t >= T.s5press;
  const press = Math.sin(Math.PI * clamp((t - T.s5press + 0.12) / 0.26));
  const ok = prog(t, T.s5press + 0.15, 0.3);
  return (
    <>
      <StatusBar time="19:00" />
      <div style={{ textAlign: "center", color: COLORS.white, marginTop: 40 }}>
        <div style={{ fontSize: 28, fontWeight: 600, color: COLORS.muted }}>Jueves</div>
        <div style={{ fontSize: 128, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.05 }}>19:00</div>
      </div>
      <div
        style={{
          margin: "40px 22px 0",
          ...card,
          borderRadius: 30,
          padding: 26,
          translate: `0 ${(1 - drop) * -420}px`,
          opacity: clamp(drop * 1.5),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: COLORS.muted, fontSize: 21, fontWeight: 600 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: COLORS.lime, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="fork" size={22} color={COLORS.ink} stroke={10} />
          </div>
          TU RESTAURANTE · ahora
        </div>
        <div style={{ fontSize: 24, color: COLORS.lime, fontWeight: 700, marginTop: 16 }}>Recordatorio</div>
        <div style={{ fontSize: 34, color: COLORS.white, fontWeight: 800, marginTop: 6, lineHeight: 1.2 }}>Mañana 21:00, ¿confirmas?</div>
        {ok < 1 ? (
          <div style={{ display: "flex", gap: 12, marginTop: 22, opacity: 1 - ok }}>
            <div
              style={{
                flex: 1,
                height: 74,
                borderRadius: 20,
                background: COLORS.lime,
                color: COLORS.ink,
                fontSize: 26,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                scale: `${1 - (pressed ? 0.08 * press : 0)}`,
              }}
            >
              Confirmar
            </div>
            <div style={{ flex: 1, height: 74, borderRadius: 20, background: "#2A2E35", color: COLORS.white, fontSize: 26, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
              Cambiar
            </div>
          </div>
        ) : null}
        {ok > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: ok < 1 ? -74 : 22, height: 74, fontSize: 28, fontWeight: 800, color: COLORS.lime, opacity: ok, filter: `blur(${(1 - ok) * 8}px)` }}>
            <div style={{ scale: `${easeOutBack(ok)}` }}>
              <Icon name="check" size={34} stroke={11} />
            </div>
            Confirmada. ¡Te esperamos!
          </div>
        ) : null}
      </div>
    </>
  );
};

const WaitlistScreen: React.FC<{ t: number }> = ({ t }) => {
  const cancel = prog(t, T.s6cancel, 0.3);
  const fly = prog(t, T.s6fill, 0.6, easeInOutCubic);
  const filled = prog(t, T.s6fill + 0.55, 0.3);
  const ROW_Y = [150, 250, 350];
  const rows: [string, string, string][] = [
    ["Mesa 2", "20:30", "Marta"],
    ["Mesa 5", "21:00", "Javier"],
    ["Mesa 7", "21:30", "Pablo"],
  ];
  const chipBase = 560;
  const lauraY = chipBase + (ROW_Y[1] - chipBase) * fly;
  return (
    <>
      <StatusBar time="20:41" />
      <div style={{ padding: "6px 26px", fontSize: 34, fontWeight: 800, color: COLORS.white }}>Esta noche</div>
      {rows.map(([mesa, hora, name], i) => {
        const isCancel = i === 1;
        const showFilled = isCancel && filled > 0;
        return (
          <div
            key={mesa}
            style={{
              position: "absolute",
              left: 22,
              right: 22,
              top: ROW_Y[i],
              height: 84,
              borderRadius: 22,
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "0 22px",
              background: showFilled ? `rgba(198,255,61,${0.16 * filled})` : "#1F2228",
              border: showFilled ? `2px solid ${COLORS.lime}` : "1.5px solid rgba(255,255,255,0.06)",
              ...enter(t, T.s6 + 0.1 + i * 0.12, 16),
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.white, width: 112, whiteSpace: "nowrap" }}>{mesa}</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: COLORS.muted, width: 80 }}>{hora}</div>
            {isCancel && !showFilled ? (
              <>
                <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.white, flex: 1, opacity: 1 - 0.6 * cancel, textDecoration: cancel > 0.3 ? "line-through" : "none" }}>{name}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#FF8A7A", opacity: cancel, filter: `blur(${(1 - cancel) * 6}px)`, padding: "6px 12px", borderRadius: 12, background: "rgba(255,138,122,0.12)" }}>Cancelada</div>
              </>
            ) : showFilled ? (
              <>
                <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.white, flex: 1, opacity: filled }}>Laura</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, background: COLORS.lime, padding: "6px 12px", borderRadius: 12, opacity: filled, scale: `${easeOutBack(filled)}` }}>Avisada</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.white, flex: 1 }}>{name}</div>
                <Icon name="check" size={28} stroke={10} />
              </>
            )}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 26, top: 480, fontSize: 22, fontWeight: 700, letterSpacing: "0.2em", color: COLORS.muted, ...enter(t, T.s6 + 0.4, 12) }}>
        LISTA DE ESPERA
      </div>
      {/* Laura vuela desde la lista hasta la mesa liberada */}
      {filled < 1 ? (
        <div
          style={{
            position: "absolute",
            left: 22,
            right: 22,
            top: lauraY,
            height: 84,
            borderRadius: 22,
            background: fly > 0 ? "#2D3A12" : "#1F2228",
            border: `2px solid ${fly > 0 ? COLORS.lime : "rgba(255,255,255,0.06)"}`,
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "0 22px",
            opacity: 1 - filled,
            ...(t < T.s6 + 0.6 ? enter(t, T.s6 + 0.5, 16) : {}),
          }}
        >
          <div style={{ width: 46, height: 46, borderRadius: 23, background: "#3A3F48", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="user" size={28} color={COLORS.white} stroke={8} />
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.white, flex: 1 }}>Laura · 4</div>
          <div style={{ fontSize: 22, color: COLORS.lime, fontWeight: 700 }}>{fly > 0 ? "Avisando…" : "1.º"}</div>
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: 22,
          right: 22,
          top: chipBase + 100 - 100 * fly,
          height: 84,
          borderRadius: 22,
          background: "#1F2228",
          border: "1.5px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "0 22px",
          ...(t < T.s6 + 0.75 ? enter(t, T.s6 + 0.65, 16) : {}),
        }}
      >
        <div style={{ width: 46, height: 46, borderRadius: 23, background: "#3A3F48", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="user" size={28} color={COLORS.white} stroke={8} />
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.white, flex: 1 }}>Diego · 2</div>
        <div style={{ fontSize: 22, color: COLORS.muted, fontWeight: 700 }}>{fly > 0.5 ? "1.º" : "2.º"}</div>
      </div>
    </>
  );
};

const MenuScreen: React.FC<{ t: number }> = ({ t }) => (
  <>
    <StatusBar time="13:05" />
    <Header />
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 26 }}>
      <div style={enter(t, T.s7 + 0.15)}>
        <Bubble side="in">¿El risotto lleva frutos secos?</Bubble>
      </div>
      <div style={{ ...enter(t, T.s7reply), alignSelf: "flex-end", width: "88%", ...card, borderRadius: 26, padding: 20, background: "#1C2014", border: `2px solid ${COLORS.lime}55` }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 70, height: 70, borderRadius: 35, background: "radial-gradient(circle at 40% 35%, #F3E3C0, #C9A86A 70%)", border: "5px solid #EDEDED" }} />
          <div>
            <div style={{ fontSize: 20, color: COLORS.muted, fontWeight: 700, letterSpacing: "0.12em" }}>CARTA</div>
            <div style={{ fontSize: 29, color: COLORS.white, fontWeight: 800 }}>Risotto de setas</div>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
          <div style={{ ...enter(t, T.s7pills[0], 10, 0.25), padding: "8px 14px", borderRadius: 14, background: COLORS.lime, color: COLORS.ink, fontSize: 22, fontWeight: 800 }}>
            Sin frutos secos
          </div>
          <div style={{ ...enter(t, T.s7pills[0] + 0.2, 10, 0.25), padding: "8px 14px", borderRadius: 14, background: "#2A2E35", color: COLORS.white, fontSize: 22, fontWeight: 700 }}>
            Alérgenos: lácteos
          </div>
        </div>
      </div>
      {t > T.s7pills[1] - 0.1 ? (
        <div style={enter(t, T.s7pills[1] - 0.1)}>
          <Bubble side="in">¿Y para un grupo de 10?</Bubble>
        </div>
      ) : null}
      {t > T.s7pills[1] + 0.35 ? (
        <div style={{ ...enter(t, T.s7pills[1] + 0.35), display: "flex", flexDirection: "column" }}>
          <Bubble side="out">Perfecto, tenemos menú de grupo.</Bubble>
        </div>
      ) : null}
    </div>
  </>
);

const SCREENS: { start: number; end: number; C: React.FC<{ t: number }> }[] = [
  { start: T.s3 - 1, end: T.s4, C: ChatScreen },
  { start: T.s4, end: T.s5, C: BookingScreen },
  { start: T.s5, end: T.s6, C: ReminderScreen },
  { start: T.s6, end: T.s7, C: WaitlistScreen },
  { start: T.s7, end: T.s8 + 1, C: MenuScreen },
];

export const Phone: React.FC<{ t: number }> = ({ t }) => {
  const inP = prog(t, T.s3, 0.6, easeOutCubic);
  const outP = prog(t, T.s8 - 0.05, 0.45, easeInCubic);
  if (inP <= 0 || outP >= 1) return null;
  const y = (1 - inP) * 1350 + outP * 1350;
  return (
    <div
      style={{
        position: "absolute",
        left: (1080 - PW) / 2,
        top: 670,
        width: PW,
        height: PH,
        translate: `0 ${y}px`,
        rotate: `${(1 - inP) * 6 - outP * 5}deg`,
        borderRadius: 70,
        background: "#0A0B0D",
        padding: 14,
        boxShadow: `0 40px 120px rgba(0,0,0,0.7), 0 0 0 2px rgba(255,255,255,0.10), 0 0 60px ${COLORS.lime}22`,
      }}
    >
      <div style={{ position: "relative", width: SW, height: PH - 28, borderRadius: 56, overflow: "hidden", background: "linear-gradient(180deg,#15171C,#0E1013)" }}>
        {SCREENS.map(({ start, end, C }, i) => {
          const a = i === 0 ? 1 : prog(t, start - 0.05, 0.42, easeInOutCubic);
          const b = i === SCREENS.length - 1 ? 0 : prog(t, end - 0.05, 0.42, easeInOutCubic);
          if (a <= 0 || b >= 1) return null;
          return (
            <div key={i} style={{ position: "absolute", inset: 0, translate: `${(1 - a) * SW - b * SW}px 0`, fontFamily: "inherit" }}>
              <C t={t} />
            </div>
          );
        })}
        <div style={{ position: "absolute", top: 14, left: SW / 2 - 60, width: 120, height: 34, borderRadius: 17, background: "#000" }} />
      </div>
    </div>
  );
};
