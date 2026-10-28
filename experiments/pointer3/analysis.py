#!/usr/bin/env python3
"""THE POINTER III analysis, exactly as REGISTRATION.md (A, B, C).

  python3 analysis.py <holism dir> <trace dir> <full-raised pointer2 full-arm dir> <old-core travellers_full.json> <names.json>
"""
import glob, json, math, statistics, sys
from math import comb

def corr(x, y):
    n = len(x); mx, my = sum(x) / n, sum(y) / n
    sx = math.sqrt(sum((a - mx) ** 2 for a in x)); sy = math.sqrt(sum((b - my) ** 2 for b in y))
    return 0.0 if sx == 0 or sy == 0 else sum((a - mx) * (b - my) for a, b in zip(x, y)) / (sx * sy)

def sign(rows, alpha):
    pos, neg = sum(1 for _, d in rows if d > 0), sum(1 for _, d in rows if d < 0)
    n = pos + neg; p = sum(comb(n, j) for j in range(pos, n + 1)) / 2 ** n if n else 1.0
    worlds = {}
    for w, d in rows: worlds.setdefault(w, []).append(d)
    maj = sum(1 for ds in worlds.values() if sum(1 for d in ds if d > 0) > len(ds) / 2)
    return p < alpha and maj >= 5, f"{pos}+ / {neg}-  p={p:.2e}  worlds with majority {maj}/8"

def files(d): return [json.load(open(f)) for f in sorted(glob.glob(f"{d}/S05W*.json"))]
mean = lambda xs: sum(xs) / len(xs) if xs else float("nan")

def part_a(runs):
    print("A  THE WHOLE: local structure fixed, distant structure rewired (SD of the conditional rate, rewirings vs input seeds)")
    ans = {}
    for F in ("F1", "F2", "F3"):
        rows, ms, mr, used = [], [], [], 0
        for r in runs:
            s = [x["rate"] for x in r["seed"][F] if x["rate"] is not None]; w = [x["rate"] for x in r["rewired"][F] if x["rate"] is not None]
            if len(s) < 10 or len(w) < 10: continue
            used += 1; rows.append((r["world"], statistics.pstdev(w) - statistics.pstdev(s))); ms.append(mean(s)); mr.append(mean(w))
        ok, txt = sign(rows, 0.05 / 3); ans[F] = ok
        print(f"   {F}: {used} travellers usable; mean rate intact {mean(ms):.4f}, rewired {mean(mr):.4f}; SD_rewire > SD_seed: {txt}  -> {'THE FORM BELONGS TO THE WHOLE' if ok else 'not'}")
    return ans

def part_b(runs):
    print("\nB  REPLICATION THROUGH THE TRACE ALONE (no playback)")
    edges = list(runs[0]["stoneless"][0].keys()); vec = lambda f: [f[e] for e in edges]
    ans = {}
    for arm in ("alone", "together"):
        fid = lambda tr, parent: mean([corr(vec(f), vec(parent)) for lin in tr["lineages"] for f in lin])
        her = [fid(r["trace"][f"her|{arm}"], r["trace"][f"her|{arm}"]["parentForm"]) for r in runs]
        st = [fid(r["trace"][f"stats|{arm}"], r["trace"][f"stats|{arm}"]["parentForm"]) for r in runs]
        nost = [mean([corr(vec(f), vec(r["trace"][f"her|{arm}"]["parentForm"])) for f in r["stoneless"]]) for r in runs]
        other = [mean([fid(r["trace"][f"her|{arm}"], o["trace"][f"her|{arm}"]["parentForm"]) for j, o in enumerate(runs) if j != i]) for i, r in enumerate(runs)]
        w = [r["world"] for r in runs]
        t1 = sign(list(zip(w, [a - b for a, b in zip(her, st)])), 0.0125)
        t2 = sign(list(zip(w, [a - b for a, b in zip(her, nost)])), 0.0125)
        t3 = sign(list(zip(w, [a - b for a, b in zip(her, other)])), 0.0125)
        ans[arm] = t1[0] and t2[0] and t3[0]
        gens = len(runs[0]["trace"][f"her|{arm}"]["lineages"][0])
        trend = [mean([mean([corr(vec(lin[g]), vec(r["trace"][f"her|{arm}"]["parentForm"])) for lin in r["trace"][f"her|{arm}"]["lineages"]]) for r in runs]) for g in range(gens)]
        print(f"   {arm:8} fidelity her {mean(her):.3f}  her-statistics {mean(st):.3f}  stoneless {mean(nost):.3f}  other parents {mean(other):.3f}")
        print(f"            vs her-statistics: {t1[1]} {'PASS' if t1[0] else 'fail'}")
        print(f"            vs stoneless:      {t2[1]} {'PASS' if t2[0] else 'fail'}")
        print(f"            own vs others:     {t3[1]} {'PASS' if t3[0] else 'fail'}")
        print(f"            fidelity by generation: {' '.join(f'{x:.3f}' for x in trend)}  -> {'REPLICATION THROUGH THE TRACE' if ans[arm] else 'not'}")
    return ans

