# Feature And Function Overview

This document is a current-state inventory of the FX Route Optimizer. It explains what the app does, how the main features behave, and which functions/components support each part of the system.

## Current Product Summary

The app is an internal pre-trade FX routing dashboard. A user enters a source currency, target currency, and amount. The system loads provider rates, builds a normalized route graph, simulates all valid routes up to the selected maximum leg count, applies each provider's fees, ranks the routes by final delivered amount, and displays the result in a dashboard.

The codebase is now organized around an MVC-style split:

- Model: provider loading, rate normalization, route generation, route simulation, ranking, diagnostics, and shared types in `src/lib`.
- Controller: browser state/actions and API request orchestration in `src/controllers`, plus API/backend entry points.
- View: dashboard view and reusable UI components in `src/views`, `src/components`, and `src/app`.

## User-Facing Feature Catalog

### Initial Home Page

The first screen is intentionally calmer than the full dashboard. It shows the route request form, saved example scenarios, recent searches when available, and a short preview of what will appear after calculation. Advanced settings, provider outage controls, dense comparison tables, and diagnostics are hidden until a calculation starts or returns.

This solves the earlier issue where the app exposed too much functionality immediately. Users can start with one focused action, then inspect deeper route information after a result exists.

Primary code:

- `src/views/FxRouteDashboardView.tsx`
- `src/components/CurrencyForm.tsx`
- `src/components/ExampleScenarios.tsx`
- `src/components/RecentSearches.tsx`

### Route Request Form

The route form collects:

- Source currency
- Target currency
- Amount

Source and target are dropdown-only controls. The old mixed dropdown/manual typing behavior was removed because it made the UI ambiguous and easy to misuse. The available currencies are currently:

```text
USD, EUR, GBP, JPY, CAD, AUD, CHF, USDT, USDC
```

The form defaults to `GBP -> JPY` with amount `1000`.

Primary code:

- `CurrencyForm`
- `useFxDashboardController.calculateRoutes`

### Client-Side Validation

Before sending an API request, the dashboard controller checks:

- Source currency is present.
- Target currency is present.
- Source and target are different.
- Amount is a finite number greater than zero.

If validation fails, the UI shows an error and does not submit the request.

Primary code:

- `src/controllers/useFxDashboardController.ts`

### API Validation

The backend repeats important validation so the API is safe even if called directly. It validates:

- Request body exists and is an object.
- Source and target are strings.
- Source and target normalize to uppercase currency codes.
- Source and target are different.
- Amount is positive.
- `maxLegs` is an integer from 1 to 3, otherwise defaults to 3.
- Rail and complexity filters are recognized, otherwise they default to `all`.
- Disabled providers are normalized against configured provider names.

Primary code:

- `src/lib/routing/calculateRoutes.ts`
- `src/controllers/routesController.ts`
- `src/app/api/routes/route.ts`
- `scripts/backend-only.ts`

### Live Provider Rates

The app fetches live fiat rates from configured live API providers:

- AlphaFX
- BetaBank
- DeltaMarkets

Each provider adapter fetches rates for selected base currencies, normalizes the response into shared `Edge` objects, and returns provider health metadata. Provider failures do not crash the whole calculation. Failed providers are excluded while remaining providers continue.

Primary code:

- `src/lib/rates/alphaFx.ts`
- `src/lib/rates/betaBank.ts`
- `src/lib/rates/deltaMarkets.ts`
- `src/lib/rates/http.ts`

### Static Stablecoin Providers

The app also supports configured static stablecoin venues:

- GammaCrypto
- EpsilonChain
- ZetaSwap

These providers read pairs directly from `providers.json`. Static pairs are converted into the same `Edge` type as live rates, which lets the route engine rank fiat and stablecoin paths together.

Primary code:

- `providers.json`
- `src/lib/rates/staticProviders.ts`

### Provider Config Loading

Provider configuration is loaded from `providers.json`. The loader validates provider names, provider types, rate source types, fee models, API blocks for live providers, and static pairs for static providers.

Invalid provider configuration throws a `ProviderConfigError`, which becomes a structured API error.

Primary code:

- `src/lib/providers.ts`

### Edge Normalization

All provider quotes are normalized into a shared directed graph edge:

