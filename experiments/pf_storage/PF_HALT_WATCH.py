"""PF halt watch (PF S1 amendment 9). One check per run; the workflow runs it on a schedule.

Why: the PF pacer (amendment 7, sealed) finds halts through the last commit touching experiments/<pf>/live/STATE.json.shards.
Amendment 8 replaced that file with STATE.json.pointer.json, so from then on the pacer never saw a halt: it opened no issue
and started no recovery (PF-1 stood halted from 6 to 9 Nov 2026 unnoticed). The pacer is sealed in amendments 7 and 8 and
every live run verifies those hashes, so it is not edited; this watcher does its halt duty instead, on the correct file.

For each of PF-1 and PF-2 whose last state commit is a FAIL-CLOSED HALT and whose state says `halted`:
  - PF-1, cause exactly a GitHub HTTP 5xx on the pf-live-state release upload  -> dispatch pf-s1-a9.yml (amendment 9);
  - PF-2, cause exactly an RFC3161 seal failure in PF2_LIVE_SEAL.py              -> dispatch pf-s1-a4.yml (amendment 4);
  - anything else, a recovery that failed, or more than MAX_RECOVERIES_24H        -> open one GitHub issue (GitHub emails
    the operator) and leave the case alone until the issue is closed.
It never commits, never changes science, and every recovery it starts is a sealed, self-auditing workflow that refuses
anything outside its exact case.      PF_HALT_WATCH_DRY=1 python PF_HALT_WATCH.py   (no dispatches, no issues)
"""
import datetime as dt, json, os, re, subprocess, sys

REPO = os.environ.get('GITHUB_REPOSITORY', 'adrianjohnsaker-wq/Amelia---Orange')
DRY = os.environ.get('PF_HALT_WATCH_DRY') == '1'
MAX_RECOVERIES_24H = 3
ACTIVE = ('in_progress', 'queued', 'pending', 'waiting', 'requested')
PF1_CAUSE = re.compile(r'^A1 batch verification/sealing/commit failure; lease \d+-\d+; PF_STORE_GH_FAILED gh release upload pf-live-state: HTTP 5\d\d \(')
RECOVERY = {'pf1': 'pf-s1-a9.yml', 'pf2': 'pf-s1-a4.yml'}

def log(*a): print(dt.datetime.now(dt.timezone.utc).strftime('%H:%M:%SZ'), *a, flush=True)
def gh(*args, inp=None): return subprocess.run(['gh', *args], input=inp, capture_output=True, text=True, check=True).stdout
def api(path): return json.loads(gh('api', path))
def runs(wf, **q):
    qs = '&'.join(f'{k}={v}' for k, v in q.items())
    return api(f'repos/{REPO}/actions/workflows/{wf}/runs?{qs}').get('workflow_runs', [])

def open_titles(): return {i['title'] for i in api(f'repos/{REPO}/issues?state=open&per_page=100')}
def issue(title, body):
    if title in open_titles(): log('issue already open:', title); return
    if DRY: log('DRY would open issue:', title, body[:300]); return
    gh('api', '-X', 'POST', f'repos/{REPO}/issues', '--input', '-', inp=json.dumps({'title': title, 'body': body + '\n\n(PF halt watch, PF S1 amendment 9. Automation for this case is paused until the issue is closed.)'}))
    log('opened issue:', title)
def dispatch(wf, **inputs):
    if DRY: log('DRY would dispatch', wf, inputs); return
    args = ['workflow', 'run', wf, '--ref', 'main', '-R', REPO]
    for k, v in inputs.items(): args += ['-f', f'{k}={v}']
    gh(*args); log('dispatched', wf, inputs)

def last_state_commit(pf):
    c = api(f'repos/{REPO}/commits?sha=main&path=experiments/{pf}/live/STATE.json.pointer.json&per_page=1')
    return c[0]['commit']['message'] if c else ''
def state(pf):
    f = f'experiments/{pf}/live/STATE.json'
    if os.path.exists(f): os.remove(f)
    subprocess.run([sys.executable, 'experiments/pf_storage/PF_STORE.py', 'join', f], check=True, capture_output=True)
    return json.load(open(f))

def main():
    for pf in ('pf1', 'pf2'):
        msg = last_state_commit(pf)
        if 'FAIL-CLOSED HALT' not in msg: log(pf, 'not halted (last state commit:', msg.splitlines()[0][:90] if msg else '-', ')'); continue
        s = state(pf)
        if s['status'] != 'halted': log(pf, 'state already running'); continue
        h = s.get('openHalt') or {}; reason = str(h.get('reason', '')); since = str(h.get('startedUTC') or h.get('atUTC') or '')[:19]
        title = f'PF halt watch: {pf.upper()} halted and needs the operator'
        known = (pf == 'pf1' and PF1_CAUSE.match(reason)) or (pf == 'pf2' and 'PF2_LIVE_SEAL.py' in reason and 'RFC3161' in reason)
        if not known:
            issue(title, f'{pf.upper()} is halted at tick {s["admittedTicks"]} since {since} UTC. No audited recovery covers this cause.\n\nReason: {reason[:1500]}'); continue
        if title in open_titles(): log('paused by open issue:', title); continue
        wf = RECOVERY[pf]; recent = runs(wf, per_page=20)
        if any(r['status'] in ACTIVE for r in recent): log(pf, 'recovery already running'); continue
        failed = [r for r in recent if r['status'] == 'completed' and r['conclusion'] == 'failure' and r['created_at'][:19] > since]
        if failed:
            issue(title, f'An automatic {wf} recovery of the {pf.upper()} halt at tick {s["admittedTicks"]} failed: {failed[0]["html_url"]}.'); continue
        day = (dt.datetime.now(dt.timezone.utc) - dt.timedelta(hours=24)).strftime('%Y-%m-%dT%H:%M:%S')
        n = sum(1 for w in RECOVERY.values() for r in runs(w, per_page=20, event='workflow_dispatch')
                if r['triggering_actor']['login'] == 'github-actions[bot]' and r['created_at'][:19] > day)
        if n >= MAX_RECOVERIES_24H:
            issue('PF halt watch: automatic recovery limit reached', f'{n} automatic recoveries in 24 h; {pf.upper()} halted at tick {s["admittedTicks"]} is left for the operator.'); continue
        log(pf, 'known halt at tick', s['admittedTicks'], '->', wf); dispatch(wf, expect_tick=str(s['admittedTicks']))

if __name__ == '__main__': main()
