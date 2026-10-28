#!/bin/bash
# Renders the reel in chunks, several at a time (each with its own browser, so the software
# WebGL isn't bottlenecked on one GPU process), then joins them and muxes the mix.
# Resumable: chunks already finished (part<i>.done) are skipped.
# Usage: scripts/render.sh [chunks] [parallel] [out.mp4]
set -euo pipefail
cd "$(dirname "$0")/.."
CHUNKS=${1:-12}
PAR=${2:-4}
OUT=${3:-out/reel-dos-peluquerias.mp4}
TOTAL=1740
PARTS="$PWD/out/parts"
mkdir -p "$PARTS"
[ -f "$PARTS/bundle/index.html" ] || npx remotion bundle --out-dir="$PARTS/bundle" > /dev/null

render_chunk() {
  i=$1
  [ -f "$PARTS/part$i.done" ] && return 0
  a=$((i * TOTAL / CHUNKS))
  b=$(((i + 1) * TOTAL / CHUNKS - 1))
  npx remotion render "$PARTS/bundle" ReelDosPeluquerias "$PARTS/part$i.mp4" --frames=$a-$b --muted \
    --gl=swangle --concurrency=1 --codec=h264 --crf=16 > "$PARTS/part$i.log" 2>&1 && touch "$PARTS/part$i.done"
}
export -f render_chunk
export PARTS TOTAL CHUNKS
seq 0 $((CHUNKS - 1)) | xargs -P "$PAR" -I{} bash -c 'render_chunk {}'

: > "$PARTS/list.txt"
for ((i = 0; i < CHUNKS; i++)); do
  [ -f "$PARTS/part$i.done" ] || { echo "chunk $i missing"; exit 1; }
  echo "file 'part$i.mp4'" >> "$PARTS/list.txt"
done
ffmpeg -v error -y -f concat -safe 0 -i "$PARTS/list.txt" -i public/audio/mix.wav -map 0:v -map 1:a \
  -c:v copy -c:a aac -b:a 320k -shortest -movflags +faststart "$OUT"
echo "done $OUT"
