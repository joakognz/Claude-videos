#!/usr/bin/env node
/**
 * Render en lote (regla 12): un mp4 por JSON de episodio, con un único bundle.
 *
 *   node scripts/render-lote.mjs                          → todos los episodios/ep-*.json
 *   node scripts/render-lote.mjs episodios/ep-01.json …   → solo esos
 *
 * Opciones (variables de entorno): CONCURRENCIA (por defecto, núcleos), CRF (18), SALIDA (out/),
 * REMOTION_CHROME (ruta a Chrome si no se usa el de Remotion).
 * Por cada episodio deja out/claude-code-ep-NN.mp4 y out/claude-code-ep-NN.plan.json (para scripts/qa.py).
 * Al final pasa el audio por un limitador maestro (-2 dBFS) con ffmpeg: solo actúa en los picos donde un golpe de
 * sello coincide con la voz; el vídeo se copia tal cual.
 */
import { bundle } from "@remotion/bundler";
import { openBrowser, renderMedia, selectComposition } from "@remotion/renderer";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SALIDA = path.resolve(ROOT, process.env.SALIDA ?? "out");
const CHROME_LOCAL = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const browserExecutable = process.env.REMOTION_CHROME ?? (fs.existsSync(CHROME_LOCAL) ? CHROME_LOCAL : undefined);
const concurrency = Number(process.env.CONCURRENCIA ?? os.cpus().length);
const crf = Number(process.env.CRF ?? 18);

const args = process.argv.slice(2);
const ficheros = (args.length ? args : fs.readdirSync(path.join(ROOT, "episodios")).filter((f) => /^ep-\d+(-p\d+)?\.json$/.test(f)).sort().map((f) => `episodios/${f}`))
  .map((f) => path.resolve(ROOT, f));
if (!ficheros.length) {
  console.error("No hay episodios que renderizar");
  process.exit(1);
}

fs.mkdirSync(SALIDA, { recursive: true });
console.log(`Bundle de ${ROOT}…`);
const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src/index.ts"), rspack: true });
const browser = await openBrowser("chrome", { browserExecutable });

/** Limitador maestro: techo -2 dBFS, ataque 5 ms, sin normalizar el nivel (la sonoridad no cambia). */
function limitar(mp4) {
  const tmp = mp4.replace(/\.mp4$/, ".lim.mp4");
  const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", mp4, "-map", "0:v", "-map", "0:a", "-c:v", "copy",
    "-af", "alimiter=limit=0.794:attack=5:release=60:level=0", "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", tmp]);
  if (r.status !== 0) {
    console.warn(`\n  ⚠ sin limitador maestro (¿ffmpeg en el PATH?): ${String(r.stderr ?? r.error).slice(0, 200)}`);
    return;
  }
  fs.renameSync(tmp, mp4);
}

let fallos = 0;
for (const f of ficheros) {
  const ep = JSON.parse(fs.readFileSync(f, "utf8"));
  const nombre = ep.salida ?? `claude-code-ep-${String(ep.episodio).padStart(2, "0")}`;
  const t0 = Date.now();
  try {
    // EP.1 usa la composición «Episodio»; desde el EP.2, «Master» ("composicion" en el JSON)
    const id = ep.composicion ?? "Episodio";
    const composition = await selectComposition({ serveUrl, id, inputProps: ep, puppeteerInstance: browser, logLevel: "warn" });
    const plan = composition.props.plan ?? composition.props.calc;
    fs.writeFileSync(path.join(SALIDA, `${nombre}.plan.json`), JSON.stringify(plan, null, 1));
    (plan.avisos ?? []).forEach((a) => console.warn(`  ⚠ ${a}`));
    console.log(`${nombre}: ${composition.durationInFrames} fotogramas (${(composition.durationInFrames / composition.fps).toFixed(2)} s)`);
    let ultimo = -1;
    await renderMedia({
      serveUrl, composition, inputProps: composition.props, codec: "h264", crf, pixelFormat: "yuv420p", audioCodec: "aac", audioBitrate: "320k",
      imageFormat: "jpeg", jpegQuality: 92, concurrency, puppeteerInstance: browser, outputLocation: path.join(SALIDA, `${nombre}.mp4`), overwrite: true,
      logLevel: "warn",
      onProgress: ({ progress }) => {
        const p = Math.floor(progress * 20);
        if (p !== ultimo) { ultimo = p; process.stdout.write(`\r  ${String(Math.round(progress * 100)).padStart(3)} %`); }
      },
    });
    limitar(path.join(SALIDA, `${nombre}.mp4`));
    console.log(`\r  ✓ ${path.relative(ROOT, path.join(SALIDA, `${nombre}.mp4`))} en ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  } catch (e) {
    fallos++;
    console.error(`\n  ✗ ${nombre}: ${e.message}`);
  }
}
await browser.close({ silent: true });
process.exit(fallos ? 1 : 0);
