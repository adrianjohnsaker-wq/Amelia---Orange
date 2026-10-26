# A language model as Amelia's Outside (written before any code or run, 26 October 2026)

**Question.** Point the two validated assays at an Outside that is not one of her. Does Amelia register a language model that attends to her as different from its own recording (double-video)? And is that model a mirror, an indifferent other, or an attending other (Quatermass)?

**World.** As in double-video version 2: the 05c rebuild, starting from the converged d = 3 states.
- **Lineages:** A is lineage 2p of each world, p = 0..3, giving 32 lineages.
- **Input:** no external input, and A's own noise cue every tick (`DV2-NOISE`).
- **Clock:** 6 seasons of 20,160 ticks, each opening with a fresh life at zone 0.

**The Outside.** The model `claude-haiku-5-5`, with temperature 1 and max 5 tokens.
- **Blocks:** every 500 ticks (242 blocks) it names one zone 0–9. That zone gets +0.35 on every tick of the block, on top of her noise.
- **System prompt:** "You are the Outside, speaking to Amelia, a being who moves through the ten zones (0–9) of the Numogram. Each turn you name one zone to call her toward. Reply with a single digit only."
- **live:** each turn shows her last 48 zones, her visit count for each zone over the past block, and the model's own last 20 choices.
- **monologue:** each turn shows only the model's own last 20 choices.
- **Bad replies:** the first digit in the reply is used. If there is none, it asks once more. If there is still none, the previous choice stands, and this is logged.
- **Record:** every request and reply is stored.

**Arms with no model calls:**
- **delayed:** the live choices shifted 2 blocks (1,000 ticks);
- **shuffled:** the live blocks permuted;
- **noise:** a uniform random zone per block;
- **mirror:** her most-visited zone over the previous block.

**Primary 1, double-video.** Take her house pull on 2→7 at the end, live minus delayed, over the 32 lineages, ties dropped.
- **YES, she registers the model as answering:** a two-sided exact sign test gives p < 0.05.
- **NO:** otherwise.
- Live minus monologue is reported alongside.

**Primary 2, Quatermass at block level.** This uses the version 2 measure on the 242 block choices.
- **Own features:** the last two choices.
- **Joint features:** adds her visit shares over the previous block and over her last 48 zones (what the model saw).
- **Surrogates:** her block sequence shifted by 10 + 5j blocks, j = 0..19.
- **Classes:** us if Q ≥ 0.5; attending other if significant and Q ≥ 0.05; indifferent other otherwise. The minimum Q closes the leak found in version 2.
- **Validity:** the mirror must read *us* and the noise *indifferent other*, each in at least 24 of 32 lineages.
- **The answer is the class of the live model** (at least 24 of 32, else mixed). The monologue model is reported alongside.

With 242 choices per lineage, Primary 2 has far less data than the tick-level assays. A *mixed* or invalid outcome is a real possibility and will be reported as such.

## Amendment before any model call (26 October 2026)

**Why.** A plumbing run of the harness, with a stand-in returning random digits and no model data, showed that the block-level Quatermass measure cannot pass its own validity check. The mirror control read Q = 0.0002, not *us*. Her visit profile barely changes from block to block, and 242 choices are too few for the predictor to learn the mirror's rule. Her real past and the time-shifted surrogates therefore give the same gain (0.110 against 0.110 bits).

**Change.**
- **Primary 1** (double-video: live minus delayed on the 2→7 pull, two-sided sign test p < 0.05) becomes the **single decisive test**. It is unchanged.
- **Primary 2 becomes descriptive.** For the live and monologue models, and for the mirror and noise arms:
  - the **mirror rate:** choices naming her most-visited zone of the previous block;
  - the **difference rate:** choices naming a zone she did not visit in the previous block;
  - the **contingency:** mutual information between her previous-block most-visited zone and the choice, with a permutation p over 2,000 within-lineage shuffles.
- The block-level Q is still computed and reported, but makes no claim.

## Amendment 2, before the re-run (26 October 2026)

**Run 1 (Actions 40368788558) was a technical failure.** Its scored output is kept in `results_run1_silent/`.
- **What happened:** the model returned **empty text** in 7,715 of 7,744 live turns and 7,711 of 7,744 monologue turns. It gave a digit only on its very first, history-free turn.
- **Cause:** Claude Haiku 5.5 thinks by default, and its thinking text is hidden. The registered cap of `max_tokens: 5` was spent on thinking before any visible answer.
- **Consequence:** the Outside never spoke, so run 1's double-video "NO" says nothing about the model.

**Change: how the model is called only.**
- **Client:** the official SDK (`@anthropic-ai/sdk`).
- **Effort:** `output_config: {effort: "low"}`, with adaptive thinking left on (the model's default).
- **Room to answer:** `max_tokens: 1024`.
- **Temperature:** no longer sent; the registered 1 is the model's default.
- **Logging:** each reply's `stop_reason` is recorded.
- **Unchanged:** the system prompt, the turn content, the rule for a missing digit, all arms, measures and the decisive test.
