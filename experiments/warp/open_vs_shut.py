#!/usr/bin/env python3
"""THE WARP, registered additional question: does opening the gates, by itself, let something through?
Closed door, gates open, versus THE DOORS' closed door, gates shut. Same k = 13 / 5-world rule.
Also: where each traveller went (Warp entry, ticks in the Warp, use of each new gate).

  python3 open_vs_shut.py <warp dir> <doors dir> <names.json>
"""
import glob, json, os, sys
from analysis import threshold

warp_dir, doors_dir, names = sys.argv[1], sys.argv[2], json.load(open(sys.argv[3]))
nm = lambda kk: names.get(kk, kk)
K = threshold()
through, n = {}, 0
for f in sorted(glob.glob(f"{warp_dir}/S05W*.json")):
    w, s = json.load(open(f)), json.load(open(os.path.join(doors_dir, os.path.basename(f))))
    o, c = w["doors"]["closed"], s["doors"]["closed"]
    n += 1
    for kk, v in o["counts"].items():
        if v > o["chanceP95"].get(kk, 0) and v > c["counts"].get(kk, 0):
            through.setdefault(kk, []).append(w["world"])
print(f"OPEN vs SHUT (closed door): {n} travellers, k = {K}")
print("   came through, travellers per entity:", ", ".join(f"{nm(kk)} {len(ws)} ({len(set(ws))} worlds)"
      for kk, ws in sorted(through.items(), key=lambda x: -len(x[1]))) or "none")
rec = [nm(kk) for kk, ws in through.items() if len(ws) >= K and len(set(ws)) >= 5]
print("   RECURS:", ", ".join(rec) or "none")

print("\nWHERE SHE WENT (per door: travellers entering the Warp; median first tick; mean share of ticks in the Warp; new-gate uses summed)")
runs = [json.load(open(f)) for f in sorted(glob.glob(f"{warp_dir}/S05W*.json"))]
for door in runs[0]["doors"]:
    outs = [r["doors"][door]["outer"] for r in runs]
    firsts = sorted(x["firstWarpTick"] for x in outs if x["firstWarpTick"] is not None)
    use = {}
    for x in outs:
        for e, v in x["gateUse"].items(): use[e] = use.get(e, 0) + v
    med = firsts[len(firsts) // 2] if firsts else None
    print(f"   {door:10} entered {len(firsts):2d}/{len(runs)}  median first tick {med}  "
          f"warp share {sum(x['warpTicks'] for x in outs) / (20160 * len(runs)):.3f}  gates {use}")
