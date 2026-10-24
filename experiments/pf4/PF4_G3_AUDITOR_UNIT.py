#!/usr/bin/env python3
"""Only fixed mock fixtures: validates the G3 auditor, NEVER null calibration."""
import tempfile,importlib.util,json,hashlib,copy
from pathlib import Path
p=Path(__file__).with_name("PF4_G3_CALIBRATION_AUDITOR.py")
spec=importlib.util.spec_from_file_location("pf4g3auditor",p)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
sha=lambda s:hashlib.sha256(s.encode()).hexdigest()
fixture={
 "schema":"PF4_G3_CALIBRATION_EXPORT_V1",
 "candidateCodeSha256":mod.CANDIDATE_SHA,
 "source":{
   "kind":"PREDECLARED_SYNTHETIC_32_BYTE_UNIFORM_MODEL",
   "domainSeparation":"PF2-REF-i|",
   "ticksPerWorld":20160,"armsPerWorld":9,
   "disjointFromFutureTarget":True,"independentSeeds":True,
   "generatorSourceSha256":sha("UNIT-GENERATOR-SOURCE"),
   "adapterSourceSha256":sha("UNIT-ADAPTER-SOURCE"),
   "seedSelectionDeclaredBeforeCalibration":True},
 "worlds":[]
}
for i in range(400):
    s={"C0":.25+(i%20)/1000,"lineage_shift":.29+(i%20)/1000}
    if i<100:s["blank"]=.39+(i%20)/1000
    fixture["worlds"].append({"index":i,"worldId":f"UNIT-ONLY-{i:03d}",
      "seedHex":sha(f"mock-seed-{i}"),
      "tapeSha256":sha(f"mock-tape-{i}"),
      "inputCount":20160,"R_all":s})
with tempfile.TemporaryDirectory(prefix="pf4-g3-mock-") as root:
    inp=Path(root)/"fake.json"
    inp.write_text(json.dumps(fixture))
    report=mod.gate(str(inp))
    assert report["worldsComplete"]==400
    assert report["blankControlsComplete"]==100
    assert report["historicalCompatibility"]=="UNRESOLVED_NO_COMPLETE_PAST_WINDOWS"
    def reject(patch,name):
        broken=copy.deepcopy(fixture)
        patch(broken)
        inp.write_text(json.dumps(broken))
        try:mod.gate(str(inp))
        except AssertionError:return
        raise AssertionError("FAIL_OPEN:"+name)
    reject(lambda x:x["worlds"].pop(),"truncated-worlds")
    reject(lambda x:x["worlds"][4].update(seedHex=x["worlds"][3]["seedHex"]),"duplicate-seed")
    reject(lambda x:x["worlds"][4]["R_all"].pop("C0"),"missing-primary-score")
    reject(lambda x:x["worlds"][150]["R_all"].update(blank=0.5),"unexpected-blank-score")
    reject(lambda x:x["source"].update(domainSeparation="PF1-REF-i|"),"wrong-domain")
    reject(lambda x:x["source"].update(disjointFromFutureTarget=False),"target-contamination")
    reject(lambda x:x["worlds"][6]["R_all"].update(C0=float('nan')),"nonfinite-null")
    reject(lambda x:x["source"].update(ticksPerWorld=1731),"prefix-not-full-world")
print("PF4_G3_MOCK_FIXTURE_FAIL_CLOSED_TEST_PASS_7_NEGATIVE_CASES")
