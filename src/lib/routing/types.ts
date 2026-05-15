export type ProviderType = "fiat_broker" | "stablecoin_venue";
export type RateSource = "live_api" | "static";

export type StaticPair = {
  from: string;
  to: string;
  rate: number;
};

export type Provider = {
  name: string;
  type: ProviderType;
  rate_source: RateSource;
  api?: {
    endpoint: string;
    docs: string;
  };
  fee_model: {
    fee_percent: number;
    fee_flat: number;
    fee_currency: "source";
  };
  pairs?: StaticPair[];
};

export type Edge = {
  provider: string;
  providerType: ProviderType;
  from: string;
  to: string;
  rate: number;
  feePercent: number;
  feeFlat: number;
};

export type EdgeBuildResult = {
  edges: Edge[];
  warnings: string[];
};

export type RouteLegResult = {
  provider: string;
  from: string;
  to: string;
  rate: number;
  inputAmount: number;
  fee: number;
  amountAfterFee: number;
  outputAmount: number;
};

export type RouteResult = {
  path: string[];
  legs: RouteLegResult[];
  finalAmount: number;
  differenceVsDirect: number | null;
};

export type RankedRouteResult = RouteResult & {
  rank: number;
};

export type RoutesResponse = {
  source: string;
  target: string;
  amount: number;
  routes: RankedRouteResult[];
  warnings: string[];
  message?: string;
};
