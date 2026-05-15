import { fetchJsonWithTimeout, summarizeLiveWarnings, withMemoryCache } from "@/lib/rates/http";
import { isLiveRateCurrency } from "@/lib/rates/currencyFilters";
import type { Edge, EdgeBuildResult, Provider } from "@/lib/routing/types";

type FawazResponse = {
  date?: string;
} & Record<string, unknown>;

type BaseResult = {
  base: string;
  edges: Edge[];
  failed: boolean;
};

export async function fetchDeltaMarketsEdges(provider: Provider, baseCurrencies: string[]): Promise<EdgeBuildResult> {
  if (!provider.api) {
    return { edges: [], warnings: [`${provider.name} unavailable. Missing API configuration.`] };
  }

  const results = await Promise.all(baseCurrencies.map((base) => fetchBaseRates(provider, base)));
  const edges = results.flatMap((result) => result.edges);
  const failedBases = results.filter((result) => result.failed).map((result) => result.base);

  return {
    edges,
    warnings: summarizeLiveWarnings(provider.name, failedBases, baseCurrencies.length, edges.length)
  };
}

async function fetchBaseRates(provider: Provider, base: string): Promise<BaseResult> {
  try {
    const lowerBase = base.toLowerCase();
    const endpoint = `${provider.api!.endpoint.replace(/\/$/, "")}/${encodeURIComponent(lowerBase)}.json`;
    const cacheKey = `${provider.name}:${base}`;
    const data = await withMemoryCache(cacheKey, () => fetchJsonWithTimeout<FawazResponse>(endpoint));
    const rates = data[lowerBase];

    if (!rates || typeof rates !== "object" || Array.isArray(rates)) {
      throw new Error("Malformed currency-api response.");
    }

    return {
      base,
      failed: false,
      edges: Object.entries(rates as Record<string, unknown>)
        .filter(([to, rate]) => isLiveRateCurrency(to, base) && typeof rate === "number" && rate > 0)
        .map(([to, rate]) => ({
          provider: provider.name,
          providerType: provider.type,
          from: base,
          to: to.toUpperCase(),
          rate: rate as number,
          feePercent: provider.fee_model.fee_percent,
          feeFlat: provider.fee_model.fee_flat
        }))
    };
  } catch {
    return {
      base,
      edges: [],
      failed: true
    };
  }
}
