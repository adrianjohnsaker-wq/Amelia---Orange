"""Seed-clustered analysis of prespecified viral-echo endpoints."""
import json
import random
import statistics
from collections import Counter, defaultdict
from pathlib import Path

ARMS = ('natural', 'experienced_echo', 'shuffled_echo')
TIMES = ('3', '6', '12', '24', '36')
METRICS = ('alive', 'intact', 'original_intact', 'uptake', 'actions',
           'tagged_executions', 'echo_delivered', 'echo_skipped', 'echo_energy_cost')


def mean(items):
    return statistics.fmean(items)


def percentile(values, p):
    values = sorted(values)
    at = (len(values)-1)*p
    lo = int(at)
    hi = min(lo+1, len(values)-1)
    return values[lo] + (values[hi]-values[lo])*(at-lo)


def paired(seed_rows, a, b, key, time='24', alpha=.025):
    diffs = [mean(float(t['outcomes'][a]['timepoints'][time][key]) -
                  float(t['outcomes'][b]['timepoints'][time][key]) for t in row['trials'])
             for row in seed_rows if row['trials']]
    if not diffs:
        return None
    rng = random.Random(2026111511)
    n = len(diffs)
    boots = [mean(diffs[rng.randrange(n)] for _ in range(n)) for _ in range(10000)]
    return {'estimate':mean(diffs),'ci_level':1-alpha,
            'low':percentile(boots, alpha/2),'high':percentile(boots, 1-alpha/2),
            'seed_count':n,'positive_seeds':sum(x>0 for x in diffs),
            'negative_seeds':sum(x<0 for x in diffs),'zero_seeds':sum(x==0 for x in diffs)}


def main():
    directory = Path('fresh_echo_34001')
    rows = [json.loads(p.read_text()) for p in sorted(directory.glob('seed_*.json'))]
    trials = [t for r in rows for t in r['trials']]
    result = {'populations':len(rows), 'seeds_without_encounters':sum(not r['trials'] for r in rows),
              'encounters':len(trials),'phase_counts':dict(Counter(t['phase'] for t in trials)),
              'identical_experienced_shuffled':sum(t['alternatives']['experienced']['code'] ==
                                                   t['alternatives']['shuffled']['code'] for t in trials),
              'exclusions':dict(sum((Counter(r['exclusions']) for r in rows),Counter())),
              'summaries':{},'primary':{},'secondary':{},'natural_first_loss_24':{}}
    for time in TIMES:
        result['summaries'][time] = {}
        for arm in ARMS:
            entries = [t['outcomes'][arm]['timepoints'][time] for t in trials]
            result['summaries'][time][arm] = {
                k: {'encounter_mean':mean(float(x[k]) for x in entries),
                    'seed_weighted_mean':mean(mean(float(t['outcomes'][arm]['timepoints'][time][k])
                                                   for t in r['trials']) for r in rows if r['trials'])}
                for k in METRICS}
    result['primary']['intact_24_experienced_echo_minus_natural'] = paired(rows, 'experienced_echo','natural','intact')
    result['primary']['uptake_24_experienced_echo_minus_shuffled_echo'] = paired(rows,'experienced_echo','shuffled_echo','uptake')
    for time in ('12','24','36'):
        for metric in ('alive','original_intact','uptake','tagged_executions','echo_delivered','echo_energy_cost'):
            result['secondary'][f'{metric}_{time}_experienced_echo_minus_shuffled_echo'] = paired(
                rows,'experienced_echo','shuffled_echo',metric,time,alpha=.05)
        for metric in ('alive','original_intact','uptake','tagged_executions'):
            result['secondary'][f'{metric}_{time}_experienced_echo_minus_natural'] = paired(
                rows,'experienced_echo','natural',metric,time,alpha=.05)
    for t in trials:
        r = t['outcomes']['natural']
        loss, death = r['first_loss'],r['first_death']
        if loss is not None and loss['time'] <= 24:
            key='loss_before_death:'+loss['event']
        elif death is not None and death['time'] <= 24:
            key='death_without_prior_loss:'+str(death['cause'])
        else:
            key='no_loss_or_death_by_24'
        result['natural_first_loss_24'][key]=result['natural_first_loss_24'].get(key,0)+1
    result['branches'] = len(trials)*3
    result['total_delivered_echoes']={arm:sum(t['outcomes'][arm]['timepoints']['36']['echo_delivered'] for t in trials) for arm in ARMS}
    result['total_skipped_echoes']={arm:sum(t['outcomes'][arm]['timepoints']['36']['echo_skipped'] for t in trials) for arm in ARMS}
    (directory/'analysis.json').write_text(json.dumps(result,sort_keys=True,indent=2)+'\n')
    print(json.dumps({'populations':result['populations'],'encounters':result['encounters'],
                      'phase_counts':result['phase_counts'],'identical':result['identical_experienced_shuffled'],
                      'primary':result['primary'],'natural_first_loss_24':result['natural_first_loss_24'],
                      'delivered_36':result['total_delivered_echoes'],'skipped_36':result['total_skipped_echoes']}, indent=2))


if __name__ == '__main__':
    main()
