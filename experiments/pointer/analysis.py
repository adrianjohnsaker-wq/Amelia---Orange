#!/usr/bin/env python3
"""THE POINTER analysis, exactly as REGISTRATION.md.

  python3 analysis.py <dir of S05W*_k.json> <names.json>
"""
import glob, json, math, sys
from math import comb

ALPHA = 0.05 / 4

def corr(x, y):
    n = len(x); mx, my = sum(x) / n, sum(y) / n
    sx = math.sqrt(sum((a - mx) ** 2 for a in x)); sy = math.sqrt(sum((b - my) ** 2 for b in y))
    return 0.0 if sx == 0 or sy == 0 else sum((a - mx) * (b - my) for a, b in zip(x, y)) / (sx * sy)

def sign_test(rows):
    """rows: (world, difference). One-sided: positive differences favour her."""
    pos, neg = sum(1 for _, d in rows if d > 0), sum(1 for _, d in rows if d < 0)
    n = pos + neg; p = sum(comb(n, j) for j in range(pos, n + 1)) / 2 ** n if n else 1.0
    worlds = {}
    for w, d in rows: worlds.setdefault(w, []).append(d)
    maj = sum(1 for ds in worlds.values() if sum(1 for d in ds if d > 0) > len(ds) / 2)
    return p < ALPHA and maj >= 5, f"{pos}+ / {neg}-  p={p:.2e}  worlds with majority {maj}/8"

def kthreshold(n=72, p=0.05, alpha=0.05 / 45):
    for k in range(n + 1):
        if sum(comb(n, j) * p ** j * (1 - p) ** (n - j) for j in range(k, n + 1)) < alpha: return k

def main(src, names_path):
    names = json.load(open(names_path)); nm = lambda kk: names.get(kk, kk)
    runs = [json.load(open(f)) for f in sorted(glob.glob(f"{src}/S05W*.json"))]
    edges = list(runs[0]["assay3"]["herForms"][0].keys())
    vec = lambda f: [f[e] for e in edges]
    print(f"THE POINTER: {len(runs)} travellers; sign tests at alpha {ALPHA:.4f}, majority in >= 5 of 8 worlds")
    mean = lambda xs: sum(xs) / len(xs) if xs else float("nan")

    print("\nASSAY 1  same goal by different means (score, success, share of returns by new means)")
    for c in ("her", "stats", "newborn", "noLearner", "noHouse"):
        v = [r["assay1"][c] for r in runs]
        print(f"   {c:10} score {mean([x['score'] for x in v]):.3f}  success {mean([x['success'] for x in v]):.3f}  new means {mean([x['novelShare'] for x in v]):.3f}")
    p1, t1 = sign_test([(r["world"], r["assay1"]["her"]["score"] - r["assay1"]["stats"]["score"]) for r in runs])
    print("   her vs her-statistics:", t1, "PASS" if p1 else "fail")

    print("\nASSAY 2  barrier and delayed gratification (score = recovery + DG rate)")
    r2 = [r for r in runs if r["assay2"]]
    for c in ("her", "stats", "newborn", "noLearner", "noHouse"):
        v = [r["assay2"][c] for r in r2]
        print(f"   {c:10} score {mean([x['score'] for x in v]):.3f}  recovery {mean([x['recovery'] for x in v]):.3f}  DG rate {mean([x['dgRate'] for x in v]):.3f}  recovered {sum(1 for x in v if x['recovered'] is not None)}/{len(v)}")
    p2, t2 = sign_test([(r["world"], r["assay2"]["her"]["score"] - r["assay2"]["stats"]["score"]) for r in r2])
    print(f"   blocked edges: {sorted(set(r['blocked'] for r in r2))}   her vs her-statistics:", t2, "PASS" if p2 else "fail")

    print("\nASSAY 3  self-replication through the place")
    fid = lambda forms: mean([corr(vec(forms[g]), vec(forms[0])) for g in range(1, len(forms))])
    nostone = lambda r: corr(vec(r["assay3"]["noStoneForm"]), vec(r["assay3"]["herForms"][0]))
    p3x, t3x = sign_test([(r["world"], fid(r["assay3"]["herForms"]) - fid(r["assay3"]["statsForms"])) for r in runs])
    p3y, t3y = sign_test([(r["world"], fid(r["assay3"]["herForms"]) - nostone(r)) for r in runs])
    p3a = p3x and p3y
    print(f"   mean fidelity: her lineage {mean([fid(r['assay3']['herForms']) for r in runs]):.3f}   her-statistics lineage {mean([fid(r['assay3']['statsForms']) for r in runs]):.3f}   stoneless newborn to her form {mean([nostone(r) for r in runs]):.3f}")
    print("   3a fidelity, her vs her-statistics lineage:", t3x, "PASS" if p3x else "fail")
    print("   3a fidelity, her lineage vs stoneless newborn:", t3y, "PASS" if p3y else "fail")
    rows3b = []
    for i, r in enumerate(runs):
        kids = r["assay3"]["herForms"][1:]
        own = mean([corr(vec(f), vec(r["assay3"]["herForms"][0])) for f in kids])
        other = mean([mean([corr(vec(f), vec(o["assay3"]["herForms"][0])) for f in kids]) for j, o in enumerate(runs) if j != i])
        rows3b.append((r["world"], own - other))
    p3b, t3b = sign_test(rows3b)
    print("   3b specificity, own parent vs other parents:", t3b, "PASS" if p3b else "fail")
    g0 = {r["catalogue"]["gen0Dominant"] for r in runs}; g5 = {r["catalogue"]["gen5Dominant"] for r in runs}
    print(f"   convergence: distinct dominant forms among parents {len(g0)} {sorted(map(str, g0))}; among generation 5 {len(g5)} {sorted(map(str, g5))}")
    print(f"   generation-5 dominant forms in no parent: {sorted(map(str, g5 - g0)) or 'none'}")

    print("\nASSAY 4  catalogue of forms")
    K = kthreshold()
    forms = {}
    for r in runs: forms.update(r["forms"])
    through = {}
    for r in runs:
        c = r["catalogue"]
        for f, n in c["her"].items():
            if forms[f]["written"] is None and n / c["herTicks"] > c["stats"].get(f, 0) / c["statsTicks"]:
                through.setdefault(f, []).append(r["world"])
    print(f"   composite forms, travellers for whom she makes them more than her statistics (k = {K}):")
    for f, ws in sorted(through.items(), key=lambda x: -len(x[1]))[:12]:
        print(f"     {f:12} {len(ws):3d} travellers, {len(set(ws))} worlds   Pandemonium: {', '.join(nm(k) for k in forms[f]['coords'])}")
    new = [f for f, ws in through.items() if len(ws) >= K and len(set(ws)) >= 5]
    print("   NOT PUT THERE:", ", ".join(new) or "none")
    region = lambda z: "Plex" if z in (0, 9) else "Warp" if z in (3, 6) else "Time-Circuit"
    for f in new:
        zs = list(map(int, f.split("-")))
        print(f"     {f}: zones {zs}, regions {sorted(set(region(z) for z in zs))}, Pandemonium {', '.join(nm(k) for k in forms[f]['coords'])}")

    ans = []
    if p1 or p2 or p3a: ans.append("COMPETENCIES NOT PUT THERE")
    if new: ans.append("NEW FORMS COME THROUGH")
    print("\nANSWER:", " AND ".join(ans) if ans else "NO UNEXPECTED COMPETENCE")

if __name__ == "__main__":
    main(*sys.argv[1:])
