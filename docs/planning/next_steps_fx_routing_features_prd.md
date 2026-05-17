# Product Requirements Document (PRD)

# Next-Step Feature Package for FX Routing Tool

## 1. Purpose

This PRD defines the next set of feature improvements for the Multi-Leg FX Routing Tool case study.

These features are designed to make the application feel less like a simple calculator and more like a practical internal trading operations dashboard.

This PRD focuses on six next-step features:

1. Why This Route Won explanation
2. Effective Rate display
3. Copy Route Summary button
4. Route Risk / Complexity label
5. Saved Example Scenarios
6. Provider Outage Toggle / Simulation

---

## 2. Product Goal

The enhanced app should help a trading or operations user answer four key questions quickly:

```text
1. Which route delivers the most money?
2. Why did this route win?
3. How does this route compare on an all-in effective rate basis?
4. What happens if one provider is unavailable?
```

These features should improve:

- Practical usefulness
- Reviewer demo experience
- Trading logic clarity
- Reliability testing
- Overall case study polish

---

## 3. Target Users

### Primary User

An internal trading or operations team member reviewing possible FX execution routes before a transaction is executed.

### Secondary User

A technical reviewer evaluating the case study submission for product thinking, reliability, UI clarity, and code quality.

---

## 4. Feature Summary

| Feature | Purpose | Priority |
|---|---|---:|
| Why This Route Won | Explain route ranking in plain English | High |
| Effective Rate | Show all-in rate after fees and conversions | High |
| Copy Route Summary | Let users copy route details for sharing | Medium |
| Route Complexity Label | Show operational complexity of each route | High |
| Saved Example Scenarios | Make app easy to test/demo | Medium |
| Provider Outage Toggle | Simulate provider failure and recalculate routes | High |

---

## 5. Feature 1: Why This Route Won

### Overview

Each route card should include a short plain-English explanation describing why the route ranked where it did.

This explanation should help the user understand the route recommendation without manually interpreting every rate and fee.

### User Story

As an operations user, I want a short explanation of why a route ranked highly so that I can understand the tradeoff without manually calculating every leg.

### Functional Requirements

Each route card must show a section called:

```text
Why this route ranked here
```

or:

```text
Why this route won
```

For the first-ranked route, the label can be:

```text
Why this route ranked #1
```

The explanation should be generated from route data, not hardcoded.

The explanation should consider:

- Final delivered amount
- Effective rate
- Difference versus direct route
- Number of legs
- Stablecoin usage
- Total route complexity
- Whether extra legs improved the outcome
- Whether the route is direct and simple

### Example Explanations

#### Multi-leg route better than direct

```text
This route ranks highly because its improved exchange rate outweighs the additional leg fees. At this transfer size, the flat fees have a smaller impact, allowing the multi-leg route to deliver more than the best direct option.
```

#### Direct route wins

```text
This route ranks highly because it avoids extra flat fees and conversion steps. For this amount, the simpler direct path delivers more than available multi-leg alternatives.
```

#### Stablecoin route wins

```text
This route ranks highly because the stablecoin leg provides a stronger conversion path into the target currency. The added leg fees are offset by the better final delivered amount.
```

### Acceptance Criteria

```text
[ ] Each route card includes a route explanation
[ ] Explanation changes based on route characteristics
[ ] Explanation references meaningful tradeoffs
[ ] Explanation does not claim unsupported facts
[ ] Explanation is short and easy to understand
```

---

## 6. Feature 2: Effective Rate Display

### Overview

Each route should show its all-in effective exchange rate after all fees and conversions.

This makes routes easier to compare because finance and trading users often think in terms of rates.

### Formula

```text
effectiveRate = finalDeliveredAmount / startingAmount
```

Example:

```text
Input: 1,000 GBP
Final delivered: 192,430 JPY
Effective rate: 192.43 JPY / GBP
```

### User Story

As a trading user, I want to see the effective rate for each route so that I can compare routes on an all-in rate basis instead of only looking at final delivered amount.

### Functional Requirements

Each route card must display:

- Final delivered amount
- Effective rate
- Source currency
- Target currency

