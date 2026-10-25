#!/usr/bin/env python3
"""Independent STRUCTURAL verification of original-model S1 raw transition receipts.

Runs on ONE JSONL and verifies tick continuity, source isolation, choice
amplitude, model-state digest custody, delayed credit timing and no
post-choice credit lookahead. It cannot independently prove hidden simulator
mechanics or that an original model was executed. External exact replay
is mandatory for certification.

  python3 trace_integrity.py --trace full_trace.jsonl --expect-world S1-W00 \
    --scenario intact --arm adaptive
  python3 trace_integrity.py --self-test
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import tempfile

from science_analysis import ARMS,SCENARIOS,WORLDS
from importlib.util import spec_from_file_location,module_from_spec

EDGES={ "0>9","1>8","2>7","3>6","4>5","1>2","2>4","4>7","7>8","8>9","9>1"}
SCHEMA="S1_ORIGINAL_WORLD_RAW_TRANSITION_V1"
def require(ok,why):
    if not ok: raise ValueError(why)
def ishash(x):
    return isinstance(x,str) and len(x)==64 and all(c in "0123456789abcdef" for c in x)
def validate(path,world,scenario,arm):
    require(world in WORLDS and scenario in SCENARIOS and arm in ARMS,
            "invalid requested world condition")
    tick=0
    selected={}
    ncredits=0
    seen_tokens=set()
    cue_count=0
    prev_post=None
    count=0
    with open(path,encoding="utf-8") as f:
        for line in f:
            if not line.strip(): raise ValueError("blank trace line")
            x=json.loads(line)
            tick+=1
            count+=1
            require(x.get("schema")==SCHEMA,"raw trace wrong schema")
            require((x.get("worldId"),x.get("scenario"),x.get("arm"))==
                    (world,scenario,arm),"mixed trace or world")
            require(x.get("tick")==tick,"missing/reordered/duplicated tick")
            require(x.get("sourceInput","absent") is None,"outside signal not absent")
            frm,to=x.get("from"),x.get("to")
            require(type(frm)==int and type(to)==int and f"{frm}>{to}" in EDGES,
                    "invalid directed edge")
            require(type(x.get("death")) is bool,"death flag invalid")
            require(ishash(x.get("preChoiceStateSha256")) and
                    ishash(x.get("postChoiceStateSha256")),
                    "model state digest missing")
            if prev_post is not None:
                require(x["preChoiceStateSha256"]==prev_post,
                        "model source state continuity failure")
            prev_post=x["postChoiceStateSha256"]
            for field in ("scoreMarginOriginal","scoreMarginWithCue"):
                y=x.get(field)
                require(type(y) in (int,float) and math.isfinite(y),
                        "missing/invalid score margin")
            cue=x.get("selectedTarget")
            mag=x.get("selectedCueMagnitude")
            require(cue is None or (type(cue)==int and 0<=cue<=9),
                    "invalid self cue zone")
            require(mag in (0,0.35) and ((cue is None)==(mag==0)),
                    "cue amplitude or null-cue contract violated")
            if mag:cue_count+=1
            token=x.get("selectedToken")
            if arm in ("adaptive","round_robin"):
                require(token is None or isinstance(token,str),
                        "invalid learned-receiver decision token")
                if token is not None:
                    require(token not in selected and token not in seen_tokens,
                            "duplicate decision token")
                    selected[token]={"start":tick,"edges":set()}
                    seen_tokens.add(token)
            else:
                require(token is None,"nonlearning arm must not acquire learner credits")
            active_at_start=set(selected)
            for value in selected.values():
                value["edges"].add(f"{frm}>{to}")
            credits=x.get("creditsSettled")
            require(isinstance(credits,list),"credit settlement trace absent")
            used=set()
            for credit in credits:
                tok=credit.get("token")
                require(tok in selected and tok not in used,"unknown/doubled credit")
                used.add(tok)
                earlier=selected[tok]["start"]
                deadline=earlier+23
                require(credit.get("decisionTick")==earlier and
                        credit.get("observedAt")==tick,
                        "wrong credit timing")
                require(earlier<=tick<=deadline and
                        (x["death"] or tick==deadline),
                        "credit matured before 24 steps without death")
                require(credit.get("deathWithin24")==x["death"],
                        "death attribution inconsistent")
                target=credit.get("reward")
                require(type(target) in (int,float) and math.isfinite(target),
                        "nonfinite delayed reward")
                if x["death"]:
                    require(target==-1,"death must yield -1")
                else:
                    r=max(0,min(1,(len(selected[tok]["edges"])-4)/7))
                    require(abs(target-r)<1e-12,"reward not computed from raw 24-step trajectory")
                del selected[tok]
                ncredits+=1
            if x["death"]:
                require(len(selected)==0,"pending credit unmarked at death")
            require(x.get("pendingRewards")==len(selected),
                    "pending-credit snapshot inconsistent")
            require(x.get("candidateReadouts") is None or
                    (isinstance(x["candidateReadouts"],list) and
                     len(x["candidateReadouts"])==3),
                    "expected three nonhash candidate outputs or null")
    require(count>0,"empty trace")
    return {
      "status":"STUDIO08_S1_RAW_TRACE_STRUCTURE_PASS_NOT_FULL_MODEL_REPLAY",
      "worldId":world,"scenario":scenario,"arm":arm,
      "ticks":count,"cueBearingChoices":cue_count,
      "settledCreditEvents":ncredits,"rightCensoredCredits":len(selected),
      "warning":"Structural receipt checks are insufficient to certify source fidelity."
    }

def fixture_selftest():
    with tempfile.TemporaryDirectory() as d:
        f=Path(d)/"qa.jsonl"
        # Synthetic FIxture and deliberate break:
        base={"schema":SCHEMA,"worldId":"S1-W00","scenario":"intact",
             "arm":"no_cue","tick":1,"sourceInput":None,
             "from":1,"to":8,"death":False,
             "preChoiceStateSha256":"a"*64,
             "postChoiceStateSha256":"b"*64,
             "scoreMarginOriginal":0.1,"scoreMarginWithCue":0.1,
             "selectedTarget":None,"selectedCueMagnitude":0,
             "selectedToken":None,"creditsSettled":[],
             "pendingRewards":0,"candidateReadouts":None}
        f.write_text(json.dumps(base)+"\n")
        assert validate(f,"S1-W00","intact","no_cue")["ticks"]==1
        wrong=base.copy();wrong["sourceInput"]="not absent"
        f.write_text(json.dumps(wrong)+"\n")
        try:
            validate(f,"S1-W00","intact","no_cue")
            raise AssertionError("outside input accepted")
        except ValueError as e:
            assert "tick" in str(e) or "outside" in str(e)
        wrong=base.copy();wrong["sourceInput"]=None
        wrong["selectedCueMagnitude"]=0.35
        f.write_text(json.dumps(wrong)+"\n")
        try:
            validate(f,"S1-W00","intact","no_cue")
            raise AssertionError("cue without target accepted")
        except ValueError:
            pass
    print(json.dumps({"status":"STUDIO08_S1_RAW_TRACE_SELFTEST_PASS",
                      "positiveQA":1,"negativeQA":2,
                      "originalSourceLoaded":False,"scienceRun":False}))

if __name__=="__main__":
    p=argparse.ArgumentParser()
    op=p.add_mutually_exclusive_group(required=True)
    op.add_argument("--self-test",action="store_true")
    op.add_argument("--trace")
    p.add_argument("--expect-world")
    p.add_argument("--scenario")
    p.add_argument("--arm")
    args=p.parse_args()
    if args.self_test:fixture_selftest()
    else:
        require(all([args.expect_world,args.scenario,args.arm]),
                "world, scenario, arm required")
        print(json.dumps(validate(args.trace,args.expect_world,args.scenario,args.arm),indent=2))
