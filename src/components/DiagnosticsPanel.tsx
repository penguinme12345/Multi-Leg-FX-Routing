import { formatDateTime } from "@/components/format";
import type { ProviderCoverage, ResultQuality, RouteDiagnostics } from "@/lib/routing/types";

type DiagnosticsPanelProps = {
  diagnostics: RouteDiagnostics;
  providerCoverage?: ProviderCoverage;
  resultQuality?: ResultQuality;
};

export function DiagnosticsPanel({ diagnostics, providerCoverage, resultQuality }: DiagnosticsPanelProps) {
  const { routeGraphStats } = diagnostics;

  return (
    <section className="panel diagnostics-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow compact">Diagnostics</p>
          <h2 className="section-title">Data freshness</h2>
        </div>
      </div>
      <div className="diagnostic-grid">
        <span>Rates fetched at <strong>{formatDateTime(diagnostics.calculatedAt)}</strong></span>
        <span>Cache <strong>{diagnostics.cacheStatus === "live_or_cached" ? "live or memory cache" : diagnostics.cacheStatus}</strong></span>
        <span>Live providers used <strong>{diagnostics.liveProvidersUsed}/3</strong></span>
        <span>Static providers loaded <strong>{diagnostics.staticProvidersLoaded}/3</strong></span>
        <span>Unavailable/disabled <strong>{diagnostics.failedProviders}</strong></span>
        <span>
          Provider coverage{" "}
          <strong>
            {providerCoverage
              ? `${providerCoverage.usableProviders}/${providerCoverage.totalProviders} (${providerCoverage.coveragePercent}%)`
              : `${diagnostics.providerCoveragePercent}%`}
          </strong>
        </span>
        <span>Result quality <strong>{resultQuality?.label ?? diagnostics.resultQualityLabel}</strong></span>
        <span>Filters <strong>{diagnostics.railFilter}, max {diagnostics.maxLegs} legs</strong></span>
      </div>
      <p className="precision-note">
        Financial precision note: demo uses JavaScript numbers and presentation-layer rounding. Production systems should use decimal or fixed-point arithmetic.
      </p>
      <div className="diagnostic-section">
        <h3>Route Graph</h3>
        <div className="diagnostic-grid route-graph-grid">
          <span>Currencies <strong>{routeGraphStats.currencyCount}</strong></span>
          <span>Edges loaded <strong>{routeGraphStats.edgeCount}</strong></span>
          <span>Candidates evaluated <strong>{routeGraphStats.candidateRouteCount}</strong></span>
          <span>Valid routes <strong>{routeGraphStats.validRouteCount}</strong></span>
          <span>Returned <strong>{routeGraphStats.returnedRouteCount}</strong></span>
          <span>Invalid routes <strong>{routeGraphStats.invalidRouteCount ?? 0}</strong></span>
        </div>
      </div>
    </section>
  );
}
