import json
import tempfile
import unittest
from pathlib import Path

from cohort import checked_seal,sha
from cohort_analysis import percentile,ratio_bootstrap,scramble_summary,union_indicator,wilson
from match_nonchimeric import distance


class AnalysisTests(unittest.TestCase):
    def test_paired_sign_and_union(self):
        self.assertEqual(percentile([1,1,0,-1],.975)['estimate'],.25)
        self.assertEqual(union_indicator({'classification':{'categories':{'DRIFT_REPAIR':1}}}),0)
        self.assertEqual(union_indicator({'classification':{'categories':{'TRUE_HORIZ_NONKIN':1}}}),1)

    def test_wilson_and_empty_collision_stratum(self):
        v=wilson(0,10);self.assertEqual(v['estimate'],0);self.assertGreater(v['high'],0)
        self.assertIsNone(ratio_bootstrap([(0,0),(0,0)])['estimate'])
        self.assertEqual(ratio_bootstrap([(1,2),(0,1)])['estimate'],1/3)

    def test_scramble_excludes_unchanged_sham_from_secondary_contrast(self):
        def branch(active,survived,uptake,applicable):
            return {'classification':{'categories':{'TRUE_HORIZ_NONKIN':int(active)}},
                    'founder_survived':survived,'founder_field_uptake':uptake,
                    'control':{'result':{'applicable':applicable}}}
        rows=[{'branches':{'natural':branch(True,True,2.,True),
                           'scramble':branch(False,False,1.,True)}},
              {'branches':{'natural':branch(False,False,1.,True),
                           'scramble':branch(True,True,2.,False)}}]
        result=scramble_summary(rows)
        self.assertEqual((result['applicable_populations'],result['not_applicable']),(1,1))
        self.assertEqual(result['natural_minus_scramble_secondary_union']['estimate'],1)

    def test_matching_distance_uses_only_declared_covariates(self):
        x={'time':10,'intron_length':8,'host_age':5,'host_energy_approx':6.,
           'local_population':3,'zone_resource':4.,'host_genome_length':20,'field':[1.,2.,1.]}
        y={**x,'time':28};self.assertEqual(distance(x,x),0)
        self.assertAlmostEqual(distance(x,y),.1);self.assertEqual(distance(x,y),distance(y,x))

    def test_seal_rejects_source_or_gate_tampering(self):
        with tempfile.TemporaryDirectory(prefix='junction-seal-test-') as folder:
            root=Path(folder);(root/'gate_results').mkdir();(root/'code.py').write_text('x=1\n')
            (root/'gate_results'/'g.json').write_text('{}\n')
            (root/'CHIMERIC_JUNCTION_TRACKING_PROTOCOL_2026-11-15.md').write_text('plan\n')
            (root/'evidence.json').write_text('{}\n')
            seal={'status':'sealed_locally','source_sha256':{'code.py':sha(root/'code.py')},
                  'evidence_sha256':{'evidence.json':sha(root/'evidence.json')},
                  'gate_sha256':{'g.json':sha(root/'gate_results'/'g.json')},
                  'protocol_sha256':sha(root/'CHIMERIC_JUNCTION_TRACKING_PROTOCOL_2026-11-15.md')}
            (root/'FINAL_COHORT_SEAL.json').write_text(json.dumps(seal))
            self.assertEqual(checked_seal(root)['status'],'sealed_locally')
            (root/'code.py').write_text('x=2\n')
            with self.assertRaises(ValueError):checked_seal(root)
            (root/'code.py').write_text('x=1\n');(root/'gate_results'/'g.json').write_text('{"changed":true}\n')
            with self.assertRaises(ValueError):checked_seal(root)
            (root/'gate_results'/'g.json').write_text('{}\n')
            (root/'CHIMERIC_JUNCTION_TRACKING_PROTOCOL_2026-11-15.md').write_text('modified\n')
            with self.assertRaises(ValueError):checked_seal(root)
            (root/'CHIMERIC_JUNCTION_TRACKING_PROTOCOL_2026-11-15.md').write_text('plan\n')
            (root/'evidence.json').write_text('{"changed":true}\n')
            with self.assertRaises(ValueError):checked_seal(root)


if __name__=='__main__':unittest.main()
