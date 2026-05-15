# Product Requirements Document (PRD)

# Multi-Leg FX Routing Tool

## 1. Overview

### Product Name
Multi-Leg FX Routing Tool

### Assignment Context
A mid-sized payments company helps clients send money internationally. A client provides a source currency, target currency, and amount. The client does not care which liquidity providers or intermediate currencies are used, only that the recipient receives as much money as possible after exchange rates and fees.

The company has access to multiple liquidity providers. Some providers quote the same currency pair with different rates and fees. Some routes are not available directly and require one or more intermediate currencies, including stablecoins such as USDT and USDC.

The goal is to build an internal tool that evaluates available provider routes and returns the top 3 cheapest/best routes, ranked by the final amount delivered to the recipient.

---

## 2. Problem Statement

For a given FX order, the cheapest route is not always obvious.

Example:

```text
GBP → JPY
```

May be worse than:

```text
GBP → USD → JPY
```

Or:

```text
GBP → USDT → JPY
```

The optimal route depends on:

- Provider exchange rates
- Provider fee percentages
- Provider flat fees
- Currency pair availability
- Transfer amount
- Whether direct or multi-leg routes exist
- Live API availability and reliability

The tool must calculate and compare possible routes with up to 3 legs and return the top 3 routes ranked by final delivered amount.

---

## 3. Goals

### Primary Goals

The application must:

1. Allow a user to enter:
   - Source currency
   - Target currency
   - Amount

2. Find all valid routes with up to 3 legs.

3. Support multiple providers per currency pair.

4. Apply provider-specific fees on each leg.

5. Rank routes by final amount delivered.

6. Display the top 3 routes.

7. Show a clear per-leg breakdown:
   - Provider
   - Source currency
   - Target currency
   - Input amount
   - Rate
   - Fee
   - Output amount

8. Compare each route against the best direct route, if a direct route exists.

9. Handle live API failures gracefully.

10. Provide a deployed app link and GitHub repository link.

---

## 4. Non-Goals

The first version does not need to:

- Execute real trades
- Store user accounts
- Process real payments
- Authenticate users
- Support unlimited route length
- Guarantee institutional-grade FX pricing
- Persist historical route data
- Build a full admin dashboard
- Support every currency in the world manually

---

## 5. Users

### Primary User
Operations team member reviewing possible FX execution routes before a transaction is executed.

### Secondary User
Technical reviewer evaluating the quality of the assignment implementation.

---

## 6. User Stories

### User Story 1: Find Best FX Route
As an operations user, I want to enter a source currency, target currency, and amount so that I can see the best available routes for sending money internationally.

### User Story 2: Compare Multiple Routes
As an operations user, I want to see the top 3 routes so that I can compare alternatives before execution.

### User Story 3: Understand Route Breakdown
As an operations user, I want to see the fee, rate, provider, and output amount for each leg so that I can understand why a route is ranked highly.

### User Story 4: Compare Against Direct Route
As an operations user, I want to see how a multi-leg route compares to a direct route so that I can quickly understand whether routing through intermediates improves the result.

### User Story 5: Handle Provider Failures
As an operations user, I want the app to still return useful results if one live API fails so that one provider outage does not break the entire tool.

---

## 7. Functional Requirements

## 7.1 Input Form

The UI must provide fields for:

- Source currency
- Target currency
- Amount

Example:

```text
Source: GBP
Target: JPY
Amount: 1000
```

### Validation Rules

The app should validate that:

- Source currency is not empty.
- Target currency is not empty.
- Source and target are not the same.
- Amount is a positive number.
- Amount is greater than 0.
- Currencies should be normalized to uppercase.

---

## 7.2 Provider Support

The app must load providers from `providers.json`.

Providers are split into two categories:

### Fiat Brokers

These use live APIs:

- AlphaFX
- BetaBank
- DeltaMarkets

### Stablecoin Venues

These use static inline pair data from `providers.json`:

- GammaCrypto
- EpsilonChain
- ZetaSwap

