import json
import random
import statistics
from pathlib import Path

def interval(values,confidence):
    r=random.Random(2026111405);n=len(values)
    b=sorted(sum(values[r.randrange(n)] for _ in range(n))/n for _ in range(10000))
    def q(p):
        x=p*(len(b)-1);i=int(x);f=x-i;return b[i]*(1-f)+b[min(i+1,len(b)-1)]*f
    a=(1-confidence)/2;return [q(a),q(1-a)]

def main():
    p=Path("portable_fresh_30001");rows=[json.loads(f.read_text()) for f in sorted(p.glob("seed_*.json"))]
    assert [r["seed"] for r in rows]==list(range(30001,30031))
    arms={}
    for name in ("local","portable"):
        x=[r["arms"][name] for r in rows]
        keys=("net_bet_energy","forecast_cost","forecast_reward","field_harvest","agent_time","final_living",
              "levy_total","levy_events","levied_hosts","remote_rewards","remote_payments","actions")
        arms[name]={k:statistics.mean(a[k] for a in x) for k in keys}
        arms[name]["extinct"]=sum(a["final_extinct"] for a in x)
    def contrast(k,confidence):
        d=[r["arms"]["portable"][k]-r["arms"]["local"][k] for r in rows]
        return {"mean":statistics.mean(d),"interval":interval(d,confidence),"positive":sum(v>0 for v in d),
                "negative":sum(v<0 for v in d),"ties":sum(v==0 for v in d)}
    result={"arms":arms,"planned":{"net_claim_energy":contrast("net_bet_energy",.975),
                                      "ecological_nutrient_intake":contrast("field_harvest",.975)},
            "exploratory":{"agent_time":contrast("agent_time",.95),"final_living":contrast("final_living",.95)}}
    (p/"analysis.json").write_text(json.dumps(result,indent=2,sort_keys=True)+"\n");print(json.dumps(result,indent=2,sort_keys=True))

if __name__=="__main__":main()
