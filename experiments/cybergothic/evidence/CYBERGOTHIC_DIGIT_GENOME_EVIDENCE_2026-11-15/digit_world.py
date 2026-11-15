"""A self-parsing virtual genome: phenotype is determined by digit syntax.

``80`` begins a zone-controlled gene: 80 <zone digit> <body> 09.
``60`` begins a non-coding intron:   60 <body> 09.
The first following 09 closes the region; nested starts are body digits. An
unclosed start is read as ordinary code. No per-digit ancestry tags are used
or stored by this version of the engine.
"""
from __future__ import annotations

import json
from functools import lru_cache

from legacy_engine import Config,Entropy
from portable import PortableAssemblage
from reactor import canonical

GENE_START='80'
INTRON_START='60'
STOP='09'
MODES=('self','intron_active','promoter_open','literal')


@lru_cache(maxsize=20000)
def parse_genome(genome):
    if not genome or not genome.isascii() or not genome.isdigit():
        raise ValueError('a genome must be a nonempty ASCII digit string')
    spans=[];i=0;n=len(genome)
    while i<n-1:
        marker=genome[i:i+2]
        if marker==GENE_START and i+2<n:
            body=i+3;end=genome.find(STOP,body)
            if end>=0:
                spans.append(('gene',i,body,end,end+2,int(genome[i+2])))
                i=end+2;continue
        elif marker==INTRON_START:
            body=i+2;end=genome.find(STOP,body)
            if end>=0:
                spans.append(('intron',i,body,end,end+2,None))
                i=end+2;continue
        i+=1
    return tuple(spans)


def decode(genome,ip,zone,mode):
    if mode not in MODES:raise ValueError('invalid interpreter mode')
    if not 0<=ip<len(genome):raise ValueError('instruction pointer out of bounds')
    if not 0<=zone<=9:raise ValueError('invalid zone')
    if mode=='literal':return {'kind':'ordinary','nop':False}
    for kind,start,body,stop,end,header in parse_genome(genome):
        if start<=ip<end:
            if kind=='intron':
                return {'kind':'intron','nop':mode!='intron_active','start':start,'end':end}
            if not body<=ip<stop:
                return {'kind':'gene_regulatory','nop':True,'start':start,'end':end,'header':header}
            active=(mode=='promoter_open' or zone==header)
            return {'kind':'gene_body','nop':not active,'start':start,'end':end,'header':header}
    return {'kind':'ordinary','nop':False}


class DigitWorld(PortableAssemblage):
    """A local event-driven ALife world with no ancestry labels in its genome."""
    def __init__(self,config,entropy,populate=True):
        self.parser_mode='self'
        self._silent_id=None
        super().__init__(config,entropy,populate=populate)

    def forage(self,agent):
        if agent.ident!=self._silent_id:return super().forage(agent)
        mind=self.minds[agent.ident];before=mind['focus']
        if mind['intent_ttl']>0:
            mind['focus']=mind['intent'];mind['intent_ttl']-=1;agent.energy-=.01
        focus=mind['focus'];intake=min(.12,self.field[agent.zone][focus])
        self.field[agent.zone][focus]-=intake;agent.energy+=intake
        mind['harvest']+=intake;mind['forages']+=1
        mind['channel_harvest'][focus]+=intake;mind['channel_visits'][focus]+=1
        if intake>=.08:mind['last_success']=focus
        self.emit('field_harvest',agent=agent.ident,zone=agent.zone,digit=int(agent.genome[agent.ip]),
                  focus_before=before,focus=focus,intake=round(intake,9),
                  stock_after=round(self.field[agent.zone][focus],9),neutralized=True)

    def execute(self,agent,op,operand):
        if agent.ident!=self._silent_id:return super().execute(agent,op,operand)
        self.emit('digit_nop',agent=agent.ident,zone=agent.zone,ip=agent.ip,
                  suppressed_opcode=op,suppressed_operand=operand)

    def act(self,agent):
        decision=decode(agent.genome,agent.ip,agent.zone,self.parser_mode)
        if decision['kind']!='ordinary':
            self.emit('digit_decode',agent=agent.ident,zone=agent.zone,ip=agent.ip,
                      mode=self.parser_mode,decision=decision)
        if decision['nop']:self._silent_id=agent.ident
        try:return super().act(agent)
        finally:self._silent_id=None

    def snapshot(self):
        if self._silent_id is not None:raise RuntimeError('checkpoint only between actions')
        state=super().snapshot()
        state['digit_genome']={'parser_mode':self.parser_mode,'gene_start':GENE_START,
                               'intron_start':INTRON_START,'stop':STOP,'format':1}
        return json.loads(canonical(state))

    @classmethod
    def restore(cls,state,events):
        d=state['digit_genome']
        if (d['format'],d['gene_start'],d['intron_start'],d['stop'])!=(1,GENE_START,INTRON_START,STOP):
            raise ValueError('unsupported digit grammar')
        w=super().restore(state,events);w.parser_mode=d['parser_mode']
        if w.parser_mode not in MODES:raise ValueError('unsupported parser mode')
        return w


class DigitJournal:
    """Digit-only state and full ledger in the existing atomic SQLite journal."""
    def __init__(self,path):
        from storage import SQLiteJournal
        self.journal=SQLiteJournal(path)
    def save(self,w,**kwargs):return self.journal.save(w,**kwargs)
    def load(self):
        verified=self.journal.load()
        state=json.loads(self.journal.db.execute('SELECT state FROM checkpoint WHERE singleton=1').fetchone()[0])
        return DigitWorld.restore(state,verified.log)
    def close(self):self.journal.close()
