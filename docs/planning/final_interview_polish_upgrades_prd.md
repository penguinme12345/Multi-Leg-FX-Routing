# PRD: Final Interview Polish Upgrades

## 1. Purpose

This PRD defines the next focused set of improvements for the FX Route Optimizer case study.

Selected improvements:

1. Trade Review Summary panel
2. Provider Coverage Score
3. Result Quality label
4. Decimal precision / production finance note
5. Calmer UI-by-default flow
6. Reset Demo button

These upgrades are intended to make the app easier to present in an interview, more professional from a fintech/trading technology perspective, and clearer as an internal decision-support dashboard.

---

## 2. Product Goal

The goal is to make the dashboard answer the most important review questions quickly:

```text
What order was entered?
What route is recommended?
How much will be delivered?
How complete was the provider coverage?
Can the user trust the result quality?
What are the key limitations in a production finance system?
Can the app be reset quickly for demos?
```

These changes should improve:

- Interview presentation clarity
- Trading operations relevance
- Reviewer confidence
- UI simplicity
- Production-awareness
- Demo repeatability

---

## 3. Selected Upgrade Summary

| Upgrade | Purpose | Priority |
|---|---|---:|
| Trade Review Summary | Combine the key result into one decision-ready panel | High |
| Provider Coverage Score | Show how many providers contributed usable data | High |
| Result Quality Label | Summarize whether the result is based on full or partial coverage | High |
| Decimal Precision Note | Show awareness of financial precision tradeoffs | Medium |
| Calmer UI-by-default Flow | Reduce first-screen overload | High |
| Reset Demo Button | Make repeated demos easier | Medium |

---

## 4. Upgrade 1: Trade Review Summary Panel

### 4.1 Overview

Add a Trade Review Summary panel that aggregates the most important result information into one concise, decision-ready card.

This panel should appear after a successful route calculation, ideally near the top of the Overview tab.

The goal is to make the app feel like a pre-trade review tool rather than just a route calculator.

### 4.2 User Story

As an operations or trading user, I want one summary card that tells me the recommended route, expected delivered amount, effective rate, direct comparison, provider coverage, and complexity so that I can quickly review the recommendation before execution.

### 4.3 Required Content

The Trade Review Summary should display:

- Order summary
- Recommended route number
- Recommended route path
- Final delivered amount
- Effective rate
- Difference versus best direct route
- Difference versus direct percentage
- Provider coverage
- Result quality label
- Route complexity
- Provider count
- Leg count
- Warning count
- Short note/disclaimer that this is decision support only

### 4.4 Example UI Copy

```text
Trade Review Summary

Order:
1,000 GBP → JPY

Recommendation:
Use Route #1

Recommended Path:
GBP →[BetaBank]→ USD →[GammaCrypto]→ USDT →[EpsilonChain]→ JPY

Expected Delivered:
192,430.22 JPY

Effective Rate:
192.43 JPY / GBP

Vs Best Direct:
+1,420.10 JPY (+0.74%)

Provider Coverage:
5 / 6 providers available

Result Quality:
High Coverage

Operational Complexity:
High

Note:
Decision-support only. This app does not execute trades or represent executable quotes.
```

### 4.5 Behavior

If a recommended route exists, show the full Trade Review Summary.

If no routes exist, show a no-route review state with likely reasons and suggested fixes.

If no direct benchmark exists, display:

```text
No direct route available for benchmark.
```

If provider coverage is limited, show warning text in the summary.

Example:

```text
Results are based on partial provider coverage. 4 of 6 providers contributed usable data.
```

### 4.6 Suggested Component

Create:

```text
src/components/TradeReviewSummary.tsx
```

Props:

```ts
type TradeReviewSummaryProps = {
  source: string;
  target: string;
  amount: number;
  recommendedRoute: RankedRoute | null;
  directBenchmark: RankedRoute | null;
  providerCoverage: ProviderCoverage;
  resultQuality: ResultQuality;
  warnings: string[];
};
```

### 4.7 Acceptance Criteria

```text
[ ] Trade Review Summary appears after successful calculation
[ ] It shows order, recommendation, final amount, effective rate, and direct comparison
[ ] It shows provider coverage
[ ] It shows result quality
[ ] It shows route complexity
[ ] It handles no direct benchmark
[ ] It handles no-route state
[ ] It includes decision-support disclaimer
```

---

## 5. Upgrade 2: Provider Coverage Score

### 5.1 Overview

