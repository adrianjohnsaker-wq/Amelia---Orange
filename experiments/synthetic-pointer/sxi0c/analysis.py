#!/usr/bin/env python3
"""SXI-0 controls analysis (see REGISTRATION.md). Read-only; reads <dir>/<ARM>_<seed>.metrics.json.
  python3 analysis.py <dir>
"""
import collections, glob, itertools, json, sys
ARMS = ['SHAM', 'WITHHELD', 'PLANT', 'NULLNOISE', 'POINTER_A', 'POINTER_B']
LOOP = {(1, 8), (8, 9), (9, 1)}
def signflip(d):                                    # exact one-sided: P(sum >= observed) over all 2^n sign vectors
    n = len(d); obs = sum(d); ge = 0
    for signs in itertools.product((1, -1), repeat=n): ge += sum(s * x for s, x in zip(signs, d)) >= obs - 1e-12
    return ge / 2 ** n
def load(src):
    R = collections.defaultdict(dict)
    for f in glob.glob(f'{src}/*.metrics.json'):
        m = json.load(open(f)); R[m['arm']][m['seed']] = m
    return R
def per_run(m):
    rows = m['rows']; n = len(rows)
    dec = collections.Counter(x for r in rows for x in r['dec'])
    decisive = sum(r['noAttn'] != r['to'] for r in rows)
    loop = sum((r['from'], r['to']) in LOOP for r in rows)
    z7w = sum(r['to'] == 7 for r in rows if 50 <= r['step'] - 1 <= 249); z7p = sum(r['to'] == 7 for r in rows if r['step'] - 1 >= 250)
    zones = collections.Counter(r['to'] for r in rows)
    return {'n': n, 'dec': dict(dec), 'attendRate': dec['ATTEND'] / max(1, sum(dec.values())), 'decisiveRate': decisive / n,
            'loopShare': loop / n, 'z7window': z7w, 'z7post': z7p, 'zones': [zones[z] for z in range(10)],
            'path': [(r['from'], r['to']) for r in rows]}
def main(src):
    R = load(src); seeds = sorted(R['SHAM']); P = {a: {s: per_run(R[a][s]) for s in seeds if s in R[a]} for a in ARMS}
    assert all(len(P[a]) == len(seeds) for a in ARMS), {a: len(P[a]) for a in ARMS}
    out = {'seeds': seeds}
    # sensitivity
    sens = {}
    for a in ('SHAM', 'PLANT', 'NULLNOISE', 'POINTER_A', 'POINTER_B', 'WITHHELD'):
        x = list(P[a].values()); tot = collections.Counter()
        for r in x: tot.update(r['dec'])
        sens[a] = {'dispositions': dict(tot), 'attendRate': round(sum(r['attendRate'] for r in x) / len(x), 4),
                   'decisiveRate': round(sum(r['decisiveRate'] for r in x) / len(x), 4), 'loopShare': round(sum(r['loopShare'] for r in x) / len(x), 4)}
    out['sensitivity'] = sens
    div = []
    for s in seeds:
        a, b = P['SHAM'][s]['path'], P['WITHHELD'][s]['path']
        diff = [i for i in range(min(len(a), len(b))) if a[i] != b[i]]
        div.append({'seed': s, 'firstDifferentStep': (diff[0] + 1) if diff else None, 'shareDifferent': round(len(diff) / len(a), 4)})
    out['withheldVsSham'] = div
    flags = []
    if sens['SHAM']['decisiveRate'] < 0.01: flags.append('DECISIVE<1%: the body signal does not steer her')
    if sens['SHAM']['loopShare'] > 0.5: flags.append('LOOP>50%: locked in 1-8-9')
    out['flags'] = flags
    # seed independence
    paths = [tuple(P['SHAM'][s]['path']) for s in seeds]; pairs = []
    for i, j in itertools.combinations(range(len(seeds)), 2):
        pairs.append(sum(x == y for x, y in zip(paths[i], paths[j])) / len(paths[i]))
    distinct = len(set(paths))
    out['seedIndependence'] = {'distinctShamPaths': distinct, 'meanPairwiseIdentical': round(sum(pairs) / len(pairs), 4), 'maxPairwiseIdentical': round(max(pairs), 4)}
    valid = distinct == len(seeds)
    # controls
    d_plant = [P['PLANT'][s]['z7window'] - P['SHAM'][s]['z7window'] for s in seeds]
    d_null = [P['NULLNOISE'][s]['z7window'] - P['SHAM'][s]['z7window'] for s in seeds]
    p_plant, p_null = signflip(d_plant), signflip(d_null)
    pos = p_plant <= 0.01 and sum(x > 0 for x in d_plant) >= 10
    out['positiveControl'] = {'d': d_plant, 'p': round(p_plant, 5), 'positiveSeeds': sum(x > 0 for x in d_plant), 'post250': [P['PLANT'][s]['z7post'] - P['SHAM'][s]['z7post'] for s in seeds], 'pass': pos}
    out['nullControl'] = {'d': d_null, 'p': round(p_null, 5), 'pass': p_null > 0.05}
    # pointers, descriptive: L1 distance of zone-visit distribution from SHAM; within-seed exact permutation of A/B labels
    l1 = lambda u, v: sum(abs(a - b) for a, b in zip(u, v))
    out['pointers'] = {a: [l1(P[a][s]['zones'], P['SHAM'][s]['zones']) for s in seeds] for a in ('POINTER_A', 'POINTER_B', 'NULLNOISE')}
    dab = [l1(P['POINTER_A'][s]['zones'], P['SHAM'][s]['zones']) - l1(P['POINTER_B'][s]['zones'], P['SHAM'][s]['zones']) for s in seeds]
    out['pointers']['A_minus_B_signflip_p'] = round(min(signflip(dab), signflip([-x for x in dab])) * 2, 5)
    out['validAtNominalLevel'] = valid
    out['verdict'] = {'positiveControl': 'PASS' if pos else 'FAIL', 'nullControl': 'PASS' if p_null > 0.05 else 'FAIL',
                      'seedsIndependent': valid, 'flags': flags}
    return out
if __name__ == '__main__': print(json.dumps(main(sys.argv[1]), indent=1))
