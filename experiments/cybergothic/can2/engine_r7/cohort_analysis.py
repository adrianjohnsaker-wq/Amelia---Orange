"""Fixed, seed-clustered analysis for the prospective chimeric cohort."""
import argparse
import gzip
import json
import math
import random
from collections import Counter
from pathlib import Path


UNION=('TRUE_VERT_ONLY','TRUE_HORIZ_NONKIN','MIXED_VERTICAL_HORIZONTAL')


def percentile(values,level=.95,bootstrap_seed=61731):
    if not values:return None
    n=len(values);rng=random.Random(bootstrap_seed)
    draws=sorted(sum(values[rng.randrange(n)] for _ in range(n))/n for _ in range(10000))
    q=(1-level)/2
    return {'n':n,'estimate':sum(values)/n,'low':draws[int(q*len(draws))],
            'high':draws[min(len(draws)-1,int((1-q)*len(draws)))],'ci_level':level}


def wilson(success,n):
    if not n:return None
    z=1.959963984540054;p=success/n;den=1+z*z/n
    center=(p+z*z/(2*n))/den;half=z*math.sqrt(p*(1-p)/n+z*z/(4*n*n))/den
    return {'successes':success,'n':n,'estimate':p,'low':center-half,'high':center+half,'ci_level':.95}


def union_indicator(branch):
    c=branch['classification']['categories'];return int(any(c.get(k,0)>0 for k in UNION))


def stratum_summary(rows):
    n=len(rows);natural=[r['branches']['natural'] for r in rows]
    counts=[b['classification']['verified_viral_delivery_events'] for b in natural]
    a=[union_indicator(b) for b in natural]
    b=[union_indicator(r['branches']['recipient_active']) for r in rows]
    marker_a=[int(bool(x['homologous_carriers'])) for x in natural]
    marker_b=[int(bool(r['branches']['ruptured_08']['homologous_carriers'])) for r in rows]
    return {'populations':n,'natural_secondary_union':wilson(sum(a),n),
        'viral_events_per_population':percentile(counts),
        'paired_natural_minus_recipient_active':percentile([x-y for x,y in zip(a,b)]),
        'paired_natural_minus_08_marker':percentile([x-y for x,y in zip(marker_a,marker_b)])}


def scramble_summary(rows):
    applicable=[r for r in rows if r['branches']['scramble']['control']['result']['applicable']]
    pairs=[(r['branches']['natural'],r['branches']['scramble']) for r in applicable]
    return {'applicable_populations':len(applicable),'not_applicable':len(rows)-len(applicable),
        'natural_minus_scramble_secondary_union':percentile([union_indicator(a)-union_indicator(b) for a,b in pairs]),
        'natural_minus_scramble_founder_survival':percentile([int(a['founder_survived'])-int(b['founder_survived']) for a,b in pairs]),
        'natural_minus_scramble_founder_uptake':percentile([a['founder_field_uptake']-b['founder_field_uptake'] for a,b in pairs])}


def ratio_bootstrap(pairs):
    num=sum(a for a,b in pairs);den=sum(b for a,b in pairs)
    if not den:return {'numerator':0,'denominator':0,'estimate':None,'interval':None}
    rng=random.Random(62197);n=len(pairs);draws=[]
    for _ in range(10000):
        sample=[pairs[rng.randrange(n)] for _ in range(n)];d=sum(b for a,b in sample)
        if d:draws.append(sum(a for a,b in sample)/d)
    draws.sort();return {'numerator':num,'denominator':den,'estimate':num/den,
        'interval':[draws[int(.025*len(draws))],draws[min(len(draws)-1,int(.975*len(draws)))]] if draws else None}


