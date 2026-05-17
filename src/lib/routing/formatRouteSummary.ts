import type { RankedRouteResult } from "@/lib/routing/types";

type SummaryInput = {
  route: RankedRouteResult;
  source: string;
  target: string;
  amount: number;
  warnings?: string[];
};

export function formatRouteSummary({ route, source, target, amount, warnings = [] }: SummaryInput) {
  const providerPath = route.legs
    .map((leg, index) => {
      if (index === 0) {
        return `${leg.from} ->[${leg.provider}]-> ${leg.to}`;
      }

      return ` ->[${leg.provider}]-> ${leg.to}`;
    })
    .join("");
  const directComparison =
    route.differenceVsDirect === null
      ? "No direct route available"
      : `${route.differenceVsDirect >= 0 ? "+" : ""}${formatNumber(route.differenceVsDirect)} ${target}`;
  const warningText = warnings.length ? `\nProvider notes:\n${warnings.map((warning) => `- ${warning}`).join("\n")}` : "";
  const routeWarningText = route.routeWarnings.length
    ? `\nRoute review:\n${route.routeWarnings.map((warning) => `- Review Required: ${warning.message}`).join("\n")}`
    : "";

  return `Route #${route.rank}

Path:
${providerPath}

Input:
${formatNumber(amount)} ${source}

Final delivered:
${formatNumber(route.finalAmount)} ${target}

Effective rate:
${formatNumber(route.effectiveRate)} ${target} / ${source}

Difference vs direct:
${directComparison}

Complexity:
${route.complexity.level} (${route.complexity.reasons.join(", ")})

Notes:
${route.explanation}${routeWarningText}${warningText}`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}
