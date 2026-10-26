#!/usr/bin/env python3
"""Independent E1B receptor STRUCTURAL CHANGE replay from original raw JSONL.

No call to the JS learning code. Recomputes fixed 24-transition original
reward (including the choice, early death) and rolling-8 structural trigger.
This is a pilot audit, not a validation of science-world outcomes.
"""
import gzip,json,sys
from pathlib import Path
from collections import deque,Counter

SENSORS=("surface_decline24","house_flux24","code_drift24")
def need(c,m):
    if not c:raise ValueError("E1B_FEEDBACK_REPLAY_REJECTED: "+m)
def replay(path,root):
    active={}
    wiring={s:0 for s in SENSORS}
    changes={s:0 for s in SENSORS}
    windows={s:deque(maxlen=8) for s in SENSORS}
    since={s:24 for s in SENSORS}
    observed=[]
    count=0
    credits=Counter()
    deaths=0
    for line in gzip.open(path,"rt",encoding="utf8"):
        r=json.loads(line)
        count+=1
        need(r["tick"]==count,"clock not consecutive")
        sensor=r.get("selectedSensor")
        if sensor is not None:
            need(sensor in SENSORS,"unregistered sensor")
            tok="S1-"+str(count)
            need(tok not in active,"duplicate decision")
            active[tok]={"start":count,"sensor":sensor,"encoding":wiring[sensor],
                         "edges":set()}
            target=r.get("target")
            proposal={x["id"]:x["target"] for x in r.get("candidateReadouts",[])}
            need(target==proposal.get(sensor),"selected cue does not equal chosen pre-choice sensor")
        edge=str(r["from"])+">"+str(r["to"])
        for v in active.values():v["edges"].add(edge)
        got=[]
        for receipt in r["creditsSettled"]:
            token=receipt["token"]
            need(token in active,"settled token absent from earlier choice")
            v=active[token]
            need(receipt["decisionTick"]==v["start"] and
                 receipt["observedAt"]==count,
                 "settlement timing or token mismatch")
            deadline=v["start"]+23
            need(count<=deadline and
                 (r["death"] or count==deadline),
                 "reward settled before fixed full exposure")
            expected=-1 if r["death"] else max(0,min(1,(len(v["edges"])-4)/7))
            need(abs(receipt["reward"]-expected)<1e-12,
                 "reward not recomputed from actual transitions")
            need(receipt["sensor"]==v["sensor"],
                 "wrong sensor credited")
            need(receipt["deathWithin24"]==r["death"],
                 "death flag mismatch")
            credits[v["sensor"]]+=1
            sensor=v["sensor"]
            del active[token]
            if v["encoding"]!=wiring[sensor]:continue
            w=windows[sensor]
            w.append(expected)
            since[sensor]+=1
            if (len(w)>=8 and sum(w)/len(w)<-0.25 and
                changes[sensor]<4 and since[sensor]>=24):
                old=wiring[sensor]
                wiring[sensor]=1-old
                changes[sensor]+=1
                since[sensor]=0
                avg=sum(w)/len(w)
                w.clear()
                got.append({"sequence":sum(changes.values()),
                    "sensor":sensor,"from":old,"to":1-old,
                    "triggeringToken":token,"settledMean":avg})
        recorded=r["structuralChanges"]
        need(len(got)==len(recorded),"missing or extra structure event at "+str(count))
        for a,b in zip(got,recorded):
            need(a["sequence"]==b["sequence"] and
                 a["sensor"]==b["sensor"] and
                 a["from"]==b["from"] and a["to"]==b["to"] and
                 a["triggeringToken"]==b["triggeringToken"] and
                 abs(a["settledMean"]-b["settledMean"])<1e-12,
                 "structural event invalid at "+str(count))
            observed.append({"tick":count,**a})
        if r["death"]:
            deaths+=1
            need(not active,"death did not settle all pending windows")
        need(r["pendingRewards"]==len(active),
             "pending credit accounting inconsistent")
    need(count==10000,"not full E1B encounter")
    ck=json.loads(Path(root,"encounter_checkpoint.json").read_text())
    receiver=ck["receptor"]
    need(receiver["wiring"]==wiring,"replayed wiring differs from original full checkpoint")
    need(receiver["switches"]==changes,"replayed switch counts disagree")
    for sensor in SENSORS:
        win=receiver["window"][sensor]
        need(win["values"]==list(windows[sensor]),"rolling window differs")
        need(win["n"]==len(windows[sensor]),"rolling count differs")
        need(win["sum"]==sum(windows[sensor]),"rolling sum differs")
        need(receiver["sinceFlip"][sensor]==since[sensor],
             "cooldown differs from independent replay")
    need(len(receiver["events"])==len(observed),
         "historical structural events absent")
    return {"status":"E1B_INDEPENDENT_FEEDBACK_AND_STRUCTURE_REPLAY_PASS",
        "world":"E1-P0","pilotOnly":True,"registeredWorldsExecuted":0,
        "encounterTicks":count,"encounterDeaths":deaths,
        "settledFeedbackPerSensor":dict(credits),
        "reconstructedWiring":wiring,"changes":observed,
        "pendingAtBoundary":len(active),
        "resultIsNoGuaranteeOfSurvivalBenefit":True}

if __name__=="__main__":
    if len(sys.argv)!=2:raise SystemExit("usage: python3 e1b_feedback_replay.py PILOT_DIR")
    root=Path(sys.argv[1])
    result=replay(root/"encounter.jsonl.gz",root)
    out=root/"E1B_INDEPENDENT_FEEDBACK_REPLAY.json"
    if out.exists():raise FileExistsError("replay receipt already exists")
    out.write_text(json.dumps(result,indent=2,sort_keys=True)+"\n")
    print(json.dumps(result,sort_keys=True))
