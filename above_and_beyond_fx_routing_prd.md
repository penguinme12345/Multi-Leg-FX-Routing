# Product Requirements Document (PRD)

# Above-and-Beyond FX Routing Case Study Submission

## 1. Purpose

This PRD defines the enhanced version of the Multi-Leg FX Routing Tool submission for the Trading Technology Intern case study.

The goal is not only to satisfy the assignment requirements, but to make the project clearly demonstrate the qualities expected for the role:

- Strong TypeScript and frontend/backend fundamentals
- Ability to integrate APIs
- Comfort with AI-assisted development
- Clear technical decision-making
- Attention to reliability and edge cases
- QA mindset
- Ability to communicate implementation details clearly
- Understanding of trading operations and fintech workflows

The final submission should feel like a practical internal tool that an operations or trading team could actually use to evaluate FX routing options before execution.

---

## 2. Background

The assignment asks for a TypeScript tool that allows a user to enter:

- Source currency
- Target currency
- Amount

The tool must return the top 3 routes ranked by final amount delivered to the recipient, with each route containing up to 3 legs.

Each leg is handled by one liquidity provider. Providers may have different rates, fee percentages, flat fees, and availability. Some routes are direct, while others require intermediate currencies such as USD, USDT, or USDC.

The base assignment requires:

- TypeScript implementation
- Deployed live application
- Top 3 routes
- Per-leg provider, rate, and fee breakdown
- Direct route comparison if available
- Graceful handling of provider/API failures
- README explaining approach, assumptions, setup, AI usage, and tradeoffs

This PRD extends those requirements into a stronger, job-winning submission.

---

## 3. Product Vision

Build a clean internal trading operations dashboard that helps a user evaluate the best FX execution route across multiple providers.

The tool should not feel like a toy calculator. It should feel like a lightweight decision-support system for a trading or payments team.

The reviewer should immediately see that the project was built with:

- Practical engineering judgment
- Real-world API failure handling
- Clear route explanation
- Clean user experience
- Testability
- Strong documentation

---

## 4. Target Reviewer Impression

The project should make the reviewer think:

```text
Jay understands the assignment beyond just coding the happy path.
He can model a real business problem.
He knows how to use AI tools without blindly trusting them.
He can ship a working product.
He thinks about edge cases, provider failures, QA, and operational workflows.
He would be useful on a fintech/trading technology team.
```

---

## 5. Goals

### 5.1 Core Goals

The app must:

1. Accept source currency, target currency, and amount.
2. Load provider configuration from `providers.json`.
3. Fetch live rates from fiat providers.
4. Load static rates from stablecoin providers.
5. Normalize all provider quotes into a common data model.
6. Generate all valid routes up to 3 legs.
7. Apply fees correctly per leg.
8. Rank routes by final amount delivered.
9. Display the top 3 routes.
10. Show detailed per-leg breakdowns.
11. Compare routes against the best direct route when one exists.
12. Handle failed or unavailable providers without breaking the whole app.
13. Deploy publicly.
14. Include a clear README.

### 5.2 Above-and-Beyond Goals

The app should also include:

1. Provider Health panel.
2. Amount Sensitivity view.
3. QA documentation.
4. Decision Log documentation.
5. Unit tests for core routing logic.
6. Clean internal-tool style UI.
7. Warnings for skipped providers.
8. Clear explanation of fintech/trading relevance.
9. Explicit AI usage reflection.
10. One documented example of AI being wrong and how it was corrected.

---

## 6. Non-Goals

The submission does not need to:

- Execute real trades.
- Store customer accounts.
- Authenticate users.
- Persist orders in a production database.
- Provide institutional-grade FX pricing.
- Connect to real banking rails.
- Use real GraphQL or Hasura unless time allows.
- Support routes longer than 3 legs.
- Guarantee perfect live market accuracy.
- Build a full trading platform.

The priority is a clean, reliable, explainable case study submission.

---

