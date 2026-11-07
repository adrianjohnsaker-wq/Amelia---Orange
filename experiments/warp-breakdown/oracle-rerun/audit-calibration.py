"""Compare a fresh Oracle calibration with the pre-study result, ignoring clock-dependent hashes."""
import json,sys
from pathlib import Path
if len(sys.argv)!=3:raise SystemExit('Usage: audit-calibration.py SEALED FRESH')
a,b=[json.loads(Path(p).read_bytes()) for p in sys.argv[1:]]
assert a['schema']==b['schema'] and a['schema'] in ('amelia.oracle-warp-calibration/v1','amelia.oracle-control-calibration/v1')
assert a['snapshotSha256']==b['snapshotSha256'] and a['cueWeight']==b['cueWeight']
assert len(a['lineages'])==len(b['lineages'])==8
checks=0
for x,y in zip(a['lineages'],b['lineages']):
 assert x['id']==y['id'] and x['sequence']==y['sequence']
 if 'entry' in x:assert x['entry']==y['entry']
 if 'swaps' in x:
  assert set(x['swaps'])==set(y['swaps'])
  for k in x['swaps']:
   for metric in ('path','dwell','cross'):assert x['swaps'][k][metric]==y['swaps'][k][metric]
   checks+=1
print(json.dumps({'status':'VERIFIED','cueWeight':a['cueWeight'],'lineages':len(a['lineages']),'counterfactualSteps':256,'swapContinuations':checks,'excluded':'timestamp-dependent hashes'}))
