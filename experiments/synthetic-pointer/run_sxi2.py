#!/usr/bin/env python3
"""Run the pre-registered live W+ study; no live services are accessed."""
from __future__ import annotations
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import platform
import re
import shutil
import subprocess
import zstandard
from build_live_wplus_overlay import build
from sxi2_analysis import analyse

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
MODULE = HERE / 'live_pointer_source.mjs'
RUNTIME = ROOT / 'experiments/studio/runtime_mirror'
ARMS = {'live':('live','dynamic','none'), 'replay':('replay','dynamic','none'),
        'shuffled':('shuffled','dynamic','none'), 'sham':('sham','dynamic','none'),
        'target_dynamic':('live','dynamic','targeted'), 'target_frozen':('live','frozen','targeted'),
        'orthogonal':('live','dynamic','orthogonal')}

def digest(path):
    h=hashlib.sha256()
    with path.open('rb') as f:
        for part in iter(lambda:f.read(1024*1024),b''): h.update(part)
    return h.hexdigest()

def write_json(path, obj):
    with path.open('x') as f: json.dump(obj,f,indent=2);f.write('\n')

def packed_trace(path):
    raw=digest(path); out=path.with_suffix(path.suffix+'.zst')
    with path.open('rb') as source, out.open('xb') as target:
        with zstandard.ZstdCompressor(level=5).stream_writer(target,closefd=False) as writer:
            shutil.copyfileobj(source,writer,length=1024*1024)
    h=hashlib.sha256()
    with out.open('rb') as source, zstandard.ZstdDecompressor().stream_reader(source) as reader:
        for part in iter(lambda:reader.read(1024*1024),b''): h.update(part)
    if h.hexdigest()!=raw: raise ValueError('Compressed trace failed round-trip verification')
    result={'trace_sha256':raw,'compressed_sha256':digest(out),'compressed_file':out.name,'compressed_bytes':out.stat().st_size}
    path.unlink()
    return result

def trace_path(directory, world): return directory / f'sxi_S05W{world}_L0_S0.jsonl'

def simulate(root, overlay, world, arm, donor=None):
    base=(root/'donors'/f'W{world}') if arm=='donor' else (root/'runs'/f'W{world}'/arm)
    base.mkdir(parents=True,exist_ok=False)
    mode,pointer,mutation=ARMS['live' if arm=='donor' else arm]
    failures=[]
    for attempt in (1,2):
        directory=base/f'attempt_{attempt}'; directory.mkdir()
        trace=trace_path(directory,world)
        cmd=['node','--experimental-strip-types','--no-warnings',str(overlay),f'm={RUNTIME}',f'world={world}',
          'seasons=1','lineages=1','mode=plus','inf=I','refrain=evo',f'out={directory}','sxiTrace=1',
          f'sxiModule={MODULE}',f'sxiMode={mode}',f'sxiPointer={pointer}',f'sxiMutation={mutation}']
        if donor: cmd.append(f'sxiDonor={donor}')
        try:
            with (directory/'simulation.log').open('x') as log:
                subprocess.run(cmd,stdout=log,stderr=subprocess.STDOUT,check=True,timeout=600)
            verify=['node',str(HERE/'verify_live_wplus_trace.mjs'),str(trace),str(directory/'s0.json'),
              str(directory/'state_s0.json'),str(overlay),str(RUNTIME),str(MODULE)]
            if donor: verify.append(str(donor))
            with (directory/'verification.json').open('x') as out,(directory/'verification-errors.log').open('x') as err:
                subprocess.run(verify,stdout=out,stderr=err,check=True,timeout=600)
            verification=json.loads((directory/'verification.json').read_text())
            if verification['status']!='PASS': raise ValueError('Verification did not pass')
            return {'world':world,'arm':arm,'base':str(base),'directory':str(directory),'attempt':attempt,
                    'failures':failures,'verification':verification,'donor':str(donor) if donor else None}
        except (OSError,ValueError,KeyError,json.JSONDecodeError,subprocess.SubprocessError) as e:
            failures.append({'attempt':attempt,'error':str(e)})
    write_json(base/'FAILED.json',{'world':world,'arm':arm,'failures':failures})
    raise RuntimeError(f'Both attempts failed: W{world}/{arm}: {failures}')

