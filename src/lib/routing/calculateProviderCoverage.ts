import type { ProviderCoverage, ProviderHealth, ProviderHealthStatus } from "@/lib/routing/types";

const usableStatuses = new Set<ProviderHealthStatus>(["online", "static_loaded"]);

export function calculateProviderCoverage(providerHealth: ProviderHealth[]): ProviderCoverage {
  const providerStatuses = new Map<string, ProviderHealthStatus>();

  providerHealth.forEach((provider) => {
    providerStatuses.set(provider.provider, provider.status);
  });

  const usableProviderNames: string[] = [];
  const unavailableProviderNames: string[] = [];

  providerStatuses.forEach((status, provider) => {
    if (usableStatuses.has(status)) {
      usableProviderNames.push(provider);
    } else {
      unavailableProviderNames.push(provider);
    }
  });

  const totalProviders = providerStatuses.size;
  const usableProviders = usableProviderNames.length;
  const unavailableProviders = unavailableProviderNames.length;
  const coveragePercent = totalProviders === 0 ? 0 : Math.round((usableProviders / totalProviders) * 100);

  return {
    totalProviders,
    usableProviders,
    unavailableProviders,
    coveragePercent,
    usableProviderNames,
    unavailableProviderNames
  };
}