Example:

```text
Effective Rate
192.43 JPY / GBP
```

The effective rate must include the impact of:

- All provider fees
- All conversion rates
- All intermediate legs

### Acceptance Criteria

```text
[ ] Each route displays an effective rate
[ ] Effective rate equals final amount divided by starting amount
[ ] Effective rate uses source and target currency labels
[ ] Effective rate updates when amount/source/target changes
[ ] Effective rate works for direct and multi-leg routes
```

---

## 7. Feature 3: Copy Route Summary Button

### Overview

Each route card should include a button that copies a formatted summary of the route to the user's clipboard.

This makes the tool feel like an internal operations tool where route decisions may need to be shared in Slack, email, tickets, or review notes.

### User Story

As an operations user, I want to copy a route summary so that I can quickly share the recommended route with another team member.

### Functional Requirements

Each route card must include a button:

```text
Copy Summary
```

When clicked, it copies a route summary including:

- Route rank
- Full provider path
- Final delivered amount
- Effective rate
- Difference versus direct route, if available
- Complexity level
- Optional warning if provider data was partial

### Example Copied Text

```text
Route #1

Path:
GBP →[BetaBank]→ USD →[GammaCrypto]→ USDT →[EpsilonChain]→ JPY

Final delivered:
192,430.22 JPY

Effective rate:
192.43 JPY / GBP

Difference vs direct:
+1,420.10 JPY

Complexity:
High

Notes:
This route ranked #1 because the improved multi-leg conversion outweighed the added fees.
```

### UX Requirements

After the user clicks the button, show a short confirmation:

```text
Copied
```

or:

```text
Route summary copied
```

The confirmation should disappear after a short delay.

### Acceptance Criteria

```text
[ ] Each route has a Copy Summary button
[ ] Button copies formatted route details to clipboard
[ ] Copied text includes route path, final amount, effective rate, and complexity
[ ] UI confirms successful copy
[ ] App handles clipboard failure gracefully
```

---

## 8. Feature 4: Route Risk / Complexity Label

### Overview

Each route should show a simple complexity label:

```text
Low Complexity
Medium Complexity
High Complexity
```

This communicates operational tradeoffs. The mathematically best route may not always be the simplest or safest operational route.

### User Story

As a trading or operations user, I want to see route complexity so that I can understand whether a route is operationally simple or involves more moving parts.

### Complexity Factors

Complexity should be based on:

- Number of legs
- Number of unique providers
- Stablecoin usage
- Number of intermediate currencies
- Whether the route uses multiple rails

### Suggested Complexity Rules

#### Low Complexity

A route is low complexity if:

```text
- It has 1 leg
- It uses 1 provider
- It does not use a stablecoin rail
```

Example:

```text
GBP →[AlphaFX]→ JPY
```

#### Medium Complexity

A route is medium complexity if:

```text
- It has 2 legs
- Or it uses 2 providers
- Or it includes one stablecoin leg
```

Example:

```text
GBP →[BetaBank]→ USD →[GammaCrypto]→ JPY
```

#### High Complexity

A route is high complexity if:

```text
- It has 3 legs
- Or it uses 3 different providers
- Or it uses stablecoin rails and multiple providers
```

Example:

```text
GBP →[BetaBank]→ USD →[GammaCrypto]→ USDT →[EpsilonChain]→ JPY
```

### Complexity Output Type

```ts
type RouteComplexity = {
  level: "Low" | "Medium" | "High";
  reasons: string[];
};
```

Example:

```json
{
  "level": "High",
  "reasons": [
    "3 legs",
    "3 providers",
    "includes stablecoin rail"
  ]
}
```

### UI Requirements

Each route card should display:

```text
Complexity: High
Reason: 3 legs, 3 providers, includes stablecoin rail.
```

The complexity section should be visible without expanding the detailed leg table.

### Acceptance Criteria

```text
[ ] Each route displays Low, Medium, or High complexity
[ ] Complexity is calculated from route data
[ ] Complexity includes at least one reason
[ ] Complexity updates when provider outage toggles change routes
[ ] Complexity does not affect ranking unless explicitly implemented later
```