## 7. Users

### 7.1 Primary User

An internal operations or trading team member who needs to review the best available FX route before executing a transaction.

### 7.2 Secondary User

A technical hiring reviewer evaluating the candidate's:

- Code quality
- Product thinking
- API handling
- Testing approach
- Documentation
- Ability to use AI tools effectively

---

## 8. User Stories

### 8.1 Route Discovery

As an operations user, I want to enter a source currency, target currency, and amount so that I can see the best available FX routes.

### 8.2 Route Comparison

As an operations user, I want to see the top 3 routes so that I can compare multiple execution options.

### 8.3 Route Explainability

As an operations user, I want a per-leg breakdown of provider, fee, rate, and output amount so that I can understand why a route is ranked highly.

### 8.4 Direct Route Benchmarking

As an operations user, I want to compare each route against the best direct route so that I can quickly see whether a multi-leg route improves the result.

### 8.5 Provider Reliability Visibility

As an operations user, I want to see which providers were online, unavailable, or skipped so that I understand how complete the result set is.

### 8.6 Amount Sensitivity

As an operations user, I want to see how the optimal route changes as the amount scales so that I can understand the effect of flat fees and percentage fees.

### 8.7 Reviewer Documentation

As a reviewer, I want clear README, QA, and decision documentation so that I can understand the implementation quickly without reverse-engineering the code.

---

## 9. Functional Requirements

### 9.1 Input Form

The app must provide an input form with:

- Source currency
- Target currency
- Amount
- Submit button

Optional nice-to-have:

- Currency dropdowns generated from available provider data
- Example quick-fill buttons

Example quick-fill buttons:

```text
GBP → JPY
USD → CAD
CAD → AUD
EUR → USDC
```

### 9.2 Input Validation

The app must validate:

- Source currency is required.
- Target currency is required.
- Amount is required.
- Amount must be numeric.
- Amount must be greater than zero.
- Source and target cannot be the same.
- Currency inputs are normalized to uppercase.

Error messages should be clear and user-friendly.

Example:

```text
Amount must be greater than 0.
```

---

## 10. Provider Requirements

### 10.1 Provider Loading

The app must load all providers from `providers.json`.

Provider categories:

```text
Fiat brokers:
- AlphaFX
- BetaBank
- DeltaMarkets

Stablecoin venues:
- GammaCrypto
- EpsilonChain
- ZetaSwap
```

The app should not hardcode provider names into the routing logic. Provider-specific API fetchers are acceptable, but the routing engine should work on normalized edges.

### 10.2 Rate Fetching

The app must fetch live rates for fiat providers.

Each provider may return data in a different shape. The system must normalize all live API responses into the same internal `Edge` structure.

The app should support:

- Timeout handling
- Try/catch per provider
- Invalid response handling
- Missing rate handling
- Partial results when one provider fails

### 10.3 Static Provider Handling

For stablecoin providers, the app must:

- Read inline pairs from `providers.json`.
- Convert each pair into a normalized edge.
- Apply the correct provider fee model.
- Only use pairs explicitly listed in the file.

---

## 11. Fee Requirements

Fees must be calculated per leg using:

```text
total_fee = leg_amount × fee_percent + fee_flat
```

Then:

```text
amount_after_fee = leg_amount - total_fee
output_amount = amount_after_fee × rate
```

Rules:

- Fees are charged in the source currency of the leg.
- Both percent and flat fees always apply.
- Fee is applied before conversion.
- If fee is greater than or equal to the leg amount, the route is invalid.
- Each leg uses the output amount of the previous leg as its input.

---

## 12. Route Requirements

### 12.1 Route Generation

The app must generate possible routes with:

- 1 leg
- 2 legs
- 3 legs maximum

Examples:

```text
1-leg:
GBP → JPY

2-leg:
GBP → USD → JPY

3-leg:
GBP → USD → USDT → JPY
```

Each edge must contain a provider, so multiple routes may exist for the same currency path if different providers quote one or more legs.

