#!/usr/bin/env node
/**
 * Render de prueba a 540x960 de tramos de un episodio:
 *   node scripts/prueba.mjs episodios/ep-03-p1.json out/prueba nombre:ini-fin [nombre:ini-fin …]   (segundos)
 */
import { bundle } from "@remotion/bundler";
import { openBrowser, renderMedia, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [fichero, salida, ...tramos] = process.argv.slice(2);
const CHROME_LOCAL = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const browserExecutable = process.env.REMOTION_CHROME ?? (fs.existsSync(CHROME_LOCAL) ? CHROME_LOCAL : undefined);
const ep = JSON.parse(fs.readFileSync(path.resolve(ROOT, fichero), "utf8"));
fs.mkdirSync(salida, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src/index.ts"), rspack: true });
const browser = await openBrowser("chrome", { browserExecutable });
const composition = await selectComposition({ serveUrl, id: ep.composicion ?? "Master", inputProps: ep, puppeteerInstance: browser, logLevel: "error" });
for (const tr of tramos) {
  const [nombre, r] = tr.split(":");
  const [a, b] = r.split("-").map(Number);
  await renderMedia({
    serveUrl, composition, inputProps: composition.props, codec: "h264", crf: 24, pixelFormat: "yuv420p", audioCodec: "aac", scale: 0.5,
    frameRange: [Math.round(a * 30), Math.min(composition.durationInFrames - 1, Math.round(b * 30))], concurrency: 4, puppeteerInstance: browser,
    outputLocation: path.join(salida, `${nombre}.mp4`), overwrite: true, logLevel: "error",
  });
  console.log(`✓ ${nombre} (${a}–${b} s)`);
}
await browser.close({ silent: true });
