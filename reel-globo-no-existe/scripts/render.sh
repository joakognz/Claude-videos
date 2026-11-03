#!/bin/bash
# Renders the reel in chunks, several at a time (each with its own browser, so the software
# WebGL isn't bottlenecked on one GPU process), joins them, adds the motion blur of the dolly-in
# and muxes the mix.
# Motion blur: the ZoomBlur composition renders N subframes per frame across the dolly-in; ffmpeg
# averages each group of N into one frame and lays the result over those frames of the main render.
# Resumable: chunks already finished (part<i>.done) are skipped.
# Usage: scripts/render.sh [chunks] [parallel] [out.mp4]
set -euo pipefail
cd "$(dirname "$0")/.."
CHUNKS=${1:-12}
PAR=${2:-4}
OUT=${3:-out/reel-globo-no-existe.mp4}
TOTAL=$(python3 -c "import json;print(json.load(open('src/timeline.json'))['durationInFrames'])")
read BFROM BTO BN <<< "$(python3 -c "import json;b=json.load(open('src/timeline-globo.json'))['blur'];print(b['from'],b['to'],b['samples'])")"
PARTS="$PWD/out/parts"
mkdir -p "$PARTS"
[ -f "$PARTS/bundle/index.html" ] || npx remotion bundle --out-dir="$PARTS/bundle" > /dev/null

render_chunk() {
  i=$1
  [ -f "$PARTS/part$i.done" ] && return 0
  a=$((i * TOTAL / CHUNKS))
  b=$(((i + 1) * TOTAL / CHUNKS - 1))
  npx remotion render "$PARTS/bundle" ReelGloboNoExiste "$PARTS/part$i.mp4" --frames=$a-$b --muted \
    --gl=swangle --concurrency=1 --codec=h264 --crf=16 > "$PARTS/part$i.log" 2>&1 && touch "$PARTS/part$i.done"
}
export -f render_chunk
export PARTS TOTAL CHUNKS
seq 0 $((CHUNKS - 1)) | xargs -P "$PAR" -I{} bash -c 'render_chunk {}'

# motion-blur subframes (PNG sequence, lossless)
if [ ! -f "$PARTS/blur.done" ]; then
  rm -rf "$PARTS/blur" && mkdir -p "$PARTS/blur"
  npx remotion render "$PARTS/bundle" ZoomBlur "$PARTS/blur" --sequence --image-format=png --gl=swangle \
    --concurrency=2 > "$PARTS/blur.log" 2>&1 && touch "$PARTS/blur.done"
fi

: > "$PARTS/list.txt"
for ((i = 0; i < CHUNKS; i++)); do
  [ -f "$PARTS/part$i.done" ] || { echo "chunk $i missing"; exit 1; }
  echo "file 'part$i.mp4'" >> "$PARTS/list.txt"
done
ffmpeg -v error -y -f concat -safe 0 -i "$PARTS/list.txt" -c copy "$PARTS/base.mp4"
# average every BN subframes → one frame, and splice those in for frames BFROM..BTO-1 of the base render
ffmpeg -v error -y -i "$PARTS/base.mp4" -framerate $((30 * BN)) -pattern_type glob -i "$PARTS/blur/*.png" -i public/audio/mix.wav \
  -filter_complex "[0:v]split[m1][m2];[m1]trim=end_frame=$BFROM,setpts=PTS-STARTPTS,setsar=1[a];[m2]trim=start_frame=$BTO,setpts=PTS-STARTPTS,setsar=1[c];[1:v]format=gbrp,tmix=frames=$BN,select='eq(mod(n\,$BN)\,$((BN - 1)))',setpts=N/(30*TB),format=yuv420p,setsar=1[b];[a][b][c]concat=n=3:v=1:a=0,fps=30[v]" \
  -map "[v]" -map 2:a -c:v libx264 -crf 16 -preset medium -pix_fmt yuv420p -c:a aac -b:a 320k -shortest -movflags +faststart "$OUT"
echo "done $OUT"
