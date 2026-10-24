#!/usr/bin/env python3
"""PF4 G3f historical Quicknet feasibility — authenticated sampled past rounds.

Pure engineering QA: no PF2/C1/PF1 state, no lease, no genesis mutation,
no future endpoint, no prospective registration. Source BLS verification
uses frozen Amelia-0.4 C1 code pinned at f1875b5....
Exactly ten non-overlapping 14-day historical worlds, starting at the
first Quicknet round multiple 20 at/after June 1, 2026 00:00 UTC.
This sampled audit DOES NOT represent 201,600 verified full ticks.
"""
import hashlib,json,pathlib,sys,time
from datetime import datetime,timezone,timedelta
from drift1a_c1.beacon import LiveBeacon,current_round,round_time,QUICKNET

CHAIN="52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971"
GENESIS=1692803367
PERIOD=3;STRIDE=20;TICKS=20160;WORLDS=10
ROOT=pathlib.Path('/tmp/pf4-historical-g3f')
def h(v):return hashlib.sha256(v).hexdigest()
def world_spec():
  assert QUICKNET['chain_hash']==CHAIN and QUICKNET['genesis_time']==GENESIS
  date=datetime(2026,6,1,tzinfo=timezone.utc)
  t0=int(date.timestamp())
  first=(t0-GENESIS+PERIOD-1)//PERIOD+1
  first=((first+STRIDE-1)//STRIDE)*STRIDE
  assert round_time(first)>=t0 and (first%20)==0
  specs=[]
  for i in range(WORLDS):
    start=first+i*TICKS*STRIDE
    end=start+(TICKS-1)*STRIDE
    assert round_time(end)<datetime(2026,10,24,tzinfo=timezone.utc).timestamp()
    for r in (start,end):assert r%20==0
    specs.append({'i':i+1,'startRound':start,'endRound':end,
      'startUTC':datetime.fromtimestamp(round_time(start),timezone.utc).isoformat(),
      'endUTC':datetime.fromtimestamp(round_time(end),timezone.utc).isoformat(),
      'ticks':TICKS,
      'sampleRounds':[start,start+((TICKS//2)*STRIDE),end]})
  assert specs[-1]['endUTC'].startswith('2026-10-18')
  assert len({q for x in specs for q in x['sampleRounds']})==30
  return specs
def main():
  if len(sys.argv)==2 and sys.argv[1]=='--self-test':
    w=world_spec()
    assert len(w)==10 and w[0]['startRound']==29156220
    assert w[-1]['endRound']==33188200
    print('PF4_G3F_HISTORICAL_ROUND_GRID_STRUCTURE_PASS',json.dumps({
      'first':w[0]['startUTC'],'last':w[-1]['endUTC'],'tenWorlds':len(w)}))
    return
  if sys.argv[1:]!=['--fetch-sample']:raise SystemExit('Use --self-test or --fetch-sample')
  w=world_spec()
  latest=current_round(time.time()-60)
  assert all(x['endRound']<latest for x in w),'HISTORICAL_WORLD_NOT_PUBLISHED'
  b=LiveBeacon()
  verified=[]
  for x in w:
    for r in x['sampleRounds']:
      record=b.fetch(r)
      b.verify(record,r)  # strict pinned chain/key and independent BLS group check
      assert record['round']==r
      assert h(bytes.fromhex(record['signature']))==record['randomness']
      verified.append({'world':x['i'],'round':r,
        'randomness':record['randomness'],
        'signatureSHA256':h(bytes.fromhex(record['signature'])),
        'scheme':'REAL_BLS_VERIFIED'})
  assert len(verified)==30
  out={'schema':'PF4_G3F_HISTORICAL_SAMPLED_BLS_FEASIBILITY_V1',
     'status':'PASS_SAMPLED_NOT_FULL_201600_TICKS',
     'chainHash':CHAIN,'c1VerifierPinnedCommit':'f1875b5eea5339eb1ac73e50b5df6b103d0cabe9',
     'readOnly':True,'observedFutureRounds':False,'sealedProspectively':False,
     'sampling':'FIRST_MID_LAST_ROUND_PER_14DAY_WORLD',
     'sampleVerified':len(verified),'totalHistoricalTicksRequired':WORLDS*TICKS,
     'allPhysicalHistoricalWindowsFullyDownloaded':False,
     'allPhysicalHistoricalWindowsFullyBLSVerified':False,
     'allPhysicalHistoricalWindowsRmeanComputed':False,
     'windows':w,'samples':verified}
  ROOT.mkdir(parents=True,exist_ok=True)
  (ROOT/'PF4_G3F_SAMPLE_HISTORY.json').write_text(json.dumps(out,indent=2)+'\n')
  print('PF4_G3F_HISTORICAL_QUICKNET_BLS_SAMPLING_PASS',json.dumps({
    'sampleVerified':len(verified),'fullTicksRequired':WORLDS*TICKS,
    'start':w[0]['startUTC'],'end':w[-1]['endUTC'],
    'fullWindowRmean':'NOT_YET_COMPUTED'}))
if __name__=="__main__":main()
