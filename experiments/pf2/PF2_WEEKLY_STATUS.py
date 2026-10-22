"""PF2 weekly *repository-only* journal status. READ ONLY:
deaths and fatal cues per pair, all 3 cue choices, zone4 refusals,
distinct directed routes per life, candidate and confirmed Rung1
Pandemonium counts per entity and per learner/control pair.
NO inferential evaluation of P2-1/P2-2 before registered day30 tick43200.
No push/email/chat webhook or notifications.
"""
import argparse,collections,datetime,hashlib,json,os,pathlib
ROOT=pathlib.Path('experiments/pf2/live')
PF2=pathlib.Path('experiments/pf2')
NAME_MAP={row['key']:row['name'] for row in json.loads(
  pathlib.Path('experiments/pf1/pandemonium-45.json').read_text())['entries']}
ARMS=['C']+['R%02d'%i for i in range(1,9)]
MODES=('learner','unchanged')
def new_pair(arm,mode):
 return dict(arm=arm,mode=mode,observedTicks=0,
   deaths=0,fatalTicks=[],zone4=dict(choices=0,refusalUncued=0,
    uncuedTotal=0,cuedIntoSink=0,cuedAwaySink=0),
   cueCompliance={str(z):dict(choices=0,cued=0,followed=0,ignored=0,
      uncued=0,pitwardCue=0,pitwardCueFollowed=0,
      otherCue=0,otherCueFollowed=0) for z in (1,2,4)},
   completedLives=[],openCurrentLifeUniqueRoutes=[],
   candidatesByEntity={},encountersByEntity={},detectorCounters=dict(
    scannedSteps=0,candidatesDetected=0,eligibleCandidates=0,
    forkInstancesProbed=0,confirmedEncounters=0))
