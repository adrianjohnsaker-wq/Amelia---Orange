"""Non-causal, event-sourced provenance observer for the separate digit world.

The observer is an external sidecar: agents and the digit parser never consult
it. Origin/adjacency root IDs are stable across copies. Every copied atom and
edge additionally receives an occurrence node with an exact parent pointer.
"""
from __future__ import annotations

from dataclasses import dataclass
import copy
import random

from digit_world import DigitWorld,parse_genome
from design_feasibility import candidates


@dataclass(frozen=True)
class Tape:
    atoms: tuple[str,...]
    edges: tuple[str,...]
    def __post_init__(self):
        if len(self.edges)!=max(0,len(self.atoms)-1):raise ValueError('invalid shadow edge count')
    def dump(self):return {'atoms':list(self.atoms),'edges':list(self.edges)}
    @classmethod
    def load(cls,x):return cls(tuple(x['atoms']),tuple(x['edges']))


class ShadowObserver:
    def __init__(self,seed,branch='shared'):
        self.seed=int(seed);self.branch=branch;self.serial=0;self.last_seq=0
        self.nodes={};self.agents={};self.histories={};self.corpses={};self.archive={};self.packets={}
        self.dead={};self.parents={};self.pending_births={};self.grafts=[];self.viral_deliveries=[];self.variants=[]
        self.open_frames=[];self.drift_records=[];self.clipped_candidates=[]
        self.last_transfer_before=None
        self.route_counts={};self.event_counts={}

    def ident(self):
        self.serial+=1
        return f'{self.seed}:{self.branch}:{self.serial}'

    def atom(self,digit,host,seq,time,offset=0,route='origin'):
        i=self.ident();self.nodes[i]={'kind':'atom','root':i,'parent':None,'digit':digit,
            'origin_host':str(host),'origin_time':time,'origin_event':seq,'offset':offset,
            'route':route,'source':None,'target':str(host)}
        return i

    def edge(self,left,right,seq,time,route='join',source=None,target=None):
        i=self.ident();self.nodes[i]={'kind':'edge','root':i,'parent':None,'event':seq,'time':time,
            'left_root':self.nodes[left]['root'],'right_root':self.nodes[right]['root'],
            'route':route,'source':source,'target':target}
        return i

    def clone(self,old,seq,time,route,source,target):
        n=self.nodes[old];i=self.ident();v=dict(n)
        v.update(parent=old,event=seq,time=time,route=route,source=str(source),target=str(target))
        self.nodes[i]=v
        self.route_counts[route]=self.route_counts.get(route,0)+1
        return i

    def mint(self,genome,host,seq,time):
        atoms=tuple(self.atom(d,host,seq,time,i) for i,d in enumerate(genome))
        return Tape(atoms,tuple(self.edge(atoms[i],atoms[i+1],seq,time,'founder_join',target=str(host))
                                for i in range(len(atoms)-1)))

    def digits(self,tape):return ''.join(self.nodes[a]['digit'] for a in tape.atoms)

    def verify(self,tape,genome):
        if self.digits(tape)!=genome:raise AssertionError(('shadow digits differ',self.digits(tape),genome))
        for i,link in enumerate(tape.edges):
            n=self.nodes[link]
            if (n['kind']!='edge' or n['left_root']!=self.nodes[tape.atoms[i]]['root'] or
                n['right_root']!=self.nodes[tape.atoms[i+1]]['root']):
                raise AssertionError(('shadow edge endpoints differ',i))

    def select(self,tape,indices,seq,time,route,source,target):
        indices=list(indices)
        if any(i<0 or i>=len(tape.atoms) for i in indices):raise IndexError('shadow source index')
        atoms=tuple(self.clone(tape.atoms[i],seq,time,route,source,target) for i in indices)
        edges=[]
        for j,(a,b) in enumerate(zip(indices,indices[1:])):
            if b==a+1:edges.append(self.clone(tape.edges[a],seq,time,route,source,target))
            else:edges.append(self.edge(atoms[j],atoms[j+1],seq,time,'copy_join',source,target))
        return Tape(atoms,tuple(edges))

    def cyclic(self,tape,start,count,seq,time,route,source,target):
        n=len(tape.atoms)
        if not n:return Tape((),())
        # The engine reads (genome+genome)[start:start+count], which can be
        # shorter than count when the genome is tiny.
        indices=[j % n for j in range(start,min(start+count,2*n))]
        return self.select(tape,indices,seq,time,route,source,target)

    def splice(self,host,ip,payload,seq,time,target,cap):
        if not 0<=ip<=len(host.atoms):raise ValueError('shadow splice position')
        if not payload.atoms:
            if len(host.atoms)<=cap:return host
            return Tape(host.atoms[:cap],host.edges[:max(0,cap-1)])
        parts=[(host,j,0) for j in range(ip)]+[(payload,j,1) for j in range(len(payload.atoms))]+\
              [(host,j,2) for j in range(ip,len(host.atoms))]
        parts=parts[:cap];atoms=tuple(t.atoms[j] for t,j,_ in parts);edges=[]
        for j,((a,ai,ag),(b,bi,bg)) in enumerate(zip(parts,parts[1:])):
            if ag==bg and a is b and bi==ai+1:edges.append(a.edges[ai])
            else:edges.append(self.edge(atoms[j],atoms[j+1],seq,time,'insertion_join',target=str(target)))
        return Tape(atoms,tuple(edges))

    def mutate(self,tape,position,digit,seq,time,owner,route='mutation'):
        atoms=list(tape.atoms);atoms[position]=self.atom(digit,owner,seq,time,position,route)
        edges=list(tape.edges)
        for j in (position-1,position):
            if 0<=j<len(edges):edges[j]=self.edge(atoms[j],atoms[j+1],seq,time,route,target=str(owner))
        return Tape(tuple(atoms),tuple(edges))

    def source(self,ident):
        if ident in self.agents:return self.agents[ident]
        if ident in self.dead:return self.dead[ident]
        raise KeyError(f'unknown shadow host {ident}')

    def remember_grafts(self,w,e,seq,before_tape):
        if e['event'] not in ('infection','vector_infection'):return
        ip=e['target_ip'] if e['event']=='infection' else e['ip']
        payload=e['payload'] if e['event']=='infection' else e['code']
        full=e['before'][:ip]+payload+e['before'][ip:]
        if e['after']!=full:
            hypothetical={**e,'after':full}
            actual_spans={(s[1],s[3],s[4]) for s in parse_genome(e['after']) if s[0]=='intron'}
            for hit in candidates(hypothetical):
                if (hit['graft_start'],hit['graft_stop'],hit['graft_start']+hit['intron_length']) in actual_spans:
                    self.clipped_candidates.append({**hit,'event_seq':seq,'recipient':e['target']})
        for hit in candidates(e):
            target=e['target'];tape=self.agents[target];stop=hit['graft_stop'];edge=tape.edges[stop]
            n=self.nodes[edge];origin=self.nodes[n['root']]
            if origin['parent'] is not None or origin['event']!=seq or origin['route']!='insertion_join':
                raise AssertionError('focal stop is not the newly created insertion boundary')
            ip=e['target_ip'] if e['event']=='infection' else e['ip']
            payload=e['payload'] if e['event']=='infection' else e['code'];boundary=[]
            for j in (stop,stop+1):
                atom=tape.atoms[j];node=self.nodes[atom];viral=ip<=j<ip+len(payload)
                if viral:
                    expected_route='viral_direct' if e['event']=='infection' else 'viral_vector'
                    if node['parent'] is None or node['event']!=seq or node['route']!=expected_route:
                        raise AssertionError('viral boundary digit lacks its exact source occurrence')
                else:
                    original=j if j<ip else j-len(payload)
                    if atom!=before_tape.atoms[original]:
                        raise AssertionError('recipient boundary digit does not match its original occurrence')
                boundary.append({'occurrence':atom,'root':node['root'],
                                 'source':'viral' if viral else 'recipient'})
            if {x['source'] for x in boundary}!={'viral','recipient'}:
                raise AssertionError('boundary is not host–viral chimeric')
            span=next(s for s in parse_genome(self.digits(tape)) if s[0]=='intron' and s[1]==hit['graft_start'] and s[3]==stop)
            focal=self.digits(tape)[span[1]:span[4]];lookalikes=[];lookalike_edges=[]
            for ident,host in w.agents.items():
                genome=e['before'] if ident==target else host.genome
                prior_tape=before_tape if ident==target else self.agents[ident]
                prior=[s for s in parse_genome(genome) if s[0]=='intron' and genome[s[1]:s[4]]==focal]
                if prior:
                    lookalikes.append(ident)
                    lookalike_edges.extend(prior_tape.edges[s[3]] for s in prior)
            # Mark the start occurrence at t0 without changing its ancestry or
            # the primary genome; pre-graft history snapshots retain the older
            # occurrence, so a recall of them cannot acquire this association.
            edges=list(tape.edges)
            edges[span[1]]=self.clone(edges[span[1]],seq,e['time'],'graft_frame_anchor',target,target)
            tape=Tape(tape.atoms,tuple(edges));self.agents[target]=tape
            self.grafts.append({**hit,'event_seq':seq,'founder':target,'graft_edge':n['root'],
                'graft_occurrence':edge,'sequence':focal,'baseline_lookalike_hosts':sorted(lookalikes),
                'baseline_lookalike_edges':lookalike_edges,
                'boundary_atoms':boundary,
                'pre_event_covariates':{'time':e['time'],'zone':e['zone'],'mechanism':e['event'],
                    'intron_length':span[4]-span[1],'host_age':w.agents[target].age,
                    'host_energy_approx':w.agents[target].energy+e['energy_transferred'],
                    'local_population':len(w.occupants(e['zone'])),
                    'zone_resource':w.resources[e['zone']],'field':list(w.field[e['zone']]),
                    'host_genome_length':len(e['before'])},
                'focal_occurrences':list(tape.atoms[span[1]:span[4]]),
                'focal_start_edge':self.nodes[tape.edges[span[1]]]['root'],
                'focal_start_occurrence':tape.edges[span[1]],
                'dispatch':getattr(w,'_current_dispatch',None)})

    def descends(self,occurrence,ancestor):
        seen=set()
        while occurrence is not None:
            if occurrence==ancestor:return True
            if occurrence in seen:raise ValueError('shadow occurrence cycle')
            seen.add(occurrence);occurrence=self.nodes[occurrence]['parent']
        return False

    def remember_drift(self,owner,old,new,e,seq):
        """Track stop changes in the first focal frame, including open/repair."""
        if not self.grafts:return new
        g=self.grafts[0]
        if seq<=g['event_seq']:return new
        anchor=g['focal_start_occurrence']
        def frames(tape):
            if tape is None:return []
            return [(s,tape.edges[s[1]],tape.edges[s[3]]) for s in parse_genome(self.digits(tape))
                    if s[0]=='intron' and self.descends(tape.edges[s[1]],anchor)]
        previous=frames(old);current=frames(new);marked={}
        def mark_stop(position):
            nonlocal new
            if position not in marked:
                edges=list(new.edges)
                edges[position]=self.clone(edges[position],seq,e['time'],'drift_stop_anchor',owner,owner)
                marked[position]=edges[position];new=Tape(new.atoms,tuple(edges))
            return marked[position]
        matched=set()
        for os,os_start,os_stop in previous:
            found=False
            for ns,ns_start,ns_stop in current:
                if not self.descends(ns_start,os_start):continue
                found=True;matched.add(ns_start)
                if self.nodes[ns_stop]['root']!=self.nodes[os_stop]['root']:
                    ns_stop=mark_stop(ns[3])
                    self.drift_records.append({'event_seq':seq,'time':e['time'],'owner':str(owner),
                        'kind':e['event'],'old_edge_root':self.nodes[os_stop]['root'],
                        'new_edge_root':self.nodes[ns_stop]['root'],'new_edge_occurrence':ns_stop,
                        'start_occurrence':ns_start,'mode':'immediate_shift'})
            if not found:
                for start in new.edges:
                    if self.descends(start,os_start):
                        self.open_frames.append({'event_seq':seq,'time':e['time'],'owner':str(owner),
                            'kind':e['event'],'old_edge_root':self.nodes[os_stop]['root'],
                            'start_occurrence':start})
                        break
        for ns,ns_start,ns_stop in current:
            if ns_start in matched:continue
            possible=[x for x in self.open_frames if x['event_seq']<seq and
                      self.descends(ns_start,x['start_occurrence'])]
            if possible:
                opened=max(possible,key=lambda x:x['event_seq'])
                if self.nodes[ns_stop]['root']!=opened['old_edge_root']:
                    ns_stop=mark_stop(ns[3])
                    self.drift_records.append({'event_seq':seq,'time':e['time'],'owner':str(owner),
                        'kind':e['event'],'old_edge_root':opened['old_edge_root'],
                        'new_edge_root':self.nodes[ns_stop]['root'],'new_edge_occurrence':ns_stop,
                        'start_occurrence':ns_start,'mode':'open_then_repair',
                        'opened_event_seq':opened['event_seq']})
        return new

    def remember_delivery(self,e,seq):
        """Record copied viral edges which are recognised stops at delivery."""
        tape=self.agents[e['target']]
        for span in parse_genome(self.digits(tape)):
            if span[0]!='intron':continue
            occurrence=tape.edges[span[3]];node=self.nodes[occurrence]
            probe=occurrence;route=None
            while probe is not None:
                item=self.nodes[probe]
                if item.get('event')!=seq:break
                if item['route'] in ('viral_direct','viral_vector'):
                    route=item['route'];break
                probe=item['parent']
            if route is not None:
                self.viral_deliveries.append({'event_seq':seq,'time':e['time'],
                    'recipient':e['target'],'mechanism':route,
                    'edge_root':node['root'],'occurrence':occurrence})

    def on_event(self,w,e,seq):
        kind=e['event'];time=e['time'];self.last_seq=seq
        self.event_counts[kind]=self.event_counts.get(kind,0)+1
        if kind=='birth':
            ident=e['agent'];parent=e['parent'];self.parents[ident]=parent
            if parent is None and w.started:
                self.pending_births[ident]=e['genome']
            elif parent is None:
                self.agents[ident]=self.mint(e['genome'],ident,seq,time)
                self.histories[ident]=[self.agents[ident]]
            else:
                p=self.source(parent);start=len(p.atoms)//2
                child=self.select(p,range(start,len(p.atoms)),seq,time,'fission',parent,ident)
                self.verify(child,e['genome']);child=self.remember_drift(ident,None,child,e,seq)
                self.agents[ident]=child;self.histories[ident]=[child]
        elif kind=='death':
            ident=e['agent'];tape=self.agents.pop(ident);self.verify(tape,e['genome'])
            self.dead[ident]=tape;self.histories.pop(ident,None)
        elif kind=='corpse_cap_eviction':self.corpses.pop(e['corpse'],None)
        elif kind=='corpse':
            owner=e['origin'];source=self.source(owner);cause=e['cause']
            if cause=='shrapnel':indices=range(max(1,len(source.atoms)//2))
            elif cause=='decoy':indices=range(len(source.atoms)//2,len(source.atoms))
            elif cause=='decoy_opcode':
                agent=w.agents[owner];start=agent.ip;size=min(6,len(source.atoms))
                indices=[j%len(source.atoms) for j in range(start,min(start+size,2*len(source.atoms)))]
            else:indices=range(len(source.atoms))
            tape=self.select(source,indices,seq,time,'corpse_'+cause,owner,f"corpse:{e['corpse']}")
            if len(tape.atoms)>w.cfg.max_genome:tape=Tape(tape.atoms[:w.cfg.max_genome],tape.edges[:w.cfg.max_genome-1])
            self.verify(tape,e['genome']);tape=self.remember_drift(f"corpse:{e['corpse']}",None,tape,e,seq)
            self.corpses[e['corpse']]=tape
        elif kind=='archive_store':
            ident=e['corpse'];source=self.corpses[ident]
            tape=self.select(source,range(len(source.atoms)),seq,time,'archive_store',f'corpse:{ident}',f'archive:{ident}')
            self.verify(tape,e['genome']);self.archive[ident]=tape
        elif kind in ('genome_mutation','necrotic_mutation'):
            mapping=self.agents if kind=='genome_mutation' else self.corpses
            ident=e['agent'] if kind=='genome_mutation' else e['corpse'];old=mapping[ident]
            self.verify(old,e['before']);pos=e['position'];new=self.mutate(old,pos,e['after'][pos],seq,time,ident,kind)
            self.verify(new,e['after']);owner=ident if kind=='genome_mutation' else f'corpse:{ident}'
            mapping[ident]=self.remember_drift(owner,old,new,e,seq)
        elif kind=='trial_genome_edit':
            ident=e['agent'];old=self.agents[ident];self.verify(old,e['before']);pos=e['position']
            previous=self.nodes[old.edges[pos-1]]['root']
            new=self.mutate(old,pos,e['after'][pos],seq,time,ident,'trial_genome_edit')
            self.verify(new,e['after']);new=self.remember_drift(ident,old,new,e,seq);self.agents[ident]=new
            self.variants.append({'event_seq':seq,'agent':ident,'label':e['label'],
                'source_edge':previous,'variant_edge':self.nodes[new.edges[pos-1]]['root']})
        elif kind=='trial_permute':
            ident=e['agent'];old=self.agents[ident];self.verify(old,e['before'])
            new=self.select(old,e['indices'],seq,time,'trial_permute',ident,ident)
            self.verify(new,e['after']);self.agents[ident]=self.remember_drift(ident,old,new,e,seq)
        elif kind=='infection':
            a=e['attacker'];target=e['target'];old=self.agents[target];self.verify(old,e['before'])
            self.last_transfer_before=(seq,target,old)
            payload=self.cyclic(self.source(a),e['attacker_ip'],3,seq,time,'viral_direct',a,target)
            self.verify(payload,e['payload']);new=self.splice(old,e['target_ip'],payload,seq,time,target,w.cfg.max_genome)
            self.verify(new,e['after']);self.agents[target]=self.remember_drift(target,old,new,e,seq)
            self.remember_grafts(w,e,seq,old);self.remember_delivery(e,seq)
        elif kind=='vector_shed':
            donor=e['donor'];source=self.source(donor);code=e['cargo'];n=min(4,len(source.atoms))
            if w.vector_mode=='shuffled':
                perm=list(range(n));random.Random((w.cfg.seed<<32)^e['packet']^donor).shuffle(perm)
                original=['']*n
                for j,idx in enumerate(perm):original[idx]=code[j]
                original=''.join(original)
            elif w.vector_mode=='intact':original=code;perm=list(range(n))
            else:raise ValueError('unsupported vector policy')
            position=(self.digits(source)+self.digits(source)).find(original) if e['experienced'] else w.agents[donor].ip
            if not 0<=position<len(source.atoms):raise AssertionError('vector source location')
            packet=self.cyclic(source,position,n,seq,time,'vector_shed',donor,f"packet:{e['packet']}")
            self.verify(packet,original)
            if perm!=list(range(n)):packet=self.select(packet,perm,seq,time,'vector_shuffle',donor,f"packet:{e['packet']}")
            self.verify(packet,code);self.packets[e['packet']]=packet
        elif kind=='vector_infection':
            target=e['target'];old=self.agents[target];self.verify(old,e['before']);packet=self.packets[e['packet']]
            self.last_transfer_before=(seq,target,old)
            self.verify(packet,e['code']);payload=self.select(packet,range(len(packet.atoms)),seq,time,
                                'viral_vector',f"packet:{e['packet']}",target)
            new=self.splice(old,e['ip'],payload,seq,time,target,w.cfg.max_genome)
            self.verify(new,e['after']);self.agents[target]=self.remember_drift(target,old,new,e,seq)
            self.remember_grafts(w,e,seq,old);self.remember_delivery(e,seq)
        elif kind=='vector_expire':self.packets.pop(e['packet'],None)
        elif kind=='timesplice':
            a=e['agent'];b=e['target'];ta=self.agents[a];tb=self.agents[b]
            self.verify(ta,e['before_agent']);self.verify(tb,e['before_target'])
            ac=self.cyclic(ta,e['agent_ip'],3,seq,time,'time_splice',a,b)
            bc=self.cyclic(tb,e['target_ip'],3,seq,time,'time_splice',b,a)
            self.verify(ac,e['agent_code']);self.verify(bc,e['target_code'])
            na=self.splice(ta,e['agent_ip'],bc,seq,time,a,w.cfg.max_genome)
            nb=self.splice(tb,e['target_ip'],ac,seq,time,b,w.cfg.max_genome)
            self.verify(na,e['after_agent']);self.verify(nb,e['after_target'])
            self.agents[a]=self.remember_drift(a,ta,na,e,seq)
            self.agents[b]=self.remember_drift(b,tb,nb,e,seq)
        elif kind=='reinject':
            c=e['corpse'];host=e['host'];source=self.corpses[c];old=self.agents[host];self.verify(old,e['host_before'])
            payload=self.select(source,range(min(4,len(source.atoms))),seq,time,'necrotic_reinject',f'corpse:{c}',host)
            self.verify(payload,e['payload']);new=self.splice(old,e['host_ip'],payload,seq,time,host,w.cfg.max_genome)
            self.verify(new,e['host_after']);self.agents[host]=self.remember_drift(host,old,new,e,seq);del self.corpses[c]
        elif kind=='scavenge':
            host=e['agent'];c=e['corpse'];old=self.agents[host];source=self.corpses[c];self.verify(old,e['before'])
            payload=self.select(source,range(len(source.atoms)),seq,time,'scavenge',f'corpse:{c}',host)
            new=self.splice(old,len(old.atoms),payload,seq,time,host,w.cfg.max_genome)
            self.verify(new,e['after']);self.agents[host]=self.remember_drift(host,old,new,e,seq);del self.corpses[c]
        elif kind in ('replay','chrono_recall'):
            ident=e['agent'] if kind=='replay' else e['target'];self.verify(self.agents[ident],e['before'])
            source=self.histories[ident][-2]
            new=self.select(source,range(len(source.atoms)),seq,time,kind,f'history:{ident}',ident)
            old=self.agents[ident];self.verify(new,e['after']);self.agents[ident]=self.remember_drift(ident,old,new,e,seq)
        elif kind=='reconstitute':
            ident=e['agent'];c=e['source_corpse'];source=self.archive[c]
            self.verify(source,e['archived'])
            n=len(source.atoms);indices=list(range(n))
            if e.get('policy') in ('shuffled','portfolio_shuffled'):
                random.Random((w.cfg.seed<<32)^ident^c).shuffle(indices)
            tape=self.select(source,indices,seq,time,'reconstitute',f'archive:{c}',ident)
            if 'pre_mutation' in e:self.verify(tape,e['pre_mutation'])
            pos=e['mutation_position'];tape=self.mutate(tape,pos,e['genome'][pos],seq,time,ident,'reconstitution_mutation')
            self.verify(tape,e['genome']);assert self.pending_births.pop(ident)==e['genome']
            tape=self.remember_drift(ident,None,tape,e,seq);self.agents[ident]=tape;self.histories[ident]=[tape]
        elif kind=='action_end' and e['alive']:
            ident=e['agent'];tape=self.agents[ident];self.verify(tape,w.agents[ident].genome)
            self.histories[ident]=(self.histories[ident]+[tape])[-8:]
            if len(self.histories[ident])!=len(w.agents[ident].history):raise AssertionError('history count mismatch')
            for observed,primary in zip(self.histories[ident],w.agents[ident].history):self.verify(observed,primary[0])

    def audit(self,w):
        if self.pending_births:raise AssertionError('unfinished shadow births')
        for mapping,primary in ((self.agents,w.agents),(self.corpses,w.corpses)):
            if set(mapping)!=set(primary):raise AssertionError('shadow object IDs differ')
            for i,obj in primary.items():self.verify(mapping[i],obj.genome)
        if set(self.archive)!=set(w.archive) or set(self.packets)!=set(w.packets):raise AssertionError('archive/packet IDs differ')
        for i,x in w.archive.items():self.verify(self.archive[i],x['genome'])
        for i,x in w.packets.items():self.verify(self.packets[i],x['code'])
        for ident,agent in w.agents.items():
            if len(self.histories[ident])!=len(agent.history):raise AssertionError('history length differs')
            for tape,(genome,_) in zip(self.histories[ident],agent.history):self.verify(tape,genome)
        return True

    def export(self):
        pack=lambda x:{str(k):v.dump() for k,v in x.items()}
        return {'version':1,'seed':self.seed,'branch':self.branch,'serial':self.serial,'last_seq':self.last_seq,
                'nodes':self.nodes,'agents':pack(self.agents),'corpses':pack(self.corpses),'archive':pack(self.archive),
                'packets':pack(self.packets),'dead':pack(self.dead),
                'histories':{str(k):[x.dump() for x in v] for k,v in self.histories.items()},
                'parents':{str(k):v for k,v in self.parents.items()},'pending_births':{str(k):v for k,v in self.pending_births.items()},
                'grafts':self.grafts,'viral_deliveries':self.viral_deliveries,'variants':self.variants,
                'open_frames':self.open_frames,'drift_records':self.drift_records,
                'clipped_candidates':self.clipped_candidates,
                'route_counts':self.route_counts,'event_counts':self.event_counts}

    @classmethod
    def restore(cls,s):
        if s['version']!=1:raise ValueError('unsupported shadow version')
        o=cls(s['seed'],s['branch']);o.serial=s['serial'];o.last_seq=s['last_seq'];o.nodes=s['nodes']
        unpack=lambda x:{int(k):Tape.load(v) for k,v in x.items()}
        for key in ('agents','corpses','archive','packets','dead'):setattr(o,key,unpack(s[key]))
        o.histories={int(k):[Tape.load(t) for t in v] for k,v in s['histories'].items()}
        o.parents={int(k):v for k,v in s['parents'].items()};o.pending_births={int(k):v for k,v in s['pending_births'].items()}
        o.grafts=s['grafts'];o.viral_deliveries=s['viral_deliveries'];o.variants=s['variants']
        o.open_frames=s['open_frames'];o.drift_records=s['drift_records']
        o.clipped_candidates=s['clipped_candidates']
        o.route_counts=s['route_counts'];o.event_counts=s['event_counts']
        return o


class ObservedWorld(DigitWorld):
    def __init__(self,config,entropy,populate=True,*,observe=True):
        self.shadow=ShadowObserver(config.seed) if observe else None
        super().__init__(config,entropy,populate=populate)

    def emit(self,event,**details):
        start=len(self.log);super().emit(event,**details)
        if self.shadow is not None:
            for i in range(start,len(self.log)):
                self.shadow.on_event(self,self.log[i],i+1)

    @classmethod
    def restore_with_shadow(cls,state,events,shadow):
        w=super().restore(state,events)
        w.shadow=ShadowObserver.restore(shadow)
        if w.shadow.last_seq!=len(w.log):raise ValueError('shadow ledger position mismatch')
        w.shadow.audit(w)
        return w
