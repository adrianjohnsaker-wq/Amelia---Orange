#!/usr/bin/env python3
"""META1 predeclared complete world-level analysis. No partial outcome admittance."""
import argparse,hashlib,json,math
from collections import Counter
from math import comb
from pathlib import Path
from meta1_trace_validator import validate,seed_for

WORLDS=tuple(f"META1-W{i:02d}" for i in range(32))
SCENARIOS=("intact","lesion")
ARMS=("adaptive","round_robin","no_cue")
EXPECTED={(w,s,a) for w in WORLDS for s in SCENARIOS for a in ARMS}
def require(ok,message):
    if not ok:raise ValueError(message)
def filehash(p):
    h=hashlib.sha256()
    with open(p,"rb") as f:
        for b in iter(lambda:f.read(1048576),b""):h.update(b)
    return h.hexdigest()
def exact_sign(w,l):
    n=w+l
    return 1.0 if n==0 else sum(comb(n,i) for i in range(w,n+1))/2**n

def main(root,sealpath):
    root=Path(root)
    seal=json.loads(Path(sealpath).read_text())
    require(seal.get("status")=="FROZEN_BEFORE_META1_SCIENCE","source seal not registered")
    sealsha=filehash(sealpath)
    data={}
    source_worlds={}
    for shard in range(4):
        directory=root/f"meta1-science-shard-{shard}"
        receiptpath=directory/"SHARD_RECEIPT.json"
        require(receiptpath.is_file(),"missing shard receipt "+str(shard))
        sharddata=json.loads(receiptpath.read_text())
        require(sharddata["schema"]=="STUDIO08_META1_SHARD_V1" and
                sharddata["shard"]==shard and sharddata["sealSha256"]==sealsha,
                "science seal/shard mismatch")
        require(len(sharddata["worlds"])==8,"wrong number of worlds in shard")
        for world in sharddata["worlds"]:
            wid=world["worldId"]
            require(wid in WORLDS and int(wid[-2:])//8==shard,
                    "misfiled world")
            require(wid not in source_worlds,"duplicate original world")
            require(world["seedHex"]==seed_for(wid),
                    "wrong registered science seed")
            ck=directory/(wid+".genesis.json")
            require(ck.is_file() and filehash(ck)==world["genesisSha256"],
                    "original genesis snapshot mismatch")
            genesis=json.loads(ck.read_text())
            require(genesis["seedHex"]==world["seedHex"] and
                    genesis["lineageSha256"]==world["initialWorldSha256"],
                    "genesis model source/fork mismatch")
            source_worlds[wid]=world["initialWorldSha256"]
            require(len(world["receipts"])==6,
                    "missing one or more paired science arms")
            for record in world["receipts"]:
                s,a=record["scenario"],record["arm"]
                key=(wid,s,a)
                require(key in EXPECTED and key not in data,
                        "unknown or duplicate world/arm")
                require(record["initialWorldSha256"]==world["initialWorldSha256"] and
                        record["seedHex"]==seed_for(wid),
                        "not matched source state")
                summarypath=directory/record["summaryPath"]
                tracepath=directory/record["tracePath"]
                require(summarypath.is_file() and tracepath.is_file(),
                        "missing raw science evidence")
                require(filehash(summarypath)==record["summarySha256"] and
                        filehash(tracepath)==record["traceSha256"],
                        "tampered summary or trace")
                su=json.loads(summarypath.read_text())
                require((su["worldId"],su["scenario"],su["arm"])==key,
                        "science record identity mismatch")
                require(su["schema"]=="STUDIO08_META1_REGISTERED_RUN_SUMMARY_V1",
                        "unexpected run model/schema")
                require(su["traceRows"]==35000 and
                        su["traceSha256"]==record["traceSha256"],
                        "not a complete 35k-step science run")
                require(su["initialWorldSha256"]==world["initialWorldSha256"],
                        "science source change across matched arms")
                result=validate(tracepath,wid,s,a)
                require(result["ticks"]==35000,"raw steps missing")
                require(result["credits"]==record["learnedCreditEvents"],
                        "selector credits not bound to summary")
                # Distinguish proposed cues from confirmed choice effects.
                counts=su.get("sensorSelections")
                if a in ("adaptive","round_robin"):
                    require(isinstance(counts,dict) and su.get("learnedReceiverFinalState") is not None,
                            "learning receiver stats missing")
                    require(sum(counts.values())==sum(su["learnedReceiverFinalState"]["nSelected"].values()),
                            "sensor choice report inconsistent")
                else:
                    require(counts is None,"no-cue baseline must not log a receiver")
                data[key]=su
    require(len(data)==192 and set(data)==EXPECTED,"32x2x3 complete science evidence missing")
    require(len(source_worlds)==32 and len(set(source_worlds.values()))==32,
            "32 worlds do not have unique initial lineage states")
    perworld=[]
    better=worse=ties=0
    for wid in WORLDS:
        a=data[(wid,"intact","adaptive")]
        b=data[(wid,"intact","round_robin")]
        n=data[(wid,"intact","no_cue")]
        adeaths=sum(a["deathsBySeason"])
        bdeaths=sum(b["deathsBySeason"])
        ndeaths=sum(n["deathsBySeason"])
        D=bdeaths-adeaths
        if D>0:better+=1
        elif D<0:worse+=1
        else:ties+=1
        perworld.append({
          "worldId":wid,"initialWorldSha256":source_worlds[wid],
          "intact":{arm:{
             "allSeasonDeaths":sum(data[(wid,"intact",arm)]["deathsBySeason"]),
             "lastSeasonRoutes":data[(wid,"intact",arm)]["lastSeasonRoutes"],
             "zone2Opportunities":data[(wid,"intact",arm)]["zone2Opportunities"],
             "zone2To7":data[(wid,"intact",arm)]["zone2To7"],
             "sensorSelections":data[(wid,"intact",arm)]["sensorSelections"],
             "learningState":data[(wid,"intact",arm)]["learnedReceiverFinalState"]
           } for arm in ARMS},
          "lesion":{arm:{
             "allSeasonDeaths":sum(data[(wid,"lesion",arm)]["deathsBySeason"]),
             "lesionSeasonDeaths":data[(wid,"lesion",arm)]["lesionSeasonDeaths"],
             "zone2Opportunities":data[(wid,"lesion",arm)]["zone2Opportunities"],
             "lastSeasonRoutes":data[(wid,"lesion",arm)]["lastSeasonRoutes"]
           } for arm in ARMS},
          "pairedIntactDeathsDifferenceRoundRobinMinusAdaptive":D
        })
    deltas=[r["pairedIntactDeathsDifferenceRoundRobinMinusAdaptive"] for r in perworld]
    p=exact_sign(better,worse)
    result={
      "schema":"STUDIO08_META1_FULL_SCIENCE_ANALYSIS_V1",
      "status":"COMPLETE_RAW_EVIDENCE_CHECK_AND_PREREGISTERED_EXACT_SIGN_TEST",
      "scientificSource":"committed Studio01-04 derived learner-house with external deterministic shared source",
      "sealSha256":sealsha,
      "worldCount":32,"completeRunCount":192,"verifiedEventTicks":192*35000,
      "primary":{
        "comparison":"adaptive vs round_robin intact total deaths over 7x5000",
        "hypothesis":"fewer deaths under adaptive memory-sensor selection",
        "pairedBetter":better,"pairedWorse":worse,"pairedTies":ties,
        "pairedMeanSavedDeaths":sum(deltas)/32,
        "oneSidedExactSignP":p,"alpha":0.05,
        "passesPrimary":p<=0.05 and better>worse
      },
      "interpretationBoundary":"No posthoc thresholds. This is simulated-world empirical evidence, not a certificate of intelligence, independent source or receptor genesis.",
      "perWorld":perworld
    }
    print(json.dumps({"status":result["status"],"primary":result["primary"],
                      "worlds":32,"verifiedRuns":192}))
    return result

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--root",required=True)
    p.add_argument("--seal",required=True)
    p.add_argument("--output",required=True)
    a=p.parse_args()
    output=Path(a.output)
    if output.exists():raise RuntimeError("refuse to overwrite prior registered result")
    record=main(a.root,a.seal)
    output.write_text(json.dumps(record,indent=2,sort_keys=True)+"\n")
