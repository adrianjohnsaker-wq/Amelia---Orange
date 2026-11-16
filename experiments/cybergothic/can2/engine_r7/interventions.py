"""Research-only codon edits and body permutation, never an agent instruction."""
import hashlib
import random

from digit_world import parse_genome


def edit_stop(w,ident,stop,replacement,label):
    a=w.agents[ident];before=a.genome
    if before[stop:stop+2]!='09' or replacement not in ('08','00'):
        raise ValueError('invalid focal stop edit')
    a.genome=before[:stop]+replacement+before[stop+2:]
    w.emit('trial_genome_edit',agent=ident,position=stop+1,before=before,after=a.genome,label=label)
    return {'applicable':True,'before':before,'after':a.genome,'position':stop+1}


def scramble_body(w,ident,start,stop,event_key):
    """Use an independent keyed RNG; preserve the focal parsed boundaries."""
    a=w.agents[ident];before=a.genome
    if before[start:start+2]!='60' or before[stop:stop+2]!='09':raise ValueError('invalid intron')
    original=next((s for s in parse_genome(before) if s[0]=='intron' and s[1]==start and s[3]==stop),None)
    if original is None:raise ValueError('focal intron is not recognised')
    source=list(range(start+2,stop))
    seed=int.from_bytes(hashlib.sha256(str(event_key).encode()).digest(),'big')
    rng=random.Random(seed)
    for attempt in range(1,65):
        order=source.copy();rng.shuffle(order)
        indices=list(range(len(before)));indices[start+2:stop]=order
        after=''.join(before[i] for i in indices)
        valid=any(s==original for s in parse_genome(after))
        if after!=before and valid:
            a.genome=after
            w.emit('trial_permute',agent=ident,before=before,after=after,indices=indices,
                   label='scrambled_body',attempt=attempt)
            return {'applicable':True,'attempt':attempt,'before':before,'after':after,'indices':indices}
    return {'applicable':False,'attempts':64,'before':before,'after':before}
