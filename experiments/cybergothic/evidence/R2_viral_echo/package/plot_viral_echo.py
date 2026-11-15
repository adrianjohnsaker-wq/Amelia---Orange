"""Make a research figure from the stored, seed-weighted summary."""
import json
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

data=json.loads(Path('fresh_echo_34001/analysis.json').read_text())
times=[3,6,12,24,36]
fig=plt.figure(figsize=(11.5,8.3),layout='constrained')
gs=fig.add_gridspec(2,2,height_ratios=[1.6,1])
ax=fig.add_subplot(gs[0,:])
series=[('natural','original_intact','Original lineage: natural','#5e6575','-'),
        ('experienced_echo','intact','Original or refreshed copy: echo','#8a255b','-'),
        ('experienced_echo','original_intact','Original lineage: echo','#df8c40','--')]
for arm,metric,label,color,style in series:
    vals=[100*data['summaries'][str(t)][arm][metric]['seed_weighted_mean'] for t in times]
    ax.plot(times,vals,style,marker='o',lw=2.6,ms=6,color=color,label=label)
ax.set_title('Can transmitted code remain available?',loc='left',fontweight='bold',fontsize=15)
ax.set_ylabel('Recipients with an intact copy (%)')
ax.set_xlabel('Model-time units after infection')
ax.set_xticks(times);ax.set_ylim(0,100);ax.grid(axis='y',alpha=.2)
ax.legend(loc='upper right',frameon=False,ncol=1,fontsize=9)
ax.text(0,-.3,'Death counts as no copy. Curves are seed-weighted means; the echo inserts new copies.',
        transform=ax.transAxes,fontsize=9,color='#555555')
for j,(key,title,scale,units) in enumerate([
 ('intact_24_experienced_echo_minus_natural','Ordered copy: echo − natural',100,'percentage points'),
 ('uptake_24_experienced_echo_minus_shuffled_echo','Uptake: echo − shuffled echo',1,'nutrient units')]):
    p=data['primary'][key];b=fig.add_subplot(gs[1,j]);est=p['estimate']*scale;lo=p['low']*scale;hi=p['high']*scale
    b.axvline(0,color='#999999',lw=1);b.errorbar(est,0,xerr=[[est-lo],[hi-est]],fmt='o',color='#8a255b',capsize=5,lw=2)
    b.set_title(title,loc='left',fontweight='bold',fontsize=11)
    b.set_xlabel(units+'; 97.5% interval');b.set_yticks([]);b.grid(axis='x',alpha=.15)
    b.text(.02,.75,f'{est:+.2f}  [{lo:+.2f}, {hi:+.2f}]' if scale==100 else f'{est:+.3f}  [{lo:+.3f}, {hi:+.3f}]',
           transform=b.transAxes,fontsize=10)
fig.suptitle('Viral code echo • 235 matched encounters • 60 populations',x=.02,ha='left',fontweight='bold',fontsize=15)
fig.savefig('CYBERGOTHIC_VIRAL_ECHO_FIGURE_2026-11-15.png',dpi=160,bbox_inches='tight')
