#!/usr/bin/env python3
"""PF4 AM1 two-phase preseal / postseal structural guard; --self-test uses fabricated fixtures.

This program CANNOT verify RFC3161, BLS, source-code identity, custody or
whether future information was accessible. It checks expected schemas, dates,
two code-family identity, planned test policy, artifact digests and numerical
temporal gates. Independent verification must be separate.

DOES NOT fetch, inspect or admit beacon rounds, generate the sigil code,
score any world, create a seal, or alter PF1/PF2/C1.
"""
from datetime import datetime, timezone
import argparse
import json
import hashlib
from pathlib import Path

SOURCE_CHAIN = "52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971"
VSTAR = "de0d86764a300abe5187b06a379be1beefed859942784d12cd6a672f81702925"
SCHEMA = "PF4_AM1_TWO_FAMILY_PRESEAL_V1"
GENESIS = 1692803367
TICKS, STRIDE, SEC = 20160, 20, 3
START = 34196220
UNLOCK = 35810220
FIRST = [START + i*TICKS*STRIDE for i in range(4)]
LAST = [x + (TICKS-1)*STRIDE for x in FIRST]

def require(ok, reason):
    if not ok: raise ValueError("PF4_AM1_PRESEAL_STOP: "+reason)
def sha64(v):
    return isinstance(v,str) and len(v)==64 and all(c in "0123456789abcdef" for c in v)