### 12.2 Route Ranking

Routes must be ranked by:

```text
final amount delivered to recipient
```

Higher final amount is better.

The app must return the top 3 valid routes.

### 12.3 Direct Route Comparison

If at least one direct route exists, the app must identify the best direct route.

For each top route, show:

```text
route final amount - best direct route final amount
```

Example display:

```text
+1,245.32 JPY vs best direct route
```

If no direct route exists, display:

```text
No direct route available for comparison.
```

---

## 13. Above-and-Beyond Features

### 13.1 Provider Health Panel

This is a high-impact above-and-beyond feature.

The UI should show the status of each provider:

```text
AlphaFX        Online
BetaBank       Timeout - excluded
DeltaMarkets   Online
GammaCrypto    Static data loaded
EpsilonChain   Static data loaded
ZetaSwap       Static data loaded
```

Provider statuses should include:

- Online
- Static loaded
- Timeout
- Malformed response
- Missing requested pair
- Failed
- Skipped

This demonstrates real-world API reliability thinking.

### 13.2 Warnings

If one or more providers fail, results should still be shown with warnings.

Example:

```text
Warning: BetaBank timed out and was excluded from this route calculation.
```

Warnings should not prevent successful route display.

### 13.3 Amount Sensitivity View

This is the most valuable optional stretch goal.

The app should show how the optimal route changes as the transfer amount changes.

Example amounts:

```text
100
1,000
10,000
100,000
```

For each amount, show:

- Amount
- Best route path
- Final delivered amount
- Difference versus direct route if available

Example:

| Input Amount | Best Route | Final Delivered | Difference vs Direct |
|---:|---|---:|---:|
| 100 | GBP → AlphaFX → JPY | 18,940 JPY | +0 |
| 1,000 | GBP → USDT → JPY | 191,200 JPY | +1,250 |
| 10,000 | GBP → USD → USDT → JPY | 1,923,000 JPY | +12,300 |
| 100,000 | GBP → USD → JPY | 19,250,000 JPY | +90,000 |

Purpose:

- Show that flat fees punish small transfers.
- Show that percentage fees matter more as amount grows.
- Show understanding of the business logic behind routing.

### 13.4 QA Documentation

Add a file:

```text
docs/QA.md
```

This file should include manual test cases.

Required QA sections:

1. Valid route tests
2. Invalid input tests
3. Provider failure tests
4. No-route tests
5. Fee edge cases
6. Amount sensitivity tests

Example:

```md
## Test Case: Provider Timeout

Input:
- Source: GBP
- Target: JPY
- Amount: 1000

Simulated condition:
- BetaBank API timeout

Expected:
- App still returns routes from other providers
- BetaBank appears as unavailable in Provider Health
- Warning message appears
```

### 13.5 Decision Log

Add a file:

```text
docs/DECISIONS.md
```

This file should explain key implementation decisions.

Required decisions:

1. Bounded enumeration instead of Dijkstra
2. Provider normalization into common Edge type
3. Skipping failed providers instead of failing whole request
4. Applying fees before conversion
5. Keeping routing logic separate from UI
6. Caching or limiting repeated API fetches

Example:

```md
## Decision: Bounded route enumeration instead of Dijkstra

I chose bounded exhaustive search because the assignment limits routes to 3 legs. This keeps the algorithm simple, testable, and easy to verify. Dijkstra would be more useful for larger graphs, but each leg changes the amount after fees, so route simulation is still required.
```

### 13.6 Unit Tests

Add unit tests for the routing core.

Recommended testing framework:

```text
Vitest
```

Required tests:

- Fee calculation
- Single-leg route simulation
- Multi-leg route simulation
- Invalid route when fee exceeds input
- Ranking by final amount
- Direct route comparison
- Static edge building
- No valid route case

Suggested test files:

```text
tests/
  simulateRoute.test.ts
  findTopRoutes.test.ts
  buildEdges.test.ts
```

