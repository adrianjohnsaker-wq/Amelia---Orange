"""Quick independent C1 chain head / tick gap audit; replay is separate slow job."""
import json,hashlib,os,pathlib
from drift1a_c1.engine import Engine,NAMES
from drift1a_c1.beacon import Sealer,round_time
class OfflineArchive:
    mode='LIVE'
    def verify(self,b,r):
        raise AssertionError('No live or replay verification requested in chain-head-only pass')
def main():
 root=pathlib.Path('drift1a_c1/recorded_live')
 pre={p.relative_to(root).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in root.rglob('*') if p.is_file()}
 e=Engine(root,OfflineArchive(),Sealer())
 ticks=[]
 for row in e.records():
    assert set(row['arms'])==set(NAMES)
    ticks.append(row['tick'])
 assert ticks==list(range(e.tick))
 out={'schema':'PF1_C1_READONLY_HEAD_CONTINUITY_V1',
 'sourceCommit':os.getenv('PF1_C1_SOURCE_SHA'),
 'R0':e.g['R0'],'ticks':e.tick,'chunks':e.seq,
 'headDigest':e.head,'lastTick':e.tick-1,'lastRound':e.g['R0']+20*(e.tick-1),
 'missing':0,'duplicates':0,'reordered':0,
 'fullDeterministicReplay':'PENDING_IN_SEPARATE_REPLAY_AUDITS',
 'noSourceMutations':True,'noBeaconFetch':True,'noGenesis':True}
 post={p.relative_to(root).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in root.rglob('*') if p.is_file()}
 assert pre==post
 p=pathlib.Path(os.environ['PF1_C1_CHAIN_ATTEST'])
 p.parent.mkdir(parents=True,exist_ok=True)
 p.write_text(json.dumps(out,sort_keys=True,indent=2)+'\n')
 print('PF1_C1_CHAIN_HEAD',json.dumps(out))
if __name__=='__main__':main()