Each provider has:

- Name
- Type
- Rate source
- Fee model
- Supported pairs, if static
- API endpoint, if live

---

## 7.3 Fee Calculation

Fees are applied per leg using the formula:

```text
total_fee = leg_amount × fee_percent + fee_flat
```

Then:

```text
amount_after_fee = leg_amount - total_fee
output_amount = amount_after_fee × rate
```

### Important Assumptions

- Fees are charged in the source currency of the leg.
- Both percentage fee and flat fee always apply.
- Flat fee is applied before conversion because it is charged in the leg source currency.
- If the fee is greater than or equal to the leg amount, the route is invalid.

---

## 7.4 Route Search

The system must find routes with:

- 1 leg
- 2 legs
- 3 legs maximum

Example route shapes:

```text
Direct:
GBP → JPY

Two-leg:
GBP → USD → JPY

Three-leg:
GBP → USD → USDT → JPY
```

Each leg may use a different provider.

Example:

```text
GBP →[BetaBank]→ USD →[GammaCrypto]→ USDT →[EpsilonChain]→ JPY
```

---

## 7.5 Route Ranking

Routes must be ranked by:

```text
final amount delivered to recipient
```

Higher final amount is better.

The app should return the top 3 valid routes.

---

## 7.6 Direct Route Comparison

If at least one direct route exists, identify the best direct route.

For each top route, show:

```text
difference_vs_direct = route_final_amount - best_direct_final_amount
```

Display this as:

```text
+1,250.44 JPY vs direct
```

or:

```text
-43.20 JPY vs direct
```

If no direct route exists, show:

```text
No direct route available
```

---

## 7.7 Error Handling

The app must handle:

- API timeouts
- API rate limits
- Invalid API responses
- Missing currency pairs
- Provider unavailable
- No valid routes found
- Malformed `providers.json`
- Unsupported currencies

The app should not fail entirely when one provider fails.

Instead, it should:

- Skip unavailable providers
- Continue evaluating other providers
- Display a warning if some providers were unavailable

Example warning:

```text
BetaBank unavailable. Results exclude this provider.
```

---

## 8. Data Model

## 8.1 Provider

```ts
type Provider = {
  name: string;
  type: "fiat_broker" | "stablecoin_venue";
  rate_source: "live_api" | "static";
  api?: {
    endpoint: string;
    docs: string;
  };
  fee_model: {
    fee_percent: number;
    fee_flat: number;
    fee_currency: "source";
  };
  pairs?: StaticPair[];
};
```

## 8.2 Static Pair

```ts
type StaticPair = {
  from: string;
  to: string;
  rate: number;
};
```

## 8.3 Normalized Edge

All live and static rates should be normalized into a common edge format.

```ts
type Edge = {
  provider: string;
  providerType: "fiat_broker" | "stablecoin_venue";
  from: string;
  to: string;
  rate: number;
  feePercent: number;
  feeFlat: number;
};
```

## 8.4 Route Leg Result

```ts
type RouteLegResult = {
  provider: string;
  from: string;
  to: string;
  rate: number;
  inputAmount: number;
  fee: number;
  amountAfterFee: number;
  outputAmount: number;
};
```

## 8.5 Route Result

```ts
type RouteResult = {
  path: string[];
  legs: RouteLegResult[];
  finalAmount: number;
  differenceVsDirect?: number;
};
```

---

## 9. Routing Algorithm

## 9.1 Recommended Approach

Model the problem as a directed graph:

- Currencies are nodes.
- Provider quotes are directed edges.
- Each edge contains rate and fee data.

Because routes are limited to a maximum of 3 legs, use bounded route enumeration instead of a shortest-path algorithm.

### Why Not Dijkstra First?

Dijkstra is not ideal for the first implementation because:

- Route length is capped at 3 legs.
- Fees depend on the amount after each previous leg.
- Multiple providers may quote the same pair.
- Simple exhaustive search is easier to verify and explain.
- The graph size is small.

