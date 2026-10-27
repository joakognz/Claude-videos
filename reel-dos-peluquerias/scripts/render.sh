#!/bin/bash
# Renders the reel in parallel chunks (each with its own browser, so the software WebGL
# isn't bottlenecked on one GPU process), then joins them and muxes the mix.
# Usage: scripts/render.sh [parts] [out.mp4]
set -euo pipefail
cd "$(dirname "$0")/.."
PARTS=${1:-4}
OUT=${2:-out/reel-dos-peluquerias.mp4}
TOTAL=1740
TMP=out/parts
mkdir -p "$TMP"
npx remotion bundle --out-dir="$TMP/bundle" > /dev/null
pids=()
for ((i = 0; i < PARTS; i++)); do
  a=$((i * TOTAL / PARTS))
  b=$(((i + 1) * TOTAL / PARTS - 1))
  npx remotion render "$TMP/bundle" ReelDosPeluquerias "$TMP/part$i.mp4" --frames=$a-$b --muted \
    --gl=swangle --concurrency=1 --codec=h264 --crf=16 > "$TMP/part$i.log" 2>&1 &
  pids+=($!)
done
for p in "${pids[@]}"; do wait "$p"; done
: > "$TMP/list.txt"
for ((i = 0; i < PARTS; i++)); do echo "file 'part$i.mp4'" >> "$TMP/list.txt"; done
ffmpeg -v error -y -f concat -safe 0 -i "$TMP/list.txt" -i public/audio/mix.wav -map 0:v -map 1:a \
  -c:v copy -c:a aac -b:a 320k -shortest -movflags +faststart "$OUT"
echo "done $OUT"
