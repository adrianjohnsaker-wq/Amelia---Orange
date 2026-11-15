import json
import random
import statistics
from pathlib import Path

def ci(values):
    r=random.Random(20261114);n=len(values)
    b=sorted(sum(values[r.randrange(n)] for _ in range(n))/n for _ in range(10000))
    def q(p):
        x=p*(len(b)-1);i=int(x);f=x-i;return b[i]*(1-f)+b[min(i+1,len(b)-1)]*f
    return [q(.025),q(.975)]

def main():
    p=Path("results_colony_30");rows=[json.loads(x.read_text()) for x in sorted(p.glob("seed_*.json"))]
    assert [x["seed"] for x in rows]==list(range(23001,23031))
    arms={}
    for name in ("one_host","four_hosts","empty_archive"):
        a=[x["arms"][name] for x in rows]
        arms[name]={"agent_time":statistics.mean(x["agent_time"] for x in a),
          "occupied_fraction":statistics.mean(x["occupied_fraction"] for x in a),
          "final_living":statistics.mean(x["final_living"] for x in a),
          "final_extinct":sum(x["final_extinct"] for x in a),
          "restarted":sum(x["recovery_births"]>0 for x in a),
          "reconstitutions":sum(x["recovery_births"] for x in a),
          "fissions":sum(x["fission_births"] for x in a),
          "source_corpses":sum(x["source_corpses"] for x in a),
          "external_energy":sum(x["external_reactor_energy"] for x in a),
          "energy_spent":sum(x["reactor_energy_spent"] for x in a),
          "actions":sum(x["actions"] for x in a),
          "final_diversity":statistics.mean(x["diversity"] for x in a)}
    differences=[x["arms"]["four_hosts"]["agent_time"]-x["arms"]["one_host"]["agent_time"] for x in rows]
    result={"arms":arms,"agent_time_difference":statistics.mean(differences),"interval95":ci(differences),
            "positive_seeds":sum(x>0 for x in differences),"negative_seeds":sum(x<0 for x in differences),
            "max_fork_genome":max(x["fork_max_genome"] for x in rows)}
    (p/"analysis.json").write_text(json.dumps(result,indent=2,sort_keys=True)+"\n")
    print(json.dumps(result,indent=2,sort_keys=True))

if __name__=="__main__":main()
