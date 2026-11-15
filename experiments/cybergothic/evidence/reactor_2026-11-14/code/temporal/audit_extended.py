import copy
import gzip
import json
from pathlib import Path
from legacy_engine import Config, Entropy
from reactor import Reactor, canonical, digest
from extension_study import ARMS
from study import metrics

def main():
    out=Path("audit_ledgers");out.mkdir(exist_ok=False);reports=[]
    for seed,arm in ((21001,"target"),(21015,"strong_feedback"),(21030,"wrong_target")):
        row=json.loads(Path(f"results_extended_30/seed_{seed}.json").read_text())
        root=Reactor(Config(seed=seed,initial_agents=36,max_agents=180,max_genome=1000000),Entropy("seeded",seed))
        root.advance(until_time=15.0);assert digest(root.snapshot())==row["fork_hash"]
        w=copy.deepcopy(root);w.cfg.max_genome=512;w.steering_mode,w.feedback_gain=ARMS[arm]
        i=len(w.log);n=len(w.agents);spent=w.reactor_spent;w.advance(until_time=135.0)
        m=metrics(w,i,15.0,135.0,n,spent)
        assert m["log_sha256"]==row["arms"][arm]["log_sha256"]
        assert m["state_sha256"]==row["arms"][arm]["state_sha256"]
        engagements=0;feedback=0
        for e in w.log:
            if e["event"]=="attractor_engage":
                engagements+=1;assert e["cost"]==.05
                if e["mode"]=="sham":assert e["selected"]==e["candidate"]
                elif e["collective_before"] != e["aimed"]:
                    assert e["collective_after"]==e["aimed"]
                if e["mode"]=="wrong_target":assert e["aimed"]==(e["target"]+4)%9
            elif e["event"]=="ampy_feedback" and e["action"]>root.actions:
                feedback+=1
                assert abs(e["heat_after"]-min(12.,e["heat_before"]*w.feedback_gain+.8))<1e-7
        with gzip.open(out/f"seed_{seed}_{arm}.jsonl.gz","wb") as f:
            for e in w.log:f.write(canonical(e)+b"\n")
        reports.append({"seed":seed,"arm":arm,"events":len(w.log),"engagements":engagements,
                        "postfork_feedbacks":feedback,"event_sha256":m["log_sha256"]})
    (out/"audit.json").write_text(json.dumps(reports,indent=2,sort_keys=True)+"\n");print(json.dumps(reports))

if __name__=="__main__":main()
