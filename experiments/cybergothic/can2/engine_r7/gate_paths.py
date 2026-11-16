"""Persist directed real-engine copy, mutation and classifier gate results."""
import io
import json
import unittest
from pathlib import Path


COPY_TESTS=(
 'test_cap_truncates_shadow_in_the_same_place',
 'test_clipped_but_recognised_graft_is_counted_not_selected',
 'test_corpse_archive_fermentation_reinjection_and_reconstitution',
 'test_decoy_and_shrapnel_use_exact_source_slices',
 'test_experienced_vector_uses_actual_first_source_offset',
 'test_fission_suffix_and_two_way_timesplice',
 'test_natural_graft_and_subsequent_direct_junction_transfer',
 'test_replay_and_chrono_recall_restore_history_origins',
 'test_shuffled_archive_reconstitution_keeps_permuted_origins',
 'test_shuffled_vector_preserves_actual_digit_origins',
 'test_vector_packet_keeps_original_source_after_donor_mutates')

MUTATION_TESTS=(
 'test_corpse_archive_fermentation_reinjection_and_reconstitution',
 'test_experimental_edits_have_distinct_variant_edges_and_preserve_zero_mod9',
 'test_founder_death_does_not_delete_graft_or_its_archived_copy',
 'test_mutation_resets_origin_even_when_digit_is_unchanged',
 'test_open_frame_repair_is_traced_as_drift_not_original_junction',
 'test_scramble_moves_origins_together_and_keeps_stop_identity',
 'test_second_graft_can_also_be_a_traced_immediate_shift',
 'test_separate_viral_copies_reassemble_atoms_as_a_new_junction',
 'test_shared_older_origin_does_not_imply_focal_occurrence_descent',
 'test_strict_vertical_and_mixed_horizontal_are_distinct')


def run(names,filename,extra=()):
    loader=unittest.TestLoader();suite=unittest.TestSuite()
    for n in names:suite.addTests(loader.loadTestsFromName('test_observer_paths.ObserverPathTests.'+n))
    for n in extra:suite.addTests(loader.loadTestsFromName('test_nonchimeric.ComparatorTests.'+n))
    stream=io.StringIO();result=unittest.TextTestRunner(stream=stream,verbosity=2).run(suite)
    out={'status':'pass' if result.wasSuccessful() else 'fail','tests_run':result.testsRun,
         'tests':list(names)+list(extra),'output':stream.getvalue()}
    Path('gate_results').mkdir(exist_ok=True)
    Path('gate_results',filename).write_text(json.dumps(out,sort_keys=True,indent=2)+'\n')
    if not result.wasSuccessful():raise SystemExit(stream.getvalue())
    print(json.dumps({'gate':filename,'status':'pass','tests':result.testsRun}))


if __name__=='__main__':
    run(COPY_TESTS,'gate_2_copy.json',('test_real_donor_only_stop_keeps_preexisting_donor_marker',))
    run(MUTATION_TESTS,'gate_3_mutation.json',('test_hybrid_boundary_is_not_donor_only',))