Add a Provider Coverage Score that summarizes how much provider data was usable in the current calculation.

This should be derived from Provider Health.

### 5.2 User Story

As a trading or operations user, I want to know how many providers contributed usable data so that I can judge whether the recommendation was based on full or partial coverage.

### 5.3 Definition

Provider Coverage measures:

```text
usable providers / total providers
```

Usable provider statuses:

```text
online
static_loaded
```

Not usable provider statuses:

```text
timeout
failed
malformed_response
skipped
simulated_outage
missing_pair
```

Coverage percentage:

```text
coveragePercent = usableProviderCount / totalProviderCount * 100
```

### 5.4 Example Outputs

```text
6 / 6 providers available
100% provider coverage
```

```text
4 / 6 providers available
67% provider coverage
```

```text
2 / 6 providers available
33% provider coverage
```

### 5.5 Suggested Type

```ts
type ProviderCoverage = {
  totalProviders: number;
  usableProviders: number;
  unavailableProviders: number;
  coveragePercent: number;
  usableProviderNames: string[];
  unavailableProviderNames: string[];
};
```

### 5.6 Suggested Function

Create:

```text
src/lib/routing/calculateProviderCoverage.ts
```

Function:

```ts
function calculateProviderCoverage(providerHealth: ProviderHealth[]): ProviderCoverage
```

### 5.7 UI Placement

Show Provider Coverage in:

1. Trade Review Summary
2. Diagnostics panel
3. Provider Health panel header

Example:

```text
Provider Coverage: 5 / 6 available
```

### 5.8 Acceptance Criteria

```text
[ ] Provider coverage is calculated from provider health
[ ] Coverage shows usable provider count
[ ] Coverage shows total provider count
[ ] Coverage percentage is displayed
[ ] Simulated outages reduce coverage
[ ] Provider failures reduce coverage
[ ] Static loaded providers count as usable
[ ] Online live providers count as usable
```

---

## 6. Upgrade 3: Result Quality Label

### 6.1 Overview

Add a Result Quality label that summarizes whether the calculated result is based on strong, partial, or limited provider coverage.

This should avoid making unsupported claims like “market confidence.” It should only reflect observable system facts.

### 6.2 User Story

As a user, I want a simple quality label so that I can quickly understand whether the recommendation was calculated with full or limited provider data.

### 6.3 Labels

Use these labels:

```text
High Coverage
Partial Coverage
Limited Coverage
No Coverage
```

### 6.4 Suggested Rules

Recommended percent-based rules:

```text
High Coverage:
>= 80%

Partial Coverage:
>= 50% and < 80%

Limited Coverage:
> 0% and < 50%

No Coverage:
0%
```

### 6.5 Suggested Type

```ts
type ResultQuality = {
  label: "High Coverage" | "Partial Coverage" | "Limited Coverage" | "No Coverage";
  reason: string;
};
```

### 6.6 Suggested Function

Create:

```text
src/lib/routing/calculateResultQuality.ts
```

Function:

```ts
function calculateResultQuality(
  providerCoverage: ProviderCoverage,
  directBenchmarkExists: boolean
): ResultQuality
```

### 6.7 Example Outputs

```json
{
  "label": "High Coverage",
  "reason": "6 of 6 providers contributed usable data and a direct benchmark was available."
}
```

```json
{
  "label": "Partial Coverage",
  "reason": "4 of 6 providers contributed usable data. Results were calculated using partial provider coverage."
}
```

```json
{
  "label": "Limited Coverage",
  "reason": "Only 2 of 6 providers contributed usable data. Treat the recommendation as limited by provider availability."
}
```

```json
{
  "label": "No Coverage",
  "reason": "No providers contributed usable data. No route recommendation can be made."
}
```

### 6.8 UI Placement

Show Result Quality in:

1. Trade Review Summary
2. Diagnostics panel
3. Provider Health panel header or footer

Example:

```text
Result Quality: Partial Coverage
Reason: 4 of 6 providers contributed usable data.
```

### 6.9 Acceptance Criteria

```text
[ ] Result quality is calculated from provider coverage
[ ] Label uses only observable app data
[ ] Label does not imply market certainty
[ ] Label updates when providers are disabled
[ ] Label updates when provider failures occur
[ ] Label appears in Trade Review Summary
```

---

## 7. Upgrade 4: Decimal Precision / Production Finance Note

### 7.1 Overview

