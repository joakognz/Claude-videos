#!/bin/bash
# Test captures: scripts/stills.sh <frame> [<frame>...] → out/stills/f<frame>.jpg and a contact sheet out/stills/sheet.jpg
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out/stills
rm -rf out/bundle && npx remotion bundle --out-dir=out/bundle > /dev/null
printf "%s\n" "$@" | xargs -P 4 -I{} npx remotion still out/bundle ReelAgentesQuedada out/stills/f{}.jpg --frame={} --gl=swangle --jpeg-quality=80 > /dev/null 2>&1
in=(); lab=""; i=0
for f in "$@"; do
  in+=(-i "out/stills/f$f.jpg")
  lab+="[$i]scale=270:480,drawtext=text='$f':x=6:y=6:fontsize=20:fontcolor=yellow:box=1:boxcolor=black@0.6[v$i];"
  i=$((i + 1))
done
cols=5; rows=$(( (i + cols - 1) / cols ))
ffmpeg -v error -y "${in[@]}" -filter_complex "${lab}$(for ((k = 0; k < i; k++)); do printf "[v%d]" $k; done)xstack=inputs=$i:grid=${cols}x${rows}:fill=black" out/stills/sheet.jpg
