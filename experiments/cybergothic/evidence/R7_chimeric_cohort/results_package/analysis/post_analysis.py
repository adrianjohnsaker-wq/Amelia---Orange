"""Additional requested, descriptive summaries of the sealed cohort.

This script is separate from the sealed confirmatory analysis and uses no
outcome-dependent selection. It is applied only after the complete archive
audit; delivery-mode comparisons are observational and exploratory.
"""
import argparse
import gzip
import json
import random
import sys
from collections import Counter
from pathlib import Path


def unpaired_difference(left,right,seed=138077):
    """Difference in population means, 95% within-group bootstrap interval."""
    if not left or not right:return None
    rng=random.Random(seed);a=len(left);b=len(right)
    draws=sorted(sum(left[rng.randrange(a)] for _ in range(a))/a-
                 sum(right[rng.randrange(b)] for _ in range(b))/b for _ in range(10000))
    return {'first_n':a,'second_n':b,'estimate':sum(left)/a-sum(right)/b,
            'low':draws[250],'high':draws[9750],'ci_level':.95,'bootstrap_replicates':10000}


def compact(row):
    for branch in row['branches'].values():
        for key in ('primary_events_zlib_base64','primary_state_zlib_base64','shadow_zlib_base64'):
            branch.pop(key,None)
    return row


def main():
    p=argparse.ArgumentParser();p.add_argument('--lab',type=Path,required=True)
    p.add_argument('--run-dir',type=Path,required=True);p.add_argument('--output-dir',type=Path,required=True)
    a=p.parse_args();sys.path.insert(0,str(a.lab.resolve()))
    from cohort_analysis import percentile,union_indicator,wilson
    manifest=json.loads((a.run_dir/'cohort_manifest.json').read_text())
    audit=json.loads((a.run_dir/'archive_audit.json').read_text())
    selected=manifest['selected_seeds'];n=len(selected)
    if manifest['status'] not in ('complete','screening_exhausted') or audit['status']!='pass' or \
       audit['populations']!=n or audit['branches']!=5*n:
        raise ValueError('full, successful five-branch archive audit required')
    rows=[]
    for seed in selected:
        with gzip.open(a.run_dir/f'seed_{seed}.json.gz','rt') as f:row=json.load(f)
        if not row['eligible'] or row['seed']!=seed:raise ValueError('bad selected row')
        rows.append(compact(row))
    def natural(r):return r['branches']['natural']
    def nonkin(r):return natural(r)['classification']['verified_nonkin_viral_events']
    def all_events(r):return natural(r)['classification']['verified_viral_delivery_events']
    def union(r):return union_indicator(natural(r))
    def necrotic(r):return int(natural(r)['classification']['categories'].get('NECROTIC',0)>0)
    def horizon_nonkin(r):return int(natural(r)['classification']['categories'].get('TRUE_HORIZ_NONKIN',0)>0)
    def describe(group):
        m=len(group)
        return {'populations':m,
            'natural_secondary_union':wilson(sum(union(r) for r in group),m),
            'at_least_one_nonkin_viral_delivery':wilson(sum(nonkin(r)>0 for r in group),m),
            'horizon_nonkin_carrier':wilson(sum(horizon_nonkin(r) for r in group),m),
            'horizon_necrotic_carrier':wilson(sum(necrotic(r) for r in group),m),
            'viral_events_mean':percentile([all_events(r) for r in group]),
            'nonkin_events_mean':percentile([nonkin(r) for r in group])}
    direct=[r for r in rows if r['graft']['kind']=='infection']
    vector=[r for r in rows if r['graft']['kind']=='vector_infection']
    if len(direct)+len(vector)!=n:raise ValueError('unknown graft mechanism')
    paired={}
    for arm in ('ruptured_08','recipient_active','scramble','ruptured_00'):
        group=[r for r in rows if arm!='scramble' or r['branches'][arm]['control']['result']['applicable']]
        paired[arm]={
          'natural_minus_arm_founder_survival':percentile([int(natural(r)['founder_survived'])-
                         int(r['branches'][arm]['founder_survived']) for r in group]),
          'natural_minus_arm_descendant_births':percentile([natural(r)['descendant_births']-
                         r['branches'][arm]['descendant_births'] for r in group]),
          'natural_minus_arm_founder_uptake':percentile([natural(r)['founder_field_uptake']-
                         r['branches'][arm]['founder_field_uptake'] for r in group])}
    downstream=Counter(d['mechanism'] for r in rows for d in natural(r)['classification']['deliveries'])
    summaries={'status':'analysed','note':'Delivery-mode and additional phenotype comparisons are exploratory, non-randomised where between index modes, and unadjusted for multiplicity.',
      'population_overall':describe(rows),'index_mechanism':{'direct':describe(direct),'vector':describe(vector)},
      'vector_minus_direct_exploratory':{
        'natural_secondary_union':unpaired_difference([union(r) for r in vector],[union(r) for r in direct]),
        'any_nonkin_delivery':unpaired_difference([int(nonkin(r)>0) for r in vector],[int(nonkin(r)>0) for r in direct]),
        'nonkin_delivery_events':unpaired_difference([nonkin(r) for r in vector],[nonkin(r) for r in direct])},
      'index_form_by_mechanism':dict(Counter(r['graft']['form']+'|'+r['graft']['kind'] for r in rows)),
      'downstream_viral_delivery_events_by_mechanism':dict(downstream),
      'paired_exploratory_phenotypes':paired}
    a.output_dir.mkdir(parents=True,exist_ok=True)
    (a.output_dir/'exploratory_analysis.json').write_text(json.dumps(summaries,sort_keys=True,indent=2)+'\n')
    with gzip.open(a.output_dir/'population_summaries.json.gz','wt',encoding='utf-8') as f:
        json.dump({'cohort_manifest':manifest,'populations':rows},f,sort_keys=True)
    print(json.dumps({'status':'analysed','populations':n,'direct':len(direct),'vector':len(vector)}))


if __name__=='__main__':main()
