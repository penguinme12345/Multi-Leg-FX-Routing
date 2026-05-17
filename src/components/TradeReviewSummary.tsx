import { formatAmount, formatDifference, formatPercent, formatRate } from "@/components/format";
import type {
  ProviderCoverage,
  RankedRouteResult,
  ResultQuality
} from "@/lib/routing/types";

type TradeReviewSummaryProps = {
  source: string;
  target: string;
  amount: number;
  recommendedRoute: RankedRouteResult | null;
  directBenchmark: RankedRouteResult | null;
  providerCoverage: ProviderCoverage;
  resultQuality: ResultQuality;
  warnings: string[];
  message?: string;
};

export function TradeReviewSummary({
  source,
  target,
  amount,
  recommendedRoute,
  directBenchmark,
  providerCoverage,
  resultQuality,
  warnings,
  message
}: TradeReviewSummaryProps) {
  const coverageText = `${providerCoverage.usableProviders} / ${providerCoverage.totalProviders} providers available`;

  return (
    <section className="panel trade-review">
      <div className="panel-heading">
        <div>
          <p className="eyebrow compact">Pre-trade review</p>
          <h2 className="section-title">Trade Review Summary</h2>
        </div>
        <span className={`quality-pill ${qualityTone(resultQuality.label)}`}>{resultQuality.label}</span>
      </div>

      {recommendedRoute ? (
        <div className="trade-review-body">
          <div className="trade-review-main">
            <div>
              <span className="review-label">Order</span>
              <strong>{formatAmount(amount, source)} to {target}</strong>
            </div>
            <div>
              <span className="review-label">Recommendation</span>
              <strong>Use Route #{recommendedRoute.rank}</strong>
            </div>
            <div className="review-wide">
              <span className="review-label">Recommended path</span>
              <strong>{formatProviderPath(recommendedRoute)}</strong>
            </div>
          </div>

          <div className="trade-review-metrics">
            <ReviewMetric label="Expected delivered" value={formatAmount(recommendedRoute.finalAmount, target)} primary />
            <ReviewMetric label="Effective rate" value={`${formatRate(recommendedRoute.effectiveRate)} ${target} / ${source}`} />
            <ReviewMetric
              label="Vs best direct"
              value={
                directBenchmark
                  ? `${formatDifference(recommendedRoute.differenceVsDirect, target)} (${formatPercent(recommendedRoute.differenceVsDirectPercent)})`
                  : "No direct route available for benchmark."
              }
            />
            <ReviewMetric label="Provider coverage" value={`${coverageText} (${providerCoverage.coveragePercent}%)`} />
            <ReviewMetric label="Operational complexity" value={recommendedRoute.complexity.level} />
            <ReviewMetric label="Provider count" value={String(new Set(recommendedRoute.legs.map((leg) => leg.provider)).size)} />
            <ReviewMetric label="Leg count" value={String(recommendedRoute.legs.length)} />
            <ReviewMetric label="Warning count" value={String(warnings.length)} />
          </div>

          <div className="review-note-stack">
            <p className="muted-copy">{resultQuality.reason}</p>
            {providerCoverage.unavailableProviders > 0 ? (
              <p className="coverage-warning">
                Results are based on partial provider coverage. {providerCoverage.usableProviders} of{" "}
                {providerCoverage.totalProviders} providers contributed usable data.
              </p>
            ) : null}
            <p className="decision-note">
              Decision-support only. This app does not execute trades or represent executable quotes.
            </p>
          </div>
        </div>
      ) : (
        <div className="trade-review-body">
          <div className="no-route-review">
            <h3>No route recommendation available</h3>
            <p>{message ?? "No valid route was found for the current order and route constraints."}</p>
            <ul>
              <li>Re-enable disabled providers.</li>
              <li>Loosen rail or complexity filters.</li>
              <li>Increase max legs if it is currently restricted.</li>
              <li>Try a supported currency pair from the order ticket.</li>
            </ul>
          </div>
          <div className="trade-review-metrics">
            <ReviewMetric label="Order" value={`${formatAmount(amount, source)} to ${target}`} />
            <ReviewMetric label="Provider coverage" value={`${coverageText} (${providerCoverage.coveragePercent}%)`} />
            <ReviewMetric label="Result quality" value={resultQuality.label} />
            <ReviewMetric label="Warning count" value={String(warnings.length)} />
          </div>
          <p className="decision-note">
            Decision-support only. This app does not execute trades or represent executable quotes.
          </p>
        </div>
      )}
    </section>
  );
}

function ReviewMetric({ label, value, primary = false }: { label: string; value: string; primary?: boolean }) {
  return (
    <div className={primary ? "review-metric primary" : "review-metric"}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatProviderPath(route: RankedRouteResult) {
  return route.legs
    .map((leg, index) => `${index === 0 ? leg.from : ""} ->[${leg.provider}]-> ${leg.to}`)
    .join(" ");
}

function qualityTone(label: ResultQuality["label"]) {
  if (label === "High Coverage") {
    return "good";
  }

  if (label === "Partial Coverage") {
    return "warn";
  }

  if (label === "Limited Coverage") {
    return "limited";
  }

  return "bad";
}
