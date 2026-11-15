"""Seed-clustered paired analysis of the pre-fixed host encounter test."""
import json
import random
import statistics
from collections import Counter
from pathlib import Path
from encounter_trial import ARMS

def bootstrap(values,confidence):
    rng=random.Random(202611141207);n=len(values)
    if not n:return None
    b=sorted(sum(values[rng.randrange(n)] for _ in range(n))/n for _ in range(10000))
    def q(p):
        x=p*(len(b)-1);i=int(x);f=x-i;return b[i]*(1-f)+b[min(i+1,len(b)-1)]*f
    alpha=(1-confidence)/2
    return [q(alpha),q(1-alpha)]

def main():
    folder=Path("fresh_32001")
    rows=[json.loads(p.read_text()) for p in sorted(folder.glob("seed_*.json"))]
    assert [r["seed"] for r in rows]==list(range(32001,32061))
    observed=[r for r in rows if r["trials"]]
    trials=[t for r in observed for t in r["trials"]]
    assert all(len(r["trials"])<=8 for r in observed)
    assert all(len({t["before"]["agent"] for t in r["trials"]})==len(r["trials"]) for r in observed)
    outcomes={}
    for arm in ARMS:
        x=[t["outcomes"][arm] for t in trials]
        perseed=lambda key:[statistics.mean(t["outcomes"][arm][key] for t in r["trials"]) for r in observed]
        first=[a for a in x if a["first_digit"] is not None]
        deaths=Counter(a["death_cause"] for a in x if not a["survived"])
        outcomes[arm]={"nutrient_mean_seed_weighted":statistics.mean(perseed("nutrient")),
            "survival_seed_weighted":statistics.mean(perseed("survived")),
            "action_mean_seed_weighted":statistics.mean(perseed("actions")),
            "total_survived":sum(a["survived"] for a in x),
            "total_died":len(x)-sum(a["survived"] for a in x),
            "death_causes":dict(deaths),"first_actions_observed":len(first),
            "first_digit_matches":sum(a["first_digit_matches_payload"]==1 for a in first),
            "overwritten_before_first_action":sum(a["changes_before_first_action"]>0 for a in x),
            "first_digit_distribution":dict(Counter(str(a["first_digit"]) for a in first)),
            "first_focus_distribution":dict(Counter(str(a["first_focus"]) for a in first)),
            "first_intake_mean_if_observed":statistics.mean(a["first_intake"] for a in first) if first else None,
            "subsequent_genome_changes":sum(a["genome_changes"] for a in x)}
    def compare(other,key,confidence=.9875,distinct=False):
        seed_means=[];eligible=0
        for r in observed:
            selected=[t for t in r["trials"] if not distinct or
                      t["before"]["alternatives"]["experienced"]["code"]!=t["before"]["alternatives"][other]["code"]]
            if not selected:continue
            eligible+=len(selected)
            seed_means.append(statistics.mean(float(t["outcomes"]["experienced"][key])-
                                             float(t["outcomes"][other][key]) for t in selected))
        return {"mean":statistics.mean(seed_means) if seed_means else None,
                "interval":bootstrap(seed_means,confidence),"seeds":len(seed_means),"encounters":eligible,
                "positive_seeds":sum(x>0 for x in seed_means),"negative_seeds":sum(x<0 for x in seed_means),
                "tied_seeds":sum(x==0 for x in seed_means)}
    comparisons={}
    for other in ("pointer","shuffled"):
        for key in ("nutrient","survived"):
            comparisons[f"experienced_minus_{other}_{key}"]=compare(other,key)
    exploratory={}
    for other in ("pointer","shuffled"):
        for key in ("nutrient","survived","actions"):
            exploratory[f"experienced_minus_{other}_{key}_distinct"]=compare(other,key,.95,True)
        paired=[];focus_changed=0;digit_changed=0;n_both=0
        for r in observed:
            eligible=[t for t in r["trials"] if t["outcomes"]["experienced"]["first_intake"] is not None
                      and t["outcomes"][other]["first_intake"] is not None]
            if eligible:
                paired.append(statistics.mean(t["outcomes"]["experienced"]["first_intake"]-
                                              t["outcomes"][other]["first_intake"] for t in eligible))
            for t in eligible:
                a,b=t["outcomes"]["experienced"],t["outcomes"][other];n_both+=1
                focus_changed+=a["first_focus"]!=b["first_focus"]
                digit_changed+=a["first_digit"]!=b["first_digit"]
        exploratory[f"experienced_minus_{other}_first_action"]={"intake_mean":statistics.mean(paired),
            "interval95":bootstrap(paired,.95),"seeds":len(paired),"both_acted":n_both,
            "first_focus_differed":focus_changed,"first_digit_differed":digit_changed}
    exclusions=Counter()
    for r in rows:exclusions.update(r["exclusions"])
    assignment=Counter(t["continuation_assignment"] for t in trials)
    distinct={k:sum(t["before"]["alternatives"]["experienced"]["code"]!=t["before"]["alternatives"][k]["code"] for t in trials)
              for k in ("pointer","shuffled")}
    first_distinct={k:sum(t["before"]["alternatives"]["experienced"]["code"][0]!=t["before"]["alternatives"][k]["code"][0] for t in trials)
                    for k in ("pointer","shuffled")}
    for t in trials:
        a=t["before"]["alternatives"]
        assert Counter(zip(a["experienced"]["code"],a["experienced"]["origins"]))==Counter(zip(a["shuffled"]["code"],a["shuffled"]["origins"]))
        assert t["before"]["gate_signature"]==t["before"]["target_gate"]
        assert len({len(a[k]["code"]) for k in ARMS})==1
    result={"seeds_planned":60,"seeds_with_encounters":len(observed),"total_encounters":len(trials),
            "encounters_per_seed":dict(Counter(str(len(r["trials"])) for r in rows)),
            "encounter_times":{"mean":statistics.mean(t["before"]["time"] for t in trials),
                  "median":statistics.median(t["before"]["time"] for t in trials),
                  "min":min(t["before"]["time"] for t in trials),"max":max(t["before"]["time"] for t in trials),
                  "after_regime_reversal":sum(t["before"]["time"]>=126.0 for t in trials)},
            "zone_distribution":dict(Counter(str(t["before"]["zone"]) for t in trials)),
            "assignments":dict(assignment),"exclusions":dict(exclusions),
            "distinct_sequences":distinct,"distinct_first_digits":first_distinct,
            "experience_supported":sum(t["before"]["candidate_info"]["selection_had_experience"] for t in trials),
            "arms":outcomes,"primary":comparisons,"exploratory":exploratory}
    (folder/"analysis.json").write_text(json.dumps(result,sort_keys=True,indent=2)+"\n")
    print(json.dumps(result,sort_keys=True,indent=2))

if __name__=="__main__":main()
