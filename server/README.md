# Amelia Anthropic language relay

This process is a server-side text renderer. The Numogram substrate remains the authority for runtime state, transition choices, and action controls. The relay receives a substrate readout, the current user message, and a short dialogue window, then returns text only.

## Runtime configuration

Set these values in the relay host's secret/environment configuration. Do not commit a real Anthropic key or relay token.

- `ANTHROPIC_API_KEY`: the Anthropic API key. Keep it on the server.
- `AMELIA_RELAY_TOKEN`: a random private bearer token of at least 24 characters. Amelia's UI holds this only in memory for the current page session.
- `AMELIA_ALLOWED_ORIGINS`: comma-separated exact origins allowed to call the relay. Include the actual browser origin and `https://appassets.androidplatform.net` for the bundled Android WebView when needed.
- `ANTHROPIC_MODEL`: optional; defaults to `claude-haiku-5-5`.
- `ANTHROPIC_API_VERSION`: optional; defaults to `2026-10-21`.
- `PORT`: optional; defaults to `8787`.

Run with Node 22 or later:

```sh
npm run start:relay
```

The app's **Dialogue & Chat → settings icon** needs the deployed `/api/amelia-language` URL and the matching relay token. The Anthropic API key is never requested by or placed in the browser build. A GitHub repository secret is only available to GitHub Actions; it is not automatically copied to a separately hosted relay. If deployment is automated from Actions, the workflow must explicitly pass `ANTHROPIC_API_KEY` to the relay host's secret configuration.

## Durable research memory

The browser/WebView keeps an IndexedDB cache and can sync it to the Amelia Supabase project after sign-in. Supabase Auth accounts identify the owner; the `amelia_memory_records` table is protected by row-level security and does not grant access to anonymous clients. The app's publishable key is public by design; row policies enforce access. Do not place a Supabase service-role key in the app.

On first use, create an account or sign in from **Local Memory & Persistence**. Configure the deployed app origin in Supabase Auth's Site URL and Redirect URLs so account confirmation links return to Amelia. After the first successful sync, the app restores the latest runtime checkpoint on subsequent launches. The same account can restore its archive on another browser or device. If local browser data is cleared, sign in again to download the cloud archive.

## Data boundary

The relay sends the current message, a bounded substrate readout, and up to eight recent dialogue turns to Anthropic's Messages API. Amelia's app and this relay do not store prompts or responses on the relay server or write them to Supabase. Anthropic processes the request under the API retention terms and settings for the account; the relay does not set a separate provider-side no-retention flag. The relay has no tools and returns text only; the local substrate continues to own state transitions and action controls.

The server applies an origin allowlist, bearer-token check, request-size limit, and per-process IP rate limit. The rate limit is process-local; put the endpoint behind a hosting provider's rate limiting/authentication for a public deployment.
