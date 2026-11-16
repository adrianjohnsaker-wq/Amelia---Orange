"""CAN-2 R7 driver. Screens seeds in order from --start with cohort_worker.py (no ledgers), up to --max-seeds, and selects the
first --target eligible seeds in seed order (the sealed cohort's stopping rule). Writes seed_S.json.gz and cohort_manifest.json
in the format cohort_analysis.py reads. --from-dir packages existing worker outputs instead of running them."""
import argparse, gzip, json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
H = os.path.dirname(os.path.abspath(__file__)); W = os.path.join(H, 'engine_r7')
def work(seed, out):
    path = os.path.join(out, f'seed_{seed}.json.gz')
    if os.path.exists(path): return seed
    tmp = os.path.join(out, f'w{seed}'); os.makedirs(tmp, exist_ok=True)
    r = subprocess.run([sys.executable, '-B', 'cohort_worker.py', '--seed', str(seed), '--output-dir', tmp, '--no-ledgers'],
                       cwd=W, check=True, capture_output=True, text=True)
    row = json.loads(r.stdout); assert row['seed'] == seed
    with gzip.open(path + '.part', 'wt') as f: json.dump(row, f, sort_keys=True)
    os.replace(path + '.part', path); subprocess.run(['rm', '-rf', tmp], check=True); return seed
def eligible(out, s):
    with gzip.open(os.path.join(out, f'seed_{s}.json.gz'), 'rt') as f: return json.load(f)['eligible']
def main():
    p = argparse.ArgumentParser(); p.add_argument('--start', type=int, required=True); p.add_argument('--max-seeds', type=int, default=600)
    p.add_argument('--target', type=int, default=250); p.add_argument('--workers', type=int, default=4); p.add_argument('--batch', type=int, default=40)
    p.add_argument('--output', required=True); p.add_argument('--from-dir'); a = p.parse_args(); os.makedirs(a.output, exist_ok=True)
    seeds = list(range(a.start, a.start + a.max_seeds)); done = 0; selected = []; non = []; screened = 0
    while done < len(seeds):
        batch = seeds[done:done + a.batch]; done += len(batch)
        if a.from_dir:
            for s in batch:
                row = json.load(open(os.path.join(a.from_dir, f'{s}.json')))
                with gzip.open(os.path.join(a.output, f'seed_{s}.json.gz'), 'wt') as f: json.dump(row, f, sort_keys=True)
        else:
            with ThreadPoolExecutor(a.workers) as ex: list(ex.map(lambda s: work(s, a.output), batch))
        selected = []; non = []; screened = 0
        for s in seeds[:done]:
            screened += 1; (selected if eligible(a.output, s) else non).append(s)
            if len(selected) == a.target: break
        print(f'screened {screened}: {len(selected)} eligible', flush=True)
        if len(selected) == a.target: break
    status = 'complete' if len(selected) == a.target else 'screening_exhausted'
    for s in seeds[screened:]:
        f = os.path.join(a.output, f'seed_{s}.json.gz')
        if os.path.exists(f): os.remove(f)
    m = {'status': status, 'development': False, 'screened': screened, 'selected_seeds': selected, 'noneligible_seeds': non,
         'target': a.target, 'seed_start': a.start, 'seed_maximum': a.max_seeds, 'topology': os.environ.get('CG_TOPOLOGY', 'hybrid')}
    open(os.path.join(a.output, 'cohort_manifest.json'), 'w').write(json.dumps(m, sort_keys=True, indent=2) + '\n'); print(status, screened, len(selected))
if __name__ == '__main__': main()