def finish(item, donor_for_cf=None):
    world=item['world']; base=Path(item['base']); directory=Path(item['directory']); trace=trace_path(directory,world)
    if item['arm']!='donor':
        cmd=['node',str(HERE/'sxi2_extract.mjs'),str(trace),str(MODULE),str(base/'extract.json')]
        if donor_for_cf: cmd.append(str(donor_for_cf))
        subprocess.run(cmd,check=True,timeout=600)
    item['archive']=packed_trace(trace)
    if item['arm']!='donor': item['extract_sha256']=digest(base/'extract.json')
    write_json(base/'run_receipt.json',item)
    return item

def phase(jobs, fn):
    results=[]; errors=[]
    with ThreadPoolExecutor(max_workers=4) as executor:
        pending={executor.submit(fn,*job):job for job in jobs}
        for i,future in enumerate(as_completed(pending),1):
            job=pending[future]
            try: results.append(future.result()); result='verified'
            except Exception as e: errors.append({'job':job,'error':str(e)}); result='FAILED'
            print(f'{i}/{len(jobs)} {job[0]} {job[1]} {result}',flush=True)
    if errors: raise RuntimeError(json.dumps(errors))
    return results

def main():
    p=argparse.ArgumentParser();p.add_argument('--registration',required=True,type=Path)
    p.add_argument('--source',required=True,type=Path);p.add_argument('--output',required=True,type=Path)
    p.add_argument('--precommit',required=True);a=p.parse_args()
    if not re.fullmatch(r'[0-9a-f]{40}',a.precommit): raise ValueError('A published precommit SHA is required')
    reg=json.loads(a.registration.read_text())
    if reg['study']!='SXI-2-LIVE-ENDOGENOUS-POINTER' or reg['worlds']!=list(range(9701,9709)) or reg['donor_worlds']!=list(range(9801,9809)):
        raise ValueError('Unexpected study identity')
    if digest(a.source)!=reg['registered_runner_sha256']: raise ValueError('Original runner mismatch')
    for name, expected in reg['files'].items():
        if digest(ROOT/name)!=expected: raise ValueError('Registered file mismatch: '+name)
    root=a.output.resolve();root.mkdir(parents=True,exist_ok=False)
    overlay=root/'sxi2-overlay.mjs'
    if build(a.source.resolve(),MODULE,overlay)!=reg['generated_overlay_sha256']: raise ValueError('Overlay mismatch')
    write_json(root/'launch.json',{'study':reg['study'],'precommit':a.precommit,'registration_sha256':digest(a.registration),
      'overlay_sha256':digest(overlay),'source_sha256':digest(a.source),'started_utc':datetime.now(timezone.utc).isoformat(),
      'python':platform.python_version(),'node':subprocess.check_output(['node','--version'],text=True).strip(),
      'zstandard':zstandard.__version__,'note':'Published precommit is verified externally.'})
    (root/'donor_feedback').mkdir()
    first=phase([(w,'donor') for w in reg['donor_worlds']]+[(w,'live') for w in reg['worlds']],
        lambda w,arm:simulate(root,overlay,w,arm))
    bykey={(x['world'],x['arm']):x for x in first}
    for world in reg['worlds']:
        item=bykey[(world+100,'donor')]; directory=Path(item['directory']); donor=root/'donor_feedback'/f'W{world+100}.json'
        with (root/'donor_feedback'/f'W{world+100}_receipt.json').open('x') as log:
            subprocess.run(['node',str(HERE/'extract_live_donor.mjs'),str(trace_path(directory,world+100)),
                str(directory/'verification.json'),str(donor)],stdout=log,check=True,timeout=600)
        finish(item)
        finish(bykey[(world,'live')],donor_for_cf=donor)
    jobs=[(w,arm) for w in reg['worlds'] for arm in ARMS if arm!='live']
    def rest(world,arm):
        donor=root/'donor_feedback'/f'W{world+100}.json' if arm in ('replay','shuffled') else None
        return finish(simulate(root,overlay,world,arm,donor))
    later=phase(jobs,rest)
    write_json(root/'execution.json',{'planned':64,'completed':len(first)+len(later),'errors':[],
        'finished_utc':datetime.now(timezone.utc).isoformat()})
    result=analyse(root,reg);write_json(root/'analysis.json',result)
    print(json.dumps({'status':result['status'],'tests':result['tests']},indent=2),flush=True)
if __name__ == '__main__': main()
