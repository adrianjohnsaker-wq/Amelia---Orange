"""Inspect or resume a digit-only virtual ecology checkpoint."""
import argparse
import json
from pathlib import Path

from digit_world import DigitJournal
from reactor import digest


def main():
    p=argparse.ArgumentParser();sub=p.add_subparsers(dest='command',required=True)
    a=sub.add_parser('status');a.add_argument('--db',type=Path,required=True)
    b=sub.add_parser('resume');b.add_argument('--db',type=Path,required=True)
    b.add_argument('--output',type=Path,required=True);b.add_argument('--until',type=float,required=True)
    args=p.parse_args()
    if not args.db.is_file():raise SystemExit('checkpoint does not exist')
    j=DigitJournal(args.db);w=j.load();j.close()
    if args.command=='resume':
        if args.output.exists():raise SystemExit('refusing to overwrite destination')
        if args.until<w.now:raise SystemExit('cannot resume backwards')
        w.advance(until_time=args.until);args.output.parent.mkdir(parents=True,exist_ok=True)
        j=DigitJournal(args.output);j.save(w);j.close()
    print(json.dumps({'model_time':w.now,'parser_mode':w.parser_mode,'living':len(w.agents),
                      'archive_records':len(w.archive),'events':len(w.log),
                      'state_sha256':digest(w.snapshot()),'event_sha256':digest(w.log)},indent=2,sort_keys=True))


if __name__=='__main__':main()
