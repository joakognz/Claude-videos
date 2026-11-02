import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame, Img } from "remotion";
import { Audio } from "@remotion/media";
import { C, EASE, EASE_OUT, FPS, TL, Trans, clamp01, ramp, rnd } from "./theme";
import { Captions } from "./components/Captions";
import { StatusBar, TabStrip, TAB_SETS, TAB_X, Cursor } from "./components/Chrome";
import { GlitchBox } from "./components/Glitch";
import { Hook } from "./scenes/Hook";
import { Police } from "./scenes/Police";
import { Mail } from "./scenes/Mail";
import { Lobby, Call } from "./scenes/Call";
import { Money } from "./scenes/Money";
import { Time } from "./scenes/TimeUnknown";
import { Unknown } from "./scenes/Unknown";
import { Lesson1, Lesson2 } from "./scenes/Lesson";
import { Cta } from "./scenes/Cta";
import { Finale } from "./scenes/Finale";

const renderScene = (id: string, t: number): React.ReactNode => {
  switch (id) {
    case "hook": case "noexistia": return <Hook t={t} />;
    case "policia": return <Police t={t} />;
    case "correo": case "duda": return <Mail t={t} />;
    case "lobby": return <Lobby t={t} />;
    case "llamada": return <Call t={t} />;
    case "dinero": return <Money t={t} />;
    case "tiempo": return <Time t={t} />;
    case "anonimo": return <Unknown t={t} />;
    case "leccion1": return <Lesson1 t={t} />;
    case "leccion2": return <Lesson2 t={t} />;
    case "cta": case "crt": return <Cta t={t} />;
    default: return null;
  }
};

const WIN: Record<Trans["type"], [number, number]> = { glitch: [0.1, 0.23], slices: [0.2, 0.2], tab: [0.32, 0.17], pixel: [0.23, 0.23], zoom: [0.2, 0.13], bar: [0.17, 0.23] };
const ids = TL.scenes.map((s) => s.id);
const idxAt = (t: number) => { let k = 0; TL.scenes.forEach((s, i) => { if (t >= s.t) k = i; }); return k; };
const activeTrans = (t: number) => TL.trans.find((T) => t >= T.t - WIN[T.type][0] && t < T.t + WIN[T.type][1]);

const PixelCover: React.FC<{ u: number }> = ({ u }) => {
  const first = u < 0.5;
  const size = first ? 120 : 60;
  const c = first ? clamp01(u * 2) : clamp01((u - 0.5) * 2);
  const nx = 1080 / size, ny = Math.ceil(1920 / size);
  const cols = [C.tile, C.room, C.border, C.mid, C.tile, C.room, C.orange];
  const rects: React.ReactNode[] = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const r = rnd(i * 13 + j * 29 + (first ? 1 : 7));
    const on = first ? r < c * 1.15 : r > c * 1.15;
    if (on) rects.push(<rect key={`${i}-${j}`} x={i * size} y={j * size} width={size} height={size} fill={cols[Math.floor(rnd(i * 5 + j * 3 + 2) * cols.length)]} />);
  }
  return <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>{rects}</svg>;
};

