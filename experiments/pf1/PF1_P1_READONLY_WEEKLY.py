"""PF1 P1 companion weekly audit: READ ONLY, no live intake or state mutation."""
import json,sys,hashlib,os,pathlib,datetime
live=pathlib.Path('experiments/pf1/live')
out=pathlib.Path(os.environ.get('RUNNER_TEMP','/tmp'))/'PF1_P1_WEEKLY_READONLY.json'
gen=json.loads((live/'GENESIS.json').read_text())
state=json.loads((live/'STATE.json').read_text())
ledger=json.loads((live/'SILENT_LEDGER.json').read_text())
journal=json.loads((live/'JOURNAL.json').read_text())
assert state['schema']=='PF1_LIVE_RUNTIME_STATUS_V1'
assert ledger['schema']=='PF1_LIVE_SILENT_LEDGER_V1'
assert state['admittedTicks']==len(ledger['rows'])
assert gen['genesisDigest']==state['genesisDigest']==ledger['genesisDigest']
assert state['headDigest']==(ledger['rows'][-1]['digest'] if ledger['rows'] else gen['genesisDigest'])
arm_ids=[x['id'] for x in state['arms']]
assert arm_ids==['C']+[f'R{i:02}' for i in range(1,9)]
records=[]
for arm in state['arms']:
    zones=arm['zones']
    assert len(zones)==state['admittedTicks']+1,arm['id']
    assert arm['events']==state['admittedTicks'],arm['id']
    absorbed=next((i for i,z in enumerate(zones) if z==5),None)
    if absorbed is not None:
        assert absorbed>=1
        assert all(z==5 for z in zones[absorbed:]), 'ABSORBED_ZONE_EXIT_IN_PF1'
    exposure={'moving':{},'absorbed':{}}
    keys=['scannedSteps','candidatesDetected','eligibleCandidates','forkInstancesProbed','confirmedEncounters']
    for k in exposure: exposure[k]={metric:0 for metric in keys}
    for i,row in enumerate(ledger['rows']):
        state_before_tick=zones[i]
        cls='absorbed' if state_before_tick==5 else 'moving'
        e=row['armExposure'][arm['id']]
        for metric in keys:exposure[cls][metric]+=e.get(metric,0)
    assert sum(exposure[x]['scannedSteps'] for x in exposure)==len(ledger['rows'])
    records.append({'arm':arm['id'],'currentZone':zones[-1],
       'absorptionStep':absorbed,'rightCensoredAtTick':state['admittedTicks'] if absorbed is None else None,
       'absorptionPathLastFour':zones[max(0,absorbed-3):absorbed+1] if absorbed is not None else None,
       'exposure':exposure})
payload={'schema':'PF1_P1_COMPANION_WEEKLY_READONLY_V1',
 'generatedUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'evidenceCutoffTicks':state['admittedTicks'],
 'lastAdmittedRound':state['lastAdmittedRound'],
 'liveStatus':state['status'],'halt':state.get('openHalt'),
 'genesisDigest':gen['genesisDigest'],'ledgerHead':state['headDigest'],
 'armReports':records,'journalEntries':len(journal['entries']),
 'noC1Dispatch':True,'noLiveAdmission':True,'pinnedFilesModified':False,
 'predictionRegistration':'experiments/pf1/predictions/P1_2026-10-21_REGISTERED.md',
 'forecastSeven':['R01','R02','R04','R05','R06','R07','R08'],
 'forecastCriterion':{'atLeast':6,'of':7,'byTickInclusive':7200}}
out.write_text(json.dumps(payload,indent=2)+'\n')
print('PF1_P1_WEEKLY_READONLY_PASS',json.dumps({'ticks':payload['evidenceCutoffTicks'],
 'arms':[{'id':r['arm'],'zone':r['currentZone'],'absorption':r['absorptionStep']} for r in records]}))
print('PF1_P1_READONLY_REPORT_PATH',str(out))