---

## 14. Technical Architecture

### 14.1 Recommended Stack

```text
Next.js
TypeScript
Tailwind CSS
Vercel
Vitest
```

This stack matches the assignment and aligns well with the internship posting's mention of Next.js and modern frontend/backend work.

### 14.2 Suggested Folder Structure

```text
fx-routing-tool/
  README.md
  providers.json

  docs/
    PRD.md
    QA.md
    DECISIONS.md

  src/
    app/
      page.tsx
      api/
        routes/
          route.ts

    components/
      CurrencyForm.tsx
      RouteCard.tsx
      RouteLegTable.tsx
      ProviderHealth.tsx
      AmountSensitivity.tsx
      WarningBanner.tsx

    lib/
      rates/
        alphaFx.ts
        betaBank.ts
        deltaMarkets.ts
        staticProviders.ts

      routing/
        types.ts
        buildEdges.ts
        generateRoutes.ts
        simulateRoute.ts
        findTopRoutes.ts

      utils/
        fetchWithTimeout.ts
        formatCurrency.ts
        formatRoute.ts

  tests/
    simulateRoute.test.ts
    findTopRoutes.test.ts
    buildEdges.test.ts
```

---

## 15. Data Model

### 15.1 Provider

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

### 15.2 Static Pair

```ts
type StaticPair = {
  from: string;
  to: string;
  rate: number;
};
```

### 15.3 Normalized Edge

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

### 15.4 Provider Health

```ts
type ProviderHealth = {
  provider: string;
  status: "online" | "static_loaded" | "timeout" | "failed" | "malformed_response" | "skipped";
  message?: string;
};
```

### 15.5 Route Leg Result

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

### 15.6 Route Result

```ts
type RouteResult = {
  rank: number;
  path: string[];
  legs: RouteLegResult[];
  finalAmount: number;
  differenceVsDirect: number | null;
};
```

### 15.7 API Response

```ts
type RouteApiResponse = {
  source: string;
  target: string;
  amount: number;
  routes: RouteResult[];
  providerHealth: ProviderHealth[];
  warnings: string[];
};
```

---

## 16. API Design

### 16.1 Route Calculation Endpoint

Endpoint:

```text
POST /api/routes
```

Request:

```json
{
  "source": "GBP",
  "target": "JPY",
  "amount": 1000
}
```

Response:

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
        },
        {
          "provider": "EpsilonChain",
          "from": "USDC",
          "to": "JPY",
          "rate": 152.5,
          "inputAmount": 1264.54,
          "fee": 3.52,
          "amountAfterFee": 1261.02,
          "outputAmount": 192306.05
        }
      ]
    }
  ],
  "providerHealth": [
    {
      "provider": "AlphaFX",
      "status": "online"
    },
    {
      "provider": "BetaBank",
      "status": "timeout",
      "message": "Provider timed out after 5000ms."
    }
  ],
  "warnings": [
    "BetaBank timed out and was excluded from this route calculation."
  ]
}
```

---

## 17. Routing Algorithm

### 17.1 Model

The routing problem should be modeled as a directed graph:

- Currencies are nodes.
- Provider quotes are edges.
- Each edge has:
  - Provider
  - Source currency
  - Target currency
  - Rate
  - Fee percentage
  - Flat fee

### 17.2 Algorithm Choice

Use bounded exhaustive route enumeration.

Reason:

- The assignment limits routes to 3 legs.
- The provider graph is small.
- Fees depend on the changing amount after each leg.
- The approach is easy to test.
- The approach is easy to explain in the README.

### 17.3 Algorithm Steps

1. Validate request input.
2. Load provider data.
3. Fetch live provider rates with timeout handling.
4. Load static provider pairs.
5. Normalize all provider quotes into edges.
6. Generate every valid route from source to target with up to 3 legs.
7. Simulate every route using fee math.
8. Remove invalid routes.
9. Sort valid routes by final delivered amount descending.
10. Find best direct route if available.
11. Add direct route comparison.
12. Return top 3 results, provider health, and warnings.

### 17.4 Route Simulation Pseudocode

```ts
function simulateRoute(route, startingAmount) {
  let currentAmount = startingAmount;
  const legResults = [];

  for (const edge of route) {
    const fee = currentAmount * edge.feePercent + edge.feeFlat;

    if (fee >= currentAmount) {
      return null;
    }

    const amountAfterFee = currentAmount - fee;
    const outputAmount = amountAfterFee * edge.rate;

    legResults.push({
      provider: edge.provider,
      from: edge.from,
      to: edge.to,
      rate: edge.rate,
      inputAmount: currentAmount,
      fee,
      amountAfterFee,
      outputAmount
    });

    currentAmount = outputAmount;
  }

  return {
    legs: legResults,
    finalAmount: currentAmount
  };
}
```

---

## 18. UI Requirements

### 18.1 Page Layout

The page should include:

1. Header
2. Short explanation
3. Order input card
4. Provider health panel
5. Top 3 route cards
6. Amount sensitivity section
7. Warning/error area

Suggested page sections:

```text
FX Route Optimizer
Find the best route across fiat brokers and stablecoin venues.

