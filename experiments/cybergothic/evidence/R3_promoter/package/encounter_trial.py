"""Randomized host-level counterfactuals in the isolated Numogram ecology.

All fragments are virtual digits, never host-executable code. Each comparison
forks one existing packet/recipient encounter after target selection and before
payload insertion. The live continuation receives a randomized assignment.
"""
from __future__ import annotations

import copy
import hashlib
import heapq
import json
import random
from collections import Counter
from dataclasses import asdict,dataclass

from legacy_engine import Config,Entropy,gate
from portable import PortableAssemblage
from reactor import canonical,digest

ARMS=("experienced","pointer","shuffled")


class EncounterWorld(PortableAssemblage):
    def __init__(self,config,entropy,populate=True):
        super().__init__(config,entropy,populate=populate)
        self.pending_trial=None

    def snapshot(self):
        state=super().snapshot();state["encounter_trial"]={"pending":self.pending_trial};return state

    @classmethod
    def restore(cls,state,events):
        w=super().restore(state,events);w.pending_trial=copy.deepcopy(state["encounter_trial"]["pending"]);return w

    def shed(self,attacker):
        n=min(4,len(attacker.genome));i=attacker.ip
        pointer=(attacker.genome+attacker.genome)[i:i+n]
        pointer_origins=(attacker.origins+attacker.origins)[i:i+n]
        if not super().shed(attacker):return False
        packet=self.packets[self.next_packet]
        if self.cargo_policy!="experienced" or self.vector_mode!="intact":
            raise AssertionError("trial packets require intact experienced emission")
        experienced=packet["code"];experienced_origins=packet["origins"].copy()
        pairs=list(zip(experienced,experienced_origins))
        # A dedicated deterministic stream never consumes the ecological RNG.
        key=f"shuffle:{self.cfg.seed}:{packet['id']}".encode()
        shuffle_seed=int.from_bytes(hashlib.sha256(key).digest(),"big")
        random.Random(shuffle_seed).shuffle(pairs)
        packet["alternatives"]={
            "experienced":{"code":experienced,"origins":experienced_origins},
            "pointer":{"code":pointer,"origins":pointer_origins},
            "shuffled":{"code":"".join(c for c,_ in pairs),"origins":[o for _,o in pairs]}}
        programs=self.minds[attacker.ident]["programs"]
        packet["candidate_info"]={"donor_ip_at_shedding":i,
            "donor_genome_sha256":hashlib.sha256(attacker.genome.encode()).hexdigest(),
            "experienced_observations":copy.deepcopy(programs.get(experienced)),
            "pointer_observations":copy.deepcopy(programs.get(pointer)),
            "selection_had_experience":experienced in programs}
        return True


@dataclass(frozen=True)
class Encounter:
    packet:int
    recipient:int
    zone:int
    time:float
    source:int


def create_root(seed):
    w=EncounterWorld(Config(seed=seed,initial_agents=36,max_agents=180,max_genome=1000000),Entropy("seeded",seed))
    w.recovery_floor=8;w.pulse_renewal=.6;w.steering_mode="target";w.feedback_gain=1.8
    w.archive_mode="random";w.forecast_mode="learned";w.vector_mode="intact";w.cargo_policy="experienced"
    w.temporal_hold=3;w.salvage_feedback=True;w.temporal_retention=.85;w.portable_bets=True
    w.advance(until_time=30.0)
    retained=[len(a.genome) for a in w.agents.values()]+[len(g) for a in w.agents.values() for g,_ in a.history]
    retained += [len(c["genome"]) for c in w.archive.values()]
    if not w.agents or max(retained,default=0)>512:raise RuntimeError("warm-up root invalid")
    for ident in sorted(w.agents)[::2]:w.kill(w.agents[ident],"shared_ecological_shock")
    w.cfg.max_genome=512
    return w


def recipients(w,p):
    z=p["zone"]
    return [a for a in w.agents.values() if a.zone==z and a.ident!=p["donor"]
            and p["gate_signature"]==gate(z)%9]


