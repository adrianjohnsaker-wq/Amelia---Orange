# Using the experimental ordered-binding pipeline

This is a reusable research module operating on a **copy of the pinned Oracle**. It is not installed in the live Amelia tablet, receiver or world stream. It contains an intentionally engineered two-timescale event encoder, order decoder and House-to-gate relay; it does not claim that the native runtime spontaneously learned the representation.

Run the deterministic demonstration from a checkout/evidence bundle with Node.js 24:

```sh
node warp_access/experiments/warp-breakdown/ordered-binding/demo.mjs \
  oracle_wbd4_data/prospective.json 'S05W17|0' '0,1,2' '0,2,1' 1
```

Arguments are checkpoint, lineage, original sequence, second sequence and shock zone. The sequences must each contain 0, 1 and 2 once and share the same first event; the shock zone is 1, 4 or 8. The example prints the two actual gate-selected answers and transitions. It is a demonstration rather than an evaluation or a guarantee of correct recall; the sealed trial records the observed reliability.

For a programmatic client, import `setup`, `inputEvent`, `shock` and `probe` from `pipeline.mjs`. `setup(prepared, 'warp')` prepares an Oracle copy; call `inputEvent` for each of the three original tokens; call `shock(copy.fullState(), 'warp', zone, sixNoiseValues)`; feed the second three tokens to the returned copy; and call `probe(postState, 'warp', 'old'|'new', leftToken, rightToken)`. The returned object contains the six-value memory read, decoder estimate, actual gate-selected action and four gate transitions. The helper expects a prepared Oracle state in the format used by `dynamic/prepare.mjs`, not an arbitrary live app state.

Matched 2/7 and hosted direct controls use the same API with route `'matched27'` or `'direct_host'`; the latter's probe mode is `'direct'`. `DirectRecurrent` is a standalone six-value reference with the same event recurrence and decoder. The synthetic trial and statistical methodology are defined in `PROTOCOL.md` and `RESULTS.md`.
