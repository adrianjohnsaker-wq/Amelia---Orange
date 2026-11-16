"""Scheduler-safe replay and researcher-applied, genome-blind branch controls."""
import copy
import heapq

from interventions import edit_stop,scramble_body
from observer import ObservedWorld


ARMS=('natural','ruptured_08','recipient_active','scramble','ruptured_00')


class BranchWorld(ObservedWorld):
    def __init__(self,*args,**kwargs):
        self.control=None;self.pause_serial=None;self.paused=False;self.stop_when_graft=False
        self._current_dispatch=None
        super().__init__(*args,**kwargs)

    def emit(self,event,**details):
        start=len(self.log);super().emit(event,**details)
        c=self.control
        if c is None or c['fired']:return
        index=c['event_seq']-1
        if not start<=index<len(self.log):return
        e=self.log[index]
        if e['event']!=c['event'] or e['target']!=c['target']:
            raise AssertionError('replayed graft differs from screened event')
        if e['before']!=c['before'] or e['after']!=c['after']:
            raise AssertionError('replayed graft genome differs from screened event')
        # The graft itself has already been recorded with the shared namespace;
        # subsequent occurrences are branch-specific and cannot collide.
        if self.shadow is not None:self.shadow.branch=c['arm']
        c['fired']=True
        if c['arm']=='ruptured_08':
            c['result']=edit_stop(self,c['target'],c['stop'],'08','ruptured_08')
        elif c['arm']=='ruptured_00':
            c['result']=edit_stop(self,c['target'],c['stop'],'00','ruptured_00')
        elif c['arm']=='scramble':
            c['result']=scramble_body(self,c['target'],c['start'],c['stop'],c['event_key'])
        elif c['arm']=='recipient_active':
            c['active_recipient']=c['target'];c['result']={'applicable':True}
        elif c['arm']=='natural':c['result']={'applicable':True}
        else:raise ValueError('unknown experiment arm')

    def act(self,agent):
        c=self.control;active=(c is not None and c['fired'] and c['arm']=='recipient_active'
                               and c.get('active_recipient')==agent.ident)
        previous=self.parser_mode
        if active:self.parser_mode='intron_active'
        try:return super().act(agent)
        finally:self.parser_mode=previous

    def advance(self,*,until_time=None,until_actions=None,max_events=1000000):
        # Same scheduler as Assemblage.advance, with a no-mutation pause before
        # a selected queue event and external dispatch metadata for the observer.
        if until_time is None and until_actions is None:raise ValueError('finite horizon required')
        if not self.started:
            self.started=True
            for a in list(self.agents.values()):self.schedule_agent(a)
            self.enqueue(self.now+self.pulse_period,'reactor',0)
            self.enqueue(self.now+self.environment_period,'environment',0)
        processed=0;self.paused=False
        while self.queue:
            if until_actions is not None and self.actions>=until_actions:break
            if self.pause_serial is not None and self.queue[0][1]==self.pause_serial:
                self.paused=True;break
            when,serial,kind,ident,token=heapq.heappop(self.queue)
            if until_time is not None and when>until_time:
                heapq.heappush(self.queue,(when,serial,kind,ident,token));self.now=max(self.now,until_time);break
            processed+=1
            if processed>max_events:raise RuntimeError('event limit exceeded')
            self._current_dispatch=[when,serial,kind,ident,token]
            try:
                if kind=='agent':
                    agent=self.agents.get(ident)
                    if agent is None or agent.token!=token:continue
                    self.now=when;self.act(agent)
                elif kind=='ferment' and ident in self.corpses:self.now=when;self.ferment(ident)
                elif kind=='forecast' and ident in self.forecasts:self.now=when;self.expire_forecast(ident)
                elif kind=='bet_audit' and ident in self.bet_traces:self.now=when;self.finish_bet_trace(ident)
                elif kind=='reactor':self.now=when;self.pulse()
                elif kind=='environment':self.now=when;self.environment_step()
                elif kind=='vector' and ident in self.packets:self.now=when;self.deliver_vector(ident)
            finally:self._current_dispatch=None
            if self.stop_when_graft and self.shadow is not None and self.shadow.grafts:break
            if getattr(self,'stop_when_nonchim',False) and getattr(self,'nonchim_first',None) is not None:break
        return processed

    def snapshot(self):
        s=super().snapshot()
        if self.control is not None:s['experiment_control']=copy.deepcopy(self.control)
        return s

    @classmethod
    def restore_with_shadow(cls,state,events,shadow):
        w=super().restore_with_shadow(state,events,shadow)
        w.control=copy.deepcopy(state.get('experiment_control'))
        return w


def control_for(graft,event,arm):
    if arm not in ARMS:raise ValueError('unknown branch')
    return {'arm':arm,'event_seq':graft['event_seq'],'event':event['event'],
            'target':graft['founder'],'before':event['before'],'after':event['after'],
            'start':graft['graft_start'],'stop':graft['graft_stop'],
            'event_key':f"{graft['graft_edge']}:scramble",'fired':False,'result':None}
