"""PF2 registered day30 fixed evaluation, never interim. Create-only archive.
At exactly 43,200 admitted ticks assess P2-1 and P2-2 without changing any
frozen science; when P2-2 has fewer than 10 eligible post-third deaths,
pre-registered deferral to 86,400 ticks. Never evaluate any other test.
If replay crossed boundary between batches, use exact first 43200 signed
rows, not an outcome-selected period. No notifications.
"""
import json,pathlib,hashlib,sys
ROOT=pathlib.Path('experiments/pf2/live')
OUT=ROOT/'DAY30_REGISTERED_EVALUATION.json'
ARMS=('C','R01','R02','R03','R04','R05','R06','R07','R08')
def main():
 g=json.loads((ROOT/'GENESIS.json').read_text())
 state=json.loads((ROOT/'STATE.json').read_text())
 if state['admittedTicks']<43200:
  print('PF2_DAY30_NOT_DUE',state['admittedTicks']);return
 if OUT.exists():
  print('PF2_DAY30_ALREADY_COMMITTED_NO_REEVALUATION');return
 deaths={a:{'learner':[],'unchanged':[]} for a in ARMS}
 n=0
 for path in sorted((ROOT/'chunks').glob('*.json')):
  chunk=json.loads(path.read_text())
  assert chunk['verifiedStatus']=='PASS' and chunk['startTick']==n
  for row in chunk['rows']:
   assert row['tick']==n and row['round']==g['R0']+n*20
   if n<43200:
    for ev in row['armEvents']:
     if ev.get('death'):
      deaths[ARMS[ev['k']]][ev['mode']].append({
       'tick':ev['tick'],'fatalCue':ev['cueZone'],
       'cuedIntoSink':ev['cueZone']==5})
   n+=1
 if n!=state['admittedTicks']:raise RuntimeError('PF2_INCOMPLETE_SIGNED_PREFIX')
 learner=sum(len(x['learner']) for x in deaths.values())
 control=sum(len(x['unchanged']) for x in deaths.values())
 postthird=[rec for x in deaths.values() for rec in x['learner'][3:]]
 qualified=len(postthird)
 cued=sum(x['cuedIntoSink'] for x in postthird)
 if control==0: # cannot divide by zero and no relaxation was registered
  held1=(learner==0)
  ratio=None
 else:
  ratio=learner/control;held1=learner<=.35*control
 eligible2=qualified>=10
 p2_2={'eligibility': 'ELIGIBLE_DAY30' if eligible2 else 'DEFER_TO_DAY60_AS_REGISTERED',
  'postThirdDeaths':qualified,'postThirdDeathsWithFatalCue5':cued,
  'fatalCue5Fraction':cued/qualified if qualified else None,
  'heldOrFailed': ('HELD' if cued>=.85*qualified else 'FAILED') if eligible2 else 'NOT_EVALUABLE_DAY30'}
 payload={'schema':'PF2_REGISTERED_DAY30_ONCE_V1',
  'genesisDigest':g['genesisDigest'],'R0':g['R0'],
  'exactPrefixAdmittedTicks':43200,
  'window':'first 43200 consecutive, individually BLS-verified, per-minute rounds',
  'P2_1':{'learnerDeaths':learner,'unchangedDeaths':control,
   'ratio':ratio,'registeredUpperRatio':.35,
   'heldOrFailed':'HELD' if held1 else 'FAILED'},
  'P2_2':p2_2,
  'posthocCorrections':0,'perPairFatalCues':deaths,
  'noNotifications':True,'outputRepoOnly':True,'C1Unchanged':True,'PF1Unchanged':True}
 with OUT.open('x') as f:f.write(json.dumps(payload,sort_keys=True,indent=2)+'\n')
 print('PF2_DAY30_REGISTERED_ONCE_COMMITTED_INPUT_READY',json.dumps({
  'P2_1':payload['P2_1']['heldOrFailed'],'P2_2':p2_2['heldOrFailed'],
  'eligibleP2_2':eligible2,'notifications':0}))
if __name__=='__main__':main()
