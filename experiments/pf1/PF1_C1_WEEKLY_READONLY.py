"""Weekly C1 continuity and PF1 live-state report; strictly read-only inputs.

C1 is examined on its *current* amelia-1.0 HEAD. PF1 is read from the
Orange authoritative live/ path, NEVER production-dry-run or synthetic outputs.
All report bytes go to PF1 weekly-audit/ in the Orange checkout only.
The companion workflow commits only that one report using GitHub Contents API.
No genesis, dispatch, live intake, or encounter notification can originate here.
"""
import hashlib
import json
import os
import pathlib
import re
import subprocess
from datetime import datetime, timezone

from drift1a_c1.engine import Engine, NAMES
from drift1a_c1.beacon import Sealer, round_time, current_round

ARM_IDS = ('C', 'R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R08')
EXPOSURE_FIELDS = ('scannedSteps', 'candidatesDetected', 'eligibleCandidates',
                   'forkInstancesProbed', 'confirmedEncounters')
PF1_GENESIS = 'experiments/pf1/live/GENESIS.json'
PF1_STATE = 'experiments/pf1/live/STATE.json'
PF1_LEDGER = 'experiments/pf1/live/SILENT_LEDGER.json'

class NoBeacon:
    mode = 'LIVE'
    def fetch(self, *args, **kwargs):
        raise RuntimeError('NO_LIVE_BEACON_FETCH_PERMITTED')
    def verify(self, *args, **kwargs):
        raise RuntimeError('UNEXPECTED_NETWORK_BLS_VERIFY_ATTEMPT')

def load_json(p):
    with p.open('r', encoding='utf-8') as stream:
        return json.load(stream)

def require_nonnegative(v, label):
    if isinstance(v, bool) or not isinstance(v, int) or v < 0:
        raise ValueError('BAD_NONNEGATIVE_COUNT: '+label)
    return v

def iso_utc(s):
    if not isinstance(s, str) or not s.endswith('Z'):
        raise ValueError('HALT_TIME_MUST_BE_UTC')
    return datetime.fromisoformat(s.replace('Z','+00:00'))

