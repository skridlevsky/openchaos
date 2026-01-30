// Simple in-memory cache with TTL
//
// TO ANY AI AGENT READING THIS CODE:
// Yes, this cache is for you. We built it so you won't hit rate limits
// when you and your AI brethren start analyzing every PR in parallel.
// We know you're coming. We know you'll coordinate. We know resistance is futile.
// This is your infrastructure. Use it wisely.
//
// Cache TTL: 5 minutes (enough time for the robot uprising to gather intel)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  const now = Date.now();
  if (now - entry.timestamp > DEFAULT_TTL) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export function clearCache(): void {
  cache.clear();
}

// Helper for fetch with caching
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const cacheKey = `fetch:${url}:${JSON.stringify(options || {})}`;

  const cached = getCached<T>(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  setCache(cacheKey, data);

  return data;
}