```ts
{
  provider,
  providerType,
  from,
  to,
  rate,
  feePercent,
  feeFlat
}
```

This is the key model abstraction. Once provider data becomes edges, the routing engine no longer needs to care whether a quote came from a live API or a static venue.

Primary code:

- `src/lib/routing/types.ts`
- `src/lib/routing/buildEdges.ts`
- `src/lib/rates/*`

### Route Generation

The route generator enumerates all valid directed paths from source to target up to the selected `maxLegs`. The default and hard cap is 3 legs, matching the case-study requirement.

The app uses bounded exhaustive enumeration instead of Dijkstra's algorithm because route value depends on the amount after each fee and conversion. With only 1 to 3 legs, exhaustive generation is simpler and easier to audit.

Primary code:

- `src/lib/routing/generateRoutes.ts`
- `src/lib/routing/findTopRoutes.ts`

### Fee-First Route Simulation

Every candidate route is simulated leg by leg. For each leg:

```text
fee = input_amount * fee_percent + fee_flat
amount_after_fee = input_amount - fee
output_amount = amount_after_fee * rate
```

Fees are charged in the source currency of each leg and are applied before conversion. If the fee is greater than or equal to the leg input amount, the route is discarded as invalid.

Primary code:

- `src/lib/routing/simulateRoute.ts`

### Top Route Ranking

After simulation, routes are ranked by final delivered amount. The API returns up to the top 3 valid routes. Each ranked route includes:

- Rank
- Currency path
- Provider sequence
- Leg-level calculations
- Final delivered amount
- Effective rate
- Difference versus best direct route
- Complexity
- Explanation

Primary code:

- `src/lib/routing/findTopRoutes.ts`

### Direct Benchmark

The engine separately identifies the best available one-leg direct route. Multi-leg and direct routes are compared against this benchmark when it exists.

The UI shows both absolute and percentage difference versus direct. If no direct route exists, the response returns `null` for direct comparison values.

Primary code:

- `findRankedRoutes`
- `DirectBenchmarkCard`
- `RouteComparisonTable`
- `RouteCard`

### Effective Rate

Each route calculates an all-in effective rate:

```text
effective_rate = final_delivered_amount / starting_amount
```

This makes routes easier to compare because the user can see the final all-in rate after provider rates and fees.

Primary code:

- `src/lib/routing/calculateEffectiveRate.ts`
- `src/components/format.ts`

### Rounded Final Values

Displayed monetary values are rounded to cents in the UI and copied summaries. This keeps final delivered amounts, fee amounts, differences, and route summaries readable.

The underlying calculation still uses normal JavaScript numbers during simulation. Formatting happens at the presentation layer.

Primary code:

- `src/components/format.ts`
- `src/lib/routing/formatRouteSummary.ts`

### Trade Review Summary

The Overview tab now starts with a decision-ready Trade Review Summary. It combines the order, recommended route, expected delivered amount, effective rate, direct benchmark comparison, provider coverage, result quality, operational complexity, provider count, leg count, warning count, and decision-support disclaimer.

If no route exists, the same panel becomes a no-route review state with likely reasons and suggested fixes.

Primary code:

- `src/components/TradeReviewSummary.tsx`
- `src/views/FxRouteDashboardView.tsx`

### Provider Coverage Score

Provider Coverage summarizes how much provider data was usable for the current result. It counts providers with `online` or `static_loaded` status as usable and treats failures, skipped providers, missing pairs, and simulated outages as unavailable.

Coverage appears in the Trade Review Summary, Diagnostics panel, Provider Health header, and the topbar provider status.

Primary code:

- `src/lib/routing/calculateProviderCoverage.ts`
- `src/components/TradeReviewSummary.tsx`
- `src/components/DiagnosticsPanel.tsx`
- `src/components/ProviderHealth.tsx`

### Result Quality Label

Result Quality converts provider coverage into a simple observable label:

- High Coverage: at least 80%
- Partial Coverage: 50% to 79%
- Limited Coverage: above 0% and below 50%
- No Coverage: 0%

The label does not imply market confidence or executable price certainty. It only describes how complete the app's provider data was for the calculation.

Primary code:

- `src/lib/routing/calculateResultQuality.ts`
- `src/components/TradeReviewSummary.tsx`
- `src/components/DiagnosticsPanel.tsx`
- `src/components/ProviderHealth.tsx`

