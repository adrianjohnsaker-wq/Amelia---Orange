"""Inspect or resume an isolated paired world/provenance checkpoint."""
import argparse
import json
from pathlib import Path

from classify import classify
from experiment import BranchWorld
from reactor import digest
from shadow_journal import ShadowJournal


def main():
    p=argparse.ArgumentParser();sub=p.add_subparsers(dest='command',required=True)
    a=sub.add_parser('status');a.add_argument('--db',type=Path,required=True)
    b=sub.add_parser('resume');b.add_argument('--db',type=Path,required=True)
    b.add_argument('--output',type=Path,required=True);b.add_argument('--until',type=float,required=True)
    args=p.parse_args()
    if not args.db.is_file():raise SystemExit('checkpoint does not exist')
    j=ShadowJournal(args.db);w=j.load(world_cls=BranchWorld);j.close()
    if args.command=='resume':
        if args.output.exists():raise SystemExit('refusing to overwrite destination')
        if args.until<w.now:raise SystemExit('cannot resume backwards')
        w.advance(until_time=args.until);w.shadow.audit(w)
        args.output.parent.mkdir(parents=True,exist_ok=True)
        j=ShadowJournal(args.output);j.save(w);j.close()
    out={'model_time':w.now,'living_hosts':len(w.agents),'events':len(w.log),
         'grafts_observed':len(w.shadow.grafts),'state_sha256':digest(w.snapshot()),
         'event_sha256':digest(w.log),'shadow_sha256':digest(w.shadow.export())}
    if w.shadow.grafts:out['first_graft_classification']=classify(w.shadow,w,w.shadow.grafts[0])
    print(json.dumps(out,sort_keys=True,indent=2))


if __name__=='__main__':main()
