"""THE ANTENNA collector (see REGISTRATION.md). Fetches the five world streams and records each new datum's
text exactly as published. Nothing is reduced, filtered or chosen here; the workflow seals each batch.

  python3 collect.py <live dir>      writes <live>/batches/<stamp>.json and updates <live>/state.json
"""
import datetime as dt, email.utils, json, pathlib, sys, urllib.request, xml.etree.ElementTree as ET

UTC = dt.timezone.utc
START, END = dt.datetime(2026, 10, 28, tzinfo=UTC), dt.datetime(2026, 11, 4, tzinfo=UTC)
HEADLINES = {'bbc': 'https://feeds.bbci.co.uk/news/world/rss.xml',
             'aljazeera': 'https://www.aljazeera.com/xml/rss/all.xml',
             'npr': 'https://feeds.npr.org/1004/rss.xml'}
MARKETS = ['^GSPC', '^FTSE', '^N225']
QUAKES = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'
KP = 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json'
KEEP = 5000

def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Amelia antenna research collector)'})
    with urllib.request.urlopen(req, timeout=30) as f:
        return f.read()

def iso(t): return t.astimezone(UTC).strftime('%Y-%m-%dT%H:%M:%SZ')
def inside(t): return START <= t < END

def headlines(state, now):
    out = []
    for src, url in HEADLINES.items():
        seen = state['seen'].setdefault('words|' + src, [])
        for item in ET.fromstring(get(url)).iter('item'):
            title, pub = item.findtext('title'), item.findtext('pubDate')
            uid = item.findtext('guid') or item.findtext('link') or title
            if not title or not pub or uid in seen: continue
            seen.append(uid)
            t = email.utils.parsedate_to_datetime(pub)
            if t.tzinfo is None: t = t.replace(tzinfo=UTC)
            out.append({'stream': 'words', 'source': src, 'id': uid, 'time': iso(t), 'text': title.strip()})
        del seen[:-KEEP]
    return out

def markets(state, now):
    out = []
    for sym in MARKETS:
        r = json.loads(get(f'https://query1.finance.yahoo.com/v8/finance/chart/{sym}?interval=1m&range=5d'))['chart']['result'][0]
        closes = r['indicators']['quote'][0]['close']
        last = state['last'].get('markets|' + sym, {'ts': 0, 'text': None})
        for ts, c in zip(r.get('timestamp') or [], closes):
            if c is None or ts <= last['ts'] or ts > now.timestamp() - 120: continue
            text = f'{c:.2f}'
            if text != last['text']:
                out.append({'stream': 'markets', 'source': sym, 'id': f'{sym}|{ts}',
                            'time': iso(dt.datetime.fromtimestamp(ts, UTC)), 'text': text})
            last = {'ts': ts, 'text': text}
        state['last']['markets|' + sym] = last
    return out

def quakes(state, now):
    out, seen = [], state['seen'].setdefault('earth', [])
    for f in json.loads(get(QUAKES))['features']:
        p, (lon, lat, _) = f['properties'], f['geometry']['coordinates']
        if f['id'] in seen or p.get('mag') is None: continue
        seen.append(f['id'])
        out.append({'stream': 'earth', 'source': 'usgs', 'id': f['id'],
                    'time': iso(dt.datetime.fromtimestamp(p['time'] / 1000, UTC)), 'text': f"{p['mag']} {lat} {lon}"})
    del seen[:-KEEP]
    return out

def sun(state, now):
    out, last = [], state['last'].get('sun', {'t': '', 'text': None})
    for row in json.loads(get(KP)):
        t, kp = row.get('time_tag'), row.get('estimated_kp')
        if t is None or kp is None or t <= last['t']: continue
        text = str(kp)
        if text != last['text']:
            out.append({'stream': 'sun', 'source': 'noaa', 'id': t, 'time': iso(dt.datetime.fromisoformat(t).replace(tzinfo=UTC)), 'text': text})
        last = {'t': t, 'text': text}
    state['last']['sun'] = last
    return out

def date(state, now):
    out = []
    h = dt.datetime.fromisoformat(state['last'].get('date', iso(START - dt.timedelta(hours=1))).replace('Z', '+00:00'))
    while h + dt.timedelta(hours=1) <= now:
        h += dt.timedelta(hours=1)
        out.append({'stream': 'date', 'source': 'utc', 'id': iso(h), 'time': iso(h), 'text': h.strftime('%Y-%m-%d %H:00')})
    state['last']['date'] = iso(h)
    return out

def main(live):
    live = pathlib.Path(live); (live / 'batches').mkdir(parents=True, exist_ok=True)
    sp = live / 'state.json'
    state = json.loads(sp.read_text()) if sp.exists() else {'seen': {}, 'last': {}}
    now = dt.datetime.now(UTC)
    items, errors = [], []
    for fn in (headlines, markets, quakes, sun, date):
        try: items += fn(state, now)
        except Exception as e: errors.append({'stream': fn.__name__, 'error': f'{type(e).__name__}: {e}'[:500]})
    kept = [x for x in items if inside(dt.datetime.fromisoformat(x['time'].replace('Z', '+00:00')))]
    for x in kept: x['seenAt'] = iso(now)
    stamp = now.strftime('%Y%m%dT%H%M%SZ')
    batch = {'schema': 'ANTENNA_BATCH_V1', 'collectedAtUTC': iso(now), 'items': kept,
             'outsideWindow': len(items) - len(kept), 'errors': errors}
    (live / 'batches' / f'{stamp}.json').write_text(json.dumps(batch, ensure_ascii=False, sort_keys=True, indent=1) + '\n')
    sp.write_text(json.dumps(state, sort_keys=True) + '\n')
    print(stamp, json.dumps({'items': len(kept), 'outsideWindow': len(items) - len(kept),
                             'byStream': {s: sum(1 for x in kept if x['stream'] == s) for s in ('words', 'markets', 'earth', 'sun', 'date')},
                             'errors': [e['stream'] for e in errors]}))
    return stamp

if __name__ == '__main__':
    main(sys.argv[1])
