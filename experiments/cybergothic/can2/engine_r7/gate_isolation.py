"""Launch a credential-free subprocess with kernel-enforced I/O denial."""
import json
import subprocess
import sys
import tempfile
from pathlib import Path


def main():
    worker=Path(__file__).resolve().with_name('isolation_worker.py')
    with tempfile.TemporaryDirectory(prefix='junction-isolated-') as folder:
        p=subprocess.run([sys.executable,'-S','-B',str(worker),'--output-dir',folder],
                         cwd=folder,env={'PYTHONDONTWRITEBYTECODE':'1'},close_fds=True,
                         check=True,capture_output=True,text=True)
        result=json.loads(p.stdout)
    result['subprocess_environment']='credential-free';result['output_directory']='fresh temporary directory'
    Path('gate_results').mkdir(exist_ok=True)
    Path('gate_results/gate_5_isolation.json').write_text(json.dumps(result,sort_keys=True,indent=2)+'\n')
    print(json.dumps(result,sort_keys=True))


if __name__=='__main__':main()
