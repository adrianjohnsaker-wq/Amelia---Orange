#!/usr/bin/env python3
"""E1B PILOT-ONLY matched source contrast with IDENTICAL recency receptor.

No new threshold/seed/model tweak. Same genesis, selected sensor bank,
and 10k encounter horizon. Only the predeclared outside-input tape differs.
"""
import gzip,hashlib,json,sys
from pathlib import Path
def require(ok,msg):
    if not ok:raise ValueError("E1B_MATCHED_SOURCE_AUDIT: "+msg)
def sha(f):
    h=hashlib.sha256()
    with open(f,"rb") as x:
        for b in iter(lambda:x.read(1048576),b""):h.update(b)
    return h.hexdigest()
def main(folder):
    folder=Path(folder)
    ordered=folder/"ordered"
    ck0=json.loads((folder/"encounter_checkpoint.json").read_text())
    ck1=json.loads((ordered/"encounter_checkpoint.json").read_text())
    a=json.loads((folder/"encounter_receipt.json").read_text())
    b=json.loads((ordered/"encounter_receipt.json").read_text())
    require(ck0["order"]=="sink-challenge" and ck1["order"]=="ordered",
            "wrong source comparison")
    require(a["genesisSha256"]==b["genesisSha256"],
            "genesis was not an exact matched source")
    require(a["mode"]==b["mode"]=="feedback" and
            ck0["sourceLineageSha256"]==ck1["sourceLineageSha256"],
            "different experimental learner in matched arms")
    require(ck0["receptor"]["schema"]==ck1["receptor"]["schema"]==
            "STUDIO09_E1B_RECEPTOR_V1","not same rolling model")
    require(a["tickCount"]==b["tickCount"]==10000,
            "not same encounter duration")
    require(a["traceSha256"]==sha(folder/"encounter.jsonl.gz") and
            b["traceSha256"]==sha(ordered/"encounter.jsonl.gz"),
            "tampered raw source traces")
    seed=ck1["seedHex"]
    changes=[]
    for fn,regime in ((folder/"encounter.jsonl.gz","challenge"),
                      (ordered/"encounter.jsonl.gz","ordered")):
        ticks=0;deaths=0
        with gzip.open(fn,"rt") as h:
            for line in h:
                ticks+=1
                r=json.loads(line)
                require(r["tick"]==ticks,"nonconsecutive original-model ticks")
                season=(ticks-1)//5000+1;tick=(ticks-1)%5000+1
                if regime=="ordered":
                    expected=f"STUDIO09-E1-OUTSIDE-V1|{seed}|E{season}|{tick}"
                    require(r["sourceInput"]==expected,
                            "ordered source not frozen E1 tape")
                else:
                    src=r["sourceInput"]
                    pref=f"STUDIO09-E1B-EXOGENOUS-CHALLENGE-V1|{seed}|{season}|{tick}|"
                    require(src.startswith(pref),"challenge source prefix mismatch")
                    nonce=int(src[len(pref):])
                    require(0<=nonce<=127,"out-of-range source nonce")
                    digest=hashlib.sha256(src.encode()).hexdigest()
                    require((int(digest[:2],16)%10)==5,
                            "not predetermined sink-zone input")
                deaths+=int(r["death"])
        require(ticks==10000,"incomplete encounter")
        changes.append({"regime":regime,"encounterDeaths":deaths})
    result={
      "status":"STUDIO09_E1B_MATCHED_EXOGENOUS_SOURCE_CONTRAST_QA_PASS_NOT_SCIENCE",
      "world":"E1-P0","pilotOnly":True,
      "sameGeneticStartingState":True,
      "identicalReceptorAndThreshold":True,
      "identicalEncounterLength":True,
      "onlySourceTapeChanged":True,
      "challenge":{**changes[0],
        "structuralChanges":ck0["receptor"]["switches"],
        "wiring":ck0["receptor"]["wiring"]},
      "ordered":{**changes[1],
        "structuralChanges":ck1["receptor"]["switches"],
        "wiring":ck1["receptor"]["wiring"]},
      "traceSha256Challenge":a["traceSha256"],
      "traceSha256Ordered":b["traceSha256"],
      "registeredScienceWorlds":0
    }
    out=folder/"E1B_MATCHED_SOURCE_CONTROL.json"
    if out.exists():raise FileExistsError("comparison receipt exists")
    out.write_text(json.dumps(result,indent=2,sort_keys=True)+"\n")
    print(json.dumps(result,sort_keys=True))
if __name__=="__main__":
    if len(sys.argv)!=2:raise SystemExit("usage: e1b_compare_source.py P0_DIRECTORY")
    main(sys.argv[1])
