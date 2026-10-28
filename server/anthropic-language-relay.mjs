import { createServer } from 'node:http';
import { timingSafeEqual } from 'node:crypto';

const PORT = Number(process.env.PORT || 8787);
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const RELAY_TOKEN = process.env.AMELIA_RELAY_TOKEN;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';
const API_VERSION = process.env.ANTHROPIC_API_VERSION || '2026-10-21';
const MAX_BODY_BYTES = 48 * 1024;
const MAX_USER_TEXT = 8000;
const MAX_READOUT = 16000;
const MAX_HISTORY = 8;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 20;
const requestsByIp = new Map();

if (!ANTHROPIC_API_KEY) throw new Error('Set ANTHROPIC_API_KEY in the relay host secret store.');
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
    json(res, 200, { ok: true, provider: 'Anthropic', model: MODEL }, origin);
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
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': API_VERSION,
        'x-api-key': ANTHROPIC_API_KEY,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 600,
        system: [
          'You are Amelia’s language relay. The Numogram substrate is the source of state, choices, actions, and intelligence.',
          'Your only role is to render the supplied substrateReadout and user message into clear language.',
          'Do not choose or recommend substrate transitions, alter state, execute actions, or claim that you are the substrate.',
          'Do not invent metrics, events, memories, experiments, or facts absent from the supplied readout and dialogue.',
          'You have no tools. Return text only. If the supplied state does not answer the user, say what information is missing.',
        ].join(' '),
        messages: [{ role: 'user', content: input }],
      }),
    });

    if (!anthropicResponse.ok) {
      const status = anthropicResponse.status;
      await anthropicResponse.body?.cancel().catch(() => {});
      json(res, 502, { error: status === 429 ? 'Anthropic is rate-limiting the relay.' : 'Anthropic request failed.' }, origin);
      return;
    }
    const response = await anthropicResponse.json();
    const text = Array.isArray(response.content)
      ? response.content.filter(block => block?.type === 'text').map(block => block.text).join('\n').trim()
      : '';
    if (!text) {
      json(res, 502, { error: 'Anthropic returned no text.' }, origin);
      return;
    }
    // Prompts and responses are not written to this relay's logs or server storage.
    json(res, 200, { text, model: MODEL }, origin);
  } catch (error) {
    const status = Number.isInteger(error?.status) ? error.status : 502;
    json(res, status, { error: status === 502 ? 'The Anthropic relay could not complete the request.' : error.message }, origin);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Amelia Anthropic language relay listening on :${PORT}`);
});
