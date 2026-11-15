import json
import random
import statistics
from pathlib import Path

def ci(values,confidence):
    r=random.Random(2026111404);n=len(values)
    samples=sorted(sum(values[r.randrange(n)] for _ in range(n))/n for _ in range(10000))
    def q(p):
        v=p*(len(samples)-1);i=int(v);f=v-i;return samples[i]*(1-f)+samples[min(i+1,len(samples)-1)]*f
    a=(1-confidence)/2;return [q(a),q(1-a)]

def main():
    p=Path("temporal_fresh_28001");rows=[json.loads(f.read_text()) for f in sorted(p.glob("seed_*.json"))]
    assert [x["seed"] for x in rows]==list(range(28001,28031));arms={}
    for name in ("accumulating","moderate","rapid"):
        xs=[r["arms"][name] for r in rows]
        arms[name]={}
        for phase in ("before","after"):
            vals=[x["shadow"][phase]["correct"]/x["shadow"][phase]["total"] for x in xs]
            last=[x["shadow"][phase]["last"]/x["shadow"][phase]["total"] for x in xs]
            arms[name][phase]={"accuracy":statistics.mean(vals),"last_signal_accuracy":statistics.mean(last),
                               "total_predictions":sum(x["shadow"][phase]["total"] for x in xs)}
        eco=[x["ecology"] for x in xs]
        arms[name]["agent_time"]=statistics.mean(x["agent_time"] for x in eco)
        arms[name]["field_harvest"]=statistics.mean(x["field_harvest"] for x in eco)
        arms[name]["final_living"]=statistics.mean(x["final_living"] for x in eco)
        arms[name]["extinct"]=sum(x["final_extinct"] for x in eco)
        arms[name]["actual_windows"]=sum(x["fate_windows"] for x in eco)
        arms[name]["actual_learned_hits"]=sum(x["learned_hits"] for x in eco)
        arms[name]["actual_last_hits"]=sum(x["persistence_hits"] for x in eco)
    def compare(a,b,phase,confidence):
        d=[r["arms"][a]["shadow"][phase]["correct"]/r["arms"][a]["shadow"][phase]["total"]-
           r["arms"][b]["shadow"][phase]["correct"]/r["arms"][b]["shadow"][phase]["total"] for r in rows]
        return {"mean":statistics.mean(d),"interval":ci(d,confidence),"positive":sum(x>0 for x in d),
                "negative":sum(x<0 for x in d),"ties":sum(x==0 for x in d)}
    def eco_compare(a,b,key):
        d=[r["arms"][a]["ecology"][key]-r["arms"][b]["ecology"][key] for r in rows]
        return {"mean":statistics.mean(d),"interval95":ci(d,.95)}
    out={"arms":arms,"planned":{"moderate_vs_accumulating_after":compare("moderate","accumulating","after",.975),
                                 "rapid_vs_accumulating_after":compare("rapid","accumulating","after",.975)},
         "exploratory":{"moderate_vs_accumulating_before":compare("moderate","accumulating","before",.95),
                        "rapid_vs_accumulating_before":compare("rapid","accumulating","before",.95),
                        "moderate_food":eco_compare("moderate","accumulating","field_harvest"),
                        "moderate_agenttime":eco_compare("moderate","accumulating","agent_time"),
                        "rapid_food":eco_compare("rapid","accumulating","field_harvest"),
                        "rapid_agenttime":eco_compare("rapid","accumulating","agent_time")}}
    (p/"analysis.json").write_text(json.dumps(out,indent=2,sort_keys=True)+"\n");print(json.dumps(out,indent=2,sort_keys=True))

if __name__=="__main__":main()
