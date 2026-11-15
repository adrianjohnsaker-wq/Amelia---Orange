"""Render natural intron observations and the planned population contrasts."""
import glob
import json
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

first=json.loads(Path('fresh_digit_39001/analysis.json').read_text())
confirm=json.loads(Path('fresh_grammar_40001/confirmation_analysis.json').read_text())
birth=json.loads(Path('fresh_birth_41001/analysis.json').read_text())
rows=[json.loads(Path(p).read_text()) for p in glob.glob('fresh_birth_41001/seed_*.json')]
fig=plt.figure(figsize=(11,8.8),layout='constrained');g=fig.add_gridspec(2,2)
a=fig.add_subplot(g[0,0]);vals=[birth['initial_seeds_with_introns'],
  birth['summary']['self']['seeds_with_mutation_new_intron'],
  sum(r['results']['self']['decode_counts'].get('noop_intron',0)>0 for r in rows),
  sum(r['results']['self']['final_intron_spans']>0 for r in rows)]
bars=a.bar(range(4),vals,color=['#737b8d','#8e2f62','#cf8b3b','#34847c'],width=.63)
for b,v in zip(bars,vals):a.text(b.get_x()+b.get_width()/2,v+.5,str(v),ha='center')
a.set_xticks(range(4),['At birth','After point\nmutation','No-op\nread','At horizon']);a.set_ylim(0,33);a.set_ylabel('Populations (out of 30)')
a.set_title('Introns in from-birth ecologies',loc='left',fontweight='bold',fontsize=12)
a.grid(axis='y',alpha=.15);a.set_axisbelow(True)

def interval(ax,p,title,units,color,limits):
    m,lo,hi=p['estimate'],p['low'],p['high']
    ax.axvline(0,color='#777',lw=1);ax.errorbar(m,0,xerr=[[m-lo],[hi-m]],fmt='o',color=color,capsize=5,lw=2)
    ax.set_yticks([]);ax.set_xlim(*limits);ax.set_xlabel(units);ax.grid(axis='x',alpha=.15)
    ax.set_title(title,loc='left',fontweight='bold',fontsize=11)
    ax.text(.03,.75,f'{m:+.2f}  [{lo:+.2f}, {hi:+.2f}]',transform=ax.transAxes,fontsize=10)
interval(fig.add_subplot(g[0,1]),first['primary']['agent_time_self_minus_intron_active'],
         'Primary: population activity','Agent-time difference · 97.5% interval','#8e2f62',(-280,490))
interval(fig.add_subplot(g[1,0]),first['primary']['total_field_uptake_self_minus_intron_active'],
         'Primary: nutrient uptake','Nutrient difference · 97.5% interval','#8e2f62',(-1.8,2.1))
interval(fig.add_subplot(g[1,1]),confirm['primary'],
         'Fresh confirmation: full grammar vs literal','Agent-time difference · 95% interval','#34847c',(-150,560))
fig.suptitle('Self-parsing genomes · matched virtual ecologies',x=.03,ha='left',fontweight='bold',fontsize=15)
fig.savefig('CYBERGOTHIC_DIGIT_GENOME_FIGURE_2026-11-15.png',dpi=160,bbox_inches='tight')
