"""Verify stored cohort bytes, primary/shadow hashes and classifications."""
import argparse
import base64
import gzip
import hashlib
import json
import tempfile
import zlib
from pathlib import Path

from classify import classify,homologous_edge_carriers
from experiment import BranchWorld
from reactor import digest
from shadow_journal import ShadowJournal


def sha(path):
    h=hashlib.sha256()
    with open(path,'rb') as f:
        for x in iter(lambda:f.read(1024*1024),b''):h.update(x)
    return h.hexdigest()


def unpack(branch,key):return json.loads(zlib.decompress(base64.b64decode(branch[key])))


def audit_row(row):
    if not row['eligible']:return 0
    for arm,b in row['branches'].items():
        events=unpack(b,'primary_events_zlib_base64');state=unpack(b,'primary_state_zlib_base64')
        shadow=unpack(b,'shadow_zlib_base64')
        assert digest(events)==b['event_sha256'] and digest(state)==b['state_sha256']
        assert digest(shadow)==b['shadow_sha256'] and shadow['last_seq']==len(events)
        w=BranchWorld.restore_with_shadow(state,events,shadow);w.shadow.audit(w)
        g=next(x for x in w.shadow.grafts if x['event_seq']==row['graft']['event_seq'])
        assert classify(w.shadow,w,g)==b['classification']
        marker=g['graft_edge'];occ=g['graft_occurrence']
        if arm.startswith('ruptured_'):
            v=next(x for x in w.shadow.variants if x['label']==arm)
            marker=v['variant_edge'];occ=marker
        assert homologous_edge_carriers(w.shadow,marker,occ,g['founder'])==b['homologous_carriers']
    return len(row['branches'])


def main():
    p=argparse.ArgumentParser();p.add_argument('--run-dir',type=Path,required=True);p.add_argument('--limit',type=int)
    a=p.parse_args();m=json.loads((a.run_dir/'cohort_manifest.json').read_text())
    for name,expected in m['files_sha256'].items():
        if sha(a.run_dir/name)!=expected:raise ValueError(f'archive hash mismatch: {name}')
    seeds=m['selected_seeds'][:a.limit] if a.limit else m['selected_seeds'];branches=0
    for seed in seeds:
        with gzip.open(a.run_dir/f'seed_{seed}.json.gz','rt') as z:row=json.load(z)
        meta=m['checkpoint_metadata'][str(seed)]
        with tempfile.TemporaryDirectory(prefix='junction-audit-') as folder:
            db=Path(folder)/'pre_dispatch.sqlite'
            with gzip.open(a.run_dir/meta['compressed_file'],'rb') as z,open(db,'wb') as out:
                for chunk in iter(lambda:z.read(1024*1024),b''):out.write(chunk)
            assert sha(db)==meta['uncompressed_sha256']
            journal=ShadowJournal(db);root=journal.load(world_cls=BranchWorld);journal.close()
            assert digest(root.snapshot())==row['pre_state_sha256']
            assert digest(root.shadow.export())==row['pre_shadow_sha256']
        branches+=audit_row(row);print('audited archived population',seed,flush=True)
    out={'status':'pass','manifest_files':len(m['files_sha256']),'populations':len(seeds),'branches':branches}
    (a.run_dir/'archive_audit.json').write_text(json.dumps(out,sort_keys=True,indent=2)+'\n')
    print(json.dumps(out,sort_keys=True))


if __name__=='__main__':main()
