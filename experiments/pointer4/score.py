#!/usr/bin/env python3
"""THE POINTER IV scoring, exactly as REGISTRATION.md.   python3 score.py <answers.json> <targets.json>"""
import json, math, sys
from fractions import Fraction
from math import comb

DISCOVERY = {"S05W17", "S05W18", "S05W19", "S05W20"}

def tail(n, k, p=Fraction(1, 10)):   # exact P(X >= k), X ~ Binomial(n, p)
    return float(sum(comb(n, j) * p ** j * (1 - p) ** (n - j) for j in range(k, n + 1)))

def cp_interval(n, k, a=0.05):   # exact Clopper-Pearson by bisection on the binomial tails
    return (0.0 if k == 0 else _lower(n, k, a)), (1.0 if k == n else _upper(n, k, a))

def _lower(n, k, a):
    lo, hi = 0.0, k / n
    for _ in range(60):
        mid = (lo + hi) / 2
        t = sum(math.comb(n, j) * mid ** j * (1 - mid) ** (n - j) for j in range(k, n + 1))
        if t < a / 2: lo = mid
        else: hi = mid
    return lo

def _upper(n, k, a):
    lo, hi = k / n, 1.0
    for _ in range(60):
        mid = (lo + hi) / 2
        t = sum(math.comb(n, j) * mid ** j * (1 - mid) ** (n - j) for j in range(0, k + 1))
        if t > a / 2: lo = mid
        else: hi = mid
    return hi

def main(answers_path, targets_path):
    runs = json.load(open(answers_path)); T = json.load(open(targets_path))
    print(f"THE POINTER IV: {len(runs)} travellers; targets from Quicknet round {T['firstRound']} on ({len(T['rounds'])} rounds){'  OFFLINE UNIT TARGETS' if T['offline'] else ''}")
    hits = {}
    for r in runs:
        t = T["targets"][f"{r['world']}|{r['lineage']}"]
        for c, ans in r["answers"].items(): hits.setdefault(c, []).append((r["world"], [int(a == b) for a, b in zip(ans, t)]))
    def rate(c, worlds=None):
        hs = [h for w, hh in hits[c] for h in hh if worlds is None or w in worlds]; return sum(hs), len(hs)
    print("\nhit rates (chance 0.100), exact 95% interval:")
    for c in hits:
        k, n = rate(c); lo, hi = cp_interval(n, k)
        dist = [0] * 10
        for r in runs:
            for a in r["answers"][c]: dist[a] += 1
        print(f"   {c:10} {k}/{n} = {k / n:.4f}  [{lo:.4f}, {hi:.4f}]  answers by zone {dist}  deaths {sum(r['deaths'][c] for r in runs)}")
    def half(c, disc):
        ws = {r["world"] for r in runs if (r["world"] in DISCOVERY) == disc}; k, n = rate(c, ws); return k, n, tail(n, k)
    def paired(a, b):
        pos = neg = 0
        for (w1, ha), (w2, hb) in zip(hits[a], hits[b]):
            for x, y in zip(ha, hb): pos += x and not y; neg += y and not x
        n = pos + neg; return pos, neg, (tail(n, pos, Fraction(1, 2)) if n else 1.0)
    k1, n1, p1 = half("BUBBAMU", True); k2, n2, p2 = half("BUBBAMU", False)
    q3 = paired("BUBBAMU", "ODDUBB"); q4 = paired("BUBBAMU", "NO_CONTACT")
    c1, c2, c3, c4 = p1 < 0.025, p2 < 0.025, q3[2] < 0.025, q4[2] < 0.025
    print("\nBUBBAMU (family alpha 0.025)")
    print(f"   1 discovery   {k1}/{n1} = {k1 / n1:.4f}  p={p1:.3e}  {'PASS' if c1 else 'fail'}")
    print(f"   2 replication {k2}/{n2} = {k2 / n2:.4f}  p={p2:.3e}  {'PASS' if c2 else 'fail'}")
    print(f"   3 vs ODDUBB      {q3[0]}+ / {q3[1]}-  p={q3[2]:.3e}  {'PASS' if c3 else 'fail'}")
    print(f"   4 vs NO CONTACT  {q4[0]}+ / {q4[1]}-  p={q4[2]:.3e}  {'PASS' if c4 else 'fail'}")
    g1, gn1, gp1 = half("GT36", True); g2, gn2, gp2 = half("GT36", False)
    gok = gp1 < 0.025 and gp2 < 0.025
    print("\nGT-36 (separate family alpha 0.025)")
    print(f"   discovery {g1}/{gn1} = {g1 / gn1:.4f}  p={gp1:.3e};  replication {g2}/{gn2} = {g2 / gn2:.4f}  p={gp2:.3e}")
    ans = "AN ADDRESSED REPLY CARRIES INFORMATION" if c1 and c2 and c3 and c4 else "ABOVE CHANCE, NOT SPECIFIC TO THE ADDRESS" if c1 and c2 else "NO INFORMATION BEYOND CHANCE"
    print("\nANSWER (BUBBAMU):", ans)
    print("ANSWER (GT-36):  ", "THE INTERFACE CARRIES INFORMATION" if gok else "NO INFORMATION BEYOND CHANCE")

if __name__ == "__main__":
    main(*sys.argv[1:])
