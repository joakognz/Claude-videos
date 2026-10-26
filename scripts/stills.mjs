// Uso: node scripts/stills.mjs <compId> <seg1> <seg2> ...  → out/stills/<comp>_<seg>.png
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const [comp, ...secs] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const composition = await selectComposition({ serveUrl, id: comp, browserExecutable });
for (const s of secs) {
  const frame = Math.round(Number(s) * composition.fps);
  await renderStill({ composition, serveUrl, frame, output: `out/stills/${comp}_${s}.png`, browserExecutable });
  console.log("ok", s);
}
