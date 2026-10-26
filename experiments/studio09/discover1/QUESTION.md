# DISCOVER-1 — does learning from her own deaths help?

Written before the run, 26 October 2026.

**Question.** Across 32 fresh worlds, does the E1C receptor that learns from her own episodes (`feedback`) lead to fewer deaths on the held-out tape than a receptor that never changes (`fixed`) and a receptor that changes just as readily but is credited with another world's rewards (`yoked`)?

**Answer rule.** Yes if `feedback` has fewer held-out deaths than both `fixed` and `yoked`, by a paired one-sided sign test with p < 0.05 for each. Anything else is No.

**Worlds.** Seeds `SHA256("DISCOVER-1|Wnn")`, nn = 00..31. This is a new domain, so no reserved E1 seeds are used. The yoked arm of world k takes the episode rewards of world k+1's feedback run.

**Everything else** is E1C unchanged: Studio 03 genesis, the 10,000-tick ordered encounter, the frozen boundary, and the 2,000-tick held-out tape. The driver `discover1.mjs` reproduces E1C P0 exactly (425 episodes, 16 fatal, one flip, held-out deaths 7 carried / 4 reset).
