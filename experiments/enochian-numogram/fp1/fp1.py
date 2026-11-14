#!/usr/bin/env python3
"""FP-1, the Fire prediction (REGISTRATION.md).
  python3 fp1.py prepare <world-live checkout> <since ISO> <out headlines.json>   (exit 3: fewer than 40 headlines yet)
  python3 fp1.py sessions <headlines.json> <out sessions.json>
  python3 fp1.py decide <sessions-out.json from feed/sessions.ts> <headlines.json> <out RESULT.json>
Headlines: the first 40 world-stream items of stream 'words' first seen at or after the seal, deduplicated by (source, id),
in order of first sight (seenAt, then source, then id), each reduced A1Z26 -> digital root per word (route.a1z26, identical to
the app's reduction on the 40 headlines of the Pandemonium Feed), with the headline's result zone = digital root of its sum."""
import glob, json, random, sys, pathlib
H = pathlib.Path(__file__).resolve().parent.parent; sys.path.insert(0, str(H)); import matrix as X, route as R, control as C
N, S = 40, 49
def prepare(live, since, out):
    seen, items = set(), []
    for f in sorted(glob.glob(f'{live}/batches/*.json')):
        for x in json.load(open(f))['items']:
            k = (x['source'], x['id'])
            if x['stream'] != 'words' or k in seen: continue
            seen.add(k); items.append(x)
    items = sorted((x for x in items if x['seenAt'] >= since), key=lambda x: (x['seenAt'], x['source'], x['id']))
    if len(items) < N: print(json.dumps({'ready': False, 'have': len(items), 'need': N})); sys.exit(3)
    hl = []
    for x in items[:N]:
        w = R.a1z26(x['text'])
        hl.append({'seenAt': x['seenAt'], 'source': x['source'], 'id': x['id'], 'text': x['text'], 'zones': [z for _, _, z in w], 'result': X.droot(sum(n for _, n, _ in w))})
    json.dump({'since': since, 'headlines': hl}, open(out, 'w'), indent=1); print(json.dumps({'ready': True, 'first': hl[0]['seenAt'], 'last': hl[-1]['seenAt']}))
def sessions(inp, out):
    hl = [h for h in json.load(open(inp))['headlines'] if h['zones']]; lens = [len(h['zones']) for h in hl]; words = [z for h in hl for z in h['zones']]
    def pack(zs): it = iter(zs); hs = [[next(it) for _ in range(n)] for n in lens]; return [{'zones': z, 'result': X.droot(sum(z))} for z in hs]
    Ss = [{'name': 'REAL', 'headlines': [{'zones': h['zones'], 'result': h['result']} for h in hl]}]
    for j in range(1, S + 1):
        w = words[:]; random.Random(f'FP1-SHUF-{j}').shuffle(w); Ss.append({'name': f'SHUFFLED-{j}', 'headlines': pack(w)})
        r = random.Random(f'FP1-UNIF-{j}'); Ss.append({'name': f'UNIFORM-{j}', 'headlines': pack([r.randint(1, 9) for _ in words])})
    json.dump(Ss, open(out, 'w'))
def decide(inp, hlfile, out):
    Ss = json.load(open(inp)); M = {s['name']: C.measures(s) for s in Ss}; real = M['REAL']
    sh = {k: [m[k] for n, m in M.items() if n.startswith('SHUFFLED')] for k in real}; un = {k: [m[k] for n, m in M.items() if n.startswith('UNIFORM')] for k in real}
    def p(k): return (1 + sum(v >= real[k] for v in sh[k])) / (S + 1)
    P1, P2 = p('time in Fire'), p('crossings: Fire of Fire (syzygetic)')
    ok = [P1 <= 0.04, P2 <= 0.04]
    ans = 'CONFIRMED' if all(ok) else 'PARTIAL' if any(ok) else 'NOT CONFIRMED'
    res = {'answer': ans, 'P1_timeInFire': {'real': real['time in Fire'], 'p': P1, 'pass': ok[0]},
           'P2_fireOfFireCrossings': {'real': real['crossings: Fire of Fire (syzygetic)'], 'p': P2, 'pass': ok[1]},
           'descriptive': {k: {'real': v, 'shuffledRank': C.rank(v, sh[k]), 'uniformRank': C.rank(v, un[k]),
                               'shuffledMedian': sorted(sh[k])[S // 2], 'uniformMedian': sorted(un[k])[S // 2]} for k, v in real.items()},
           'headlines': json.load(open(hlfile))}
    json.dump(res, open(out, 'w'), indent=1); print('ANSWER:', ans, json.dumps({'P1': res['P1_timeInFire'], 'P2': res['P2_fireOfFireCrossings']}))
if __name__ == '__main__':
    {'prepare': lambda: prepare(*sys.argv[2:5]), 'sessions': lambda: sessions(*sys.argv[2:4]), 'decide': lambda: decide(*sys.argv[2:5])}[sys.argv[1]]()
