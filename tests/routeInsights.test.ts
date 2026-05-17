import { describe, expect, it } from "vitest";
import { calculateComplexity } from "../src/lib/routing/calculateComplexity";
import { calculateEffectiveRate } from "../src/lib/routing/calculateEffectiveRate";
import { explainRoute } from "../src/lib/routing/explainRoute";
import { filterDisabledEdges, filterDisabledProviders } from "../src/lib/routing/filterProviders";
import { formatRouteSummary } from "../src/lib/routing/formatRouteSummary";
import type { Edge, Provider, RankedRouteResult, RouteLegResult } from "../src/lib/routing/types";

const directLeg: RouteLegResult = {
  provider: "AlphaFX",
  providerType: "fiat_broker",
  from: "GBP",
  to: "JPY",
  rate: 190,
  feePercent: 0.0015,
  feeFlat: 0,
  inputAmount: 1000,
  fee: 1.5,
  amountAfterFee: 998.5,
  outputAmount: 189715
};

const stablecoinLegs: RouteLegResult[] = [
  {
    provider: "BetaBank",
    providerType: "fiat_broker",
    from: "GBP",
    to: "USD",
    rate: 1.25,
    feePercent: 0.0008,
    feeFlat: 25,
    inputAmount: 1000,
    fee: 25,
    amountAfterFee: 975,
    outputAmount: 1218.75
  },
  {
    provider: "GammaCrypto",
    providerType: "stablecoin_venue",
    from: "USD",
    to: "USDT",
    rate: 0.999,
    feePercent: 0.001,
    feeFlat: 1,
    inputAmount: 1218.75,
    fee: 2,
    amountAfterFee: 1216.75,
    outputAmount: 1215.53325
  },
  {
    provider: "EpsilonChain",
    providerType: "stablecoin_venue",
    from: "USDT",
    to: "JPY",
    rate: 152,
    feePercent: 0.0012,
    feeFlat: 2,
    inputAmount: 1215.53325,
    fee: 3,
    amountAfterFee: 1212.53325,
    outputAmount: 184305.054
  }
];

describe("route insight helpers", () => {
  it("calculates effective rate as final amount divided by starting amount", () => {
    expect(calculateEffectiveRate(192430, 1000)).toBeCloseTo(192.43);
  });

  it("marks a simple direct fiat route as low complexity", () => {
    const complexity = calculateComplexity([directLeg]);

    expect(complexity.level).toBe("Low");
    expect(complexity.reasons).toContain("1 leg");
  });

  it("marks a 3-leg stablecoin route as high complexity", () => {
    const complexity = calculateComplexity(stablecoinLegs);

    expect(complexity.level).toBe("High");
    expect(complexity.reasons).toContain("3 legs");
    expect(complexity.reasons).toContain("includes stablecoin rail");
  });

  it("explains a winning stablecoin route without hardcoded route names", () => {
    const route: RankedRouteResult = {
      rank: 1,
      path: ["GBP", "USD", "USDT", "JPY"],
      legs: stablecoinLegs,
      finalAmount: 184305.054,
      effectiveRate: 184.305054,
      differenceVsDirect: 1000,
      differenceVsDirectPercent: 0.54,
      complexity: calculateComplexity(stablecoinLegs),
      explanation: ""
    };

    expect(explainRoute(route, 1)).toContain("stablecoin leg");
  });

  it("formats a shareable route summary", () => {
    const route: RankedRouteResult = {
      rank: 1,
      path: ["GBP", "JPY"],
      legs: [directLeg],
      finalAmount: 189715,
      effectiveRate: 189.715,
      differenceVsDirect: 0,
      differenceVsDirectPercent: 0,
      complexity: calculateComplexity([directLeg]),
      explanation: "Direct route wins on simplicity."
    };

    const summary = formatRouteSummary({
      route,
      source: "GBP",
      target: "JPY",
      amount: 1000
    });

    expect(summary).toContain("Route #1");
    expect(summary).toContain("GBP ->[AlphaFX]-> JPY");
    expect(summary).toContain("189,715.00 JPY");
    expect(summary).toContain("Low");
  });
});

describe("disabled provider filtering", () => {
  it("excludes disabled providers before fetching or routing", () => {
    const providers: Provider[] = [
      {
        name: "AlphaFX",
        type: "fiat_broker",
        rate_source: "live_api",
        fee_model: {
          fee_percent: 0,
          fee_flat: 0,
          fee_currency: "source"
        }
      },
      {
        name: "GammaCrypto",
        type: "stablecoin_venue",
        rate_source: "static",
        fee_model: {
          fee_percent: 0,
          fee_flat: 0,
          fee_currency: "source"
        },
        pairs: []
      }
    ];
    const edges: Edge[] = [
      {
        provider: "AlphaFX",
        providerType: "fiat_broker",
        from: "GBP",
        to: "JPY",
        rate: 190,
        feePercent: 0,
        feeFlat: 0
      },
      {
        provider: "GammaCrypto",
        providerType: "stablecoin_venue",
        from: "GBP",
        to: "USDT",
        rate: 1.26,
        feePercent: 0,
        feeFlat: 0
      }
    ];

    expect(filterDisabledProviders(providers, ["AlphaFX"]).map((provider) => provider.name)).toEqual([
      "GammaCrypto"
    ]);
    expect(filterDisabledEdges(edges, ["GammaCrypto"]).map((edge) => edge.provider)).toEqual(["AlphaFX"]);
  });
});