const Stage: React.FC<{ t: number }> = ({ t }) => {
  const idx = idxAt(t);
  const T = activeTrans(t);
  if (!T) return <>{renderScene(ids[idx], t)}</>;
  const [pre, post] = WIN[T.type];
  const d = t - T.t;
  const u = clamp01((d + pre) / (pre + post));
  const toIdx = ids.indexOf(T.to);
  const prev = renderScene(ids[toIdx - 1], t), next = renderScene(T.to, t);
  switch (T.type) {
    case "glitch":
      return <GlitchBox seed={Math.floor(t * 30)} amount={0.95 * (1 - Math.abs(d) / 0.23)} w={1080} h={1920} scale={2}>{d < 0 ? prev : next}</GlitchBox>;
    case "slices": {
      const bands = 10, bh = 192;
      return (
        <>
          {u < 0.5 ? prev : next}
          {Array.from({ length: bands }, (_, i) => {
            const c = u < 0.5 ? clamp01(clamp01(u * 2) * 1.5 - i * 0.05) : 1 - clamp01(clamp01((u - 0.5) * 2) * 1.5 - (bands - i) * 0.05);
            const h = EASE(c) * bh;
            return <div key={i} style={{ position: "absolute", left: 0, width: 1080, top: i * bh + (bh - h) / 2, height: h, background: i % 2 ? C.ink : C.tile }} />;
          })}
        </>
      );
    }
    case "tab": {
      if (d < 0) return <>{prev}</>;
      const k = EASE_OUT(ramp(d, 0, 0.17));
      return (
        <>
          <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - k) * 70}px)`, opacity: 0.4 + 0.6 * k }}>{next}</div>
          <div style={{ position: "absolute", inset: 0, background: C.tile, opacity: (1 - ramp(d, 0, 0.07)) * 0.6 }} />
        </>
      );
    }
    case "pixel":
      return <>{u < 0.5 ? prev : next}<PixelCover u={u} /></>;
    case "zoom": {
      if (d >= 0) {
        const k = EASE_OUT(ramp(d, 0, 0.13));
        return <><div style={{ position: "absolute", inset: 0, transform: `scale(${1.1 - 0.1 * k})`, transformOrigin: "540px 1000px" }}>{next}</div><div style={{ position: "absolute", inset: 0, background: C.tile, opacity: 1 - k }} /></>;
      }
      const k = EASE(ramp(d, -0.2, 0));
      return <><div style={{ position: "absolute", inset: 0, transform: `scale(${1 + 1.7 * k})`, transformOrigin: "795px 1375px" }}>{prev}</div><div style={{ position: "absolute", inset: 0, background: C.tile, opacity: k * k * 0.9 }} /></>;
    }
    case "bar": {
      const x = u * 1180 - 50;
      return (
        <>
          {prev}
          <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${Math.max(0, 1080 - x)}px 0 0)`, background: C.room }}>{next}</div>
          <div style={{ position: "absolute", left: x, top: 0, width: 60, height: 1920, background: C.orange }} />
          <div style={{ position: "absolute", left: x + 60, top: 0, width: 8, height: 1920, background: C.ink }} />
        </>
      );
    }
  }
};

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const id = ids[idxAt(t)];
  const T = activeTrans(t);
  const tabId = T && t >= T.t ? T.to : id;
  const finale = t >= TL.ev.close;
  // zoom-punch on the first word of every sentence
  const pT = [...TL.punch].reverse().find((p) => t >= p) ?? 0;
  const punch = 1 + 0.07 * (1 - EASE_OUT(ramp(t, pT, pT + 0.3)));
  // CRT blackout
  const dc = t - TL.ev.crt;
  const crt = dc >= 0 && !finale;
  const sy = crt ? Math.max(0.004, 1 - EASE(ramp(dc, 0, 0.15))) : 1;
  const sx = crt ? Math.max(0.01, 1 - EASE(ramp(dc, 0.15, 0.26))) : 1;
  // tab-jump cursor
  const tabT = TL.trans.find((x) => x.type === "tab" && t >= x.t - 0.32 && t < x.t + 0.35);
  let tabCursor: React.ReactNode = null;
  if (tabT) {
    const set = TAB_SETS[tabT.to];
    const x = TAB_X(set.active, set.tabs.length);
    const k = EASE(ramp(t, tabT.t - 0.32, tabT.t - 0.02));
    tabCursor = <Cursor x={820 + (x - 820) * k} y={900 + (292 - 900) * k} click={ramp(t, tabT.t - 0.02, tabT.t + 0.3)} />;
  }
  if (finale) {
    return (
      <AbsoluteFill style={{ background: C.black }}>
        <Finale t={t} />
        <Audio src={staticFile("audio/mix.wav")} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ background: crt ? C.black : C.room }}>
      <div style={{ position: "absolute", inset: 0, background: C.room, transform: `scale(${sx}, ${sy})`, overflow: "hidden", boxShadow: crt ? "0 0 60px 10px rgba(255,255,255,0.8)" : undefined }}>
        <div style={{ position: "absolute", inset: 0, transform: `scale(${punch})`, transformOrigin: "540px 960px" }}>
          <Stage t={t} />
          <Captions t={t} />
        </div>
        <StatusBar t={t} rec={t < TL.ev.crt} />
        <TabStrip id={tabId} />
        {tabCursor}
        <Img src={staticFile("tex/scanlines.png")} style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: 0.8 }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${staticFile("tex/noise.png")})`, backgroundSize: "540px 540px", backgroundPosition: `${(frame * 97) % 540}px ${(frame * 61) % 540}px`, opacity: 0.35 }} />
      </div>
      {crt && dc > 0.15 && dc < 0.3 && <div style={{ position: "absolute", left: 540 - 6, top: 960 - 6, width: 12, height: 12, borderRadius: 6, background: C.tile, opacity: 1 - ramp(dc, 0.2, 0.3), boxShadow: "0 0 40px 20px rgba(255,255,255,0.8)" }} />}
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};
