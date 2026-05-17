import { explainRoute } from "@/lib/routing/explainRoute";
import { generateRoutes } from "@/lib/routing/generateRoutes";
import { buildRouteWarnings } from "@/lib/routing/routeReview";
import { simulateRoute } from "@/lib/routing/simulateRoute";
import type {
  ComplexityFilter,
  Edge,
  RailFilter,
  RankedRouteResult,
  RouteGraphStats,
  RouteResult
} from "@/lib/routing/types";

const STABLECOINS = new Set(["USDC", "USDT", "DAI"]);

type FindTopRoutesOptions = {
  limit?: number;
  maxLegs?: number;
  railFilter?: RailFilter;
  complexityFilter?: ComplexityFilter;
};

type RankedRouteSet = {
  routes: RankedRouteResult[];
  directBenchmark: RankedRouteResult | null;
  stats: RouteGraphStats;
};

export function findTopRoutes(
  source: string,
  target: string,
  amount: number,
  edges: Edge[],
  limitOrOptions: number | FindTopRoutesOptions = 3
): RankedRouteResult[] {
  return findRankedRoutes(source, target, amount, edges, normalizeOptions(limitOrOptions)).routes;
}

export function findRankedRoutes(
  source: string,
  target: string,
  amount: number,
  edges: Edge[],
  options: FindTopRoutesOptions = {}
): RankedRouteSet {
  const limit = options.limit ?? 3;
  const maxLegs = options.maxLegs ?? 3;
  const railFilter = options.railFilter ?? "all";
  const complexityFilter = options.complexityFilter ?? "all";
  const activeEdges = filterEdgesByRail(edges, railFilter);
  const candidateRoutes = generateRoutes(source, target, activeEdges, maxLegs);
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

  const directBenchmark = bestDirectRoute ? enrichRoute(bestDirectRoute, 0, bestDirectRoute) : null;
  const rankableRoutes = simulatedRoutes.filter((route) => matchesComplexityFilter(route, complexityFilter));

  const routes = [...rankableRoutes]
    .sort((a, b) => b.finalAmount - a.finalAmount)
    .slice(0, limit)
    .map((route, index) => enrichRoute(route, index + 1, bestDirectRoute));

  return {
    routes,
    directBenchmark,
    stats: {
      currencyCount: collectSupportedCurrencies(activeEdges).size,
      edgeCount: activeEdges.length,
      candidateRouteCount: candidateRoutes.length,
      validRouteCount: simulatedRoutes.length,
      returnedRouteCount: routes.length,
      invalidRouteCount: candidateRoutes.length - simulatedRoutes.length
    }
  };
}

export function collectSupportedCurrencies(edges: Edge[]) {
  const currencies = new Set<string>();

  edges.forEach((edge) => {
    currencies.add(edge.from);
    currencies.add(edge.to);
  });

  return currencies;
}

export function filterEdgesByRail(edges: Edge[], railFilter: RailFilter) {
  if (railFilter === "all" || railFilter === "stablecoin_allowed") {
    return edges;
  }

  return edges.filter((edge) => {
    const touchesStablecoin = STABLECOINS.has(edge.from) || STABLECOINS.has(edge.to);

    if (railFilter === "fiat_only") {
      return edge.providerType === "fiat_broker" && !touchesStablecoin;
    }

    return edge.providerType === "stablecoin_venue" || touchesStablecoin;
  });
}

function normalizeOptions(limitOrOptions: number | FindTopRoutesOptions): FindTopRoutesOptions {
  return typeof limitOrOptions === "number" ? { limit: limitOrOptions } : limitOrOptions;
}

function enrichRoute(
  route: RouteResult,
  rank: number,
  bestDirectRoute: RouteResult | null
): RankedRouteResult {
  const differenceVsDirect = bestDirectRoute ? route.finalAmount - bestDirectRoute.finalAmount : null;
  const enrichedRoute = {
    ...route,
    rank,
    differenceVsDirect,
    differenceVsDirectPercent:
      differenceVsDirect === null || !bestDirectRoute
        ? null
        : (differenceVsDirect / bestDirectRoute.finalAmount) * 100
  };
  const routeWarnings = buildRouteWarnings(enrichedRoute);

  return {
    ...enrichedRoute,
    routeWarnings,
    explanation: explainRoute(enrichedRoute, rank)
  };
}

function matchesComplexityFilter(route: RouteResult, complexityFilter: ComplexityFilter) {
  if (complexityFilter === "all" || complexityFilter === "high_allowed") {
    return true;
  }

  if (complexityFilter === "low") {
    return route.complexity.level === "Low";
  }

  return route.complexity.level === "Low" || route.complexity.level === "Medium";
}
