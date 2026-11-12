#!/usr/bin/env python3
"""THE POINTER VI targets (REGISTRATION.md). One Quicknet round per (traveller, trial): round FIRST + g, g = (world index * 9 +
lineage) * 50 + trial, worlds sorted S6V01..S6V08, FIRST = the first round released at or after 2026-11-12 18:00 UTC. Each round
is BLS-verified by the pinned C1 code. From its 32 random bytes: bytes 0-7 give the 8x8 grid (64 bits, byte 0 first, most
significant bit first, row-major); byte 8 mod 8 gives the hidden rule (0-7). Run only after the last round is released.
  PYTHONPATH=<c1-pin> python3 targets.py <answers.json> <out targets.json>"""
import datetime as dt, json, sys
T_STAR = dt.datetime(2026, 11, 12, 18, tzinfo=dt.timezone.utc)
WORLDS = ['S6V01', 'S6V02', 'S6V03', 'S6V04', 'S6V05', 'S6V06', 'S6V07', 'S6V08']; LINEAGES, TRIALS = 9, 50
def decode(randomness_hex):
    b = bytes.fromhex(randomness_hex)
    return {'grid': [(b[i // 8] >> (7 - i % 8)) & 1 for i in range(64)], 'rule': b[8] % 8}
def main(answers_path, out):
    from drift1a_c1.beacon import LiveBeacon, QUICKNET
    first = -(-(int(T_STAR.timestamp()) - QUICKNET['genesis_time']) // 3) + 1
    last = first + len(WORLDS) * LINEAGES * TRIALS - 1
    if dt.datetime.now(dt.timezone.utc).timestamp() < QUICKNET['genesis_time'] + (last - 1) * 3 + 60:
        raise SystemExit('TARGET_ROUNDS_NOT_YET_RELEASED')
    runs = json.load(open(answers_path)); b = LiveBeacon(); T = {}; rounds = []
    for r in runs:
        w, k = r['world'], r['lineage']; assert r['rounds'][0] == first + (WORLDS.index(w) * LINEAGES + k) * TRIALS, (w, k)
        ts = []
        for i in range(TRIALS):
            rnd = first + (WORLDS.index(w) * LINEAGES + k) * TRIALS + i; rec = b.fetch(rnd); rounds.append({'round': rnd, 'randomness': rec['randomness']})
            ts.append(decode(rec['randomness']))
        T[f'{w}|{k}'] = ts
    json.dump({'schema': 'POINTER6_TARGETS_V1', 'firstRound': first, 'lastRound': last, 'rounds': rounds, 'targets': T}, open(out, 'w'))
    print(json.dumps({'firstRound': first, 'lastRound': last, 'trials': sum(len(v) for v in T.values())}))
if __name__ == '__main__': main(sys.argv[1], sys.argv[2])