---

## 9. Feature 5: Saved Example Scenarios

### Overview

Add pre-built example scenarios that let the reviewer quickly test the app without manually thinking of input combinations.

This improves demo quality and reduces friction.

### User Story

As a reviewer, I want to click example scenarios so that I can quickly test realistic route combinations.

### Recommended Example Scenarios

Include 5 example buttons/cards:

```text
GBP → JPY, 1,000
USD → CAD, 10,000
CAD → AUD, 500
EUR → USDC, 5,000
JPY → USD, 100,000
```

Optional additional examples:

```text
GBP → CAD, 2,500
EUR → JPY, 25,000
AUD → USD, 1,000
```

### Functional Requirements

Clicking an example scenario should:

1. Fill source currency
2. Fill target currency
3. Fill amount
4. Trigger route calculation automatically, or fill the form and let the user submit

Preferred behavior:

```text
Clicking an example fills the form and automatically runs the calculation.
```

### UI Requirements

Place example scenarios near the input form.

Suggested section title:

```text
Try an example
```

Example card:

```text
GBP → JPY
Amount: 1,000
```

### Acceptance Criteria

```text
[ ] At least 5 example scenarios are shown
[ ] Clicking a scenario fills the form
[ ] Scenario can automatically trigger calculation
[ ] Examples cover fiat and stablecoin-related routes
[ ] Examples are easy to find near the input area
```

---

## 10. Feature 6: Provider Outage Toggle / Simulation

### Overview

Add toggles or checkboxes that allow the user to manually disable providers and recalculate routes.

This demonstrates that the app can still produce useful results when one or more providers are unavailable.

This is one of the strongest reliability/demo features for the case study.

### User Story

As a reviewer, I want to simulate provider outages so that I can verify the app still returns useful routes when providers are unavailable.

### Functional Requirements

The UI should include a section:

```text
Simulate Provider Outage
```

Each provider should have a checkbox or toggle:

```text
[ ] AlphaFX
[ ] BetaBank
[ ] DeltaMarkets
[ ] GammaCrypto
[ ] EpsilonChain
[ ] ZetaSwap
```

When a provider is disabled:

1. Its edges must be excluded from route generation.
2. Routes must be recalculated.
3. Provider health/status should show it as manually disabled or simulated outage.
4. A warning should appear.

Example warning:

```text
BetaBank manually disabled for outage simulation.
```

### Request Model Update

Update the route request payload to support disabled providers:

```ts
type RouteRequest = {
  source: string;
  target: string;
  amount: number;
  disabledProviders?: string[];
};
```

Example request:

```json
{
  "source": "GBP",
  "target": "JPY",
  "amount": 1000,
  "disabledProviders": ["BetaBank", "AlphaFX"]
}
```

### Edge Filtering Logic

Before route generation, remove all edges from disabled providers:

```ts
const activeEdges = allEdges.filter(
  edge => !disabledProviders.includes(edge.provider)
);
```

Disabled static providers should also be excluded.

Disabled live providers should not need to be fetched, if possible.

### Provider Health Update

Provider health should support:

```ts
type ProviderStatus =
  | "online"
  | "static_loaded"
  | "timeout"
  | "failed"
  | "malformed_response"
  | "skipped"
  | "simulated_outage";
```

Example:

```json
{
  "provider": "BetaBank",
  "status": "simulated_outage",
  "message": "Provider manually disabled for outage simulation."
}
```

### UI Requirements

The outage toggle section should be placed before route results, ideally near Provider Health.

Suggested layout:

```text
Order Input
Saved Example Scenarios
Simulate Provider Outage
Provider Health
Route Results
```

Toggling a provider should either:

- Automatically rerun calculation, or
- Require the user to press "Find Routes" again

Preferred behavior:

```text
Automatically rerun calculation when a provider is toggled after initial results exist.
```

### Acceptance Criteria

