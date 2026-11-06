#!/usr/bin/env python3
"""RC-2 calibration on world data first seen BEFORE the seal (REGISTRATION.md).
  python3 calibrate.py <world-live dir> <window start ISO> <window end ISO> <outdir>"""
import hashlib, json, random, subprocess, sys, pathlib, datetime
HERE = pathlib.Path(__file__).resolve().parent; sys.path.insert(0, str(HERE))
sys.path.insert(0, str(HERE.parent / 'agentic')); from epoch import items as load_items; from stats import epochs_data; from stats2 import rc2
live, start, end, out = sys.argv[1:5]; O = pathlib.Path(out); O.mkdir(parents=True, exist_ok=True)
it = [x for x in load_items(live, start) if x['seenAt'] <= end]
t0 = datetime.datetime.strptime(start, '%Y-%m-%dT%H:%M:%SZ'); t1 = datetime.datetime.strptime(end, '%Y-%m-%dT%H:%M:%SZ')
grid = []; t = t0
while t < t1: grid.append(t.strftime('%Y-%m-%dT%H:%M:%SZ')); t += datetime.timedelta(hours=1)
def sim_log(seed):
    r = random.Random(seed); return [{'e': i, 'T': T, 'X': r.randint(1, 9), 'arm': r.choice(['APPLY', 'SHAM'])} for i, T in enumerate(grid)]
res = {'window': [start, end], 'data': len(it), 'epochs': len(grid)}
# RC-2: 100 candidates on the window with one simulated log
lg = [{'e': x['e'], 'T': x['T']} for x in sim_log('RC2-CAL')]; json.dump(it, open(O / 'items.json', 'w')); json.dump(lg, open(O / 'log.json', 'w'))
def batch(items_file, tag, plant=None):
    ps = []
    for a in (0, 25, 50, 75):
        cmd = ['node', '--import', 'tsx', str(HERE / 'batch2.ts'), str(items_file), str(O / 'log.json'), str(a), str(a + 25), end, str(O / f'{tag}_z{a}.json')]
        if plant and a <= plant[0] < a + 25: cmd += [str(plant[0]), str(plant[1]), plant[2], str(O / f'{tag}_used.json')]
        ps.append(subprocess.Popen(cmd))
    assert all(p.wait() == 0 for p in ps)
    Z = {}; [Z.update({int(k): v for k, v in json.load(open(O / f'{tag}_z{a}.json')).items()}) for a in (0, 25, 50, 75)]; return Z
Z = batch(O / 'items.json', 'null'); D = epochs_data(it, lg, end)
nullp = [rc2(D, Z, L)['p'] for L in range(100)]
res['RC2'] = {'distinctPaths': len({tuple(z) for z in Z.values()}), 'null_rate_p_le_0.05': sum(p <= 0.05 for p in nullp) / 100, 'positive': []}
print('RC2 null', res['RC2'], flush=True)
for L in (11, 47, 83):
    for f in (0.05, 0.10):
        tag = f'pl{L}_{f}'; batch(O / 'items.json', tag + 'a', plant=(L, f, f'RC2-PLANT-{L}-{f}'))   # live L hears a world that answers its zPre
        used = json.load(open(O / f'{tag}a_used.json')); it2 = [dict(x, zone=z) for x, z in zip(it, used)]
        json.dump(it2, open(O / f'{tag}_items.json', 'w')); Z2 = batch(O / f'{tag}_items.json', tag + 'b')   # every candidate hears that same world
        r = rc2(epochs_data(it2, lg, end), Z2, L); res['RC2']['positive'].append({'L': L, 'frac': f, 'p': r['p'], 'A_live': r['A_live'], 'A_yoked_mean': r['A_yoked_mean']})
        print('RC2 plant', L, f, r['p'], flush=True)
json.dump(res, open(O / 'CALIBRATION.json', 'w'), indent=1)