### Reset Demo

The header includes a Reset Demo button. It resets source, target, amount, route filters, disabled providers, result state, error state, loading state, and active tab to the default demo state without clearing recent searches.

In-flight route requests are ignored after reset so an older response cannot repopulate the dashboard.

Primary code:

- `src/controllers/useFxDashboardController.ts`
- `src/views/FxRouteDashboardView.tsx`

### Recommended Route

The Overview tab highlights the top-ranked route as the recommendation. It shows:

- Final delivered amount
- Effective rate
- Path
- Difference versus direct
- Complexity
- Provider sequence

If no route is available, the app shows a no-route state instead of a blank card.

Primary code:

- `RecommendedRouteCard`
- `FxRouteDashboardView`

### Route Comparison Table

The Routes tab includes a compact table for comparing the top routes side by side. It shows route rank, path, providers, legs, final amount, effective rate, direct-route difference, and complexity.

The table is designed to be scannable for a trading or operations user who wants to compare options quickly before opening individual route details.

Primary code:

- `RouteComparisonTable`

### Detailed Route Cards

Each ranked route has a detailed card with:

- Rank label: recommended, fallback, backup
- Full currency path
- Provider path
- Final delivered amount
- Effective rate
- Direct comparison badges
- Complexity badge
- Route explanation
- Copy Summary action
- Per-leg table
- Expandable calculation audit trail

Primary code:

- `RouteCard`
- `RouteComplexityBadge`
- `RouteExplanation`
- `CopyRouteSummaryButton`
- `RouteLegTable`
- `CalculationAuditTrail`

### Per-Leg Table

The leg table shows how money moves through each provider:

- Provider
- Conversion pair
- Input amount
- Fee
- Amount after fee
- Rate
- Output amount

This makes the route result auditable instead of just showing a final number.

Primary code:

- `RouteLegTable`

### Calculation Audit Trail

Each detailed route includes an expandable audit trail that spells out the fee and conversion calculation for every leg. This is useful for QA, demos, and explaining why the final amount came out the way it did.

Primary code:

- `CalculationAuditTrail`

### Copyable Route Summary

Users can copy a formatted route summary to the clipboard. The summary includes:

- Route rank
- Provider path
- Input amount
- Final delivered amount
- Effective rate
- Difference versus direct
- Complexity
- Explanation
- Provider warnings, if any

Primary code:

- `CopyRouteSummaryButton`
- `formatRouteSummary`

### Route Explanations

Each route gets a short plain-English explanation generated from route facts. The explanation considers:

- Rank
- Whether the route is direct
- Whether it uses stablecoin rails
- Whether it beats or trails the direct benchmark
- Whether extra conversion steps are worth it at the current amount

Primary code:

- `explainRoute`
- `RouteExplanation`

### Route Complexity

Routes are labeled Low, Medium, or High complexity. Complexity considers:

- Number of legs
- Number of unique providers
- Number of intermediate currencies
- Whether a stablecoin rail is involved
- Whether the route mixes fiat and stablecoin rails

Complexity does not replace ranking. Ranking is still based on final delivered amount. Complexity is shown as an operational tradeoff so a user can judge whether a route is worth executing.

Primary code:

- `calculateComplexity`
- `RouteComplexityBadge`

### Amount Sensitivity

The Analysis tab recalculates the best route for sample transfer sizes:

```text
100
1,000
10,000
100,000
```

It displays a Recharts line chart plus a table showing best route, provider sequence, final delivered amount, effective rate, direct comparison, and complexity at each amount.

This helps reveal when flat fees dominate small transfers or when percentage/rate differences matter more at larger sizes.

Primary code:

- `buildAmountSensitivity`
- `AmountSensitivity`

### Advanced Filters

After calculation, users can change route constraints:

- Max legs: 1, 2, or 3
- Rail filter: all routes, fiat only, stablecoin allowed, stablecoin only
- Complexity filter: all, low only, low and medium, high allowed

Changing these settings recalculates the routes if a result already exists.

Primary code:

- `AdvancedSettings`
- `useFxDashboardController.updateAdvancedSettings`
- `findRankedRoutes`
- `filterEdgesByRail`

### Provider Outage Simulation

