"""Fresh-process continuation of an atomic model+shadow checkpoint."""
import argparse
import json

from classify import classify
from reactor import digest
from shadow_journal import ShadowJournal


def main():
    p=argparse.ArgumentParser();p.add_argument('--db',required=True);p.add_argument('--until',type=float)
    p.add_argument('--fixture',action='store_true');p.add_argument('--drift-fixture',action='store_true')
    a=p.parse_args();j=ShadowJournal(a.db);w=j.load();j.close()
    if a.fixture:
        from checkpoint_fixture import continue_fixture
        print(json.dumps(continue_fixture(w),sort_keys=True));return
    if a.drift_fixture:
        from checkpoint_fixture import continue_drift
        print(json.dumps(continue_drift(w,4,3),sort_keys=True));return
    if a.until is None:raise SystemExit('--until required outside fixture mode')
    w.advance(until_time=a.until);w.shadow.audit(w)
    g=w.shadow.grafts[0]
    print(json.dumps({'state_sha256':digest(w.snapshot()),'event_sha256':digest(w.log),
                      'shadow_sha256':digest(w.shadow.export()),'classification':classify(w.shadow,w,g)},sort_keys=True))


if __name__=='__main__':main()
