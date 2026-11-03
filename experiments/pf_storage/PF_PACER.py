"""PF pacer (PF S1 amendment 7): keeps PF-1 and PF-2 admitting without a person watching.

GitHub starts scheduled workflows late or not at all under load, so the live PF runs were stalling for hours. This
pacer is one long-running job that, every few minutes:
  1. does nothing while any PF exclusive-group run is running or waiting;
  2. if a PF lease is open and its run has concluded `failure` (a refused push), dispatches the audited amendment 5
     completion (pf-s1-a5.yml) with that lease, its experiment and committed tick count;
  3. if PF-2 is halted and the halt's only cause is an RFC3161 seal failure, dispatches the audited amendment 4
     reopening (pf-s1-a4.yml) with the halted tick;
  4. otherwise dispatches the next live run (PF-1 / PF-2 alternately, each at most every MIN_GAP minutes). A live run
     admits only rounds that are already due, so a caught-up experiment simply admits nothing.
It never commits or pushes, never changes science, and every recovery it starts is the existing sealed, self-auditing
workflow, which refuses anything outside its exact case. Anything else (another halt cause, a PF-1 halt, a recovery
that failed, more than MAX_RECOVERIES_24H automatic recoveries) stops automation for that case and opens one GitHub
issue so the operator is told by GitHub's normal email. Before the job time limit it dispatches its own successor.

  python PF_PACER.py            (in the workflow; uses gh with GITHUB_TOKEN)
  PF_PACER_DRY=1 python PF_PACER.py   one cycle, no dispatches, no issues (local check)
"""
import datetime as dt, json, os, pathlib, subprocess, sys, tempfile, time

REPO = os.environ.get('GITHUB_REPOSITORY', 'adrianjohnsaker-wq/Amelia---Orange')
DRY = os.environ.get('PF_PACER_DRY') == '1'
GROUP = ['pf1-live-observe-s1.yml', 'pf2-live-observe-s1.yml', 'pf-s1-a4.yml', 'pf-s1-a5.yml', 'pf-s1-a6.yml', 'pf-s1-a7.yml',
         'pf1-c1-weekly-readonly-s1.yml', 'pf1-p1-weekly-readonly-s1.yml', 'pf2-weekly-committed-s1.yml']
LIVE = {'pf1': 'pf1-live-observe-s1.yml', 'pf2': 'pf2-live-observe-s1.yml'}
ACTIVE = ('in_progress', 'queued', 'pending', 'waiting', 'requested')
CYCLE_S, MIN_GAP_MIN, MAX_RECOVERIES_24H, RUN_FOR_S = 240, 12, 4, 5 * 3600 + 15 * 60
UTC = dt.timezone.utc

def log(*a): print(dt.datetime.now(UTC).strftime('%H:%M:%SZ'), *a, flush=True)

def gh(*args, inp=None):
    r = subprocess.run(['gh', *args], input=inp, capture_output=True, text=True)
    if r.returncode: raise RuntimeError('gh ' + ' '.join(args[:3]) + ': ' + r.stderr[-400:])
    return r.stdout

def api(path): return json.loads(gh('api', path))

def runs(wf, **q):
    qs = '&'.join(f'{k}={v}' for k, v in {'per_page': 10, **q}.items())
    return api(f'repos/{REPO}/actions/workflows/{wf}/runs?{qs}')['workflow_runs']

def busy():
    for wf in GROUP:
        for st in ACTIVE:
            try:
                if runs(wf, status=st, per_page=1): return f'{wf} {st}'
            except RuntimeError as e:
                if '404' in str(e): continue
                raise
    return None

def dispatch(wf, **inputs):
    if DRY: log('DRY would dispatch', wf, inputs); return
    args = ['workflow', 'run', wf, '-R', REPO, '--ref', 'main']
    for k, v in inputs.items(): args += ['-f', f'{k}={v}']
    gh(*args); log('dispatched', wf, inputs)

def issue(title, body):
    if DRY: log('DRY would open issue:', title); return
    found = api(f'repos/{REPO}/issues?state=open&per_page=50')
    if any(i['title'] == title for i in found): log('issue already open:', title); return
    gh('api', '-X', 'POST', f'repos/{REPO}/issues', '--input', '-', inp=json.dumps({'title': title, 'body': body + '\n\n(PF pacer, PF S1 amendment 7. Automation for this case is paused until the issue is closed.)'}))
    log('opened issue:', title)

def paused(title):
    return any(i['title'] == title for i in api(f'repos/{REPO}/issues?state=open&per_page=50'))

def recoveries_24h():
    since = dt.datetime.now(UTC) - dt.timedelta(hours=24); n = 0
    for wf in ('pf-s1-a4.yml', 'pf-s1-a5.yml'):
        for r in runs(wf, per_page=20, event='workflow_dispatch'):
            if r['triggering_actor']['login'] == 'github-actions[bot]' and \
               dt.datetime.fromisoformat(r['created_at'].replace('Z', '+00:00')) > since: n += 1
    return n

