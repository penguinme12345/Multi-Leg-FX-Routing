import { describe, expect, it } from "vitest";
import { buildStaticEdgeResult, buildStaticEdges } from "../src/lib/rates/staticProviders";
import type { Provider } from "../src/lib/routing/types";

const providers: Provider[] = [
  {
    name: "StaticVenue",
    type: "stablecoin_venue",
    rate_source: "static",
    fee_model: {
      fee_percent: 0.001,
      fee_flat: 1,
      fee_currency: "source"
    },
    pairs: [
      {
        from: "usd",
        to: "usdt",
        rate: 0.999
      }
    ]
  },
  {
    name: "LiveBank",
    type: "fiat_broker",
    rate_source: "live_api",
    fee_model: {
      fee_percent: 0.001,
      fee_flat: 0,
      fee_currency: "source"
    }
  }
];

describe("static provider normalization", () => {
  it("converts static pairs into normalized edges", () => {
    const [edge] = buildStaticEdges(providers);

    expect(edge).toMatchObject({
      provider: "StaticVenue",
      providerType: "stablecoin_venue",
      from: "USD",
      to: "USDT",
      rate: 0.999,
      feePercent: 0.001,
      feeFlat: 1
    });
  });

  it("reports static provider health", () => {
    const result = buildStaticEdgeResult(providers);

    expect(result.providerHealth[0]).toMatchObject({
      provider: "StaticVenue",
      status: "static_loaded",
      edgeCount: 1,
      message: "1 configured static pairs loaded."
    });
    expect(result.providerHealth[0].checkedAt).toEqual(expect.any(String));
  });
});
