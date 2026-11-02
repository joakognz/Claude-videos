#!/bin/bash
# Tiles test stills side by side at half size: scripts/sheet.sh out.jpg a.jpg b.jpg ...
out=$1; shift
n=$#
args=(); for f in "$@"; do args+=(-i "$f"); done
ffmpeg -v error -y "${args[@]}" -filter_complex "$(for ((i=0;i<n;i++)); do printf "[%d:v]scale=540:960,drawtext=text='%s':x=10:y=10:fontsize=28:fontcolor=yellow:box=1:boxcolor=black@0.6[v%d];" $i "$(basename ${@:$((i+1)):1} .jpg)" $i; done)$(for ((i=0;i<n;i++)); do printf "[v%d]" $i; done)hstack=inputs=$n" "$out"
