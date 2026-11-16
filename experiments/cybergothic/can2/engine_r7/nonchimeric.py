"""Descriptive, non-randomised comparison encounters with donor-only stops."""
import json
from pathlib import Path

from classify import path_to
from digit_world import parse_genome
from experiment import BranchWorld
from pilot_stop_screen import create_world
from reactor import digest


def candidates(e):
    if e['event'] not in ('infection','vector_infection'):return []
    before,after=e['before'],e['after'];ip=e['target_ip'] if e['event']=='infection' else e['ip']
    payload=e['payload'] if e['event']=='infection' else e['code']
    if after!=before[:ip]+payload+before[ip:]:return []
    old=parse_genome(before);out=[]
    for s in parse_genome(after):
        if s[0]!='intron' or s[4]-s[1]<6 or s[1]>=ip:continue
        if not (ip<=s[3] and s[3]+1<ip+len(payload)):continue
        prior=[x for x in old if x[0]=='intron' and x[1]==s[1]]
        if prior:form='recognised_frame'
        else:
            start=s[1];covered=any(x[1]<=start<x[4] for x in old)
            if before[start:start+2]!='60' or before.find('09',start+2)>=0 or covered:continue
            form='unclosed_frame'
        out.append({'start':s[1],'stop':s[3],'end':s[4],'length':s[4]-s[1],'form':form})
    return out


class NonChimericWorld(BranchWorld):
    def __init__(self,*a,**k):self.nonchim_first=None;self.stop_when_nonchim=False;super().__init__(*a,**k)
    def emit(self,event,**details):
        start=len(self.log);super().emit(event,**details)
        if self.nonchim_first is not None or self.shadow is None:return
        for seq in range(start+1,len(self.log)+1):
            e=self.log[seq-1];hits=candidates(e)
            if not hits:continue
            hit=hits[0];target=e['target'];tape=self.shadow.agents[target]
            occurrence=tape.edges[hit['stop']];root=self.shadow.nodes[occurrence]['root']
            prior_seq,prior_target,prior_tape=self.shadow.last_transfer_before
            if (prior_seq,prior_target)!=(seq,target):raise AssertionError('missing exact pre-transfer tape')
            baseline=[]
            for ident,host in self.agents.items():
                shadow=prior_tape if ident==target else self.shadow.agents[ident]
                if any(self.shadow.nodes[x]['root']==root for x in shadow.edges):baseline.append(ident)
            self.nonchim_first={'event_seq':seq,'time':e['time'],'target':target,
                'mechanism':e['event'],'zone':e['zone'],'span':hit,'edge_root':root,
                'index_occurrence':occurrence,'baseline_edge_carriers':sorted(baseline),
                'dispatch':self._current_dispatch,
                'covariates':{'time':e['time'],'zone':e['zone'],'mechanism':e['event'],
                    'intron_length':hit['length'],'host_age':self.agents[target].age,
                    'host_energy_approx':self.agents[target].energy+e['energy_transferred'],
                    'local_population':len(self.occupants(e['zone'])),
                    'zone_resource':self.resources[e['zone']],'field':list(self.field[e['zone']]),
                    'host_genome_length':len(e['before'])}}
            return


def run(seed):
    w=create_world(seed,NonChimericWorld);w.stop_when_nonchim=True;w.advance(until_time=180.)
    if w.nonchim_first is None:return {'seed':seed,'eligible':False,'events':len(w.log)}
    entry=w.nonchim_first;assert entry['dispatch'] is not None
    t0=entry['dispatch'][0];w.stop_when_nonchim=False;w.advance(until_time=t0+48.);w.shadow.audit(w)
    carriers=[]
    for ident,tape in w.shadow.agents.items():
        if ident==entry['target'] or ident in entry['baseline_edge_carriers']:continue
        for span in parse_genome(w.shadow.digits(tape)):
            if span[0]!='intron':continue
            edge=tape.edges[span[3]]
            if (w.shadow.nodes[edge]['root']==entry['edge_root'] and
                path_to(w.shadow.nodes,edge,entry['index_occurrence']) is not None):
                carriers.append(ident);break
    return {'seed':seed,'eligible':True,'index':entry,'new_recognised_carriers':sorted(set(carriers)),
            'state_sha256':digest(w.snapshot()),'event_sha256':digest(w.log),
            'shadow_sha256':digest(w.shadow.export())}


def main():
    import argparse
    p=argparse.ArgumentParser();p.add_argument('--seed',type=int,required=True);a=p.parse_args()
    print(json.dumps(run(a.seed),sort_keys=True))


if __name__=='__main__':main()
