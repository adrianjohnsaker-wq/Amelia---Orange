"""Studio 04b: causal assay of the anticipatory scar.
World LOOP (the world the loop converged in) and four unseen worlds. Codes: zero, V* (converged), and interventions.
Every run: 9 lineages x 20,160 ticks with the PF-2 receiver, starting from the given code."""
import json, os, subprocess, sys, statistics as st
ST = sys.argv[1]; OUT = f'{ST}/scar'; os.makedirs(OUT, exist_ok=True)
E = ['0>9', '1>8', '2>7', '3>6', '4>5', '1>2', '2>4', '4>7', '7>8', '8>9', '9>1']
Vstar = json.load(open(f'{ST}/loop/loop_log.json'))[-1]['Vend']
zero = [{e: 0.0 for e in E} for _ in range(9)]

def run(name, codes, world):
    vin = f'{OUT}/{name}_{world}_V.json'; json.dump(codes, open(vin, 'w')); res = f'{OUT}/{name}_{world}.json'
    subprocess.run(['node', '--experimental-strip-types', '--no-warnings', f'{ST}/bootstrap_run.mjs', f'{ST}/m', 'learner', '9', '20160', world, res, vin],
                   check=True, stdout=subprocess.DEVNULL)
    lin = json.load(open(res))['lineages']
    z4 = [l['choice']['4'] for l in lin]
    visits4 = sum(c['cuedPit'] + c['cuedOther'] + c['uncued'] for c in z4)
    resid = [max(abs(l['finalVFull'][e] - codes[k][e]) for e in E) for k, l in enumerate(lin)]
    return {'deaths': [len(l['lives']) for l in lin], 'zone4Visits': visits4, 'traces': [l['traceSha256'] for l in lin],
            'maxResidual': resid}

def with_edge(codes, e, val):
    return [{**c, e: (val(c, k) if callable(val) else val)} for k, c in enumerate(codes)]

out = {}
base = run('Vstar', Vstar, 'LOOP'); out['V* in its own world'] = base
out['naive (zero code)'] = run('zero', zero, 'LOOP')
out['erase scar: V* with 4>5 = 0'] = run('erase', with_edge(Vstar, '4>5', 0.0), 'LOOP')
out['transplant scar: zero code + V*(4>5)'] = run('transplant', [{**zero[k], '4>5': Vstar[k]['4>5']} for k in range(9)], 'LOOP')
dorm = run('dormant', with_edge(Vstar, '3>6', 0.9), 'LOOP')
dorm['sameTraceAsVstar'] = [a == b for a, b in zip(dorm['traces'], base['traces'])]; out['dormant: V* with 3>6 = 0.9'] = dorm
out['close the approach: V* with 2>4 = -0.4'] = run('close', with_edge(Vstar, '2>4', -0.4), 'LOOP')
out['open the approach: V* with 2>4 = +0.2'] = run('open', with_edge(Vstar, '2>4', 0.2), 'LOOP')
for w in ('W1', 'W2', 'W3', 'W4'):
    out[f'V* in unseen world {w}'] = run('Vstar', Vstar, w)
    out[f'naive in unseen world {w}'] = run('zero', zero, w)
json.dump(out, open(f'{OUT}/scar_assay.json', 'w'), indent=1)
for k, v in out.items():
    extra = f" sameTrace={sum(v['sameTraceAsVstar'])}/9" if 'sameTraceAsVstar' in v else ''
    print(f"{k:45s} deaths {sum(v['deaths']):3d} {v['deaths']}  zone-4 visits {v['zone4Visits']:4d}  max residual {max(v['maxResidual']):.3f}{extra}")
