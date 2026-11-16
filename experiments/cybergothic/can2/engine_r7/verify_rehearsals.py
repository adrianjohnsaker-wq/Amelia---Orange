"""Check end-to-end development archives and the portable example checkpoint."""
import gzip
import hashlib
import json
import subprocess
import sys
import tempfile
from pathlib import Path


def sha(path):
    h=hashlib.sha256()
    with open(path,'rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''):h.update(chunk)
    return h.hexdigest()


def main():
    arms={'natural','ruptured_08','recipient_active','scramble','ruptured_00'};checks=[]
    for name,seed,mechanism in (('verified_direct',45003,'infection'),
                                ('verified_vector',42009,'vector_infection')):
        directory=Path('cohort_runs')/name
        manifest=json.loads((directory/'cohort_manifest.json').read_text())
        audit=json.loads((directory/'archive_audit.json').read_text())
        analysis=json.loads((directory/'analysis.json').read_text())
        matching=json.loads((directory/'nonchimeric_matching.json').read_text())
        assert manifest['development'] and manifest['status']=='complete' and manifest['selected_seeds']==[seed]
        assert audit['status']=='pass' and audit['populations']==1 and audit['branches']==5
        assert analysis['status']=='analysed' and analysis['selected_populations']==1
        assert matching['status']=='descriptive_only'
        for filename,expected in manifest['files_sha256'].items():assert sha(directory/filename)==expected
        with gzip.open(directory/f'seed_{seed}.json.gz','rt') as f:row=json.load(f)
        assert row['eligible'] and row['graft']['kind']==mechanism and row['natural_matches_original']
        assert set(row['branches'])==arms
        assert {'socket','connect','open','openat','execve'}.issubset(row['lockdown'])
        checks.append({'seed':seed,'mechanism':mechanism,'arms':sorted(arms),
            'manifest_sha256':sha(directory/'cohort_manifest.json'),
            'archive_audit_sha256':sha(directory/'archive_audit.json'),
            'analysis_sha256':sha(directory/'analysis.json'),
            'matching_sha256':sha(directory/'nonchimeric_matching.json')})
    example=json.loads(Path('example_paired_checkpoint_manifest.json').read_text())
    with tempfile.TemporaryDirectory(prefix='junction-example-') as folder:
        command=[sys.executable,'-B','shadow_cli.py','resume','--db','example_paired_checkpoint.sqlite',
                 '--output',str(Path(folder)/'resumed.sqlite'),'--until',repr(example['resume_until'])]
        result=json.loads(subprocess.run(command,capture_output=True,text=True,check=True).stdout)
    for key in ('state_sha256','event_sha256','shadow_sha256'):
        assert example['expected_'+key]==result[key]
    assert example['classification']==result['first_graft_classification']
    tests=subprocess.run([sys.executable,'-B','-m','unittest','-q','test_observer_paths',
                          'test_nonchimeric','test_analysis'],capture_output=True,text=True,check=True)
    out={'status':'pass','rehearsals':checks,'rehearsal_branches':10,
         'example_checkpoint_sha256':sha(Path('example_paired_checkpoint.sqlite')),
         'example_manifest_sha256':sha(Path('example_paired_checkpoint_manifest.json')),
         'example_fresh_process_resume':'pass','example_exact_horizon':example['resume_until'],
         'directed_tests':'pass','directed_test_output':tests.stderr}
    Path('gate_results/rehearsal_checks.json').write_text(json.dumps(out,sort_keys=True,indent=2)+'\n')
    print(json.dumps({'status':'pass','rehearsal_branches':10,'example_resume':'pass'}))


if __name__=='__main__':main()
