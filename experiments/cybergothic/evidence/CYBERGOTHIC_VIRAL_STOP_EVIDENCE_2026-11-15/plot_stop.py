"""Scientific figure for natural stop changes and the larger fresh replication."""
import json
from pathlib import Path
from collections import Counter

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

dirs=['fresh_viral_stop_42001','fresh_stop_confirm_43001','fresh_stop_replication_44001']
counts=Counter()
for d in dirs:counts.update(json.loads(Path(d,'natural_stop_audit.json').read_text())['counts'])
rep=json.loads(Path(dirs[-1],'analysis.json').read_text());n=rep['eligible_populations']
fig,axs=plt.subplots(2,2,figsize=(12,8.7),layout='constrained')
fig.suptitle('Viral insertions and the fate of intron stops',x=.035,ha='left',fontsize=16,fontweight='bold')

ax=axs[0,0];kinds=['infection','vector_infection'];cats=['reclosed_at_original_boundary','closed_at_later_boundary','original_start_unrecognised']
labels=['Reclosed at original position','Closed farther downstream','Original intron no longer recognised']
colors=['#36877e','#d5913d','#8d3a67'];bottom=[0,0]
for cat,label,color in zip(cats,labels,colors):
    vals=[counts[k+'_'+cat] for k in kinds]
    bars=ax.bar([0,1],vals,bottom=bottom,color=color,width=.62,label=label)
    for b,v,base in zip(bars,vals,bottom):
        ax.text(b.get_x()+b.get_width()/2,base+v/2,str(v),ha='center',va='center',color='white',fontsize=10,fontweight='bold')
    bottom=[a+b for a,b in zip(bottom,vals)]
ax.set_xticks([0,1],['Direct infection','Vector delivery']);ax.set_ylabel('Observed stop-splitting events')
ax.set_title('Natural boundary outcomes · 540 populations',loc='left',fontsize=11,fontweight='bold')
ax.legend(loc='upper right',fontsize=8,frameon=False);ax.set_ylim(0,max(bottom)*1.22)

statuses=['Intact','Ruptured','Active\ninterpreter'];x=[0,1,2];pairs=[('intact_transfer','intact_exposure'),('ruptured_transfer','ruptured_exposure'),('active_transfer','active_exposure')]
def paired_bars(ax,metric,title):
    for offset,j,color,name in [(-.18,0,'#7d305e','Transfer'),(.18,1,'#9ebeb8','Exposure control')]:
        vals=[100*rep['means'][p[j]][metric]['mean'] for p in pairs]
        bars=ax.bar([i+offset for i in x],vals,width=.34,color=color,label=name)
        for b,v in zip(bars,vals):ax.text(b.get_x()+b.get_width()/2,v+2,f'{v:.0f}%',ha='center',fontsize=9)
    ax.set_xticks(x,statuses);ax.set_ylim(0,112);ax.set_ylabel('Recipients (%)')
    ax.set_title(title,loc='left',fontsize=11,fontweight='bold')
    ax.grid(axis='y',alpha=.17);ax.set_axisbelow(True)

paired_bars(axs[0,1],'short_first_action_nop','Next action was a no-op · fresh replication')
axs[0,1].legend(frameon=False,fontsize=8,loc='upper right')
paired_bars(axs[1,0],'long_survived',f'Recipient survival at 24 units · n={n}')

ax=axs[1,1];keys=['intact_minus_ruptured_survival_24','intact_minus_active_survival_24']
titles=['Intact − ruptured','Intact − active interpreter'];y=[1,0]
ax.axvline(0,color='#777',lw=1)
for yy,key in zip(y,keys):
    v=rep['primary'][key];m,lo,hi=[100*v[k] for k in ('estimate','low','high')]
    ax.errorbar(m,yy,xerr=[[m-lo],[hi-m]],fmt='o',capsize=5,color='#7d305e',lw=2)
    ax.text(hi+.55,yy,f'+{m:.1f} [{lo:+.1f}, {hi:+.1f}]',va='center',fontsize=9)
ax.set_yticks(y,titles);ax.set_ylim(-.65,1.65);ax.set_xlim(-2,29)
ax.set_xlabel('Survival difference in percentage points · 97.5% intervals')
ax.set_title('Fresh replication · paired survival differences',loc='left',fontsize=11,fontweight='bold')
ax.grid(axis='x',alpha=.17);ax.set_axisbelow(True)

fig.savefig('CYBERGOTHIC_VIRAL_STOP_FIGURE_2026-11-15.png',dpi=160,bbox_inches='tight')
