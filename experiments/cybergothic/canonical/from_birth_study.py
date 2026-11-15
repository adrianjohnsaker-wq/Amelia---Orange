"""Naturally develop digit-only ecologies with the grammar active from birth."""
import argparse
import copy
import json
from concurrent.futures import ProcessPoolExecutor,as_completed
from pathlib import Path

from digit_study import measure,span_counts
from digit_world import DigitWorld,MODES
from legacy_engine import Config,Entropy
from reactor import digest


def run_seed(seed,horizon=180.):
    root=DigitWorld(Config(seed=seed,initial_agents=36,max_agents=180,max_genome=512),Entropy('seeded',seed))
    root.recovery_floor=8;root.pulse_renewal=.6;root.steering_mode='target';root.feedback_gain=1.8
    root.archive_mode='random';root.forecast_mode='learned';root.vector_mode='intact';root.cargo_policy='experienced'
    root.temporal_hold=3;root.salvage_feedback=True;root.temporal_retention=.85;root.portable_bets=True
    common=digest(root.snapshot());start=len(root.log);n0=len(root.agents);t0=root.now
    initial={a.genome for a in root.agents.values()}
    baseline={'living':n0,'gene_spans':sum(span_counts(a.genome)['gene'] for a in root.agents.values()),
              'intron_spans':sum(span_counts(a.genome)['intron'] for a in root.agents.values()),
              'hosts_with_intron':sum(span_counts(a.genome)['intron']>0 for a in root.agents.values()),
              'state_sha256':common}
    out={}
    for mode in MODES:
        w=copy.deepcopy(root);assert digest(w.snapshot())==common
        w.parser_mode=mode;w.advance(until_time=horizon)
        out[mode]=measure(w,start,n0,initial,t0,horizon,root.reactor_input,root.reactor_spent,root.external_nourishment)
    assert all(out[m]['environment_future']==out[MODES[0]]['environment_future'] for m in MODES)
    return {'seed':seed,'horizon':horizon,'baseline':baseline,'results':out}


def main():
    p=argparse.ArgumentParser();p.add_argument('--start',required=True,type=int);p.add_argument('--seeds',required=True,type=int)
    p.add_argument('--horizon',type=float,default=180.);p.add_argument('--workers',type=int,default=4);p.add_argument('--output',type=Path,required=True)
    a=p.parse_args();a.output.mkdir(parents=True,exist_ok=False)
    with ProcessPoolExecutor(max_workers=a.workers) as pool:
        jobs=[pool.submit(run_seed,s,a.horizon) for s in range(a.start,a.start+a.seeds)]
        for i,f in enumerate(as_completed(jobs),1):
            row=f.result();(a.output/f"seed_{row['seed']}.json").write_text(json.dumps(row,sort_keys=True,indent=2)+'\n')
            print(f"completed from-birth population {row['seed']} ({i}/{a.seeds})",flush=True)
    (a.output/'parameters.json').write_text(json.dumps(vars(a),default=str,sort_keys=True,indent=2)+'\n')


if __name__=='__main__':main()
