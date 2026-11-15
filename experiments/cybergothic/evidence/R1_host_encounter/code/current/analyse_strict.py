"""Planned population-clustered confirmation of the next-action endpoint."""
import json
import statistics
from collections import Counter
from pathlib import Path
from analyse import bootstrap
from encounter_trial import ARMS

def score(t,arm,key):
    value=t["outcomes"][arm][key]
    return 0. if value is None else float(value)

def compare(rows,other,key,confidence,phase=None):
    values=[];encounters=0
    for row in rows:
        selected=[t for t in row["trials"] if phase is None or t["phase"]==phase]
        if not selected:continue
        encounters+=len(selected)
        values.append(statistics.mean(score(t,"experienced",key)-score(t,other,key) for t in selected))
    return {"mean":statistics.mean(values) if values else None,"interval":bootstrap(values,confidence),
            "seeds":len(values),"encounters":encounters,"positive_seeds":sum(x>0 for x in values),
            "negative_seeds":sum(x<0 for x in values),"tied_seeds":sum(x==0 for x in values)}

def main():
    folder=Path("strict_fresh_33001")
    rows=[json.loads(p.read_text()) for p in sorted(folder.glob("seed_*.json"))]
    assert [r["seed"] for r in rows]==list(range(33001,33061))
    observed=[r for r in rows if r["trials"]];trials=[t for r in observed for t in r["trials"]]
    for r in observed:
        assert len(r["trials"])<=8
        assert len({t["before"]["agent"] for t in r["trials"]})==len(r["trials"])
    for t in trials:
        a=t["before"]["alternatives"]
        assert Counter(zip(a["experienced"]["code"],a["experienced"]["origins"]))==Counter(zip(a["shuffled"]["code"],a["shuffled"]["origins"]))
        assert t["before"]["gate_signature"]==t["before"]["target_gate"]
    arms={}
    for arm in ARMS:
        xs=[t["outcomes"][arm] for t in trials]
        perseed=lambda key:[statistics.mean(score(t,arm,key) for t in r["trials"]) for r in observed]
        arms[arm]={"first_action_intake":statistics.mean(perseed("first_intake")),
                   "first_actions_observed":sum(x["first_intake"] is not None for x in xs),
                   "first_digits_match":sum(x["first_digit_matches_payload"]==1 for x in xs),
                   "total_nutrient":statistics.mean(perseed("nutrient")),
                   "survival":statistics.mean(perseed("survived")),
                   "survived_count":sum(x["survived"] for x in xs),
                   "actions":statistics.mean(perseed("actions")),
                   "genome_changes_before_action":sum(x["changes_before_first_action"]>0 for x in xs)}
    primary={f"experienced_minus_{other}_first_action":compare(observed,other,"first_intake",.975)
             for other in ("pointer","shuffled")}
    secondary={}
    for other in ("pointer","shuffled"):
        for key in ("nutrient","survived"):
            secondary[f"experienced_minus_{other}_{key}"]=compare(observed,other,key,.95)
        for phase in ("before","after"):
            secondary[f"experienced_minus_{other}_first_{phase}"]=compare(observed,other,"first_intake",.95,phase)
    exclusions=Counter()
    for r in rows:exclusions.update(r["exclusions"])
    result={"seeds_planned":60,"seeds_with_encounters":len(observed),"encounters":len(trials),
            "phase_counts":dict(Counter(t["phase"] for t in trials)),
            "phase_seeds":{phase:sum(any(t["phase"]==phase for t in r["trials"]) for r in rows) for phase in ("before","after")},
            "assignments":dict(Counter(t["continuation_assignment"] for t in trials)),
            "distinct_sequences":{other:sum(t["before"]["alternatives"]["experienced"]["code"]!=t["before"]["alternatives"][other]["code"] for t in trials) for other in ("pointer","shuffled")},
            "exclusions":dict(exclusions),"arms":arms,"primary":primary,"exploratory":secondary}
    (folder/"analysis.json").write_text(json.dumps(result,sort_keys=True,indent=2)+"\n");print(json.dumps(result,sort_keys=True,indent=2))

if __name__=="__main__":main()
