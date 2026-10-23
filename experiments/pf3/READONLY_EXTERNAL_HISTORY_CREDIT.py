#!/usr/bin/env python3
"""PF3 Phase-0: read-only PF2 external-history-to-memory-credit provenance.
No live input, no receiver mutation, no inferential statistics. No BLS/RFC3161
cryptographic verification (archived verified-status asserted; use native audit).
"""
from __future__ import annotations
from collections import Counter,defaultdict
from datetime import datetime,timezone
from hashlib import sha256
import argparse,json,os,pathlib

ROOT=pathlib.Path("experiments/pf2/live")
EDGESET={"0>9","1>8","2>7","3>6","4>5","1>2","2>4","4>7","7>8","8>9","9>1"}
ARMS=["C"]+[f"R{k:02d}" for k in range(1,9)]
def read(p):return json.loads(p.read_text(encoding="utf-8"))
def mode_class(e):
    if not e["choicePoint"]:return "forced"
    if not e["cueAmongOpenExits"]:return "cue_not_open"
    return "cue_followed" if e["followedCue"] else "cue_declined"
def cue_motif(xs):
    if len(xs)<4:return "initial_short"
    if xs[-1]==xs[-2] or xs[-2]==xs[-3] or xs[-3]==xs[-4]:return "adjacent_repeat"
    if xs[-1]==xs[-3] and xs[-2]==xs[-4] and xs[-1]!=xs[-2]:return "alternating_ABAB"
    return "some_repeat" if len(set(xs[-4:]))<4 else "four_distinct"
def input_for(randomness,k):
    b=bytes.fromhex(randomness)
    if k==0:return randomness
    return sha256(f"PF2-REF-{k}|".encode()+b).hexdigest()
def nowutc(unix):
    return datetime.fromtimestamp(unix,tz=timezone.utc).isoformat() if isinstance(unix,(int,float)) else None
