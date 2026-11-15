"""Seed-paired population analysis for the digit-genome experiment."""
import json
import random
import statistics
from collections import Counter
from pathlib import Path

from digit_world import MODES

DIRECTORY=Path('fresh_digit_39001')
METRICS=('agent_time','total_field_uptake','final_living','empty_at_horizon',
         'zero_population_episodes','mutation_created_intron_spans',
         'final_intron_spans','hosts_with_intron','genome_diversity',
         'novel_executed_genomes','actions','archive_births','meltdowns',
         'external_nourishment','reactor_input','reactor_spent','cap_action_fraction')


def mean(xs):return statistics.fmean(xs)


def percentile(xs,p):
    a=sorted(xs);at=(len(a)-1)*p;lo=int(at);hi=min(lo+1,len(a)-1)
    return a[lo]+(a[hi]-a[lo])*(at-lo)


def contrast(rows,a,b,key,alpha=.025):
    ds=[float(r['results'][a][key])-float(r['results'][b][key]) for r in rows]
    rng=random.Random(2026111533);n=len(ds)
    samples=[mean(ds[rng.randrange(n)] for _ in range(n)) for _ in range(10000)]
    return {'estimate':mean(ds),'low':percentile(samples,alpha/2),'high':percentile(samples,1-alpha/2),
            'ci_level':1-alpha,'seeds':n,'positive':sum(v>0 for v in ds),
            'negative':sum(v<0 for v in ds),'zero':sum(v==0 for v in ds)}


def main():
    rows=[json.loads(p.read_text()) for p in sorted(DIRECTORY.glob('seed_*.json'))]
    result={'populations':len(rows),'branches':len(rows)*len(MODES),
            'initial':{'mean_living':mean(r['baseline']['living'] for r in rows),
                'mean_intron_spans':mean(r['baseline']['intron_spans'] for r in rows),
                'seeds_with_introns':sum(r['baseline']['intron_spans']>0 for r in rows),
                'seeds_with_genes':sum(r['baseline']['gene_spans']>0 for r in rows)},
            'summaries':{},'primary':{},'secondary':{},'formation':{}}
    for mode in MODES:
        x=[r['results'][mode] for r in rows]
        result['summaries'][mode]={k:mean(float(v[k]) for v in x) for k in METRICS}
        result['summaries'][mode]['empty_runs']=sum(v['empty_at_horizon'] for v in x)
        result['summaries'][mode]['mutation_runs_with_new_intron']=sum(v['mutation_created_intron_spans']>0 for v in x)
        result['summaries'][mode]['intron_nop_actions']=sum(v['decode_counts'].get('noop_intron',0) for v in x)
        result['summaries'][mode]['promoter_closed_nop_actions']=sum(v['decode_counts'].get('noop_gene_body',0) for v in x)
        combined=sum((Counter(v['transfer_added_intron_sequences']) for v in x),Counter())
        result['formation'][mode]={'mutation_new_spans':sum(v['mutation_created_intron_spans'] for v in x),
            'transfer_new_sequences':dict(combined),'events_created_new_intron':sum(v['mutation_created_intron_spans']>0 for v in x)}
    for key in ('agent_time','total_field_uptake'):
        result['primary'][f'{key}_self_minus_intron_active']=contrast(rows,'self','intron_active',key)
    for ref in ('promoter_open','literal'):
        for key in ('agent_time','total_field_uptake','empty_at_horizon','mutation_created_intron_spans','genome_diversity'):
            result['secondary'][f'{key}_self_minus_{ref}']=contrast(rows,'self',ref,key,alpha=.05)
    for key in ('empty_at_horizon','final_living','mutation_created_intron_spans','archive_births','meltdowns'):
        result['secondary'][f'{key}_self_minus_intron_active']=contrast(rows,'self','intron_active',key,alpha=.05)
    (DIRECTORY/'analysis.json').write_text(json.dumps(result,indent=2,sort_keys=True)+'\n')
    print(json.dumps({k:result[k] for k in ('populations','branches','initial','primary','summaries','formation')},indent=2))


if __name__=='__main__':main()
