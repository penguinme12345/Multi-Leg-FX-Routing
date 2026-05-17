import { describe, expect, it } from "vitest";
import { findTopRoutes } from "../src/lib/routing/findTopRoutes";
import type { Edge } from "../src/lib/routing/types";

const edges: Edge[] = [
  {
    provider: "DirectSlow",
    providerType: "fiat_broker",
    rateSource: "live_api",
    from: "GBP",
    to: "JPY",
    rate: 180,
    feePercent: 0,
    feeFlat: 0
  },
  {
    provider: "DirectBest",
    providerType: "fiat_broker",
    rateSource: "live_api",
    from: "GBP",
    to: "JPY",
    rate: 181,
    feePercent: 0,
    feeFlat: 0
  },
  {
    provider: "HubA",
    providerType: "fiat_broker",
    rateSource: "live_api",
    from: "GBP",
    to: "USD",
    rate: 1.25,
    feePercent: 0,
    feeFlat: 0
  },
  {
    provider: "HubB",
    providerType: "fiat_broker",
    rateSource: "live_api",
    from: "USD",
    to: "JPY",
    rate: 150,
    feePercent: 0,
    feeFlat: 0
  },
  {
    provider: "DeadEnd",
    providerType: "fiat_broker",
    rateSource: "live_api",
    from: "USD",
    to: "CAD",
    rate: 1.2,
    feePercent: 0,
    feeFlat: 0
  }
];

describe("findTopRoutes", () => {
  it("ranks routes by final delivered amount", () => {
    const routes = findTopRoutes("GBP", "JPY", 1000, edges);

    expect(routes).toHaveLength(3);
    expect(routes[0].path).toEqual(["GBP", "USD", "JPY"]);
    expect(routes[0].finalAmount).toBeCloseTo(187500);
    expect(routes[1].legs[0].provider).toBe("DirectBest");
  });

  it("compares every route against the best direct route", () => {
    const [bestRoute] = findTopRoutes("GBP", "JPY", 1000, edges);

    expect(bestRoute.differenceVsDirect).toBeCloseTo(6500);
  });

  it("flags routes with unusually large improvement versus direct for review", () => {
    const reviewEdges: Edge[] = [
      {
        provider: "Direct",
        providerType: "fiat_broker",
        rateSource: "live_api",
        from: "USD",
        to: "EUR",
        rate: 1,
        feePercent: 0,
        feeFlat: 0
      },
      {
        provider: "StaticVenue",
        providerType: "stablecoin_venue",
        rateSource: "configured_static",
        from: "USD",
        to: "USDT",
        rate: 1.06,
        feePercent: 0,
        feeFlat: 0
      },
      {
        provider: "StaticVenue",
        providerType: "stablecoin_venue",
        rateSource: "configured_static",
        from: "USDT",
        to: "EUR",
        rate: 1,
        feePercent: 0,
        feeFlat: 0
      }
    ];
    const [bestRoute] = findTopRoutes("USD", "EUR", 1000, reviewEdges);

    expect(bestRoute.differenceVsDirectPercent).toBeGreaterThan(5);
    expect(bestRoute.routeWarnings[0]).toMatchObject({
      severity: "review_required"
    });
  });

  it("returns an empty list when no valid route exists", () => {
    const routes = findTopRoutes("CAD", "CHF", 1000, edges);

    expect(routes).toEqual([]);
  });
});
