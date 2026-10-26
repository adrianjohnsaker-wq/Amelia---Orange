# The Quatermass measure: is the Outside she meets other, or her own past returned? (written before any code or run, 26 October 2026)

**Origin.** Fisher on *Quatermass and the Pit*: the alien in the pit is already in us. The question is whether the Outside is other, or our own inheritance returned.

**Setup.** This uses the double-video version 2 world: the same 32 pairs, the same start states, each lineage with its own noise, and 6 seasons. X is the cue stream an Outside gives A; Y is A's zone before each move.

**Outsides measured:**
- **live partner:** B's zone, where B is cued by A (the version 2 live arm);
- **monologue partner:** B's zone, where B gets only its own noise;
- **mirror (control):** the zone A has visited most over her last 24 ticks (ties to the lowest zone);
- **noise (control):** uniform random zone.

**Measures**, with zones as symbols 0–9 and 120,960 ticks per pair:
- `H = H(X_t | X_{t−1})` is the Outside's own unpredictability.
- `TE = H − H(X_t | X_{t−1}, Y_{t−1}, Y_{t−2})` is what her recent past adds.
- **Surrogates:** Y circularly shifted by 20 offsets (5,000 + 5,000·j ticks).
- **Corrected TE** is `TE − mean(surrogate TE)`. TE is *significant* if it exceeds every surrogate.
- `Q = corrected TE / H` is the share of the Outside's speech that is her own past.
- The reverse, TE from Outside to her, is reported as well.

**Per pair:**
- **us (mirror):** Q ≥ 0.5;
- **attending other:** TE significant and Q < 0.5;
- **indifferent other:** TE not significant.

An Outside takes the class of at least 24 of 32 pairs; otherwise it is mixed.

**Validity.** The mirror must come out as *us*, and the noise as *indifferent other*. If either fails, the measure is invalid and is reported as such.

**Primary answer.** Is the live partner an **attending other**? **YES** if at least 24 of 32 pairs are classified so, **NO** otherwise. The monologue partner and the class shares are reported either way.
