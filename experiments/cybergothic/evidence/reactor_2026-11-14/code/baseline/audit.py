"""Regenerate and audit selected full event ledgers against stored digests."""
import copy
import gzip
import json
from pathlib import Path
from legacy_engine import Config, Entropy, gate, numogram_graph
from reactor import ALL_OPS, Reactor, canonical, digest
from study import branch


def inspect(log):
    graph = numogram_graph(); archived = {}; seen = {}
    for e in log:
        name=e["event"]; seen[name]=seen.get(name,0)+1
        if name == "archive_store": archived[e["corpse"]] = e
        elif name == "infection":
            assert e["signature"] == gate(e["zone"]) % 9
            assert e["target_gate"] == gate(e["zone"])
            ip=e["target_ip"]; expected=(e["before"][:ip]+e["payload"]+e["before"][ip:])
            assert e["after"] == expected[:len(e["after"])]
        elif name == "move":
            if e["target"] not in graph[e["source"]]: assert e.get("via") == "flight"
        elif name == "opcode_mutation":
            assert e["after"] == [x for x in ALL_OPS if x != e["before"]][e["sample"]%14]
        elif name == "reconstitute":
            src=archived[e["source_corpse"]]
            assert src["genome"] == e["archived"] and src["origins"] == e["origins"]
            assert sum(a != b for a,b in zip(e["archived"],e["genome"])) == 1
            assert e["energy_debit"] == 4.0
        elif name == "ampy_feedback":
            assert abs(e["heat_after"]-min(12.,e["heat_before"]*1.35+.8)) < 1e-7
    return seen


def main():
    out=Path("audit_ledgers");out.mkdir(exist_ok=False); reports=[]
    for seed, arm in ((20001,"full"),(20015,"no_recycling"),(20030,"full")):
        record=json.loads(Path(f"results_30/seed_{seed}.json").read_text())
        root=Reactor(Config(seed=seed,initial_agents=36,max_agents=180,max_genome=1000000),Entropy("seeded",seed))
        root.advance(until_time=15.0)
        assert digest(root.snapshot()) == record["root"]["hash"]
        w,m=branch(root,arm,135.0)
        assert m["log_sha256"] == record["arms"][arm]["log_sha256"]
        assert m["state_sha256"] == record["arms"][arm]["state_sha256"]
        counts=inspect(w.log)
        path=out / f"seed_{seed}_{arm}.jsonl.gz"
        with gzip.open(path,"wb") as f:
            for e in w.log:f.write(canonical(e)+b"\n")
        reports.append({"seed":seed,"arm":arm,"event_sha256":m["log_sha256"],
                        "events":len(w.log),"audit_counts":counts})
        if seed==20001:
            live=copy.deepcopy(root);live.cfg.max_genome=512;live.entropy.mode="replay"
            live.entropy.input=list(root.entropy.used)+record["telemetry"]["recorded_live_samples"]
            live.advance(until_time=135.0)
            assert digest(live.log) == record["telemetry"]["live"]["log_sha256"]
            reports[-1]["live_trace_replayed_in_fresh_process"]=True
    (out/"audit.json").write_text(json.dumps(reports,indent=2,sort_keys=True)+"\n")
    print(json.dumps([{"seed":r["seed"],"arm":r["arm"],"events":r["events"]} for r in reports]))

if __name__=="__main__":main()
