import type { Edge, Provider, ProviderHealth } from "@/lib/routing/types";

export function normalizeDisabledProviders(disabledProviders: unknown, providerNames: string[]) {
  if (!Array.isArray(disabledProviders)) {
    return [];
  }

  const validProviderNames = new Map(providerNames.map((name) => [name.toLowerCase(), name]));
  const normalized = new Set<string>();

  disabledProviders.forEach((provider) => {
    if (typeof provider !== "string") {
      return;
    }

    const matchedProvider = validProviderNames.get(provider.trim().toLowerCase());

    if (matchedProvider) {
      normalized.add(matchedProvider);
    }
  });

  return [...normalized];
}

export function filterDisabledProviders(providers: Provider[], disabledProviders: string[]) {
  const disabled = new Set(disabledProviders);

  return providers.filter((provider) => !disabled.has(provider.name));
}

export function filterDisabledEdges(edges: Edge[], disabledProviders: string[]) {
  const disabled = new Set(disabledProviders);

  return edges.filter((edge) => !disabled.has(edge.provider));
}

export function buildSimulatedOutageHealth(disabledProviders: string[]): ProviderHealth[] {
  return disabledProviders.map((provider) => ({
    provider,
    status: "simulated_outage",
    edgeCount: 0,
    checkedAt: new Date().toISOString(),
    message: "Provider manually disabled for outage simulation."
  }));
}

export function buildSimulatedOutageWarnings(disabledProviders: string[]) {
  return disabledProviders.map((provider) => `${provider} manually disabled for outage simulation.`);
}
