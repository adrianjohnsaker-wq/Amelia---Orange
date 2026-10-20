"""Read-only DRIFT-1A C1 Channel A audit from frozen genesis to source HEAD.
No C1 writes, no ingestion, no beacon network, no PF1 modifications.
"""
import json, hashlib, os, pathlib, collections, sys
from drift1a_c1.engine import Engine,NAMES
from drift1a_c1.beacon import LiveBeacon,Sealer,round_time
from drift1a_c1.common import digest
def main():
    assert os.environ.get('DRIFT_C1_ENABLE_LIVE') != 'true'
    root=pathlib.Path('drift1a_c1/recorded_live')
    before={}
    for f in root.rglob('*'):
        if f.is_file():before[f.relative_to(root).as_posix()]=hashlib.sha256(f.read_bytes()).hexdigest()
    g=json.loads((root/'genesis.json').read_text())
    beacon=LiveBeacon()
    sealer=Sealer()
    e=Engine(root,beacon,sealer)
    continuity={'duplicates':0,'missing':0,'reordered':0,'invalidRound':0}
    prevTick=-1;rounds=set();armRecords=collections.Counter()
    channel_a_state_digests=[]
    for r in e.records():
        t=r['tick']
        if t in rounds:continuity['duplicates']+=1
        rounds.add(t)
        if t<=prevTick:continuity['reordered']+=1
        if t>prevTick+1:continuity['missing']+=t-prevTick-1
        prevTick=t
        if r['beacon']['round'] != g['R0'] + 20*t:continuity['invalidRound']+=1
        if r['round_time'] != round_time(r['beacon']['round']):continuity['invalidRound']+=1
        for k in NAMES:
            if k in r['arms']:armRecords[k]+=1
        # C1's Channel A's actual recorded control arm 'C': we do NOT
        # replace it with a conjectured alternative name.
        if 'C' not in r['arms']:raise AssertionError('C arm missing')
        channel_a_state_digests.append(r['arms']['C']['post_digest'])
    assert sorted(rounds)==list(range(e.tick))
    assert e.tick>0
    assert all(x==e.tick for x in armRecords.values())
    assert all(v==0 for v in continuity.values())
    result=e.replay() # verifies every recorded beacon and complete arm snapshots
    assert result['ticks']==e.tick and result['head']==e.head
    assert result['exact_replay'] is True
    after={}
    for f in root.rglob('*'):
        if f.is_file():after[f.relative_to(root).as_posix()]=hashlib.sha256(f.read_bytes()).hexdigest()
    assert before==after,'READ_ONLY_AUDIT_MUTATED_C1_FROZEN_FILES'
    report={
      'schema':'PF1_DRIFT1A_C1_CHANNEL_A_READ_ONLY_AUDIT_V1',
      'source_repository':'adrianjohnsaker-wq/Amelia-0.4',
      'source_ref':'amelia-1.0',
      'source_commit':os.environ.get('PF1_C1_SOURCE_SHA',''),
      'genesis_R0':g['R0'],
      'genesis_digest':digest(g),
      'chunk_count':e.seq,
      'tick_count':e.tick,
      'last_tick':e.tick-1,
      'first_round':g['R0'],
      'next_round':g['R0']+20*e.tick,
      'last_round':g['R0']+20*(e.tick-1),
      'chain_head_sha256':e.head,
      'channel_A_control_arm':'C',
      'channel_A_records':armRecords['C'],
      'channel_A_last_post_digest':channel_a_state_digests[-1],
      'continuity':continuity,
      'lost_duplicated_or_reordered_any_tick':False,
      'all_arms_replay_exact':result['exact_replay'],
      'replayed_from_genesis':True,
      'genesis_to_head_replay_exact':True,
      'all_recorded_BLS_verified_by_pinned_verifier':True,
      'source_files_sha256_unchanged':before==after,
      'source_file_count':len(before),
      'no_live_rounds_fetched':True,
      'no_new_ticks_admitted':True,
      'no_C1_source_files_modified':True,
      'no_PF1_live_genesis':True,
      'audit_scope':'as-of source checkout; later commits require a new replay'
    }
    out=pathlib.Path(os.environ['PF1_C1_READ_ONLY_OUTPUT'])
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(report,indent=2,sort_keys=True)+'\n')
    print('PF1_C1_CHANNEL_A_REPLAY',json.dumps({k:report[k] for k in ['source_commit','tick_count','chain_head_sha256','continuity','genesis_to_head_replay_exact','source_files_sha256_unchanged']}))
if __name__=='__main__':main()
