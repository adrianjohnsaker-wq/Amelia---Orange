#!/usr/bin/env python3
"""Studio09 E1B pilot-only raw trace and exact matched-transfer provenance QA.

This checks the NEW engineering pilot E1-P0, not original Studio07 or E1-Wxx.
It cannot prove a transformation improves viability without registered science.
"""
import gzip,hashlib,json,re,sys
from pathlib import Path

EDGES=set("0>9 1>8 2>7 3>6 4>5 1>2 2>4 4>7 7>8 8>9 9>1".split())
def need(v,m):
    if not v:raise ValueError("E1_PILOT_TRACE_REJECTED: "+m)
def sha(b):return hashlib.sha256(b).hexdigest()
def check(path,source_kind,seed):
    previous=None
    rows=0
    with gzip.open(path,"rt",encoding="utf-8") as f:
      for line in f:
        row=json.loads(line)
        rows+=1
        need(row.get("schema")=="STUDIO09_E1_MODEL_STEP_V1","step schema")
        need(isinstance(row.get("from"),int) and
             isinstance(row.get("to"),int) and
             f'{row["from"]}>{row["to"]}' in EDGES,"not a frozen graph edge")
        need(isinstance(row.get("death"),bool),"death not boolean")
        need(row.get("cueMagnitude") in (0,0.35),"unbounded extra cue")
        need((row.get("target") is None)==(row.get("cueMagnitude")==0),
             "target and magnitude disagree")
        need(re.fullmatch('[0-9a-f]{64}',row.get("preStateDigest","")) and
             re.fullmatch('[0-9a-f]{64}',row.get("postStateDigest","")),
             "non-SHA state marker")
        if previous is not None:
            need(previous==row["preStateDigest"],"state continuity across row")
        previous=row["postStateDigest"]
        if source_kind=="ENCOUNTER":
            need(row["tick"]==rows,"nonconsecutive encounter ticks")
            season=(rows-1)//5000+1
            k=(rows-1)%5000+1
            prefix=f"STUDIO09-E1B-EXOGENOUS-CHALLENGE-V1|{seed}|{season}|{k}|"
            def hit(nonce):
                candidate=prefix+str(nonce)
                return (int(hashlib.sha256(candidate.encode()).hexdigest()[:2],16)%10)==5
            found=next((nonce for nonce in range(128) if hit(nonce)),None)
            need(found is not None,"no valid external challenge input")
            expected=prefix+str(found)
            need(row["sourceInput"]==expected,"unregistered encounter source")
        else:
            need(row["tick"]==10000+rows,"bad heldout clock")
            probe=(rows-1)//1000+1
            k=(rows-1)%1000+1
            expected=f"STUDIO09-E1-HELDOUT-V1|{seed}|T{probe}|{k}"
            need(row["sourceInput"]==expected,"unregistered heldout source")
            need(row["structuralChanges"]==[],"new structural rewiring in frozen transfer")
        for receipt in row["creditsSettled"]:
            need(receipt["decisionTick"]<=receipt["observedAt"],
                 "future credit")
            need(-1<=receipt["reward"]<=1,"invalid settled reward")
            if receipt["deathWithin24"]:
                need(receipt["reward"]==-1,"nonnegative death credit")
        for event in row["structuralChanges"]:
            need(event["from"] in (0,1) and event["to"]==1-event["from"],
                 "structural modification beyond registered grammar")
    need(rows==(10000 if source_kind=="ENCOUNTER" else 2000),
         "incomplete pilot trace")
    return rows
def main(folder):
    root=Path(folder)
    seed=sha(b"STUDIO09-E1-PILOT-V1|E1-P0")
    encounter=json.loads((root/"encounter_receipt.json").read_bytes())
    carry=json.loads((root/"carry_receipt.json").read_bytes())
    reset=json.loads((root/"reset_receipt.json").read_bytes())
    need(encounter["mode"]=="feedback" and encounter["order"]=="sink-challenge",
         "unexpected encounter origin")
    need(encounter["worldId"]=="E1-P0","pilot world only")
    for mode,record in [("carry",carry),("reset",reset)]:
        need(record["intervention"]==mode,"wrong matched transfer mode")
        need(record["boundaryDigest"]==encounter["checkpointDigest"] if
             "checkpointDigest" in encounter else
             record["boundaryDigest"]==
             json.loads((root/"encounter_checkpoint.json").read_text())["checkpointDigest"],
             "forked from inconsistent source checkpoint")
        need(record["preInterventionFullStateDigest"]==
             carry["preInterventionFullStateDigest"],
             "fork state not identical before reset intervention")
        need(record["censoredBeforeTransfer"]==
             carry["censoredBeforeTransfer"],
             "pending rewards censored differently across forks")
        need(all(v==0 for v in reset["metrics"]["receiver"]["wiring"].values()) if
             mode=="reset" else True,"reset did not reset wiring")
        need(record["metrics"]["receiver"]["frozen"] is True,
             "structural changes not frozen through transfer")
    ck=json.loads((root/"encounter_checkpoint.json").read_text())
    receptor=ck["receptor"]
    need(receptor["schema"]=="STUDIO09_E1B_RECEPTOR_V1",
         "not revised recency receptor")
    for field in receptor["window"].values():
        need(0<=field["n"]<=8 and len(field["values"])==field["n"],
             "nonrolling receiver feedback")
    # Report both the real structural event count and the exact 3-bit state.
    observedSwitches=sum(receptor["switches"].values())
    total=check(root/"encounter.jsonl.gz","ENCOUNTER",seed)
    total+=check(root/"carry.jsonl.gz","TRANSFER",seed)
    total+=check(root/"reset.jsonl.gz","TRANSFER",seed)
    need(carry["checkpointSha256"]==reset["checkpointSha256"],
         "different encounter parents")
    print(json.dumps({
      "status":"STUDIO09_E1B_EXOGENOUS_CHALLENGE_FULL_STATE_PILOT_QA_PASS_NOT_SCIENCE",
      "world":"E1-P0","auditedTraceRows":total,
      "samePreInterventionFullState":True,
      "identicalFutureSource":True,
      "carryAndResetOnlyChangeStructuralWiring":True,
      "registeredWorldsTested":0,
      "encounterWiring":receptor["wiring"],
      "encounterStructuralSwitches":observedSwitches
    }))
if __name__=="__main__":
    if len(sys.argv)!=2:raise SystemExit("usage: python3 e1_verify_pilot.py DIRECTORY")
    main(sys.argv[1])
