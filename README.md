# Multi-Leg FX Routing Tool

Internal FX routing dashboard for comparing direct and multi-leg execution paths across fiat brokers and stablecoin venues. A user enters source currency, target currency, and amount; the app returns the top 3 valid routes ranked by final delivered amount after rates and per-leg fees.

## Links

- Live deployment: https://multi-leg-fx-routing-ecru.vercel.app/
- GitHub repository: https://github.com/penguinme12345/Multi-Leg-FX-Routing

## Assignment Submission Answers

### How To Run Locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Useful verification commands:

```bash
npm run typecheck
npm test
npm run build
```

### AI Tools Used

I used OpenAI Codex as an AI-assisted development tool throughout the project. My workflow was based around writing structured Markdown planning files before asking Codex to implement changes.

Specifically, I created Markdown documents such as PRDs, feature specs, UI overhaul notes, and implementation checklists. These files described the expected behavior, data models, acceptance criteria, edge cases, and implementation order for each major feature. I then used Codex to help translate those Markdown specs into TypeScript/React code.

Examples of how I used Codex:

- I wrote PRD-style Markdown files for the base routing engine, dashboard UI overhaul, provider health, outage simulation, route explanations, and final interview polish features.
- I used those `.md` files as structured context so Codex had clear requirements before editing code.
- I asked Codex to implement features incrementally instead of generating the whole app at once.
- I used Codex to scaffold components, update TypeScript types, refactor repeated UI patterns, and add tests.
- I reviewed the generated changes manually, especially around route simulation, fee calculation, provider normalization, and direct-route comparison.
- I ran `npm run typecheck`, `npm test`, and `npm run build` after major changes to catch issues.

This approach helped me use AI as an implementation partner while keeping the modeling, validation, and review decisions explicit. The Markdown specs forced me to define the problem clearly before asking Codex to code it.

### One Thing AI Got Wrong

One issue I caught was that the AI-generated implementation and explanations treated every calculated route as economically valid as long as the math worked against the provided rates. The route engine was technically calculating the outputs correctly using the provider rates and fee models, including the static values from `providers.json`. However, some results were economically suspicious when compared to real-world FX behavior.

For example, certain routes were artificially boosted because the app was combining live fiat API rates with configured static stablecoin rates. The calculation was correct based on the assignment data, but the AI did not initially flag that a route producing an unusually large improvement versus the direct benchmark might indicate stale or inconsistent rate sources.

I caught this by manually reviewing the route outputs and comparing whether the results made sense from a real-world finance perspective, not just from a mathematical perspective. To address it, I added a `Review Required` warning for routes that beat the direct benchmark by an unusually large percentage. This keeps the route visible and ranked correctly according to the provided data, but clearly signals that the user should manually review the rate sources before treating the route as realistic or executable.

### How I Modeled The Routing Problem

I modeled the FX routing problem as a directed graph. Each currency is a node, and each provider quote is a directed edge from one currency to another. Each edge stores the provider name, source currency, target currency, exchange rate, fee percentage, flat fee, and rate source.

The app first normalizes both live API rates and configured static pairs from `providers.json` into this shared edge format. This keeps the routing engine provider-agnostic, meaning the route calculation does not need to care whether a rate came from a live fiat API or a configured stablecoin venue.

For each request, the engine generates every valid route from the source currency to the target currency up to the assignment limit of 3 legs. Each candidate route is simulated leg by leg, with fees applied before conversion on every leg. The routes are then ranked by final delivered amount, and the top 3 are returned with a direct-route benchmark, per-leg breakdown, provider health, and review warnings when needed.

I used bounded exhaustive search rather than shortest-path optimization because routes are capped at 3 legs and fees make each leg amount-dependent.

### One Thing I Would Do Differently With More Time

With more time, I would focus on moving the project closer to a production-ready internal trading tool.

First, I would improve financial precision. The current implementation uses JavaScript numbers for route simulation and rounds values at the presentation layer. For a production financial system, I would use decimal arithmetic, fixed-point integer minor units, or a dedicated decimal library to avoid floating-point precision issues across multi-leg routes.

