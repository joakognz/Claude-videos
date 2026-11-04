#!/bin/bash
# Block A plates in Cycles (CPU), then the long-held frozen frame, the reveal masks and the wire GLB.
# Usage: scripts/render_placas.sh <python-with-bpy>   (logs in logs/placas.log)
set -euo pipefail
cd "$(dirname "$0")/.."
PY=${1:?python with bpy}
LOG=logs/placas.log
mkdir -p logs public/plates
# resumable: start after the last plate already on disk
last=$(ls public/plates/a_0*.png 2>/dev/null | sed 's/.*a_0*\([0-9]*\)\.png/\1/' | sort -n | tail -1 || true)
start=$(( ${last:--1} + 1 ))
if [ "$start" -le 194 ]; then
  "$PY" scripts/blender_fichas.py --frames $start-194 --res 0.9 --samples 16 >> $LOG 2>&1
fi
"$PY" scripts/blender_fichas.py --frames 195-195 --res 0.9 --samples 128 --noblur >> $LOG 2>&1
"$PY" scripts/blender_fichas.py --mask --samples 64 --res 0.9 >> $LOG 2>&1
"$PY" scripts/blender_fichas.py --export >> $LOG 2>&1
echo "PLACAS DONE" >> $LOG
