"""Make a concise research figure from the saved analysis records."""
import json
from pathlib import Path
import matplotlib.pyplot as plt

p=json.loads(Path("fresh_27001/analysis.json").read_text())
t=json.loads(Path("temporal_fresh_28001/analysis.json").read_text())
a=json.loads(Path("fresh_27001/action_budget_followup.json").read_text())["summary"]
fig,ax=plt.subplots(2,2,figsize=(12.4,7.8),constrained_layout=True)
fig.patch.set_facecolor("#f8f7f4")
for x in ax.flat:
    x.set_facecolor("#ffffff");x.spines[["top","right"]].set_visible(False);x.grid(axis="x",color="#e8e4df",zorder=0)

def dot(x,y,value,ci,color):
    x.errorbar(value,y,xerr=[[value-ci[0]],[ci[1]-value]],fmt="o",color=color,
               capsize=5,lw=2,ms=7,zorder=3)

v=p["planned"]["experienced_vs_pointer"];budget=a["pointer_cargo"]
dot(ax[0,0],1,v["mean"],v["interval"],"#66436f");dot(ax[0,0],0,budget["mean_difference"],budget["interval95"],"#327d8b")
ax[0,0].axvline(0,color="#555555",lw=.9);ax[0,0].set_yticks([1,0],["180 model-time units\n99.17% interval","First 1,500 actions\n95% interval"])
ax[0,0].set_xlabel("Nutrient intake difference, experienced − pointer")
ax[0,0].set_title("Viral code: total and action-matched",loc="left",weight="bold")

r=p["planned"]["portfolio_vs_random"]
dot(ax[0,1],0,r["mean"],r["interval"],"#a15b48");ax[0,1].axvline(0,color="#555555",lw=.9)
ax[0,1].set_yticks([0],["After complete loss\n99.17% interval"])
ax[0,1].set_xlabel("Nutrient intake difference, portfolio − random")
ax[0,1].set_title("Necrotic recovery: portfolio and chance",loc="left",weight="bold")

for name,y,color in (("accumulating",2,"#87536d"),("moderate",1,"#347f91"),("rapid",0,"#bc8244")):
    before=t["arms"][name]["before"]["accuracy"]*100;after=t["arms"][name]["after"]["accuracy"]*100
    ax[1,0].plot([after,before],[y,y],color=color,lw=2,zorder=2)
    ax[1,0].scatter([before],[y],marker="o",color=color,s=65,zorder=3)
    ax[1,0].scatter([after],[y],marker="D",color=color,s=45,zorder=3)
ax[1,0].set_yticks([2,1,0],["Retain all", "Retention 0.85", "Retention 0.70"])
ax[1,0].set_xlim(10,60);ax[1,0].set_xlabel("Correct forecasts (%) · ○ before   ◆ after reversal")
ax[1,0].set_title("Temporal traces: adaptation has a cost",loc="left",weight="bold")

s=p["planned"]["salvage_external_savings"]
dot(ax[1,1],0,s["mean"],s["interval"],"#a15b48");ax[1,1].axvline(0,color="#555555",lw=.9)
ax[1,1].set_yticks([0],["External reactor input\n99.17% interval"])
ax[1,1].set_xlabel("Virtual energy difference, no salvage − salvage")
ax[1,1].set_title("Runaway feedback: external input displaced",loc="left",weight="bold")
fig.suptitle("Cybergothic assemblage · 30 matched seeds per study",fontsize=16,weight="bold",x=.02,ha="left")
fig.savefig("AMELIA_CYBERGOTHIC_ASSEMBLAGE_FIGURE_2026-11-14.png",dpi=180,facecolor=fig.get_facecolor())
