import { formatAmount, formatDifference, formatPercent, formatRate } from "@/components/format";
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
              <th>Path</th>
              <th className="numeric">Final Delivered</th>
              <th className="numeric">Effective Rate</th>
              <th className="numeric">Vs Direct</th>
              <th className="numeric">Vs Direct %</th>
              <th>Complexity</th>
              <th className="numeric">Legs</th>
              <th className="numeric">Providers</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={`${route.rank}-${route.path.join("-")}`}>
                <td>#{route.rank}</td>
                <td>{route.path.join(" -> ")}</td>
                <td className="numeric">{formatAmount(route.finalAmount, target)}</td>
                <td className="numeric">{formatRate(route.effectiveRate)} {target} / {source}</td>
                <td className="numeric">{formatDifference(route.differenceVsDirect, target)}</td>
                <td className="numeric">{formatPercent(route.differenceVsDirectPercent)}</td>
                <td>{route.complexity.level}</td>
                <td className="numeric">{route.legs.length}</td>
                <td className="numeric">{new Set(route.legs.map((leg) => leg.provider)).size}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