def increment(dictionary,key):dictionary[key]=dictionary.get(key,0)+1
def build():
 gen=json.loads((ROOT/'GENESIS.json').read_text())
 state=json.loads((ROOT/'STATE.json').read_text())
 if state['admittedTicks']!=state['engine']['tick']:raise ValueError('PF2_STATE_TICK_MISMATCH')
 if gen['genesisDigest']!=state['genesisDigest']:raise ValueError('PF2_GENESIS_DIGEST_MISMATCH')
 current={}
 for a in ARMS:
  for m in MODES:
   current[a+'-'+m]=new_pair(a,m)
 currentRoutes={k:[] for k in current}
 observed=0
 for chunk in sorted((ROOT/'chunks').glob('*.json')):
  c=json.loads(chunk.read_text())
  if c['startTick']!=observed or c['count']!=len(c['rows']):
   raise ValueError('PF2_MISSING_OR_OUT_OF_ORDER_SEALED_CHUNK')
  if c['verifiedStatus']!='PASS':raise ValueError('PF2_UNVERIFIED_BATCH')
  for row in c['rows']:
   if row['tick']!=observed or len(row['armEvents'])!=18:
    raise ValueError('PF2_GAP_OR_NOT_18')
   if row['round']!=gen['R0']+20*observed:raise ValueError('PF2_GRID_OFF')
   for ev in row['armEvents']:
    k=ev['k']; mode=ev['mode']; arm=ARMS[k]
    key=arm+'-'+mode
    p=current[key];p['observedTicks']+=1
    edge=str(ev['fromZone'])+'>'+str(ev['toZone'])
    currentRoutes[key].append(edge)
    if ev['choicePoint']:
     z=str(ev['fromZone'])
     cell=p['cueCompliance'][z];cell['choices']+=1
     if ev['cueAmongOpenExits']:
      cell['cued']+=1
      if ev['followedCue']:cell['followed']+=1
      else:cell['ignored']+=1
      target={'1':2,'2':4,'4':5}[z]
      if ev['cueZone']==target:
       cell['pitwardCue']+=1
       if ev['followedCue']:cell['pitwardCueFollowed']+=1
      else:
       cell['otherCue']+=1
       if ev['followedCue']:cell['otherCueFollowed']+=1
     else:
      cell['uncued']+=1
     if z=='4':
      p['zone4']['choices']+=1
      if ev['cueZone']==5:p['zone4']['cuedIntoSink']+=1
      elif ev['cueZone']==7:p['zone4']['cuedAwaySink']+=1
      else:
       p['zone4']['uncuedTotal']+=1
       if ev['toZone']==7:p['zone4']['refusalUncued']+=1
    if ev.get('death'):
     d=ev['death']
     p['deaths']+=1
     p['fatalTicks'].append(dict(tick=ev['tick'],round=ev['round'],
      cueZone=ev['cueZone'],deathIsSinkCued=ev['cueZone']==5,
      lifeLength=d['length'],
      finalExcursion=d['finalExcursion']))
     p['completedLives'].append(dict(deathTick=ev['tick'],
      length=d['length'],distinctRoutes=len(set(currentRoutes[key])),
      directedRoutes=sorted(set(currentRoutes[key])),
      fatalCue=ev['cueZone'],deathByCuedSink=ev['cueZone']==5))
     currentRoutes[key]=[]
   e=row.get('pandemoniumExposure') or {}
   for id,st in e.items():
    # id is R00-learner for C, R01..8-mode for references.
    idx=int(id[1:3]);mode=id.split('-',1)[1]
    pair=current[ARMS[idx]+'-'+mode]
    for metric,v in st.items():
     if metric in pair['detectorCounters']:
      pair['detectorCounters'][metric]+=v
   for fid in row.get('createdForkIDs',[]):
    # PF2-Rnn-mode-TICK-a-b (candidate pair key always final a-b).
    parts=fid.split('-')
    if len(parts)<6:raise ValueError('PF2_CANDIDATE_IDENTIFIER_CORRUPT')
    idx=int(parts[1][1:]); mode=parts[2]; pairkey='-'.join(parts[-2:])
    p=current[ARMS[idx]+'-'+mode]
    increment(p['candidatesByEntity'],NAME_MAP.get(pairkey,'UNNAMED '+pairkey))
   for en in row.get('confirmedEncounters',[]):
    p=current[ARMS[en['armIndex']]+'-'+en['mode']]
    increment(p['encountersByEntity'],en['entity'])
   observed+=1
 if observed!=state['admittedTicks']:raise ValueError('PF2_REPORT_INCOMPLETE_ARCHIVE')
 for k,p in current.items():
  p['openCurrentLifeUniqueRoutes']=sorted(set(currentRoutes[k]))
  p['openCurrentLifeMovingSteps']=len(currentRoutes[k])
  p['perZoneCueComplianceRate']={z:{
   'followedOfCued':c['followed']/c['cued'] if c['cued'] else None,
   'followed':c['followed'],'cued':c['cued'],
   'pitwardCueFollowed':c['pitwardCueFollowed'],
   'pitwardCue':c['pitwardCue'],
   'otherCueFollowed':c['otherCueFollowed'],
   'otherCue':c['otherCue'],'uncued':c['uncued']
  } for z,c in p['cueCompliance'].items()}
  for rec in p['completedLives']:
   if rec['distinctRoutes']!=len(rec['directedRoutes']):
    raise ValueError('PF2_ROUTE_COUNT_INCONSISTENT')
 # Exactly one registered P2-1 / P2-2 test at day30 of ADMITTED ticks,
 # never analyse a partial window for thresholds. P2-2 sparse extension
 # remains as in preregistration (to 86400 admitted ticks).
 day30=43200;day60=86400;status='NOT_DUE'
 day30Totals=None
 # Need historical death prefix to evaluate day30 when archive advances:
 if observed>=day30:
  status='DUE_FOR_SEPARATELY_FROZEN_ANALYSIS'
  deathsL=deathsU=postThird=postThirdCue=0
  for pair in current.values():
   deaths=[x for x in pair['fatalTicks'] if x['tick']<=day30]
   if pair['mode']=='learner':
    deathsL+=len(deaths)
    qualified=deaths[3:]
    postThird+=len(qualified)
    postThirdCue+=sum(x['deathIsSinkCued'] for x in qualified)
   else: deathsU+=len(deaths)
  day30Totals=dict(learnerDeaths=deathsL,controlDeaths=deathsU,
   learnerFatalAfterThird=postThird,learnerPostThirdCued=postThirdCue,
   ratio=deathsL/deathsU if deathsU else None,
   P2_2EligibilityAtDay30=postThird>=10)
 # This weekly report exposes day30 *eligibility counters only*, never
 # labels P2-1/2 held/failed: these must be reported ONCE in registered
 # separate immutable day30 artifact on exactly 43200 admitted ticks.
 return dict(schema='PF2_WEEKLY_REPOSITORY_JOURNAL_V1',
  generatedUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),
  governingQuestion='Can an encounter with something external create a history that becomes capable of organising subsequent encounters?',
  signedGenesisDigest=gen['genesisDigest'],R0=gen['R0'],
  startingRoundUTC=gen['futureFirstRoundTime'],
  lastAdmittedRound=state['lastAdmittedRound'],
  admittedTicks=state['admittedTicks'],requiredDay30AdmittedTicks=day30,
  sevenDayObservations=False,coverage='all signed admitted ticks from genesis, cumulative',
  pairs=current,day30=dict(status=status,countersIfDue=day30Totals,
   P2_1HeldOrFailed='NOT_EVALUATED_IN_WEEKLY_JOURNAL',
   P2_2HeldOrFailed='NOT_EVALUATED_IN_WEEKLY_JOURNAL',
   sparseP2_2ExtendsToAdmittedTicks=day60),
  noNotifications=True,notificationsSent=0,
  C1FilesModified=False,PF1FilesModified=False,
  liveAdmissionPerformedByReport=False)
def main():
 parser=argparse.ArgumentParser()
 parser.add_argument('--out',required=True)
 a=parser.parse_args()
 result=build()
 dst=pathlib.Path(a.out)
 dst.parent.mkdir(parents=True,exist_ok=True)
 with dst.open('x') as f:f.write(json.dumps(result,indent=2,sort_keys=True)+'\n')
 print('PF2_WEEKLY_READONLY_WRITTEN',json.dumps(dict(out=str(dst),
   ticks=result['admittedTicks'],pairs=len(result['pairs']),
   deaths=sum(p['deaths'] for p in result['pairs'].values()),
   encounters=sum(sum(p['encountersByEntity'].values()) for p in result['pairs'].values()),
   notificationsSent=0,day30=result['day30']['status'])))
if __name__=='__main__':main()
