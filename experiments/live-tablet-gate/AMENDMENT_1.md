# Amendment 1: session-recorder comparison

The first registered attempt stopped after the live arm's first 20 exposure steps, before the other arms were run. It wrote the partial trace, the step-20 checkpoint and `FAILURE.json`; these are retained privately. The partial trace's SHA-256 is `6754530c8295f94a9a730b9da685ed0dd039d4c95dd1dc8e16caed62ea4fb591`. All 20 recorded current offers were deferred; this is an observed partial engineering result, not a completed four-condition study.

An independent read of that saved checkpoint found that the field checksum, process-memory head and every source-state value matched. The runner nevertheless compared source-session objects using order-sensitive `JSON.stringify`. The field checkpoint serializer sorts object keys, so equivalent objects had different key orders and failed that check. The actual field, source and memory restoration had not lost state.

Before another execution, the recorder's comparison is corrected to use the substrate's existing canonical JSON encoding. No source, Governor, field, Numogram, timing, exposure, control or outcome rule is changed. `debug_restore.ts` reproduces the diagnosis against the retained checkpoint without advancing it.

The diagnostic may now be run again from the same archived starting checkpoint in a new private output directory. The first 20 live-arm decisions have already been inspected, so the repeated study is not presented as wholly unobserved, an independent replication, or a statistically confirmatory test. The first attempt remains part of the record.
