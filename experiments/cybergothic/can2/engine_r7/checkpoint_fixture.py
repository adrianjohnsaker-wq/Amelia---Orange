"""Known horizontal carrier and non-descended lookalike for restart testing."""
from classify import classify
from digit_world import parse_genome
from interventions import edit_stop
from legacy_engine import Config,Entropy
from observer import ObservedWorld
from reactor import digest


def build():
    w=ObservedWorld(Config(seed=45671,initial_agents=1,max_agents=80,max_genome=512),
                    Entropy('seeded',45671),populate=False)
    a=w.add_agent(0,'6804',8);b=w.add_agent(0,'6012094',8);c=w.add_agent(0,'601111110',8)
    w.add_agent(0,'6012068094',8)  # independent, pre-existing lookalike
    b.ip=5;assert w.infect(a,b)
    b.ip=7;c.ip=8
    return w


def continue_fixture(w):
    assert w.infect(w.agents[2],w.agents[3]);w.shadow.audit(w)
    return {'state_sha256':digest(w.snapshot()),'event_sha256':digest(w.log),
            'shadow_sha256':digest(w.shadow.export()),'classification':classify(w.shadow,w,w.shadow.grafts[0])}


def build_drift():
    w=ObservedWorld(Config(seed=45671,initial_agents=1,max_agents=80,max_genome=512),
                    Entropy('seeded',45671),populate=False)
    a=w.add_agent(0,'6804',8);b=w.add_agent(0,'4444444446012094',8)
    b.ip=14;assert w.infect(a,b);w.fission(b)
    child=w.agents[max(w.agents)];donor=w.add_agent(0,'0945',8)
    stop=next(s[3] for s in parse_genome(child.genome) if s[0]=='intron')
    edit_stop(w,child.ident,stop,'08','checkpoint_drift');donor.ip=0;child.ip=4
    return w,donor.ident,child.ident


def continue_drift(w,donor,child):
    assert w.infect(w.agents[donor],w.agents[child]);w.shadow.audit(w)
    return {'state_sha256':digest(w.snapshot()),'event_sha256':digest(w.log),
            'shadow_sha256':digest(w.shadow.export()),'classification':classify(w.shadow,w,w.shadow.grafts[0])}
