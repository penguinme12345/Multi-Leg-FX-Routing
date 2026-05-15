const DEFAULT_TIMEOUT_MS = 3500;
const DEFAULT_CACHE_TTL_MS = 10 * 60 * 1000;

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();

export async function fetchJsonWithTimeout<T>(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export async function withMemoryCache<T>(
  key: string,
  load: () => Promise<T>,
  ttlMs = DEFAULT_CACHE_TTL_MS
): Promise<T> {
  const now = Date.now();
  const cached = memoryCache.get(key) as CacheEntry<T> | undefined;

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const value = await load();
  memoryCache.set(key, {
    expiresAt: now + ttlMs,
    value
  });

  return value;
}

export function summarizeLiveWarnings(
  provider: string,
  failedBases: string[],
  totalBases: number,
  edgeCount: number
) {
  if (failedBases.length === 0) {
    return [];
  }

  if (edgeCount === 0 || failedBases.length === totalBases) {
    return [`${provider} unavailable. Results exclude this provider.`];
  }

  const displayedBases = failedBases.slice(0, 5).join(", ");
  const suffix = failedBases.length > 5 ? ` and ${failedBases.length - 5} more` : "";
  return [`${provider} unavailable for ${displayedBases}${suffix}. Partial ${provider} rates excluded.`];
}