Second, I would add persistent audit logging. The app currently shows provider health, diagnostics, route warnings, and calculation audit trails in the UI, but it does not save route review records. In a production version, I would persist each request, provider status, selected route, warnings, timestamps, and calculation details so route decisions could be reviewed or reconciled later.

Third, I would add authentication and role-based access control. This case-study version is a public demo and does not execute trades, but a real internal trading operations dashboard should only be accessible to authorized users. Different roles could have different permissions, such as viewing routes, simulating provider outages, or changing provider settings.

Finally, I would continue improving the UI and QA coverage. I would polish responsive layouts, add more charting around route performance and provider coverage, expand edge-case testing, and improve bug handling around unusual rate combinations or provider failures.

## Supporting Project Details

## Tech Stack

- Next.js App Router
- TypeScript
- React
- Recharts
- Vitest
- Provider data from `providers.json`

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run typecheck
npm test
npm run backend
```

`npm test` uses a small launcher in `scripts/run-vitest.cjs` because Vite can misread Windows paths containing `#`, such as `Case Study #1`.

`npm run backend` starts only the API server at `http://127.0.0.1:4000` and exposes `POST /api/routes`.

## Documentation

- `docs/FEATURE_FUNCTION_OVERVIEW.md`: detailed catalog of every current feature, component, controller, model function, script, and test area.
- `docs/REPO_MAP_AND_QA.md`: repo map, setup notes, backend-only testing, and manual QA checklist.

## Environment Variables

The app has safe defaults if environment variables are missing.

```env
RATE_API_TIMEOUT_MS=5000
RATE_CACHE_TTL_SECONDS=600
MAX_ROUTE_LEGS=3
```

## What The App Does

- Loads provider configuration from `providers.json`.
- Fetches live fiat rates from AlphaFX, BetaBank, and DeltaMarkets.
- Loads static stablecoin pairs from GammaCrypto, EpsilonChain, and ZetaSwap.
- Normalizes all quotes into a shared `Edge` type.
- Generates all valid routes up to 3 legs.
- Applies percentage and flat fees on every leg before conversion.
- Ranks routes by final delivered amount.
- Shows top 3 routes, per-leg breakdowns, effective rates, explanations, complexity, provider health, warnings, and amount sensitivity.

## Extra Features

Beyond the core assignment requirements, I added several features to make the tool closer to a real internal trading operations dashboard:

- Dark, dense dashboard layout for pre-trade route review.
- Calm first-load home screen that keeps advanced controls out of the way until results exist.
- Trade Review Summary panel for decision-ready route review.
- Provider Coverage score derived from provider health.
- Result Quality label based only on observable provider coverage.
- Reset Demo button for repeated interview walkthroughs.
- Recommended route summary card.
- Best direct benchmark card.
- Top route comparison table.
- Amount sensitivity chart powered by Recharts.
- Calculation audit trail for every route.
- Advanced filters for rail type, max legs, and complexity.
- Recent searches saved in local storage.
- Effective rate display so routes can be compared on an all-in rate basis.
- Plain-English route explanations to help users understand why a route ranked highly.
- Route complexity labels to show operational tradeoffs between direct and multi-leg routes.
- Saved example scenarios to make the app easy to test quickly.
- Copyable route summaries for sharing route decisions internally.
- Provider outage simulation to verify that the routing engine still returns useful results when one or more providers are unavailable.

## Routing Model

I modeled the FX routing problem as a directed graph where currencies are nodes and provider quotes are edges. Each edge stores provider, rate, fee percentage, and flat fee. Since the assignment limits routes to a maximum of three legs, I used bounded exhaustive route enumeration instead of Dijkstra's algorithm. Each candidate route is simulated leg by leg because the amount changes after each provider fee and conversion.

Fee formula:

```text
total_fee = leg_amount * fee_percent + fee_flat
amount_after_fee = leg_amount - total_fee
output_amount = amount_after_fee * rate
```