def main():
    p=argparse.ArgumentParser()
    p.add_argument("--output",default="/tmp/pf3-external-history-selection")
    args=p.parse_args()
    dest=pathlib.Path(args.output).resolve()
    if not (str(dest).startswith("/tmp/") or str(dest).startswith("/mnt/data/")):
        raise ValueError("OUTPUT_OUTSIDE_REPOSITORY_REQUIRED")
    g=read(ROOT/"GENESIS.json")
    assert g["schema"]=="PF2_LIVE_GENESIS_V1" and g["notificationsEnabled"] is False
    files=sorted((ROOT/"chunks").glob("????????.json"))
    assert files,"NO_ADMITTED_CHUNKS"
    histories={a:[] for a in ARMS}
    lives={(a,m):{"index":0,"zones":[0],"events":[]} for a in ARMS for m in ["learner","unchanged"]}
    stats=defaultdict(Counter)
    motifs=defaultdict(Counter)
    arms=defaultdict(lambda:defaultdict(Counter))
    links=[]
    terminal=[]
    tick=0
    prior=g["genesisDigest"]
    for chunkfile in files:
        c=read(chunkfile)
        assert c["verifiedStatus"]=="PASS" and c["notificationsSent"]==0
        assert c["startTick"]==tick and c["previousHead"]==prior
        assert c["count"]==len(c["rows"]) and c["count"]>0
        for row in c["rows"]:
            assert row["tick"]==tick and row["round"]==g["R0"]+20*tick
            assert row["previous"]==prior
            assert row["verification"]=="REAL_QUICKNET_BLS_VERIFIED_WITH_PINNED_C1_PF1"
            assert sha256(bytes.fromhex(row["signature"])).hexdigest()==row["randomness"]
            events=row["armEvents"]
            assert len(events)==18
            for k,a in enumerate(ARMS):
                learner,control=events[2*k:2*k+2]
                assert learner["armId"]==control["armId"]==a
                assert learner["mode"]=="learner" and control["mode"]=="unchanged"
                assert learner["cueZone"]==control["cueZone"]
                assert learner["round"]==control["round"]==row["round"]
                assert learner["tick"]==control["tick"]==tick+1
                histories[a].append(learner["cueZone"])
                cues=histories[a]
                inp=input_for(row["randomness"],k)
                for e in (learner,control):
                    key=(a,e["mode"])
                    s=lives[key]
                    assert e["fromZone"]==s["zones"][-1]
                    s["zones"].append(e["toZone"])
                    source={
                        "arm":a,"mode":e["mode"],"life":s["index"],
                        "stepInLife":len(s["events"]),
                        "tick":tick,"round":row["round"],
                        "roundUnixTime":row.get("roundTime"),
                        "roundUtc":nowutc(row.get("roundTime")),
                        "rawRandomnessHex":row["randomness"],
                        "rawBlsSignatureHex":row["signature"],
                        "effectiveArmInputHex":inp,
                        "rowDigest":row["digest"],
                        "fromZone":e["fromZone"],"toZone":e["toZone"],
                        "edge":f'{e["fromZone"]}>{e["toZone"]}',
                        "cueZone":e["cueZone"],
                        "cueClass":mode_class(e),
                        "last4CueZones":list(cues[-4:]),
                        "cueMotif":cue_motif(cues),
                        "pathFromBirthThroughSource":list(s["zones"]),
                    }
                    assert source["edge"] in EDGESET
                    s["events"].append(source)
                    stats["steps"][e["mode"]]+=1
                    if e["choicePoint"]:stats["choices"][e["mode"]]+=1
                    if e["refrainOutcome"] is not None:
                        if e["mode"]!="learner":raise AssertionError("CONTROL_CREDIT_FOUND")
                        r=e["refrainOutcome"];idx=r["settledStep"]
                        assert isinstance(idx,int) and idx==len(s["events"])-24,("BAD_SETTLEMENT_INDEX",a,tick,idx,len(s["events"]))
                        assert 0<=idx<len(s["events"])
                        src=s["events"][idx]
                        assert src["edge"]==r["edge"] and r["edge"] in EDGESET
                        assert e["tick"]-src["tick"]==24,("SOURCE_LAG_WRONG",e["tick"],src["tick"])
                        outcome=r["outcome"]
                        assert 0<=outcome<=1
                        positive=outcome>0
                        stats["credits"]["all"]+=1
                        stats["credits"]["positive" if positive else "zero"]+=1
                        stats["source_cue_class"][src["cueClass"]]+=1
                        stats["source_cue_class_positive" if positive else "source_cue_class_zero"][src["cueClass"]]+=1
                        motifs["all"][src["cueMotif"]]+=1
                        motifs["positive" if positive else "zero"][src["cueMotif"]]+=1
                        arms[a]["credits"]["all"]+=1
                        arms[a]["credits"]["positive" if positive else "zero"]+=1
                        arms[a]["source_cue_class"][src["cueClass"]]+=1
                        links.append({
                            "schema":"PF3_HISTORY_CREDIT_LINK_V1",
                            "meaning":"descriptive association; not causal attribution of cue history",
                            "source":src,
                            "settlement":{"tick":tick,"round":row["round"],
                                "roundUnixTime":row.get("roundTime"),
                                "rawRandomnessHex":row["randomness"],
                                "rawBlsSignatureHex":row["signature"],
                                "rowDigest":row["digest"],
                                "outcome":outcome,
                                "edge":r["edge"],"positiveRefrain":positive,
                                "sourceStepInLife":idx},
                            "completePathBetweenSourceAndSettlement":
                                [src["fromZone"]]+[x["toZone"] for x in s["events"][idx:]]
                        })
                    if e["death"] is not None:
                        d=e["death"]
                        assert e["toZone"]==5
                        assert d["round"]==row["round"]
                        stats["deaths"][e["mode"]]+=1
                        finish=d["finalExcursion"]
                        assert len(finish)>0 and all(x in EDGESET for x in finish)
                        exact_sources=[]
                        for edge in finish:
                            observed=[ev for ev in s["events"] if ev["edge"]==edge]
                            assert observed,("DEATH_FINAL_EDGE_ABSENT",edge)
                            exact_sources.append(observed[-1])
                        terminal.append({"schema":"PF3_TERMINAL_HISTORY_LINK_V1",
                            "arm":a,"mode":e["mode"],"life":s["index"],
                            "deathTick":tick,"deathRound":row["round"],
                            "deathRawRandomnessHex":row["randomness"],
                            "deathBlsSignatureHex":row["signature"],
                            "deathRowDigest":row["digest"],
                            "deathCue":e["cueZone"],"deathLength":d["length"],
                            "negativeFinalExcursionEdges":finish,
                            "associatedLastOccurrenceSources":exact_sources,
                            "finalV":d["finalV"],"finalLifePath":s["zones"]})
                        s["index"]+=1
                        s["zones"]=[0];s["events"]=[]
            prior=row["digest"];tick+=1
        assert c["finalHead"]==prior
    assert len(links)==stats["credits"]["all"]
    assert sum(stats["deaths"].values())==len(terminal)
    out={"schema":"PF3_EXTERNAL_HISTORY_CREDIT_ATLAS_EXPLORATORY_V1",
        "status":"READ_ONLY_ARCHIVED_ASSOCIATIONS_NOT_INDEPENDENT_AGENCY_OR_REGISTERED_TEST",
        "source":{"genesisDigest":g["genesisDigest"],"R0":g["R0"],
            "admittedTicks":tick,"firstRound":g["R0"],
            "lastRound":g["R0"]+20*(tick-1),
            "lastChainedDigest":prior,"chunkCount":len(files),
            "referenceStreamsAreDomainSeparatedFromSameOnePhysicalBeacon":True},
        "auditScope":{"rawBeaconSignatureSha256Equality":True,
            "contiguousTickAndPreviousHeadChecks":True,
            "originalBlsVerificationRerun":False,
            "rfc3161VerificationRerun":False,
            "canonicalEngineReplayRerun":False},
        "totals":{k:dict(v) for k,v in stats.items()},
        "cueMotifs":{k:dict(v) for k,v in motifs.items()},
        "byArm":{k:{q:dict(v) for q,v in cs.items()} for k,cs in arms.items()},
        "historyCredits":len(links),"terminalLinks":len(terminal),
        "interpretation":["PF2 V(e) learns from return/novelty outcomes, not an explicit selective external-history store.",
            "A positive refrain outcome is not proof that its source cue CAUSED the credit.",
            "External input controls retain the same physical beacon for R01-R08.",
            "This snapshot cannot test persistent agency of the independent beacon.",
            "The new PF3 charter remains an unsealed design proposal and is not run."] }
    dest.mkdir(parents=True,exist_ok=True)
    (dest/"HISTORY_CREDIT_SUMMARY.json").write_text(json.dumps(out,indent=2)+"\n")
    (dest/"HISTORY_CREDIT_LINKS.jsonl").write_text("".join(json.dumps(x,separators=(",",":"))+"\n" for x in links))
    (dest/"TERMINAL_HISTORY_LINKS.jsonl").write_text("".join(json.dumps(x,separators=(",",":"))+"\n" for x in terminal))
    print("PF3_EXTERNAL_HISTORY_CREDIT_LINKAGE_READONLY_PASS",
      json.dumps({"ticks":tick,"chunks":len(files),"learnerCreditSettlements":len(links),
        "positive":stats["credits"]["positive"],"zero":stats["credits"]["zero"],
        "sourceCueClasses":dict(stats["source_cue_class"]),
        "sourceCuePositive":dict(stats["source_cue_class_positive"]),
        "terminalRecords":len(terminal),
        "head":prior,"output":str(dest)}))
if __name__=="__main__":main()
