"""Audit completed sealed-run files while screening continues, then bind the manifest."""
import argparse
import concurrent.futures
import gzip
import hashlib
import json
import sys
import time
from pathlib import Path

from parallel_archive_audit import check,sha


def check_before_manifest(seed,run):
    row_name=f'seed_{seed}.json.gz';row_path=run/row_name
    files={row_name:sha(row_path)};checkpoint_name=f'pre_dispatch_{seed}.sqlite.gz'
    checkpoint=run/checkpoint_name;selected=checkpoint.is_file();metadata={}
    if selected:
        compressed=sha(checkpoint);files[checkpoint_name]=compressed;h=hashlib.sha256()
        with gzip.open(checkpoint,'rb') as f:
            for chunk in iter(lambda:f.read(1024*1024),b''):h.update(chunk)
        metadata[str(seed)]={'compressed_file':checkpoint_name,'compressed_sha256':compressed,
                             'uncompressed_sha256':h.hexdigest()}
    result=check(seed,selected,run,files,metadata)
    result['observed_file_sha256']=files
    if selected:result['observed_checkpoint']=metadata[str(seed)]
    return result


def main():
    p=argparse.ArgumentParser();p.add_argument('--lab',type=Path,required=True)
    p.add_argument('--run-dir',type=Path,required=True);p.add_argument('--output',type=Path,required=True)
    p.add_argument('--workers',type=int,default=2);a=p.parse_args()
    if not 1<=a.workers<=4:raise ValueError('workers must be 1–4')
    lab=a.lab.resolve();run=a.run_dir.resolve();sys.path.insert(0,str(lab))
    from cohort import checked_seal
    checked_seal(lab);scheduled=set();results=[];failures=[];futures={};final=None
    with concurrent.futures.ProcessPoolExecutor(max_workers=a.workers) as pool:
      while True:
        manifest=run/'cohort_manifest.json'
        if manifest.exists():
            try:final=json.loads(manifest.read_text())
            except json.JSONDecodeError:
                time.sleep(1);continue
            if final['status'] not in ('complete','screening_exhausted'):raise ValueError('runner incomplete')
            completed=set(final['selected_seeds']+final['noneligible_seeds'])
        else:
            observed=sorted(int(p.name.split('_')[1].split('.')[0]) for p in run.glob('seed_*.json.gz'))
            completed=set(observed[:-1])
        for seed in sorted(completed-scheduled):
            scheduled.add(seed);futures[pool.submit(check_before_manifest,seed,run)]=seed
        for f in [x for x in futures if x.done()]:
            seed=futures.pop(f)
            try:results.append(f.result())
            except Exception as exc:failures.append({'seed':seed,'error':str(exc)})
            if (len(results)+len(failures))%25==0:
                print('archive populations checked:',len(results)+len(failures),flush=True)
        if final is not None and not futures and scheduled==completed:break
        time.sleep(2)
    results.sort(key=lambda x:x['seed']);failures.sort(key=lambda x:x['seed'])
    all_files={};selected=set(final['selected_seeds'])
    for item in results:
        if item['eligible']!=(item['seed'] in selected):failures.append({'seed':item['seed'],'error':'manifest eligibility mismatch'})
        all_files.update(item['observed_file_sha256'])
        if item['eligible']:
            expected=final['checkpoint_metadata'][str(item['seed'])]
            if item['observed_checkpoint']!=expected:failures.append({'seed':item['seed'],'error':'checkpoint manifest mismatch'})
    if all_files!=final['files_sha256']:failures.append({'seed':None,'error':'file hashes do not match final manifest'})
    branches=sum(x['branches'] for x in results)
    status='pass' if not failures and len(results)==final['screened'] and branches==5*len(selected) else 'fail'
    out={'status':status,'manifest_files':len(all_files),'populations':len(selected),
         'screened_populations':len(results),'branches':branches,'failures':failures,'details':results,
         'method':'Sealed audit_row and paired checkpoint verification, on completed files in local processes; all hashes bound to the final manifest.'}
    a.output.write_text(json.dumps(out,sort_keys=True,indent=2)+'\n')
    print(json.dumps({k:out[k] for k in ('status','manifest_files','populations','branches')}),flush=True)
    if status!='pass':raise SystemExit('archive audit failed')


if __name__=='__main__':main()
