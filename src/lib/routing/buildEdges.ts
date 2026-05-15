import { getConfiguredCurrencies } from "@/lib/providers";
import { fetchAlphaFxEdges } from "@/lib/rates/alphaFx";
import { fetchBetaBankEdges } from "@/lib/rates/betaBank";
import { fetchDeltaMarketsEdges } from "@/lib/rates/deltaMarkets";
import { buildStaticEdges } from "@/lib/rates/staticProviders";
import type { EdgeBuildResult, Provider } from "@/lib/routing/types";

const STABLECOINS = new Set(["USDC", "USDT", "DAI"]);
const COMMON_FIAT_BASES = ["USD", "EUR", "GBP"];

export async function buildEdges(providers: Provider[], source: string, target: string): Promise<EdgeBuildResult> {
  const staticEdges = buildStaticEdges(providers);
  const baseCurrencies = getLiveBaseCurrencies(providers, source, target);
  const liveProviders = providers.filter((provider) => provider.rate_source === "live_api");

  const liveResults = await Promise.all(
    liveProviders.map((provider) => {
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
            warnings: [`${provider.name} unavailable. No fetcher is implemented for this provider.`]
          });
      }
    })
  );

  return {
    edges: [...liveResults.flatMap((result) => result.edges), ...staticEdges],
    warnings: liveResults.flatMap((result) => result.warnings)
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
