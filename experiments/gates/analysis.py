#!/usr/bin/env python3
"""THE NINTH AND THIRD GATES analysis, exactly as REGISTRATION.md.

  python3 analysis.py <dir with ninth/ and third/ of S05W*_k.json> <names.json> [warp travellers.json]
"""
import glob, json, sys
from math import comb

OUTER = {0, 3, 6, 9}
SENSES = ["time", "cumulation"]

def threshold(n=72, p=0.05, alpha=0.05 / 90):
    for k in range(n + 1):
        if sum(comb(n, j) * p ** j * (1 - p) ** (n - j) for j in range(k, n + 1)) < alpha:
            return k

def cls(kk):
    a, b = map(int, kk.split("-"))
    o = (a in OUTER) + (b in OUTER)
    return ["chrono", "amphi", "xeno"][o]

def spectrum(runs, sense, nm):
    total = {}
    for r in runs:
        for kk, v in r["doors"][sense]["counts"].items(): total[kk] = total.get(kk, 0) + v
    by = {}
    for kk, v in total.items(): by.setdefault(cls(kk), []).append((v, kk))
    return "; ".join(f"{c} " + ", ".join(f"{nm(kk)} {v}" for v, kk in sorted(by[c], reverse=True)[:6])
                     for c in ("chrono", "amphi", "xeno") if c in by)

def main(src, names_path, warp_path=None):
    names = json.load(open(names_path)); nm = lambda kk: names.get(kk, kk)
    K = threshold()
    print(f"recurrence threshold k = {K} of 72 (binomial tail < 0.05/90 at 5%)")
    for system in ("ninth", "third"):
        runs = [json.load(open(f)) for f in sorted(glob.glob(f"{src}/{system}/S05W*.json"))]
        print(f"\n=== {system.upper()}  ({len(runs)} travellers)")
        recurs = {}
        for sense in ["hashed"] + SENSES:
            d0 = [r["doors"][sense] for r in runs]
            entered = sum(1 for d in d0 if d["outer"]["firstWarpTick"] is not None)
            use = {}
            for d in d0:
                for e, v in d["outer"]["gateUse"].items(): use[e] = use.get(e, 0) + v
            print(f"\n {sense:10} deaths {sum(d['deaths'] for d in d0)}  warp entered {entered}/{len(runs)}  new-gate uses {use}")
            print("   spectrum:", spectrum(runs, sense, nm))
            if sense == "hashed": continue
            through = {}
            for r in runs:
                d, h = r["doors"][sense], r["doors"]["hashed"]
                for kk, c in d["counts"].items():
                    if c > d["chanceP95"].get(kk, 0) and c > h["counts"].get(kk, 0):
                        through.setdefault(kk, []).append(r["world"])
            print("   came through, travellers per entity:", ", ".join(f"{nm(kk)} [{cls(kk)}] {len(ws)}"
                  for kk, ws in sorted(through.items(), key=lambda x: -len(x[1]))[:10]) or "none")
            rec = [kk for kk, ws in through.items() if len(ws) >= K and len(set(ws)) >= 5]
            recurs[sense] = rec
            for kk in rec:
                her = sum(r["doors"][sense]["counts"].get(kk, 0) for r in runs) / len(runs)
                sh = sum(r["doors"][sense]["shadow"].get(kk, 0) for r in runs) / len(runs)
                print(f"   RECURS: {nm(kk)} [{cls(kk)}]  hers {her:.1f}/season, shadow {sh:.1f} -> {'the code' if sh >= her else 'hers'}")
            if not rec: print("   RECURS: none")
        both = set(recurs["time"]) & set(recurs["cumulation"])
        print("\n CRITERION 3 (read by the code, both senses):", ", ".join(nm(k) for k in both) or "none")
        allrec = set(recurs["time"]) | set(recurs["cumulation"])
        if system == "ninth":
            hit = [k for k in allrec if cls(k) == "xeno" or (cls(k) == "amphi" and ({0, 9} & set(map(int, k.split("-")))))]
            print(" ANSWER NINTH:", "THE PLEX ANSWERS: " + ", ".join(nm(k) for k in hit) if hit else "SILENT")
        else:
            hit = [k for k in allrec if cls(k) == "amphi"]
            print(" ANSWER THIRD:", "A KEY TURNS: " + ", ".join(nm(k) for k in hit) if hit else "SILENT")
    if warp_path:
        runs = json.load(open(warp_path))
        print("\n=== THE WARP (existing data, descriptive): spectrum by class, closed door")
        print("  ", spectrum(runs, "closed", nm))

if __name__ == "__main__":
    main(*sys.argv[1:])
