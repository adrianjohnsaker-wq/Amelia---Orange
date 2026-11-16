"""Predefined descriptive matching, using only pre-event covariates."""
import argparse
import gzip
import json
from pathlib import Path


def distance(a,b):
    fields=(('time',180.),('intron_length',512.),('host_age',120.),
            ('host_energy_approx',10.),('local_population',180.),
            ('zone_resource',8.),('host_genome_length',512.))
    return sum(abs(a[k]-b[k])/scale for k,scale in fields)+\
           sum(abs(x-y)/2.5 for x,y in zip(a['field'],b['field']))/3


def main():
    p=argparse.ArgumentParser();p.add_argument('--run-dir',type=Path,required=True);args=p.parse_args()
    manifest=json.loads((args.run_dir/'cohort_manifest.json').read_text())
    if manifest['status'] not in ('complete','screening_exhausted'):raise ValueError('incomplete cohort')
    seeds=sorted(manifest['selected_seeds']+manifest['noneligible_seeds']);rows=[]
    for seed in seeds:
        with gzip.open(args.run_dir/f'seed_{seed}.json.gz','rt') as z:rows.append(json.load(z))
    primary=[r for r in rows if r['eligible']];pool=[r for r in rows if r['nonchimeric']['eligible']]
    used=set();matched=[];unmatched=[]
    for r in primary:
        g=r['graft']['pre_event_covariates'];choices=[]
        for q in pool:
            c=q['nonchimeric']['index']['covariates']
            if q['seed'] in used or q['seed']==r['seed'] or (g['zone'],g['mechanism'])!=(c['zone'],c['mechanism']):continue
            choices.append((distance(g,c),q['seed'],q))
        if not choices:unmatched.append(r['seed']);continue
        d,seed,q=min(choices,key=lambda x:(x[0],x[1]));used.add(seed)
        natural=r['branches']['natural']['classification']['carriers']
        natural_has=int(any(x['category'] not in ('DRIFT_REPAIR','UNKNOWN') for x in natural))
        comparator_has=int(bool(q['nonchimeric']['new_recognised_carriers']))
        matched.append({'graft_seed':r['seed'],'comparator_seed':seed,'distance':d,
                        'graft_covariates':g,'comparator_covariates':q['nonchimeric']['index']['covariates'],
                        'graft_secondary':natural_has,'comparator_secondary':comparator_has})
    out={'status':'descriptive_only','graft_populations':len(primary),'comparator_populations':len(pool),
         'matched_pairs':len(matched),'unmatched_graft_seeds':unmatched,
         'graft_secondary_count':sum(x['graft_secondary'] for x in matched),
         'comparator_secondary_count':sum(x['comparator_secondary'] for x in matched),'pairs':matched,
         'warning':'Observational matching; populations may serve in different roles and are not randomised.'}
    (args.run_dir/'nonchimeric_matching.json').write_text(json.dumps(out,sort_keys=True,indent=2)+'\n')
    print(json.dumps({k:v for k,v in out.items() if k!='pairs'},sort_keys=True,indent=2))


if __name__=='__main__':main()
