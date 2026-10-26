import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Inter (SIL OFL) incluida en public/fonts para renderizar sin conexión.
export const fontFamily = "Inter";

loadFont({
  family: fontFamily,
  url: staticFile("fonts/Inter-Variable-latin.woff2"),
  weight: "100 900",
  format: "woff2",
});