```text
[ ] All 6 providers can be manually disabled
[ ] Disabled providers are excluded from route generation
[ ] Disabled providers appear as simulated outage in provider health
[ ] Warning is shown for each disabled provider
[ ] Routes recalculate after toggling providers
[ ] App handles case where all providers are disabled
[ ] App handles case where disabling one provider removes the previous best route
```

---

## 11. Data Model Updates

### Updated Route Result

```ts
type RouteResult = {
  rank: number;
  path: string[];
  legs: RouteLegResult[];
  finalAmount: number;
  effectiveRate: number;
  differenceVsDirect: number | null;
  differenceVsDirectPercent: number | null;
  complexity: RouteComplexity;
  explanation: string;
};
```

### Route Complexity

```ts
type RouteComplexity = {
  level: "Low" | "Medium" | "High";
  reasons: string[];
};
```

### Updated Provider Health

```ts
type ProviderStatus =
  | "online"
  | "static_loaded"
  | "timeout"
  | "failed"
  | "malformed_response"
  | "skipped"
  | "simulated_outage";

type ProviderHealth = {
  provider: string;
  status: ProviderStatus;
  message?: string;
};
```

### Updated Route Request

```ts
type RouteRequest = {
  source: string;
  target: string;
  amount: number;
  disabledProviders?: string[];
};
```

---

## 12. Suggested File Structure Updates

```text
src/
  components/
    ExampleScenarios.tsx
    ProviderOutageToggle.tsx
    CopyRouteSummaryButton.tsx
    RouteComplexityBadge.tsx
    RouteExplanation.tsx

  lib/
    routing/
      calculateEffectiveRate.ts
      explainRoute.ts
      calculateComplexity.ts
      formatRouteSummary.ts
```

---

## 13. Implementation Plan

### Phase 1: Effective Rate

```text
[ ] Add effective rate calculation
[ ] Add effectiveRate field to RouteResult
[ ] Display effective rate on RouteCard
[ ] Verify with manual examples
```

### Phase 2: Route Complexity

```text
[ ] Create calculateComplexity(route)
[ ] Add complexity field to RouteResult
[ ] Display complexity badge on RouteCard
[ ] Show reasons below badge
```

### Phase 3: Route Explanation

```text
[ ] Create explainRoute(route, bestDirectRoute)
[ ] Add explanation field to RouteResult
[ ] Display explanation on each RouteCard
[ ] Keep explanation short and understandable
```

### Phase 4: Saved Example Scenarios

```text
[ ] Create ExampleScenarios component
[ ] Define at least 5 scenarios
[ ] On click, fill source, target, and amount
[ ] Trigger calculation automatically if possible
```

### Phase 5: Copy Route Summary

```text
[ ] Create formatRouteSummary(route)
[ ] Create CopyRouteSummaryButton
[ ] Use Clipboard API
[ ] Show copied confirmation
[ ] Handle clipboard errors
```

### Phase 6: Provider Outage Toggle

```text
[ ] Create ProviderOutageToggle component
[ ] Track disabledProviders state
[ ] Include disabledProviders in API request
[ ] Filter disabled providers before route generation
[ ] Update Provider Health with simulated_outage status
[ ] Show warnings for disabled providers
[ ] Recalculate when toggles change
```

---

## 14. UI Placement

Recommended final layout:

```text
Header
Short App Description

Order Input
Saved Example Scenarios
Provider Outage Simulation

Provider Health
Best Direct Benchmark

Top 3 Routes
  Route Card
    Rank
    Path
    Final Delivered
    Effective Rate
    Difference vs Direct
    Complexity Label
    Why This Route Won
    Copy Summary Button
    Per-Leg Breakdown

Amount Sensitivity
Warnings
```

---

## 15. Testing Plan

### Manual Tests

#### Test 1: Effective Rate

Input:

```text
Source: GBP
Target: JPY
Amount: 1000
```

Expected:

```text
Each route displays effective rate as final JPY amount divided by 1000.
```

#### Test 2: Complexity Label

Input:

```text
A direct 1-leg route
```

Expected:

```text
Route shows Low Complexity.
```

Input:

```text
A 3-leg route with stablecoin
```

Expected:

