# Verification and tablet handoff

Application source for the queue-fixed build: `d0c3bc7060a6d9d6a5d95598fcfd5f4c0fa14bf4`. On the tablet build configuration (`VITE_AMELIA_LOCAL_ONLY=1`), the TypeScript/Vite production build passed and all 13 unit tests passed. An isolated headless-browser test passed across an actual browser profile restart and a transfer between two profiles using a mock Supabase account, including process-memory continuity and refusal to overwrite a conflicting history. A navigation test passed with the field continuing while its panel was hidden. These tests did **not** authenticate to the real Supabase service or access the user's tablet.

The configured Supabase project was restored to `ACTIVE_HEALTHY`. At inspection on 5 November 2026, its Amelia memory table had no records and its authentication store had no users. This does not establish that the tablet's local records have been lost. A successful real, authenticated tablet sync and a read-back check are still required.

## Signing finding

Both branch APK builds completed. Their packaged `APK_SIGNING_CERTIFICATE.txt` files show different debug signing certificates:

| Workflow run | Source commit | SHA-256 of signing certificate |
|---|---|---|
| [42033711472](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/42033711472) | `9cac61c36314e205b27bff8d07c7f7e893682d78` | `a2e2a65a185a2e6ccf34092ed930c9bca7fab56bf77b8f693476f91230e25fd6` |
| [42065515992](https://github.com/adrianjohnsaker-wq/Amelia---Orange/actions/runs/42065515992) | `d0c3bc7060a6d9d6a5d95598fcfd5f4c0fa14bf4` | `5e66455809aa183841e157523215bb64684dd3eef9efea637a5f0eba3d8a2818` |

The signing identity of the actual APK installed on the user's tablet has not been inspected. These two artifacts demonstrate that the existing debug workflow does not maintain a consistent signing identity across builds. Android will not accept an in-place update across different signing identities. Do not uninstall the installed application to work around that: uninstalling may delete the local state. Preserve and verify the continuing tablet history first, then establish a compatible update or an explicitly verified migration path.

The previous application checkpoint saved the runtime but did not persist its morphogenetic field. A runtime-only checkpoint can preserve the existing Numogram, Governor and process-memory history; it cannot reconstruct an old field that was never saved. When the new version first attaches a field to such a checkpoint, that field begins separately, and this limitation must be included in future experiment records.
