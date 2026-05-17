import { CopyRouteSummaryButton } from "@/components/CopyRouteSummaryButton";
import { formatAmount, formatDifference, formatPercent, formatRate } from "@/components/format";
import { RouteComplexityBadge } from "@/components/RouteComplexityBadge";
import { RouteExplanation } from "@/components/RouteExplanation";
import { RoutePath } from "@/components/RoutePath";
import { RouteLegTable } from "@/components/RouteLegTable";
import { CalculationAuditTrail } from "@/components/CalculationAuditTrail";
import { RouteWarningNotice } from "@/components/RouteWarningNotice";
import type { RankedRouteResult } from "@/lib/routing/types";

type RouteCardProps = {
  route: RankedRouteResult;
  source: string;
  target: string;
  amount: number;
  warnings: string[];
};

export function RouteCard({ route, source, target, amount, warnings }: RouteCardProps) {
  const differenceClass =
    route.differenceVsDirect === null
      ? ""
      : route.differenceVsDirect >= 0
        ? " positive"
        : " negative";

  return (
    <article className="route-card">
      <div className="route-card__header">
        <div className="route-heading">
          <span className="rank-pill">{getRouteLabel(route.rank)}</span>
          <div>
            <h2 className="route-card-title">Provider route</h2>
            <RoutePath legs={route.legs} />
          </div>
        </div>
        <div className="route-values">
          <div className="final-amount">
            <span className="final-label">Final delivered</span>
            <span className="final-value">{formatAmount(route.finalAmount, target)}</span>
          </div>
          <div className="final-amount">
            <span className="final-label">Effective rate</span>
            <span className="final-value compact">
              {formatRate(route.effectiveRate)} {target} / {source}
            </span>
          </div>
        </div>
      </div>
      <div className="route-meta">
        <span className={`diff-badge${differenceClass}`}>
          {formatDifference(route.differenceVsDirect, target)}
        </span>
        <span className={`diff-badge${differenceClass}`}>
          {formatPercent(route.differenceVsDirectPercent)}
        </span>
        <span className="diff-badge">{route.legs.length} leg{route.legs.length === 1 ? "" : "s"}</span>
      </div>
      <div className="route-insights">
        <RouteWarningNotice warnings={route.routeWarnings} />
        <RouteComplexityBadge complexity={route.complexity} />
        <RouteExplanation explanation={route.explanation} rank={route.rank} />
        <CopyRouteSummaryButton
          amount={amount}
          route={route}
          source={source}
          target={target}
          warnings={warnings}
        />
      </div>
      <RouteLegTable legs={route.legs} />
      <CalculationAuditTrail legs={route.legs} />
    </article>
  );
}

function getRouteLabel(rank: number) {
  if (rank === 1) {
    return "#1 Recommended";
  }

  if (rank === 2) {
    return "#2 Fallback";
  }

  return "#3 Backup";
}