class Main:
    """Blobless shallow view of main; blobs are fetched only for the few files a check needs."""
    def __init__(self):
        self.d = pathlib.Path(tempfile.mkdtemp(prefix='pfpacer-'))
        url = os.environ.get('PF_PACER_REMOTE') or f'https://x-access-token:{os.environ["GH_TOKEN"]}@github.com/{REPO}.git'
        subprocess.run(['git', 'init', '-q', str(self.d)], check=True)
        subprocess.run(['git', '-C', str(self.d), 'remote', 'add', 'origin', url], check=True)
    def refresh(self):
        subprocess.run(['git', '-C', str(self.d), 'fetch', '-q', '--depth', '1', '--filter=blob:none', 'origin', 'main'], check=True)
    def names(self, path):
        out = subprocess.run(['git', '-C', str(self.d), 'ls-tree', '--name-only', 'FETCH_HEAD', path + '/'], capture_output=True, text=True, check=True).stdout
        return {pathlib.Path(x).name for x in out.split()}
    def state(self, pf):
        sub = f'experiments/{pf}/live/STATE.json.shards'
        subprocess.run(['git', '-C', str(self.d), 'checkout', '-q', 'FETCH_HEAD', '--', sub, 'experiments/pf_storage/PF_SHARD.py'], check=True)
        subprocess.run([sys.executable, 'experiments/pf_storage/PF_SHARD.py', 'join', f'experiments/{pf}/live/STATE.json'], cwd=self.d, check=True, capture_output=True)
        return json.loads((self.d / f'experiments/{pf}/live/STATE.json').read_text())

def last_state_commit(pf):
    c = api(f'repos/{REPO}/commits?sha=main&path=experiments/{pf}/live/STATE.json.shards&per_page=1')
    return c[0]['commit']['message'] if c else ''

def cycle(m, turn):
    b = busy()
    if b: log('busy:', b); return turn
    m.refresh()
    root = 'drift1a_c1/runner_state'
    open_ = sorted(x[:-5] for x in m.names(root + '/leases') - m.names(root + '/completions') if x.endswith('.json'))
    if open_:
        if len(open_) > 1:
            issue('PF pacer: more than one open PF lease', f'Open leases: {open_}. Not touched automatically.'); return turn
        lease = open_[0]; run = api(f'repos/{REPO}/actions/runs/{lease.split("-")[0]}')
        if run['status'] != 'completed': log('lease owner still running', lease); return turn
        pf = next((k for k, wf in LIVE.items() if run['path'].endswith(wf)), None)
        title = f'PF pacer: orphan lease {lease} needs the operator'
        if run['conclusion'] != 'failure' or pf is None:
            issue(title, f'Lease {lease} is open; its run {run["html_url"]} ({run["path"]}) concluded {run["conclusion"]}. Not the refused-push case.'); return turn
        prior = [r for r in runs('pf-s1-a5.yml', per_page=10) if r['created_at'] > run['updated_at']]
        if any(r['conclusion'] == 'failure' for r in prior if r['status'] == 'completed'):
            issue(title, f'An amendment 5 reconciliation for {lease} failed: {[r["html_url"] for r in prior]}.'); return turn
        if paused(title): log('paused by open issue:', title); return turn
        if recoveries_24h() >= MAX_RECOVERIES_24H:
            issue('PF pacer: automatic recovery limit reached', f'{MAX_RECOVERIES_24H} automatic recoveries in 24 h; lease {lease} left for the operator.'); return turn
        ticks = m.state(pf)['admittedTicks']
        log('orphan lease', lease, pf, ticks); dispatch('pf-s1-a5.yml', lease=lease, pf=pf, expect_ticks=str(ticks)); return turn
    for pf in ('pf1', 'pf2'):
        if 'FAIL-CLOSED HALT' not in last_state_commit(pf): continue
        s = m.state(pf)
        if s['status'] != 'halted': continue
        reason = str((s.get('openHalt') or {}).get('reason', ''))
        title = f'PF pacer: {pf.upper()} halted and needs the operator'
        if pf == 'pf2' and 'PF2_LIVE_SEAL.py' in reason and 'RFC3161' in reason:
            if paused(title): log('paused by open issue:', title); continue
            failed = [r for r in runs('pf-s1-a4.yml', per_page=3) if r['status'] == 'completed' and r['conclusion'] == 'failure'
                      and r['created_at'] > (s.get('openHalt') or {}).get('atUTC', '')[:19]]
            if failed:
                issue(title, f'An amendment 4 reopening after the halt at tick {s["admittedTicks"]} failed: {failed[0]["html_url"]}.'); continue
            if recoveries_24h() >= MAX_RECOVERIES_24H:
                issue('PF pacer: automatic recovery limit reached', f'{MAX_RECOVERIES_24H} automatic recoveries in 24 h; PF-2 halted at {s["admittedTicks"]} left for the operator.'); continue
            log('PF-2 RFC3161 halt at', s['admittedTicks']); dispatch('pf-s1-a4.yml', expect_tick=str(s['admittedTicks'])); return turn
        issue(title, f'{pf.upper()} is halted at tick {s["admittedTicks"]}. Reason: {reason[:1500]}');
    order = ['pf1', 'pf2'] if turn == 'pf1' else ['pf2', 'pf1']
    for pf in order:
        if 'FAIL-CLOSED HALT' in last_state_commit(pf): continue
        last = runs(LIVE[pf], per_page=1)
        if last and last[0]['status'] == 'completed':
            age = dt.datetime.now(UTC) - dt.datetime.fromisoformat(last[0]['updated_at'].replace('Z', '+00:00'))
            if age < dt.timedelta(minutes=MIN_GAP_MIN): continue
        dispatch(LIVE[pf]); return 'pf2' if pf == 'pf1' else 'pf1'
    log('nothing to start'); return turn

def main():
    m, t0, turn = Main(), time.time(), 'pf2'
    while True:
        try: turn = cycle(m, turn)
        except Exception as e: log('cycle error (will retry):', repr(e)[:600])
        if DRY: return
        if time.time() - t0 > RUN_FOR_S:
            dispatch('pf-pacer.yml'); log('successor dispatched; exiting'); return
        time.sleep(CYCLE_S)

if __name__ == '__main__': main()
