#!/bin/bash
# Cycles plates for the countdown, in chunks of < 2 h each (one Blender process per chunk), logged and resumable:
# frames already in public/plates are skipped. The frozen frame 195 gets 128 samples and no motion blur.
# Usage: scripts/render_plates.sh <python-with-bpy> [samples]
set -uo pipefail
cd "$(dirname "$0")/.."
PY=$1
S=${2:-20}
mkdir -p logs public/plates
for r in 0-48 49-97 98-146 147-194; do
  echo "[$(date +%T)] chunk $r" >> logs/plates.log
  "$PY" scripts/blender_gota.py --frames $r --samples $S --res 1.0 >> logs/plates.log 2>&1
done
echo "[$(date +%T)] freeze 195" >> logs/plates.log
"$PY" scripts/blender_gota.py --frames 195-195 --samples 128 --noblur --res 1.0 >> logs/plates.log 2>&1
echo "[$(date +%T)] ALL DONE" >> logs/plates.log
