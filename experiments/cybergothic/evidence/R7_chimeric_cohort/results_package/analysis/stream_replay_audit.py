"""Replay completed populations while the sealed sequential runner continues.

This never screens new seeds. It schedules only a population whose saved row
and checkpoint were completed by the sealed runner. The last observed seed is
deferred until the next seed or final manifest exists, avoiding partial files.
"""
import argparse
import concurrent.futures
import json
import sys
import tempfile
import time
from pathlib import Path

from replay_audit import check


def main():
    p=argparse.ArgumentParser();p.add_argument('--lab',type=Path,required=True)
    p.add_argument('--run-dir',type=Path,required=True);p.add_argument('--output',type=Path,required=True)
    p.add_argument('--workers',type=int,default=3);a=p.parse_args()
    if not 1<=a.workers<=4:raise ValueError('workers must be 1–4')
    lab=a.lab.resolve();run=a.run_dir.resolve();out=a.output.resolve()
    sys.path.insert(0,str(lab));from cohort import checked_seal
    checked_seal(lab)
    scheduled=set();futures={};results=[];failures=[];final=None
    with tempfile.TemporaryDirectory(prefix='junction-stream-replay-',dir=out.parent) as tmp:
      with concurrent.futures.ThreadPoolExecutor(max_workers=a.workers) as pool:
       while True:
        manifest=run/'cohort_manifest.json'
        if manifest.exists():
            final=json.loads(manifest.read_text())
            if final['status'] not in ('complete','screening_exhausted'):raise ValueError('runner not complete')
            completed=set(final['selected_seeds']+final['noneligible_seeds'])
        else:
            observed=sorted(int(p.name.split('_')[1].split('.')[0]) for p in run.glob('seed_*.json.gz'))
            completed=set(observed[:-1])
        for seed in sorted(completed-scheduled):
            scheduled.add(seed)
            if (run/f'pre_dispatch_{seed}.sqlite.gz').is_file():
                futures[pool.submit(check,seed,lab,run,tmp)]=seed
        finished=[f for f in futures if f.done()]
        for f in finished:
            seed=futures.pop(f)
            try:results.append(f.result())
            except Exception as exc:failures.append({'seed':seed,'error':str(exc)})
            if (len(results)+len(failures))%10==0:
                print('independent replays completed:',len(results)+len(failures),flush=True)
        if final is not None and not futures and scheduled==completed:break
        time.sleep(2)
    results.sort(key=lambda r:r['seed']);failures.sort(key=lambda r:r['seed'])
    expected=set(final['selected_seeds']);actual={r['seed'] for r in results}
    status='pass' if not failures and actual==expected else 'fail'
    data={'status':status,'populations':len(results),'branches':5*len(results),'failures':failures,'results':results,
          'method':'Fresh credential-free seccomp-isolated workers; compared primary-state, complete event-ledger and shadow hashes, classifications and controls. Replayed only already-completed seeds.'}
    out.write_text(json.dumps(data,sort_keys=True,indent=2)+'\n')
    print(json.dumps({k:data[k] for k in ('status','populations','branches')}),flush=True)
    if status!='pass':raise SystemExit('independent replay audit failed')


if __name__=='__main__':main()