def main():
    p=argparse.ArgumentParser();p.add_argument('--run-dir',type=Path,required=True);a=p.parse_args()
    manifest=json.loads((a.run_dir/'cohort_manifest.json').read_text())
    if manifest['status'] not in ('complete','screening_exhausted'):raise ValueError('cohort is not complete')
    rows=[]
    for seed in manifest['selected_seeds']:
        with gzip.open(a.run_dir/f'seed_{seed}.json.gz','rt') as stream:row=json.load(stream)
        if not row['eligible']:raise AssertionError('manifest contains an ineligible seed')
        rows.append(row)
    clipped=sum(r['clipped_candidates_before_selection'] for r in rows)
    for seed in manifest['noneligible_seeds']:
        with gzip.open(a.run_dir/f'seed_{seed}.json.gz','rt') as stream:other=json.load(stream)
        if other['eligible']:raise AssertionError('manifest contains a misclassified seed')
        clipped+=other['clipped_candidates_before_selection']
    n=len(rows);natural=[r['branches']['natural'] for r in rows]
    totals=Counter();survival={};births={};lifetimes={}
    for b in natural:totals.update(b['classification']['categories'])
    for arm in ('natural','ruptured_08','recipient_active','scramble','ruptured_00'):
        survival[arm]=wilson(sum(bool(r['branches'][arm]['founder_survived']) for r in rows),n)
        births[arm]=percentile([r['branches'][arm]['descendant_births'] for r in rows])
        lifetimes[arm]=percentile([r['branches'][arm]['founder_restricted_lifetime'] for r in rows])
    natural_union=[union_indicator(b) for b in natural]
    active_union=[union_indicator(r['branches']['recipient_active']) for r in rows]
    natural_marker=[int(bool(b['homologous_carriers'])) for b in natural]
    edited_marker=[int(bool(r['branches']['ruptured_08']['homologous_carriers'])) for r in rows]
    deliveries=[b['classification']['verified_viral_delivery_events'] for b in natural]
    nonkin=[b['classification']['verified_nonkin_viral_events'] for b in natural]
    viral_mechanisms=Counter(d['mechanism'] for b in natural for d in b['classification']['deliveries'])
    recipients=[b['classification']['unique_viral_recipients'] for b in natural]
    marker_00=[int(bool(r['branches']['ruptured_00']['homologous_carriers'])) for r in rows]
    collision={}
    for label,select in (('6',lambda x:x==6),('8',lambda x:x==8),('10+',lambda x:x>=10)):
        pairs=[];relations=Counter();preexisting=0
        for r in rows:
            if not select(r['graft']['intron_length']):continue
            matches=r['branches']['natural']['classification']['exact_matches']
            zero=sum(x['relation']=='ZERO_FOCAL' for x in matches)
            pairs.append((zero,len(matches)));relations.update(x['relation'] for x in matches)
            preexisting+=sum(x.get('preexisting_lookalike_ancestry',False) for x in matches)
        collision[label]={'populations':len(pairs),'ratio':ratio_bootstrap(pairs),
                          'relations':dict(relations),'preexisting_lookalike_ancestries':preexisting}
    out={'status':'analysed','selected_populations':n,'screened_populations':manifest['screened'],
        'clipped_structural_candidates_excluded_before_selection':clipped,
        'natural_primary':{'secondary_union':wilson(sum(natural_union),n),'categories':dict(totals),
          'strict_80_percent_carrier_populations':wilson(sum(any(c.get('strict_80_percent',False)
              for c in b['classification']['carriers'] if c['category'] not in ('UNKNOWN','DRIFT_REPAIR')) for b in natural),n),
          'viral_delivery_events':sum(deliveries),'viral_events_per_population':percentile(deliveries),
          'viral_event_count_distribution':dict(sorted(Counter(deliveries).items())),
          'viral_events_by_mechanism':dict(viral_mechanisms),
          'unique_recipient_hosts_summed_within_population':sum(recipients),
          'unique_recipient_hosts_per_population':percentile(recipients),
          'nonkin_viral_delivery_events':sum(nonkin),'nonkin_viral_events_per_population':percentile(nonkin),
          'denominator_note':'The primary ledger does not record all unsuccessful contacts; no contact rate is inferred.'},
        'paired_primary':{
          'natural_minus_active_recognised_union':percentile([a-b for a,b in zip(natural_union,active_union)],.975),
          'natural_G_minus_ruptured_Gstar_marker':percentile([a-b for a,b in zip(natural_marker,edited_marker)],.975)},
        'paired_2x2':{
          'natural_active':dict(Counter(f'{a},{b}' for a,b in zip(natural_union,active_union))),
          'natural_ruptured_marker':dict(Counter(f'{a},{b}' for a,b in zip(natural_marker,edited_marker)))},
        'prespecified_form_strata':{form:stratum_summary([r for r in rows if r['graft']['form']==form])
                                    for form in ('split_existing_stop','close_open_frame')},
        'secondary':{'founder_survival':survival,'founder_restricted_lifetime':lifetimes,
                     'descendant_births':births,'sequence_collision':collision,
                     'scramble':scramble_summary(rows),
                     'natural_minus_00_homologous_marker':percentile([a-b for a,b in zip(natural_marker,marker_00)])}}
    (a.run_dir/'analysis.json').write_text(json.dumps(out,sort_keys=True,indent=2)+'\n')
    print(json.dumps(out,sort_keys=True,indent=2))


if __name__=='__main__':main()
