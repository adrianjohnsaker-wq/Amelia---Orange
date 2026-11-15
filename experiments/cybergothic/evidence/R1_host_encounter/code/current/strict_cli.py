"""Inspect or branch an exact saved, isolated host encounter."""
import argparse
import json
from pathlib import Path
from encounter_trial import ARMS,finish_delivery
from strict_trial import StrictJournal
from reactor import digest

def status(w):
    p=w.pending_trial
    result={"model_time":w.now,"living":len(w.agents),"archive_records":len(w.archive),
            "pending_encounter":p,"tracked_packet_contacts":len(w.contacted_packets),"events":len(w.log),"state_sha256":digest(w.snapshot())}
    if p is not None:
        packet=w.packets[p["packet"]];host=w.agents[p["recipient"]]
        result["candidate_fragments"]={k:packet["alternatives"][k]["code"] for k in ARMS}
        result["host_ip"]=host.ip;result["host_energy"]=host.energy
    return result

def main():
    p=argparse.ArgumentParser(description=__doc__);s=p.add_subparsers(dest="command",required=True)
    show=s.add_parser("status");show.add_argument("--db",type=Path,required=True)
    go=s.add_parser("branch");go.add_argument("--db",type=Path,required=True);go.add_argument("--output",type=Path,required=True)
    go.add_argument("--condition",choices=ARMS,required=True);go.add_argument("--duration",type=float,default=12.)
    a=p.parse_args()
    if not a.db.is_file():raise SystemExit("No saved encounter at that path")
    j=StrictJournal(a.db);w=j.load();j.close()
    if a.command=="branch":
        if a.output.exists():raise SystemExit("Refusing to overwrite the destination checkpoint")
        if w.pending_trial is None:raise SystemExit("The checkpoint has no paused encounter")
        if not 0<a.duration<=10000:raise SystemExit("Duration must be in (0,10000]")
        pending=w.pending_trial.copy();finish_delivery(w,pending["packet"],pending["recipient"],a.condition,trial=True)
        w.advance(until_time=pending["time"]+a.duration)
        a.output.parent.mkdir(parents=True,exist_ok=True);j=StrictJournal(a.output);j.save(w);j.close()
    print(json.dumps(status(w),indent=2,sort_keys=True))

if __name__=="__main__":main()
