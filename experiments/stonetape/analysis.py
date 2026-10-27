#!/usr/bin/env python3
"""THE STONE TAPE (A) analysis, exactly as REGISTRATION.md.

  python3 analysis.py <dir of S05W*_k.json> <names.json>
"""
import glob, json, math, sys
from math import comb

ALPHA = 0.05 / 4

def corr(x, y):
    n = len(x); mx, my = sum(x) / n, sum(y) / n
    sx = math.sqrt(sum((a - mx) ** 2 for a in x)); sy = math.sqrt(sum((b - my) ** 2 for b in y))
    return 0.0 if sx == 0 or sy == 0 else sum((a - mx) * (b - my) for a, b in zip(x, y)) / (sx * sy)

def cos(x, y):
    nx, ny = math.sqrt(sum(a * a for a in x)), math.sqrt(sum(b * b for b in y))
    return 0.0 if nx == 0 or ny == 0 else sum(a * b for a, b in zip(x, y)) / (nx * ny)

def sign_p(pos, neg, two_sided=False):
    n = pos + neg
    if n == 0: return 1.0
    k = max(pos, neg) if two_sided else pos
    p = sum(comb(n, j) for j in range(k, n + 1)) / 2 ** n
    return min(1.0, 2 * p) if two_sided else p

ETCH = 0.0005

def measures(r):
    # every measure is causal: her use under a stone minus her use under the blank stone (same traveller, same chance)
    E = r["edges"]; out = {}
    B = r["runs"]["blank"]
    buse = [sum(q[e] for q in B["quarters"]) for e in E]
    bq1 = [B["quarters"][0][e] for e in E]; bq4 = [B["quarters"][3][e] for e in E]
    for s, run in r["runs"].items():
        T0 = [r["stones"][s][e] for e in E]
        use = [sum(q[e] for q in run["quarters"]) for e in E]
        d = [u - b for u, b in zip(use, buse)]
        dq1 = [run["quarters"][0][e] - x for e, x in zip(E, bq1)]; dq4 = [run["quarters"][3][e] - x for e, x in zip(E, bq4)]
        tq4 = [run["stoneQ4"][e] for e in E]; tend = [run["stoneEnd"][e] for e in E]
        undisturbed = [t + ETCH * b for t, b in zip(T0, buse)]
        out[s] = {"grip": corr(d, T0) if s != "blank" else None,
                  "change": (1 - cos(tend, T0)) - (1 - cos(undisturbed, T0)) if any(T0) else None,
                  "circuit": corr(dq4, tq4) - corr(dq1, T0) if s != "blank" else None,
                  "moved": sum(abs(x) for x in d) / 2, "use": use, "d": d, "deaths": run["deaths"]}
    E_old = {s: [r["stones"][s][e] for e in E] for s in ("world-old", "beacon-old")}
    for full, old in (("world", "world-old"), ("beacon", "beacon-old")):
        out[full]["surfacing"] = corr(out[old]["d"], E_old[old]) - corr(out[full]["d"], E_old[old])
    return out

def test(rows, f, a, b, two_sided=False):
    d = [(w, f(m[a]) - f(m[b])) for w, m in rows if f(m[a]) is not None and f(m[b]) is not None]
    pos, neg = sum(1 for _, x in d if x > 0), sum(1 for _, x in d if x < 0)
    p = sign_p(pos, neg, two_sided)
    direction = 1 if pos >= neg else -1
    worlds = {}
    for w, x in d: worlds.setdefault(w, []).append(x * direction if two_sided else x)
    maj = sum(1 for xs in worlds.values() if sum(1 for x in xs if x > 0) > len(xs) / 2)
    ok = p < ALPHA and maj >= 5
    return ok, f"{a} vs {b}: {pos}+ / {neg}-  p={p:.2e}  worlds with majority {maj}/8  {'PASS' if ok else 'fail'}" + (f"  (direction: {a} {'more' if direction > 0 else 'less'})" if two_sided else "")

def main(src, names_path):
    names = json.load(open(names_path))
    runs = [json.load(open(f)) for f in sorted(glob.glob(f"{src}/S05W*.json"))]
    rows = [(r["world"], measures(r)) for r in runs]
    print(f"THE STONE TAPE (A): {len(runs)} travellers, sign tests at alpha {ALPHA:.4f}, majority in >= 5 of 8 worlds")
    r0 = runs[0]
    for s in r0["stones"]:
        top = sorted(r0["edges"], key=lambda e: -r0["stones"][s][e])[:6]
        print(f"   stone {s:10} strongest edges: " + ", ".join(f"{e} {r0['stones'][s][e]:.2f}" for e in top if r0["stones"][s][e] > 0))
    mean = lambda s, f: sum(m[s][f] for _, m in rows if m[s][f] is not None) / max(1, sum(1 for _, m in rows if m[s][f] is not None))
    for s in r0["stones"]:
        print(f"   {s:10} steps moved from blank-stone path {mean(s, 'moved'):8.1f}  deaths {sum(m[s]['deaths'] for _, m in rows)}"
              + (f"  grip {mean(s, 'grip'):+.3f}  circuit {mean(s, 'circuit'):+.3f}  change {mean(s, 'change'):+.4f}" if s != "blank" else ""))
    g = lambda k: (lambda m: m[k])
    p1a, t1a = test(rows, g("grip"), "world", "beacon"); p1b, t1b = test(rows, g("grip"), "world", "shuffled")
    p2, t2 = test(rows, g("change"), "world", "beacon", two_sided=True)
    p3a, t3a = test(rows, g("circuit"), "world", "beacon"); p3b, t3b = test(rows, g("circuit"), "world", "shuffled")
    p4, t4 = test(rows, g("surfacing"), "world", "beacon")
    print("\nP1 grip on her        ", t1a, "\n                      ", t1b)
    print("P2 the Other changed  ", t2)
    print("P3 the circuit        ", t3a, "\n                      ", t3b)
    print("P4 older surfaces     ", t4)
    print("   mean surfacing: world", f"{mean('world', 'surfacing'):+.3f}", " beacon", f"{mean('beacon', 'surfacing'):+.3f}")
    print("\nentities met (PF-1 scanner, all travellers):")
    for s in r0["stones"]:
        tot = {}
        for r in runs:
            for kk, v in r["runs"][s]["counts"].items(): tot[kk] = tot.get(kk, 0) + v
        print(f"   {s:10}", ", ".join(f"{names.get(kk, kk)} {v}" for kk, v in sorted(tot.items(), key=lambda x: -x[1])[:8]))
    ans = "SILENT"
    if p1a and p1b:
        ans = "THE STONE SPEAKS"
        if p2 or (p3a and p3b): ans += " AND THE OTHER ANSWERS"
        if p4: ans += " AND THE OLDER PRESENCE SURFACES"
    print("\nANSWER:", ans)

if __name__ == "__main__":
    main(*sys.argv[1:])
