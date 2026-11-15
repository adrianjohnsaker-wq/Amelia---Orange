import json
import random
import statistics
from pathlib import Path

def interval(values,confidence=.95):
    r=random.Random(20261114);n=len(values);rep=[]
    for _ in range(10000):rep.append(sum(values[r.randrange(n)] for _ in range(n))/n)
    rep.sort();alpha=(1-confidence)/2
    def q(x):
        y=x*(len(rep)-1);i=int(y);f=y-i
        return rep[i]*(1-f)+rep[min(i+1,len(rep)-1)]*f
    return [q(alpha),q(1-alpha)]

def main():
    directory=Path("results_extended_30")
    rows=[json.loads(p.read_text()) for p in sorted(directory.glob("seed_*.json"))]
    assert [r["seed"] for r in rows]==list(range(21001,21031))
    names=("sham","target","wrong_target","weak_feedback","strong_feedback")
    arms={}
    for name in names:
        a=[r["arms"][name] for r in rows];windows=sum(x["completed_bet_windows"] for x in a)
        arms[name]={"windows":windows,"actual_hits":sum(x["bet_actual"] for x in a),
                    "shadow_hits":sum(x["bet_shadow_expected"] for x in a),
                    "mean_target_advantage":statistics.mean(x["bet_target_advantage"] for x in a),
                    "engagements":sum(x["attractor_attempts"] for x in a),
                    "changed_candidates":sum(x["attractor_changed_candidate"] for x in a),
                    "target_after_engagement":sum(x["attractor_target_after"] for x in a),
                    "aimed_after_engagement":sum(x["attractor_aimed_after"] for x in a),
                    "cost":sum(x["attractor_cost"] for x in a),
                    "prophecy_success":sum(x["counts"].get("prophecy_success",0) for x in a),
                    "actions":sum(x["actions"] for x in a),
                    "mean_action_heat":statistics.mean(x["mean_action_heat"] for x in a),
                    "meltdowns":sum(x["counts"].get("meltdown",0) for x in a),
                    "meltdowns_per_1000":statistics.mean(x["meltdown_per_1000_actions"] for x in a),
                    "agent_time":statistics.mean(x["agent_time"] for x in a),
                    "final_extinct":sum(x["final_extinct"] for x in a)}
    def paired(a,b,key):
        d=[r["arms"][a][key]-r["arms"][b][key] for r in rows]
        return {"mean":statistics.mean(d),"interval95":interval(d),"positive":sum(x>0 for x in d),
                "negative":sum(x<0 for x in d),"tied":sum(x==0 for x in d)}
    result={"arms":arms,"target_vs_sham":paired("target","sham","bet_target_advantage"),
            "wrong_vs_sham":paired("wrong_target","sham","bet_target_advantage"),
            "strong_vs_weak_meltdowns":paired("strong_feedback","weak_feedback","meltdown_per_1000_actions"),
            "strong_vs_weak_agent_time":paired("strong_feedback","weak_feedback","agent_time"),
            "strong_vs_weak_heat":paired("strong_feedback","weak_feedback","mean_action_heat"),
            "max_fork_genome":max(r["fork_max_genome"] for r in rows)}
    (directory/"analysis.json").write_text(json.dumps(result,indent=2,sort_keys=True)+"\n")
    print(json.dumps(result,indent=2,sort_keys=True))

if __name__=="__main__":main()
