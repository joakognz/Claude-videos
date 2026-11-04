"""The countdown's physics, frame by frame (called by build.py; also runnable alone).

Scene time vs film time: the shot is a high-speed recording. Film frames 0–183 advance the scene by a constant
RATE seconds each (≈ 1/880 s: a ~880 fps camera played at 30 fps). From frame 184 the scene clock slows down
(rate · (1 − u)², u: 0 → 1 over 11 frames) and on frame 195 it stops: everything — the drop, its oscillation,
the satellite, the bounce of what is left on the faucet, the rings on the water, the dust — freezes together.

The free drop's oscillation sets the clock: it leaves the faucet prolate and must be oblate (a full l = 2 cycle and
a half later, 3π/ω₂) at the freeze; RATE follows from that, and the faucet height follows from the fall, so that
the bottom of the drop ends exactly 1 mm above the water surface (the rings included).

Writes:  src/timeline-gota.json   counter, heartbeats, tension, camera, scene clock, key positions (Blender axes, m)
         data/gota_frames.npz     per-frame shapes: hanging profile, free-drop polar radius + centre, satellite,
                                  remnant, dust, the water height under the drop
"""
import json, math, os
import numpy as np
import drop_geom as dg

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30
F_NECK, F_PINCH, F_BRAKE, F_FREEZE, F_VOICE = 118, 148, 184, 195, 210
GAP = 1.0e-3                               # the drop stops this far above the water
TAU0 = 0.18                                # the previous drop hit the water 0.18 s (scene) before frame 0
SAT_DELAY = 0.016                          # its satellite hit 16 ms later: a second, weaker ring train
M_DROP = 121                               # polar rings of the free drop (top pole → bottom pole)


def clock(rate):
    """Scene time (s) at each film frame 0 … F_VOICE (held after the freeze); continuous, C¹ at the brake."""
    T = np.zeros(F_VOICE + 1)
    for f in range(1, F_VOICE + 1):
        if f <= F_BRAKE:
            T[f] = T[f - 1] + rate
        elif f <= F_FREEZE:
            u0, u1 = (f - 1 - F_BRAKE) / (F_FREEZE - F_BRAKE), (f - F_BRAKE) / (F_FREEZE - F_BRAKE)
            # ∫ rate (1 − u)² du over the frame
            T[f] = T[f - 1] + rate * (F_FREEZE - F_BRAKE) * (((1 - u0) ** 3 - (1 - u1) ** 3) / 3)
        else:
            T[f] = T[f - 1]
    return T


def clock_at(rate, f):
    """Scene time at a fractional frame (for motion-blur sub-frames and the audio)."""
    f = np.asarray(f, dtype=float)
    fc = np.clip(f, 0, F_FREEZE)
    base = np.minimum(fc, F_BRAKE) * rate
    u = np.clip((fc - F_BRAKE) / (F_FREEZE - F_BRAKE), 0, 1)
    return base + rate * (F_FREEZE - F_BRAKE) * (1 - (1 - u) ** 3) / 3


def necking_p(f):
    return np.clip((f - F_NECK) / (F_PINCH - F_NECK), 0, 1) ** 1.7


def resample_closed(r, d, n=dg.M_PROF):
    return dg._resample(r, d, n)


def bulb_centroid(r, d):
    """Volume centroid (depth) of everything below the thinnest point of the lower half."""
    lo = len(r) // 3
    k = lo + int(np.argmin(r[lo:-5]))
    rr, dd = r[k:], d[k:]
    dV = np.pi * 0.5 * (rr[1:] ** 2 + rr[:-1] ** 2) * np.diff(dd)
    return float((dV * 0.5 * (dd[1:] + dd[:-1])).sum() / max(dV.sum(), 1e-18))


