"""Unadjusted, post-outcome lineage and payload-read descriptions."""
import json
from pathlib import Path
from analyse_stop import get,interval

OUT=Path('fresh_stop_replication_44001')
rows=[json.loads(p.read_text()) for p in sorted(OUT.glob('seed_*.json'))]
s=[r for r in rows if r['eligible']]
metrics=('descendant_births','living_descendants','lineage_direct_transmissions',
         'lineage_vector_deliveries','total_target_nutrient')
comparisons={}
for metric in metrics:
    for a,b in [('ruptured_transfer','intact_transfer'),('active_transfer','intact_transfer')]:
        values=[get(r,a,'long',metric)-get(r,b,'long',metric) for r in s]
        comparisons[f'{a}_minus_{b}_{metric}']=interval(values)
reads={}
for arm in ('intact_transfer','ruptured_transfer','active_transfer'):
    outcomes=[r['outputs'][arm]['short'] for r in s]
    reads[arm]={'first_action_payload_read':sum(x['first_action_reads_payload'] for x in outcomes),
                'first_action_payload_read_and_nop':sum(x['first_action_reads_payload'] and x['first_action_nop'] for x in outcomes)}
out={'status':'exploratory_unadjusted','eligible_populations':len(s),'comparisons':comparisons,'reads':reads}
(OUT/'exploratory_lineage_analysis.json').write_text(json.dumps(out,indent=2,sort_keys=True)+'\n')
print(json.dumps(out,indent=2,sort_keys=True))
