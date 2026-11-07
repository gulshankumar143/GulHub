// Small in-memory TTL cache to reduce GitHub API calls (rate limits).
//  - identical concurrent requests share one in-flight call
//  - if GitHub starts failing (rate limit / outage), an expired value is served instead
const store = new Map();
const inflight = new Map();
const MAX_ENTRIES = 500;
const STALE_MS = 60 * 60 * 1000; // serve expired data for up to 1 hour on failures

export async function cached(key, ttlMs, loader) {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;

  if (inflight.has(key)) return inflight.get(key);

  const promise = (async () => {
    try {
      const value = await loader();
      store.set(key, { value, expires: Date.now() + ttlMs });
      if (store.size > MAX_ENTRIES) store.delete(store.keys().next().value);
      return value;
    } catch (error) {
      const temporary = error.rateLimited || !error.status || error.status >= 500;
      if (hit && temporary && Date.now() - hit.expires < STALE_MS) return hit.value;
      throw error; // errors are never cached
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}