Add a clear note in the README and, optionally, in the app diagnostics explaining how monetary precision is handled.

The current app uses JavaScript numbers for calculation and formats values to cents at the presentation layer. That is acceptable for a case study, but production financial systems should use decimal arithmetic or integer minor units.

### 7.2 Purpose

This demonstrates production-awareness.

Financial systems need careful precision handling because JavaScript floating-point arithmetic can create small rounding errors.

### 7.3 README Section

Add a section:

```md
## Financial Precision Note
```

Recommended copy:

```md
This case study uses JavaScript numbers for route simulation and formats displayed monetary values to cents in the presentation layer. This is acceptable for a demo assignment, but a production financial system should avoid floating-point arithmetic for monetary calculations. In production, I would use decimal arithmetic, fixed-point integer minor units, or a dedicated decimal library to avoid precision drift across multi-leg calculations.
```

### 7.4 Optional UI Note

In Diagnostics or footer, add:

```text
Financial precision note: Demo uses JavaScript numbers and presentation-layer rounding. Production systems should use decimal or fixed-point arithmetic.
```

### 7.5 What Not To Do

Do not rewrite the whole engine with a decimal library unless there is enough time to retest everything.

For this phase, the improvement is documenting the tradeoff clearly, not risking working logic before submission.

### 7.6 Acceptance Criteria

```text
[ ] README includes Financial Precision Note
[ ] Note explains JavaScript number tradeoff
[ ] Note explains production alternative
[ ] UI optionally references precision in diagnostics
[ ] Existing calculations remain unchanged unless fully retested
```

---

## 8. Upgrade 5: Calmer UI-by-Default Flow

### 8.1 Overview

The initial home page should remain focused and calm before the user runs a calculation.

The app has many advanced features. Showing all of them immediately can overwhelm the reviewer.

The default experience should guide the user through one clear action first:

```text
Enter an order or choose an example scenario.
```

Advanced controls and dense dashboards should appear only after they become useful.

### 8.2 User Story

As a first-time user or reviewer, I want the initial page to be simple so that I immediately know how to start using the app.

### 8.3 Before Calculation

Show:

```text
Order Ticket
Saved Example Scenarios
Recent Searches, if available
Short preview of what results will include
Decision-support disclaimer
```

Hide or collapse:

```text
Advanced Settings
Provider Outage Simulation
Route Comparison Table
Provider Health
Diagnostics
Amount Sensitivity
Audit Trail
```

### 8.4 After Calculation

Show full dashboard:

```text
Trade Review Summary
Recommended Route
Best Direct Benchmark
Provider Coverage / Result Quality
Dashboard Tabs
Route Comparison Table
Detailed Route Cards
Amount Sensitivity
Provider Health
Diagnostics
Warnings
Advanced Settings
Provider Outage Simulation
```

### 8.5 Suggested UI Flow

Initial state:

```text
Header
Order Ticket
Example Scenarios
Recent Searches
“What this tool will show” preview card
```

Loading state:

```text
Fetching provider rates...
Building route graph...
Simulating routes...
Ranking top 3...
```

Results state:

```text
Trade Review Summary
Tabs:
- Overview
- Routes
- Analysis
- Reliability
```

### 8.6 Preview Card Copy

```text
After calculation, this dashboard will show:
- Recommended route
- Top 3 alternatives
- Provider health
- Direct route benchmark
- Per-leg fee breakdown
- Amount sensitivity
- Reliability diagnostics
```

### 8.7 Acceptance Criteria

```text
[ ] Initial page is not overloaded
[ ] Advanced controls are hidden or collapsed before first calculation
[ ] Results dashboard appears after calculation
[ ] User can still access advanced settings after results exist
[ ] First action is obvious
[ ] Empty state explains what the tool does
```

---

## 9. Upgrade 6: Reset Demo Button

### 9.1 Overview

Add a Reset Demo button to quickly return the app to its default demonstration state.

This is useful for interviews, repeated testing, and reviewer exploration.

### 9.2 User Story

As a presenter or reviewer, I want to reset the app quickly so that I can rerun the default demo scenario from a clean state.

### 9.3 Reset Behavior

The Reset Demo action should reset:

```text
source = GBP
target = JPY
amount = 1000
maxLegs = 3
railFilter = all
complexityFilter = all
disabledProviders = []
activeTab = overview
error = null
warnings = []
results = null, or optionally rerun default scenario
loading = false
```

Recent searches behavior:

```text
Do not clear recent searches by default.
```

