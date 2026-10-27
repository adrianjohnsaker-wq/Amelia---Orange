#!/usr/bin/env python3
"""THE DOORS analysis, exactly as REGISTRATION.md: criteria 1-3 and the answer.

  python3 analysis.py <dir of S05W*_k.json> <names.json or ->
"""
import glob, json, sys
from math import comb

OPEN = ["fasting", "fatigue", "madness", "meditation", "tarot"]

def threshold(n=72, p=0.05, alpha=0.05 / 225):
    for k in range(n + 1):
        if sum(comb(n, j) * p ** j * (1 - p) ** (n - j) for j in range(k, n + 1)) < alpha:
            return k

def main(src, names_path):
    names = json.load(open(names_path)) if names_path != "-" else {}
    runs = [json.load(open(f)) for f in sorted(glob.glob(f"{src}/S05W*.json"))]
    K = threshold()
    print(f"travellers: {len(runs)}   recurrence threshold k = {K} of 72 (binomial tail < 0.05/225 at 5%)")
    keys = sorted({kk for r in runs for d in r["doors"].values() for kk in d["chanceP95"]})
    recurs = {}
    for door in OPEN + ["closed"]:
        through = {}
        for r in runs:
            d, closed = r["doors"][door], r["doors"]["closed"]
            for kk in keys:
                c = d["counts"].get(kk, 0)
                if c > d["chanceP95"].get(kk, 0) and (door == "closed" or c > closed["counts"].get(kk, 0)):
                    through.setdefault(kk, []).append(r["world"])
        rec = [kk for kk, ws in through.items() if len(ws) >= K and len(set(ws)) >= 5] if door != "closed" else []
        if door != "closed": recurs[door] = rec
        deaths = sum(r["doors"][door]["deaths"] for r in runs)
        total = {kk: sum(r["doors"][door]["counts"].get(kk, 0) for r in runs) for kk in keys}
        spectrum = sorted(((v, kk) for kk, v in total.items() if v), reverse=True)[:8]
        nm = lambda kk: names.get(kk, kk)
        print(f"\n{door:10} deaths {deaths:5d}   detections {sum(total.values()):6d}   entities met {sum(1 for v in total.values() if v):2d}/45")
        print("   most met:", ", ".join(f"{nm(kk)} {v}" for v, kk in spectrum))
        print("   came through (beyond chance and closed door), travellers per entity:",
              ", ".join(f"{nm(kk)} {len(ws)}" for kk, ws in sorted(through.items(), key=lambda x: -len(x[1]))[:8]) or "none")
        if door != "closed": print("   RECURS (criterion 2):", ", ".join(nm(kk) for kk in rec) or "none")
    multi = {}
    for door, rec in recurs.items():
        for kk in rec: multi.setdefault(kk, []).append(door)
    shown = {kk: ds for kk, ds in multi.items() if len(ds) >= 2}
    print("\nCRITERION 3 (same entity through two or more doors):",
          "; ".join(f"{names.get(kk, kk)} via {', '.join(ds)}" for kk, ds in shown.items()) or "none")
    print("ANSWER:", "A PLACE SHOWS ITSELF" if shown else "NO PLACE SHOWN")

if __name__ == "__main__":
    main(*sys.argv[1:3])
