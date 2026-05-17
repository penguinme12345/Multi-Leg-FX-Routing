import type { RouteComplexity } from "@/lib/routing/types";

type RouteComplexityBadgeProps = {
  complexity: RouteComplexity;
};

export function RouteComplexityBadge({ complexity }: RouteComplexityBadgeProps) {
  const tone = complexity.level.toLowerCase();

  return (
    <div className="complexity-block">
      <span className={`complexity-badge ${tone}`}>{complexity.level} Complexity</span>
      <span className="complexity-reasons">{complexity.reasons.join(", ")}</span>
    </div>
  );
}
