#!/usr/bin/env node
/**
 * Pruebas rápidas de un episodio a media resolución (540x960), con un único bundle.
 *
 *   node scripts/prueba.mjs episodios/ep-04-p1.json --fotos 1,3.5,12          → out/pruebas/<salida>_t012.00.png …
 *   node scripts/prueba.mjs episodios/ep-04-p1.json --tramos intro:0-10.8,cierre:130-154.5
 *                                                                              → out/pruebas/<salida>_intro.mp4 …
 * Opciones (entorno): ESCALA (0.5), SALIDA (out/pruebas), CONCURRENCIA (núcleos).
 */
import { bundle } from "@remotion/bundler";
import { openBrowser, renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SALIDA = path.resolve(ROOT, process.env.SALIDA ?? "out/pruebas");
const ESCALA = Number(process.env.ESCALA ?? 0.5);
const CHROME_LOCAL = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const browserExecutable = process.env.REMOTION_CHROME ?? (fs.existsSync(CHROME_LOCAL) ? CHROME_LOCAL : undefined);
const concurrency = Number(process.env.CONCURRENCIA ?? os.cpus().length);

const [fichero, ...resto] = process.argv.slice(2);
const opt = (k) => {
  const i = resto.indexOf(k);
  return i >= 0 ? resto[i + 1] : undefined;
};
const ep = JSON.parse(fs.readFileSync(path.resolve(ROOT, fichero), "utf8"));
const nombre = ep.salida ?? `claude-code-ep-${String(ep.episodio).padStart(2, "0")}`;
fs.mkdirSync(SALIDA, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src/index.ts"), rspack: true });
const browser = await openBrowser("chrome", { browserExecutable });
const composition = await selectComposition({ serveUrl, id: ep.composicion ?? "Episodio", inputProps: ep, puppeteerInstance: browser, logLevel: "warn" });
const { fps, durationInFrames } = composition;
console.log(`${nombre}: ${durationInFrames} fotogramas (${(durationInFrames / fps).toFixed(2)} s) · escala ${ESCALA}`);

if (opt("--fotos")) {
  for (const s of opt("--fotos").split(",").map(Number)) {
    const frame = Math.min(durationInFrames - 1, Math.round(s * fps));
    const out = path.join(SALIDA, `${nombre}_t${s.toFixed(2).padStart(6, "0")}.png`);
    await renderStill({ serveUrl, composition, inputProps: composition.props, frame, output: out, scale: ESCALA, puppeteerInstance: browser, logLevel: "warn", overwrite: true });
    process.stdout.write(`  ${path.relative(ROOT, out)}\n`);
  }
}
if (opt("--tramos")) {
  for (const tr of opt("--tramos").split(",")) {
    const [id, rango] = tr.split(":");
    const [a, b] = rango.split("-").map(Number);
    const frameRange = [Math.round(a * fps), Math.min(durationInFrames - 1, Math.round(b * fps) - 1)];
    const out = path.join(SALIDA, `${nombre}_${id}.mp4`);
    const t0 = Date.now();
    await renderMedia({
      serveUrl, composition, inputProps: composition.props, codec: "h264", crf: 20, pixelFormat: "yuv420p", audioCodec: "aac", audioBitrate: "192k",
      imageFormat: "jpeg", jpegQuality: 90, scale: ESCALA, frameRange, concurrency, puppeteerInstance: browser, outputLocation: out, overwrite: true, logLevel: "warn",
    });
    console.log(`  ✓ ${path.relative(ROOT, out)} (${a}–${b} s) en ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
}
await browser.close({ silent: true });
