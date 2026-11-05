#!/usr/bin/env python3
from collections import Counter
from pathlib import Path
import tempfile
import unittest

from synthetic_pattern_bank import (BLOCKS, LABELS, PROGRAMS, RepairingPattern, generated,
    pointer_address, pointer_layout, source_for_layout, write_bank)


class SyntheticPatternChecks(unittest.TestCase):
    def test_pointer_arrangement_selects_a_distinct_program(self):
        a, b = pointer_layout('A'), pointer_layout('B')
        self.assertEqual(source_for_layout(a), 'A')
        self.assertEqual(source_for_layout(b), 'B')
        self.assertNotEqual(pointer_address(a), pointer_address(b))
        self.assertEqual(sum(c['multiplier'] == 0.5 for c in a['couplings']), 2)
        self.assertEqual(sum(c['multiplier'] == 0.5 for c in b['couplings']), 2)
        with self.assertRaises(ValueError):
            source_for_layout({'couplings': []})

    def test_planted_source_restores_an_altered_program(self):
        pattern = RepairingPattern('A')
        pattern.damage(0, 2)
        pattern.damage(2, 0)
        first, second = pattern.step(), pattern.step()
        self.assertNotEqual(first['ring_after'], list(PROGRAMS['A']))
        self.assertEqual(second['ring_after'], list(PROGRAMS['A']))
        self.assertEqual([first['label'], second['label']], [LABELS[0], LABELS[1]])

    def test_source_and_controls_have_equal_symbol_counts(self):
        a, _ = generated()
        self.assertEqual(a, generated()[0])
        for name in ('source_a', 'source_b', 'shuffled', 'unpatterned'):
            self.assertEqual(len(a[name]), BLOCKS)
            self.assertEqual(Counter(a[name]), {x: 50 for x in LABELS})
        self.assertEqual(a['sham'], [])
        self.assertEqual(len({tuple(a[n]) for n in ('source_a', 'source_b', 'shuffled', 'unpatterned')}), 4)

    def test_write_is_create_only(self):
        with tempfile.TemporaryDirectory() as temp:
            output = Path(temp) / 'bank'
            manifest = write_bank(output)
            self.assertEqual(manifest['plans']['source_a']['total_active_ticks'], 4800)
            with self.assertRaises(FileExistsError):
                write_bank(output)


if __name__ == '__main__':
    unittest.main()
