"""Deterministic physics of the falling chain (real time, seconds).

Each tile rolls on its front-bottom edge. Once tile i leans on tile i+1, its tilt is fixed by the contact law
(cadena.contact_table: the top-front edge of i touching the back face of i+1, curves included), so the whole
leaning chain behind the newest falling tile ("the front") moves with one degree of freedom q = phi_front.
Lagrange with that coordinate:   J(q) q'' + ½ J'(q) q'² + V'(q) = 0,
    J = I Σ (dphi_j/dq)²,  V = g Σ z_cm(phi_j)                         (per unit mass)
When the front reaches the next standing tile, a plastic impact keeps a fraction ETA of the kinetic energy and the
next tile becomes the front. The last tile has nothing in front: it falls to the table and lands with a small bounce.

simulate() → dict with the time grid, every tile's tilt, the impact instants and the landing.
"""
import math
import numpy as np
from cadena import N, H, T, R_EDGE, contact_table, com_height

GRAV = 9.81
I_AX = (H ** 2 + T ** 2) / 3          # moment of inertia about the rolling edge, per unit mass
ETA = 0.66                            # share of kinetic energy kept through each impact (tuned: ~1.15 m/s wave)
GRID = np.linspace(0, math.radians(90), 1441)
BACK = 18                             # tiles behind the front that still move noticeably (the rest are settled)


def simulate(push=3.2, dt=2e-5, t_end=1.9, save_dt=2.5e-4):
    G = [contact_table(i, GRID) for i in range(N - 1)]

    def chain(k, q):
        """Tilts of tiles k, k-1, … for front tile k at tilt q."""
        ph = np.zeros(N)
        ph[k] = q
        for j in range(k - 1, max(-1, k - 1 - BACK), -1):
            ph[j] = np.interp(ph[j + 1], GRID, G[j])
        return ph

    def dyn(k, q):
        h = 2e-4
        lo = max(0, k - BACK)
        p0, pm, pp = chain(k, q), chain(k, q - h), chain(k, q + h)
        d = (pp - pm) / (2 * h)
        J = I_AX * np.sum(d[lo:k + 1] ** 2)
        # J'(q): from J at q ± h
        dpp = (chain(k, q + 2 * h) - p0) / (2 * h)
        dmm = (p0 - chain(k, q - 2 * h)) / (2 * h)
        Jp, Jm = I_AX * np.sum(dpp[lo:k + 1] ** 2), I_AX * np.sum(dmm[lo:k + 1] ** 2)
        dJ = (Jp - Jm) / (2 * h)
        V = lambda P: GRAV * sum(com_height(P[j]) for j in range(lo, k + 1))
        dV = (V(pp) - V(pm)) / (2 * h)
        return J, dJ, dV, p0

    settled = np.zeros(N)           # tilts of tiles that dropped out of the moving window
    k, q, qd, t = 0, 0.0, push, 0.0
    impacts, landing = [], None
    times, tilts = [], []
    next_save = 0.0
    landed = False
    bounce_v = 0.0
    while t < t_end:
        if not landed:
            J, dJ, dV, ph = dyn(k, q)
            qdd = -(dV + 0.5 * dJ * qd * qd) / J
            qd += qdd * dt
            q += qd * dt
            if k < N - 1:
                q_hit = G[k][0]
                if q >= q_hit:
                    Jold = J
                    k += 1
                    q = 0.0
                    J2, _, _, _ = dyn(k, 1e-6)
                    qd = math.sqrt(max(0.0, ETA * Jold * qd * qd / J2))
                    impacts.append(t)
            elif q >= math.radians(90):
                # the last tile lands flat: a short damped bounce, then still
                landing = t
                landed = True
                bounce_v = qd * 0.12
                q = math.radians(90)
        else:
            # bounce: a damped rebound of the last tile (and the chain resting on it)
            tau = t - landing
            q = math.radians(90) - (bounce_v / 38.0) * math.exp(-tau / 0.012) * abs(math.sin(38.0 * tau))
        if t >= next_save:
            ph = chain(k, q)
            lo = max(0, k - BACK)
            ph[:lo] = np.where(settled[:lo] > 0, settled[:lo], ph[:lo])
            for j in range(lo):
                if settled[j] == 0:
                    settled[j] = tilts[-1][j] if tilts else 0.0
            ph[:lo] = settled[:lo]
            times.append(t)
            tilts.append(ph.copy())
            next_save += save_dt
        t += dt
    tilts = np.array(tilts)
    return {"t": np.array(times), "phi": tilts, "impacts": np.array(impacts), "landing": landing, "contact_deg": math.degrees(G[0][0])}


if __name__ == "__main__":
    import time
    t0 = time.time()
    r = simulate()
    imp = r["impacts"]
    print(f"sim {time.time() - t0:.1f}s · {len(imp)} impacts · landing {r['landing']}")
    dts = np.diff(imp)
    from cadena import D
    print("impact intervals (ms):", np.round(dts[:6] * 1000, 1), "…", np.round(dts[-6:] * 1000, 1))
    print("wave speed (m/s):", np.round(D / dts[::4], 2))
    k35 = np.argmax(r["phi"][:, -1] >= math.radians(35))
    print("last tile 35° at", r["t"][k35], "· hit at", imp[-1], "→", (r["t"][k35] - imp[-1]) * 1000, "ms")
    print("tilts at that instant (last 6, deg):", np.round(np.degrees(r["phi"][k35, -6:]), 1))
