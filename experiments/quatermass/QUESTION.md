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

## Version 2, written before its code or run (26 October 2026)

**Why.** Version 1 was invalid: the mirror control read as *attending other* (Q 0.32), not *us*. Its measure conditioned on only her last two zones, while the mirror draws on a summary of her last 24, so most of its dependence on her was invisible.

**Change: the measure only.** The world, dynamics, the 32 pairs, the four Outsides, the class thresholds, the validity controls and the primary question are all unchanged.

**Predictors.** Two online multinomial logistic predictors of the Outside's next cue X_t over zones 0–9. Each is trained with AdaGrad (learning rate 0.1, weights starting at 0) and scored prequentially: it predicts X_t, is charged −log₂ p(X_t) with p floored at 10⁻⁶, then updates. Ticks 1–3 are skipped. Features, all computed from ticks before t:
- **own:** a bias, plus one-hot X_{t−1} and X_{t−2};
- **joint:** the *own* features, plus one-hot Y_{t−1} and Y_{t−2}, plus her visit share of each zone over her last 4, 8 and 24 ticks (10 values each).

**Measures:**
- `L_own` and `L_joint` are mean losses in bits per tick.
- `gain = L_own − L_joint` is what her past adds.
- **Surrogates:** the joint predictor rerun with Y circularly shifted by 5,000 + 5,000·j ticks, for j = 0..19.
- `corrected = gain − mean(surrogate gains)`. The gain is *significant* if it exceeds every surrogate gain.
- `Q = corrected / L_own`.

**Classes, validity and the primary answer are exactly as in version 1:**
- us: Q ≥ 0.5;
- attending other: significant and Q < 0.5;
- indifferent other: not significant.

An Outside takes the class of at least 24 of 32 pairs. The measure is valid only if the mirror reads *us* and the noise reads *indifferent other*. **YES** if, under a valid measure, the live partner is an *attending other*.
