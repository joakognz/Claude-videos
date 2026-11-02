"""Builds the reel's audio mix and timeline («Sala falsa»).

Inputs:  ../audio/raw/deepfake-jefe-falso/*.mp3 (one ElevenLabs take, used whole), data/words.json (scripts/align.py)
Outputs: public/audio/mix.wav (music + sfx + voice, -14 LUFS), src/timeline.json

Run: python scripts/build.py
"""
import json, os, subprocess
import numpy as np
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "..", "audio", "raw", "deepfake-jefe-falso")
SR, FPS = 48000, 30
TOTAL = 52.0
N = int(TOTAL * SR)
VOICE_AT = 0.0
rng = np.random.default_rng(7)


def load():
    src = next(f for f in os.listdir(RAW) if f.endswith(".mp3"))
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(RAW, src), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32).astype(np.float64)


def speech_rms(x):
    hop = SR // 100
    n = len(x) // hop
    r = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    return np.sqrt(np.mean(r[r > 10 ** (-40 / 20)] ** 2))


W = json.load(open(os.path.join(ROOT, "data", "words.json")))["A"]
x = load()
x *= 10 ** (-18 / 20) / speech_rms(x)
voice = np.zeros(N)
voice[:len(x)] = x[:N]
SEGS = W["segments"]
seg_words = [[{"w": w["w"], "s": w["s"], "e": w["e"]} for w in W["words"] if a - 0.01 <= w["s"] < b] for a, b in SEGS]
VOICE_END = SEGS[-1][1]


def wt(seg, idx):
    return seg_words[seg][idx]["s"]


def we(seg, idx):
    return seg_words[seg][idx]["e"]


def ss(seg):
    return SEGS[seg][0]


# ── scene cuts and transitions ──────────────────────────────────────────
CRT = 49.92          # the call is cut
CLOSE = 50.2         # closing card starts
cuts = [0.0, ss(1) - 0.02, ss(2) - 0.02, ss(3) - 0.02, ss(4) - 0.02, ss(5) - 0.02, 19.80, ss(7) - 0.02, ss(8) - 0.02,
        ss(9) - 0.02, ss(10) - 0.02, ss(11) - 0.02, ss(12) - 0.02, ss(14) - 0.02, CRT, CLOSE]
cuts = [round(c, 3) for c in cuts]
# scene ids: HOOK, NOEXISTIA, POLICIA, CORREO, DUDA, LOBBY, LLAMADA, (reveal inside LLAMADA), DINERO, TIEMPO, ANONIMO, LECCION1, LECCION2, CTA, CRT, CIERRE
SCENE_IDS = ["hook", "noexistia", "policia", "correo", "duda", "lobby", "llamada", "dinero", "tiempo", "anonimo",
             "leccion1", "leccion2", "cta", "crt", "cierre"]
# cuts[i] is the start of SCENE_IDS[i]; llamada runs until ss(8) (reveal is inside it), so drop the ss(7) cut
cuts_scene = [0.0, cuts[1], cuts[2], cuts[3], cuts[4], cuts[5], cuts[6], cuts[8], cuts[9], cuts[10], cuts[11], cuts[12], cuts[13], CRT, CLOSE]
scenes = [{"id": i, "t": t} for i, t in zip(SCENE_IDS, cuts_scene)]
# transition into scene i (type)
trans = {"noexistia": "glitch", "policia": "slices", "correo": "tab", "duda": None, "lobby": "pixel", "llamada": None,
         "dinero": "zoom", "tiempo": "bar", "anonimo": "tab", "leccion1": "pixel", "leccion2": None, "cta": "slices",
         "crt": None, "cierre": None}
tr = [{"t": s["t"], "type": trans[s["id"]], "to": s["id"]} for s in scenes if trans.get(s["id"])]
punch = [round(SEGS[i][0] + 0.0, 3) for i in range(len(SEGS))]


def cap(chunks, end, **kw):
    return {"chunks": [{"text": c[0], "t": round(c[1], 3), "hl": bool(c[2]) if len(c) > 2 else False} for c in chunks],
            "start": round(chunks[0][1], 3), "end": round(end, 3), **kw}


