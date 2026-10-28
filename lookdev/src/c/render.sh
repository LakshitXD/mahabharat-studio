#!/usr/bin/env bash
# Renders every variant C still plus contact sheets that sit each shot beside its reference.
# Usage: src/c/render.sh [composition ...]   (default: all stills)
set -euo pipefail
cd "$(dirname "$0")/../.."
ids=("$@")
[ ${#ids[@]} -eq 0 ] && ids=(wide shantanu-close ganga-close expressions)
for id in "${ids[@]}"; do
  start=$(date +%s%N)
  npx remotion still src/c/index.ts "$id" "out/c-$id.png" --frame=0 --log=error
  echo "$id $(( ($(date +%s%N) - start) / 1000000 )) ms"
done
python3 - <<'EOF'
from PIL import Image
import os
pairs = [("c-shantanu-close", "owner-pick.png"), ("c-ganga-close", "dragonbee-f2.jpg"), ("c-wide", "dragonbee-f1.jpg")]
for out, ref in pairs:
    p = f"out/{out}.png"
    if not os.path.exists(p):
        continue
    a = Image.open(p).convert("RGB").resize((960, 540))
    r = Image.open(f"ref/{ref}").convert("RGB")
    r = r.resize((960, int(960 * r.height / r.width)))
    sheet = Image.new("RGB", (1920, max(540, r.height)), "black")
    sheet.paste(r, (0, 0))
    sheet.paste(a, (960, 0))
    sheet.save(f"out/cmp-{out}.png")
EOF
