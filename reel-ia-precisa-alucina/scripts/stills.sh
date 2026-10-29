#!/bin/bash
# Test stills at given times (seconds), from a fresh bundle, several in parallel.
# Usage: scripts/stills.sh 0.5 9 15.3 …
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out/stills
npx remotion bundle --out-dir=out/bundle > out/bundle.log 2>&1
printf '%s\n' "$@" | xargs -P 4 -I{} bash -c 'f=$(python3 -c "print(round({}*30))"); npx remotion still out/bundle ReelIaPrecisaAlucina out/stills/t{}.png --frame=$f --gl=swangle --scale=0.5 > /dev/null 2>&1 && echo ok {} || echo FAIL {}'