---

## 9.2 Algorithm Steps

1. Load provider configuration.
2. Fetch live fiat rates.
3. Normalize live and static rates into edges.
4. Generate all valid routes from source to target with 1 to 3 legs.
5. Avoid cycles where practical.
6. Simulate each route leg-by-leg.
7. Discard invalid routes.
8. Sort routes by final amount descending.
9. Identify best direct route if available.
10. Return top 3 routes.

---

## 9.3 Pseudocode

```ts
function findTopRoutes(source, target, amount, edges) {
  const candidateRoutes = generateRoutes(source, target, edges, 3);

  const simulatedRoutes = candidateRoutes
    .map(route => simulateRoute(route, amount))
    .filter(route => route !== null);

  const directRoutes = simulatedRoutes.filter(route => route.legs.length === 1);
  const bestDirectRoute = getBestRoute(directRoutes);

  const rankedRoutes = simulatedRoutes.sort(
    (a, b) => b.finalAmount - a.finalAmount
  );

  return rankedRoutes.slice(0, 3).map(route => ({
    ...route,
    differenceVsDirect: bestDirectRoute
      ? route.finalAmount - bestDirectRoute.finalAmount
      : null
  }));
}
```

---

## 10. API Integration Requirements

## 10.1 AlphaFX

Provider type:

```text
fiat_broker
```

Rate source:

```text
Frankfurter API
```

Implementation needs to:

- Fetch latest rates.
- Normalize the API response into edges.
- Handle unsupported currencies.
- Handle timeout or malformed response.

---

## 10.2 BetaBank

Provider type:

```text
fiat_broker
```

Rate source:

```text
ExchangeRate-API open access
```

Implementation needs to:

- Fetch latest rates.
- Normalize response.
- Handle rate limits.
- Handle provider errors.

---

## 10.3 DeltaMarkets

Provider type:

```text
fiat_broker
```

Rate source:

```text
fawazahmed0 currency-api
```

Implementation needs to:

- Fetch latest rates.
- Normalize nested response shape.
- Handle unavailable currency files.
- Handle CDN or malformed response errors.

---

## 10.4 Static Stablecoin Providers

For:

- GammaCrypto
- EpsilonChain
- ZetaSwap

Implementation needs to:

- Read inline pairs from `providers.json`.
- Convert each pair into a normalized edge.
- Use provider-specific fee model.

---

## 11. UI Requirements

## 11.1 Main Page

The main page should include:

- App title
- Short description
- Input form
- Submit button
- Loading state
- Error state
- Results section

---

## 11.2 Results Display

For each of the top 3 routes, display:

- Rank
- Full route path
- Final delivered amount
- Difference vs direct route
- Per-leg breakdown

Example:

```text
#1 GBP →[BetaBank]→ USD →[GammaCrypto]→ JPY

Final delivered: 192,400.22 JPY
Difference vs direct: +1,322.10 JPY
```

Per-leg table:

| Leg | Provider | From | To | Input | Rate | Fee | Output |
|---|---|---|---|---:|---:|---:|---:|
| 1 | BetaBank | GBP | USD | 1000.00 | 1.27 | 25.80 | 1237.43 |
| 2 | GammaCrypto | USD | JPY | 1237.43 | 152.40 | 2.24 | 188,325.16 |

---

## 12. Optional Stretch Goals

These are not required for the first version but can improve the submission.

## 12.1 Rail Filter

Allow the user to filter by:

```text
All rails
Fiat only
Stablecoin allowed
Stablecoin only
```

## 12.2 Amount Scaling View

Show how the best route changes for different transfer amounts.

Example amounts:

```text
100
1,000
10,000
100,000
```

This is useful because flat fees impact small transfers more heavily than large transfers.

## 12.3 Route Graph Visualization

Visualize currencies as nodes and provider routes as directed edges.

---

## 13. Technical Architecture

## 13.1 Recommended Stack

```text
Next.js
TypeScript
Tailwind CSS
Vercel
```

