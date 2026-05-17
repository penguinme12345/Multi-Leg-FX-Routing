export type ProviderType = "fiat_broker" | "stablecoin_venue";
export type ProviderRateSource = "live_api" | "static";
export type RateSource = "live_api" | "configured_static";
export type RailFilter = "all" | "fiat_only" | "stablecoin_allowed" | "stablecoin_only";
export type ComplexityFilter = "all" | "low" | "low_medium" | "high_allowed";

export type StaticPair = {
  from: string;
  to: string;
  rate: number;
};

export type Provider = {
  name: string;
  type: ProviderType;
  rate_source: ProviderRateSource;
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
  rateSource: RateSource;
  from: string;
  to: string;
  rate: number;
  feePercent: number;
  feeFlat: number;
};

export type EdgeBuildResult = {
  edges: Edge[];
  warnings: string[];
  providerHealth: ProviderHealth[];
};

export type ProviderHealthStatus =
  | "online"
  | "static_loaded"
  | "timeout"
  | "failed"
  | "malformed_response"
  | "skipped"
  | "simulated_outage"
  | "missing_pair";

export type ProviderHealth = {
  provider: string;
  status: ProviderHealthStatus;
  edgeCount: number;
  message?: string;
  checkedAt?: string;
};

export type RouteLegResult = {
  provider: string;
  providerType: ProviderType;
  rateSource: RateSource;
  from: string;
  to: string;
  rate: number;
  feePercent: number;
  feeFlat: number;
  inputAmount: number;
  fee: number;
  amountAfterFee: number;
  outputAmount: number;
};

export type RouteComplexity = {
  level: "Low" | "Medium" | "High";
  reasons: string[];
};

export type ProviderCoverage = {
  totalProviders: number;
  usableProviders: number;
  unavailableProviders: number;
  coveragePercent: number;
  usableProviderNames: string[];
  unavailableProviderNames: string[];
};

export type ResultQuality = {
  label: "High Coverage" | "Partial Coverage" | "Limited Coverage" | "No Coverage";
  reason: string;
};

export type RouteWarning = {
  severity: "review_required";
  message: string;
};

export type ReviewStatus = {
  status: "clear" | "review_required";
  reason: string;
};

export type RouteResult = {
  path: string[];
  legs: RouteLegResult[];
  finalAmount: number;
  effectiveRate: number;
  differenceVsDirect: number | null;
  differenceVsDirectPercent: number | null;
  complexity: RouteComplexity;
  routeWarnings: RouteWarning[];
  explanation: string;
};

export type RankedRouteResult = RouteResult & {
  rank: number;
};

export type AmountSensitivityPoint = {
  amount: number;
  path: string[] | null;
  providerSequence: string[];
  finalAmount: number | null;
  effectiveRate: number | null;
  differenceVsDirect: number | null;
  differenceVsDirectPercent: number | null;
  complexity: RouteComplexity | null;
  reviewRequired: boolean;
  message?: string;
};

export type RouteGraphStats = {
  currencyCount: number;
  edgeCount: number;
  candidateRouteCount: number;
  validRouteCount: number;
  returnedRouteCount: number;
  invalidRouteCount?: number;
};

export type RouteDiagnostics = {
  calculatedAt: string;
  cacheStatus: "live_or_cached";
  liveProvidersUsed: number;
  staticProvidersLoaded: number;
  failedProviders: number;
  failedOrDisabledProviders: number;
  disabledProviders: number;
  providerCoveragePercent: number;
  resultQualityLabel: ResultQuality["label"];
  maxLegs: number;
  activeMaxLegs: number;
  railFilter: RailFilter;
  activeRailFilter: RailFilter;
  complexityFilter: ComplexityFilter;
  activeComplexityFilter: ComplexityFilter;
  routeGraphStats: RouteGraphStats;
};

export type RoutesResponse = {
  source: string;
  target: string;
  amount: number;
  disabledProviders: string[];
  maxLegs: number;
  railFilter: RailFilter;
  complexityFilter: ComplexityFilter;
  routes: RankedRouteResult[];
  directBenchmark: RankedRouteResult | null;
  providerHealth: ProviderHealth[];
  providerCoverage: ProviderCoverage;
  resultQuality: ResultQuality;
  amountSensitivity: AmountSensitivityPoint[];
  diagnostics: RouteDiagnostics;
  warnings: string[];
  message?: string;
};