def part_c(full_raised, old, names):
    print("\nC  INGRESS IN AMELIAS RAISED ON THE FULL NUMOGRAM (paired with the same lineages raised on the old core)")
    rate = lambda c, f, who: c[who].get(f, 0) / c[f"{who}Ticks"] if c[f"{who}Ticks"] else 0
    oldm = {(r["world"], r["lineage"]): r for r in old}
    pairs = [(r, oldm[(r["world"], r["lineage"])]) for r in full_raised if (r["world"], r["lineage"]) in oldm]
    ans = {}
    for name, f in (("F1", "1-7"), ("F2", "1-7-8-9"), ("F3", "1-2-7")):
        s = lambda r: rate(r["catalogue"], f, "her") - rate(r["catalogue"], f, "stats")
        ok, txt = sign([(a["world"], s(a) - s(b)) for a, b in pairs], 0.05 / 4); ans[name] = ok
        rec = lambda rs: sum(1 for r in rs if r["catalogue"]["her"].get(f, 0) > 0 and s(r) > 0)
        print(f"   {name} {f:8} strength full-raised {mean([s(a) for a, _ in pairs]):+.5f}  old-core {mean([s(b) for _, b in pairs]):+.5f}  travellers (her > statistics) {rec([a for a, _ in pairs])} vs {rec([b for _, b in pairs])}: {txt} {'PASS' if ok else 'fail'}")
    def E(r):
        c = r["catalogue"]; out = set()
        for f in c["her"]:
            if rate(c, f, "her") > rate(c, f, "stats"): out.update(r["forms"].get(f, {}).get("coords", []))
        return out
    jac = lambda x, y: len(x & y) / len(x | y) if x | y else 0.0
    def corr_scores(rs):
        es = [E(r) for r in rs]; return [mean([jac(es[i], es[j]) for j in range(len(rs)) if j != i]) for i in range(len(rs))]
    ca, cb = corr_scores([a for a, _ in pairs]), corr_scores([b for _, b in pairs])
    ok, txt = sign([(a["world"], x - y) for (a, _), x, y in zip(pairs, ca, cb)], 0.05 / 4); ans["correspondence"] = ok
    print(f"   correspondence (mean Jaccard of entity sets) full-raised {mean(ca):.3f}  old-core {mean(cb):.3f}: {txt} {'PASS' if ok else 'fail'}")
    return ans

def main(hol, tra, fullr, old_json, names_path):
    names = json.load(open(names_path))
    A_ = part_a(files(hol)); B_ = part_b(files(tra)); C_ = part_c(files(fullr), json.load(open(old_json)), names)
    print("\nANSWERS")
    for F, ok in A_.items(): print(f"   A {F}: {'THE FORM BELONGS TO THE WHOLE' if ok else 'not shown to belong to the whole'}")
    for arm, ok in B_.items(): print(f"   B {arm}: {'REPLICATION THROUGH THE TRACE' if ok else 'no replication through the trace'}")
    for m, ok in C_.items(): print(f"   C {m}: {'RAISED ON THE FULL NUMOGRAM, INGRESS STRENGTHENS' if ok else 'not strengthened'}")

if __name__ == "__main__":
    main(*sys.argv[1:])
