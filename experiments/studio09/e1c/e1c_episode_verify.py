#!/usr/bin/env python3
"""INDEPENDENT Python E1C episode replay. No E1C JS learning code imported.

Reconstructs: unique nonoverlap episode intervals; all META1 per-choice
settlements; exactly one structural feedback credit per episode; 8 most
recent episode rewards per sensor; cooldown; 4-flip cap; archived checkpoint.
Refuses altered raw reward, ID, source input and structural event timing.

This script is an engineering verifier on E1-P0 only, NOT registered science.
"""
import gzip,hashlib,json,math,sys,copy
from collections import deque,Counter
from pathlib import Path
SENSORS=("surface_decline24","house_flux24","code_drift24")
EDGES=set("0>9 1>8 2>7 3>6 4>5 1>2 2>4 4>7 7>8 8>9 9>1".split())
def need(v,msg):
    if not v:raise ValueError("E1C_EPISODE_REPLAY_REJECTED: "+msg)
def sha_bytes(data):return hashlib.sha256(data).hexdigest()
def sha_file(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for b in iter(lambda:f.read(1024*1024),b""):h.update(b)
    return h.hexdigest()
def equal_num(a,b):return type(a) in (int,float) and abs(a-b)<=1e-11
def encounter_replay(path,checkpoint,mutator=None):
    seed=hashlib.sha256(b"STUDIO09-E1-PILOT-V1|E1-P0").hexdigest()
    pending={}
    ep=None
    ep_seq=0
    completed=0
    fatal=0
    last_end=0
    wiring={s:0 for s in SENSORS}
    switches={s:0 for s in SENSORS}
    windows={s:deque(maxlen=8) for s in SENSORS}
    since={s:24 for s in SENSORS}
    episode_counts={s:0 for s in SENSORS}
    structural=[]
    deaths=0
    ticks=0
    with gzip.open(path,'rt',encoding='utf8') as f:
      for line in f:
        x=json.loads(line);ticks+=1
        if mutator:x=mutator(ticks,x)
        need(x.get("tick")==ticks,"nonconsecutive tick")
        need(x.get("schema")=="STUDIO09_E1_MODEL_STEP_V1","raw trace schema")
        need(x.get("phase")=="ENCOUNTER","not an encounter event")
        season=(ticks-1)//5000+1;local=(ticks-1)%5000+1
        source=f"STUDIO09-E1-OUTSIDE-V1|{seed}|E{season}|{local}"
        need(x.get("sourceInput")==source,"model external input altered")
        frm,to=x.get("from"),x.get("to")
        need(type(frm)==int and type(to)==int and
             f"{frm}>{to}" in EDGES,"outside original eleven-edge graph")
        need(type(x.get("death"))==bool,"death not boolean")
        sensor=x.get("selectedSensor")
        need(sensor is None or sensor in SENSORS,"unknown witness")
        target=x.get("target")
        need(target is None or (type(target)==int and 0<=target<=9),
             "invalid target")
        need(x.get("cueMagnitude")== (0.35 if target is not None else 0),
             "cue magnitude changed")
        proposals=x.get("candidateReadouts")
        need(isinstance(proposals,list) and len(proposals)==3,
             "sensor proposals missing")
        proposal={p["id"]:p["target"] for p in proposals}
        need(set(proposal)==set(SENSORS),"unexpected sensor")
        need((sensor is None and target is None) or
             (sensor is not None and proposal[sensor]==target),
             "chosen target not proposed pre-choice")
        token=None
        if target is not None:
            token="S1-"+str(ticks)
            pending[token]={"start":ticks,"sensor":sensor,"edges":set()}
        if ep is None:
            ep_seq+=1
            need(last_end+1==ticks,"overlapping/missing episode")
            ep={"id":"E1C-E"+str(ep_seq),"start":ticks,
                "sensor":sensor,"encoding":wiring[sensor] if sensor else None,
                "edges":[],"age":0}
        need(x.get("episodeId")==ep["id"],
             "step not assigned to unique contiguous episode")
        edge=f"{frm}>{to}"
        if edge not in ep["edges"]:ep["edges"].append(edge)
        ep["age"]+=1
        for v in pending.values():v["edges"].add(edge)
        seen=set()
        for result in x.get("creditsSettled",[]):
            tid=result["token"]
            need(tid in pending and tid not in seen,"unknown/doubled UCB credit")
            seen.add(tid)
            prior=pending.pop(tid)
            end=prior["start"]+23
            need(ticks<=end and (x["death"] or ticks==end),"UCB future credit")
            need(result["observedAt"]==ticks and
                 result["decisionTick"]==prior["start"] and
                 result["sensor"]==prior["sensor"] and
                 result["deathWithin24"]==x["death"],"per-choice credit misassigned")
            reward=-1 if x["death"] else max(0,min(1,(len(prior["edges"])-4)/7))
            need(equal_num(result["reward"],reward),
                 "per-choice result not supported by actual source transitions")
        if x["death"]:
            deaths+=1
            need(not pending,"one death left unsettled per-choice exposure")
        need(x.get("pendingRewards")==len(pending),"UCB pending ledger inconsistent")
        completed_credit=x.get("episodeCompleted")
        events=x.get("structuralChanges")
        need(isinstance(events,list),"missing structural log")
        if x["death"] or ep["age"]==24:
            completed+=1
            if x["death"]:fatal+=1
            reward=-1 if x["death"] else max(0,min(1,(len(ep["edges"])-4)/7))
            predicted={"id":ep["id"],"startTick":ep["start"],"endTick":ticks,
                 "episodeTransitions":ep["age"],"sensor":ep["sensor"],
                 "initialEncoding":ep["encoding"],
                 "distinctEdges":len(ep["edges"]),"death":x["death"],"reward":reward}
            need(isinstance(completed_credit,dict) and
                 set(completed_credit)==set(predicted),
                 "episode credit missing/extraneous fields")
            for k,v in predicted.items():
                if k=="reward":
                    need(equal_num(completed_credit[k],v),"episode reward forged")
                else:need(completed_credit[k]==v,"episode witness/timing forged: "+k)
            expected_events=[]
            if ep["sensor"] is not None:
                s=ep["sensor"]
                episode_counts[s]+=1
                if wiring[s]==ep["encoding"]:
                    window=windows[s]
                    window.append(reward)
                    since[s]+=1
                    if len(window)>=8 and sum(window)/len(window)<-0.25 and (
                      switches[s]<4 and since[s]>=24):
                        old=wiring[s]
                        avg=sum(window)/len(window)
                        event={"sequence":len(structural)+1,
                            "sensor":s,"from":old,"to":1-old,
                            "triggeringEpisode":ep["id"],"settledMean":avg,
                            "deathEpisodesInWindow":sum(r==-1 for r in window)}
                        expected_events.append(event)
                        wiring[s]=1-old;switches[s]+=1;since[s]=0
                        window.clear()
            need(len(events)==len(expected_events),
                 "structural change not explained by independent episode")
            for observed,expected in zip(events,expected_events):
                need(set(observed)==set(expected),"altered structural fields")
                for name,v in expected.items():
                    if name=="settledMean":
                        need(equal_num(observed[name],v),"wrong independent episode trigger mean")
                    else:need(observed[name]==v,"invalid independently replayed structural flip")
                structural.append({"tick":ticks,**expected})
            last_end=ticks
            ep=None
        else:
            need(completed_credit is None and not events,
                 "premature or duplicated episode credit")
    need(ticks==10000,"incomplete encounter")
    receiver=checkpoint["receptor"]
    need(receiver["schema"]=="STUDIO09_E1C_EPISODE_RECEPTOR_V1",
         "not E1C receptor version")
    need(receiver["completedEpisodes"]==completed and
         receiver["fatalEpisodes"]==fatal and
         receiver["nextEpisode"]==ep_seq and
         receiver["lastEndTick"]==last_end,
         "episode counts differ from independent raw trace")
    need(receiver["wiring"]==wiring and receiver["switches"]==switches,
         "source model final wiring differs from episode replay")
    need(receiver["episodesBySensor"]==episode_counts,
         "witness sensor counts differ")
    need(len(receiver["events"])==len(structural),
         "historical structural event ledger missing")
    for s in SENSORS:
        w=receiver["window"][s]
        need(w["values"]==list(windows[s]) and w["n"]==len(windows[s]) and
             equal_num(w["sum"],sum(windows[s])) and
             receiver["sinceFlip"][s]==since[s],
             "episode rolling memory differs from source model")
    p=receiver.get("pendingEpisode")
    if ep is None:
        need(p is None,"extra unfinished episode at encounter boundary")
    else:
        need(isinstance(p,dict) and p["id"]==ep["id"] and
             p["startTick"]==ep["start"] and p["age"]==ep["age"] and
             p["sensor"]==ep["sensor"] and p["encoding"]==ep["encoding"] and
             p["edges"]==ep["edges"],"incorrect pending episode snapshot")
    return {"world":"E1-P0","encounterTicks":ticks,"completedIndependentEpisodes":completed,
       "fatalIndependentEpisodes":fatal,"wiring":wiring,"switches":switches,
       "structuralEvents":structural,"unfinishedEpisodeAtBoundary":p is not None,
       "perChoiceUcbOutstanding":len(pending)}
def full(root):
    root=Path(root)
    ck=json.loads((root/"encounter_checkpoint.json").read_text())
    e=encounter_replay(root/"encounter.jsonl.gz",ck)
    seed=hashlib.sha256(b"STUDIO09-E1-PILOT-V1|E1-P0").hexdigest()
    encounter=json.loads((root/"encounter_receipt.json").read_text())
    need(encounter["order"]=="ordered" and encounter["worldId"]=="E1-P0",
         "not prespecified ordinary-source P0")
    need(encounter["traceSha256"]==sha_file(root/"encounter.jsonl.gz"),
         "encounter source trace tampered")
    for name in ["carry","reset"]:
        receipt=json.loads((root/(name+"_receipt.json")).read_text())
        need(receipt["intervention"]==name,"wrong transfer intervention")
        need(receipt["checkpointSha256"]==sha_file(root/"encounter_checkpoint.json"),
             "not exact common boundary checkpoint")
        need(receipt["traceSha256"]==sha_file(root/(name+".jsonl.gz")),
             "transfer trace tampered")
        need(receipt["metrics"]["receiver"]["frozen"] is True,
             "continued structural adaptation after transfer")
        transitions=0;deaths=0
        with gzip.open(root/(name+".jsonl.gz"),"rt") as f:
            for line in f:
                x=json.loads(line);transitions+=1
                need(x["tick"]==10000+transitions,"heldout clock")
                probe=(transitions-1)//1000+1
                local=(transitions-1)%1000+1
                need(x["sourceInput"]==f"STUDIO09-E1-HELDOUT-V1|{seed}|T{probe}|{local}",
                    "changed later encounter input")
                need(not x["structuralChanges"],"post-fork structural changes")
                deaths+=int(x["death"])
        need(transitions==2000,"heldout evidence incomplete")
        need(receipt["metrics"]["deaths"]-encounter["metrics"]["deaths"]==deaths,
             "heldout deaths misreported")
    a=json.loads((root/"carry_receipt.json").read_text())
    b=json.loads((root/"reset_receipt.json").read_text())
    need(a["preInterventionFullStateDigest"]==b["preInterventionFullStateDigest"],
         "unmatched full-state fork before structural intervention")
    need(a["boundaryDigest"]==b["boundaryDigest"],
         "different source histories")
    need(a["censoredBeforeTransfer"]==b["censoredBeforeTransfer"],
         "per-choice credit censor mismatch")
    need(a["censoredStructuralEpisode"]==b["censoredStructuralEpisode"],
         "pending structural-episode censor mismatch")
    need(all(v==0 for v in b["metrics"]["receiver"]["wiring"].values()),
         "reset recipient retains structural wiring")
    e["status"]="STUDIO09_E1C_INDEPENDENT_EPISODE_AND_TRANSFER_QA_PASS_NOT_SCIENCE"
    e["carryNewDeaths"]=a["metrics"]["deaths"]-encounter["metrics"]["deaths"]
    e["resetNewDeaths"]=b["metrics"]["deaths"]-encounter["metrics"]["deaths"]
    e["sourceStateEqualBeforeIntervention"]=True
    e["sourceInputIdenticalDuringTransfer"]=True
    e["scienceWorldsExecuted"]=0
    return e

if __name__=="__main__":
    if len(sys.argv)!=2:raise SystemExit("usage: python3 e1c_episode_verify.py E1C_PILOT_FOLDER")
    directory=Path(sys.argv[1])
    report=full(directory)
    p=directory/"E1C_INDEPENDENT_EPISODE_VERIFICATION.json"
    if p.exists():raise FileExistsError("evidence receipt already exists")
    p.write_text(json.dumps(report,indent=2,sort_keys=True)+"\n")
    print(json.dumps(report,sort_keys=True))
