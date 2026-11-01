#!/bin/bash
# Test stills at the given times (seconds), 4 at a time: scripts/stills.sh 1.0 5.5 ...
cd "$(dirname "$0")/.."
mkdir -p out/stills
for s in "$@"; do echo $s; done | xargs -P 4 -I{} bash -c 'f=$(python3 -c "print(round({}*30))"); npx remotion still out/bundle ReelAgentesIaPymes out/stills/t{}.jpg --frame=$f --gl=swangle --image-format=jpeg > /dev/null 2>&1 || echo "fail {}"'
