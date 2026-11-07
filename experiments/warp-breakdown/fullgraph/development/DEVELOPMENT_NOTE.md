# Development record

The `pilot`, `pilot-v2`, `pilot-v3` and `fixture` directories are preliminary development, not prospective outcome data. The first single-origin probe examined a single common displacement. The multi-origin probe examined eligible neutral zones and showed that some trajectories do not revisit their training gates. The whole-House readout was added after inspecting those probes, and a separate fresh-seed prospective evaluation was then preregistered.

The early pilot-v2 registration recorded the dataset script hash but did not independently pin all imported controller code; the controller was edited during the broader development period. Treat its quantitative summary as exploratory with an incomplete source-version record, not as independently reproducible evidence. The later fixture recorded hashes of the complete runtime support and confirmed replay and independent task/path audit. The formal evaluation separately pinned all protocol and executable source before committing its fresh seed.

`fixture/tampered.json` was deliberately corrupted to verify rejection by the independent audit. `pilot-v3/origin-17` and `pilot-v3/replay-17` reproduced exactly across a governor-telemetry allocation change, before the final readout value logging was added.
