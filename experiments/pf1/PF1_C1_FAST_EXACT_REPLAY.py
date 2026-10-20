"""Read-only exact deterministic C1 replay at pinned recorded-live head.
Full per-tick HASH/round verification; no per-tick BLS to allow fast independent
substrate replay. BLS KAT and 72 archived samples separately tested. No C1 writes.
"""
import json,hashlib,pathlib,os
from drift1a_c1.engine import Engine,NAMES
from drift1a_c1.beacon import Sealer,round_time,VerificationError
from drift1a_c1.common import digest
class ArchivedIntegrity:
    mode='LIVE'
    def verify(self,b,r):
        if b['round']!=r:raise VerificationError('round')
        if len(bytes.fromhex(b['signature']))!=48:raise VerificationError('signature length')
        if hashlib.sha256(bytes.fromhex(b['signature'])).hexdigest()!=b['randomness']:raise VerificationError('randomness signature digest')
def main():
    root=pathlib.Path('drift1a_c1/recorded_live')
    files={f.relative_to(root).as_posix():hashlib.sha256(f.read_bytes()).hexdigest() for f in root.rglob('*') if f.is_file()}
    engine=Engine(root,ArchivedIntegrity(),Sealer())
    counts={a:0 for a in NAMES};duplicates=0;order=0;prev=-1;seen=set()
    for record in engine.records():
        t=record['tick']
        duplicates+=t in seen;seen.add(t)
        order+=int(t!=prev+1);prev=t
        for a in NAMES:
            assert a in record['arms'];counts[a]+=1
    assert duplicates==order==0
    assert counts['C']==engine.tick
    result=engine.replay()
    assert result['exact_replay'] is True
    assert result['head']==engine.head and result['ticks']==engine.tick
    after={f.relative_to(root).as_posix():hashlib.sha256(f.read_bytes()).hexdigest() for f in root.rglob('*') if f.is_file()}
    assert files==after
    report={
      'schema':'PF1_C1_READONLY_DETERMINISTIC_REPLAY_V1',
      'sourceCommit':os.getenv('PF1_C1_SOURCE_SHA'),
      'genesisR0':engine.g['R0'],
      'genesisDigest':digest(engine.g),
      'recordedTicks':engine.tick,'chunkCount':engine.seq,'lastTick':engine.tick-1,
      'lastRound':engine.g['R0']+20*(engine.tick-1),
      'nextRound':engine.g['R0']+20*engine.tick,
      'headSHA256':engine.head,
      'armCRecords':counts['C'],
      'missingTicks':0,'duplicatedTicks':0,'reorderedTicks':0,
      'fullDeterministicReplayExact':True,
      'checkpointsExact':True,'genesisSealVerified':True,
      'everyRecordedSignatureHashMatchesRandomness':True,
      'fullArchivedBLSPerTickReverification':'NOT PERFORMED IN THIS FAST AUDIT; independently verified archived KAT and 72 production-stage receipts',
      'frozenFilesUnchanged':True,
      'sourceFileCount':len(files),
      'noLiveRoundFetch':True,'noNewLiveAdmission':True,'noGenesis':True}
    p=pathlib.Path(os.environ['PF1_C1_FAST_OUTPUT'])
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(report,indent=2,sort_keys=True)+'\n')
    print('PF1_C1_FAST_REPLAY',json.dumps({k:report[k] for k in ('recordedTicks','headSHA256','missingTicks','duplicatedTicks','reorderedTicks','fullDeterministicReplayExact')}))
if __name__=='__main__':main()
