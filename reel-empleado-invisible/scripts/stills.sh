#!/bin/bash
# Renders single frames for a visual check. Usage: scripts/stills.sh <frame> [<frame> ...]
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out/stills
[ -f out/bundle/index.html ] || npx remotion bundle --out-dir=out/bundle > /dev/null
for f in "$@"; do
  npx remotion still out/bundle ReelEmpleadoInvisible "out/stills/f$f.jpg" --frame="$f" --gl=swangle --jpeg-quality=85 > /dev/null 2>&1 || echo "failed $f"
done
