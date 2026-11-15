import json
import unittest

from digit_world import parse_genome
from shadow_reference import Tape,mint,select_indices,insert,mutate


class ShadowReferenceTests(unittest.TestCase):
    def setUp(self):
        self.host=mint('601209','seed/host-birth','host',0.,'seed')
        self.virus=mint('680','seed/donor-birth','donor',0.,'seed')
        self.graft=insert(self.host,5,self.virus,'seed/infection-1',100)

    def test_hybrid_graft_and_transfer_preserve_edge_identity(self):
        self.assertEqual(self.graft.digits,'601206809')
        span=[s for s in parse_genome(self.graft.digits) if s[0]=='intron'][0]
        stop=span[3];self.assertEqual(self.graft.digits[stop:stop+2],'09')
        self.assertEqual(self.graft.atoms[stop].origin_host,'donor')
        self.assertEqual(self.graft.atoms[stop+1].origin_host,'host')
        junction=self.graft.edges[stop]
        fragment=select_indices(self.graft,[stop,stop+1],'seed/packet')
        recipient=insert(mint('4444','seed/recipient-birth','recipient',0.,'seed'),2,fragment,'seed/infection-2',100)
        self.assertIn(junction,recipient.edges)

    def test_identical_digits_from_independent_origins_are_not_the_same_junction(self):
        control=mint(self.graft.digits,'other/founder','other',0.,'other')
        self.assertEqual(control.digits,self.graft.digits)
        g=[s for s in parse_genome(self.graft.digits) if s[0]=='intron'][0][3]
        self.assertNotEqual(control.edges[g],self.graft.edges[g])

    def test_fission_suffix_preserves_copied_atoms_and_internal_edges(self):
        cut=len(self.graft.atoms)//2
        child=select_indices(self.graft,range(cut,len(self.graft.atoms)),'seed/fission')
        self.assertEqual(child.atoms,self.graft.atoms[cut:])
        self.assertEqual(child.edges,self.graft.edges[cut:])

    def test_mutation_invalidates_adjacent_edges_even_for_same_digit(self):
        i=4;changed=mutate(self.graft,i,self.graft.atoms[i].digit,'seed/mutation','host',3.5)
        self.assertEqual(changed.digits,self.graft.digits)
        self.assertNotEqual(changed.atoms[i].uid,self.graft.atoms[i].uid)
        self.assertEqual(changed.atoms[i].origin_model_time,3.5)
        self.assertNotEqual(changed.edges[i-1],self.graft.edges[i-1])
        self.assertNotEqual(changed.edges[i],self.graft.edges[i])
        self.assertEqual(changed.atoms[:i],self.graft.atoms[:i])

    def test_reordered_and_circular_copies_create_new_join_edges(self):
        n=len(self.graft.atoms)
        packet=select_indices(self.graft,[n-1,0,1],'seed/circular')
        self.assertNotEqual(packet.edges[0].edge_id,self.graft.edges[-1].edge_id)
        self.assertEqual(packet.edges[1],self.graft.edges[0])

    def test_cap_and_reference_snapshot_roundtrip(self):
        clipped=insert(self.host,3,self.virus,'seed/capped-transfer',7)
        self.assertEqual(clipped.digits,('601'+'680'+'209')[:7])
        restored=Tape.from_dict(json.loads(json.dumps(self.graft.to_dict())))
        self.assertEqual(restored,self.graft)
        self.assertEqual(restored.digest(),self.graft.digest())

    def test_empty_insertion_and_separate_reassembly(self):
        empty=select_indices(self.virus,[],'seed/empty')
        self.assertEqual(insert(self.host,3,empty,'seed/noop',100),self.host)
        left=select_indices(self.graft,[7],'seed/left')
        right=select_indices(self.graft,[8],'seed/right')
        first=insert(left,1,right,'seed/reassembly-a',100)
        second=insert(left,1,right,'seed/reassembly-b',100)
        self.assertEqual(first.digits,second.digits)
        self.assertNotEqual(first.edges[0],second.edges[0])
        self.assertNotEqual(first.edges[0],self.graft.edges[7])


if __name__=='__main__':unittest.main()