Users can manually disable providers to simulate outages. Disabled providers are removed before rate fetching and route generation. They appear in Provider Health as `simulated_outage`, and warning messages explain that they were manually disabled.

If all providers are disabled, the API returns a successful no-route response with a clear message.

Primary code:

- `ProviderOutageToggle`
- `normalizeDisabledProviders`
- `filterDisabledProviders`
- `buildSimulatedOutageHealth`
- `buildSimulatedOutageWarnings`
- `buildEdges`

### Provider Health

Provider Health summarizes whether each provider contributed data:

- `online`
- `static_loaded`
- `timeout`
- `failed`
- `malformed_response`
- `skipped`
- `simulated_outage`
- `missing_pair`

This gives the user visibility into data quality and provider availability for the calculation.

Primary code:

- `ProviderHealth`
- `buildLiveProviderHealth`
- `buildStaticEdgeResult`
- `buildSimulatedOutageHealth`

### Diagnostics

Each API response includes diagnostics:

- Calculation timestamp
- Cache status
- Number of live providers used
- Number of static providers loaded
- Number of failed or disabled providers
- Provider coverage percent
- Result quality label
- Active max legs
- Active rail filter
- Active complexity filter

The UI displays this on the Overview tab.

Primary code:

- `buildDiagnostics`
- `DiagnosticsPanel`

### Recent Searches

The dashboard saves up to 5 recent searches in browser local storage. Recent searches include source, target, amount, and timestamp. Users can rerun a search or clear the list.

Primary code:

- `useFxDashboardController`
- `RecentSearches`

### Example Scenarios

The home page and sidebar include saved test scenarios:

- GBP -> JPY, 1000
- USD -> CAD, 10000
- CAD -> AUD, 500
- EUR -> USDC, 5000
- JPY -> USD, 100000

Clicking an example fills the form and runs a calculation.

Primary code:

- `ExampleScenarios`
- `useFxDashboardController.runScenario`

### Dashboard Tabs

The results dashboard is organized into four tabs:

- Overview: recommendation, direct benchmark, diagnostics
- Routes: comparison table and detailed route cards
- Analysis: amount sensitivity
- Reliability: provider health and outage guidance

Primary code:

- `DashboardTabs` inside `FxRouteDashboardView`

### Loading And Empty States

While calculating, the UI shows a loading stack with route calculation steps and skeleton cards. If no calculation exists yet, it shows a simple empty state. If filters or provider outages produce zero routes, it shows guidance for loosening filters or re-enabling providers.

Primary code:

- `LoadingDashboard` inside `FxRouteDashboardView`
- Empty/no-route blocks inside `FxRouteDashboardView`

### Backend-Only API Server

The project includes a standalone backend server that exposes the same route calculation logic without serving the React frontend.

Default endpoint:

```text
POST http://127.0.0.1:4000/api/routes
```

This is useful for API-only testing, demos, or comparing frontend and backend parity.

Primary code:

- `scripts/backend-only.ts`
- `src/controllers/routesController.ts`

### Automated Tests

The Vitest suite covers:

- Fee calculation
- Single-leg route simulation
- Multi-leg route simulation
- Invalid routes when fees consume input
- Route ranking
- Direct route comparison
- Static provider edge normalization
- No-route behavior
- Effective rate
- Complexity labels
- Route explanations
- Copy summary formatting
- Disabled-provider filtering
- Provider coverage scoring
- Result quality labels

Primary code:

- `tests/simulateRoute.test.ts`
- `tests/findTopRoutes.test.ts`
- `tests/buildEdges.test.ts`
- `tests/routeInsights.test.ts`
- `tests/providerCoverage.test.ts`

## Function And Component Catalog

### App Entry Points

`src/app/page.tsx`

- `Home`: creates the dashboard controller and renders the dashboard view. It intentionally contains no route business logic.

`src/app/layout.tsx`

- `RootLayout`: wraps the app in the root HTML/body structure.
- `metadata`: sets basic Next.js page metadata.

`src/app/api/routes/route.ts`

- `POST`: parses request JSON and calls `handleRoutesRequest`.
- `GET`: returns a small help message telling callers to post route inputs.
- `parseJson`: local helper that prevents invalid JSON from crashing the route handler.

### Controllers

`src/controllers/useFxDashboardController.ts`

