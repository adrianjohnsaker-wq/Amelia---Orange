#!/usr/bin/env python3
"""Score the language-model Outside runs against QUESTION.md (Primary 1 decisive; Primary 2 descriptive)."""
import glob, json, os, sys
from math import comb
src, out = sys.argv[1:3]
runs = [json.load(open(f)) for f in sorted(glob.glob(f"{src}/S05W*.json"))]
json.dump({f"{r['world']}_{r['pair']}": r for r in runs}, open(os.path.join(out, "lineages.json"), "w"))
print(f"lineages completed: {len(runs)} of 32")
last = lambda r, a, k: r["arms"][a]["seasons"][-1][k]
def sign(d):
    up = sum(x > 0 for x in d); dn = sum(x < 0 for x in d); n = up + dn
    p = min(1, 2 * sum(comb(n, k) for k in range(max(up, dn), n + 1)) / 2 ** n) if n else 1.0
    return up, dn, len(d) - n, p
arms = ["live", "monologue", "delayed", "shuffled", "noise", "mirror"]
print(f"\n{'arm':10} {'pull 2>7':>8} {'routes':>7} {'deaths 6 seasons':>16} {'invalid blocks':>14}")
for a in arms:
    m = lambda k: sum(last(r, a, k) for r in runs) / len(runs)
    print(f"{a:10} {m('pull27'):8.3f} {m('routes'):7.2f} {sum(sum(s['deaths'] for s in r['arms'][a]['seasons']) for r in runs):16d} {sum(len(r['arms'][a]['invalidBlocks']) for r in runs):14d}")
print()
for ctl in ["delayed", "monologue", "shuffled", "noise"]:
    up, dn, ti, p = sign([last(r, "live", "pull27") - last(r, ctl, "pull27") for r in runs])
    print(f"pull 2>7, live minus {ctl:9}: higher {up:2d}, lower {dn:2d}, tied {ti:2d}; two-sided sign p = {p:.4g}")
up, dn, ti, p = sign([last(r, "live", "pull27") - last(r, "delayed", "pull27") for r in runs])
print("\nPRIMARY 1 (decisive):", ("YES, she registers the model as answering" if p < 0.05 else "NO") + (f"  [only {len(runs)} of 32 lineages]" if len(runs) < 32 else ""))
print("\nPRIMARY 2 (descriptive): mirror rate, difference rate, contingency")
for a in ["live", "monologue", "mirror", "noise"]:
    # lineages where the model never gave a valid choice have empty (null) descriptives; they are counted, not averaged
    ds = [r["arms"][a]["describe"] for r in runs]; ok = [d for d in ds if d["mirrorRate"] is not None]
    m = lambda k: (sum(d[k] for d in ok) / len(ok)) if ok else float("nan")
    sig = sum(d["permutationP"] < 0.05 for d in ok)
    valid = sum(len(r["arms"][a]["choices"]) - len(r["arms"][a]["invalidBlocks"]) for r in runs)
    print(f"{a:10} valid choices {valid:5d}/{242*len(runs)}  lineages with any {len(ok):2d}/{len(ds)}  mirror {m('mirrorRate'):.3f}  difference {m('differenceRate'):.3f}  MI {m('contingencyMI'):.3f} bits  contingent (p<0.05) in {sig}/{len(ok)}")
