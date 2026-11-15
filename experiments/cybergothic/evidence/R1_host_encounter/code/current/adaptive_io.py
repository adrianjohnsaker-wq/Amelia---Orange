"""Typed optional cloud checkpoints for adaptive temporal traces."""
from urllib.parse import quote
from storage import SupabaseJournal,validate_payload
from adaptive import AdaptiveAssemblage

class AdaptiveCloudJournal:
    def __init__(self,*args,**kwargs):self.journal=SupabaseJournal(*args,**kwargs)
    def save(self,w,revision):return self.journal.save(w,revision)
    def read(self):
        q="?run_id=eq."+quote(self.journal.run_id,safe="")+"&select=revision,payload"
        rows=self.journal.request("GET",q)
        if len(rows)>1:raise ValueError("ambiguous checkpoint")
        if not rows:return None,0
        p=rows[0]["payload"];validate_payload(p)
        return AdaptiveAssemblage.restore(p["state"],p["events"]),rows[0]["revision"]
