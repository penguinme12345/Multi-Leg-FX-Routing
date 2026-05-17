# Repo Map And QA Runbook

This file explains where the major pieces of the FX Route Optimizer live, how data moves through the app, and what to test before submitting or demoing.

## Quick Start

Install dependencies:

```bash
npm install
```

Run full app:

```bash
npm run dev
```

Run backend API only:

```bash
npm run backend
```

Backend-only default URL:

```text
http://127.0.0.1:4000
```

Backend route endpoint:

```text
POST http://127.0.0.1:4000/api/routes
```

Run verification:

```bash
npm run typecheck
npm test
npm run build
```

## Environment

Copy the example file if you want local overrides:

```bash
cp .env.example .env.local
```

Available values:

```env
RATE_API_TIMEOUT_MS=5000
RATE_CACHE_TTL_SECONDS=600
MAX_ROUTE_LEGS=3
BACKEND_HOST=127.0.0.1
BACKEND_PORT=4000
```

The app has safe defaults if these are missing.

## How The App Flows

1. User enters source, target, and amount in the dashboard.
2. `src/controllers/useFxDashboardController.ts` validates UI input and posts to `/api/routes`.
3. `src/app/api/routes/route.ts` parses the request and delegates to the route controller.
4. `src/controllers/routesController.ts` calls the shared route calculation model/service.
5. `src/lib/routing/calculateRoutes.ts` validates API input, loads providers, builds edges, and ranks routes.
6. Live provider adapters fetch rates and normalize them into edges.
7. Static stablecoin providers read pairs from `providers.json`.
8. The routing engine generates routes up to the selected max legs.
9. Each route is simulated leg by leg with fees applied before conversion.
10. `src/views/FxRouteDashboardView.tsx` renders recommendation, benchmark, comparison, detailed cards, health, diagnostics, and sensitivity analysis.

## MVC Architecture

### Model

Model code owns domain rules, data loading, provider normalization, graph generation, route simulation, ranking, and shared types.

- `src/lib/providers.ts`
- `src/lib/rates/*`
- `src/lib/routing/*`
- `providers.json`

### Controller

Controller code translates user or HTTP input into model calls, handles validation boundaries, manages UI state, and returns API-safe responses.

- `src/controllers/useFxDashboardController.ts`
- `src/controllers/routesController.ts`
- `src/app/api/routes/route.ts`
- `scripts/backend-only.ts`

### View

View code renders application state and user controls. It should avoid owning routing business logic.

