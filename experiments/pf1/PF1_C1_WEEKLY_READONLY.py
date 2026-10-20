"""PF-1 read-only weekly audit of C1's *current* amelia-1.0 branch.
No manual C1 dispatch, no new beacon requests, no C1 commits.
C1 engine validates the genesis seal, frozen source identities,
chunk hashes, linked heads, and every recorded tick and round index.
This script additionally checks every signed-randomness SHA256 relation;
this is not a new per-tick BLS proof or a live round admission.
"""
import hashlib
import json
import os
import pathlib
import subprocess
from datetime import datetime, timezone
from drift1a_c1.engine import Engine, NAMES
from drift1a_c1.beacon import Sealer, round_time

class ReadOnlyRecord:
    mode = 'LIVE'
    def fetch(self, *args, **kwargs):
        raise RuntimeError("NETWORK_AND_LIVE_ADMISSION_FORBIDDEN")
    def verify(self, *args, **kwargs):
        raise RuntimeError("UNEXPECTED_LIVE_VERIFY_PATH")

def main():
    assert os.environ.get('DRIFT_C1_ENABLE_LIVE') != 'true'
    root = pathlib.Path('drift1a_c1/recorded_live')
    files_before = {p.relative_to(root).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
                    for p in root.rglob('*') if p.is_file()}
    git_commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip()
    engine = Engine(root, ReadOnlyRecord(), Sealer())
    rows = 0
    first_round = None
    last_round = None
    for r in engine.records():
        t = r['tick']
        assert t == rows, f"TICK_GAP_DUPLICATE_OR_REORDER tick={t} expected={rows}"
        expected = engine.g['R0'] + 20*t
        b = r['beacon']
        assert b['round'] == expected, f"ROUND_MISMATCH tick={t}"
        assert r['round_time'] == round_time(expected), f"TIME_GRID_MISMATCH tick={t}"
        assert hashlib.sha256(bytes.fromhex(b['signature'])).hexdigest() == b['randomness'], f"SIGNATURE_HASH_INVALID tick={t}"
        assert all(name in r['arms'] for name in NAMES), f"ARM_MISSING tick={t}"
        if first_round is None:
            first_round = expected
        last_round = expected
        rows += 1
    assert rows == engine.tick
    after = {p.relative_to(root).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
             for p in root.rglob('*') if p.is_file()}
    assert files_before == after, "C1_MUTATED_BY_READ_ONLY_CHECK"
    report = {
        'schema':'PF1_WEEKLY_C1_CONTINUITY_READONLY_V1',
        'sourceRepository':'adrianjohnsaker-wq/Amelia-0.4',
        'sourceBranch':'amelia-1.0',
        'sourceHeadCommit':git_commit,
        'auditedUTC':datetime.now(timezone.utc).isoformat(),
        'genesisR0':engine.g['R0'],
        'tickCount':rows,'lastTick':rows-1,'firstRound':first_round,
        'lastRound':last_round,'nextRound':engine.g['R0']+20*rows,
        'chunkCount':engine.seq,
        'currentChainHeadSHA256':engine.head,
        'missingTicks':0,'duplicateTicks':0,'reorderedTicks':0,
        'chunkAndGenesisChainValidatedByPinnedC1Engine':True,
        'allRecordedSignatureToRandomnessSHA256RelationsValid':True,
        'allSignedRoundsBLSVerified':False,
        'fullDeterministicSubstrateReplay':'NOT_IN_THIS_WEEKLY_LIGHTWEIGHT_AUDIT',
        'C1FrozenFilesUnchanged':True,
        'liveBeaconRoundsFetched':0,
        'C1ManualDispatchPerformed':False,
        'manualDispatchWhileScheduleActiveProhibited':True,
        'PF1GenesisCreated':False,
        'encounterNotificationsGenerated':0
    }
    out = pathlib.Path(os.environ['PF1_C1_WEEKLY_RESULT'])
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report,indent=2,sort_keys=True)+'\n')
    summary = os.environ.get('GITHUB_STEP_SUMMARY')
    if summary:
        with open(summary,'a') as f:
            f.write(
                "## C1 weekly read-only continuity\n\n"
                f"- Source commit: \`{git_commit}\`\n"
                f"- Committed ticks: **{rows}**; chunks: **{engine.seq}**\n"
                "- Missing / duplicate / reordered ticks: **0 / 0 / 0**\n"
                f"- Current chain head: \`{engine.head}\`\n"
                "- No C1 dispatch, writes or live round fetches\n"
                "- Scope: read-only chain continuity and signed-randomness digests; not all-tick BLS verification\n"
            )
    print('PF1_WEEKLY_C1_READONLY',json.dumps({
        'commit':git_commit,'ticks':rows,'headDigest':engine.head,
        'missing':0,'duplicated':0,'reordered':0,'c1Modified':False
    }))
if __name__=='__main__':
    main()