def finish_delivery(w,packet_id,target_id,variant=None,*,trial=False):
    """Complete an already selected vector event using the inherited rules."""
    p=w.packets[packet_id];z=p["zone"]
    if w.pending_trial is not None:
        if w.pending_trial["packet"]!=packet_id or w.pending_trial["recipient"]!=target_id:
            raise ValueError("a different encounter is awaiting delivery")
        w.pending_trial=None
    if variant is not None:
        choice=p["alternatives"][variant]
        p["code"]=choice["code"];p["origins"]=choice["origins"].copy()
    if target_id is not None:
        target=w.agents[target_id];before=target.genome;ip=target.ip
        after=(before[:ip]+p["code"]+before[ip:])[:w.cfg.max_genome]
        if after!=before:
            if trial:
                w.emit("trial_payload",packet=packet_id,donor=p["donor"],target=target_id,
                       zone=z,condition=variant,code=p["code"],ip=ip,origins=p["origins"].copy())
            target.genome=after
            target.origins=(target.origins[:ip]+p["origins"]+target.origins[ip:])[:w.cfg.max_genome]
            w.minds[target.ident]["vector_received"]+=1
            stolen=min(.1,max(0.,target.energy));target.energy-=stolen
            donor=w.agents.get(p["donor"])
            if donor is not None:donor.energy+=stolen
            else:w.resources[0]+=stolen
            w.emit("vector_infection",packet=packet_id,donor=p["donor"],target=target.ident,
                   zone=z,code=p["code"],ip=ip,before=before,after=after,
                   energy_transferred=round(stolen,9))
    p["ttl"]-=1
    if p["ttl"]<=0:
        w.emit("vector_expire",packet=packet_id,zone=z);del w.packets[packet_id]
    else:
        p["zone"]=w.rng.choice(w.graph[z]);w.enqueue(w.now+.6,"vector",packet_id)


def find_encounter(w,used_hosts,used_packets,limit,exclusions):
    """Advance the actual ecology to an eligible, untreated recipient event."""
    if not w.started:raise ValueError("the root must be started")
    while w.queue:
        when,serial,kind,ident,token=heapq.heappop(w.queue)
        if when>limit:
            heapq.heappush(w.queue,(when,serial,kind,ident,token));w.now=max(w.now,limit);return None
        if kind=="agent":
            a=w.agents.get(ident)
            if a is None or a.token!=token:continue
            w.now=when;w.act(a)
        elif kind=="ferment" and ident in w.corpses:w.now=when;w.ferment(ident)
        elif kind=="forecast" and ident in w.forecasts:w.now=when;w.expire_forecast(ident)
        elif kind=="bet_audit" and ident in w.bet_traces:w.now=when;w.finish_bet_trace(ident)
        elif kind=="reactor":w.now=when;w.pulse()
        elif kind=="environment":w.now=when;w.environment_step()
        elif kind=="vector" and ident in w.packets:
            w.now=when;p=w.packets[ident];hosts=recipients(w,p)
            if not hosts:
                finish_delivery(w,ident,None);continue
            target=w.rng.choice(hosts)
            if ident in used_packets:
                exclusions["packet_previously_delivered"]+=1
                finish_delivery(w,ident,target.ident);continue
            used_packets.add(ident)
            if target.ident in used_hosts:
                exclusions["recipient_already_sampled"]+=1
                finish_delivery(w,ident,target.ident);continue
            variants=p.get("alternatives")
            if not variants:
                exclusions["missing_candidates"]+=1
                finish_delivery(w,ident,target.ident);continue
            lengths={len(variants[k]["code"]) for k in ARMS}
            if len(lengths)!=1 or not next(iter(lengths)):
                raise AssertionError("mismatched candidate lengths")
            if any(len(variants[k]["origins"])!=len(variants[k]["code"]) for k in ARMS):
                raise AssertionError("candidate ancestry mismatch")
            if len(target.genome)+next(iter(lengths))>w.cfg.max_genome:
                exclusions["genome_cap_would_truncate"]+=1
                finish_delivery(w,ident,target.ident);continue
            if any((target.genome[:target.ip]+variants[k]["code"]+target.genome[target.ip:])==target.genome for k in ARMS):
                exclusions["unchanged_insertion"]+=1
                finish_delivery(w,ident,target.ident);continue
            found=Encounter(ident,target.ident,p["zone"],when,p["donor"])
            w.pending_trial=asdict(found)
            return found
    return None


class EncounterJournal:
    """Preserve an exact paused encounter and its surrounding ecology."""
    def __init__(self,path):
        from storage import SQLiteJournal
        self.journal=SQLiteJournal(path)
    def save(self,w,**kwargs):return self.journal.save(w,**kwargs)
    def load(self):
        verified=self.journal.load()
        row=self.journal.db.execute("SELECT state FROM checkpoint WHERE singleton=1").fetchone()
        return EncounterWorld.restore(json.loads(row[0]),verified.log)
    def close(self):self.journal.close()


