"""Run the sealed per-row archive checks concurrently, without changing data."""
import argparse
import concurrent.futures
import gzip
import hashlib
import json
import shutil
import sys
import tempfile
from pathlib import Path


def sha(path):
    with path.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()


def check(seed,selected,run_dir,files,metadata):
    from audit_cohort_archive import audit_row
    from experiment import BranchWorld
    from reactor import digest
    from shadow_journal import ShadowJournal
    name=f'seed_{seed}.json.gz';path=run_dir/name
    if sha(path)!=files[name]:raise ValueError(f'hash mismatch {name}')
    with gzip.open(path,'rt') as f:row=json.load(f)
    if row['seed']!=seed or row['eligible']!=selected:raise ValueError(f'eligibility mismatch {seed}')
    if not selected:return {'seed':seed,'eligible':False,'branches':0,'files':1}
    meta=metadata[str(seed)];name=meta['compressed_file'];path=run_dir/name
    if sha(path)!=files[name] or sha(path)!=meta['compressed_sha256']:raise ValueError(f'hash mismatch {name}')
    with tempfile.TemporaryDirectory(prefix=f'junction-archive-{seed}-') as temp:
        db=Path(temp)/'pre_dispatch.sqlite'
        with gzip.open(path,'rb') as source,db.open('wb') as dest:shutil.copyfileobj(source,dest,1024*1024)
        if sha(db)!=meta['uncompressed_sha256']:raise ValueError(f'checkpoint mismatch {seed}')
        journal=ShadowJournal(db);root=journal.load(world_cls=BranchWorld);journal.close()
        if digest(root.snapshot())!=row['pre_state_sha256'] or digest(root.shadow.export())!=row['pre_shadow_sha256']:
            raise ValueError(f'paired root mismatch {seed}')
    branches=audit_row(row)
    if branches!=5:raise ValueError(f'wrong branch count {seed}')
    return {'seed':seed,'eligible':True,'branches':branches,'files':2}


def main():
    p=argparse.ArgumentParser();p.add_argument('--lab',type=Path,required=True)
    p.add_argument('--run-dir',type=Path,required=True);p.add_argument('--output',type=Path,required=True)
    p.add_argument('--workers',type=int,default=3);a=p.parse_args()
    if not 1<=a.workers<=4:raise ValueError('workers must be 1–4')
    sys.path.insert(0,str(a.lab.resolve()));run=a.run_dir.resolve()
    m=json.loads((run/'cohort_manifest.json').read_text())
    if m['status'] not in ('complete','screening_exhausted'):raise ValueError('incomplete run')
    selections={s:True for s in m['selected_seeds']}
    for s in m['noneligible_seeds']:
        if s in selections:raise ValueError('seed counted twice')
        selections[s]=False
    if len(selections)!=m['screened']:raise ValueError('screened count mismatch')
    results=[];failures=[]
    with concurrent.futures.ProcessPoolExecutor(max_workers=a.workers) as pool:
        jobs={pool.submit(check,s,yes,run,m['files_sha256'],m['checkpoint_metadata']):s
              for s,yes in sorted(selections.items())}
        for future in concurrent.futures.as_completed(jobs):
            seed=jobs[future]
            try:results.append(future.result())
            except Exception as exc:failures.append({'seed':seed,'error':str(exc)})
            print('archive populations checked:',len(results)+len(failures),'of',len(selections),flush=True)
    results.sort(key=lambda x:x['seed']);failures.sort(key=lambda x:x['seed'])
    branches=sum(x['branches'] for x in results);files=sum(x['files'] for x in results)
    status='pass' if not failures and len(results)==len(selections) and files==len(m['files_sha256']) else 'fail'
    out={'status':status,'manifest_files':files,'populations':sum(x['eligible'] for x in results),
         'screened_populations':len(results),'branches':branches,'failures':failures,'details':results,
         'method':'Sealed audit_row and checkpoint verification, executed in independent local processes.'}
    a.output.write_text(json.dumps(out,sort_keys=True,indent=2)+'\n')
    print(json.dumps({k:out[k] for k in ('status','manifest_files','populations','branches')}))
    if status!='pass':raise SystemExit('archive audit failed')


if __name__=='__main__':main()
