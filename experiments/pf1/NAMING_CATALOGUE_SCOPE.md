# PF-1 naming catalogue: exact coverage and declared omissions

**Issued:** 20 October 2026. **Status:** pre-live provenance supplement, not an amendment to the accepted synthetic pilot or its criteria.

Source: [CCRU, *Pandemonium Matrix (Extracts from the Lemurian Necronomicon)*](https://www.ccru.net/digithype/pandemonium.htm). Source retrieval recorded in the mapping as 2026-10-20. The canonical source remains the authority; no names or epithets are inferred from memory.

The existing `pandemonium-45.json` has **45 exactly keyed entries**, one for each unordered pair of 10 zones. Each entry currently records exactly these fields:

| Field | Recorded? | Use |
|---|---|---|
| Normalized ascending unordered zone pair and source descending net-span | Yes | Complete pairing / identity |
| Mesh serial number (00–44) | Yes | Primary typological identity |
| Primary source entity name | Yes | Mechanical journal display |
| Pitch (Ana/Cth/Null) | Yes | Descriptive metadata |
| High-level classification (e.g., Cyclic Chronodemon, Amphidemon, Xenodemon) | Yes | Descriptive metadata |
| Original source URL, title, retrieval date | Yes (table level) | Traceable provenance |

## Deliberately omitted descriptive categories

The original CCRU Matrix presents heterogeneous prose, not a fixed rectangular data schema. The following **source fields are intentionally omitted from the runtime JSON** and remain available via the linked primary source. This omission is fully disclosed; the current JSON **is not a full descriptive catalogue**.

| Omitted catalogue field | Examples from the source | Why not transcribed into runtime table |
|---|---|---|
| Aliases / alternate spellings / parenthetical names | e.g., Lurgo (Legba); Doogu (The Blob); Mur Mur (Murrumur, Mu(mu)) | Multiple differently formatted aliases; mechanical naming uses only unambiguous primary name. Preserve original wording by linking source. |
| Epithet or functional label | e.g., Initiator; Original-Schism; Dream-Serpent | Interpretive literary attributes; cannot contribute to encounter selection. |
| Full demon-of characterisation | e.g., forms of openings, splitting-waters, cataclysm or cosmic indifference | Primary source often blends category and epithet; compression into labels would risk misquotation. |
| Pitch qualifications | e.g., Uppermost, Lowermost | Ordinal literary qualifiers are distinct from the preserved pitch string. |
| Gate relations and actions | e.g., Clicks, Ciphers, Haunts Gt-nn | Source claims several distinct relations; would need a separate, verified relation schema and is not used by scanner. |
| Current / syzygy relationships | Feeds, Shadows, Prowls Surge/Sink/Hold/Warp/Plex currents | Literary/diagrammatic associations differ from the actual runtime directed graph. Do not conflate them with available edges. |
| Door / phase limit and domain | 1st Door (The Pod), numbered phase-limits, named domains | Mixed per-entry attributes, not a universal field; no effect on detection. |
| Planetary / spinal associations | Mercury, Venus, Earth, Mars etc.; Dorsal, Cervical, Cranial, Lumbar, Sacrum | Interpretive/occult attributes, not empirically measured substrate variables. |
| Decadology and cipher annotations | C/tp-#n, Mn/Mj +/- coded brackets | Specialized symbolic annotations are heterogeneous and must not affect journal qualification. |
| Rites and route strings | Rt-0/1/2/3, numeric route sequences, sub-Rt counts | These are CCRU's textual routes, **not** observed graph routes: inserting them into a recovery prober could contaminate outcomes. |
| Associated omens / powers / practices | Descriptions accompanying each Rt (several per entity) | Creative interpretive descriptions, not objective features of perturbation recovery. |
| Exceptional/undecided symbols | Rt-0 [?], [X], unnumbered annotations | Preserve as original-source literal text; do not guess meanings. |
| Free-form narrative commentary, group lore and footnotes | Matrix introductory account, episodic manuscript lore | Long literary exposition, not a uniform per-entity attribute; linked rather than silently discarded. |

**Decision:** satisfy the operator's explicit alternative (Section A) by **recording omissions and their reasons**, not by claiming a comprehensive transcription. No entity identifiers, names, pitches, serials, pair keys or classifications are changed. This keeps the source-recovery step separate from scientific outcomes.

At runtime, `loadMatrix()` uses only the verified subset, with a deterministic, read-only pair-to-name mapping. No omitted or retained literary attribute influences scanner or prober decisions. No live start has been authorised.
