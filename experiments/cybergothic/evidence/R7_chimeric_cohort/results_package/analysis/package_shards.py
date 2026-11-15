"""Package every original cohort file, without modifying its bytes."""
import argparse
import hashlib
import json
import re
import zipfile
from pathlib import Path


def sha(path):
    with path.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()


def main():
    p=argparse.ArgumentParser();p.add_argument('--run-dir',type=Path,required=True)
    p.add_argument('--output-dir',type=Path,required=True);p.add_argument('--mib',type=int,default=180)
    a=p.parse_args();manifest=json.loads((a.run_dir/'cohort_manifest.json').read_text())
    audit=json.loads((a.run_dir/'archive_audit.json').read_text());n=len(manifest['selected_seeds'])
    if audit['status']!='pass' or audit['populations']!=n or audit['branches']!=5*n:
        raise ValueError('refusing to package unaudited cohort')
    if a.mib<32 or a.mib>250:raise ValueError('shard size outside allowed range')
    grouped={}
    for filename,expected in manifest['files_sha256'].items():
        match=re.fullmatch(r'(?:seed_|pre_dispatch_)(\d+)\.(?:json|sqlite)\.gz',filename)
        if not match:raise ValueError('unexpected file in manifest: '+filename)
        path=a.run_dir/filename
        if sha(path)!=expected:raise ValueError('input bytes changed: '+filename)
        grouped.setdefault(int(match.group(1)),[]).append(filename)
    if set(grouped)!=set(manifest['selected_seeds']+manifest['noneligible_seeds']):
        raise ValueError('manifest seed/file mismatch')
    groups=[];batch=[];size=0;ceiling=a.mib*1024*1024
    for seed,filenames in sorted(grouped.items()):
        filenames=sorted(filenames);amount=sum((a.run_dir/f).stat().st_size for f in filenames)
        if batch and size+amount>ceiling:groups.append(batch);batch=[];size=0
        batch.append((seed,filenames));size+=amount
    if batch:groups.append(batch)
    a.output_dir.mkdir(parents=True,exist_ok=True);shards=[]
    for number,batch in enumerate(groups,1):
        filename=f'CHIMERIC_COHORT_LEDGER_PART_{number:02d}_OF_{len(groups):02d}.zip'
        path=a.output_dir/filename;files=[f for seed,filenames in batch for f in filenames]
        with zipfile.ZipFile(path,'x',compression=zipfile.ZIP_STORED,allowZip64=True) as z:
            for f in files:z.write(a.run_dir/f,f'cohort_runs/confirmatory_20261115/{f}')
            z.writestr(f'ledger_part_{number:02d}_manifest.json',json.dumps({
                'first_seed':batch[0][0],'last_seed':batch[-1][0],
                'files_sha256':{f:manifest['files_sha256'][f] for f in files}},sort_keys=True,indent=2)+'\n')
        with zipfile.ZipFile(path) as z:
            if z.testzip() is not None:raise ValueError('shard CRC check failed')
        shards.append({'file_name':filename,'sha256':sha(path),'bytes':path.stat().st_size,
                       'first_seed':batch[0][0],'last_seed':batch[-1][0],
                       'populations':len(batch),'cohort_files':len(files)})
        print('packaged ledger part',number,'of',len(groups),flush=True)
    index={'status':'pass','selected_populations':n,'screened_populations':manifest['screened'],
           'cohort_files':len(manifest['files_sha256']),'shards':shards,
           'method':'Each shard contains original unmodified compressed cohort files and a SHA-256 part manifest.'}
    (a.output_dir/'SHARD_INDEX.json').write_text(json.dumps(index,sort_keys=True,indent=2)+'\n')
    print(json.dumps({'status':'pass','shards':len(shards),'files':index['cohort_files']}))


if __name__=='__main__':main()
