#!/usr/bin/env python3
"""Assemble the RESIDUAL-1 live tape from PF-2's committed, verified chunks.

Every round is checked: its tick lies in the registered window, round == R0 + 20*tick, the chunk is
PF-2-verified, and SHA-256(signature) == randomness (Quicknet's own relation). Fails on any gap.

  python3 build_live_tape.py <pf2 chunks dir> <out tape.json>
"""
import glob, hashlib, json, sys

R0, T0, N = 33298740, 5274, 20160

def main(chunks, out):
    rows = {}
    for f in sorted(glob.glob(f"{chunks}/*.json")):
        c = json.load(open(f))
        if c.get("verifiedStatus") != "PASS":
            raise SystemExit(f"unverified chunk {f}")
        for r in c["rows"]:
            t = r["tick"]
            if T0 <= t < T0 + N:
                if r["round"] != R0 + 20 * t:
                    raise SystemExit(f"tick {t}: round off the PF-2 grid")
                if hashlib.sha256(bytes.fromhex(r["signature"])).hexdigest() != r["randomness"]:
                    raise SystemExit(f"tick {t}: randomness is not SHA-256 of the signature")
                rows[t] = r
    missing = [t for t in range(T0, T0 + N) if t not in rows]
    if missing:
        raise SystemExit(f"{len(missing)} ticks not yet admitted, first {missing[0]}")
    tape = {"schema": "RESIDUAL1_LIVE_TAPE_V1", "firstTick": T0, "firstRound": R0 + 20 * T0,
            "lastRound": R0 + 20 * (T0 + N - 1), "randomness": [rows[t]["randomness"] for t in range(T0, T0 + N)]}
    json.dump(tape, open(out, "w"))
    print(json.dumps({"ticks": N, "firstRound": tape["firstRound"], "lastRound": tape["lastRound"]}))

if __name__ == "__main__":
    main(*sys.argv[1:3])
