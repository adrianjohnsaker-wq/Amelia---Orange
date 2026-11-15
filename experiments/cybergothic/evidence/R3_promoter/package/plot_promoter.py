"""Reproduce the 24-unit promoter comparison figure."""
import json
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

d=json.loads(Path('fresh_promoter_35001/analysis.json').read_text())
arms=['open','zone','rotated','zone_shuffled','syzygy']
labels=['Open','Zone','Rotated','Zone +\nshuffled','Syzygy']
colors=['#626879','#8c2a62','#a7aaba','#d89943','#397e78']
means=[d['summaries']['24'][a]['uptake']['seed_weighted_mean'] for a in arms]
fig=plt.figure(figsize=(11,7.7),layout='constrained')
grid=fig.add_gridspec(2,1,height_ratios=[1,1.25]);ax=fig.add_subplot(grid[0])
bars=ax.bar(range(5),means,color=colors,width=.63)
for b,v in zip(bars,means):ax.text(b.get_x()+b.get_width()/2,v+.012,f'{v:.3f}',ha='center',fontsize=10)
ax.set_xticks(range(5),labels);ax.set_ylim(0,.79);ax.set_ylabel('Mean recipient uptake')
ax.set_title('Recipient nutrient over 24 model-time units',loc='left',fontweight='bold',fontsize=13)
ax.grid(axis='y',alpha=.18);ax.set_axisbelow(True)
b=fig.add_subplot(grid[1]);keys=['uptake_24_zone_minus_open','uptake_24_zone_minus_rotated','uptake_24_zone_minus_zone_shuffled']
names=['Zone − open','Zone − rotated','Zone − zone + shuffled']
ys=[2,1,0]
b.axvline(0,color='#777777',lw=1)
for y,key in zip(ys,keys):
 p=d['primary'][key];m=p['estimate'];lo=p['low'];hi=p['high']
 b.errorbar(m,y,xerr=[[m-lo],[hi-m]],fmt='o',color='#8c2a62',capsize=5,lw=2,ms=7)
 b.text(.077,y,f'{m:+.3f}  [{lo:+.3f}, {hi:+.3f}]',va='center',fontsize=9)
b.set_yticks(ys,names);b.set_xlim(-.18,.19);b.set_ylim(-.55,2.55);b.grid(axis='x',alpha=.18)
b.set_xlabel('Paired nutrient difference; 98.33% adjusted intervals')
b.set_title('Three planned comparisons',loc='left',fontweight='bold',fontsize=13)
fig.suptitle('Conditional viral promoters · 240 matched encounters · 60 populations',x=.03,ha='left',fontweight='bold',fontsize=14)
fig.savefig('CYBERGOTHIC_PROMOTER_FIGURE_2026-11-15.png',dpi=160,bbox_inches='tight')
