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
