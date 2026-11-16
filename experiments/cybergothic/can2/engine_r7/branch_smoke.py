"""Exercise all planned controls at one real graft from a safe SQLite fork."""
import argparse
import copy
import json
import tempfile
from pathlib import Path

from classify import classify,homologous_edge_carriers
from experiment import ARMS,BranchWorld,control_for
from pilot_stop_screen import create_world
from reactor import digest
from shadow_journal import ShadowJournal


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--seed',type=int,default=45003)
    parser.add_argument('--output',default='gate_results/branch_smoke.json');args=parser.parse_args()
    seed=args.seed;screen=create_world(seed,BranchWorld);screen.stop_when_graft=True
    screen.advance(until_time=180.);assert screen.shadow.grafts
    g=copy.deepcopy(screen.shadow.grafts[0]);dispatch=g['dispatch'];assert dispatch is not None
    event=copy.deepcopy(screen.log[g['event_seq']-1]);t0=dispatch[0]
    screen.stop_when_graft=False;screen.advance(until_time=t0+48.);screen.shadow.audit(screen)
    root=create_world(seed,BranchWorld);root.pause_serial=dispatch[1];root.advance(until_time=t0+1.)
    assert root.paused and list(root.queue[0])==dispatch
    assert root.log==screen.log[:len(root.log)]
    start_state=digest(root.snapshot());start_shadow=digest(root.shadow.export());results={}
    with tempfile.TemporaryDirectory(prefix='junction-branch-') as tmp:
        path=Path(tmp)/'pre_dispatch.sqlite';j=ShadowJournal(path);j.save(root)
        for arm in ARMS:
            w=j.load(world_cls=BranchWorld)
            assert digest(w.snapshot())==start_state and digest(w.shadow.export())==start_shadow
            w.control=control_for(g,event,arm);w.advance(until_time=t0+48.);w.shadow.audit(w)
            assert w.control['fired'];g2=next(x for x in w.shadow.grafts if x['event_seq']==g['event_seq'])
            assert g2['graft_edge']==g['graft_edge']
            if arm=='natural':
                clean=copy.deepcopy(w.snapshot());clean.pop('experiment_control')
                assert digest(clean)==digest(screen.snapshot()) and w.log==screen.log
            outcome=classify(w.shadow,w,g2)
            marker=g2['graft_edge'];occ=g2['graft_occurrence']
            if arm.startswith('ruptured_'):
                v=next(x for x in w.shadow.variants if x['label']==arm)
                assert v['source_edge']==g2['graft_edge'];marker=v['variant_edge'];occ=marker
            homologs=homologous_edge_carriers(w.shadow,marker,occ,g2['founder'])
            results[arm]={'control':w.control,'state_sha256':digest(w.snapshot()),
                          'event_sha256':digest(w.log),'shadow_sha256':digest(w.shadow.export()),
                          'categories':outcome['categories'],'homologous_carriers':len(homologs),
                          'viral_delivery_events':outcome['verified_viral_delivery_events']}
        j.close()
    out={'status':'pass','seed':seed,'t0':t0,'graft_event_seq':g['event_seq'],
         'pre_dispatch_state_sha256':start_state,'pre_dispatch_shadow_sha256':start_shadow,
         'natural_matches_uninstrumented':True,'arms':results}
    Path('gate_results').mkdir(exist_ok=True)
    Path(args.output).write_text(json.dumps(out,sort_keys=True,indent=2)+'\n')
    print(json.dumps({'status':'pass','seed':seed,'arms':list(results),'t0':t0}))


if __name__=='__main__':main()
