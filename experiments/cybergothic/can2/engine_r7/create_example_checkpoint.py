"""Create one reproducible development checkpoint; not a cohort seed."""
import json
from pathlib import Path

from classify import classify
from experiment import BranchWorld
from pilot_stop_screen import create_world
from reactor import digest
from shadow_journal import ShadowJournal


def main():
    path=Path('example_paired_checkpoint.sqlite')
    if path.exists():raise SystemExit('refusing to overwrite existing checkpoint')
    w=create_world(45003,BranchWorld);w.advance(until_time=72.);w.shadow.audit(w)
    if not w.shadow.grafts:raise AssertionError('expected development graft')
    g=w.shadow.grafts[0];j=ShadowJournal(path);saved=j.save(w);j.close()
    horizon=g['dispatch'][0]+48.;w.advance(until_time=horizon);w.shadow.audit(w)
    out={'seed':45003,'checkpoint_time':72.,'graft_time':g['dispatch'][0],'resume_until':horizon,
         'checkpoint':saved,'expected_state_sha256':digest(w.snapshot()),
         'expected_event_sha256':digest(w.log),'expected_shadow_sha256':digest(w.shadow.export()),
         'classification':classify(w.shadow,w,g)}
    Path('example_paired_checkpoint_manifest.json').write_text(json.dumps(out,sort_keys=True,indent=2)+'\n')
    print(json.dumps({k:out[k] for k in ('seed','checkpoint_time','graft_time','resume_until')}))


if __name__=='__main__':main()
