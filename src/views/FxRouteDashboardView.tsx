"use client";

import { AdvancedSettings } from "@/components/AdvancedSettings";
import { AmountSensitivity } from "@/components/AmountSensitivity";
import { CurrencyForm } from "@/components/CurrencyForm";
import { DiagnosticsPanel } from "@/components/DiagnosticsPanel";
import { DirectBenchmarkCard } from "@/components/DirectBenchmarkCard";
import { ExampleScenarios } from "@/components/ExampleScenarios";
import { formatAmount, formatDateTime } from "@/components/format";
import { ProviderHealth } from "@/components/ProviderHealth";
import { ProviderOutageToggle } from "@/components/ProviderOutageToggle";
import { RecentSearches } from "@/components/RecentSearches";
import { RecommendedRouteCard } from "@/components/RecommendedRouteCard";
import { RouteCard } from "@/components/RouteCard";
import { RouteComparisonTable } from "@/components/RouteComparisonTable";
import { TradeReviewSummary } from "@/components/TradeReviewSummary";
import type { DashboardTab, FxDashboardController } from "@/controllers/useFxDashboardController";

type FxRouteDashboardViewProps = {
  controller: FxDashboardController;
};

export function FxRouteDashboardView({ controller }: FxRouteDashboardViewProps) {
  const {
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
    bestRoute,
    showDashboard
  } = controller.state;
  const {
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
  } = controller.actions;

  return (
    <main className="shell">
      <div className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Internal FX operations</p>
            <h1 className="app-title">FX Route Optimizer</h1>
            <p className="subtitle">
              Pre-trade route review across fiat brokers and stablecoin venues.
            </p>
          </div>
          <div className="topbar-actions">
            <button className="secondary-button reset-demo-button" type="button" onClick={resetDemo}>
              Reset Demo
            </button>
            <div className="status-strip" aria-label="Routing constraints">
              <div className="status-cell">
                <span className="status-label">Mode</span>
                <span className="status-value">Demo</span>
              </div>
              <div className="status-cell">
                <span className="status-label">Rates updated</span>
                <span className="status-value">{result ? formatDateTime(result.diagnostics.calculatedAt) : "Pending"}</span>
              </div>
              <div className="status-cell">
                <span className="status-label">Providers</span>
                <span className="status-value">{result ? `${result.providerCoverage.usableProviders}/6` : "6"}</span>
              </div>
            </div>
          </div>
        </header>

        {!showDashboard ? (
          <section className="home-start">
            <div className="home-primary">
              <CurrencyForm
                amount={amount}
                loading={loading}
                source={source}
                target={target}
                onAmountChange={setAmount}
                onSourceChange={setSource}
                onSubmit={() => void calculateRoutes()}
                onTargetChange={setTarget}
              />
              <ExampleScenarios loading={loading} onSelect={runScenario} />
              <RecentSearches
                loading={loading}
                searches={recentSearches}
                onClear={clearRecentSearches}
                onSelect={runRecentSearch}
              />
            </div>
            <div className="home-secondary">
              <section className="panel welcome-panel">
                <p className="eyebrow compact">Start here</p>
                <h2>Review an FX route in one step</h2>
                <p>
                  Choose a route request, then the dashboard opens with recommendation,
                  benchmarks, provider health, route details, and sensitivity analysis.
                </p>
                <div className="feature-preview-grid">
                  <div>
                    <strong>1. Recommendation</strong>
                    <span>Best route, final amount, and effective rate.</span>
                  </div>
                  <div>
                    <strong>2. Compare</strong>
                    <span>Top routes against the best direct benchmark.</span>
                  </div>
                  <div>
                    <strong>3. Audit</strong>
                    <span>Per-leg fees, rates, and calculation trail.</span>
                  </div>
                  <div>
                    <strong>4. Stress test</strong>
                    <span>Provider outages and advanced filters after calculation.</span>
                  </div>
                </div>
                <div className="preview-list">
                  <strong>After calculation, this dashboard will show:</strong>
                  <ul>
                    <li>Recommended route and top 3 alternatives</li>
                    <li>Provider coverage and result quality</li>
                    <li>Direct route benchmark and fee breakdown</li>
                    <li>Amount sensitivity and reliability diagnostics</li>
                  </ul>
                </div>
                <p className="decision-note">
                  Decision-support only. This app does not execute trades or represent executable quotes.
                </p>
              </section>
            </div>
          </section>
        ) : (
          <div className="app-grid">
            <div className="side-stack">
              <CurrencyForm
                amount={amount}
                loading={loading}
                source={source}
                target={target}
                onAmountChange={setAmount}
                onSourceChange={setSource}
                onSubmit={() => void calculateRoutes()}
                onTargetChange={setTarget}
              />
              <ExampleScenarios loading={loading} onSelect={runScenario} />
              <RecentSearches
                loading={loading}
                searches={recentSearches}
                onClear={clearRecentSearches}
                onSelect={runRecentSearch}
              />
              <details className="details-group">
                <summary>Filters and route constraints</summary>
                <AdvancedSettings
                  complexityFilter={complexityFilter}
                  loading={loading}
                  maxLegs={maxLegs}
                  railFilter={railFilter}
                  onChange={updateAdvancedSettings}
                />
              </details>
              <details className="details-group">
                <summary>Provider outage simulation</summary>
                <ProviderOutageToggle
                  disabledProviders={disabledProviders}
                  loading={loading}
                  onChange={updateDisabledProviders}
                />
              </details>
            </div>

            <section className="results-stack" aria-live="polite">
              <div className="results-header">
                <h2 className="section-title">Route ranking</h2>
                {result ? (
                  <span className="result-context">
                    {formatAmount(result.amount, result.source)} to {result.target}
                  </span>
                ) : null}
              </div>

              {error ? (
                <div className="notice error-box" role="alert">
                  <p className="notice-title">Unable to calculate routes</p>
                  <p>{error}</p>
                </div>
              ) : null}

              {loading ? <LoadingDashboard /> : null}

              {!loading && !result && !error ? (
                <div className="empty-state">
                  <p>Start by entering an FX order or choose one of the example scenarios.</p>
                </div>
              ) : null}

              {!loading && result ? (
                <DashboardTabs activeTab={activeTab} onChange={setActiveTab} />
              ) : null}

              {!loading && result && activeTab === "overview" ? (
                <>
                  <TradeReviewSummary
                    amount={result.amount}
                    directBenchmark={result.directBenchmark}
                    message={result.message}
                    providerCoverage={result.providerCoverage}
                    recommendedRoute={bestRoute}
                    resultQuality={result.resultQuality}
                    source={result.source}
                    target={result.target}
                    warnings={result.warnings}
                  />
                  {result.routes.length > 0 ? (
                    <RecommendedRouteCard route={bestRoute} source={result.source} target={result.target} />
                  ) : null}
                  <div className="summary-grid">
                    <DirectBenchmarkCard
                      route={result.directBenchmark}
                      source={result.source}
                      target={result.target}
                    />
                    <DiagnosticsPanel
                      diagnostics={result.diagnostics}
                      providerCoverage={result.providerCoverage}
                      resultQuality={result.resultQuality}
                    />
                  </div>
                </>
              ) : null}

              {!loading && result && activeTab === "routes" ? (
                <>
                  <RouteComparisonTable
                    routes={result.routes}
                    source={result.source}
                    target={result.target}
                  />
                  {result.routes.map((route) => (
                    <RouteCard
                      amount={result.amount}
                      key={`${route.rank}-${route.path.join("-")}-${route.legs.map((leg) => leg.provider).join("-")}`}
                      route={route}
                      source={result.source}
                      target={result.target}
                      warnings={result.warnings}
                    />
                  ))}
                </>
              ) : null}

              {!loading && result && activeTab === "analysis" ? (
                <AmountSensitivity
                  points={result.amountSensitivity}
                  source={result.source}
                  target={result.target}
                />
              ) : null}

              {!loading && result && activeTab === "reliability" ? (
                <>
                  <ProviderHealth
                    providerCoverage={result.providerCoverage}
                    providers={result.providerHealth}
                    resultQuality={result.resultQuality}
                  />
                  <div className="panel helper-panel">
                    <p className="eyebrow compact">Simulation</p>
                    <h2 className="section-title">Provider outage controls</h2>
                    <p className="muted-copy">
                      Use the sidebar controls to disable providers and watch routes recalculate with
                      simulated outage warnings.
                    </p>
                  </div>
                </>
              ) : null}

              {result?.warnings.length ? (
                <div className="notice">
                  <p className="notice-title">Provider warnings</p>
                  <ul className="notice-list">
                    {result.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function DashboardTabs({
  activeTab,
  onChange
}: {
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}) {
  const tabs: Array<{ id: DashboardTab; label: string; detail: string }> = [
    { id: "overview", label: "Overview", detail: "Recommendation and benchmark" },
    { id: "routes", label: "Routes", detail: "Top 3 and audit trail" },
    { id: "analysis", label: "Analysis", detail: "Amount sensitivity" },
    { id: "reliability", label: "Reliability", detail: "Provider health and outages" }
  ];

  return (
    <div className="dashboard-tabs" role="tablist" aria-label="Dashboard sections">
      {tabs.map((tab) => (
        <button
          aria-selected={activeTab === tab.id}
          className={activeTab === tab.id ? "tab-button active" : "tab-button"}
          key={tab.id}
          role="tab"
          type="button"
          onClick={() => onChange(tab.id)}
        >
          <span>{tab.label}</span>
          <small>{tab.detail}</small>
        </button>
      ))}
    </div>
  );
}

function LoadingDashboard() {
  const steps = [
    "Fetching provider rates",
    "Normalizing provider quotes",
    "Building route graph",
    "Calculating top routes"
  ];

  return (
    <div className="loading-stack">
      <div className="notice">
        <p className="notice-title">Calculating routes</p>
        <ul className="notice-list neutral">
          {steps.map((step) => (
            <li key={step}>{step}...</li>
          ))}
        </ul>
      </div>
      <div className="skeleton-card" />
      <div className="skeleton-grid">
        <div className="skeleton-card short" />
        <div className="skeleton-card short" />
      </div>
    </div>
  );
}
