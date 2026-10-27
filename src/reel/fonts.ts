import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Inter y Sora (SIL OFL) incluidas en public/fonts para renderizar sin conexión.
export const fontFamily = "Inter";
export const logoFont = "Sora";

loadFont({ family: fontFamily, url: staticFile("fonts/Inter-Variable-latin.woff2"), weight: "100 900", format: "woff2" });
loadFont({ family: logoFont, url: staticFile("fonts/sora-latin-700-normal.woff2"), weight: "700", format: "woff2" });
loadFont({ family: logoFont, url: staticFile("fonts/sora-latin-800-normal.woff2"), weight: "800", format: "woff2" });