## 13.2 Suggested Folder Structure

```text
src/
  app/
    page.tsx
    api/
      routes/
        route.ts

  components/
    RouteCard.tsx
    RouteLegTable.tsx
    CurrencyForm.tsx

  lib/
    providers.ts
    rates/
      alphaFx.ts
      betaBank.ts
      deltaMarkets.ts
      staticProviders.ts
    routing/
      buildEdges.ts
      generateRoutes.ts
      simulateRoute.ts
      findTopRoutes.ts
      types.ts

providers.json
README.md
```

---

## 14. API Design

## 14.1 Route Calculation Endpoint

Endpoint:

```text
POST /api/routes
```

Request body:

```json
{
  "source": "GBP",
  "target": "JPY",
  "amount": 1000
}
```

Response body:

```json
{
  "source": "GBP",
  "target": "JPY",
  "amount": 1000,
  "routes": [
    {
      "rank": 1,
      "path": ["GBP", "USDC", "JPY"],
      "finalAmount": 192400.22,
      "differenceVsDirect": 1322.1,
      "legs": [
        {
          "provider": "EpsilonChain",
          "from": "GBP",
          "to": "USDC",
          "rate": 1.2686,
          "inputAmount": 1000,
          "fee": 3.2,
          "amountAfterFee": 996.8,
          "outputAmount": 1264.54
        }
      ]
    }
  ],
  "warnings": [
    "BetaBank unavailable. Results exclude this provider."
  ]
}
```

---

## 15. Performance Requirements

Because the graph is small and routes are capped at 3 legs:

- Route calculation should complete quickly.
- Live API calls should use timeouts.
- API responses may be cached briefly.
- The app should avoid unnecessary repeated API calls.

Recommended cache duration:

```text
5 to 15 minutes
```

This is enough for a case study and helps avoid rate limits.

---

## 16. Reliability Requirements

The app should be resilient to partial failure.

### Examples

If AlphaFX fails:

```text
Continue with BetaBank, DeltaMarkets, and static providers.
```

If all live APIs fail:

```text
Still return stablecoin routes if available.
```

If no routes exist:

```text
Show a clear message: No valid routes found for this currency pair.
```

---

## 17. Edge Cases

The app should handle:

- Same source and target currency
- Negative amount
- Zero amount
- Non-numeric amount
- Unsupported source currency
- Unsupported target currency
- No direct route
- No route at all
- Provider API returns missing rates
- Provider API times out
- Fee exceeds input amount
- Duplicate routes from different providers
- Same currency appearing multiple times in a route
- Very small amount where flat fees dominate
- Very large amount where percentage fees dominate

---

## 18. Testing Plan

## 18.1 Unit Tests

Test:

- Fee calculation
- Route simulation
- Route ranking
- Direct route comparison
- Static provider edge creation
- Invalid route filtering

## 18.2 Integration Tests

Test:

- Live API normalization
- API timeout fallback
- Multiple providers quoting same pair
- Static and live providers together

## 18.3 Manual Test Cases

### Test Case 1

```text
Source: GBP
Target: JPY
Amount: 1000
```

Expected:

```text
Top 3 routes shown with final JPY amount.
```

### Test Case 2

```text
Source: USD
Target: CAD
Amount: 10000
```

Expected:

```text
Direct and stablecoin routes may compete.
```

### Test Case 3

```text
Source: CAD
Target: AUD
Amount: 100
```

Expected:

```text
Flat fees should heavily affect small-transfer route ranking.
```

### Test Case 4

```text
Source: EUR
Target: USDC
Amount: 5000
```

Expected:

```text
Static stablecoin routes should appear.
```

### Test Case 5

```text
Source: XYZ
Target: JPY
Amount: 1000
```

Expected:

```text
Unsupported currency error.
```

---

## 19. README Requirements

The README must include:

1. Project overview
2. Live deployment link
3. GitHub repository link
4. Setup instructions
5. How to run locally
6. How the routing model works
7. Assumptions made
8. API providers used
9. AI tools used and how
10. One thing AI got wrong and how it was caught
11. One thing that would be improved with more time

