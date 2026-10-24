#!/usr/bin/env python3
"""PF4 G3a: historical-source vs synthetic-prefix cue compatibility diagnostic.

DOES NOT calibrate the fourteen-day residual and DOES NOT assert exact
exchangeability of future Quicknet rounds and SHA256 synthetic tapes.
No network, no live mutation, no future publication round access.
"""
import argparse
import hashlib
import json
from pathlib import Path

N=1731
WORLDS=400
ARMCOUNT=9
BASE=Path("experiments/pf2/live")
G=json.loads((BASE/"GENESIS.json").read_text())

def h(b): return hashlib.sha256(b).digest()
def world_bytes(i,t):
    return h(b"PF4-G3A-DESIGN-PREFIX-SHA256-V1|"+str(i).encode()+b"|"+str(t).encode())
def arm_input(raw,k):
    assert len(raw)==32
    if k==0: return raw.hex()
    return h(b"PF2-REF-"+str(k).encode()+b"|"+raw).hex()
def cue(raw,k):
    return h(arm_input(raw,k).encode())[0]%10

def score(source):
    count=[0]*10
    last=[None]*9
    same=0
    pairs=0
    arm_count=[[0]*10 for _ in range(9)]
    for raw in source:
        cs=[cue(raw,k) for k in range(9)]
        for k,c in enumerate(cs):
            count[c]+=1
            arm_count[k][c]+=1
            if last[k] is not None: same+=int(last[k]==c)
            last[k]=c
        pairs+=sum(int(cs[0]==cs[k]) for k in range(1,9))
    n=sum(count)
    assert n==N*9
    # Source-level diagnostics: not exchangeability proof.
    chisq=sum((v-n/10)**2/(n/10) for v in count)
    return {"cueCounts":count,"chiSquare":chisq,
            "withinArmLagMatches":same,"crossArmCueMatches":pairs,
            "armCounts":arm_count}

def observed():
    names=sorted(x for x in (BASE/"chunks").glob("*.json") if x.name[:8].isdigit())
    rows=[]
    previous=G["genesisDigest"]
    for f in names:
        if len(rows)==N: break
        c=json.loads(f.read_text())
        assert c["startTick"]==len(rows) and c["previousHead"]==previous
        assert len(rows)+len(c["rows"])<=N
        for r in c["rows"]:
            assert r["tick"]==len(rows)
            assert r["round"]==G["R0"]+20*len(rows)
            assert r["previous"]==previous
            raw=bytes.fromhex(r["randomness"])
            assert len(raw)==32
            rows.append(raw)
            previous=r["digest"]
        assert previous==c["finalHead"]
    assert len(rows)==N
    return rows

def tail(x,xs):
    # A purely descriptive percentile of one archived prefix among mock worlds.
    lo=sum(v<=x for v in xs)
    hi=sum(v>=x for v in xs)
    return {"belowOrEqual":lo,"aboveOrEqual":hi,
            "empiricalPosition":(lo+1)/(len(xs)+1),
            "minMock":min(xs),"maxMock":max(xs),
            "status":"DESCRIPTIVE_ONLY_NOT_CALIBRATED_FOR_FULL_RESIDUAL"}

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--out",default="/tmp/pf4-g3a")
    a=p.parse_args()
    out=Path(a.out).resolve()
    assert str(out).startswith("/tmp/") or str(out).startswith("/mnt/data/")
    live=score(observed())
    sims=[]
    for w in range(WORLDS):
        sims.append(score(world_bytes(w,t) for t in range(N)))
    # Marginal, temporal and cross-arm frequencies. Counts alone cannot
    # certify independence or uniform byte exchangeability.
    metrics={n:tail(live[n],[s[n] for s in sims])
             for n in ("chiSquare","withinArmLagMatches","crossArmCueMatches")}
    report={
      "schema":"PF4_G3A_PUBLISHED_PREFIX_SOURCE_COMPATIBILITY_V1",
      "status":"EXPLORATORY_SOURCE_MAPPING_DIAGNOSTIC_NOT_G3_RESIDUAL_CALIBRATION",
      "sourceShaKnown":True,
      "liveSamplePublishedBeforeTest":True,
      "numberOfPublishedPrefixTicks":N,
      "syntheticWorlds":WORLDS,
      "mappedArmsPerWorld":9,
      "nullGenerator":"SHA256(ASCII PF4-G3A-DESIGN-PREFIX-SHA256-V1|world|tick)",
      "sourceAdmissionReadOnly":True,
      "futureRoundSeen":False,
      "observed":live,"marginalDiagnostics":metrics,
      "mockSummary":{m:[s[m] for s in sims]
                     for m in ("chiSquare","withinArmLagMatches","crossArmCueMatches")},
      "limitations":[
        "Single archived prefix, not independent full fourteen-day published windows.",
        "Examines cue frequency/lag/cross-arm agreement only, not code residual.",
        "Null generator is SHA256 pseudo-random 32-byte tapes, not mathematically exchangeable with drand by fiat.",
        "Published prefix is historical engineering data, not the preregistered future period.",
        "Nine arms are deterministic transforms of one common 32-byte per-round value.",
        "Any success here is only absence of a gross source-distribution mismatch under these summaries."]
    }
    out.mkdir(parents=True,exist_ok=True)
    (out/"PF4_G3A_1731_SOURCE_COMPATIBILITY.json").write_text(json.dumps(report,indent=2)+"\n")
    print("PF4_G3A_SOURCE_COMPATIBILITY_DIAGNOSTIC_COMPLETE",
          json.dumps({"ticks":N,"worlds":WORLDS,"metrics":metrics,
                      "G3_14day_status":"NOT_VALIDATED_NOT_PROSPECTIVE"}))
if __name__=="__main__":main()
