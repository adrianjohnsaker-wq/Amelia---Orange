"""CAN-2 analysis. Usage: analyse.py R1_DIR R2_DIR R3_DIR R7_DIR OUT.json
R1-R3: seed-weighted paired means (mean within seed, then across seeds), 10,000-draw seed-cluster percentile bootstrap,
levels as each original protocol planned. R7: cohort_analysis.py's own analysis.json, plus founder-survival paired contrasts
(population-paired bootstrap, 95%). Each study's original estimate is carried alongside for comparison."""
import glob, gzip, json, os, random, sys
def seeds(d): return [json.load(open(p)) for p in sorted(glob.glob(os.path.join(d, 'seed_*.json')))]
def boot(vals, level, seed):
    rng = random.Random(seed); k = len(vals); n = 10000
    bs = sorted(sum(rng.choice(vals) for _ in range(k)) / k for _ in range(n)); a = (1 - level) / 2
    return bs[int(a * n)], bs[int((1 - a) * n) - 1]
def contrast(S, f, a, b, level, original, seed=20261116):
    means = []; enc = 0
    for s in S:
        d = [f(t['outcomes'][a]) - f(t['outcomes'][b]) for t in s['trials']]
        if d: means.append(sum(d) / len(d)); enc += len(d)
    if not means: return {'contrast': f'{a} - {b}', 'estimate': float('nan'), 'interval': [float('nan')] * 2, 'level': level, 'seeds': 0, 'encounters': 0, 'excludes_zero': False, 'original': original}
    m = sum(means) / len(means); lo, hi = boot(means, level, seed)
    return {'contrast': f'{a} - {b}', 'estimate': m, 'interval': [lo, hi], 'level': level, 'seeds': len(means), 'encounters': enc,
            'excludes_zero': lo > 0 or hi < 0, 'original': original}
def count(S, f, a): return sum(bool(f(t['outcomes'][a])) for s in S for t in s['trials'])
def armmean(S, f, a):
    ms = [sum(f(t['outcomes'][x]) for t in s['trials'] for x in [a]) / len(s['trials']) for s in S if s['trials']]; return sum(ms) / len(ms)
R = {'schema': 'CG_CAN2_RESULT_V1', 'topology': os.environ.get('CG_TOPOLOGY', 'unstated')}
S = seeds(sys.argv[1]); fi = lambda o: o['first_intake'] or 0.0
R['R1'] = {'populations': len(S), 'encounters': sum(len(s['trials']) for s in S), 'primary': [
    contrast(S, fi, 'experienced', 'pointer', 0.975, '+0.00564 (+0.00108 to +0.01034)'),
    contrast(S, fi, 'experienced', 'shuffled', 0.975, '+0.00683 (+0.00272 to +0.01098)')],
  'secondary_95': [contrast(S, lambda o: o['nutrient'], 'experienced', 'pointer', 0.95, 'interval included 0'),
    contrast(S, lambda o: o['nutrient'], 'experienced', 'shuffled', 0.95, 'interval included 0'),
    contrast(S, lambda o: float(o['survived']), 'experienced', 'pointer', 0.95, 'interval included 0'),
    contrast(S, lambda o: float(o['survived']), 'experienced', 'shuffled', 0.95, 'interval included 0')],
  'arms': {a: {'first_action_uptake': armmean(S, fi, a), 'survived': count(S, lambda o: o['survived'], a)} for a in ('experienced', 'pointer', 'shuffled')}}
S = seeds(sys.argv[2]); tp = lambda o: o['timepoints']['24']
ret = lambda o: float(bool(tp(o)['original_intact'] if o['arm'] == 'natural' else tp(o)['intact'])); up = lambda o: tp(o)['uptake']
R['R2'] = {'populations': len(S), 'encounters': sum(len(s['trials']) for s in S), 'primary': [
    contrast(S, ret, 'experienced_echo', 'natural', 0.975, '+0.3125 (+0.2236 to +0.4056)'),
    contrast(S, up, 'experienced_echo', 'shuffled_echo', 0.975, '+0.0193 (-0.0407 to +0.0775)')],
  'secondary_95': [contrast(S, lambda o: float(tp(o)['alive']), 'experienced_echo', 'shuffled_echo', 0.95, '155 vs 156 of 235')],
  'arms': {a: {'uptake24': armmean(S, up, a), 'alive24': count(S, lambda o: tp(o)['alive'], a)} for a in ('natural', 'experienced_echo', 'shuffled_echo')}}
