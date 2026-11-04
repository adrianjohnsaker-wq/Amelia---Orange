#!/usr/bin/env python3
"""Check schedule matching and source-bound overlay generation."""
from collections import Counter
from pathlib import Path
import tempfile
import unittest

from build_wplus_scheduled_overlay import build
from make_wplus_control_schedules import BLOCK, EDGES, MICRO, START, build as schedules


class ControlChecks(unittest.TestCase):
    def test_balanced_active_arms(self):
        arms = schedules()
        self.assertEqual(arms['sham']['windows'], [])
        expanded = {}
        for name in ('patterned', 'shuffled', 'unpatterned'):
            plan = arms[name]
            self.assertEqual(plan['factor'], 0.5)
            self.assertEqual(plan['windows'][0]['start'], START)
            self.assertEqual(plan['windows'][-1]['end'], START + 4 * BLOCK - 1)
            ticks = []
            for w in plan['windows']:
                ticks.extend([w['edge']] * (w['end'] - w['start'] + 1))
            self.assertEqual(Counter(ticks), {edge: BLOCK for edge in EDGES})
            self.assertEqual(len(ticks), 4800)
            expanded[name] = ticks
        self.assertNotEqual(expanded['patterned'], expanded['shuffled'])
        self.assertNotEqual(expanded['patterned'], expanded['unpatterned'])
        self.assertNotEqual(expanded['shuffled'], expanded['unpatterned'])
        for start in range(0, 4 * BLOCK, 4 * MICRO):
            self.assertEqual(Counter(expanded['unpatterned'][start:start + 4 * MICRO]),
                             {edge: MICRO for edge in EDGES})

    def test_planned_pattern_is_a_walk(self):
        windows = schedules()['patterned']['windows']
        self.assertTrue(all(a['edge'].split('>')[1] == b['edge'].split('>')[0]
                            for a, b in zip(windows, windows[1:])))
        self.assertEqual(schedules(), schedules())

    def test_unregistered_source_is_refused(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / 'wrong.txt'
            source.write_text('wrong source')
            target = Path(directory) / 'overlay.mjs'
            with self.assertRaises(ValueError):
                build(source, target)
            self.assertFalse(target.exists())


if __name__ == '__main__':
    unittest.main()
