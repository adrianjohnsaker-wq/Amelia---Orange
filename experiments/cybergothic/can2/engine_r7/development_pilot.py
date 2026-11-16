"""Forty disjoint development populations: eligibility and observer coverage."""
import json
from collections import Counter
from concurrent.futures import ProcessPoolExecutor,as_completed
from pathlib import Path

from classify import classify
from experiment import BranchWorld
from pilot_stop_screen import create_world
from reactor import digest


def check(seed):
    w=create_world(seed,BranchWorld);w.stop_when_graft=True;w.advance(until_time=180.)
    if not w.shadow.grafts:
        w.shadow.audit(w)
        return {'seed':seed,'eligible':False,'events':len(w.log),'shadow_nodes':len(w.shadow.nodes),
                'state_sha256':digest(w.snapshot()),'event_sha256':digest(w.log),
                'coverage_routes':sorted(w.shadow.route_counts)}
    g=w.shadow.grafts[0];assert g['dispatch'] is not None
    t0=g['dispatch'][0];w.stop_when_graft=False;w.advance(until_time=t0+48.);w.shadow.audit(w)
    classification=classify(w.shadow,w,g)
    return {'seed':seed,'eligible':True,'form':g['form'],'mechanism':g['kind'],
            't0':t0,'intron_length':g['intron_length'],'events':len(w.log),'shadow_nodes':len(w.shadow.nodes),
            'state_sha256':digest(w.snapshot()),'event_sha256':digest(w.log),
            'shadow_sha256':digest(w.shadow.export()),'classification_sha256':digest(classification),
            'coverage_routes':sorted(w.shadow.route_counts)}


def main():
    rows=[]
    with ProcessPoolExecutor(max_workers=3) as pool:
        for f in as_completed([pool.submit(check,s) for s in range(45101,45141)]):
            row=f.result();rows.append(row);print('development population',row['seed'],flush=True)
    rows.sort(key=lambda r:r['seed']);eligible=[r for r in rows if r['eligible']]
    out={'status':'pass','populations':40,'seed_range':[45101,45140],
         'eligible_populations':len(eligible),'forms':dict(Counter(r['form'] for r in eligible)),
         'mechanisms':dict(Counter(r['mechanism'] for r in eligible)),
         'coverage_routes':sorted({x for r in rows for x in r['coverage_routes']}),
         'note':'Development diagnostics only; no treatment or primary-outcome selection.',
         'rows':rows}
    Path('gate_results').mkdir(exist_ok=True)
    Path('gate_results/development_pilot.json').write_text(json.dumps(out,sort_keys=True,indent=2)+'\n')
    print(json.dumps({k:out[k] for k in ('status','populations','eligible_populations','forms','mechanisms')}))


if __name__=='__main__':main()
