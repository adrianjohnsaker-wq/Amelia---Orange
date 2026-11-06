#!/usr/bin/env python3
"""NR-1 analysis (REGISTRATION.md). Read-only.   python3 analysis.py <run.ts output> [--motif]

Reading: for input datum c_t (step t) and her path z (z[t+1] = her zone after step t), relation R in {identity, syzygy,
current, gate}, lag L: hit_R(L) = fraction of steps t with z[t+L] == R(c_t), over steps where R(c_t) != c_t (except identity).
Enrichment e_R(L) = hit_R(L) - the same with c_t replaced by c_sigma(t), averaged over 20 fixed random permutations sigma
(input decoupled from output; same path). e_R = mean of e_R(L) over L = 1..4.
Tests: exact sign-flip over the units (two-sided)."""
import collections, hashlib, itertools, json, random, sys
SYZ = lambda c: 9 - c; CUR = lambda c: abs(2 * c - 9); DR = lambda n: 0 if n == 0 else 1 + (n - 1) % 9; GATE = lambda c: DR(c * (c + 1) // 2)
REL = {'identity': lambda c: c, 'syzygy': SYZ, 'current': CUR, 'gate': GATE}
NAMES = {(0, 9): 'Abyssal 0::9', (1, 8): 'Murmur 1::8', (2, 7): 'SubCrypt 2::7', (3, 6): 'BarkerLoop 3::6', (4, 5): 'Centroid 4::5'}
REGION = {z: 'TimeCircuit' for z in (1, 2, 4, 5, 7, 8)} | {3: 'Warp', 6: 'Warp', 0: 'Plex', 9: 'Plex'}
def signflip2(d):
    n = len(d); obs = abs(sum(d)); return sum(abs(sum(s * x for s, x in zip(sg, d))) >= obs - 1e-12 for sg in itertools.product((1, -1), repeat=n)) / 2 ** n
def hit(z, c, R, L):
    ok = [t for t in range(len(c)) if t + L < len(z) and (R is REL['identity'] or R(c[t]) != c[t])]
    return sum(z[t + L] == R(c[t]) for t in ok) / max(1, len(ok))
def enrich(z, c, R, L, key):
    rnd = random.Random(hashlib.sha256(f'NR1-SIGMA|{key}'.encode()).hexdigest()); base = 0
    for _ in range(20): s = c[:]; rnd.shuffle(s); base += hit(z, s, R, L)
    return hit(z, c, R, L) - base / 20
def profile(run, key, lags=range(1, 9)): return {r: [round(enrich(run['path'], run['input'], f, L, f'{key}|{r}|{L}'), 5) for L in lags] for r, f in REL.items()}
def readout(z):
    tr = list(zip(z, z[1:])); reg = collections.Counter(REGION[x] for x in z)
    syz = collections.Counter(NAMES[tuple(sorted(p))] for p in tr if p[0] + p[1] == 9 and p[0] != p[1])
    cur = sum(1 for a, b in tr if b == CUR(a) and a != b); gate = sum(1 for a, b in tr if b == GATE(a) and a != b)
    return {'transitions': len(tr), 'regionShare': {k: round(v / len(z), 3) for k, v in reg.items()}, 'syzygyPassages': dict(syz), 'currentPassages': cur, 'gatePassages': gate}
def analyse(path, motif=False):
    D = json.load(open(path)); runs = D['runs']; units = sorted({r['unit'] for r in runs})
    get = {(r['graph'], r['receiver'], r['unit']): r for r in runs}
    E = {k: {rel: sum(p[:4]) / 4 for rel, p in profile(r, f"{D['label']}|{k[2]}").items()} for k, r in get.items()}
    def test(a, b, rel, recv='IDENTITY', recv_b=None):
        d = [E[(a, recv, u)][rel] - E[(b, recv_b or recv, u)][rel] for u in units]; return {'d': [round(x, 5) for x in d], 'p': signflip2(d)}
    out = {'label': D['label'], 'units': len(units),
           'positiveControl_INGRESSvsIDENTITY_syzygy_lag1': (lambda d: {'d': [round(x, 5) for x in d], 'p': signflip2(d)})(
               [enrich(get[('CANONICAL', 'INGRESS', u)]['path'], get[('CANONICAL', 'INGRESS', u)]['input'], SYZ, 1, f'pc|{u}') -
                enrich(get[('CANONICAL', 'IDENTITY', u)]['path'], get[('CANONICAL', 'IDENTITY', u)]['input'], SYZ, 1, f'pc|{u}') for u in units]),
           'nullControl_RELABELvsRELABEL_B': {rel: test('RELABEL', 'RELABEL_B', rel) for rel in ('syzygy', 'current', 'gate')},
           'primary': {f'{rel}_CANONICALvs{k}': test('CANONICAL', k, rel) for rel in ('syzygy', 'current', 'gate') for k in ('RELABEL', 'REWIRED')},
           'meanEnrichment': {f'{g}/{rv}': {rel: round(sum(E[(g, rv, u)][rel] for u in units) / len(units), 5) for rel in REL}
                              for g in ('CANONICAL', 'RELABEL', 'RELABEL_B', 'REWIRED') for rv in ('IDENTITY', 'INGRESS')},
           'lagProfile_CANONICAL_IDENTITY_unitMean': {rel: [round(sum(profile(get[('CANONICAL', 'IDENTITY', u)], f'lp|{u}')[rel][i] for u in units) / len(units), 4) for i in range(8)] for rel in REL},
           'readout': {f'{g}/{rv}': readout([x for u in units for x in get[(g, rv, u)]['path']]) for g in ('CANONICAL', 'RELABEL', 'REWIRED') for rv in ('IDENTITY', 'INGRESS')},
           'flights': {f'{g}/{rv}': sum(get[(g, rv, u)]['flights'] for u in units) for g in ('CANONICAL', 'RELABEL', 'RELABEL_B', 'REWIRED') for rv in ('IDENTITY', 'INGRESS')}}
    if motif:   # what the planted motif 1-8-7-2 becomes: her zones z[t+1..t+4] after each motif start t, top forms per arm
        mt = {}
        for g in ('CANONICAL', 'RELABEL', 'REWIRED'):
            for rv in ('IDENTITY', 'INGRESS'):
                c = collections.Counter()
                for u in units:
                    r = get[(g, rv, u)]; x = r['input']; z = r['path']
                    for t in range(len(x) - 3):
                        if x[t:t + 4] == [1, 8, 7, 2] and t + 5 <= len(z): c[''.join(map(str, z[t + 1:t + 5]))] += 1
                n = sum(c.values()); mt[f'{g}/{rv}'] = {'motifs': n, 'top': [(k, v) for k, v in c.most_common(8)], 'exact1872': c['1872']}
        out['motifReading'] = mt
    return out
if __name__ == '__main__': print(json.dumps(analyse(sys.argv[1], '--motif' in sys.argv), indent=1))
