"""Fresh-seed confirmation of self-parser versus literal agent-time."""
import json
import random
import statistics
from pathlib import Path

DIRECTORY=Path('fresh_grammar_40001')


def mean(xs):return statistics.fmean(xs)
def percentile(xs,p):
    a=sorted(xs);at=(len(a)-1)*p;lo=int(at);hi=min(lo+1,len(a)-1)
    return a[lo]+(a[hi]-a[lo])*(at-lo)
def contrast(rows,key):
    ds=[float(r['results']['self'][key])-float(r['results']['literal'][key]) for r in rows]
    rng=random.Random(2026111541);n=len(ds)
    s=[mean(ds[rng.randrange(n)] for _ in range(n)) for _ in range(10000)]
    return {'estimate':mean(ds),'low':percentile(s,.025),'high':percentile(s,.975),'ci_level':.95,
            'seeds':n,'positive':sum(v>0 for v in ds),'negative':sum(v<0 for v in ds),'zero':sum(v==0 for v in ds)}


def main():
    rows=[json.loads(p.read_text()) for p in sorted(DIRECTORY.glob('seed_*.json'))]
    out={'populations':len(rows),'branches':len(rows)*4,
         'primary':contrast(rows,'agent_time'),
         'secondary':{k:contrast(rows,k) for k in ('total_field_uptake','final_living','meltdowns','archive_births')},
         'means':{m:{k:mean(r['results'][m][k] for r in rows) for k in
                     ('agent_time','total_field_uptake','final_living','meltdowns','archive_births','external_nourishment')}
                  for m in ('self','literal')}}
    (DIRECTORY/'confirmation_analysis.json').write_text(json.dumps(out,sort_keys=True,indent=2)+'\n')
    print(json.dumps(out,indent=2))


if __name__=='__main__':main()
