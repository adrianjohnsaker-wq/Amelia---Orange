"""Recalculate the single-consolidation calibration from private evidence."""
import hashlib
import json
import sys
from pathlib import Path

run = Path(sys.argv[1])
baseline = json.loads(Path(sys.argv[2]).read_text())
raw = (run / "trace.jsonl").read_bytes()
rows = [json.loads(line) for line in raw.splitlines()]
summary = json.loads((run / "summary.json").read_text())
assert len(rows) == 80
base_events = baseline["state"]["memoryState"]["events"]
assert len(base_events) == 50
out = {}
for arm, expected_kinds in (("no_consolidation", ["STEP"]), ("single_consolidation", ["CONSOLIDATE", "STEP"])):
    group = [r for r in rows if r["arm"] == arm]
    assert [r["time"] for r in group] == list(range(1, 41))
    assert all(r["currentDecision"]["eventId"].startswith("source:") for r in group)
    assert all(r["currentDecision"]["disposition"] == "DEFER" and not r["currentDecision"]["applied"] for r in group)
    assert all(r["source"]["offer"]["bodyDigest"] == r["currentDecision"]["sourceContext"]["bodyDigest"] for r in group)
    assert all(r["governor"]["deformationFieldTension"] >= 0.72 for r in group)
    final = json.loads((run / (arm + "-final.json")).read_text())
    events = final["runtime"]["memoryState"]["events"]
    assert [e["eventDigest"] for e in events[:50]] == [e["eventDigest"] for e in base_events]
    assert [e["kind"] for e in events[50:50+len(expected_kinds)]] == expected_kinds
    assert len(events) == 50 + len(expected_kinds) + 40
    out[arm] = {"deferred":len(group),"first":group[0]["governor"]["deformationFieldTension"],
                "minimum":min(r["governor"]["deformationFieldTension"] for r in group),
                "maximum":max(r["governor"]["deformationFieldTension"] for r in group),
                "original_memory_events_preserved":50}
assert summary["results"]["no_consolidation"]["counts"] == {"DEFER":40}
assert summary["results"]["single_consolidation"]["counts"] == {"DEFER":40}
print(json.dumps({"status":"PASS","rows":len(rows),"traceSha256":hashlib.sha256(raw).hexdigest(),"arms":out}))
