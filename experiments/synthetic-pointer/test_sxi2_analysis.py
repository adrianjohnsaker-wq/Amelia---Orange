import unittest
from sxi2_analysis import retention, similarity, sign_flip_p, holm

class OutcomeTests(unittest.TestCase):
    def test_retention_detects_planted_changed_pattern(self):
        counts = {'baseline':{'010':249,'101':249}, 'exposure':{'234':498}, 'post':{'234':498}}
        self.assertEqual(retention(counts),1)
        self.assertEqual(retention({k:{'010':498} for k in counts}),0)
    def test_rejects_bad_window(self):
        with self.assertRaises(ValueError): similarity({'010':497},{'010':498})
    def test_exact_test_and_holm(self):
        self.assertEqual(sign_flip_p([0.1]*8,0.05),1/256)
        self.assertEqual(sign_flip_p([-0.1]*8,0.05),1)
        self.assertEqual(holm([.00390625,.00390625]),[.0078125,.0078125])
if __name__ == '__main__': unittest.main()
