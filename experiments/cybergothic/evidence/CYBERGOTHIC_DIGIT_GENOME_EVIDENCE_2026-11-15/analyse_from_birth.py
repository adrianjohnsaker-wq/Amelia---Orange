"""Exploratory descriptive analysis of ecologies parsed from their birth."""
import json
import random
import statistics
from pathlib import Path
from digit_world import MODES

DIRECTORY=Path('fresh_birth_41001')


def mean(xs):return statistics.fmean(xs)
def percentile(xs,p):
    xs=sorted(xs);i=(len(xs)-1)*p;a=int(i);b=min(a+1,len(xs)-1)
    return xs[a]+(xs[b]-xs[a])*(i-a)


def main():
    rows=[json.loads(p.read_text()) for p in sorted(DIRECTORY.glob('seed_*.json'))]
    delta=[r['results']['self']['agent_time']-r['results']['intron_active']['agent_time'] for r in rows]
    rng=random.Random(2026111549);n=len(delta)
    boot=[mean(delta[rng.randrange(n)] for _ in range(n)) for _ in range(10000)]
    out={'populations':len(rows),'branches':len(rows)*len(MODES),
         'initial_seeds_with_introns':sum(r['baseline']['intron_spans']>0 for r in rows),
         'summary':{},'exploratory_agent_time_self_minus_intron_active':{'estimate':mean(delta),
           'low':percentile(boot,.025),'high':percentile(boot,.975),'ci_level':.95}}
    for mode in MODES:
        x=[r['results'][mode] for r in rows]
        out['summary'][mode]={'mean_agent_time':mean(r['agent_time'] for r in x),
             'mean_field_uptake':mean(r['total_field_uptake'] for r in x),
             'mean_final_living':mean(r['final_living'] for r in x),
             'empty_at_horizon':sum(r['empty_at_horizon'] for r in x),
             'mutation_new_spans':sum(r['mutation_created_intron_spans'] for r in x),
             'seeds_with_mutation_new_intron':sum(r['mutation_created_intron_spans']>0 for r in x),
             'seeds_with_noop_intron':sum(r['decode_counts'].get('noop_intron',0)>0 for r in x),
             'intron_noop_actions':sum(r['decode_counts'].get('noop_intron',0) for r in x),
             'final_intron_carriers':sum(r['hosts_with_intron'] for r in x),
             'mean_archive_births':mean(r['archive_births'] for r in x),
             'mean_external_nourishment':mean(r['external_nourishment'] for r in x)}
    (DIRECTORY/'analysis.json').write_text(json.dumps(out,indent=2,sort_keys=True)+'\n')
    print(json.dumps(out,indent=2))


if __name__=='__main__':main()
