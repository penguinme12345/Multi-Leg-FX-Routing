import type { Edge, RouteLegResult, RouteResult } from "@/lib/routing/types";

export function simulateRoute(route: Edge[], initialAmount: number): RouteResult | null {
  if (route.length === 0 || initialAmount <= 0) {
    return null;
  }

  let currentAmount = initialAmount;
  const legs: RouteLegResult[] = [];

  for (const edge of route) {
    if (edge.rate <= 0 || currentAmount <= 0) {
      return null;
    }

    const fee = currentAmount * edge.feePercent + edge.feeFlat;

    if (fee >= currentAmount) {
      return null;
    }

    const amountAfterFee = currentAmount - fee;
    const outputAmount = amountAfterFee * edge.rate;

    legs.push({
      provider: edge.provider,
      from: edge.from,
      to: edge.to,
      rate: edge.rate,
      inputAmount: currentAmount,
      fee,
      amountAfterFee,
      outputAmount
    });

    currentAmount = outputAmount;
  }

  return {
    path: [route[0].from, ...route.map((edge) => edge.to)],
    legs,
    finalAmount: currentAmount,
    differenceVsDirect: null
  };
}
