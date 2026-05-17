import type { RouteLegResult } from "@/lib/routing/types";

type RoutePathProps = {
  legs: RouteLegResult[];
  compact?: boolean;
};

export function RoutePath({ legs, compact = false }: RoutePathProps) {
  if (legs.length === 0) {
    return null;
  }

  return (
    <span className={compact ? "route-path-flow compact" : "route-path-flow"}>
      <CurrencyCode value={legs[0].from} />
      {legs.map((leg, index) => (
        <span className="route-path-step" key={`${leg.provider}-${leg.from}-${leg.to}-${index}`}>
          <span className="route-arrow" aria-hidden="true">&rarr;</span>
          <span className="provider-badge">{leg.provider}</span>
          <span className="route-arrow" aria-hidden="true">&rarr;</span>
          <CurrencyCode value={leg.to} />
        </span>
      ))}
    </span>
  );
}

function CurrencyCode({ value }: { value: string }) {
  return <span className="currency-code">{value}</span>;
}
