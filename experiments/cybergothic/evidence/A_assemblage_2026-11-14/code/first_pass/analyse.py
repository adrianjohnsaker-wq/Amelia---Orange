"""Pre-specified paired bootstrap outcomes and exploratory interactions."""
import json
import random
import statistics
from pathlib import Path

def interval(values,confidence):
    rng=random.Random(2026111402);n=len(values)
    samples=sorted(sum(values[rng.randrange(n)] for _ in range(n))/n for _ in range(10000))
    def q(p):
        x=p*(len(samples)-1);i=int(x);f=x-i
        return samples[i]*(1-f)+samples[min(i+1,len(samples)-1)]*f
    alpha=(1-confidence)/2
    return [q(alpha),q(1-alpha)]

def main():
    folder=Path("fresh_25001");rows=[json.loads(p.read_text()) for p in sorted(folder.glob("seed_*.json"))]
    assert [r["seed"] for r in rows]==list(range(25001,25031))
    def contrast(group,a,b,key,confidence=1-.05/6):
        d=[r[group][a][key]-r[group][b][key] for r in rows]
        return {"mean":statistics.mean(d),"interval":interval(d,confidence),
                "positive":sum(x>0 for x in d),"negative":sum(x<0 for x in d),"ties":sum(x==0 for x in d)}
    arms={}
    for name in rows[0]["arms"]:
        xs=[r["arms"][name] for r in rows]
        arms[name]={k:statistics.mean(x[k] for x in xs) for k in
                    ("agent_time","field_harvest","harvest_per_action","final_living","zones_harvested",
                     "occupied_fraction","external_food_accepted","external_reactor_input","reactor_energy_spent",
                     "salvaged","salvage_released","vault_at_end","vector_cost","forecast_cost","forecast_reward",
                     "diversity","mean_ancestry","actions","recovery_births")}
        arms[name]["final_extinct"]=sum(x["final_extinct"] for x in xs)
        for k in ("vector_shed","vector_infection","meltdown","fission","infection","timesplice","reconstitute"):
            arms[name][k]=sum(x["counts"].get(k,0) for x in xs)
        arms[name]["vector_hosts"]=sum(x["vector_hosts"] for x in xs)
        arms[name]["vector_next_observed"]=sum(x["vector_next_observed"] for x in xs)
        arms[name]["vector_next_payload"]=sum(x["vector_next_payload"] for x in xs)
    recovery={}
    for name in rows[0]["recovery"]:
        xs=[r["recovery"][name] for r in rows]
        recovery[name]={k:statistics.mean(x[k] for x in xs) for k in
                        ("agent_time","field_harvest","harvest_per_action","final_living","zones_harvested",
                         "occupied_fraction","external_food_accepted","external_reactor_input","reactor_energy_spent",
                         "salvaged","salvage_released","vector_cost","actions","recovery_births","diversity")}
        recovery[name]["final_extinct"]=sum(x["final_extinct"] for x in xs)
        for k in ("reconstitute","fission","vector_infection","meltdown"):
            recovery[name][k]=sum(x["counts"].get(k,0) for x in xs)
    full=[r["arms"]["full"] for r in rows]
    assert all(x["fate_windows"]>0 for x in full)
    pred=[(x["learned_hits"]-x["persistence_hits"])/x["fate_windows"] for x in full]
    prediction={"windows":sum(x["fate_windows"] for x in full),
                "learned_hits":sum(x["learned_hits"] for x in full),
                "persistence_hits":sum(x["persistence_hits"] for x in full),
                "mean_seed_difference":statistics.mean(pred),"interval":interval(pred,1-.05/6),
                "positive":sum(x>0 for x in pred),"negative":sum(x<0 for x in pred)}
    interaction=[r["arms"]["full"]["agent_time"]-r["arms"]["no_vector"]["agent_time"]-
                 r["arms"]["no_salvage"]["agent_time"]+r["arms"]["neither"]["agent_time"] for r in rows]
    result={"seed_count":len(rows),"arms":arms,"recovery":recovery,"prediction":prediction,
            "planned":{
              "bundle_agent_time":contrast("arms","full","earlier_policy","agent_time"),
              "archive_guided_vs_random_harvest":contrast("recovery","guided","random","field_harvest"),
              "vector_harvest":contrast("arms","full","no_vector","field_harvest"),
              "salvage_agent_time":contrast("arms","full","no_salvage","agent_time"),
              "archive_order_harvest":contrast("recovery","guided","shuffled","field_harvest")},
            "exploratory":{
              "vector_intact_vs_shuffled_harvest":contrast("arms","full","shuffled_vector","field_harvest",.95),
              "learned_vs_last_agent_time":contrast("arms","full","last_signal","agent_time",.95),
              "bundle_harvest":contrast("arms","full","earlier_policy","field_harvest",.95),
              "factorial_interaction_agent_time":{"mean":statistics.mean(interaction),"interval":interval(interaction,.95)}}}
    (folder/"analysis.json").write_text(json.dumps(result,indent=2,sort_keys=True)+"\n")
    print(json.dumps(result,indent=2,sort_keys=True))

if __name__=="__main__":main()
