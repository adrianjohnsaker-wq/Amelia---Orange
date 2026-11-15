"""A compact scientific figure from the fixed and descriptive analyses."""
import argparse
import json
import math
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np


def main():
    p=argparse.ArgumentParser();p.add_argument('--primary',type=Path,required=True)
    p.add_argument('--extra',type=Path,required=True);p.add_argument('--chains',type=Path,required=True)
    p.add_argument('--output',type=Path,required=True)
    a=p.parse_args();primary=json.loads(a.primary.read_text());extra=json.loads(a.extra.read_text());chains=json.loads(a.chains.read_text())
    plt.rcParams.update({'font.size':11,'axes.spines.top':False,'axes.spines.right':False,
                         'figure.facecolor':'white','savefig.facecolor':'white'})
    fig,axes=plt.subplots(3,1,figsize=(10.8,9.6),layout='constrained',gridspec_kw={'height_ratios':[1.2,1.4,1.2]})
    ax=axes[0];primary_pairs=primary['paired_primary']
    pairs=[('Natural − recipient-active\nrecognised G carriers',primary_pairs['natural_minus_active_recognised_union']),
           ('Natural G − ruptured G*\nhomologous edge carriers',primary_pairs['natural_G_minus_ruptured_Gstar_marker'])]
    for y,(_,v) in enumerate(pairs):
        if v is None:continue
        e,lo,hi=[100*v[k] for k in ('estimate','low','high')]
        ax.plot([lo,hi],[y,y],color='#6434a2',lw=3);ax.plot(e,y,'o',color='#4b217f',ms=8)
    ax.axvline(0,color='#777777',lw=1,ls='--');ax.set_yticks(range(len(pairs)),[x[0] for x in pairs]);ax.invert_yaxis()
    ax.set_xlabel('Paired difference, percentage points  •  97.5% interval');ax.set_title('Sealed matched contrasts',loc='left',weight='bold')
    ax=axes[1];pop=extra['population_overall']
    descriptors=[('Secondary carrier at horizon\n(sealed category union)',pop['natural_secondary_union']),
                 ('Living viral-ancestry carrier\n(any route; exploratory)',chains['horizon_nondescendant_carrier_with_viral_ancestry']),
                 ('Delivery outside founder’s\nfission-descendant tree',pop['at_least_one_nonkin_viral_delivery'])]
    limit=max(5.,float(math.ceil(max(v['high'] for _,v in descriptors if v is not None)*125)))
    for y,(_,v) in enumerate(descriptors):
        if v is None:continue
        ax.plot([100*v['low'],100*v['high']],[y,y],color='#0b7588',lw=3)
        ax.plot(100*v['estimate'],y,'o',color='#075a69',ms=8)
        ax.text(limit*1.02,y,f"{v['successes']}/{v['n']}",va='center',fontsize=10)
    ax.set_xlim(0,limit*1.2);ax.set_yticks(range(len(descriptors)),[x[0] for x in descriptors]);ax.set_ylim(len(descriptors)-.6,-.4)
    ax.set_xlabel('Populations, %  •  95% Wilson interval');ax.set_title('Natural branches: three different outcomes',loc='left',weight='bold')
    ax=axes[2];collision=primary['secondary']['sequence_collision']
    for y,label in enumerate(('6','8','10+')):
        ratio=collision[label]['ratio'];den=ratio['denominator'];num=ratio['numerator']
        if den and ratio['interval']:
            lo,hi=ratio['interval'];ax.plot([lo*100,hi*100],[y,y],color='#c37826',lw=3)
            ax.plot(ratio['estimate']*100,y,'o',color='#98560c',ms=8)
            ax.text(103,y,f'{num}/{den} matches',va='center',fontsize=10)
        else:ax.text(2,y,'No matches: not estimable',va='center',color='#666666',fontsize=10)
    ax.set_xlim(0,118);ax.set_yticks(range(3),['6-digit introns','8-digit introns','10+ digit introns']);ax.set_ylim(2.35,-.35)
    ax.set_xlabel('Zero-focal-overlap among exact matches, %  •  95% population bootstrap\nSmall denominators make these bootstrap intervals degenerate')
    ax.set_title('Sequence lookalikes at the final horizon',loc='left',weight='bold')
    fig.suptitle(f"Chimeric-junction cohort  •  {primary['selected_populations']} independent populations",x=.02,ha='left',weight='bold',fontsize=15)
    fig.savefig(a.output,dpi=180)
    plt.close(fig);print(str(a.output))


if __name__=='__main__':main()
