"use client";

import { useEffect, useRef, useState } from "react";
import type { ExampleScenario } from "@/components/ExampleScenarios";
import type { RecentSearch } from "@/components/RecentSearches";
import type { ComplexityFilter, RailFilter, RoutesResponse } from "@/lib/routing/types";

type RouteCalculationOverrides = {
  source?: string;
  target?: string;
  amount?: string;
  disabledProviders?: string[];
  maxLegs?: number;
  railFilter?: RailFilter;
  complexityFilter?: ComplexityFilter;
};

export type DashboardTab = "overview" | "routes" | "analysis" | "reliability";

const RECENT_SEARCHES_KEY = "fx-route-recent-searches";
const DEFAULT_SOURCE = "GBP";
const DEFAULT_TARGET = "JPY";
const DEFAULT_AMOUNT = "1000";
const DEFAULT_MAX_LEGS = 3;
const DEFAULT_RAIL_FILTER: RailFilter = "all";
const DEFAULT_COMPLEXITY_FILTER: ComplexityFilter = "all";

export function useFxDashboardController() {
  const requestSequence = useRef(0);
  const [source, setSource] = useState(DEFAULT_SOURCE);
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [result, setResult] = useState<RoutesResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [disabledProviders, setDisabledProviders] = useState<string[]>([]);
  const [maxLegs, setMaxLegs] = useState(DEFAULT_MAX_LEGS);
  const [railFilter, setRailFilter] = useState<RailFilter>(DEFAULT_RAIL_FILTER);
  const [complexityFilter, setComplexityFilter] = useState<ComplexityFilter>(DEFAULT_COMPLEXITY_FILTER);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  useEffect(() => {
    try {
      const rawSearches = window.localStorage.getItem(RECENT_SEARCHES_KEY);

      if (rawSearches) {
        setRecentSearches(JSON.parse(rawSearches) as RecentSearch[]);
      }
    } catch {
      setRecentSearches([]);
    }
  }, []);

  async function calculateRoutes(overrides: RouteCalculationOverrides = {}) {
    const requestedSource = overrides.source ?? source;
    const requestedTarget = overrides.target ?? target;
    const requestedAmount = overrides.amount ?? amount;
    const requestedDisabledProviders = overrides.disabledProviders ?? disabledProviders;
    const requestedMaxLegs = overrides.maxLegs ?? maxLegs;
    const requestedRailFilter = overrides.railFilter ?? railFilter;
    const requestedComplexityFilter = overrides.complexityFilter ?? complexityFilter;
    const normalizedSource = requestedSource.trim().toUpperCase();
    const normalizedTarget = requestedTarget.trim().toUpperCase();
    const numericAmount = Number(requestedAmount);
    const requestId = requestSequence.current + 1;

    requestSequence.current = requestId;

    setError("");

    if (!normalizedSource) {
      setError("Source currency is required.");
      return;
    }

    if (!normalizedTarget) {
      setError("Target currency is required.");
      return;
    }

    if (normalizedSource === normalizedTarget) {
      setError("Source and target currencies must be different.");
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/routes", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          source: normalizedSource,
          target: normalizedTarget,
          amount: numericAmount,
          disabledProviders: requestedDisabledProviders,
          maxLegs: requestedMaxLegs,
          railFilter: requestedRailFilter,
          complexityFilter: requestedComplexityFilter
        })
      });
      const payload = await response.json();

      if (requestSequence.current !== requestId) {
        return;
      }

      if (!response.ok) {
        throw new Error(payload.error ?? "Route calculation failed.");
      }

      setSource(normalizedSource);
      setTarget(normalizedTarget);
      setAmount(String(requestedAmount));
      setDisabledProviders(requestedDisabledProviders);
      setMaxLegs(requestedMaxLegs);
      setRailFilter(requestedRailFilter);
      setComplexityFilter(requestedComplexityFilter);
      setResult(payload as RoutesResponse);
      setActiveTab("overview");
      saveRecentSearch({
        source: normalizedSource,
        target: normalizedTarget,
        amount: String(requestedAmount),
        timestamp: new Date().toISOString()
      });
    } catch (requestError) {
      if (requestSequence.current !== requestId) {
        return;
      }

      setResult(null);
      setError(requestError instanceof Error ? requestError.message : "Route calculation failed.");
    } finally {
      if (requestSequence.current === requestId) {
        setLoading(false);
      }
    }
  }

  function runScenario(scenario: ExampleScenario) {
    setSource(scenario.source);
    setTarget(scenario.target);
    setAmount(scenario.amount);
    void calculateRoutes({
      source: scenario.source,
      target: scenario.target,
      amount: scenario.amount
    });
  }

  function updateDisabledProviders(nextDisabledProviders: string[]) {
    setDisabledProviders(nextDisabledProviders);

    if (result) {
      void calculateRoutes({
        disabledProviders: nextDisabledProviders
      });
    }
  }

  function updateAdvancedSettings(settings: {
    maxLegs: number;
    railFilter: RailFilter;
    complexityFilter: ComplexityFilter;
  }) {
    setMaxLegs(settings.maxLegs);
    setRailFilter(settings.railFilter);
    setComplexityFilter(settings.complexityFilter);

    if (result) {
      void calculateRoutes(settings);
    }
  }

  function saveRecentSearch(search: RecentSearch) {
    setRecentSearches((currentSearches) => {
      const deduped = currentSearches.filter(
        (currentSearch) =>
          !(
            currentSearch.source === search.source &&
            currentSearch.target === search.target &&
            currentSearch.amount === search.amount
          )
      );
      const nextSearches = [search, ...deduped].slice(0, 5);

      window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(nextSearches));
      return nextSearches;
    });
  }

  function runRecentSearch(search: RecentSearch) {
    setSource(search.source);
    setTarget(search.target);
    setAmount(search.amount);
    void calculateRoutes({
      source: search.source,
      target: search.target,
      amount: search.amount
    });
  }

  function clearRecentSearches() {
    window.localStorage.removeItem(RECENT_SEARCHES_KEY);
    setRecentSearches([]);
  }

  function resetDemo() {
    requestSequence.current += 1;
    setSource(DEFAULT_SOURCE);
    setTarget(DEFAULT_TARGET);
    setAmount(DEFAULT_AMOUNT);
    setResult(null);
    setError("");
    setLoading(false);
    setDisabledProviders([]);
    setMaxLegs(DEFAULT_MAX_LEGS);
    setRailFilter(DEFAULT_RAIL_FILTER);
    setComplexityFilter(DEFAULT_COMPLEXITY_FILTER);
    setActiveTab("overview");
  }

  return {
    state: {
      source,
      target,
      amount,
      result,
      error,
      loading,
      disabledProviders,
      maxLegs,
      railFilter,
      complexityFilter,
      recentSearches,
      activeTab,
      bestRoute: result?.routes[0] ?? null,
      showDashboard: Boolean(result || loading || error)
    },
    actions: {
      setSource,
      setTarget,
      setAmount,
      setActiveTab,
      calculateRoutes,
      runScenario,
      updateDisabledProviders,
      updateAdvancedSettings,
      runRecentSearch,
      clearRecentSearches,
      resetDemo
    }
  };
}

export type FxDashboardController = ReturnType<typeof useFxDashboardController>;
