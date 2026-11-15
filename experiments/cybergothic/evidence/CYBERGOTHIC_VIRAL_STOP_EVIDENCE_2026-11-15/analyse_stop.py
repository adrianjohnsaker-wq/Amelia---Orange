"""Preplanned seed-paired interaction analysis of the viral-stop experiment."""
import json
import random
from collections import Counter
from pathlib import Path

from stop_trial import ARMS

OUT=Path('fresh_viral_stop_42001')


def interval(values,level=.95,seed=100017):
    n=len(values)
    if not n:return None
    rng=random.Random(seed)
    draws=sorted(sum(values[rng.randrange(n)] for _ in range(n))/n for _ in range(10000))
    q=(1-level)/2
    return {'n':n,'estimate':sum(values)/n,'low':draws[int(q*len(draws))],
            'high':draws[min(len(draws)-1,int((1-q)*len(draws)))], 'ci_level':level}


def get(row,arm,window,metric):return row['outputs'][arm][window][metric]


def contrast(rows,a,b,window,metric,level=.95):
    return interval([get(r,a,window,metric)-get(r,b,window,metric) for r in rows],level)


def interaction(rows,t1,e1,t0,e0,window,metric,level=.975):
    return interval([(get(r,t1,window,metric)-get(r,e1,window,metric))-
                     (get(r,t0,window,metric)-get(r,e0,window,metric)) for r in rows],level)


def main():
    rows=[json.loads(p.read_text()) for p in sorted(OUT.glob('seed_*.json'))]
    assert len(rows)==120 and {r['seed'] for r in rows}==set(range(42001,42121))
    selected=[r for r in rows if r['eligible']]
    assert all(tuple(r['outputs'])==tuple(sorted(ARMS)) for r in selected)
    inventory=Counter()
    for r in rows:inventory.update(r['inventory'])
    primary={}
    for key,window,metric in [('first_nutrient','short','first_action_nutrient'),
                              ('survival_24','long','survived')]:
        primary[key]=interaction(selected,'ruptured_transfer','ruptured_exposure',
                                  'intact_transfer','intact_exposure',window,metric)
    measures={}
    for arm in ARMS:
        measures[arm]={}
        for window in ('short','long'):
            keys=('survived','first_action_nutrient','first_action_performed','first_action_nop',
                  'first_action_reads_payload','target_actions','total_target_nutrient',
                  'descendant_births','living_descendants','lineage_direct_transmissions',
                  'lineage_vector_deliveries','lineage_vector_sheds')
            measures[arm][window]={k:sum(get(r,arm,window,k) for r in selected)/len(selected) for k in keys}
    secondary={}
    comps=[('ruptured_transfer','intact_transfer'),('intact_transfer','intact_exposure'),
           ('ruptured_transfer','ruptured_exposure'),('active_transfer','intact_transfer'),
           ('active_transfer','active_exposure')]
    for a,b in comps:
        for window,metric in [('short','first_action_nutrient'),('short','first_action_nop'),
                              ('long','survived'),('long','total_target_nutrient'),
                              ('long','descendant_births'),('long','lineage_direct_transmissions')]:
            secondary[f'{a}_minus_{b}_{window}_{metric}']=contrast(selected,a,b,window,metric)
    secondary['active_vs_intact_transfer_interaction_first_nutrient']=interaction(
        selected,'active_transfer','active_exposure','intact_transfer','intact_exposure',
        'short','first_action_nutrient',.95)
    secondary['active_vs_intact_transfer_interaction_survival_24']=interaction(
        selected,'active_transfer','active_exposure','intact_transfer','intact_exposure',
        'long','survived',.95)
    result={'populations_screened':len(rows),'eligible_populations':len(selected),
            'noneligible_seeds':[r['seed'] for r in rows if not r['eligible']],
            'branches':len(selected)*len(ARMS),'natural_inventory':dict(inventory),
            'primary':primary,'means':measures,'secondary_exploratory':secondary}
    (OUT/'analysis.json').write_text(json.dumps(result,sort_keys=True,indent=2)+'\n')
    print(json.dumps(result,sort_keys=True,indent=2))


if __name__=='__main__':main()
