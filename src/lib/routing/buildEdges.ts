import { getConfiguredCurrencies } from "@/lib/providers";
import { fetchAlphaFxEdges } from "@/lib/rates/alphaFx";
import { fetchBetaBankEdges } from "@/lib/rates/betaBank";
import { fetchDeltaMarketsEdges } from "@/lib/rates/deltaMarkets";
import { buildStaticEdgeResult } from "@/lib/rates/staticProviders";
import {
  buildSimulatedOutageHealth,
  buildSimulatedOutageWarnings,
  filterDisabledProviders
} from "@/lib/routing/filterProviders";
import type { EdgeBuildResult, Provider } from "@/lib/routing/types";

const STABLECOINS = new Set(["USDC", "USDT", "DAI"]);
const COMMON_FIAT_BASES = ["USD", "EUR", "GBP"];

export async function buildEdges(
  providers: Provider[],
  source: string,
  target: string,
  disabledProviders: string[] = []
): Promise<EdgeBuildResult> {
  const activeProviders = filterDisabledProviders(providers, disabledProviders);
  const staticResult = buildStaticEdgeResult(activeProviders);
  const baseCurrencies = getLiveBaseCurrencies(activeProviders, source, target);
  const liveProviders = activeProviders.filter((provider) => provider.rate_source === "live_api");
  const outageHealth = buildSimulatedOutageHealth(disabledProviders);
  const outageWarnings = buildSimulatedOutageWarnings(disabledProviders);

  const liveResults: EdgeBuildResult[] = await Promise.all(
    liveProviders.map((provider): Promise<EdgeBuildResult> => {
      switch (provider.name) {
        case "AlphaFX":
          return fetchAlphaFxEdges(provider, baseCurrencies);
        case "BetaBank":
          return fetchBetaBankEdges(provider, baseCurrencies);
        case "DeltaMarkets":
          return fetchDeltaMarketsEdges(provider, baseCurrencies);
        default:
          return Promise.resolve({
            edges: [],
            warnings: [`${provider.name} skipped. No fetcher is implemented for this provider.`],
            providerHealth: [
              {
                provider: provider.name,
                status: "skipped",
                edgeCount: 0,
                message: "No live fetcher is implemented for this provider."
              }
            ]
          });
      }
    })
  );

  return {
    edges: [...liveResults.flatMap((result) => result.edges), ...staticResult.edges],
    warnings: [
      ...outageWarnings,
      ...liveResults.flatMap((result) => result.warnings),
      ...staticResult.warnings
    ],
    providerHealth: [
      ...outageHealth,
      ...liveResults.flatMap((result) => result.providerHealth),
      ...staticResult.providerHealth
    ]
  };
}

export function getLiveBaseCurrencies(providers: Provider[], source: string, target: string) {
  const currencies = new Set<string>(COMMON_FIAT_BASES);
  currencies.add(source);
  currencies.add(target);

  getConfiguredCurrencies(providers).forEach((currency) => {
    currencies.add(currency);
  });

  return [...currencies]
    .map((currency) => currency.toUpperCase())
    .filter((currency) => /^[A-Z]{3}$/.test(currency) && !STABLECOINS.has(currency));
}
