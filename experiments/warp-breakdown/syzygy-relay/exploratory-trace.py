"""Post-outcome descriptive trace alignment and time course; not preregistered."""
import json,statistics
from pathlib import Path
root=Path('warp_relay_data/evaluation');origins=sorted(root.glob('S05W*'));comparisons={'warp_vs_matched_phase':[0,0,0],'warp_phase_vs_plain':[0,0,0],'warp_phase_vs_yoked':[0,0,0],'warp_phase_vs_global':[0,0,0],'warp_phase_vs_direct':[0,0,0],'warp_entry_vs_phase':[0,0,0],'warp_natural_retain_vs_reset':[0,0,0],'warp_natural_retain_vs_donor':[0,0,0]}; series={}; reward_sources={}
for path in origins:
 d=json.loads((path/'result.json').read_text());epseries={}
 for e in d['episodes']:
  em={}
  for sc in ('same','reversed'):
   mode=e['env']['mode' if sc=='same' else 'other'];target={1:0,3:1}[mode]
   for route,typ in [('warp','natural'),('warp','global'),('warp','focus_phase'),('warp','entry'),('matched27','focus_phase'),('matched27','entry'),('native27','entry')]:
    arms=[a for a in e['post'] if a['route']==route and a['type']==typ and a['scenario']==sc and a['memory']=='retain'];assert len(arms)==len(e['shocks'])
    for t in range(10):
     key=f'{sc}|{route}|{typ}|{t+1}';em[key]=[statistics.mean(a['steps'][t]['action']==target for a in arms),statistics.mean(a['steps'][t]['score']/2 for a in arms)]
     if t>=5:
      counts=reward_sources.setdefault(f'{sc}|{route}|{typ}|{t+1}', {'focus':0,'other':0})
      focus=(3,6) if route=='warp' else (2,7)
      for a in arms:
       ch=a['steps'][t]['change']; assert ch is not None
       counts['focus' if ch['source'] in focus else 'other']+=1
   direct=next(a for a in e['directPost'] if a['memory']=='retain' and a['scenario']==sc)
   for t in range(10):em[f'{sc}|direct|direct|{t+1}']=[int(direct['steps'][t]['action']==target),direct['steps'][t]['score']/2]
  for k,v in em.items():epseries.setdefault(k,[]).append(v)
  for shock in e['shocks']:
   def seq(route,typ,mem='retain'):
    a=next(a for a in e['post'] if (a['route'],a['type'],a['scenario'],a['memory'],a['shock'])==(route,typ,'same',mem,shock));return [s['action'] for s in a['steps'][:5]]
   w=seq('warp','focus_phase');dm=next(a for a in e['directPost'] if a['memory']=='retain' and a['scenario']=='same');direct=[s['action'] for s in dm['steps'][:5]]
   pairs={'warp_vs_matched_phase':(w,seq('matched27','focus_phase')),'warp_phase_vs_plain':(w,seq('warp','focus_plain')),'warp_phase_vs_yoked':(w,seq('warp','phase_yoked')),'warp_phase_vs_global':(w,seq('warp','global')),'warp_phase_vs_direct':(w,direct),'warp_entry_vs_phase':(seq('warp','entry'),w),'warp_natural_retain_vs_reset':(seq('warp','natural'),seq('warp','natural','reset')),'warp_natural_retain_vs_donor':(seq('warp','natural'),seq('warp','natural','donor'))}
   for k,(a,b) in pairs.items():
    z=comparisons[k];z[0]+=a==b;z[1]+=1;z[2]+=sum(x!=y for x,y in zip(a,b))
 for k,rows in epseries.items():series.setdefault(k,[]).append([statistics.mean(x[i] for x in rows) for i in range(2)])
series={k:[statistics.mean(x[i] for x in rows) for i in range(2)] for k,rows in series.items()}
output={'status':'EXPLORATORY_POST_OUTCOME','note':'Matching actions is descriptive and does not show identical substrate paths. Per-step rates average shocks within episode, then episodes within origin, then eight origins equally. Reward-source counts are unweighted branch observations, not independent samples. First new feedback is observed after decision 6; its effects can first enter decision 7.','matches':{k:{'identicalFiveActionSequences':v[0],'branches':v[1],'differentIndividualDecisions':v[2]} for k,v in comparisons.items()},'perStep':series,'rewardSources':reward_sources}
Path('warp_relay_data/exploratory-check.json').write_text(json.dumps(output,indent=2)+'\n');print(json.dumps(output))
