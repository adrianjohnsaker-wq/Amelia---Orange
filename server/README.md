# Amelia Gemini language relay

This process is a server-side text renderer. The Numogram substrate remains the authority for runtime state, transition choices, and action controls. The relay receives a substrate readout, the current user message, and a short dialogue window, then returns text only.

## Runtime configuration

Set these values in the relay host's secret/environment configuration. Do not commit a real Gemini key or relay token.

- `GEMINI_API_KEY`: a newly issued Gemini API key. Keep it on the server.
- `AMELIA_RELAY_TOKEN`: a random private bearer token of at least 24 characters. Amelia's UI holds this only in memory for the current page session.
- `AMELIA_ALLOWED_ORIGINS`: comma-separated exact origins allowed to call the relay. Include the actual browser origin and `https://appassets.androidplatform.net` for the bundled Android WebView when needed.
- `GEMINI_MODEL`: optional; defaults to `gemini-3.8-flash`.
- `PORT`: optional; defaults to `8787`.

Run with Node 22 or later:

```sh
npm run start:relay
```

The app's **Dialogue & Chat → settings icon** needs the deployed `/api/amelia-language` URL and the matching relay token. The Gemini API key is never requested by or placed in the browser build.

## Durable research memory

The browser/WebView keeps an IndexedDB cache and can sync it to the Amelia Supabase project after sign-in. Supabase Auth accounts identify the owner; the `amelia_memory_records` table is protected by row-level security and does not grant access to anonymous clients. The app's publishable key is public by design; row policies enforce access. Do not place a Supabase service-role key in the app.

On first use, create an account or sign in from **Local Memory & Persistence**. Configure the deployed app origin in Supabase Auth's Site URL and Redirect URLs so account confirmation links return to Amelia. After the first successful sync, the app restores the latest runtime checkpoint on subsequent launches. The same account can restore its archive on another browser or device. If local browser data is cleared, sign in again to download the cloud archive.

## Data boundary

The relay uses Gemini's Interactions API with `store: false`. It does not write prompts or responses to a database or log them. The substrate readout and message are sent to Gemini to render the reply. Gemini has no tools and returns no actions; action buttons continue to come from the local substrate relay.

The server applies an origin allowlist, bearer-token check, request-size limit, and per-process IP rate limit. The rate limit is process-local; put the endpoint behind a hosting provider's rate limiting/authentication for a public deployment.
