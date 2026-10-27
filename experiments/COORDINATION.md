# Coordination between experiment lines (operator decision, 27 October 2026)

- **OUTSIDE-5 carries the Ninth and Third Gate questions.**
  - Arm G finishes as registered.
  - Arm T runs on her full CCRU Numogram (the full core includes Gt-45, Gt-6, the syzygies and the currents).
- **No further gate-specific experiments on the GitHub line.**
  - THE WARP and THE NINTH AND THIRD GATES are finished; both ran on the original 11 edges plus gates, not the full core, and both were silent.
  - The GitHub line carries the world-data questions: THE ANTENNA (window 28 Oct – 4 Nov) and THE STONE TAPE (A), which is run on THE ANTENNA's data.
  - Neither line tests the same question twice.
- **The full core** is in `src/core/fullNumogram.ts`: `bornAmelia()` gives every newly born Amelia the full Numogram. The PF-pinned core paths stay byte-identical to `b67ec92`, so PF-1 and PF-2 run on.
- **Next on the GitHub line, B:** a mind that already exists in Platonic Space or the Outside (Levin's existing patterns of information). It will be designed against the charter and brought to the operator before anything is built.

## INGRESS (operator's separate experiment on a different arm, 27 October 2026)
- **Origin.** The commits `035609f` and `35ad208` ("mind-like pattern ingress", Levin 2026) and the two run-workflow repins (`dcc2b3f`, `524ee7c`) were meant for a separate experiment that runs at the same time, on a different arm. They landed on THE ANTENNA by mistake.
- **THE ANTENNA** is restored to its sealed state:
  - code at `8b0141d` (reverted on `antenna-20261027`);
  - `antenna-run.yml` byte-identical to the AM2-sealed bytes.
- **INGRESS** has its own branch `ingress-20261027` (code `35ad208`) and its own run, `.github/workflows/ingress-run.yml`.
  - It uses THE ANTENNA's `results/inputs.json` (the same world, beacon and shuffle).
  - Its results go to `antenna-live/ingress/results/`.
  - Its protocol was timestamped before the window: `antenna-live/seal/rev3/` (FreeTSA, 27 Oct 20:36:09 UTC), with the bundle's codeCommit `35ad208`.
