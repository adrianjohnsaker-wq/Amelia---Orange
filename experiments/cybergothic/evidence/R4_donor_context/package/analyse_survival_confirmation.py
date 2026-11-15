"""Fresh-seed confirmation of the discovered no-op vs jump survival contrast."""
import json
import random
import statistics
from collections import Counter
from pathlib import Path

DIRECTORY=Path('fresh_survival_37001')
ARMS=('open_slide','productive_jump','productive_slide','rotated_slide',
      'encounter_slide','shuffled_slide','syzygy_slide')


def mean(xs):return statistics.fmean(xs)


def percentile(xs,p):
    a=sorted(xs);at=(len(a)-1)*p;lo=int(at);hi=min(lo+1,len(a)-1)
    return a[lo]+(a[hi]-a[lo])*(at-lo)


def contrast(rows,a,b,metric,h='24'):
    ds=[mean(float(t['outcomes'][a]['timepoints'][h][metric])-
             float(t['outcomes'][b]['timepoints'][h][metric]) for t in r['trials'])
        for r in rows if r['trials']]
    rng=random.Random(2026111529);n=len(ds)
    boot=[mean(ds[rng.randrange(n)] for _ in range(n)) for _ in range(10000)]
    return {'estimate':mean(ds),'low':percentile(boot,.025),'high':percentile(boot,.975),
            'ci_level':.95,'seeds':n,'positive_seeds':sum(v>0 for v in ds),
            'negative_seeds':sum(v<0 for v in ds),'zero_seeds':sum(v==0 for v in ds)}


def main():
    rows=[json.loads(p.read_text()) for p in sorted(DIRECTORY.glob('seed_*.json'))]
    trials=[t for r in rows for t in r['trials']]
    out={'populations':len(rows),'empty_populations':sum(not r['trials'] for r in rows),
         'encounters':len(trials),'branches':len(trials)*len(ARMS),
         'phase_counts':dict(Counter(t['phase'] for t in trials)),
         'primary':contrast(rows,'productive_slide','productive_jump','alive'),
         'secondary':{},'arms':{},'exclusions':dict(sum((Counter(r['exclusions']) for r in rows),Counter()))}
    for arm in ARMS:
        raw=[t['outcomes'][arm] for t in trials]
        deaths=Counter(r['death']['cause'] for r in raw if r['death'] and r['death']['time']<=24)
        out['arms'][arm]={'alive':sum(r['timepoints']['24']['alive'] for r in raw),
                         'deaths_by_cause':dict(deaths),
                         'seed_weighted_survival':mean(mean(float(t['outcomes'][arm]['timepoints']['24']['alive']) for t in r['trials']) for r in rows if r['trials']),
                         'seed_weighted_uptake':mean(mean(t['outcomes'][arm]['timepoints']['24']['uptake'] for t in r['trials']) for r in rows if r['trials'])}
    for ref in ('open_slide','rotated_slide','encounter_slide','shuffled_slide','syzygy_slide'):
        out['secondary'][f'alive_24_productive_slide_minus_{ref}']=contrast(rows,'productive_slide',ref,'alive')
    for h in ('12','24','36'):
        out['secondary'][f'uptake_{h}_productive_slide_minus_productive_jump']=contrast(rows,'productive_slide','productive_jump','uptake',h)
        out['secondary'][f'alive_{h}_productive_slide_minus_productive_jump']=contrast(rows,'productive_slide','productive_jump','alive',h)
    (DIRECTORY/'survival_analysis.json').write_text(json.dumps(out,indent=2,sort_keys=True)+'\n')
    print(json.dumps({k:out[k] for k in ('populations','encounters','branches','phase_counts','primary','arms')},indent=2))


if __name__=='__main__':main()
