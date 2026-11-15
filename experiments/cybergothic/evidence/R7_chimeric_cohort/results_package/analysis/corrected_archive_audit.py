"""Re-audit archives treating host lists as unordered, without changing the model.

The original validator compared host lists by order, but restoring a JSON
object sorts stringified host IDs lexicographically. Host membership and paths
are semantic data; JSON object iteration order is not. This validator checks
all stored hashes exactly and sorts only host-level lists before comparison.
Within-host route sequences and per-host path order remain exact.
"""
import argparse
import concurrent.futures
import copy
import gzip
import hashlib
import json
import shutil
import sys
import tempfile
import traceback
from pathlib import Path


def sha(path):
    with path.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()


def normalize_classification(value):
    out=copy.deepcopy(value)
    for key in ('carriers','exact_matches'):out[key]=sorted(out[key],key=lambda x:x['host'])
    # Delivery events are identified by their actual ledger sequence and host.
    out['deliveries']=sorted(out['deliveries'],key=lambda x:(x['event_seq'],x['recipient'],x['mechanism'],x['occurrence']))
    return out


def normalized_homologs(value):return sorted(value,key=lambda x:x['host'])


def check(seed,selected,run_dir,files,metadata):
    from audit_cohort_archive import unpack
    from classify import classify,homologous_edge_carriers
    from experiment import BranchWorld
    from reactor import digest
    from shadow_journal import ShadowJournal
    name=f'seed_{seed}.json.gz';path=run_dir/name
    if sha(path)!=files[name]:raise ValueError(f'file hash mismatch {name}')
    with gzip.open(path,'rt') as f:row=json.load(f)
    if row['seed']!=seed or row['eligible']!=selected:raise ValueError(f'eligibility mismatch {seed}')
    if not selected:return {'seed':seed,'eligible':False,'branches':0,'files':1,'order_only_mismatches':[]}
    meta=metadata[str(seed)];name=meta['compressed_file'];path=run_dir/name
    if sha(path)!=files[name] or sha(path)!=meta['compressed_sha256']:raise ValueError(f'checkpoint hash mismatch {name}')
    with tempfile.TemporaryDirectory(prefix=f'junction-corrected-audit-{seed}-') as temp:
        db=Path(temp)/'pre_dispatch.sqlite'
        with gzip.open(path,'rb') as src,db.open('wb') as dst:shutil.copyfileobj(src,dst,1024*1024)
        if sha(db)!=meta['uncompressed_sha256']:raise ValueError(f'raw checkpoint hash mismatch {seed}')
        journal=ShadowJournal(db);root=journal.load(world_cls=BranchWorld);journal.close()
        if digest(root.snapshot())!=row['pre_state_sha256'] or digest(root.shadow.export())!=row['pre_shadow_sha256']:
            raise ValueError(f'paired root mismatch {seed}')
    discrepancies=[]
    for arm,b in row['branches'].items():
        events=unpack(b,'primary_events_zlib_base64');state=unpack(b,'primary_state_zlib_base64')
        shadow=unpack(b,'shadow_zlib_base64')
        if digest(events)!=b['event_sha256'] or digest(state)!=b['state_sha256'] or digest(shadow)!=b['shadow_sha256']:
            raise ValueError(f'branch content hash mismatch {seed} {arm}')
        if shadow['last_seq']!=len(events):raise ValueError(f'shadow sequence mismatch {seed} {arm}')
        world=BranchWorld.restore_with_shadow(state,events,shadow);world.shadow.audit(world)
        graft=next(x for x in world.shadow.grafts if x['event_seq']==row['graft']['event_seq'])
        actual=classify(world.shadow,world,graft);saved=b['classification']
        if actual!=saved:
            if normalize_classification(actual)!=normalize_classification(saved):
                raise ValueError(f'classification differs beyond host/event ordering: {seed} {arm}')
            discrepancies.append({'arm':arm,'field':'classification','reason':'host or event iteration order'})
        edge=graft['graft_edge'];occ=graft['graft_occurrence']
        if arm.startswith('ruptured_'):
            variant=next(x for x in world.shadow.variants if x['label']==arm)
            edge=variant['variant_edge'];occ=edge
        actual=homologous_edge_carriers(world.shadow,edge,occ,graft['founder']);saved=b['homologous_carriers']
        if actual!=saved:
            if normalized_homologs(actual)!=normalized_homologs(saved):
                raise ValueError(f'homologous carriers differ beyond host ordering: {seed} {arm}')
            discrepancies.append({'arm':arm,'field':'homologous_carriers','reason':'host iteration order'})
    if len(row['branches'])!=5:raise ValueError(f'wrong branch count {seed}')
    return {'seed':seed,'eligible':True,'branches':5,'files':2,'order_only_mismatches':discrepancies}


def main():
    p=argparse.ArgumentParser();p.add_argument('--lab',type=Path,required=True)
    p.add_argument('--run-dir',type=Path,required=True);p.add_argument('--output',type=Path,required=True)
    p.add_argument('--workers',type=int,default=4);p.add_argument('--only',nargs='*',type=int)
    a=p.parse_args();lab=a.lab.resolve();run=a.run_dir.resolve();sys.path.insert(0,str(lab))
    if not 1<=a.workers<=4:raise ValueError('workers must be 1–4')
    m=json.loads((run/'cohort_manifest.json').read_text())
    if m['status'] not in ('complete','screening_exhausted'):raise ValueError('incomplete cohort')
    selections={s:True for s in m['selected_seeds']}
    for s in m['noneligible_seeds']:
        if s in selections:raise ValueError('duplicate seed')
        selections[s]=False
    if len(selections)!=m['screened']:raise ValueError('screened count mismatch')
    if a.only:
        if not set(a.only).issubset(selections):raise ValueError('unknown audit seed')
        selections={s:selections[s] for s in a.only}
    results=[];failures=[]
    with concurrent.futures.ProcessPoolExecutor(max_workers=a.workers) as pool:
        jobs={pool.submit(check,s,yes,run,m['files_sha256'],m['checkpoint_metadata']):s
              for s,yes in sorted(selections.items())}
        for future in concurrent.futures.as_completed(jobs):
            seed=jobs[future]
            try:results.append(future.result())
            except Exception as exc:failures.append({'seed':seed,'error':str(exc),'type':type(exc).__name__})
            count=len(results)+len(failures)
            if count%25==0 or count==len(selections):print('corrected archive checks:',count,'of',len(selections),flush=True)
    results.sort(key=lambda x:x['seed']);failures.sort(key=lambda x:x['seed'])
    branches=sum(x['branches'] for x in results);file_count=sum(x['files'] for x in results)
    full=a.only is None
    status='pass' if not failures and len(results)==len(selections) and (not full or file_count==len(m['files_sha256'])) else 'fail'
    order_only=[{'seed':r['seed'],**x} for r in results for x in r['order_only_mismatches']]
    out={'status':status,'manifest_files':file_count,'populations':sum(x['eligible'] for x in results),
         'screened_populations':len(results),'branches':branches,'failures':failures,'details':results,
         'order_only_mismatches':order_only,'full_cohort':full,
         'method':'All primary, ledger, shadow and checkpoint hashes exact; compare restored host lists as unordered sets, preserving within-host route order.'}
    a.output.write_text(json.dumps(out,sort_keys=True,indent=2)+'\n')
    print(json.dumps({'status':status,'populations':out['populations'],'branches':branches,
                      'order_only_comparisons':len(order_only),'failures':len(failures)}),flush=True)
    if status!='pass':raise SystemExit('corrected archive audit failed')


if __name__=='__main__':main()
