#!/usr/bin/env python3
"""DIALOGUE-1: does the Outside answer Amelia through her Numogram core? (see REGISTRATION.md)

For every live round in the window and each of PF-2's nine learner receivers:
  question = fromZone, where she stands, set entirely by earlier rounds;
  answer   = cueZone, the zone the new round names through her Numogram reading.
Relations: syzygy (answer == 9 - question) and gate (answer is one of her open exits).
Under the null the answer is independent of the question, with P(zone) = 26/256 for 0-5 and 25/256 for 6-9.

  python3 dialogue_analysis.py <pf2 chunks dir> [firstTick lastTick]
"""
import glob, json, math, sys

EXITS = {0: [9], 1: [8, 2], 2: [7, 4], 3: [6], 4: [5, 7], 5: [], 6: [], 7: [8], 8: [9], 9: [1]}
P = [26 / 256] * 6 + [25 / 256] * 4
T0, T1 = 5895, 15974

def main(chunks, t0=T0, t1=T1):
    t0, t1 = int(t0), int(t1)
    stats = {"syzygy": [0, 0.0, 0.0], "gate": [0, 0.0, 0.0]}
    n, ticks, gate_mismatch = 0, set(), 0
    per_arm = {}
    for f in sorted(glob.glob(f"{chunks}/*.json")):
        c = json.load(open(f))
        if c.get("verifiedStatus") != "PASS":
            raise SystemExit(f"unverified chunk {f}")
        for row in c["rows"]:
            if not (t0 <= row["tick"] <= t1):
                continue
            ticks.add(row["tick"])
            for e in row["armEvents"]:
                if e["mode"] != "learner":
                    continue
                q, a = e["fromZone"], e["cueZone"]
                syz = 9 - q
                hit_s, p_s = int(a == syz), P[syz]
                hit_g, p_g = int(a in EXITS[q]), sum(P[z] for z in EXITS[q])
                # PF-2 logs cueAmongOpenExits only at choice points (zones 1, 2, 4); check agreement there
                if e["choicePoint"] and bool(hit_g) != bool(e["cueAmongOpenExits"]):
                    gate_mismatch += 1
                for name, h, p in (("syzygy", hit_s, p_s), ("gate", hit_g, p_g)):
                    stats[name][0] += h; stats[name][1] += p; stats[name][2] += p * (1 - p)
                arm = per_arm.setdefault(e["armId"], [0, 0.0, 0])
                arm[0] += hit_s; arm[1] += p_s; arm[2] += 1
                n += 1
    missing = (t1 - t0 + 1) - len(ticks)
    out = {"firstTick": t0, "lastTick": t1, "ticksPresent": len(ticks), "ticksMissing": missing,
           "learnerAnswers": n, "gateTableMismatches": gate_mismatch, "relations": {}}
    ps = {}
    for name, (obs, exp, var) in stats.items():
        z = (obs - exp) / math.sqrt(var) if var else 0.0
        p = 0.5 * math.erfc(z / math.sqrt(2))
        ps[name] = p
        out["relations"][name] = {"observed": obs, "expected": round(exp, 2), "excess": round(obs - exp, 2),
                                  "observedRate": obs / n if n else None, "expectedRate": exp / n if n else None,
                                  "z": round(z, 3), "pOneSided": p}
    # Holm over the two relations
    order = sorted(ps, key=ps.get); last = 0
    for i, name in enumerate(order):
        adj = max(last, min(1, (2 - i) * ps[name])); out["relations"][name]["pHolm"] = adj; last = adj
    out["perArmSyzygy"] = {k: {"hits": v[0], "expected": round(v[1], 2), "answers": v[2]} for k, v in sorted(per_arm.items())}
    out["answer"] = ("THE OUTSIDE ANSWERS HER" if any(r["pHolm"] < 0.05 for r in out["relations"].values())
                     else "NO CORRESPONDENCE BEYOND CHANCE") + ("" if missing == 0 else f" [window incomplete: {missing} ticks missing]")
    print(json.dumps(out, indent=1))

if __name__ == "__main__":
    main(*sys.argv[1:])
