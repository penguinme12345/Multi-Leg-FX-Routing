import { findTopRoutes } from "@/lib/routing/findTopRoutes";
import type { AmountSensitivityPoint, Edge } from "@/lib/routing/types";

export const DEFAULT_SENSITIVITY_AMOUNTS = [100, 1000, 10000, 100000];

export function buildAmountSensitivity(
  source: string,
  target: string,
  edges: Edge[],
  amounts = DEFAULT_SENSITIVITY_AMOUNTS
): AmountSensitivityPoint[] {
  return amounts.map((amount) => {
    const [bestRoute] = findTopRoutes(source, target, amount, edges, 1);

    if (!bestRoute) {
      return {
        amount,
        path: null,
        providerSequence: [],
        finalAmount: null,
        differenceVsDirect: null,
        message: `No valid route found at ${amount} ${source}.`
      };
    }

    return {
      amount,
      path: bestRoute.path,
      providerSequence: bestRoute.legs.map((leg) => leg.provider),
      finalAmount: bestRoute.finalAmount,
      differenceVsDirect: bestRoute.differenceVsDirect
    };
  });
}
