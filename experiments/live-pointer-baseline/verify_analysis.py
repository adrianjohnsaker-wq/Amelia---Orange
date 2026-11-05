#!/usr/bin/env python3
"""Independent post-run recalculation of the registered descriptive outcomes."""
import collections,hashlib,json,math,sys
from pathlib import Path

def require(condition,message):
    if not condition: raise SystemExit(message)

def main():
    require(len(sys.argv)==2,'usage: verify_analysis.py PRIVATE_STUDY_DIRECTORY')
    root=Path(sys.argv[1]); raw=(root/'traces.jsonl').read_bytes(); summary_bytes=(root/'summary.json').read_bytes()
    summary=json.loads(summary_bytes); rows=[json.loads(line) for line in raw.splitlines()]
    require(len(rows)==2240,'unexpected trace row count')
    indexed={(r['seed'],r['arm'],r['time']):r for r in rows}
    require(len(indexed)==2240,'duplicate trace identity')
    arms=['live','shuffled','uniform','ordinary']; outcomes=[]
    for world in summary['worlds']:
        seed=world['seed']; live=indexed[(seed,'live',40)]; address=live['source']['after']['address']
        target=live['source']['targetProfile']; require(address==world['targetAddress'],'target address mismatch')
        result={'seed':seed,'arms':{}}
        for arm in arms:
            actual=world['arms'][arm];active=[indexed[(seed,arm,t)] for t in range(1,41)]
            count=dict(collections.Counter((r['currentOfferDecision'] or {}).get('disposition','NONE') for r in active))
            require(count==actual['currentOfferDispositions'],f'{seed}/{arm}: dispositions mismatch')
            switch=None if arm=='ordinary' else any(indexed[(seed,arm,t)]['source']['after']['address'] != indexed[(seed,arm,20)]['source']['after']['address'] for t in range(21,26))
            require(switch==actual['addressSwitchedWithin5'],f'{seed}/{arm}: switch mismatch')
            errors={}
            for t in (40,55,70):
                v=indexed[(seed,arm,t)]['bodyAfter']['attentionVector'];e=0.5*sum(abs(a-b) for a,b in zip(v,target))
                require(math.isclose(e,actual[f'errorToLiveTargetAt{t}'],rel_tol=1e-12,abs_tol=1e-12),f'{seed}/{arm}: target distance mismatch')
                errors[str(t)]=e
            pending=indexed[(seed,arm,40)]['pendingSourceAtStop']
            delayed=sum(d['eventId'].startswith('source:') and d['disposition']=='ATTEND' and d['applied'] for t in range(41,71) for d in (indexed[(seed,arm,t)]['allEncounterDecisions'] or []))
            eligible=None if arm=='ordinary' else count.get('ATTEND',0)>=5
            require(pending==actual['sourcePendingAtStop'] and delayed==actual['delayedSourceAdmissions'] and eligible==actual['exposureEligible'],f'{seed}/{arm}: exposure accounting mismatch')
            result['arms'][arm]={'offers':count,'switched':switch,'targetError':errors,'pendingAtStop':pending,'delayedAdmissions':delayed,'eligible':eligible}
        outcomes.append(result)
    for arm in arms:
        average=sum(w['arms'][arm]['targetError']['70'] for w in outcomes)/len(outcomes)
        require(math.isclose(average,summary['descriptive']['targetErrorAt70'][arm],rel_tol=1e-12,abs_tol=1e-12),f'{arm}: mean mismatch')
    require(sum(bool(w['arms']['live']['switched']) for w in outcomes)==summary['descriptive']['liveAddressSwitches'],'live switch count mismatch')
    require(sum(bool(w['arms']['live']['eligible']) for w in outcomes)==summary['descriptive']['liveExposureEligible'],'live eligibility count mismatch')
    print(json.dumps({'status':'PASS','rows':len(rows),'traces_sha256':hashlib.sha256(raw).hexdigest(),
                      'summary_sha256':hashlib.sha256(summary_bytes).hexdigest(),'descriptive':summary['descriptive']},indent=2))
if __name__=='__main__':main()
