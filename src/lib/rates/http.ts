import type { ProviderHealth, ProviderHealthStatus } from "@/lib/routing/types";

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

export type FailedBase = {
  base: string;
  failureReason: ProviderHealthStatus;
};

export function classifyRateError(error: unknown): ProviderHealthStatus {
  if (isAbortError(error)) {
    return "timeout";
  }

  if (error instanceof Error && error.message.toLowerCase().includes("malformed")) {
    return "malformed_response";
  }

  return "failed";
}

export function summarizeLiveWarnings(
  provider: string,
  failedBases: FailedBase[],
  totalBases: number,
  edgeCount: number
) {
  if (failedBases.length === 0) {
    return [];
  }

  const status = chooseFailureStatus(failedBases);
  const phrase = status === "timeout" ? "timed out" : status === "malformed_response" ? "returned malformed data" : "failed";

  if (edgeCount === 0 || failedBases.length === totalBases) {
    return [`${provider} ${phrase}. Results exclude this provider.`];
  }

  const displayedBases = failedBases
    .slice(0, 5)
    .map((failure) => failure.base)
    .join(", ");
  const suffix = failedBases.length > 5 ? ` and ${failedBases.length - 5} more` : "";
  return [`${provider} unavailable for ${displayedBases}${suffix}. Partial ${provider} rates excluded.`];
}

export function buildLiveProviderHealth(
  provider: string,
  failedBases: FailedBase[],
  totalBases: number,
  edgeCount: number
): ProviderHealth {
  if (failedBases.length === 0) {
    return {
      provider,
      status: "online",
      edgeCount,
      message: `${edgeCount} live rates loaded.`
    };
  }

  if (edgeCount > 0 && failedBases.length < totalBases) {
    return {
      provider,
      status: "online",
      edgeCount,
      message: `${edgeCount} live rates loaded; ${failedBases.length} base currencies unavailable.`
    };
  }

  const status = chooseFailureStatus(failedBases);

  return {
    provider,
    status,
    edgeCount,
    message:
      status === "timeout"
        ? "Provider timed out and was excluded."
        : status === "malformed_response"
          ? "Provider returned malformed data and was excluded."
          : "Provider failed and was excluded."
  };
}

function chooseFailureStatus(failedBases: FailedBase[]): ProviderHealthStatus {
  if (failedBases.some((failure) => failure.failureReason === "timeout")) {
    return "timeout";
  }

  if (failedBases.some((failure) => failure.failureReason === "malformed_response")) {
    return "malformed_response";
  }

  return "failed";
}

function isAbortError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: unknown }).name === "AbortError"
  );
}
