"""Package the report, machine-readable summaries, provenance and sealed source."""
import argparse
import hashlib
import json
import zipfile
from pathlib import Path


def sha(path):
    with path.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()


def main():
    p=argparse.ArgumentParser();p.add_argument('--run-dir',type=Path,required=True)
    p.add_argument('--analysis-dir',type=Path,required=True);p.add_argument('--shard-dir',type=Path,required=True)
    p.add_argument('--base-evidence',type=Path,required=True);p.add_argument('--output',type=Path,required=True)
    a=p.parse_args();run=a.run_dir;follow=a.analysis_dir
    m=json.loads((run/'cohort_manifest.json').read_text());audit=json.loads((run/'archive_audit.json').read_text())
    replay=json.loads((follow/'independent_replay.json').read_text());shards=json.loads((a.shard_dir/'SHARD_INDEX.json').read_text())
    n=len(m['selected_seeds'])
    if (audit['status'],audit['branches'],replay['status'],replay['branches'],shards['status'])!=('pass',5*n,'pass',5*n,'pass'):
        raise ValueError('audit or replay incomplete')
    files={'SEALED_OBSERVER_EVIDENCE.zip':a.base_evidence}
    for name in ('cohort_manifest.json','analysis.json','archive_audit.json','nonchimeric_matching.json'):
        files['cohort_runs/confirmatory_20261115/'+name]=run/name
    for name in ('exploratory_analysis.json','horizontal_chains.json','independent_replay.json',
                 'original_archive_audit_failure.json','targeted_order_diagnosis.json','archive_audit_corrected.json','CASE_STUDY_50176.json',
                 'population_summaries.json.gz','REPORT_CHIMERIC_COHORT_2026-11-15.md',
                 'CHIMERIC_COHORT_FIGURE_2026-11-15.png','ANALYSIS_CODE_SHA256.txt'):
        files['analysis/'+name]=follow/name
    for path in sorted(follow.glob('*.py')):files['analysis/'+path.name]=path
    files['SHARD_INDEX.json']=a.shard_dir/'SHARD_INDEX.json'
    missing=[str(p) for p in files.values() if not p.is_file()]
    if missing:raise ValueError('missing bundle files '+str(missing))
    readme=('This bundle contains the sealed observer source/evidence archive, the complete cohort manifest, '
      'audits, summaries, report, figure and scripts. Full original cohort files are supplied separately '
      'in numbered ledger-part ZIP files. Extract SEALED_OBSERVER_EVIDENCE.zip into a working directory; '
      'then extract the metadata in cohort_runs/ and every ledger part into that same directory. '
      'SHARD_INDEX.json identifies each part and its SHA-256. Run '
      '`python -B analysis/corrected_archive_audit.py --lab . --run-dir cohort_runs/confirmatory_20261115 '
      '--output reconstructed_archive_audit.json` to verify the reconstructed archive. The original sealed '
      'archive validator compares host lists in iteration order and flagged ten populations on JSON restoration; '
      'the corrected validator compares host identities while preserving per-host route order. Both audit '
      'records and all observational analysis and figure scripts are under analysis/.\n')
    catalog={name:{'sha256':sha(path),'bytes':path.stat().st_size} for name,path in sorted(files.items())}
    with zipfile.ZipFile(a.output,'x',compression=zipfile.ZIP_DEFLATED,compresslevel=6,allowZip64=True) as z:
        z.writestr('README_RESULTS.txt',readme);z.writestr('BUNDLE_MANIFEST.json',json.dumps(catalog,sort_keys=True,indent=2)+'\n')
        for name,path in sorted(files.items()):z.write(path,name)
    with zipfile.ZipFile(a.output) as z:
        if z.testzip() is not None:raise ValueError('bundle CRC check failed')
    print(json.dumps({'status':'pass','files':len(files)+2,'bytes':a.output.stat().st_size,'sha256':sha(a.output)}))


if __name__=='__main__':main()