S = seeds(sys.argv[3])
R['R3'] = {'populations': len(S), 'encounters': sum(len(s['trials']) for s in S), 'primary': [
    contrast(S, up, 'zone', 'open', 0.9833, '-0.0820 (-0.1603 to -0.0070)'),
    contrast(S, up, 'zone', 'rotated', 0.9833, '-0.0049 (-0.0908 to +0.0701)'),
    contrast(S, up, 'zone', 'zone_shuffled', 0.9833, '+0.0020 (-0.0470 to +0.0527)')],
  'secondary_95': [contrast(S, lambda o: float(tp(o)['alive']), 'zone', 'open', 0.95, '-10.0 to +1.67 pp'),
    contrast(S, up, 'syzygy', 'zone', 0.95, '+0.0185 (-0.0205 to +0.0565)')],
  'arms': {a: {'uptake24': armmean(S, up, a), 'alive24': count(S, lambda o: tp(o)['alive'], a),
               'payload_actions_per_recipient': sum(tp(t['outcomes'][a])['payload_actions'] for s in S for t in s['trials']) / max(1, sum(len(s['trials']) for s in S))}
           for a in ('open', 'zone', 'rotated', 'zone_shuffled', 'syzygy')}}
D = sys.argv[4]; M = json.load(open(os.path.join(D, 'cohort_manifest.json')))
rows = [json.load(gzip.open(os.path.join(D, f'seed_{s}.json.gz'), 'rt')) for s in M['selected_seeds']]
def paired(a, b, original, seed=20261116):
    d = [float(r['branches'][a]['founder_survived']) - float(r['branches'][b]['founder_survived']) for r in rows]
    lo, hi = boot(d, 0.95, seed)
    return {'contrast': f'{a} - {b} founder survival', 'estimate': sum(d) / len(d), 'interval': [lo, hi], 'level': 0.95,
            'populations': len(d), 'excludes_zero': lo > 0 or hi < 0, 'original': original}
R['R7'] = {'manifest': {k: M[k] for k in ('status', 'screened', 'target', 'seed_start')}, 'populations': len(rows),
  'cohort_analysis': json.load(open(os.path.join(D, 'analysis.json'))),
  'survival': {a: sum(bool(r['branches'][a]['founder_survived']) for r in rows) for a in ('natural', 'recipient_active', 'ruptured_08', 'ruptured_00', 'scramble')},
  'survival_contrasts': [paired('natural', 'recipient_active', '+10.4 pp (+3.2 to +17.6), exploratory'),
    paired('natural', 'ruptured_08', '+5.6 pp (-1.2 to +12.4)')],
  'deliveries': sum(r['branches']['natural']['classification']['verified_viral_delivery_events'] for r in rows),
  'recipient_hosts': sum(r['branches']['natural']['classification']['unique_viral_recipients'] for r in rows),
  'populations_with_delivery': sum(r['branches']['natural']['classification']['verified_viral_delivery_events'] > 0 for r in rows)}
def verdict(c, sign):
    if c['estimate'] != c['estimate']: return 'VOID'
    lo, hi = c['interval']; return 'HOLDS' if (lo > 0 if sign > 0 else hi < 0) else 'DOES NOT HOLD'
R['verdicts'] = {'R1 first action vs pointer': verdict(R['R1']['primary'][0], 1), 'R1 first action vs shuffled': verdict(R['R1']['primary'][1], 1),
    'R2 retention, echo - natural': verdict(R['R2']['primary'][0], 1), 'R3 zone - open uptake (negative)': verdict(R['R3']['primary'][0], -1),
    'R7 natural - recipient_active survival': verdict(R['R7']['survival_contrasts'][0], 1)}
open(sys.argv[5], 'w').write(json.dumps(R, sort_keys=True, indent=2) + '\n')
for k in ('R1', 'R2', 'R3'):
    for c in R[k]['primary']: print(k, c['contrast'], f"{c['estimate']:+.5f} [{c['interval'][0]:+.5f}, {c['interval'][1]:+.5f}]", '| original', c['original'])
for c in R['R7']['survival_contrasts']: print('R7', c['contrast'], f"{100*c['estimate']:+.1f} pp [{100*c['interval'][0]:+.1f}, {100*c['interval'][1]:+.1f}]", '| original', c['original'])
[print('VERDICT', k, v) for k, v in R['verdicts'].items()]
print('R7 deliveries', R['R7']['deliveries'], 'hosts', R['R7']['recipient_hosts'], 'populations', R['R7']['populations_with_delivery'], '| survival', R['R7']['survival'])
