"""PF1/C1 OFFLINE compatibility. Synthetic-only: no URL fetch and no genesis.
The actual accepted C1 beacon.py and lease implementations are loaded by PYTHONPATH
from a pinned Amelia-0.4 checkout. No code or constants are copied/rewritten.
"""
import contextlib, hashlib, json, os, pathlib, tempfile, time
from unittest.mock import patch

def main():
    from drift1a_c1.beacon import LiveBeacon, SyntheticBeacon, first_round, round_time, current_round, VerificationError, KAT, QUICKNET
    from drift1a_c1.vendor.beacon_audit import BLS, chain_hash_from_key
    from drift1a_c1.runner import claim, complete
    from drift1a_c1.common import read
    assert os.environ.get("DRIFT_C1_ENABLE_LIVE") != "true", "LIVE_MODE_FORBIDDEN"
    assert os.environ.get("PF1_NO_NETWORK") == "1", "NO_NETWORK_GUARD_REQUIRED"
    root=pathlib.Path(os.environ["PF1_PINNED_C1_DIR"])
    os.chdir(root)
    # Independent absolute source identity fixed by reference commit.
    assert os.popen('git rev-parse HEAD').read().strip() == 'f1875b5eea5339eb1ac73e50b5df6b103d0cabe9'
    with patch("urllib.request.urlopen",side_effect=AssertionError("NETWORK_FORBIDDEN_IN_OFFLINE_KAT")):
        bls=BLS()
        assert chain_hash_from_key() == QUICKNET['chain_hash']
        assert QUICKNET['chain_hash'] == '52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971'
        assert QUICKNET['period'] == 3 and QUICKNET['scheme'] == 'bls-unchained-g1-rfc9380'
        assert bls.verify(KAT['round'],KAT['signature'])
        assert not bls.verify(KAT['round']+1,KAT['signature'])
        wrong_sig=('0' if KAT['signature'][0]!='0' else '1')+KAT['signature'][1:]
        assert not bls.verify(KAT['round'],wrong_sig)
        assert hashlib.sha256(bytes.fromhex(KAT['signature'])).hexdigest() == KAT['randomness']
        verifier=LiveBeacon() # Its constructor verifies pinned BLS known-answer BEFORE network
        fixture={k:KAT[k] for k in ('round','signature','randomness')}
        verifier.verify(fixture,KAT['round'])
        invalids=[
            ({**fixture,'round':fixture['round']+1},fixture['round']),
            ({**fixture,'randomness':'0'*64},fixture['round']),
            ({**fixture,'signature':'0'*96},fixture['round']),
            ({**fixture,'signature':wrong_sig},fixture['round']),
            ({**fixture,'signature':'not-hex'},fixture['round'])
        ]
        for b,r in invalids:
            try:verifier.verify(b,r)
            except VerificationError:pass
            else:raise AssertionError("invalid C1 BLS fixture accepted")
        # C1 genesis guard and exactly 20 verified quicknet rounds per minute:
        # first_round uses 10-minute forward buffer then ceiling to multiple of 20.
        created=1791762550.0 # synthetic frozen time, not current time
        R0=first_round(created)
        assert R0%20==0 and round_time(R0)>=created+600
        assert round_time(R0-20)<created+600
        tick_rounds=[R0+20*t for t in range(73)]
        assert all(b-a==20 for a,b in zip(tick_rounds,tick_rounds[1:]))
        assert all(round_time(b)-round_time(a)==60 for a,b in zip(tick_rounds,tick_rounds[1:]))
        assert all(current_round(round_time(r))==r for r in tick_rounds)
        # The established C1 source does not allow a synthetic receipt to be
        # passed off as live cryptographic verification.
        sim=SyntheticBeacon()
        synthetic=sim.fetch(R0)
        assert synthetic['signature'] is None and synthetic['synthetic'] is True
        try:verifier.verify(synthetic,R0)
        except VerificationError:pass
        else:raise AssertionError("synthetic beacon promoted to live")
        # Durable lease creates one prospective claimant, rejecting overlapping
        # claims until a completion exists. This checks actual C1 leasing semantics
        # with separate on-disk requests, not a GitHub cloud multi-run CAS.
        with tempfile.TemporaryDirectory(prefix='pf1-c1-lease-') as tmp:
            claim(tmp,'777-1')
            try:claim(tmp,'778-1')
            except ValueError:pass
            else:raise AssertionError("parallel lease admitted")
            complete(tmp,'777-1')
            claim(tmp,'778-1')
            assert read(pathlib.Path(tmp)/'leases'/'778-1.json')['workflow_run']=='778-1'
        out={
          'schema':'PF1_C1_PINNED_SOURCE_OFFLINE_COMPAT_V1',
          'C1_repo':'adrianjohnsaker-wq/Amelia-0.4',
          'C1_branch':'amelia-1.0',
          'pinned_commit':'f1875b5eea5339eb1ac73e50b5df6b103d0cabe9',
          'beacon_source':'drift1a_c1/beacon.py',
          'lease_source':'drift1a_c1/runner.py',
          'chain_hash':QUICKNET['chain_hash'],
          'public_key_sha256':hashlib.sha256(bytes.fromhex(QUICKNET['public_key'])).hexdigest(),
          'scheme':QUICKNET['scheme'],
          'known_answer_round':KAT['round'],
          'offline_genuine_BLS_signature_verified':True,
          'bad_round_signature_or_randomness_rejected':len(invalids),
          'synthetic_cannot_be_promoted_to_live':True,
          'R0_from_synthetic_created_time':R0,
          'test_ticks':len(tick_rounds),
          'stride_rounds':20,
          'cadence_seconds':60,
          'C1_round_mapping_code_executed':True,
          'C1_source_lease_blocks_overlap':True,
          'GitHub_remote_concurrency_not_tested_here':True,
          'no_network_requests':True,
          'no_beacon_rounds_admitted_to_Amelia':True,
          'no_live_genesis':True,
          'authorised_PF1_live_start':False
        }
    target=pathlib.Path(os.environ.get('PF1_C1_AUDIT_OUTPUT','/tmp/pf1-c1-offline.json'))
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(json.dumps(out,sort_keys=True,indent=2)+'\n')
    print("PF1_C1_OFFLINE_KAT_AND_CADENCE_PASS",json.dumps(out,sort_keys=True))
if __name__=='__main__':main()
