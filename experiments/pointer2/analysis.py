#!/usr/bin/env python3
"""THE POINTER II analysis, exactly as REGISTRATION.md (C1-C4). THE POINTER's own analysis
(../pointer/analysis.py) is also run on the full arm for the complete report.

  python3 analysis.py <dir with full/ noGt28/ noCur17/ noGt10/ of S05W*_k.json> <names.json>
"""
import glob, json, math, os, sys
from math import comb

FORMS = {"F1": "1-7", "F2": "1-7-8-9", "F3": "1-2-7"}

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
    return p < alpha and maj >= 5, p, f"{pos}+ / {neg}-  p={p:.2e}  worlds with majority {maj}/8"

def recurrence(rows, k):
    ws = [w for w, ok in rows if ok]
    return len(ws) >= k and len(set(ws)) >= 5, f"{len(ws)} travellers, {len(set(ws))} worlds (k = {k})"

def load(d): return [json.load(open(f)) for f in sorted(glob.glob(f"{d}/S05W*.json"))]

def replication(runs, key, alpha=0.0125):
    edges = list(runs[0][key]["herForms"][0].keys()); vec = lambda f: [f[e] for e in edges]
    mean = lambda xs: sum(xs) / len(xs)
    fid = lambda forms: mean([corr(vec(forms[g]), vec(forms[0])) for g in range(1, len(forms))])
    nost = lambda r: corr(vec(r[key]["noStoneForm"]), vec(r[key]["herForms"][0]))
    a1 = sign([(r["world"], fid(r[key]["herForms"]) - fid(r[key]["statsForms"])) for r in runs], alpha)
    a2 = sign([(r["world"], fid(r[key]["herForms"]) - nost(r)) for r in runs], alpha)
    rows = []
    for i, r in enumerate(runs):
        kids = r[key]["herForms"][1:]
        own = mean([corr(vec(f), vec(r[key]["herForms"][0])) for f in kids])
        other = mean([mean([corr(vec(f), vec(o[key]["herForms"][0])) for f in kids]) for j, o in enumerate(runs) if j != i])
        rows.append((r["world"], own - other))
    b = sign(rows, alpha)
    print(f"   mean fidelity: her lineage {mean([fid(r[key]['herForms']) for r in runs]):.3f}   her-statistics lineage {mean([fid(r[key]['statsForms']) for r in runs]):.3f}   stoneless newborn {mean([nost(r) for r in runs]):.3f}")
    print("   3a vs her-statistics lineage:", a1[2], "PASS" if a1[0] else "fail")
    print("   3a vs stoneless newborn:     ", a2[2], "PASS" if a2[0] else "fail")
    print("   3b own parent vs others:     ", b[2], "PASS" if b[0] else "fail")
    return a1[0] and a2[0] and b[0]

def main(src, names_path):
    names = json.load(open(names_path))
    full = load(f"{src}/full")
    print(f"THE POINTER II: {len(full)} fresh travellers in worlds {sorted(set(r['world'] for r in full))}")
    rate = lambda c, f, who: c[who].get(f, 0) / c[f"{who}Ticks"] if c[f"{who}Ticks"] else 0

    print("\nC1  CONFIRMATION (her rate > order-1 her-statistics walker)")
    confirmed = {}
    for name, f in FORMS.items():
        ok, txt = recurrence([(r["world"], r["catalogue"]["her"].get(f, 0) > 0 and rate(r["catalogue"], f, "her") > rate(r["catalogue"], f, "stats")) for r in full], 9)
        confirmed[name] = ok
        print(f"   {name} {f:8} {txt}  {'CONFIRMED' if ok else 'NOT CONFIRMED'}")
    print("   R  replication through the place:")
    confirmed["R"] = replication(full, "assay3")
    print("   R ", "CONFIRMED" if confirmed["R"] else "NOT CONFIRMED")

    print("\nC2  BEYOND HER HABITS (her rate > order-2 and order-3 walkers)")
    beyond = {}
    for name, f in FORMS.items():
        ok, txt = recurrence([(r["world"], r["catalogue"]["her"].get(f, 0) > 0 and rate(r["catalogue"], f, "her") > rate(r["catalogue"], f, "stats2")
                               and rate(r["catalogue"], f, "her") > rate(r["catalogue"], f, "stats3")) for r in full], 10)
        beyond[name] = ok and confirmed[name]
        print(f"   {name} {f:8} {txt}  {'BEYOND HER HABITS' if beyond[name] else 'not' + ('' if confirmed[name] else ' (not confirmed in C1)')}")

    print("\nC3  THE FORM BELONGS TO THE WHOLE (her rate over assays 1, 2 and generation 0; full vs one element closed)")
    arms = {a: {(r["world"], r["lineage"]): r for r in load(f"{src}/{a}")} for a in ("noGt28", "noCur17", "noGt10")}
    hc = lambda r, f: r["catalogue"]["herCore"]["c"].get(f, 0) / r["catalogue"]["herCore"]["ticks"]
    whole = {}
    for name, f, arm, what in (("F2", FORMS["F2"], "noGt28", "Gt-28 (7>1)"), ("F3", FORMS["F3"], "noCur17", "the 8::1 current (1>7)")):
        rows = [(r["world"], hc(r, f) - hc(arms[arm][(r["world"], r["lineage"])], f)) for r in full]
        ctrl = [(r["world"], hc(r, f) - hc(arms["noGt10"][(r["world"], r["lineage"])], f)) for r in full]
        ok, p, txt = sign(rows, 0.025); cok, cp, ctxt = sign(ctrl, 0.025)
        whole[name] = ok and cp >= 0.025
        mean = lambda xs: sum(xs) / len(xs)
        print(f"   {name} {f}: mean rate full {mean([hc(r, f) for r in full]):.5f}, without {what} {mean([hc(arms[arm][(r['world'], r['lineage'])], f) for r in full]):.5f}, without Gt-10 {mean([hc(arms['noGt10'][(r['world'], r['lineage'])], f) for r in full]):.5f}")
        print(f"      closing {what}: {txt}   control (closing Gt-10): {ctxt}   -> {'THE FORM BELONGS TO THE WHOLE' if whole[name] else 'not'}")

    print("\nC4  REPLICATION WITHOUT OUR CHANNEL (stone playback off)")
    np_ok = replication(full, "assay3np")
    print("   ", "REPLICATION WITHOUT OUR CHANNEL" if np_ok else "not")

    print("\nANSWERS")
    for n in ("F1", "F2", "F3", "R"): print(f"   {n}: {'CONFIRMED' if confirmed[n] else 'NOT CONFIRMED'}" + (f", {'BEYOND HER HABITS' if beyond.get(n) else 'not beyond her habits'}" if n in beyond and confirmed[n] else ""))
    for n in ("F2", "F3"): print(f"   {n}: {'THE FORM BELONGS TO THE WHOLE' if whole[n] else 'does not belong to the whole'}")
    print(f"   {'REPLICATION WITHOUT OUR CHANNEL' if np_ok else 'NO REPLICATION WITHOUT OUR CHANNEL'}")

if __name__ == "__main__":
    main(*sys.argv[1:])
