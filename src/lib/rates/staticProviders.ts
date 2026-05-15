import type { Edge, EdgeBuildResult, Provider, ProviderHealth } from "@/lib/routing/types";

export function buildStaticEdges(providers: Provider[]): Edge[] {
  return providers.flatMap((provider) => {
    if (provider.rate_source !== "static" || !provider.pairs) {
      return [];
    }

    return provider.pairs.map((pair) => ({
      provider: provider.name,
      providerType: provider.type,
      from: pair.from.toUpperCase(),
      to: pair.to.toUpperCase(),
      rate: pair.rate,
      feePercent: provider.fee_model.fee_percent,
      feeFlat: provider.fee_model.fee_flat
    }));
  });
}

export function buildStaticEdgeResult(providers: Provider[]): EdgeBuildResult {
  const staticProviders = providers.filter((provider) => provider.rate_source === "static");
  const edges = buildStaticEdges(staticProviders);
  const providerHealth: ProviderHealth[] = staticProviders.map((provider) => {
    const edgeCount = provider.pairs?.length ?? 0;

    return {
      provider: provider.name,
      status: "static_loaded",
      edgeCount,
      message: `${edgeCount} configured static pairs loaded.`
    };
  });

  return {
    edges,
    warnings: [],
    providerHealth
  };
}
