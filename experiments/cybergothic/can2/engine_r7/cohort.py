"""Run the locally sealed cohort in credential-free, network-denied workers."""
import argparse
import gzip
import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

from local_guard import install as install_guard
from seccomp_lock import install as seccomp_install


def sha(path):
    h=hashlib.sha256()
    with open(path,'rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''):h.update(chunk)
    return h.hexdigest()


def checked_seal(lab):
    seal=json.loads((lab/'FINAL_COHORT_SEAL.json').read_text())
    if seal['status']!='sealed_locally':raise ValueError('cohort is not sealed')
    for name,expected in seal['source_sha256'].items():
        if sha(lab/name)!=expected:raise ValueError(f'sealed source changed: {name}')
    for name,expected in seal.get('evidence_sha256',{}).items():
        if sha(lab/name)!=expected:raise ValueError(f'sealed supporting evidence changed: {name}')
    for name,expected in seal['gate_sha256'].items():
        if sha(lab/'gate_results'/name)!=expected:raise ValueError(f'sealed gate record changed: {name}')
    if sha(lab/'CHIMERIC_JUNCTION_TRACKING_PROTOCOL_2026-11-15.md')!=seal['protocol_sha256']:
        raise ValueError('protocol draft changed after seal')
    return seal


def gzip_bytes(path,data):
    with open(path,'wb') as raw:
        with gzip.GzipFile(filename='',fileobj=raw,mode='wb',mtime=0) as z:z.write(data)


def compress_checkpoint(path):
    original=sha(path);out=path.with_suffix(path.suffix+'.gz')
    with open(path,'rb') as src,open(out,'wb') as raw:
        with gzip.GzipFile(filename='',fileobj=raw,mode='wb',mtime=0) as z:
            for chunk in iter(lambda:src.read(1024*1024),b''):z.write(chunk)
    h=hashlib.sha256()
    with gzip.open(out,'rb') as z:
        for chunk in iter(lambda:z.read(1024*1024),b''):h.update(chunk)
    if h.hexdigest()!=original:raise ValueError('compressed checkpoint verification failed')
    os.remove(path)
    return {'compressed_file':out.name,'uncompressed_sha256':original,'compressed_sha256':sha(out)}


def main():
    p=argparse.ArgumentParser();p.add_argument('--name',required=True)
    p.add_argument('--development',action='store_true');p.add_argument('--start',type=int)
    p.add_argument('--max-seeds',type=int);p.add_argument('--target',type=int)
    a=p.parse_args()
    if not re.fullmatch(r'[A-Za-z0-9_-]{1,60}',a.name):raise ValueError('invalid run name')
    lab=Path(__file__).resolve().parent
    if a.development:
        start=45003 if a.start is None else a.start;maximum=1 if a.max_seeds is None else a.max_seeds
        target=1 if a.target is None else a.target
        if maximum<1 or maximum>3 or target<1 or target>maximum or set(range(start,start+maximum))&set(range(50001,50601)):
            raise ValueError('development run must be small and outside the sealed range')
        seal=None
    else:
        if any(x is not None for x in (a.start,a.max_seeds,a.target)):
            raise ValueError('sealed cohort settings cannot be overridden')
        seal=checked_seal(lab);start=50001;maximum=600;target=250
    runs=lab/'cohort_runs';runs.mkdir(exist_ok=True);output=runs/a.name;output.mkdir(exist_ok=False)
    install_guard(str(output),str(lab));network_lock=seccomp_install(full=False)
    selected=[];noneligible=[];files={};checkpoints={};screened=0
    worker=lab/'cohort_worker.py'
    for seed in range(start,start+maximum):
        proc=subprocess.run([sys.executable,'-S','-B',str(worker),'--seed',str(seed),'--output-dir',str(output)],
                            cwd=output,env={'PYTHONDONTWRITEBYTECODE':'1'},close_fds=True,
                            capture_output=True,text=True)
        if proc.returncode:
            (output/'failure.json').write_text(json.dumps({'seed':seed,'returncode':proc.returncode,
                'stderr':proc.stderr[-8000:]},sort_keys=True,indent=2)+'\n')
            raise RuntimeError(f'worker failed at seed {seed}; cohort stopped')
        row=json.loads(proc.stdout);screened+=1
        if row['seed']!=seed or not {'socket','connect','open','openat','execve'}.issubset(row['lockdown']):
            raise AssertionError('worker identity or isolation failed')
        path=output/f'seed_{seed}.json.gz';gzip_bytes(path,proc.stdout.encode())
        files[path.name]=sha(path);db=output/f'pre_dispatch_{seed}.sqlite'
        if row['eligible']:
            selected.append(seed);info=compress_checkpoint(db);files[info['compressed_file']]=info['compressed_sha256']
            checkpoints[str(seed)]=info
        else:
            noneligible.append(seed);os.remove(db)
        print(f'screened {screened}; eligible {len(selected)}',flush=True)
        if len(selected)==target:break
    status='complete' if len(selected)==target else 'screening_exhausted'
    manifest={'status':status,'development':a.development,'screened':screened,
              'selected_seeds':selected,'noneligible_seeds':noneligible,'target':target,
              'seed_start':start,'seed_maximum':maximum,'files_sha256':files,
              'checkpoint_metadata':checkpoints,
              'parent_network_lock':network_lock,'seal_protocol_sha256':seal['protocol_sha256'] if seal else None}
    (output/'cohort_manifest.json').write_text(json.dumps(manifest,sort_keys=True,indent=2)+'\n')
    print(json.dumps({'status':status,'screened':screened,'eligible':len(selected),'directory':str(output)}))


if __name__=='__main__':main()
