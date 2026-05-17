import { formatAmount, formatRate } from "@/components/format";
import { RoutePath } from "@/components/RoutePath";
import type { RankedRouteResult } from "@/lib/routing/types";

type DirectBenchmarkCardProps = {
  route: RankedRouteResult | null;
  source: string;
  target: string;
};

export function DirectBenchmarkCard({ route, source, target }: DirectBenchmarkCardProps) {
  return (
    <section className="panel benchmark-card">
      <div className="panel-heading">
        <div>
          <p className="eyebrow compact">Benchmark</p>
          <h2 className="section-title">Best direct route</h2>
        </div>
      </div>
      {route ? (
        <div className="benchmark-body">
          <div className="benchmark-path">
            <RoutePath compact legs={route.legs} />
          </div>
          <div className="mini-metrics">
            <span>{formatAmount(route.finalAmount, target)}</span>
            <span>{formatRate(route.effectiveRate)} {target} / {source}</span>
            <span>Fees {formatAmount(route.legs[0].fee, source)}</span>
          </div>
        </div>
      ) : (
        <p className="muted-copy">No direct route is available with the current providers and filters.</p>
      )}
    </section>
  );
}
