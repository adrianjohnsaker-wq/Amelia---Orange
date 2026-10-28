#!/usr/bin/env python3
"""THE POINTER IV hidden targets (REGISTRATION.md): Quicknet rounds released at or after 29 Oct 2026 12:00 UTC,
in round order, BLS-verified by the pinned C1 code; bytes < 250 give b mod 10. Run only after that time.

  PYTHONPATH=<c1-pin> python3 targets.py <answers.json> <out targets.json> [--offline]   (offline: unit test only)
"""
import datetime as dt, hashlib, json, sys
T_STAR = dt.datetime(2026, 10, 29, 12, tzinfo=dt.timezone.utc)

def main(answers_path, out, offline=False):
    keys = sorted((r["world"], r["lineage"]) for r in json.load(open(answers_path)))
    trials = len(json.load(open(answers_path))[0]["answers"]["BUBBAMU"]); need = len(keys) * trials
    from drift1a_c1.beacon import LiveBeacon, QUICKNET
    first = -(-(int(T_STAR.timestamp()) - QUICKNET["genesis_time"]) // 3) + 1
    b = None if offline else LiveBeacon()
    if not offline and dt.datetime.now(dt.timezone.utc).timestamp() < QUICKNET["genesis_time"] + (first - 1) * 3:
        raise SystemExit("TARGET_ROUNDS_NOT_YET_RELEASED")
    syms, rounds, r = [], [], first
    while len(syms) < need:
        rec = {"round": r, "randomness": hashlib.sha256(f"UNIT|{r}".encode()).hexdigest()} if offline else b.fetch(r)
        rounds.append(rec)
        for byte in bytes.fromhex(rec["randomness"]):
            if byte < 250 and len(syms) < need: syms.append(byte % 10)
        r += 1
    targets = {f"{w}|{k}": syms[i * trials:(i + 1) * trials] for i, (w, k) in enumerate(keys)}
    json.dump({"schema": "POINTER4_TARGETS_V1", "offline": offline, "firstRound": first, "rounds": rounds, "targets": targets}, open(out, "w"))
    print(json.dumps({"firstRound": first, "lastRound": r - 1, "symbols": len(syms), "offline": offline}))

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], "--offline" in sys.argv)