[Order Input]

[Provider Health]

[Top 3 Routes]

[Amount Sensitivity]

[Warnings]
```

### 18.2 Route Card

Each route card should show:

- Rank
- Path
- Final delivered amount
- Difference vs direct
- Number of legs
- Provider sequence
- Expandable per-leg breakdown

Example:

```text
#1 Best Route

GBP →[BetaBank]→ USD →[GammaCrypto]→ USDT →[EpsilonChain]→ JPY

Final Delivered:
192,400.22 JPY

Difference vs Direct:
+1,322.10 JPY
```

### 18.3 Per-Leg Breakdown Table

Each route should include:

| Leg | Provider | From | To | Input | Rate | Fee | Output |
|---:|---|---|---|---:|---:|---:|---:|
| 1 | BetaBank | GBP | USD | 1000.00 | 1.2700 | 25.80 | 1237.43 |
| 2 | GammaCrypto | USD | USDT | 1237.43 | 0.9996 | 2.24 | 1234.69 |
| 3 | EpsilonChain | USDT | JPY | 1234.69 | 152.50 | 3.48 | 187,687.03 |

---

## 19. Error States

### 19.1 Invalid Input

Example:

```text
Please enter a positive amount.
```

### 19.2 No Routes Found

Example:

```text
No valid routes found for GBP → XYZ.
Try a different target currency or rail option.
```

### 19.3 Partial Provider Failure

Example:

```text
Some providers were unavailable. Results were calculated using the remaining providers.
```

### 19.4 All Live Providers Failed

Example:

```text
Live fiat providers are unavailable. Showing routes from static providers only where possible.
```

---

## 20. Reliability Requirements

The app should:

- Use `fetchWithTimeout`.
- Isolate provider failures.
- Return partial results.
- Surface provider health.
- Avoid crashing on malformed responses.
- Avoid assuming every provider supports every pair.
- Validate all numeric API values before using them.
- Avoid infinite loops in route generation.

---

## 21. Performance Requirements

The graph is small, so route generation should be fast.

Requirements:

- Route calculation should complete in a few seconds.
- Provider API calls should be parallelized where possible.
- Provider calls should have reasonable timeouts.
- API results may be cached for a short duration.
- UI should show a loading state while rates are fetched.

Recommended timeout:

```text
5 seconds per provider
```

Recommended cache duration:

```text
5 to 15 minutes
```

---

## 22. QA Plan

### 22.1 Manual Test Cases

Include these in `docs/QA.md`.

#### Test 1: Happy Path

Input:

```text
Source: GBP
Target: JPY
Amount: 1000
```

Expected:

```text
Top 3 routes appear with final JPY amount and per-leg breakdown.
```

#### Test 2: Direct Route Comparison

Input:

```text
Source: USD
Target: CAD
Amount: 10000
```

Expected:

```text
Routes show difference compared with best direct route if direct route exists.
```

#### Test 3: Small Amount Flat Fee Impact

Input:

```text
Source: CAD
Target: AUD
Amount: 100
```

Expected:

```text
Routes with high flat fees are penalized or invalid if fees exceed input.
```

#### Test 4: Invalid Amount

Input:

```text
Source: USD
Target: CAD
Amount: -100
```

Expected:

```text
Validation error appears and route calculation does not run.
```

#### Test 5: Unsupported Currency

Input:

```text
Source: XYZ
Target: JPY
Amount: 1000
```

Expected:

```text
No valid routes found or unsupported currency message appears.
```

#### Test 6: Provider Failure

Simulated condition:

```text
One provider API times out.
```

Expected:

```text
Other providers still return routes.
Provider Health shows timeout.
Warning is displayed.
```

### 22.2 Unit Tests

Required tests:

```text
[ ] fee calculation works correctly
[ ] fee greater than amount invalidates route
[ ] single-leg route simulation works
[ ] multi-leg route simulation works
[ ] routes are ranked by final amount
[ ] direct route comparison works
[ ] static providers convert into edges
[ ] no route returns empty result
```

---

## 23. Documentation Requirements

### 23.1 README.md

The README must include:

1. Project overview
2. Live app link
3. GitHub repo link
4. Tech stack
5. Setup instructions
6. How to run locally
7. How to run tests
8. Routing model explanation
9. Assumptions
10. Provider API notes
11. Error handling approach
12. AI tools used
13. One thing AI got wrong
14. What would be improved with more time

### 23.2 Required README Explanation: Routing Model

Use wording similar to:

```text
I modeled the FX routing problem as a directed graph where currencies are nodes and provider quotes are edges. Each edge stores the provider, rate, fee percentage, and flat fee. Since the assignment limits routes to a maximum of three legs, I used bounded exhaustive route enumeration instead of Dijkstra's algorithm. Each candidate route is simulated leg-by-leg because the amount changes after each provider fee and conversion.
```

### 23.3 Required README Explanation: AI Usage

Use wording similar to:

```text
I used AI tools to help plan the architecture, generate initial TypeScript type definitions, identify edge cases, and review the routing algorithm. I did not rely on AI output blindly. I manually verified the fee formula, provider response normalization, and route ranking logic.
```

### 23.4 Required README Explanation: One Thing AI Got Wrong

Use wording similar to:

```text
One AI suggestion was to immediately use Dijkstra's algorithm. I decided against this because routes are capped at three legs and the effective value of each edge depends on the changing amount after previous fees. A bounded exhaustive search was simpler, easier to test, and better matched the assignment.
```

### 23.5 Required README Explanation: Trading Operations Relevance

Use wording similar to:

```text
This tool is designed as a pre-trade decision-support dashboard. It does not execute transactions, but it helps an operations or trading user compare routes, provider fees, and provider availability before execution. The route result could later be saved and reconciled against the actually executed trade.
```

---

## 24. Acceptance Criteria

### 24.1 Assignment Acceptance Criteria

The submission is acceptable when:

```text
[ ] App is written in TypeScript
[ ] App is deployed publicly
[ ] GitHub repository is accessible
[ ] User can enter source currency, target currency, and amount
[ ] Top 3 routes are displayed
[ ] Routes are limited to maximum 3 legs
[ ] Each route shows provider path
[ ] Each route shows final delivered amount
[ ] Each route shows per-leg provider/rate/fee breakdown
[ ] Direct route comparison appears when available
[ ] App handles provider failures gracefully
[ ] README includes setup, approach, assumptions, AI usage, and tradeoffs
```

### 24.2 Above-and-Beyond Acceptance Criteria

The submission is strong when:

```text
[ ] Provider Health panel is implemented
[ ] Amount Sensitivity view is implemented
[ ] docs/QA.md is included
[ ] docs/DECISIONS.md is included
[ ] Unit tests are included
[ ] README explains trading operations relevance
[ ] README explains why bounded enumeration was chosen
[ ] Errors and warnings are visible in UI
[ ] Code is organized into clear modules
[ ] Core routing logic is separate from UI
```

---

## 25. Implementation Phases

### Phase 1: Core Engine

Build:

- Provider loading
- Static edge builder
- Fee calculator
- Route generator
- Route simulator
- Route ranker

Deliverable:

```text
Core route function works in isolation.
```

### Phase 2: Live API Integration

Build:

- AlphaFX fetcher
- BetaBank fetcher
- DeltaMarkets fetcher
- `fetchWithTimeout`
- Provider health tracking
- Warning collection

Deliverable:

```text
API endpoint can return routes even if one provider fails.
```

### Phase 3: UI

Build:

- Input form
- Top 3 route cards
- Per-leg tables
- Provider Health panel
- Warning banner
- Loading and error states

Deliverable:

```text
User can use the app end-to-end in the browser.
```

### Phase 4: Above-and-Beyond Features

Build:

- Amount Sensitivity table
- QA documentation
- Decision log
- Unit tests

Deliverable:

```text
Submission looks polished, thoughtful, and role-specific.
```

### Phase 5: Deployment and Submission

Complete:

- Deploy on Vercel
- Verify live app works
- Push final code to GitHub
- Finalize README
- Send submission email

Deliverable:

```text
Clean submission with deployed app link and GitHub repo link.
```

---

## 26. Submission Email Template

```text
Hi Yacine,