def run():
    VMAX = dg.V_MAX()
    V0 = 0.997 * VMAX
    nk = dg.Necking(V0)
    rr_p, dd_p, k_p = nk.at_pinch()
    drop = dg.FreeDrop(rr_p, dd_p, k_p)
    w2 = float(drop.w[2])
    T_FALL = 3 * math.pi / w2                                   # pinch → freeze, scene seconds
    frames_equiv = (F_BRAKE - F_PINCH) + (F_FREEZE - F_BRAKE) / 3
    RATE = T_FALL / frames_equiv
    T = clock(RATE)
    T_pinch = T[F_PINCH]

    # centroid velocity at the pinch, from the necking shapes of the last two frames (scene-time derivative)
    c1 = bulb_centroid(*nk.shape(necking_p(F_PINCH - 1)))
    c0 = bulb_centroid(*nk.shape(necking_p(F_PINCH - 2)))
    v0 = (c1 - c0) / RATE                                        # m/s downward
    dc_pinch = drop.dc

    # where the drop stops: its bottom pole at the freeze, GAP above the water (rings included)
    th = np.linspace(0, np.pi, M_DROP)
    R_freeze = drop.radius(th, T_FALL)
    fall = v0 * T_FALL + 0.5 * dg.G * T_FALL ** 2
    tau_f = T[F_FREEZE] + TAU0
    h0 = dg.ripple(np.array([0.0]), tau_f)[0][0] + 0.4 * dg.ripple(np.array([0.0]), tau_f - SAT_DELAY)[0][0]
    H_MOUTH = h0 + GAP + R_freeze[-1] + fall + dc_pinch       # screen (contact plane) height above the water

    n = F_VOICE + 1
    fr = np.arange(n)
    # ── the hanging drop / remnant, contact → tip, every frame ──
    prof = np.zeros((n, dg.M_PROF, 2))
    growth_T = T[F_NECK]
    for f in range(n):
        ff = min(f, F_FREEZE)
        t = T[ff]
        if ff < F_NECK:
            V = (0.56 + (0.997 - 0.56) * ff / F_NECK) * VMAX
            r, d = dg.static_profile(V)
            # a slight capillary wobble while it fills (≈45 Hz, scene time)
            r, d = dg.wobble(r, d, 0.010 * math.sin(2 * math.pi * 45 * t + 0.6))
        elif ff < F_PINCH:
            r, d = nk.shape(necking_p(ff))
            r, d = resample_closed(r, d)
        else:
            r, d = remnant(nk, rr_p, dd_p, k_p, t - T_pinch)
        prof[f, :, 0], prof[f, :, 1] = r, d
    # ── free drop ──
    dropR = np.zeros((n, M_DROP))
    dropZ = np.full(n, np.nan)
    for f in range(F_PINCH, n):
        tt = T[min(f, F_FREEZE)] - T_pinch
        dropR[f] = drop.radius(th, tt)
        dropZ[f] = H_MOUTH - dc_pinch - v0 * tt - 0.5 * dg.G * tt ** 2
    # ── satellite: the thread snaps back from the faucet end and leaves as a small drop trailing the big one ──
    sat = satellite(nk, rr_p, dd_p, k_p, v0)
    satP = np.zeros((n, 4))                                        # visible, centre z, radius xy, half-height z
    for f in range(F_PINCH, n):
        tt = T[min(f, F_FREEZE)] - T_pinch
        if tt >= sat["t_sep"]:
            ts = tt - sat["t_sep"]
            z = H_MOUTH - sat["d0"] - sat["v"] * ts - 0.5 * dg.G * ts ** 2
            asp = 1 + 0.55 * math.exp(-ts / 0.0025) * math.cos(sat["w"] * ts)
            rs = sat["r"]
            satP[f] = [1, z, rs / math.sqrt(asp), rs * asp]
    # ── the water under the drop and the clock of the rings ──
    tau = T + TAU0
    under = np.array([dg.ripple(np.array([0.0]), tau[f])[0][0] + 0.4 * dg.ripple(np.array([0.0]), tau[f] - SAT_DELAY)[0][0]
                      for f in range(n)])
    gap_fz = (dropZ[F_FREEZE] - R_freeze[-1]) - under[F_FREEZE]
    assert abs(gap_fz - GAP) < 2e-6, gap_fz

    # ── dust: specks floating on the surface, a few motes in the air (scene-time drift, so they barely move) ──
    rng = np.random.default_rng(23)
    nd = 34
    d_r = np.sqrt(rng.uniform(4e-3 ** 2, 70e-3 ** 2, nd))
    d_a = rng.uniform(0, 2 * np.pi, nd)
    d_a[: nd // 2] = rng.uniform(-0.6 * np.pi, 0.6 * np.pi, nd // 2) + np.pi / 2      # more of them behind the impact
    d_size = rng.uniform(0.03e-3, 0.11e-3, nd)
    dust = np.zeros((n, nd, 3))
    for f in range(n):
        t = tau[min(f, F_FREEZE)]
        rr = d_r + 0.004 * (t - TAU0)                                # a slow outward drift on the rings
        hh, _ = dg.ripple(rr, t)
        hh += 0.4 * dg.ripple(rr, t - SAT_DELAY)[0]
        dust[f, :, 0] = rr * np.cos(d_a)
        dust[f, :, 1] = rr * np.sin(d_a)
        dust[f, :, 2] = hh
    na = 16
    air0 = np.stack([rng.uniform(-14e-3, 14e-3, na), rng.uniform(-30e-3, 60e-3, na), rng.uniform(1e-3, H_MOUTH + 6e-3, na)], 1)
    air_v = np.stack([rng.uniform(-6e-3, 6e-3, na), rng.uniform(-4e-3, 4e-3, na), rng.uniform(-3e-3, 5e-3, na)], 1)
    air_size = rng.uniform(0.02e-3, 0.06e-3, na)
    air = np.array([air0 + air_v * T[min(f, F_FREEZE)] for f in range(n)])

    # ── camera: a motion-control slider. Slow while the drop fills (the tap, the drop and the water in shot), then a
    #    continuous push toward the impact point during the fall that eases out into the freeze. Monotone cubic
    #    (PCHIP) through three poses, in log-distance; the aim stays near the water line, so the drop falls into
    #    frame toward its own reflection.
    from scipy.interpolate import CubicHermiteSpline, PchipInterpolator
    FOV = 19.0
    keys_f = [0, F_PINCH, F_FREEZE]

    def ease_in_out(vals):
        """Monotone through the three poses, starting and ending at rest (the slider stops with the clock)."""
        mid = float(PchipInterpolator(keys_f, vals).derivative()(F_PINCH))
        return CubicHermiteSpline(keys_f, vals, [0.0, mid, 0.0])
    logD = ease_in_out(np.log([0.300, 0.205, 0.098]))
    aimZ = ease_in_out([0.0110, 0.0120, -0.0036])
    camH = ease_in_out([0.0125, 0.0110, 0.0068])
    azim = ease_in_out(np.radians([-7.0, -2.5, 1.5]))
    cam = []
    for f in range(n):
        ff = min(f, F_FREEZE)
        dist, tz, hc, az = float(np.exp(logD(ff))), float(aimZ(ff)), float(camH(ff)), float(azim(ff))
        pos = (math.sin(az) * dist, -math.cos(az) * dist, hc)
        fstop = 11 + 9 * ff / F_FREEZE
        focus_z = H_MOUTH - nk.d_bulge if f < F_PINCH else float(dropZ[ff])
        cam.append([round(v, 7) for v in (*pos, 0.0, 0.0, tz)] + [FOV, round(fstop, 3), round(focus_z, 7)])

    tension_lin = np.zeros(n)
    for f in range(n):
        ff = min(f, F_FREEZE)
        if ff < F_NECK:
            tension_lin[f] = 0.5 * ff / F_NECK
        elif ff < F_PINCH:
            tension_lin[f] = 0.5 + 0.25 * (ff - F_NECK) / (F_PINCH - F_NECK)
        else:
            tension_lin[f] = 0.75 + 0.25 * min(1, (ff - F_PINCH) / (F_BRAKE - F_PINCH))
    tension_lin[fr > F_FREEZE] = 0
    counter = np.maximum(1, (F_FREEZE + 1) - np.minimum(fr, F_FREEZE))
    assert np.all(np.diff(counter[: F_FREEZE + 1]) == -1) and counter[F_FREEZE] == 1

    speed = np.zeros(n)                                              # fall speed (scene m/s) of the free drop
    for f in range(F_PINCH, n):
        speed[f] = v0 + dg.G * (T[min(f, F_FREEZE)] - T_pinch)
    tl = {
        "fps": FPS, "frames": n, "neck": F_NECK, "pinch": F_PINCH, "brake": F_BRAKE, "freeze": F_FREEZE, "voice": F_VOICE,
        "rate": RATE, "fpsScene": round(1 / RATE, 1), "T": [round(float(v), 7) for v in T], "tau0": TAU0, "satDelay": SAT_DELAY,
        "hMouth": round(H_MOUTH, 7), "rContact": dg.R_CONTACT, "gap": GAP, "R": round(drop.R, 7), "v0": round(v0, 4),
        "vFreeze": round(float(speed[F_FREEZE]), 4), "tFall": T_FALL, "w2": w2, "counter": counter.tolist(),
        "dropZ": [None if np.isnan(z) else round(float(z), 7) for z in dropZ],
        "dropTop": round(float(dropZ[F_FREEZE] + R_freeze[0]), 7),
        "dropBottom": round(float(dropZ[F_FREEZE] - R_freeze[-1]), 7),
        "dropHalfWidth": round(float(np.max(R_freeze * np.sin(th))), 7),
        "satZ": round(float(satP[F_FREEZE, 1]), 7), "satR": round(float(sat["r"]), 7),
        "remTip": round(float(H_MOUTH - prof[F_FREEZE, -1, 1]), 7),
        "underFreeze": round(float(under[F_FREEZE]), 8),
        "cam": cam, "tension": [round(float(v), 4) for v in tension_lin], "speed": [round(float(v), 4) for v in speed],
    }
    np.savez_compressed(os.path.join(ROOT, "data", "gota_frames.npz"), prof=prof, dropR=dropR, dropZ=dropZ, theta=th,
                        sat=satP, dust=dust, dust_size=d_size, air=air, air_size=air_size, under=under, tau=tau)
    return tl, {"nk": nk, "drop": drop, "sat": sat}


def remnant(nk, rr_p, dd_p, k_p, t):
    """What stays on the faucet after the pinch (t ≥ 0, scene s): first the thread hanging from the cap, its free end
    recoiling and gathering into a bead; once the bead leaves (the satellite) the cap's stub snaps back and the cap
    bounces on its own surface tension. Contact → tip, M_PROF points."""
    sat_t = SAT_T
    r_cap, d_cap = dg.static_profile(nk.Vr)
    H = d_cap[-1]
    if t < sat_t:
        q = (t / sat_t) ** 0.8
        d_end0 = dd_p[k_p]
        d_sep = H + 0.75e-3
        d_end = d_end0 + (d_sep - d_end0) * q
        rr, dd = rr_p[:k_p + 1].copy(), dd_p[:k_p + 1].copy()
        m = dd <= d_end
        rr, dd = rr[m], dd[m]
        # bead at the end: the recoiled thread volume
        thread_vol = np.pi * np.trapezoid(np.interp(np.linspace(d_end, d_end0, 200), dd_p[:k_p + 1], rr_p[:k_p + 1]) ** 2,
                                          np.linspace(d_end, d_end0, 200))
        rb = max((3 * thread_vol / (4 * np.pi)) ** (1 / 3), 0.05e-3)
        cb = d_end - 0.25 * rb
        db = np.linspace(cb - rb, cb + rb, 60)
        bead = rb * np.sqrt(np.maximum(0, 1 - ((db - cb) / rb) ** 2))
        dfull = np.linspace(0, cb + rb, 1400)
        r1 = np.interp(dfull, dd, rr, right=0.0)
        r2 = np.interp(dfull, db, bead, left=0.0, right=0.0)
        r = dg.smax(r1, r2, 0.12e-3)
        return dg._resample(r, dfull)
    ts = t - sat_t
    # the stub retracts in ~1.5 ms; the cap bounces (≈52 Hz, scene time), damped over ~40 ms
    stub = 0.7e-3 * math.exp(-ts / 0.0015)
    r, d = dg.wobble(r_cap, d_cap, -0.10 * math.exp(-ts / 0.04) * math.cos(2 * math.pi * 52 * ts))
    H = d[-1]
    dfull = np.linspace(0, H + stub, 1400)
    rc = np.interp(dfull, d, r, right=0.0)
    cone = np.where(dfull > H - 0.3e-3, np.maximum(0, H + stub - dfull) * math.tan(math.radians(24)), 0.0)
    rr = dg.smax(rc, cone, 0.2e-3)
    return dg._resample(rr, dfull)


SAT_T = 0.0042            # scene seconds from the pinch until the bead leaves the thread


def satellite(nk, rr_p, dd_p, k_p, v0):
    r_cap, d_cap = dg.static_profile(nk.Vr)
    H = d_cap[-1]
    d_sep = H + 0.75e-3
    d_end0 = dd_p[k_p]
    dd = np.linspace(d_sep, d_end0, 400)
    vol = np.pi * np.trapezoid(np.interp(dd, dd_p[:k_p + 1], rr_p[:k_p + 1]) ** 2, dd)
    rs = (3 * vol / (4 * np.pi)) ** (1 / 3)
    w = math.sqrt(8 * dg.GAMMA / (dg.RHO * rs ** 3))
    return {"t_sep": SAT_T, "d0": d_sep + 0.6 * rs, "v": 0.72 * v0, "r": rs, "w": w, "vol": vol}


if __name__ == "__main__":
    tl, _ = run()
    json.dump(tl, open(os.path.join(ROOT, "src", "timeline-gota.json"), "w"))
    print({k: tl[k] for k in ("rate", "fpsScene", "hMouth", "R", "v0", "vFreeze", "tFall", "dropBottom", "dropTop", "satZ", "satR", "remTip")})
