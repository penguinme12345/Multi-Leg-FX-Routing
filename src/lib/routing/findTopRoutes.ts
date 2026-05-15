import { generateRoutes } from "@/lib/routing/generateRoutes";
import { simulateRoute } from "@/lib/routing/simulateRoute";
import type { Edge, RankedRouteResult, RouteResult } from "@/lib/routing/types";

export function findTopRoutes(
  source: string,
  target: string,
  amount: number,
  edges: Edge[],
  limit = 3
): RankedRouteResult[] {
  const candidateRoutes = generateRoutes(source, target, edges, 3);
  const simulatedRoutes = candidateRoutes
    .map((route) => simulateRoute(route, amount))
    .filter((route): route is RouteResult => route !== null);

  const directRoutes = simulatedRoutes.filter((route) => route.legs.length === 1);
  const bestDirectRoute = directRoutes.reduce<RouteResult | null>((best, route) => {
    if (!best || route.finalAmount > best.finalAmount) {
      return route;
    }

    return best;
  }, null);

  return [...simulatedRoutes]
    .sort((a, b) => b.finalAmount - a.finalAmount)
    .slice(0, limit)
    .map((route, index) => ({
      ...route,
      rank: index + 1,
      differenceVsDirect: bestDirectRoute ? route.finalAmount - bestDirectRoute.finalAmount : null
    }));
}

export function collectSupportedCurrencies(edges: Edge[]) {
  const currencies = new Set<string>();

  edges.forEach((edge) => {
    currencies.add(edge.from);
    currencies.add(edge.to);
  });

  return currencies;
}
