#!/usr/bin/env python3
import tempfile
import hashlib
import json
from pathlib import Path
import unittest

from sxi1_analysis import analyse, exact_flip


class Sxi1AnalysisChecks(unittest.TestCase):
    def test_exact_sign_flip_and_ties(self):
        self.assertEqual(exact_flip([1.0] * 8), 1 / 256)
        self.assertEqual(exact_flip([0.0] * 8), 1)
        self.assertEqual(exact_flip([-1.0] * 8), 1)
        with self.assertRaises(ValueError):
            exact_flip([])

    def test_missing_worlds_are_inconclusive(self):
        with tempfile.TemporaryDirectory() as directory:
            result = analyse(Path(directory), {'worlds': list(range(9501, 9509)),
                                               'minimum_recovery_advantage': 0.05})
        self.assertEqual(result['status'], 'inconclusive_missing_worlds')
        self.assertEqual(result['valid_worlds'], 0)
        self.assertEqual(len(result['failures']), 8)
        self.assertEqual(result['tests'], [])

    def test_complete_positive_fixture_and_extract_tampering(self):
        arms = ('source_a', 'source_b', 'shuffled', 'unpatterned', 'sham')
        plans = {arm: hashlib.sha256(arm.encode()).hexdigest() for arm in arms}
        registration = {'worlds': list(range(9501, 9509)), 'minimum_recovery_advantage': 0.05,
            'files': {f'experiments/synthetic-pointer/sxi1/bank/{arm}.json': plans[arm] for arm in arms}}
        desired_recovery = {'source_a': 0.4, 'source_b': 0.2, 'shuffled': 0.1,
                            'unpatterned': 0.1, 'sham': 0.2}
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for world in registration['worlds']:
                for arm in arms:
                    for mode in (('none', 'injured', 'positive') if arm == 'source_a' else ('none', 'injured')):
                        path = root / 'runs' / f'W{world}' / arm / mode
                        path.mkdir(parents=True)
                        s0 = {str(i): 0.0 for i in range(30)}
                        effect = 0.9 if mode == 'positive' else desired_recovery[arm]
                        s_injury = {k: (0.0 if mode == 'none' else 0.1) for k in s0}
                        s_followup = {k: (0.0 if mode == 'none' else 0.1 * (1 - effect)) for k in s0}
                        extract = {'header': {'world': f'S05W{world}', 'lineage': 0, 'season': 0,
                            'overlaySha256': 'fixture', 'runtimeHashes': {}, 'challenge': {'mode': mode},
                            'pointer': {'scheduleSha256': plans[arm], 'schedule': {}}},
                            'reference': s0, 'samples': {'12000': s_injury, '12100': s_followup},
                            'prefix_sha256': 'fixture', 'input_sequence_sha256': 'fixture'}
                        content = json.dumps(extract).encode()
                        (path / 'challenge_extract.json').write_bytes(content)
                        verification = {'status': 'PASS', 'pointerActiveTicks': 0 if arm == 'sham' else 4800,
                            'realisedAbsoluteDelta': 0 if arm == 'sham' else 240,
                            'choicesWithAlternatives': 100, 'plantedRepairEvents': 100 if mode == 'positive' else 0}
                        receipt = {'world': world, 'arm': arm, 'challenge': mode, 'verification': verification,
                            'challenge_extract_sha256': hashlib.sha256(content).hexdigest()}
                        (path / 'run_receipt.json').write_text(json.dumps(receipt))
            result = analyse(root, registration)
            self.assertEqual(result['status'], 'complete')
            self.assertEqual(result['positive_control']['passing_worlds'], 8)
            self.assertTrue(all(t['supported'] and t['p_sign_flip'] == 1 / 256 for t in result['tests']))
            corrupted = root / 'runs/W9501/source_a/injured/challenge_extract.json'
            corrupted.write_text('{}')
            rejected = analyse(root, registration)
            self.assertEqual(rejected['status'], 'inconclusive_missing_worlds')
            self.assertEqual(rejected['valid_worlds'], 7)
            self.assertEqual(rejected['tests'], [])


if __name__ == '__main__':
    unittest.main()
