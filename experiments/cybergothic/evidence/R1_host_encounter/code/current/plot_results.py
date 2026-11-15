"""Render the fixed host-encounter contrasts from the saved analysis."""
import json
from pathlib import Path
import matplotlib.pyplot as plt

x=json.loads(Path("fresh_32001/analysis.json").read_text())
s=json.loads(Path("strict_fresh_33001/analysis.json").read_text())
fig,axes=plt.subplots(3,1,figsize=(9.8,9.5),constrained_layout=True)
fig.patch.set_facecolor("#f8f7f4")
for ax in axes:
    ax.set_facecolor("white");ax.spines[["right","top"]].set_visible(False)
    ax.grid(axis="x",color="#e7e2de",zorder=0);ax.axvline(0,color="#444444",lw=.8)

def draw(ax,labels,rows,scale=1.):
    for y,(value,interval,color) in enumerate(rows[::-1]):
        v=value*scale;lo,hi=(x*scale for x in interval)
        ax.errorbar(v,y,xerr=[[v-lo],[hi-v]],fmt="o",ms=7,capsize=5,lw=2,color=color,zorder=3)
    ax.set_yticks(list(range(len(labels))),labels[::-1])

nut=x["primary"]
draw(axes[0],["vs pointer", "vs shuffled"],[(nut["experienced_minus_pointer_nutrient"]["mean"],nut["experienced_minus_pointer_nutrient"]["interval"],"#6e4c77"),
    (nut["experienced_minus_shuffled_nutrient"]["mean"],nut["experienced_minus_shuffled_nutrient"]["interval"],"#3c7f8c")])
axes[0].set_title("Recipient nutrient over 12 model-time units",loc="left",weight="bold")
axes[0].set_xlabel("Experienced fragment minus comparator · virtual nutrient · 98.75% intervals")
draw(axes[1],["vs pointer", "vs shuffled"],[(nut["experienced_minus_pointer_survived"]["mean"],nut["experienced_minus_pointer_survived"]["interval"],"#6e4c77"),
    (nut["experienced_minus_shuffled_survived"]["mean"],nut["experienced_minus_shuffled_survived"]["interval"],"#3c7f8c")],100)
axes[1].set_title("Same recipient survives the 12-unit window",loc="left",weight="bold")
axes[1].set_xlabel("Experienced fragment minus comparator · percentage points · 98.75% intervals")
e=s["primary"]
draw(axes[2],["vs pointer", "vs shuffled"],[(e["experienced_minus_pointer_first_action"]["mean"],e["experienced_minus_pointer_first_action"]["interval"],"#6e4c77"),
    (e["experienced_minus_shuffled_first_action"]["mean"],e["experienced_minus_shuffled_first_action"]["interval"],"#3c7f8c")])
axes[2].set_title("Next host action: fresh confirmation · 463 encounters",loc="left",weight="bold")
axes[2].set_xlabel("Experienced fragment minus comparator · virtual nutrient · 97.5% intervals")
axes[2].set_xlim(-.001,.012)
fig.suptitle("One encounter, three possible host futures\n60 seeded populations per study",x=.02,ha="left",fontsize=15,weight="bold")
fig.savefig("AMELIA_HOST_ENCOUNTER_FIGURE_2026-11-14.png",dpi=170,facecolor=fig.get_facecolor(),bbox_inches="tight")
