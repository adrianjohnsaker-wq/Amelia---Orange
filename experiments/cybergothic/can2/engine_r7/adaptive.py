"""A temporal trace that can gradually release older observations."""
import json
from assemblage import Assemblage,AssemblageJournal

class AdaptiveAssemblage(Assemblage):
    def __init__(self,config,entropy,populate=True):
        super().__init__(config,entropy,populate=populate)
        self.temporal_retention=1.0

    def environment_step(self):
        r=self.temporal_retention
        if not 0 < r <= 1:raise ValueError("retention must be in (0,1]")
        if r<1:
            for zone in self.transitions_learned:
                for row in zone:
                    for i in range(3):row[i]*=r
        return super().environment_step()

    def snapshot(self):
        s=super().snapshot();s["adaptive_temporal"]={"retention":self.temporal_retention};return s

    @classmethod
    def restore(cls,state,events):
        w=super().restore(state,events);w.temporal_retention=state["adaptive_temporal"]["retention"];return w

class AdaptiveJournal(AssemblageJournal):
    def load(self):
        verified=self.journal.load()
        state=json.loads(self.journal.db.execute("SELECT state FROM checkpoint WHERE singleton=1").fetchone()[0])
        return AdaptiveAssemblage.restore(state,verified.log)