def summarize_host(w,host,log_start,end,initial_code):
    events=w.log[log_start:]
    harvest=[e for e in events if e["event"]=="field_harvest" and e["agent"]==host]
    actions=[e for e in events if e["event"]=="execute" and e["agent"]==host]
    death=next((e for e in events if e["event"]=="death" and e["agent"]==host),None)
    survival=host in w.agents
    first=harvest[0] if harvest else None
    modifications=0;before_first=0;first_seen=False
    for e in events:
        if e["event"]=="field_harvest" and e["agent"]==host:first_seen=True
        changed=((e["event"] in ("infection","vector_infection") and e.get("target")==host) or
                 (e["event"]=="timesplice" and host in (e.get("agent"),e.get("target"))) or
                 (e["event"]=="genome_mutation" and e.get("agent")==host) or
                 (e["event"]=="reinject" and e.get("host")==host) or
                 (e["event"]=="chrono_recall" and e.get("target")==host) or
                 (e["event"]=="replay" and e.get("agent")==host))
        if changed:
            modifications+=1
            if not first_seen:before_first+=1
    return {"nutrient":sum(e["intake"] for e in harvest),"actions":len(actions),
            "survived":survival,"death_time":death["time"] if death else None,
            "death_cause":death["cause"] if death else None,
            "first_digit":first["digit"] if first else None,
            "first_focus":first["focus"] if first else None,
            "first_intake":first["intake"] if first else None,
            "first_digit_matches_payload":int(str(first["digit"])==initial_code[0]) if first else None,
            "genome_changes":modifications,"changes_before_first_action":before_first,
            "end_energy":w.agents[host].energy if survival else None,
            "end_zone":w.agents[host].zone if survival else None,
            "zones_visited":sorted({e["zone"] for e in actions}),
            "environment_future":[e["signals"] for e in events if e["event"]=="environment"],
            "event_sha256":digest(w.log),"state_sha256":digest(w.snapshot()),
            "log_events":len(w.log),"horizon":end}


def balanced_schedule(seed,n):
    rng=random.Random(seed ^ 0x59AB12C3);schedule=[]
    while len(schedule)<n:
        block=list(ARMS);rng.shuffle(block);schedule.extend(block)
    return schedule[:n]


def run_seed(seed,max_encounters=8,follow_time=12.,retain_logs=False):
    w=create_root(seed);root_hash=digest(w.snapshot());seen=set();used_packets=set();exclusions=Counter()
    assign=balanced_schedule(seed,max_encounters);order_rng=random.Random(seed ^ 0xFEE117)
    trials=[];logs={}
    for index in range(max_encounters):
        encounter=find_encounter(w,seen,used_packets,210.0-follow_time,exclusions)
        if encounter is None:break
        seen.add(encounter.recipient)
        packet=w.packets[encounter.packet];alternatives=copy.deepcopy(packet["alternatives"])
        common_hash=digest(w.snapshot());before_agent=w.agents[encounter.recipient]
        before={"agent":encounter.recipient,"zone":encounter.zone,"donor":encounter.source,
                "packet":encounter.packet,"time":encounter.time,"genome":before_agent.genome,
                "ip":before_agent.ip,"energy":before_agent.energy,"age":before_agent.age,
                "digest":common_hash,"alternatives":alternatives,
                "gate_signature":packet["gate_signature"],"target_gate":gate(encounter.zone)%9,
                "packet_ttl":packet["ttl"],"candidate_info":copy.deepcopy(packet["candidate_info"])}
        comparison={};execution_order=list(ARMS);order_rng.shuffle(execution_order)
        future=None
        for arm in execution_order:
            clone=copy.deepcopy(w)
            if digest(clone.snapshot())!=common_hash:raise AssertionError("unequal fork")
            finish_delivery(clone,encounter.packet,encounter.recipient,arm,trial=True)
            start=len(clone.log);clone.advance(until_time=encounter.time+follow_time)
            result=summarize_host(clone,encounter.recipient,start,encounter.time+follow_time,alternatives[arm]["code"])
            if future is None:future=result["environment_future"]
            elif future!=result["environment_future"]:raise AssertionError("environment not paired")
            comparison[arm]=result
            if retain_logs and index==0:logs[arm]=clone.log
        chosen=assign[index]
        finish_delivery(w,encounter.packet,encounter.recipient,chosen,trial=True)
        trials.append({"index":index,"before":before,"continuation_assignment":chosen,
                       "execution_order":execution_order,"outcomes":comparison})
    return {"seed":seed,"root_hash":root_hash,"trials":trials,"exclusions":dict(exclusions),
            "actual_assignments":dict(Counter(t["continuation_assignment"] for t in trials)),"logs":logs}
