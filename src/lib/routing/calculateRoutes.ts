import { ProviderConfigError, loadProviders } from "@/lib/providers";
import { buildAmountSensitivity } from "@/lib/routing/amountSensitivity";
import { buildEdges } from "@/lib/routing/buildEdges";
import { calculateProviderCoverage } from "@/lib/routing/calculateProviderCoverage";
import { calculateResultQuality } from "@/lib/routing/calculateResultQuality";
import { normalizeDisabledProviders } from "@/lib/routing/filterProviders";
import { collectSupportedCurrencies, findRankedRoutes } from "@/lib/routing/findTopRoutes";
import type {
  ComplexityFilter,
  ProviderCoverage,
  ProviderHealth,
  RailFilter,
  RouteDiagnostics,
  RouteGraphStats,
  RoutesResponse
} from "@/lib/routing/types";

type ValidatedRequest = {
  source: string;
  target: string;
  amount: number;
  disabledProviders: string[];
  maxLegs: number;
  railFilter: RailFilter;
  complexityFilter: ComplexityFilter;
};

export type RouteErrorResponse = ReturnType<typeof createRouteErrorBody>;

export type RouteCalculationResponse = {
  status: number;
  body: RoutesResponse | RouteErrorResponse;
};

export async function calculateRoutesResponse(body: unknown): Promise<RouteCalculationResponse> {
  const validation = validateRequest(body);

  if (!validation.ok) {
    return {
      status: 400,
      body: createRouteErrorBody(validation.error, 400)
    };
  }

  const { source, target, amount, disabledProviders, maxLegs, railFilter, complexityFilter } = validation.value;

  try {
    const providers = await loadProviders();
    const activeDisabledProviders = normalizeDisabledProviders(
      disabledProviders,
      providers.map((provider) => provider.name)
    );
    const edgeResult = await buildEdges(providers, source, target, activeDisabledProviders);
    const providerCoverage = calculateProviderCoverage(edgeResult.providerHealth);

    if (activeDisabledProviders.length === providers.length) {
      const resultQuality = calculateResultQuality(providerCoverage, false);
      const diagnostics = buildDiagnostics(edgeResult.providerHealth, providers.length, providerCoverage, resultQuality, {
        maxLegs,
        railFilter,
        complexityFilter,
        disabledProviders: activeDisabledProviders.length,
        routeGraphStats: buildEmptyRouteGraphStats()
      });

      return {
        status: 200,
        body: {
          source,
          target,
          amount,
          disabledProviders: activeDisabledProviders,
          maxLegs,
          railFilter,
          complexityFilter,
          routes: [],
          directBenchmark: null,
          providerHealth: edgeResult.providerHealth,
          providerCoverage,
          resultQuality,
          amountSensitivity: [],
          diagnostics,
          warnings: edgeResult.warnings,
          message: "No valid routes found because all providers are disabled for outage simulation."
        }
      };
    }

    const supportedCurrencies = collectSupportedCurrencies(edgeResult.edges);
    const baseDiagnostics = buildDiagnostics(edgeResult.providerHealth, providers.length, providerCoverage, calculateResultQuality(providerCoverage, false), {
      maxLegs,
      railFilter,
      complexityFilter,
      disabledProviders: activeDisabledProviders.length,
      routeGraphStats: {
        ...buildEmptyRouteGraphStats(),
        currencyCount: supportedCurrencies.size,
        edgeCount: edgeResult.edges.length
      }
    });

    if (!supportedCurrencies.has(source) || !supportedCurrencies.has(target)) {
      return {
        status: 400,
        body: createRouteErrorBody(
          `Unsupported or unavailable currency. ${source} and ${target} must appear in provider rates.`,
          400,
          edgeResult.warnings,
          edgeResult.providerHealth,
          baseDiagnostics,
          providerCoverage,
          calculateResultQuality(providerCoverage, false)
        )
      };
    }

    const rankedResult = findRankedRoutes(source, target, amount, edgeResult.edges, {
      maxLegs,
      railFilter,
      complexityFilter
    });
    const resultQuality = calculateResultQuality(providerCoverage, Boolean(rankedResult.directBenchmark));
    const diagnostics = buildDiagnostics(edgeResult.providerHealth, providers.length, providerCoverage, resultQuality, {
      maxLegs,
      railFilter,
      complexityFilter,
      disabledProviders: activeDisabledProviders.length,
      routeGraphStats: rankedResult.stats
    });
    const amountSensitivity = buildAmountSensitivity(source, target, edgeResult.edges, undefined, {
      maxLegs,
      railFilter,
      complexityFilter
    });

    return {
      status: 200,
      body: {
        source,
        target,
        amount,
        disabledProviders: activeDisabledProviders,
        maxLegs,
        railFilter,
        complexityFilter,
        routes: rankedResult.routes,
        directBenchmark: rankedResult.directBenchmark,
        providerHealth: edgeResult.providerHealth,
        providerCoverage,
        resultQuality,
        amountSensitivity,
        diagnostics,
        warnings: edgeResult.warnings,
        message:
          rankedResult.routes.length === 0
            ? `No valid routes found for ${source} to ${target} using the current filters and providers.`
            : undefined
      }
    };
  } catch (error) {
    if (error instanceof ProviderConfigError) {
      return {
        status: 500,
        body: createRouteErrorBody(error.message, 500)
      };
    }

    return {
      status: 500,
      body: createRouteErrorBody("Unexpected route calculation error.", 500)
    };
  }
}

