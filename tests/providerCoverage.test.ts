import { describe, expect, it } from "vitest";
import { calculateProviderCoverage } from "../src/lib/routing/calculateProviderCoverage";
import { calculateResultQuality } from "../src/lib/routing/calculateResultQuality";
import type { ProviderHealth } from "../src/lib/routing/types";

function health(provider: string, status: ProviderHealth["status"]): ProviderHealth {
  return {
    provider,
    status,
    edgeCount: status === "online" || status === "static_loaded" ? 5 : 0
  };
}

describe("calculateProviderCoverage", () => {
  it("counts all online and static providers as usable", () => {
    const coverage = calculateProviderCoverage([
      health("AlphaFX", "online"),
      health("BetaBank", "online"),
      health("GammaCrypto", "static_loaded")
    ]);

    expect(coverage.usableProviders).toBe(3);
    expect(coverage.totalProviders).toBe(3);
    expect(coverage.unavailableProviders).toBe(0);
    expect(coverage.coveragePercent).toBe(100);
  });

  it("counts provider failures as unavailable", () => {
    const coverage = calculateProviderCoverage([
      health("AlphaFX", "online"),
      health("BetaBank", "timeout"),
      health("GammaCrypto", "static_loaded"),
      health("DeltaMarkets", "malformed_response")
    ]);

    expect(coverage.usableProviders).toBe(2);
    expect(coverage.unavailableProviders).toBe(2);
    expect(coverage.coveragePercent).toBe(50);
    expect(coverage.unavailableProviderNames).toEqual(["BetaBank", "DeltaMarkets"]);
  });

  it("counts simulated outages as unavailable", () => {
    const coverage = calculateProviderCoverage([
      health("AlphaFX", "simulated_outage"),
      health("BetaBank", "online"),
      health("GammaCrypto", "simulated_outage")
    ]);

    expect(coverage.usableProviders).toBe(1);
    expect(coverage.unavailableProviders).toBe(2);
    expect(coverage.coveragePercent).toBe(33);
  });
});

describe("calculateResultQuality", () => {
  it("labels high coverage at or above 80 percent", () => {
    const quality = calculateResultQuality(
      {
        totalProviders: 6,
        usableProviders: 5,
        unavailableProviders: 1,
        coveragePercent: 83,
        usableProviderNames: [],
        unavailableProviderNames: []
      },
      true
    );

    expect(quality.label).toBe("High Coverage");
    expect(quality.reason).toContain("direct benchmark");
  });

  it("labels partial coverage between 50 and 79 percent", () => {
    const quality = calculateResultQuality(
      {
        totalProviders: 6,
        usableProviders: 4,
        unavailableProviders: 2,
        coveragePercent: 67,
        usableProviderNames: [],
        unavailableProviderNames: []
      },
      false
    );

    expect(quality.label).toBe("Partial Coverage");
  });

  it("labels limited coverage below 50 percent but above zero", () => {
    const quality = calculateResultQuality(
      {
        totalProviders: 6,
        usableProviders: 2,
        unavailableProviders: 4,
        coveragePercent: 33,
        usableProviderNames: [],
        unavailableProviderNames: []
      },
      false
    );

    expect(quality.label).toBe("Limited Coverage");
  });

  it("labels no coverage at zero percent", () => {
    const quality = calculateResultQuality(
      {
        totalProviders: 6,
        usableProviders: 0,
        unavailableProviders: 6,
        coveragePercent: 0,
        usableProviderNames: [],
        unavailableProviderNames: []
      },
      false
    );

    expect(quality.label).toBe("No Coverage");
  });
});
