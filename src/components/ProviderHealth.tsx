import type { ProviderHealth as ProviderHealthType, ProviderHealthStatus } from "@/lib/routing/types";

type ProviderHealthProps = {
  providers: ProviderHealthType[];
};

const statusLabels: Record<ProviderHealthStatus, string> = {
  online: "Online",
  static_loaded: "Static loaded",
  timeout: "Timeout",
  failed: "Failed",
  malformed_response: "Malformed",
  skipped: "Skipped"
};

const statusTone: Record<ProviderHealthStatus, string> = {
  online: "good",
  static_loaded: "neutral",
  timeout: "bad",
  failed: "bad",
  malformed_response: "bad",
  skipped: "warn"
};

export function ProviderHealth({ providers }: ProviderHealthProps) {
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
        <span className="result-context">{providers.length} providers checked</span>
      </div>
      <div className="health-grid">
        {providers.map((provider) => (
          <div className="health-row" key={provider.provider}>
            <div>
              <div className="health-provider">{provider.provider}</div>
              <div className="health-message">{provider.message ?? `${provider.edgeCount} rates loaded.`}</div>
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
