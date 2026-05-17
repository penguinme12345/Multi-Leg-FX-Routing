import { formatAmount, formatDifference, formatPercent, formatRate } from "@/components/format";
import { RouteComplexityBadge } from "@/components/RouteComplexityBadge";
import { RoutePath } from "@/components/RoutePath";
import { RouteWarningNotice } from "@/components/RouteWarningNotice";
import type { RankedRouteResult } from "@/lib/routing/types";

type RecommendedRouteCardProps = {
  route: RankedRouteResult | null;
  source: string;
  target: string;
};

export function RecommendedRouteCard({ route, source, target }: RecommendedRouteCardProps) {
  if (!route) {
    return (
      <section className="panel recommended-card muted-card">
        <p className="eyebrow compact">Recommended Route</p>
        <h2 className="section-title">No route selected</h2>
        <p className="muted-copy">Calculate an order to identify the best available route.</p>
      </section>
    );
  }

  const providerCount = new Set(route.legs.map((leg) => leg.provider)).size;
  const usesStablecoin = route.legs.some((leg) => ["USDC", "USDT", "DAI"].includes(leg.from) || ["USDC", "USDT", "DAI"].includes(leg.to));

  return (
    <section className="panel recommended-card">
      <div className="panel-heading hero-heading">
        <div>
          <p className="eyebrow compact">Recommended Route</p>
          <h2 className="section-title">#{route.rank} highest delivered amount</h2>
        </div>
        <RouteComplexityBadge complexity={route.complexity} />
      </div>
      <div className="recommended-body">
        <div className="recommended-path">
          <RoutePath legs={route.legs} />
        </div>
        <RouteWarningNotice warnings={route.routeWarnings} />
        <div className="metric-grid">
          <div className="metric-tile primary">
            <span>Final Delivered</span>
            <strong>{formatAmount(route.finalAmount, target)}</strong>
          </div>
          <div className="metric-tile">
            <span>Effective Rate</span>
            <strong>{formatRate(route.effectiveRate)} {target} / {source}</strong>
          </div>
          <div className="metric-tile">
            <span>Improvement vs Direct</span>
            <strong>{formatDifference(route.differenceVsDirect, target)}</strong>
            <small>{formatPercent(route.differenceVsDirectPercent)}</small>
          </div>
          <div className="metric-tile">
            <span>Operations</span>
            <strong>{route.legs.length} legs / {providerCount} providers</strong>
            <small>{usesStablecoin ? "Stablecoin rail included" : "Fiat-only route"}</small>
          </div>
        </div>
        <p className="recommended-reason">{route.explanation}</p>
      </div>
    </section>
  );
}
