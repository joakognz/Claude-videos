import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { V3 } from "../camera";
import { C, EASE, EV, S, clamp01, lerp, rand } from "../theme";
import { radialTex } from "./textures";

// The agents: translucent orange motes, no faces. Built in the stage's front frame.
const tmp = new THREE.Object3D();
const N_MAX = 420;
const GHOSTS = 3;
const AGENTS = Array.from({ length: N_MAX }, (_, i) => ({
  r: 1.7 + rand(i + 1) * 0.6, y: 0.9 + rand(i + 2) * 2.3, ph: rand(i + 3) * Math.PI * 2, sp: 0.35 + rand(i + 4) * 0.4,
  tilt: (rand(i + 5) - 0.5) * 0.4, born: rand(i + 6), sz: 0.03 + rand(i + 7) * 0.03,
}));

export const ORB4: V3 = [-1.45, 1.45, -0.2];
export const ORB9: V3 = [-1.0, 1.5, 0.1];

/** Where the swarm is and how big it is, over the reel. */
const swarmState = (t: number) => {
  const toOrb = EASE(clamp01((t - EV.cubeOut) / 0.8));
  const fade = clamp01((t - S.E5) / 0.6) * (1 - EASE(clamp01((t - EV.orb9) / 0.6)));
  const center: V3 = t < S.E9 ? [lerp(0, ORB4[0], toOrb), lerp(0, ORB4[1] - 1.3, toOrb), lerp(0, ORB4[2], toOrb)] : [ORB9[0], ORB9[1] - 1.3, ORB9[2]];
  const scale = lerp(1, 0.38, toOrb);
  // 60 agents, then "diez mil": they multiply; back to a few once the cube has gone
  const grow = EASE(clamp01((t - EV.swarm) / 1.0));
  const n = Math.round(lerp(lerp(60, N_MAX, grow), 40, toOrb) * (1 - 0.75 * fade));
  const speed = 1 + 1.6 * grow * (1 - toOrb);
  return { center, scale, n, speed, grow };
};

export const Swarm: React.FC<{ t: number; dim: number }> = ({ t, dim }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(C.orange).multiplyScalar(1.3), map: radialTex(), transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, toneMapped: false,
  }), []);
  const col = useMemo(() => new THREE.Color(), []);
  mat.opacity = 1 - 0.5 * dim;
  useLayoutEffect(() => {
    const m = ref.current!;
    for (let i = 0; i < N_MAX; i++) {
      const a = AGENTS[i];
      for (let g = 0; g <= GHOSTS; g++) {
        const idx = i * (GHOSTS + 1) + g;
        const st = swarmState(t);
        const visible = i < st.n;
        // ghosts trail behind only while the swarm is racing
        const gt = t - g * 0.035 * st.grow;
        const s2 = g === 0 ? st : swarmState(gt);
        // phase: integrate the speed change so the ring never jumps
        const ang = a.ph + a.sp * (gt + Math.max(0, gt - EV.swarm) * 1.6 * s2.grow);
        const r = a.r * s2.scale;
        const y = s2.center[1] + (1.3 + (a.y - 1.3) * s2.scale) + Math.sin(ang * 2 + a.ph) * 0.12 + a.tilt * Math.sin(ang) * r;
        // flattened towards the camera so the front of the ring stays clear of the bottom safe strip
        tmp.position.set(s2.center[0] + Math.cos(ang) * r, y, s2.center[2] + Math.sin(ang) * r * 0.7);
        tmp.rotation.set(-0.616, 0, 0);
        const born = i < 60 ? 1 : EASE(clamp01((t - EV.swarm - a.born * 0.8) / 0.25));
        const sz = visible && (g === 0 || st.grow > 0.05) ? a.sz * born * (g === 0 ? 1 : 0.85) : 0.0001;
        tmp.scale.set(sz * 2.4, sz * 2.4, 1);
        tmp.updateMatrix();
        m.setMatrixAt(idx, tmp.matrix);
        col.setScalar(g === 0 ? 1 : 0.35 * (1 - g / (GHOSTS + 1)));
        m.setColorAt(idx, col);
      }
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N_MAX * (GHOSTS + 1)]} material={mat} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
    </instancedMesh>
  );
};