caps = [
    cap([("SU JEFE", 0.0), ("ORDENÓ", wt(0, 3)), ("TRANSFERIR", wt(0, 4), 1)], wt(0, 7) - 0.02),
    cap([("VEINTICINCO", wt(0, 7)), ("MILLONES", wt(0, 8))], wt(0, 9) - 0.04),
    cap([("DE DÓLARES", wt(0, 9), 1)], ss(1) - 0.1),
    cap([("SU JEFE", wt(1, 0)), ("NO EXISTÍA", wt(1, 2), 1)], ss(2) - 0.1),
    cap([("LA POLICÍA", wt(2, 2)), ("HONG KONG", wt(2, 5), 1)], wt(2, 8) - 0.04),
    cap([("FEBRERO", wt(2, 8)), ("2024", wt(2, 10), 1)], ss(3) - 0.1),
    cap([("UN EMPLEADO", wt(3, 0)), ("DE FINANZAS", wt(3, 2), 1)], wt(3, 6) - 0.04),
    cap([("MULTINACIONAL", wt(3, 6), 1)], wt(3, 7) - 0.04),
    cap([("RECIBIÓ", wt(3, 7)), ("UN CORREO", wt(3, 8), 1)], wt(3, 12) - 0.04),
    cap([("OPERACIÓN", wt(3, 12)), ("SECRETA", wt(3, 13), 1)], ss(4) - 0.1),
    cap([("DESCONFIÓ", wt(4, 0), 1)], wt(4, 3) - 0.04),
    cap([("ERA UNA", wt(4, 3)), ("ESTAFA", wt(4, 6), 1)], ss(5) - 0.1),
    cap([("ENTONCES", wt(5, 0))], wt(5, 1) - 0.04),
    cap([("LO INVITARON", wt(5, 1), 1)], wt(5, 5) - 0.04),
    cap([("VIDEOLLAMADA", wt(5, 5), 1)], ss(6) - 0.04),
    cap([("AHÍ ESTABAN", wt(6, 0))], wt(6, 3) - 0.04),
    cap([("DIRECTOR", wt(6, 3)), ("FINANCIERO", wt(6, 4), 1)], wt(6, 6) - 0.04),
    cap([("VARIOS", wt(6, 6)), ("COMPAÑEROS", wt(6, 7), 1)], ss(7) - 0.04),
    cap([("TODOS", wt(7, 0)), ("FALSOS", wt(7, 1), 1)], ss(8) - 0.1, sub=[["SEGÚN LA POLICÍA", wt(7, 2)]]),
    cap([("15", wt(8, 1), 1), ("TRANSFERENCIAS", wt(8, 2))], wt(8, 4) - 0.04),
    cap([("5", wt(8, 4), 1), ("CUENTAS", wt(8, 5))], ss(9) - 0.1),
    cap([("LO DESCUBRIÓ", wt(9, 0))], wt(9, 2) - 0.04),
    cap([("UNA", wt(9, 2)), ("SEMANA", wt(9, 3), 1), ("DESPUÉS", wt(9, 4))], wt(9, 6) - 0.04),
    cap([("CONSULTARLO", wt(9, 6)), ("SU EMPRESA", wt(9, 8), 1)], ss(10) - 0.1),
    cap([("NO HA DICHO", wt(10, 2), 1)], wt(10, 5) - 0.04),
    cap([("QUIÉN ERA", wt(10, 5))], wt(10, 7) - 0.04),
    cap([("NI QUÉ", wt(10, 7)), ("EMPRESA", wt(10, 9), 1)], ss(11) - 0.1),
    cap([("UNA CARA", wt(11, 0)), ("O UNA", wt(11, 2)), ("VOZ", wt(11, 4), 1)], wt(11, 5) - 0.04),
    cap([("YA NO", wt(11, 5)), ("PRUEBAN", wt(11, 7)), ("NADA", wt(11, 8), 1)], ss(12) - 0.1),
    cap([("NINGÚN", wt(12, 0)), ("PAGO", wt(12, 1), 1), ("DEBERÍA", wt(12, 2))], wt(12, 3) - 0.04),
    cap([("DEPENDER", wt(12, 3)), ("DE", wt(12, 4)), ("RECONOCER", wt(12, 5), 1)], wt(12, 7) - 0.04),
    cap([("ALGUIEN", wt(12, 7), 1)], ss(13) - 0.1),
    cap([("CONFÍRMALO", wt(13, 0), 1)], wt(13, 1) - 0.04),
    cap([("POR OTRO", wt(13, 1)), ("CANAL", wt(13, 3), 1)], wt(13, 4) - 0.04),
    cap([("LLAMANDO", wt(13, 4)), ("TÚ", wt(13, 5), 1)], wt(13, 6) - 0.04),
    cap([("AL NÚMERO", wt(13, 6)), ("DE SIEMPRE", wt(13, 8), 1)], ss(14) - 0.1),
    cap([("COMENTA", wt(14, 0)), ("AUDITORIA", wt(14, 1), 1)], wt(14, 3) - 0.04),
    cap([("AYUDAMOS", wt(14, 4)), ("AUTOMATIZAR", wt(14, 6), 1)], wt(14, 7) - 0.04),
    cap([("TU NEGOCIO", wt(14, 7), 1)], VOICE_END + 0.25),
]

