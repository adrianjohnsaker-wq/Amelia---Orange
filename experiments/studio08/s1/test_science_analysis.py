#!/usr/bin/env python3
"""Adversarial evidence-acceptance fixtures for 32-world scientific analyzer.

All created "results" are invented SYNTHETIC QA and MUST NOT be shared as
scientific outcomes. This only tests rejection of missing, altered and
mismatched trace/registration/source files.
"""
import copy
import hashlib
import json
from pathlib import Path
import tempfile
from science_analysis import analyze_data,sha,SCHEMA,WORLDS,ARMS,SCENARIOS

def check():
    checks=0
    with tempfile.TemporaryDirectory() as d:
        root=Path(d)
        traces=root/"traces"
        traces.mkdir()
        reg=root/"protocol.md";reg.write_text("SYNTHETIC QA ONLY; NOT SCIENTIFIC PREREGISTRATION\n")
        original_sha=sha(b"ORIGINAL-FAKE-SOURCE-QA")
        admission=root/"admission.json";admission.write_text(json.dumps({
          "status":"STUDIO08_ORIGINAL_IMPORT_CUSTODY_PASS_NOT_SCIENTIFIC_REPLAY",
          "verifiedWorldPairs":8,"sourceRunnerSha256":original_sha,
          "originalCodeExecuted":False}))
        receipt=root/"original-replay.json";receipt.write_text(json.dumps({
          "status":"STUDIO07_ORIGINAL_EIGHT_WORLD_REPLAY_VERIFIED",
          "matchedWorlds":8,"exactCueSerializerVerified":True,
          "fullTraceDigestsMatched":True,"originalRunnerSha256":original_sha,
          "warning":"SIMULATED QA ONLY"}))
        worlds=[]
        for wid in WORLDS:
            initial=sha(("QA-INITIAL-"+wid).encode())
            scenarios={}
            for s in SCENARIOS:
                arms={}
                for a in ARMS:
                    path=f"{wid}-{s}-{a}.jsonl"
                    # Valid-looking but explicitly synthetic 24-row raw transition
                    # fixture, never a genuine source-model result.
                    triplet=((1,8),(8,9),(9,1))
                    ticks=[]
                    for tick in range(1,25):
                        frm,to=triplet[(tick-1)%3]
                        ticks.append({
                          "schema":"S1_ORIGINAL_WORLD_RAW_TRANSITION_V1",
                          "worldId":wid,"scenario":s,"arm":a,"tick":tick,
                          "sourceInput":None,"from":frm,"to":to,"death":False,
                          "preChoiceStateSha256":sha((path+"|"+str(tick-1)).encode()),
                          "postChoiceStateSha256":sha((path+"|"+str(tick)).encode()),
                          "scoreMarginOriginal":0.2,
                          "scoreMarginWithCue":0.2,
                          "selectedSensor":None,"selectedTarget":None,
                          "selectedToken":None,"selectedCueMagnitude":0,
                          "creditsSettled":[],"pendingRewards":0,
                          "candidateReadouts":None
                        })
                    data="".join(json.dumps(x,sort_keys=True)+"\n" for x in ticks)
                    f=traces/path;f.write_text(data)
                    row={"initialWorldSha256":initial,"class":"other",
                        "lastSeasonDeaths":0,"lesionSeasonDeaths":0,
                        "lastSeasonRoutes":5,"lastSeasonPull27":0,
                        "lastSeasonPull45":0,"tracePath":path,
                        "traceSha256":sha(f.read_bytes())}
                    arms[a]=row
                scenarios[s]=arms
            worlds.append({"worldId":wid,
                "seedHex":sha(("STUDIO08-S1-V1|"+wid).encode()),
                "initialWorldSha256":initial,"scenarios":scenarios})
        data={"schema":SCHEMA,"registrationSha256":sha(reg.read_bytes()),
              "sourceDigest":original_sha,
              "originalReplayReceiptSha256":sha(receipt.read_bytes()),"worlds":worlds}
        args=(traces,reg,admission,receipt)
        def reject(candidate,expected):
            nonlocal checks
            try: analyze_data(candidate,*args)
            except ValueError as e:
                if expected not in str(e):raise AssertionError(
                  "unexpected rejection "+str(e)+" wanted "+expected)
            else:raise AssertionError("corrupted evidence admitted: "+expected)
            checks+=1
        result=analyze_data(data,*args)
        assert result["verifiedOutcomeTraceFiles"]==384
        assert result["independentStructuralTraceChecks"]==384
        assert result["worlds"]==32
        assert result["analysis"]["intact"]["pOneSidedExactMcNemar"]==1
        checks+=1
        tampered=copy.deepcopy(data)
        tampered["worlds"].pop()
        reject(tampered,"32 fresh worlds")
        tampered=copy.deepcopy(data)
        tampered["worlds"][0]["seedHex"]="f"*64
        reject(tampered,"seed")
        tampered=copy.deepcopy(data)
        tampered["worlds"][1]["initialWorldSha256"]=data["worlds"][0]["initialWorldSha256"]
        reject(tampered,"reuse seed or full initial state")
        tampered=copy.deepcopy(data)
        tampered["worlds"][0]["scenarios"]["lesion"].pop("round_robin")
        reject(tampered,"six matched arms")
        tampered=copy.deepcopy(data)
        tampered["worlds"][0]["scenarios"]["intact"]["adaptive"]["class"]="held"
        reject(tampered,"miscomputed")
        tampered=copy.deepcopy(data)
        tampered["worlds"][0]["scenarios"]["intact"]["adaptive"]["traceSha256"]="f"*64
        reject(tampered,"trace bytes mismatched")
        tampered=copy.deepcopy(data)
        tampered["registrationSha256"]="f"*64
        reject(tampered,"unmatched preregistration")
        tampered=copy.deepcopy(data)
        tampered["worlds"][0]["scenarios"]["intact"]["adaptive"]["initialWorldSha256"]="f"*64
        reject(tampered,"fork is not same")
        tampered=copy.deepcopy(data)
        tampered["sourceDigest"]="f"*64
        reject(tampered,"diverged from original source")
        tampered=copy.deepcopy(data)
        tampered["worlds"][0]["scenarios"]["intact"]["adaptive"]["tracePath"]="../escape"
        reject(tampered,"unsafe trace")
        print(json.dumps({
          "status":"STUDIO08_S1_ADVERSARIAL_EVIDENCE_GATE_SELFTEST_PASS",
          "positiveQA":1,"tamperingCases":checks-1,
          "qaTraceFiles":384,"genuineSourceFiles":0,
          "genuineStudioWorlds":0,"scientificAnalysis":False
        }))

if __name__=="__main__":check()
