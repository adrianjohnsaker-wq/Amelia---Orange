import unittest
from design_feasibility import candidates


def infection(before,ip,payload,after=None):
    return {'event':'infection','before':before,'after':after if after is not None else before[:ip]+payload+before[ip:],
            'target_ip':ip,'payload':payload,'time':1.0,'action':1,'target':2}


class StructuralFeasibilityTests(unittest.TestCase):
    def test_split_stop_hybrid_end(self):
        hits=candidates(infection('601209',5,'680'))
        self.assertEqual(len(hits),1)
        self.assertEqual(hits[0]['form'],'split_existing_stop')
        self.assertEqual(hits[0]['boundary_origins'],['viral','recipient'])

    def test_unclosed_start_closed_at_viral_host_boundary(self):
        hits=candidates(infection('6012459',6,'120'))
        self.assertEqual(len(hits),1)
        self.assertEqual(hits[0]['form'],'close_open_frame')
        self.assertEqual(hits[0]['boundary_origins'],['viral','recipient'])

    def test_nonhybrid_closure_and_clipped_insertion_do_not_qualify(self):
        self.assertEqual(candidates(infection('601245',6,'090')) ,[])
        self.assertEqual(candidates(infection('601209',5,'680',after='6012068')),[])

    def test_too_short_a_recognised_intron_does_not_qualify(self):
        self.assertEqual(candidates(infection('6009',3,'9')),[])


if __name__=='__main__':unittest.main()
