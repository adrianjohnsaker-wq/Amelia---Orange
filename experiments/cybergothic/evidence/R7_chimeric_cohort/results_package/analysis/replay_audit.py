"""Independent, isolated replay of selected five-branch populations."""
import argparse
import concurrent.futures
import gzip
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path


def check(seed,lab,run_dir,tmp_root):
    with tempfile.TemporaryDirectory(prefix=f'replay-{seed}-',dir=tmp_root) as folder:
        output=Path(folder)/'row.json';error=Path(folder)/'error.txt'
        with output.open('w') as stdout,error.open('w') as stderr:
            p=subprocess.run([sys.executable,'-S','-B',str(lab/'cohort_worker.py'),
                '--seed',str(seed),'--output-dir',folder],cwd=folder,
                env={'PYTHONDONTWRITEBYTECODE':'1'},stdout=stdout,stderr=stderr,close_fds=True)
        if p.returncode:raise RuntimeError(f'seed {seed}: isolated replay exited {p.returncode}: '+error.read_text()[-2000:])
        with gzip.open(run_dir/f'seed_{seed}.json.gz','rt') as f:original=json.load(f)
        with output.open() as f:replayed=json.load(f)
        for key in ('seed','eligible','graft','pre_state_sha256','pre_shadow_sha256',
                    'natural_matches_original','nonchimeric','clipped_candidates_before_selection'):
            if original[key]!=replayed[key]:raise AssertionError((seed,key))
        branch_checks={}
        for arm,first in original['branches'].items():
            second=replayed['branches'][arm]
            for key in ('state_sha256','event_sha256','shadow_sha256','classification',
                        'homologous_carriers','control','founder_survived','descendant_births',
                        'founder_restricted_lifetime','founder_field_uptake'):
                if first[key]!=second[key]:raise AssertionError((seed,arm,key))
            branch_checks[arm]={'state_sha256':first['state_sha256'],
                                'event_sha256':first['event_sha256'],
                                'shadow_sha256':first['shadow_sha256']}
        if len(branch_checks)!=5:raise AssertionError((seed,'arm count'))
        return {'seed':seed,'status':'pass','branches':branch_checks}


def main():
    p=argparse.ArgumentParser();p.add_argument('--lab',type=Path,required=True)
    p.add_argument('--run-dir',type=Path,required=True);p.add_argument('--output',type=Path,required=True)
    p.add_argument('--workers',type=int,default=3);p.add_argument('--limit',type=int)
    a=p.parse_args();lab=a.lab.resolve();run=a.run_dir.resolve();out=a.output.resolve()
    if a.workers<1 or a.workers>4:raise ValueError('workers must be between 1 and 4')
    manifest=json.loads((run/'cohort_manifest.json').read_text())
    if manifest['status'] not in ('complete','screening_exhausted'):raise ValueError('cohort incomplete')
    seeds=manifest['selected_seeds'][:a.limit] if a.limit else manifest['selected_seeds']
    results=[];failures=[]
    with tempfile.TemporaryDirectory(prefix='junction-replay-root-',dir=out.parent) as tmp:
        with concurrent.futures.ThreadPoolExecutor(max_workers=a.workers) as pool:
            futures={pool.submit(check,seed,lab,run,tmp):seed for seed in seeds}
            for future in concurrent.futures.as_completed(futures):
                seed=futures[future]
                try:results.append(future.result())
                except Exception as exc:failures.append({'seed':seed,'error':str(exc)})
                print('independent replays completed:',len(results)+len(failures),'of',len(seeds),flush=True)
    results.sort(key=lambda r:r['seed']);failures.sort(key=lambda r:r['seed'])
    data={'status':'pass' if not failures and len(results)==len(seeds) else 'fail',
          'populations':len(results),'branches':5*len(results),'failures':failures,'results':results,
          'method':'Fresh credential-free seccomp-isolated workers; compared full primary state, event ledger and shadow hashes, classifications and intervention controls.'}
    out.write_text(json.dumps(data,sort_keys=True,indent=2)+'\n')
    if data['status']!='pass':raise SystemExit('independent replay audit failed')
    print(json.dumps({k:data[k] for k in ('status','populations','branches')}))


if __name__=='__main__':main()
