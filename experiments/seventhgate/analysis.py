#!/usr/bin/env python3
"""THE SEVENTH GATE analysis, exactly as REGISTRATION.md: the influence map, plus the descriptive junction fit.

  python3 analysis.py <fresh dir> <full-raised dir> <names.json>
"""
import glob, json, math, random, sys
from math import comb

CANON = {"0>9", "1>8", "2>7", "3>6", "4>5", "1>2", "2>4", "4>7", "7>8", "8>9", "9>1"}
P0, ALPHA = 2 / 21, 0.05 / 39
region = lambda z: "Plex" if z in (0, 9) else "Warp" if z in (3, 6) else "Time-Circuit"
droot = lambda c: 0 if c == 0 else 1 + (c - 1) % 9

def kind(s, t):
    k = []
    if s + t == 9: k.append(f"syzygy {max(s, t)}::{min(s, t)}")
    if t == abs(2 * s - 9): k.append(f"current {max(s, 9 - s)}::{min(s, 9 - s)}->{t}")
    if t == droot(s * (s + 1) // 2): k.append(f"Gt-{s * (s + 1) // 2}")
    if f"{s}>{t}" in CANON: k.append("original edge")
    return " + ".join(k) or "?"

def kmin(n):
    for k in range(n + 1):
        if sum(comb(n, j) * P0 ** j * (1 - P0) ** (n - j) for j in range(k, n + 1)) < ALPHA: return k
    return n + 1

def influence(runs, F, names, label):
    gates = list(runs[0]["knockouts"][F].keys()); hits = []
    print(f"\n   {F} in {label}:")
    for g in gates:
        n = up = down = 0
        for r in runs:
            s = [x["rate"] for x in r["noise"][F] if x["rate"] is not None]; ko = r["knockouts"][F][g]["rate"]
            if len(s) < 10 or ko is None: continue
            n += 1; up += ko > max(s); down += ko < min(s)
        k = kmin(n); moved = up + down; ok = n > 0 and moved >= k
        a, b = map(int, g.split(">"))
        line = f"     close {g:4} ({kind(a, b)}; {region(a)}->{region(b)}; {names.get(f'{min(a, b)}-{max(a, b)}', '-')}): moved {moved}/{n} (k={k}) up {up} down {down}"
        if ok: hits.append((g, "raises" if up > down else "lowers")); line += f"  REACHES IN, closing it {'raises' if up > down else 'lowers'} {F}"
        print(line)
    return hits

def logistic(X, y, Xt, yt, iters=400, lr=0.5):
    d = len(X[0]); w = [0.0] * (d + 1)
    for _ in range(iters):
        g = [0.0] * (d + 1)
        for x, t in zip(X, y):
            z = w[0] + sum(wi * xi for wi, xi in zip(w[1:], x)); p = 1 / (1 + math.exp(-max(-30, min(30, z))))
            g[0] += p - t
            for i, xi in enumerate(x): g[i + 1] += (p - t) * xi
        w = [wi - lr * gi / len(X) for wi, gi in zip(w, g)]
    ll = 0.0
    for x, t in zip(Xt, yt):
        z = w[0] + sum(wi * xi for wi, xi in zip(w[1:], x)); p = 1 / (1 + math.exp(-max(-30, min(30, z)))); p = min(max(p, 1e-9), 1 - 1e-9)
        ll += -(t * math.log(p) + (1 - t) * math.log(1 - p))
    return ll / len(Xt)

def junction(runs, label):
    rows = []
    for r in runs:
        for li, life in enumerate(r["junction"]):
            for v in life:
                if "to" not in v: continue
                ex = {t: (lv, hv) for t, lv, hv in v["ex"]}
                if 1 not in ex: continue
                others = [ex[t] for t in ex if t != 1] or [(0, 0)]
                local = [ex[1][0] - max(o[0] for o in others), ex[1][1] - max(o[1] for o in others), 1.0 if v["input"] == 1 else 0.0]
                rows.append((li % 2, local, local + v["act"], 1 if v["to"] == 1 else 0))
    if not rows: print(f"   {label}: no visits to 7"); return
    random.Random(7).shuffle(rows); rows = rows[:20000]
    tr = [x for x in rows if x[0] == 0]; te = [x for x in rows if x[0] == 1]
    base = sum(x[3] for x in tr) / len(tr); p = min(max(base, 1e-9), 1 - 1e-9)
    ll0 = -sum(x[3] * math.log(p) + (1 - x[3]) * math.log(1 - p) for x in te) / len(te)
    ll1 = logistic([x[1] for x in tr], [x[3] for x in tr], [x[1] for x in te], [x[3] for x in te])
    ll2 = logistic([x[2] for x in tr], [x[3] for x in tr], [x[2] for x in te], [x[3] for x in te])
    print(f"   {label}: {len(rows)} visits to zone 7 (sampled); she takes Gt-28 back to 1 in {sum(x[3] for x in rows) / len(rows):.3f} of them")
    print(f"      held-out log-loss: base rate {ll0:.4f}, her own terms {ll1:.4f}, her own terms + the field {ll2:.4f}")

def main(fresh, fullr, names_path):
    names = json.load(open(names_path))
    sets = {"fresh (raised on the old core)": [json.load(open(f)) for f in sorted(glob.glob(f"{fresh}/S05W*.json"))],
            "full-raised": [json.load(open(f)) for f in sorted(glob.glob(f"{fullr}/S05W*.json"))]}
    print("THE SEVENTH GATE: influence map (closing one distant gate; moved = outside the traveller's whole noise range; null 2/21)")
    res = {}
    for label, runs in sets.items():
        for F in ("F1", "F4"): res[(F, label)] = influence(runs, F, names, label)
    print("\nDESCRIPTIVE: the field at the junction")
    for label, runs in sets.items(): junction(runs, label)
    print("\nANSWERS")
    for (F, label), primary in ((("F1", "fresh (raised on the old core)"), True), (("F4", "full-raised"), True), (("F1", "full-raised"), False), (("F4", "fresh (raised on the old core)"), False)):
        h = res[(F, label)]; tag = "primary" if primary else "replication"
        print(f"   {F} {label} [{tag}]: " + ("THE WHOLE REACHES IN THROUGH " + ", ".join(f"{g} ({d} {F})" for g, d in h) if h else "NO SINGLE DISTANT GATE REACHES IN"))

if __name__ == "__main__":
    main(*sys.argv[1:])
