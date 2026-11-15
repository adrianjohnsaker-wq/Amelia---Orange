"""Seed-clustered planned contrasts for the promoter-echo study."""
import json
import random
import statistics
from collections import Counter
from pathlib import Path

from promoter_study import ARMS,allele_allowed

DIRECTORY=Path('fresh_promoter_35001')
TIMES=('6','12','24','36')
METRICS=('alive','uptake','actions','payload_actions','suppressed_actions',
         'fragmented_skips','quiescent_actions','echo_delivered','echo_skipped','echo_energy_cost')


def mean(x):return statistics.fmean(x)


def percentile(xs,p):
    a=sorted(xs);at=(len(a)-1)*p;lo=int(at);hi=min(lo+1,len(a)-1)
    return a[lo]+(a[hi]-a[lo])*(at-lo)


def contrast(rows,a,b,metric,h='24',alpha=.05/3):
    ds=[mean(float(t['outcomes'][a]['timepoints'][h][metric])-
             float(t['outcomes'][b]['timepoints'][h][metric]) for t in row['trials'])
        for row in rows if row['trials']]
    if not ds:return None
    n=len(ds);rng=random.Random(2026111519)
    samples=[mean(ds[rng.randrange(n)] for _ in range(n)) for _ in range(10000)]
    return {'estimate':mean(ds),'low':percentile(samples,alpha/2),'high':percentile(samples,1-alpha/2),
            'ci_level':1-alpha,'seeds':n,'positive_seeds':sum(x>0 for x in ds),
            'negative_seeds':sum(x<0 for x in ds),'zero_seeds':sum(x==0 for x in ds)}


def main():
    rows=[json.loads(p.read_text()) for p in sorted(DIRECTORY.glob('seed_*.json'))]
    trials=[t for row in rows for t in row['trials']]
    result={'populations':len(rows),'empty_populations':sum(not r['trials'] for r in rows),
            'encounters':len(trials),'branches':len(trials)*len(ARMS),
            'phase_counts':dict(Counter(t['phase'] for t in trials)),
            'encounter_zones':dict(Counter(t['zone'] for t in trials)),
            'identical_payloads':sum(t['alternatives']['experienced']['code']==
                                     t['alternatives']['shuffled']['code'] for t in trials),
            'exclusions':dict(sum((Counter(r['exclusions']) for r in rows),Counter())),
            'summaries':{},'primary':{},'secondary':{},'compliance':{}}
    for h in TIMES:
        result['summaries'][h]={}
        for arm in ARMS:
            entries=[t['outcomes'][arm]['timepoints'][h] for t in trials]
            result['summaries'][h][arm]={k:{'encounter_mean':mean(float(e[k]) for e in entries),
                'seed_weighted_mean':mean(mean(float(t['outcomes'][arm]['timepoints'][h][k])
                                              for t in r['trials']) for r in rows if r['trials'])}
                for k in METRICS}
    for ref in ('open','rotated','zone_shuffled'):
        result['primary'][f'uptake_24_zone_minus_{ref}']=contrast(rows,'zone',ref,'uptake')
    for h in ('12','24','36'):
        for arm in ('open','rotated','zone_shuffled','syzygy'):
            for metric in ('alive','uptake','payload_actions','suppressed_actions','echo_energy_cost'):
                result['secondary'][f'{metric}_{h}_zone_minus_{arm}']=contrast(rows,'zone',arm,metric,h,alpha=.05)
    for arm in ARMS:
        chosen=blocked=fragments=violations=other_agents=mutated_headers=0
        for t in trials:
            for d in t['outcomes'][arm]['decisions']:
                c=d['choice']
                if d['agent']!=t['host']:other_agents+=1
                if c['kind']=='payload':
                    chosen+=1;violations+=not allele_allowed(arm,c['header'],d['zone'])
                    mutated_headers+=c['header']!=t['zone']
                for skipped in c['skipped']:
                    if skipped['kind']=='payload':
                        blocked+=1;violations+=allele_allowed(arm,skipped['header'],d['zone'])
                    elif skipped['kind']=='fragmented':fragments+=1
        result['compliance'][arm]={'payload_executions_all_hosts':chosen,'blocked_payload_positions_all_hosts':blocked,
            'fragmented_positions_skipped_all_hosts':fragments,'decisions_by_other_hosts':other_agents,
            'payload_executions_with_header_changed_from_initial':mutated_headers,'rule_violations':violations}
    (DIRECTORY/'analysis.json').write_text(json.dumps(result,sort_keys=True,indent=2)+'\n')
    print(json.dumps({k:result[k] for k in ('populations','encounters','branches','phase_counts',
          'identical_payloads','primary','compliance')},indent=2))


if __name__=='__main__':main()
