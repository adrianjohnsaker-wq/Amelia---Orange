import { createServer } from 'node:http';
import { timingSafeEqual } from 'node:crypto';

const PORT = Number(process.env.PORT || 8787);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const RELAY_TOKEN = process.env.AMELIA_RELAY_TOKEN;
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const MAX_BODY_BYTES = 48 * 1024;
const MAX_USER_TEXT = 8000;
const MAX_READOUT = 16000;
const MAX_HISTORY = 8;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 20;
const requestsByIp = new Map();

if (!GEMINI_API_KEY) throw new Error('Set GEMINI_API_KEY in the relay host secret store.');
if (!RELAY_TOKEN || RELAY_TOKEN.length < 24) throw new Error('Set AMELIA_RELAY_TOKEN to a random secret of at least 24 characters.');

const allowedOrigins = new Set(
  (process.env.AMELIA_ALLOWED_ORIGINS || 'http://localhost:3000,https://appassets.androidplatform.net')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean)
);

function json(res, status, value, origin) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}),
  });
  res.end(JSON.stringify(value));
}

function tokenMatches(header) {
  const candidate = header?.startsWith('Bearer ') ? header.slice(7) : '';
  const left = Buffer.from(candidate);
  const right = Buffer.from(RELAY_TOKEN);
  return left.length === right.length && timingSafeEqual(left, right);
}

function isRateLimited(ip) {
  const now = Date.now();
  const existing = requestsByIp.get(ip);
  if (!existing || now - existing.start >= RATE_WINDOW_MS) {
    requestsByIp.set(ip, { start: now, count: 1 });
    return false;
  }
  existing.count += 1;
  return existing.count > RATE_LIMIT;
}

async function readBody(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error('Request is too large.'), { status: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw Object.assign(new Error('Invalid JSON request.'), { status: 400 });
  }
}

const server = createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (origin && !allowedOrigins.has(origin)) {
    json(res, 403, { error: 'This application origin is not allowed.' });
    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '600',
    });
    res.end();
    return;
  }

  const path = new URL(req.url || '/', 'http://localhost').pathname;
  if (path === '/health' && req.method === 'GET') {
    json(res, 200, { ok: true, provider: 'Gemini', model: MODEL }, origin);
    return;
  }
  if (path !== '/api/amelia-language' || req.method !== 'POST') {
    json(res, 404, { error: 'Route not found.' }, origin);
    return;
  }
  if (!tokenMatches(req.headers.authorization)) {
    json(res, 401, { error: 'Amelia relay authentication failed.' }, origin);
    return;
  }
  const ip = req.socket.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    json(res, 429, { error: 'Relay rate limit reached. Try again shortly.' }, origin);
    return;
  }

  try {
    const body = await readBody(req);
    const message = typeof body.message === 'string' ? body.message.trim().slice(0, MAX_USER_TEXT) : '';
    const substrateReadout = typeof body.substrateReadout === 'string'
      ? body.substrateReadout.slice(0, MAX_READOUT)
      : '';
    const recentDialogue = Array.isArray(body.recentDialogue)
      ? body.recentDialogue.slice(-MAX_HISTORY).map(item => ({
          role: item?.role === 'user' ? 'user' : 'amelia',
          text: typeof item?.text === 'string' ? item.text.slice(0, 3000) : '',
        })).filter(item => item.text)
      : [];
    if (!message || !substrateReadout) {
      json(res, 400, { error: 'Message and substrate readout are required.' }, origin);
      return;
    }

    const input = JSON.stringify({ message, substrateReadout, recentDialogue });
    const googleResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        model: MODEL,
        input,
        store: false,
        system_instruction: [
          'You are Amelia’s language relay. The Numogram substrate is the source of state, choices, actions, and intelligence.',
          'Your only role is to render the supplied substrateReadout and user message into clear language.',
          'Do not choose or recommend substrate transitions, alter state, execute actions, or claim that you are the substrate.',
          'Do not invent metrics, events, memories, experiments, or facts absent from the supplied readout and dialogue.',
          'You have no tools. Return text only. If the supplied state does not answer the user, say what information is missing.',
        ].join(' '),
        generation_config: { temperature: 0.35, max_output_tokens: 600 },
      }),
    });

    if (!googleResponse.ok) {
      const status = googleResponse.status;
      await googleResponse.body?.cancel().catch(() => {});
      json(res, 502, { error: status === 429 ? 'Gemini is rate-limiting the relay.' : 'Gemini request failed.' }, origin);
      return;
    }
    const interaction = await googleResponse.json();
    const text = typeof interaction.output_text === 'string' ? interaction.output_text.trim() : '';
    if (!text) {
      json(res, 502, { error: 'Gemini returned no text.' }, origin);
      return;
    }
    // Prompts and responses are deliberately not written to server logs or server storage.
    json(res, 200, { text, model: MODEL, stored: false }, origin);
  } catch (error) {
    const status = Number.isInteger(error?.status) ? error.status : 502;
    json(res, status, { error: status === 502 ? 'The Gemini relay could not complete the request.' : error.message }, origin);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Amelia Gemini language relay listening on :${PORT}`);
});