Routes where the fee is greater than or equal to the leg input are discarded. Remaining routes are sorted by final delivered amount, and each top route is compared against the best direct route when available.

## MVC Architecture

The codebase is split into clear MVC layers:

- Model: `src/lib/providers.ts`, `src/lib/rates/*`, `src/lib/routing/*`, and `providers.json`
- Controller: `src/controllers/useFxDashboardController.ts`, `src/controllers/routesController.ts`, `src/app/api/routes/route.ts`, and `scripts/backend-only.ts`
- View: `src/views/FxRouteDashboardView.tsx`, `src/components/*`, `src/app/page.tsx`, `src/app/layout.tsx`, and `src/app/globals.css`

More detail lives in `docs/REPO_MAP_AND_QA.md`.

## Provider Reliability

Live API calls are isolated per provider and base currency. If a provider times out, returns malformed data, or fails, the API still returns routes from the remaining providers. The UI surfaces this in two places:

- Provider Health panel
- Warning banner

Static stablecoin venues are marked as `Static loaded` with their configured pair count.

The provider outage simulation feature allows reviewers to manually disable one or more providers and confirm that the routing engine continues to return the best available routes using the remaining providers. Disabled providers are not fetched, their edges are excluded, Provider Health marks them as `Simulated outage`, and warning messages explain the calculation scope.

## Rate Source Attribution

BetaBank uses ExchangeRate-API open access rates. Rates by Exchange Rate API: https://www.exchangerate-api.com

## Amount Sensitivity

The dashboard includes a scenario table for:

```text
100
1,000
10,000
100,000
```

For each input amount, the app recalculates the best route using the same normalized edge set. This shows how flat fees can dominate small transfers while rate and percentage fees matter more for larger transfers.

## API

```text
POST /api/routes
```

Request:

```json
{
  "source": "GBP",
  "target": "JPY",
  "amount": 1000,
  "disabledProviders": ["BetaBank"]
}
```

Response includes:

- normalized source, target, and amount
- disabled provider list
- `routes`
- `providerHealth`
- `providerCoverage`
- `resultQuality`
- `amountSensitivity`
- `diagnostics`
- `warnings`
- optional no-route message

## Testing

Vitest unit tests cover:

- fee calculation
- single-leg simulation
- multi-leg simulation
- invalid route filtering when fees consume input
- ranking by final amount
- direct route comparison
- static provider edge normalization
- no-route behavior
- effective rate calculation
- route complexity labels
- route explanation helpers
- copy summary formatting
- disabled provider filtering
- provider coverage scoring
- result quality labels

Run:

```bash
npm test
```

## Trading Operations Relevance

This tool is designed as a pre-trade decision-support dashboard. It does not execute transactions, but it helps an operations or trading user compare routes, provider fees, final recipient amounts, and provider availability before execution. The selected route could later be stored, approved, executed, and reconciled against the actual trade.

## Financial Precision Note

This case study uses JavaScript numbers for route simulation and formats displayed monetary values to cents in the presentation layer. This is acceptable for a demo assignment, but a production financial system should avoid floating-point arithmetic for monetary calculations. In production, I would use decimal arithmetic, fixed-point integer minor units, or a dedicated decimal library to avoid precision drift across multi-leg calculations.

## Production Considerations

- Replace JavaScript number arithmetic with decimal or fixed-point money calculations.
- Replace in-memory cache with shared cache such as Redis.
- Add authentication and authorization for internal use.
- Persist route review records if routes need to be audited later.
- Replace configured static rates with live venue or internal pricing feeds in production.

## Verification

Current verification commands:

```bash
npm run typecheck
npm test
npm run build
```

## Assumptions

- Fees are charged in the source currency of each leg.
- Percentage and flat fees both apply on every leg.
- Flat fees are applied before conversion.
- Routes are capped at 3 legs.
- Stablecoin routes only use pairs explicitly listed in `providers.json`.
- Live fiat providers are fetched for source, target, configured fiat currencies, and common hubs.
- Static rates are case-study data, not institutional-grade executable quotes.
- The first version does not execute trades, persist orders, or authenticate users.
