import json
import random
import statistics
from pathlib import Path

def interval(values,confidence):
    r=random.Random(2026111403);n=len(values)
    b=sorted(sum(values[r.randrange(n)] for _ in range(n))/n for _ in range(10000))
    def q(p):
        x=p*(len(b)-1);i=int(x);f=x-i;return b[i]*(1-f)+b[min(i+1,len(b)-1)]*f
    alpha=(1-confidence)/2;return [q(alpha),q(1-alpha)]

def main():
    p=Path("fresh_27001");rows=[json.loads(f.read_text()) for f in sorted(p.glob("seed_*.json"))]
    assert [r["seed"] for r in rows]==list(range(27001,27031))
    def contrast(group,a,b,key,confidence=1-.05/6):
        pairs=[(r[group][a][key],r[group][b][key]) for r in rows]
        missing=sum(x is None or y is None for x,y in pairs)
        d=[x-y for x,y in pairs if x is not None and y is not None]
        return {"mean":statistics.mean(d),"interval":interval(d,confidence),"n":len(d),"missing":missing,
                "positive":sum(x>0 for x in d),"negative":sum(x<0 for x in d),"ties":sum(x==0 for x in d)}
    arms={}
    for name in rows[0]["arms"]:
        xs=[r["arms"][name] for r in rows]
        keys=("agent_time","field_harvest","harvest_per_action","final_living","zones_harvested","occupied_fraction",
              "external_food_accepted","external_reactor_input","reactor_energy_spent","salvaged","salvage_released",
              "vault_at_end","vector_cost","forecast_cost","forecast_reward","diversity","mean_ancestry","actions",
              "recovery_births","future_orientations")
        arms[name]={k:statistics.mean(x[k] for x in xs) for k in keys}
        arms[name]["final_extinct"]=sum(x["final_extinct"] for x in xs)
        for k in ("vector_shed","vector_infection","meltdown","fission","infection","timesplice","reconstitute"):
            arms[name][k]=sum(x["counts"].get(k,0) for x in xs)
        for k in ("experienced_cargoes","vector_hosts","vector_next_observed","vector_next_payload","fate_windows","learned_hits","persistence_hits"):
            arms[name][k]=sum(x[k] for x in xs)
        nonmissing=[x["recipient_next_intake"] for x in xs if x["recipient_next_intake"] is not None]
        arms[name]["mean_recipient_next_intake"]=statistics.mean(nonmissing) if nonmissing else None
        arms[name]["recipient_seed_count"]=len(nonmissing)
    recovery={}
    for name in rows[0]["recovery"]:
        xs=[r["recovery"][name] for r in rows]
        keys=("agent_time","field_harvest","harvest_per_action","final_living","zones_harvested","occupied_fraction",
              "external_food_accepted","external_reactor_input","reactor_energy_spent","salvaged","salvage_released",
              "vector_cost","actions","recovery_births","diversity")
        recovery[name]={k:statistics.mean(x[k] for x in xs) for k in keys}
        recovery[name]["final_extinct"]=sum(x["final_extinct"] for x in xs)
        for k in ("reconstitute","fission","vector_infection","meltdown"):
            recovery[name][k]=sum(x["counts"].get(k,0) for x in xs)
    full=[r["arms"]["advanced"] for r in rows];assert all(x["fate_windows"] for x in full)
    d=[(x["learned_hits"]-x["persistence_hits"])/x["fate_windows"] for x in full]
    out={"arms":arms,"recovery":recovery,"planned":{
      "experienced_vs_pointer":contrast("arms","advanced","pointer_cargo","field_harvest"),
      "experienced_vs_shuffled":contrast("arms","advanced","shuffled_cargo","field_harvest"),
      "portfolio_vs_random":contrast("recovery","portfolio","random","field_harvest"),
      "portfolio_vs_shuffled":contrast("recovery","portfolio","portfolio_shuffled","field_harvest"),
      "learned_vs_last_harvest":contrast("arms","advanced","last_signal","field_harvest"),
      "salvage_external_savings":contrast("arms","no_salvage","advanced","external_reactor_input")},
      "exploratory":{
        "experienced_vs_pointer_recipient":contrast("arms","advanced","pointer_cargo","recipient_next_intake",.95),
        "advanced_vs_earlier_agent_time":contrast("arms","advanced","earlier_policy","agent_time",.95),
        "advanced_vs_earlier_harvest":contrast("arms","advanced","earlier_policy","field_harvest",.95),
        "advanced_vs_no_orientation_harvest":contrast("arms","advanced","no_orientation","field_harvest",.95)},
      "prediction":{"windows":sum(x["fate_windows"] for x in full),
                    "learned_hits":sum(x["learned_hits"] for x in full),
                    "last_hits":sum(x["persistence_hits"] for x in full),
                    "mean_seed_advantage":statistics.mean(d),"interval95":interval(d,.95)}}
    (p/"analysis.json").write_text(json.dumps(out,indent=2,sort_keys=True)+"\n")
    print(json.dumps(out,indent=2,sort_keys=True))

if __name__=="__main__":main()