import itertools
for c_ in caps:
    ws = [ch["text"] for ch in c_["chunks"]]
    one = len(" ".join(ws))
    best = min([max(len(" ".join(ws[:k])), len(" ".join(ws[k:]))) for k in range(1, len(ws))] or [99])
    if one > 14 and best > 13:
        print("CAPTION TOO LONG", ws)

ev = {
    "zoomCfo": 0.85, "bigMoney": wt(0, 7), "moreThan": wt(0, 5),
    "cfoBreak": ss(1) + 0.2,
    "policeLabel": wt(2, 3), "hk": wt(2, 5), "feb": wt(2, 8), "year": wt(2, 10),
    "empTile": ss(3), "finanzas": wt(3, 2), "multi": wt(3, 6), "mailIn": wt(3, 8) - 0.05, "secret": wt(3, 12),
    "strike": ss(4) + 0.15, "doubt": wt(4, 2), "estafa": wt(4, 6),
    "lobby": ss(5), "cursorIn": ss(5) + 0.35, "click": 19.62, "join": 19.80,
    "tile0": wt(6, 3), "tile1": wt(6, 6), "tile2": wt(6, 6) + 0.2, "tile3": wt(6, 7), "tile4": wt(6, 7) + 0.18,
    "reveal": wt(7, 1), "cut": wt(7, 0) - 0.04, "mesh": wt(7, 1), "pixel": wt(7, 2) + 0.2, "shatter": wt(7, 4),
    "rows": wt(8, 1) + 0.05, "rowStep": 0.075, "accounts": wt(8, 4), "odo0": wt(8, 1) + 0.15, "odo1": wt(8, 5) + 0.15,
    "cells0": wt(9, 3), "cellStep": 0.26, "alert": wt(9, 6), "company": wt(9, 9),
    "unk0": ss(10), "unkEmp": wt(10, 5), "unkCo": wt(10, 7),
    "face": wt(11, 0) - 0.05, "voice": wt(11, 3), "bothFalse": wt(11, 6), "nada": wt(11, 8),
    "pay": wt(12, 1), "verify": wt(12, 5), "flow": ss(13), "other": wt(13, 2), "phone": wt(13, 4), "check": wt(13, 9),
    "type0": wt(14, 1) - 0.12, "typeStep": 0.068, "send": SEGS[-1][1] - 0.1, "crt": CRT, "close": CLOSE, "tone": 51.0,
}
for i_ in range(len(seg_words[14])):
    ev[f"cw{i_}"] = wt(14, i_)
ev = {k: round(v, 3) for k, v in ev.items()}

# ── audio helpers ───────────────────────────────────────────────────────
tt = np.arange(N) / SR


def lp(x, fc, order=2): return sosfilt(butter(order, fc, fs=SR, output="sos"), x)
def hp(x, fc, order=2): return sosfilt(butter(order, fc, btype="high", fs=SR, output="sos"), x)
def bp(x, lo, hi, order=2): return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)
def note_hz(m): return 440 * 2 ** ((m - 69) / 12)
def step(t, a, b): return np.clip((t - a) / (b - a), 0, 1)


def place(buf, y, t0, gain=1.0):
    i = int(round(t0 * SR))
    if i < 0:
        y, i = y[-i:], 0
    n = max(0, min(len(y), len(buf) - i))
    buf[i:i + n] += y[:n] * gain


def env_ar(n, a, r):
    e = np.ones(n)
    na, nr = min(int(a * SR), n), min(int(r * SR), n)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e