Optional:

```text
Add separate Clear Recent Searches action.
```

### 9.4 Button Placement

Recommended placement:

```text
Header right side:
[Reset Demo]
```

### 9.5 Behavior Options

Option A: Reset only

```text
Resets state to defaults and returns to first-load screen.
```

Option B: Reset and rerun

```text
Resets state and automatically calculates GBP → JPY, 1000.
```

Recommended for interview demo:

```text
Use Option A by default, with a separate “Run Default Demo” scenario button.
```

### 9.6 Acceptance Criteria

```text
[ ] Reset Demo button exists
[ ] Resets source, target, amount
[ ] Resets advanced filters
[ ] Re-enables all providers
[ ] Clears current result state
[ ] Clears current error/warnings
[ ] Returns active tab to Overview
[ ] Does not unexpectedly clear recent searches
[ ] Works during and after a calculation
```

---

## 10. API / Response Model Updates

### 10.1 Add Provider Coverage To Response

Extend route API response:

```ts
type RouteApiResponse = {
  source: string;
  target: string;
  amount: number;
  routes: RankedRoute[];
  directBenchmark: RankedRoute | null;
  providerHealth: ProviderHealth[];
  providerCoverage: ProviderCoverage;
  resultQuality: ResultQuality;
  diagnostics: Diagnostics;
  warnings: string[];
  message?: string;
};
```

### 10.2 Add Diagnostics Fields

Current diagnostics should be extended or confirmed to include:

```ts
type Diagnostics = {
  calculatedAt: string;
  cacheStatus: string;
  liveProvidersUsed: number;
  staticProvidersLoaded: number;
  failedOrDisabledProviders: number;
  providerCoveragePercent: number;
  resultQualityLabel: string;
  activeMaxLegs: number;
  activeRailFilter: RailFilter;
  activeComplexityFilter: ComplexityFilter;
};
```

### 10.3 Acceptance Criteria

```text
[ ] API response includes providerCoverage
[ ] API response includes resultQuality
[ ] Diagnostics include coverage percent
[ ] Frontend renders new fields safely
[ ] Missing fields do not crash UI during development
```

---

## 11. Suggested File Additions / Changes

### 11.1 New Files

```text
src/components/TradeReviewSummary.tsx
src/lib/routing/calculateProviderCoverage.ts
src/lib/routing/calculateResultQuality.ts
```

### 11.2 Existing Files To Update

```text
src/lib/routing/types.ts
src/lib/routing/calculateRoutes.ts
src/views/FxRouteDashboardView.tsx
src/controllers/useFxDashboardController.ts
src/components/DiagnosticsPanel.tsx
src/components/ProviderHealth.tsx
README.md
```

Optional:

```text
src/components/DashboardHeader.tsx
```

---

## 12. Implementation Plan

### Phase 1: Provider Coverage

```text
[ ] Define ProviderCoverage type
[ ] Implement calculateProviderCoverage
[ ] Add providerCoverage to API response
[ ] Render coverage in DiagnosticsPanel
[ ] Render coverage in ProviderHealth header
```

### Phase 2: Result Quality

```text
[ ] Define ResultQuality type
[ ] Implement calculateResultQuality
[ ] Add resultQuality to API response
[ ] Render result quality in DiagnosticsPanel
[ ] Render result quality near Provider Coverage
```

### Phase 3: Trade Review Summary

```text
[ ] Create TradeReviewSummary component
[ ] Pass recommendation, direct benchmark, provider coverage, result quality, and warnings
[ ] Render component at top of Overview tab
[ ] Add no-route state
[ ] Add decision-support disclaimer
```

### Phase 4: Calmer Initial UI

```text
[ ] Audit current first-load UI
[ ] Hide or collapse advanced settings before first calculation
[ ] Hide provider outage controls before first calculation, or place under collapsed section
[ ] Add preview card explaining what results will show
[ ] Keep examples and recent searches visible
```

### Phase 5: Reset Demo

```text
[ ] Add resetDemo function to dashboard controller
[ ] Reset core state to default values
[ ] Reset filters and disabled providers
[ ] Clear active result/error/warnings
[ ] Add Reset Demo button to header or order area
[ ] Verify it does not clear recent searches
```

### Phase 6: README Precision Note

```text
[ ] Add Financial Precision Note section
[ ] Explain JavaScript numbers vs production decimal arithmetic
[ ] Add Known Tradeoffs section if not already present
[ ] Confirm README aligns with actual implementation
```

