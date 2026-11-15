"""Post-hoc matched comparison of initiative after furnace-to-inner entries."""
import json
import statistics
from concurrent.futures import ProcessPoolExecutor,as_completed
from pathlib import Path
from legacy_engine import Config,Entropy
from reactor import Reactor,digest
from study import branch


def measure(log,fork_index):
    zones={};windows={}; next_id=0
    totals={"entries_with_residents":0,"attacker_first":0,"resident_first":0,
            "first_action_infection":0,"removed":0,"censored":0}
    for index,e in enumerate(log):
        typ=e["event"]
        if typ=="birth":zones[e["agent"]]=e["zone"]
        elif typ=="execute" and index>=fork_index:
            actor=e["agent"]
            for ident,w in list(windows.items()):
                if w.get("winner"):continue
                residents={a for a in w["residents"] if zones.get(a)==w["zone"]}
                if zones.get(w["attacker"]) != w["zone"] or not residents:
                    totals["removed"]+=1;del windows[ident]
                elif actor==w["attacker"]:
                    w["winner"]="attacker";w["residents"]=residents
                elif actor in residents:
                    totals["resident_first"]+=1;del windows[ident]
        elif typ=="infection" and index>=fork_index:
            for w in windows.values():
                if w.get("winner")=="attacker" and e["attacker"]==w["attacker"] and e["target"] in w["residents"]:
                    w["infected"]=True
        elif typ=="action_end" and index>=fork_index:
            for ident,w in list(windows.items()):
                if w.get("winner")=="attacker" and e["agent"]==w["attacker"]:
                    totals["attacker_first"]+=1;totals["first_action_infection"]+=int(w.get("infected",False));del windows[ident]
        elif typ=="death":zones.pop(e["agent"],None)
        elif typ=="move":
            agent=e["agent"];target=e["target"]
            residents={a for a,z in zones.items() if z==target and a!=agent}
            zones[agent]=target
            if index>=fork_index and e["source"] in (7,8,9) and target in (1,2,3,4,5,6) and residents:
                next_id+=1;totals["entries_with_residents"]+=1
                windows[next_id]={"attacker":agent,"residents":residents,"zone":target}
    totals["censored"]=len(windows)
    decided=totals["attacker_first"]+totals["resident_first"]
    totals["initiative_fraction"]=totals["attacker_first"]/decided if decided else None
    assert sum(totals[x] for x in ("attacker_first","resident_first","removed","censored"))==totals["entries_with_residents"]
    return totals


def run(seed):
    record=json.loads(Path(f"results_30/seed_{seed}.json").read_text())
    root=Reactor(Config(seed=seed,initial_agents=36,max_agents=180,max_genome=1000000),Entropy("seeded",seed))
    root.advance(until_time=15.0);assert digest(root.snapshot())==record["root"]["hash"]
    out={"seed":seed}
    for arm in ("full","uniform_clock"):
        w,m=branch(root,arm,135.0);assert m["log_sha256"]==record["arms"][arm]["log_sha256"]
        out[arm]=measure(w.log,len(root.log))
    return out


def main():
    rows=[]
    with ProcessPoolExecutor(max_workers=6) as p:
        for f in as_completed([p.submit(run,s) for s in range(20001,20031)]):rows.append(f.result())
    rows.sort(key=lambda x:x["seed"])
    from analyse import interval
    diff=[r["full"]["initiative_fraction"]-r["uniform_clock"]["initiative_fraction"] for r in rows]
    summary={"seeds":len(rows),"mean_paired_difference":statistics.mean(diff),"interval95":interval(diff),"arms":{}}
    for arm in ("full","uniform_clock"):
        values=[r[arm] for r in rows];counts={k:sum(v[k] for v in values) for k in
            ("entries_with_residents","attacker_first","resident_first","first_action_infection","removed","censored")}
        counts["mean_initiative_fraction"]=statistics.mean(v["initiative_fraction"] for v in values)
        summary["arms"][arm]=counts
    Path("results_30/ambush_followup.json").write_text(json.dumps({"summary":summary,"seeds":rows},sort_keys=True,indent=2)+"\n")
    print(json.dumps(summary,sort_keys=True))

if __name__=="__main__":main()
