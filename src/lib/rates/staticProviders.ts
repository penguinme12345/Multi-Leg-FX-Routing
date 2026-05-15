import type { Edge, Provider } from "@/lib/routing/types";

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