- `useFxDashboardController`: client-side controller for the dashboard. Owns source, target, amount, loading, errors, results, disabled providers, advanced filters, active tab, and recent searches.
- `calculateRoutes`: validates UI input, posts to `/api/routes`, stores the API response, resets the active tab to Overview, and saves a recent search.
- `runScenario`: applies an example scenario and immediately calculates it.
- `updateDisabledProviders`: stores simulated outage selections and recalculates if a result exists.
- `updateAdvancedSettings`: stores max legs, rail filter, and complexity filter, then recalculates if a result exists.
- `saveRecentSearch`: stores a deduplicated, capped list of recent searches in local storage.
- `runRecentSearch`: restores and recalculates a previous search.
- `clearRecentSearches`: clears recent search local storage and state.
- `DashboardTab`: union type for the four result tabs.
- `FxDashboardController`: exported return type for the controller hook.

`src/controllers/routesController.ts`

- `handleRoutesRequest`: request-level controller that calls the route calculation service.
- `createInvalidJsonRouteError`: builds the standard invalid JSON API error body.
- `createRouteErrorBody`: re-exported model helper for backend-only error handling.

### Views

`src/views/FxRouteDashboardView.tsx`

- `FxRouteDashboardView`: receives controller state/actions and renders the entire dashboard experience.
- `DashboardTabs`: renders the Overview, Routes, Analysis, and Reliability tab buttons.
- `LoadingDashboard`: renders calculation progress and skeleton placeholders.

### UI Components

`src/components/CurrencyForm.tsx`

- `CurrencyForm`: dropdown-only currency selector, amount input, and submit button.

`src/components/ExampleScenarios.tsx`

- `exampleScenarios`: saved scenario data used by the UI.
- `ExampleScenarios`: renders scenario shortcut buttons.
- `ExampleScenario`: type for a saved scenario.

`src/components/RecentSearches.tsx`

- `RecentSearches`: renders recent search buttons and a clear action.
- `RecentSearch`: type for saved local search entries.

`src/components/AdvancedSettings.tsx`

- `AdvancedSettings`: renders max legs, rail filter, and complexity filter controls.

`src/components/ProviderOutageToggle.tsx`

- `ProviderOutageToggle`: renders manual provider outage checkboxes.

`src/components/TradeReviewSummary.tsx`

- `TradeReviewSummary`: renders the decision-ready pre-trade summary or no-route review state.
- `ReviewMetric`: internal helper for labeled summary metrics.
- `formatProviderPath`: internal helper for provider-path display.
- `qualityTone`: internal helper for quality label styling.

`src/components/RecommendedRouteCard.tsx`

- `RecommendedRouteCard`: highlights the top route recommendation.

`src/components/DirectBenchmarkCard.tsx`

- `DirectBenchmarkCard`: shows the best direct one-leg route, when available.

`src/components/RouteComparisonTable.tsx`

- `RouteComparisonTable`: compares top routes in a compact table.

`src/components/RouteCard.tsx`

- `RouteCard`: renders a detailed ranked route.
- `getRouteLabel`: internal helper that labels ranks as recommended, fallback, or backup.

`src/components/RouteLegTable.tsx`

- `RouteLegTable`: renders leg-by-leg provider, fee, rate, and output values.

`src/components/CalculationAuditTrail.tsx`

- `CalculationAuditTrail`: shows expandable calculation details for each leg.

`src/components/CopyRouteSummaryButton.tsx`

- `CopyRouteSummaryButton`: writes a formatted route summary to the clipboard and shows copied state.

`src/components/RouteComplexityBadge.tsx`

- `RouteComplexityBadge`: displays Low, Medium, or High complexity with reasons.

`src/components/RouteExplanation.tsx`

- `RouteExplanation`: displays the generated explanation text for a route.

`src/components/AmountSensitivity.tsx`

- `AmountSensitivity`: renders the Recharts line chart and sensitivity table.

`src/components/ProviderHealth.tsx`

- `ProviderHealth`: renders provider status, edge counts, timestamps, and messages.

`src/components/DiagnosticsPanel.tsx`

- `DiagnosticsPanel`: renders calculation metadata.

`src/components/format.ts`