export function createRouteErrorBody(
  error: string,
  status: number,
  warnings: string[] = [],
  providerHealth: ProviderHealth[] = [],
  diagnostics?: RouteDiagnostics,
  providerCoverage: ProviderCoverage = calculateProviderCoverage(providerHealth),
  resultQuality = calculateResultQuality(providerCoverage, false)
) {
  const activeDiagnostics =
    diagnostics ??
    buildDiagnostics(providerHealth, 0, providerCoverage, resultQuality, {
      maxLegs: 3,
      railFilter: "all",
      complexityFilter: "all",
      disabledProviders: 0,
      routeGraphStats: buildEmptyRouteGraphStats()
    });

  return {
    error,
    status,
    warnings,
    providerHealth,
    providerCoverage,
    resultQuality,
    amountSensitivity: [],
    disabledProviders: [],
    maxLegs: activeDiagnostics.maxLegs,
    railFilter: activeDiagnostics.railFilter,
    complexityFilter: activeDiagnostics.complexityFilter,
    directBenchmark: null,
    diagnostics: activeDiagnostics,
    routes: []
  };
}

function validateRequest(body: unknown): { ok: true; value: ValidatedRequest } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Request body must be an object." };
  }

  const source = readCurrency((body as Record<string, unknown>).source);
  const target = readCurrency((body as Record<string, unknown>).target);
  const rawAmount = (body as Record<string, unknown>).amount;
  const amount = typeof rawAmount === "number" ? rawAmount : Number(rawAmount);
  const maxLegs = readMaxLegs((body as Record<string, unknown>).maxLegs);
  const railFilter = readRailFilter((body as Record<string, unknown>).railFilter);
  const complexityFilter = readComplexityFilter((body as Record<string, unknown>).complexityFilter);
  const disabledProviders = Array.isArray((body as Record<string, unknown>).disabledProviders)
    ? ((body as Record<string, unknown>).disabledProviders as unknown[])
        .filter((provider): provider is string => typeof provider === "string")
        .map((provider) => provider.trim())
        .filter(Boolean)
    : [];

  if (!source) {
    return { ok: false, error: "Source currency is required." };
  }

  if (!target) {
    return { ok: false, error: "Target currency is required." };
  }

  if (source === target) {
    return { ok: false, error: "Source and target currencies must be different." };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Amount must be a positive number." };
  }

  return {
    ok: true,
    value: {
      source,
      target,
      amount,
      disabledProviders,
      maxLegs,
      railFilter,
      complexityFilter
    }
  };
}

function readCurrency(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toUpperCase();
}

function readMaxLegs(value: unknown) {
  const maxLegs = typeof value === "number" ? value : Number(value ?? 3);

  if (!Number.isInteger(maxLegs) || maxLegs < 1 || maxLegs > 3) {
    return 3;
  }

  return maxLegs;
}

function readRailFilter(value: unknown): RailFilter {
  return value === "fiat_only" || value === "stablecoin_allowed" || value === "stablecoin_only"
    ? value
    : "all";
}

function readComplexityFilter(value: unknown): ComplexityFilter {
  return value === "low" || value === "low_medium" || value === "high_allowed" ? value : "all";
}

function buildDiagnostics(
  providerHealth: ProviderHealth[],
  providerCount: number,
  providerCoverage: ProviderCoverage,
  resultQuality: { label: RouteDiagnostics["resultQualityLabel"] },
  settings: {
    maxLegs: number;
    railFilter: RailFilter;
    complexityFilter: ComplexityFilter;
    disabledProviders: number;
    routeGraphStats: RouteGraphStats;
  }
): RouteDiagnostics {
  const liveProvidersUsed = providerHealth.filter(
    (provider) => provider.status === "online" && provider.edgeCount > 0
  ).length;
  const staticProvidersLoaded = providerHealth.filter((provider) => provider.status === "static_loaded").length;
  const failedProviders = providerHealth.filter((provider) =>
    ["timeout", "failed", "malformed_response", "skipped", "simulated_outage"].includes(provider.status)
  ).length;

  return {
    calculatedAt: new Date().toISOString(),
    cacheStatus: "live_or_cached",
    liveProvidersUsed,
    staticProvidersLoaded,
    failedProviders,
    failedOrDisabledProviders: failedProviders,
    disabledProviders: settings.disabledProviders,
    providerCoveragePercent: providerCoverage.coveragePercent,
    resultQualityLabel: resultQuality.label,
    maxLegs: settings.maxLegs,
    activeMaxLegs: settings.maxLegs,
    railFilter: settings.railFilter,
    activeRailFilter: settings.railFilter,
    complexityFilter: settings.complexityFilter,
    activeComplexityFilter: settings.complexityFilter,
    routeGraphStats: settings.routeGraphStats
  };
}

function buildEmptyRouteGraphStats(): RouteGraphStats {
  return {
    currencyCount: 0,
    edgeCount: 0,
    candidateRouteCount: 0,
    validRouteCount: 0,
    returnedRouteCount: 0,
    invalidRouteCount: 0
  };
}
