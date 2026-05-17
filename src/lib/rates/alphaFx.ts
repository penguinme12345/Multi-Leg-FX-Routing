import {
  buildLiveProviderHealth,
  classifyRateError,
  fetchJsonWithTimeout,
  summarizeLiveWarnings,
  withMemoryCache
} from "@/lib/rates/http";
import { isLiveRateCurrency } from "@/lib/rates/currencyFilters";
import type { Edge, EdgeBuildResult, Provider, ProviderHealthStatus } from "@/lib/routing/types";

type FrankfurterResponse = {
  amount?: number;
  base?: string;
  date?: string;
  rates?: Record<string, number>;
};

type BaseResult = {
  base: string;
  edges: Edge[];
  failed: boolean;
  failureReason?: ProviderHealthStatus;
};

export async function fetchAlphaFxEdges(provider: Provider, baseCurrencies: string[]): Promise<EdgeBuildResult> {
  if (!provider.api) {
    return {
      edges: [],
      warnings: [`${provider.name} unavailable. Missing API configuration.`],
      providerHealth: [
        {
          provider: provider.name,
          status: "failed",
          edgeCount: 0,
          message: "Missing API configuration."
        }
      ]
    };
  }

  const results = await Promise.all(baseCurrencies.map((base) => fetchBaseRates(provider, base)));
  const edges = results.flatMap((result) => result.edges);
  const failedBases = results
    .filter((result) => result.failed)
    .map((result) => ({
      base: result.base,
      failureReason: result.failureReason ?? "failed"
    }));

  return {
    edges,
    warnings: summarizeLiveWarnings(provider.name, failedBases, baseCurrencies.length, edges.length),
    providerHealth: [buildLiveProviderHealth(provider.name, failedBases, baseCurrencies.length, edges.length)]
  };
}

async function fetchBaseRates(provider: Provider, base: string): Promise<BaseResult> {
  try {
    const endpoint = new URL(provider.api!.endpoint);
    endpoint.searchParams.set("base", base);
    const cacheKey = `${provider.name}:${base}`;
    const data = await withMemoryCache(cacheKey, () =>
      fetchJsonWithTimeout<FrankfurterResponse>(endpoint.toString())
    );

    if (!data.rates || typeof data.rates !== "object") {
      throw new Error("Malformed Frankfurter response.");
    }

    return {
      base,
      failed: false,
      edges: Object.entries(data.rates)
        .filter(([to, rate]) => isLiveRateCurrency(to, base) && Number.isFinite(rate) && rate > 0)
        .map(([to, rate]) => ({
          provider: provider.name,
          providerType: provider.type,
          rateSource: "live_api",
          from: base,
          to: to.toUpperCase(),
          rate,
          feePercent: provider.fee_model.fee_percent,
          feeFlat: provider.fee_model.fee_flat
        }))
    };
  } catch (error) {
    return {
      base,
      edges: [],
      failed: true,
      failureReason: classifyRateError(error)
    };
  }
}
