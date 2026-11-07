"""Independent audit of the saved calibration trace and intervention summary."""
import collections
import hashlib
import json
import math
import sys
from pathlib import Path

if len(sys.argv) not in (3,4):
    raise SystemExit('Usage: audit-gate-contrast.py PLAN OUTPUT_DIRECTORY [ADAPTIVE_SOURCE_TRACE]')
plan_bytes = Path(sys.argv[1]).read_bytes()
plan = json.loads(plan_bytes)
out = Path(sys.argv[2])
result = json.loads((out / 'result.json').read_bytes())
trace_bytes = (out / 'trace.jsonl').read_bytes()
assert hashlib.sha256(plan_bytes).hexdigest() == result['planSha256']
assert hashlib.sha256(trace_bytes).hexdigest() == result['traceSha256']
assert result['scriptSha256'] == plan['scriptSha256']
source_summary = None
if len(sys.argv) == 4:
    source = Path(sys.argv[3]).read_bytes()
    assert hashlib.sha256(source).hexdigest() == plan['adaptiveSourceTraceSha256']
    pairs = collections.Counter()
    for raw in source.splitlines():
        item=json.loads(raw)
        if item.get('condition')=='live' and item.get('phase')=='exposure':
            v=item['offer']['attentionVector']
            assert len(v)==10 and all(math.isclose(a,b,abs_tol=1e-12) for a,b in zip(sorted(v),sorted(plan['weights'])))
            pairs[(v[3],v[6])] += 1
    assert pairs=={(0.055,0.115):1162,(0.115,0.055):758}
    source_summary={'observations':sum(pairs.values()),'pair055_115':pairs[(0.055,0.115)],
                    'pair115_055':pairs[(0.115,0.055)]}
records = [json.loads(line) for line in trace_bytes.splitlines()]
assert len(records) == 2208
burnin_counts = collections.Counter()
histories = {h['id']: h for h in result['histories']}
assert set(histories) == set(range(1, 17))
offers = {}
admissions = collections.Counter()
stats = collections.defaultdict(collections.Counter)
vectors = {}
for row in records:
    offered = row['offered']
    if row['kind'] == 'burn-in':
        assert offered is not None
        burnin_counts[row['history']] += 1
        v = offered['attentionVector']
        assert math.isclose(abs(v[3]-v[6]),0.06,abs_tol=1e-12)
        assert all(math.isclose(a,b,abs_tol=1e-12) for a,b in zip(sorted(v),sorted(plan['weights'])))
        cs=row['candidates']
        assert max(cs,key=lambda c:c['with'])['target']==row['to']
        assert max(cs,key=lambda c:c['without'])['target']==row['withoutAttention']
        continue
    key = (row['history'], row['mode'], row['arm'])
    if offered is not None:
        event = offered['eventId']
        assert event not in offers
        assert hashlib.sha256(event.encode()).hexdigest() == offered['sourceDigest']
        assert all(math.isclose(a, b, abs_tol=1e-12) for a,b in zip(sorted(offered['attentionVector']), sorted(plan['weights'])))
        assert len(offered['attentionVector']) == 10
        assert math.isclose(abs(offered['attentionVector'][3]-offered['attentionVector'][6]),0.06,abs_tol=1e-12)
        v = offered['attentionVector']
        assert (v[3] > v[6]) == (row['arm'] == 'target3')
        offers[event] = row['step']
        vectors[(row['history'],row['mode'],row['arm'],int(event.rsplit('-',1)[1]))] = v
        stats[key]['offered'] += 1
        dec = [d for d in row['decisions'] if d['eventId'] == event]
        assert len(dec) == 1
        stats[key][dec[0]['disposition'].lower()] += 1
    candidates = row['candidates']
    assert candidates
    for c in candidates:
        base = c['gate'] + c['memory'] + c['activation'] + c['phase']
        assert math.isclose(base, c['without'], abs_tol=1e-12)
        assert math.isclose(base+c['attention'], c['with'], abs_tol=1e-12)
    # Python max keeps the first element on ties, like the runtime.
    without = max(candidates, key=lambda c:c['without'])['target']
    actual = max(candidates, key=lambda c:c['with'])['target']
    assert actual == row['to'] and without == row['withoutAttention']
    admitted = [d for d in row['decisions'] if d['disposition']=='ATTEND' and d['applied']]
    assert len(admitted) <= 1
    if admitted and admitted[0]['eventId'].startswith('plant-'):
        event = admitted[0]['eventId']
        assert event in offers
        admissions[event] += 1
        lag = row['step']-offers[event]
        assert row['admittedOriginalStep'] == offers[event]
        assert row['lag'] == lag and lag >= 0
        assert row['pivotal'] == (actual != without)
        stats[key]['admitted'] += 1
        stats[key]['delayed'] += int(lag > 0)
        stats[key]['pivotal'] += int(row['pivotal'])
assert set(burnin_counts)==set(histories) and all(x==plan['burnInSteps'] for x in burnin_counts.values())
assert set(offers)==set(admissions) and all(n==1 for n in admissions.values())
for h in histories.values():
    for mode in ('drained','queued'):
        for arm in ('target3','target6'):
            data=h['modes'][mode][arm]; s=stats[(h['id'],mode,arm)]
            for k in ('offered','admitted','delayed','pivotal'):
                assert s[k] == data[k], (h['id'],mode,arm,k,s[k],data[k])
            assert s['defer'] == data['deferred'] and s['refuse'] == data['refused']
        for t in range(1,plan['exposureSteps']+1):
            a=vectors[(h['id'],mode,'target3',t)];b=vectors[(h['id'],mode,'target6',t)]
            assert a[3]==b[6] and a[6]==b[3]
            assert all(a[i]==b[i] for i in range(10) if i not in (3,6))
        f=h['modes'][mode]['follow']; c=h['modes'][mode]['contrasts']
        for name in ('aa','ab','ba','bb'):
            bg = 'target3' if name in ('aa','ab') else 'target6'
            before=h['modes'][mode][bg]['finalZone'];dwell=0;cross=0
            for z in f[name]['targets']:
                assert (before,z) in ((3,3),(3,6),(6,3))
                dwell += int(before==3 and z==3);cross += int(before==3 and z==6);before=z
            assert dwell==f[name]['dwell3'] and cross==f[name]['cross36']
        assert c['background3Dwell3Difference']==f['aa']['dwell3']-f['ab']['dwell3']
        assert c['background6Dwell3Difference']==f['ba']['dwell3']-f['bb']['dwell3']
        assert c['background3ChangedSteps']==sum(a!=b for a,b in zip(f['aa']['targets'],f['ab']['targets']))
        assert c['background6ChangedSteps']==sum(a!=b for a,b in zip(f['ba']['targets'],f['bb']['targets']))
print(json.dumps({'status':'VERIFIED','histories':len(histories),'traceRecords':len(records),
    'burnInOffers':sum(burnin_counts.values()),'uniqueOffers':len(offers),'verifiedAdmissions':sum(admissions.values()),
    'traceSha256':result['traceSha256'],'adaptiveSource':source_summary}))
