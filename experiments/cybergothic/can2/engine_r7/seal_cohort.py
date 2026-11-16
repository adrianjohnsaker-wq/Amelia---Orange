"""Create a local prospective seal only after all recorded gates pass."""
import datetime
import json
from pathlib import Path

from cohort import sha


GATES=('gate_1_invariance.json','gate_2_copy.json','gate_3_mutation.json',
       'gate_4_checkpoint.json','gate_5_isolation.json','development_pilot.json',
       'rehearsal_checks.json')


def need(condition,message):
    if not condition:raise RuntimeError(message)


def main():
    root=Path(__file__).resolve().parent;output=root/'FINAL_COHORT_SEAL.json'
    need(not output.exists(),'seal exists; refuse to overwrite')
    records={name:json.loads((root/'gate_results'/name).read_text()) for name in GATES}
    need(all(x['status']=='pass' for x in records.values()),'a verification record failed')
    g=records['gate_1_invariance.json']
    need(g['populations']==20 and g['seed_range']==[45001,45020] and g['checkpoint_count']==120,
         'twenty-seed non-interference incomplete')
    need(len(g['observer_results'])==20 and len(g['tracer_controls'])==5,'invariance controls incomplete')
    need(records['gate_2_copy.json']['tests_run']>=12,'copy tests incomplete')
    need(records['gate_3_mutation.json']['tests_run']>=10,'mutation tests incomplete')
    g=records['gate_4_checkpoint.json']
    for field in ('fresh_process','rollback','directed_horizontal_and_false_match_fixture','drift_repair_fixture'):
        need(g[field]=='pass',f'checkpoint test failed: {field}')
    need(g['mismatched_sidecar_rejected'],'mismatched checkpoint was accepted')
    g=records['gate_5_isolation.json']
    need(g['subprocess_environment']=='credential-free' and g['supabase_or_amelia_environment_keys']==0,
         'isolation environment not clear')
    need(g['primary_and_shadow_sqlite']=='pass' and g['socket_probe']=='EPERM' and
         g['direct_libc_file_probe']=='EPERM' and g['outside_python_file_probe']=='blocked',
         'isolation probes incomplete')
    need({'socket','connect','open','openat','execve'}.issubset(g['syscalls_blocked']),
         'missing kernel restriction')
    pilot=records['development_pilot.json']
    need(pilot['populations']==40 and pilot['seed_range']==[45101,45140] and
         len(pilot['rows'])==40 and pilot['eligible_populations']>0,'development screen incomplete')
    r=records['rehearsal_checks.json']
    need(r['rehearsal_branches']==10 and r['example_fresh_process_resume']=='pass' and
         r['directed_tests']=='pass','development rehearsal incomplete')
    need({x['mechanism'] for x in r['rehearsals']}=={'infection','vector_infection'},
         'direct/vector rehearsal coverage incomplete')
    for x in r['rehearsals']:
        dirname='verified_direct' if x['mechanism']=='infection' else 'verified_vector'
        folder=root/'cohort_runs'/dirname
        for field,name in (('manifest_sha256','cohort_manifest.json'),('archive_audit_sha256','archive_audit.json'),
                           ('analysis_sha256','analysis.json'),('matching_sha256','nonchimeric_matching.json')):
            need(sha(folder/name)==x[field],f'rehearsal evidence changed: {dirname}/{name}')
    need(sha(root/'example_paired_checkpoint.sqlite')==r['example_checkpoint_sha256'],
         'example checkpoint changed')
    need(sha(root/'example_paired_checkpoint_manifest.json')==r['example_manifest_sha256'],
         'example checkpoint manifest changed')
    source=sorted([p.name for p in root.glob('*.py')]+['README_OBSERVER.md','COHORT_SEAL_ADDENDUM_2026-11-15.md'])
    evidence=['example_paired_checkpoint.sqlite','example_paired_checkpoint_manifest.json']
    for folder in ('verified_direct','verified_vector'):
        evidence.extend(str(p.relative_to(root)) for p in sorted((root/'cohort_runs'/folder).iterdir()) if p.is_file())
    seal={'status':'sealed_locally','sealed_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'independent_public_registration':False,'confirmatory_cohort_executed':False,
          'screening_first_seed':50001,'screening_last_seed':50600,'target_qualifying_populations':250,
          'maximum_screened_populations':600,'screening_deadline_model_time':180,
          'followup_model_time':48,'number_of_arms':5,
          'protocol_sha256':sha(root/'CHIMERIC_JUNCTION_TRACKING_PROTOCOL_2026-11-15.md'),
          'source_sha256':{name:sha(root/name) for name in source},
          'gate_sha256':{name:sha(root/'gate_results'/name) for name in GATES},
          'evidence_sha256':{name:sha(root/name) for name in evidence},
          'scope':'Local hash seal; development checks are not cohort results or independent registration.'}
    with output.open('x') as f:f.write(json.dumps(seal,sort_keys=True,indent=2)+'\n')
    print(json.dumps({'status':seal['status'],'seed_range':[50001,50600],
                      'target':250,'seal_sha256':sha(output)}))


if __name__=='__main__':main()
