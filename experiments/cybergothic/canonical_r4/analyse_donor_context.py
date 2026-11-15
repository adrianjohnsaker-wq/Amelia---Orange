"""Seed-clustered planned outcome contrasts for donor-context promoters."""
import json
import random
import statistics
from collections import Counter
from pathlib import Path

from donor_context_study import ARMS,context_allowed

DIRECTORY=Path('fresh_donor_36001')
TIMES=('6','12','24','36')
METRICS=('alive','uptake','actions','payload_actions','noop_actions','skipped_positions',
         'quiescent_actions','echo_delivered','echo_skipped','echo_energy_cost')


def mean(xs):return statistics.fmean(xs)


def percentile(xs,p):
    a=sorted(xs);at=(len(a)-1)*p;lo=int(at);hi=min(lo+1,len(a)-1)
    return a[lo]+(a[hi]-a[lo])*(at-lo)


def contrast(rows,a,b,metric,h='24',alpha=.01):
    ds=[mean(float(t['outcomes'][a]['timepoints'][h][metric])-
             float(t['outcomes'][b]['timepoints'][h][metric]) for t in row['trials'])
        for row in rows if row['trials']]
    if not ds:return None
    rng=random.Random(2026111523);n=len(ds)
    boot=[mean(ds[rng.randrange(n)] for _ in range(n)) for _ in range(10000)]
    return {'estimate':mean(ds),'low':percentile(boot,alpha/2),'high':percentile(boot,1-alpha/2),
            'ci_level':1-alpha,'seeds':n,'positive_seeds':sum(x>0 for x in ds),
            'negative_seeds':sum(x<0 for x in ds),'zero_seeds':sum(x==0 for x in ds)}


def main():
    rows=[json.loads(p.read_text()) for p in sorted(DIRECTORY.glob('seed_*.json'))]
    trials=[t for row in rows for t in row['trials']]
    out={'populations':len(rows),'empty_populations':sum(not r['trials'] for r in rows),
         'encounters':len(trials),'branches':len(trials)*len(ARMS),
         'phase_counts':dict(Counter(t['phase'] for t in trials)),
         'donor_zones':dict(Counter(t['provenance']['productive_zone'] for t in trials)),
         'recipient_zones':dict(Counter(t['zone'] for t in trials)),
         'donor_matches_recipient':sum(t['provenance']['productive_zone']==t['zone'] for t in trials),
         'donor_syzygy_is_recipient':sum(t['provenance']['productive_syzygy']==t['zone'] for t in trials),
         'multiple_peak_zones':sum(len(t['provenance']['peak_tie_zones'])>1 for t in trials),
         'one_donor_sample':sum(t['provenance']['sample_count']==1 for t in trials),
         'identical_payloads':sum(t['alternatives']['experienced']['code']==t['alternatives']['shuffled']['code'] for t in trials),
         'exclusions':dict(sum((Counter(r['exclusions']) for r in rows),Counter())),
         'summaries':{},'primary':{},'secondary':{},'compliance':{}}
    for h in TIMES:
        out['summaries'][h]={}
        for arm in ARMS:
            entries=[t['outcomes'][arm]['timepoints'][h] for t in trials]
            out['summaries'][h][arm]={k:{'encounter_mean':mean(float(e[k]) for e in entries),
                'seed_weighted_mean':mean(mean(float(t['outcomes'][arm]['timepoints'][h][k])
                                              for t in r['trials']) for r in rows if r['trials'])}
                for k in METRICS}
    for ref in ('open_slide','rotated_slide','productive_jump','encounter_slide','shuffled_slide'):
        out['primary'][f'uptake_24_productive_slide_minus_{ref}']=contrast(rows,'productive_slide',ref,'uptake')
    for h in ('12','24','36'):
        for arm in ('open_slide','productive_jump','rotated_slide','encounter_slide','shuffled_slide','syzygy_slide'):
            for metric in ('alive','uptake','payload_actions','noop_actions','skipped_positions','echo_energy_cost'):
                out['secondary'][f'{metric}_{h}_productive_slide_minus_{arm}']=contrast(
                    rows,'productive_slide',arm,metric,h,alpha=.05)
    for arm in ARMS:
        chosen=noops=jumped=fragments=violations=other=0
        for t in trials:
            r=t['outcomes'][arm]
            for d in r['decisions']:
                c=d['choice'];z=d['zone'];mode=r['mode'];offset=r['offset']
                if d['agent']!=t['host']:other+=1
                if c['kind']=='payload':chosen+=1;violations+=not context_allowed(mode,c['header'],z,offset)
                elif c['kind']=='nop':
                    noops+=1
                    if c['reason']=='out_of_zone':violations+=context_allowed(mode,c['header'],z,offset)
                    else:fragments+=1
                for s in c['skipped']:
                    if s['kind']=='payload':jumped+=1;violations+=context_allowed(mode,s['header'],z,offset)
                    elif s['kind']=='fragmented':fragments+=1
        out['compliance'][arm]={'payload_executions_all_hosts':chosen,'nop_actions_all_hosts':noops,
              'jumped_payload_positions_all_hosts':jumped,'fragmented_positions_held':fragments,
              'decisions_other_hosts':other,'rule_violations':violations}
    (DIRECTORY/'analysis.json').write_text(json.dumps(out,sort_keys=True,indent=2)+'\n')
    print(json.dumps({k:out[k] for k in ('populations','encounters','branches','phase_counts',
          'donor_matches_recipient','donor_syzygy_is_recipient','multiple_peak_zones','one_donor_sample',
          'identical_payloads','exclusions','primary','compliance')},indent=2))


if __name__=='__main__':main()
