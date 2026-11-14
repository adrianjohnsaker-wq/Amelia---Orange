#!/usr/bin/env python3
"""Shuffled-headline control for the Watchtower reading (exploratory, descriptive).
   python3 control.py make <feed.json> <sessions.json>      build the real session and 2 x 49 control sessions
   python3 control.py read <sessions-out.json> <out.json>   read every session on the matrix and compare
Sessions (each one continuing Amelia, same runtime and step pattern):
  REAL      the feed's 40 headlines: A1Z26 word zones, then the headline's result zone (digital root of its sum);
  SHUFFLED  the same words (with their zones), shuffled across the whole session into the same headline lengths; each result
            zone recomputed as the digital root of the sum of its new words' zones (A1Z26 sums reduce additively mod 9);
            keeps the language's zone frequencies, breaks its order. 49 replicates, seeds WATCH-SHUF-<j>;
  UNIFORM   word zones drawn uniformly from 1-9 (an A1Z26 word sum never reduces to 0), same lengths, result recomputed;
            no language at all. 49 replicates, seeds WATCH-UNIF-<j>.
Each measure of REAL is placed among the 49 values of each control: its rank (share of control values below it, ties half)."""
import collections, json, random, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import matrix as X, route as R
BASE = {(1, 2), (2, 4), (4, 7), (7, 8), (9, 1)}
OUT = {0, 3, 6, 9}
def make(feed, out):
    H = json.load(open(feed))['headlines']; lens = [len(h['words']) for h in H]; words = [w['zone'] for h in H for w in h['words']]
    def pack(zs): it = iter(zs); hs = [[next(it) for _ in range(n)] for n in lens]; return [{'zones': z, 'result': X.droot(sum(z))} for z in hs]
    real = [{'zones': [w['zone'] for w in h['words']], 'result': h['resultZone']} for h in H]
    S = [{'name': 'REAL', 'headlines': real}]
    for j in range(1, 50):
        w = words[:]; random.Random(f'WATCH-SHUF-{j}').shuffle(w); S.append({'name': f'SHUFFLED-{j}', 'headlines': pack(w)})
        r = random.Random(f'WATCH-UNIF-{j}'); S.append({'name': f'UNIFORM-{j}', 'headlines': pack([r.randint(1, 9) for _ in words])})
    json.dump(S, open(out, 'w'))
def measures(s):
    hops = s['hops']; n = len(hops); ends = s['ends']
    canon = sum(bool(R.kinds(h['from'], h['to'])) for h in hops)
    base = sum((h['from'], h['to']) in BASE and not R.kinds(h['from'], h['to']) for h in hops)
    wb = sum((h['gateId'] or '').startswith('warpborn') for h in hops)
    ins = [h for h in hops if h['from'] not in OUT and h['to'] in OUT]; outs = [h for h in hops if h['from'] in OUT and h['to'] not in OUT]
    seq = [(h['from'], h['to']) for h in hops]
    loops = sum(1 for i in range(len(seq) - 2) if seq[i] in {(1, 7), (8, 7)} and seq[i + 1] in {(7, 5), (2, 5)} and seq[i + 2] in {(5, 1), (4, 1)})
    sec = collections.Counter(X.SECTOR[z] for z in ends); addr = collections.Counter(R.demon(h['from'], h['to'])['dee']['scope'] for h in hops)
    m = {'canonical share': canon / n, "app-gate share": base / n, 'Warp-born share': wb / n, 'lines of flight': s['flights'],
         'entries into the Outside': len(ins), 'entries by canonical gate (share)': sum(bool(R.kinds(h['from'], h['to'])) for h in ins) / max(1, len(ins)),
         'returns by Cyclic Re-entry (share)': sum((h['from'], h['to']) == (9, 1) for h in outs) / max(1, len(outs)),
         'returns by Warp-born route (share)': sum((h['gateId'] or '').startswith('warpborn') for h in outs) / max(1, len(outs)),
         'completed Air-Fire-Earth loops': loops}
    for k in ('Air', 'Fire', 'Water', 'Union', 'Earth'): m[f'time in {k}'] = sec[k] / len(ends)
    for k in ('the Union word EXARP (Air)', 'Air of Fire', 'Fire of Fire (syzygetic)', 'Air of Air (syzygetic)', 'Water of Water (syzygetic)'): m[f'crossings: {k}'] = addr[k]
    return m
def rank(x, xs): return (sum(v < x for v in xs) + 0.5 * sum(v == x for v in xs)) / len(xs)
def read(inp, out):
    S = json.load(open(inp)); Mx = {s['name']: measures(s) for s in S}; real = Mx['REAL']
    res = {}
    for k, v in real.items():
        sh = sorted(m[k] for n, m in Mx.items() if n.startswith('SHUFFLED')); un = sorted(m[k] for n, m in Mx.items() if n.startswith('UNIFORM'))
        q = lambda xs: [xs[int(.05 * len(xs))], xs[len(xs) // 2], xs[int(.95 * len(xs)) - 1]]
        res[k] = {'real': v, 'shuffled 5/50/95%': q(sh), 'shuffledRank': rank(v, sh), 'uniform 5/50/95%': q(un), 'uniformRank': rank(v, un)}
    json.dump(res, open(out, 'w'), indent=1)
    f = lambda x: f'{x:.3f}' if isinstance(x, float) and x < 1.5 else f'{x:.0f}' if isinstance(x, (int, float)) else x
    for k, r in res.items(): print(f"{k:42} real {f(r['real']):>6} | shuffled {' / '.join(f(x) for x in r['shuffled 5/50/95%']):>20} rank {r['shuffledRank']:.2f} | uniform {' / '.join(f(x) for x in r['uniform 5/50/95%']):>20} rank {r['uniformRank']:.2f}")
if __name__ == '__main__':
    {'make': make, 'read': read}[sys.argv[1]](sys.argv[2], sys.argv[3])