---

## 13. UI Placement Recommendation

### Before Calculation

```text
Header
  App title
  Demo badge
  Reset Demo button

Main
  Order Ticket
  Example Scenarios
  Recent Searches
  Preview Card: “What this dashboard will show”
  Decision-support disclaimer
```

### After Calculation

```text
Header
  App title
  Demo badge
  Reset Demo button
  Rate timestamp

Overview Tab
  Trade Review Summary
  Recommended Route
  Direct Benchmark
  Diagnostics

Routes Tab
  Route Comparison Table
  Detailed Route Cards

Analysis Tab
  Amount Sensitivity

Reliability Tab
  Provider Health
  Provider Coverage
  Result Quality
  Provider Outage Simulation
  Warnings
```

---

## 14. Testing Plan

### 14.1 Unit Tests

Add tests for:

```text
[ ] calculateProviderCoverage with all providers usable
[ ] calculateProviderCoverage with partial failures
[ ] calculateProviderCoverage with simulated outages
[ ] calculateResultQuality high coverage
[ ] calculateResultQuality partial coverage
[ ] calculateResultQuality limited coverage
[ ] calculateResultQuality no coverage
```

### 14.2 Manual UI Tests

Test:

```text
[ ] Initial page is calm and not overloaded
[ ] Running default scenario shows Trade Review Summary
[ ] Disabling a provider reduces Provider Coverage
[ ] Result Quality updates after provider outage
[ ] No direct route still renders summary safely
[ ] No-route state renders useful explanation
[ ] Reset Demo returns app to default state
[ ] Recent searches are not cleared by Reset Demo
```

### 14.3 Regression Tests

Confirm existing behavior still works:

```text
[ ] Top 3 routes still rank correctly
[ ] Direct benchmark still works
[ ] Amount sensitivity still works
[ ] Provider health still works
[ ] Outage simulation still works
[ ] Copy summary still works
[ ] npm run typecheck passes
[ ] npm test passes
[ ] npm run build passes
```

---

## 15. README Updates

Add or update the following sections:

```text
Financial Precision Note
Known Tradeoffs / Production Considerations
Relevance to Trading Technology
Verification
```

Minimum new section required by this PRD:

```md
## Financial Precision Note

This case study uses JavaScript numbers for route simulation and formats displayed monetary values to cents in the presentation layer. This is acceptable for a demo assignment, but a production financial system should avoid floating-point arithmetic for monetary calculations. In production, I would use decimal arithmetic, fixed-point integer minor units, or a dedicated decimal library to avoid precision drift across multi-leg calculations.
```

Also add:

```md
## Production Considerations

- Replace JavaScript number arithmetic with decimal or fixed-point money calculations.
- Replace in-memory cache with shared cache such as Redis.
- Add authentication and authorization for internal use.
- Persist route review records if routes need to be audited later.
- Replace configured static rates with live venue or internal pricing feeds in production.
```

---

## 16. Final Acceptance Criteria

This upgrade package is complete when:

```text
[ ] Trade Review Summary exists
[ ] Provider Coverage Score exists
[ ] Result Quality label exists
[ ] README includes Financial Precision Note
[ ] Initial UI is calm and focused
[ ] Advanced controls are hidden/collapsed before first calculation
[ ] Reset Demo button works
[ ] Provider Coverage updates when providers fail or are disabled
[ ] Result Quality updates when coverage changes
[ ] No-route and no-direct states are handled
[ ] Typecheck passes
[ ] Tests pass
[ ] Production build passes
```

---

## 17. Interview Talking Points

Use these talking points during the presentation:

```text
I added Trade Review Summary to make the output decision-ready for an operations user.
```

```text
Provider Coverage and Result Quality are based only on observable system facts, not unsupported market claims.
```

```text
The default UI is intentionally calm so a first-time reviewer starts with one clear action before seeing advanced diagnostics.
```

```text
I documented JavaScript number precision as a known case-study tradeoff and explained how I would handle it in production.
```

```text
Reset Demo makes the app easier to present and test repeatedly during review.
```

---

## 18. Definition of Done

The improvements are done when the app feels easier to present, easier to trust, and more production-aware.

A reviewer should be able to understand within 30 seconds:

```text
- What order was entered
- What route is recommended
- How complete provider coverage was
- Whether results are full, partial, or limited coverage
- What the major production precision tradeoff is
- How to reset and rerun the demo
```
