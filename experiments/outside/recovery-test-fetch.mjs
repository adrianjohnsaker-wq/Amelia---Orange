// Local regression fixture only; never imported by the live worker.
globalThis.fetch = async () => {
  const item = process.env.OUTSIDE_TEST_FEED === 'one'
    ? `<item><title>Queue regression signal 137</title><link>https://example.invalid/regression</link><guid>queue-regression-137</guid><pubDate>${new Date().toUTCString()}</pubDate></item>`
    : '';
  return {ok:true,status:200,text:async()=>`<rss><channel>${item}</channel></rss>`};
};
