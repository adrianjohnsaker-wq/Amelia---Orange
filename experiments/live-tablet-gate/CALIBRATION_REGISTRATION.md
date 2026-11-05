# AMELIA-LIVE-TABLET-GATE-2: one-consolidation calibration

**Registered after the first gate diagnostic and before this calibration.** In the first diagnostic all current offers were deferred under the unmodified Governor. This follow-up asks whether one use of Amelia's *existing* consolidation operation can restore admission in a private copy of the same saved tablet checkpoint. It does not change the Governor threshold or delete the memory event ledger, and does not operate the actual tablet.

The starting checkpoint is the same SHA-256 `7b4fd17bebcca8a0acd11c439a737b1b8d78fb07306770cf09282daa3c8f977d`: runtime step 50, field step 49, 50 memory events, disabled source and one pending field observation. Restore the full field, runtime, Governor and pending queue in two copies:

1. **Single consolidation:** invoke the application's existing `triggerConsolidation()` once, followed by one unprepared bare runtime step, matching the sequence in the app's Consolidate button.
2. **No consolidation:** perform the same single unprepared bare runtime step without invoking consolidation.

Then enable the same live synthetic source in each copy and run exactly 40 field steps using the restored Governor advisory and damping as the UI session settings, and the default rhythm harmonizer. The control balances the extra bare step; the consolidation arm additionally changes memory strain, appends a consolidation event and applies the Governor's consolidation routine. No source profiles, gate thresholds, cell arrangements or other controls are changed.

Record the intervention's memory-event prefix, event count, Governor tension, old queued-decision disposition and Numogram zone. For the subsequent source offers record every current and queued disposition, audited tension and first immediate admission. Report counts for both arms and whether each reaches the operational minimum of five immediate source admissions. Preserve all observations and failures. A positive result would show only that one pre-existing operation affected *admission from this one state*; it would not establish an autonomous source or prove how the source affects the field. If admission does not recover, report that without selecting repeated or alternative interventions.

Do not recommend that the user perform a memory intervention until its effects and limitations are reported. Raw checkpoints and traces remain private.
