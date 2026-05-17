import { formatAmount, formatPercent } from "@/components/format";
import { RoutePath } from "@/components/RoutePath";
import type { RankedRouteResult } from "@/lib/routing/types";

type RouteComparisonTableProps = {
  routes: RankedRouteResult[];
  source: string;
  target: string;
};

export function RouteComparisonTable({ routes, source, target }: RouteComparisonTableProps) {
  if (routes.length === 0) {
    return null;
  }

  return (
    <section className="panel insight-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow compact">Compare</p>
          <h2 className="section-title">Route comparison</h2>
        </div>
      </div>
      <div className="table-wrap compact-table">
        <table className="leg-table comparison-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Route</th>
              <th className="numeric">Final Delivered</th>
              <th className="numeric">Vs Direct</th>
              <th>Complexity</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={`${route.rank}-${route.path.join("-")}-${route.legs.map((leg) => leg.provider).join("-")}`}>
                <td>#{route.rank}</td>
                <td className="route-cell"><RoutePath compact legs={route.legs} /></td>
                <td className="numeric">{formatAmount(route.finalAmount, target)}</td>
                <td className="numeric">{formatPercent(route.differenceVsDirectPercent)}</td>
                <td>{route.complexity.level}</td>
                <td>
                  {route.routeWarnings.some((warning) => warning.severity === "review_required") ? (
                    <span className="review-status-pill warn">Review Required</span>
                  ) : (
                    <span className="review-status-pill clear">Clear</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
