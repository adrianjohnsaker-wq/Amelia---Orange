"""Independent, history-sum reconstruction of all shadow forecast outcomes."""
import json
import random
from pathlib import Path

def main():
    directory=Path("temporal_fresh_28001");checked=0
    for path in sorted(directory.glob("seed_*.json")):
        row=json.loads(path.read_text());seed=row["seed"]
        rng=random.Random(seed ^ 0x2AC811);last=[rng.randrange(3) for _ in range(10)]
        history=[[] for _ in range(10)]
        totals={name:{phase:{"correct":0,"last":0,"total":0} for phase in ("before","after")}
                for name in ("accumulating","moderate","rapid")}
        for epoch,signal in row["environment"]:
            if epoch>5:
                phase="before" if epoch<=20 else "after"
                for name,retention in (("accumulating",1.),("moderate",.85),("rapid",.7)):
                    for z,value in enumerate(signal):
                        # Sum independently over individual historical transitions.
                        scores=[0.,0.,0.]
                        for seen_epoch,source,target in history[z]:
                            if source==last[z]:scores[target]+=retention**max(0,(epoch-1)-max(5,seen_epoch))
                        high=max(scores);choice=last[z] if scores[last[z]]==high else scores.index(high)
                        totals[name][phase]["correct"]+=choice==value
                        totals[name][phase]["last"]+=last[z]==value
                        totals[name][phase]["total"]+=1
            for z,value in enumerate(signal):history[z].append((epoch,last[z],value))
            last=signal
        for name in totals:
            assert totals[name]==row["arms"][name]["shadow"],(seed,name,totals[name],row["arms"][name]["shadow"])
        checked+=1
    report={"seed_count":checked,"independent_history_reconstruction":"passed"}
    (directory/"independent_temporal_audit.json").write_text(json.dumps(report,indent=2)+"\n");print(json.dumps(report))

if __name__=="__main__":main()