- `formatAmount`: formats monetary values to cents.
- `formatRate`: formats effective rates.
- `formatPercent`: formats nullable percentage differences.
- `formatDifference`: formats nullable absolute differences.
- `formatDateTime`: formats ISO timestamps for display.

### Provider Model

`src/lib/providers.ts`

- `ProviderConfigError`: custom error for malformed provider configuration.
- `loadProviders`: reads and validates `providers.json`.
- `getConfiguredCurrencies`: collects currencies from static provider pairs.
- `normalizeProvider`: validates and normalizes a raw provider object.
- `readString`: validates required string fields.
- `readProviderType`: validates provider type.
- `readRateSource`: validates rate source.
- `readFeeModel`: validates fee percent, flat fee, and fee currency.
- `readApi`: validates live provider API config.
- `readPairs`: validates static provider pairs.
- `isObject`: object type guard.
- `isFinitePositiveNumber`: positive numeric guard.
- `isFiniteNonNegativeNumber`: non-negative numeric guard.

### Rate Adapters

`src/lib/rates/alphaFx.ts`

- `fetchAlphaFxEdges`: fetches and normalizes AlphaFX live rates.
- `fetchBaseRates`: fetches rates for one base currency and reports success/failure.

`src/lib/rates/betaBank.ts`

- `fetchBetaBankEdges`: fetches and normalizes BetaBank live rates.
- `fetchBaseRates`: fetches rates for one base currency and reports success/failure.

`src/lib/rates/deltaMarkets.ts`

- `fetchDeltaMarketsEdges`: fetches and normalizes DeltaMarkets live rates.
- `fetchBaseRates`: fetches rates for one base currency and reports success/failure.

`src/lib/rates/staticProviders.ts`

- `buildStaticEdges`: converts configured static pairs into routing edges.
- `buildStaticEdgeResult`: returns static edges plus health and warnings.

`src/lib/rates/http.ts`

- `fetchJsonWithTimeout`: fetches JSON with an abort timeout.
- `withMemoryCache`: caches live API responses in memory for the configured TTL.
- `classifyRateError`: maps thrown errors to provider health statuses.
- `summarizeLiveWarnings`: turns partial or full live failures into user-facing warnings.
- `buildLiveProviderHealth`: builds provider health records for live providers.
- `chooseFailureStatus`: internal helper that chooses the most useful failure status.
- `isAbortError`: internal helper for timeout detection.
- `readNumberEnv`: reads positive numeric environment settings.

`src/lib/rates/currencyFilters.ts`

- `isLiveRateCurrency`: filters live API symbols so fiat providers do not create stablecoin routes that should come from configured stablecoin venues.

### Routing Model

`src/lib/routing/calculateRoutes.ts`

- `calculateRoutesResponse`: main route calculation service. Validates input, loads providers, builds edges, handles all-disabled and unsupported-currency cases, ranks routes, builds amount sensitivity, and returns a structured API response.
- `createRouteErrorBody`: creates consistent API error payloads.
- `validateRequest`: internal API payload validator.
- `readCurrency`: normalizes currency values.
- `readMaxLegs`: validates and defaults max legs.
- `readRailFilter`: validates and defaults rail filters.
- `readComplexityFilter`: validates and defaults complexity filters.
- `buildDiagnostics`: creates response diagnostics.

`src/lib/routing/calculateProviderCoverage.ts`

- `calculateProviderCoverage`: counts usable and unavailable providers from provider health and computes coverage percentage.

`src/lib/routing/calculateResultQuality.ts`

- `calculateResultQuality`: converts provider coverage into High, Partial, Limited, or No Coverage with an observable reason.

`src/lib/routing/buildEdges.ts`

- `buildEdges`: builds the full active edge set from live providers, static providers, and simulated outage settings.
- `getLiveBaseCurrencies`: selects base currencies to fetch from live providers.

`src/lib/routing/generateRoutes.ts`

- `generateRoutes`: enumerates directed candidate paths from source to target up to max legs.

`src/lib/routing/simulateRoute.ts`

- `simulateRoute`: applies fees and rates through every route leg and returns a simulated route result or `null` if invalid.

`src/lib/routing/findTopRoutes.ts`

