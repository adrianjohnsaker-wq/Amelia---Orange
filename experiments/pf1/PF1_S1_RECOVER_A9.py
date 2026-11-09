"""PF S1 amendment 9: explicit, narrow administrative reopening of a fail-closed PF-1 halt whose ONLY cause is a GitHub
server error (HTTP 5xx) returned while uploading a state asset to the `pf-live-state` release (PF_STORE_GH_FAILED during
an A1 catch-up batch).

First use: the 6 Nov 2026 23:45 UTC halt at tick 24511 (lease 42313639382-1, halt commit 543c0112). The same audited
path may be used again, by an operator- or watcher-dispatched run of .github/workflows/pf-s1-a9.yml, for a later halt
with exactly this cause. Modelled on PF2_S1_RECOVER_A4.py (amendment 4) without changing it.

No input, lineage state, chain, ledger, journal, seal or genesis is changed; the halted prefix (admittedTicks,
headDigest = the last durably committed ledger row) is kept exactly. Rounds published while halted are admitted
afterwards by the unchanged A1 catch-up from the next unadmitted round. No notifications. This is NOT a new R0.
"""
import os, re, json, pathlib, hashlib, datetime
ROOT = pathlib.Path('experiments/pf1/live')
GENESIS_DIGEST = 'c527bea9f5f417412914a5a00fbccd4ecf1a822cbc6e2fef57127ce8454165e6'
CAUSE = re.compile(r'^A1 batch verification/sealing/commit failure; lease \d+-\d+; PF_STORE_GH_FAILED gh release upload pf-live-state: HTTP 5\d\d \(')
def sha(b): return hashlib.sha256(b).hexdigest()
def main():
    assert os.environ.get('PF1_S1_A9_OPERATOR_CONTINUE') == 'true'
    assert os.environ.get('PF1_S1_A9_SEAL_VERIFIED') == 'true'
    assert os.environ.get('DRIFT_C1_ENABLE_LIVE') == 'false'
    expect = os.environ.get('PF1_S1_A9_EXPECT_TICK')
    gen = json.loads((ROOT / 'GENESIS.json').read_text())
    raw = (ROOT / 'STATE.json').read_bytes(); state = json.loads(raw)
    ledger = json.loads((ROOT / 'SILENT_LEDGER.json').read_text())
    assert gen['schema'] == 'PF1_LIVE_GENESIS_V1' and gen['genesisDigest'] == GENESIS_DIGEST
    assert state['schema'] == 'PF1_LIVE_RUNTIME_STATUS_V1' and state['genesisDigest'] == GENESIS_DIGEST
    assert state['status'] == 'halted', 'NOT_HALTED'
    h = state['openHalt']; reason = str(h.get('reason', ''))
    assert CAUSE.match(reason), 'NOT_THE_RELEASE_UPLOAD_5XX_HALT'
    ticks = state['admittedTicks']
    if expect is not None: assert ticks == int(expect), ('UNEXPECTED_TICK', ticks, expect)
    assert ticks == len(ledger['rows'])
    assert state['lastAdmittedRound'] == gen['R0'] + 20 * (ticks - 1)
    assert state['headDigest'] == ledger['rows'][-1]['digest']
    assert not (ROOT / 'PENDING_JOURNAL.json').exists(), 'UNSEALED_JOURNAL_PENDING'
    repo = pathlib.Path('drift1a_c1/runner_state')
    leases = {p.name for p in (repo / 'leases').glob('*.json')}; completions = {p.name for p in (repo / 'completions').glob('*.json')}
    assert leases - completions == set(), 'ANOTHER_RECORDER_OWNS_A_LEASE'
    receipt = ROOT / f'RECOVERY_S1_A9_{ticks}.json'
    assert not receipt.exists(), 'RECOVERY_ALREADY_CONSUMED'
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    note = {'schema': 'PF1_S1_A9_HALT_RECOVERY_V1',
            'rootCause': 'GITHUB_HTTP_5XX_ON_PF_LIVE_STATE_RELEASE_UPLOAD_DURING_A1_BATCH',
            'atUTC': now, 'priorStateSHA256': sha(raw), 'originalHalt': h,
            'oldHead': state['headDigest'], 'newHead': state['headDigest'], 'oldTicks': ticks, 'newTicks': ticks,
            'scienceModified': False, 'genesisModified': False, 'ledgerModified': False, 'journalModified': False,
            'C1Modified': False, 'PF2Modified': False, 'notificationsSent': 0,
            'signedOperationalAmendment': 'experiments/pf_storage/seal_a9/receipt.json',
            'priorRecovery': state.get('recoveredFromHalt'),
            'gapNote': 'rounds published while halted are admitted by the unchanged A1 catch-up from the next unadmitted round; nothing is back-filled by hand'}
    with receipt.open('x') as f: f.write(json.dumps(note, sort_keys=True, indent=2) + '\n')
    state['status'] = 'running'; state['openHalt'] = None
    state['recoveredFromHalt'] = {'receiptPath': str(receipt), 'recoveryAtUTC': now, 'noObservationsAdded': True}
    out = ROOT / '.S1_A9_REOPEN_NEXT.tmp'; assert not out.exists()
    out.write_text(json.dumps(state, sort_keys=True, indent=2) + '\n'); out.replace(ROOT / 'STATE.json')
    s2 = json.loads((ROOT / 'STATE.json').read_text())
    assert s2['headDigest'] == state['headDigest'] and s2['admittedTicks'] == ticks and s2['status'] == 'running'
    print('PF1_S1_A9_RECOVERY_PASS_PREFIX_KEPT', json.dumps({'ticks': ticks, 'head': s2['headDigest'], 'receipt': str(receipt), 'noNotifications': True}))
if __name__ == '__main__': main()