- `src/views/FxRouteDashboardView.tsx`
- `src/components/*`
- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`

## Project Map

### Root Files

`providers.json`
Provider configuration. Includes provider names, live API endpoints, fee models, and static stablecoin pairs.

`package.json`
Scripts and dependencies. Important scripts:

- `npm run dev`: Next.js frontend + API dev server
- `npm run build`: production build
- `npm run start`: production Next server after build
- `npm run backend`: backend-only API server
- `npm run typecheck`: TypeScript check
- `npm test`: Vitest routing tests

`.env.example`
Documented local environment variables.

### PRDs

`fx_routing_prd.md`
Original assignment PRD.

`above_and_beyond_fx_routing_prd.md`
Expanded feature PRD.

`next_steps_fx_routing_features_prd.md`
Route explanation, effective rate, copy summary, complexity, examples, and outage simulation PRD.

`FX_Route_Optimizer_UI_Overhaul_PRD.md`
Dashboard UI overhaul PRD.

### App Layer

`src/app/page.tsx`
Thin Next.js page entry. It creates the dashboard controller and renders the dashboard view.

`src/app/api/routes/route.ts`
Next.js API wrapper. It parses JSON and delegates calculation to `src/controllers/routesController.ts`.

`src/app/globals.css`
Dashboard styling, responsive layout, cards, tabs, tables, loading states, and dark theme.

`src/app/layout.tsx`
Next.js root layout and metadata.

### Controllers

`src/controllers/useFxDashboardController.ts`
Client-side dashboard controller. Owns form state, loading/error state, active tab state, recent searches, advanced settings, provider outage selections, and route calculation actions.

`src/controllers/routesController.ts`
HTTP-facing route controller facade shared by the Next.js API route and backend-only server.

### Views

`src/views/FxRouteDashboardView.tsx`
Dashboard view. Receives controller state/actions and renders the home view, sidebar controls, route tabs, loading states, warnings, and results.

### UI Components

`src/components/CurrencyForm.tsx`
Order ticket: source dropdown, target dropdown, amount, submit button.

`src/components/ExampleScenarios.tsx`
Saved scenario buttons that fill and run calculations.

`src/components/RecentSearches.tsx`
Recent searches from local storage.

`src/components/AdvancedSettings.tsx`
Rail filter, max legs, and complexity filter.

`src/components/ProviderOutageToggle.tsx`
Manual provider outage simulation checkboxes.

`src/components/RecommendedRouteCard.tsx`
Top recommendation summary.

`src/components/DirectBenchmarkCard.tsx`
Best direct route benchmark.

`src/components/RouteComparisonTable.tsx`
Top route comparison table.

`src/components/RouteCard.tsx`
Detailed route card with final amount, effective rate, complexity, explanation, copy button, leg table, and audit trail.

`src/components/RouteLegTable.tsx`
Per-leg table showing input, fee, after-fee amount, rate, and output.

`src/components/CalculationAuditTrail.tsx`
Expandable calculation math for each leg.

`src/components/AmountSensitivity.tsx`
Sensitivity chart and table using Recharts.

`src/components/ProviderHealth.tsx`
Provider status panel.

`src/components/DiagnosticsPanel.tsx`
Data freshness, provider count, filter, and cache diagnostics.

`src/components/CopyRouteSummaryButton.tsx`
Clipboard route summary button.

`src/components/RouteComplexityBadge.tsx`
Complexity label and reasons.

`src/components/RouteExplanation.tsx`
Plain-English route explanation.

`src/components/format.ts`
Shared UI formatting helpers for amounts, rates, percentages, and timestamps.

### Routing And Backend Logic

`src/lib/routing/calculateRoutes.ts`
Shared route calculation service used by both Next API and backend-only server.

`src/lib/routing/buildEdges.ts`
Builds normalized edges from active providers.

`src/lib/routing/generateRoutes.ts`
Enumerates route candidates up to max legs.

`src/lib/routing/simulateRoute.ts`
Applies fees and rates to each leg.

`src/lib/routing/findTopRoutes.ts`
Ranks routes, applies filters, and finds the direct benchmark.

`src/lib/routing/amountSensitivity.ts`
Calculates best route across sample amounts.

`src/lib/routing/calculateEffectiveRate.ts`
Final amount divided by starting amount.

`src/lib/routing/calculateComplexity.ts`
Low, Medium, High complexity logic.

`src/lib/routing/explainRoute.ts`
Route explanation generator.

`src/lib/routing/filterProviders.ts`
Disabled provider normalization and simulated outage helpers.

`src/lib/routing/formatRouteSummary.ts`
Copyable text summary generator.

`src/lib/routing/types.ts`
Shared TypeScript types for providers, edges, routes, diagnostics, filters, and API responses.

### Provider Logic

`src/lib/providers.ts`
Loads and validates `providers.json`.

`src/lib/rates/http.ts`
Fetch timeout, memory cache, warning helpers, and provider health helpers.

`src/lib/rates/alphaFx.ts`
Frankfurter API adapter.

`src/lib/rates/betaBank.ts`
ExchangeRate-API adapter.

`src/lib/rates/deltaMarkets.ts`
fawazahmed0 currency API adapter.

`src/lib/rates/staticProviders.ts`
Static stablecoin pair normalization.

`src/lib/rates/currencyFilters.ts`
Filters live fiat API symbols so stablecoin routes only come from configured stablecoin venues.

### Scripts

`scripts/run-vitest.cjs`
Runs Vitest safely on Windows when the folder path contains `#`.

`scripts/backend-only.ts`
Starts the backend API without serving the React frontend.

### Tests

`tests/simulateRoute.test.ts`
Fee calculation, leg chaining, invalid fee behavior.

`tests/findTopRoutes.test.ts`
Ranking, direct-route comparison, no-route behavior.

`tests/buildEdges.test.ts`
Static edge normalization and static provider health.

`tests/routeInsights.test.ts`
Effective rate, complexity, explanation, copy summary, and disabled-provider filtering.

## Backend-Only Testing

Start the API:

```bash
npm run backend
```

PowerShell request:

```powershell
$body = @{
  source = "GBP"
  target = "JPY"
  amount = 1000
  maxLegs = 3
  railFilter = "all"
  complexityFilter = "all"
  disabledProviders = @()
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:4000/api/routes" `
  -ContentType "application/json" `
  -Body $body
```

Expected:

- Status `200`
- `routes` contains up to 3 routes
- `providerHealth` lists providers
- `diagnostics` exists
- `amountSensitivity` has rows

Invalid body test:

```powershell
Invoke-WebRequest `
  -Method Post `
  -Uri "http://127.0.0.1:4000/api/routes" `
  -ContentType "application/json" `
  -Body "{bad json"
```

Expected:

- Status `400`
- Error says request body must be valid JSON

## Automated QA Checklist

Run before every serious demo:

```bash
npm run typecheck
npm test
npm run build
```

Optional dependency check:

```bash
npm audit --omit=dev
```

Expected:

- Typecheck passes
- All tests pass
- Build completes
- Audit has no production vulnerabilities

## Manual UI QA Checklist

### First Load

