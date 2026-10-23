"""Studio 04: the code that writes itself.
The same world (tape) is lived again and again. Each pass begins with an inherited code V and ends with the code its
history produced. The loop feeds the end back into the beginning: V_{n+1} = F(V_n). A self-consistent history is a fixed
point V* = F(V*): the code at the origin is exactly the code the history creates. Pass 0 starts from nothing (V = 0).
"""
import json, os, subprocess, sys
ST = sys.argv[1]; OUT = sys.argv[2]; ITERS = int(sys.argv[3]); TICKS = sys.argv[4]; K = 9
EDGES = ['0>9', '1>8', '2>7', '3>6', '4>5', '1>2', '2>4', '4>7', '7>8', '8>9', '9>1']
os.makedirs(OUT, exist_ok=True)
log_path = f'{OUT}/loop_log.json'
log = json.load(open(log_path)) if os.path.exists(log_path) else []
V = log[-1]['Vend'] if log else [{e: 0.0 for e in EDGES} for _ in range(K)]
for n in range(len(log), len(log) + ITERS):
    vin = f'{OUT}/V_{n}.json'; json.dump(V, open(vin, 'w'))
    res = f'{OUT}/run_{n}.json'
    subprocess.run(['node', '--experimental-strip-types', '--no-warnings', f'{ST}/bootstrap_run.mjs', f'{ST}/m', 'learner', str(K), TICKS, 'LOOP', res, vin],
                   check=True, stdout=subprocess.DEVNULL)
    lin = json.load(open(res))['lineages']
    Vend = [l['finalVFull'] for l in lin]
    dist = [max(abs(Vend[k][e] - V[k][e]) for e in EDGES) for k in range(K)]
    rec = {'pass': n, 'Vstart': V, 'Vend': Vend, 'maxChange': dist, 'traces': [l['traceSha256'] for l in lin],
           'deaths': [len(l['lives']) for l in lin], 'firstLife': [l['lives'][0]['length'] if l['lives'] else None for l in lin]}
    log.append(rec); json.dump(log, open(log_path, 'w'))
    os.remove(res)
    print(n, 'deaths', sum(rec['deaths']), 'max change', round(max(dist), 6), 'first lives', rec['firstLife'], flush=True)
    V = Vend
