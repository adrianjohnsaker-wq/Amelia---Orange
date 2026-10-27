#!/usr/bin/env python3
"""THE ANTENNA analysis, exactly as REGISTRATION.md.

  python3 analysis.py <dir with canonical/ and ccru/ of S05W*_k.json> <inputs.json> <names.json>
"""
import glob, json, sys
from math import comb

OUTER = {0, 3, 6, 9}

def threshold(n=72, p=0.05, alpha=0.05 / 90):
    for k in range(n + 1):
        if sum(comb(n, j) * p ** j * (1 - p) ** (n - j) for j in range(k, n + 1)) < alpha:
            return k

def cls(kk):
    a, b = map(int, kk.split("-"))
    return ["chrono", "amphi", "xeno"][(a in OUTER) + (b in OUTER)]

def spectrum(runs, cond, nm):
    total = {}
    for r in runs:
        for kk, v in r["doors"][cond]["counts"].items(): total[kk] = total.get(kk, 0) + v
    by = {}
    for kk, v in total.items(): by.setdefault(cls(kk), []).append((v, kk))
    return "; ".join(f"{c} " + ", ".join(f"{nm(kk)} {v}" for v, kk in sorted(by[c], reverse=True)[:6])
                     for c in ("chrono", "amphi", "xeno") if c in by)

def main(src, inputs_path, names_path):
    names = json.load(open(names_path)); nm = lambda kk: names.get(kk, kk)
    inp = json.load(open(inputs_path))
    K = threshold()
    print(f"N = {inp['N']} data   offline beacon: {inp['offlineBeacon']}   beacon rounds {inp['beaconRounds']}")
    print("zones per stream (0..9):")
    for s, c in inp["streamZoneCounts"].items(): print(f"   {s:8} {c}")
    for c in ("world", "beacon", "shuffled"):
        z = inp["zones"][c]
        print(f"   {c:8} all {[z.count(i) for i in range(10)]}  syzygies {inp['syzygies'][c]}")
    print(f"recurrence threshold k = {K} of 72 (binomial tail < 0.05/90 at 5%)")
    received = []
    for system in ("canonical", "ccru"):
        runs = [json.load(open(f)) for f in sorted(glob.glob(f"{src}/{system}/S05W*.json"))]
        print(f"\n=== {system.upper()} Numogram  ({len(runs)} travellers)")
        for cond in ("world", "beacon", "shuffled"):
            d0 = [r["doors"][cond] for r in runs]
            use = {}
            for d in d0:
                for e, v in d["outer"]["gateUse"].items(): use[e] = use.get(e, 0) + v
            entered = sum(1 for d in d0 if d["outer"]["firstWarpTick"] is not None)
            print(f"\n {cond:8} deaths {sum(d['deaths'] for d in d0)}  warp entered {entered}/{len(runs)}  new-gate uses {use}")
            print("   spectrum:", spectrum(runs, cond, nm))
        through = {}
        for r in runs:
            w, b, s = (r["doors"][c] for c in ("world", "beacon", "shuffled"))
            for kk, c in w["counts"].items():
                if c > w["chanceP95"].get(kk, 0) and c > b["counts"].get(kk, 0) and c > s["counts"].get(kk, 0):
                    through.setdefault(kk, []).append(r["world"])
        print("\n came through (beyond chance walks, beacon and shuffled world), travellers per entity:",
              ", ".join(f"{nm(kk)} [{cls(kk)}] {len(ws)} ({len(set(ws))} worlds)"
                        for kk, ws in sorted(through.items(), key=lambda x: -len(x[1]))[:12]) or "none")
        rec = [kk for kk, ws in through.items() if len(ws) >= K and len(set(ws)) >= 5]
        for kk in rec:
            her = sum(r["doors"]["world"]["counts"].get(kk, 0) for r in runs) / len(runs)
            sh = sum(r["doors"]["world"]["shadow"].get(kk, 0) for r in runs) / len(runs)
            print(f" RECURS: {nm(kk)} [{cls(kk)}]  hers {her:.1f}/season, shadow {sh:.1f} -> {'the stream' if sh >= her else 'hers'}")
            received.append(f"{nm(kk)} ({system})")
        if not rec: print(" RECURS: none")
    print("\nANSWER:", "THE OUTSIDE IS RECEIVED: " + ", ".join(received) if received else "SILENT")

if __name__ == "__main__":
    main(*sys.argv[1:])
