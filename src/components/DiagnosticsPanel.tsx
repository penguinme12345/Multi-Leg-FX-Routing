import { formatDateTime } from "@/components/format";
import type { ProviderCoverage, ResultQuality, RouteDiagnostics } from "@/lib/routing/types";

type DiagnosticsPanelProps = {
  diagnostics: RouteDiagnostics;
  providerCoverage?: ProviderCoverage;
  resultQuality?: ResultQuality;
};

export function DiagnosticsPanel({ diagnostics, providerCoverage, resultQuality }: DiagnosticsPanelProps) {
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
    </section>
  );
}
