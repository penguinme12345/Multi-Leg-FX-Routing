import { describe, expect, it } from "vitest";
import { simulateRoute } from "../src/lib/routing/simulateRoute";
import type { Edge } from "../src/lib/routing/types";

describe("simulateRoute", () => {
  it("applies percentage and flat fees before conversion on one leg", () => {
    const route: Edge[] = [
      {
        provider: "TestBank",
        providerType: "fiat_broker",
        rateSource: "live_api",
        from: "GBP",
        to: "USD",
        rate: 1.25,
        feePercent: 0.01,
        feeFlat: 5
      }
    ];

    const result = simulateRoute(route, 1000);

    expect(result).not.toBeNull();
    expect(result?.legs[0].fee).toBeCloseTo(15);
    expect(result?.legs[0].amountAfterFee).toBeCloseTo(985);
    expect(result?.finalAmount).toBeCloseTo(1231.25);
  });

  it("uses the previous output as the next leg input", () => {
    const route: Edge[] = [
      {
        provider: "ProviderA",
        providerType: "fiat_broker",
        rateSource: "live_api",
        from: "GBP",
        to: "USD",
        rate: 2,
        feePercent: 0,
        feeFlat: 10
      },
      {
        provider: "ProviderB",
        providerType: "stablecoin_venue",
        rateSource: "configured_static",
        from: "USD",
        to: "JPY",
        rate: 100,
        feePercent: 0.01,
        feeFlat: 0
      }
    ];

    const result = simulateRoute(route, 100);

    expect(result).not.toBeNull();
    expect(result?.legs[0].outputAmount).toBeCloseTo(180);
    expect(result?.legs[1].inputAmount).toBeCloseTo(180);
    expect(result?.finalAmount).toBeCloseTo(17820);
  });

  it("rejects a route when the fee consumes the leg input", () => {
    const route: Edge[] = [
      {
        provider: "FlatFeeProvider",
        providerType: "fiat_broker",
        rateSource: "live_api",
        from: "CAD",
        to: "AUD",
        rate: 1.1,
        feePercent: 0,
        feeFlat: 100
      }
    ];

    expect(simulateRoute(route, 100)).toBeNull();
  });
});
