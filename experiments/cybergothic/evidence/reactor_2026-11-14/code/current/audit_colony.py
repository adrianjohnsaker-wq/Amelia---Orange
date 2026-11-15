import copy
import gzip
import json
from pathlib import Path
from legacy_engine import Config,Entropy
from reactor import Reactor,canonical,digest
from study import metrics

def main():
    output=Path("audit_ledgers");output.mkdir(exist_ok=False);reports=[]
    for seed,arm in ((23001,"one_host"),(23015,"four_hosts"),(23030,"empty_archive")):
        saved=json.loads(Path(f"results_colony_30/seed_{seed}.json").read_text())
        root=Reactor(Config(seed=seed,initial_agents=36,max_agents=180,max_genome=1000000),Entropy("seeded",seed))
        root.advance(until_time=15.0);assert digest(root.snapshot())==saved["fork_hash"]
        w=copy.deepcopy(root);w.cfg.max_genome=512;w.pulse_renewal=.6
        w.recovery_floor=1 if arm=="one_host" else 4;w.steering_mode="target"
        i=len(w.log);n=len(w.agents);spent=w.reactor_spent
        for a in list(w.agents.values()):w.kill(a,"controlled_extinction")
        if arm=="empty_archive":
            w.archive.clear();w.corpses.clear();w.waiting_corpses.clear();w.emit("experimental_clear_necrotic_bank")
        w.advance(until_time=255.0);m=metrics(w,i,15.0,255.0,n,spent)
        assert m["log_sha256"]==saved["arms"][arm]["log_sha256"]
        assert m["state_sha256"]==saved["arms"][arm]["state_sha256"]
        archive={};count=0
        for e in w.log:
            if e["event"]=="archive_store":archive[e["corpse"]]=e
            elif e["event"]=="experimental_clear_necrotic_bank":archive.clear()
            elif e["event"]=="reconstitute":
                source=archive[e["source_corpse"]];count+=1
                assert e["energy_debit"]==4 and e["archived"]==source["genome"]
                assert e["origins"]==source["origins"]
                assert sum(a!=b for a,b in zip(e["archived"],e["genome"]))==1
        assert count*4==w.reactor_spent
        with gzip.open(output/f"seed_{seed}_{arm}.jsonl.gz","wb") as f:
            for e in w.log:f.write(canonical(e)+b"\n")
        reports.append({"seed":seed,"arm":arm,"events":len(w.log),"reconstitutions":count,
                        "energy_spent":w.reactor_spent,"event_sha256":m["log_sha256"]})
    (output/"audit.json").write_text(json.dumps(reports,indent=2,sort_keys=True)+"\n");print(json.dumps(reports))

if __name__=="__main__":main()
