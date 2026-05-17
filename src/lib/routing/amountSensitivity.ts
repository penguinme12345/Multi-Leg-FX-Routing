import { findTopRoutes } from "@/lib/routing/findTopRoutes";
import type { AmountSensitivityPoint, ComplexityFilter, Edge, RailFilter } from "@/lib/routing/types";

export const DEFAULT_SENSITIVITY_AMOUNTS = [100, 1000, 10000, 100000];

export function buildAmountSensitivity(
  source: string,
  target: string,
  edges: Edge[],
  amounts = DEFAULT_SENSITIVITY_AMOUNTS,
  options: {
    maxLegs?: number;
    railFilter?: RailFilter;
    complexityFilter?: ComplexityFilter;
  } = {}
): AmountSensitivityPoint[] {
  return amounts.map((amount) => {
    const [bestRoute] = findTopRoutes(source, target, amount, edges, {
      limit: 1,
      ...options
    });

    if (!bestRoute) {
      return {
        amount,
        path: null,
        providerSequence: [],
        finalAmount: null,
        effectiveRate: null,
        differenceVsDirect: null,
        differenceVsDirectPercent: null,
        complexity: null,
        message: `No valid route found at ${amount} ${source}.`
      };
    }

    return {
      amount,
      path: bestRoute.path,
      providerSequence: bestRoute.legs.map((leg) => leg.provider),
      finalAmount: bestRoute.finalAmount,
      effectiveRate: bestRoute.effectiveRate,
      differenceVsDirect: bestRoute.differenceVsDirect,
      differenceVsDirectPercent: bestRoute.differenceVsDirectPercent,
      complexity: bestRoute.complexity
    };
  });
}
