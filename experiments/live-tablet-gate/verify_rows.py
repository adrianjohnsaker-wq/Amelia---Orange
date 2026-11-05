"""Independently recalculate the diagnostic summaries from its private rows."""
import hashlib
import json
import math
import sys
from pathlib import Path

run = Path(sys.argv[1])
failed = Path(sys.argv[2])
raw = (run / "trace.jsonl").read_bytes()
rows = [json.loads(line) for line in raw.splitlines()]
partial = [json.loads(line) for line in (failed / "trace.jsonl").read_bytes().splitlines()]
arms = ("live", "shuffled", "uniform", "ordinary")
assert len(rows) == 240 and len(partial) == 20
group = {arm: [r for r in rows if r["arm"] == arm] for arm in arms}
assert all([r["time"] for r in group[arm]] == list(range(1, 61)) for arm in arms)
assert partial == group["live"][:20], "the retained partial attempt and retry differ"
results = {}
for arm in arms:
    active = group[arm][:40]
    source = arm != "ordinary"
    assert all(r["currentDecision"]["eventId"].startswith("source:" if source else "field:") for r in active)
    assert all(r["currentDecision"]["disposition"] == "DEFER" and not r["currentDecision"]["applied"] for r in active)
    assert all(r["governor"]["deformationFieldTension"] >= 0.72 for r in active)
    delayed = [d for r in group[arm][40:] for d in r["allDecisions"]
               if d["eventId"].startswith("source:") and d["disposition"] == "ATTEND" and d["applied"]]
    assert not delayed
    if source:
        assert all(r["source"]["offer"]["bodyDigest"] == r["bodyBefore"]["sourceDigest"] for r in active)
        assert all(r["currentDecision"]["sourceContext"]["bodyDigest"] == r["bodyBefore"]["sourceDigest"] for r in active)
    results[arm] = {
        "exposure_deferrals": len(active),
        "exposure_min_tension": min(r["governor"]["deformationFieldTension"] for r in active),
        "exposure_max_tension": max(r["governor"]["deformationFieldTension"] for r in active),
        "withdrawal_min_tension": min(r["governor"]["deformationFieldTension"] for r in group[arm][40:]),
        "late_source_admissions": len(delayed),
        "pending_at_end_of_exposure": group[arm][39]["sourceQueue"],
        "pending_at_end": group[arm][59]["sourceQueue"],
    }
for i in range(60):
    reference = group["live"][i]
    for arm in arms[1:]:
        other = group[arm][i]
        assert other["bodyAfter"] == reference["bodyAfter"], f"body differs at {arm} step {i + 1}"
        assert other["from"] == reference["from"] and other["to"] == reference["to"]
        assert other["memoryBias"] == reference["memoryBias"], f"memory bias differs at {arm} step {i + 1}"
        assert other["governor"]["deformationFieldTension"] == reference["governor"]["deformationFieldTension"]
    if i < 40:
        live = reference["source"]["offer"]["attentionVector"]
        shuffled = group["shuffled"][i]["source"]["offer"]["attentionVector"]
        uniform = group["uniform"][i]["source"]["offer"]["attentionVector"]
        assert sorted(live) == sorted(shuffled)
        assert all(math.isclose(x, 0.1) for x in uniform)
        assert math.isclose(sum(live), sum(uniform), abs_tol=1e-9)
source_after = group["live"][39]["source"]["after"]["address"]
weights = [.235, .185, .145, .115, .095, .075, .055, .045, .030, .020]
target = weights if source_after == 0 else list(reversed(weights))
errors = {}
for t in (40, 60):
    vector = group["live"][t-1]["bodyAfter"]["attentionVector"]
    errors[str(t)] = 0.5 * sum(abs(v-w) for v,w in zip(vector,target))
receipt_path = run / "session_receipts.jsonl"
receipts = [json.loads(line) for line in receipt_path.read_bytes().splitlines()]
assert len(receipts) == 8
for receipt in receipts:
    arm, time = receipt["arm"], receipt["time"]
    actual = hashlib.sha256((run / "checkpoints" / f"{arm}-t{time}.json.gz").read_bytes()).hexdigest()
    assert actual == receipt["checkpointSha256"]
    assert receipt["memoryHead"] == group[arm][time-1]["memoryHead"]
print(json.dumps({"status":"PASS","rows":len(rows),"first_attempt_matches":len(partial),
    "matching_field_zones_and_memory_bias":60,"checked_checkpoint_hashes_and_heads":len(receipts),
    "traceSha256":hashlib.sha256(raw).hexdigest(),"results":results,"profileError":errors}))
