"""A retained claim can follow a surviving agent between virtual zones."""
import json
from adaptive import AdaptiveAssemblage,AdaptiveJournal

class PortableAssemblage(AdaptiveAssemblage):
    def __init__(self,config,entropy,populate=True):
        super().__init__(config,entropy,populate=populate)
        self.portable_bets=False

    def emit(self,event,**details):
        transfer=0.;levy=0.;donors=[]
        if event=="fate_reveal":
            owner=self.agents.get(details["owner"]);zone=details["zone"];actual=details["actual"]
            eligible=(owner is not None and (owner.zone==zone or getattr(self,"portable_bets",False))
                      and details["chosen"]==actual)
            if eligible and owner.zone!=zone:
                transfer=min(.25,self.field[zone][actual]);self.field[zone][actual]-=transfer
                owner.energy+=transfer;details["reward"]=round(transfer,9)
            details["field_reward"]=details["reward"]
            if eligible:
                for donor in self.occupants(zone,owner.ident):
                    amount=min(.10,max(0.,donor.energy)*.05,1.5-levy)
                    if amount<=0:continue
                    donor.energy-=amount;owner.energy+=amount;levy+=amount
                    donors.append([donor.ident,round(amount,9)])
                    if levy>=1.5:break
            details["predatory_levy"]=round(levy,9)
            details["reward"]=round(details["reward"]+levy,9)
        super().emit(event,**details)
        if transfer:
            super().emit("remote_fate_reward",agent=details["owner"],source_zone=details["zone"],
                         destination_zone=self.agents[details["owner"]].zone,
                         amount=round(transfer,9))
        if levy:
            super().emit("fate_levy",agent=details["owner"],zone=details["zone"],
                         donors=donors,total=round(levy,9))

    def snapshot(self):
        s=super().snapshot();s["portable_bets"]={"enabled":self.portable_bets};return s

    @classmethod
    def restore(cls,state,events):
        w=super().restore(state,events);w.portable_bets=state["portable_bets"]["enabled"];return w

class PortableJournal(AdaptiveJournal):
    def load(self):
        verified=self.journal.load()
        state=json.loads(self.journal.db.execute("SELECT state FROM checkpoint WHERE singleton=1").fetchone()[0])
        return PortableAssemblage.restore(state,verified.log)