# ── music: dry, tense electronica at 104 BPM (A minor), then a clean, brighter pulse for the lesson ──
BPM = 104
beat = 60 / BPM
bar = 4 * beat
mus_t = np.zeros(N)  # tense layer, mono components kept separate for filtering
bass_raw, click, hat, stab, noise_lo = (np.zeros(N) for _ in range(5))
bass_pat = [33, 33, 36, 33, 33, 31, 33, 36]  # A1 A1 C2 A1 | A1 G1 A1 C2 (8th notes)
nb = int(TOTAL / (beat / 2)) + 1
for k in range(nb):
    t0 = k * beat / 2
    j = int(t0 * SR)
    nn = min(int(beat / 2 * 0.92 * SR), N - j)
    if nn <= 0:
        break
    tl = np.arange(nn) / SR
    f = note_hz(bass_pat[k % 8] + (0 if (k // 16) % 2 == 0 else 0))
    saw = 2 * ((tl * f) % 1) - 1
    bass_raw[j:j + nn] += (0.8 * saw + 0.5 * np.sin(2 * np.pi * f * tl)) * np.exp(-tl / 0.18) * env_ar(nn, 0.004, 0.03)
    # dry click on every 8th, accent on the off-beat
    nc = min(int(0.02 * SR), N - j)
    click[j:j + nc] += hp(rng.standard_normal(nc), 3000) * np.exp(-np.arange(nc) / SR / 0.004) * (0.9 if k % 2 else 0.35)
for k in range(int(TOTAL / (beat / 4)) + 1):
    j = int(k * beat / 4 * SR)
    nn = min(int(0.04 * SR), N - j)
    if nn > 0:
        hat[j:j + nn] += hp(rng.standard_normal(nn), 8000) * np.exp(-np.arange(nn) / SR / 0.009) * (0.8 if k % 4 == 2 else 0.35)
for b in range(int(TOTAL / bar) + 1):  # tritone stab on the 1 of every second bar
    if b % 2:
        continue
    j = int(b * bar * SR)
    nn = min(int(0.45 * SR), N - j)
    if nn > 0:
        tl = np.arange(nn) / SR
        s = sum((2 * ((tl * note_hz(m)) % 1) - 1) for m in (45, 51, 57)) / 3
        stab[j:j + nn] += lp(s, 1400) * np.exp(-tl / 0.16)
noise_lo = lp(rng.standard_normal(N), 900) * 0.25

# filter opening: crossfade 3 cutoffs; opens at each money block, stays closed in the first part
bass_c = lp(bass_raw, 220); bass_m = lp(bass_raw, 700); bass_o = lp(bass_raw, 2600)
open_amt = np.clip(step(tt, 0, 24) * 0.35 + step(tt, ev["rows"] - 0.2, ev["odo1"]) * 0.9 + step(tt, ev["cells0"], ev["unkCo"]) * 0.6, 0, 1)
open_amt = np.clip(open_amt, 0, 1)
bass = bass_c * (1 - open_amt) + bass_m * open_amt * (1 - step(open_amt, 0.6, 1)) + bass_o * step(open_amt, 0.6, 1)
beat_kick = np.zeros(N)
for k in range(int(TOTAL / beat) + 1):
    j = int(k * beat * SR)
    nn = min(int(0.3 * SR), N - j)
    if nn > 0:
        tl = np.arange(nn) / SR
        fr = 48 + 90 * np.exp(-tl / 0.025)
        beat_kick[j:j + nn] += np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tl / 0.12)

# on/off of the tense layer
CUT_T = ev["cut"]
tense_on = (step(tt, 0.0, 0.08)
            * (1 - step(tt, CUT_T - 0.01, CUT_T))                                # music cut at "todos falsos"
            + step(tt, ev["rows"] - 0.25, ev["rows"] + 0.05) * (1 - step(tt, ev["face"] - 0.3, ev["face"] - 0.05)))
tense_on = np.clip(tense_on, 0, 1)
tense = (0.85 * bass + 0.55 * beat_kick * 0.9 + 0.22 * click + 0.14 * hat + 0.2 * stab * (0.4 + 0.6 * open_amt) + 0.04 * noise_lo)
tense *= tense_on
# lesson: clean luminous pulse, open voicings, same tempo
lessonL, lessonR = np.zeros(N), np.zeros(N)
chords = [[57, 64, 71, 76], [53, 60, 67, 72], [48, 55, 62, 67], [55, 62, 69, 74]]  # Am add9-ish open → F → C → G
t0, ci = ev["face"] - 0.1, 0
while t0 < ev["send"] + 0.4:
    ch = chords[ci % 4]
    j = int(t0 * SR)
    nn = min(int(bar * SR * 1.02), N - j)
    tl = np.arange(nn) / SR
    e = env_ar(nn, 0.02, 0.25) * np.exp(-tl / 1.6)
    for m in ch:
        f = note_hz(m)
        lessonL[j:j + nn] += (np.sin(2 * np.pi * f * 0.998 * tl) + 0.3 * np.sin(2 * np.pi * f * 2 * tl)) * 0.05 * e
        lessonR[j:j + nn] += (np.sin(2 * np.pi * f * 1.002 * tl) + 0.3 * np.sin(2 * np.pi * f * 2 * tl)) * 0.05 * e
    for s in range(8):  # plucky open-fifth eighth notes
        jj = int((t0 + s * beat / 2) * SR)
        n2 = min(int(0.25 * SR), N - jj)
        if n2 > 0:
            tl2 = np.arange(n2) / SR
            f = note_hz(ch[s % 4] + 12)
            lessonR[jj:jj + n2] += np.sin(2 * np.pi * f * tl2) * np.exp(-tl2 / 0.07) * 0.035
            lessonL[jj:jj + n2] += np.sin(2 * np.pi * f * tl2) * np.exp(-tl2 / 0.07) * 0.035
    t0 += bar
    ci += 1
les_on = step(tt, ev["face"] - 0.1, ev["face"] + 0.2) * (1 - step(tt, CRT - 0.05, CRT + 0.05))
lesson_pulse = (0.34 * beat_kick + 0.06 * hat + 0.06 * click) * les_on
# hum during the silence of the reveal
hum_win = step(tt, CUT_T, CUT_T + 0.05) * (1 - step(tt, ev["rows"] - 0.15, ev["rows"]))
hum = (np.sin(2 * np.pi * 50 * tt) * 0.5 + np.sin(2 * np.pi * 100 * tt) * 0.25 + np.sin(2 * np.pi * 150 * tt) * 0.12
       + lp(rng.standard_normal(N), 300) * 0.25) * hum_win * (0.7 + 0.3 * np.sin(2 * np.pi * 7 * tt))
# faint digital noise bed all along (not through the silence)
bed = hp(rng.standard_normal(N), 6000) * 0.012 * (1 - hum_win) * (1 - step(tt, CRT, CRT + 0.1))
mL = tense + lessonL + lesson_pulse + hum * 0.55 + bed
mR = tense + lessonR + lesson_pulse + hum * 0.55 + bed

# ── sound effects ───────────────────────────────────────────────────────
sfx = np.zeros(N)
sfx_list = []


def bell(t, m0, bend=0.0, crush=False, gain=1.0, dur=1.0):
    nn = int(dur * SR)
    tl = np.arange(nn) / SR
    f = note_hz(m0) * 2 ** (-bend * step(tl, 0, dur) / 12) if bend else note_hz(m0) * np.ones(nn)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = (np.sin(ph) + 0.35 * np.sin(2.76 * ph) * np.exp(-tl / 0.1)) * np.exp(-tl / (0.35 if not crush else 0.5)) * 0.35
    if crush:
        q = 6
        y = np.round(y * q) / q
        y = y[::1].copy()
        hold = 12
        y = np.repeat(y[::hold], hold)[:nn]
    place(sfx, y * env_ar(nn, 0.002, 0.05), t, gain)


def tone(t, kind="clean", gain=1.0):
    sfx_list.append({"t": round(t, 3), "type": "tone-" + kind})
    if kind == "clean":
        bell(t, 76, gain=gain); bell(t + 0.17, 83, gain=gain)
    else:
        bell(t, 76, bend=7, crush=True, gain=gain, dur=1.1); bell(t + 0.17, 83, bend=11, crush=True, gain=gain, dur=1.1)


def add(kind, t, gain=1.0):
    sfx_list.append({"t": round(t, 3), "type": kind})
    if kind == "click":
        nn = int(0.06 * SR); tl = np.arange(nn) / SR
        y = (bp(rng.standard_normal(nn), 1500, 6000) * 0.7 + np.sin(2 * np.pi * 900 * tl) * 0.4) * np.exp(-tl / 0.006)
        nn2 = int(0.05 * SR); tl2 = np.arange(nn2) / SR
        place(sfx, y, t, gain); place(sfx, bp(rng.standard_normal(nn2), 800, 3000) * np.exp(-tl2 / 0.01) * 0.5, t + 0.07, gain)
        return
    if kind == "notif":
        nn = int(0.6 * SR); tl = np.arange(nn) / SR
        y = (np.sin(2 * np.pi * note_hz(88) * tl) * np.exp(-tl / 0.12) + 0.7 * np.sin(2 * np.pi * note_hz(95) * np.maximum(tl - 0.1, 0)) * (tl > 0.1) * np.exp(-np.maximum(tl - 0.1, 0) / 0.2)) * 0.3
    elif kind == "tick":  # odometer
        nn = int(0.03 * SR); tl = np.arange(nn) / SR
        y = (hp(rng.standard_normal(nn), 2500) * 0.6 + np.sin(2 * np.pi * 1800 * tl) * 0.4) * np.exp(-tl / 0.004) * 0.7
    elif kind == "clock":
        nn = int(0.05 * SR); tl = np.arange(nn) / SR
        y = (np.sin(2 * np.pi * 2400 * tl) * np.exp(-tl / 0.006) + bp(rng.standard_normal(nn), 2000, 6000) * np.exp(-tl / 0.004) * 0.5) * 0.5
    elif kind == "glitch":
        nn = int(0.28 * SR); tl = np.arange(nn) / SR
        gate = (np.sin(2 * np.pi * 38 * tl) > -0.2).astype(float)
        q = np.round(rng.standard_normal(nn) * 4) / 4
        y = (bp(q, 600, 6000) * 0.7 + np.sin(2 * np.pi * (300 + 2000 * rng.random()) * tl) * 0.3) * gate * np.exp(-tl / 0.12) * 0.55
    elif kind == "key":
        nn = int(0.05 * SR); tl = np.arange(nn) / SR
        y = (bp(rng.standard_normal(nn), 2000, 6000) * 0.6 + np.sin(2 * np.pi * 1700 * tl) * 0.2) * np.exp(-tl / 0.008)
    elif kind == "crt":
        nn = int(0.6 * SR); tl = np.arange(nn) / SR
        f = 3000 * np.exp(-tl / 0.09) + 60
        y = (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.5 + hp(rng.standard_normal(nn), 4000) * 0.2 * np.exp(-tl / 0.05)) * np.exp(-tl / 0.22)
        y[: int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))
    elif kind == "whoosh":
        nn = int(0.35 * SR); tl = np.arange(nn) / SR
        y = bp(rng.standard_normal(nn), 400, 5000) * np.sin(np.pi * tl / 0.35) ** 2 * 0.35
    elif kind == "ping":  # row filled
        nn = int(0.06 * SR); tl = np.arange(nn) / SR
        y = np.sin(2 * np.pi * 1500 * tl) * np.exp(-tl / 0.012) * 0.25
    elif kind == "check":
        nn = int(0.8 * SR); tl = np.arange(nn) / SR
        y = sum(np.sin(2 * np.pi * note_hz(m) * tl) * a for m, a in ((84, 0.5), (88, 0.35), (91, 0.3))) * np.exp(-tl / 0.4) * 0.3
    elif kind == "stamp":  # card lands
        nn = int(0.2 * SR); tl = np.arange(nn) / SR
        y = (lp(rng.standard_normal(nn), 700) * 0.5 + np.sin(2 * np.pi * 110 * tl)) * np.exp(-tl / 0.05) * 0.6
    elif kind == "shatter":
        nn = int(0.5 * SR); tl = np.arange(nn) / SR
        y = hp(np.round(rng.standard_normal(nn) * 3) / 3, 1500) * np.exp(-tl / 0.18) * 0.5
    else:
        raise ValueError(kind)
    place(sfx, y, t, gain)


# connection tone: start, on joining, broken at the reveal, clean again at the end
tone(0.04, "clean", 0.55)
tone(ev["join"] + 0.05, "clean", 0.8)
tone(ev["reveal"] + 0.02, "broken", 1.0)
tone(ev["tone"], "clean", 0.9)
add("glitch", 0.0, 0.0)  # placeholder silent entry keeps order
sfx_list.pop()
# transitions
for T in tr:
    if T["type"] in ("slices", "bar", "zoom", "tab", "pixel"):
        add("whoosh", T["t"] - 0.1, 0.6 if T["type"] != "tab" else 0.3)
    if T["type"] in ("glitch", "pixel"):
        add("glitch", T["t"] - 0.05, 0.8)
add("notif", ev["mailIn"], 0.9)
add("glitch", ev["strike"], 0.8)
add("glitch", ev["estafa"], 0.7)
add("click", ev["click"], 0.9)
for k, key in enumerate(("tile0", "tile1", "tile2", "tile3", "tile4")):
    add("ping", ev[key], 0.8)
add("glitch", ev["zoomCfo"] + 0.15, 0.6)
add("stamp", ev["bigMoney"], 0.9)
add("glitch", ev["cfoBreak"], 0.9)
add("glitch", ev["mesh"], 1.0)
add("glitch", ev["pixel"], 0.8)
add("shatter", ev["shatter"], 0.9)
for i in range(15):
    add("ping", ev["rows"] + i * ev["rowStep"], 0.7)
nodo = int((ev["odo1"] - ev["odo0"]) / 0.09)
for i in range(nodo):
    add("tick", ev["odo0"] + i * 0.09, 0.9 if i % 3 == 0 else 0.55)
for i in range(7):
    add("clock", ev["cells0"] + i * ev["cellStep"], 0.9)
add("notif", ev["alert"], 0.7)
add("stamp", ev["unkEmp"], 0.6)
add("stamp", ev["unkCo"], 0.6)
add("glitch", ev["bothFalse"], 0.6)
add("stamp", ev["pay"], 0.7)
add("stamp", ev["verify"], 0.7)
add("whoosh", ev["other"], 0.5)
add("stamp", ev["phone"], 0.7)
add("check", ev["check"], 1.0)
for i in range(9):
    add("key", ev["type0"] + i * ev["typeStep"], 0.8)
add("click", ev["send"], 1.0)
add("crt", ev["crt"], 1.0)

# ── mix ─────────────────────────────────────────────────────────────────
venv = np.abs(voice)
k = int(0.1 * SR)
venv = np.convolve(venv, np.ones(k) / k, mode="same")
active = np.clip(venv / (np.percentile(venv[venv > 1e-4], 40) + 1e-9), 0, 1)
active = lp(active, 5)
duck = 1 - (1 - 10 ** (-12 / 20)) * np.clip(active * 1.4, 0, 1)
# the music cut in the reveal is already in the layers; the lesson layer sits under the voice as well
# CRT blackout: music and voice die, the sfx (CRT thunk, closing tone) stay
fade = 1 - step(tt, CRT, CRT + 0.02)
L = (mL * duck * 0.9 + voice) * fade + sfx * 0.6
R = (mR * duck * 0.9 + voice) * fade + np.roll(sfx, 70) * 0.6
st = np.stack([L, R], axis=1)
meter = pyln.Meter(SR)
st *= 10 ** ((-14 - meter.integrated_loudness(st)) / 20)
peak = np.abs(st).max()
if peak > 0.89:
    st = np.tanh(st / 0.89 * 1.2) * 0.89 / np.tanh(1.2)
    st *= 10 ** ((-14 - meter.integrated_loudness(st)) / 20)
os.makedirs(os.path.join(ROOT, "public", "audio"), exist_ok=True)
pcm = (np.clip(st, -1, 1) * 32767).astype("<i2").tobytes()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-",
                os.path.join(ROOT, "public", "audio", "mix.wav")], input=pcm, check=True)

timeline = {"fps": FPS, "durationInFrames": int(TOTAL * FPS), "scenes": scenes, "trans": tr, "punch": punch, "captions": caps,
            "ev": ev, "sfx": sfx_list, "voiceEnd": round(VOICE_END, 3)}
json.dump(timeline, open(os.path.join(ROOT, "src", "timeline.json"), "w"), ensure_ascii=False, indent=1)
print("scenes", [(s["id"], s["t"]) for s in scenes])
print("loudness", round(meter.integrated_loudness(st), 2), "LUFS · peak", round(20 * np.log10(np.abs(st).max()), 2), "dBFS")
