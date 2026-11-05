# SXI-1 evidence index

The study summary contains the registration, source plans, source-bound runner, analysis, post-hoc decay diagnostic and the world-archive hash list. Each world archive contains eleven independently verified, zstd-compressed full traces and their receipts. Links are scoped to the owner’s ChatGPT account.

- [Study summary evidence](https://chatgpt.com/library?file_id=libfile_0ee1ca12fbf08191a8b18f84bb59581c&account_id=personal): SHA-256 `169a73586107670d06b0dbc043ef3c3a84ba7b428619da12cfa315f9aad42b51`.
- [Exploratory source and positive-control calibration](https://chatgpt.com/library?file_id=libfile_bd330e21a50c8191b6d3f0b9756b8bf3&account_id=personal): SHA-256 `5487406d4c28e096150fd561197325b3c0df4ad53bfe995f67a9c3496acb86a4`.

| World | Full trace archive | Archive SHA-256 |
| --- | --- | --- |
| 9501 | [Download](https://chatgpt.com/library?file_id=libfile_68aaae7e2dcc81919d366739d6f08d6d&account_id=personal) | `60786e2bf960a225206519efbe8ebf3edef8f154024432403aa4e604423d9e1c` |
| 9502 | [Download](https://chatgpt.com/library?file_id=libfile_42585c380d1c8191af91781a95cd8bbc&account_id=personal) | `6505c2269b2551cb22a80a0bfe4148d3e080f26bce2b2da24832103d38f49a76` |
| 9503 | [Download](https://chatgpt.com/library?file_id=libfile_8fe6c4290560819183ffe6a3e1370859&account_id=personal) | `509e72e3a6497305906970f87fb6ed7af04a2138550f49ff2f0b33dafbee5e68` |
| 9504 | [Download](https://chatgpt.com/library?file_id=libfile_f6866051698c81919e515f8dbf195f6d&account_id=personal) | `fc7332eafff098ac40d8f46b19b015e0e964058cef0ce96bbf1aa378d86163bb` |
| 9505 | [Download](https://chatgpt.com/library?file_id=libfile_6769ec2d2ab48191a54e23028fd290ae&account_id=personal) | `408fb30661b390a69bfe2f462899b248f7a98d4d464209e4726e349823c9bf83` |
| 9506 | [Download](https://chatgpt.com/library?file_id=libfile_fd8855737be4819180b2285369e554c4&account_id=personal) | `2289c14df7506b954e0a3a0206e50518634850da7b6e45ab2b37d78540051d6b` |
| 9507 | [Download](https://chatgpt.com/library?file_id=libfile_84ecd12dd6c481918810a7c41a4c16d5&account_id=personal) | `91273f41c1581b94f22845f02090b75d2d24dc4df3f03ddc6714e1fd8ba8b902` |
| 9508 | [Download](https://chatgpt.com/library?file_id=libfile_6271f73c1df48191803f89d51afdf314&account_id=personal) | `617d6be8ae049b79fbd1e5dbf1cf5566c52f954347cc491fa8c411b7c4ece35c` |

All 88 compressed traces were checked against their original uncompressed SHA-256 after decompression before packaging. Every world ZIP passed its archive CRC check and contains its own SHA-256 manifest. The registered analysis was recomputed from the extracts and receipts in these nine deliverable archives and matched the retained analysis byte for byte. Use `zstd -d` to recover a `.jsonl` trace before invoking the registered verifier.

To recompute the registered summary, place the nine study ZIP files together, then extract them into a new audit directory. The analysis reads the retained challenge extracts and their receipt hashes; the full compressed traces remain available for independent per-step verification.

```sh
unzip SXI1_Study_Summary_Evidence_2026-11-05.zip -d audit
mkdir -p audit/runs
for archive in SXI1_W95??_Evidence_2026-11-05.zip; do unzip "$archive" -d audit/runs; done
python3 audit/registered/experiments/synthetic-pointer/sxi1_analysis.py \
  --root audit --registration audit/registered/experiments/synthetic-pointer/sxi1/registration.json \
  --output new-analysis.json
```
