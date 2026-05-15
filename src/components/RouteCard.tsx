import { formatAmount, formatDifference } from "@/components/format";
import { RouteLegTable } from "@/components/RouteLegTable";
import type { RankedRouteResult } from "@/lib/routing/types";

type RouteCardProps = {
  route: RankedRouteResult;
  target: string;
};

export function RouteCard({ route, target }: RouteCardProps) {
  const providerPath = route.legs
    .map((leg) => `${leg.from} -[${leg.provider}]-> ${leg.to}`)
    .join("  ");
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
          <span className="rank-pill">#{route.rank}</span>
          <div>
            <h2 className="route-path">{route.path.join(" -> ")}</h2>
            <div className="provider-path">{providerPath}</div>
          </div>
        </div>
        <div className="final-amount">
          <span className="final-label">Final delivered</span>
          <span className="final-value">{formatAmount(route.finalAmount, target)}</span>
        </div>
      </div>
      <div className="route-meta">
        <span className={`diff-badge${differenceClass}`}>
          {formatDifference(route.differenceVsDirect, target)}
        </span>
        <span className="diff-badge">{route.legs.length} leg{route.legs.length === 1 ? "" : "s"}</span>
      </div>
      <RouteLegTable legs={route.legs} />
    </article>
  );
}
