"use client";

import { useState } from "react";
import { CurrencyForm } from "@/components/CurrencyForm";
import { formatAmount } from "@/components/format";
import { RouteCard } from "@/components/RouteCard";
import type { RoutesResponse } from "@/lib/routing/types";

export default function Home() {
  const [source, setSource] = useState("GBP");
  const [target, setTarget] = useState("JPY");
  const [amount, setAmount] = useState("1000");
  const [result, setResult] = useState<RoutesResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function calculateRoutes() {
    const normalizedSource = source.trim().toUpperCase();
    const normalizedTarget = target.trim().toUpperCase();
    const numericAmount = Number(amount);

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
          amount: numericAmount
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Route calculation failed.");
      }

      setSource(normalizedSource);
      setTarget(normalizedTarget);
      setResult(payload as RoutesResponse);
    } catch (requestError) {
      setResult(null);
      setError(requestError instanceof Error ? requestError.message : "Route calculation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <div className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Internal FX operations</p>
            <h1 className="app-title">Multi-Leg FX Routing Tool</h1>
            <p className="subtitle">
              Evaluate direct and multi-leg provider paths, apply per-leg fees, and rank routes by
              recipient amount.
            </p>
          </div>
          <div className="status-strip" aria-label="Routing constraints">
            <div className="status-cell">
              <span className="status-label">Max legs</span>
              <span className="status-value">3</span>
            </div>
            <div className="status-cell">
              <span className="status-label">Providers</span>
              <span className="status-value">6</span>
            </div>
            <div className="status-cell">
              <span className="status-label">Ranking</span>
              <span className="status-value">Top 3</span>
            </div>
          </div>
        </header>

        <div className="app-grid">
          <CurrencyForm
            amount={amount}
            loading={loading}
            source={source}
            target={target}
            onAmountChange={setAmount}
            onExample={(example) => {
              setSource(example.source);
              setTarget(example.target);
              setAmount(example.amount);
              setResult(null);
              setError("");
            }}
            onSourceChange={setSource}
            onSubmit={calculateRoutes}
            onTargetChange={setTarget}
          />

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

            {loading ? (
              <div className="empty-state">
                <p>Calculating provider paths and applying per-leg fees.</p>
              </div>
            ) : null}

            {!loading && !result && !error ? (
              <div className="empty-state">
                <p>Submit a route request to see the top ranked provider paths and leg breakdowns.</p>
              </div>
            ) : null}

            {!loading && result?.routes.length === 0 ? (
              <div className="empty-state">
                <p>{result.message ?? "No valid routes found for this currency pair."}</p>
              </div>
            ) : null}

            {!loading
              ? result?.routes.map((route) => (
                  <RouteCard key={`${route.rank}-${route.path.join("-")}`} route={route} target={result.target} />
                ))
              : null}
          </section>
        </div>
      </div>
    </main>
  );
}