def expected_time(round_no):
    return datetime.fromtimestamp(GENESIS+SEC*(round_no-1),timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
def validate(d,phase="postseal"):
    require(phase in ("preseal","postseal"),"BAD_PHASE")
    require(isinstance(d,dict) and d.get("schema")==SCHEMA,"UNKNOWN_SCHEMA")
    require(d.get("status")==("READY_FOR_INDEPENDENT_SEAL" if phase=="preseal" else "SEALED_EXTERNALLY_AND_VERIFIED"),"NOT_READY")
    require(d.get("chainHash")==SOURCE_CHAIN,"CHAIN_NOT_PINNED")
    require(d.get("stride")==STRIDE and d.get("ticksPerWindow")==TICKS,"SOURCE_CADENCE_CHANGED")
    require(d.get("analysisSourceSHA256") and sha64(d.get("analysisSourceSHA256")),"NO_FROZEN_ANALYSIS")
    require(d.get("inputAdapterSHA256") and sha64(d.get("inputAdapterSHA256")),"NO_FROZEN_ADAPTER")
    require(d.get("verifierPinnedCommit")=="f1875b5eea5339eb1ac73e50b5df6b103d0cabe9","VERIFIER_ID_CHANGED")
    require(d.get("sourceAvailableAtRegistration") is False,"FUTURE_ALREADY_OBSERVED")
    W=d.get("windows")
    require(isinstance(W,list) and len(W)==4,"MISSING_FOUR_WINDOWS")
    for i,row in enumerate(W):
        require(type(row)==dict and row.get("index")==i+1,"BAD_WINDOW_INDEX")
        require(row.get("startRound")==FIRST[i],"START_ROUND_MISMATCH_"+str(i))
        require(row.get("lastRound")==LAST[i],"LAST_ROUND_MISMATCH_"+str(i))
        require(row.get("startUTC")==expected_time(FIRST[i]),"START_TIME_MISMATCH_"+str(i))
        require(row.get("lastUTC")==expected_time(LAST[i]),"LAST_TIME_MISMATCH_"+str(i))
        if i:
            require(W[i-1]["lastRound"]+STRIDE==row["startRound"],"NONCONTIGUOUS_WINDOW")
    require(d.get("unlockRound")==UNLOCK,"UNLOCK_ROUND_CHANGED")
    require(UNLOCK>=LAST[-1]+1200,"TIMELOCK_BUFFER_UNDER_1_HOUR")
    require(d.get("unlockUTC")==expected_time(UNLOCK),"UNLOCK_TIME_INCONSISTENT")
    P=d.get("PF2")
    require(isinstance(P,dict),"MISSING_PF2_REPORT_LOCK")
    require(P.get("day30AdmittedTicks")==43200,"PF2_BOUNDARY_CHANGED")
    require(P.get("day30EvaluationStatus")=="PUBLISHED","PF2_DAY30_NOT_PUBLISHED")
    require(P.get("day30ReportPublishedBeforeWindow1") is True,"PF2_REPORT_NOT_BEFORE_TARGET")
    require(P.get("P2_2ExtensionPolicy")=="IF_SPARSE_PUBLISH_DAY60_BEFORE_DECRYPTION","PF2_DAY60_RULE_MISSING")
    g=d.get("historicalGate")
    require(isinstance(g,dict),"NO_HISTORICAL_SOURCE_G3")
    require(g.get("publishedFullWindows")==10,"NOT_TEN_PUBLISHED_HISTORICAL_WORLDS")
    require(g.get("individualBLSVerifiedRounds")==201600,"NOT_ALL_HISTORICAL_SIGNATURES_VERIFIED")
    require(g.get("RmeanSourceComparison")=="PASS_WITH_PREDECLARED_CRITERIA","HISTORICAL_EQUIVALENCE_UNRESOLVED")
    require(sha64(g.get("fullReportSHA256")),"HISTORICAL_PROVENANCE_MISSING")
    C=d.get("families")
    require(isinstance(C,list) and len(C)==2,"MUST_HAVE_TWO_CODES")
    names=[r.get("id") for r in C if isinstance(r,dict)]
    require(names==["VSTAR","INSCRIPTION"],"CODE_FAMILY_ORDER_OR_COUNT")
    for i,c in enumerate(C):
        require(sha64(c.get("codeSHA256")),"MISSING_CANDIDATE_DIGEST_"+str(i))
        require(sha64(c.get("shiftedCodeSHA256")),"MISSING_SHIFT_CONTROL_SHA_"+str(i))
        require(c["shiftedCodeSHA256"]!=c["codeSHA256"],"CONTROL_IDENTICAL_TO_CANDIDATE")
        require(c.get("shiftRule")=="code[(k+1)%9]","CONTROL_SHIFT_CHANGED")
        require(c.get("nullWorldSeedStart")==1000 and c.get("nullWorldCount")==400,
            "NULL_WORLD_FAMILY_CHANGED")
        require(c.get("nullInputRule")=='SHA256(UTF8("PF4-NULL|seed|t"))',
            "NULL_INPUT_GENERATOR_CHANGED")
        require(sha64(c.get("nullCalibrationArtifactSHA256")),"NO_400_WORLD_NULL_SOURCE")
        require(sha64(c.get("positiveControlArtifactSHA256")),"NO_POSITIVE_CONTROL_SOURCE")
        require(c.get("nullQualityStatus")=="PASS","NEGATIVE_NULL_GATE")
        require(c.get("positiveControlStatus")=="PASS","NO_VALID_POSITIVE_CONTROL")
        require(c.get("statistic")=="FOUR_WINDOW_MEAN_SHIFT_MINUS_ORIGINAL_R_MEAN",
            "STATISTIC_CHANGED")
        require(c.get("activeEdges")=="ALL_11_EXCEPT_3>6","ACTIVE_EDGE_SELECTION_CHANGED")
    require(C[0]["codeSHA256"]==VSTAR,"ORIGINAL_VSTAR_CHANGED")
    require(C[1]["codeSHA256"]!=VSTAR,"INSCRIPTION_EQUALS_VSTAR")
    require(sha64(d.get("inscriptionV1SourceSHA256")),"INSCRIPTION_SOURCE_UNPINNED")
    require(d.get("inscriptionRunCount")==1,"INSCRIPTION_NOT_ONCE")
    require(d.get("inscriptionPlaintextHumanInspected") is False,"INSCRIPTION_NOT_BLIND")
    require(sha64(d.get("inscriptionTlockCiphertextSHA256")),"NO_TIMELOCK_CIPHERTEXT")
    require(d.get("inscriptionTlockRound")==UNLOCK,"TIMELOCK_INCORRECT")
    D=d.get("multiplicity")
    require(isinstance(D,dict),"MISSING_OPERATOR_ALPHA_POLICY")
    if D.get("policy")=="D":
        require(D.get("VSTAR_ALPHA")=="0.005" and D.get("INSCRIPTION_ALPHA")=="0.005",
            "WRONG_BONFERRONI_FAMILY_ALPHA")
        require(D.get("INSCRIPTION_CONFIRMATORY") is True,"DUAL_ARM_NOT_CONFIRMATORY")
    elif D.get("policy")=="P":
        require(D.get("VSTAR_ALPHA")=="0.01" and D.get("INSCRIPTION_ALPHA") is None,
            "WRONG_PRIMARY_ONLY_ALPHA")
        require(D.get("INSCRIPTION_CONFIRMATORY") is False,"INSCRIPTION_NOT_EXPLORATORY")
    else: raise ValueError("PF4_AM1_PRESEAL_STOP: MULTIPLICITY_CHOICE_UNRESOLVED")
    require(sha64(D.get("jointNullSourceSHA256")),"NO_JOINT_NULL_SOURCE")
    require(D.get("statisticalProcedureFrozen") is True,"NULL_TAIL_NOT_FROZEN")
    require(d.get("sourceCommitmentIncludesAllNegativeResults") is True,"NO_FAILURE_REPORTING")
    E=d.get("independentExternalSeal")
    if phase=="preseal":
        require(E is None,"PRESEAL_MUST_NOT_PRETEND_ALREADY_TIMESTAMPED")
    else:
        require(isinstance(E,dict),"NO_EXTERNAL_SEAL")
        require(sha64(E.get("sealInputBundleSHA256")),"NO_TIMESTAMPED_BUNDLE")
        require(sha64(E.get("RFC3161TokenSHA256")),"MISSING_TIMESTAMP_TOKEN_HASH")
        require(E.get("trustVerificationStatus")=="PASS","RFC3161_NOT_INDEPENDENTLY_VERIFIED")
        r=E.get("lastRoundPublishedAtSeal")
        require(type(r)==int and r<FIRST[0],"SEALED_TOO_LATE")
        require(E.get("dateUTC", "")<expected_time(FIRST[0]),"SEAL_TIMESTAMP_AFTER_TARGET")
    return {
      "result":phase.upper()+"_STRUCTURAL_GATE_PASS_NOT_PHYSICAL_CRYPTOGRAPHIC_VERIFICATION",
      "twoFamilies":names,"alphaPolicy":D["policy"],
      "firstRound":FIRST[0],"lastRound":LAST[-1],"unlockRound":UNLOCK,
      "knownLimitations":["external timestamps and BLS reports are attested, not independently cryptographically verified by this script",
                          "two candidate codes require separate null distributions",
                          "no prospective effects tested"]}

def mock():
    h="1"*64
    row=lambda i,name:dict(id=name,codeSHA256=VSTAR if i==0 else "2"*64,
      shiftedCodeSHA256="3"*64,shiftRule="code[(k+1)%9]",
      nullWorldSeedStart=1000,nullWorldCount=400,
      nullInputRule='SHA256(UTF8("PF4-NULL|seed|t"))',
      nullCalibrationArtifactSHA256=h,positiveControlArtifactSHA256=h,
      nullQualityStatus="PASS",positiveControlStatus="PASS",
      statistic="FOUR_WINDOW_MEAN_SHIFT_MINUS_ORIGINAL_R_MEAN",
      activeEdges="ALL_11_EXCEPT_3>6")
    return dict(schema=SCHEMA,status="SEALED_EXTERNALLY_AND_VERIFIED",
      chainHash=SOURCE_CHAIN,stride=STRIDE,ticksPerWindow=TICKS,
      analysisSourceSHA256=h,inputAdapterSHA256=h,
      verifierPinnedCommit="f1875b5eea5339eb1ac73e50b5df6b103d0cabe9",
      sourceAvailableAtRegistration=False,
      windows=[dict(index=i+1,startRound=FIRST[i],lastRound=LAST[i],
                    startUTC=expected_time(FIRST[i]),lastUTC=expected_time(LAST[i])) for i in range(4)],
      unlockRound=UNLOCK,unlockUTC=expected_time(UNLOCK),
      PF2=dict(day30AdmittedTicks=43200,day30EvaluationStatus="PUBLISHED",
               day30ReportPublishedBeforeWindow1=True,
               P2_2ExtensionPolicy="IF_SPARSE_PUBLISH_DAY60_BEFORE_DECRYPTION"),
      historicalGate=dict(publishedFullWindows=10,individualBLSVerifiedRounds=201600,
        RmeanSourceComparison="PASS_WITH_PREDECLARED_CRITERIA",fullReportSHA256=h),
      families=[row(0,"VSTAR"),row(1,"INSCRIPTION")],
      inscriptionV1SourceSHA256=h,inscriptionRunCount=1,
      inscriptionPlaintextHumanInspected=False,inscriptionTlockCiphertextSHA256=h,
      inscriptionTlockRound=UNLOCK,
      multiplicity=dict(policy="D",VSTAR_ALPHA="0.005",INSCRIPTION_ALPHA="0.005",
        INSCRIPTION_CONFIRMATORY=True,jointNullSourceSHA256=h,statisticalProcedureFrozen=True),
      sourceCommitmentIncludesAllNegativeResults=True,
      independentExternalSeal=dict(sealInputBundleSHA256=h,RFC3161TokenSHA256=h,
        trustVerificationStatus="PASS",lastRoundPublishedAtSeal=FIRST[0]-20,
        dateUTC="2026-11-22T22:00:00Z"))

def selftest():
    good=mock()
    assert validate(good,phase="postseal")["alphaPolicy"]=="D"
    ready=json.loads(json.dumps(good))
    ready["status"]="READY_FOR_INDEPENDENT_SEAL"
    ready["independentExternalSeal"]=None
    assert validate(ready,phase="preseal")["alphaPolicy"]=="D"
    try:validate(ready,phase="postseal")
    except ValueError:pass
    else:raise AssertionError("PRESEAL_NOT_PERMITTED_AS_POSTSEAL")
    try:validate(good,phase="preseal")
    except ValueError:pass
    else:raise AssertionError("ALREADY_SEALED_NOT_PRESEAL")
    y=json.loads(json.dumps(good))
    y["multiplicity"].update(policy="P",VSTAR_ALPHA="0.01",INSCRIPTION_ALPHA=None,
                             INSCRIPTION_CONFIRMATORY=False)
    assert validate(y)["alphaPolicy"]=="P"
    edits=[
      lambda x:x["multiplicity"].update(policy="UNDECIDED"),
      lambda x:x["multiplicity"].update(policy="D",INSCRIPTION_ALPHA="0.01"),
      lambda x:x["PF2"].update(day30EvaluationStatus="NOT_YET_REPORTED"),
      lambda x:x["historicalGate"].update(individualBLSVerifiedRounds=30),
      lambda x:x["families"][1].update(nullWorldCount=399),
      lambda x:x["families"][1].update(codeSHA256=VSTAR),
      lambda x:x.update(inscriptionRunCount=2),
      lambda x:x.update(inscriptionPlaintextHumanInspected=True),
      lambda x:x["windows"][0].update(startRound=FIRST[0]+20),
      lambda x:x["independentExternalSeal"].update(lastRoundPublishedAtSeal=FIRST[0]),
      lambda x:x["independentExternalSeal"].update(trustVerificationStatus="NOT_CHECKED")
    ]
    for change in edits:
        x=json.loads(json.dumps(good));change(x)
        try: validate(x)
        except(ValueError,KeyError):continue
        raise AssertionError("NEGATIVE_PRESEAL_TEST_FAILED")
    print("PF4_AM1_DUAL_ARM_TWO_PHASE_GUARD_AND_NEGATIVE_TESTS_PASS_MOCK_ONLY")

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--self-test",action="store_true")
    p.add_argument("--manifest")
    p.add_argument("--phase",choices=("preseal","postseal"),default="preseal")
    a=p.parse_args()
    if a.self_test:selftest();return
    if not a.manifest:p.error("--manifest JSON required")
    result=validate(json.loads(Path(a.manifest).read_text()),phase=a.phase)
    print(json.dumps(result,sort_keys=True))
if __name__=="__main__":main()