- App opens to a calm start page.
- User sees order ticket, examples, recent searches if any, and a short feature preview.
- Advanced filters are not overwhelming on first load.
- Provider outage controls are hidden until after calculation.

### Order Ticket

- Source and target are dropdown-only controls.
- Default route is GBP to JPY with amount 1000.
- Amount accepts positive numeric input.
- Submit button disables while loading.

### Validation

Test:

- Source equals target
- Amount is blank
- Amount is `0`
- Amount is negative
- Amount is non-numeric

Expected:

- Clear error message
- No broken dashboard state

### Saved Examples

Click each:

- GBP to JPY, 1000
- USD to CAD, 10000
- CAD to AUD, 500
- EUR to USDC, 5000
- JPY to USD, 100000

Expected:

- Form updates
- Calculation runs automatically
- Dashboard opens on Overview tab

### Recent Searches

- Run at least two different searches.
- Refresh browser.
- Confirm recent searches remain.
- Click a recent search.
- Clear recent searches.

Expected:

- Recent search restores source, target, amount, and runs calculation.
- Clear removes local entries.

### Dashboard Tabs

After calculation, test each tab:

- Overview
- Routes
- Analysis
- Reliability

Expected:

- Overview shows recommended route, direct benchmark, diagnostics.
- Routes shows comparison table and detailed cards.
- Analysis shows chart and sensitivity table.
- Reliability shows provider health and outage guidance.

### Recommended Route

Expected:

- Final delivered amount is prominent.
- Effective rate is visible.
- Difference vs direct is shown when available.
- Complexity is visible.
- Explanation is short and data-based.

### Route Comparison

Expected:

- Up to 3 routes appear.
- Final amount, effective rate, direct difference, percentage, complexity, legs, and providers are readable.
- Table scrolls horizontally on small screens.

### Detailed Route Cards

Expected:

- Each card has rank label.
- Provider path is visible.
- Copy Summary button works.
- Per-leg breakdown includes input, fee, after-fee amount, rate, output.
- Calculation audit trail expands and matches the leg table.

### Copy Summary

- Click Copy Summary on each route.
- Paste into a text editor.

Expected copied content:

- Route rank
- Path
- Input amount
- Final delivered
- Effective rate
- Difference vs direct
- Complexity
- Explanation

### Amount Sensitivity

Expected:

- Chart renders.
- Table has 100, 1000, 10000, 100000 rows.
- Final delivered values are rounded cleanly.
- Effective rate and direct difference appear.

### Provider Health

Expected:

- Six providers are listed unless all are disabled.
- Online/static/failed/simulated outage statuses are readable.
- Messages and timestamps are visible.

### Provider Outage Simulation

After a successful calculation:

- Open provider outage simulation.
- Disable BetaBank.
- Disable AlphaFX.
- Disable all six providers.

Expected:

- Routes recalculate.
- Disabled providers show `Simulated outage`.
- Warnings mention disabled providers.
- If all providers are disabled, no-route state explains why.

### Advanced Filters

Test:

- Max legs = 1
- Rail filter = Fiat only
- Rail filter = Stablecoin only
- Complexity filter = Low only

Expected:

- Routes recalculate.
- Results honor the filters.
- No-route state is clear when filters are too strict.

### Backend-Only Parity

Compare a frontend request and backend-only request with the same payload.

Expected:

- Same route structure
- Same warnings
- Same diagnostics shape
- Same disabled provider behavior

## Manual API QA Payloads

Happy path:

```json
{
  "source": "GBP",
  "target": "JPY",
  "amount": 1000
}
```

Direct-only:

```json
{
  "source": "USD",
  "target": "CAD",
  "amount": 10000,
  "maxLegs": 1,
  "railFilter": "fiat_only",
  "complexityFilter": "low"
}
```

Stablecoin route:

```json
{
  "source": "EUR",
  "target": "USDC",
  "amount": 5000
}
```

Provider outage:

```json
{
  "source": "GBP",
  "target": "JPY",
  "amount": 1000,
  "disabledProviders": ["AlphaFX", "BetaBank"]
}
```

All providers disabled:

```json
{
  "source": "GBP",
  "target": "JPY",
  "amount": 1000,
  "disabledProviders": [
    "AlphaFX",
    "BetaBank",
    "DeltaMarkets",
    "GammaCrypto",
    "EpsilonChain",
    "ZetaSwap"
  ]
}
```

Invalid currency:

```json
{
  "source": "XYZ",
  "target": "JPY",
  "amount": 1000
}
```

Invalid amount:

```json
{
  "source": "USD",
  "target": "CAD",
  "amount": -100
}
```

## Submission QA

Before final submission:

- Run automated checks.
- Test at least one happy path.
- Test one stablecoin route.
- Test one invalid input.
- Test one provider outage.
- Test all providers disabled.
- Test Copy Summary.
- Check README links and setup instructions.
- Add deployed app URL and GitHub URL when available.
