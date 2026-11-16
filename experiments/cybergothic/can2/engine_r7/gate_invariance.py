"""Twenty independent observer-on/off runs plus tracer-equivalence controls."""
import json
from concurrent.futures import ProcessPoolExecutor,as_completed
from pathlib import Path

from legacy_engine import Config,Entropy
from observer import ObservedWorld
from pilot_stop_screen import create_world
from reactor import digest
import rng_trace

OUT=Path('gate_results');OUT.mkdir(exist_ok=True)


def observed(seed,enabled):
    return create_world(seed,lambda c,e:ObservedWorld(c,e,observe=enabled))


def check(seed):
    off=observed(seed,False);on=observed(seed,True)
    assert digest(off.snapshot())==digest(on.snapshot()) and off.log==on.log
    rng_trace.install(off);rng_trace.install(on)
    checkpoints=[]
    for t in (30,60,90,120,150,180):
        off.advance(until_time=t);on.advance(until_time=t);on.shadow.audit(on)
        state0=digest(off.snapshot());state1=digest(on.snapshot());log0=digest(off.log);log1=digest(on.log)
        assert state0==state1 and log0==log1 and off.log==on.log,(seed,t)
        assert rng_trace.result(off)==rng_trace.result(on),(seed,t,'draws')
        checkpoints.append({'model_time':t,'state_sha256':state0,'event_sha256':log0,
                            'events':len(off.log),'rng':rng_trace.result(off)})
    return {'seed':seed,'checkpoints':checkpoints,'shadow_nodes':len(on.shadow.nodes),
            'grafts':len(on.shadow.grafts),'routes':on.shadow.route_counts,'events':on.shadow.event_counts}


def tracer_control(seed):
    bare=create_world(seed);traced=create_world(seed)
    assert bare.snapshot()==traced.snapshot();rng_trace.install(traced)
    bare.advance(until_time=180);traced.advance(until_time=180)
    assert bare.log==traced.log and digest(bare.snapshot())==digest(traced.snapshot())
    from experiment import BranchWorld
    dispatched=create_world(seed,BranchWorld);dispatched.advance(until_time=180);dispatched.shadow.audit(dispatched)
    assert bare.log==dispatched.log and digest(bare.snapshot())==digest(dispatched.snapshot())
    return {'seed':seed,'event_sha256':digest(bare.log),'state_sha256':digest(bare.snapshot()),
            'rng_draws':rng_trace.result(traced),'scheduler_control':'pass'}


def main():
    with ProcessPoolExecutor(max_workers=3) as pool:
        fs=[pool.submit(check,s) for s in range(45001,45021)]
        rows=[]
        for f in as_completed(fs):
            row=f.result();rows.append(row);print('invariance seed',row['seed'],flush=True)
        checks=list(pool.map(tracer_control,range(45001,45006)))
    rows.sort(key=lambda x:x['seed'])
    out={'status':'pass','populations':20,'seed_range':[45001,45020],
         'horizon':180,'checkpoint_count':120,'observer_results':rows,'tracer_controls':checks,
         'note':'Founder/environment initialisation matched before tracing; primitive draws thereafter recorded.'}
    (OUT/'gate_1_invariance.json').write_text(json.dumps(out,sort_keys=True,indent=2)+'\n')
    print(json.dumps({'status':'pass','populations':20,'tracer_controls':len(checks),'checkpoints':120}))


if __name__=='__main__':main()
