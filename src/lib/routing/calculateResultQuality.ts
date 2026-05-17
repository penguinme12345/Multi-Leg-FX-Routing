import type { ProviderCoverage, ResultQuality } from "@/lib/routing/types";

export function calculateResultQuality(
  providerCoverage: ProviderCoverage,
  directBenchmarkExists: boolean
): ResultQuality {
  const { coveragePercent, totalProviders, usableProviders } = providerCoverage;

  if (coveragePercent >= 80) {
    return {
      label: "High Coverage",
      reason: `${usableProviders} of ${totalProviders} providers contributed usable data${
        directBenchmarkExists ? " and a direct benchmark was available." : ". No direct benchmark was available."
      }`
    };
  }

  if (coveragePercent >= 50) {
    return {
      label: "Partial Coverage",
      reason: `${usableProviders} of ${totalProviders} providers contributed usable data. Results were calculated using partial provider coverage.`
    };
  }

  if (coveragePercent > 0) {
    return {
      label: "Limited Coverage",
      reason: `Only ${usableProviders} of ${totalProviders} providers contributed usable data. Treat the recommendation as limited by provider availability.`
    };
  }

  return {
    label: "No Coverage",
    reason: "No providers contributed usable data. No route recommendation can be made."
  };
}
