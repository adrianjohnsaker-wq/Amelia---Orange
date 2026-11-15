# Seed 50176: the route from replay to infection

15 November 2026. This is a retrospective inspection of the **natural** branch of the completed cohort. The original seed record and pre-dispatch SQLite checkpoint were recovered from the archived evidence. Their hashes were checked against the cohort manifest. The natural branch was then replayed with a read-only junction observer: its full **23,163-event** ledger, final primary state and shadow-state hashes all matched the archived branch. The observer recorded the focal edge after every emitted event.

The trace reveals a more intricate interaction among the temporal, catastrophic and viral mechanisms than the endpoint label alone shows.

| Ledger sequence | Model time | Recorded event |
| ---: | ---: | --- |
| 12786–12787 | 70.473 | Two packets from donor 63, each carrying `9080`, enter host 22. The second packet creates the mixed-origin closing junction **G**, forming the 36-digit focal intron `603541466017453604258174017539790809`. |
| 22366–22367 | 115.344 | Host 22 executes `replay`. Its genome digits are **identical before and after**; the pointer is restored from **61 to 36**. The focal G is a recognised stop both immediately before and after replay. |
| 22584–22585 | 116.306 | Future recipient 123 executes an Ampy `corrupt` instruction, changing host 22’s pointer **37 → 45**. |
| 22617–22625 | 116.431 | Host 112 executes another `corrupt` instruction. It changes host 22’s pointer **45 → 53** and host 123’s pointer **11 → 19**. |
| 22908–22912 | 117.544 | Host 22 reaches pointer 53 inside an intron. Its `fission` opcode is suppressed as a no-op. After the pointer advances to 54, the ordinary post-action infection mechanism sends **`809`** into host 123 at pointer 19. Signature and target gate both equal **6**, in zone 3. The payload carries the original G `09` edge. |
| 22913, 23082 | 117.544, 118.144 | Host 22 also sheds an experienced vector carrying **`6170`**, which later enters host 80. That payload does not contain G’s `09` edge and is not an onward transfer of the focal junction. |
| 23053 | 118.100 | Host 106 corrupts recipient 123’s pointer **19 → 27**. With the recorded genome and zone, pointer 19 decodes as intron no-op and pointer 27 as ordinary code; no later execution by 123 is present to establish what it actually did next. |
| Horizon | 118.473 | Host 123 is alive and carries G as the stop of `60016226748508455809`, a recognised intron with a different body. It retains **3 of 36** original focal digit occurrences. The horizon is only **0.929 model-time units after delivery**. |

The recipient had an unclosed `60` frame before the `809` insertion. The inserted viral `09` supplies the recognised stop; the host and viral digits combine in the resulting intron. The copied object is the original junction within a new body, rather than the complete 36-digit intron.

The focal G remained present as a recognised stop in host 22 throughout the recorded event-level trace from its formation to delivery. At the replay event, the observer records a new *copy occurrence* descending through the host’s history, but the immediately preceding genome already contained the same recognised G. This particular replay therefore does **not** show a missing junction being resurrected. It did alter the pointer. Whether that alteration, either corruption event, or their combination was necessary for the later infection requires a matched counterfactual; the sequence alone establishes chronology, not necessity.

After infection, the ledger records **no `execute` event by recipient 123** before the horizon. Its only recorded post-delivery interaction was the pointer corruption above. Thus this case does not measure a full recipient action or a 24-unit recipient lifetime, even though the host was alive at the endpoint.

The exact scheduled delivery time was `117.54439859846845`, so a delivery-locked 24-unit endpoint would be `141.54439859846845`. That later endpoint was **not simulated in this audit**.

The example also shows why no-op and infection must be measured separately. The suppressed `fission` instruction did not stop the engine’s independent, post-action infection opportunity. A silent intron can therefore coexist with a viral delivery; no-op status by itself is not evidence that shedding or infection has stopped.

The offline multi-label trace assigns the recipient occurrence **`RECALL` and `VIRAL`** simultaneously, with chronological provenance `replay → viral_direct`. The original formation event is separately identified as a vector-borne chimeric graft; it is not confused with later onward transfer of an already existing G. The reference classifier and its tests are included in the evidence package. They inspect provenance only and are not integrated into the simulation.
