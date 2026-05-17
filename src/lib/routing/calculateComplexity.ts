import type { RouteComplexity, RouteLegResult } from "@/lib/routing/types";

const STABLECOINS = new Set(["USDC", "USDT", "DAI"]);

export function calculateComplexity(legs: RouteLegResult[]): RouteComplexity {
  const uniqueProviders = new Set(legs.map((leg) => leg.provider));
  const intermediateCurrencies = Math.max(legs.length - 1, 0);
  const includesStablecoinRail = legs.some((leg) => STABLECOINS.has(leg.from) || STABLECOINS.has(leg.to));
  const usesMultipleRails =
    includesStablecoinRail && legs.some((leg) => leg.providerType === "fiat_broker");
  const reasons: string[] = [];

  if (legs.length === 1) {
    reasons.push("1 leg");
  } else {
    reasons.push(`${legs.length} legs`);
  }

  reasons.push(`${uniqueProviders.size} provider${uniqueProviders.size === 1 ? "" : "s"}`);

  if (intermediateCurrencies > 0) {
    reasons.push(`${intermediateCurrencies} intermediate currenc${intermediateCurrencies === 1 ? "y" : "ies"}`);
  }

  if (includesStablecoinRail) {
    reasons.push("includes stablecoin rail");
  }

  if (usesMultipleRails) {
    reasons.push("uses fiat and stablecoin rails");
  }

  if (
    legs.length >= 3 ||
    uniqueProviders.size >= 3 ||
    (includesStablecoinRail && uniqueProviders.size > 1)
  ) {
    return {
      level: "High",
      reasons
    };
  }

  if (legs.length >= 2 || uniqueProviders.size >= 2 || includesStablecoinRail) {
    return {
      level: "Medium",
      reasons
    };
  }

  return {
    level: "Low",
    reasons
  };
}

export function routeUsesStablecoin(legs: RouteLegResult[]) {
  return legs.some((leg) => STABLECOINS.has(leg.from) || STABLECOINS.has(leg.to));
}
