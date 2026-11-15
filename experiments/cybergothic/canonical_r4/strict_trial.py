"""Prospective first-contact sampling with early and post-reversal strata."""
import copy
import json
import random
from collections import Counter
from legacy_engine import Config,Entropy,gate
from reactor import digest
from encounter_trial import ARMS,EncounterWorld,balanced_schedule,find_encounter,finish_delivery,recipients,summarize_host

class StrictWorld(EncounterWorld):
    def __init__(self,config,entropy,populate=True):
        super().__init__(config,entropy,populate=populate);self.contacted_packets=set()

    def deliver_vector(self,ident):
        p=self.packets.get(ident)
        if p is None:return
        hosts=recipients(self,p)
        if hosts:
            target=self.rng.choice(hosts)
            # Record every host contact, including a truncated or unchanged insertion.
            self.contacted_packets.add(ident);finish_delivery(self,ident,target.ident)
        else:finish_delivery(self,ident,None)

    def snapshot(self):
        s=super().snapshot();s["strict_contact_history"]=sorted(self.contacted_packets);return s

    @classmethod
    def restore(cls,state,events):
        w=super().restore(state,events);w.contacted_packets=set(state["strict_contact_history"]);return w

class StrictJournal:
    def __init__(self,path):
        from storage import SQLiteJournal
        self.journal=SQLiteJournal(path)
    def save(self,w,**kwargs):return self.journal.save(w,**kwargs)
    def load(self):
        verified=self.journal.load();row=self.journal.db.execute("SELECT state FROM checkpoint WHERE singleton=1").fetchone()
        return StrictWorld.restore(json.loads(row[0]),verified.log)
    def close(self):self.journal.close()

def create_strict_root(seed):
    w=StrictWorld(Config(seed=seed,initial_agents=36,max_agents=180,max_genome=1000000),Entropy("seeded",seed))
    w.recovery_floor=8;w.pulse_renewal=.6;w.steering_mode="target";w.feedback_gain=1.8
    w.archive_mode="random";w.forecast_mode="learned";w.vector_mode="intact";w.cargo_policy="experienced"
    w.temporal_hold=3;w.salvage_feedback=True;w.temporal_retention=.85;w.portable_bets=True
    w.advance(until_time=30.)
    lengths=[len(a.genome) for a in w.agents.values()]+[len(g) for a in w.agents.values() for g,_ in a.history]
    lengths += [len(c["genome"]) for c in w.archive.values()]
    if not w.agents or max(lengths,default=0)>512:raise RuntimeError("invalid root")
    for ident in sorted(w.agents)[::2]:w.kill(w.agents[ident],"shared_ecological_shock")
    w.cfg.max_genome=512;return w

def run_seed(seed,follow_time=12.,retain_logs=False):
    w=create_strict_root(seed);root=digest(w.snapshot());seen=set();excluded=Counter();schedule=balanced_schedule(seed,8)
    order_rng=random.Random(seed ^ 0xFC7111);trials=[];logs={}
    for phase,limit in (("before",90.),("after",198.)):
        if phase=="after":w.advance(until_time=126.)
        for _ in range(4):
            e=find_encounter(w,seen,w.contacted_packets,limit,excluded)
            if e is None:break
            index=len(trials);seen.add(e.recipient);p=w.packets[e.packet];alts=copy.deepcopy(p["alternatives"])
            common=digest(w.snapshot());host=w.agents[e.recipient]
            before={"agent":e.recipient,"zone":e.zone,"donor":e.source,"packet":e.packet,"time":e.time,
                    "genome":host.genome,"ip":host.ip,"energy":host.energy,"age":host.age,"digest":common,
                    "alternatives":alts,"gate_signature":p["gate_signature"],"target_gate":gate(e.zone)%9,
                    "candidate_info":copy.deepcopy(p["candidate_info"])}
            outcomes={};order=list(ARMS);order_rng.shuffle(order);future=None
            for arm in order:
                clone=copy.deepcopy(w);assert digest(clone.snapshot())==common
                finish_delivery(clone,e.packet,e.recipient,arm,trial=True);start=len(clone.log)
                clone.advance(until_time=e.time+follow_time)
                result=summarize_host(clone,e.recipient,start,e.time+follow_time,alts[arm]["code"])
                if future is None:future=result["environment_future"]
                else:assert future==result["environment_future"]
                outcomes[arm]=result
                if retain_logs and phase not in logs:logs[phase]={}
                if retain_logs and len(logs[phase])<3:logs[phase][arm]=clone.log
            chosen=schedule[index];finish_delivery(w,e.packet,e.recipient,chosen,trial=True)
            trials.append({"index":index,"phase":phase,"before":before,"continuation_assignment":chosen,
                           "execution_order":order,"outcomes":outcomes})
    return {"seed":seed,"root_hash":root,"trials":trials,"exclusions":dict(excluded),"logs":logs}
