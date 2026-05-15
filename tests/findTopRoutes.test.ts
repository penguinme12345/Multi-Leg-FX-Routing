import { describe, expect, it } from "vitest";
import { findTopRoutes } from "../src/lib/routing/findTopRoutes";
import type { Edge } from "../src/lib/routing/types";

const edges: Edge[] = [
  {
    provider: "DirectSlow",
    providerType: "fiat_broker",
    from: "GBP",
    to: "JPY",
    rate: 180,
    feePercent: 0,
    feeFlat: 0
  },
  {
    provider: "DirectBest",
    providerType: "fiat_broker",
    from: "GBP",
    to: "JPY",
    rate: 181,
    feePercent: 0,
    feeFlat: 0
  },
  {
    provider: "HubA",
    providerType: "fiat_broker",
    from: "GBP",
    to: "USD",
    rate: 1.25,
    feePercent: 0,
    feeFlat: 0
  },
  {
    provider: "HubB",
    providerType: "fiat_broker",
    from: "USD",
    to: "JPY",
    rate: 150,
    feePercent: 0,
    feeFlat: 0
  },
  {
    provider: "DeadEnd",
    providerType: "fiat_broker",
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

  it("returns an empty list when no valid route exists", () => {
    const routes = findTopRoutes("CAD", "CHF", 1000, edges);

    expect(routes).toEqual([]);
  });
});
