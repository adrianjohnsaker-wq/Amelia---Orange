"""Fresh confirmation of two selected host-survival contrasts."""
import json
from collections import Counter
from pathlib import Path

from analyse_stop import get,interval,interaction
from stop_trial import ARMS

OUT=Path('fresh_stop_confirm_43001')


def diff(rows,a,b,window,metric,level=.95):
    return interval([get(r,a,window,metric)-get(r,b,window,metric) for r in rows],level)


def main():
    rows=[json.loads(p.read_text()) for p in sorted(OUT.glob('seed_*.json'))]
    assert len(rows)==120 and {r['seed'] for r in rows}==set(range(43001,43121))
    s=[r for r in rows if r['eligible']]; n=len(s)
    means={}
    for arm in ARMS:
        means[arm]={}
        for window,metric in [('long','survived'),('short','first_action_nop'),
                              ('short','first_action_reads_payload'),('short','first_action_performed'),
                              ('short','first_action_nutrient'),('long','total_target_nutrient'),
                              ('long','descendant_births'),('long','lineage_direct_transmissions'),
                              ('long','lineage_vector_deliveries')]:
            vals=[get(r,arm,window,metric) for r in s]
            means[arm][f'{window}_{metric}']={'mean':sum(vals)/n,'sum':sum(vals)}
    primary={
      'intact_minus_ruptured_survival_24':diff(s,'intact_transfer','ruptured_transfer','long','survived',.975),
      'intact_minus_active_survival_24':diff(s,'intact_transfer','active_transfer','long','survived',.975)}
    secondary={
      'intact_minus_ruptured_exposure_survival_24':diff(s,'intact_exposure','ruptured_exposure','long','survived'),
      'intact_minus_active_exposure_survival_24':diff(s,'intact_exposure','active_exposure','long','survived'),
      'rupture_transfer_interaction_survival_24':interaction(s,'ruptured_transfer','ruptured_exposure',
           'intact_transfer','intact_exposure','long','survived',.95),
      'active_transfer_interaction_survival_24':interaction(s,'active_transfer','active_exposure',
           'intact_transfer','intact_exposure','long','survived',.95),
      'rupture_transfer_interaction_first_nutrient':interaction(s,'ruptured_transfer','ruptured_exposure',
           'intact_transfer','intact_exposure','short','first_action_nutrient',.95),
      'ruptured_minus_intact_transfer_noop':diff(s,'ruptured_transfer','intact_transfer','short','first_action_nop'),
      'active_minus_intact_transfer_noop':diff(s,'active_transfer','intact_transfer','short','first_action_nop')}
    inv=Counter()
    for r in rows:inv.update(r['inventory'])
    out={'populations_screened':len(rows),'eligible_populations':n,'branches':n*len(ARMS),
         'noneligible_seeds':[r['seed'] for r in rows if not r['eligible']],
         'primary':primary,'secondary':secondary,'means':means,'natural_inventory':dict(inv)}
    (OUT/'analysis.json').write_text(json.dumps(out,indent=2,sort_keys=True)+'\n')
    print(json.dumps(out,indent=2,sort_keys=True))


if __name__=='__main__':main()
