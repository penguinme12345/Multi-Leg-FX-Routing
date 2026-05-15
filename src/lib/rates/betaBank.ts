import { fetchJsonWithTimeout, summarizeLiveWarnings, withMemoryCache } from "@/lib/rates/http";
import { isLiveRateCurrency } from "@/lib/rates/currencyFilters";
import type { Edge, EdgeBuildResult, Provider } from "@/lib/routing/types";

type ExchangeRateApiResponse = {
  result?: string;
  base_code?: string;
  rates?: Record<string, number>;
};

type BaseResult = {
  base: string;
  edges: Edge[];
  failed: boolean;
};

export async function fetchBetaBankEdges(provider: Provider, baseCurrencies: string[]): Promise<EdgeBuildResult> {
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
    const endpoint = `${provider.api!.endpoint.replace(/\/$/, "")}/${encodeURIComponent(base)}`;
    const cacheKey = `${provider.name}:${base}`;
    const data = await withMemoryCache(cacheKey, () =>
      fetchJsonWithTimeout<ExchangeRateApiResponse>(endpoint)
    );

    if (data.result !== "success" || !data.rates || typeof data.rates !== "object") {
      throw new Error("Malformed ExchangeRate-API response.");
    }

    return {
      base,
      failed: false,
      edges: Object.entries(data.rates)
        .filter(([to, rate]) => isLiveRateCurrency(to, base) && Number.isFinite(rate) && rate > 0)
        .map(([to, rate]) => ({
          provider: provider.name,
          providerType: provider.type,
          from: base,
          to: to.toUpperCase(),
          rate,
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
