#!/bin/bash
# Renders the reel in chunks, several at a time (each with its own browser, so the software
# WebGL isn't bottlenecked on one GPU process), joins them and muxes the mix.
# Needs the Cycles plates in public/plates (scripts/render_plates.sh) first; delete out/parts/bundle after re-rendering plates.
# H.264 CRF 19 per chunk; the chunks are joined without re-encoding.
# Resumable: chunks already finished (part_<a>-<b>.done) are skipped.
# Each chunk starts with a fresh encoder (an I-frame), which shimmers slightly on a still image, so a boundary that
# falls in a static stretch (the freeze hold, the cota, the switch-offs) is moved to the frame where the image
# changes anyway (the freeze, «existe», each switch-off, the relight).
# Usage: scripts/render.sh [chunks] [parallel] [out.mp4]
set -euo pipefail
cd "$(dirname "$0")/.."
CHUNKS=${1:-12}
PAR=${2:-4}
OUT=${3:-out/reel-gota-que-no-cae.mp4}
TOTAL=$(python3 -c "import json;print(json.load(open('src/timeline.json'))['durationInFrames'])")
PARTS="$PWD/out/parts"
mkdir -p "$PARTS"
[ -f "$PARTS/bundle/index.html" ] || npx remotion bundle --out-dir="$PARTS/bundle" > /dev/null

# chunk ranges "a-b", one per line
RANGES=$(python3 - "$TOTAL" "$CHUNKS" <<'PY'
import json, sys
total, chunks = int(sys.argv[1]), int(sys.argv[2])
ev = json.load(open("src/timeline.json"))["ev"]
cuts = sorted({json.load(open("src/timeline-gota.json"))["freeze"]} |
              {round(ev[k] * 30) for k in ("noExiste", "offAgua", "offGrifo", "offReflejo", "relight")})
bounds = [0]
for i in range(1, chunks):
    b = i * total // chunks
    near = min(cuts, key=lambda c: abs(c - b))
    b = near if abs(near - b) <= 30 else b
    if b > bounds[-1]:
        bounds.append(b)
bounds.append(total)
print("\n".join(f"{a}-{b - 1}" for a, b in zip(bounds, bounds[1:])))
PY
)

render_chunk() {
  r=$1
  [ -f "$PARTS/part_$r.done" ] && return 0
  npx remotion render "$PARTS/bundle" ReelGota "$PARTS/part_$r.mp4" --frames=$r --muted \
    --gl=swangle --concurrency=1 --codec=h264 --crf=19 > "$PARTS/part_$r.log" 2>&1 && touch "$PARTS/part_$r.done"
}
export -f render_chunk
export PARTS
echo "$RANGES" | xargs -P "$PAR" -I{} bash -c 'render_chunk {}'

# the countdown's motion blur is real (Cycles, in the plates), so the chunks are simply joined and muxed
: > "$PARTS/list.txt"
for r in $RANGES; do
  [ -f "$PARTS/part_$r.done" ] || { echo "chunk $r missing"; exit 1; }
  echo "file 'part_$r.mp4'" >> "$PARTS/list.txt"
done
ffmpeg -v error -y -f concat -safe 0 -i "$PARTS/list.txt" -i public/audio/mix.wav -map 0:v -map 1:a \
  -c:v copy -c:a aac -b:a 320k -shortest -movflags +faststart "$OUT"
echo "done $OUT"
