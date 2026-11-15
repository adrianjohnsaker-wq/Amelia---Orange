"""Render the fixed uptake contrasts and fresh survival confirmation."""
import glob
import json
import statistics
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

first=json.loads(Path('fresh_donor_36001/analysis.json').read_text())
second=json.loads(Path('fresh_survival_37001/survival_analysis.json').read_text())
rows=[json.loads(Path(p).read_text()) for p in glob.glob('fresh_survival_37001/seed_*.json')]
fig=plt.figure(figsize=(11,8.5),layout='constrained');gs=fig.add_gridspec(2,1,height_ratios=[1.15,1])
ax=fig.add_subplot(gs[0])
refs=['open_slide','rotated_slide','productive_jump','encounter_slide','shuffled_slide']
labels=['Slide − open','Slide − rotated','Slide − jump','Slide − encounter','Slide − shuffled']
ys=list(reversed(range(5)))
ax.axvline(0,color='#727272',lw=1)
for y,ref in zip(ys,refs):
 p=first['primary']['uptake_24_productive_slide_minus_'+ref]
 m,lo,hi=p['estimate'],p['low'],p['high']
 ax.errorbar(m,y,xerr=[[m-lo],[hi-m]],fmt='o',color='#8c2b61',capsize=4,lw=2,ms=6)
 ax.text(.105,y,f'{m:+.3f}  [{lo:+.3f}, {hi:+.3f}]',va='center',fontsize=9)
ax.set_yticks(ys,labels);ax.set_xlim(-.16,.22);ax.grid(axis='x',alpha=.18)
ax.set_xlabel('Paired nutrient difference; 99% adjusted interval')
ax.set_title('Donor-context study: five planned uptake comparisons',loc='left',fontweight='bold',fontsize=12)
ax.text(.005,-.27,'First study: 238 encounters across 60 independent populations.',transform=ax.transAxes,fontsize=9,color='#555')
b=fig.add_subplot(gs[1]);times=[3,6,12,24,36]
for arm,label,color in [('productive_slide','One-position no-op slide','#8c2b61'),('productive_jump','Jump to next instruction','#5c6478')]:
 vals=[]
 for h in times:
  vals.append(100*statistics.fmean(statistics.fmean(float(t['outcomes'][arm]['timepoints'][str(h)]['alive']) for t in r['trials']) for r in rows if r['trials']))
 b.plot(times,vals,marker='o',lw=2.6,color=color,label=label)
p=second['primary'];b.set_title('Fresh confirmation: survival of original recipients',loc='left',fontweight='bold',fontsize=12)
b.set_ylim(0,105);b.set_xticks(times);b.set_ylabel('Hosts alive (%)');b.set_xlabel('Model-time units after infection');b.grid(axis='y',alpha=.18)
b.legend(frameon=False,loc='lower left');b.text(.98,.18,f"At 24 units: {100*p['estimate']:+.1f} points\n95% interval: {100*p['low']:+.1f} to {100*p['high']:+.1f}",transform=b.transAxes,ha='right',va='bottom',fontsize=10)
fig.suptitle('Donor provenance and pointer policy · separate ALife prototype',x=.03,ha='left',fontsize=14,fontweight='bold')
fig.savefig('CYBERGOTHIC_DONOR_CONTEXT_FIGURE_2026-11-15.png',dpi=160,bbox_inches='tight')
