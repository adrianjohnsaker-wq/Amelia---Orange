"""Atomic failure, tamper rejection and fresh-process t0+48 continuation."""
import json
import sqlite3
import subprocess
import sys
import tempfile
from pathlib import Path

from classify import classify
from checkpoint_fixture import build,continue_fixture,build_drift,continue_drift
from observer import ObservedWorld
from pilot_stop_screen import create_world
from reactor import digest
from shadow_journal import ShadowJournal


def snapshot(w):
    return {'state_sha256':digest(w.snapshot()),'event_sha256':digest(w.log),
            'shadow_sha256':digest(w.shadow.export()),'classification':classify(w.shadow,w,w.shadow.grafts[0])}


def main():
    screen=create_world(45003,ObservedWorld);screen.advance(until_time=180)
    assert screen.shadow.grafts;g=screen.shadow.grafts[0];t0=g['time'];del screen
    w=create_world(45003,ObservedWorld);w.advance(until_time=t0+3.)
    assert w.shadow.grafts[0]['graft_edge']==g['graft_edge']
    with tempfile.TemporaryDirectory(prefix='junction-checkpoint-') as folder:
        path=Path(folder)/'paired.sqlite';j=ShadowJournal(path);saved=j.save(w);baseline=snapshot(w)
        w.advance(until_time=t0+4.)
        try:j.save(w,inject_failure=True)
        except RuntimeError:pass
        else:raise AssertionError('injected failure did not fire')
        restored=j.load();assert snapshot(restored)==baseline
        other=Path(folder)/'other.sqlite';j2=ShadowJournal(other);j2.save(w);j2.close()
        bad=Path(folder)/'mismatch.sqlite'
        dest=sqlite3.connect(bad);j.db.backup(dest);dest.close()
        db=sqlite3.connect(bad);otherdb=sqlite3.connect(other)
        other_shadow,other_hash=otherdb.execute('SELECT shadow,shadow_hash FROM checkpoint').fetchone();otherdb.close()
        db.execute('UPDATE checkpoint SET shadow=?,shadow_hash=?',(other_shadow,other_hash));db.commit();db.close()
        broken=ShadowJournal(bad)
        try:broken.load()
        except ValueError:pass
        else:raise AssertionError('mismatched sidecar was accepted')
        finally:broken.close()
        j.close()
        horizon=t0+48.;w.advance(until_time=horizon);continuous=snapshot(w)
        proc=subprocess.run([sys.executable,'checkpoint_worker.py','--db',str(path),'--until',str(horizon)],
                            check=True,capture_output=True,text=True)
        resumed=json.loads(proc.stdout);assert resumed==continuous
        fixture=build();fp=Path(folder)/'fixture.sqlite';fj=ShadowJournal(fp);fj.save(fixture);fj.close()
        fixture_result=continue_fixture(fixture)
        fixture_proc=subprocess.run([sys.executable,'checkpoint_worker.py','--db',str(fp),'--fixture'],
                                    check=True,capture_output=True,text=True)
        assert json.loads(fixture_proc.stdout)==fixture_result
        assert fixture_result['classification']['categories']['TRUE_HORIZ_NONKIN']==1
        assert any(x['relation']=='ZERO_FOCAL' for x in fixture_result['classification']['exact_matches'])
        drift,donor,child=build_drift();assert (donor,child)==(4,3)
        dp=Path(folder)/'drift.sqlite';dj=ShadowJournal(dp);dj.save(drift);dj.close()
        drift_result=continue_drift(drift,donor,child)
        drift_proc=subprocess.run([sys.executable,'checkpoint_worker.py','--db',str(dp),'--drift-fixture'],
                                  check=True,capture_output=True,text=True)
        assert json.loads(drift_proc.stdout)==drift_result
        assert drift_result['classification']['categories']['DRIFT_REPAIR']==1
    out={'status':'pass','seed':45003,'t0':t0,'checkpoint_time':t0+3.,'horizon':horizon,
         'checkpoint':saved,'rollback':'pass','mismatched_sidecar_rejected':True,
         'fresh_process':'pass','directed_horizontal_and_false_match_fixture':'pass','drift_repair_fixture':'pass',
         'continuous_and_resumed':continuous,'directed_fixture':fixture_result,'drift_fixture':drift_result}
    Path('gate_results').mkdir(exist_ok=True)
    Path('gate_results/gate_4_checkpoint.json').write_text(json.dumps(out,sort_keys=True,indent=2)+'\n')
    print(json.dumps({k:out[k] for k in ('status','seed','t0','horizon','rollback','fresh_process')}))


if __name__=='__main__':main()
