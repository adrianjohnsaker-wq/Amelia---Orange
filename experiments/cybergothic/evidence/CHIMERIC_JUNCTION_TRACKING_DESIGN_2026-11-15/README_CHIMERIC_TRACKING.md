# Chimeric-junction tracking: design package

Read `CHIMERIC_JUNCTION_TRACKING_PROTOCOL_2026-11-15.md` first. This is a protocol draft with a retrospective feasibility screen and an isolated reference for digit-origin and adjacency-copy semantics. It is **not** an integrated provenance observer or a completed prospective experiment.

The package includes a separate copy of the existing digit-only prototype solely to rerun the historical feasibility screen. It has no configured connection to Amelia Orange or Supabase.

## Run the design-level tests

```sh
python -m unittest -v test_shadow_reference test_design_feasibility
```

The seven shadow-reference tests use synthetic tapes to check inheritance and identity; the four structural-screen tests use synthetic insertion events. They do not replace the protocol's 20-seed instrumented/uninstrumented comparison, integrated genetic-path audit, SQLite round trip or network isolation checks.

## Reproduce historical feasibility

```sh
python design_feasibility.py
```

This regenerates seeds 42001–42120, 43001–43120 and 44001–44300, all from the already-inspected viral-stop studies, and overwrites `historical_feasibility_540.json` with the descriptive structural screen. It does not measure descendant identity or outcomes after grafting. Any new screening, pilot or prospective cohort must use the distinct seed ranges specified in the draft protocol.

The draft's baseline/reference file hashes can be checked with:

```sh
sed -n '/^```$/,/^```$/p' CHIMERIC_JUNCTION_TRACKING_PROTOCOL_2026-11-15.md | sed '1d;$d' | sha256sum -c
```

Before registering the final cohort, implement the observer, pass all five pre-run gates in the protocol, run the development pilot and seal the final implementation and analysis hashes.