---

## 20. Suggested README Content

## 20.1 Routing Model Explanation

```text
I modeled the FX routing problem as a directed graph where currencies are nodes and provider quotes are edges. Each edge contains a provider, rate, fee percentage, and flat fee. Since the assignment limits routes to a maximum of 3 legs, I used bounded exhaustive route enumeration instead of a shortest-path algorithm. Each candidate route is simulated leg-by-leg using the provider fee formula, then ranked by final delivered amount.
```

## 20.2 AI Tools Section

```text
I used AI tools to help structure the project, reason about the routing algorithm, generate initial TypeScript types, and identify edge cases around API failures and fee calculation. I reviewed and modified the generated code manually, especially around provider normalization and route simulation.
```

## 20.3 One Thing AI Got Wrong

```text
One AI suggestion was to use Dijkstra's algorithm immediately. I decided not to use it because the assignment limits routes to at most 3 legs and each edge's real impact depends on the changing amount after previous fees. A bounded exhaustive search was simpler, easier to test, and better matched the assignment requirements.
```

## 20.4 With More Time

```text
With more time, I would add historical rate caching, route graph visualization, and an amount-scaling comparison to show how the optimal route changes for small versus large transfers.
```

---

## 21. Acceptance Criteria

The submission is complete when:

- The app is written in TypeScript.
- The app is deployed publicly.
- The GitHub repo is public or accessible.
- The user can enter source currency, target currency, and amount.
- The app returns the top 3 routes.
- Each route shows provider path and per-leg breakdown.
- Fees are applied correctly per leg.
- Direct route comparison is shown when available.
- The app survives at least one provider API failure.
- README explains setup, approach, assumptions, AI usage, and tradeoffs.

---

## 22. Implementation Priority

## Phase 1: Core Routing Engine

- Load providers
- Normalize static pairs
- Implement fee calculation
- Generate routes up to 3 legs
- Simulate and rank routes

## Phase 2: Live API Integration

- AlphaFX fetcher
- BetaBank fetcher
- DeltaMarkets fetcher
- Timeout handling
- Error handling

## Phase 3: UI

- Input form
- Results display
- Per-leg breakdown
- Warnings and error states

## Phase 4: Deployment and README

- Deploy to Vercel
- Add repo link
- Write complete README
- Test common route examples

---

## 23. Key Tradeoffs

### Bounded Enumeration vs. Dijkstra

Chosen approach:

```text
Bounded exhaustive route enumeration
```

Reason:

```text
The assignment only requires routes up to 3 legs, so generating every valid route is simple, reliable, and explainable.
```

### Skipping Failed Providers vs. Failing Entire Request

Chosen approach:

```text
Skip failed provider and continue.
```

Reason:

```text
The assignment explicitly asks the tool to still return useful results when one provider is unavailable.
```

### Static and Live Rates Normalized Together

Chosen approach:

```text
Convert all provider quotes into the same Edge type.
```

Reason:

```text
This keeps the routing algorithm independent from provider-specific API response shapes.
```

---

## 24. Final Submission Checklist

Before submitting, make sure you have:

```text
[ ] GitHub repository link
[ ] Deployed app link
[ ] README file
[ ] Clean TypeScript code
[ ] providers.json included
[ ] Top 3 routes working
[ ] Per-leg breakdown working
[ ] Direct route comparison working
[ ] API error handling working
[ ] Setup instructions tested
[ ] AI usage section included
[ ] One AI mistake section included
[ ] One improvement with more time included
```

---

## 25. Recommended MVP Definition

A strong MVP is:

```text
A deployed Next.js app where the user enters source, target, and amount, and the app returns the top 3 routes using both live fiat providers and static stablecoin venues, with clear per-leg fee/rate breakdowns and graceful provider failure handling.
```

This is enough to satisfy the main assignment requirements without overbuilding.