Thank you again for the opportunity. Please find my submission below:

GitHub repository:
[insert link]

Deployed application:
[insert link]

I included a README with setup instructions, implementation details, assumptions, AI usage, and tradeoffs. In addition to the core requirements, I added provider health reporting, an amount-sensitivity view, QA test cases, and a short decision log to make the submission easier to review.

Best,
Jay
```

---

## 27. Highest-Impact Priorities

If time is limited, prioritize in this order:

```text
1. Correct route math
2. Working top 3 routes
3. Deployed app
4. Clean README
5. Provider failure handling
6. Provider Health panel
7. Per-leg breakdown
8. Direct route comparison
9. QA.md
10. Amount Sensitivity view
11. Unit tests
12. DECISIONS.md
```

Do not sacrifice correctness for extra features.

---

## 28. Key Risks

### 28.1 Risk: Incorrect Fee Math

Impact:

```text
Very high
```

Mitigation:

```text
Write unit tests for fee calculation and route simulation.
```

### 28.2 Risk: Live API Failure Breaks App

Impact:

```text
High
```

Mitigation:

```text
Use per-provider try/catch and timeouts.
```

### 28.3 Risk: README Is Too Generic

Impact:

```text
Medium to high
```

Mitigation:

```text
Write README as if explaining decisions in an interview.
```

### 28.4 Risk: Overbuilding UI Before Core Logic Works

Impact:

```text
High
```

Mitigation:

```text
Build routing engine first, then UI.
```

### 28.5 Risk: AI-Generated Code Is Not Understood

Impact:

```text
High
```

Mitigation:

```text
Manually review all generated code and explain the key decisions in README.
```

---

## 29. Final Product Definition

A successful above-and-beyond submission is:

```text
A deployed TypeScript/Next.js internal FX routing dashboard that calculates the top 3 provider routes up to 3 legs, shows clear per-leg fee/rate breakdowns, survives provider failures, displays provider health, includes amount-sensitivity analysis, and is supported by strong README, QA, and decision documentation.
```

This version directly demonstrates the skills expected for a Trading Technology Intern: API integration, frontend/backend development, QA thinking, AI-assisted engineering, reliability, and clear technical communication.