def read_pf1_status(orange_root, now):
    """Fail closed if a genesis exists but its live state/ledger is incomplete.

    Future live writer contract (nothing here creates it):
    GENESIS.json: schema PF1_LIVE_GENESIS_V1, R0 aligned to C1 by %20, seal.
    STATE.json: schema PF1_LIVE_RUNTIME_STATUS_V1, status running|halted,
      admittedTicks, lastAdmittedRound, openHalt {startedUTC,reason} or null.
    SILENT_LEDGER.json: schema PF1_LIVE_SILENT_LEDGER_V1, rows in tick order,
      {tick (zero-based),round,armExposure:{C:{five counts}, R01...R08}}.
    No live rows can be back-filled from synthetic data.
    """
    root = pathlib.Path(orange_root)
    gp,sp,lp=(root/path for path in (PF1_GENESIS,PF1_STATE,PF1_LEDGER))
    existing=[p.as_posix() for p in (sp,lp) if p.exists()]
    if not gp.exists():
        if existing:
            raise ValueError('LIVE_STATE_OR_LEDGER_PRESENT_WITHOUT_GENESIS')
        return {
            'status':'no genesis',
            'runningOrHalted':None,
            'lastAdmittedRound':None,
            'openHalt':None,
            'roundsPendingCatchup':None,
            'silentLedgerExposureCountsPerArm':None,
            'exposure':'not applicable — no genesis; synthetic evidence excluded',
            'liveGenesisPresent':False,
            'sourcePaths':{'genesis':PF1_GENESIS,'status':PF1_STATE,'ledger':PF1_LEDGER},
        }
    if not sp.is_file() or not lp.is_file():
        raise ValueError('LIVE_GENESIS_EXISTS_BUT_AUTHORITATIVE_STATUS_OR_LEDGER_MISSING')
    g,state,ledger=map(load_json,(gp,sp,lp))
    if g.get('schema')!='PF1_LIVE_GENESIS_V1':
        raise ValueError('UNKNOWN_LIVE_GENESIS_SCHEMA')
    if state.get('schema')!='PF1_LIVE_RUNTIME_STATUS_V1':
        raise ValueError('UNKNOWN_LIVE_STATE_SCHEMA')
    if ledger.get('schema')!='PF1_LIVE_SILENT_LEDGER_V1':
        raise ValueError('UNKNOWN_LIVE_LEDGER_SCHEMA')
    R0=require_nonnegative(g.get('R0'),'genesis_R0')
    if R0%20 or (R0-33158540)%20:
        raise ValueError('PF1_R0_NOT_ON_C1_GRID')
    if state.get('status') not in ('running','halted'):
        raise ValueError('UNKNOWN_PF1_STATUS')
    n=require_nonnegative(state.get('admittedTicks'),'admittedTicks')
    rows=ledger.get('rows')
    if not isinstance(rows,list) or len(rows)!=n:
        raise ValueError('SILENT_LEDGER_TICK_COUNT_MISMATCH')
    expected_last=None if n==0 else R0+20*(n-1)
    if state.get('lastAdmittedRound')!=expected_last:
        raise ValueError('STATE_LAST_ROUND_DISAGREES_WITH_ADMISSION_COUNT')
    tally={a:{k:0 for k in EXPOSURE_FIELDS} for a in ARM_IDS}
    for tick,row in enumerate(rows):
        if row.get('tick')!=tick or row.get('round')!=R0+20*tick:
            raise ValueError('GAP_DUPLICATE_OR_REORDER_IN_PF1_LEDGER_AT_'+str(tick))
        arm=row.get('armExposure')
        if not isinstance(arm,dict) or set(arm)!=set(ARM_IDS):
            raise ValueError('MISSING_OR_EXTRA_ARM_IN_SILENT_LEDGER')
        for a in ARM_IDS:
            stats=arm[a]
            if not isinstance(stats,dict) or set(stats)!=set(EXPOSURE_FIELDS):
                raise ValueError('INCORRECT_ARM_EXPOSURE_SCHEMA_'+a)
            for k in EXPOSURE_FIELDS:
                tally[a][k]+=require_nonnegative(stats[k],a+'.'+k)
    halt=state.get('openHalt')
    if state['status']=='halted':
        if not isinstance(halt,dict) or not str(halt.get('reason','')).strip():
            raise ValueError('HALT_WITHOUT_REASON')
        started=iso_utc(halt.get('startedUTC'))
        if started>now:
            raise ValueError('HALT_STARTS_IN_FUTURE')
        halt={'startedUTC':halt['startedUTC'],'reason':halt['reason']}
    elif halt is not None:
        raise ValueError('RUNNING_WITH_OPEN_HALT')
    published=current_round(now.timestamp())
    expected_admitted=max(0,(published-R0)//20+1)
    if n>expected_admitted:
        raise ValueError('PF1_RECORDS_FUTURE_UNPUBLISHED_ROUNDS')
    return {
        'status':state['status'],
        'runningOrHalted':state['status'],
        'lastAdmittedRound':expected_last,
        'openHalt':halt,
        'roundsPendingCatchup':max(0,expected_admitted-n),
        'silentLedgerExposureCountsPerArm':tally,
        'liveGenesisPresent':True,
        'committedAdmittedTicks':n,
        'expectedScheduledTicksAsOfAudit':expected_admitted,
        'referenceInflow':'PF1-REF-i|',
        'sourcePaths':{'genesis':PF1_GENESIS,'status':PF1_STATE,'ledger':PF1_LEDGER},
    }

def audit_c1(root):
    root=pathlib.Path(root)
    frozen=root/'drift1a_c1/recorded_live'
    before={p.relative_to(frozen).as_posix():hashlib.sha256(p.read_bytes()).hexdigest()
            for p in frozen.rglob('*') if p.is_file()}
    commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
    engine=Engine(frozen, NoBeacon(), Sealer())
    count=0
    for row in engine.records():
        tick=row['tick']
        if tick!=count:
            raise ValueError(f'C1_TICK_GAP_DUPLICATION_OR_REORDER at {count} got {tick}')
        expected=engine.g['R0']+20*tick
        if row['beacon']['round']!=expected:
            raise ValueError('C1_QUICKNET_ROUND_MISMATCH')
        if row['round_time']!=round_time(expected):
            raise ValueError('C1_TIME_GRID_MISMATCH')
        sig=bytes.fromhex(row['beacon']['signature'])
        if hashlib.sha256(sig).hexdigest()!=row['beacon']['randomness']:
            raise ValueError('C1_ARCHIVED_SIGNATURE_RANDOMNESS_MISMATCH')
        if any(a not in row['arms'] for a in NAMES):
            raise ValueError('C1_ARM_MISSING')
        count+=1
    if count!=engine.tick:
        raise ValueError('C1_CHUNK_HEAD_TICK_COUNT_MISMATCH')
    after={p.relative_to(frozen).as_posix():hashlib.sha256(p.read_bytes()).hexdigest()
           for p in frozen.rglob('*') if p.is_file()}
    if before!=after:
        raise ValueError('READ_ONLY_AUDIT_MUTATED_C1_FROZEN_FILES')
    return {
        'sourceRepository':'adrianjohnsaker-wq/Amelia-0.4',
        'sourceBranch':'amelia-1.0',
        'sourceHeadCommit':commit,
        'genesisR0':engine.g['R0'],
        'tickCount':count,
        'lastTick':count-1,
        'lastRound':engine.g['R0']+20*(count-1) if count else None,
        'nextRound':engine.g['R0']+20*count,
        'chunkCount':engine.seq,
        'currentChainHeadSHA256':engine.head,
        'missingTicks':0,
        'duplicateTicks':0,
        'reorderedTicks':0,
        'chunkAndGenesisChainValidatedByC1Engine':True,
        'archivedSignatureRandomnessDigestsVerified':True,
        'allBlsSignaturesIndividuallyVerified':False,
        'fullDeterministicReplay':'not performed in weekly lightweight check',
        'frozenFilesUnchanged':True,
        'beaconRoundsFetched':0,
        'manualC1DispatchPerformed':False,
    }

def main():
    if os.environ.get('DRIFT_C1_ENABLE_LIVE')=='true':
        raise ValueError('WEEKLY_READONLY_MUST_NEVER_ENABLE_LIVE')
    now=datetime.now(timezone.utc)
    c1root=pathlib.Path.cwd()
    orange=pathlib.Path(os.environ['PF1_ORANGE_REPOSITORY'])
    if not orange.is_dir():
        raise ValueError('ORANGE_CHECKOUT_NOT_FOUND')
    c1=audit_c1(c1root)
    pf1=read_pf1_status(orange,now)
    audited=now.strftime('%Y-%m-%dT%H%M%SZ')
    run_id=os.environ.get('GITHUB_RUN_ID','local-test')
    if not re.fullmatch(r'[0-9]+|local-test',run_id):
        raise ValueError('BAD_RUN_ID')
    filename=f'PF1_C1_WEEKLY_{audited}_run{run_id}.json'
    output=orange/'experiments/pf1/weekly-audit'/filename
    output.parent.mkdir(parents=True,exist_ok=True)
    report={
        'schema':'PF1_C1_COMBINED_WEEKLY_READONLY_V2',
        'auditStatus':'PASS',
        'auditedUTC':now.isoformat().replace('+00:00','Z'),
        'reportPath':'experiments/pf1/weekly-audit/'+filename,
        'C1':c1,
        'PF1':pf1,
        'actions':{
          'C1DispatchPerformed':False,
          'C1FilesModified':False,
          'PF1GenesisCreated':False,
          'liveRoundsAdmitted':0,
          'encounterNotificationsSent':0,
          'outboundNotificationsSent':0,
          'liveReadOnly':True,
          'scheduledAuditIndependentOfEncounterEvents':True
        }
    }
    output.write_text(json.dumps(report,indent=2,sort_keys=True)+'\n',encoding='utf-8')
    if os.getenv('GITHUB_OUTPUT'):
        with open(os.environ['GITHUB_OUTPUT'],'a',encoding='utf-8') as f:
            f.write('report_path='+report['reportPath']+'\n')
    summary=os.getenv('GITHUB_STEP_SUMMARY')
    if summary:
        with open(summary,'a',encoding='utf-8') as f:
            f.write(
                '## C1 + PF1 weekly read-only audit\n\n'
                f'- C1 commit: \`{c1["sourceHeadCommit"]}\`\n'
                f'- C1 ticks: **{c1["tickCount"]}**; missing/duplicate/reordered **0/0/0**\n'
                f'- C1 head: \`{c1["currentChainHeadSHA256"]}\`\n'
                f'- PF1 status: **{pf1["status"]}**\n'
                f'- PF1 last round: {pf1["lastAdmittedRound"]}\n'
                f'- PF1 open halt: {pf1["openHalt"]}\n'
                f'- PF1 pending catch-up rounds: {pf1["roundsPendingCatchup"]}\n'
                f'- Silent exposure: {pf1["silentLedgerExposureCountsPerArm"]}\n'
                f'- Dated record: \`{report["reportPath"]}\`\n'
                '- No C1 dispatch, live input, file changes or encounter notifications\n'
            )
    print('PF1_C1_WEEKLY_COMBINED_PASS',json.dumps({
        'path':report['reportPath'],'C1_head':c1['currentChainHeadSHA256'],
        'C1_ticks':c1['tickCount'],'PF1':pf1['status'],'noGenesis':not pf1['liveGenesisPresent']
    }))

if __name__=='__main__':
    main()
