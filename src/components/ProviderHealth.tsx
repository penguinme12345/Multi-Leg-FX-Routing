import type {
  ProviderCoverage,
  ProviderHealth as ProviderHealthType,
  ProviderHealthStatus,
  ResultQuality
} from "@/lib/routing/types";

type ProviderHealthProps = {
  providers: ProviderHealthType[];
  providerCoverage?: ProviderCoverage;
  resultQuality?: ResultQuality;
};

const statusLabels: Record<ProviderHealthStatus, string> = {
  online: "Online",
  static_loaded: "Static loaded",
  timeout: "Timeout",
  failed: "Failed",
  malformed_response: "Malformed",
  skipped: "Skipped",
  simulated_outage: "Simulated outage",
  missing_pair: "Missing pair"
};

const statusTone: Record<ProviderHealthStatus, string> = {
  online: "good",
  static_loaded: "neutral",
  timeout: "bad",
  failed: "bad",
  malformed_response: "bad",
  skipped: "warn",
  simulated_outage: "warn",
  missing_pair: "warn"
};

export function ProviderHealth({ providers, providerCoverage, resultQuality }: ProviderHealthProps) {
  if (providers.length === 0) {
    return null;
  }

  return (
    <section className="panel insight-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow compact">Reliability</p>
          <h2 className="section-title">Provider health</h2>
        </div>
        <div className="panel-heading-meta">
          <span className="result-context">{providers.length} providers checked</span>
          {providerCoverage ? (
            <span className="result-context">
              Coverage: {providerCoverage.usableProviders}/{providerCoverage.totalProviders} ({providerCoverage.coveragePercent}%)
            </span>
          ) : null}
          {resultQuality ? <span className="result-context">Quality: {resultQuality.label}</span> : null}
        </div>
      </div>
      <div className="health-grid">
        {providers.map((provider) => (
          <div className="health-row" key={provider.provider}>
            <div>
              <div className="health-provider">{provider.provider}</div>
              <div className="health-message">
                {provider.message ?? `${provider.edgeCount} rates loaded.`}
                {provider.checkedAt ? ` Last checked ${new Date(provider.checkedAt).toLocaleTimeString()}.` : ""}
              </div>
            </div>
            <span className={`status-chip ${statusTone[provider.status]}`}>
              {statusLabels[provider.status]}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
