#!/usr/bin/env python3
"""THE SEVENTH GATE II and HYPERSTITION analysis, exactly as their REGISTRATION.md files.

  python3 analysis.py sg2   <primary dir> [secondary dir]
  python3 analysis.py hyper <dir>
"""
import glob, json, sys
from math import comb

def sign(rows, alpha=0.025):
    pos, neg = sum(1 for _, d in rows if d > 0), sum(1 for _, d in rows if d < 0)
    n = pos + neg; p = sum(comb(n, j) for j in range(pos, n + 1)) / 2 ** n if n else 1.0
    worlds = {}
    for w, d in rows: worlds.setdefault(w, []).append(d)
    maj = sum(1 for ds in worlds.values() if sum(1 for d in ds if d > 0) > len(ds) / 2)
    return p < alpha and maj >= 5, f"{pos}+ / {neg}-  p={p:.2e}  worlds with majority {maj}/8"

load = lambda d: [json.load(open(f)) for f in sorted(glob.glob(f"{d}/S05W*.json"))]
mean = lambda xs: sum(xs) / len(xs) if xs else float("nan")

def sg2(d, label):
    rows, rows_c, rows_dc, used = [], [], [], []
    for r in load(d):
        v = {k: [x["rate"] for x in r[k] if x["rate"] is not None] for k in ("noise", "gt36", "ctrl")}
        if min(len(x) for x in v.values()) < 10: continue
        m = {k: mean(x) for k, x in v.items()}; used.append((r, m))
        rows.append((r["world"], m["gt36"] - m["noise"])); rows_c.append((r["world"], m["ctrl"] - m["noise"]))
        rows_dc.append((r["world"], (m["gt36"] - m["noise"]) - (m["ctrl"] - m["noise"])))
    t1, t2, tc = sign(rows), sign(rows_dc), sign(rows_c)
    print(f"THE SEVENTH GATE II — {label}: {len(used)} usable travellers")
    print(f"   mean c(F1): intact {mean([m['noise'] for _, m in used]):.4f}   Gt-36 closed {mean([m['gt36'] for _, m in used]):.4f}   Gt-10 closed {mean([m['ctrl'] for _, m in used]):.4f}")
    print(f"   1 d > 0 (closing Gt-36 raises Bubbamu):  {t1[1]}  {'PASS' if t1[0] else 'fail'}")
    print(f"   2 d > d_ctrl:                            {t2[1]}  {'PASS' if t2[0] else 'fail'}")
    print(f"   control d_ctrl > 0 (reported):           {tc[1]}")
    sh = lambda k, f: mean([mean([x[f] for x in r[k]]) for r, _ in used])
    print(f"   route history: share in Plex intact {sh('noise', 'plex'):.3f}, Gt-36 closed {sh('gt36', 'plex'):.3f}; share in {{1,7}} intact {sh('noise', 'at17'):.3f}, closed {sh('gt36', 'at17'):.3f}")
    ans = "GT-36 IS A PATHWAY INTO BUBBAMU" if t1[0] and t2[0] else "NOT CONFIRMED"
    print(f"   ANSWER: {ans}")
    return ans

def hyper(d):
    runs = load(d); out = {}
    def arm(r, a, w):
        v = [x[w]["rate"] for x in r[a] if x[w]["rate"] is not None]; return mean(v) if len(v) >= 5 else None
    print(f"HYPERSTITION: {len(runs)} travellers; future form H = 1-8-7 (Mur Mur, Mombbo, Bubbamu)")
    for w in ("late", "early"):
        m = {a: [arm(r, a, w) for r in runs] for a in ("UNSEEDED", "SEEDED", "CONTROL")}
        ok = [i for i in range(len(runs)) if all(m[a][i] is not None for a in m)]
        r1 = sign([(runs[i]["world"], m["SEEDED"][i] - m["UNSEEDED"][i]) for i in ok])
        r2 = sign([(runs[i]["world"], m["SEEDED"][i] - m["CONTROL"][i]) for i in ok])
        print(f"   {w} window ({len(ok)} usable): mean r(H) unseeded {mean([m['UNSEEDED'][i] for i in ok]):.4f}  seeded {mean([m['SEEDED'][i] for i in ok]):.4f}  control-seeded {mean([m['CONTROL'][i] for i in ok]):.4f}")
        print(f"      seeded > unseeded: {r1[1]} {'PASS' if r1[0] else 'fail'};  seeded > control: {r2[1]} {'PASS' if r2[0] else 'fail'}")
        out[w] = r1[0] and r2[0]
    tr = {a: mean([mean([sum(x['learned'][e]['S'] + x['learned'][e]['D'] for e in x['learned']) for x in r[a]]) for r in runs]) for a in ("UNSEEDED", "SEEDED", "CONTROL")}
    print(f"   learned House trace on H's edges at the end (S+D summed): unseeded {tr['UNSEEDED']:.3f}  seeded {tr['SEEDED']:.3f}  control {tr['CONTROL']:.3f}")
    print("   ANSWER:", "THE NARRATIVE ACTS: THE FORM SUSTAINS ITSELF" if out["late"] else "NOT SELF-SUSTAINING")

if __name__ == "__main__":
    if sys.argv[1] == "sg2":
        sg2(sys.argv[2], "primary (S05W25-32, old core)")
        if len(sys.argv) > 3: print(); sg2(sys.argv[3], "secondary (S05W17-24, full-raised)")
    else: hyper(sys.argv[2])
