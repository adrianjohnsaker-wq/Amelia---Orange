export interface AmeliaLanguageRelayRequest {
  message: string;
  substrateReadout: string;
  recentDialogue: Array<{ role: 'user' | 'amelia'; text: string }>;
  watchtowerPhase?: number;
}

export interface AmeliaLanguageRelayReply {
  text: string;
  model: string;
}

export async function requestAnthropicLanguage(
  endpoint: string,
  relayToken: string,
  payload: AmeliaLanguageRelayRequest,
  signal?: AbortSignal
): Promise<AmeliaLanguageRelayReply> {
  const url = endpoint.trim();
  if (!url) throw new Error('Anthropic relay endpoint is not configured.');
  if (!relayToken.trim()) throw new Error('Enter the Amelia relay access token.');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${relayToken.trim()}`,
    },
    body: JSON.stringify(payload),
    signal,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : `Anthropic relay request failed (${response.status}).`);
  }
  if (typeof data.text !== 'string' || !data.text.trim()) {
    throw new Error('Anthropic relay returned no text.');
  }
  return { text: data.text.trim(), model: typeof data.model === 'string' ? data.model : 'Anthropic' };
}