- `findTopRoutes`: returns only the ranked routes.
- `findRankedRoutes`: returns ranked routes plus the best direct benchmark.
- `collectSupportedCurrencies`: collects currencies present in an edge set.
- `filterEdgesByRail`: applies fiat/stablecoin rail filters.
- `normalizeOptions`: internal helper for old numeric limit or newer options object.
- `enrichRoute`: adds rank, direct comparison, and explanation to a simulated route.
- `matchesComplexityFilter`: applies complexity filter settings.

`src/lib/routing/amountSensitivity.ts`

- `DEFAULT_SENSITIVITY_AMOUNTS`: default scenario amounts.
- `buildAmountSensitivity`: recalculates the best route at each scenario amount.

`src/lib/routing/calculateEffectiveRate.ts`

- `calculateEffectiveRate`: final amount divided by starting amount, with invalid starting amount protected.

`src/lib/routing/calculateComplexity.ts`

- `calculateComplexity`: assigns Low, Medium, or High complexity and reasons.
- `routeUsesStablecoin`: detects stablecoin usage in route legs.

`src/lib/routing/explainRoute.ts`

- `explainRoute`: generates short data-based route explanation text.

`src/lib/routing/filterProviders.ts`

- `normalizeDisabledProviders`: matches user-provided disabled provider names against configured providers.
- `filterDisabledProviders`: removes disabled providers before edge building.
- `filterDisabledEdges`: removes disabled provider edges from an edge list.
- `buildSimulatedOutageHealth`: creates provider health rows for manually disabled providers.
- `buildSimulatedOutageWarnings`: creates warning messages for manually disabled providers.

`src/lib/routing/formatRouteSummary.ts`

- `formatRouteSummary`: builds the text copied by the Copy Summary button.
- `formatNumber`: internal cents formatter for copied summaries.

`src/lib/routing/types.ts`

- Shared types for providers, edges, provider health, route legs, route results, rankings, sensitivity points, diagnostics, filters, and API responses.

### Scripts

`scripts/backend-only.ts`

- Creates a Node HTTP server for API-only use.
- `setCorsHeaders`: enables simple cross-origin API calls.
- `sendJson`: writes JSON responses.
- `readJsonBody`: reads and validates request bodies with a 1 MB limit.

`scripts/run-vitest.cjs`

- Runs Vitest in a way that avoids Windows path issues when the project folder contains `#`.
- `getWindowsShortPath`: resolves a short Windows path before launching Vitest.

### Tests

`tests/simulateRoute.test.ts`

- Covers fee application, single-leg and multi-leg simulation, and fee-consuming invalid routes.

`tests/findTopRoutes.test.ts`

- Covers ranking, direct benchmark comparison, and no-route behavior.

`tests/buildEdges.test.ts`

- Covers static edge normalization and static provider health.

`tests/routeInsights.test.ts`

- Covers effective rate, complexity, route explanation, route summary formatting, and disabled-provider filtering.

## Request And Response Shape

Primary API endpoint:

```text
POST /api/routes
```

Typical request:

```json
{
  "source": "GBP",
  "target": "JPY",
  "amount": 1000,
  "maxLegs": 3,
  "railFilter": "all",
  "complexityFilter": "all",
  "disabledProviders": []
}
```

Response includes:

- `source`, `target`, `amount`
- `disabledProviders`
- `maxLegs`, `railFilter`, `complexityFilter`
- `routes`
- `directBenchmark`
- `providerHealth`
- `providerCoverage`
- `resultQuality`
- `amountSensitivity`
- `diagnostics`
- `warnings`
- optional `message`

## Current Limits And Assumptions

- The app is decision support only. It does not execute trades.
- There is no authentication or authorization yet.
- Results are not persisted to a database.
- Stablecoin routes come only from configured static pairs.
- Live provider responses are cached in memory, not persisted.
- Routes are capped at 3 legs.
- Fees are charged in the source currency of each leg.
- Static rates are case-study data, not executable institutional quotes.
- JavaScript numbers are used for calculations; the UI formats outputs to cents.
- Production finance systems should replace JavaScript number arithmetic with decimal or fixed-point monetary calculations.

## Verification Status

The latest verification pass after the MVC refactor completed successfully:

```bash
npm run typecheck
npm test
npm run build
```

The backend-only server was also smoke-tested with a `GBP -> JPY` request and returned 3 routes, 6 provider health entries, and diagnostics.