```text
Route shows High Complexity.
```

#### Test 3: Copy Summary

Action:

```text
Click Copy Summary on Route #1.
```

Expected:

```text
Route summary is copied to clipboard and confirmation appears.
```

#### Test 4: Saved Scenario

Action:

```text
Click GBP → JPY, 1,000 scenario.
```

Expected:

```text
Form fills and route calculation runs.
```

#### Test 5: Provider Outage Toggle

Action:

```text
Disable BetaBank.
```

Expected:

```text
BetaBank is excluded from route generation, provider health shows simulated outage, warning appears, and routes recalculate.
```

#### Test 6: All Providers Disabled

Action:

```text
Disable all providers.
```

Expected:

```text
No routes are returned and user sees a clear error message.
```

### Unit Tests

Recommended tests:

```text
[ ] calculateEffectiveRate returns finalAmount / startingAmount
[ ] calculateComplexity returns Low for simple direct route
[ ] calculateComplexity returns High for 3-leg stablecoin route
[ ] explainRoute returns stablecoin explanation when route uses stablecoin rail
[ ] formatRouteSummary includes route path and final amount
[ ] disabled providers are excluded from active edges
```

---

## 16. README Updates

Add a section called:

```md
## Extra Features
```

Recommended text:

```md
Beyond the core assignment requirements, I added several features to make the tool closer to a real internal trading operations dashboard:

- Effective rate display so routes can be compared on an all-in rate basis.
- Plain-English route explanations to help users understand why a route ranked highly.
- Route complexity labels to show operational tradeoffs between direct and multi-leg routes.
- Saved example scenarios to make the app easy to test quickly.
- Copyable route summaries for sharing route decisions internally.
- Provider outage simulation to verify that the routing engine still returns useful results when one or more providers are unavailable.
```

Also add a note under reliability:

```md
The provider outage simulation feature allows reviewers to manually disable one or more providers and confirm that the routing engine continues to return the best available routes using the remaining providers.
```

---

## 17. Acceptance Criteria

This next feature package is complete when:

```text
[ ] Route cards show effective rate
[ ] Route cards show complexity label and reasons
[ ] Route cards show plain-English explanation
[ ] Route cards have Copy Summary button
[ ] At least 5 saved example scenarios are available
[ ] Provider outage toggles exist for all 6 providers
[ ] Disabled providers are excluded from route generation
[ ] Provider health shows simulated outages
[ ] Warnings appear for disabled providers
[ ] Routes recalculate after outage toggles change
[ ] README documents the extra features
```

---

## 18. Priority Order

If time is limited, implement in this order:

```text
1. Effective Rate display
2. Route Complexity label
3. Why This Route Won explanation
4. Saved Example Scenarios
5. Copy Route Summary button
6. Provider Outage Toggle / Simulation
```

Reasoning:

- Effective Rate, Complexity, and Explanation improve route interpretability.
- Saved Scenarios improve reviewer demo speed.
- Copy Summary improves internal-tool feel.
- Provider Outage Toggle is the strongest reliability feature but touches more of the routing pipeline.

---

## 19. Risks and Mitigations

### Risk 1: Route explanations become misleading

Mitigation:

```text
Keep explanations general and based only on available route data.
```

### Risk 2: Complexity label implies risk too strongly

Mitigation:

```text
Use the word "complexity" instead of "risk" unless risk is clearly defined.
```

### Risk 3: Clipboard API fails in browser

Mitigation:

```text
Show a fallback error message if copying fails.
```

### Risk 4: Provider toggles create no valid routes

Mitigation:

```text
Show a clear no-route state and explain that too many providers may be disabled.
```

### Risk 5: Extra features distract from core routing

Mitigation:

```text
Keep the top 3 route results and per-leg breakdown as the central UI focus.
```

---

## 20. Final Definition of Done

This feature package is done when the app helps a reviewer understand:

```text
- Which route won
- Why it won
- What all-in rate it provides
- How complex it is operationally
- How to quickly test the app
- Whether the app survives provider outages
```

The final result should feel like a polished internal trading operations tool, not just a technical demo.
